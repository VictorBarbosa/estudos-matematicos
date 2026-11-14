import { lerFormula } from '@core/math/quimica/formula/formula';
import { Resolucao } from '@core/math/tipos/tipos';

/**
 * Número de oxidação: a carga que o átomo teria se a ligação fosse iônica.
 *
 * O nox é uma ficção útil. Numa ligação covalente nenhum átomo fica com a
 * carga inteira, e ainda assim contá-la como se ficasse permite fechar a conta
 * de um composto e saber quem oxidou e quem reduziu. A regra que faz a conta
 * fechar é uma só: a soma dos nox de um composto neutro é ZERO.
 *
 * É por isso que alguns elementos servem de âncora. O oxigênio é quase sempre
 * −2 e o flúor é sempre −1, e com uma âncora dessas o nox do outro elemento
 * sai por subtração. Os «quase» não são descuido: no peróxido o oxigênio é −1,
 * e por isso {@link EXCECOES_DE_OXIGENIO} existe — um motor que respondesse −2
 * para H₂O₂ daria uma resposta errada com toda a confiança.
 */

/** Elementos de nox previsível em composto binário, e o valor dele. */
export const CARGAS_ANCORA: Readonly<Record<string, number>> = {
  F: -1,
  Cl: -1,
  Br: -1,
  I: -1,
  O: -2,
  S: -2,
  N: -3,
};

/**
 * Compostos em que o oxigênio não vale −2.
 *
 * Nos peróxidos ele é −1 e nos superóxidos, −½. São poucos e conhecidos, e
 * listá-los é mais honesto que fingir que a regra não tem exceção.
 */
export const EXCECOES_DE_OXIGENIO: readonly string[] = ['H2O2', 'Na2O2', 'BaO2', 'K2O2', 'OF2'];

/**
 * O nox de um elemento num composto binário neutro.
 *
 * Devolve `undefined` quando a conta não tem âncora — dois elementos sem carga
 * previsível, ou um composto da lista de exceções. Nesses casos a resposta
 * exige mais do que a regra da soma zero, e inventá-la seria pior que recusar.
 */
export function noxDoElemento(formula: string, simbolo: string): number | undefined {
  if (EXCECOES_DE_OXIGENIO.includes(formula)) {
    return undefined;
  }

  const composicao = lerFormula(formula);

  if (composicao === undefined || composicao.size !== 2) {
    return undefined;
  }

  const quantidade = composicao.get(simbolo);
  const outros = [...composicao].filter(([atual]) => atual !== simbolo);

  if (quantidade === undefined || outros.length !== 1) {
    return undefined;
  }

  const [ancora, quantosDaAncora] = outros[0]!;
  const cargaDaAncora = CARGAS_ANCORA[ancora];

  if (cargaDaAncora === undefined) {
    return undefined;
  }

  // Soma zero: quantidade × nox + quantosDaAncora × cargaDaAncora = 0.
  const nox = (-quantosDaAncora * cargaDaAncora) / quantidade;

  return Number.isInteger(nox) ? nox : undefined;
}

export function noxComPassos(
  formula: string,
  simbolo: string,
  formulaTex: string,
): Resolucao<number> | undefined {
  const resultado = noxDoElemento(formula, simbolo);
  const composicao = lerFormula(formula);

  if (resultado === undefined || composicao === undefined) {
    return undefined;
  }

  const quantidade = composicao.get(simbolo)!;
  const [ancora, quantosDaAncora] = [...composicao].find(([atual]) => atual !== simbolo)!;
  const cargaDaAncora = CARGAS_ANCORA[ancora]!;

  return {
    resultado,
    passos: [
      {
        descricao: `O ${ancora} é a âncora: em composto binário o nox dele é conhecido.`,
        tex: `\\text{${ancora}}: ${cargaDaAncora}`,
        nota:
          'O flúor é sempre −1 e o oxigênio é −2 fora dos peróxidos. É a partir de um valor ' +
          'sabido que o outro sai.',
      },
      {
        descricao: 'O composto é neutro: a soma dos nox, contando os índices, é zero.',
        tex: `${quantidade} \\cdot x + ${quantosDaAncora} \\cdot (${cargaDaAncora}) = 0`,
        nota: 'Cada índice multiplica o nox do seu elemento, porque são tantos átomos.',
      },
      {
        descricao: 'Isolando.',
        tex:
          `x = \\frac{${-quantosDaAncora * cargaDaAncora}}{${quantidade}} = ` +
          `${resultado > 0 ? '+' : ''}${resultado}`,
        nota: `Em ${formulaTex}, o nox é ${resultado > 0 ? '+' : ''}${resultado}.`,
      },
    ],
  };
}
