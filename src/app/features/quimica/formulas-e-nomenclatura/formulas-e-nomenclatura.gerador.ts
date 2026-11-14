import {
  comSubscritos,
  formulaIonica,
  formulaIonicaComPassos,
  lerFormula,
  mesmaFormula,
  noxComPassos,
  noxDoElemento,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import {
  Exercicio,
  GeradorExercicio,
  Nivel,
  SEM_FORMULA,
  TeclaDeSimbolo,
  semColisoes,
} from '@core/treino/models/treino.model';
import { enunciadoTrilingue } from '@core/treino/textos/texto-trilingue';
import {
  DICA_FORMULA,
  DICA_INDICE,
  DICA_NOX,
  FORMULA_DO_NOME,
  INDICE,
  NOX,
} from '@features/quimica/formulas-e-nomenclatura/formulas-e-nomenclatura.textos';

/** A resposta: ou um número (nox, índice), ou uma fórmula. */
export interface Resposta {
  readonly exibida: string;
  readonly valor: number | null;
  readonly formula: string | null;
}

function numero(valor: number): Resposta {
  return { exibida: valor > 0 ? `+${valor}` : String(valor), valor, formula: null };
}

function formula(texto: string): Resposta {
  return { exibida: comSubscritos(texto), valor: null, formula: texto };
}

const SIMBOLOS: readonly TeclaDeSimbolo[] = [
  { rotulo: '₂', insere: '2', nome: 'índice dois' },
  { rotulo: '₃', insere: '3', nome: 'índice três' },
  { rotulo: '−', insere: '-', nome: 'sinal negativo' },
];

interface Cation {
  readonly simbolo: string;
  readonly cargas: readonly number[];
}

/**
 * Os metais do tópico, com as cargas que formam.
 *
 * Os de mais de uma carga — ferro, cobre, chumbo, estanho — são o motivo de o
 * numeral romano existir: «cloreto de ferro» não diz se é FeCl₂ ou FeCl₃, e o
 * nome sem o numeral é um nome incompleto.
 */
const CATIONS: readonly Cation[] = [
  { simbolo: 'Li', cargas: [1] },
  { simbolo: 'Na', cargas: [1] },
  { simbolo: 'K', cargas: [1] },
  { simbolo: 'Ag', cargas: [1] },
  { simbolo: 'Mg', cargas: [2] },
  { simbolo: 'Ca', cargas: [2] },
  { simbolo: 'Ba', cargas: [2] },
  { simbolo: 'Zn', cargas: [2] },
  { simbolo: 'Al', cargas: [3] },
  { simbolo: 'Fe', cargas: [2, 3] },
  { simbolo: 'Cu', cargas: [1, 2] },
  { simbolo: 'Pb', cargas: [2, 4] },
  { simbolo: 'Sn', cargas: [2, 4] },
];

const ANIONS: readonly { readonly simbolo: string; readonly carga: number }[] = [
  { simbolo: 'F', carga: -1 },
  { simbolo: 'Cl', carga: -1 },
  { simbolo: 'Br', carga: -1 },
  { simbolo: 'I', carga: -1 },
  { simbolo: 'O', carga: -2 },
  { simbolo: 'S', carga: -2 },
  { simbolo: 'N', carga: -3 },
];

type Pergunta = 'formula' | 'nox' | 'indice';

/**
 * Fórmulas e nomenclatura — do nome para a fórmula, e de volta pelo nox.
 *
 * O tópico vai numa direção só: do NOME para a FÓRMULA. A direção contrária —
 * escrever o nome a partir da fórmula — seria texto livre em três línguas, com
 * acento, artigo e ordem de palavras, e corrigir isso seria corrigir redação
 * em vez de química. Quem sabe ir do nome à fórmula sabe a regra; o caminho de
 * volta é o mesmo caminho.
 *
 * O numeral romano não é enfeite: é a carga do metal, escrita. É por isso que
 * «cloreto de ferro» não é um nome completo, e por isso o tópico sempre o põe
 * nos metais de carga variável.
 *
 * O nox entra como a conta que fecha o composto — soma zero, âncora conhecida
 * — e como a razão de o numeral existir.
 */
export const geradorNomenclatura: GeradorExercicio<Resposta> = {
  topicoId: 'formulas-e-nomenclatura',
  formatoResposta: 'uma fórmula escrita como NaCl, ou um número com sinal',
  simbolos: SIMBOLOS,

  gerar(nivel: Nivel, rng: Rng): Exercicio<Resposta> {
    switch (sortearPergunta(nivel, rng)) {
      case 'nox':
        return exercicioNox(nivel, rng);
      case 'indice':
        return exercicioIndice(nivel, rng);
      default:
        return exercicioFormula(nivel, rng);
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
      return Math.abs(a.valor - b.valor) < 1e-9;
    }

    return a.formula !== null && b.formula !== null && mesmaFormula(a.formula, b.formula);
  },

  formatar: (valor: Resposta): string => valor.exibida,
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['formula', 'indice']);
    case 'medio':
      return rng.escolher<Pergunta>(['formula', 'nox', 'indice']);
    case 'dificil':
      return rng.escolher<Pergunta>(['formula', 'nox', 'indice']);
    // Do nome à fórmula é o que o tópico ensina, e o nox é a conta que o
    // sustenta: no Extremo ficam os dois.
    case 'extremo':
      return rng.escolher<Pergunta>(['formula', 'nox']);
  }
}

