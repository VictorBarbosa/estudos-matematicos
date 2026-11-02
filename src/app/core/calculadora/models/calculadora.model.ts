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

export type ModoCalculadora = 'basica' | 'cientifica';

/** Como os ângulos das funções trigonométricas são lidos. */
export type Angulo = 'rad' | 'deg';

export interface EstadoCalculadora {
  /** A expressão como o aluno a escreveu, com vírgula, × e ÷. */
  readonly expressao: string;
  /** O resultado da última avaliação, já formatado, ou `null`. */
  readonly resultado: string | null;
  /** O que impediu a conta, ou `null`. */
  readonly erro: string | null;
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
      ? arredondado.toExponential(6).replace(/(\.\d*?)0+e/, '$1e').replace(/\.e/, 'e')
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
      : (CONTINUA_A_CONTA.test(texto) ? estado.resultado : '');

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
  const expressao = ehSinal
    ? antes.slice(0, -1) + encontrado[1]
    : `${antes}-${encontrado[1]}`;

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
    return { expressao: estado.expressao, resultado: null, erro: 'Não dá para calcular isso.' };
  }

  const comTrigonometria = TRIGONOMETRICAS.some((nome) => fechada.includes(`${nome}(`));
  const limpo =
    comTrigonometria && Math.abs(valor) < RUIDO_TRIGONOMETRICO ? 0 : valor;

  return { expressao: fechada, resultado: formatarValor(limpo), erro: null };
}
