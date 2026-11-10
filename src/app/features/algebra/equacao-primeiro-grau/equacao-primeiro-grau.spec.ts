import { Fracao } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorEquacao1 } from '@features/algebra/equacao-primeiro-grau/equacao-primeiro-grau.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(2718);
  return Array.from({ length: quantidade }, () => geradorEquacao1.gerar(nivel, rng));
}

describe('geradorEquacao1', () => {
  it('avisa «Responda como fração» exatamente quando a resposta não é inteira', () => {
    // Com 29/6 de resposta, «informe o valor de x» não dizia se era para
    // arredondar — e 29/6 não tem decimal exato, então arredondar era errar.
    let fracionarias = 0;
    let inteiras = 0;

    for (const nivel of NIVEIS) {
      for (const exercicio of amostra(nivel)) {
        const avisa = exercicio.enunciado.endsWith(' Responda como fração.');
        expect(avisa).toBe(!exercicio.gabarito.ehInteira);

        if (exercicio.gabarito.ehInteira) {
          inteiras++;
        } else {
          fracionarias++;
        }
      }
    }

    // Uma amostra que só tivesse um dos casos não provaria nada.
    expect(fracionarias).toBeGreaterThan(0);
    expect(inteiras).toBeGreaterThan(0);
  });

  it('diz no campo que decimal só vale quando é exato', () => {
    // «um número ou fração» convidava a responder 0,83 para 5/6 — e aí a
    // resposta certa era recusada sem que nada tivesse avisado.
    expect(geradorEquacao1.formatoResposta).toContain('inteiro ou fração');
    expect(geradorEquacao1.formatoResposta).toContain('decimal só se for exato');
  });

  it('pede o valor exato no enunciado', () => {
    for (const exercicio of amostra('facil').filter((e) => !e.id.includes('problema'))) {
      expect(exercicio.enunciado).toContain('Resolva a equação e informe o valor exato de x.');
    }
  });

  it('aceita o decimal quando ele é exato, e recusa o arredondado', () => {
    const exercicio = {
      ...amostra('facil', 1)[0]!,
      gabarito: Fracao.criar(3, 4),
      armadilhas: [],
    };

    for (const certa of ['3/4', '0,75', '0.75', '6/8']) {
      expect(corrigir(geradorEquacao1, exercicio, certa).veredito).toBe('correto');
    }

    // 5/6 não tem decimal exato: nenhum arredondamento passa, e é por isso
    // que o campo precisa dizer que a fração é o caminho.
    const dizima = { ...exercicio, gabarito: Fracao.criar(5, 6) };
    expect(corrigir(geradorEquacao1, dizima, '5/6').veredito).toBe('correto');
    for (const errada of ['0,83', '0,8333', '0,833333333']) {
      expect(corrigir(geradorEquacao1, dizima, errada).veredito).toBe('incorreto');
    }
  });

  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, a raiz satisfaz a equação gerada`, () => {
      const lineares = amostra(nivel).filter((e) =>
        /^equacao1-(facil|medio|dificil|extremo)-/.test(e.id),
      );
      expect(lineares.length).toBeGreaterThan(0);
      for (const exercicio of lineares) {
        const [, aTexto, sinal, bTexto, cTexto] = /^(-?\d*)x ([+-]) (\d+) = (-?\d+)$/.exec(
          exercicio.enunciadoTex,
        )!;

        const a = aTexto === '' ? 1 : aTexto === '-' ? -1 : Number(aTexto);
        const b = sinal === '+' ? Number(bTexto) : -Number(bTexto);
        const c = Number(cTexto);

        // a·x + b deve dar exatamente c.
        const verificacao = exercicio.gabarito
          .multiplicar(Fracao.deInteiro(a))
          .somar(Fracao.deInteiro(b));

        expect(verificacao.igualA(Fracao.deInteiro(c))).toBe(true);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(armadilha.resposta.igualA(exercicio.gabarito)).toBe(false);
        }
      }
    });
  }

  it('no nível fácil a raiz é sempre inteira e positiva', () => {
    for (const exercicio of amostra('facil')) {
      expect(exercicio.gabarito.ehInteira).toBe(true);
      expect(exercicio.gabarito.ehNegativa).toBe(false);
    }
  });

  it('no nível difícil aparecem raízes fracionárias', () => {
    const fracionarias = amostra('dificil').filter((e) => !e.gabarito.ehInteira);
    expect(fracionarias.length).toBeGreaterThan(0);
  });

  it('aceita a resposta escrita como fração equivalente', () => {
    const exercicio = amostra('facil', 1)[0]!;
    const equivalente = Fracao.criar(
      exercicio.gabarito.numerador * 2,
      exercicio.gabarito.denominador * 2,
    );

    expect(corrigir(geradorEquacao1, exercicio, equivalente.toString()).veredito).toBe('correto');
  });

  it('diagnostica o erro de somar em vez de subtrair', () => {
    // Só a equação linear tem essa armadilha; os problemas têm as deles.
    const exercicio = amostra('medio', 60).find(
      (candidato) =>
        candidato.id.startsWith('equacao1-medio-') &&
        candidato.armadilhas.some((a) => a.diagnostico.includes('somou')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('somou'))!;
    const resultado = corrigir(geradorEquacao1, exercicio, armadilha.resposta.toString());

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('equacao1.igualdade');
  });
});

describe('geradorEquacao1 — frações e problemas', () => {
  /** Avalia um lado da equação em LaTeX: só \frac, x, inteiros, + e −. */
  function avaliar(tex: string, x: number): number {
    const js = tex
      .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
      .replace(/(\d)x/g, '$1*x');
    return new Function('x', `return ${js};`)(x) as number;
  }

  it('a raiz da equação com frações satisfaz a equação, em todos os níveis em que aparece', () => {
    for (const nivel of ['medio', 'dificil', 'extremo'] as const) {
      const casos = amostra(nivel, 200).filter((e) => e.id.startsWith('equacao1-fracoes'));
      expect(casos.length, nivel).toBeGreaterThan(0);
      for (const exercicio of casos) {
        const [esquerda, direita] = exercicio.enunciadoTex.split('=');
        const x = exercicio.gabarito.numerador / exercicio.gabarito.denominador;
        expect(avaliar(esquerda!, x), exercicio.enunciadoTex).toBeCloseTo(avaliar(direita!, x), 9);
      }
    }
  });

  it('só o Extremo tem três denominadores', () => {
    const tres = (e: { enunciadoTex: string }) =>
      (e.enunciadoTex.match(/\\frac/g) ?? []).length === 3;
    expect(amostra('extremo', 200).some(tres)).toBe(true);
    expect(amostra('dificil', 200).some(tres)).toBe(false);
  });

  it('a resposta do problema confere com os dados do enunciado', () => {
    let conferidos = 0;
    for (const nivel of ['facil', 'medio', 'dificil'] as const) {
      const problemas = amostra(nivel, 200).filter((e) => e.id.startsWith('equacao1-problema'));
      for (const exercicio of problemas) {
        expect(exercicio.gabarito.ehInteira).toBe(true);
        const y = exercicio.gabarito.numerador;
        const t = exercicio.enunciado;
        const taxi = /\$ (\d+),00 de bandeirada mais \$ (\d+),00.* custou \$ (\d+),00/.exec(t);
        const idades = /tem o (dobro|triplo|quádruplo) .*Daqui a (\d+) anos.* será (\d+) anos/.exec(
          t,
        );
        const perimetro = /comprimento (\d+) cm maior .* mede (\d+) cm/.exec(t);
        const livros = /guardam (\d+) livros/.exec(t);
        if (taxi) {
          expect(Number(taxi[1]) + Number(taxi[2]) * y).toBe(Number(taxi[3]));
        } else if (idades) {
          const m = { dobro: 2, triplo: 3, quádruplo: 4 }[idades[1] as 'dobro'];
          const k = Number(idades[2]);
          expect(y + k + m * y + k).toBe(Number(idades[3]));
        } else if (perimetro) {
          expect(2 * y + 2 * (y + Number(perimetro[1]))).toBe(Number(perimetro[2]));
        } else if (livros) {
          expect(y - 2 + (y - 1) + y).toBe(Number(livros[1]));
        } else {
          throw new Error(`cenário não reconhecido: ${t}`);
        }
        conferidos++;
      }
    }
    expect(conferidos).toBeGreaterThan(20);
  });

  it('o enunciado do problema traz a unidade da resposta', () => {
    const problemas = amostra('dificil', 200).filter((e) => e.id.startsWith('equacao1-problema'));
    for (const exercicio of problemas) {
      expect(exercicio.enunciado).toMatch(/quilômetros|anos|cm|livros/);
    }
  });
});
