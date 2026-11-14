import {
  Elemento,
  Passo,
  canonizarFormula,
  comSubscritos,
  lerFormula,
  massaMolarDaFormula,
  mesmaFormula,
  partesDaFormula,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import {
  Exercicio,
  GeradorExercicio,
  Nivel,
  TeclaDeSimbolo,
  semColisoes,
} from '@core/treino/models/treino.model';
import { enunciadoTrilingue } from '@core/treino/textos/texto-trilingue';
import {
  DICA_EMPIRICA,
  DICA_MASSA_MOLAR,
  DICA_MOLECULAR,
  DICA_PERCENTUAL,
  EMPIRICA,
  MASSA_MOLAR,
  MOLECULAR,
  PERCENTUAL,
} from '@features/quimica/composicao-e-formula/composicao-e-formula.textos';

/**
 * A resposta deste tópico: ou um número, ou uma fórmula.
 *
 * Os dois convivem porque as duas mãos do tópico convivem — da fórmula se tira
 * a porcentagem, e da porcentagem se volta à fórmula. A comparação decide pelo
 * que existe: havendo número dos dois lados, compara número; havendo fórmula,
 * compara composição, que é o que uma fórmula molecular diz.
 */
export interface Resposta {
  /** Como a resposta aparece ao aluno, já com os índices subscritos. */
  readonly exibida: string;
  /** O valor, quando a resposta é numérica. */
  readonly valor: number | null;
  /** O texto da fórmula, quando a resposta é uma fórmula. */
  readonly formula: string | null;
}

function numero(valor: number): Resposta {
  return { exibida: valor.toFixed(2).replace('.', ','), valor, formula: null };
}

function formula(texto: string): Resposta {
  return { exibida: comSubscritos(canonizarFormula(texto) ?? texto), valor: null, formula: texto };
}

/**
 * As teclas do campo de resposta.
 *
 * Os índices subscritos não estão no teclado de ninguém, e o parêntese é o que
 * um hidróxido pede. O aluno pode escrever `H2O` com dígitos comuns, que a
 * leitura aceita — a paleta é conforto, não exigência.
 */
const SIMBOLOS: readonly TeclaDeSimbolo[] = [
  { rotulo: '₂', insere: '2', nome: 'índice dois' },
  { rotulo: '₃', insere: '3', nome: 'índice três' },
  { rotulo: '₄', insere: '4', nome: 'índice quatro' },
  { rotulo: '( )', insere: '()', recuo: 1, nome: 'parênteses' },
];

/** Compostos com fórmula molecular e empírica conhecidas. */
interface Composto {
  readonly molecular: string;
  readonly empirica: string;
  /** Quantas vezes a empírica cabe na molecular. */
  readonly vezes: number;
}

const COMPOSTOS: readonly Composto[] = [
  // Fórmula já na proporção mais simples: a empírica é ela mesma.
  { molecular: 'H2O', empirica: 'H2O', vezes: 1 },
  { molecular: 'CO2', empirica: 'CO2', vezes: 1 },
  { molecular: 'CO', empirica: 'CO', vezes: 1 },
  { molecular: 'NaCl', empirica: 'NaCl', vezes: 1 },
  { molecular: 'KCl', empirica: 'KCl', vezes: 1 },
  { molecular: 'HCl', empirica: 'HCl', vezes: 1 },
  { molecular: 'CaCO3', empirica: 'CaCO3', vezes: 1 },
  { molecular: 'NaHCO3', empirica: 'NaHCO3', vezes: 1 },
  { molecular: 'Na2CO3', empirica: 'Na2CO3', vezes: 1 },
  { molecular: 'NaOH', empirica: 'NaOH', vezes: 1 },
  { molecular: 'KOH', empirica: 'KOH', vezes: 1 },
  { molecular: 'NH3', empirica: 'NH3', vezes: 1 },
  { molecular: 'CH4', empirica: 'CH4', vezes: 1 },
  { molecular: 'C3H8', empirica: 'C3H8', vezes: 1 },
  { molecular: 'H2SO4', empirica: 'H2SO4', vezes: 1 },
  { molecular: 'HNO3', empirica: 'HNO3', vezes: 1 },
  { molecular: 'Fe2O3', empirica: 'Fe2O3', vezes: 1 },
  { molecular: 'FeO', empirica: 'FeO', vezes: 1 },
  { molecular: 'Al2O3', empirica: 'Al2O3', vezes: 1 },
  { molecular: 'MgO', empirica: 'MgO', vezes: 1 },
  { molecular: 'MgCl2', empirica: 'MgCl2', vezes: 1 },
  { molecular: 'CaCl2', empirica: 'CaCl2', vezes: 1 },
  { molecular: 'ZnO', empirica: 'ZnO', vezes: 1 },
  { molecular: 'CuSO4', empirica: 'CuSO4', vezes: 1 },
  { molecular: 'CaSO4', empirica: 'CaSO4', vezes: 1 },
  { molecular: 'BaSO4', empirica: 'BaSO4', vezes: 1 },
  { molecular: 'AgNO3', empirica: 'AgNO3', vezes: 1 },
  { molecular: 'KMnO4', empirica: 'KMnO4', vezes: 1 },
  { molecular: 'K2CrO4', empirica: 'K2CrO4', vezes: 1 },
  { molecular: 'MnO2', empirica: 'MnO2', vezes: 1 },
  { molecular: 'TiO2', empirica: 'TiO2', vezes: 1 },
  { molecular: 'SiO2', empirica: 'SiO2', vezes: 1 },
  { molecular: 'PbO2', empirica: 'PbO2', vezes: 1 },
  { molecular: 'SO2', empirica: 'SO2', vezes: 1 },
  { molecular: 'SO3', empirica: 'SO3', vezes: 1 },
  { molecular: 'NO', empirica: 'NO', vezes: 1 },

  // Compostos em que a proporção se repete: é aqui que a empírica deixa de
  // ser a molécula, e é por isso que a massa molar passa a ser necessária.
  { molecular: 'C6H12O6', empirica: 'CH2O', vezes: 6 },
  { molecular: 'C2H4O2', empirica: 'CH2O', vezes: 2 },
  { molecular: 'C3H6O3', empirica: 'CH2O', vezes: 3 },
  { molecular: 'C6H6', empirica: 'CH', vezes: 6 },
  { molecular: 'C2H2', empirica: 'CH', vezes: 2 },
  { molecular: 'C2H4', empirica: 'CH2', vezes: 2 },
  { molecular: 'C3H6', empirica: 'CH2', vezes: 3 },
  { molecular: 'C4H8', empirica: 'CH2', vezes: 4 },
  { molecular: 'C5H10', empirica: 'CH2', vezes: 5 },
  { molecular: 'C2H6', empirica: 'CH3', vezes: 2 },
  { molecular: 'C4H10', empirica: 'C2H5', vezes: 2 },
  { molecular: 'C8H18', empirica: 'C4H9', vezes: 2 },
  { molecular: 'C6H14', empirica: 'C3H7', vezes: 2 },
  { molecular: 'C10H8', empirica: 'C5H4', vezes: 2 },
  { molecular: 'C2H6O2', empirica: 'CH3O', vezes: 2 },
  { molecular: 'N2O4', empirica: 'NO2', vezes: 2 },
  { molecular: 'N2H4', empirica: 'NH2', vezes: 2 },
  { molecular: 'H2O2', empirica: 'HO', vezes: 2 },
  { molecular: 'P4O10', empirica: 'P2O5', vezes: 2 },
  { molecular: 'B2H6', empirica: 'BH3', vezes: 2 },
];

type Pergunta = 'percentual' | 'massaMolar' | 'empirica' | 'molecular';

/**
 * Composição percentual e fórmula empírica — as duas mãos da mesma conta.
 *
 * Da fórmula sai a porcentagem de cada elemento; da porcentagem de cada
 * elemento volta-se à fórmula. O caminho de ida é direto; o de volta tem dois
 * passos que se esquecem — dividir todos os mols pelo MENOR, que é o que
 * transforma quantidade em proporção, e multiplicar todos para inteirar,
 * quando a proporção sai com meio átomo.
 *
 * E há a diferença que o tópico existe para fixar: a fórmula empírica dá a
 * PROPORÇÃO, não a molécula. CH₂O é glicose, formaldeído e ácido acético
 * diluído na mesma proporção; só a massa molar escolhe entre eles.
 */
export const geradorComposicao: GeradorExercicio<Resposta> = {
  topicoId: 'composicao-e-formula',
  formatoResposta: 'um número, ou uma fórmula escrita como H2O',
  simbolos: SIMBOLOS,

  gerar(nivel: Nivel, rng: Rng): Exercicio<Resposta> {
    switch (sortearPergunta(nivel, rng)) {
      case 'massaMolar':
        return exercicioMassaMolar(nivel, rng);
      case 'empirica':
        return exercicioEmpirica(nivel, rng);
      case 'molecular':
        return exercicioMolecular(nivel, rng);
      default:
        return exercicioPercentual(nivel, rng);
    }
  },

  analisar: (entrada: string): Resposta | null => {
    const aparado = entrada.trim();
    if (aparado === '') {
      return null;
    }

    const valor = analisarNumero(aparado);
    if (valor !== null) {
      return { exibida: aparado, valor, formula: null };
    }

    return lerFormula(aparado) === undefined ? null : formula(aparado);
  },

  saoEquivalentes: (a: Resposta, b: Resposta): boolean => {
    if (a.valor !== null && b.valor !== null) {
      // Duas casas decimais, como o enunciado pede.
      return Math.abs(a.valor - b.valor) < 0.005;
    }

    return a.formula !== null && b.formula !== null && mesmaFormula(a.formula, b.formula);
  },

  formatar: (valor: Resposta): string => valor.exibida,
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['massaMolar', 'percentual']);
    case 'medio':
      return rng.escolher<Pergunta>(['percentual', 'massaMolar', 'empirica']);
    case 'dificil':
      return rng.escolher<Pergunta>(['percentual', 'empirica', 'molecular']);
    // A molecular só termina depois da empírica: são as duas voltas do
    // caminho de volta numa pergunta só.
    case 'extremo':
      return rng.escolher<Pergunta>(['molecular', 'empirica']);
  }
}

