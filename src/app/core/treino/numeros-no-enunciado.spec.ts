import { TODOS_OS_GERADORES } from '@core/treino/geradores.catalogo/geradores.catalogo';
import { NIVEIS } from '@core/treino/models/treino.model';
import { criarRng } from '@core/treino/rng/rng';

/**
 * O número do enunciado se escreve como em português.
 *
 * `${valor}` num template devolve a forma do JavaScript, de ponto decimal, e o
 * aluno lê «Um círculo tem área 452.39 cm²» — um número que ninguém escreveria
 * à mão aqui, e que ele digita com vírgula no campo de resposta. Foi relatado
 * duas vezes, em tópicos diferentes, antes de virar guarda.
 *
 * A busca é por ponto entre dígitos com **uma ou duas** casas depois. O milhar
 * em português tem exatamente três — «1.000» é correto e não cai aqui.
 *
 * Quem precisa escrever número em frase usa `numeroEmPortugues`, ou
 * `numeroEscrito` quando a frase tem versão em inglês, onde o separador é o
 * ponto.
 */
const PONTO_DECIMAL = /\d\.\d{1,2}(?!\d)/;

/** Amostras por nível. Alto de propósito: o defeito aparece em sorteios raros. */
const AMOSTRAS = 60;

describe('o número do enunciado em português', () => {
  for (const [topico, gerador] of TODOS_OS_GERADORES) {
    it(`${topico}: nenhum ponto decimal à inglesa`, () => {
      const rng = criarRng(515);
      const achados: string[] = [];

      for (const nivel of NIVEIS) {
        for (let i = 0; i < AMOSTRAS; i++) {
          const exercicio = gerador.gerar(nivel, rng);

          if (PONTO_DECIMAL.test(exercicio.enunciado)) {
            achados.push(`[${nivel}] ${exercicio.enunciado}`);
          }

          const dica = exercicio.dica;
          if (dica !== undefined && PONTO_DECIMAL.test(dica)) {
            achados.push(`[${nivel}] dica: ${dica}`);
          }
        }
      }

      expect([...new Set(achados)].slice(0, 3).join('\n'), topico).toBe('');
    });
  }
});
