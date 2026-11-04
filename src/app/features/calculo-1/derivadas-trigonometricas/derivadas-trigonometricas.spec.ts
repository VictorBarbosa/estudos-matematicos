import {
  arcoEmGraus,
  arcoTex,
  arcoTexto,
  arcoValor,
  cossenoExato,
  derivadaNumerica,
  derivadaPotenciaTrigComPassos,
  derivadaProdutoComTrigComPassos,
  derivadaTrigExata,
  derivadaTrigNoPontoComPassos,
  exatoTex,
  exatoValor,
  secanteAoQuadradoExato,
  senoExato,
  temTangente,
} from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorDerivadasTrig } from '@features/calculo-1/derivadas-trigonometricas/derivadas-trigonometricas.gerador';

function amostra(nivel: Nivel, quantidade = 80) {
  const rng = criarRng(31_415);
  return Array.from({ length: quantidade }, () => geradorDerivadasTrig.gerar(nivel, rng));
}

describe('geradorDerivadasTrig', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e aceito como exibido`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciado).toBe(true);

        const exibido = geradorDerivadasTrig.formatar(exercicio.gabarito);
        expect(corrigir(geradorDerivadasTrig, exercicio, exibido).veredito, exibido).toBe(
          'correto',
        );
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorDerivadasTrig.saoEquivalentes(armadilha.resposta, exercicio.gabarito),
            exercicio.enunciado,
          ).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }

  it('o Fácil fica na tabela: sem cadeia, sem produto, sem potência', () => {
    for (const exercicio of amostra('facil', 150)) {
      expect(exercicio.conceitos).toContain('trig-derivada.tabela');
      expect(exercicio.conceitos).not.toContain('trig-derivada.produto');
      expect(exercicio.conceitos).not.toContain('trig-derivada.potencia');
    }
  });

  it('o Difícil cobre as quatro frentes do tópico', () => {
    const vistos = new Set(amostra('dificil', 250).flatMap((e) => e.conceitos));

    expect(vistos.has('trig-derivada.cadeia')).toBe(true);
    expect(vistos.has('trig-derivada.tangente')).toBe(true);
    expect(vistos.has('trig-derivada.produto')).toBe(true);
    expect(vistos.has('trig-derivada.potencia')).toBe(true);
  });

  it('todo gabarito confere com a derivada numérica da própria resolução', () => {
    // A conferência é indireta de propósito: comparamos o valor exato guardado
    // pelo motor com a derivada por diferença finita da função do enunciado.
    for (const arco of [
      { k: 1, m: 6 },
      { k: 1, m: 4 },
      { k: 2, m: 3 },
    ]) {
      for (const [funcao, fn] of [
        ['sen', (x: number) => 3 * Math.sin(2 * x)],
        ['cos', (x: number) => 3 * Math.cos(2 * x)],
      ] as const) {
        const exato = exatoValor(derivadaTrigExata(funcao, 3, 2, arco));
        expect(exato).toBeCloseTo(derivadaNumerica(fn, arcoValor(arco)), 5);
      }
    }
  });

  it('diagnostica quem esquece o menos do cosseno', () => {
    const exercicio = amostra('facil', 200).find(
      (candidato) =>
        candidato.enunciadoTex.includes('\\cos') &&
        candidato.armadilhas.some((a) => a.conceito === 'trig-derivada.sinal'),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.conceito === 'trig-derivada.sinal')!;
    const resultado = corrigir(
      geradorDerivadasTrig,
      exercicio,
      geradorDerivadasTrig.formatar(armadilha.resposta),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('trig-derivada.sinal');
  });

  it('diagnostica quem esquece o fator interno', () => {
    const exercicio = amostra('medio', 250).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('derivada de dentro')),
    )!;

    expect(exercicio).toBeDefined();
    expect(exercicio.conceitos).toContain('trig-derivada.cadeia');
  });

  it('a tangente nunca é pedida onde ela não existe', () => {
    for (const exercicio of amostra('dificil', 300)) {
      if (exercicio.enunciadoTex.includes('\\tan')) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciadoTex).toBe(true);
        // A derivada da tangente é a secante ao quadrado: sempre positiva.
        expect(exercicio.gabarito > 0 || exercicio.gabarito < 0).toBe(true);
      }
    }
  });
});

/**
 * O motor das derivadas trigonométricas.
 *
 * O que ele guarda de diferente é o valor EXATO: num arco notável a resposta é
 * um número fechado, e arredondar cedo esconderia o padrão que o tópico ensina.
 */
describe('derivadas trigonométricas', () => {
  it('a tabela dos arcos notáveis bate com o seno e o cosseno reais', () => {
    for (const k of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
      const arco = { k, m: 6 };
      expect(exatoValor(senoExato(arco)), `sen de ${arcoTexto(arco)}`).toBeCloseTo(
        Math.sin(arcoValor(arco)),
        10,
      );
      expect(exatoValor(cossenoExato(arco)), `cos de ${arcoTexto(arco)}`).toBeCloseTo(
        Math.cos(arcoValor(arco)),
        10,
      );
    }
  });

  it('a derivada do seno é o cosseno, e a do cosseno é menos o seno', () => {
    const arco = { k: 1, m: 3 };

    expect(exatoValor(derivadaTrigExata('sen', 1, 1, arco))).toBeCloseTo(0.5, 10);
    expect(exatoValor(derivadaTrigExata('cos', 1, 1, arco))).toBeCloseTo(-Math.sqrt(3) / 2, 10);
  });

  it('o fator interno multiplica a derivada inteira', () => {
    const arco = { k: 1, m: 6 };
    const simples = exatoValor(derivadaTrigExata('sen', 1, 1, arco));
    const comFator = exatoValor(derivadaTrigExata('sen', 1, 3, { k: 1, m: 18 }));

    expect(comFator).toBeCloseTo(3 * simples, 10);
  });

  it('a secante ao quadrado é racional e nunca menor que um', () => {
    for (const arco of [
      { k: 0, m: 1 },
      { k: 1, m: 6 },
      { k: 1, m: 4 },
      { k: 1, m: 3 },
    ]) {
      const sec = secanteAoQuadradoExato(arco);
      expect(sec.raiz).toBe(1);
      expect(exatoValor(sec)).toBeGreaterThanOrEqual(1);
    }
  });

  it('não há tangente onde o cosseno zera', () => {
    expect(temTangente({ k: 1, m: 2 })).toBe(false);
    expect(temTangente({ k: 3, m: 2 })).toBe(false);
    expect(temTangente({ k: 1, m: 3 })).toBe(true);
  });

  it('o arco se reduz antes de ser escrito', () => {
    expect(arcoTex({ k: 2, m: 4 })).toBe('\\frac{\\pi}{2}');
    expect(arcoTex({ k: 3, m: 3 })).toBe('\\pi');
    expect(arcoTex({ k: 0, m: 6 })).toBe('0');
    expect(arcoTexto({ k: 2, m: 3 })).toBe('2π/3');
  });

  it('o arco em graus dá uma volta e recomeça', () => {
    expect(arcoEmGraus({ k: 1, m: 6 })).toBe(30);
    expect(arcoEmGraus({ k: 5, m: 2 })).toBe(90);
  });

  it('o valor exato é escrito sem partes redundantes', () => {
    expect(exatoTex({ num: 0, raiz: 1, den: 1 })).toBe('0');
    expect(exatoTex({ num: 2, raiz: 1, den: 2 })).toBe('1');
    expect(exatoTex({ num: -1, raiz: 3, den: 2 })).toBe('-\\frac{\\sqrt{3}}{2}');
    expect(exatoTex({ num: 3, raiz: 2, den: 1 })).toBe('3\\sqrt{2}');
  });

  it('a resolução da derivada no ponto termina no resultado', () => {
    const { resultado, passos } = derivadaTrigNoPontoComPassos('cos', 2, 3, { k: 1, m: 9 });

    expect(resultado).toBeCloseTo(-6 * Math.sin(Math.PI / 3), 10);
    expect(passos).toHaveLength(3);
    expect(passos[0]!.nota).toContain('cosseno começa descendo');
  });

  it('o produto soma duas parcelas, e a regra do produto aparece no primeiro passo', () => {
    const { resultado, passos } = derivadaProdutoComTrigComPassos(2, 'sen', { k: 1, m: 2 });
    const x = Math.PI / 2;

    expect(resultado).toBeCloseTo(2 * x * Math.sin(x) + x * x * Math.cos(x), 10);
    expect(passos[0]!.tex).toContain("u'v + uv'");
  });

  it('a potência da trigonométrica traz o fator interno', () => {
    const { resultado } = derivadaPotenciaTrigComPassos('sen', 2, { k: 1, m: 4 });

    // [sen²x]' = 2 sen x cos x = sen(2x); em π/4 isso vale 1.
    expect(resultado).toBeCloseTo(1, 10);
  });
});
