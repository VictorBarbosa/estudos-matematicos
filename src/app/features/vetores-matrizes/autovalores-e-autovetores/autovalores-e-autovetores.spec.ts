import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorAutovalores } from '@features/vetores-matrizes/autovalores-e-autovetores/autovalores-e-autovetores.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(991);
  return Array.from({ length: quantidade }, () => geradorAutovalores.gerar(nivel, rng));
}

/** Os números da matriz, lidos do TeX do enunciado. */
function matrizDoEnunciado(tex: string): number[] {
  return [...tex.matchAll(/-?\d+/g)].map((m) => Number(m[0]));
}

describe('geradorAutovalores', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é inteiro`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isInteger(exercicio.gabarito), exercicio.enunciado).toBe(true);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorAutovalores.saoEquivalentes!(armadilha.resposta, exercicio.gabarito),
            `${exercicio.enunciado} → ${armadilha.resposta}`,
          ).toBe(false);
        }
      }
    });

    it(`no nível ${nivel}, o gabarito exibido é aceito de volta`, () => {
      for (const exercicio of amostra(nivel, 30)) {
        const escrito = geradorAutovalores.formatar(exercicio.gabarito);
        expect(corrigir(geradorAutovalores, exercicio, escrito).veredito, escrito).toBe('correto');
      }
    });
  }

  /**
   * As matrizes 2×2 do tópico são inteiras, de autovalores inteiros e NÃO
   * triangulares — se fossem triangulares, a resposta estaria na diagonal e o
   * exercício não cobraria conta nenhuma.
   */
  it('as matrizes 2×2 não são triangulares', () => {
    const doisPorDois = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 60).filter((e) => !e.id.startsWith('auto-triangular')),
    );

    expect(doisPorDois.length).toBeGreaterThan(40);

    for (const exercicio of doisPorDois) {
      const [, b, c] = matrizDoEnunciado(exercicio.enunciadoTex!);

      expect(b, exercicio.enunciadoTex).not.toBe(0);
      expect(c, exercicio.enunciadoTex).not.toBe(0);
    }
  });

  /**
   * As duas identidades valem em toda matriz sorteada: é o que o tópico ensina
   * como conferência, e é bom que o próprio gerador as respeite.
   */
  it('a soma dos autovalores é o traço e o produto é o determinante', () => {
    const somas = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 60).filter((e) => e.id.startsWith('auto-soma')),
    );
    const produtos = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 60).filter((e) => e.id.startsWith('auto-produto')),
    );

    expect(somas.length).toBeGreaterThan(10);
    expect(produtos.length).toBeGreaterThan(10);

    for (const exercicio of somas) {
      const [a, , , d] = matrizDoEnunciado(exercicio.enunciadoTex!);

      expect(exercicio.gabarito, exercicio.enunciadoTex).toBe(a! + d!);
    }

    for (const exercicio of produtos) {
      const [a, b, c, d] = matrizDoEnunciado(exercicio.enunciadoTex!);

      expect(exercicio.gabarito, exercicio.enunciadoTex).toBe(a! * d! - b! * c!);
    }
  });

  /** O autovetor pedido satisfaz a definição: A·(1, k) = λ·(1, k). */
  it('a direção pedida é de verdade um autovetor', () => {
    const direcoes = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 60).filter((e) => e.id.startsWith('auto-direcao')),
    );

    expect(direcoes.length).toBeGreaterThan(20);

    for (const exercicio of direcoes) {
      const [a, b, c, d] = matrizDoEnunciado(exercicio.enunciadoTex!);
      const [, autovalor] = /autovalor (-?\d+)/.exec(exercicio.enunciado)!;
      const lambda = Number(autovalor);
      const k = exercicio.gabarito;

      expect(a! * 1 + b! * k, exercicio.enunciado).toBeCloseTo(lambda * 1, 8);
      expect(c! * 1 + d! * k, exercicio.enunciado).toBeCloseTo(lambda * k, 8);
    }
  });

  /** Na triangular, o gabarito está na diagonal — e é o maior dela. */
  it('o autovalor da triangular é o maior da diagonal', () => {
    const triangulares = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 60).filter((e) => e.id.startsWith('auto-triangular')),
    );

    expect(triangulares.length).toBeGreaterThan(20);

    for (const exercicio of triangulares) {
      const numeros = matrizDoEnunciado(exercicio.enunciadoTex!);
      const diagonal = [numeros[0]!, numeros[4]!, numeros[8]!];

      expect(exercicio.gabarito, exercicio.enunciadoTex).toBe(Math.max(...diagonal));
    }
  });

  it('diagnostica o traço dado como produto', () => {
    const exercicio = NIVEIS.flatMap((nivel) => amostra(nivel, 60)).find((e) =>
      e.armadilhas.some((a) => a.diagnostico.includes('é a SOMA dos autovalores')),
    )!;

    expect(exercicio).toBeDefined();

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('é a SOMA dos autovalores'),
    )!;
    const resultado = corrigir(geradorAutovalores, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('determinante');
  });

  it('diagnostica o outro autovalor', () => {
    const exercicio = NIVEIS.flatMap((nivel) => amostra(nivel, 60)).find((e) =>
      e.armadilhas.some((a) => a.diagnostico.includes('OUTRO autovalor')),
    )!;

    expect(exercicio).toBeDefined();

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('OUTRO autovalor'))!;
    const resultado = corrigir(geradorAutovalores, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('maior');
  });

  it('o enunciado vem nas três línguas, com dica', () => {
    for (const exercicio of NIVEIS.flatMap((nivel) => amostra(nivel, 60))) {
      expect(exercicio.traducoes?.fr?.enunciado, exercicio.enunciado).toBeTruthy();
      expect(exercicio.traducoes?.en?.enunciado, exercicio.enunciado).toBeTruthy();
      expect(exercicio.traducoes?.fr?.dica, exercicio.enunciado).toBeTruthy();
      expect(exercicio.dica, exercicio.enunciado).toBeTruthy();
    }
  });

  it('a matriz aparece sempre no enunciado', () => {
    for (const exercicio of NIVEIS.flatMap((nivel) => amostra(nivel, 60))) {
      expect(exercicio.enunciadoTex, exercicio.enunciado).toContain('pmatrix');
    }
  });

  it('as cinco perguntas aparecem', () => {
    const tipos = new Set(
      NIVEIS.flatMap((nivel) => amostra(nivel, 60)).map((e) => e.id.split('-')[1]),
    );

    expect(tipos).toEqual(new Set(['soma', 'produto', 'maior', 'direcao', 'triangular']));
  });
});
