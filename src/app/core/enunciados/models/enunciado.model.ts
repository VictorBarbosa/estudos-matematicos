import { Idioma } from '@core/i18n/models/i18n.model';
import { numeroEscrito } from '@core/treino/textos/numero-escrito';
import { Exercicio, GeradorExercicio, Nivel } from '@core/treino/models/treino.model';
import { Rng } from '@core/treino/rng/rng';
import { ENTRADAS_DE_ENUNCIADO } from '@core/enunciados/enunciados/catalogo';

/**
 * O banco de enunciados escritos à mão.
 *
 * Um arquivo JSON, uma entrada por exercício, e o site sorteia uma entrada do
 * tópico e do nível em que o aluno está. Acrescentar uma pergunta é
 * acrescentar um objeto ao arquivo; tirar é apagar o objeto. Nada de código.
 *
 * ## Por que o `total` passa pelo `analisar` do tópico
 *
 * O arquivo guarda a resposta como TEXTO — `"43"`, `"3/4"`, `"90"` —, e cada
 * tópico tem o seu próprio tipo de resposta: número, fração, raiz, ou o par
 * número-ou-fórmula da química. Em vez de o banco adivinhar o tipo, ele pede
 * ao gerador do tópico que leia o texto: `analisar` é exatamente a função que
 * o site já usa para ler o que o aluno digita. Assim uma entrada de um tópico
 * de fração vira gabarito de fração sem uma linha a mais, e uma resposta que
 * o tópico não sabe ler é recusada pelo guarda, no teste, antes de chegar à
 * tela.
 *
 * ## O que o banco NÃO traz
 *
 * Armadilhas e diagnósticos. Eles dependem de saber qual erro produz qual
 * número, e isso é o que os 135 geradores fazem com a conta na mão. Uma
 * entrada do banco é uma pergunta correta com uma resposta correta; quando o
 * aluno erra, ele vê que errou, sem o «você somou numeradores com
 * denominadores no passo 3». É a troca consciente que o formato de arquivo
 * pede, e é por isso que o banco COMPLEMENTA os geradores em vez de
 * substituí-los.
 */

/**
 * Uma entrada do arquivo, exatamente como ela é escrita.
 *
 * O arquivo guarda duas naturezas de entrada, e é o que ela TRAZ que diz qual
 * é:
 *
 * - com `nivel` e `dados-calculo`, é uma **pergunta pronta** — os números já
 *   estão escritos, e `total` é a resposta;
 * - com `forma` e sem `dados-calculo`, é um **molde** — o texto da pergunta
 *   que um gerador monta, e os números chegam dele a cada sorteio.
 *
 * São o mesmo arquivo de propósito: para quem escreve, as duas são a mesma
 * coisa — o texto de uma pergunta, com lacunas `{dados-calculo.x}` —, e
 * separá-las em dois arquivos obrigaria a decidir, antes de escrever, de qual
 * lado a pergunta cai.
 */
export interface EnunciadoDoBanco {
  /** O identificador do tópico, como ele aparece no currículo. */
  readonly topico: string;
  /** O nível, nas perguntas prontas. Os moldes não têm: quem decide é o gerador. */
  readonly nivel?: string;
  /** Qual pergunta este molde faz. Só nos moldes. */
  readonly forma?: string;
  /** O texto nas três línguas. `br` é o português, como no arquivo. */
  /**
   * O texto. `br` é o português e é obrigatório; `fr` e `en` são opcionais.
   *
   * Opcionais por causa dos moldes: 110 dos geradores do site nunca tiveram
   * tradução de enunciado — o texto deles existia só em português, dentro do
   * `.ts`. Exigir as três línguas significaria traduzir novecentas frases
   * antes de poder mover qualquer uma. Sem o campo, a tela cai no português,
   * que é o que ela já fazia; com ele, passa a traduzir — e traduzir vira
   * preencher um campo neste arquivo, não editar um gerador.
   */
  readonly enunciado: {
    readonly br: string;
    readonly fr?: string;
    readonly en?: string;
  };
  /**
   * A dica, quando a pergunta tem uma.
   *
   * Dica é texto que o aluno lê, como o enunciado, e com as mesmas lacunas —
   * «o frete é cobrado uma vez, não por {dados-calculo.q} cadernos». Deixá-la
   * no gerador enquanto o enunciado sai seria partir a mesma pergunta em dois
   * lugares.
   */
  readonly dica?: {
    readonly br: string;
    readonly fr?: string;
    readonly en?: string;
  };
  /**
   * Os valores que entram no texto, mais o `total`.
   *
   * As chaves são livres — `x1`, `base`, `altura` —, e cada uma é referenciada
   * no texto como `{dados-calculo.x1}`. A chave `total` é a única reservada: é
   * a resposta, e não aparece no texto.
   *
   * Os números se escrevem com PONTO decimal («7.5»), porque o separador é do
   * idioma: o site mostra vírgula em português e francês e ponto em inglês.
   */
  readonly 'dados-calculo'?: Readonly<Record<string, string>>;
}

