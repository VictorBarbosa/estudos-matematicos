import type { Passo } from '@core/math/tipos/tipos';
import {
  lerFormula,
  massaMolarDaFormula,
  partesDaFormula,
} from '@core/math/quimica/formula/formula';

/**
 * Os passos das perguntas de química do banco.
 *
 * ## Por que aqui e não nas regras declarativas
 *
 * As regras de `regras-*.ts` reconhecem a forma da pergunta por um molde em
 * que `#` é um número e `*` é um trecho SEM números. Uma fórmula química tem
 * números dentro — `CaCO3`, `H2SO4` —, e por isso não cabe em nenhum dos dois
 * marcadores: o `3` do carbonato seria lido como dado do exercício e
 * deslocaria todos os valores seguintes.
 *
 * Aqui o resolvedor recebe o texto inteiro e lê a fórmula com a mesma leitura
 * que o resto do site usa (`lerFormula`), então `Ca(OH)2` e `H₂SO₄` entram do
 * mesmo jeito.
 *
 * ## O 6,02 em vez de 6,022
 *
 * As respostas do banco em «unidades de 10²³» foram calculadas com o número de
 * Avogadro arredondado a 6,02 — é o valor que o livro-texto usa. Recalcular
 * com 6,02214 daria 18,05 onde o arquivo diz 18,04, e o guarda
 * `passos-do-banco.spec.ts` reprovaria a entrada inteira. A constante exata
 * continua em `core/math/quimica/mol`, para as contas que não são de prova.
 */
const AVOGADRO_DO_BANCO = 6.02;

/** Uma resolução: os passos e a resposta recalculada. */
interface Resolucao {
  readonly passos: readonly Passo[];
  readonly valor: string;
}

/**
 * Os nomes que o banco usa no lugar da fórmula.
 *
 * O enunciado diz «quantos mols há em 36 g de água?», e quem estuda precisa
 * fazer exatamente esta tradução antes de qualquer conta: o nome vira fórmula,
 * a fórmula vira massa molar. Por isso o primeiro passo da trilha mostra a
 * fórmula, e não o número dela.
 */
const FORMULA_DO_NOME: Readonly<Record<string, string>> = {
  água: 'H2O',
  agua: 'H2O',
  'gás carbônico': 'CO2',
  'dióxido de carbono': 'CO2',
  'oxigênio molecular': 'O2',
  'gás oxigênio': 'O2',
  'sal de cozinha': 'NaCl',
  'cloreto de sódio': 'NaCl',
  metano: 'CH4',
  glicose: 'C6H12O6',
  'ácido sulfúrico': 'H2SO4',
  'carbonato de cálcio': 'CaCO3',
  calcário: 'CaCO3',
  'hidróxido de sódio': 'NaOH',
  'nitrato de sódio': 'NaNO3',
  'sulfato de cálcio': 'CaSO4',
  'cloreto de potássio': 'KCl',
  amônia: 'NH3',
  'bicarbonato de sódio': 'NaHCO3',
  'ácido fosfórico': 'H3PO4',
  'óxido de ferro III': 'Fe2O3',
  'gás nitrogênio': 'N2',
  'gás hidrogênio': 'H2',
};

/** Duas casas, como as respostas de química do banco. */
const duas = (valor: number): string => valor.toFixed(2);

/**
 * A massa molar do que o texto chamar: fórmula escrita ou nome conhecido.
 *
 * Devolve `undefined` quando não reconhece — e aí a entrada cai nos passos
 * genéricos, que é melhor do que inventar uma massa.
 */
function massaMolarDe(nomeOuFormula: string): number | undefined {
  const limpo = nomeOuFormula.trim().replace(/[.?!,]$/, '');
  const porNome = FORMULA_DO_NOME[limpo.toLowerCase()];

  if (porNome !== undefined) {
    return massaMolarDaFormula(porNome);
  }

  return massaMolarDaFormula(limpo);
}

/** A fórmula escrita, para a trilha mostrar de onde veio a massa molar. */
function formulaDe(nomeOuFormula: string): string {
  const limpo = nomeOuFormula.trim().replace(/[.?!,]$/, '');
  return FORMULA_DO_NOME[limpo.toLowerCase()] ?? limpo;
}

/** Quantos átomos de um elemento a fórmula tem. */
function quantosAtomos(nomeOuFormula: string, simbolo: string): number | undefined {
  return lerFormula(formulaDe(nomeOuFormula))?.get(simbolo);
}


/**
 * A trilha da massa molar: a soma escrita e o total.
 *
 * O primeiro passo mostra de onde o número vem — `2 · 1,01 + 32,07 + 4 · 16,00`
 * —, porque é essa soma que a pergunta cobra. Dar só o total ensinaria a
 * decorar a tabela.
 */
