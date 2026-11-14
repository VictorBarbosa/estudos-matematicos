import {
  massaDeMolsComPassos,
  massaMolar,
  massaMolarComPassos,
  molsDeMassaComPassos,
  particulasDeMols,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';
import { enunciadoTrilingue } from '@core/treino/textos/texto-trilingue';
import {
  DICA_MASSA_DE_MOLS,
  DICA_MASSA_MOLAR,
  DICA_MOLS_DE_MASSA,
  DICA_PARTICULAS,
  MASSA_DE_MOLS,
  MASSA_MOLAR,
  MOLS_DE_MASSA,
  PARTICULAS,
} from '@features/quimica/mol-e-massa-molar/mol-e-massa-molar.textos';

const { saoEquivalentes: proximos, formatar } = numeroComCasas(2, 1e-6);

/**
 * As substâncias do tópico, com a fórmula já decomposta.
 *
 * A decomposição vem pronta porque ler a fórmula escrita é outro problema — de
 * texto, não de conta — e cabe ao tópico de nomenclatura. Aqui o que se exerce
 * é a soma ponderada pelos índices.
 *
 * O nome aparece nas três línguas porque o enunciado de química se lê pelo
 * nome: «168 g de ferro», e não «168 g de Fe».
 */
interface Substancia {
  readonly formula: string;
  readonly pt: string;
  readonly fr: string;
  readonly en: string;
  readonly partes: readonly { simbolo: string; massaAtomica: number; quantidade: number }[];
}

const H = 1.008;
const C = 12.011;
const N = 14.007;
const O = 15.999;
const NA = 22.99;
const S = 32.06;
const CL = 35.45;
const CA = 40.078;
const FE = 55.845;
const CU = 63.546;

const SUBSTANCIAS: readonly Substancia[] = [
  {
    formula: 'H₂O',
    pt: 'água',
    fr: 'eau',
    en: 'water',
    partes: [
      { simbolo: 'H', massaAtomica: H, quantidade: 2 },
      { simbolo: 'O', massaAtomica: O, quantidade: 1 },
    ],
  },
  {
    formula: 'CO₂',
    pt: 'gás carbônico',
    fr: 'dioxyde de carbone',
    en: 'carbon dioxide',
    partes: [
      { simbolo: 'C', massaAtomica: C, quantidade: 1 },
      { simbolo: 'O', massaAtomica: O, quantidade: 2 },
    ],
  },
  {
    formula: 'NaCl',
    pt: 'sal de cozinha',
    fr: 'sel de table',
    en: 'table salt',
    partes: [
      { simbolo: 'Na', massaAtomica: NA, quantidade: 1 },
      { simbolo: 'Cl', massaAtomica: CL, quantidade: 1 },
    ],
  },
  {
    formula: 'H₂SO₄',
    pt: 'ácido sulfúrico',
    fr: 'acide sulfurique',
    en: 'sulfuric acid',
    partes: [
      { simbolo: 'H', massaAtomica: H, quantidade: 2 },
      { simbolo: 'S', massaAtomica: S, quantidade: 1 },
      { simbolo: 'O', massaAtomica: O, quantidade: 4 },
    ],
  },
  {
    formula: 'CaCO₃',
    pt: 'carbonato de cálcio',
    fr: 'carbonate de calcium',
    en: 'calcium carbonate',
    partes: [
      { simbolo: 'Ca', massaAtomica: CA, quantidade: 1 },
      { simbolo: 'C', massaAtomica: C, quantidade: 1 },
      { simbolo: 'O', massaAtomica: O, quantidade: 3 },
    ],
  },
  {
    formula: 'NH₃',
    pt: 'amônia',
    fr: 'ammoniac',
    en: 'ammonia',
    partes: [
      { simbolo: 'N', massaAtomica: N, quantidade: 1 },
      { simbolo: 'H', massaAtomica: H, quantidade: 3 },
    ],
  },
  {
    formula: 'C₆H₁₂O₆',
    pt: 'glicose',
    fr: 'glucose',
    en: 'glucose',
    partes: [
      { simbolo: 'C', massaAtomica: C, quantidade: 6 },
      { simbolo: 'H', massaAtomica: H, quantidade: 12 },
      { simbolo: 'O', massaAtomica: O, quantidade: 6 },
    ],
  },
  {
    formula: 'Fe₂O₃',
    pt: 'óxido de ferro(III)',
    fr: 'oxyde de fer(III)',
    en: 'iron(III) oxide',
    partes: [
      { simbolo: 'Fe', massaAtomica: FE, quantidade: 2 },
      { simbolo: 'O', massaAtomica: O, quantidade: 3 },
    ],
  },
  {
    formula: 'CuSO₄',
    pt: 'sulfato de cobre',
    fr: 'sulfate de cuivre',
    en: 'copper sulfate',
    partes: [
      { simbolo: 'Cu', massaAtomica: CU, quantidade: 1 },
      { simbolo: 'S', massaAtomica: S, quantidade: 1 },
      { simbolo: 'O', massaAtomica: O, quantidade: 4 },
    ],
  },
  {
    formula: 'CH₄',
    pt: 'metano',
    fr: 'méthane',
    en: 'methane',
    partes: [
      { simbolo: 'C', massaAtomica: C, quantidade: 1 },
      { simbolo: 'H', massaAtomica: H, quantidade: 4 },
    ],
  },
];

type Pergunta = 'massa-molar' | 'mols' | 'massa' | 'particulas';

/**
 * O mol e a massa molar — a ponte entre pesar e contar.
 *
 * Uma reação acontece entre partículas, numa proporção de contagem; mas
 * ninguém conta átomos, pesa-se. Este tópico é o que traduz uma coisa na
 * outra, e por isso tudo o que vem depois na área depende dele.
 *
 * O erro número um é somar as massas atômicas **ignorando os índices**: quem
 * faz isso acerta na água, onde o índice do oxigênio é 1, e erra em tudo o
 * mais. A armadilha existe em cada pergunta de massa molar.
 */
export const geradorMol: GeradorExercicio<number> = {
  topicoId: 'mol-e-massa-molar',
  formatoResposta: 'um número, 2 casas decimais',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'mols':
        return exercicioMols(nivel, rng);
      case 'massa':
        return exercicioMassa(nivel, rng);
      case 'particulas':
        return exercicioParticulas(nivel, rng);
      default:
        return exercicioMassaMolar(nivel, rng);
    }
  },

  analisar: analisarNumero,

  saoEquivalentes: proximos,
  formatar,
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    /*
     * O Fácil traz duas perguntas, e não só a massa molar.
     *
     * Sozinha, ela produz uma pergunta por substância — dez formas, abaixo do
     * piso de variedade que o projeto cobra. «Quantos mols há em tantos
     * gramas» varia a massa junto com a substância, e é tão introdutória
     * quanto: continua sendo uma divisão só.
     */
    case 'facil':
      return rng.escolher<Pergunta>(['massa-molar', 'mols']);
    case 'medio':
      return rng.escolher<Pergunta>(['massa-molar', 'mols', 'massa']);
    case 'dificil':
      return rng.escolher<Pergunta>(['mols', 'massa', 'particulas']);
    // Contar partículas é a única que obriga a sair da escala de laboratório e
    // encarar a ordem de grandeza — e é onde o mol deixa de ser uma divisão.
    case 'extremo':
      return rng.escolher<Pergunta>(['particulas', 'mols']);
  }
}

