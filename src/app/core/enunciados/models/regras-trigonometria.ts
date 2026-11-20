import { PI, type Regra } from '@core/enunciados/models/regras-de-passos';

/**
 * As regras de Trigonometria e da lei dos senos e cossenos.
 *
 * Ângulo em graus entra sempre por uma conversão explícita — o `Math` trabalha
 * em radianos, e é o passo que mais erra quem confia na memória.
 */

const rad = (graus: number): number => (graus * PI) / 180;
const graus = (radianos: number): number => (radianos * 180) / PI;

/** Em que quadrante está o ângulo, de 1 a 4. */
function quadrante(angulo: number): number {
  const normalizado = ((angulo % 360) + 360) % 360;

  if (normalizado < 90) return 1;
  if (normalizado < 180) return 2;
  if (normalizado < 270) return 3;
  return 4;
}

/** O ângulo equivalente no primeiro quadrante. */
function noPrimeiroQuadrante(angulo: number): number {
  const normalizado = ((angulo % 360) + 360) % 360;

  if (normalizado <= 90) return normalizado;
  if (normalizado <= 180) return 180 - normalizado;
  if (normalizado <= 270) return normalizado - 180;
  return 360 - normalizado;
}

/**
 * As soluções de `sen x = k` no intervalo `[a, b)`.
 *
 * São duas famílias, `arcsen(k) + 360n` e `180 - arcsen(k) + 360n`, e o
 * intervalo do banco tem um passo que nem sempre é 360 — por isso a varredura é
 * feita sobre o número de períodos que cabem no intervalo.
 */
function solucoesDoSeno(k: number, a: number, b: number): readonly number[] {
  if (k < -1 || k > 1) return [];

  const base = graus(Math.asin(k));
  const familias = [base, 180 - base];
  const saida: number[] = [];

  for (const familia of familias) {
    for (let voltas = -4; voltas <= 8; voltas += 1) {
      const angulo = familia + 360 * voltas;
      if (angulo >= a && angulo < b) saida.push(angulo);
    }
  }

  return [...new Set(saida)].sort((x, y) => x - y);
}

/** As soluções de `cos x = k` no intervalo `[a, b)`. */
function solucoesDoCosseno(k: number, a: number, b: number): readonly number[] {
  if (k < -1 || k > 1) return [];

  const base = graus(Math.acos(k));
  const familias = [base, -base];
  const saida: number[] = [];

  for (const familia of familias) {
    for (let voltas = -4; voltas <= 8; voltas += 1) {
      const angulo = familia + 360 * voltas;
      if (angulo >= a && angulo < b) saida.push(angulo);
    }
  }

  return [...new Set(saida)].sort((x, y) => x - y);
}

/** As soluções de `tg x = k` no intervalo `[a, b)`, a cada 180°. */
function solucoesDaTangente(k: number, a: number, b: number): readonly number[] {
  const base = graus(Math.atan(k));
  const saida: number[] = [];

  for (let voltas = -4; voltas <= 8; voltas += 1) {
    const angulo = base + 180 * voltas;
    if (angulo >= a && angulo < b) saida.push(angulo);
  }

  return [...new Set(saida)].sort((x, y) => x - y);
}

/** A área de um triângulo com os três lados — fórmula de Heron. */
function heron(a: number, b: number, c: number): number {
  const s = (a + b + c) / 2;
  return Math.sqrt(s * (s - a) * (s - b) * (s - c));
}

/** O maior ângulo de um triângulo de lados conhecidos, em graus. */
function anguloOposto(a: number, b: number, c: number): number {
  // `a` é o lado oposto ao ângulo procurado.
  return graus(Math.acos((b * b + c * c - a * a) / (2 * b * c)));
}

