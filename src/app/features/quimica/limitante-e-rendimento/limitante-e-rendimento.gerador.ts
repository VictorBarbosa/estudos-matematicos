import {
  Participante,
  ReagenteDisponivel,
  acharLimitante,
  massaDeProduto,
  massaDeProdutoComPassos,
  massaQueSobra,
  rendimento,
  rendimentoComPassos,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';
import { enunciadoTrilingue } from '@core/treino/textos/texto-trilingue';
import {
  DICA_LIMITANTE,
  DICA_RENDIMENTO,
  DICA_SOBRA,
  MASSA_DE_PRODUTO,
  MASSA_QUE_SOBRA,
  RENDIMENTO,
} from '@features/quimica/limitante-e-rendimento/limitante-e-rendimento.textos';

const { saoEquivalentes: proximos, formatar } = numeroComCasas(2, 1e-6);

/** Reações de dois reagentes, já balanceadas. */
interface Reacao {
  readonly tex: string;
  readonly primeiro: Participante;
  readonly segundo: Participante;
  readonly produto: Participante;
}

const REACOES: readonly Reacao[] = [
  {
    tex: '2\\,\\text{H}_2 + \\text{O}_2 \\to 2\\,\\text{H}_2\\text{O}',
    primeiro: { formula: 'H₂', coeficiente: 2, massaMolar: 2.02 },
    segundo: { formula: 'O₂', coeficiente: 1, massaMolar: 32.0 },
    produto: { formula: 'H₂O', coeficiente: 2, massaMolar: 18.02 },
  },
  {
    tex: '\\text{N}_2 + 3\\,\\text{H}_2 \\to 2\\,\\text{NH}_3',
    primeiro: { formula: 'N₂', coeficiente: 1, massaMolar: 28.01 },
    segundo: { formula: 'H₂', coeficiente: 3, massaMolar: 2.02 },
    produto: { formula: 'NH₃', coeficiente: 2, massaMolar: 17.03 },
  },
  {
    tex: '2\\,\\text{Na} + \\text{Cl}_2 \\to 2\\,\\text{NaCl}',
    primeiro: { formula: 'Na', coeficiente: 2, massaMolar: 22.99 },
    segundo: { formula: 'Cl₂', coeficiente: 1, massaMolar: 70.9 },
    produto: { formula: 'NaCl', coeficiente: 2, massaMolar: 58.44 },
  },
  {
    tex: '4\\,\\text{Fe} + 3\\,\\text{O}_2 \\to 2\\,\\text{Fe}_2\\text{O}_3',
    primeiro: { formula: 'Fe', coeficiente: 4, massaMolar: 55.85 },
    segundo: { formula: 'O₂', coeficiente: 3, massaMolar: 32.0 },
    produto: { formula: 'Fe₂O₃', coeficiente: 2, massaMolar: 159.69 },
  },
  {
    tex: '\\text{CH}_4 + 2\\,\\text{O}_2 \\to \\text{CO}_2 + 2\\,\\text{H}_2\\text{O}',
    primeiro: { formula: 'CH₄', coeficiente: 1, massaMolar: 16.04 },
    segundo: { formula: 'O₂', coeficiente: 2, massaMolar: 32.0 },
    produto: { formula: 'CO₂', coeficiente: 1, massaMolar: 44.01 },
  },
  {
    tex:
      '\\text{CaCO}_3 + 2\\,\\text{HCl} \\to \\text{CaCl}_2 + ' +
      '\\text{H}_2\\text{O} + \\text{CO}_2',
    primeiro: { formula: 'CaCO₃', coeficiente: 1, massaMolar: 100.09 },
    segundo: { formula: 'HCl', coeficiente: 2, massaMolar: 36.46 },
    produto: { formula: 'CO₂', coeficiente: 1, massaMolar: 44.01 },
  },
];

type Pergunta = 'produto' | 'sobra' | 'rendimento';

/**
 * Reagente limitante e rendimento — o que acontece quando um reagente acaba.
 *
 * Numa receita de dois ingredientes, não adianta ter farinha para vinte bolos
 * se há ovo para três. O erro de quem está aprendendo é escolher o limitante
 * **pela massa**; o que decide é a quantidade em mols dividida pelo
 * coeficiente, porque é essa razão que diz quantas vezes a reação cabe.
 *
 * O sorteio garante que um reagente limite de verdade — sem isso, metade dos
 * exercícios teria os dois acabando juntos, e a pergunta perderia o sentido.
 */
export const geradorLimitante: GeradorExercicio<number> = {
  topicoId: 'limitante-e-rendimento',
  formatoResposta: 'um número, 2 casas decimais',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'sobra':
        return exercicioSobra(nivel, rng);
      case 'rendimento':
        return exercicioRendimento(nivel, rng);
      default:
        return exercicioProduto(nivel, rng);
    }
  },

  analisar: analisarNumero,

  saoEquivalentes: proximos,
  formatar,
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['produto', 'rendimento']);
    case 'medio':
      return rng.escolher<Pergunta>(['produto', 'rendimento', 'sobra']);
    case 'dificil':
      return rng.escolher<Pergunta>(['produto', 'sobra', 'rendimento']);
    // O que sobra exige achar o limitante E voltar ao outro reagente: são as
    // duas metades do tópico numa pergunta só.
    case 'extremo':
      return rng.escolher<Pergunta>(['sobra', 'produto']);
  }
}

