import katex from 'katex';
import { todasAsEntradas, vestirTexto } from '@core/enunciados/models/enunciado.model';
import { partesDoEnunciado } from '@core/enunciados/models/enunciado-em-partes';

/**
 * Toda fórmula que o enunciado do banco produz é desenhável.
 *
 * O enunciado é escrito como se digita — `e^(−x)`, `(x + 1)/(x − 2)` — e
 * `partesDoEnunciado` converte os trechos de conta em LaTeX. Se a conversão
 * produzir LaTeX inválido, o KaTeX desiste e o aluno vê a expressão CRUA, com
 * as barras invertidas à mostra, no meio da frase.
 *
 * Este guarda renderiza, de verdade, cada fórmula que sai de cada entrada do
 * banco. É o teste que só pode ser feito aqui: o conversor não sabe se o que
 * ele escreveu é LaTeX legal, e o KaTeX sabe.
 */

const ENTRADAS = todasAsEntradas();

describe('fórmulas do banco', () => {
  it('toda fórmula gerada é aceita pelo KaTeX', () => {
    const quebradas: string[] = [];

    for (const entrada of ENTRADAS) {
      const dados = entrada['dados-calculo'];
      if (dados === undefined) {
        continue; // Molde: os números vêm do gerador, e o guarda dele é outro.
      }
      const texto = vestirTexto(entrada.enunciado.br, dados, 'pt');

      for (const parte of partesDoEnunciado(texto)) {
        if (parte.tipo !== 'math') {
          continue;
        }
        try {
          katex.renderToString(parte.tex, { throwOnError: true });
        } catch (erro) {
          quebradas.push(`${entrada.topico}: «${parte.origem}» → ${parte.tex}`);
        }
      }
    }

    expect([...new Set(quebradas)].slice(0, 15), `${quebradas.length} fórmulas`).toEqual([]);
  });

  /**
   * A fórmula desenhada diz a mesma coisa que o texto de origem.
   *
   * O KaTeX aceitar não basta: `e^(sen x)` virava `e^{s x}` — LaTeX válido,
   * conta OUTRA. O seno sumia porque o reconhecedor só conhecia `sen` com
   * parênteses, e sem eles cada letra virava uma variável solta.
   *
   * A conferência é por SÍMBOLOS: os números e as letras da origem têm de
   * aparecer na fórmula, descontados os comandos do LaTeX.
   */
  it('nenhuma fórmula perde números ou letras no caminho', () => {
    const perdidas: string[] = [];

    for (const entrada of ENTRADAS) {
      const dados = entrada['dados-calculo'];
      if (dados === undefined) {
        continue;
      }
      const texto = vestirTexto(entrada.enunciado.br, dados, 'pt');

      for (const parte of partesDoEnunciado(texto)) {
        if (parte.tipo !== 'math') {
          continue;
        }

        // Sem os comandos e SEM espaços: `ax` vira `a x` no LaTeX, que é o
        // produto escrito como se deve, e não uma letra perdida.
        const semComandos = parte.tex.replace(/\\[a-zA-Z]+/g, ' ').replace(/[\s{}]/g, '');
        const naOrigem = [...parte.origem.matchAll(/[A-Za-z\d]+/g)].map((a) => a[0]);
        const faltando = naOrigem.filter((pedaco) => !semComandos.includes(pedaco));

        if (faltando.length > 0) {
          perdidas.push(`«${parte.origem}» → ${parte.tex} (sumiu: ${faltando.join(', ')})`);
        }
      }
    }

    expect([...new Set(perdidas)].slice(0, 15), `${perdidas.length} fórmulas`).toEqual([]);
  });
});