/** O nome da substância, para o molde de cada língua. */
function nomes(s: Substancia): [string, string, string] {
  return [s.pt, s.fr, s.en];
}

/**
 * Monta o enunciado com o nome traduzido em cada língua.
 *
 * `enunciadoTrilingue` passa os mesmos argumentos aos três moldes, e aqui o
 * primeiro argumento precisa mudar com a língua. Por isso a montagem é à mão:
 * três chamadas, uma por idioma, com o nome certo em cada.
 */
function comNomeTraduzido<A extends readonly unknown[]>(
  frases: { pt: (...a: A) => string; fr: (...a: A) => string; en: (...a: A) => string },
  substancia: Substancia,
  resto: unknown[],
): { enunciado: string; fr: string; en: string } {
  const [pt, fr, en] = nomes(substancia);

  return {
    enunciado: frases.pt(...([pt, ...resto] as unknown as A)),
    fr: frases.fr(...([fr, ...resto] as unknown as A)),
    en: frases.en(...([en, ...resto] as unknown as A)),
  };
}

function exercicioMassaMolar(nivel: Nivel, rng: Rng): Exercicio<number> {
  const substancia = rng.escolher(SUBSTANCIAS);
  const { resultado, passos } = massaMolarComPassos(substancia.partes, substancia.formula);

  const texto = comNomeTraduzido(MASSA_MOLAR, substancia, [substancia.formula]);
  const dica = comNomeTraduzido(DICA_MASSA_MOLAR, substancia, [substancia.formula]);

  // O erro número um: somar as massas atômicas sem multiplicar pelos índices.
  const semIndices = substancia.partes.reduce((total, p) => total + p.massaAtomica, 0);

  return {
    id: `mol-molar-${substancia.formula}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: {
      fr: { enunciado: texto.fr, dica: dica.fr },
      en: { enunciado: texto.en, dica: dica.en },
    },
    enunciadoTex: `M(\\text{${substancia.formula}}) = \\;?`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['mol.massa-molar', 'mol.conceito'],
    armadilhas: semColisoes(
      [
        {
          resposta: semIndices,
          diagnostico:
            'Você somou as massas atômicas sem multiplicar pelos índices. O número pequeno da ' +
            'fórmula conta ÁTOMOS, e cada um deles pesa.',
          passo: 0,
          conceito: 'mol.massa-molar',
        },
        {
          resposta: substancia.partes.reduce((total, p) => total + p.quantidade, 0),
          diagnostico:
            'Essa é a contagem de átomos da fórmula, não a massa deles. Cada átomo entra com ' +
            'a massa do seu elemento.',
          passo: 0,
          conceito: 'mol.massa-molar',
        },
      ],
      resultado,
      proximos,
    ),
    dica: dica.enunciado,
  };
}

function exercicioMols(nivel: Nivel, rng: Rng): Exercicio<number> {
  const substancia = rng.escolher(SUBSTANCIAS);
  const molar = massaMolar(substancia.partes);
  // Massas que dão entre 0,5 e 6 mols: fora disso o número deixa de informar.
  const massa = Number((molar * (rng.inteiro(5, 60) / 10)).toFixed(2));

  const { resultado, passos } = molsDeMassaComPassos(
    massa,
    Number(molar.toFixed(2)),
    substancia.pt,
  );
  const texto = comNomeTraduzido(MOLS_DE_MASSA, substancia, [massa]);
  const dica = comNomeTraduzido(DICA_MOLS_DE_MASSA, substancia, [massa]);

  return {
    id: `mol-mols-${substancia.formula}-${massa}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: {
      fr: { enunciado: texto.fr, dica: dica.fr },
      en: { enunciado: texto.en, dica: dica.en },
    },
    enunciadoTex: `m = ${massa}\\;\\text{g} \\qquad \\text{${substancia.formula}}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['mol.conceito', 'mol.massa-molar'],
    armadilhas: semColisoes(
      [
        {
          // A divisão ao contrário: massa molar dividida pela massa.
          resposta: molar / massa,
          diagnostico:
            'A divisão está invertida. Procura-se quantos mols CABEM na massa dada, então a ' +
            'massa vai em cima e a massa molar embaixo.',
          passo: 1,
          conceito: 'mol.conceito',
        },
        {
          resposta: massa * molar,
          diagnostico:
            'Você multiplicou. Multiplicar daria a massa de tantos mols — e aqui a massa já é ' +
            'conhecida; o que falta é a quantidade.',
          passo: 1,
          conceito: 'mol.conceito',
        },
      ],
      resultado,
      proximos,
    ),
    dica: dica.enunciado,
  };
}

function exercicioMassa(nivel: Nivel, rng: Rng): Exercicio<number> {
  const substancia = rng.escolher(SUBSTANCIAS);
  const molar = Number(massaMolar(substancia.partes).toFixed(2));
  const mols = rng.inteiro(5, 40) / 10;

  const { resultado, passos } = massaDeMolsComPassos(mols, molar, substancia.pt);
  const texto = comNomeTraduzido(MASSA_DE_MOLS, substancia, [mols]);
  const dica = comNomeTraduzido(DICA_MASSA_DE_MOLS, substancia, [mols]);

  return {
    id: `mol-massa-${substancia.formula}-${mols}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: {
      fr: { enunciado: texto.fr, dica: dica.fr },
      en: { enunciado: texto.en, dica: dica.en },
    },
    enunciadoTex: `n = ${mols}\\;\\text{mol} \\qquad \\text{${substancia.formula}}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['mol.conceito'],
    armadilhas: semColisoes(
      [
        {
          resposta: mols / molar,
          diagnostico:
            'Você dividiu. Dividir responde «quantos mols há nesta massa» — e aqui a ' +
            'quantidade já é conhecida; o que falta é quanto ela pesa.',
          passo: 1,
          conceito: 'mol.conceito',
        },
        {
          resposta: molar,
          diagnostico:
            'Essa é a massa de UM mol. O enunciado pede a massa de ' +
            `${mols}, então ainda falta multiplicar.`,
          passo: 1,
          conceito: 'mol.conceito',
        },
      ],
      resultado,
      proximos,
    ),
    dica: dica.enunciado,
  };
}

function exercicioParticulas(nivel: Nivel, rng: Rng): Exercicio<number> {
  const substancia = rng.escolher(SUBSTANCIAS);
  const mols = rng.inteiro(5, 50) / 10;

  // A resposta é o coeficiente da notação científica: pedir o número inteiro
  // seria pedir 24 algarismos, que ninguém digita nem confere.
  const total = particulasDeMols(mols);
  const resultado = total / 1e23;

  const texto = comNomeTraduzido(PARTICULAS, substancia, [mols]);
  const dica = comNomeTraduzido(DICA_PARTICULAS, substancia, [mols]);

  return {
    id: `mol-part-${substancia.formula}-${mols}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: {
      fr: { enunciado: texto.fr, dica: dica.fr },
      en: { enunciado: texto.en, dica: dica.en },
    },
    enunciadoTex: `n = ${mols}\\;\\text{mol} \\qquad N = \\;?\\times 10^{23}`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'Um mol tem o número de Avogadro de partículas.',
          tex: 'N_A = 6{,}022 \\times 10^{23}',
          nota: 'O número é grande porque a unidade de massa é pequena, não por capricho.',
        },
        {
          descricao: 'A contagem é a quantidade de mols vezes esse número.',
          tex: `N = ${mols} \\times 6{,}022 \\times 10^{23}`,
        },
        {
          descricao: 'O coeficiente é o que se multiplica; a potência fica.',
          tex: `N = ${Number(resultado.toFixed(4))} \\times 10^{23}`,
        },
      ],
    },
    conceitos: ['mol.avogadro', 'mol.conceito'],
    armadilhas: semColisoes(
      [
        {
          resposta: 6.022,
          diagnostico:
            'Esse é o número de Avogadro, que vale para UM mol. O enunciado dá outra ' +
            'quantidade, e ela multiplica.',
          passo: 1,
          conceito: 'mol.avogadro',
        },
        {
          resposta: 6.022 / mols,
          diagnostico:
            'Você dividiu pelo número de mols. Mais mols significam MAIS partículas, então a ' +
            'quantidade multiplica.',
          passo: 1,
          conceito: 'mol.avogadro',
        },
      ],
      resultado,
      proximos,
    ),
    dica: dica.enunciado,
  };
}
