import {
  derivadaExponencialComPassos,
  derivadaExponencialDeBaseComPassos,
  derivadaLogaritmoComPassos,
  derivadaLogaritmoDeBaseComPassos,
  derivadaLogaritmoDePotenciaComPassos,
  derivadaNumerica,
  derivadaProdutoComExponencialComPassos,
  exponencialParaTex,
  logaritmoParaTex,
} from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorDerivadasExpLog } from '@features/calculo-1/derivadas-exponencial-logaritmo/derivadas-exponencial-logaritmo.gerador';

function amostra(nivel: Nivel, quantidade = 80) {
  const rng = criarRng(27_182);
  return Array.from({ length: quantidade }, () => geradorDerivadasExpLog.gerar(nivel, rng));
}

describe('geradorDerivadasExpLog', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e aceito como exibido`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciado).toBe(true);

        const exibido = geradorDerivadasExpLog.formatar(exercicio.gabarito);
        expect(corrigir(geradorDerivadasExpLog, exercicio, exibido).veredito, exibido).toBe(
          'correto',
        );
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorDerivadasExpLog.saoEquivalentes(armadilha.resposta, exercicio.gabarito),
            exercicio.enunciado,
          ).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }

  it('o Fácil só pede a tabela: exponencial natural e logaritmo natural', () => {
    for (const exercicio of amostra('facil', 150)) {
      expect(exercicio.conceitos).not.toContain('exp-log.produto');
      expect(exercicio.conceitos).not.toContain('exp-log.logaritmo-de-base');
    }
  });

  it('o Difícil cobra base diferente de e, logaritmo de base e produto', () => {
    const vistos = new Set(amostra('dificil', 250).flatMap((e) => e.conceitos));

    expect(vistos.has('exp-log.base-qualquer')).toBe(true);
    expect(vistos.has('exp-log.logaritmo-de-base')).toBe(true);
    expect(vistos.has('exp-log.produto')).toBe(true);
  });

  it('o logaritmo nunca é pedido fora do seu domínio', () => {
    for (const exercicio of amostra('medio', 300)) {
      if (!exercicio.enunciadoTex.includes('\\ln') && !exercicio.enunciadoTex.includes('\\log')) {
        continue;
      }

      const [, ponto] = /f'\((-?\d+)\)/.exec(exercicio.enunciado)!;
      expect(Number(ponto), exercicio.enunciado).toBeGreaterThan(0);
    }
  });

  it('diagnostica quem acha que o múltiplo do logaritmo sobrevive', () => {
    const exercicio = amostra('medio', 300).find((candidato) =>
      candidato.armadilhas.some((a) => a.conceito === 'exp-log.constante-no-logaritmo'),
    )!;

    const armadilha = exercicio.armadilhas.find(
      (a) => a.conceito === 'exp-log.constante-no-logaritmo',
    )!;
    const resultado = corrigir(
      geradorDerivadasExpLog,
      exercicio,
      geradorDerivadasExpLog.formatar(armadilha.resposta),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('exp-log.constante-no-logaritmo');
  });

  it('diagnostica quem aplica a regra da potência numa exponencial', () => {
    const exercicio = amostra('dificil', 300).find((candidato) =>
      candidato.armadilhas.some((a) => a.conceito === 'exp-log.base-ou-expoente'),
    )!;

    expect(exercicio).toBeDefined();
    expect(
      exercicio.armadilhas.find((a) => a.conceito === 'exp-log.base-ou-expoente')!.diagnostico,
    ).toContain('potência');
  });
});

/**
 * O motor da exponencial e do logaritmo.
 *
 * Cada regra é conferida contra a derivada numérica da própria função — é o
 * único jeito de garantir que o fator que a cadeia traz está no lugar certo.
 */
describe('derivadas de exponencial e logaritmo', () => {
  it('a exponencial natural é a própria derivada', () => {
    const { resultado } = derivadaExponencialComPassos(1, 1, 2);

    expect(resultado).toBeCloseTo(Math.exp(2), 10);
    expect(resultado).toBeCloseTo(derivadaNumerica(Math.exp, 2), 5);
  });

  it('o fator do expoente multiplica a derivada', () => {
    const { resultado } = derivadaExponencialComPassos(2, 3, 1);

    expect(resultado).toBeCloseTo(6 * Math.exp(3), 10);
    expect(resultado).toBeCloseTo(
      derivadaNumerica((x) => 2 * Math.exp(3 * x), 1),
      3,
    );
  });

  it('o múltiplo dentro do logaritmo não sobrevive à derivada', () => {
    const semMultiplo = derivadaLogaritmoComPassos(1, 1, 4).resultado;
    const comMultiplo = derivadaLogaritmoComPassos(1, 7, 4).resultado;

    expect(comMultiplo).toBe(semMultiplo);
    expect(comMultiplo).toBeCloseTo(
      derivadaNumerica((x) => Math.log(7 * x), 4),
      6,
    );
  });

  it('a nota explica por que a constante desaparece', () => {
    const { passos } = derivadaLogaritmoComPassos(1, 5, 2);

    expect(passos[1]!.nota).toContain('parcela constante');
    expect(passos[1]!.tex).toContain('\\ln 5 + \\ln x');
  });

  it('a exponencial de base qualquer traz o logaritmo da base', () => {
    const { resultado } = derivadaExponencialDeBaseComPassos(1, 2, 3);

    expect(resultado).toBeCloseTo(8 * Math.LN2, 10);
    expect(resultado).toBeCloseTo(
      derivadaNumerica((x) => 2 ** x, 3),
      4,
    );
  });

  it('no logaritmo de base, o fator divide em vez de multiplicar', () => {
    const { resultado } = derivadaLogaritmoDeBaseComPassos(1, 2, 4);

    expect(resultado).toBeCloseTo(1 / (4 * Math.LN2), 10);
    expect(resultado).toBeCloseTo(
      derivadaNumerica((x) => Math.log2(x), 4),
      6,
    );
  });

  it('o produto com exponencial põe a exponencial em evidência', () => {
    const { resultado, passos } = derivadaProdutoComExponencialComPassos(1, -1, 1);

    // [x·e^{-x}]' = e^{-x}(1 − x), que zera exatamente em x = 1.
    expect(resultado).toBeCloseTo(0, 10);
    expect(passos[1]!.tex).toBe("f'(x) = e^{-x} - xe^{-x} = e^{-x}\\left(1 - x\\right)");
  });

  it('o expoente dentro do logaritmo desce como fator', () => {
    const { resultado } = derivadaLogaritmoDePotenciaComPassos(1, 4, 2);

    expect(resultado).toBe(2);
    expect(resultado).toBeCloseTo(
      derivadaNumerica((x) => Math.log(x ** 4), 2),
      6,
    );
  });

  it('a escrita omite o coeficiente quando ele vale um', () => {
    expect(exponencialParaTex(1, 1)).toBe('e^{x}');
    expect(exponencialParaTex(3, -2)).toBe('3e^{-2x}');
    expect(logaritmoParaTex(1, 1)).toBe('\\ln\\left(x\\right)');
    expect(logaritmoParaTex(2, 5)).toBe('2\\ln\\left(5x\\right)');
  });
});
