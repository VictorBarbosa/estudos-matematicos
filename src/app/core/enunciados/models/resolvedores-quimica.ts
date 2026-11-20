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

/* ─────────────────────── gases ideais ─────────────────────── */

/**
 * A constante dos gases como o banco a usou: 0,0821 L·atm/(mol·K).
 *
 * É o valor da tabela de química do ensino médio. Com 0,08206 o volume molar
 * daria 22,41 L onde o arquivo diz 22,43, e a entrada inteira seria recusada.
 */
const R_ATM = 0.0821;

/** Kelvin a partir de graus Celsius, que é como o banco escreve. */
const kelvin = (celsius: number): number => celsius + 273.15;

const num = (texto: string): number => Number(texto.replace(',', '.'));

/** O número decimal como o passo o escreve: vírgula, e não ponto. */
const tex = (valor: number, casas = 2): string => valor.toFixed(casas).replace('.', '{,}');

export const GASES_IDEAIS: readonly ((texto: string) => Resolucao | null)[] = [
  // Charles: mesma pressão, temperaturas em kelvin.
  (texto) => {
    const achado =
      /gás a (\d+(?:[.,]\d+)?) K ocupa (\d+(?:[.,]\d+)?) L\.\s*A pressão constante, qual é o volume a (\d+(?:[.,]\d+)?) K/i.exec(
        texto,
      );
    if (achado === null) return null;

    const [t1, v1, t2] = [num(achado[1]!), num(achado[2]!), num(achado[3]!)];
    const v2 = (v1 * t2) / t1;

    return {
      valor: v2.toFixed(2),
      passos: [
        {
          descricao: 'A pressão não muda, então o volume e a temperatura sobem juntos.',
          tex: `\\frac{V_1}{T_1} = \\frac{V_2}{T_2}`,
        },
        {
          descricao: 'Isolando o volume final.',
          tex: `V_2 = \\frac{${v1} \\cdot ${t2}}{${t1}} = ${tex(v2)}\\ \\text{L}`,
        },
      ],
    };
  },

  // Lei geral: pressão e temperatura mudam ao mesmo tempo.
  (texto) => {
    const achado =
      /gás a (\d+(?:[.,]\d+)?) atm e (\d+(?:[.,]\d+)?) K ocupa (\d+(?:[.,]\d+)?) L\.\s*Levado a (\d+(?:[.,]\d+)?) atm e (\d+(?:[.,]\d+)?) K/i.exec(
        texto,
      );
    if (achado === null) return null;

    const [p1, t1, v1, p2, t2] = achado.slice(1, 6).map((g) => num(g!));
    const v2 = (p1! * v1! * t2!) / (p2! * t1!);

    return {
      valor: v2.toFixed(2),
      passos: [
        {
          descricao: 'A quantidade de gás não muda, então pV/T é constante.',
          tex: `\\frac{p_1V_1}{T_1} = \\frac{p_2V_2}{T_2}`,
        },
        {
          descricao: 'Isolando o volume final.',
          tex: `V_2 = \\frac{${p1} \\cdot ${v1} \\cdot ${t2}}{${p2} \\cdot ${t1}} = ${tex(v2)}\\ \\text{L}`,
        },
      ],
    };
  },

  // Boyle: temperatura constante.
  (texto) => {
    const achado =
      /gás ocupa (\d+(?:[.,]\d+)?) L a (\d+(?:[.,]\d+)?) atm\.\s*A temperatura constante, qual é o volume quando a pressão passa a (\d+(?:[.,]\d+)?) atm/i.exec(
        texto,
      );
    if (achado === null) return null;

    const [v1, p1, p2] = [num(achado[1]!), num(achado[2]!), num(achado[3]!)];
    const v2 = (p1 * v1) / p2;

    return {
      valor: v2.toFixed(2),
      passos: [
        {
          descricao: 'A temperatura não muda, então o produto da pressão pelo volume é constante.',
          tex: `p_1V_1 = p_2V_2`,
        },
        {
          descricao: 'Isolando o volume final.',
          tex: `V_2 = \\frac{${p1} \\cdot ${v1}}{${p2}} = ${tex(v2)}\\ \\text{L}`,
        },
      ],
    };
  },

  // Massa a partir de pV = nRT, com a massa molar dada no enunciado.
  (texto) => {
    const achado =
      /massa molar (\d+(?:[.,]\d+)?) g\/mol\) há em (\d+(?:[.,]\d+)?) L desse gás a (\d+(?:[.,]\d+)?) atm e (-?\d+(?:[.,]\d+)?) °C/i.exec(
        texto,
      );
    if (achado === null) return null;

    const [molar, volume, pressao, celsius] = achado.slice(1, 5).map((g) => num(g!));
    const t = kelvin(celsius!);
    const mols = (pressao! * volume!) / (R_ATM * t);
    const massa = mols * molar!;

    return {
      valor: massa.toFixed(2),
      passos: [
        {
          descricao: 'A temperatura entra sempre em kelvin.',
          tex: `T = ${celsius} + 273{,}15 = ${tex(t)}\\ \\text{K}`,
        },
        {
          descricao: 'Os mols saem da equação dos gases.',
          tex: `n = \\frac{${pressao} \\cdot ${volume}}{0{,}0821 \\cdot ${tex(t)}} = ${tex(mols, 4)}\\ \\text{mol}`,
        },
        {
          descricao: 'A massa é a quantidade de mols vezes a massa molar.',
          tex: `m = ${tex(mols, 4)} \\cdot ${molar} = ${tex(massa)}\\ \\text{g}`,
        },
      ],
    };
  },

  // Pressão parcial pela fração da quantidade total.
  (texto) => {
    const achado =
      /mistura contém (\d+(?:[.,]\d+)?) mol de gás num volume de (\d+(?:[.,]\d+)?) L a (-?\d+(?:[.,]\d+)?) °C\.\s*Qual é a pressão PARCIAL de um gás que corresponde a (\d+(?:[.,]\d+)?) da quantidade total/i.exec(
        texto,
      );
    if (achado === null) return null;

    const [mols, volume, celsius, fracao] = achado.slice(1, 5).map((g) => num(g!));
    const t = kelvin(celsius!);
    const total = (mols! * R_ATM * t) / volume!;
    const parcial = total * fracao!;

    return {
      valor: parcial.toFixed(2),
      passos: [
        {
          descricao: 'A pressão total sai da equação dos gases, com a temperatura em kelvin.',
          tex: `p = \\frac{${mols} \\cdot 0{,}0821 \\cdot ${tex(t)}}{${volume}} = ${tex(total)}\\ \\text{atm}`,
        },
        {
          descricao: 'A pressão parcial é a fração da quantidade total vezes a pressão total.',
          tex: `p_{parcial} = ${fracao} \\cdot ${tex(total)} = ${tex(parcial)}\\ \\text{atm}`,
        },
      ],
    };
  },

  // Pressão parcial pela proporção entre dois gases.
  (texto) => {
    const achado =
      /contém (\d+(?:[.,]\d+)?) mol de N₂ e (\d+(?:[.,]\d+)?) mol de O₂, com pressão total de (\d+(?:[.,]\d+)?) atm/i.exec(
        texto,
      );
    if (achado === null) return null;

    const [n1, n2, total] = [num(achado[1]!), num(achado[2]!), num(achado[3]!)];
    const parcial = (total * n2) / (n1 + n2);

    return {
      valor: parcial.toFixed(2),
      passos: [
        {
          descricao: 'A fração em quantidade de matéria é a parte sobre o todo.',
          tex: `x = \\frac{${n2}}{${n1} + ${n2}} = ${tex(n2 / (n1 + n2), 4)}`,
        },
        {
          descricao: 'A pressão parcial é essa fração da pressão total.',
          tex: `p = ${tex(n2 / (n1 + n2), 4)} \\cdot ${total} = ${tex(parcial)}\\ \\text{atm}`,
        },
      ],
    };
  },

  // Mols a partir de pV = nRT.
  (texto) => {
    const achado =
      /Quantos mols de gás há num recipiente de (\d+(?:[.,]\d+)?) L, a (\d+(?:[.,]\d+)?) atm e (-?\d+(?:[.,]\d+)?) °C/i.exec(
        texto,
      );
    if (achado === null) return null;

    const [volume, pressao, celsius] = [num(achado[1]!), num(achado[2]!), num(achado[3]!)];
    const t = kelvin(celsius);
    const mols = (pressao * volume) / (R_ATM * t);

    return {
      valor: mols.toFixed(2),
      passos: [
        {
          descricao: 'A temperatura entra sempre em kelvin.',
          tex: `T = ${celsius} + 273{,}15 = ${tex(t)}\\ \\text{K}`,
        },
        {
          descricao: 'Isolamos a grandeza que falta: a quantidade de matéria.',
          tex: `n = \\frac{${pressao} \\cdot ${volume}}{0{,}0821 \\cdot ${tex(t)}} = ${tex(mols)}\\ \\text{mol}`,
        },
      ],
    };
  },

  // Volume a partir de pV = nRT.
  (texto) => {
    const achado =
      /volume ocupado por (\d+(?:[.,]\d+)?) mol de gás ideal a (\d+(?:[.,]\d+)?) atm e (-?\d+(?:[.,]\d+)?) °C/i.exec(
        texto,
      );
    if (achado === null) return null;

    const [mols, pressao, celsius] = [num(achado[1]!), num(achado[2]!), num(achado[3]!)];
    const t = kelvin(celsius);
    const volume = (mols * R_ATM * t) / pressao;

    return {
      valor: volume.toFixed(2),
      passos: [
        {
          descricao: 'A temperatura entra sempre em kelvin.',
          tex: `T = ${celsius} + 273{,}15 = ${tex(t)}\\ \\text{K}`,
        },
        {
          descricao: 'Isolamos a grandeza que falta: volume.',
          tex: `V = \\frac{${mols} \\cdot 0{,}0821 \\cdot ${tex(t)}}{${pressao}} = ${tex(volume)}\\ \\text{L}`,
        },
      ],
    };
  },

  // Pressão a partir de pV = nRT, nas duas redações do banco.
  (texto) => {
    const achado =
      /pressão(?: exercida por|, em atm, de) (\d+(?:[.,]\d+)?) mol de gás (?:ideal em|num recipiente de) (\d+(?:[.,]\d+)?) L a (-?\d+(?:[.,]\d+)?) °C/i.exec(
        texto,
      );
    if (achado === null) return null;

    const [mols, volume, celsius] = [num(achado[1]!), num(achado[2]!), num(achado[3]!)];
    const t = kelvin(celsius);
    const pressao = (mols * R_ATM * t) / volume;

    return {
      valor: pressao.toFixed(2),
      passos: [
        {
          descricao: 'A temperatura entra sempre em kelvin.',
          tex: `T = ${celsius} + 273{,}15 = ${tex(t)}\\ \\text{K}`,
        },
        {
          descricao: 'Isolamos a grandeza que falta: pressão.',
          tex: `p = \\frac{${mols} \\cdot 0{,}0821 \\cdot ${tex(t)}}{${volume}} = ${tex(pressao)}\\ \\text{atm}`,
        },
      ],
    };
  },

  // O balão aquecido: Charles com as temperaturas em graus celsius.
  (texto) => {
    const achado =
      /balão ocupa (\d+(?:[.,]\d+)?) L a (-?\d+(?:[.,]\d+)?) °C\.\s*Aquecido até (-?\d+(?:[.,]\d+)?) °C/i.exec(
        texto,
      );
    if (achado === null) return null;

    const [v1, c1, c2] = [num(achado[1]!), num(achado[2]!), num(achado[3]!)];
    const v2 = (v1 * kelvin(c2)) / kelvin(c1);

    return {
      valor: v2.toFixed(2),
      passos: [
        {
          descricao: 'A temperatura entra sempre em kelvin.',
          tex: `${c1}\\ °C = ${tex(kelvin(c1))}\\ \\text{K},\\quad ${c2}\\ °C = ${tex(kelvin(c2))}\\ \\text{K}`,
        },
        {
          descricao: 'A pressão não muda, então o volume e a temperatura sobem juntos.',
          tex: `V_2 = \\frac{${v1} \\cdot ${tex(kelvin(c2))}}{${tex(kelvin(c1))}} = ${tex(v2)}\\ \\text{L}`,
        },
      ],
    };
  },
];