/** A fórmula como ela se lê na tela, com os índices subscritos. */
function escrita(texto: string): string {
  return comSubscritos(texto);
}

function exercicioPercentual(nivel: Nivel, rng: Rng): Exercicio<Resposta> {
  const composto = rng.escolher(COMPOSTOS);
  const partes = partesDaFormula(composto.molecular)!;
  const escolhida = rng.escolher(partes);

  const massaMolar = massaMolarDaFormula(composto.molecular)!;
  const massaDoElemento = escolhida.elemento.massaAtomica * escolhida.quantidade;
  const resultado = (massaDoElemento / massaMolar) * 100;

  const texto = enunciadoTrilingue(
    PERCENTUAL,
    [escrita(composto.molecular), escolhida.elemento.simbolo],
    DICA_PERCENTUAL,
  );

  return {
    id: `comp-pct-${composto.molecular}-${escolhida.elemento.simbolo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: somaDaMassaMolarTex(partes),
    gabarito: numero(resultado),
    resolucao: {
      resultado: numero(resultado),
      passos: passosDoPercentual(partes, escolhida, massaMolar, resultado),
    },
    conceitos: ['formula.percentual', 'mol.massa-molar'],
    armadilhas: semColisoes(
      [
        {
          resposta: numero((escolhida.elemento.massaAtomica / massaMolar) * 100),
          diagnostico:
            'A massa atômica entrou crua, sem o índice. Se a fórmula traz dois átomos desse ' +
            'elemento, eles pesam duas vezes — o índice conta átomos, e por isso multiplica.',
          passo: 1,
          conceito: 'formula.percentual',
        },
        {
          resposta: numero((massaMolar / massaDoElemento) * 100),
          diagnostico:
            'A fração está invertida, e por isso passou de 100%. A parte vai em cima e o todo ' +
            'embaixo: nenhum elemento é mais que o composto inteiro.',
          passo: 3,
          conceito: 'formula.percentual',
        },
      ],
      numero(resultado),
      geradorComposicao.saoEquivalentes!,
    ),
    dica: texto.dica,
  };
}

function exercicioMassaMolar(nivel: Nivel, rng: Rng): Exercicio<Resposta> {
  const composto = rng.escolher(COMPOSTOS);
  const partes = partesDaFormula(composto.molecular)!;
  const resultado = massaMolarDaFormula(composto.molecular)!;

  const texto = enunciadoTrilingue(MASSA_MOLAR, [escrita(composto.molecular)], DICA_MASSA_MOLAR);

  // O que sai de somar as massas atômicas esquecendo os índices.
  const semIndices = partes.reduce((total, parte) => total + parte.elemento.massaAtomica, 0);

  return {
    id: `comp-mm-${composto.molecular}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: somaDaMassaMolarTex(partes),
    gabarito: numero(resultado),
    resolucao: {
      resultado: numero(resultado),
      passos: [
        {
          descricao: 'Cada elemento entra com a sua massa atômica, vezes o índice.',
          tex: partes
            .map((p) => `${p.elemento.simbolo}: ${p.quantidade} \\times ${p.elemento.massaAtomica}`)
            .join(' \\qquad '),
          nota: 'O índice conta átomos na fórmula, e por isso multiplica a massa.',
        },
        {
          descricao: 'Somando as parcelas.',
          tex: `M = ${somaDaMassaMolarTex(partes)} = ${Number(resultado.toFixed(2))}\\;\\text{g/mol}`,
        },
      ],
    },
    conceitos: ['mol.massa-molar', 'formula.percentual'],
    armadilhas: semColisoes(
      [
        {
          resposta: numero(semIndices),
          diagnostico:
            'Os índices ficaram de fora. Eles contam átomos: cada um multiplica a massa ' +
            'atômica do seu elemento antes da soma.',
          passo: 1,
          conceito: 'mol.massa-molar',
        },
      ],
      numero(resultado),
      geradorComposicao.saoEquivalentes!,
    ),
    dica: texto.dica,
  };
}

