import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorModular } from '@features/funcoes/funcao-modular/funcao-modular.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(1212);
  return Array.from({ length: quantidade }, () => geradorModular.gerar(nivel, rng));
}

describe('geradorModular', () => {
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

  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(armadilha.resposta.igualA(exercicio.gabarito)).toBe(false);
        }
      }
    });
  }

  it('o valor de f(x) nunca é negativo', () => {
    const valores = amostra('medio', 120).filter((e) => e.enunciado.startsWith('Qual é o valor'));

    for (const exercicio of valores) {
      expect(exercicio.gabarito.ehNegativa).toBe(false);
    }
  });

  it('diagnostica quem deixa o módulo negativo', () => {
    const exercicio = amostra('facil', 80).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('nunca devolve')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('nunca devolve'))!;

    const resultado = corrigir(geradorModular, exercicio, armadilha.resposta.toString());
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('modular.distancia');
  });

  it('a equação modular registra as duas soluções na resolução', () => {
    const exercicio = amostra('dificil', 80).find((e) => e.enunciado.includes('MAIOR'))!;

    expect(exercicio.resolucao.passos[0]?.tex).toContain('\\text{ou}');
    expect(exercicio.resolucao.passos[1]?.tex).toContain('\\text{ou}');
  });

  it('avisa quem responde a menor das duas soluções', () => {
    const exercicio = amostra('medio', 120).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('a menor')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('a menor'))!;
    const resultado = corrigir(geradorModular, exercicio, armadilha.resposta.toString());

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('DUAS respostas');
  });
});

describe('geradorModular — inequação modular', () => {
  const rng = criarRng(4343);
  const lote = (nivel: Nivel) =>
    Array.from({ length: 300 }, () => geradorModular.gerar(nivel, rng));

  /** Lê |ax + b| (rel) c do enunciado e conta os inteiros por força bruta. */
  function contarPorForcaBruta(tex: string, contarOsQueFalham: boolean): number {
    const [, a, b, rel, c] = /\\left\|(-?\d*)x ([+-] \d+)\\right\| (\\leq|\\geq|<|>) (\d+)/.exec(
      tex,
    )!;
    const coef = a === '' ? 1 : a === '-' ? -1 : Number(a);
    const termo = Number(b!.replace(' ', ''));
    const limite = Number(c);
    const vale = (x: number): boolean => {
      const u = Math.abs(coef * x + termo);
      return rel === '<'
        ? u < limite
        : rel === '>'
          ? u > limite
          : rel === '\\leq'
            ? u <= limite
            : u >= limite;
    };
    let total = 0;
    for (let x = -100; x <= 100; x++) if (vale(x) !== contarOsQueFalham) total++;
    return total;
  }

  it('no Difícil, a contagem de inteiros que satisfazem confere por força bruta', () => {
    const casos = lote('dificil').filter((e) => e.conceitos.includes('modular.inequacoes'));
    expect(casos.length).toBeGreaterThan(0);
    for (const e of casos) {
      expect(e.gabarito.paraDecimal()).toBe(contarPorForcaBruta(e.enunciadoTex!, false));
    }
  });

  it('no Extremo, a contagem dos que NÃO satisfazem confere por força bruta', () => {
    const casos = lote('extremo').filter((e) => e.conceitos.includes('modular.inequacoes'));
    expect(casos.length).toBeGreaterThan(0);
    for (const e of casos) {
      expect(e.enunciado).toContain('NÃO satisfazem');
      expect(e.gabarito.paraDecimal()).toBe(contarPorForcaBruta(e.enunciadoTex!, true));
    }
  });

  it('o Extremo deixou de ter uma pergunta só', () => {
    const formas = new Set(lote('extremo').map((e) => e.conceitos[0]));
    expect(formas.size).toBeGreaterThan(1);
  });
});
