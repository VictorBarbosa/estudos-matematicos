import { Idioma } from '@core/i18n/models/i18n.model';
import { ProblemaDeTexto } from '@core/problemas/models/problema-de-texto';
import { ValorDaLacuna } from '@core/problemas/vestir/vestir-enunciado';
import { Resolucao } from '@core/math/tipos/tipos';
import { Rng } from '@core/treino/rng/rng';
import { FOLGA_DE_CONSTANTE_ARREDONDADA } from '@core/treino/resposta-numerica/resposta-numerica';

/**
 * Os degraus de dificuldade.
 *
 * `extremo` é o quarto, e não é só «difícil com números maiores»: onde
 * encadear técnicas faz sentido — cálculo, álgebra, física — ele pede duas
 * numa questão só; onde o que endurece é o número — frações, decimais, MMC —
 * ele pede valores que não saem redondos.
 */
export type Nivel = 'facil' | 'medio' | 'dificil' | 'extremo';

export const NIVEIS: readonly Nivel[] = ['facil', 'medio', 'dificil', 'extremo'];

/** A posição de cada nível na escada, para comparar sem depender da ordem do array. */
const DEGRAU: Readonly<Record<Nivel, number>> = {
  facil: 0,
  medio: 1,
  dificil: 2,
  extremo: 3,
};

/**
 * O nível está neste degrau ou acima dele?
 *
 * Existe por causa de um erro fácil de cometer: `nivel === 'dificil' ? muito :
 * pouco` manda o Extremo para o ramo FÁCIL, em silêncio. Escrito como
 * `nivelAoMenos(nivel, 'dificil')`, o degrau novo herda o comportamento do
 * anterior, que é o padrão certo.
 */
export function nivelAoMenos(nivel: Nivel, minimo: Nivel): boolean {
  return DEGRAU[nivel] >= DEGRAU[minimo];
}

/** A chave de tradução de cada nível, já que a interface fala três línguas. */
export const CHAVE_DO_NIVEL: Readonly<Record<Nivel, string>> = {
  facil: 'nivel.facil',
  medio: 'nivel.medio',
  dificil: 'nivel.dificil',
  extremo: 'nivel.extremo',
};

/**
 * Um erro típico do tema, previsto de antemão.
 *
 * É o que permite corrigir de forma didática: quando a resposta do aluno
 * coincide com uma armadilha, sabemos exatamente qual foi o equívoco
 * conceitual e podemos nomeá-lo, em vez de apenas mostrar o gabarito.
 */
export interface Armadilha<T> {
  /** A resposta que esse erro produz. */
  readonly resposta: T;
  /** O que o aluno provavelmente fez, dito sem julgamento. */
  readonly diagnostico: string;
  /**
   * O mesmo diagnóstico em francês e inglês.
   *
   * Opcional porque a tradução dos geradores é gradual: quem ainda não tem a
   * versão traduzida continua mostrando o português, em vez de uma tela vazia.
   * O guarda `textos-traduzidos.spec.ts` cobra as duas línguas de quem declara
   * o campo — meia tradução é pior que nenhuma.
   */
  readonly diagnosticoTraducoes?: TraducaoDeTexto;
  /** Índice do passo da resolução em que a divergência aparece. */
  readonly passo?: number;
  /** Conceito a revisar por causa desse erro. */
  readonly conceito?: string;
}

/** Um texto livre nas línguas em que ele já foi escrito. */
export type TraducaoDeTexto = Readonly<Partial<Record<Idioma, string>>>;

/**
 * O enunciado e a dica de um exercício, numa língua.
 *
 * O português NÃO entra aqui: ele vive nos campos `enunciado` e `dica`, que já
 * existiam. Duplicá-lo criaria duas fontes para a mesma frase, e a que o aluno
 * lê em português é a que a prova usa para medir a forma da pergunta — elas
 * precisam ser a mesma string.
 */
export interface TextoDoExercicio {
  readonly enunciado: string;
  readonly dica?: string;
}

