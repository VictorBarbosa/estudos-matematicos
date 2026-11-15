import {
  Participante,
  massaCorrespondente,
  massaCorrespondenteComPassos,
  massaPelaProporcaoCrua,
  molsCorrespondentes,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';
import { enunciadoTrilingue } from '@core/treino/textos/texto-trilingue';
import {
  DICA_PROPORCAO,
  DICA_TRAJETO,
  MASSA_DE_PRODUTO,
  MASSA_DE_REAGENTE,
  MOLS_DE_PRODUTO,
} from '@features/quimica/estequiometria/estequiometria.textos';

const { saoEquivalentes: proximos, formatar } = numeroComCasas(2, 1e-6);

/**
 * As reações do tópico, já balanceadas.
 *
 * Balancear é outro tópico — e vai precisar da canonização de fórmulas, que
 * ainda não existe. Aqui a equação chega pronta, e o que se exerce é usar a
 * proporção dela: que é, afinal, para que o balanceamento serve.
 *
 * São oito reações conhecidas, e não combinações sorteadas, porque uma equação
 * inventada seria química falsa com aparência de verdadeira — o pior tipo de
 * exercício.
 */
interface Reacao {
  readonly tex: string;
  readonly reagentes: readonly Participante[];
  readonly produtos: readonly Participante[];
}

const REACOES: readonly Reacao[] = [
  {
    tex: '2\\,\\text{H}_2 + \\text{O}_2 \\to 2\\,\\text{H}_2\\text{O}',
    reagentes: [
      { formula: 'H₂', coeficiente: 2, massaMolar: 2.02 },
      { formula: 'O₂', coeficiente: 1, massaMolar: 32.0 },
    ],
    produtos: [{ formula: 'H₂O', coeficiente: 2, massaMolar: 18.02 }],
  },
  {
    tex: '\\text{N}_2 + 3\\,\\text{H}_2 \\to 2\\,\\text{NH}_3',
    reagentes: [
      { formula: 'N₂', coeficiente: 1, massaMolar: 28.01 },
      { formula: 'H₂', coeficiente: 3, massaMolar: 2.02 },
    ],
    produtos: [{ formula: 'NH₃', coeficiente: 2, massaMolar: 17.03 }],
  },
  {
    tex: '\\text{CH}_4 + 2\\,\\text{O}_2 \\to \\text{CO}_2 + 2\\,\\text{H}_2\\text{O}',
    reagentes: [
      { formula: 'CH₄', coeficiente: 1, massaMolar: 16.04 },
      { formula: 'O₂', coeficiente: 2, massaMolar: 32.0 },
    ],
    produtos: [
      { formula: 'CO₂', coeficiente: 1, massaMolar: 44.01 },
      { formula: 'H₂O', coeficiente: 2, massaMolar: 18.02 },
    ],
  },
  {
    tex: '2\\,\\text{Na} + \\text{Cl}_2 \\to 2\\,\\text{NaCl}',
    reagentes: [
      { formula: 'Na', coeficiente: 2, massaMolar: 22.99 },
      { formula: 'Cl₂', coeficiente: 1, massaMolar: 70.9 },
    ],
    produtos: [{ formula: 'NaCl', coeficiente: 2, massaMolar: 58.44 }],
  },
  {
    tex: '\\text{CaCO}_3 \\to \\text{CaO} + \\text{CO}_2',
    reagentes: [{ formula: 'CaCO₃', coeficiente: 1, massaMolar: 100.09 }],
    produtos: [
      { formula: 'CaO', coeficiente: 1, massaMolar: 56.08 },
      { formula: 'CO₂', coeficiente: 1, massaMolar: 44.01 },
    ],
  },
  {
    tex: '4\\,\\text{Fe} + 3\\,\\text{O}_2 \\to 2\\,\\text{Fe}_2\\text{O}_3',
    reagentes: [
      { formula: 'Fe', coeficiente: 4, massaMolar: 55.85 },
      { formula: 'O₂', coeficiente: 3, massaMolar: 32.0 },
    ],
    produtos: [{ formula: 'Fe₂O₃', coeficiente: 2, massaMolar: 159.69 }],
  },
  {
    tex:
      '\\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\,\\text{O}_2 \\to ' +
      '6\\,\\text{CO}_2 + 6\\,\\text{H}_2\\text{O}',
    reagentes: [
      { formula: 'C₆H₁₂O₆', coeficiente: 1, massaMolar: 180.16 },
      { formula: 'O₂', coeficiente: 6, massaMolar: 32.0 },
    ],
    produtos: [
      { formula: 'CO₂', coeficiente: 6, massaMolar: 44.01 },
      { formula: 'H₂O', coeficiente: 6, massaMolar: 18.02 },
    ],
  },
  {
    tex: '2\\,\\text{H}_2\\text{O}_2 \\to 2\\,\\text{H}_2\\text{O} + \\text{O}_2',
    reagentes: [{ formula: 'H₂O₂', coeficiente: 2, massaMolar: 34.01 }],
    produtos: [
      { formula: 'H₂O', coeficiente: 2, massaMolar: 18.02 },
      { formula: 'O₂', coeficiente: 1, massaMolar: 32.0 },
    ],
  },
];

type Pergunta = 'mols' | 'produto' | 'reagente';

/**
 * Estequiometria — onde o mol vira ferramenta.
 *
 * A equação balanceada dá uma proporção **de contagem**; a balança mede
 * gramas. O tópico inteiro é o trajeto que liga os dois:
 *
 *     massa de A → mols de A → mols de B → massa de B
 *
 * O erro clássico é pular o meio, aplicando a proporção direto sobre as
 * massas. Ele sai plausível — é um número da mesma ordem de grandeza —, e por
 * isso tem armadilha própria em toda pergunta de massa.
 */
export const geradorEstequiometria: GeradorExercicio<number> = {
  topicoId: 'estequiometria',
  formatoResposta: 'um número, 2 casas decimais',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'reagente':
        return exercicioMassaDeReagente(nivel, rng);
      case 'produto':
        return exercicioMassaDeProduto(nivel, rng);
      default:
        return exercicioMols(nivel, rng);
    }
  },

  analisar: analisarNumero,

  saoEquivalentes: proximos,
  formatar,
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['mols', 'produto']);
    case 'medio':
      return rng.escolher<Pergunta>(['mols', 'produto', 'reagente']);
    case 'dificil':
      return rng.escolher<Pergunta>(['produto', 'reagente', 'mols']);
    // Partir do produto obriga a ler a proporção ao contrário, que é onde a
    // razão se inverte e o erro passa despercebido.
    case 'extremo':
      return rng.escolher<Pergunta>(['reagente', 'produto']);
  }
}

