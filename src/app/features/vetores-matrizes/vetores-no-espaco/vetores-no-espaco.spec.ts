import {
  anguloEntreVetores3ComPassos,
  modulo3,
  modulo3ComPassos,
  produtoEscalar3,
  produtoVetorial,
  produtoVetorial3ComPassos,
  unitario3ComPassos,
  vetor3ParaTexUnitarios,
  volumeDoParalelepipedoComPassos,
} from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorVetores3 } from '@features/vetores-matrizes/vetores-no-espaco/vetores-no-espaco.gerador';

function amostra(nivel: Nivel, quantidade = 80) {
  const rng = criarRng(1618);
  return Array.from({ length: quantidade }, () => geradorVetores3.gerar(nivel, rng));
}

describe('geradorVetores3', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e aceito como exibido`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciado).toBe(true);

        const exibido = geradorVetores3.formatar(exercicio.gabarito);
        expect(corrigir(geradorVetores3, exercicio, exibido).veredito, exibido).toBe('correto');
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorVetores3.saoEquivalentes(armadilha.resposta, exercicio.gabarito),
            exercicio.enunciado,
          ).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }

  it('o Fácil não traz o produto vetorial nem o misto', () => {
    // Os dois só existem no espaço e pedem o plano bem assentado antes.
    for (const exercicio of amostra('facil', 150)) {
      expect(exercicio.conceitos).not.toContain('vetores3.vetorial');
      expect(exercicio.conceitos).not.toContain('vetores3.misto');
    }
  });

  it('o Difícil cobra os dois produtos e o volume', () => {
    const vistos = new Set(amostra('dificil', 250).map((e) => e.conceitos[0]));

    expect(vistos.has('vetores3.vetorial')).toBe(true);
    expect(vistos.has('vetores3.misto')).toBe(true);
    expect(vistos.has('vetores3.escalar')).toBe(true);
  });

  it('o Fácil só usa componentes positivas', () => {
    for (const exercicio of amostra('facil', 150)) {
      expect(exercicio.enunciadoTex, exercicio.enunciadoTex).not.toContain('-');
    }
  });
});

/**
 * O motor em três dimensões.
 *
 * Dois destes não existem no plano: o produto vetorial, que lá é um número
 * solto, e o produto misto, que responde se três vetores cabem num mesmo
 * plano.
 */
describe('vetores no espaço', () => {
  it('o módulo é Pitágoras duas vezes', () => {
    expect(modulo3({ x: 1, y: 2, z: 2 })).toBe(3);
    expect(modulo3ComPassos({ x: 2, y: 3, z: 6 }).resultado).toBe(7);
  });

  it('o produto escalar devolve um número', () => {
    expect(produtoEscalar3({ x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 })).toBe(32);
  });

  it('perpendiculares têm produto escalar zero', () => {
    expect(produtoEscalar3({ x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 })).toBe(0);
  });

  it('o produto vetorial devolve um vetor perpendicular aos dois', () => {
    const a = { x: 2, y: 1, z: -1 };
    const b = { x: 1, y: 3, z: 2 };
    const cruzado = produtoVetorial(a, b);

    expect(produtoEscalar3(a, cruzado)).toBe(0);
    expect(produtoEscalar3(b, cruzado)).toBe(0);
  });

  it('i × j = k, que é a orientação dos eixos', () => {
    expect(produtoVetorial({ x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 })).toEqual({
      x: 0,
      y: 0,
      z: 1,
    });
  });

  it('trocar a ordem troca o sinal', () => {
    const a = { x: 2, y: -3, z: 1 };
    const b = { x: 4, y: 0, z: 5 };
    const ab = produtoVetorial(a, b);
    const ba = produtoVetorial(b, a);

    expect(ba).toEqual({ x: -ab.x, y: -ab.y, z: -ab.z });
  });

  it('vetores paralelos têm produto vetorial nulo', () => {
    expect(produtoVetorial({ x: 1, y: 2, z: 3 }, { x: 2, y: 4, z: 6 })).toEqual({
      x: 0,
      y: 0,
      z: 0,
    });
  });

  it('a componente y é a que tem a ordem trocada', () => {
    // É o erro de sinal mais comum do assunto, e os passos avisam dele.
    const passos = produtoVetorial3ComPassos({ x: 1, y: 1, z: 1 }, { x: 2, y: 2, z: 2 }).passos;

    expect(passos.some((passo) => passo.nota?.includes('sinal se perde'))).toBe(true);
  });

  it('o unitário tem módulo 1 e aponta para o mesmo lado', () => {
    const { resultado } = unitario3ComPassos({ x: 3, y: 0, z: 4 });

    expect(modulo3(resultado)).toBeCloseTo(1, 9);
    expect(resultado.x).toBeGreaterThan(0);
  });

  it('o ângulo entre eixos é reto', () => {
    expect(
      anguloEntreVetores3ComPassos({ x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }).resultado,
    ).toBeCloseTo(90, 6);
  });

  it('o ângulo de um vetor com ele mesmo é zero', () => {
    expect(
      anguloEntreVetores3ComPassos({ x: 2, y: 3, z: 4 }, { x: 2, y: 3, z: 4 }).resultado,
    ).toBeCloseTo(0, 6);
  });

  it('o volume dos eixos é o produto das arestas', () => {
    expect(
      volumeDoParalelepipedoComPassos(
        { x: 2, y: 0, z: 0 },
        { x: 0, y: 3, z: 0 },
        { x: 0, y: 0, z: 4 },
      ).resultado,
    ).toBe(24);
  });

  it('três vetores no mesmo plano cercam volume zero', () => {
    const volume = volumeDoParalelepipedoComPassos(
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 2, y: 3, z: 0 },
    );

    expect(volume.resultado).toBe(0);
    expect(volume.passos.at(-1)!.nota).toContain('mesmo plano');
  });

  it('o volume nunca é negativo', () => {
    // O produto misto pode dar negativo — o sinal é a orientação da terna.
    expect(
      volumeDoParalelepipedoComPassos(
        { x: 0, y: 0, z: 1 },
        { x: 0, y: 1, z: 0 },
        { x: 1, y: 0, z: 0 },
      ).resultado,
    ).toBe(1);
  });

  it('a escrita com unitários omite o que é zero', () => {
    expect(vetor3ParaTexUnitarios({ x: 3, y: 0, z: -2 })).toBe('3\\vec{i} - 2\\vec{k}');
    expect(vetor3ParaTexUnitarios({ x: 0, y: 1, z: 0 })).toBe('\\vec{j}');
    expect(vetor3ParaTexUnitarios({ x: 0, y: 0, z: 0 })).toBe('\\vec{0}');
  });
});
