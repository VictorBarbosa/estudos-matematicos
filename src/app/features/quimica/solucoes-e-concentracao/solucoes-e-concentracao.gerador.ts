import {
  concentracaoDaMisturaComPassos,
  concentracaoDiluida,
  concentracaoDiluidaComPassos,
  massaEmSolucaoComPassos,
  mediaSimplesDasConcentracoes,
  molaridade,
  molaridadeComPassos,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';
import { enunciadoTrilingue } from '@core/treino/textos/texto-trilingue';
import {
  DICA_DILUICAO,
  DICA_MASSA,
  DICA_MISTURA,
  DICA_MOLARIDADE,
  DILUICAO,
  MASSA_EM_SOLUCAO,
  MISTURA,
  MOLARIDADE,
} from '@features/quimica/solucoes-e-concentracao/solucoes-e-concentracao.textos';

const { saoEquivalentes: proximos, formatar } = numeroComCasas(2, 1e-6);

interface Soluto {
  readonly formula: string;
  readonly massaMolar: number;
}

/** Solutos de bancada, com a massa molar arredondada como a tabela a dá. */
const SOLUTOS: readonly Soluto[] = [
  { formula: 'NaCl', massaMolar: 58.44 },
  { formula: 'KCl', massaMolar: 74.55 },
  { formula: 'NaOH', massaMolar: 40.0 },
  { formula: 'KOH', massaMolar: 56.11 },
  { formula: 'Na₂CO₃', massaMolar: 105.99 },
  { formula: 'CuSO₄', massaMolar: 159.61 },
  { formula: 'AgNO₃', massaMolar: 169.87 },
  { formula: 'C₆H₁₂O₆', massaMolar: 180.16 },
];

/** Volumes de vidraria: os que existem no laboratório, e todos em mL. */
const VOLUMES_ML = [100, 200, 250, 400, 500, 750, 1000];

type Pergunta = 'molaridade' | 'massa' | 'diluicao' | 'mistura';

/**
 * Soluções e concentração — a quantidade que importa é a de cada litro.
 *
 * Uma reação em solução não enxerga quanto há no frasco, e sim quanto há onde
 * ela acontece. Daí a concentração; daí também os dois tropeços que o tópico
 * existe para corrigir: deixar o volume em mililitros (erro de fator mil) e
 * dividir gramas por litro sem passar pelos mols.
 *
 * Os volumes vêm sempre em mL, como na bancada e na prova. Dá-los em litros
 * pouparia o aluno exatamente do erro que ele precisa aprender a não cometer.
 */
export const geradorSolucoes: GeradorExercicio<number> = {
  topicoId: 'solucoes-e-concentracao',
  formatoResposta: 'um número, 2 casas decimais',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'massa':
        return exercicioMassa(nivel, rng);
      case 'diluicao':
        return exercicioDiluicao(nivel, rng);
      case 'mistura':
        return exercicioMistura(nivel, rng);
      default:
        return exercicioMolaridade(nivel, rng);
    }
  },

  analisar: analisarNumero,

  saoEquivalentes: proximos,
  formatar,
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['molaridade', 'massa']);
    case 'medio':
      return rng.escolher<Pergunta>(['molaridade', 'massa', 'diluicao']);
    case 'dificil':
      return rng.escolher<Pergunta>(['massa', 'diluicao', 'mistura']);
    // A mistura exige somar mols E somar volumes: é o único tipo em que a
    // média simples, que parece natural, dá errado.
    case 'extremo':
      return rng.escolher<Pergunta>(['mistura', 'diluicao']);
  }
}

function exercicioMolaridade(nivel: Nivel, rng: Rng): Exercicio<number> {
  const soluto = rng.escolher(SOLUTOS);
  const mililitros = rng.escolher(VOLUMES_ML);
  const litros = mililitros / 1000;

  // Parte-se de uma concentração plausível e volta-se à massa, que é o que a
  // balança mostraria; o gabarito sai dessa massa já arredondada.
  const alvo = rng.inteiro(10, 250) / 100;
  const massa = Number((alvo * litros * soluto.massaMolar).toFixed(2));

  const { resultado, passos } = molaridadeComPassos(
    massa,
    soluto.massaMolar,
    litros,
    soluto.formula,
  );

  const texto = enunciadoTrilingue(
    MOLARIDADE,
    [soluto.formula, massa, mililitros],
    DICA_MOLARIDADE,
  );

  return {
    id: `sol-molar-${soluto.formula}-${massa}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: `C = \\frac{n}{V} \\qquad M_{${soluto.formula}} = ${soluto.massaMolar}\\;\\text{g/mol}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['solucao.concentracao', 'mol.massa-molar'],
    armadilhas: semColisoes(
      [
        {
          resposta: molaridade(massa / soluto.massaMolar, mililitros),
          diagnostico:
            'O volume ficou em mililitros. A concentração é por LITRO, e o fator mil muda ' +
            'tudo: divida os mililitros por 1000 antes.',
          passo: 2,
          conceito: 'solucao.concentracao',
        },
        {
          resposta: massa / litros,
          diagnostico:
            'Isso é a concentração em GRAMAS por litro. A molaridade conta partículas, e ' +
            'por isso a massa precisa virar mols pela massa molar antes da divisão.',
          passo: 1,
          conceito: 'solucao.concentracao',
        },
      ],
      resultado,
      proximos,
    ),
    dica: texto.dica,
  };
}