/**
 * Duas massas em que um reagente limita com folga.
 *
 * A folga é de propósito: com as receitas muito próximas, a resposta dependeria
 * da terceira casa decimal, e o exercício viraria teste de arredondamento em
 * vez de teste de conceito.
 */
function massasComLimitante(
  reacao: Reacao,
  rng: Rng,
): { primeiro: ReagenteDisponivel; segundo: ReagenteDisponivel } {
  const receitasBase = rng.inteiro(10, 40) / 10;
  const folga = rng.inteiro(15, 40) / 10;
  const primeiroLimita = rng.escolher([true, false]);

  const receitasDoPrimeiro = primeiroLimita ? receitasBase : receitasBase * folga;
  const receitasDoSegundo = primeiroLimita ? receitasBase * folga : receitasBase;

  const massaDe = (p: Participante, receitas: number): number =>
    Number((receitas * p.coeficiente * p.massaMolar).toFixed(2));

  return {
    primeiro: {
      participante: reacao.primeiro,
      massa: massaDe(reacao.primeiro, receitasDoPrimeiro),
    },
    segundo: { participante: reacao.segundo, massa: massaDe(reacao.segundo, receitasDoSegundo) },
  };
}

function exercicioProduto(nivel: Nivel, rng: Rng): Exercicio<number> {
  const reacao = rng.escolher(REACOES);
  const { primeiro, segundo } = massasComLimitante(reacao, rng);

  const { resultado, passos } = massaDeProdutoComPassos(
    primeiro,
    segundo,
    reacao.produto,
    reacao.tex,
  );

  const texto = enunciadoTrilingue(
    MASSA_DE_PRODUTO,
    [
      reacao.primeiro.formula,
      primeiro.massa,
      reacao.segundo.formula,
      segundo.massa,
      reacao.produto.formula,
    ],
    DICA_LIMITANTE,
  );

  const analise = acharLimitante(primeiro, segundo);

  // O que sairia se o aluno usasse o reagente em excesso como base.
  const peloExcesso =
    analise.receitasDoExcesso * reacao.produto.coeficiente * reacao.produto.massaMolar;

  return {
    id: `lim-prod-${reacao.produto.formula}-${primeiro.massa}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: reacao.tex,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['limitante.escolha', 'esteq.massa'],
    armadilhas: semColisoes(
      [
        {
          resposta: peloExcesso,
          diagnostico:
            'Você usou como base o reagente que SOBRA. Quem decide quanto se forma é o que ' +
            'acaba primeiro — o resto do outro fica parado.',
          passo: 3,
          conceito: 'limitante.escolha',
        },
        {
          resposta: primeiro.massa + segundo.massa,
          diagnostico:
            'Somar as massas daria o produto apenas se tudo reagisse e nada sobrasse. Com um ' +
            'reagente em excesso, parte dessa massa continua ali depois da reação.',
          passo: 4,
          conceito: 'limitante.escolha',
        },
      ],
      resultado,
      proximos,
    ),
    dica: texto.dica,
  };
}

function exercicioSobra(nivel: Nivel, rng: Rng): Exercicio<number> {
  const reacao = rng.escolher(REACOES);
  const { primeiro, segundo } = massasComLimitante(reacao, rng);

  const resultado = massaQueSobra(primeiro, segundo);
  const analise = acharLimitante(primeiro, segundo);

  const texto = enunciadoTrilingue(
    MASSA_QUE_SOBRA,
    [
      reacao.primeiro.formula,
      primeiro.massa,
      reacao.segundo.formula,
      segundo.massa,
      reacao.produto.formula,
    ],
    DICA_SOBRA,
  );

  const consumido = analise.excesso.massa - resultado;

  return {
    id: `lim-sobra-${reacao.primeiro.formula}-${primeiro.massa}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: reacao.tex,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        ...massaDeProdutoComPassos(primeiro, segundo, reacao.produto, reacao.tex).passos.slice(
          0,
          4,
        ),
        {
          descricao: `O excesso, ${analise.excesso.participante.formula}, gastou só o que as receitas pediram.`,
          tex:
            `m_{\\text{gasto}} = ${Number(analise.receitasDoLimitante.toFixed(4))} \\times ` +
            `${analise.excesso.participante.coeficiente} \\times ` +
            `${analise.excesso.participante.massaMolar} = ${Number(consumido.toFixed(4))}\\;\\text{g}`,
        },
        {
          descricao: 'O que sobra é a diferença.',
          tex:
            `m_{\\text{sobra}} = ${Number(analise.excesso.massa.toFixed(2))} - ` +
            `${Number(consumido.toFixed(4))} = ${Number(resultado.toFixed(4))}\\;\\text{g}`,
          nota: 'Do limitante não sobra nada: é essa a definição dele.',
        },
      ],
    },
    conceitos: ['limitante.excesso', 'limitante.escolha'],
    armadilhas: semColisoes(
      [
        {
          resposta: consumido,
          diagnostico:
            'Esse é o quanto do excesso foi CONSUMIDO. O que sobra é o que havia menos isso.',
          passo: 5,
          conceito: 'limitante.excesso',
        },
        {
          resposta: analise.limitante.massa,
          diagnostico:
            'Essa é a massa do limitante, e dele não sobra nada — é justamente por acabar ' +
            'primeiro que ele limita.',
          passo: 4,
          conceito: 'limitante.escolha',
        },
      ],
      resultado,
      proximos,
    ),
    dica: texto.dica,
  };
}

