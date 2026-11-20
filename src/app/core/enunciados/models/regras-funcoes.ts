import { fracao, raizes, type Regra } from '@core/enunciados/models/regras-de-passos';

/**
 * As regras dos tópicos de Funções.
 *
 * Muitas perguntam por uma grandeza que se lê direto da fórmula — o coeficiente
 * linear, a amplitude, o valor no vértice —, e a regra escreve a fórmula geral
 * antes de substituir.
 */

export const REGRAS_FUNCOES: Readonly<Record<string, readonly Regra[]>> = {
  'funcao-afim': [
    [
      'Um táxi cobra # reais fixos mais # reais por quilômetro. Para que distância, em quilômetros, a corrida custa # reais?',
      'b + a d = C \\Rightarrow d = \\frac{C - b}{a}',
      'd = \\frac{#3 - #1}{#2}',
      (v) => (v[2]! - v[0]!) / v[1]!,
    ],
    [
      'Para f(x) = #x + #, qual é o valor de f(#)?',
      'f(x) = ax + b',
      'f(#) = # \\cdot # + #',
      (v) => v[0]! * v[2]! + v[1]!,
    ],
    [
      'Qual é o coeficiente linear (o valor de b) da função f(x) = #x + #?',
      'f(x) = ax + b \\Rightarrow b',
      'f(x) = #x + # \\Rightarrow b = #',
      (v) => v[1]!,
    ],
    [
      'Uma função afim vale # quando x é zero e diminui # unidades a cada aumento de # em x. Em que valor de x ela se anula?',
      'f(x) = b - \\frac{a}{k}x = 0 \\Rightarrow x = \\frac{bk}{a}',
      'x = \\frac{#3 \\cdot #1}{#2}',
      (v) => (v[0]! * v[2]!) / v[1]!,
    ],
    [
      'A função afim passa pelos pontos (#, #) e (#, #). Qual é a taxa de variação dela?',
      't = \\frac{y_2 - y_1}{x_2 - x_1}',
      't = \\frac{#4 - #2}{#3 - #1}',
      (v) => (v[3]! - v[1]!) / (v[2]! - v[0]!),
    ],
    [
      'Para f(x) = #x + #, qual é o valor de x tal que f(x) = #?',
      'ax + b = c \\Rightarrow x = \\frac{c - b}{a}',
      'x = \\frac{#3 - #2}{#1}',
      (v) => (v[2]! - v[1]!) / v[0]!,
    ],
    [
      'Uma função afim vale # em x = # e vale # em x = #. Qual é a sua taxa de variação?',
      't = \\frac{y_2 - y_1}{x_2 - x_1}',
      't = \\frac{#3 - #1}{#4 - #2}',
      (v) => (v[2]! - v[0]!) / (v[3]! - v[1]!),
    ],
    [
      'Uma corrida custa R$ # de bandeirada mais R$ # por quilômetro. Quantos quilômetros foram rodados se a corrida custou R$ #?',
      'b + a d = C \\Rightarrow d = \\frac{C - b}{a}',
      'd = \\frac{#3 - #1}{#2}',
      (v) => (v[2]! - v[0]!) / v[1]!,
    ],
    [
      'A função afim tem taxa de variação # e f(#) = #. Qual é o valor de f(#)?',
      'f(x_2) = f(x_1) + t(x_2 - x_1)',
      'f(#) = # + # \\cdot (# - #)',
      (v) => v[2]! + v[0]! * (v[3]! - v[1]!),
    ],
    [
      'Uma função afim vale # em x = # e vale # em x = #. Quanto ela vale em x = #?',
      'y = y_1 + \\frac{y_2 - y_1}{x_2 - x_1}(x - x_1)',
      'y = # + \\frac{# - #}{# - #} \\cdot (# - #)',
      (v) => v[0]! + ((v[2]! - v[0]!) / (v[3]! - v[1]!)) * (v[4]! - v[1]!),
    ],
    [
      'Duas funções afins se cruzam: f(x) = #x + # e g(x) = #x + #. Qual é a abscissa do ponto de encontro?',
      'ax + b = cx + d \\Rightarrow x = \\frac{d - b}{a - c}',
      'x = \\frac{#2 - #4}{#3 - #1}',
      (v) => (v[3]! - v[1]!) / (v[0]! - v[2]!),
    ],
    [
      'A reta passa por (#, #) e tem coeficiente angular #. Qual é o valor de y quando x = #?',
      'y = y_1 + m(x - x_1)',
      'y = #2 + #3 \\cdot (#4 - #1)',
      (v) => v[1]! + v[2]! * (v[3]! - v[0]!),
    ],
  ],

  'funcao-quadratica': [
    [
      'Uma bola é lançada para cima a # m/s e sua altura, em metros, é essa velocidade vezes o tempo menos # vezes o tempo ao quadrado. Em quantos segundos ela atinge a altura máxima?',
      'h(t) = vt - kt^2 \\Rightarrow t_{max} = \\frac{v}{2k}',
      't = \\frac{#}{2 \\cdot #}',
      (v) => v[0]! / (2 * v[1]!),
    ],
    [
      'Uma bola é lançada para cima a # m/s e sua altura, em metros, é essa velocidade vezes o tempo menos # vezes o tempo ao quadrado. Qual é a altura máxima, em metros?',
      'h_{max} = \\frac{v^2}{4k}',
      'h = \\frac{#2^2}{4 \\cdot #1}',
      (v) => v[0]! ** 2 / (4 * v[1]!),
    ],
    [
      'Para f(x) = x² + #x + #, qual é o valor de f(#)?',
      'f(x) = x^2 + ax + b',
      'f(#) = #^2 + # \\cdot # + #',
      (v) => v[2]! ** 2 + v[0]! * v[2]! + v[1]!,
    ],
    [
      'Qual é a abscissa do vértice da parábola y = x² − #x + #? (duas casas decimais)',
      'x_v = -\\frac{b}{2a} = \\frac{a}{2}',
      'x_v = \\frac{#}{2}',
      (v) => v[0]! / 2,
      2,
    ],
    [
      'Qual é o valor MÍNIMO da função f(x) = x² − #x + #? (duas casas decimais)',
      'y_v = c - \\frac{b^2}{4a}',
      'y_v = #2 - \\frac{#1^2}{4}',
      (v) => v[1]! - v[0]! ** 2 / 4,
      2,
    ],
    [
      'Qual é o valor MÁXIMO da função f(x) = −x² + #x + #? (duas casas decimais)',
      'y_v = c + \\frac{b^2}{4|a|}',
      'y_v = #2 + \\frac{#1^2}{4}',
      (v) => v[1]! + v[0]! ** 2 / 4,
      2,
    ],
    [
      'Um terreno retangular será cercado com # m de tela, aproveitando um muro já existente em um dos lados. Qual é a maior área possível, em metros quadrados?',
      'A = x(P - 2x),\\quad A_{max} = \\frac{P^2}{8}',
      'A_{max} = \\frac{#^2}{8}',
      (v) => v[0]! ** 2 / 8,
    ],
    [
      'Quais são as raízes de x² − #x + # = #? Informe a MAIOR delas.',
      'x = \\frac{a + \\sqrt{a^2 - 4(b - c)}}{2}',
      'x = \\frac{# + \\sqrt{#^2 - 4(# - #)}}{2}',
      (v) => raizes(1, -v[0]!, v[1]! - v[2]!)[0]!,
    ],
    [
      'A parábola y = x² + #x + # corta o eixo y em que valor?',
      'y(0) = c',
      'y(0) = #2',
      (v) => v[1]!,
    ],
    [
      'Uma loja vende # unidades por mês a # reais cada. Cada real de desconto no preço faz vender # unidades a mais. Que preço, em reais, dá a maior receita?',
      'R(x) = (p - x)(q + kx) \\Rightarrow x = \\frac{kp - q}{2k}',
      'p^{*} = p - \\frac{k \\cdot # - #}{2 \\cdot #}',
      (v) => v[1]! - (v[2]! * v[1]! - v[0]!) / (2 * v[2]!),
    ],
    [
      'Um objeto lançado tem altura h(t) = −#t² + #t, em metros, com t em segundos. Qual é a altura MÁXIMA atingida? (duas casas decimais)',
      'h_{max} = \\frac{b^2}{4a}',
      'h = \\frac{#2^2}{4 \\cdot #1}',
      (v) => v[1]! ** 2 / (4 * v[0]!),
      2,
    ],
    [
      'A função lucro é L(x) = −x² + #x − #, com x em centenas de peças. Quantas centenas de peças maximizam o lucro? (duas casas decimais)',
      'x_v = \\frac{b}{2}',
      'x_v = \\frac{#}{2}',
      (v) => v[0]! / 2,
      2,
    ],
  ],

  'funcao-exponencial': [
    [
      'Uma colônia começa com # bactérias e dobra a cada hora. Quantas bactérias há depois de # horas?',
      'N = N_0 \\cdot 2^t',
      'N = # \\cdot 2^{#}',
      (v) => v[0]! * 2 ** v[1]!,
    ],
    [
      'Uma população cresce como P(t) = #·#^t, com t em horas. Qual é a população em t = #?',
      'P(t) = a b^t',
      'P(#) = # \\cdot #^{#}',
      (v) => v[0]! * v[1]! ** v[2]!,
    ],
    [
      'Numa cultura, a população dobra a cada # horas. Começando com # bactérias, quantas haverá depois de # horas?',
      'N = N_0 \\cdot 2^{t/\\tau}',
      'N = #2 \\cdot 2^{\\frac{#3}{#1}}',
      (v) => v[1]! * 2 ** (v[2]! / v[0]!),
    ],
    [
      'Um carro vale # reais e perde #% do valor a cada ano. Quantos reais ele vale depois de # anos?',
      'V = V_0 (1 - i)^n',
      'V = # \\cdot \\left(1 - \\frac{#}{100}\\right)^{#}',
      (v) => v[0]! * (1 - v[1]! / 100) ** v[2]!,
    ],
    [
      'Uma amostra decai como N(t) = #·(#/#)^t, com t em anos. Quantos gramas restam em t = #? (duas casas decimais)',
      'N(t) = N_0 \\left(\\frac{a}{b}\\right)^t',
      'N = # \\cdot \\left(\\frac{#}{#}\\right)^{#}',
      (v) => v[0]! * (v[1]! / v[2]!) ** v[3]!,
      2,
    ],
    [
      'Uma substância tem meia-vida de # anos. Começando com # g, quantos gramas restam após # anos? (duas casas decimais)',
      'N = N_0 \\left(\\frac{1}{2}\\right)^{t/T}',
      'N = #2 \\cdot \\left(\\frac{1}{2}\\right)^{\\frac{#3}{#1}}',
      (v) => v[1]! * 0.5 ** (v[2]! / v[0]!),
      2,
    ],
    [
      'Uma substância tem meia-vida de # anos. De uma amostra de # g, quantos gramas restam depois de # anos?',
      'N = N_0 \\left(\\frac{1}{2}\\right)^{t/T}',
      'N = #2 \\cdot \\left(\\frac{1}{2}\\right)^{\\frac{#3}{#1}}',
      (v) => v[1]! * 0.5 ** (v[2]! / v[0]!),
    ],
    [
      'Quantas unidades de x são necessárias para que #^x valha #?',
      'a^x = b \\Rightarrow x = \\log_a b',
      'x = \\log_{#} #',
      (v) => Math.log(v[1]!) / Math.log(v[0]!),
    ],
    [
      'Qual é o valor da função f(x) = #·#^x em x = #?',
      'f(x) = a b^x',
      'f(#) = # \\cdot #^{#}',
      (v) => v[0]! * v[1]! ** v[2]!,
    ],
    [
      'Uma amostra cai para #/# do valor inicial em # anos, dividindo-se pela metade sempre no mesmo intervalo. Qual é a meia-vida, em anos?',
      '\\left(\\frac{1}{2}\\right)^{t/T} = \\frac{a}{b} \\Rightarrow T = \\frac{t\\ln 2}{\\ln(b/a)}',
      'T = \\frac{# \\cdot \\ln 2}{\\ln\\left(\\frac{#}{#}\\right)}',
      (v) => (v[2]! * Math.log(2)) / Math.log(v[1]! / v[0]!),
    ],
    [
      'Um investimento rende #% ao ano. Começando com R$ #, qual é o montante após # anos? (duas casas decimais)',
      'M = C(1 + i)^n',
      'M = # \\cdot \\left(1 + \\frac{#}{100}\\right)^{#}',
      (v) => v[1]! * (1 + v[0]! / 100) ** v[2]!,
      2,
    ],
    [
      'Uma grandeza obedece a N(t) = N₀·e^(−#t), com t em anos. Qual é a meia-vida dela, em anos? (duas casas decimais)',
      'e^{-kt} = \\frac{1}{2} \\Rightarrow T = \\frac{\\ln 2}{k}',
      'T = \\frac{\\ln 2}{#}',
      (v) => Math.log(2) / v[0]!,
      2,
    ],
  ],

  'funcao-logaritmica': [
    [
      'Quantas vezes é preciso multiplicar # por si mesmo para chegar a #? Esse número é o logaritmo de # na base #.',
      'a^x = b \\Rightarrow x = \\log_a b',
      'x = \\log_{#} #',
      (v) => Math.log(v[1]!) / Math.log(v[0]!),
    ],
    [
      'Calcule o logaritmo: log_#(#).',
      '\\log_a b = \\frac{\\ln b}{\\ln a}',
      '\\log_{#} # = \\frac{\\ln #}{\\ln #}',
      (v) => Math.log(v[1]!) / Math.log(v[0]!),
    ],
    [
      'O pH de uma solução é o logaritmo decimal da concentração, com o sinal trocado. Se a concentração é # elevado a menos #, qual é o pH?',
      '\\mathrm{pH} = -\\log_{10}[H^+] = n',
      '\\mathrm{pH} = -\\log_{10}\\left(#^{-#}\\right)',
      (v) => v[1]!,
    ],
    [
      'Use a propriedade do produto: log_#(#) + log_#(#) vale quanto?',
      '\\log_b x + \\log_b y = \\log_b(xy)',
      '\\log_{#}(#) + \\log_{#}(#)',
      (v) => Math.log(v[1]!) / Math.log(v[0]!) + Math.log(v[3]!) / Math.log(v[0]!),
    ],
    [
      'Resolva a equação log_#(x) = # e informe x.',
      '\\log_b x = c \\Rightarrow x = b^c',
      'x = #^{#}',
      (v) => v[0]! ** v[1]!,
    ],
    [
      'Quantas vezes é preciso dividir # por # até chegar a #?',
      'a \\div b^{\\,n} = c \\Rightarrow n = \\frac{\\ln(a/c)}{\\ln b}',
      'n = \\frac{\\ln\\left(\\frac{#}{#}\\right)}{\\ln #}',
      (v) => Math.log(v[0]! / v[2]!) / Math.log(v[1]!),
    ],
    [
      'Resolva a equação log_#(x) + log_#(#) = # e informe x.',
      '\\log_b x + \\log_b a = c \\Rightarrow x = b^c / a',
      'x = \\frac{#^{#}}{#}',
      (v) => v[0]! ** v[3]! / v[2]!,
    ],
    [
      'Calcule log_#(#), sabendo que # é potência de #.',
      '\\log_a b = x \\iff a^x = b',
      '\\log_{#} # = \\frac{\\ln #}{\\ln #}',
      (v) => Math.log(v[1]!) / Math.log(v[0]!),
    ],
    [
      'Numa escala logarítmica de base #, quantas vezes maior é a grandeza de magnitude # em relação à de magnitude #?',
      '\\frac{G_1}{G_2} = b^{\\,m_1 - m_2}',
      '\\frac{G_1}{G_2} = #^{# - #}',
      (v) => v[0]! ** (v[1]! - v[2]!),
    ],
    [
      'Sabendo que log # = # e log # = #, qual é o valor de log #? (duas casas decimais)',
      '\\log(ab) = \\log a + \\log b',
      '\\log(#5) = #2 + #4',
      (v) => v[1]! + v[3]!,
      2,
    ],
    [
      'Resolva log_#(x) = log_#(#) + log_#(#) e informe x.',
      '\\log_b x = \\log_b a + \\log_b c \\Rightarrow x = ac',
      'x = # \\cdot #',
      (v) => v[2]! * v[4]!,
    ],
  ],

  'funcao-modular': [
    [
      'A distância, na reta, entre um número x e # é #. Qual é o maior valor possível de x?',
      '|x - a| = d \\Rightarrow x = a + d',
      'x = # + #',
      (v) => v[0]! + v[1]!,
    ],
    [
      'Para f(x) = |x − #|, qual é o valor de f(#)?',
      'f(x) = |x - a|',
      'f(#) = |# - #|',
      (v) => Math.abs(v[1]! - v[0]!),
    ],
    [
      'Para f(x) = |x| + #, qual é o valor de f(#)?',
      'f(x) = |x| + b',
      'f(#) = |#| + #',
      (v) => Math.abs(v[1]!) + v[0]!,
    ],
    [
      'A distância entre um número x e # é menor que #. Qual é o maior número inteiro que x pode ser?',
      '|x - a| < d \\Rightarrow a < x < a + d \\Rightarrow x_{max} = a + d - 1',
      'x_{max} = # + # - 1',
      (v) => v[0]! + v[1]! - 1,
    ],
    [
      'Quais são as soluções de |x − #| = #? Informe a MENOR.',
      '|x - a| = d \\Rightarrow x = a - d',
      'x = #1 - #2',
      (v) => v[0]! - v[1]!,
    ],
    [
      'Qual é o MENOR valor que a função f(x) = |x − #| + # pode assumir?',
      'f(x) = |x - a| + b \\Rightarrow f_{min} = b',
      'f_{min} = #2',
      (v) => v[1]!,
    ],
    [
      'Uma função devolve a distância entre x e #, menos #. Qual é o menor valor que ela assume?',
      'f(x) = |x - a| - b \\Rightarrow f_{min} = -b',
      'f_{min} = -#',
      (v) => -v[1]!,
    ],
    [
      'Resolva |x + #| = # e informe a MAIOR solução.',
      '|x + a| = d \\Rightarrow x = d - a',
      'x = #2 - #1',
      (v) => v[1]! - v[0]!,
    ],
    [
      'Resolva |#x − #| = # e informe a MAIOR solução. Dê a fração irredutível.',
      '|ax - b| = c \\Rightarrow x = \\frac{b + c}{a}',
      'x = \\frac{#3 + #2}{#1}',
      (v) => fracao(v[1]! + v[2]!, v[0]!),
    ],
    [
      'Quantos números inteiros x têm distância até # menor ou igual a #?',
      '|x - a| \\le d \\Rightarrow 2d + 1',
      'n = 2 \\cdot # + 1',
      (v) => 2 * v[1]! + 1,
    ],
    [
      'Um forno aceita temperaturas que se afastam no máximo # graus da temperatura ideal #. Qual é a MENOR temperatura aceitável?',
      '|T - T_i| \\le d \\Rightarrow T_{min} = T_i - d',
      'T_{min} = #2 - #1',
      (v) => v[1]! - v[0]!,
    ],
    [
      'Quantas soluções tem a equação |x − #| + # = #? Responda #, # ou #.',
      '|x - a| = c - b \\Rightarrow \\begin{cases} 2 & c > b \\\\ 1 & c = b \\\\ 0 & c < b \\end{cases}',
      '|x - #1| = #3 - #2',
      (v) => (v[2]! > v[1]! ? 2 : v[2]! === v[1]! ? 1 : 0),
    ],
  ],
};
