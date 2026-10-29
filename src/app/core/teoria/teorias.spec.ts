import { TRILHA } from '@core/progressao/progressao.model';
import { criarRng } from '@core/treino/rng';
import { NIVEIS } from '@core/treino/treino.model';
import { TODOS_OS_GERADORES } from '@core/treino/geradores.catalogo';
import {
  CARREGAR_TEORIA_DO_TOPICO,
  TITULO_DO_CONCEITO,
  TOPICO_DO_CONCEITO,
} from './registro-teorias';
import { TODAS_AS_TEORIAS } from './teorias.catalogo';

/**
 * Travas de integridade do conteúdo teórico.
 *
 * Os links "Veja também" e os conceitos citados pelos exercícios são apenas
 * strings. Sem estas travas, errar uma letra num id produz um botão que mostra
 * o id cru e abre um modal vazio — era o caso de 8 dos 483 links.
 */

const CONCEITOS = new Map(
  TODAS_AS_TEORIAS.flatMap(([, teorias]) => teorias.map((teoria) => [teoria.id, teoria] as const)),
);

describe('integridade das teorias', () => {
  it('não há ids de conceito repetidos entre tópicos', () => {
    const vistos = new Map<string, string>();

    for (const [topico, teorias] of TODAS_AS_TEORIAS) {
      for (const teoria of teorias) {
        expect(vistos.get(teoria.id), `${teoria.id} aparece em dois tópicos`).toBeUndefined();
        vistos.set(teoria.id, topico);
      }
    }
  });

  it('todo id citado em "Veja também" existe', () => {
    for (const [topico, teorias] of TODAS_AS_TEORIAS) {
      for (const teoria of teorias) {
        for (const id of teoria.vejaTambem ?? []) {
          expect(CONCEITOS.has(id), `${topico}/${teoria.id} aponta para "${id}", que não existe`)
            .toBe(true);
        }
      }
    }
  });

  it('nenhum conceito se referencia a si mesmo', () => {
    for (const [, teorias] of TODAS_AS_TEORIAS) {
      for (const teoria of teorias) {
        expect(teoria.vejaTambem ?? []).not.toContain(teoria.id);
      }
    }
  });

  it('todo conceito citado por um exercício existe', () => {
    for (const [topico, gerador] of TODOS_OS_GERADORES) {
      for (const nivel of NIVEIS) {
        const rng = criarRng(4242);

        for (let i = 0; i < 120; i++) {
          const exercicio = gerador.gerar(nivel, rng);
          const citados = [
            ...exercicio.conceitos,
            ...exercicio.armadilhas.flatMap((a) => (a.conceito === undefined ? [] : [a.conceito])),
          ];

          for (const id of citados) {
            expect(CONCEITOS.has(id), `${topico} cita o conceito "${id}", que não existe`).toBe(
              true,
            );
          }
        }
      }
    }
  });

  it('nenhum exercício cobra um conceito que a trilha ensina depois', () => {
    // A trilha libera um tópico por vez: um exercício que exige conceito de
    // etapa posterior cobra o que ainda não foi ensinado. Era o caso da
    // Integral definida, cujos exercícios pediam F(b) − F(a) duas etapas antes
    // do Teorema Fundamental.
    const posicao = new Map(TRILHA.map((etapa, indice) => [etapa.topicoId, indice]));
    const adiantados: string[] = [];

    for (const [topico, gerador] of TODOS_OS_GERADORES) {
      const minha = posicao.get(topico);
      if (minha === undefined) {
        continue;
      }

      for (const nivel of NIVEIS) {
        const rng = criarRng(99_991);

        for (let i = 0; i < 80; i++) {
          const exercicio = gerador.gerar(nivel, rng);
          const citados = [
            ...exercicio.conceitos,
            ...exercicio.armadilhas.flatMap((a) => (a.conceito === undefined ? [] : [a.conceito])),
          ];

          for (const id of citados) {
            const dono = TOPICO_DO_CONCEITO[id];
            const dele = dono === undefined ? undefined : posicao.get(dono);

            if (dele !== undefined && dele > minha) {
              adiantados.push(`${topico} (etapa ${minha + 1}) cobra ${id}, de ${dono} (etapa ${dele + 1})`);
            }
          }
        }
      }
    }

    expect([...new Set(adiantados)]).toEqual([]);
  });

  it('o índice gerado cobre exatamente os conceitos existentes', () => {
    const esperados = [...CONCEITOS.keys()].sort();

    expect(Object.keys(TITULO_DO_CONCEITO).sort()).toEqual(esperados);
    expect(Object.keys(TOPICO_DO_CONCEITO).sort()).toEqual(esperados);
  });

  it('o índice gerado traz o título e o tópico certos de cada conceito', () => {
    for (const [topico, teorias] of TODAS_AS_TEORIAS) {
      for (const teoria of teorias) {
        expect(TITULO_DO_CONCEITO[teoria.id], teoria.id).toBe(teoria.titulo);
        expect(TOPICO_DO_CONCEITO[teoria.id], teoria.id).toBe(topico);
      }
    }
  });

  it('todo tópico com teoria tem um carregador sob demanda', () => {
    for (const [topico] of TODAS_AS_TEORIAS) {
      expect(typeof CARREGAR_TEORIA_DO_TOPICO[topico], topico).toBe('function');
    }

    expect(Object.keys(CARREGAR_TEORIA_DO_TOPICO).sort()).toEqual(
      TODAS_AS_TEORIAS.map(([topico]) => topico).sort(),
    );
  });

  it('cada conceito tem conteúdo mínimo', () => {
    for (const [, teorias] of TODAS_AS_TEORIAS) {
      for (const teoria of teorias) {
        expect(teoria.titulo.length, teoria.id).toBeGreaterThan(3);
        expect(teoria.resumo.length, teoria.id).toBeGreaterThan(10);
        expect(teoria.definicao.length, teoria.id).toBeGreaterThan(40);
      }
    }
  });
});