function exercicioEmpirica(nivel: Nivel, rng: Rng): Exercicio<Resposta> {
  const composto = rng.escolher(COMPOSTOS);
  const partes = partesDaFormula(composto.molecular)!;
  const massaMolar = massaMolarDaFormula(composto.molecular)!;

  const simbolos = partes.map((p) => p.elemento.simbolo);
  const percentuais = partes.map((p) =>
    Number((((p.elemento.massaAtomica * p.quantidade) / massaMolar) * 100).toFixed(2)),
  );

  const texto = enunciadoTrilingue(EMPIRICA, [simbolos, percentuais], DICA_EMPIRICA);

  return {
    id: `comp-emp-${composto.molecular}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: percentuais
      .map((valor, indice) => `${simbolos[indice]}: ${valor}\\%`)
      .join(' \\qquad '),
    gabarito: formula(composto.empirica),
    resolucao: {
      resultado: formula(composto.empirica),
      passos: passosDaEmpirica(partes, percentuais, composto),
    },
    conceitos: ['formula.empirica', 'formula.percentual'],
    armadilhas: semColisoes(
      [
        {
          resposta: formula(composto.molecular),
          diagnostico:
            'Essa é a fórmula MOLECULAR, e a porcentagem não consegue distingui-la da ' +
            'empírica: C₆H₁₂O₆ e CH₂O têm exatamente a mesma composição. Sem a massa molar, ' +
            'a resposta é a proporção mais simples.',
          passo: 4,
          conceito: 'formula.empirica',
        },
      ],
      formula(composto.empirica),
      geradorComposicao.saoEquivalentes!,
    ),
    dica: texto.dica,
  };
}

function exercicioMolecular(nivel: Nivel, rng: Rng): Exercicio<Resposta> {
  // Só os compostos em que a molecular difere da empírica: perguntar o
  // contrário seria perguntar a mesma fórmula de volta.
  const composto = rng.escolher(COMPOSTOS.filter((c) => c.vezes > 1));

  const massaDaEmpirica = massaMolarDaFormula(composto.empirica)!;
  const massaMolar = Number((massaDaEmpirica * composto.vezes).toFixed(2));

  const texto = enunciadoTrilingue(
    MOLECULAR,
    [escrita(composto.empirica), massaMolar],
    DICA_MOLECULAR,
  );

  return {
    id: `comp-mol-${composto.molecular}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: `n = \\frac{M_{\\text{molecular}}}{M_{\\text{empírica}}}`,
    gabarito: formula(composto.molecular),
    resolucao: {
      resultado: formula(composto.molecular),
      passos: [
        {
          descricao: 'A massa da fórmula empírica sai da tabela, como qualquer massa molar.',
          tex: `M_{\\text{empírica}} = ${Number(massaDaEmpirica.toFixed(2))}\\;\\text{g/mol}`,
        },
        {
          descricao: 'Quantas vezes ela cabe na massa molar do composto.',
          tex:
            `n = \\frac{${massaMolar}}{${Number(massaDaEmpirica.toFixed(2))}} = ` +
            `${composto.vezes}`,
          nota: 'Esse número sai inteiro, e sair inteiro é a confirmação de que a empírica estava certa.',
        },
        {
          descricao: 'Todos os índices se multiplicam por ele.',
          tex: `\\text{${escrita(composto.empirica)}} \\times ${composto.vezes} = \\text{${escrita(composto.molecular)}}`,
        },
      ],
    },
    conceitos: ['formula.molecular', 'formula.empirica'],
    armadilhas: semColisoes(
      [
        {
          resposta: formula(composto.empirica),
          diagnostico:
            'Essa é a fórmula empírica, que o enunciado já deu. A massa molar diz quantas ' +
            'vezes ela cabe na molécula — e é por esse número que todos os índices se ' +
            'multiplicam.',
          passo: 2,
          conceito: 'formula.molecular',
        },
      ],
      formula(composto.molecular),
      geradorComposicao.saoEquivalentes!,
    ),
    dica: texto.dica,
  };
}

