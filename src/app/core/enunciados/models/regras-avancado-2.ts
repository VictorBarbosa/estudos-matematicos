import { PI, fracao, mdc, type Regra } from '@core/enunciados/models/regras-de-passos';

/**
 * As regras de funções de várias variáveis, teoremas integrais e a leitura de
 * decimais como fração.
 */

/**
 * A dízima desmontada nos números que a conta usa.
 *
 * O método é o dos deslocamentos, que é como a geratriz se demonstra: de
 * 1,2555… tiram-se 1255,5… e 125,5…, cuja diferença é um inteiro — 1130 —
 * porque as duas têm a mesma cauda infinita. Daí x = 1130/900.
 *
 * `naoRepete` guarda um algarismo repetido a mais do que o olho vê («25» em
 * 1,2555…), e isso é de propósito: é o que faz o deslocamento maior cair
 * exatamente no fim de um período, e o denominador sair 9 seguido de zeros.
 */
interface PartesDaDizima {
  /** 1255: o número todo, sem vírgula, até o fim do primeiro período. */
  readonly completo: number;
  /** 125: o mesmo número sem o período. */
  readonly semPeriodo: number;
  /** 10: o fator do deslocamento menor. */
  readonly deslocamentoMenor: number;
  /** 900: a diferença entre os dois deslocamentos. */
  readonly denominador: number;
  readonly numerador: number;
}

/** Desmonta a dízima, ou devolve `null` quando o decimal não se repete. */
function partesDaDizima(texto: string): PartesDaDizima | null {
  // A dízima é escrita com reticências, e o número de pontos varia.
  const limpo = texto.replace(/\.+$/, '').replace(/\s/g, '');
  const [inteira, decimal = ''] = limpo.split(',');

  // Dízima composta: parte que não repete seguida de um bloco repetido.
  const prefixo = /(\d*)(\d)\2+/.exec(decimal);
  if (prefixo === null || decimal.length === 0) {
    return null;
  }

  const naoRepete = prefixo[1] ?? '';
  const bloco = (decimal.slice(naoRepete.length) || '0').replace(/(.)\1*/g, '$1');

  const completo = Number(`${inteira}${naoRepete}${bloco}`);
  const semPeriodo = Number(`${inteira}${naoRepete || '0'}`);

  return {
    completo,
    semPeriodo,
    deslocamentoMenor: 10 ** naoRepete.length,
    denominador: 9 * 10 ** naoRepete.length,
    numerador: completo - semPeriodo,
  };
}

/** A fração geratriz de um decimal escrito com vírgula, com ou sem repetição. */
function geratrizDoDecimal(texto: string): string {
  const limpo = texto.replace(/\.+$/, '').replace(/\s/g, '');
  const [inteira, decimal = ''] = limpo.split(',');

  const partes = partesDaDizima(texto);
  if (partes !== null) {
    const d = mdc(partes.numerador, partes.denominador);
    return fracao(partes.numerador / d, partes.denominador / d);
  }

  const casas = decimal.length;
  const inteiroTodo = Number(`${inteira}${decimal}`);
  const d = mdc(inteiroTodo, 10 ** casas);
  return fracao(inteiroTodo / d, 10 ** casas / d);
}

/**
 * A conta da geratriz escrita com os números deste caso.
 *
 * Era uma frase dentro da fórmula — «geratriz: parte que repete sobre 9,
 * deslocada» —, que não é fórmula, não se traduz e não mostra de onde sai o
 * resultado. Aqui aparecem os dois deslocamentos, a diferença e a fração.
 */
function contaDaGeratriz(texto: string): string {
  const partes = partesDaDizima(texto);
  if (partes === null) {
    return contaDoDecimalFinito(texto);
  }

  const { completo, semPeriodo, deslocamentoMenor, denominador, numerador } = partes;
  const deslocamentoMaior = deslocamentoMenor * 10;
  const irredutivel = fracao(
    numerador / mdc(numerador, denominador),
    denominador / mdc(numerador, denominador),
  );
  const [n, d] = irredutivel.split('/');

  const simplificada = d === undefined || `${numerador}` === n ? '' : ` = \\frac{${n}}{${d}}`;

  return (
    `${deslocamentoMaior}x - ${deslocamentoMenor}x = ${completo} - ${semPeriodo} = ${numerador}` +
    ` \\;\\Rightarrow\\; x = \\frac{${numerador}}{${denominador}}${simplificada}`
  );
}