/** A entrada é uma pergunta pronta? Senão, é molde de gerador. */
export function ehPerguntaPronta(entrada: EnunciadoDoBanco): boolean {
  return entrada['dados-calculo'] !== undefined;
}

/** A chave reservada: a resposta de conferência. */
export const CHAVE_DO_TOTAL = 'total';

/**
 * As chaves que podem não aparecer no texto.
 *
 * `total` é a resposta, e escrevê-la no enunciado entregaria o exercício.
 * `acao` é o sinal da operação, e serve ao guarda que refaz a conta: num texto
 * como «ganhou {dados-calculo.acao} {dados-calculo.x2}» ele aparece, e numa
 * prosa natural — «e ganhou mais 26» — não aparece. As duas formas valem.
 */
export const CHAVES_RESERVADAS: readonly string[] = [CHAVE_DO_TOTAL, 'acao'];

/**
 * Um arquivo por PERGUNTA, e aqui tudo vira uma lista plana.
 *
 * O caminho do arquivo é que diz o que a entrada é:
 * `enunciados/fracoes/facil/01.json` é a primeira pergunta pronta de Frações
 * no Fácil, e `enunciados/fracoes/moldes/forma-2.json` é um molde do mesmo
 * tópico. Assim o tópico, o nível e a forma não precisam ser escritos dentro
 * do arquivo — e não há como o arquivo dizer uma coisa e a pasta dizer outra.
 *
 * Aqui eles voltam para dentro de cada entrada, e o resto do site continua
 * vendo uma lista plana: ele procura por tópico e nível, ou por tópico e
 * forma, e não sabe de pasta nenhuma.
 *
 * `as unknown` no meio do caminho porque o TypeScript infere do JSON um tipo
 * fechado — com `x3?: undefined` nas entradas que não usam `x3` —, e esse tipo
 * não é comparável a um `Record<string, string>`. O guarda do banco confere o
 * formato de verdade, entrada por entrada, e é ele que vale aqui.
 */
const ENTRADAS: readonly EnunciadoDoBanco[] = ENTRADAS_DE_ENUNCIADO.map((entrada) => ({
  ...(entrada.conteudo as Omit<EnunciadoDoBanco, 'topico' | 'nivel' | 'forma'>),
  topico: entrada.topico,
  ...(entrada.nivel === undefined ? {} : { nivel: entrada.nivel }),
  ...(entrada.forma === undefined ? {} : { forma: entrada.forma }),
}));

/** Tudo o que está no arquivo, as duas naturezas juntas. */
export function todasAsEntradas(): readonly EnunciadoDoBanco[] {
  return ENTRADAS;
}

/** Só as perguntas prontas — as que o guarda do banco confere uma a uma. */
export function todosOsEnunciados(): readonly EnunciadoDoBanco[] {
  return ENTRADAS.filter(ehPerguntaPronta);
}

/** As entradas de um tópico e nível. Vazio quando não há nenhuma. */
export function enunciadosDe(topicoId: string, nivel: Nivel): readonly EnunciadoDoBanco[] {
  return ENTRADAS.filter(
    (entrada) =>
      entrada.topico === topicoId && entrada.nivel === nivel && ehPerguntaPronta(entrada),
  );
}

/** Os nomes dos valores citados no texto, na ordem em que aparecem. */
export function citadosEm(texto: string): readonly string[] {
  return [...texto.matchAll(/\{dados-calculo\.([A-Za-z0-9_]+)\}/g)].map((achado) => achado[1]!);
}