/** `2 × 1,01 + 16,00`, a soma que a massa molar é. */
function somaDaMassaMolarTex(
  partes: readonly { elemento: Elemento; quantidade: number }[],
): string {
  return partes
    .map((p) =>
      p.quantidade === 1
        ? `${p.elemento.massaAtomica}`
        : `${p.quantidade} \\times ${p.elemento.massaAtomica}`,
    )
    .join(' + ');
}

function passosDoPercentual(
  partes: readonly { elemento: Elemento; quantidade: number }[],
  escolhida: { elemento: Elemento; quantidade: number },
  massaMolar: number,
  resultado: number,
): readonly Passo[] {
  const massaDoElemento = escolhida.elemento.massaAtomica * escolhida.quantidade;

  return [
    {
      descricao: `Na fórmula há ${escolhida.quantidade} átomo(s) de ${escolhida.elemento.simbolo}, e eles pesam juntos.`,
      tex:
        `${escolhida.quantidade} \\times ${escolhida.elemento.massaAtomica} = ` +
        `${Number(massaDoElemento.toFixed(2))}\\;\\text{g/mol}`,
      nota: 'O índice conta átomos, e por isso multiplica a massa atômica.',
    },
    {
      descricao: 'A massa molar é a soma de todas as parcelas.',
      tex: `M = ${somaDaMassaMolarTex(partes)} = ${Number(massaMolar.toFixed(2))}\\;\\text{g/mol}`,
    },
    {
      descricao: 'A porcentagem é a parte sobre o todo.',
      tex:
        `\\frac{${Number(massaDoElemento.toFixed(2))}}{${Number(massaMolar.toFixed(2))}} ` +
        `\\times 100 = ${Number(resultado.toFixed(2))}\\%`,
      nota: 'A parte em cima: nenhum elemento pesa mais que o composto inteiro.',
    },
  ];
}