export interface Exercicio<T> {
  readonly id: string;
  readonly nivel: Nivel;
  /** Comando em linguagem natural, em português. */
  readonly enunciado: string;
  /**
   * As frases do exercício em francês e inglês.
   *
   * O enunciado é sorteado uma vez e guardado na sessão; sem isto, trocar de
   * idioma no cabeçalho deixaria a pergunta na língua anterior até o próximo
   * exercício. Com as três versões já no objeto, a troca é imediata e o
   * exercício em andamento não se perde.
   */
  readonly traducoes?: Readonly<Partial<Record<Idioma, TextoDoExercicio>>>;
  /**
   * A expressão a resolver, em LaTeX, ou {@link SEM_FORMULA}.
   *
   * Nem todo exercício deve entregar a fórmula montada. Em Razão e proporção,
   * no Difícil, a tarefa é justamente decidir se as grandezas são direta ou
   * inversamente proporcionais e montar a proporção: exibir `a/b = c/x` ao
   * lado do texto responderia a pergunta antes dela ser feita.
   */
  readonly enunciadoTex: string;
  readonly gabarito: T;
  /** A resolução completa, reaproveitada do motor matemático. */
  readonly resolucao: Resolucao<T>;
  /** Conceitos exercitados — alimentam a sugestão de revisão. */
  readonly conceitos: readonly string[];
  readonly armadilhas: readonly Armadilha<T>[];
  readonly dica?: string;
  /**
   * A resposta precisa estar escrita como fração?
   *
   * Existe para o exercício em que a forma É a pergunta: "escreva 0,75 como
   * fração" tem 0,75 como resposta de valor correto, e aceitá-la deixaria o
   * aluno devolver o enunciado. Quando isto está ligado, um decimal digitado
   * não conta como erro de matemática — conta como formato, e a correção pede
   * a outra escrita.
   */
  readonly exigeFracao?: boolean;
  /**
   * Os números que uma história de LLM pode usar, na ordem das lacunas.
   *
   * Só os geradores que aderem aos problemas de palavra preenchem isto, e eles
   * preenchem **apenas quando os valores sorteados servem para uma história**:
   * «2,5 pessoas» e «idade negativa» são absurdos que nenhuma validação de
   * texto pega, e quem sabe o domínio é o gerador. Sem este campo, o exercício
   * aparece com o enunciado de sempre — que é o caminho normal de 130 tópicos.
   */
  readonly dadosDoProblema?: readonly ValorDaLacuna[];
}

/**
 * Acrescenta ao enunciado a forma esperada, quando a resposta é fracionária.
 *
 * «Informe o valor de x», com raiz 29/6, deixava o aluno sem saber se devia
 * arredondar — e 29/6 não tem decimal exato, então arredondar era errar sem
 * aviso. O preço é que a presença (ou a falta) da frase entrega se a resposta
 * é inteira; vale a pena, porque adivinhar o formato não é o que o exercício
 * quer ensinar.
 */
export function pedindoFracao(
  enunciado: string,
  gabarito: { readonly ehInteira: boolean },
): string {
  return gabarito.ehInteira ? enunciado : `${enunciado} Responda como fração.`;
}

/**
 * Uma tecla de símbolo do campo de resposta.
 *
 * Algumas inserem um símbolo solto (`∈`); outras, um esqueleto com o cursor no
 * lugar de preencher — `f()` com o cursor entre os parênteses, `\sum_{k=1}^{}`
 * com ele no limite de cima.
 */
export interface TeclaDeSimbolo {
  /** O que aparece no botão. */
  readonly rotulo: string;
  /** O texto inserido no campo. */
  readonly insere: string;
  /** Quantos caracteres recuar o cursor depois de inserir. */
  readonly recuo?: number;
  /** Nome para leitor de tela, já que o rótulo é um símbolo. */
  readonly nome: string;
}

/**
 * Enunciado sem fórmula: montar a expressão faz parte da pergunta.
 *
 * É string vazia, e não `undefined`, para que o campo continue obrigatório —
 * esquecer a fórmula tem de ser uma escolha escrita, não um esquecimento.
 */
export const SEM_FORMULA = '';

export type Veredito = 'correto' | 'incorreto' | 'invalido';

