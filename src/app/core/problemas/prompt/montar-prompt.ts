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

/** As quatro dificuldades, na ordem em que se ensina. */
export const NIVEIS: readonly Nivel[] = ['facil', 'medio', 'dificil', 'extremo'];

export type Nivel = 'facil' | 'medio' | 'dificil' | 'extremo';

/** O que um dos espaços reservados representa na história. */
export interface DadoDoProblema {
  /** O índice da lacuna: 0 vira `{0}`. */
  readonly indice: number;
  /** O que esse valor é, em português, para a LLM entender o papel dele. */
  readonly significado: string;
  /** Inteiro de contagem, decimal de medida, ou dinheiro. */
  readonly tipo: 'inteiro' | 'decimal' | 'dinheiro' | 'formula';
  /** A faixa que o gerador sorteia, quando ela restringe a história. */
  readonly faixa?: readonly [number, number];
}

export interface PedidoDeProblema {
  /** O tópico, com o nome que ele tem no site. */
  readonly topico: string;
  /** O que a conta exercita — `resolver ax + b = c para x`. */
  readonly oQueExercita: string;
  /**
   * A relação exata que a história tem de expressar, com as lacunas.
   *
   * Existe por um defeito real: sem ela, descrever `{1}` como «uma parcela
   * fixa» fez o modelo escrever «já completou {1} viagens» — o que significa
   * `{2} − {0}×{1}`, outra conta. Seis de oito histórias saíram assim. Dizer
   * `{0} × x + {1} = {2}` não entrega a resposta (ninguém sabe os números),
   * entrega a FORMA, que é o que a história precisa respeitar.
   */
  readonly relacao: string;
  /**
   * As dificuldades pedidas NESTE lote.
   *
   * Era um nível só, e a fila pedia um lote por nível: quatro pedidos para
   * cobrir os quatro níveis, e o aluno via sempre o mesmo grau de leitura
   * enquanto os outros três não chegavam. Agora um lote cobre os quatro de
   * uma vez — a LLM recebe a carga de leitura de cada um e devolve, para cada
   * problema, o nível a que ele pertence. Quem separa é o código, pela
   * etiqueta que veio junto.
   */
  readonly niveis: readonly Nivel[];
  /** Os valores que o gerador vai substituir, em ordem. */
  readonly dados: readonly DadoDoProblema[];
  /** O que a resposta representa — `quantas horas de serviço`. */
  readonly pergunta: string;
  /** A unidade da resposta, quando há uma. */
  readonly unidade?: string;
  /** Quantas histórias pedir POR NÍVEL. */
  readonly quantas: number;
  /** Contextos preferidos, para a história não ser sempre de loja. */
  readonly contextos?: readonly string[];
  /**
   * Palavras que este tópico não aceita no texto.
   *
   * Em química são as que classificam a substância: a LLM recebeu a fórmula,
   * não a identidade, e chamar H₂O de «sal» é química falsa com aparência de
   * verdadeira. O validador recusa quem as usa, então a lista serve duas
   * vezes — como instrução e como portão.
   */
  readonly proibidas?: readonly string[];
  /**
   * Números por extenso que este tópico aceita.
   *
   * A regra geral recusa «dois», «trois», «two» — um número que o site não
   * sorteou. Mas as melhores histórias de MMC começam com «Dois ônibus
   * partem…», e ali «dois» é o enredo: a história é SOBRE duas coisas. Sem
   * esta exceção a regra atrapalhava justamente o que devia proteger.
   */
  readonly permitidas?: readonly string[];
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
const CARGA_DE_LEITURA: Readonly<Record<Nivel, string>> = {
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
  formula:
    'uma FÓRMULA QUÍMICA que o site escreve (H₂O, CaCO₃) — você não a inventa, só se refere ' +
    'a ela, como em «o reagente {n}»',
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
  'The story must MEAN the given relation exactly — but never write the relation, the letter ' +
    'x, or any variable. The reader turns the situation into algebra: that is the exercise.',
  'Never restate the relation as a different calculation, and never make the unknown appear ' +
    'as a known datum.',
  'Do not write numbers in words either (no "two", "dez", "trois").',
  'Plain prose only: no LaTeX, no markdown, no bullet points, no headings.',
  'No label such as "Problem:", "Answer:" or "Here is". Start with the story.',
  'End with the question, and the question must ask exactly what is requested.',
  'At most two sentences plus the question. It is read on a phone screen.',
  'State the unit of each DATUM when it has one ("{0} grams of {1}"): without it the number ' +
    'means nothing.',
  'Never state the unit or the number of decimal places OF THE ANSWER: the site appends that, ' +
    'and it must match what the corrector requires.',
  'Portuguese from Brazil, French from Quebec, plain international English.',
  'Invent no brand names, no real people and no implausible context.',
  'Never invent a chemical substance, reaction or formula. A placeholder of type FÓRMULA is ' +
    'filled by the site with the real formula: refer to it, do not replace it by a name.',
];


/**
 * Dois exemplos do FORMATO, e de nada mais.
 *
 * Foram o que faltava para o modelo acertar de primeira: sem ver um exemplo,
 * ele oscilava entre escrever os números por conta (recusado pelo portão),
 * repetir a relação em forma de álgebra (o exercício entregue) e embrulhar o
 * JSON em markdown. O exemplo resolve as três de uma vez, porque mostra o
 * formato exato — lacuna no lugar do número, prosa pura, os três idiomas com
 * os mesmos espaços na mesma ordem.
 *
 * O conteúdo é de outro assunto **de propósito**: um exemplo do próprio tópico
 * vira molde, e o aluno recebe seis variações da mesma história. Por isso o
 * pedido sempre diz «copie o formato, nunca o conteúdo».
 */
const EXEMPLOS = [
  {
    nivel: 'facil',
    pt: 'Uma padaria assa {0} pães por fornada e já tinha {1} pães prontos. Quantos pães ela tem ao todo?',
    fr: 'Une boulangerie cuit {0} pains par fournée et en avait déjà {1} de prêts. Combien de pains a-t-elle en tout ?',
    en: 'A bakery bakes {0} loaves per batch and already had {1} loaves ready. How many loaves does it have in total?',
  },
  {
    nivel: 'dificil',
    pt: 'Um entregador percorre {0} km por viagem. No fim do dia somou {1} km, já contando os {2} km que fez de manhã. Quantas viagens ele fez à tarde?',
    fr: 'Un livreur parcourt {0} km par trajet. En fin de journée, il totalisait {1} km, en comptant les {2} km faits le matin. Combien de trajets a-t-il faits l\u2019après-midi ?',
    en: 'A courier rides {0} km per trip. By the end of the day he had covered {1} km, counting the {2} km he did in the morning. How many trips did he make in the afternoon?',
  },
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

  /*
   * A carga de leitura, um bloco por nível pedido.
   *
   * Escrita assim, e não «nível medio: …», porque a instrução precisa dizer
   * com todas as letras que os níveis convivem no MESMO lote e que cada
   * problema volta etiquetado. Foi o que a versão de um nível só não podia
   * fazer: ela pedia o mesmo grau de leitura seis vezes.
   */
  const niveis = pedido.niveis
    .map((nivel) => `- "${nivel}": ${CARGA_DE_LEITURA[nivel]}`)
    .join('\n');

  const exemplos = EXEMPLOS.map(
    (exemplo) =>
      `  ${JSON.stringify({ nivel: exemplo.nivel, pt: exemplo.pt, fr: exemplo.fr, en: exemplo.en })},`,
  ).join('\n');

  const system = [
    'You write short word problems for a trilingual study site (Portuguese, French, English).',
    'The numbers and the answer belong to the site’s code, not to you.',
    '',
    'RULES:',
    ...REGRAS.map((regra) => `- ${regra}`),
    '',
    'FORMAT — two examples. Copy the FORMAT only.',
    'These examples are about another subject on purpose. Reusing their story, their wording or',
    'their subject is a failure: the student would get the same problem six times.',
    '',
    `{"problemas": [\n${exemplos}\n]}`,
  ].join('\n');

  const user = [
    `Tópico: ${pedido.topico}.`,
    `A conta que o aluno vai fazer: ${pedido.oQueExercita}.`,
    '',
    `RELAÇÃO (instrução para você, NUNCA texto para o aluno): ${pedido.relacao}`,
    'A história tem de significar exatamente essa relação — mas **não a escreva**. Nada de',
    '«x», nada de letra de variável, nada de «está para … como … está para». O aluno lê uma',
    'situação; a álgebra é ele que monta, e montá-la é o exercício.',
    '',
    'O x é DESCONHECIDO. Por isso:',
    '- nunca diga o valor de x, nem dê um dado que seja igual a x;',
    '- nunca escreva uma quantidade de repetições já feitas, nem um «já fez tantas vezes»;',
    '- cada lacuna é uma quantidade CONHECIDA e fixa, que não depende de x.',
    '',
    'Os dados da história, que entram como lacunas:',
    dados,
    '',
    `A pergunta deve cobrar ISTO, dito com as palavras da própria história: ${pedido.pergunta}` +
      `${pedido.unidade ? ` (a resposta sai em ${pedido.unidade})` : ''}.`,
    'Não copie a frase acima. Se a história é de etapas, pergunte «quantas etapas»; se é de',
    'viagens, «quantas viagens». A pergunta tem de soar como parte da situação.',
    '',
    'OS NÍVEIS DESTE LOTE. Cada problema que você escrever leva a etiqueta de um destes, e a',
    'carga de leitura tem de corresponder à etiqueta:',
    niveis,
    '',
    `Escreva ${pedido.quantas} problemas de CADA nível — ${pedido.quantas * pedido.niveis.length} ` +
      'no total —, todos diferentes entre si dentro do mesmo nível.',
    'Trocar só os substantivos, mantendo «faz {0} por etapa, já tinha {1}, totalizando {2}» seis',
    'vezes, não é variedade: é a mesma história com outra roupa. Varie quem age, a ordem em que',
    'os dados aparecem e o jeito de perguntar. Entre níveis, o que muda é a leitura, não a conta.',
    '',
    `Contextos possíveis: ${contextos}. Varie entre eles.`,
    ...(pedido.proibidas === undefined || pedido.proibidas.length === 0
      ? []
      : [
          '',
          `NÃO use estas palavras, em nenhuma das três línguas: ${pedido.proibidas.join(', ')}. ` +
            'Você não sabe o que as fórmulas representam — não classifique as substâncias, ' +
            'não diga que sobra ou falta reagente, e não invente nenhuma etapa da reação.',
        ]),
    '',
    'Cada problema é um objeto com a etiqueta "nivel", e os três textos. Devolva apenas o JSON.',
  ].join('\n');

  const esquema = {
    type: 'object',
    properties: {
      problemas: {
        type: 'array',
        minItems: pedido.quantas * pedido.niveis.length,
        items: {
          type: 'object',
          properties: {
            nivel: { type: 'string', enum: pedido.niveis },
            pt: { type: 'string' },
            fr: { type: 'string' },
            en: { type: 'string' },
          },
          required: ['nivel', 'pt', 'fr', 'en'],
        },
      },
    },
    required: ['problemas'],
  };

  return { system, user, esquema };
}
