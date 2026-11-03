import {
  REGRA_EMPIRICA,
  acumulada,
  acumuladaPadrao,
  densidadePadrao,
  erf,
  escoreZ,
  escoreZComPassos,
  probabilidadeEntre,
  quantilPadrao,
} from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorDistribuicaoNormal } from '@features/estatistica/distribuicao-normal/distribuicao-normal.gerador';

function amostra(nivel: Nivel, quantidade = 80) {
  const rng = criarRng(11_235);
  return Array.from({ length: quantidade }, () => geradorDistribuicaoNormal.gerar(nivel, rng));
}

describe('geradorDistribuicaoNormal', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e aceito como exibido`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciado).toBe(true);

        const exibido = geradorDistribuicaoNormal.formatar(exercicio.gabarito);
        expect(corrigir(geradorDistribuicaoNormal, exercicio, exibido).veredito, exibido).toBe(
          'correto',
        );
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorDistribuicaoNormal.saoEquivalentes(armadilha.resposta, exercicio.gabarito),
            exercicio.enunciado,
          ).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }

  it('toda proporção pedida cabe entre 0 e 1', () => {
    for (const nivel of NIVEIS) {
      for (const exercicio of amostra(nivel, 120)) {
        if (!exercicio.enunciado.includes('Que proporção')) {
          continue;
        }
        expect(exercicio.gabarito, exercicio.enunciado).toBeGreaterThanOrEqual(0);
        expect(exercicio.gabarito, exercicio.enunciado).toBeLessThanOrEqual(1);
      }
    }
  });

  it('o Difícil cobra intervalo e leitura inversa', () => {
    const conceitos = new Set(amostra('dificil', 250).flatMap((e) => e.conceitos));

    expect(conceitos.has('normal.quantil')).toBe(true);
    expect(conceitos.has('normal.area')).toBe(true);
  });

  it('diagnostica quem esquece de dividir pelo desvio', () => {
    const exercicio = amostra('facil', 200).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('dividir pelo desvio padrão')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('dividir pelo desvio padrão'),
    )!;
    const resultado = corrigir(
      geradorDistribuicaoNormal,
      exercicio,
      geradorDistribuicaoNormal.formatar(armadilha.resposta),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('normal.padronizacao');
  });
});

/**
 * O motor da normal.
 *
 * A acumulada é aproximada, então ela é conferida contra os valores tabelados
 * que qualquer livro traz — e contra integração numérica da densidade.
 */
describe('distribuição normal', () => {
  it('a função erro tem os valores conhecidos nas pontas', () => {
    expect(erf(0)).toBeCloseTo(0, 10);
    expect(erf(5)).toBeCloseTo(1, 6);
    expect(erf(-5)).toBeCloseTo(-1, 6);
  });

  it('a função erro é ímpar', () => {
    for (const x of [0.3, 1, 2.2]) {
      expect(erf(-x)).toBeCloseTo(-erf(x), 10);
    }
  });

  it('a acumulada bate com a tabela impressa', () => {
    // Os quatro valores que qualquer livro traz na primeira linha.
    expect(acumuladaPadrao(0)).toBeCloseTo(0.5, 6);
    expect(acumuladaPadrao(1)).toBeCloseTo(0.8413, 4);
    expect(acumuladaPadrao(1.96)).toBeCloseTo(0.975, 4);
    expect(acumuladaPadrao(2.576)).toBeCloseTo(0.995, 4);
  });

  it('a acumulada confere com a integral numérica da densidade', () => {
    // Conferência independente: soma de Riemann sobre a densidade. O laço conta
    // retângulos em vez de acumular o passo — somar 0,0005 dezoito mil vezes
    // deriva o bastante para incluir um retângulo a mais no fim.
    const retangulos = 18_000;
    const passo = 9 / retangulos;
    let soma = 0;
    for (let i = 0; i < retangulos; i++) {
      soma += densidadePadrao(-8 + (i + 0.5) * passo) * passo;
    }

    expect(acumuladaPadrao(1)).toBeCloseTo(soma, 5);
  });

  it('a simetria vale em toda a curva', () => {
    for (const z of [0.5, 1.2, 2.3]) {
      expect(acumuladaPadrao(-z)).toBeCloseTo(1 - acumuladaPadrao(z), 8);
    }
  });

  it('o escore mede em desvios, não em unidades', () => {
    expect(escoreZ(52, 50, 2)).toBe(1);
    expect(escoreZ(520, 500, 20)).toBe(1);
  });

  it('padronizar não muda a probabilidade', () => {
    expect(acumulada(52, 50, 2)).toBeCloseTo(acumulada(520, 500, 20), 10);
  });

  it('a regra empírica sai da própria acumulada', () => {
    for (const item of REGRA_EMPIRICA) {
      const calculado = acumuladaPadrao(item.desvios) - acumuladaPadrao(-item.desvios);
      expect(calculado, `${item.desvios} desvios`).toBeCloseTo(item.dentro, 3);
    }
  });

  it('o quantil é o inverso da acumulada', () => {
    for (const p of [0.05, 0.25, 0.5, 0.9, 0.99]) {
      expect(acumuladaPadrao(quantilPadrao(p))).toBeCloseTo(p, 6);
    }
  });

  it('o quantil de 95 por cento é o 1,645 conhecido', () => {
    expect(quantilPadrao(0.95)).toBeCloseTo(1.645, 3);
  });

  it('a probabilidade entre dois valores é a diferença das acumuladas', () => {
    const entre = probabilidadeEntre(45, 55, 50, 5);

    expect(entre).toBeCloseTo(acumuladaPadrao(1) - acumuladaPadrao(-1), 10);
  });

  it('a resolução do escore explica o que o sinal significa', () => {
    const { passos } = escoreZComPassos(45, 50, 5);

    expect(passos[2]!.descricao).toContain('abaixo da média');
    expect(passos[2]!.nota).toContain('não tem unidade');
  });
});