export interface Validacao {
  readonly veredito: Veredito;
  /** Mensagem principal mostrada ao aluno. */
  readonly mensagem: string;
  /**
   * Recado sobre a FORMA de uma resposta certa.
   *
   * `10/20` vale o mesmo que `1/2` e sempre contou como acerto — a correção
   * aqui é por valor. O que faltava era dizer que existe uma forma menor, que
   * é a que o gabarito mostra e a que deixa a conta seguinte mais leve.
   */
  readonly observacao?: string;
  /** Explicação do erro específico, quando ele foi reconhecido. */
  readonly diagnostico?: string;
  /** O diagnóstico na língua da interface, quando o gerador o traduziu. */
  readonly diagnosticoTraducoes?: TraducaoDeTexto;
  readonly passoDivergente?: number;
  readonly conceitoAssociado?: string;
}

/**
 * O que cada tópico precisa implementar para ganhar uma área de treino.
 *
 * A mecânica de rodada, correção, placar e progresso é genérica e já existe:
 * um tópico novo só escreve o gerador.
 */
export interface GeradorExercicio<T> {
  readonly topicoId: string;
  /** Texto de apoio do campo de resposta, por exemplo `ex.: 3/4`. */
  readonly formatoResposta: string;
  /** O mesmo texto de apoio em francês e inglês, quando traduzido. */
  readonly formatoRespostaTraducoes?: TraducaoDeTexto;
  /**
   * Sorteia um exercício.
   *
   * `pendentes` são os tipos que ainda faltam para a etapa abrir. Quem tem
   * exigência de cobertura usa a lista para oferecer o que falta em vez de
   * repetir o que já está cumprido; os demais geradores a ignoram.
   */
  gerar(nivel: Nivel, rng: Rng, pendentes?: readonly string[]): Exercicio<T>;
  /** Converte o texto digitado em valor do domínio, ou `null` se não entender. */
  analisar(entrada: string): T | null;
  /** Igualdade por valor: `6/8` deve contar como `3/4`. */
  saoEquivalentes(a: T, b: T): boolean;
  /** Forma legível do valor, para exibir o gabarito. */
  formatar(valor: T): string;
  /**
   * Teclas de símbolo oferecidas ao lado do campo de resposta.
   *
   * Existe porque `∀`, `∈` e `∑` não estão no teclado de ninguém: sem
   * paleta, um tópico que pede notação pede o impossível. Quem não precisa
   * dela não declara nada e o campo fica como sempre foi.
   */
  readonly simbolos?: readonly TeclaDeSimbolo[];
  /**
   * A declaração que permite a este tópico receber histórias de uma LLM local.
   *
   * Quem declara isto **não muda de comportamento** quando a LLM está fora do
   * ar: o enunciado de sempre continua sendo o enunciado. A história veste o
   * exercício na hora de exibir, fora do `gerar()`, para que o sorteio
   * continue puro e semeado — é o que mantém `verificar:geradores` e os
   * guardas de variedade valendo sem exceção.
   */
  readonly problemaDeTexto?: ProblemaDeTexto;
  /**
   * Um recado sobre a forma de uma resposta CERTA, quando há o que dizer.
   *
   * Recebe também o texto digitado, porque o recado fala da escrita: quem
   * respondeu `10/20` precisa ler `10/20` de volta, não a forma normalizada.
   */
  observarResposta?(valor: T, entrada: string): string | undefined;
  /**
   * As escritas igualmente corretas do mesmo valor, quando há mais de uma.
   *
   * Em Frações, 28/27 e 1 1/27 são o mesmo número e as duas contam como
   * acerto — mas o gabarito exibia só a que `formatar` escolhe, e quem
   * escreveu a outra tinha motivo para achar que ela não valia.
   *
   * A primeira da lista é a principal. Quem não implementa tem uma forma só.
   */
  formasEquivalentes?(valor: T): readonly string[];
}

/**
 * Todas as formas corretas de escrever o gabarito, a principal à frente.
 *
 * Sempre devolve pelo menos `formatar(valor)`: um gerador que esqueça de
 * incluir a forma principal na própria lista não some com ela da tela.
 */
