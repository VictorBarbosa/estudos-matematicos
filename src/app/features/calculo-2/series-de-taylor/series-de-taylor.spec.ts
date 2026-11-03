import {
  avaliarMaclaurin,
  coeficienteDeMaclaurin,
  cotaDeLagrangeComPassos,
  erroDaAproximacaoComPassos,
  fatorial,
  maclaurinComPassos,
  polinomioDeMaclaurinTex,
  raioDeConvergencia,
  taylorDaRaizComPassos,
  valorDaFuncaoDeSerie,
} from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorSeriesDeTaylor } from '@features/calculo-2/series-de-taylor/series-de-taylor.gerador';

function amostra(nivel: Nivel, quantidade = 80) {
  const rng = criarRng(70_777);
  return Array.from({ length: quantidade }, () => geradorSeriesDeTaylor.gerar(nivel, rng));
}

describe('geradorSeriesDeTaylor', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e aceito como exibido`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciado).toBe(true);

        const exibido = geradorSeriesDeTaylor.formatar(exercicio.gabarito);
        expect(corrigir(geradorSeriesDeTaylor, exercicio, exibido).veredito, exibido).toBe(
          'correto',
        );
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorSeriesDeTaylor.saoEquivalentes(armadilha.resposta, exercicio.gabarito),
            exercicio.enunciado,
          ).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }

  it('o Difícil cobra cota de Lagrange e centro fora da origem', () => {
    const conceitos = new Set(amostra('dificil', 250).flatMap((e) => e.conceitos));

    expect(conceitos.has('taylor.lagrange')).toBe(true);
    expect(conceitos.has('taylor.fora-da-origem')).toBe(true);
  });

  it('o Fácil fica no coeficiente e na aproximação', () => {
    for (const exercicio of amostra('facil', 150)) {
      expect(exercicio.conceitos).not.toContain('taylor.lagrange');
      expect(exercicio.conceitos).not.toContain('taylor.erro');
    }
  });

  it('as séries de raio 1 nunca são avaliadas fora dele', () => {
    for (const nivel of NIVEIS) {
      for (const exercicio of amostra(nivel, 150)) {
        const estreita = /\\ln\(1 \+ x\)|\\frac\{1\}\{1 - x\}/.test(exercicio.enunciadoTex);
        if (!estreita) {
          continue;
        }

        const encontrado = /x = (-?\d+(?:,\d+)?)/.exec(exercicio.enunciado);
        if (encontrado === null) {
          continue;
        }

        const x = Number(encontrado[1]!.replace(',', '.'));
        expect(Math.abs(x), exercicio.enunciado).toBeLessThan(1);
      }
    }
  });

  it('o erro pedido nunca é pequeno demais para ser escrito', () => {
    // Com 5 casas, um erro da ordem de 1e-6 viraria zero na tela.
    for (const exercicio of amostra('medio', 200)) {
      if (!exercicio.conceitos.includes('taylor.erro')) {
        continue;
      }
      expect(exercicio.gabarito, exercicio.enunciado).toBeGreaterThan(1e-5);
    }
  });

  it('diagnostica quem devolve o valor exato no lugar da aproximação', () => {
    const exercicio = amostra('facil', 200).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('valor exato da função')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('valor exato da função'),
    )!;
    const resultado = corrigir(
      geradorSeriesDeTaylor,
      exercicio,
      geradorSeriesDeTaylor.formatar(armadilha.resposta),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('taylor.polinomio');
  });
});

/**
 * O motor das séries.
 *
 * Os coeficientes são conferidos contra as séries clássicas, e as avaliações,
 * contra o valor verdadeiro da função.
 */
describe('séries de Taylor', () => {
  it('os coeficientes da exponencial são os inversos dos fatoriais', () => {
    for (let n = 0; n <= 6; n++) {
      expect(coeficienteDeMaclaurin('exp', n)).toBeCloseTo(1 / fatorial(n), 12);
    }
  });

  it('o seno não tem potências pares, e o cosseno não tem ímpares', () => {
    for (let n = 0; n <= 8; n += 2) {
      expect(coeficienteDeMaclaurin('sen', n)).toBe(0);
      expect(coeficienteDeMaclaurin('cos', n + 1)).toBe(0);
    }
  });

  it('os sinais do seno alternam de dois em dois termos', () => {
    expect(coeficienteDeMaclaurin('sen', 1)).toBeCloseTo(1, 12);
    expect(coeficienteDeMaclaurin('sen', 3)).toBeCloseTo(-1 / 6, 12);
    expect(coeficienteDeMaclaurin('sen', 5)).toBeCloseTo(1 / 120, 12);
  });

  it('no logaritmo o denominador é a própria ordem', () => {
    expect(coeficienteDeMaclaurin('ln1x', 1)).toBeCloseTo(1, 12);
    expect(coeficienteDeMaclaurin('ln1x', 2)).toBeCloseTo(-1 / 2, 12);
    expect(coeficienteDeMaclaurin('ln1x', 3)).toBeCloseTo(1 / 3, 12);
    expect(coeficienteDeMaclaurin('ln1x', 0)).toBe(0);
  });

  it('a série geométrica tem todos os coeficientes iguais a 1', () => {
    for (let n = 0; n <= 5; n++) {
      expect(coeficienteDeMaclaurin('geometrica', n)).toBe(1);
    }
  });

  it('o polinômio é escrito sem coeficientes redundantes', () => {
    expect(polinomioDeMaclaurinTex('exp', 3)).toBe('1 + x + \\frac{x^{2}}{2} + \\frac{x^{3}}{6}');
    expect(polinomioDeMaclaurinTex('sen', 3)).toBe('x - \\frac{x^{3}}{6}');
    expect(polinomioDeMaclaurinTex('geometrica', 2)).toBe('1 + x + x^{2}');
  });

  it('mais termos aproximam melhor, perto do centro', () => {
    let anterior = Number.POSITIVE_INFINITY;

    for (let grau = 1; grau <= 6; grau++) {
      const erro = Math.abs(Math.exp(1) - avaliarMaclaurin('exp', grau, 1));
      expect(erro).toBeLessThan(anterior);
      anterior = erro;
    }
  });

  it('longe do centro, o mesmo grau erra muito mais', () => {
    const perto = Math.abs(Math.exp(1) - avaliarMaclaurin('exp', 3, 1));
    const longe = Math.abs(Math.exp(5) - avaliarMaclaurin('exp', 3, 5));

    expect(longe).toBeGreaterThan(perto * 100);
  });

  it('o raio é 1 só para o logaritmo e a geométrica', () => {
    expect(raioDeConvergencia('exp')).toBe(Number.POSITIVE_INFINITY);
    expect(raioDeConvergencia('sen')).toBe(Number.POSITIVE_INFINITY);
    expect(raioDeConvergencia('ln1x')).toBe(1);
    expect(raioDeConvergencia('geometrica')).toBe(1);
  });

  it('a resolução compara a aproximação com o valor verdadeiro', () => {
    const { resultado, passos } = maclaurinComPassos('cos', 4, 0.5);

    expect(resultado).toBeCloseTo(avaliarMaclaurin('cos', 4, 0.5), 12);
    expect(passos.at(-1)!.tex).toContain('erro');
    expect(valorDaFuncaoDeSerie('cos', 0.5)).toBeCloseTo(Math.cos(0.5), 12);
  });

  it('o erro medido é a diferença em módulo', () => {
    const { resultado } = erroDaAproximacaoComPassos('exp', 2, 1);
    expect(resultado).toBeCloseTo(Math.E - 2.5, 10);
  });

  it('a cota de Lagrange é generosa, mas nunca menor que o erro real', () => {
    for (const grau of [1, 2, 3, 4, 5]) {
      const cota = cotaDeLagrangeComPassos(grau, 1, 1).resultado;
      const erro = Math.abs(Math.sin(1) - avaliarMaclaurin('sen', grau, 1));

      expect(cota).toBeGreaterThanOrEqual(erro);
    }
  });

  it('a raiz aproximada perto do centro acerta várias casas', () => {
    const { resultado } = taylorDaRaizComPassos(4, 4.2, 2);

    expect(resultado).toBeCloseTo(Math.sqrt(4.2), 4);
  });

  it('e o grau 1 já é melhor que a raiz do centro', () => {
    const grau1 = taylorDaRaizComPassos(9, 9.6, 1).resultado;

    expect(Math.abs(grau1 - Math.sqrt(9.6))).toBeLessThan(Math.abs(3 - Math.sqrt(9.6)));
  });
});