/**
 * O decimal que ACABA, que não precisa de deslocamento nenhum.
 *
 * A pergunta é a mesma — «qual é a fração?» —, e o enunciado nem sempre avisa
 * qual dos dois casos ele traz. Aqui o denominador é a potência de dez que a
 * última casa indica, e o resto é simplificar.
 */
function contaDoDecimalFinito(texto: string): string {
  const limpo = texto.replace(/\.+$/, '').replace(/\s/g, '');
  const [inteira = '0', decimal = ''] = limpo.split(',');

  const casas = decimal.length;
  const numerador = Number(`${inteira}${decimal}`);
  const denominador = 10 ** casas;

  if (!Number.isFinite(numerador)) {
    throw new Error('não é um decimal');
  }

  const divisor = mdc(numerador, denominador);
  const [n, d] = fracao(numerador / divisor, denominador / divisor).split('/');

  const simplificada = d === undefined || `${numerador}` === n ? '' : ` = \\frac{${n}}{${d}}`;

  return `x = \\frac{${numerador}}{10^{${casas}}} = \\frac{${numerador}}{${denominador}}${simplificada}`;
}

/**
 * A fórmula do caso que o texto traz: dízima periódica ou decimal exato.
 *
 * Recebe o ENUNCIADO inteiro e tira dele o número, porque cada regra escreve
 * a pergunta de um jeito e o caso não está na forma, está no número.
 */
function formulaDaGeratriz(enunciado: string): string {
  const valor = /\d+[.,]\d+/.exec(enunciado)?.[0] ?? '0';

  return partesDaDizima(valor) === null ? 'x = \\frac{N}{10^{n}}' : FORMULA_DA_GERATRIZ;
}

/**
 * O método, em símbolos: dois deslocamentos cuja diferença é inteira.
 *
 * `a` é quantos algarismos ficam entre a vírgula e o período, `p` quantos
 * algarismos o período tem. Multiplicar por 10^(a+p) e por 10^a põe as duas
 * caudas infinitas em fase — e elas se cancelam na subtração, que é a única
 * razão de o método funcionar.
 */
const FORMULA_DA_GERATRIZ =
  '10^{a+p}x - 10^{a}x = \\overline{IAP} - \\overline{IA} \\;\\Rightarrow\\; ' +
  'x = \\frac{\\overline{IAP} - \\overline{IA}}{10^{a+p} - 10^{a}}';