/** O texto de apoio do campo na língua pedida, com reserva em português. */
export function formatoRespostaEm(gerador: GeradorExercicio<unknown>, idioma: Idioma): string {
  return gerador.formatoRespostaTraducoes?.[idioma] ?? gerador.formatoResposta;
}

/**
 * O enunciado do exercício na língua pedida, com o português como reserva.
 *
 * A reserva não é preguiça: um gerador traduzido pela metade não pode deixar a
 * pergunta em branco, e uma frase na língua errada atrapalha menos que nada.
 */
export function enunciadoEm(exercicio: Exercicio<unknown>, idioma: Idioma): string {
  return exercicio.traducoes?.[idioma]?.enunciado || exercicio.enunciado;
}

/** A dica na língua pedida, ou a portuguesa quando não houver tradução. */
export function dicaEm(exercicio: Exercicio<unknown>, idioma: Idioma): string | undefined {
  return exercicio.traducoes?.[idioma]?.dica || exercicio.dica;
}

/** O diagnóstico de uma validação na língua pedida, com reserva em português. */
export function diagnosticoEm(validacao: Validacao, idioma: Idioma): string | undefined {
  return validacao.diagnosticoTraducoes?.[idioma] || validacao.diagnostico;
}

export function formasDoGabarito<T>(gerador: GeradorExercicio<T>, valor: T): readonly string[] {
  const principal = gerador.formatar(valor);
  return [...new Set([principal, ...(gerador.formasEquivalentes?.(valor) ?? [])])];
}

/** O que foi digitado é um decimal — com vírgula ou ponto — e não uma fração? */
function ehDecimal(entrada: string): boolean {
  return /^[+-]?\d*[.,]\d+$/.test(entrada.trim().replace(/\s+/g, ''));
}

/**
 * Remove armadilhas que, naquele exercício em particular, caem sobre o próprio
 * gabarito ou sobre outra armadilha já listada.
 *
 * Um erro previsto pode, por coincidência numérica, levar à resposta certa —
 * "dividir por 10" e "tomar 10%" dão o mesmo valor. Sem este filtro, o aluno
 * acertaria e ainda assim veria um diagnóstico de erro.
 */
export function semColisoes<T>(
  armadilhas: readonly Armadilha<T>[],
  gabarito: T,
  saoEquivalentes: (a: T, b: T) => boolean,
): readonly Armadilha<T>[] {
  const jaVistas: T[] = [gabarito];

  return armadilhas.filter((armadilha) => {
    if (jaVistas.some((anterior) => saoEquivalentes(anterior, armadilha.resposta))) {
      return false;
    }
    jaVistas.push(armadilha.resposta);
    return true;
  });
}

/**
 * Corrige uma resposta usando o gabarito e as armadilhas do exercício.
 *
 * Genérico de propósito: serve igualmente para frações, raízes de equações e
 * derivadas, bastando que o gerador saiba analisar e comparar seu próprio tipo.
 */
/**
 * Um ponto sozinho entre dígitos: decimal ou separador de milhar?
 *
 * Em português `1.375` é mil trezentos e setenta e cinco, e é assim que o site
 * escreve um gabarito grande. Só que `0.833` e `1.000` saem do mesmo teclado
 * querendo dizer 0,833 e 1 — e lidos como milhar faziam o site responder «não
 * é isso, a resposta correta é 0,83» a quem tinha acertado.
 *
 * Como não há regra que decida, tentam-se as duas leituras. Isto nunca reprova
 * o que antes passava: só entra quando a primeira leitura já não bateu.
 */
const PONTO_AMBIGUO = /^[+-]?\d{1,3}\.\d{3}$/;

