import { paraRadianos, quadrante } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorCirculo } from './circulo-trigonometrico.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(5252);
  return Array.from({ length: quantidade }, () => geradorCirculo.gerar(nivel, rng));
}

describe('geradorCirculo (círculo trigonométrico)', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(Math.abs(armadilha.resposta - exercicio.gabarito)).toBeGreaterThan(0.02);
        }
      }
    });
  }

  it('o quadrante informado confere com o ângulo', () => {
    const exercicios = amostra('medio', 90).filter((e) => e.enunciado.includes('quadrante'));

    for (const exercicio of exercicios) {
      const [, graus] = /\\theta = (-?\d+)°/.exec(exercicio.enunciadoTex)!;
      expect(exercicio.gabarito).toBe(quadrante(Number(graus)));
    }
  });

  it('a conversão para radianos está correta', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('radianos'));

    for (const exercicio of exercicios) {
      const [, graus] = /(-?\d+)° =/.exec(exercicio.enunciadoTex)!;
      expect(exercicio.gabarito).toBeCloseTo(paraRadianos(Number(graus)), 9);
    }
  });

  it('no nível difícil aparecem ângulos fora da primeira volta', () => {
    const forasDaVolta = amostra('dificil', 90).filter((e) => {
      const [, graus] = /(-?\d+)°/.exec(e.enunciadoTex)!;
      return Number(graus) < 0 || Number(graus) > 360;
    });

    expect(forasDaVolta.length).toBeGreaterThan(0);
  });

  it('diagnostica o erro de sinal nos quadrantes', () => {
    const exercicio = amostra('dificil', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('valor absoluto está correto')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('valor absoluto está correto'),
    )!;

    const resultado = corrigir(geradorCirculo, exercicio, String(armadilha.resposta));
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('circulo.quadrantes');
  });
});
