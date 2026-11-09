import { CARREGAR_GERADOR } from '@core/treino/registro-geradores/registro-geradores';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { criarRng } from '@core/treino/rng/rng';

/**
 * Quanta pergunta diferente cada tópico de Geometria sabe fazer.
 *
 * A área tinha tópicos de cinco formas contra vinte e duas de Ângulos, e o
 * treino ficava repetitivo em metade dela. Este teste trava o piso: cair
 * abaixo disto é empobrecer o tópico sem perceber.
 */
const MINIMO_DE_FORMAS: Readonly<Record<string, number>> = {
  'angulos-e-triangulos': 20,
  'semelhanca-e-pitagoras': 9,
  'areas-de-figuras-planas': 9,
  'circulo-e-poligonos': 9,
  'solidos-e-volumes': 10,
};

describe('variedade da geometria', () => {
  it('cada tópico sabe fazer um mínimo de perguntas diferentes', async () => {
    for (const [topicoId, minimo] of Object.entries(MINIMO_DE_FORMAS)) {
      const gerador = await CARREGAR_GERADOR[topicoId]!();
      const formas = new Set<string>();

      for (const nivel of NIVEIS as readonly Nivel[]) {
        const rng = criarRng(5);
        for (let i = 0; i < 200; i++) {
          formas.add(gerador.gerar(nivel, rng).enunciado.replace(/[\d.,]+/g, 'N'));
        }
      }

      expect(`${topicoId}: ${formas.size}`).toBe(`${topicoId}: ${Math.max(formas.size, minimo)}`);
    }
  });

  it('nenhum nível fica com uma pergunta só', async () => {
    const magros: string[] = [];

    for (const topicoId of Object.keys(MINIMO_DE_FORMAS)) {
      const gerador = await CARREGAR_GERADOR[topicoId]!();

      for (const nivel of NIVEIS as readonly Nivel[]) {
        const rng = criarRng(5);
        const formas = new Set<string>();
        for (let i = 0; i < 200; i++) {
          formas.add(gerador.gerar(nivel, rng).enunciado.replace(/[\d.,]+/g, 'N'));
        }
        if (formas.size < 2) magros.push(`${topicoId}/${nivel}`);
      }
    }

    expect(magros).toEqual([]);
  });

  it('o gabarito de toda pergunta nova é aceito como resposta', async () => {
    for (const topicoId of Object.keys(MINIMO_DE_FORMAS)) {
      const gerador = await CARREGAR_GERADOR[topicoId]!();

      for (const nivel of NIVEIS as readonly Nivel[]) {
        const rng = criarRng(21);
        for (let i = 0; i < 60; i++) {
          const exercicio = gerador.gerar(nivel, rng);
          const escrito = gerador.formatar?.(exercicio.gabarito) ?? String(exercicio.gabarito);

          expect(`${topicoId}: ${corrigir(gerador, exercicio, escrito).veredito}`).toBe(
            `${topicoId}: correto`,
          );
        }
      }
    }
  });
});
