/**
 * O pedido que se faz à LLM — e o que ela deliberadamente não recebe.
 *
 * Ela recebe: o assunto, o que se exercita, o nível de leitura, o que cada
 * espaço reservado significa, a grandeza que a pergunta cobra e a unidade.
 * Ela NÃO recebe: os números do exercício, nem a resposta, nem os passos. Não
 * é desconfiança — é que ela não precisa, e o que ela não vê não pode
 * contradizer.
 *
 * O formato com lacunas (`{0}`, `{1}`) é o que faz isso funcionar. Sem ele, a
 * LLM escreveria os números e o código não teria como saber qual conta o texto
 * pede; com ele, uma história serve para infinitos sorteios, e o separador
 * decimal de cada idioma fica por conta de `numeroEscrito`, que já existe.
 *
 * Como `validar-modelo`, este arquivo não importa nada: o mesmo prompt é
 * montado no navegador e no script que compara modelos.
 */

/** O que um dos espaços reservados representa na história. */
export interface DadoDoProblema {
  /** O índice da lacuna: 0 vira `{0}`. */
  readonly indice: number;
  /** O que esse valor é, em português, para a LLM entender o papel dele. */
  readonly significado: string;
  /** Inteiro de contagem, decimal de medida, ou dinheiro. */
  readonly tipo: 'inteiro' | 'decimal' | 'dinheiro';
  /** A faixa que o gerador sorteia, quando ela restringe a história. */
  readonly faixa?: readonly [number, number];
}

export interface PedidoDeProblema {
  /** O tópico, com o nome que ele tem no site. */
  readonly topico: string;
  /** O que a conta exercita — `resolver ax + b = c para x`. */
  readonly oQueExercita: string;
  readonly nivel: 'facil' | 'medio' | 'dificil' | 'extremo';
  /** Os valores que o gerador vai substituir, em ordem. */
  readonly dados: readonly DadoDoProblema[];
  /** O que a resposta representa — `quantas horas de serviço`. */
  readonly pergunta: string;
  /** A unidade da resposta, quando há uma. */
  readonly unidade?: string;
  /** Quantas histórias pedir de uma vez. */
  readonly quantas: number;
  /** Contextos preferidos, para a história não ser sempre de loja. */
  readonly contextos?: readonly string[];
}

/**
 * O que cada nível significa — em CARGA DE LEITURA, não em dificuldade de
 * conta.
 *
 * A conta é do código e não muda: ela já vem sorteada no nível certo. O que a
 * LLM controla é quanto trabalho de interpretação o texto exige, e é só isso
 * que se pede a ela. Confundir as duas coisas daria um enunciado fácil com
 * números difíceis, ou o contrário.
 */
const CARGA_DE_LEITURA: Readonly<Record<PedidoDeProblema['nivel'], string>> = {
  facil:
    'uma situação direta, com os dados na ordem em que serão usados e uma pergunta só. ' +
    'Nada de informação que não entre na conta.',
  medio:
    'uma situação com um pequeno desvio: os dados podem vir em outra ordem, e a pergunta ' +
    'pode nomear a grandeza em vez de apontar o número.',
  dificil:
    'uma situação de duas etapas de leitura, em que é preciso decidir qual dado serve para ' +
    'quê antes de começar. Ainda sem dado inútil.',
  extremo:
    'uma situação realista e um pouco mais longa, em que a relação entre os dados precisa ser ' +
    'inferida do contexto — mas todos os dados dados ainda são usados.',
};

const TIPO_EM_PALAVRAS: Readonly<Record<DadoDoProblema['tipo'], string>> = {
  inteiro: 'um número inteiro de contagem (pessoas, peças, voltas)',
  decimal: 'uma medida, que pode ter casas decimais',
  dinheiro: 'um valor em dinheiro, com centavos',
};

/**
 * As regras são repetidas em inglês de propósito.
 *
 * Modelos abertos seguem instrução melhor em inglês que em português, e a
 * tarefa aqui é obedecer a um formato — não escrever bonito. O que precisa
 * sair bonito são os três textos, e para esses a instrução é na língua de
 * cada um.
 */
const REGRAS = [
  'Write ONE short word problem and give it in Portuguese, French and English.',
  'The three versions must tell the SAME story, not three different stories.',
  'NEVER write a digit. Every number is a placeholder: {0}, {1}, {2}...',
  'Use each placeholder exactly once, and in the SAME ORDER in the three languages.',
  'Never state, hint at or compute the answer. You do not know the numbers.',
  'Do not write numbers in words either (no "two", "dez", "trois").',
  'Plain prose only: no LaTeX, no markdown, no bullet points, no headings.',
  'No label such as "Problem:", "Answer:" or "Here is". Start with the story.',
  'End with the question, and the question must ask exactly what is requested.',
  'At most two sentences plus the question. It is read on a phone screen.',
  'Do not state the unit or the number of decimal places: the site appends that.',
  'Portuguese from Brazil, French from Quebec, plain international English.',
  'Invent no brand names, no real people and no implausible context.',
];

export interface PromptDeProblema {
  readonly system: string;
  readonly user: string;
  /** O esquema que o Ollama usa para devolver JSON válido. */
  readonly esquema: unknown;
}

export function montarPrompt(pedido: PedidoDeProblema): PromptDeProblema {
  const dados = [...pedido.dados]
    .sort((a, b) => a.indice - b.indice)
    .map((dado) => {
      const faixa = dado.faixa === undefined ? '' : `, entre ${dado.faixa[0]} e ${dado.faixa[1]}`;

      return `- {${dado.indice}} = ${dado.significado} — ${TIPO_EM_PALAVRAS[dado.tipo]}${faixa}`;
    })
    .join('\n');

  const contextos =
    pedido.contextos === undefined || pedido.contextos.length === 0
      ? 'oficina, laboratório, obra, cozinha industrial, voo, transporte'
      : pedido.contextos.join(', ');

  const system = [
    'You write short word problems for a trilingual study site (Portuguese, French, English).',
    'The numbers and the answer belong to the site’s code, not to you.',
    '',
    'RULES:',
    ...REGRAS.map((regra) => `- ${regra}`),
  ].join('\n');

  const user = [
    `Tópico: ${pedido.topico}.`,
    `A conta que o aluno vai fazer: ${pedido.oQueExercita}.`,
    '',
    'Os dados da história, que entram como lacunas:',
    dados,
    '',
    `A pergunta deve cobrar: ${pedido.pergunta}${pedido.unidade ? ` (a resposta sai em ${pedido.unidade})` : ''}.`,
    `Carga de leitura (nível ${pedido.nivel}): ${CARGA_DE_LEITURA[pedido.nivel]}`,
    `Contextos possíveis: ${contextos}. Varie entre eles.`,
    '',
    `Escreva ${pedido.quantas} problemas DIFERENTES entre si — contextos diferentes, não o ` +
      'mesmo texto com outra palavra.',
    'Devolva apenas o JSON pedido.',
  ].join('\n');

  const esquema = {
    type: 'object',
    properties: {
      problemas: {
        type: 'array',
        minItems: pedido.quantas,
        items: {
          type: 'object',
          properties: {
            pt: { type: 'string' },
            fr: { type: 'string' },
            en: { type: 'string' },
          },
          required: ['pt', 'fr', 'en'],
        },
      },
    },
    required: ['problemas'],
  };

  return { system, user, esquema };
}
