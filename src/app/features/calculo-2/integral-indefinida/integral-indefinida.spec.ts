import { Polinomio } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorIndefinida } from './integral-indefinida.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(5353);
  return Array.from({ length: quantidade }, () => geradorIndefinida.gerar(nivel, rng));
}

describe('geradorIndefinida', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito)).toBe(true);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(Math.abs(armadilha.resposta - exercicio.gabarito)).toBeGreaterThan(0.01);
        }
      }
    });
  }

  it('o coeficiente de x³ é o de x² dividido por 3', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('coeficiente'));

    for (const exercicio of exercicios) {
      // O coeficiente 1 é omitido na notação: "x^{2}", não "1x^{2}".
      const [, a] = /(-?\d*)x\^\{2\}/.exec(exercicio.enunciadoTex)!;
      const coeficiente = a === '' ? 1 : a === '-' ? -1 : Number(a);

      expect(exercicio.gabarito).toBeCloseTo(coeficiente / 3, 9);
    }
  });

  it('integrar e derivar se desfazem', () => {
    const p = Polinomio.de(1, -4, 3);
    expect(p.integrar(7).derivar().paraTex()).toBe(p.paraTex());
  });

  it('diagnostica quem multiplica em vez de dividir pelo novo expoente', () => {
    const exercicio = amostra('facil', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('regra da DERIVADA')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('regra da DERIVADA'),
    )!;

    const resultado = corrigir(geradorIndefinida, exercicio, String(armadilha.resposta));
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('indefinida.antiderivada');
  });

  it('diagnostica quem confunde F(ponto) com a constante C', () => {
    const exercicio = amostra('dificil', 120).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('valor de F no ponto')),
    )!;

    expect(exercicio).toBeDefined();
    expect(exercicio.conceitos).toContain('indefinida.constante');
  });
});