function exercicioRendimento(nivel: Nivel, rng: Rng): Exercicio<number> {
  const reacao = rng.escolher(REACOES);
  const { primeiro, segundo } = massasComLimitante(reacao, rng);

  const teorica = Number(massaDeProduto(primeiro, segundo, reacao.produto).toFixed(2));
  // Rendimentos de bancada: entre 55% e 95%.
  const obtida = Number((teorica * (rng.inteiro(55, 95) / 100)).toFixed(2));

  const { resultado, passos } = rendimentoComPassos(obtida, teorica, reacao.produto.formula);
  const texto = enunciadoTrilingue(
    RENDIMENTO,
    [reacao.produto.formula, teorica, obtida],
    DICA_RENDIMENTO,
  );

  return {
    id: `lim-rend-${reacao.produto.formula}-${obtida}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: `m_{\\text{obtida}} = ${obtida} \\qquad m_{\\text{teórica}} = ${teorica}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['limitante.rendimento'],
    armadilhas: semColisoes(
      [
        {
          resposta: rendimento(teorica, obtida),
          diagnostico:
            'A fração está invertida, e por isso o resultado passou de 100%. O obtido vai em ' +
            'cima: compara-se o que saiu com o que era possível.',
          passo: 1,
          conceito: 'limitante.rendimento',
        },
        {
          resposta: teorica - obtida,
          diagnostico:
            'Essa é a massa PERDIDA, em gramas. O rendimento é uma porcentagem: a razão entre ' +
            'o obtido e o teórico, vezes cem.',
          passo: 1,
          conceito: 'limitante.rendimento',
        },
      ],
      resultado,
      proximos,
    ),
    dica: texto.dica,
  };
}
