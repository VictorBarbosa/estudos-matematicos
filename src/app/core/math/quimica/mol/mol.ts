import { Passo, Resolucao } from '@core/math/tipos/tipos';

/**
 * O mol: a ponte entre a massa que se pesa e a quantidade que reage.
 *
 * Uma reação acontece **entre partículas**, numa proporção de contagem — dois
 * hidrogênios para um oxigênio. Mas ninguém conta átomos: pesa-se. O mol é o
 * que traduz uma coisa na outra, e é por isso que ele é o conceito central da
 * química, e não um detalhe de unidade.
 *
 * O número de Avogadro é grande porque a unidade de massa é pequena: um mol é
 * a quantidade de partículas cuja massa, em gramas, dá o mesmo número que a
 * massa de uma partícula em unidades atômicas. É esse acordo que faz a massa
 * molar sair pronta da tabela periódica.
 */
export const AVOGADRO = 6.02214076e23;

/** Quantos mols há numa massa, dada a massa molar. */
export function molsDeMassa(massa: number, massaMolar: number): number {
  return massa / massaMolar;
}

export function molsDeMassaComPassos(
  massa: number,
  massaMolar: number,
  substancia: string,
): Resolucao<number> {
  const resultado = molsDeMassa(massa, massaMolar);

  return {
    resultado,
    passos: [
      {
        descricao: `A massa molar diz quanto pesa um mol de ${substancia}.`,
        tex: `M = ${massaMolar}\\;\\text{g/mol}`,
        nota: 'Ela sai da soma das massas atômicas da fórmula, lidas na tabela periódica.',
      },
      {
        descricao: 'Quantos mols cabem na massa dada é uma divisão.',
        tex: `n = \\frac{m}{M} = \\frac{${massa}}{${massaMolar}}`,
      },
      {
        descricao: 'Dividindo.',
        tex: `n = ${Number(resultado.toFixed(4))}\\;\\text{mol}`,
      },
    ],
  };
}

/** A massa de uma quantidade de mols. */
export function massaDeMols(mols: number, massaMolar: number): number {
  return mols * massaMolar;
}

export function massaDeMolsComPassos(
  mols: number,
  massaMolar: number,
  substancia: string,
): Resolucao<number> {
  const resultado = massaDeMols(mols, massaMolar);

  return {
    resultado,
    passos: [
      {
        descricao: `Um mol de ${substancia} pesa a massa molar.`,
        tex: `M = ${massaMolar}\\;\\text{g/mol}`,
      },
      {
        descricao: 'A massa é a quantidade vezes o que cada mol pesa.',
        tex: `m = n \\cdot M = ${mols} \\times ${massaMolar}`,
      },
      {
        descricao: 'Multiplicando.',
        tex: `m = ${Number(resultado.toFixed(4))}\\;\\text{g}`,
      },
    ],
  };
}

/**
 * Quantas partículas há numa quantidade de mols.
 *
 * O resultado sai em notação científica porque não há outra forma honesta de
 * escrevê-lo: 2 mols são 1,2 × 10²⁴ partículas, e escrever isso por extenso
 * seria 25 algarismos que ninguém lê.
 */
export function particulasDeMols(mols: number): number {
  return mols * AVOGADRO;
}

/**
 * A massa molar de uma fórmula, somando as massas atômicas dos elementos.
 *
 * Recebe os pares já lidos da fórmula — `[['H', 2], ['O', 1]]` — porque ler a
 * fórmula escrita é outro problema, de texto, e vai ser resolvido no tópico de
 * nomenclatura. Aqui a conta é a soma ponderada pelos índices.
 */
export interface ParteDaFormula {
  readonly simbolo: string;
  readonly massaAtomica: number;
  readonly quantidade: number;
}

export function massaMolar(partes: readonly ParteDaFormula[]): number {
  return partes.reduce((total, parte) => total + parte.massaAtomica * parte.quantidade, 0);
}

export function massaMolarComPassos(
  partes: readonly ParteDaFormula[],
  formula: string,
): Resolucao<number> {
  const resultado = massaMolar(partes);

  const parcelas = partes
    .map((p) =>
      p.quantidade === 1 ? `${p.massaAtomica}` : `${p.quantidade} \\times ${p.massaAtomica}`,
    )
    .join(' + ');

  const passos: Passo[] = [
    {
      descricao: `Cada elemento de ${formula} entra com a sua massa atômica, vezes o índice.`,
      tex: partes
        .map((p) => `${p.simbolo}: ${p.quantidade} \\times ${p.massaAtomica}`)
        .join(' \\qquad '),
      nota: 'O índice conta átomos na fórmula, e por isso multiplica a massa.',
    },
    {
      descricao: 'Somando as parcelas.',
      tex: `M = ${parcelas} = ${Number(resultado.toFixed(4))}`,
    },
    {
      descricao: 'A massa molar sai em gramas por mol.',
      tex: `M = ${Number(resultado.toFixed(4))}\\;\\text{g/mol}`,
      nota: 'O mesmo número vale como massa de uma molécula em unidades atômicas.',
    },
  ];

  return { resultado, passos };
}