/** Um par (origem, destino) de participantes distintos da mesma reação. */
function parDe(reacao: Reacao, rng: Rng, doProduto: boolean): [Participante, Participante] {
  const origem = doProduto ? rng.escolher(reacao.produtos) : rng.escolher(reacao.reagentes);
  const destino = doProduto ? rng.escolher(reacao.reagentes) : rng.escolher(reacao.produtos);

  return [origem, destino];
}

function exercicioMols(nivel: Nivel, rng: Rng): Exercicio<number> {
  const reacao = rng.escolher(REACOES);
  const [de, para] = parDe(reacao, rng, false);
  const mols = rng.inteiro(5, 40) / 10;
  const resultado = molsCorrespondentes(mols, de, para);

  const texto = enunciadoTrilingue(
    MOLS_DE_PRODUTO,
    [de.formula, para.formula, mols],
    DICA_PROPORCAO,
  );

  return {
    id: `esteq-mols-${de.formula}-${para.formula}-${mols}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: reacao.tex,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'A equação balanceada dá a proporção em mols.',
          tex: reacao.tex,
          nota: `Os coeficientes dizem ${de.coeficiente} de ${de.formula} para ${para.coeficiente} de ${para.formula}.`,
        },
        {
          descricao: 'A razão age direto sobre a quantidade.',
          tex:
            `n = ${mols} \\times \\frac{${para.coeficiente}}{${de.coeficiente}} = ` +
            `${Number(resultado.toFixed(4))}\\;\\text{mol}`,
          nota: 'Aqui não há massa no caminho: a pergunta já veio e já sai em mols.',
        },
      ],
    },
    conceitos: ['esteq.proporcao', 'mol.conceito'],
    armadilhas: semColisoes(
      [
        {
          // A razão invertida: o erro que não se percebe pelo resultado.
          resposta: (mols * de.coeficiente) / para.coeficiente,
          diagnostico:
            `A razão está de cabeça para baixo. Para cada ${de.coeficiente} de ${de.formula} ` +
            `saem ${para.coeficiente} de ${para.formula}, então o coeficiente de ` +
            `${para.formula} vai em cima.`,
          passo: 1,
          conceito: 'esteq.proporcao',
        },
        {
          resposta: mols,
          diagnostico:
            'Você manteve a quantidade. Ela só não muda quando os dois coeficientes são ' +
            'iguais — e aqui eles não são.',
          passo: 1,
          conceito: 'esteq.proporcao',
        },
      ],
      resultado,
      proximos,
    ),
    dica: texto.dica,
  };
}

function exercicioMassaDeProduto(nivel: Nivel, rng: Rng): Exercicio<number> {
  const reacao = rng.escolher(REACOES);
  const [de, para] = parDe(reacao, rng, false);
  const massa = Number((de.massaMolar * (rng.inteiro(5, 40) / 10)).toFixed(2));

  const { resultado, passos } = massaCorrespondenteComPassos(massa, de, para, reacao.tex);
  const texto = enunciadoTrilingue(
    MASSA_DE_PRODUTO,
    [de.formula, para.formula, massa],
    DICA_TRAJETO,
  );

  return {
    id: `esteq-prod-${de.formula}-${para.formula}-${massa}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: reacao.tex,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['esteq.massa', 'esteq.proporcao'],
    armadilhas: semColisoes(
      [
        {
          // Pular o meio do trajeto: o erro clássico do tópico.
          resposta: massaPelaProporcaoCrua(massa, de, para),
          diagnostico:
            'Você aplicou a proporção direto sobre as massas. Os coeficientes contam ' +
            'MOLÉCULAS, não gramas — é preciso passar pelos mols antes e depois.',
          passo: 1,
          conceito: 'esteq.massa',
        },
        {
          // A razão invertida no meio do trajeto.
          resposta: massaCorrespondente(massa, para, de),
          diagnostico:
            'A razão entrou invertida. Confira qual coeficiente vai em cima: o da substância ' +
            'que se PROCURA.',
          passo: 2,
          conceito: 'esteq.proporcao',
        },
        {
          resposta: massa / de.massaMolar,
          diagnostico:
            'Esse é o número de MOLS do reagente — o primeiro trecho do trajeto. Ainda faltam ' +
            'a proporção e a volta para gramas.',
          passo: 1,
          conceito: 'esteq.massa',
        },
      ],
      resultado,
      proximos,
    ),
    dica: texto.dica,
  };
}