/**
 * As unidades que o aluno escreve junto do número.
 *
 * O enunciado pede «em m/s» e ele responde «547,72 m/s» — escrever a unidade é
 * o que a escola ensina e o que qualquer professor aceitaria. O site respondia
 * «Não consegui ler essa resposta», porque o analisador de número para no
 * primeiro caractere que não é número. Medido: **39 tópicos** recusavam a
 * unidade que eles próprios pediram.
 *
 * A lista é fechada de propósito. Apagar «qualquer letra no fim» quebraria as
 * respostas que SÃO letras — `3x`, `2\pi`, `√5` —, e aqui não se adivinha:
 * tira-se uma unidade conhecida, ou não se tira nada.
 *
 * A ordem importa: as compostas vêm antes das simples, senão `m/s²` perderia só
 * o `m` e sobraria `/s²`.
 */
const UNIDADES = [
  'km/h',
  'm/s²',
  'm/s2',
  'm/s',
  'cm²',
  'cm³',
  'cm2',
  'cm3',
  'm²',
  'm³',
  'm2',
  'm3',
  'rad/s',
  'graus',
  'rad',
  'km',
  'cm',
  'mm',
  'kg',
  'µs',
  'μs',
  'ms',
  'Hz',
  'Pa',
  'atm',
  'mol',
  'eV',
  'ºC',
  '°C',
  'º',
  '°',
  'm',
  's',
  'g',
  'N',
  'J',
  'W',
  'V',
  'A',
  'C',
  'T',
  'L',
  'K',
  'Ω',
] as const;

/** A entrada sem a unidade do fim, ou `null` se não havia unidade. */
function semUnidade(entrada: string): string | null {
  const texto = entrada.trim();

  for (const unidade of UNIDADES) {
    if (texto.length > unidade.length && texto.endsWith(unidade)) {
      const corpo = texto.slice(0, -unidade.length).trim();
      // Só vale se o que sobrou ainda parece um número ou uma conta.
      return corpo === '' ? null : corpo;
    }
  }

  return null;
}

function outrasLeituras(entrada: string): readonly string[] {
  const texto = entrada.trim();
  const leituras: string[] = [];

  if (PONTO_AMBIGUO.test(texto)) {
    leituras.push(texto.replace('.', ','));
  }

  const corpo = semUnidade(texto);
  if (corpo !== null) {
    leituras.push(corpo);

    // A unidade pode vir junto do ponto ambíguo: «1.375 m».
    if (PONTO_AMBIGUO.test(corpo)) {
      leituras.push(corpo.replace('.', ','));
    }
  }

  return leituras;
}

/** Quantas casas decimais o enunciado pede, quando ele diz. */
const CASAS_PEDIDAS = /(\d+)\s+casas?\b/;

/** Quantas casas o aluno escreveu — só conta quando a resposta é um decimal. */
const CASAS_ESCRITAS = /^[+-]?\d+[.,](\d+)$/;

/**
 * A resposta certa, arredondada uma casa antes do pedido.
 *
 * «A área é 615,75 cm²» e o aluno escreve 615,8: a conta está certa, só foi
 * arredondada mais cedo. Recusar isso com «não é isso» faz refazer uma conta
 * que já estava boa — e esconde que o problema era de precisão, não de
 * matemática. Uma casa é o limite: duas já seriam outra resposta.
 *
 * Devolve a frase de aviso, ou `null` quando não é esse o caso.
 */
function arredondamentoCurto<T>(
  exercicio: Exercicio<T>,
  valor: unknown,
  entrada: string,
): string | null {
  if (typeof valor !== 'number' || typeof exercicio.gabarito !== 'number') {
    return null;
  }

  const pedidas = Number(CASAS_PEDIDAS.exec(exercicio.enunciado)?.[1] ?? NaN);
  const escritas = CASAS_ESCRITAS.exec(entrada.trim().replace(/\s|\./g, ''))?.[1]?.length ?? 0;

  if (!Number.isFinite(pedidas) || pedidas < 1 || escritas !== pedidas - 1) {
    return null;
  }

  // Tem de ser o arredondamento CERTO nessa casa, não qualquer valor próximo.
  const certo = Number(exercicio.gabarito.toFixed(escritas));
  if (Math.abs(valor - certo) > 1e-9) {
    return null;
  }

  return (
    `O enunciado pede ${pedidas} casas decimais, e você arredondou para ` +
    `${escritas}. O valor está certo; só confira a precisão pedida.`
  );
}