/** Um par metal + não metal sorteado, com a carga escolhida do metal. */
function sortearPar(rng: Rng) {
  const cation = rng.escolher(CATIONS);
  const anion = rng.escolher(ANIONS);
  const carga = rng.escolher(cation.cargas);

  return {
    cation,
    anion,
    carga,
    variavel: cation.cargas.length > 1,
    formula: formulaIonica(
      { simbolo: cation.simbolo, carga },
      { simbolo: anion.simbolo, carga: anion.carga },
    )!,
  };
}

function exercicioFormula(nivel: Nivel, rng: Rng): Exercicio<Resposta> {
  const par = sortearPar(rng);

  const texto = enunciadoTrilingue(
    FORMULA_DO_NOME,
    [par.cation.simbolo, par.anion.simbolo, par.carga, par.variavel],
    DICA_FORMULA,
  );

  const { passos } = formulaIonicaComPassos(
    { simbolo: par.cation.simbolo, carga: par.carga },
    { simbolo: par.anion.simbolo, carga: par.anion.carga },
  );

  // O cruzamento sem reduzir, e a troca dos índices.
  const semReduzir = `${par.cation.simbolo}${Math.abs(par.anion.carga)}${par.anion.simbolo}${par.carga}`;
  const trocado = `${par.cation.simbolo}${par.carga}${par.anion.simbolo}${Math.abs(par.anion.carga)}`;

  return {
    id: `nom-formula-${par.cation.simbolo}${par.carga}-${par.anion.simbolo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: SEM_FORMULA,
    gabarito: formula(par.formula),
    resolucao: { resultado: formula(par.formula), passos },
    conceitos: ['nomenclatura.binario', 'tabela.ligacao-ionica'],
    armadilhas: semColisoes(
      [
        {
          resposta: formula(semReduzir),
          diagnostico:
            'O cruzamento está certo e falta reduzir. A fórmula é uma proporção: Mg²⁺ com O²⁻ ' +
            'dá MgO, não Mg2O2.',
          passo: 3,
          conceito: 'tabela.ligacao-ionica',
        },
        {
          resposta: formula(trocado),
          diagnostico:
            'Cada elemento ficou com o próprio número como índice. É o contrário: o índice de ' +
            'um é a carga do OUTRO — é isso que faz o composto sair neutro.',
          passo: 2,
          conceito: 'tabela.ligacao-ionica',
        },
      ],
      formula(par.formula),
      geradorNomenclatura.saoEquivalentes!,
    ),
    dica: texto.dica,
  };
}

function exercicioIndice(nivel: Nivel, rng: Rng): Exercicio<Resposta> {
  const par = sortearPar(rng);
  const composicao = lerFormula(par.formula)!;
  const resultado = composicao.get(par.anion.simbolo)!;

  const texto = enunciadoTrilingue(
    INDICE,
    [par.cation.simbolo, par.anion.simbolo, par.carga, par.variavel],
    DICA_INDICE,
  );

  const { passos } = formulaIonicaComPassos(
    { simbolo: par.cation.simbolo, carga: par.carga },
    { simbolo: par.anion.simbolo, carga: par.anion.carga },
  );

  return {
    id: `nom-indice-${par.cation.simbolo}${par.carga}-${par.anion.simbolo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: SEM_FORMULA,
    gabarito: numero(resultado),
    resolucao: {
      resultado: numero(resultado),
      passos: [
        ...passos,
        {
          descricao: `O índice do ${par.anion.simbolo} na fórmula.`,
          tex: `${par.anion.simbolo}: ${resultado}`,
          nota: 'Depois da redução — e vale 1 quando não aparece escrito.',
        },
      ],
    },
    conceitos: ['nomenclatura.binario', 'tabela.ligacao-ionica'],
    armadilhas: semColisoes(
      [
        {
          // O índice antes de reduzir: a carga do metal, crua.
          resposta: numero(par.carga),
          diagnostico:
            'Esse é o índice antes da redução — a carga do metal, crua. Depois de dividir ' +
            'pelos fatores comuns, o índice é outro.',
          passo: 3,
          conceito: 'tabela.ligacao-ionica',
        },
        {
          resposta: numero(Math.abs(par.anion.carga)),
          diagnostico:
            'Essa é a carga do próprio ânion. O índice dele é a carga do OUTRO, reduzida — é ' +
            'o cruzamento.',
          passo: 2,
          conceito: 'tabela.ligacao-ionica',
        },
      ],
      numero(resultado),
      geradorNomenclatura.saoEquivalentes!,
    ),
    dica: texto.dica,
  };
}

function exercicioNox(nivel: Nivel, rng: Rng): Exercicio<Resposta> {
  // Sorteia até achar um par cujo nox saia da regra da soma zero — o que
  // exclui, por construção, os peróxidos e os nox fracionários.
  let par = sortearPar(rng);
  let resultado = noxDoElemento(par.formula, par.cation.simbolo);

  for (let tentativa = 0; resultado === undefined && tentativa < 20; tentativa += 1) {
    par = sortearPar(rng);
    resultado = noxDoElemento(par.formula, par.cation.simbolo);
  }

  const formulaEscrita = comSubscritos(par.formula);
  const texto = enunciadoTrilingue(NOX, [par.cation.simbolo, formulaEscrita], DICA_NOX);

  const { passos } = noxComPassos(par.formula, par.cation.simbolo, formulaEscrita)!;
  const certo = resultado!;

  return {
    id: `nom-nox-${par.cation.simbolo}-${par.formula}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: SEM_FORMULA,
    gabarito: numero(certo),
    resolucao: { resultado: numero(certo), passos },
    conceitos: ['nomenclatura.nox', 'nomenclatura.binario'],
    armadilhas: semColisoes(
      [
        {
          resposta: numero(-certo),
          diagnostico:
            'O sinal está trocado. O metal perde elétrons, e por isso o nox dele é positivo; ' +
            'o negativo é do elemento que recebe.',
          passo: 3,
          conceito: 'nomenclatura.nox',
        },
        {
          // A carga total a compensar, sem dividir pelo índice do metal: é o
          // erro de esquecer que os dois ferros de Fe₂O₃ repartem a conta.
          resposta: numero(
            Math.abs(par.anion.carga) * (lerFormula(par.formula)!.get(par.anion.simbolo) ?? 1),
          ),
          diagnostico:
            'A carga total do outro elemento não foi dividida pelo índice do metal. Se há dois ' +
            'átomos do metal, eles repartem a conta entre si.',
          passo: 2,
          conceito: 'nomenclatura.nox',
        },
      ],
      numero(certo),
      geradorNomenclatura.saoEquivalentes!,
    ),
    dica: texto.dica,
  };
}
