import { PI, fracao, type Regra } from '@core/enunciados/models/regras-de-passos';

/**
 * As regras de integrais: indefinida, definida, Teorema Fundamental, somas de
 * Riemann, técnicas e aplicações.
 *
 * A trilha aqui é sempre a mesma: a primitiva, a avaliação nos extremos e a
 * subtração — é o que o Teorema Fundamental diz, e é o que o aluno precisa ver
 * escrito.
 */

const e = Math.E;

export const REGRAS_INTEGRAIS: Readonly<Record<string, readonly Regra[]>> = {
  'integral-indefinida': [
    [
      'Integre e informe o coeficiente de x² na primitiva de f(x) = #x.',
      '\\int ax\\,dx = \\frac{a}{2}x^2 + C',
      '\\int #x\\,dx = \\frac{#}{2}x^2 + C',
      (v) => v[0]! / 2,
    ],
    [
      'Integre e informe o coeficiente de x³ na primitiva de f(x) = #x².',
      '\\int ax^2\\,dx = \\frac{a}{3}x^3 + C',
      '\\int #x^2\\,dx = \\frac{#}{3}x^3 + C',
      (v) => v[0]! / 3,
    ],
    [
      'Uma primitiva de # vezes x é # vezes o quadrado de x. Tomando a constante igual a zero, quanto vale essa primitiva em x = #?',
      '\\int ax\\,dx = \\frac{a}{2}x^2',
      'F(#2) = \\frac{#1}{2} \\cdot #3^2',
      (v) => (v[0]! / 2) * v[2]! ** 2,
    ],
    [
      'Tomando C = #, qual é o valor de F(#) para F(x) = ∫#x dx? (duas casas decimais)',
      'F(x) = \\frac{a}{2}x^2 + C',
      'F(#) = \\frac{#}{2} \\cdot #^2 + #',
      (v) => (v[2]! / 2) * v[1]! ** 2 + v[0]!,
      2,
    ],
    [
      'Tomando C = #, qual é o valor de F(#) para F(x) = ∫#x² dx? (duas casas decimais)',
      'F(x) = \\frac{a}{3}x^3 + C',
      'F(#) = \\frac{#}{3} \\cdot #^3 + #',
      (v) => (v[2]! / 3) * v[1]! ** 3 + v[0]!,
      2,
    ],
    [
      'Qual é a primitiva do quadrado de x, avaliada em x = #, tomando a constante igual a zero? (a primitiva é o cubo de x dividido por #)',
      '\\int x^2\\,dx = \\frac{x^3}{3}',
      'F(#) = \\frac{#^3}{3}',
      (v) => v[0]! ** 3 / 3,
    ],
    [
      'Qual é o valor da constante C, sabendo que F(#) = # para a primitiva de f(x) = #x? (duas casas decimais)',
      'C = F(x_0) - \\frac{a}{2}x_0^2',
      'C = #2 - \\frac{#3}{2} \\cdot #1^2',
      (v) => v[1]! - (v[2]! / 2) * v[0]! ** 2,
      2,
    ],
    [
      'Qual é o valor da constante C, sabendo que F(#) = # para a primitiva de f(x) = #x²? (duas casas decimais)',
      'C = F(x_0) - \\frac{a}{3}x_0^3',
      'C = #2 - \\frac{#3}{3} \\cdot #1^3',
      (v) => v[1]! - (v[2]! / 3) * v[0]! ** 3,
      2,
    ],
    [
      'A velocidade de um corpo, em m/s, é # vezes o tempo. Partindo da posição # m, em que posição, em metros, ele está no instante # s?',
      's(t) = s_0 + \\int_0^t av\\,dv = s_0 + \\frac{a t^2}{2}',
      's = #2 + \\frac{#1 \\cdot #3^2}{2}',
      (v) => v[1]! + (v[0]! * v[2]! ** 2) / 2,
    ],
    [
      'Uma função tem derivada igual a # e vale # em x = #. Quanto ela vale em x = #?',
      'f(x) = f(x_0) + a(x - x_0)',
      'f(#) = # + # \\cdot (# - #)',
      (v) => v[1]! + v[0]! * (v[3]! - v[2]!),
    ],
    [
      'Tomando C = #, qual é o valor de F(#) para F(x) = ∫e^(#x) dx? (duas casas decimais)',
      'F(x) = \\frac{e^{ax}}{a} + C',
      'F(#) = \\frac{e^{# \\cdot #}}{#} + #',
      (v) => (Math.exp(v[2]! * v[1]!) - 1) / v[2]! + v[0]!,
      2,
    ],
    [
      'Tomando C = #, qual é o valor de F(#) para F(x) = ∫#/x dx, com x > #? (duas casas decimais)',
      'F(x) = a\\ln x + C',
      'F(#) = # \\cdot \\ln(#) + #',
      (v) => v[2]! * Math.log(v[1]!) + v[0]!,
      2,
    ],
  ],

  'integral-definida': [
    [
      'Um corpo anda a # m/s constantes entre os instantes # s e # s. Quantos metros ele percorre nesse intervalo?',
      's = v \\cdot (t_2 - t_1)',
      's = #1 \\cdot (#3 - #2)',
      (v) => v[0]! * (v[2]! - v[1]!),
    ],
    [
      'Calcule a integral de # no intervalo de # a #.',
      '\\int_a^b k\\,dx = k(b - a)',
      '\\int_{#}^{#} #\\,dx = # \\cdot (# - #)',
      (v) => v[0]! * (v[2]! - v[1]!),
    ],
    [
      'Calcule a integral de x no intervalo de # a #. (duas casas decimais)',
      '\\int_a^b x\\,dx = \\frac{b^2 - a^2}{2}',
      '\\int_{#}^{#} x\\,dx = \\frac{#^2 - #^2}{2}',
      (v) => (v[1]! ** 2 - v[0]! ** 2) / 2,
      2,
    ],
    [
      'Qual é a área sob a parábola que vale o quadrado de x, entre x = # e x = #?',
      '\\int_a^b x^2\\,dx = \\frac{b^3 - a^3}{3}',
      '\\int_{#}^{#} x^2\\,dx = \\frac{#^3 - #^3}{3}',
      (v) => (v[1]! ** 3 - v[0]! ** 3) / 3,
    ],
    [
      'Qual é a área sob a reta que vale # vezes x, entre x = # e x = #?',
      '\\int_a^b kx\\,dx = \\frac{k(b^2 - a^2)}{2}',
      '\\int_{#}^{#} #x\\,dx = \\frac{#(#^2 - #^2)}{2}',
      (v) => (v[0]! * (v[2]! ** 2 - v[1]! ** 2)) / 2,
    ],
    [
      'Qual é a área sob a reta que vale # vezes x mais #, entre x = # e x = #?',
      '\\int_a^b (kx + c)\\,dx',
      '\\int_{#}^{#} (#x + #)\\,dx',
      (v) => {
        const primitiva = (x: number): number => (v[0]! * x * x) / 2 + v[1]! * x;
        return primitiva(v[3]!) - primitiva(v[2]!);
      },
    ],
    [
      'Qual é o valor MÉDIO de f(x) = x no intervalo [#, #]? (duas casas decimais)',
      '\\bar{f} = \\frac{1}{b - a}\\int_a^b x\\,dx = \\frac{a + b}{2}',
      '\\bar{f} = \\frac{# + #}{2}',
      (v) => (v[0]! + v[1]!) / 2,
      2,
    ],
    [
      'Qual é o valor MÉDIO de f(x) = x² no intervalo [#, #]? (duas casas decimais)',
      '\\bar{f} = \\frac{1}{b - a}\\int_a^b x^2\\,dx = \\frac{a^2 + ab + b^2}{3}',
      '\\bar{f} = \\frac{#^2 + # \\cdot # + #^2}{3}',
      (v) => (v[0]! ** 2 + v[0]! * v[1]! + v[1]! ** 2) / 3,
      2,
    ],
    [
      'Sabendo que a integral de f de # a # vale #, quanto vale a integral de # a #?',
      '\\int_b^a f = -\\int_a^b f',
      '\\int_{#}^{#} f = -#',
      (v) => -v[2]!,
    ],
    [
      'Sabendo que a integral de f de # a # vale #, quanto vale a integral de #·f no mesmo intervalo?',
      '\\int k f = k\\int f',
      'k\\int f = #4 \\cdot #3',
      (v) => v[3]! * v[2]!,
    ],
  ],

  'teorema-fundamental': [
    [
      'Use o Teorema Fundamental para calcular a integral de # de # a #. (duas casas decimais)',
      '\\int_a^b k\\,dx = k(b - a)',
      '\\int_{#}^{#} #\\,dx = # \\cdot (# - #)',
      (v) => v[0]! * (v[2]! - v[1]!),
      2,
    ],
    [
      'Use o Teorema Fundamental para calcular a integral de #x de # a #. (duas casas decimais)',
      '\\int_a^b kx\\,dx = \\frac{k(b^2 - a^2)}{2}',
      '\\int_{#}^{#} #x\\,dx = \\frac{#(#^2 - #^2)}{2}',
      (v) => (v[0]! * (v[2]! ** 2 - v[1]! ** 2)) / 2,
      2,
    ],
    [
      'Use o Teorema Fundamental para calcular a integral de x² de # a #. (duas casas decimais)',
      '\\int_a^b x^2\\,dx = \\frac{b^3 - a^3}{3}',
      '\\int_{#}^{#} x^2\\,dx = \\frac{#^3 - #^3}{3}',
      (v) => (v[1]! ** 3 - v[0]! ** 3) / 3,
      2,
    ],
    [
      'Use o Teorema Fundamental para calcular a integral de #/x de # a #, com b > #. (duas casas decimais)',
      '\\int_a^b \\frac{k}{x}\\,dx = k\\ln\\frac{b}{a}',
      '\\int_{#}^{#} \\frac{#}{x}\\,dx = # \\cdot \\ln\\left(\\frac{#}{#}\\right)',
      (v) => v[0]! * Math.log(v[2]! / v[1]!),
      2,
    ],
    [
      "Sendo A(x) a área acumulada a partir de # sob f(t) = #t, quanto vale A'(#)? (duas casas decimais)",
      "A'(x) = f(x)",
      "A'(#3322) = #2211 \\cdot #113",
      (v) => v[1]! * v[2]!,
      2,
    ],
    [
      "Sendo A(x) a área acumulada a partir de # sob f(t) = t², quanto vale A'(#)?",
      "A'(x) = x^2",
      "A'(#222) = #111^2",
      (v) => v[1]! ** 2,
    ],
    [
      "Sendo A(x) = ∫ de # a x de (t² + #) dt, quanto vale A'(#)? (duas casas decimais)",
      "A'(x) = x^2 + c",
      "A'(#3331) = #2223^2 + #1112",
      (v) => v[2]! ** 2 + v[1]!,
      2,
    ],
    [
      'Uma primitiva de uma função vale # no extremo superior e # no extremo inferior. Quanto vale a integral definida entre esses extremos?',
      '\\int_a^b f = F(b) - F(a)',
      '\\int = # - #',
      (v) => v[0]! - v[1]!,
    ],
    [
      'A área acumulada sob uma curva, a partir de zero, tem derivada igual ao valor da própria curva. Se a curva vale # em x = #, quanto vale a derivada da área acumulada nesse ponto?',
      "A'(x) = f(x)",
      "A'(#2) = #1",
      (v) => v[0]!,
    ],
    [
      'A área acumulada sob uma curva, a partir de zero, vale # em x = #. Se a curva vale # nesse ponto, quanto vale a derivada da área acumulada ali?',
      "A'(x) = f(x)",
      "A'(#) = #",
      (v) => v[2]!,
    ],
    [
      'Para qual valor inteiro positivo de k a integral de x de # a k vale #?',
      '\\int_0^k x\\,dx = \\frac{k^2}{2} = V \\Rightarrow k = \\sqrt{2V}',
      'k = \\sqrt{#^2 + 2 \\cdot #}',
      (v) => Math.sqrt(v[0]! ** 2 + 2 * v[1]!),
    ],
    [
      'A área acumulada sob a reta que vale # vezes x, a partir de zero, é avaliada em x = #. Quanto ela vale?',
      '\\int_0^x kt\\,dt = \\frac{k x^2}{2}',
      '\\int_0^{#} #t\\,dt = \\frac{#}{2} \\cdot #^2',
      (v) => (v[0]! / 2) * v[1]! ** 2,
    ],
  ],

  'soma-de-riemann': [
    [
      'Um carro anda a # m/s constantes durante # s. Somando as áreas dos retângulos sob o gráfico da velocidade, quantos metros ele percorre? (três casas decimais)',
      '\\sum_{i=1}^{n} v\\,\\Delta t = v \\cdot t',
      's = # \\cdot #',
      (v) => v[0]! * v[1]!,
      3,
    ],
    [
      'Aproxime a área sob f(x) = x no intervalo [#, #] usando # retângulos com altura no ponto DIREITO de cada subintervalo. (duas casas decimais)',
      '\\sum_{i=1}^{n} f(a + i\\Delta x)\\Delta x,\\ \\Delta x = \\frac{b-a}{n}',
      '\\sum_{i=1}^{#} (# + i \\cdot \\frac{# - #}{#}) \\cdot \\frac{# - #}{#}',
      (v, texto) => {
        void texto;
        const [a, b, retangulos] = [v[0]!, v[1]!, v[2]!];
        const dx = (b - a) / retangulos;
        let soma = 0;
        for (let i = 1; i <= retangulos; i += 1) soma += (a + i * dx) * dx;
        return soma;
      },
      2,
    ],
    [
      'Aproxime a área sob f(x) = # no intervalo [#, #] usando # retângulos. (duas casas decimais)',
      '\\sum k\\,\\Delta x = k(b - a)',
      's = #3 \\cdot (#1 - #2)',
      (v) => v[0]! * (v[2]! - v[1]!),
      2,
    ],
    [
      'A região sob uma reta que vale # vezes x, entre x = # e x = #, é um triângulo. Qual é a sua área exata? (três casas decimais)',
      'A = \\frac{k(b^2 - a^2)}{2}',
      'A = \\frac{#(#^2 - #^2)}{2}',
      (v) => (v[0]! * (v[2]! ** 2 - v[1]! ** 2)) / 2,
      3,
    ],
    [
      'Aproxime a área sob f(x) = x² no intervalo [#, #] usando # retângulos com altura no ponto DIREITO. (duas casas decimais)',
      '\\sum_{i=1}^{n} (a + i\\Delta x)^2\\Delta x',
      '\\sum_{i=1}^{#} (# + i \\cdot \\frac{# - #}{#})^2 \\cdot \\frac{# - #}{#}',
      (v) => {
        const [a, b, retangulos] = [v[0]!, v[1]!, v[2]!];
        const dx = (b - a) / retangulos;
        let soma = 0;
        for (let i = 1; i <= retangulos; i += 1) soma += (a + i * dx) ** 2 * dx;
        return soma;
      },
      2,
    ],
    [
      'Aproxime a área sob f(x) = x² no intervalo [#, #] usando # retângulos com altura no ponto ESQUERDO. (duas casas decimais)',
      '\\sum_{i=0}^{n-1} (a + i\\Delta x)^2\\Delta x',
      '\\sum_{i=0}^{#-1} (# + i \\cdot \\frac{# - #}{#})^2 \\cdot \\frac{# - #}{#}',
      (v) => {
        const [a, b, retangulos] = [v[0]!, v[1]!, v[2]!];
        const dx = (b - a) / retangulos;
        let soma = 0;
        for (let i = 0; i < retangulos; i += 1) soma += (a + i * dx) ** 2 * dx;
        return soma;
      },
      2,
    ],
    [
      'Aproxime a área sob a reta que vale # vezes x, entre # e #, usando # retângulos de mesma largura e a altura na extremidade DIREITA de cada um. (três casas decimais)',
      '\\sum_{i=1}^{n} k(a + i\\Delta x)\\Delta x',
      '\\sum_{i=1}^{#} #(# + i \\cdot \\frac{# - #}{#}) \\cdot \\frac{# - #}{#}',
      (v) => {
        const [k, a, b, retangulos] = [v[0]!, v[1]!, v[2]!, v[3]!];
        const dx = (b - a) / retangulos;
        let soma = 0;
        for (let i = 1; i <= retangulos; i += 1) soma += k * (a + i * dx) * dx;
        return soma;
      },
      3,
    ],
    [
      'Aproxime a área sob f(x) = #x + # no intervalo [#, #] usando # retângulos com altura no ponto DIREITO. (duas casas decimais)',
      '\\sum_{i=1}^{n} (k(a + i\\Delta x) + c)\\Delta x',
      '\\sum_{i=1}^{#} (#(# + i \\cdot \\frac{# - #}{#}) + #) \\cdot \\frac{# - #}{#}',
      (v) => {
        const [k, c, a, b, retangulos] = [v[0]!, v[1]!, v[2]!, v[3]!, v[4]!];
        const dx = (b - a) / retangulos;
        let soma = 0;
        for (let i = 1; i <= retangulos; i += 1) soma += (k * (a + i * dx) + c) * dx;
        return soma;
      },
      2,
    ],
    [
      'Usando # retângulos com altura no ponto DIREITO, qual é o ERRO da aproximação da área sob f(x) = x² em [#, #]? (duas casas decimais)',
      'E = \\int_a^b x^2 dx - \\sum f(x_i)\\Delta x',
      'E = \\frac{#^3 - #^3}{3} - \\sum_{i=1}^{#}(# + i\\frac{# - #}{#})^2\\frac{# - #}{#}',
      (v) => {
        const [retangulos, a, b] = [v[0]!, v[1]!, v[2]!];
        const dx = (b - a) / retangulos;
        let soma = 0;
        for (let i = 1; i <= retangulos; i += 1) soma += (a + i * dx) ** 2 * dx;
        return soma - (b ** 3 - a ** 3) / 3;
      },
      2,
    ],
  ],

  'tecnicas-de-integracao': [
    [
      'Calcule a integral de #x + # de # a #. (duas casas decimais)',
      '\\int_a^b (kx + c)\\,dx',
      '\\int_{#}^{#} (#x + #)\\,dx',
      (v) => {
        const primitiva = (x: number): number => (v[0]! * x * x) / 2 + v[1]! * x;
        return primitiva(v[3]!) - primitiva(v[2]!);
      },
      2,
    ],
    [
      'Calcule a integral de x³ de # a #. (duas casas decimais)',
      '\\int_a^b x^3 dx = \\frac{b^4 - a^4}{4}',
      '\\int_{#}^{#} x^3\\,dx = \\frac{#^4 - #^4}{4}',
      (v) => (v[1]! ** 4 - v[0]! ** 4) / 4,
      2,
    ],
    [
      'Qual é a área sob a curva que vale o cubo de x, entre # e #? (duas casas decimais)',
      '\\int_a^b x^3 dx = \\frac{b^4 - a^4}{4}',
      '\\int_{#}^{#} x^3\\,dx = \\frac{#^4 - #^4}{4}',
      (v) => (v[1]! ** 4 - v[0]! ** 4) / 4,
      2,
    ],
    [
      'Qual é a área sob a curva que vale # vezes o quadrado de x, entre # e #? (duas casas decimais)',
      '\\int_a^b kx^2 dx = \\frac{k(b^3 - a^3)}{3}',
      '\\int_{#}^{#} #x^2\\,dx = \\frac{#(#^3 - #^3)}{3}',
      (v) => (v[0]! * (v[2]! ** 3 - v[1]! ** 3)) / 3,
      2,
    ],
    [
      'Use a substituição u = x² e calcule a integral de #x·e^(x²) de # a #. (duas casas decimais)',
      '\\int kx\\,e^{x^2}dx = \\frac{k}{2}e^{x^2}',
      '\\int_{#}^{#} #x\\,e^{x^2}dx = \\frac{#}{2}\\left(e^{#^2} - e^{#^2}\\right)',
      (v) => (v[1]! / 2) * (Math.exp(v[3]! ** 2) - Math.exp(v[2]! ** 2)),
      2,
    ],
    [
      'Calcule a integral de #x(x² + #) de # a #, usando substituição. (duas casas decimais)',
      'u = x^2 + c \\Rightarrow \\int kx(x^2+c)\\,dx = \\frac{k}{4}(x^2+c)^2',
      '\\int_{#}^{#} #x(x^2 + #)\\,dx',
      (v) => {
        const primitiva = (x: number): number => (v[1]! / 4) * (x * x + v[2]!) ** 2;
        return primitiva(v[4]!) - primitiva(v[3]!);
      },
      2,
    ],
    [
      'Qual é a área sob a curva que vale # dividido por x, entre x = # e x = e, a base do logaritmo natural? (duas casas decimais)',
      '\\int_a^e \\frac{k}{x}dx = k(1 - \\ln a)',
      '\\int_{#}^{e} \\frac{#}{x}dx = #(1 - \\ln #)',
      (v) => v[0]! * (1 - Math.log(v[1]!)),
      2,
    ],
    [
      'Calcule a integral de x·e^x de # a #, usando integração por partes. (duas casas decimais)',
      '\\int x e^x dx = e^x(x - 1)',
      '\\int_{#}^{#} x e^x dx = \\left[e^x(x-1)\\right]_{#}^{#}',
      (v) => Math.exp(v[1]!) * (v[1]! - 1) - Math.exp(v[0]!) * (v[0]! - 1),
      2,
    ],
    [
      'Calcule a integral de x·ln(x) de # a #, usando integração por partes. (duas casas decimais)',
      '\\int x\\ln x\\,dx = \\frac{x^2}{2}\\ln x - \\frac{x^2}{4}',
      '\\left[\\frac{x^2}{2}\\ln x - \\frac{x^2}{4}\\right]_{#}^{#}',
      (v) => {
        const primitiva = (x: number): number => (x * x * Math.log(x)) / 2 - (x * x) / 4;
        return primitiva(v[1]!) - primitiva(v[0]!);
      },
      2,
    ],
    [
      'Calcule a integral de sen²(x) de # a π/#, usando a identidade do arco duplo. (duas casas decimais)',
      '\\sin^2 x = \\frac{1 - \\cos 2x}{2}',
      '\\int_{#}^{\\pi/#} \\sin^2 x\\,dx',
      (v) => {
        const primitiva = (x: number): number => x / 2 - Math.sin(2 * x) / 4;
        return primitiva(PI / v[1]!) - primitiva(v[0]!);
      },
      2,
    ],
    [
      'Calcule a integral de #/(x·ln(x)) de e a #, usando substituição. (duas casas decimais)',
      '\\int \\frac{k}{x\\ln x}dx = k\\ln(\\ln x)',
      '\\int_{e}^{#} \\frac{#}{x\\ln x}\\,dx = #\\left[\\ln(\\ln x)\\right]_{e}^{#}',
      (v) => v[1]! * (Math.log(Math.log(v[0]!)) - Math.log(Math.log(e))),
      2,
    ],
    [
      'Por substituição, qual é a área sob a curva # vezes x vezes o quadrado de x, entre # e #? (duas casas decimais)',
      '\\int_a^b kx^3 dx = \\frac{k(b^4 - a^4)}{4}',
      '\\int_{#}^{#} #x^3\\,dx = \\frac{#(#^4 - #^4)}{4}',
      (v) => (v[0]! * (v[2]! ** 4 - v[1]! ** 4)) / 4,
      2,
    ],
  ],

  'integrais-improprias': [
    [
      'Calcule a integral imprópria de #/x² de # ao infinito. (duas casas decimais)',
      '\\int_a^\\infty \\frac{k}{x^2}dx = \\frac{k}{a}',
      '\\int_{#}^{\\infty} \\frac{#}{x^2}dx = \\frac{#}{#}',
      (v) => v[0]! / v[1]!,
      2,
    ],
    [
      'A área sob a curva que vale # dividido pelo quadrado de x, de x = # até o infinito, é finita. Quanto ela vale?',
      '\\int_a^\\infty \\frac{k}{x^2}dx = \\frac{k}{a}',
      '\\int_{#}^{\\infty} \\frac{#}{x^2}dx = \\frac{#}{#}',
      (v) => v[0]! / v[1]!,
    ],
    [
      'A área sob a curva que vale # dividido por x elevado a #, de x = # até o infinito, é finita. Quanto ela vale? Responda como fração.',
      '\\int_1^\\infty \\frac{k}{x^p}dx = \\frac{k}{p - 1}',
      '\\int_{#}^{\\infty} \\frac{#}{x^{#}}dx = \\frac{#}{(# - 1)\\cdot #^{# - 1}}',
      (v) => fracao(v[0]!, v[1]! - 1),
    ],
    [
      'Calcule a integral imprópria de #/x de # ao infinito, ou escreva "diverge".',
      '\\int_a^\\infty \\frac{k}{x}dx \\to \\infty',
      '\\int_{#}^{\\infty} \\frac{#}{x}dx',
      () => 'diverge',
    ],
    [
      'A área sob a curva que vale # dividido por x, de x = # até o infinito, cresce sem limite. Escreva a resposta que o site usa quando a integral não tem valor.',
      '\\int_a^\\infty \\frac{k}{x}dx \\to \\infty',
      '\\int_{#}^{\\infty} \\frac{#}{x}dx',
      () => 'diverge',
    ],
    [
      'Calcule a integral imprópria de e^(−#x) de # ao infinito. (duas casas decimais)',
      '\\int_0^\\infty e^{-kx}dx = \\frac{1}{k}',
      '\\int_{#}^{\\infty} e^{-#x}dx = \\frac{1}{#}',
      (v) => 1 / v[0]!,
      2,
    ],
    [
      'Calcule a integral imprópria de #/√x de # a #. (duas casas decimais)',
      '\\int_0^b \\frac{k}{\\sqrt{x}}dx = 2k\\sqrt{b}',
      '\\int_{#}^{#} \\frac{#}{\\sqrt{x}}dx = 2 \\cdot # \\cdot \\sqrt{#}',
      (v) => 2 * v[0]! * Math.sqrt(v[2]!),
      2,
    ],
    [
      'Decida pelo teste da comparação se a integral de #/(x² + #) de # ao infinito converge ou diverge. Responda "converge" ou "diverge".',
      '\\frac{k}{x^2 + c} \\le \\frac{k}{x^2}',
      '\\int_{#}^{\\infty} \\frac{#}{x^2 + #}dx',
      () => 'converge',
    ],
    [
      'Calcule a integral imprópria de #/x^# de # ao infinito, com p = #. (duas casas decimais)',
      '\\int_a^\\infty \\frac{k}{x^p}dx = \\frac{k}{(p-1)a^{p-1}}',
      '\\int_{#}^{\\infty} \\frac{#}{x^{#}}dx',
      (v) => v[0]! / ((v[1]! - 1) * v[2]! ** (v[1]! - 1)),
      2,
    ],
  ],

  'aplicacoes-da-integral': [
    [
      'Qual é a área sob a curva y = x de # a #? (duas casas decimais)',
      'A = \\int_a^b x\\,dx = \\frac{b^2 - a^2}{2}',
      'A = \\frac{#2^2 - #1^2}{2}',
      (v) => (v[1]! ** 2 - v[0]! ** 2) / 2,
      2,
    ],
    [
      'Qual é a área sob a curva y = x² de # a #? (duas casas decimais)',
      'A = \\int_a^b x^2 dx = \\frac{b^3 - a^3}{3}',
      'A = \\frac{#2^3 - #1^3}{3}',
      (v) => (v[1]! ** 3 - v[0]! ** 3) / 3,
      2,
    ],
    [
      'Qual é a área, entre x = # e x = #, da região entre a reta que vale # vezes x e o eixo x? (três casas decimais)',
      'A = \\frac{k(b^2 - a^2)}{2}',
      'A = \\frac{#(#^2 - #^2)}{2}',
      (v) => (v[2]! * (v[1]! ** 2 - v[0]! ** 2)) / 2,
      3,
    ],
    [
      'Qual é a área entre a reta que vale # vezes x e a reta que vale # vezes x, entre x = # e x = #? (três casas decimais)',
      'A = \\frac{(k_1 - k_2)(b^2 - a^2)}{2}',
      'A = \\frac{(# - #)(#^2 - #^2)}{2}',
      (v) => ((v[0]! - v[1]!) * (v[3]! ** 2 - v[2]! ** 2)) / 2,
      3,
    ],
    [
      'Girando a reta y = #x em torno do eixo x, de # a #, qual é o volume do sólido? (duas casas decimais)',
      'V = \\pi\\int_a^b (kx)^2 dx = \\frac{\\pi k^2 (b^3 - a^3)}{3}',
      'V = \\pi\\frac{#^2(#^3 - #^3)}{3}',
      (v) => (PI * v[0]! ** 2 * (v[2]! ** 3 - v[1]! ** 3)) / 3,
      2,
    ],
    [
      'Qual é a área da região entre as curvas y = x e y = x², de # a #? (duas casas decimais)',
      'A = \\int_a^b (x - x^2)dx',
      'A = \\left[\\frac{x^2}{2} - \\frac{x^3}{3}\\right]_{#}^{#}',
      (v) => {
        const primitiva = (x: number): number => (x * x) / 2 - (x * x * x) / 3;
        return primitiva(v[1]!) - primitiva(v[0]!);
      },
      2,
    ],
    [
      'Um corpo tem velocidade igual a # vezes o tempo, em m/s. Quantos metros ele percorre entre os instantes # e # s? (três casas decimais)',
      's = \\int_{t_1}^{t_2} kt\\,dt = \\frac{k(t_2^2 - t_1^2)}{2}',
      's = \\frac{#(#^2 - #^2)}{2}',
      (v) => (v[0]! * (v[2]! ** 2 - v[1]! ** 2)) / 2,
      3,
    ],
    [
      'Qual é a área entre y = # e y = x² no intervalo de −# a #? (duas casas decimais)',
      'A = \\int_{-a}^{a} (k - x^2)dx',
      'A = \\left[kx - \\frac{x^3}{3}\\right]_{-#}^{#}',
      (v) => 2 * (v[0]! * v[1]! - v[1]! ** 3 / 3),
      2,
    ],
    [
      'Qual é o volume do sólido gerado ao girar y = √x em torno do eixo x, de # a #? (duas casas decimais)',
      'V = \\pi\\int_a^b x\\,dx = \\frac{\\pi(b^2 - a^2)}{2}',
      'V = \\frac{\\pi(#^2 - #^2)}{2}',
      (v) => (PI * (v[1]! ** 2 - v[0]! ** 2)) / 2,
      2,
    ],
    [
      'Qual é o volume do sólido gerado ao girar, em torno do eixo x, a região sob a reta que vale # entre x = # e x = #? Responda o número que multiplica π. (três casas decimais)',
      'V = \\pi k^2 (b - a)',
      'V = #1^2 \\cdot (#3 - #2)',
      (v) => v[0]! ** 2 * (v[2]! - v[1]!),
      3,
    ],
    [
      'Qual é o comprimento do arco de y = #x de # a #? (duas casas decimais)',
      'L = (b - a)\\sqrt{1 + k^2}',
      'L = (# - #)\\sqrt{1 + #^2}',
      (v) => (v[2]! - v[1]!) * Math.sqrt(1 + v[0]! ** 2),
      2,
    ],
    [
      'Qual é o volume do sólido gerado ao girar y = # (constante) em torno do eixo x, de # a #? (duas casas decimais)',
      'V = \\pi k^2 (b - a)',
      'V = \\pi \\cdot #1^2 \\cdot (#3 - #2)',
      (v) => PI * v[0]! ** 2 * (v[2]! - v[1]!),
      2,
    ],
  ],
};
