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
  /** O número atômico: quantos prótons, e quantos elétrons no átomo neutro. */
  readonly numeroAtomico: number;
  readonly nome: string;
  readonly massaAtomica: number;
}

export const ELEMENTOS: readonly Elemento[] = [
  { simbolo: 'H', numeroAtomico: 1, nome: 'hidrogênio', massaAtomica: 1.01 },
  { simbolo: 'He', numeroAtomico: 2, nome: 'hélio', massaAtomica: 4.0 },
  { simbolo: 'Li', numeroAtomico: 3, nome: 'lítio', massaAtomica: 6.94 },
  { simbolo: 'Be', numeroAtomico: 4, nome: 'berílio', massaAtomica: 9.01 },
  { simbolo: 'B', numeroAtomico: 5, nome: 'boro', massaAtomica: 10.81 },
  { simbolo: 'C', numeroAtomico: 6, nome: 'carbono', massaAtomica: 12.01 },
  { simbolo: 'N', numeroAtomico: 7, nome: 'nitrogênio', massaAtomica: 14.01 },
  { simbolo: 'O', numeroAtomico: 8, nome: 'oxigênio', massaAtomica: 16.0 },
  { simbolo: 'F', numeroAtomico: 9, nome: 'flúor', massaAtomica: 19.0 },
  { simbolo: 'Ne', numeroAtomico: 10, nome: 'neônio', massaAtomica: 20.18 },
  { simbolo: 'Na', numeroAtomico: 11, nome: 'sódio', massaAtomica: 22.99 },
  { simbolo: 'Mg', numeroAtomico: 12, nome: 'magnésio', massaAtomica: 24.31 },
  { simbolo: 'Al', numeroAtomico: 13, nome: 'alumínio', massaAtomica: 26.98 },
  { simbolo: 'Si', numeroAtomico: 14, nome: 'silício', massaAtomica: 28.09 },
  { simbolo: 'P', numeroAtomico: 15, nome: 'fósforo', massaAtomica: 30.97 },
  { simbolo: 'S', numeroAtomico: 16, nome: 'enxofre', massaAtomica: 32.06 },
  { simbolo: 'Cl', numeroAtomico: 17, nome: 'cloro', massaAtomica: 35.45 },
  { simbolo: 'Ar', numeroAtomico: 18, nome: 'argônio', massaAtomica: 39.95 },
  { simbolo: 'K', numeroAtomico: 19, nome: 'potássio', massaAtomica: 39.1 },
  { simbolo: 'Ca', numeroAtomico: 20, nome: 'cálcio', massaAtomica: 40.08 },
  { simbolo: 'Ti', numeroAtomico: 22, nome: 'titânio', massaAtomica: 47.87 },
  { simbolo: 'Cr', numeroAtomico: 24, nome: 'cromo', massaAtomica: 52.0 },
  { simbolo: 'Mn', numeroAtomico: 25, nome: 'manganês', massaAtomica: 54.94 },
  { simbolo: 'Fe', numeroAtomico: 26, nome: 'ferro', massaAtomica: 55.85 },
  { simbolo: 'Co', numeroAtomico: 27, nome: 'cobalto', massaAtomica: 58.93 },
  { simbolo: 'Ni', numeroAtomico: 28, nome: 'níquel', massaAtomica: 58.69 },
  { simbolo: 'Cu', numeroAtomico: 29, nome: 'cobre', massaAtomica: 63.55 },
  { simbolo: 'Zn', numeroAtomico: 30, nome: 'zinco', massaAtomica: 65.38 },
  { simbolo: 'Br', numeroAtomico: 35, nome: 'bromo', massaAtomica: 79.9 },
  { simbolo: 'Ag', numeroAtomico: 47, nome: 'prata', massaAtomica: 107.87 },
  { simbolo: 'Sn', numeroAtomico: 50, nome: 'estanho', massaAtomica: 118.71 },
  { simbolo: 'I', numeroAtomico: 53, nome: 'iodo', massaAtomica: 126.9 },
  { simbolo: 'Ba', numeroAtomico: 56, nome: 'bário', massaAtomica: 137.33 },
  { simbolo: 'Pt', numeroAtomico: 78, nome: 'platina', massaAtomica: 195.08 },
  { simbolo: 'Au', numeroAtomico: 79, nome: 'ouro', massaAtomica: 196.97 },
  { simbolo: 'Hg', numeroAtomico: 80, nome: 'mercúrio', massaAtomica: 200.59 },
  { simbolo: 'Pb', numeroAtomico: 82, nome: 'chumbo', massaAtomica: 207.2 },
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