/** A primeira das outras leituras que o gerador consegue ler, ou `null`. */
function primeiraLeituraValida<T>(gerador: GeradorExercicio<T>, entrada: string): T | null {
  for (const outra of outrasLeituras(entrada)) {
    const lido = gerador.analisar(outra);
    if (lido !== null) {
      return lido;
    }
  }

  return null;
}

/**
 * A resposta confere nas casas que o enunciado pediu.
 *
 * «2 casas decimais» é um contrato: o que vem depois da segunda casa não foi
 * pedido e não deve decidir nada. Escrever MAIS casas é ser mais exato, e ser
 * mais exato nunca pode custar o acerto — nem quando o gabarito guardado já
 * está arredondado e a resposta mais longa do aluno fica, por isso, mais
 * distante dele do que uma resposta curta ficaria.
 *
 * Então os dois lados são arredondados no número de casas pedido e comparados
 * ali. É mais honesto que uma tolerância: a tolerância adivinha quanto perdoar,
 * esta regra responde exatamente a pergunta que o enunciado fez.
 *
 * Vale só quando o enunciado DIZ quantas casas quer. Sem contrato escrito não
 * há o que desconsiderar, e aí decidem o comparador do tópico e a folga de
 * constante arredondada.
 */
function certoNasCasasPedidas<T>(exercicio: Exercicio<T>, valor: T): boolean {
  if (typeof valor !== 'number' || typeof exercicio.gabarito !== 'number') {
    return false;
  }

  if (!Number.isFinite(valor) || !Number.isFinite(exercicio.gabarito)) {
    return false;
  }

  const pedidas = Number(CASAS_PEDIDAS.exec(exercicio.enunciado)?.[1] ?? NaN);
  if (!Number.isInteger(pedidas) || pedidas < 0 || pedidas > 20) {
    return false;
  }

  return Number(valor.toFixed(pedidas)) === Number(exercicio.gabarito.toFixed(pedidas));
}

/**
 * A resposta certa obtida com uma constante arredondada.
 *
 * O aluno que calcula a área de um círculo de raio 33 com π = 3,14 — o π que a
 * escola ensina — chega a 3419,46, e o valor exato é 3421,19. Ele fez tudo
 * certo, e um comparador de tolerância absoluta responde «não é isso» e exibe
 * um número que ele não tinha como obter.
 *
 * O erro de arredondar uma constante é **relativo**: π = 3,14 custa 0,051%,
 * g = 9,8 custa 0,102%, cos 37° ≈ 0,80 custa 0,17%. Por isso ele não aparece em
 * resposta pequena e reprova em resposta grande — e por isso tolerância
 * absoluta, por generosa que seja, sempre quebra em algum tamanho. Era o caso
 * de mais de quarenta geradores deste site.
 *
 * Três travas mantêm isto honesto:
 *
 * 1. **Só gabarito não inteiro.** Onde a resposta é um inteiro — quantas
 *    combinações, quantos lados —, não houve constante a arredondar, e a
 *    exatidão é a própria medida. Sem esta trava, um gabarito de 65 536
 *    aceitaria ±131.
 * 2. **Depois das armadilhas.** Os erros clássicos de cada tópico são checados
 *    antes, então um desvio conhecido continua sendo diagnosticado em vez de
 *    passar por «quase certo».
 * 3. **Com aviso.** Vale como acerto e diz por que: o aluno vê que o número
 *    dele não é o do gabarito, e que a diferença é de arredondamento. Calar
 *    isso ensinaria que 0,2% não importa.
 */
function certoComConstanteArredondada<T>(
  gerador: GeradorExercicio<T>,
  gabarito: T,
  valor: T,
): string | null {
  if (typeof valor !== 'number' || typeof gabarito !== 'number') {
    return null;
  }

  if (!Number.isFinite(valor) || !Number.isFinite(gabarito) || Number.isInteger(gabarito)) {
    return null;
  }

  const distancia = Math.abs(valor - gabarito);
  if (distancia > Math.abs(gabarito) * FOLGA_DE_CONSTANTE_ARREDONDADA) {
    return null;
  }

  return (
    'Aceito: a diferença é de arredondamento, não de conta. O valor exato é ' +
    `${formasDoGabarito(gerador, gabarito).join(' ou ')} — a sua resposta sai de arredondar ` +
    'uma constante no caminho, como usar π = 3,14.'
  );
}