function exercicioMassa(nivel: Nivel, rng: Rng): Exercicio<number> {
  const soluto = rng.escolher(SOLUTOS);
  const mililitros = rng.escolher(VOLUMES_ML);
  const litros = mililitros / 1000;
  const concentracao = rng.inteiro(10, 250) / 100;

  const { resultado, passos } = massaEmSolucaoComPassos(
    concentracao,
    litros,
    soluto.massaMolar,
    soluto.formula,
  );

  const texto = enunciadoTrilingue(
    MASSA_EM_SOLUCAO,
    [soluto.formula, concentracao, mililitros],
    DICA_MASSA,
  );

  return {
    id: `sol-massa-${soluto.formula}-${mililitros}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: `m = C \\cdot V \\cdot M \\qquad M_{${soluto.formula}} = ${soluto.massaMolar}\\;\\text{g/mol}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['solucao.concentracao', 'mol.massa-molar'],
    armadilhas: semColisoes(
      [
        {
          resposta: concentracao * mililitros * soluto.massaMolar,
          diagnostico:
            'O volume entrou em mililitros, e o resultado ficou mil vezes maior. Passe para ' +
            'litros antes de multiplicar.',
          passo: 2,
          conceito: 'solucao.concentracao',
        },
        {
          resposta: concentracao * litros,
          diagnostico:
            'Essa é a quantidade em MOLS. A pergunta é por massa: falta multiplicar pela ' +
            'massa molar.',
          passo: 3,
          conceito: 'mol.massa-molar',
        },
      ],
      resultado,
      proximos,
    ),
    dica: texto.dica,
  };
}

function exercicioDiluicao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const mililitros = rng.escolher([50, 100, 150, 200, 250]);
  const acrescentados = rng.escolher([100, 150, 200, 250, 300, 400, 500]);
  const concentracao = rng.inteiro(50, 400) / 100;

  const litros = mililitros / 1000;
  const acrescentadosEmLitros = acrescentados / 1000;

  const { resultado, passos } = concentracaoDiluidaComPassos(
    concentracao,
    litros,
    acrescentadosEmLitros,
  );

  const texto = enunciadoTrilingue(
    DILUICAO,
    [concentracao, mililitros, acrescentados],
    DICA_DILUICAO,
  );

  return {
    id: `sol-dil-${mililitros}-${acrescentados}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: 'C_1 V_1 = C_2 V_2',
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['solucao.diluicao', 'solucao.concentracao'],
    armadilhas: semColisoes(
      [
        {
          resposta: concentracaoDiluida(concentracao, litros, acrescentadosEmLitros),
          diagnostico:
            'O volume final é o que havia MAIS a água acrescentada, e não só a água. Some ' +
            'os dois antes de dividir.',
          passo: 2,
          conceito: 'solucao.diluicao',
        },
        {
          resposta: concentracao - resultado,
          diagnostico:
            'A diluição não se calcula por subtração de concentrações. O que se conserva são ' +
            'os mols: a mesma quantidade, espalhada em mais litros.',
          passo: 1,
          conceito: 'solucao.diluicao',
        },
      ],
      resultado,
      proximos,
    ),
    dica: texto.dica,
  };
}

function exercicioMistura(nivel: Nivel, rng: Rng): Exercicio<number> {
  const ml1 = rng.escolher([100, 150, 200, 250, 300]);
  // Volumes diferentes de propósito: é a diferença que separa a média
  // ponderada da média simples, e sem ela a armadilha não existiria.
  const ml2 = rng.escolher([400, 450, 500, 600, 750]);

  const c1 = rng.inteiro(20, 150) / 100;
  const c2 = rng.inteiro(200, 400) / 100;

  const litros1 = ml1 / 1000;
  const litros2 = ml2 / 1000;

  const { resultado, passos } = concentracaoDaMisturaComPassos(c1, litros1, c2, litros2);
  const texto = enunciadoTrilingue(MISTURA, [c1, ml1, c2, ml2], DICA_MISTURA);

  return {
    id: `sol-mist-${ml1}-${ml2}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: 'C = \\frac{n_1 + n_2}{V_1 + V_2}',
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['solucao.mistura', 'solucao.concentracao'],
    armadilhas: semColisoes(
      [
        {
          resposta: mediaSimplesDasConcentracoes(c1, c2),
          diagnostico:
            'Essa é a média SIMPLES das concentrações, e ela só acerta quando os dois ' +
            'volumes são iguais. Aqui um frasco traz mais solução que o outro, e por isso ' +
            'pesa mais no resultado.',
          passo: 3,
          conceito: 'solucao.mistura',
        },
        {
          resposta: c1 * litros1 + c2 * litros2,
          diagnostico:
            'Essa é a quantidade total em MOLS. Falta dividir pelo volume somado para voltar ' +
            'a ser concentração.',
          passo: 2,
          conceito: 'solucao.mistura',
        },
      ],
      resultado,
      proximos,
    ),
    dica: texto.dica,
  };
}
