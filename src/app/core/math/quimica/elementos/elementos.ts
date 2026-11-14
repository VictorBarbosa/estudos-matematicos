/**
 * Os elementos que este site usa, com símbolo e massa atômica.
 *
 * Não é a tabela periódica inteira: é o repertório que aparece nos exercícios
 * de química do primeiro ano — os que formam compostos comuns e os que a
 * estequiometria da escola cobra. Pôr os 118 só encheria o pacote de dados que
 * nenhum tópico pede.
 *
 * As massas vêm arredondadas como a tabela da prova as dá, com duas casas.
 * Usar mais casas não melhoraria nada: o aluno tem a tabela arredondada na
 * mão, e cobrar um gabarito mais preciso que o dado dele seria cobrar o
 * impossível.
 *
 * A ORDEM aqui importa para a leitura de fórmulas: `canonizarFormula` procura
 * o símbolo mais longo primeiro, senão `Cl` seria lido como `C` seguido de
 * `l`, e `Na` como `N` seguido de `a`.
 */
export interface Elemento {
  readonly simbolo: string;
  readonly nome: string;
  readonly massaAtomica: number;
}

export const ELEMENTOS: readonly Elemento[] = [
  { simbolo: 'H', nome: 'hidrogênio', massaAtomica: 1.01 },
  { simbolo: 'He', nome: 'hélio', massaAtomica: 4.0 },
  { simbolo: 'Li', nome: 'lítio', massaAtomica: 6.94 },
  { simbolo: 'Be', nome: 'berílio', massaAtomica: 9.01 },
  { simbolo: 'B', nome: 'boro', massaAtomica: 10.81 },
  { simbolo: 'C', nome: 'carbono', massaAtomica: 12.01 },
  { simbolo: 'N', nome: 'nitrogênio', massaAtomica: 14.01 },
  { simbolo: 'O', nome: 'oxigênio', massaAtomica: 16.0 },
  { simbolo: 'F', nome: 'flúor', massaAtomica: 19.0 },
  { simbolo: 'Ne', nome: 'neônio', massaAtomica: 20.18 },
  { simbolo: 'Na', nome: 'sódio', massaAtomica: 22.99 },
  { simbolo: 'Mg', nome: 'magnésio', massaAtomica: 24.31 },
  { simbolo: 'Al', nome: 'alumínio', massaAtomica: 26.98 },
  { simbolo: 'Si', nome: 'silício', massaAtomica: 28.09 },
  { simbolo: 'P', nome: 'fósforo', massaAtomica: 30.97 },
  { simbolo: 'S', nome: 'enxofre', massaAtomica: 32.06 },
  { simbolo: 'Cl', nome: 'cloro', massaAtomica: 35.45 },
  { simbolo: 'Ar', nome: 'argônio', massaAtomica: 39.95 },
  { simbolo: 'K', nome: 'potássio', massaAtomica: 39.1 },
  { simbolo: 'Ca', nome: 'cálcio', massaAtomica: 40.08 },
  { simbolo: 'Ti', nome: 'titânio', massaAtomica: 47.87 },
  { simbolo: 'Cr', nome: 'cromo', massaAtomica: 52.0 },
  { simbolo: 'Mn', nome: 'manganês', massaAtomica: 54.94 },
  { simbolo: 'Fe', nome: 'ferro', massaAtomica: 55.85 },
  { simbolo: 'Co', nome: 'cobalto', massaAtomica: 58.93 },
  { simbolo: 'Ni', nome: 'níquel', massaAtomica: 58.69 },
  { simbolo: 'Cu', nome: 'cobre', massaAtomica: 63.55 },
  { simbolo: 'Zn', nome: 'zinco', massaAtomica: 65.38 },
  { simbolo: 'Br', nome: 'bromo', massaAtomica: 79.9 },
  { simbolo: 'Ag', nome: 'prata', massaAtomica: 107.87 },
  { simbolo: 'Sn', nome: 'estanho', massaAtomica: 118.71 },
  { simbolo: 'I', nome: 'iodo', massaAtomica: 126.9 },
  { simbolo: 'Ba', nome: 'bário', massaAtomica: 137.33 },
  { simbolo: 'Pt', nome: 'platina', massaAtomica: 195.08 },
  { simbolo: 'Au', nome: 'ouro', massaAtomica: 196.97 },
  { simbolo: 'Hg', nome: 'mercúrio', massaAtomica: 200.59 },
  { simbolo: 'Pb', nome: 'chumbo', massaAtomica: 207.2 },
];

/** Busca pelo símbolo, respeitando a caixa — `Co` é cobalto, `CO` é um gás. */
export function elementoDe(simbolo: string): Elemento | undefined {
  return ELEMENTOS.find((elemento) => elemento.simbolo === simbolo);
}

/**
 * Os símbolos ordenados do mais longo para o mais curto.
 *
 * É esta ordem que a leitura de fórmulas percorre: procurar `C` antes de `Cl`
 * leria `CaCl₂` como carbono, alumínio e cloro — uma fórmula que não existe,
 * montada a partir de uma que existe.
 */
export const SIMBOLOS_POR_TAMANHO: readonly string[] = [...ELEMENTOS]
  .map((elemento) => elemento.simbolo)
  .sort((a, b) => b.length - a.length || a.localeCompare(b));