function passosDaEmpirica(
  partes: readonly { elemento: Elemento; quantidade: number }[],
  percentuais: readonly number[],
  composto: Composto,
): readonly Passo[] {
  const mols = partes.map((p, i) => percentuais[i]! / p.elemento.massaAtomica);
  const menor = Math.min(...mols);
  const razoes = mols.map((valor) => valor / menor);

  const empirica = partesDaFormula(composto.empirica)!;
  const fator = empirica.reduce((maior, parte) => Math.max(maior, parte.quantidade), 1);

  return [
    {
      descricao: 'Fingindo 100 g do composto, cada porcentagem vira gramas.',
      tex: partes
        .map((p, i) => `${p.elemento.simbolo}: ${percentuais[i]}\\;\\text{g}`)
        .join(' \\qquad '),
      nota: 'A proporção não depende de quanto se tem, e 100 g é o número que facilita a conta.',
    },
    {
      descricao: 'Cada massa vira quantidade, pela massa atômica.',
      tex: partes
        .map(
          (p, i) =>
            `\\frac{${percentuais[i]}}{${p.elemento.massaAtomica}} = ${Number(mols[i]!.toFixed(3))}`,
        )
        .join(' \\qquad '),
    },
    {
      descricao: 'Dividindo todos pelo MENOR, os mols viram proporção.',
      tex: razoes.map((valor) => Number(valor.toFixed(2))).join(' : '),
      nota: 'É este passo que transforma quantidade em fórmula.',
    },
    {
      descricao:
        fator > 1 && razoes.some((valor) => Math.abs(valor - Math.round(valor)) > 0.1)
          ? 'Sobrou meio átomo, e meio átomo não existe: multiplicam-se todos para inteirar.'
          : 'A proporção já saiu inteira, e é a fórmula empírica.',
      tex: `\\text{${comSubscritos(composto.empirica)}}`,
      nota: 'A empírica dá a PROPORÇÃO, e não a molécula: só a massa molar escolhe entre elas.',
    },
  ];
}
