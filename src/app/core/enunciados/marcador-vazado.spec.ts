import { todasAsEntradas, vestirTexto } from '@core/enunciados/models/enunciado.model';
import { passosDoBanco } from '@core/enunciados/models/passos-do-banco';

/**
 * Nenhum passo de resolução chega à tela com marcador por preencher.
 *
 * As regras escrevem a conta com `#` no lugar de cada número — `k = # + #` —, e
 * o resolvedor troca os marcadores pelos números do enunciado. Quando a
 * fórmula pede mais marcadores do que o texto tem, os que sobram vão para a
 * tela como `#`, e aí acontece o pior: `\max(0, # - #)` não é LaTeX válido, o
 * KaTeX desiste, e o aluno vê a fórmula CRUA, com as barras invertidas à
 * mostra.
 *
 * O guarda roda o resolvedor em todas as entradas do banco e exige que nenhum
 * passo saia com `#`.
 */

const ENTRADAS = todasAsEntradas().filter((entrada) => entrada['dados-calculo'] !== undefined);

describe('marcador vazado nos passos', () => {
  it('nenhum passo sai com marcador por preencher', () => {
    const quebrados: string[] = [];

    for (const entrada of ENTRADAS) {
      const dados = entrada['dados-calculo']!;
      const texto = vestirTexto(entrada.enunciado.br, dados, 'pt');
      const { total: _fora, ...semTotal } = dados;
      const trilha = passosDoBanco(entrada.topico, semTotal, texto);

      for (const passo of trilha?.passos ?? []) {
        if (passo.tex.includes('#')) {
          // Agrupa pela FORMA da fórmula: os números mudam, o defeito é o
          // mesmo, e o que se conserta é a regra.
          quebrados.push(`${entrada.topico}: ${passo.tex.replace(/-?\d+(?:[.,]\d+)?/g, 'N')}`);
        }
      }
    }

    const contagem = new Map<string, number>();
    for (const forma of quebrados) {
      contagem.set(forma, (contagem.get(forma) ?? 0) + 1);
    }
    const ordenadas = [...contagem].sort((a, b) => b[1] - a[1]);
    console.log(`QUEBRADOS ${quebrados.length} passos em ${ordenadas.length} formas`);
    for (const [forma, quantas] of ordenadas.slice(0, 30)) {
      console.log(`${quantas}\t${forma}`);
    }
    expect(ordenadas.length, `${quebrados.length} passos`).toBe(0);
  });
});
