import { direcaoGraus, modulo } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorVetores } from './vetores-no-plano.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(7311);
  return Array.from({ length: quantidade }, () => geradorVetores.gerar(nivel, rng));
}

describe('geradorVetores', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(geradorVetores.saoEquivalentes(armadilha.resposta, exercicio.gabarito)).toBe(false);
        }
      }
    });

    it(`no nível ${nivel}, todo exercício traz resolução e conceitos`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.resolucao.passos.length).toBeGreaterThan(1);
        expect(exercicio.conceitos.length).toBeGreaterThan(0);
        expect(exercicio.resolucao.resultado).toBe(exercicio.gabarito);
      }
    });
  }

  it('o módulo confere com Pitágoras e é positivo', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('módulo do vetor'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, x, y] = /\((-?\d+), (-?\d+)\)/.exec(exercicio.enunciado)!;

      expect(exercicio.gabarito).toBeCloseTo(modulo({ x: Number(x), y: Number(y) }), 9);
      expect(exercicio.gabarito).toBeGreaterThan(0);
    }
  });

  it('a componente nunca excede o módulo', () => {
    const exercicios = amostra('medio', 120).filter((e) => e.enunciado.includes('componente'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const comprimento = Number(/\|\\vec\{v\}\| = (\d+)/.exec(exercicio.enunciadoTex)![1]);
      expect(Math.abs(exercicio.gabarito)).toBeLessThanOrEqual(comprimento + 1e-9);
    }
  });

  it('a componente horizontal usa cosseno e a vertical usa seno', () => {
    for (const exercicio of amostra('medio', 150).filter((e) =>
      e.enunciado.includes('componente'),
    )) {
      const [, comprimento, angulo] =
        /\|\\vec\{v\}\| = (\d+) \\qquad \\theta = (\d+)/.exec(exercicio.enunciadoTex)!;

      const radianos = (Number(angulo) * Math.PI) / 180;
      const esperado = exercicio.enunciado.includes('horizontal')
        ? Number(comprimento) * Math.cos(radianos)
        : Number(comprimento) * Math.sin(radianos);

      expect(exercicio.gabarito).toBeCloseTo(esperado, 9);
    }
  });

  it('o módulo da soma nunca passa da soma dos módulos', () => {
    const exercicios = amostra('medio', 150).filter((e) => e.enunciado.includes('módulo da soma'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, ax, ay, bx, by] =
        /\\vec\{a\} = \((-?\d+),\; (-?\d+)\) \\qquad \\vec\{b\} = \((-?\d+),\; (-?\d+)\)/.exec(
          exercicio.enunciadoTex,
        )!;

      const a = { x: Number(ax), y: Number(ay) };
      const b = { x: Number(bx), y: Number(by) };

      expect(exercicio.gabarito).toBeCloseTo(modulo({ x: a.x + b.x, y: a.y + b.y }), 9);
      expect(exercicio.gabarito).toBeLessThanOrEqual(modulo(a) + modulo(b) + 1e-9);
    }
  });

  it('a direção fica entre 0 e 360 graus e respeita o quadrante', () => {
    const exercicios = amostra('dificil', 150).filter((e) => e.enunciado.includes('ângulo que o vetor'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, x, y] = /\((-?\d+), (-?\d+)\)/.exec(exercicio.enunciado)!;

      expect(exercicio.gabarito).toBeGreaterThanOrEqual(0);
      expect(exercicio.gabarito).toBeLessThan(360);
      expect(exercicio.gabarito).toBeCloseTo(direcaoGraus({ x: Number(x), y: Number(y) }), 9);
    }
  });

  it('diagnostica quem soma as componentes para achar o módulo', () => {
    const exercicio = amostra('facil', 150).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('caminho em L')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('caminho em L'))!;
    const resultado = corrigir(geradorVetores, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('vetores.definicao');
  });

  it('diagnostica quem troca seno por cosseno na decomposição', () => {
    const exercicio = amostra('medio', 180).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('cateto adjacente')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('cateto adjacente'),
    )!;

    const resultado = corrigir(geradorVetores, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
  });

  it('diagnostica quem soma os módulos em vez das componentes', () => {
    const exercicio = amostra('dificil', 180).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('mesma direção e sentido')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('mesma direção e sentido'),
    )!;

    const resultado = corrigir(geradorVetores, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('vetores.soma');
  });

  it('aceita graus e decimais', () => {
    expect(geradorVetores.analisar('126,87°')).toBeCloseTo(126.87, 9);
    expect(geradorVetores.analisar('-4,5')).toBe(-4.5);
    expect(geradorVetores.analisar('norte')).toBeNull();
  });
});
