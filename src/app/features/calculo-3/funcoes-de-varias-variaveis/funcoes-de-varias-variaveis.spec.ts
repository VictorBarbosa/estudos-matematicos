import {
  avaliarQuadrica,
  corteVerticalComPassos,
  dominioDaRaizComPassos,
  quadricaParaTex,
} from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorFuncoesVariasVariaveis } from '@features/calculo-3/funcoes-de-varias-variaveis/funcoes-de-varias-variaveis.gerador';

function amostra(nivel: Nivel, quantidade = 80) {
  const rng = criarRng(70_123);
  return Array.from({ length: quantidade }, () =>
    geradorFuncoesVariasVariaveis.gerar(nivel, rng),
  );
}

describe('geradorFuncoesVariasVariaveis', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e aceito como exibido`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciado).toBe(true);

        const exibido = geradorFuncoesVariasVariaveis.formatar(exercicio.gabarito);
        expect(
          corrigir(geradorFuncoesVariasVariaveis, exercicio, exibido).veredito,
          exibido,
        ).toBe('correto');
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorFuncoesVariasVariaveis.saoEquivalentes(armadilha.resposta, exercicio.gabarito),
            exercicio.enunciado,
          ).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }

  it('o Difícil chega ao corte e ao domínio', () => {
    const conceitos = new Set(amostra('dificil', 250).flatMap((e) => e.conceitos));

    expect(conceitos.has('multivar.dominio')).toBe(true);
    expect(conceitos.has('multivar.superficie')).toBe(true);
  });

  it('o ponto pedido no domínio está sempre dentro do disco', () => {
    for (const exercicio of amostra('medio', 200)) {
      if (!exercicio.enunciado.includes('domínio')) {
        continue;
      }
      expect(exercicio.gabarito, exercicio.enunciado).toBeGreaterThanOrEqual(0);
    }
  });

  it('diagnostica quem troca as coordenadas', () => {
    const exercicio = amostra('facil', 200).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('coordenadas entraram trocadas')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('coordenadas entraram trocadas'),
    )!;
    const resultado = corrigir(
      geradorFuncoesVariasVariaveis,
      exercicio,
      geradorFuncoesVariasVariaveis.formatar(armadilha.resposta),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('multivar.superficie');
  });
});

/**
 * O motor das funções de duas variáveis.
 *
 * O que ele precisa acertar é a leitura por fatias: cortar a superfície
 * devolve uma função de uma variável só, e o domínio é uma região, não um
 * intervalo.
 */
describe('funções de várias variáveis', () => {
  const paraboloide = { a: 1, b: 1, c: 0, d: 0, e: 0, f0: 0 };

  it('cada ponto do plano produz uma altura', () => {
    expect(avaliarQuadrica(paraboloide, 1, 2)).toBe(5);
    expect(avaliarQuadrica(paraboloide, -1, -2)).toBe(5);
  });

  it('a ordem das coordenadas importa quando a função não é simétrica', () => {
    const assimetrica = { a: 1, b: 0, c: 0, d: 0, e: 0, f0: 0 };

    expect(avaliarQuadrica(assimetrica, 3, 1)).toBe(9);
    expect(avaliarQuadrica(assimetrica, 1, 3)).toBe(1);
  });

  it('o domínio da raiz é um disco, não um losango', () => {
    const { resultado } = dominioDaRaizComPassos(5, 3);

    expect(resultado).toBeCloseTo(4, 12);
    expect(resultado).not.toBeCloseTo(5 - 3, 6);
  });

  it('na borda do disco, só resta um ponto', () => {
    expect(dominioDaRaizComPassos(5, 5).resultado).toBeCloseTo(0, 12);
  });

  it('o corte vertical devolve uma parábola, e o vértice sai da fórmula de sempre', () => {
    // f(x, y) = x² + 2xy ⟹ f(x, 3) = x² + 6x, com vértice em −3.
    const comMisto = { a: 1, b: 0, c: 2, d: 0, e: 0, f0: 0 };

    expect(corteVerticalComPassos(comMisto, 3).resultado).toBeCloseTo(-3, 12);
  });

  it('sem termo misto, o corte não depende de onde ele é feito', () => {
    const semMisto = { a: 1, b: 2, c: 0, d: -4, e: 0, f0: 0 };

    expect(corteVerticalComPassos(semMisto, 0).resultado).toBeCloseTo(2, 12);
    expect(corteVerticalComPassos(semMisto, 5).resultado).toBeCloseTo(2, 12);
  });

  it('a escrita omite coeficientes e termos nulos', () => {
    expect(quadricaParaTex(paraboloide)).toBe('x^{2} + y^{2}');
    expect(quadricaParaTex({ a: 0, b: 0, c: 0, d: 0, e: 0, f0: 0 })).toBe('0');
    expect(quadricaParaTex({ a: 2, b: 0, c: -1, d: 0, e: 0, f0: 3 })).toBe('2x^{2} - xy + 3');
  });
});
