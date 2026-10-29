import { areaEntreCurvas, integralNumerica } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorAplicacoesIntegral } from '@features/calculo-2/aplicacoes-da-integral/aplicacoes-da-integral.gerador';

/** A mesma tolerância que o gerador usa para corrigir. */
const proximos = (a: number, b: number): boolean =>
  Math.abs(a - b) <= Math.max(0.005, Math.abs(b) * 0.002);

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
    const exercicios = amostra('facil', 120).filter((e) => e.enunciadoTex.includes('\\qquad y ='));

    expect(exercicios.length).toBeGreaterThan(10);

    for (const exercicio of exercicios) {
      const [, a, b] = /y = (\d+)x \\qquad y = (\d*)x\^\{2\}/.exec(exercicio.enunciadoTex)!;
      const k = Number(a);
      const m = b === '' ? 1 : Number(b);
      // O cruzamento é a/b, e não a: é exatamente aí que a resolução errava.
      const esperado = areaEntreCurvas((x) => k * x, (x) => m * x * x, 0, k / m);

      expect(exercicio.gabarito).toBeCloseTo(esperado, 4);
    }
  });

  it('o último passo da resolução traz o próprio gabarito', () => {
    for (const nivel of NIVEIS) {
      for (const exercicio of amostra(nivel, 80)) {
        const passos = exercicio.resolucao.passos;
        const ultimo = passos[passos.length - 1]!;
        const numeros = [...ultimo.tex.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));

        expect(numeros.some((valor) => proximos(valor, exercicio.gabarito))).toBe(true);
      }
    }
  });

  it('os coeficientes do enunciado aparecem na integral montada', () => {
    const exercicios = amostra('medio', 120).filter((e) => e.enunciadoTex.includes('\\qquad y ='));

    for (const exercicio of exercicios) {
      const [, , b] = /y = (\d+)x \\qquad y = (\d*)x\^\{2\}/.exec(exercicio.enunciadoTex)!;
      const montagem = exercicio.resolucao.passos[2]!.tex;

      // Com b > 1, o integrando precisa trazer o b — e o limite superior
      // precisa ser o cruzamento, nunca o coeficiente da reta.
      if (b !== '') {
        expect(montagem).toContain(`${b}x^{2}`);
      }
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
