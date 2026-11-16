import { PI, type Regra } from '@core/enunciados/models/regras-de-passos';

/**
 * As regras de aritmética com expressões, ângulos, sólidos, poliedros e áreas.
 *
 * A primeira delas é diferente das outras: em vez de uma fórmula fixa, ela
 * INTERPRETA a expressão escrita no enunciado — `3 + 5 × 2²` vira conta de
 * verdade, com a precedência dos operadores.
 */

/** Converte a expressão escrita em português numa expressão que o JS entende. */
function expressaoDoTexto(texto: string): string | null {
  const achado = /Calcule (?:o valor da expressão |a expressão )?([^.]+?)\.?$/.exec(texto.trim());
  const bruta = achado?.[1];
  if (bruta === undefined) return null;

  return (
    bruta
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/\^/g, '**')
      .replace(/²/g, '**2')
      .replace(/³/g, '**3')
      .replace(/[\[\]]/g, (colchete) => (colchete === '[' ? '(' : ')'))
      .replace(/,/g, '.')
      .replace(/\s+/g, '')
      .replace(/[^0-9.+\-*/()]/g, '') || null
  );
}

/** Avalia a expressão com segurança: só dígitos e operadores chegam aqui. */
function avaliar(expressao: string): number {
  const limpa = expressao.replace(/\*\*/g, '^');
  // Converte `^` em `**` só para o avaliador, e nada mais.
  const executavel = limpa.replace(/\^/g, '**');
  return Number(new Function(`"use strict"; return (${executavel});`)());
}

