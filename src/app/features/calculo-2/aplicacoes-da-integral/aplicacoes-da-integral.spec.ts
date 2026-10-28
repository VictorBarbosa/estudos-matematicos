import { areaEntreCurvas, integralNumerica } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorAplicacoesIntegral } from './aplicacoes-da-integral.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(9797);
  return Array.from({ length: quantidade }, () => geradorAplicacoesIntegral.gerar(nivel, rng));
}

describe('geradorAplicacoesIntegral', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é positivo`, () => {
      for (const exercicio of amostra(nivel)) {
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

  it('a área entre a reta e a parábola confere com o cálculo direto', () => {
    // Só os de área ENTRE curvas trazem as duas equações; os de área simples
    // também contêm "x^{2}", mas numa única curva.
    const exercicios = amostra('facil', 90).filter((e) =>
      e.enunciadoTex.includes('\\qquad y = x^{2}'),
    );

    for (const exercicio of exercicios) {
      const [, a] = /y = (\d+)x/.exec(exercicio.enunciadoTex)!;
      const k = Number(a);
      const esperado = areaEntreCurvas((x) => k * x, (x) => x * x, 0, k);

      expect(exercicio.gabarito).toBeCloseTo(esperado, 4);
    }
  });

  it('o volume do cone confere com a fórmula clássica', () => {
    const exercicios = amostra('dificil', 120).filter((e) => e.enunciado.includes('volume'));

    for (const exercicio of exercicios) {
      const [, a] = /y = (\d*)x/.exec(exercicio.enunciadoTex)!;
      const [, h] = /\\leq (\d+)/.exec(exercicio.enunciadoTex)!;
      const coeficiente = a === '' ? 1 : Number(a);

      const porIntegral = Math.PI * integralNumerica((x) => (coeficiente * x) ** 2, 0, Number(h));
      expect(exercicio.gabarito).toBeCloseTo(porIntegral, 4);
    }
  });

  it('diagnostica quem inverte a diferença entre as curvas', () => {
    const exercicio = amostra('facil', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('diferença está invertida')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('diferença está invertida'),
    )!;

    const resultado = corrigir(geradorAplicacoesIntegral, exercicio, String(armadilha.resposta));
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('aplic-integral.area');
  });

  it('diagnostica quem esquece o π no volume', () => {
    const exercicio = amostra('dificil', 120).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('multiplicar por π')),
    )!;

    expect(exercicio).toBeDefined();
    expect(exercicio.conceitos).toContain('aplic-integral.volume');
  });
});
