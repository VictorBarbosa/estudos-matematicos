import { paraRadianos } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorTriangulo } from './triangulo-retangulo.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(6060);
  return Array.from({ length: quantidade }, () => geradorTriangulo.gerar(nivel, rng));
}

describe('geradorTriangulo', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o cateto é menor que a hipotenusa`, () => {
      for (const exercicio of amostra(nivel)) {
        const [, hipotenusa] = /h = (\d+)/.exec(exercicio.enunciadoTex)!;
        expect(exercicio.gabarito).toBeLessThan(Number(hipotenusa));
        expect(exercicio.gabarito).toBeGreaterThan(0);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(Math.abs(armadilha.resposta - exercicio.gabarito)).toBeGreaterThan(0.02);
        }
      }
    });
  }

  it('o cateto calculado confere com a trigonometria', () => {
    for (const exercicio of amostra('medio', 40)) {
      const [, hipotenusa, angulo] = /h = (\d+) \\qquad \\theta = (\d+)/.exec(
        exercicio.enunciadoTex,
      )!;

      const radianos = paraRadianos(Number(angulo));
      const oposto = Number(hipotenusa) * Math.sin(radianos);
      const adjacente = Number(hipotenusa) * Math.cos(radianos);

      const bateComAlgum =
        Math.abs(exercicio.gabarito - oposto) < 1e-9 ||
        Math.abs(exercicio.gabarito - adjacente) < 1e-9;

      expect(bateComAlgum).toBe(true);
    }
  });

  it('no nível fácil só aparecem ângulos notáveis', () => {
    for (const exercicio of amostra('facil')) {
      const [, angulo] = /\\theta = (\d+)/.exec(exercicio.enunciadoTex)!;
      expect([30, 45, 60]).toContain(Number(angulo));
    }
  });

  it('tolera arredondamento de duas casas', () => {
    const exercicio = amostra('facil', 1)[0]!;
    const arredondado = exercicio.gabarito.toFixed(2).replace('.', ',');

    expect(corrigir(geradorTriangulo, exercicio, arredondado).veredito).toBe('correto');
  });

  it('diagnostica a troca entre seno e cosseno', () => {
    const exercicio = amostra('medio', 40).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('cateto OPOSTO') || a.diagnostico.includes('cateto ADJACENTE')),
    )!;

    const armadilha = exercicio.armadilhas[0]!;
    const resultado = corrigir(geradorTriangulo, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('triangulo.razoes');
  });
});
