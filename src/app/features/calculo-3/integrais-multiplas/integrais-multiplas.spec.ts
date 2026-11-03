import { integralDuplaComPassos, integralPolarComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorIntegraisMultiplas } from '@features/calculo-3/integrais-multiplas/integrais-multiplas.gerador';

function amostra(nivel: Nivel, quantidade = 80) {
  const rng = criarRng(64_646);
  return Array.from({ length: quantidade }, () => geradorIntegraisMultiplas.gerar(nivel, rng));
}

describe('geradorIntegraisMultiplas', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e aceito como exibido`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciado).toBe(true);

        const exibido = geradorIntegraisMultiplas.formatar(exercicio.gabarito);
        expect(corrigir(geradorIntegraisMultiplas, exercicio, exibido).veredito, exibido).toBe(
          'correto',
        );
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorIntegraisMultiplas.saoEquivalentes(armadilha.resposta, exercicio.gabarito),
            exercicio.enunciado,
          ).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }

  it('o volume só é pedido com função positiva na região', () => {
    for (const exercicio of amostra('medio', 200)) {
      if (!exercicio.enunciado.includes('volume')) {
        continue;
      }
      expect(exercicio.gabarito, exercicio.enunciado).toBeGreaterThan(0);
    }
  });

  it('o Difícil chega às polares', () => {
    const conceitos = new Set(amostra('dificil', 250).flatMap((e) => e.conceitos));

    expect(conceitos.has('multiplas.polares')).toBe(true);
    expect(conceitos.has('multiplas.valor-medio')).toBe(true);
  });

  it('diagnostica quem esquece o jacobiano', () => {
    const exercicio = amostra('dificil', 250).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('Faltou o fator r do jacobiano')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('Faltou o fator r do jacobiano'),
    )!;
    const resultado = corrigir(
      geradorIntegraisMultiplas,
      exercicio,
      geradorIntegraisMultiplas.formatar(armadilha.resposta),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('multiplas.polares');
  });
});

/**
 * O motor das integrais múltiplas.
 *
 * As contas são exatas para a quádrica, então dá para conferir cada caso
 * contra o valor que se faz à mão.
 */
describe('integrais múltiplas', () => {
  it('a integral de uma constante é a constante vezes a área', () => {
    const constante = { a: 0, b: 0, c: 0, d: 0, e: 0, f0: 3 };

    expect(integralDuplaComPassos(constante, 0, 2, 0, 5).resultado).toBeCloseTo(30, 10);
  });

  it('a integral de 1 é a própria área', () => {
    const um = { a: 0, b: 0, c: 0, d: 0, e: 0, f0: 1 };

    expect(integralDuplaComPassos(um, -1, 3, 2, 4).resultado).toBeCloseTo(8, 10);
  });

  it('o caso clássico x + y sobre o quadrado unitário vale 1', () => {
    const soma = { a: 0, b: 0, c: 0, d: 1, e: 1, f0: 0 };

    expect(integralDuplaComPassos(soma, 0, 1, 0, 1).resultado).toBeCloseTo(1, 10);
  });

  it('trocar a ordem dos limites não muda o resultado, pelo teorema de Fubini', () => {
    const q = { a: 2, b: 1, c: 3, d: -1, e: 4, f0: 5 };

    // O motor integra numa ordem fixa, mas a simetria em x e y precisa valer
    // quando os coeficientes e os limites são trocados junto.
    const espelhada = { a: q.b, b: q.a, c: q.c, d: q.e, e: q.d, f0: q.f0 };

    expect(integralDuplaComPassos(q, 0, 2, 1, 3).resultado).toBeCloseTo(
      integralDuplaComPassos(espelhada, 1, 3, 0, 2).resultado,
      10,
    );
  });

  it('a integral de x² confere com a antiderivada feita à mão', () => {
    const quadrado = { a: 1, b: 0, c: 0, d: 0, e: 0, f0: 0 };

    // ∫₀³∫₀² x² dx dy = (8/3)·3 = 8
    expect(integralDuplaComPassos(quadrado, 0, 2, 0, 3).resultado).toBeCloseTo(8, 10);
  });

  it('a área do círculo sai das polares, com o jacobiano', () => {
    const { resultado } = integralPolarComPassos(1, 3, 2 * Math.PI);

    expect(resultado).toBeCloseTo(Math.PI * 9, 10);
  });

  it('sem o jacobiano, o resultado seria o perímetro', () => {
    // A armadilha do tópico: ∫∫ dr dθ dá 2πR, que é comprimento, não área.
    const semJacobiano = 2 * Math.PI * 3;

    expect(integralPolarComPassos(1, 3, 2 * Math.PI).resultado).not.toBeCloseTo(
      semJacobiano,
      6,
    );
  });

  it('meio círculo dá metade da área', () => {
    const inteiro = integralPolarComPassos(1, 4, 2 * Math.PI).resultado;
    const metade = integralPolarComPassos(1, 4, Math.PI).resultado;

    expect(metade).toBeCloseTo(inteiro / 2, 10);
  });
});
