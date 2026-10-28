import { determinante, multiplicarComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorMatrizes } from './matrizes-determinantes.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(1618);
  return Array.from({ length: quantidade }, () => geradorMatrizes.gerar(nivel, rng));
}

/** Lê todas as matrizes de um enunciado em TeX. */
function matrizes(enunciadoTex: string): number[][][] {
  return [...enunciadoTex.matchAll(/\\begin\{pmatrix\} (.*?) \\end\{pmatrix\}/g)].map((bloco) =>
    bloco[1]!.split(' \\\\ ').map((linha) => linha.split(' & ').map(Number)),
  );
}

describe('geradorMatrizes', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(geradorMatrizes.saoEquivalentes(armadilha.resposta, exercicio.gabarito)).toBe(
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

  it('o determinante 2×2 é ad − bc', () => {
    const exercicios = amostra('facil', 90).filter((e) =>
      e.enunciado.includes('determinante desta matriz?'),
    );

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [m] = matrizes(exercicio.enunciadoTex);
      expect(exercicio.gabarito).toBe(determinante(m!));
    }
  });

  it('o determinante 3×3 confere com o core', () => {
    const exercicios = amostra('medio', 120).filter((e) => e.enunciado.includes('3×3'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [m] = matrizes(exercicio.enunciadoTex);
      expect(m![0]!.length).toBe(3);
      expect(exercicio.gabarito).toBeCloseTo(determinante(m!), 9);
    }
  });

  it('a entrada do produto é a linha vezes a coluna', () => {
    const exercicios = amostra('facil', 120).filter((e) => e.enunciado.includes('No produto A·B'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [a, b] = matrizes(exercicio.enunciadoTex);
      const [, linha, coluna] = /linha (\d+), coluna (\d+)/.exec(exercicio.enunciado)!;

      const produto = multiplicarComPassos(a!, b!).resultado;
      expect(exercicio.gabarito).toBe(produto[Number(linha) - 1]![Number(coluna) - 1]);
    }
  });

  it('a solução de Cramer satisfaz as duas equações', () => {
    const exercicios = amostra('medio', 150).filter((e) => e.enunciado.includes('por Cramer'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      // O enunciado traz o sistema completo; extraímos coeficientes e constantes.
      const linhas = [
        ...exercicio.enunciadoTex.matchAll(/(-?\d+)x ([+-]) (\d+)y = (-?\d+)/g),
      ].map((m) => ({
        a: Number(m[1]),
        b: (m[2] === '-' ? -1 : 1) * Number(m[3]),
        c: Number(m[4]),
      }));

      expect(linhas.length).toBe(2);

      const determinantePrincipal =
        linhas[0]!.a * linhas[1]!.b - linhas[0]!.b * linhas[1]!.a;
      expect(Math.abs(determinantePrincipal)).toBeGreaterThan(1e-9);

      // Resolve de forma independente e compara com o gabarito.
      const x =
        (linhas[0]!.c * linhas[1]!.b - linhas[0]!.b * linhas[1]!.c) / determinantePrincipal;
      const y =
        (linhas[0]!.a * linhas[1]!.c - linhas[0]!.c * linhas[1]!.a) / determinantePrincipal;

      const esperado = exercicio.enunciado.includes('vale x') ? x : y;
      expect(exercicio.gabarito).toBeCloseTo(esperado, 6);
    }
  });

  it('o determinante do produto é o produto dos determinantes', () => {
    const exercicios = amostra('dificil', 180).filter((e) =>
      e.enunciado.includes('determinante do produto'),
    );

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [a, b] = matrizes(exercicio.enunciadoTex);
      const produto = multiplicarComPassos(a!, b!).resultado;

      expect(exercicio.gabarito).toBeCloseTo(determinante(a!) * determinante(b!), 9);
      expect(exercicio.gabarito).toBeCloseTo(determinante(produto), 6);
    }
  });

  it('diagnostica quem soma os produtos das diagonais', () => {
    const exercicio = amostra('facil', 150).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('SUBTRAÇÃO, não soma')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('SUBTRAÇÃO, não soma'),
    )!;

    const resultado = corrigir(geradorMatrizes, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('matrizes.determinante');
  });

  it('diagnostica quem multiplica matrizes entrada por entrada', () => {
    const exercicio = amostra('facil', 180).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('entrada por entrada')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('entrada por entrada'),
    )!;

    const resultado = corrigir(geradorMatrizes, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('matrizes.produto');
  });

  it('aceita negativos e frações', () => {
    expect(geradorMatrizes.analisar('-14')).toBe(-14);
    expect(geradorMatrizes.analisar('7/2')).toBe(3.5);
    expect(geradorMatrizes.analisar('matriz')).toBeNull();
  });
});