function trilhaDaMassaMolar(nome: string, molar: number): Resolucao | null {
  const partes = partesDaFormula(formulaDe(nome));

  if (partes === undefined) {
    return null;
  }

  const soma = partes
    .map(({ elemento, quantidade }) =>
      quantidade === 1
        ? duas(elemento.massaAtomica)
        : `${quantidade} \\cdot ${duas(elemento.massaAtomica)}`,
    )
    .join(' + ');

  return {
    valor: duas(molar),
    passos: [
      {
        descricao: 'A massa molar é a soma das massas atômicas da fórmula.',
        tex: `M(${formulaDe(nome)}) = ${soma}`,
      },
      {
        descricao: 'Somando as parcelas.',
        tex: `M = ${duas(molar)}\\ \\text{g/mol}`,
      },
    ],
  };
}

function trilhaDeMols(massa: number, nome: string, molar: number): Resolucao {
  const mols = massa / molar;

  return {
    valor: duas(mols),
    passos: [
      {
        descricao: 'A massa molar sai da fórmula: é a soma das massas atômicas.',
        tex: `M(${formulaDe(nome)}) = ${duas(molar)}\\ \\text{g/mol}`,
      },
      {
        descricao: 'Os mols são a massa dividida pela massa molar.',
        tex: `n = \\frac{${massa}}{${duas(molar)}} = ${duas(mols)}\\ \\text{mol}`,
      },
    ],
  };
}

function trilhaDeMassa(mols: number, nome: string, molar: number): Resolucao {
  const massa = mols * molar;

  return {
    valor: duas(massa),
    passos: [
      {
        descricao: 'A massa molar sai da fórmula: é a soma das massas atômicas.',
        tex: `M(${formulaDe(nome)}) = ${duas(molar)}\\ \\text{g/mol}`,
      },
      {
        descricao: 'A massa é a quantidade de mols vezes a massa molar.',
        tex: `m = ${mols} \\cdot ${duas(molar)} = ${duas(massa)}\\ \\text{g}`,
      },
    ],
  };
}

/**
 * Os resolvedores de mol e massa molar.
 *
 * A ordem importa: as formas mais específicas vêm antes. O primeiro que
 * reconhece o texto responde.
 */