/**
 * Troca `{dados-calculo.x1}` pelo valor, no idioma pedido.
 *
 * Números passam por `numeroEscrito`, e não por interpolação direta, porque o
 * separador decimal é do idioma — «7.5» aparece como «7,5» em português e
 * «7.5» em inglês. Valor que não é número entra como está: é o caso de `acao`,
 * que guarda um sinal.
 */
export function vestirTexto(
  texto: string,
  dados: Readonly<Record<string, string>>,
  idioma: Idioma,
): string {
  return texto.replace(/\{dados-calculo\.([A-Za-z0-9_]+)\}/g, (inteiro, nome: string) => {
    const valor = dados[nome];

    if (valor === undefined) {
      return inteiro;
    }

    const numero = Number(valor);

    return Number.isFinite(numero) && valor.trim() !== '' ? numeroEscrito(numero, idioma) : valor;
  });
}

/**
 * Um exercício montado a partir de uma entrada do banco.
 *
 * Devolve `undefined` quando o tópico não sabe ler o `total` — a entrada está
 * errada, e errada ela não vai à tela. O guarda do banco pega isso no teste,
 * mas a checagem fica aqui também: o arquivo é editado à mão, e quem o edita
 * não roda os testes antes de cada mudança.
 */
export function exercicioDoBanco<T>(
  gerador: GeradorExercicio<T>,
  entrada: EnunciadoDoBanco,
  indice: number,
): Exercicio<T> | undefined {
  const dados = entrada['dados-calculo'];
  const total = dados?.[CHAVE_DO_TOTAL];

  // Sem dados ou sem total não é pergunta pronta: é molde, e molde não vira
  // exercício sozinho — quem o veste com números é o gerador do tópico.
  if (dados === undefined || total === undefined) {
    return undefined;
  }

  const gabarito = gerador.analisar(total);

  if (gabarito === null) {
    return undefined;
  }

  const emPortugues = vestirTexto(entrada.enunciado.br, dados, 'pt');
  const emFrances = entrada.enunciado.fr ?? entrada.enunciado.br;
  const emIngles = entrada.enunciado.en ?? entrada.enunciado.br;

  return {
    // O índice entra no id para que duas entradas iguais do mesmo tópico não
    // se confundam no histórico.
    id: `banco-${entrada.topico}-${entrada.nivel}-${indice}`,
    nivel: entrada.nivel as Nivel,
    enunciado: emPortugues,
    traducoes: {
      fr: { enunciado: vestirTexto(emFrances, dados, 'fr') },
      en: { enunciado: vestirTexto(emIngles, dados, 'en') },
    },
    // Sem fórmula: o enunciado do banco é texto, e montar a conta a partir
    // dele é parte da pergunta.
    enunciadoTex: '',
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Os dados do enunciado.',
          tex: Object.entries(dados)
            .filter(([nome]) => nome !== CHAVE_DO_TOTAL)
            .map(([nome, valor]) => `${nome} = ${valor}`)
            .join(' \\qquad '),
        },
        {
          descricao: 'A resposta.',
          tex: `${gerador.formatar(gabarito)}`,
        },
      ],
    },
    conceitos: [],
    armadilhas: [],
  };
}

/**
 * Sorteia um exercício do banco para este tópico e nível.
 *
 * `undefined` quando não há entrada — que é o caso da maioria dos tópicos, e
 * aí o gerador de sempre responde. O sorteio usa o `rng` da sessão, e não
 * `Math.random`: é o que mantém a sessão reproduzível e os testes estáveis.
 */
export function sortearDoBanco<T>(
  gerador: GeradorExercicio<T>,
  nivel: Nivel,
  rng: Rng,
): Exercicio<T> | undefined {
  const candidatas = enunciadosDe(gerador.topicoId, nivel);

  if (candidatas.length === 0) {
    return undefined;
  }

  const escolhida = rng.inteiro(0, candidatas.length - 1);
  const entrada = candidatas[escolhida]!;
  const indice = ENTRADAS.indexOf(entrada);

  return exercicioDoBanco(gerador, entrada, indice);
}
