import { fatoracaoParaTexto, mdcLista, mmcLista } from '@core/math/numeros/inteiros/inteiros';
import { avaliarExpressao } from '@core/treino/resposta-simbolica/resposta-simbolica';

/**
 * A mecânica da calculadora, sem nenhuma tela.
 *
 * O que está aqui são funções puras sobre um estado: a mesma escolha do resto
 * do site, para que "o que acontece ao apertar ±" possa ser testado sem
 * renderizar um botão.
 *
 * A avaliação não é própria — vem de {@link avaliarExpressao}, o mesmo
 * analisador que lê as respostas do treino. Um segundo avaliador significaria
 * duas gramáticas para manter e, pior, uma calculadora que concorda com uma
 * conta que o campo de resposta recusa.
 */

export type ModoCalculadora = 'basica' | 'cientifica' | 'mmc-mdc' | 'soma-produto';

/** As duas contas da aba de inteiros. */
export type OperacaoInteiros = 'mmc' | 'mdc';

/**
 * Um erro pronto para traduzir.
 *
 * O modelo não sabe em que idioma a tela está, então guarda a chave do
 * dicionário e o que preenche nela; quem desenha é que escolhe a língua.
 */
export interface ErroDaConta {
  readonly chave: string;
  readonly valores?: Readonly<Record<string, string | number>>;
}

/** Como os ângulos das funções trigonométricas são lidos. */
export type Angulo = 'rad' | 'deg';

export interface EstadoCalculadora {
  /** A expressão como o aluno a escreveu, com vírgula, × e ÷. */
  readonly expressao: string;
  /** O resultado da última avaliação, já formatado, ou `null`. */
  readonly resultado: string | null;
  /** O que impediu a conta, ou `null`. */
  readonly erro: ErroDaConta | null;
}

export const ESTADO_INICIAL: EstadoCalculadora = {
  expressao: '',
  resultado: null,
  erro: null,
};

/** O que vem depois de um resultado e continua a conta, em vez de começar outra. */
const CONTINUA_A_CONTA = /^[+\-×÷^)%]/;

/** Algarismos significativos guardados: o bastante para 0,1 + 0,2 dar 0,3. */
const PRECISAO = 12;

const GRAU_EM_RADIANO = '0.017453292519943295';

/** As funções cujo argumento é um ângulo. */
const TRIGONOMETRICAS = ['sin', 'cos', 'tan'] as const;

/**
 * Abaixo disto, o resultado de uma conta com trigonometria é ruído.
 *
 * π não cabe num `double`, então `sin(π)` dá 1,22·10⁻¹⁶ e `cos(90°)` dá
 * 6,12·10⁻¹⁷. São zeros com a poeira da aritmética binária em cima, e
 * mostrá-los faria a calculadora parecer quebrada em contas que o aluno faz o
 * tempo todo.
 *
 * O corte vale **só quando há trigonometria na conta**: em Física, 6,6·10⁻³⁴
 * é a constante de Planck, não ruído, e arredondá-la para zero seria dar uma
 * resposta errada.
 */
const RUIDO_TRIGONOMETRICO = 1e-12;

/**
 * Escreve o número como ele se lê.
 *
 * O arredondamento em {@link PRECISAO} algarismos é o que impede a calculadora
 * de responder `0,30000000000000004` a `0,1 + 0,2` — o resultado é verdadeiro
 * em ponto flutuante e inútil para quem está estudando.
 */
export function formatarValor(valor: number): string {
  if (!Number.isFinite(valor)) {
    return '—';
  }

  const arredondado = Number(valor.toPrecision(PRECISAO));
  const magnitude = Math.abs(arredondado);

  // Fora desta faixa o número decimal vira uma fileira de zeros ilegível.
  const texto =
    magnitude !== 0 && (magnitude >= 1e12 || magnitude < 1e-6)
      ? arredondado
          .toExponential(6)
          .replace(/(\.\d*?)0+e/, '$1e')
          .replace(/\.e/, 'e')
      : String(arredondado);

  return texto.replace('.', ',');
}

const OPERADORES = '+-×÷^';

const ehOperador = (caractere: string): boolean =>
  caractere.length === 1 && OPERADORES.includes(caractere);