export const MOL_E_MASSA_MOLAR: readonly ((texto: string) => Resolucao | null)[] = [
  // «Qual é a massa molar do carbonato de cálcio? A fórmula é CaCO3.»
  (texto) => {
    const achado = /massa molar d[oae]s? .+?\.?\s*A fórmula é ([^.?]+)/i.exec(texto);
    if (achado === null) return null;

    const molar = massaMolarDe(achado[1]!);
    if (molar === undefined) return null;

    return trilhaDaMassaMolar(achado[1]!, molar);
  },

  // «Qual é a massa molar do ácido sulfúrico, H₂SO₄, em g/mol?»
  (texto) => {
    const achado = /massa molar d[oae]s? [^,]+,\s*([^,]+),\s*em g\/mol/i.exec(texto);
    if (achado === null) return null;

    const molar = massaMolarDe(achado[1]!);
    if (molar === undefined) return null;

    return trilhaDaMassaMolar(achado[1]!, molar);
  },

  // «Uma amostra de 100 g de CaCO3 contém quantos átomos de oxigênio?»
  (texto) => {
    const achado =
      /amostra de (\d+(?:[.,]\d+)?) g de (.+?) contém quantos átomos de (oxigênio|hidrogênio|carbono|nitrogênio)/i.exec(
        texto,
      );
    if (achado === null) return null;

    const massa = Number(achado[1]!.replace(',', '.'));
    const nome = achado[2]!;
    const simbolo = { oxigênio: 'O', hidrogênio: 'H', carbono: 'C', nitrogênio: 'N' }[
      achado[3]!.toLowerCase()
    ]!;
    const molar = massaMolarDe(nome);
    const quantos = quantosAtomos(nome, simbolo);

    if (molar === undefined || quantos === undefined) return null;

    const mols = massa / molar;
    const atomos = mols * quantos * AVOGADRO_DO_BANCO;

    return {
      valor: duas(atomos),
      passos: [
        {
          descricao: 'Primeiro a massa vira mols, dividindo pela massa molar.',
          tex: `n = \\frac{${massa}}{${duas(molar)}} = ${duas(mols)}\\ \\text{mol}`,
        },
        {
          descricao: 'Cada mol da substância traz essa quantidade de átomos do elemento.',
          tex: `N = ${duas(mols)} \\cdot ${quantos} \\cdot ${AVOGADRO_DO_BANCO} = ${duas(atomos)}`,
        },
      ],
    };
  },

  // «Uma amostra contém 2 mol de NH3. Quantos átomos de hidrogênio ela tem?»
  (texto) => {
    const achado =
      /amostra contém (\d+(?:[.,]\d+)?) mol de (.+?)\.\s*Quantos átomos de (oxigênio|hidrogênio|carbono|nitrogênio)/i.exec(
        texto,
      );
    if (achado === null) return null;

    const mols = Number(achado[1]!.replace(',', '.'));
    const nome = achado[2]!;
    const simbolo = { oxigênio: 'O', hidrogênio: 'H', carbono: 'C', nitrogênio: 'N' }[
      achado[3]!.toLowerCase()
    ]!;
    const quantos = quantosAtomos(nome, simbolo);

    if (quantos === undefined) return null;

    const atomos = mols * quantos * AVOGADRO_DO_BANCO;

    return {
      valor: duas(atomos),
      passos: [
        {
          descricao: 'A fórmula diz quantos átomos do elemento há em cada molécula.',
          tex: `${formulaDe(nome)} \\Rightarrow ${quantos}\\ \\text{átomos}`,
        },
        {
          descricao: 'Multiplicando pelos mols e pelo número de Avogadro.',
          tex: `N = ${mols} \\cdot ${quantos} \\cdot ${AVOGADRO_DO_BANCO} = ${duas(atomos)}`,
        },
      ],
    };
  },

  // «Quantas moléculas há em 2 mol de uma substância?»
  (texto) => {
    const achado = /Quantas moléculas há em (\d+(?:[.,]\d+)?) mol/i.exec(texto);
    if (achado === null) return null;

    const mols = Number(achado[1]!.replace(',', '.'));
    const moleculas = mols * AVOGADRO_DO_BANCO;

    return {
      valor: duas(moleculas),
      passos: [
        {
          descricao: 'Um mol tem sempre o mesmo número de partículas, seja qual for a substância.',
          tex: `1\\ \\text{mol} = ${AVOGADRO_DO_BANCO} \\times 10^{23}`,
        },
        {
          descricao: 'Multiplicando pela quantidade de mols da amostra.',
          tex: `N = ${mols} \\cdot ${AVOGADRO_DO_BANCO} = ${duas(moleculas)}`,
        },
      ],
    };
  },

  // «Quantos mols há em 36 g de água?» / «… de CaCO3?»
  (texto) => {
    const achado = /Quantos mols há em (\d+(?:[.,]\d+)?) g de (.+?)\?/i.exec(texto);
    if (achado === null) return null;

    const massa = Number(achado[1]!.replace(',', '.'));
    const molar = massaMolarDe(achado[2]!);
    if (molar === undefined) return null;

    return trilhaDeMols(massa, achado[2]!, molar);
  },

  // «Quantos mols de água há numa amostra de 180,2 g?»
  (texto) => {
    const achado = /Quantos mols de (.+?) há numa amostra de (\d+(?:[.,]\d+)?) g/i.exec(texto);
    if (achado === null) return null;

    const molar = massaMolarDe(achado[1]!);
    if (molar === undefined) return null;

    return trilhaDeMols(Number(achado[2]!.replace(',', '.')), achado[1]!, molar);
  },

  // «Um pedaço de calcário puro, carbonato de cálcio, tem 500,45 g. Quantos mols ele contém?»
  (texto) => {
    const achado = /,\s*([^,]+?),\s*tem (\d+(?:[.,]\d+)?) g\.\s*Quantos mols/i.exec(texto);
    if (achado === null) return null;

    const molar = massaMolarDe(achado[1]!);
    if (molar === undefined) return null;

    return trilhaDeMols(Number(achado[2]!.replace(',', '.')), achado[1]!, molar);
  },

  // «Uma amostra tem 0,5 mol de NaOH. Quantas gramas ela pesa?»
  (texto) => {
    const achado = /amostra tem (\d+(?:[.,]\d+)?) mol de (.+?)\.\s*Quantas gramas/i.exec(texto);
    if (achado === null) return null;

    const molar = massaMolarDe(achado[2]!);
    if (molar === undefined) return null;

    return trilhaDeMassa(Number(achado[1]!.replace(',', '.')), achado[2]!, molar);
  },

  // «Qual é a massa, em gramas, de 2 mol de água?»
  (texto) => {
    const achado = /massa, em gramas, de (\d+(?:[.,]\d+)?) mol de (.+?)\?/i.exec(texto);
    if (achado === null) return null;

    const molar = massaMolarDe(achado[2]!);
    if (molar === undefined) return null;

    return trilhaDeMassa(Number(achado[1]!.replace(',', '.')), achado[2]!, molar);
  },
];