export const REGRAS_AVANCADO_3: Readonly<Record<string, readonly Regra[]>> = {
  'operacoes-fundamentais': [
    [
      'Calcule # + # × #. (duas casas decimais)',
      'a + b \\times c',
      '# + # \\times #',
      (_v, texto) => {
        const expressao = expressaoDoTexto(texto);
        return expressao === null ? Number.NaN : avaliar(expressao);
      },
      2,
    ],
    [
      'Calcule (# + #) ÷ # + # × #.',
      'precedência: parênteses, multiplicação e divisão, soma e subtração',
      'expressão do enunciado',
      (_v, texto) => {
        const expressao = expressaoDoTexto(texto);
        return expressao === null ? Number.NaN : avaliar(expressao);
      },
    ],
    [
      'Calcule # + # × #² − #.',
      'precedência: parênteses, multiplicação e divisão, soma e subtração',
      'expressão do enunciado',
      (_v, texto) => {
        const expressao = expressaoDoTexto(texto);
        return expressao === null ? Number.NaN : avaliar(expressao);
      },
    ],
    [
      'Calcule # − # × (# + #) ÷ # + #².',
      'precedência dos operadores',
      'expressão do enunciado',
      (_v, texto) => {
        const expressao = expressaoDoTexto(texto);
        return expressao === null ? Number.NaN : avaliar(expressao);
      },
    ],
    [
      'Calcule [(# − #)² + # × (# − #)] ÷ #.',
      'precedência dos operadores',
      'expressão do enunciado',
      (_v, texto) => {
        const expressao = expressaoDoTexto(texto);
        return expressao === null ? Number.NaN : avaliar(expressao);
      },
    ],
    [
      'Calcule o valor da expressão # × (# − #) − #³ + # ÷ #.',
      'precedência dos operadores',
      'expressão do enunciado',
      (_v, texto) => {
        const expressao = expressaoDoTexto(texto);
        return expressao === null ? Number.NaN : avaliar(expressao);
      },
    ],
    [
      'Calcule (# + #) × # − #².',
      'precedência dos operadores',
      'expressão do enunciado',
      (_v, texto) => {
        const expressao = expressaoDoTexto(texto);
        return expressao === null ? Number.NaN : avaliar(expressao);
      },
    ],
    [
      'Numa caixa há # fileiras com # ovos cada, mais # ovos soltos. Quantos ovos há ao todo?',
      'N = a \\cdot b + c',
      'N = # \\cdot # + #',
      (v) => v[0]! * v[1]! + v[2]!,
    ],
    [
      'Numa bandeja há # fileiras com # pães cada, mais # pães soltos. Quantos pães há?',
      'N = a \\cdot b + c',
      'N = # \\cdot # + #',
      (v) => v[0]! * v[1]! + v[2]!,
    ],
    [
      'Numa papelaria, # cadernos custam R$ # cada e uma caneta custa R$ #. Quanto se gasta no total?',
      'T = a \\cdot b + c',
      'T = # \\cdot # + #',
      (v) => v[0]! * v[1]! + v[2]!,
    ],
  ],

  'angulos-e-triangulos': [
    [
      'Dois ângulos internos de um triângulo medem #° e #°. Quantos graus mede o terceiro?',
      '180 - a - b',
      '180 - # - #',
      (v) => 180 - v[0]! - v[1]!,
    ],
    [
      'Um triângulo isósceles tem cada ângulo da base medindo #°. Quantos graus mede o ângulo do vértice?',
      '180 - 2a',
      '180 - 2 \\cdot #',
      (v) => 180 - 2 * v[0]!,
    ],
    [
      'Num triângulo isósceles, o ângulo do vértice mede #°. Quantos graus mede cada ângulo da base?',
      '\\frac{180 - a}{2}',
      '\\frac{180 - #}{2}',
      (v) => (180 - v[0]!) / 2,
    ],
    [
      'Um terreno tem a forma de um polígono convexo de # lados. Qual é a soma dos ângulos internos dele, em graus?',
      'S = (n - 2) \\cdot 180',
      'S = (# - 2) \\cdot 180',
      (v) => (v[0]! - 2) * 180,
    ],
    [
      'Um mosaico usa um polígono regular de # lados. Qual é a soma dos ângulos internos desse polígono, em graus?',
      'S = (n - 2) \\cdot 180',
      'S = (# - 2) \\cdot 180',
      (v) => (v[0]! - 2) * 180,
    ],
    [
      'Um vitral é um polígono regular de # lados. Quantos graus mede cada ângulo externo desse polígono?',
      'e = \\frac{360}{n}',
      'e = \\frac{360}{#}',
      (v) => 360 / v[0]!,
    ],
    [
      'Num triângulo, os ângulos internos são proporcionais a #, # e #. Quantos graus mede o MAIOR deles?',
      '\\hat{A}_{max} = 180\\frac{M}{a+b+c}',
      '180 \\cdot \\frac{#}{# + # + #}',
      (v) => (180 * Math.max(v[0]!, v[1]!, v[2]!)) / (v[0]! + v[1]! + v[2]!),
    ],
    [
      'Duas tábuas se encontram sobre uma linha reta: uma delas faz #° com essa linha. Quantos graus faz a outra?',
      '180 - a',
      '180 - #',
      (v) => 180 - v[0]!,
    ],
    [
      'Uma escora de telhado faz #° com a viga horizontal. Quantos graus faltam para ela ficar na vertical?',
      '90 - a',
      '90 - #',
      (v) => 90 - v[0]!,
    ],
    [
      'A estrutura de uma rampa forma um triângulo com um ângulo reto. O ângulo da rampa com o chão mede #°. Quantos graus mede o outro ângulo agudo?',
      '90 - a',
      '90 - #',
      (v) => 90 - v[0]!,
    ],
  ],

  'solidos-e-volumes': [
    [
      'Um cubo tem aresta de # cm. Quantos centímetros cúbicos de volume ele tem?',
      'V = a^3',
      'V = #^3',
      (v) => v[0]! ** 3,
    ],
    [
      'Uma caixa tem # cm por # cm por # cm. Quantos centímetros cúbicos ela comporta?',
      'V = a b c',
      'V = # \\cdot # \\cdot #',
      (v) => v[0]! * v[1]! * v[2]!,
    ],
    [
      'Uma bola tem raio de # cm. Quantos centímetros cúbicos de volume ela tem? (duas casas decimais)',
      'V = \\frac{4}{3}\\pi r^3',
      'V = \\frac{4}{3}\\pi \\cdot #^3',
      (v) => (4 / 3) * PI * v[0]! ** 3,
      2,
    ],
    [
      'Uma bola de boliche tem # cm de raio. Quantos centímetros cúbicos de volume ela tem? (duas casas decimais)',
      'V = \\frac{4}{3}\\pi r^3',
      'V = \\frac{4}{3}\\pi \\cdot #^3',
      (v) => (4 / 3) * PI * v[0]! ** 3,
      2,
    ],
    [
      'Um hemisfério de pedra tem raio de # cm. Quantos centímetros cúbicos ele tem? (duas casas decimais)',
      'V = \\frac{2}{3}\\pi r^3',
      'V = \\frac{2}{3}\\pi \\cdot #^3',
      (v) => (2 / 3) * PI * v[0]! ** 3,
      2,
    ],
    [
      'Um cilindro tem raio de # cm e altura de # cm. Quantos centímetros cúbicos de volume ele tem? (duas casas decimais)',
      'V = \\pi r^2 h',
      'V = \\pi \\cdot #^2 \\cdot #',
      (v) => PI * v[0]! ** 2 * v[1]!,
      2,
    ],
    [
      'Uma tenda tem a forma de pirâmide de base quadrada, com lado # m e altura # m. Quantos metros cúbicos de ar cabem dentro? (duas casas decimais)',
      'V = \\frac{L^2 h}{3}',
      'V = \\frac{#^2 \\cdot #}{3}',
      (v) => (v[0]! ** 2 * v[1]!) / 3,
      2,
    ],
    [
      'Um reservatório cilíndrico de raio # m deve comportar # m³. Quantos metros de altura ele precisa ter? (duas casas decimais)',
      'h = \\frac{V}{\\pi r^2}',
      'h = \\frac{#2}{\\pi \\cdot #1^2}',
      (v) => v[1]! / (PI * v[0]! ** 2),
      2,
    ],
    [
      'Uma esfera de raio # cm é derretida e todo o material é moldado num cilindro de raio # cm. Quantos centímetros de altura o cilindro tem? (duas casas decimais)',
      'h = \\frac{4 r^3}{3 R^2}',
      'h = \\frac{4 \\cdot #^3}{3 \\cdot #^2}',
      (v) => (4 * v[0]! ** 3) / (3 * v[1]! ** 2),
      2,
    ],
  ],

  poliedros: [
    [
      'Um prisma tem como base um polígono de # lados. Quantas faces ele tem?',
      'F = n + 2',
      'F = # + 2',
      (v) => v[0]! + 2,
    ],
    [
      'Uma pirâmide tem base com # lados. Quantas arestas ela tem?',
      'A = 2n',
      'A = 2 \\cdot #',
      (v) => 2 * v[0]!,
    ],
    [
      'Um poliedro convexo tem # faces e # vértices. Quantas arestas ele tem?',
      'A = F + V - 2',
      'A = # + # - 2',
      (v) => v[0]! + v[1]! - 2,
    ],
    [
      'Num poliedro convexo todas as faces são pentágonos, e ele tem # faces. Quantas arestas ele tem?',
      '3F = 2A \\Rightarrow A = \\frac{5F}{2}',
      'A = \\frac{5 \\cdot #}{2}',
      (v) => (5 * v[0]!) / 2,
    ],
    [
      'Um poliedro convexo tem # faces triangulares e # faces quadradas, e nenhuma outra. Quantas arestas ele tem?',
      'A = \\frac{3F_3 + 4F_4}{2}',
      'A = \\frac{3 \\cdot # + 4 \\cdot #}{2}',
      (v) => (3 * v[0]! + 4 * v[1]!) / 2,
    ],
    [
      'Um poliedro convexo tem # faces quadradas e # faces hexagonais, e nenhuma outra. Quantos vértices ele tem?',
      'A = \\frac{4F_4 + 6F_6}{2},\\ V = A - F + 2',
      'V = \\frac{4 \\cdot # + 6 \\cdot #}{2} - (# + #) + 2',
      (v) => (4 * v[0]! + 6 * v[1]!) / 2 - (v[0]! + v[1]!) + 2,
    ],
    [
      'Um poliedro convexo tem todas as faces triangulares e # vértices. Quantas faces ele tem?',
      '3F = 2A,\\ F + V = A + 2 \\Rightarrow F = 2V - 4',
      'F = 2 \\cdot # - 4',
      (v) => 2 * v[0]! - 4,
    ],
    [
      'Num poliedro convexo, em cada vértice se encontram exatamente # arestas, e o total de vértices é #. Quantas arestas ele tem?',
      'A = \\frac{k V}{2}',
      'A = \\frac{# \\cdot #}{2}',
      (v) => (v[0]! * v[1]!) / 2,
    ],
  ],

  'areas-de-figuras-planas': [
    [
      'Um retângulo mede # m por # m. Qual é a área dele, em metros quadrados?',
      'A = b \\cdot h',
      'A = # \\cdot #',
      (v) => v[0]! * v[1]!,
    ],
    [
      'Um triângulo tem base de # cm e altura de # cm. Qual é a área dele, em centímetros quadrados?',
      'A = \\frac{b h}{2}',
      'A = \\frac{# \\cdot #}{2}',
      (v) => (v[0]! * v[1]!) / 2,
    ],
    [
      'Um terreno em forma de trapézio tem bases de # m e # m e altura de # m. Quantos metros quadrados ele tem?',
      'A = \\frac{(B+b)h}{2}',
      'A = \\frac{(# + #) \\cdot #}{2}',
      (v) => ((v[0]! + v[1]!) * v[2]!) / 2,
    ],
    [
      'O perímetro de um terreno retangular é de # m e um dos lados mede # m. Qual é a área do terreno, em metros quadrados?',
      'A = a\\left(\\frac{P}{2} - a\\right)',
      'A = # \\cdot \\left(\\frac{#}{2} - #\\right)',
      (v) => v[1]! * (v[0]! / 2 - v[1]!),
    ],
    [
      'Um salão retangular de # m por # m será forrado com placas quadradas de # m de lado. Quantas placas são necessárias?',
      'n = \\frac{a \\cdot b}{L^2}',
      'n = \\frac{# \\cdot #}{#^2}',
      (v) => (v[0]! * v[1]!) / v[2]! ** 2,
    ],
    [
      'A fachada de uma casa é um retângulo de # m por # m com um triângulo de mesma base e altura # m em cima. Qual é a área total, em metros quadrados?',
      'A = bh + \\frac{b h_t}{2}',
      'A = # \\cdot # + \\frac{# \\cdot #}{2}',
      (v) => v[0]! * v[1]! + (v[0]! * v[2]!) / 2,
    ],
    [
      'Um terreno retangular de # m por # m tem um recorte retangular de # m por # m ocupado pela casa. Quantos metros quadrados sobram?',
      'A = ab - cd',
      'A = # \\cdot # - # \\cdot #',
      (v) => v[0]! * v[1]! - v[2]! * v[3]!,
    ],
    [
      'Um quintal retangular de # m por # m tem, no meio, uma piscina quadrada de # m de lado. Quantos metros quadrados sobram de grama?',
      'A = ab - L^2',
      'A = # \\cdot # - #^2',
      (v) => v[0]! * v[1]! - v[2]! ** 2,
    ],
    [
      'Um quadrado tem a mesma área que um retângulo de # m por # m. Quantos metros mede o lado desse quadrado? (duas casas decimais)',
      'L = \\sqrt{a \\cdot b}',
      'L = \\sqrt{# \\cdot #}',
      (v) => Math.sqrt(v[0]! * v[1]!),
      2,
    ],
  ],
};