export const REGRAS_TRIGONOMETRIA: Readonly<Record<string, readonly Regra[]>> = {
  'seno-cosseno-tangente': [
    [
      'Num triângulo retângulo, o seno de um ângulo agudo vale #. Quanto vale o cosseno desse mesmo ângulo? (duas casas decimais)',
      '\\cos^2\\theta = 1 - \\sin^2\\theta',
      '\\cos\\theta = \\sqrt{1 - #^2}',
      (v) => Math.sqrt(1 - v[0]! ** 2),
      2,
    ],
    [
      'Calcule o valor de sen #°. (duas casas decimais)',
      '\\sin\\theta',
      '\\sin #1^\\circ = \\sin\\left(#1\\frac{\\pi}{180}\\right)',
      (v) => Math.sin(rad(v[0]!)),
      2,
    ],
    [
      'Calcule o valor de cos #°. (duas casas decimais)',
      '\\cos\\theta',
      '\\cos #1^\\circ = \\cos\\left(#1\\frac{\\pi}{180}\\right)',
      (v) => Math.cos(rad(v[0]!)),
      2,
    ],
    [
      'Calcule o valor de tg #°. (duas casas decimais)',
      '\\tan\\theta',
      '\\tan #^\\circ',
      (v) => Math.tan(rad(v[0]!)),
      2,
    ],
    [
      'Num triângulo retângulo, o cateto oposto a um ângulo mede # e a hipotenusa mede #. Quanto vale o seno desse ângulo? (duas casas decimais)',
      '\\sin\\theta = \\frac{a}{c}',
      '\\sin\\theta = \\frac{#}{#}',
      (v) => v[0]! / v[1]!,
      2,
    ],
    [
      'Se sen θ = # e θ está no #º quadrante, qual é o valor de cos θ? (duas casas decimais)',
      '\\cos\\theta = \\pm\\sqrt{1 - \\sin^2\\theta}',
      '\\cos\\theta = \\sqrt{1 - #^2}',
      (v) => {
        const modulo = Math.sqrt(1 - v[0]! ** 2);
        // O cosseno é negativo no 2º e no 3º quadrante.
        return v[1]! === 2 || v[1]! === 3 ? -modulo : modulo;
      },
      2,
    ],
    [
      'Se cos θ = # e θ está no #º quadrante, qual é o valor de tg θ? (duas casas decimais)',
      '\\tan\\theta = \\frac{\\pm\\sqrt{1 - \\cos^2\\theta}}{\\cos\\theta}',
      '\\tan\\theta = \\frac{\\sqrt{1 - #^2}}{#}',
      (v) => {
        const seno = Math.sqrt(1 - v[0]! ** 2);
        // A tangente é negativa no 2º e no 4º quadrante.
        const sinal = v[1]! === 2 || v[1]! === 4 ? -1 : 1;
        return (sinal * seno) / v[0]!;
      },
      2,
    ],
    [
      'Calcule sen #° · cos #°. (duas casas decimais)',
      '\\sin\\theta \\cos\\theta = \\frac{\\sin 2\\theta}{2}',
      '\\sin #^\\circ \\cdot \\cos #^\\circ',
      (v) => Math.sin(rad(v[0]!)) * Math.cos(rad(v[1]!)),
      2,
    ],
    [
      'A tangente de um ângulo agudo vale #. Quanto vale o seno desse ângulo? (duas casas decimais)',
      '\\sin\\theta = \\frac{\\tan\\theta}{\\sqrt{1 + \\tan^2\\theta}}',
      '\\sin\\theta = \\frac{#1}{\\sqrt{1 + #1^2}}',
      (v) => v[0]! / Math.sqrt(1 + v[0]! ** 2),
      2,
    ],
    [
      'Calcule sen²#° + cos²#°, usando a relação fundamental. (duas casas decimais)',
      '\\sin^2\\theta + \\cos^2\\theta = 1',
      '\\sin^2 #^\\circ + \\cos^2 #^\\circ = 1',
      () => 1,
      2,
    ],
    [
      'Calcule tg #°, sabendo que esse ângulo está no #º quadrante e que a tangente é positiva. (duas casas decimais)',
      '\\tan\\theta > 0',
      '\\tan #^\\circ',
      (v) => Math.tan(rad(v[0]!)),
      2,
    ],
    [
      'O cosseno de um ângulo do primeiro quadrante vale #. Quanto vale a tangente desse ângulo? (duas casas decimais)',
      '\\tan\\theta = \\frac{\\sqrt{1 - \\cos^2\\theta}}{\\cos\\theta}',
      '\\tan\\theta = \\frac{\\sqrt{1 - #1^2}}{#1}',
      (v) => Math.sqrt(1 - v[0]! ** 2) / v[0]!,
      2,
    ],
    [
      'Se tg θ = # e θ está no #º quadrante, qual é o valor de sen θ? (duas casas decimais)',
      '\\sin\\theta = \\pm\\frac{\\tan\\theta}{\\sqrt{1 + \\tan^2\\theta}}',
      '\\sin\\theta = \\frac{#}{\\sqrt{1 + #^2}}',
      (v) => {
        const modulo = Math.abs(v[0]!) / Math.sqrt(1 + v[0]! ** 2);
        // O seno é negativo no 3º e no 4º quadrante.
        return v[1]! === 3 || v[1]! === 4 ? -modulo : modulo;
      },
      2,
    ],
    [
      'Calcule o valor de sen #° · cos #° para o ângulo dado. (duas casas decimais)',
      '\\sin\\theta \\cos\\theta',
      '\\sin #^\\circ \\cdot \\cos #^\\circ',
      (v) => Math.sin(rad(v[0]!)) * Math.cos(rad(v[0]!)),
      2,
    ],
    [
      'Uma sombra tem comprimento igual a # vezes a altura do objeto que a projeta. Qual é o ângulo do sol com o horizonte, em graus? (duas casas decimais)',
      '\\tan\\theta = \\frac{h}{s} = \\frac{1}{k}',
      '\\theta = \\arctan\\left(\\frac{1}{#}\\right)',
      (v) => graus(Math.atan(1 / v[0]!)),
      2,
    ],
  ],

  'identidades-trigonometricas': [
    [
      'Use a fórmula da soma de arcos para calcular o seno de (#° + #°). (duas casas decimais)',
      '\\sin(a + b) = \\sin a\\cos b + \\sin b\\cos a',
      '\\sin(#^\\circ + #^\\circ)',
      (v) => Math.sin(rad(v[0]! + v[1]!)),
      2,
    ],
    [
      'Calcule sen(#° + #°) usando a fórmula da soma de arcos. (duas casas decimais)',
      '\\sin(a + b) = \\sin a\\cos b + \\sin b\\cos a',
      '\\sin(#^\\circ + #^\\circ)',
      (v) => Math.sin(rad(v[0]! + v[1]!)),
      2,
    ],
    [
      'Se sen θ = # e θ está no #º quadrante, quanto vale cos θ? (duas casas decimais)',
      '\\cos\\theta = \\pm\\sqrt{1 - \\sin^2\\theta}',
      '\\cos\\theta = \\sqrt{1 - #^2}',
      (v) => {
        const modulo = Math.sqrt(1 - v[0]! ** 2);
        return v[1]! === 2 || v[1]! === 3 ? -modulo : modulo;
      },
      2,
    ],
    [
      'Use a fórmula do arco duplo para calcular sen #°, sabendo que sen #° = #. (duas casas decimais)',
      '\\sin 2a = 2\\sin a\\cos a',
      '\\sin(2 \\cdot #^\\circ)',
      (v) => Math.sin(rad(2 * v[0]!)),
      2,
    ],
    [
      'Use a fórmula da diferença de arcos para calcular o cosseno de (#° − #°). (duas casas decimais)',
      '\\cos(a - b) = \\cos a\\cos b + \\sin a\\sin b',
      '\\cos(#^\\circ - #^\\circ)',
      (v) => Math.cos(rad(v[0]! - v[1]!)),
      2,
    ],
    [
      'Calcule cos(#° − #°) usando a fórmula da diferença de arcos. (duas casas decimais)',
      '\\cos(a - b) = \\cos a\\cos b + \\sin a\\sin b',
      '\\cos(#^\\circ - #^\\circ)',
      (v) => Math.cos(rad(v[0]! - v[1]!)),
      2,
    ],
    [
      'Use o arco duplo para calcular cos #°, sabendo que cos #° = #. (duas casas decimais)',
      '\\cos 2a = 2\\cos^2 a - 1',
      '\\cos(2 \\cdot #^\\circ) = 2\\cos^2 #^\\circ - 1',
      (v) => Math.cos(rad(2 * v[0]!)),
      2,
    ],
    [
      'Sabendo que sen θ = #, qual é o valor de sen(#θ) se θ está no #º quadrante? (duas casas decimais)',
      '\\sin 2\\theta = 2\\sin\\theta\\cos\\theta',
      '\\sin(2\\theta) = 2 \\cdot # \\cdot \\sqrt{1 - #^2}',
      (v) => 2 * v[0]! * Math.sqrt(1 - v[0]! ** 2),
      2,
    ],
    [
      'Use a fórmula do arco duplo para calcular o seno do dobro de #°. (duas casas decimais)',
      '\\sin 2a = 2\\sin a\\cos a',
      '\\sin(2 \\cdot #^\\circ)',
      (v) => Math.sin(2 * rad(v[0]!)),
      2,
    ],
    [
      'Simplifique sen(#° − θ) para θ agudo e informe o valor quando θ = #°. (duas casas decimais)',
      '\\sin(a - \\theta) = \\sin a\\cos\\theta - \\sin\\theta\\cos a',
      '\\sin(#^\\circ - #^\\circ)',
      (v) => Math.sin(rad(v[0]! - v[1]!)),
      2,
    ],
    [
      'Calcule tg(#° + #°) usando a fórmula da soma. (duas casas decimais)',
      '\\tan(a + b) = \\frac{\\tan a + \\tan b}{1 - \\tan a\\tan b}',
      '\\tan(#^\\circ + #^\\circ)',
      (v) => Math.tan(rad(v[0]! + v[1]!)),
      2,
    ],
    [
      'Se tg θ = #, qual é o valor de tg(#θ)? (duas casas decimais)',
      '\\tan 2\\theta = \\frac{2\\tan\\theta}{1 - \\tan^2\\theta}',
      '\\tan(2\\theta) = \\frac{2 \\cdot #}{1 - #^2}',
      (v) => (2 * v[0]!) / (1 - v[0]! ** 2),
      2,
    ],
    [
      'O seno de um ângulo agudo vale #. Use o arco duplo para calcular o seno do dobro desse ângulo. (duas casas decimais)',
      '\\sin 2\\theta = 2\\sin\\theta\\cos\\theta',
      '\\sin 2\\theta = 2 \\cdot #1 \\cdot \\sqrt{1 - #1^2}',
      (v) => 2 * v[0]! * Math.sqrt(1 - v[0]! ** 2),
      2,
    ],
    [
      'Sabendo que sen θ − cos θ = #, qual é o valor de sen(#θ)? (duas casas decimais)',
      '(\\sin\\theta - \\cos\\theta)^2 = 1 - \\sin 2\\theta',
      '\\sin 2\\theta = 1 - #^2',
      (v) => 1 - v[0]! ** 2,
      2,
    ],
    [
      'Calcule sen #° decomposto em soma de dois arcos, usando as fórmulas de adição. (duas casas decimais)',
      '\\sin(a + b) = \\sin a\\cos b + \\sin b\\cos a',
      '\\sin(#^\\circ)',
      (v) => Math.sin(rad(v[0]!)),
      2,
    ],
    [
      'Simplifique a expressão (# − cos #θ)/# para θ = #°. (duas casas decimais)',
      '\\frac{1 - \\cos 2\\theta}{2} = \\sin^2\\theta',
      '\\frac{# - \\cos(# \\cdot #^\\circ)}{#}',
      (v) => (v[0]! - Math.cos(rad(v[1]! * v[3]!))) / v[2]!,
      2,
    ],
  ],

  'funcoes-trigonometricas': [
    [
      'Numa roda-gigante de raio # m, o centro está a # m do chão. Qual é a altura máxima, em metros, que um passageiro alcança?',
      'h_{max} = c + r',
      'h_{max} = # + #',
      (v) => v[1]! + v[0]!,
    ],
    [
      'Numa roda-gigante de raio # m, o centro está a # m do chão. Qual é a altura mínima, em metros, que um passageiro alcança?',
      'h_{min} = c - r',
      'h_{min} = #2 - #1',
      (v) => v[1]! - v[0]!,
    ],
    [
      'A função f(x) = # · sen(x) tem qual amplitude?',
      'f(x) = A\\sin x \\Rightarrow A_{amp} = |A|',
      'A = |#|',
      (v) => Math.abs(v[0]!),
    ],
    [
      'Qual é o período da função f(x) = sen(#x), em radianos? (duas casas decimais)',
      'T = \\frac{2\\pi}{k}',
      'T = \\frac{2\\pi}{#}',
      (v) => (2 * PI) / v[0]!,
      2,
    ],
    [
      'Qual é o período da função f(x) = tg(#x), em radianos? (duas casas decimais)',
      'T = \\frac{\\pi}{k}',
      'T = \\frac{\\pi}{#}',
      (v) => PI / v[0]!,
      2,
    ],
    [
      'Qual é o valor MÁXIMO que a função f(x) = # + # · sen(x) atinge?',
      'f_{max} = a + |b|',
      'f_{max} = # + #',
      (v) => v[0]! + Math.abs(v[1]!),
    ],
    [
      'Qual é o valor MÍNIMO que a função f(x) = # + # · cos(x) atinge?',
      'f_{min} = a - |b|',
      'f_{min} = # - #',
      (v) => v[0]! - Math.abs(v[1]!),
    ],
    [
      'A função f(x) = # · sen(#x) tem amplitude e período. Qual é o PRODUTO dos dois? (duas casas decimais)',
      'A \\cdot T = |A| \\cdot \\frac{2\\pi}{k}',
      'A \\cdot T = # \\cdot \\frac{2\\pi}{#}',
      (v) => Math.abs(v[0]!) * ((2 * PI) / v[1]!),
      2,
    ],
    [
      'Uma oscilação completa um ciclo a cada # segundos. Qual é a frequência, em hertz? (duas casas decimais)',
      'f = \\frac{1}{T}',
      'f = \\frac{1}{#}',
      (v) => 1 / v[0]!,
      2,
    ],
    [
      'Qual é o deslocamento horizontal (fase) da função f(x) = sen(x − #), em radianos? (duas casas decimais)',
      '\\sin(x - \\varphi) \\Rightarrow \\varphi = c',
      '\\varphi = #',
      (v) => v[0]!,
      2,
    ],
    [
      'A função f(x) = # · sen(#x) + # atinge que valor em x = #?',
      'f(x) = A\\sin(kx) + c',
      'f(#4) = #1 \\cdot \\sin(#2 \\cdot #4) + #3',
      (v) => v[0]! * Math.sin(v[1]! * v[3]!) + v[2]!,
    ],
    [
      'A maré varia entre # m e # m ao longo do dia. Qual é a amplitude dessa oscilação, em metros? (duas casas decimais)',
      'A = \\frac{M - m}{2}',
      'A = \\frac{#2222 - #1111}{2}',
      (v) => (v[1]! - v[0]!) / 2,
      2,
    ],
    [
      'A função f(x) = # · cos(#x) tem valor máximo M e mínimo m. Qual é o valor de M − m?',
      'M - m = 2|A|',
      'M - m = 2 \\cdot #',
      (v) => 2 * Math.abs(v[0]!),
    ],
    [
      'Qual é o período da função f(x) = # · sen(#x + #), em radianos? (duas casas decimais)',
      'T = \\frac{2\\pi}{k}',
      'T = \\frac{2\\pi}{#}',
      (v) => (2 * PI) / v[1]!,
      2,
    ],
  ],

  'circulo-trigonometrico': [
    [
      'Uma roda girou #°. Quantos radianos são esses? (duas casas decimais)',
      '\\theta_{\\mathrm{rad}} = \\frac{\\pi}{180}\\,\\theta_{\\mathrm{deg}}',
      '\\frac{\\pi}{180} \\cdot #',
      (v) => rad(v[0]!),
      2,
    ],
    [
      'Converta #° para radianos. (duas casas decimais)',
      '\\theta_{\\mathrm{rad}} = \\frac{\\pi}{180}\\,\\theta_{\\mathrm{deg}}',
      '\\frac{\\pi}{180} \\cdot #',
      (v) => rad(v[0]!),
      2,
    ],
    [
      'Um ponteiro girou # radianos. Quantos graus são esses? (duas casas decimais)',
      '\\frac{180}{\\pi}\\,\\theta',
      '\\frac{180}{\\pi} \\cdot #',
      (v) => graus(v[0]!),
      2,
    ],
    [
      'Quantos graus tem um arco de # radianos? (duas casas decimais)',
      '\\frac{180}{\\pi}\\,\\theta',
      '\\frac{180}{\\pi} \\cdot #',
      (v) => graus(v[0]!),
      2,
    ],
    [
      'Em qual quadrante está o ângulo de #°? Responda com #, #, # ou #.',
      'Q = \\left\\lfloor\\frac{\\theta}{90}\\right\\rfloor + 1',
      '#^\\circ \\Rightarrow Q = \\left\\lfloor\\frac{#}{90}\\right\\rfloor + 1',
      (v) => quadrante(v[0]!),
    ],
    [
      'Um arco de # radianos está em qual quadrante? Responda com #, #, # ou #.',
      '\\theta\\ \\mathrm{rad} \\Rightarrow Q',
      '#\\ \\mathrm{rad} = #^\\circ \\Rightarrow Q = \\left\\lfloor\\frac{#}{90}\\right\\rfloor + 1',
      (v) => quadrante(graus(v[0]!)),
    ],
    [
      'Reduza o ângulo de #° ao primeiro quadrante e informe o ângulo equivalente, em graus.',
      '\\theta_1',
      '#^\\circ \\Rightarrow \\theta_1',
      (v) => noPrimeiroQuadrante(v[0]!),
    ],
    [
      'Qual é o valor de sen #°? (duas casas decimais)',
      '\\sin\\theta',
      '\\sin #^\\circ',
      (v) => Math.sin(rad(v[0]!)),
      2,
    ],
    [
      'Qual é o valor de cos #°? (duas casas decimais)',
      '\\cos\\theta',
      '\\cos #^\\circ',
      (v) => Math.cos(rad(v[0]!)),
      2,
    ],
    [
      'Quanto vale o cosseno de #°? (duas casas decimais)',
      '\\cos\\theta',
      '\\cos #^\\circ',
      (v) => Math.cos(rad(v[0]!)),
      2,
    ],
    [
      'Qual é o valor de tg #°? (duas casas decimais)',
      '\\tan\\theta',
      '\\tan #^\\circ',
      (v) => Math.tan(rad(v[0]!)),
      2,
    ],
    [
      'Qual é o valor de sen #° + cos #°? (duas casas decimais)',
      '\\sin\\theta + \\cos\\theta',
      '\\sin #^\\circ + \\cos #^\\circ',
      (v) => Math.sin(rad(v[0]!)) + Math.cos(rad(v[1]!)),
      2,
    ],
    [
      'Qual é o sinal de cos #°? Responda # se for positivo e # se for negativo.',
      '\\cos\\theta > 0',
      '\\operatorname{sgn}\\left(\\cos #^\\circ\\right)',
      (v) => {
        const q = quadrante(v[0]!);
        return q === 1 || q === 4 ? 1 : -1;
      },
    ],
    [
      'Qual é o sinal do seno de #°? Responda # se for positivo e # se for negativo.',
      '\\sin\\theta > 0',
      '\\operatorname{sgn}\\left(\\sin #^\\circ\\right)',
      (v) => {
        const q = quadrante(v[0]!);
        return q === 1 || q === 2 ? 1 : -1;
      },
    ],
    [
      'Um ponto do ciclo trigonométrico tem abscissa #. Quantos são os valores possíveis da ordenada dele? Responda #, # ou #.',
      'x^2 + y^2 = 1 \\Rightarrow y = \\pm\\sqrt{1 - x^2}',
      'y = \\pm\\sqrt{1 - #^2}',
      (v) => (Math.abs(v[0]!) < 1 ? 2 : Math.abs(v[0]!) === 1 ? 1 : 0),
    ],
  ],

  'equacoes-trigonometricas': [
    [
      'Resolva a equação sen x = # em [#°, #°) e informe a MENOR solução, em graus.',
      '\\sin x = k \\Rightarrow x = \\arcsin k + 360n \\ \\lor\\ 180 - \\arcsin k + 360n',
      'x = \\arcsin(#)',
      (v) => solucoesDoSeno(v[0]!, v[1]!, v[2]!)[0] ?? Number.NaN,
    ],
    [
      'Resolva a equação sen x = # em [#°, #°) e informe a MAIOR solução, em graus.',
      '\\sin x = k',
      'x = \\arcsin(#)',
      (v) => {
        const lista = solucoesDoSeno(v[0]!, v[1]!, v[2]!);
        return lista[lista.length - 1] ?? Number.NaN;
      },
    ],
    [
      'Quantas soluções tem a equação sen x = # em [#°, #°)? Responda com um número.',
      '\\sin x = k',
      'n = \\#\\{\\sin x = #\\}',
      (v) => solucoesDoSeno(v[0]!, v[1]!, v[2]!).length,
    ],
    [
      'Resolva a equação cos x = # em [#°, #°) e informe a MENOR solução, em graus.',
      '\\cos x = k \\Rightarrow x = \\pm\\arccos k + 360n',
      'x = \\arccos(#)',
      (v) => solucoesDoCosseno(v[0]!, v[1]!, v[2]!)[0] ?? Number.NaN,
    ],
    [
      'Resolva a equação cos x = # em [#°, #°) e informe a MAIOR solução, em graus.',
      '\\cos x = k',
      'x = \\arccos(#)',
      (v) => {
        const lista = solucoesDoCosseno(v[0]!, v[1]!, v[2]!);
        return lista[lista.length - 1] ?? Number.NaN;
      },
    ],
    [
      'Resolva a equação tg x = # em [#°, #°) e informe a MENOR solução, em graus.',
      '\\tan x = k \\Rightarrow x = \\arctan k + 180n',
      'x = \\arctan(#)',
      (v) => solucoesDaTangente(v[0]!, v[1]!, v[2]!)[0] ?? Number.NaN,
    ],
    [
      'Resolva a equação tg x = −# em [#°, #°) e informe a MENOR solução, em graus.',
      '\\tan x = -k \\Rightarrow x = \\arctan(-k) + 180n',
      'x = \\arctan(-#)',
      (v) => solucoesDaTangente(-v[0]!, v[1]!, v[2]!)[0] ?? Number.NaN,
    ],
    [
      'Resolva a equação # sen x − # = # em [#°, #°) e informe a MAIOR solução, em graus.',
      'a\\sin x - b = c \\Rightarrow \\sin x = \\frac{b + c}{a}',
      '\\sin x = \\frac{# + #}{#}',
      (v) => {
        const lista = solucoesDoSeno((v[1]! + v[2]!) / v[0]!, v[3]!, v[4]!);
        return lista[lista.length - 1] ?? Number.NaN;
      },
    ],
    [
      'Resolva a equação # cos²x − # = # em [#°, #°) e informe a MAIOR solução, em graus.',
      'a\\cos^2 x - b = c \\Rightarrow \\cos x = \\sqrt{\\frac{b + c}{a}}',
      '\\cos x = \\sqrt{\\frac{# + #}{#}}',
      (v) => {
        const modulo = Math.sqrt((v[1]! + v[2]!) / v[0]!);
        const lista = [
          ...solucoesDoCosseno(modulo, v[3]!, v[4]!),
          ...solucoesDoCosseno(-modulo, v[3]!, v[4]!),
        ].sort((a, b) => a - b);
        return lista[lista.length - 1] ?? Number.NaN;
      },
    ],
    [
      'Resolva a equação sen #x = # em [#°, #°) e informe a SOMA das soluções, em graus.',
      '\\sin(kx) = v',
      '\\sin(#x) = #',
      (v) => {
        // Se x anda em [a, b), então u = kx anda em [ka, kb).
        const lista = solucoesDoSeno(v[1]!, v[2]! * v[0]!, v[3]! * v[0]!);
        return lista.reduce((total, grau) => total + grau / v[0]!, 0);
      },
    ],
    [
      'Resolva, em graus, a equação em que o seno de x vale #, no intervalo de #° a #° sem incluir #°. Informe a SOMA de todas as soluções.',
      '\\sin x = k',
      '\\sin x = #',
      (v) => solucoesDoSeno(v[0]!, v[1]!, v[2]!).reduce((total, grau) => total + grau, 0),
    ],
    [
      'Resolva, em graus, a equação em que o seno de x vale menos #, no intervalo de #° a #° sem incluir #°. Informe a MENOR solução.',
      '\\sin x = -k',
      '\\sin x = -#',
      (v) => solucoesDoSeno(-v[0]!, v[1]!, v[2]!)[0] ?? Number.NaN,
    ],
    [
      'Resolva, em graus, a equação em que o cosseno de x vale #, no intervalo de #° a #° sem incluir #°. Informe a SOMA de todas as soluções.',
      '\\cos x = k',
      '\\cos x = #',
      (v) => solucoesDoCosseno(v[0]!, v[1]!, v[2]!).reduce((total, grau) => total + grau, 0),
    ],
    [
      'Resolva, em graus, a equação em que a tangente de x vale #, no intervalo de #° a #° sem incluir #°. Informe a MAIOR solução.',
      '\\tan x = k',
      '\\tan x = #',
      (v) => {
        const lista = solucoesDaTangente(v[0]!, v[1]!, v[2]!);
        return lista[lista.length - 1] ?? Number.NaN;
      },
    ],
  ],

  'lei-senos-cossenos': [
    [
      'Um terreno triangular tem dois lados de # m e # m, com #° entre eles. Quanto mede o terceiro lado, em metros? (duas casas decimais)',
      'c^2 = a^2 + b^2 - 2ab\\cos\\theta',
      'c = \\sqrt{#1^2 + #2^2 - 2 \\cdot #1 \\cdot #2 \\cdot \\cos #3^\\circ}',
      (v) => Math.sqrt(v[0]! ** 2 + v[1]! ** 2 - 2 * v[0]! * v[1]! * Math.cos(rad(v[2]!))),
      2,
    ],
    [
      'Dois lados de um triângulo medem # cm e # cm e formam entre si um ângulo de #°. Quantos centímetros mede o terceiro lado? (duas casas decimais)',
      'c^2 = a^2 + b^2 - 2ab\\cos\\theta',
      'c = \\sqrt{#1^2 + #2^2 - 2 \\cdot #1 \\cdot #2 \\cdot \\cos #3^\\circ}',
      (v) => Math.sqrt(v[0]! ** 2 + v[1]! ** 2 - 2 * v[0]! * v[1]! * Math.cos(rad(v[2]!))),
      2,
    ],
    [
      'Um terreno triangular tem lados de # m e # m, e o ângulo entre eles mede #°. Quantos metros mede o terceiro lado? (duas casas decimais)',
      'c^2 = a^2 + b^2 - 2ab\\cos\\theta',
      'c = \\sqrt{#1^2 + #2^2 - 2 \\cdot #1 \\cdot #2 \\cdot \\cos #3^\\circ}',
      (v) => Math.sqrt(v[0]! ** 2 + v[1]! ** 2 - 2 * v[0]! * v[1]! * Math.cos(rad(v[2]!))),
      2,
    ],
    [
      'Num triângulo, um lado de # cm é oposto a um ângulo de #°. Qual é o raio da circunferência circunscrita, em centímetros? (duas casas decimais)',
      '\\frac{a}{\\sin A} = 2R',
      'R = \\frac{#}{2\\sin #^\\circ}',
      (v) => v[0]! / (2 * Math.sin(rad(v[1]!))),
      2,
    ],
    [
      'Num triângulo, o lado de # cm é oposto ao ângulo de #°. Qual é o lado oposto ao ângulo de #°? (duas casas decimais)',
      '\\frac{a}{\\sin A} = \\frac{b}{\\sin B}',
      'b = \\frac{# \\cdot \\sin #^\\circ}{\\sin #^\\circ}',
      (v) => (v[0]! * Math.sin(rad(v[2]!))) / Math.sin(rad(v[1]!)),
      2,
    ],
    [
      'Num triângulo, o lado que mede # está oposto ao ângulo de #°. Quanto mede o lado oposto ao ângulo de #°? (duas casas decimais)',
      '\\frac{a}{\\sin A} = \\frac{b}{\\sin B}',
      'b = \\frac{# \\cdot \\sin #^\\circ}{\\sin #^\\circ}',
      (v) => (v[0]! * Math.sin(rad(v[2]!))) / Math.sin(rad(v[1]!)),
      2,
    ],
    [
      'Num triângulo, dois ângulos medem #° e #°, e o lado oposto ao primeiro mede # cm. Qual é o lado oposto ao segundo? (duas casas decimais)',
      '\\frac{a}{\\sin A} = \\frac{b}{\\sin B}',
      'b = \\frac{# \\cdot \\sin #^\\circ}{\\sin #^\\circ}',
      (v) => (v[2]! * Math.sin(rad(v[1]!))) / Math.sin(rad(v[0]!)),
      2,
    ],
    [
      'Um triângulo tem lados de # cm, # cm e # cm. Quantos graus mede o ângulo oposto ao lado de # cm? (duas casas decimais)',
      '\\cos\\hat{A} = \\frac{b^2 + c^2 - a^2}{2bc}',
      '\\hat{A} = \\arccos\\left(\\frac{#1^2 + #2^2 - #3^2}{2 \\cdot #1 \\cdot #2}\\right)',
      (v) => anguloOposto(v[2]!, v[0]!, v[1]!),
      2,
    ],
    [
      'Dois lados de um triângulo medem # cm e # cm e formam um ângulo de #°. Quantos centímetros quadrados tem a área dele? (duas casas decimais)',
      'A = \\frac{ab\\sin\\theta}{2}',
      'A = \\frac{# \\cdot # \\cdot \\sin #^\\circ}{2}',
      (v) => (v[0]! * v[1]! * Math.sin(rad(v[2]!))) / 2,
      2,
    ],
    [
      'Um triângulo tem lados de # m, # m e # m. Quantos metros quadrados tem a área dele, pela fórmula de Heron? (duas casas decimais)',
      'A = \\sqrt{s(s-a)(s-b)(s-c)},\\ s = \\frac{a+b+c}{2}',
      'A = \\sqrt{s(s - #)(s - #)(s - #)}',
      (v) => heron(v[0]!, v[1]!, v[2]!),
      2,
    ],
    [
      'Um navio está a # km de um farol e a # km de outro, que distam # km entre si. Quantos graus mede o ângulo sob o qual o navio vê os dois faróis? (duas casas decimais)',
      '\\cos\\hat{A} = \\frac{b^2 + c^2 - a^2}{2bc}',
      '\\hat{N} = \\arccos\\left(\\frac{#1^2 + #2^2 - #3^2}{2 \\cdot #1 \\cdot #2}\\right)',
      (v) => anguloOposto(v[2]!, v[0]!, v[1]!),
      2,
    ],
    [
      'Um triângulo tem lados #, # e #. Quantos graus mede o maior ângulo? (duas casas decimais)',
      '\\cos\\hat{A} = \\frac{b^2 + c^2 - a^2}{2bc},\\ a_{max}',
      '\\cos\\hat{A} = \\frac{#^2 + #^2 - #^2}{2 \\cdot # \\cdot #}',
      (v) => {
        const lados = [v[0]!, v[1]!, v[2]!].sort((a, b) => a - b);
        return anguloOposto(lados[2]!, lados[0]!, lados[1]!);
      },
      2,
    ],
    [
      'Um triângulo tem lados # m e # m e a área dele é de # m². Qual é o ângulo entre esses dois lados, em graus? (duas casas decimais)',
      'A = \\frac{ab\\sin\\theta}{2} \\Rightarrow \\sin\\theta = \\frac{2A}{ab}',
      '\\theta = \\arcsin\\left(\\frac{2 \\cdot #}{# \\cdot #}\\right)',
      (v) => graus(Math.asin((2 * v[2]!) / (v[0]! * v[1]!))),
      2,
    ],
    [
      'Num triângulo, o lado de # cm é oposto ao ângulo de #°, e outro lado mede # cm. Quantos graus mede o ângulo oposto a esse lado? Se houver dois, informe o MAIOR. (duas casas decimais)',
      '\\sin B = \\frac{b\\sin A}{a}',
      'B = \\arcsin\\left(\\frac{# \\cdot \\sin #^\\circ}{#}\\right)',
      (v) => {
        const seno = (v[2]! * Math.sin(rad(v[1]!))) / v[0]!;
        const principal = graus(Math.asin(seno));
        // O suplemento também serve, e o maior é o pedido.
        return Math.max(principal, 180 - principal);
      },
      2,
    ],
    [
      'Um triângulo tem lados de # km, # km e # km. Quantos quilômetros mede a mediana relativa ao maior lado? (duas casas decimais)',
      'm_a = \\frac{1}{2}\\sqrt{2b^2 + 2c^2 - a^2}',
      'm = \\frac{1}{2}\\sqrt{2 \\cdot #^2 + 2 \\cdot #^2 - #^2}',
      (v) => {
        const lados = [v[0]!, v[1]!, v[2]!].sort((a, b) => a - b);
        const maior = lados[2]!;
        return 0.5 * Math.sqrt(2 * lados[0]! ** 2 + 2 * lados[1]! ** 2 - maior ** 2);
      },
      2,
    ],
  ],
};