export function corrigir<T>(
  gerador: GeradorExercicio<T>,
  exercicio: Exercicio<T>,
  entrada: string,
): Validacao {
  /*
   * A leitura tenta a entrada e, se ela não se lê, as outras formas.
   *
   * A unidade era o caso que isto conserta: o enunciado pede «em m/s», o aluno
   * responde «547,72 m/s» e o analisador de número parava no espaço. O
   * «inválido» vinha antes de qualquer segunda tentativa, então nem o ponto
   * ambíguo nem a unidade chegavam a ser considerados aqui.
   */
  const valor = gerador.analisar(entrada) ?? primeiraLeituraValida(gerador, entrada);

  if (valor === null) {
    return {
      veredito: 'invalido',
      mensagem: `Não consegui ler essa resposta. Use o formato ${gerador.formatoResposta}.`,
    };
  }

  // Onde a forma é a pergunta, repetir o decimal não responde nada.
  if (exercicio.exigeFracao === true && ehDecimal(entrada)) {
    return {
      veredito: 'invalido',
      mensagem:
        'Esse é o número que o enunciado já deu, escrito do mesmo jeito. ' +
        'A resposta é uma fração: escreva no formato 3/4.',
    };
  }

  if (gerador.saoEquivalentes(valor, exercicio.gabarito)) {
    return {
      veredito: 'correto',
      mensagem: 'Correto!',
      observacao: gerador.observarResposta?.(valor, entrada),
    };
  }

  // A outra leitura do ponto ambíguo, antes de dizer que está errado.
  for (const outra of outrasLeituras(entrada)) {
    const relido = gerador.analisar(outra);
    if (relido !== null && gerador.saoEquivalentes(relido, exercicio.gabarito)) {
      return {
        veredito: 'correto',
        mensagem: 'Correto!',
        observacao: gerador.observarResposta?.(relido, outra),
      };
    }
  }

  // Arredondou uma casa a menos do que o enunciado pediu: é o valor certo,
  // e chamar isso de «não é isso» manda a pessoa refazer uma conta que estava
  // boa. Vale, com o aviso da precisão.
  const curta = arredondamentoCurto(exercicio, valor, entrada);
  if (curta !== null) {
    return { veredito: 'correto', mensagem: 'Correto!', observacao: curta };
  }

  const armadilha = exercicio.armadilhas.find((candidata) =>
    gerador.saoEquivalentes(valor, candidata.resposta),
  );

  if (armadilha) {
    return {
      veredito: 'incorreto',
      mensagem: 'Quase — o caminho tem um desvio conhecido.',
      diagnostico: armadilha.diagnostico,
      diagnosticoTraducoes: armadilha.diagnosticoTraducoes,
      passoDivergente: armadilha.passo,
      conceitoAssociado: armadilha.conceito,
    };
  }

  // Depois das armadilhas, de propósito: o desvio conhecido é diagnosticado, e
  // só o que sobra pode ser excesso de casas ou arredondamento de constante.
  if (certoNasCasasPedidas(exercicio, valor)) {
    // Sem recado: escrever mais casas do que o pedido não é erro de nada.
    return { veredito: 'correto', mensagem: 'Correto!' };
  }

  const porConstante = certoComConstanteArredondada(gerador, exercicio.gabarito, valor);
  if (porConstante !== null) {
    return { veredito: 'correto', mensagem: 'Correto!', observacao: porConstante };
  }

  const formas = formasDoGabarito(gerador, exercicio.gabarito);

  return {
    veredito: 'incorreto',
    // Quando há duas escritas certas, as duas aparecem: "é -28/27, ou -1 1/27".
    mensagem: `Não é isso. A resposta correta é ${formas.join(', ou ')}.`,
  };
}