export const REGRAS_AVANCADO_2: Readonly<Record<string, readonly Regra[]>> = {
  'funcoes-de-varias-variaveis': [
    [
      'A temperatura de uma chapa é # vezes x mais # vezes y. Quanto ela vale no ponto (#, #)?',
      'f(x, y) = ax + by',
      'f(#3, #4) = #1 \\cdot #3 + #2 \\cdot #4',
      (v) => v[0]! * v[2]! + v[1]! * v[3]!,
    ],
    [
      'Uma superfície vale o quadrado de x mais o quadrado de y. Quanto ela vale no ponto (#, #)?',
      'f(x, y) = x^2 + y^2',
      'f(#1, #2) = #1^2 + #2^2',
      (v) => v[0]! ** 2 + v[1]! ** 2,
    ],
    [
      'Quanto vale f(x, y) = x² + y² no ponto (#, #)?',
      'f(x, y) = x^2 + y^2',
      'f(#1, #2) = #1^2 + #2^2',
      (v) => v[0]! ** 2 + v[1]! ** 2,
    ],
    [
      'Quanto vale f(x, y) = x·y no ponto (#, #)?',
      'f(x, y) = xy',
      'f(#1, #2) = #1 \\cdot #2',
      (v) => v[0]! * v[1]!,
    ],
    [
      'Quanto vale f(x, y) = #x² + #y no ponto (#, #)?',
      'f(x, y) = ax^2 + by',
      'f(#3, #4) = #1 \\cdot #3^2 + #2 \\cdot #4',
      (v) => v[0]! * v[2]! ** 2 + v[1]! * v[3]!,
    ],
    [
      'Uma função vale o produto de x por y. Qual é o valor de k da curva de nível que passa por (#, #)?',
      'k = x \\cdot y',
      'k = # \\cdot #',
      (v) => v[0]! * v[1]!,
    ],
    [
      'Qual é o valor de k da curva de nível de f(x, y) = x² + y² que passa pelo ponto (#, #)?',
      'k = x^2 + y^2',
      'k = #^2 + #^2',
      (v) => v[0]! ** 2 + v[1]! ** 2,
    ],
    [
      'No domínio de f(x, y) = √(# − x² − y²), qual é o raio máximo do domínio? (duas casas decimais)',
      'r = \\sqrt{a}',
      'r = \\sqrt{#}',
      (v) => Math.sqrt(v[0]!),
      2,
    ],
    [
      'No domínio de f(x, y) = ln(# − x − y), qual é o maior valor que x pode assumir quando y = #? (duas casas decimais)',
      'a - x - y > 0 \\Rightarrow x < a - y',
      'x_{max} = # - #',
      (v) => v[0]! - v[1]!,
      2,
    ],
    [
      'Cortando a superfície z = x² + #y² pelo plano y = #, sobra uma parábola em x. Qual é a abscissa do vértice dela?',
      'z = x^2 + k \\Rightarrow x_v = 0',
      'x_v = 0',
      () => 0,
    ],
    [
      'O volume de um cilindro depende do raio e da altura. Para raio # e altura #, qual é o volume? Responda o número que multiplica π.',
      'V = \\pi r^2 h',
      'V = #^2 \\cdot #',
      (v) => v[0]! ** 2 * v[1]!,
    ],
    [
      'Qual é o valor MÍNIMO da função f(x, y) = x² + y² − #x − #y? (duas casas decimais)',
      'f_{min} = -\\frac{a^2 + b^2}{4}',
      'f_{min} = -\\frac{#^2 + #^2}{4}',
      (v) => -(v[0]! ** 2 + v[1]! ** 2) / 4,
      2,
    ],
  ],

  'teoremas-integrais': [
    [
      'Qual é a área do pedaço de um plano horizontal que fica acima de um retângulo de lados # e #?',
      'A = a \\cdot b',
      'A = # \\cdot #',
      (v) => v[0]! * v[1]!,
    ],
    [
      'Calcule o divergente do campo F = (#x, #y, #z) no ponto (#, #, #).',
      '\\nabla\\cdot F = a + b + c',
      '\\nabla\\cdot F = # + # + #',
      (v) => v[0]! + v[1]! + v[2]!,
    ],
    [
      'Calcule a componente z do rotacional do campo plano F = (−#y, #x) no ponto (#, #).',
      '(\\nabla\\times F)_z = \\frac{\\partial F_y}{\\partial x} - \\frac{\\partial F_x}{\\partial y} = a + b',
      '(\\nabla\\times F)_z = # + #',
      (v) => v[0]! + v[1]!,
    ],
    [
      'Qual é o fluxo de um campo constante de módulo #, perpendicular a uma superfície plana de área #?',
      '\\Phi = E \\cdot A',
      '\\Phi = # \\cdot #',
      (v) => v[0]! * v[1]!,
    ],
    [
      'Qual é o fluxo de um campo constante de módulo # através de uma superfície plana de área #, quando o campo é PARALELO à superfície?',
      '\\Phi = E A \\cos 90^\\circ = 0',
      '\\Phi = # \\cdot # \\cdot \\cos 90^\\circ',
      () => 0,
    ],
    [
      'Pelo teorema da divergência, qual é o fluxo do campo F = (#x, #y, #z) para fora da esfera de raio #? (duas casas decimais)',
      '\\Phi = \\iiint \\nabla\\cdot F\,dV = 3a \\cdot \\frac{4}{3}\\pi r^3',
      '\\Phi = 3 \\cdot # \\cdot \\frac{4}{3}\\pi \\cdot #^3',
      (v) => 3 * v[0]! * ((4 / 3) * PI * v[1]! ** 3),
      2,
    ],
    [
      'Qual é a área da superfície de uma esfera de raio #? Responda o número que multiplica π.',
      'A = 4\\pi r^2',
      'A = 4 \\cdot #^2',
      (v) => 4 * v[0]! ** 2,
    ],
    [
      'Pelo teorema da divergência, qual é o fluxo do campo F = (x, y, #z) para fora do cilindro x² + y² ≤ #, # ≤ z ≤ #, com as tampas? (duas casas decimais)',
      '\\Phi = \\iiint (2 + k)\,dV',
      '\\Phi = (2 + #1) \\cdot \\pi \\cdot #4 \\cdot (#2 - #3)',
      (v) => (2 + v[0]!) * PI * v[1]! * (v[3]! - v[2]!),
      2,
    ],
    [
      'Use o teorema de Green para calcular a circulação de F = (−y, x) na borda do retângulo # ≤ x ≤ #, # ≤ y ≤ #, no sentido anti-horário. (duas casas decimais)',
      '\\oint F\\cdot dr = \\iint 2\,dA = 2(b-a)(d-c)',
      '= 2 \\cdot (# - #) \\cdot (# - #)',
      (v) => 2 * (v[1]! - v[0]!) * (v[3]! - v[2]!),
      2,
    ],
    [
      'Pelo teorema de Green com F = (−y/#, x/#), calcule a área da região limitada pela circunferência de raio #. (duas casas decimais)',
      'A = \\pi r^2',
      'A = \\pi \\cdot #3^2',
      (v) => PI * v[v.length - 1]! ** 2,
      2,
    ],
  ],

  'numeros-decimais': [
    [
      'Escreva o número decimal # como fração irredutível.',
      'd = \\frac{N}{10^{n}}',
      (v) => {
        const casas = (String(v[0]!).split('.')[1] ?? '').length;
        return `${String(v[0]!).replace('.', '{,}')} = \\frac{${Math.round(v[0]! * 10 ** casas)}}{${10 ** casas}}`;
      },
      (_v, texto) =>
        geratrizDoDecimal((/decimal ([0-9.,]+)/.exec(texto)?.[1] ?? '0').replace('.', ',')),
    ],
    [
      'Escreva # como fração irredutível.',
      'd = \\frac{N}{10^{n}}',
      (v) => {
        const casas = (String(v[0]!).split('.')[1] ?? '').length;
        return `${String(v[0]!).replace('.', '{,}')} = \\frac{${Math.round(v[0]! * 10 ** casas)}}{${10 ** casas}}`;
      },
      (_v, texto) =>
        geratrizDoDecimal((/Escreva ([0-9.,]+) como/.exec(texto)?.[1] ?? '0').replace('.', ',')),
    ],
    [
      'Um número tem parte inteira zero e o algarismo # se repete infinitamente depois da vírgula. Qual é a fração geratriz, na forma irredutível?',
      '0{,}\\overline{d} = \\frac{d}{9}',
      '\\frac{#}{9}',
      (v) => fracao(v[0]!, 9),
    ],
    [
      'Num número de parte inteira zero, o par de algarismos # se repete infinitamente depois da vírgula. Escreva a fração irredutível.',
      '0{,}\\overline{pp} = \\frac{pp}{99}',
      '\\frac{#}{99}',
      (v) => fracao(v[0]!, 99),
    ],
    [
      'Um número tem parte inteira zero, o algarismo # logo depois da vírgula e, em seguida, o algarismo # repetindo-se para sempre. Escreva a fração irredutível.',
      '0{,}a\\overline{d} = \\frac{10a + d - a}{90}',
      '\\frac{#1 \\cdot 10 + #2 - #1}{90}',
      (v) => fracao(v[0]! * 10 + v[1]! - v[0]!, 90),
    ],
    [
      'Encontre a fração geratriz da dízima periódica #....',
      (_v, texto) => formulaDaGeratriz(texto),
      (_v, texto) => contaDaGeratriz(/dízima periódica ([0-9.,]+)/.exec(texto)?.[1] ?? '0'),
      (_v, texto) => {
        const valor = /dízima periódica ([0-9.,]+)/.exec(texto)?.[1] ?? '0';
        return geratrizDoDecimal(valor);
      },
    ],
    [
      'Encontre a fração geratriz da dízima periódica #...',
      (_v, texto) => formulaDaGeratriz(texto),
      (_v, texto) => contaDaGeratriz(/dízima periódica ([0-9.,]+)/.exec(texto)?.[1] ?? '0'),
      (_v, texto) => {
        const valor = /dízima periódica ([0-9.,]+)/.exec(texto)?.[1] ?? '0';
        return geratrizDoDecimal(valor);
      },
    ],
    [
      'Encontre a fração geratriz da dízima periódica composta #....',
      (_v, texto) => formulaDaGeratriz(texto),
      (_v, texto) =>
        contaDaGeratriz(/dízima periódica composta ([0-9.,]+)/.exec(texto)?.[1] ?? '0'),
      (_v, texto) => {
        const valor = /dízima periódica composta ([0-9.,]+)/.exec(texto)?.[1] ?? '0';
        return geratrizDoDecimal(valor);
      },
    ],
    [
      'Encontre a fração geratriz da dízima periódica #..., com repetição.',
      (_v, texto) => formulaDaGeratriz(texto),
      (_v, texto) =>
        contaDaGeratriz(
          /dízima (?:periódica|periódica composta) ([0-9.,]+)/.exec(texto)?.[1] ?? '0',
        ),
      (_v, texto) => {
        const valor = /dízima (?:periódica|periódica composta) ([0-9.,]+)/.exec(texto)?.[1] ?? '0';
        return geratrizDoDecimal(valor);
      },
    ],
  ],
};