/* ─────────────────────── soluções e concentração ─────────────────────── */

/** O volume em litros a partir dos mililitros do enunciado. */
const litros = (mililitros: number): number => mililitros / 1000;

export const SOLUCOES: readonly ((texto: string) => Resolucao | null)[] = [
  // «Diluem-se 50 mL de uma solução 2 mol/L até o volume final de 200 mL.»
  // «A 50 mL de solução a 2 mol/L acrescenta-se água até completar 200 mL.»
  (texto) => {
    const achado =
      /(?:Diluem-se (\d+(?:[.,]\d+)?) mL de uma solução (\d+(?:[.,]\d+)?) mol\/L até o volume final de (\d+(?:[.,]\d+)?) mL|A (\d+(?:[.,]\d+)?) mL de solução a (\d+(?:[.,]\d+)?) mol\/L acrescenta-se água até completar (\d+(?:[.,]\d+)?) mL)/i.exec(
        texto,
      );
    if (achado === null) return null;

    const [v1, c1, v2] = [
      num(achado[1] ?? achado[4]!),
      num(achado[2] ?? achado[5]!),
      num(achado[3] ?? achado[6]!),
    ];
    const c2 = (c1 * v1) / v2;

    return {
      valor: c2.toFixed(2),
      passos: [
        {
          descricao: 'Diluir acrescenta água, e a quantidade de soluto não muda.',
          tex: `C_1V_1 = C_2V_2`,
        },
        {
          descricao: 'Isolando a concentração final.',
          tex: `C_2 = \\frac{${c1} \\cdot ${v1}}{${v2}} = ${tex(c2)}\\ \\text{mol/L}`,
        },
      ],
    };
  },

  // «Misturam-se 100 mL de solução 1 mol/L com 200 mL de solução 0,5 mol/L.»
  (texto) => {
    const achado =
      /Misturam-se (\d+(?:[.,]\d+)?) mL de solução a? ?(\d+(?:[.,]\d+)?) mol\/L com (\d+(?:[.,]\d+)?) mL de solução a? ?(\d+(?:[.,]\d+)?) mol\/L/i.exec(
        texto,
      );
    if (achado === null) return null;

    const [v1, c1, v2, c2] = achado.slice(1, 5).map((g) => num(g!));
    const final = (c1! * v1! + c2! * v2!) / (v1! + v2!);

    return {
      valor: final.toFixed(2),
      passos: [
        {
          descricao: 'O soluto das duas soluções se junta, e os volumes também.',
          tex: `n = ${c1} \\cdot ${tex(litros(v1!), 3)} + ${c2} \\cdot ${tex(litros(v2!), 3)} = ${tex(c1! * litros(v1!) + c2! * litros(v2!), 4)}\\ \\text{mol}`,
        },
        {
          descricao: 'A concentração final é o soluto total dividido pelo volume total.',
          tex: `C = \\frac{${tex(c1! * litros(v1!) + c2! * litros(v2!), 4)}}{${tex(litros(v1! + v2!), 3)}} = ${tex(final)}\\ \\text{mol/L}`,
        },
      ],
    };
  },

  // «Uma solução tem 0,5 mol/L e densidade 1,02 g/mL. A massa molar é 58,44 g/mol.»
  (texto) => {
    const achado =
      /concentração de (\d+(?:[.,]\d+)?) mol\/L e densidade de (\d+(?:[.,]\d+)?) g\/mL\.\s*A massa molar do soluto é (\d+(?:[.,]\d+)?) g\/mol/i.exec(
        texto,
      );
    if (achado === null) return null;

    const [concentracao, densidade, molar] = achado.slice(1, 4).map((g) => num(g!));
    const massaDeSoluto = concentracao! * molar!;
    const massaDaSolucao = densidade! * 1000;
    const porcento = (massaDeSoluto / massaDaSolucao) * 100;

    return {
      valor: porcento.toFixed(2),
      passos: [
        {
          descricao: 'Num litro de solução há essa massa de soluto.',
          tex: `m = ${concentracao} \\cdot ${molar} = ${tex(massaDeSoluto)}\\ \\text{g}`,
        },
        {
          descricao: 'A densidade dá a massa do litro inteiro de solução.',
          tex: `m_{sol} = ${densidade} \\cdot 1000 = ${tex(massaDaSolucao)}\\ \\text{g}`,
        },
        {
          descricao: 'A porcentagem em massa é a razão entre as duas, vezes cem.',
          tex: `\\frac{${tex(massaDeSoluto)}}{${tex(massaDaSolucao)}} \\cdot 100 = ${tex(porcento)}\\%`,
        },
      ],
    };
  },

  // «Uma solução tem 2 mol/L de glicose. Quantos mililitros contêm 0,5 mol?»
  (texto) => {
    const achado =
      /solução tem (\d+(?:[.,]\d+)?) mol\/L de .+?\.\s*Quantos mililitros dela contêm (\d+(?:[.,]\d+)?) mol/i.exec(
        texto,
      );
    if (achado === null) return null;

    const [concentracao, mols] = [num(achado[1]!), num(achado[2]!)];
    const mililitros = (mols / concentracao) * 1000;

    return {
      valor: mililitros.toFixed(2),
      passos: [
        {
          descricao: 'O volume em litros é a quantidade de soluto dividida pela concentração.',
          tex: `V = \\frac{${mols}}{${concentracao}} = ${tex(mols / concentracao, 4)}\\ \\text{L}`,
        },
        {
          descricao: 'A resposta é pedida em mililitros: multiplicamos por mil.',
          tex: `V = ${tex(mililitros)}\\ \\text{mL}`,
        },
      ],
    };
  },

  // «Que massa de X, massa molar 100,09 g/mol, é preciso para preparar 200 mL a 0,5 mol/L?»
  // «Que massa de X, de massa molar 40 g/mol, há em 100 mL de solução a 1,5 mol/L?»
  (texto) => {
    const achado =
      /Que massa de .+?,\s*(?:de )?massa molar (\d+(?:[.,]\d+)?) g\/mol,\s*(?:é preciso para preparar|há em) (\d+(?:[.,]\d+)?) mL de solução a (\d+(?:[.,]\d+)?) mol\/L/i.exec(
        texto,
      );
    if (achado === null) return null;

    const [molar, volume, concentracao] = achado.slice(1, 4).map((g) => num(g!));
    const mols = concentracao! * litros(volume!);
    const massa = mols * molar!;

    return {
      valor: massa.toFixed(2),
      passos: [
        {
          descricao: 'A concentração vezes o volume em litros dá a quantidade de soluto.',
          tex: `n = ${concentracao} \\cdot ${tex(litros(volume!), 3)} = ${tex(mols, 4)}\\ \\text{mol}`,
        },
        {
          descricao: 'A massa é a quantidade de mols vezes a massa molar.',
          tex: `m = ${tex(mols, 4)} \\cdot ${molar} = ${tex(massa)}\\ \\text{g}`,
        },
      ],
    };
  },

  // «Que massa de sal de cozinha, NaCl, há em 250 mL de solução a 0,4 mol/L?»
  (texto) => {
    const achado =
      /Que massa de (.+?),\s*([A-Za-z0-9₀-₉()]+),\s*há em (\d+(?:[.,]\d+)?) mL de solução a (\d+(?:[.,]\d+)?) mol\/L/i.exec(
        texto,
      );
    if (achado === null) return null;

    const molar = massaMolarDe(achado[2]!);
    if (molar === undefined) return null;

    const [volume, concentracao] = [num(achado[3]!), num(achado[4]!)];
    const mols = concentracao * litros(volume);
    const massa = mols * molar;

    return {
      valor: massa.toFixed(2),
      passos: [
        {
          descricao: 'A massa molar sai da fórmula: é a soma das massas atômicas.',
          tex: `M(${formulaDe(achado[2]!)}) = ${tex(molar)}\\ \\text{g/mol}`,
        },
        {
          descricao: 'A concentração vezes o volume em litros dá a quantidade de soluto.',
          tex: `n = ${concentracao} \\cdot ${tex(litros(volume), 3)} = ${tex(mols, 4)}\\ \\text{mol}`,
        },
        {
          descricao: 'A massa é a quantidade de mols vezes a massa molar.',
          tex: `m = ${tex(mols, 4)} \\cdot ${tex(molar)} = ${tex(massa)}\\ \\text{g}`,
        },
      ],
    };
  },

  // «Dissolvem-se 20 g de X, de massa molar 40 g/mol, em água até completar 500 mL.»
  (texto) => {
    const achado =
      /Dissolvem-se (\d+(?:[.,]\d+)?) g de .+?,\s*de massa molar (\d+(?:[.,]\d+)?) g\/mol, em água até completar (\d+(?:[.,]\d+)?) mL/i.exec(
        texto,
      );
    if (achado === null) return null;

    const [massa, molar, volume] = achado.slice(1, 4).map((g) => num(g!));
    const mols = massa! / molar!;
    const concentracao = mols / litros(volume!);

    return {
      valor: concentracao.toFixed(2),
      passos: [
        {
          descricao: 'Primeiro a massa vira mols, dividindo pela massa molar.',
          tex: `n = \\frac{${massa}}{${molar}} = ${tex(mols, 4)}\\ \\text{mol}`,
        },
        {
          descricao: 'A concentração é a quantidade de soluto dividida pelo volume em litros.',
          tex: `C = \\frac{${tex(mols, 4)}}{${tex(litros(volume!), 3)}} = ${tex(concentracao)}\\ \\text{mol/L}`,
        },
      ],
    };
  },

  // «Dissolvem-se 11,7 g de NaCl em água até completar 500 mL de solução.»
  (texto) => {
    const achado =
      /Dissolvem-se (\d+(?:[.,]\d+)?) g de ([A-Za-z0-9₀-₉()]+) em água até completar (\d+(?:[.,]\d+)?) mL/i.exec(
        texto,
      );
    if (achado === null) return null;

    const molar = massaMolarDe(achado[2]!);
    if (molar === undefined) return null;

    const [massa, volume] = [num(achado[1]!), num(achado[3]!)];
    const mols = massa / molar;
    const concentracao = mols / litros(volume);

    return {
      valor: concentracao.toFixed(2),
      passos: [
        {
          descricao: 'A massa molar sai da fórmula: é a soma das massas atômicas.',
          tex: `M(${formulaDe(achado[2]!)}) = ${tex(molar)}\\ \\text{g/mol}`,
        },
        {
          descricao: 'Primeiro a massa vira mols, dividindo pela massa molar.',
          tex: `n = \\frac{${massa}}{${tex(molar)}} = ${tex(mols, 4)}\\ \\text{mol}`,
        },
        {
          descricao: 'A concentração é a quantidade de soluto dividida pelo volume em litros.',
          tex: `C = \\frac{${tex(mols, 4)}}{${tex(litros(volume), 3)}} = ${tex(concentracao)}\\ \\text{mol/L}`,
        },
      ],
    };
  },

  // «Qual é a concentração de uma solução que contém 5,85 g de NaCl (massa molar 58,44) em 250 mL?»
  (texto) => {
    const achado =
      /concentração, em mol\/L, de uma solução que contém (\d+(?:[.,]\d+)?) g de .+?\(massa molar (\d+(?:[.,]\d+)?) g\/mol\) em (\d+(?:[.,]\d+)?) mL/i.exec(
        texto,
      );
    if (achado === null) return null;

    const [massa, molar, volume] = achado.slice(1, 4).map((g) => num(g!));
    const mols = massa! / molar!;
    const concentracao = mols / litros(volume!);

    return {
      valor: concentracao.toFixed(2),
      passos: [
        {
          descricao: 'Primeiro a massa vira mols, dividindo pela massa molar.',
          tex: `n = \\frac{${massa}}{${molar}} = ${tex(mols, 4)}\\ \\text{mol}`,
        },
        {
          descricao: 'A concentração é a quantidade de soluto dividida pelo volume em litros.',
          tex: `C = \\frac{${tex(mols, 4)}}{${tex(litros(volume!), 3)}} = ${tex(concentracao)}\\ \\text{mol/L}`,
        },
      ],
    };
  },
];