function exercicioMassaDeReagente(nivel: Nivel, rng: Rng): Exercicio<number> {
  const reacao = rng.escolher(REACOES);
  const [produto, reagente] = parDe(reacao, rng, true);
  const massa = Number((produto.massaMolar * (rng.inteiro(5, 40) / 10)).toFixed(2));

  const { resultado, passos } = massaCorrespondenteComPassos(massa, produto, reagente, reacao.tex);
  const texto = enunciadoTrilingue(
    MASSA_DE_REAGENTE,
    [produto.formula, reagente.formula, massa],
    DICA_TRAJETO,
  );

  return {
    id: `esteq-reag-${produto.formula}-${reagente.formula}-${massa}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: reacao.tex,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['esteq.massa', 'esteq.proporcao'],
    armadilhas: semColisoes(
      [
        {
          resposta: massaPelaProporcaoCrua(massa, produto, reagente),
          diagnostico:
            'Você aplicou a proporção direto sobre as massas. Os coeficientes contam ' +
            'MOLÉCULAS, não gramas.',
          passo: 1,
          conceito: 'esteq.massa',
        },
        {
          resposta: massaCorrespondente(massa, reagente, produto),
          diagnostico:
            'A razão entrou invertida. Partindo do PRODUTO, o coeficiente do reagente é que ' +
            'vai em cima.',
          passo: 2,
          conceito: 'esteq.proporcao',
        },
      ],
      resultado,
      proximos,
    ),
    dica: texto.dica,
  };
}
