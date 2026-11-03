import {
  Par,
  ajustarRetaComPassos,
  covariancia,
  desvioAmostral,
  determinacaoComPassos,
  forcaDaCorrelacao,
  media,
  pearson,
  pearsonComPassos,
  preverComPassos,
  residuoComPassos,
} from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorRegressaoCorrelacao } from '@features/estatistica/regressao-e-correlacao/regressao-e-correlacao.gerador';

function amostra(nivel: Nivel, quantidade = 80) {
  const rng = criarRng(31_337);
  return Array.from({ length: quantidade }, () => geradorRegressaoCorrelacao.gerar(nivel, rng));
}

/** Pontos exatamente sobre a reta y = 2x + 1. */
const PERFEITOS: readonly Par[] = [1, 2, 3, 4, 5].map((x) => ({ x, y: 2 * x + 1 }));

describe('geradorRegressaoCorrelacao', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e aceito como exibido`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciado).toBe(true);

        const exibido = geradorRegressaoCorrelacao.formatar(exercicio.gabarito);
        expect(corrigir(geradorRegressaoCorrelacao, exercicio, exibido).veredito, exibido).toBe(
          'correto',
        );
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorRegressaoCorrelacao.saoEquivalentes(armadilha.resposta, exercicio.gabarito),
            exercicio.enunciado,
          ).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }

  it('o Fácil usa dados sem ruído, e o Difícil não', () => {
    for (const exercicio of amostra('facil', 120)) {
      expect(exercicio.conceitos).not.toContain('correlacao.determinacao');
    }

    const conceitos = new Set(amostra('dificil', 250).flatMap((e) => e.conceitos));
    expect(conceitos.has('correlacao.determinacao')).toBe(true);
    expect(conceitos.has('regressao.residuos')).toBe(true);
  });

  it('a tabela do enunciado traz os dois eixos', () => {
    for (const exercicio of amostra('medio', 100)) {
      expect(exercicio.enunciadoTex).toContain('x &');
      expect(exercicio.enunciadoTex).toContain('y &');
    }
  });

  it('diagnostica quem troca correlação por determinação', () => {
    const exercicio = amostra('dificil', 250).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('coeficiente de CORRELAÇÃO')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('coeficiente de CORRELAÇÃO'),
    )!;
    const resultado = corrigir(
      geradorRegressaoCorrelacao,
      exercicio,
      geradorRegressaoCorrelacao.formatar(armadilha.resposta),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('correlacao.determinacao');
  });
});

/**
 * O motor da regressão e da correlação.
 *
 * As duas são testadas no que as distingue: a reta existe sempre, a correlação
 * é que diz se ela significa alguma coisa.
 */
describe('regressão e correlação', () => {
  it('sobre a reta, o ajuste recupera os coeficientes exatos', () => {
    const { resultado } = ajustarRetaComPassos([...PERFEITOS]);

    expect(resultado.inclinacao).toBeCloseTo(2, 10);
    expect(resultado.intercepto).toBeCloseTo(1, 10);
    expect(resultado.r2).toBeCloseTo(1, 10);
  });

  it('alinhamento perfeito dá correlação 1', () => {
    expect(pearson(PERFEITOS)).toBeCloseTo(1, 10);
  });

  it('inclinação negativa dá correlação negativa', () => {
    const descendo = PERFEITOS.map((par) => ({ x: par.x, y: -par.y }));

    expect(pearson(descendo)).toBeCloseTo(-1, 10);
  });

  it('o Pearson não muda com a unidade', () => {
    const emCentimetros = PERFEITOS.map((par) => ({ x: par.x * 100, y: par.y * 100 }));

    expect(pearson(emCentimetros)).toBeCloseTo(pearson(PERFEITOS), 10);
  });

  it('mas a covariância muda', () => {
    const emCentimetros = PERFEITOS.map((par) => ({ x: par.x * 100, y: par.y * 100 }));

    expect(covariancia(emCentimetros)).toBeCloseTo(covariancia(PERFEITOS) * 10_000, 6);
  });

  it('uma relação forte porém curva engana o Pearson', () => {
    // y = x² em torno da origem: relação perfeita e determinística, r perto de zero.
    const parabola = [-2, -1, 0, 1, 2].map((x) => ({ x, y: x * x }));

    expect(Math.abs(pearson(parabola))).toBeLessThan(1e-9);
  });

  it('a reta passa pelo ponto das médias', () => {
    const pontos = [
      { x: 1, y: 3 },
      { x: 2, y: 4 },
      { x: 3, y: 8 },
      { x: 4, y: 9 },
    ];
    const { inclinacao, intercepto } = ajustarRetaComPassos(pontos).resultado;

    const mx = media(pontos.map((par) => par.x));
    const my = media(pontos.map((par) => par.y));

    expect(inclinacao * mx + intercepto).toBeCloseTo(my, 10);
  });

  it('os resíduos somam zero', () => {
    const pontos = [
      { x: 1, y: 3 },
      { x: 2, y: 4 },
      { x: 3, y: 8 },
      { x: 4, y: 9 },
    ];
    const { inclinacao, intercepto } = ajustarRetaComPassos(pontos).resultado;

    const soma = pontos.reduce(
      (total, par) => total + residuoComPassos(inclinacao, intercepto, par).resultado,
      0,
    );

    expect(soma).toBeCloseTo(0, 10);
  });

  it('a determinação é sempre menor que a correlação em módulo', () => {
    for (const r of [0.3, 0.7, 0.9]) {
      expect(determinacaoComPassos(r).resultado).toBeLessThan(r);
    }
  });

  it('uma correlação de 0,7 explica menos da metade', () => {
    const { resultado, passos } = determinacaoComPassos(0.7);

    expect(resultado).toBeCloseTo(0.49, 10);
    expect(passos.at(-1)!.nota).toContain('menos da metade');
  });

  it('a previsão avisa quando extrapola', () => {
    const dentro = preverComPassos(2, 1, 3, { min: 1, max: 5 });
    const fora = preverComPassos(2, 1, 50, { min: 1, max: 5 });

    expect(dentro.passos.at(-1)!.nota).toContain('interpola');
    expect(fora.passos.at(-1)!.nota).toContain('Extrapolar');
  });

  it('a força da correlação se lê em palavras', () => {
    expect(forcaDaCorrelacao(0.95)).toContain('muito forte');
    expect(forcaDaCorrelacao(-0.8)).toContain('negativa');
    expect(forcaDaCorrelacao(0.05)).toBe('desprezível');
  });

  it('a resolução do Pearson mostra a normalização', () => {
    const { passos } = pearsonComPassos(PERFEITOS);

    expect(passos[1]!.nota).toContain('depende das unidades');
    expect(desvioAmostral(PERFEITOS.map((par) => par.x))).toBeGreaterThan(0);
  });
});
