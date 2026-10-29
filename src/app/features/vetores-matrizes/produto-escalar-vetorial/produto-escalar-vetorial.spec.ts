import { modulo, produtoEscalar, produtoVetorialZ } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorProdutos } from './produto-escalar-vetorial.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(5309);
  return Array.from({ length: quantidade }, () => geradorProdutos.gerar(nivel, rng));
}

/** Lê os dois vetores do enunciado em TeX. */
function vetores(enunciadoTex: string) {
  const [, ax, ay, bx, by] =
    /\\vec\{a\} = \((-?\d+),\\; (-?\d+)\) \\qquad \\vec\{b\} = \((-?\d+),\\; (-?\d+)\)/.exec(
      enunciadoTex,
    )!;

  return {
    a: { x: Number(ax), y: Number(ay) },
    b: { x: Number(bx), y: Number(by) },
  };
}

describe('geradorProdutos (produto escalar e vetorial)', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(geradorProdutos.saoEquivalentes(armadilha.resposta, exercicio.gabarito)).toBe(
            false,
          );
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

  it('o produto escalar confere com a soma dos produtos das componentes', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('produto escalar'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const { a, b } = vetores(exercicio.enunciadoTex);
      expect(exercicio.gabarito).toBe(produtoEscalar(a, b));
    }
  });

  it('o ângulo fica entre 0 e 180 graus', () => {
    const exercicios = amostra('medio', 120).filter((e) => e.enunciado.includes('ângulo entre'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      expect(exercicio.gabarito).toBeGreaterThanOrEqual(0);
      expect(exercicio.gabarito).toBeLessThanOrEqual(180);
    }
  });

  it('o sinal do produto escalar prevê se o ângulo é agudo ou obtuso', () => {
    for (const exercicio of amostra('medio', 150).filter((e) =>
      e.enunciado.includes('ângulo entre'),
    )) {
      const { a, b } = vetores(exercicio.enunciadoTex);
      const escalar = produtoEscalar(a, b);

      if (escalar > 0) {
        expect(exercicio.gabarito).toBeLessThan(90 + 1e-6);
      } else if (escalar < 0) {
        expect(exercicio.gabarito).toBeGreaterThan(90 - 1e-6);
      } else {
        expect(exercicio.gabarito).toBeCloseTo(90, 6);
      }
    }
  });

  it('a projeção confere com escalar dividido pelo módulo de b', () => {
    const exercicios = amostra('medio', 150).filter((e) => e.enunciado.includes('projeção'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const { a, b } = vetores(exercicio.enunciadoTex);
      expect(exercicio.gabarito).toBeCloseTo(produtoEscalar(a, b) / modulo(b), 9);
    }
  });

  it('a área é o módulo do produto vetorial, sempre não negativa', () => {
    const exercicios = amostra('facil', 120).filter((e) => e.enunciado.includes('paralelogramo'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const { a, b } = vetores(exercicio.enunciadoTex);

      expect(exercicio.gabarito).toBeCloseTo(Math.abs(produtoVetorialZ(a, b)), 9);
      expect(exercicio.gabarito).toBeGreaterThanOrEqual(0);
    }
  });

  it('o trabalho usa cosseno e zera a 90 graus', () => {
    const exercicios = amostra('dificil', 180).filter((e) => e.enunciado.includes('trabalho'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, forca, deslocamento, angulo] =
        /F = (\d+)\\,\\text\{N\} \\qquad d = (\d+)\\,\\text\{m\} \\qquad \\theta = (\d+)/.exec(
          exercicio.enunciadoTex,
        )!;

      const esperado =
        Number(forca) * Number(deslocamento) * Math.cos((Number(angulo) * Math.PI) / 180);

      expect(exercicio.gabarito).toBeCloseTo(esperado, 6);

      if (Number(angulo) === 90) {
        expect(Math.abs(exercicio.gabarito)).toBeLessThan(1e-9);
      }
    }
  });

  it('diagnostica quem troca escalar por vetorial', () => {
    const exercicio = amostra('facil', 150).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('produto VETORIAL')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('produto VETORIAL'),
    )!;

    const resultado = corrigir(geradorProdutos, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('produtos.vetorial');
  });

  it('diagnostica quem esquece de dividir na projeção', () => {
    const exercicio = amostra('medio', 180).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('Faltou dividir pelo módulo')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('Faltou dividir pelo módulo'),
    )!;

    const resultado = corrigir(geradorProdutos, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('produtos.projecao');
  });

  it('aceita negativos e graus', () => {
    expect(geradorProdutos.analisar('-12')).toBe(-12);
    expect(geradorProdutos.analisar('36,87°')).toBeCloseTo(36.87, 9);
    expect(geradorProdutos.analisar('zero')).toBeNull();
  });
});
