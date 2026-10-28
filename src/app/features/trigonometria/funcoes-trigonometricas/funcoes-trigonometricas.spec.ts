import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorOndas } from './funcoes-trigonometricas.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(1414);
  return Array.from({ length: quantidade }, () => geradorOndas.gerar(nivel, rng));
}

describe('geradorOndas', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito)).toBe(true);
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

  it('o período pedido é 2π dividido pelo coeficiente', () => {
    const exercicios = amostra('facil', 80).filter((e) => e.enunciado.includes('período'));

    for (const exercicio of exercicios) {
      const coeficiente = /\\sin\((\d*)x/.exec(exercicio.enunciadoTex)![1];
      const b = coeficiente === '' ? 1 : Number(coeficiente);

      expect(exercicio.gabarito).toBeCloseTo((2 * Math.PI) / b, 9);
    }
  });

  it('a amplitude pedida é sempre positiva', () => {
    const exercicios = amostra('medio', 80).filter((e) => e.enunciado.includes('amplitude'));

    for (const exercicio of exercicios) {
      expect(exercicio.gabarito).toBeGreaterThan(0);
    }
  });

  it('diagnostica quem multiplica 2π pelo coeficiente', () => {
    const exercicio = amostra('facil', 80).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('DIVIDE 2π')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('DIVIDE 2π'))!;
    const resultado = corrigir(geradorOndas, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('funcoes-trig.periodo');
  });

  it('diagnostica quem confunde amplitude com intervalo total', () => {
    const exercicio = amostra('medio', 120).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('intervalo TOTAL')),
    )!;

    expect(exercicio).toBeDefined();
  });

  it('no nível difícil aparecem máximos e mínimos deslocados', () => {
    const extremos = amostra('dificil', 90).filter(
      (e) => e.enunciado.includes('MÁXIMO') || e.enunciado.includes('MÍNIMO'),
    );

    expect(extremos.length).toBeGreaterThan(0);
  });
});