/** O menos que nega um número, e não o que subtrai, cabe depois destes. */
const ACEITA_NEGATIVO = /[×÷^(]$/;

/**
 * Onde o texto entra na expressão — ou `null`, quando ele não entra.
 *
 * Sem isto dá para escrever `5-----333---` e `5××××2`: a calculadora aceitava
 * qualquer tecla a qualquer momento e só reclamava no igual, quando a conta
 * inteira já estava perdida. Aqui a tecla impossível simplesmente não acontece,
 * que é como toda calculadora se comporta.
 */
function inserir(base: string, texto: string): string | null {
  const ultimo = base.slice(-1);
  const semValorAntes = base === '' || ehOperador(ultimo) || ultimo === '(';

  // `x²` e `x³` elevam alguma coisa: sem um valor antes, não há o que elevar.
  if (texto.length > 1 && texto.startsWith('^')) {
    return semValorAntes ? null : base + texto;
  }

  if (ehOperador(texto)) {
    // Depois de ×, ÷, ^ ou abre-parênteses, o menos nega o próximo número.
    if (texto === '-' && ACEITA_NEGATIVO.test(base)) {
      return base + texto;
    }

    // Operador em cima de operador TROCA o anterior, não se acumula.
    const semOperadores = base.replace(/[+\-×÷^]+$/, '');
    if (semOperadores === '' || semOperadores.endsWith('(')) {
      return texto === '-' ? `${semOperadores}-` : null;
    }
    return semOperadores + texto;
  }

  if (texto === ',') {
    const numeroAtual = /[\d,]*$/.exec(base)![0];
    if (numeroAtual.includes(',')) {
      return null;
    }
    // Uma vírgula solta vira `0,`: ninguém escreve `,5` numa conta.
    return numeroAtual === '' ? `${base}0,` : `${base},`;
  }

  if (texto === ')') {
    const abertos = [...base].filter((c) => c === '(').length;
    const fechados = [...base].filter((c) => c === ')').length;
    return abertos > fechados && !semValorAntes ? `${base})` : null;
  }

  return base + texto;
}

/** Acrescenta texto à expressão, decidindo se continua ou recomeça a conta. */
export function digitar(estado: EstadoCalculadora, texto: string): EstadoCalculadora {
  // Depois de um resultado, um operador continua de onde parou — `= × 2` é a
  // sequência mais natural da calculadora — e um algarismo começa outra conta.
  const base =
    estado.resultado === null
      ? estado.expressao
      : CONTINUA_A_CONTA.test(texto)
        ? estado.resultado
        : '';

  const proxima = inserir(base, texto);
  if (proxima === null) {
    return estado;
  }

  return { expressao: proxima, resultado: null, erro: null };
}

/** O que a tecla de apagar remove: um token, não um caractere. */
const ULTIMO_TOKEN = /(sin\(|cos\(|tan\(|ln\(|log\(|√\(|\^2|\^3|.)$/;

export function apagar(estado: EstadoCalculadora): EstadoCalculadora {
  if (estado.resultado !== null) {
    return ESTADO_INICIAL;
  }

  return {
    expressao: estado.expressao.replace(ULTIMO_TOKEN, ''),
    resultado: null,
    erro: null,
  };
}

export function limpar(): EstadoCalculadora {
  return ESTADO_INICIAL;
}

/** O número que está sendo escrito no fim da expressão. */
const NUMERO_FINAL = /(\d+(?:,\d+)?)$/;

/**
 * Troca o sinal do último número escrito.
 *
 * Opera sobre o número, e não sobre a expressão inteira: em `5 × 3`, o ± vale
 * para o 3. É o que a calculadora de bolso faz, e o que evita que trocar um
 * sinal mude o resultado de toda a conta anterior.
 */
export function alternarSinal(estado: EstadoCalculadora): EstadoCalculadora {
  if (estado.resultado !== null) {
    const invertido = estado.resultado.startsWith('-')
      ? estado.resultado.slice(1)
      : `-${estado.resultado}`;
    return { expressao: invertido, resultado: null, erro: null };
  }

  const encontrado = NUMERO_FINAL.exec(estado.expressao);
  if (encontrado === null) {
    return estado;
  }

  const inicio = estado.expressao.length - encontrado[1]!.length;
  const antes = estado.expressao.slice(0, inicio);

  // O menos só é "sinal do número" quando o que vem antes dele não é um valor:
  // em `8-3`, aquele menos é a subtração, e removê-lo apagaria a operação.
  const ehSinal = antes.endsWith('-') && /(^|[+\-×÷^(])$/.test(antes.slice(0, -1));
  const expressao = ehSinal ? antes.slice(0, -1) + encontrado[1] : `${antes}-${encontrado[1]}`;

  return { expressao, resultado: null, erro: null };
}

/** Lê o último número como porcentagem: 50 vira (50/100). */
export function porcentagem(estado: EstadoCalculadora): EstadoCalculadora {
  const base = estado.resultado ?? estado.expressao;
  const encontrado = NUMERO_FINAL.exec(base);
  if (encontrado === null) {
    return estado;
  }

  const inicio = base.length - encontrado[1]!.length;
  return {
    expressao: `${base.slice(0, inicio)}(${encontrado[1]}÷100)`,
    resultado: null,
    erro: null,
  };
}

/** O inverso do que está na tela — `1/x` aplicado à conta inteira. */
export function inverso(estado: EstadoCalculadora): EstadoCalculadora {
  const base = estado.resultado ?? estado.expressao;
  if (base === '') {
    return estado;
  }
  return { expressao: `1÷(${base})`, resultado: null, erro: null };
}

/**
 * Fecha os parênteses que ficaram abertos.
 *
 * Quem escreve `sin(30` e aperta igual quer o seno de trinta, não um erro de
 * sintaxe. Fechar sozinho é o que toda calculadora faz.
 */
export function fecharPendentes(expressao: string): string {
  let abertos = 0;
  for (const caractere of expressao) {
    if (caractere === '(') {
      abertos++;
    } else if (caractere === ')') {
      abertos--;
    }
  }
  return expressao + ')'.repeat(Math.max(0, abertos));
}

/** O índice do parêntese que fecha o aberto em `abre`, ou −1. */
function parCorrespondente(texto: string, abre: number): number {
  let nivel = 0;
  for (let i = abre; i < texto.length; i++) {
    if (texto[i] === '(') {
      nivel++;
    } else if (texto[i] === ')') {
      nivel--;
      if (nivel === 0) {
        return i;
      }
    }
  }
  return -1;
}

/**
 * Converte para radianos o argumento de cada função trigonométrica.
 *
 * O motor de expressões trabalha em radianos, que é o que o Cálculo pede. Mas
 * metade deste site — trajetória, torque, vetores — fala em graus, e uma
 * calculadora que só aceita radianos obriga a multiplicar por π/180 a cada
 * conta. O modo GRAU reescreve `sin(A)` como `sin((A)·π/180)` antes de avaliar.
 *
 * A reescrita é feita pelo parêntese correspondente, e não por regex: em
 * `sin(30+60)` o ângulo é a soma inteira, e converter só o 30 daria outro
 * número — do tipo que passa despercebido.
 */
export function emGraus(expressao: string): string {
  let saida = expressao;

  for (const nome of TRIGONOMETRICAS) {
    const marca = `${nome}(`;
    let procura = 0;

    for (;;) {
      const inicio = saida.indexOf(marca, procura);
      if (inicio === -1) {
        break;
      }

      const abre = inicio + nome.length;
      const fecha = parCorrespondente(saida, abre);
      if (fecha === -1) {
        break;
      }

      const argumento = saida.slice(abre + 1, fecha);
      saida =
        saida.slice(0, inicio) +
        `${nome}((${argumento})*${GRAU_EM_RADIANO})` +
        saida.slice(fecha + 1);

      // Continua de dentro do que acabou de ser reescrito: um seno dentro de
      // outro também precisa da conversão.
      procura = abre + 1;
    }
  }

  return saida;
}

/** Avalia a expressão da tela e devolve o estado com o resultado ou o erro. */
export function calcular(estado: EstadoCalculadora, angulo: Angulo): EstadoCalculadora {
  if (estado.expressao.trim() === '') {
    return estado;
  }

  const fechada = fecharPendentes(estado.expressao);
  const valor = avaliarExpressao(angulo === 'deg' ? emGraus(fechada) : fechada);

  if (valor === null) {
    return {
      expressao: estado.expressao,
      resultado: null,
      erro: { chave: 'calculadora.naoCalcula' },
    };
  }

  const comTrigonometria = TRIGONOMETRICAS.some((nome) => fechada.includes(`${nome}(`));
  const limpo = comTrigonometria && Math.abs(valor) < RUIDO_TRIGONOMETRICO ? 0 : valor;

  return { expressao: fechada, resultado: formatarValor(limpo), erro: null };
}

/** Uma linha da divisão simultânea: os valores, e por quanto eles foram divididos. */
export interface LinhaDecomposicao {
  /** Os números como estavam ANTES de dividir por {@link divisor}. */
  readonly valores: readonly number[];
  readonly divisor: number;
  /** O divisor coube em TODOS os números desta linha? É o que entra no MDC. */
  readonly comum: boolean;
}

/** O que a aba de MMC e MDC mostra. */
export interface ContaDeInteiros {
  /** Os números lidos da entrada, na ordem em que foram escritos. */
  readonly numeros: readonly number[];
  readonly valor: number | null;
  /** A decomposição, linha a linha, até todos virarem 1. */
  readonly decomposicao: readonly LinhaDecomposicao[];
  /** `2³ · 3² = 72`: de onde o resultado sai. */
  readonly montagem: string | null;
  readonly erro: ErroDaConta | null;
}

const CONTA_VAZIA: ContaDeInteiros = {
  numeros: [],
  valor: null,
  decomposicao: [],
  montagem: null,
  erro: null,
};

/** Vírgula, ponto e vírgula ou espaço separam os números — o que vier à mão. */
const SEPARADORES = /[,;\s]+/;

/**
 * O maior número aceito na aba.
 *
 * Não é limitação de precisão, é de utilidade: a decomposição de um número
 * de dez algarismos teria dezenas de linhas e nenhuma serventia escolar.
 */
const LIMITE = 1_000_000_000;

/**
 * O MMC ou o MDC dos números escritos na aba de inteiros.
 *
 * Aqui a vírgula separa números, e não casas decimais: MMC e MDC só existem
 * entre inteiros, então não há ambiguidade a resolver.
 *
 * As fatorações vêm junto de propósito. O resultado sozinho não ensina nada —
 * é ver que 12 = 2²·3 e 18 = 2·3² que explica por que o MMC é 2²·3² e o MDC é
 * 2·3.
 */
export function calcularInteiros(entrada: string, operacao: OperacaoInteiros): ContaDeInteiros {
  const partes = entrada
    .trim()
    .split(SEPARADORES)
    .filter((parte) => parte !== '');
  if (partes.length === 0) {
    return CONTA_VAZIA;
  }

  const numeros: number[] = [];
  for (const parte of partes) {
    if (!/^\d+$/.test(parte)) {
      return { ...CONTA_VAZIA, erro: { chave: 'calculadora.naoInteiro', valores: { parte } } };
    }

    const numero = Number(parte);
    if (numero === 0) {
      return { ...CONTA_VAZIA, erro: { chave: 'calculadora.semZero' } };
    }
    if (numero > LIMITE) {
      return { ...CONTA_VAZIA, erro: { chave: 'calculadora.limite' } };
    }
    numeros.push(numero);
  }

  if (numeros.length < 2) {
    return { ...CONTA_VAZIA, numeros, erro: { chave: 'calculadora.aoMenosDois' } };
  }

  const valor = operacao === 'mmc' ? mmcLista(numeros) : mdcLista(numeros);
  if (!Number.isSafeInteger(valor)) {
    return { ...CONTA_VAZIA, numeros, erro: { chave: 'calculadora.passaDoExato' } };
  }

  return {
    numeros,
    valor,
    decomposicao: decompor(numeros),
    // A fatoração do próprio resultado é, por construção, o produto dos
    // divisores que o formaram — não há como as duas contas discordarem.
    montagem: valor > 1 ? `${fatoracaoParaTexto(valor)} = ${valor}` : null,
    erro: null,
  };
}

/**
 * A divisão simultânea, linha a linha.
 *
 * É o método da escola, e o único que mostra as duas respostas de uma vez: o
 * MMC é o produto de TODOS os divisores da coluna da direita, e o MDC é o
 * produto só daqueles que couberam em todos os números da linha.
 *
 * ```
 * 12  18  24 │ 2   ← coube em todos
 *  6   9  12 │ 2
 *  3   9   6 │ 2
 *  3   9   3 │ 3   ← coube em todos
 *  1   3   1 │ 3
 *  1   1   1
 * ```
 */
export function decompor(numeros: readonly number[]): readonly LinhaDecomposicao[] {
  const linhas: LinhaDecomposicao[] = [];
  let valores = [...numeros];
  let candidato = 2;

  while (valores.some((valor) => valor > 1)) {
    const maior = Math.max(...valores);

    /*
     * Passado a raiz do maior valor, o que sobrou maior que 1 já é primo: todos
     * os fatores menores foram retirados nas linhas anteriores. Sem este
     * atalho, um número primo grande faria o candidato subir de um em um até
     * ele próprio.
     */
    const divisor =
      candidato * candidato > maior ? Math.min(...valores.filter((valor) => valor > 1)) : candidato;

    if (!valores.some((valor) => valor % divisor === 0)) {
      candidato++;
      continue;
    }

    linhas.push({
      valores: [...valores],
      divisor,
      comum: valores.every((valor) => valor % divisor === 0),
    });

    valores = valores.map((valor) => (valor % divisor === 0 ? valor / divisor : valor));
  }

  return linhas;
}

/** Um par de inteiros que resolve «produto P, soma S». */
export interface ParDeFatores {
  readonly a: number;
  readonly b: number;
}

/** Uma linha da busca: o par de divisores tentado e a soma que ele dá. */
export interface TentativaDeFator {
  readonly a: number;
  readonly b: number;
  readonly soma: number;
  /** É este o par procurado? */
  readonly escolhido: boolean;
}

/** O que a aba de soma e produto mostra. */
export interface ContaDeFatores {
  readonly produto: number | null;
  readonly soma: number | null;
  /** O par inteiro, quando existe. */
  readonly par: ParDeFatores | null;
  /** Os pares tentados, até o que serviu — o caminho, e não só a resposta. */
  readonly tentativas: readonly TentativaDeFator[];
  /** Sobraram pares além dos que a tabela mostra? */
  readonly truncada: boolean;
  /** `x² - 11x + 24 = (x - 3)(x - 8)`, pronto para ler. */
  readonly fatoracao: string | null;
  /**
   * O par, já escrito, mesmo quando ele não é inteiro.
   *
   * Sem par inteiro o trinômio ainda se fatora — só não com números redondos.
   * Dizer «não existe» seria mentira.
   */
  readonly parExato: readonly string[];
  /**
   * As raízes de `x² + Sx + P`, em ordem crescente.
   *
   * Elas são os OPOSTOS do par, e é aqui que mora a confusão que isto resolve:
   * o par de `x² + 2x - 8` é `-2 e 4`, porque a fatoração é `(x - 2)(x + 4)`,
   * mas quem zera cada fator é `2` e `-4`. Mostrar só o par faz quem procura a
   * raiz copiar o número trocado de sinal.
   */
  readonly raizes: readonly string[];
  readonly erro: ErroDaConta | null;
}

const FATORES_VAZIO: ContaDeFatores = {
  produto: null,
  soma: null,
  par: null,
  tentativas: [],
  truncada: false,
  fatoracao: null,
  parExato: [],
  raizes: [],
  erro: null,
};

/**
 * O maior valor aceito na aba de soma e produto.
 *
 * Um milhão mantém `soma² - 4·produto` longe do limite do inteiro exato do
 * JavaScript, e a varredura de divisores em mil passos. Acima disso a conta
 * deixa de ser de escola.
 */
const LIMITE_FATORES = 1_000_000;

/** Quantos pares a tabela mostra antes de cortar. */
const TENTATIVAS_VISIVEIS = 20;

/**
 * Dois números cujo produto e cuja soma são os pedidos.
 *
 * É o passo que fatora `x² + Sx + P`: achar `a` e `b` com `a·b = P` e
 * `a + b = S` é o mesmo que escrever `(x + a)(x + b)`.
 *
 * A resposta não vem da varredura, e sim do discriminante `S² - 4P`: se ele é
 * quadrado perfeito, o par é inteiro e sai de `(S ± √Δ)/2`. A varredura existe
 * para a tabela — ela mostra o caminho que se faz à mão, parando no par que
 * serviu.
 */
export function calcularFatores(produtoBruto: string, somaBruta: string): ContaDeFatores {
  const produto = lerInteiro(produtoBruto);
  const soma = lerInteiro(somaBruta);

  if (produto === null || soma === null) {
    // Faltou preencher: ainda não é erro, é pergunta incompleta.
    if (produto === null && produtoBruto.trim() !== '') {
      return { ...FATORES_VAZIO, erro: erroDoInteiro(produtoBruto) };
    }
    if (soma === null && somaBruta.trim() !== '') {
      return { ...FATORES_VAZIO, erro: erroDoInteiro(somaBruta) };
    }
    return FATORES_VAZIO;
  }

  if (Math.abs(produto) > LIMITE_FATORES || Math.abs(soma) > LIMITE_FATORES) {
    return { ...FATORES_VAZIO, erro: { chave: 'calculadora.limiteFatores' } };
  }

  const delta = soma * soma - 4 * produto;
  if (delta < 0) {
    // Soma e produto fixam a média e a área; abaixo de zero não há retângulo.
    return { ...FATORES_VAZIO, produto, soma, erro: { chave: 'calculadora.semParReal' } };
  }

  // A arredondada só serve para perguntar «é quadrado perfeito?»; as raízes
  // irracionais têm de sair da raiz de verdade, ou 11 e 24 devolveriam o par
  // errado em vez de dizer que não há par inteiro.
  const arredondada = Math.round(Math.sqrt(delta));
  const exata = arredondada * arredondada === delta;
  const par: ParDeFatores | null = exata
    ? { a: (soma - arredondada) / 2, b: (soma + arredondada) / 2 }
    : null;

  const { tentativas, truncada } = varrerPares(produto, soma, par);

  // Com par inteiro os dois valores são exatos; sem ele, saem da raiz real.
  const exatos =
    par === null ? [(soma - Math.sqrt(delta)) / 2, (soma + Math.sqrt(delta)) / 2] : [par.a, par.b];

  return {
    produto,
    soma,
    par,
    tentativas,
    truncada,
    fatoracao: par === null ? null : escreverFatoracao(soma, produto, par),
    parExato: exatos.map(formatarValor),
    // `(x + a)(x + b)` zera em `-a` e `-b`: as raízes são os opostos do par.
    raizes: exatos
      .map((valor) => -valor)
      .sort((x, y) => x - y)
      .map(formatarValor),
    erro: null,
  };
}

/** `-24` e `  7 ` viram números; `2,5` e `x` viram `null`. */
function lerInteiro(bruto: string): number | null {
  const texto = bruto.trim();
  if (!/^[+-]?\d+$/.test(texto)) {
    return null;
  }
  return Number(texto);
}

function erroDoInteiro(bruto: string): ErroDaConta {
  return { chave: 'calculadora.naoInteiro', valores: { parte: bruto.trim() } };
}

/**
 * Os pares de divisores, na ordem em que a mão os tentaria.
 *
 * Para produto positivo os dois fatores têm o sinal da soma; para produto
 * negativo um deles é negativo, e qual é o maior se decide pelo sinal da soma.
 * É a regra que se ensina, escrita como código.
 */
function varrerPares(
  produto: number,
  soma: number,
  escolhido: ParDeFatores | null,
): { tentativas: readonly TentativaDeFator[]; truncada: boolean } {
  if (produto === 0) {
    // Zero não tem divisores a varrer: um dos fatores é ele próprio.
    return {
      tentativas: [{ a: 0, b: soma, soma, escolhido: escolhido !== null }],
      truncada: false,
    };
  }

  const magnitude = Math.abs(produto);
  const tentativas: TentativaDeFator[] = [];
  let truncada = false;

  for (let d = 1; d * d <= magnitude; d++) {
    if (magnitude % d !== 0) {
      continue;
    }

    const outro = magnitude / d;
    const [a, b] =
      produto > 0 ? (soma >= 0 ? [d, outro] : [-d, -outro]) : soma >= 0 ? [-d, outro] : [d, -outro];

    const acerto =
      escolhido !== null &&
      Math.min(a, b) === Math.min(escolhido.a, escolhido.b) &&
      Math.max(a, b) === Math.max(escolhido.a, escolhido.b);
    tentativas.push({ a, b, soma: a + b, escolhido: acerto });

    if (acerto) {
      break;
    }
    if (tentativas.length >= TENTATIVAS_VISIVEIS) {
      truncada = true;
      break;
    }
  }

  return { tentativas, truncada };
}

/** `x² - 11x + 24 = (x - 3)(x - 8)`. */
function escreverFatoracao(soma: number, produto: number, par: ParDeFatores): string {
  const termo = (valor: number, sufixo: string): string =>
    valor === 0 ? '' : ` ${valor < 0 ? '−' : '+'} ${Math.abs(valor)}${sufixo}`;
  const fator = (valor: number): string =>
    valor === 0 ? '(x)' : `(x ${valor < 0 ? '−' : '+'} ${Math.abs(valor)})`;

  const esquerda = `x²${termo(soma, 'x')}${termo(produto, '')}`;
  return `${esquerda} = ${fator(par.a)}${fator(par.b)}`;
}
