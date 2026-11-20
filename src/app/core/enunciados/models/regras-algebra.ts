import {
  anagramas,
  arranjo,
  combinacao,
  fatorial,
  fracao,
  mdc,
  raizes,
  type Regra,
} from '@core/enunciados/models/regras-de-passos';

/**
 * As regras dos tópicos de Álgebra e de números.
 *
 * Aqui já há perguntas em que a resposta não é um número redondo — uma fração
 * irredutível, um valor exato —, e por isso várias regras devolvem texto.
 */

export const REGRAS_ALGEBRA: Readonly<Record<string, readonly Regra[]>> = {
  'equacao-primeiro-grau': [
    [
      'Pedro pensou num número, multiplicou-o por #, somou # e chegou a #. Em que número ele pensou?',
      'a x + b = c \\Rightarrow x = \\frac{c - b}{a}',
      'x = \\frac{#3 - #2}{#1}',
      (v) => (v[2]! - v[1]!) / v[0]!,
    ],
    [
      'Resolva a equação #x + # = # e informe o valor exato de x.',
      'a x + b = c \\Rightarrow x = \\frac{c - b}{a}',
      'x = \\frac{#3 - #2}{#1}',
      (v) => (v[2]! - v[1]!) / v[0]!,
    ],
    [
      'Resolva a equação #x − # = # e informe o valor exato de x.',
      'a x - b = c \\Rightarrow x = \\frac{c + b}{a}',
      'x = \\frac{#3 + #2}{#1}',
      (v) => (v[2]! + v[1]!) / v[0]!,
    ],
    [
      'Resolva a equação x/# + # = # e informe o valor exato de x.',
      '\\frac{x}{a} + b = c \\Rightarrow x = a(c - b)',
      'x = #1 \\cdot (#3 - #2)',
      (v) => v[0]! * (v[2]! - v[1]!),
    ],
    [
      'Carlos tem # anos mais que Marta. Juntos, os dois têm # anos. Quantos anos tem Marta?',
      'm + (m + a) = S \\Rightarrow m = \\frac{S - a}{2}',
      'm = \\frac{#2 - #1}{2}',
      (v) => (v[1]! - v[0]!) / 2,
    ],
    [
      'Resolva a equação #(x − #) = #x + # e informe o valor exato de x.',
      'a(x - b) = c x + d \\Rightarrow x = \\frac{d + ab}{a - c}',
      'x = \\frac{#4 + #1 \\cdot #2}{#1 - #3}',
      (v) => (v[3]! + v[0]! * v[1]!) / (v[0]! - v[2]!),
    ],
    [
      'Resolva a equação #(x + #) = #x − # e informe o valor exato de x.',
      'a(x + b) = c x - d \\Rightarrow x = \\frac{-d - ab}{a - c}',
      'x = \\frac{-#4 - #1 \\cdot #2}{#1 - #3}',
      (v) => (-v[3]! - v[0]! * v[1]!) / (v[0]! - v[2]!),
    ],
    [
      'Resolva a equação x/# + x/# = # e informe o valor exato de x.',
      'x\\left(\\frac{1}{a} + \\frac{1}{b}\\right) = c \\Rightarrow x = \\frac{c}{\\frac{1}{a} + \\frac{1}{b}}',
      'x = \\frac{#3}{\\frac{1}{#2} + \\frac{1}{#1}}',
      (v) => v[2]! / (1 / v[0]! + 1 / v[1]!),
    ],
    [
      'Resolva a equação #(x − #) = # e informe o valor exato de x.',
      'a(x - b) = c \\Rightarrow x = b + \\frac{c}{a}',
      'x = #2 + \\frac{#3}{#1}',
      (v) => v[1]! + v[2]! / v[0]!,
    ],
    [
      'Um reservatório começou com # litros e perde # litros por hora. Depois de quantas horas ele chega a # litros?',
      'V_0 - r\\,t = V \\Rightarrow t = \\frac{V_0 - V}{r}',
      't = \\frac{#1 - #3}{#2}',
      (v) => (v[0]! - v[2]!) / v[1]!,
    ],
    [
      'Resolva a equação #(#x − #) = #(x + #) − # e informe o valor exato de x.',
      'a(bx - c) = d(x + e) - f \\Rightarrow x = \\frac{de - f + ac}{ab - d}',
      'x = \\frac{#3 \\cdot #1 - #2 + # \\cdot #}{#3 \\cdot #1 - #2}',
      (v) => (v[3]! * v[4]! - v[5]! + v[0]! * v[2]!) / (v[0]! * v[1]! - v[3]!),
    ],
    [
      'Resolva a equação (x + #)/# = (x − #)/# + # e informe o valor exato de x.',
      '\\frac{x + a}{b} = \\frac{x - c}{d} + e \\Rightarrow x = \\frac{-bc + bde - da}{d - b}',
      'x = \\frac{-#3 \\cdot #1 + #2 \\cdot #3 \\cdot #1 - #4 \\cdot #2}{# - #}',
      (v) => (-v[1]! * v[2]! + v[1]! * v[3]! * v[4]! - v[3]! * v[0]!) / (v[3]! - v[1]!),
    ],
    [
      'Um número somado com o seu dobro dá #. Qual é esse número?',
      'x + 2x = S \\Rightarrow x = \\frac{S}{3}',
      'x = \\frac{#}{3}',
      (v) => v[0]! / 3,
    ],
    [
      'Resolva a equação #x + # = #x + # e informe o valor exato de x.',
      'a x + b = c x + d \\Rightarrow x = \\frac{d - b}{a - c}',
      'x = \\frac{#2 - #4}{#3 - #1}',
      (v) => (v[3]! - v[1]!) / (v[0]! - v[2]!),
    ],
    [
      'Um ciclista percorreu #/# da rota, depois pedalou mais # km e, com isso, completou #/# da rota. Quantos quilômetros tem a rota?',
      '\\frac{a}{b}R + c = \\frac{d}{e}R \\Rightarrow R = \\frac{c}{\\frac{d}{e} - \\frac{a}{b}}',
      'R = \\frac{#}{\\frac{#}{#} - \\frac{#}{#}}',
      (v) => v[2]! / (v[3]! / v[4]! - v[0]! / v[1]!),
    ],
    [
      'Ana tem o triplo da idade de Bia e, juntas, as duas somam # anos. Quantos anos Bia tem hoje?',
      '3x + x = S \\Rightarrow x = \\frac{S}{4}',
      'x = \\frac{#}{4}',
      (v) => v[0]! / 4,
    ],
    [
      'Um pai tem o triplo da idade do filho. Daqui a # anos terá o dobro. Quantos anos o filho tem hoje?',
      '3x + a = 2(x + a) \\Rightarrow x = a',
      '3x + #1 = 2(x + #1) \\Rightarrow x = #1',
      (v) => v[0]!,
    ],
    [
      '#/# de um número menos # é igual a #. Qual é o número?',
      '\\frac{a}{b}x - c = d \\Rightarrow x = \\frac{(d + c)b}{a}',
      'x = \\frac{(#4 + #3) \\cdot #2}{#1}',
      (v) => ((v[3]! + v[2]!) * v[1]!) / v[0]!,
    ],
    [
      'O triplo de um número menos # é igual ao dobro desse número mais #. Qual é o número?',
      '3x - a = 2x + b \\Rightarrow x = a + b',
      'x = # + #',
      (v) => v[0]! + v[1]!,
    ],
  ],

  'equacao-segundo-grau': [
    [
      'Dois números têm soma # e produto #. Qual é o maior dos dois?',
      'x^2 - Sx + P = 0 \\Rightarrow x = \\frac{S + \\sqrt{S^2 - 4P}}{2}',
      'x = \\frac{#1 + \\sqrt{#1^2 - 4 \\cdot #2}}{2}',
      (v) => raizes(1, -v[0]!, v[1]!)[0]!,
    ],
    [
      'Resolva a equação x² − # = # e informe a MAIOR raiz.',
      'x^2 = a + b \\Rightarrow x = \\sqrt{a + b}',
      'x = \\sqrt{# + #}',
      (v) => Math.sqrt(v[0]! + v[1]!),
    ],
    [
      'Resolva a equação x² − #x = # e informe a MAIOR raiz.',
      'x^2 - ax - b = 0',
      'x = \\frac{#1 + \\sqrt{#1^2 + 4 \\cdot #2}}{2}',
      (v) => raizes(1, -v[0]!, -v[1]!)[0]!,
    ],
    [
      'Resolva a equação x² − #x + # = # e informe a MAIOR raiz.',
      'x^2 - ax + (b - c) = 0',
      'x = \\frac{#1 + \\sqrt{#1^2 - 4(#2 - #3)}}{2}',
      (v) => raizes(1, -v[0]!, v[1]! - v[2]!)[0]!,
    ],
    [
      'Resolva a equação x² = # e informe a raiz POSITIVA.',
      'x = \\sqrt{a}',
      'x = \\sqrt{#}',
      (v) => Math.sqrt(v[0]!),
    ],
    [
      'Um retângulo tem a base # cm maior que a altura e área de # cm². Quantos centímetros mede a base?',
      'h(h + a) = A \\Rightarrow h = \\frac{-a + \\sqrt{a^2 + 4A}}{2}',
      'b = \\frac{-#1 + \\sqrt{#1^2 + 4 \\cdot #2}}{2} + #1',
      (v) => raizes(1, v[0]!, -v[1]!)[0]! + v[0]!,
    ],
    [
      'Resolva a equação x² − #x − # = # e informe a MAIOR raiz.',
      'x^2 - ax - (b + c) = 0',
      'x = \\frac{#1 + \\sqrt{#1^2 + 4(#2 + #3)}}{2}',
      (v) => raizes(1, -v[0]!, -(v[1]! + v[2]!))[0]!,
    ],
    [
      'Resolva a equação x² + x − # = # e informe a MAIOR raiz.',
      'x^2 + x - (a + b) = 0',
      'x = \\frac{-1 + \\sqrt{1 + 4(# + #)}}{2}',
      (v) => raizes(1, 1, -(v[0]! + v[1]!))[0]!,
    ],
    [
      'Resolva a equação #x² − #x + # = # e informe a MAIOR raiz.',
      'ax^2 - bx + (c - d) = 0',
      'x = \\frac{#2 + \\sqrt{#2^2 - 4 \\cdot #1 \\cdot (#3 - #4)}}{2 \\cdot #1}',
      (v) => raizes(v[0]!, -v[1]!, v[2]! - v[3]!)[0]!,
    ],
    [
      'Uma pedra é atirada para cima a # m/s, de uma altura de # m. Com a gravidade valendo # m/s², em quantos segundos ela chega ao chão? (duas casas decimais)',
      'h + v t - \\frac{gt^2}{2} = 0 \\Rightarrow t = \\frac{v + \\sqrt{v^2 + 2gh}}{g}',
      't = \\frac{#1 + \\sqrt{#1^2 + 2 \\cdot #3 \\cdot #2}}{#3}',
      (v) => (v[0]! + Math.sqrt(v[0]! ** 2 + 2 * v[2]! * v[1]!)) / v[2]!,
      2,
    ],
    [
      'Resolva a equação x² − #x + # = # e informe a MENOR raiz.',
      'x^2 - ax + (b - c) = 0',
      'x = \\frac{#1 - \\sqrt{#1^2 - 4(#2 - #3)}}{2}',
      (v) => raizes(1, -v[0]!, v[1]! - v[2]!)[1]!,
    ],
    [
      'Resolva a equação #x² − #x = # e informe a MAIOR raiz.',
      'ax^2 - bx - c = 0',
      'x = \\frac{#2 + \\sqrt{#2^2 + 4 \\cdot #1 \\cdot #3}}{2 \\cdot #1}',
      (v) => raizes(v[0]!, -v[1]!, -v[2]!)[0]!,
    ],
    [
      'Um terreno quadrado foi ampliado em # m de cada lado e passou a ter # m². Quantos metros media o lado original?',
      '(x + a)^2 = A \\Rightarrow x = \\sqrt{A} - a',
      'x = \\sqrt{#2} - #1',
      (v) => Math.sqrt(v[1]!) - v[0]!,
    ],
    [
      'A soma de um número positivo com o seu inverso é #/#. Qual é o maior valor que esse número pode ter?',
      'x + \\frac{1}{x} = \\frac{a}{b} \\Rightarrow bx^2 - ax + b = 0',
      'x = \\frac{#1 + \\sqrt{#1^2 - 4 \\cdot #2^2}}{2 \\cdot #2}',
      (v) => raizes(v[1]!, -v[0]!, v[1]!)[0]!,
    ],
    [
      'Resolva a equação x² − #x + # = # e informe a MAIOR raiz, com duas casas decimais.',
      'x^2 - ax + (b - c) = 0',
      'x = \\frac{#1 + \\sqrt{#1^2 - 4(#2 - #3)}}{2}',
      (v) => raizes(1, -v[0]!, v[1]! - v[2]!)[0]!,
      2,
    ],
    [
      'Use a relação de soma e produto: qual é a soma das raízes de #x² − #x + # = #?',
      'S = -\\frac{b}{a} = \\frac{b}{a}',
      'S = \\frac{#2}{#1}',
      (v) => v[1]! / v[0]!,
    ],
    [
      'A diferença entre dois números positivos é # e o produto deles é #. Qual é o MAIOR deles?',
      'x(x + d) = P \\Rightarrow x = \\frac{-d + \\sqrt{d^2 + 4P}}{2}',
      'x = \\frac{-#1 + \\sqrt{#1^2 + 4 \\cdot #2}}{2} + #1',
      (v) => raizes(1, v[0]!, -v[1]!)[0]! + v[0]!,
    ],
  ],

  'expressoes-algebricas': [
    [
      'Calcule o valor numérico de #x + # para x = #.',
      'ax + b',
      '#3 \\cdot #1 + #2',
      (v) => v[0]! * v[2]! + v[1]!,
    ],
    [
      'Calcule o valor numérico de #a − # para a = #.',
      'aA - b',
      '#3 \\cdot #1 - #2',
      (v) => v[0]! * v[2]! - v[1]!,
    ],
    [
      'Calcule o valor numérico de x² + #x para x = #.',
      'x^2 + ax',
      '(#2)^2 + #1 \\cdot #2',
      (v) => v[1]! ** 2 + v[0]! * v[1]!,
    ],
    [
      'Calcule o valor numérico de #(x − #) + #x para x = #.',
      'a(x - b) + cx',
      '#1 \\cdot (#4 - #2) + #3 \\cdot #4',
      (v) => v[0]! * (v[3]! - v[1]!) + v[2]! * v[3]!,
    ],
    [
      'Calcule o valor numérico de (a + b)² − ab para a = # e b = #.',
      '(a + b)^2 - ab',
      '(#1 + #2)^2 - #1 \\cdot #2',
      (v) => (v[0]! + v[1]! + v[2]!) ** 2 - v[0]! * v[1]!,
    ],
    [
      'Calcule o valor numérico de #x − #y para x = # e y = #.',
      'ax - by',
      '#3 \\cdot #1 - #4 \\cdot #2',
      (v) => v[0]! * v[2]! - v[1]! * v[3]!,
    ],
    [
      'Calcule o valor numérico de #(x + #) − #x para x = #.',
      'a(x + b) - cx',
      '#1 \\cdot (#4 + #2) - #3 \\cdot #4',
      (v) => v[0]! * (v[3]! + v[1]!) - v[2]! * v[3]!,
    ],
    [
      'Calcule o valor numérico de x² − #x + # para x = #.',
      'x^2 - ax + b',
      '(#3)^2 - #1 \\cdot #3 + #2',
      (v) => v[2]! ** 2 - v[0]! * v[2]! + v[1]!,
    ],
    [
      'Calcule o valor numérico de (#x + #)/(x − #) para x = #. (duas casas decimais)',
      '\\frac{ax + b}{x - c}',
      '\\frac{#1 \\cdot #4 + #2}{#4 - #3}',
      (v) => (v[0]! * v[3]! + v[1]!) / (v[3]! - v[2]!),
      2,
    ],
    [
      'Calcule o valor numérico de #(x + #)² − #x para x = #.',
      'a(x + b)^2 - cx',
      '#1 \\cdot (#4 + #2)^2 - #3 \\cdot #4',
      (v) => v[0]! * (v[3]! + v[1]!) ** 2 - v[2]! * v[3]!,
    ],
    [
      'Calcule o valor numérico de (a³ − b³)/(a − b) para a = # e b = #.',
      '\\frac{a^3 - b^3}{a - b} = a^2 + ab + b^2',
      '\\frac{(#1)^3 - (#2)^3}{#1 - #2}',
      (v) => (v[0]! ** 3 - v[1]! ** 3) / (v[0]! - v[1]!),
    ],
    [
      'Calcule o valor numérico de #x² − #xy + y² para x = # e y = #.',
      'ax^2 - bxy + y^2',
      '#1 \\cdot (#3)^2 - #2 \\cdot #3 \\cdot #4 + (#4)^2',
      (v) => v[0]! * v[2]! ** 2 - v[1]! * v[2]! * v[3]! + v[3]! ** 2,
    ],
    [
      'Calcule o valor numérico de #x² − #xy + #y² para x = # e y = #.',
      'ax^2 - bxy + cy^2',
      '#1 \\cdot (#4)^2 - #2 \\cdot #4 \\cdot #5 + #3 \\cdot (#5)^2',
      (v) => v[0]! * v[3]! ** 2 - v[1]! * v[3]! * v[4]! + v[2]! * v[4]! ** 2,
    ],
    [
      'A área de um terreno é dada por x² + #x, com x em metros. Quantos metros quadrados ele tem quando x = #?',
      'x^2 + ax',
      '(#2)^2 + #1 \\cdot #2',
      (v) => v[1]! ** 2 + v[0]! * v[1]!,
    ],
  ],

  fracoes: [
    [
      'Some as frações #/# e #/# e dê o resultado irredutível.',
      '\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}',
      '\\frac{#1 \\cdot #4 + #3 \\cdot #2}{#2 \\cdot #4}',
      (v) => fracao(v[0]! * v[3]! + v[2]! * v[1]!, v[1]! * v[3]!),
    ],
    [
      'Subtraia #/# de #/# e dê o resultado irredutível.',
      '\\frac{c}{d} - \\frac{a}{b} = \\frac{cb - ad}{db}',
      '\\frac{#3 \\cdot #2 - #1 \\cdot #4}{#4 \\cdot #2}',
      (v) => fracao(v[2]! * v[1]! - v[0]! * v[3]!, v[3]! * v[1]!),
    ],
    [
      'Multiplique as frações #/# e #/# e dê o resultado irredutível.',
      '\\frac{a}{b} \\cdot \\frac{c}{d} = \\frac{ac}{bd}',
      '\\frac{#4 \\cdot #1}{#3 \\cdot #2}',
      (v) => fracao(v[0]! * v[2]!, v[1]! * v[3]!),
    ],
    [
      'Divida #/# por #/# e dê o resultado irredutível.',
      '\\frac{a}{b} \\div \\frac{c}{d} = \\frac{ad}{bc}',
      '\\frac{#4 \\cdot #1}{#3 \\cdot #2}',
      (v) => fracao(v[0]! * v[3]!, v[1]! * v[2]!),
    ],
    [
      'Calcule a soma #/# + #/# + #/# e dê o resultado irredutível.',
      '\\frac{a}{b} + \\frac{c}{d} + \\frac{e}{f}',
      '\\frac{#}{#} + \\frac{#}{#} + \\frac{#}{#}',
      (v) => {
        const mdc = (a: number, b: number): number => (b === 0 ? Math.abs(a) : mdc(b, a % b));
        let num = v[0]! * v[3]! * v[5]! + v[2]! * v[1]! * v[5]! + v[4]! * v[1]! * v[3]!;
        let den = v[1]! * v[3]! * v[5]!;
        const d = mdc(num, den) || 1;
        return fracao(num / d, den / d);
      },
    ],
    [
      'Quanto é #/# de # reais?',
      '\\frac{a}{b} \\cdot V',
      '\\frac{#}{#} \\cdot #',
      (v) => (v[0]! / v[1]!) * v[2]!,
    ],
    [
      'Numa turma de # alunos, # são meninos. Que fração irredutível da turma isso representa?',
      '\\frac{m}{T}',
      '\\frac{#}{#}',
      (v) => fracao(v[1]!, v[0]!),
    ],
    [
      'Um tanque estava com #/# da capacidade e recebeu mais #/#. Que fração da capacidade ele tem agora?',
      '\\frac{a}{b} + \\frac{c}{d}',
      '\\frac{#1 \\cdot #4 + #3 \\cdot #2}{#2 \\cdot #4}',
      (v) => fracao(v[0]! * v[3]! + v[2]! * v[1]!, v[1]! * v[3]!),
    ],
    [
      'Uma pizza foi cortada em # pedaços iguais e Ana comeu # deles. Que fração da pizza ela comeu? Escreva na forma mais simples.',
      '\\frac{c}{p}',
      '\\frac{#}{#}',
      (v) => fracao(v[1]!, v[0]!),
    ],
    [
      'Um bolo foi cortado em # fatias iguais e # foram servidas. Que fração do bolo sobrou?',
      '1 - \\frac{s}{t} = \\frac{t - s}{t}',
      '\\frac{#1 - #2}{#1}',
      (v) => fracao(v[0]! - v[1]!, v[0]!),
    ],
    [
      'Uma receita pede #/# de xícara de açúcar. Fazendo metade da receita, que fração de xícara é necessária?',
      '\\frac{1}{2} \\cdot \\frac{a}{b}',
      '\\frac{1}{2} \\cdot \\frac{#}{#}',
      (v) => fracao(v[0]!, 2 * v[1]!),
    ],
    [
      'Lucas gastou #/# da mesada em livros e #/# em transporte. Que fração da mesada ele gastou ao todo?',
      '\\frac{a}{b} + \\frac{c}{d}',
      '\\frac{#1 \\cdot #4 + #3 \\cdot #2}{#2 \\cdot #4}',
      (v) => fracao(v[0]! * v[3]! + v[2]! * v[1]!, v[1]! * v[3]!),
    ],
  ],

  'numeros-decimais': [
    [
      'Numa turma de # alunos, # são meninos. Que fração irredutível da turma isso representa?',
      '\\frac{m}{T}',
      '\\frac{#}{#}',
      (v) => fracao(v[1]!, v[0]!),
    ],
    [
      'Escreva o número decimal # como fração irredutível.',
      'd = \\frac{N}{10^{n}}',
      '# = \\frac{#}{10^{n}}',
      (v) => {
        const texto = String(v[0]!);
        const casas = (texto.split('.')[1] ?? '').length;
        return fracao(Math.round(v[0]! * 10 ** casas), 10 ** casas);
      },
    ],
    [
      'Uma balança de precisão mostrou # kg. Escreva esse decimal como fração irredutível.',
      'd = \\frac{N}{10^{n}}',
      '# = \\frac{#}{10^{n}}',
      (v) => {
        const texto = String(v[0]!);
        const casas = (texto.split('.')[1] ?? '').length;
        return fracao(Math.round(v[0]! * 10 ** casas), 10 ** casas);
      },
    ],
    [
      'Um número tem parte inteira zero e o algarismo # se repete infinitamente depois da vírgula. Qual é a fração geratriz, irredutível?',
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
  ],

  progressoes: [
    [
      'Numa PA de primeiro termo # e razão #, qual é o #º termo?',
      'a_n = a_1 + (n - 1)r',
      'a_n = #1 + (#3 - 1) \\cdot #2',
      (v) => v[0]! + (v[2]! - 1) * v[1]!,
    ],
    [
      'Numa PG de primeiro termo # e razão #, qual é o #º termo?',
      'a_n = a_1 \\cdot q^{n-1}',
      'a_n = # \\cdot #^{# - 1}',
      (v) => v[0]! * v[1]! ** (v[2]! - 1),
    ],
    [
      'Numa PA de primeiro termo # e razão #, qual é a soma dos # primeiros termos?',
      'S_n = \\frac{n(a_1 + a_n)}{2}',
      'S_n = \\frac{#3 \\cdot (2 \\cdot #1 + (#3 - 1) \\cdot #2)}{2}',
      (v) => (v[2]! * (2 * v[0]! + (v[2]! - 1) * v[1]!)) / 2,
    ],
    [
      'Qual é a soma dos # primeiros números ímpares positivos?',
      '1 + 3 + 5 + \\dots = n^2',
      'S_n = #^2',
      (v) => v[0]! ** 2,
    ],
    [
      'A soma dos infinitos termos de uma PG de primeiro termo # e razão # é quanto? (duas casas decimais)',
      'S = \\frac{a_1}{1 - q}',
      'S = \\frac{#}{1 - #}',
      (v) => v[0]! / (1 - v[1]!),
      2,
    ],
    [
      'Numa PA, o primeiro termo é # e o último é #. Quantos termos tem a PA, se a razão é #?',
      'a_n = a_1 + (n-1)r \\Rightarrow n = \\frac{a_n - a_1}{r} + 1',
      'n = \\frac{#2 - #1}{#3} + 1',
      (v) => (v[1]! - v[0]!) / v[2]! + 1,
    ],
    [
      'Numa progressão geométrica de primeiro termo # e razão #, qual é a soma dos # primeiros termos?',
      'S_n = a_1\\frac{q^n - 1}{q - 1}',
      'S_n = #1 \\cdot \\frac{#2^{#3} - 1}{#2 - 1}',
      (v) => v[0]! * ((v[1]! ** v[2]! - 1) / (v[1]! - 1)),
    ],
    [
      'Uma pessoa guarda # reais no primeiro mês e aumenta # reais a cada mês seguinte. Quantos reais ela guarda no mês número #?',
      'a_n = a_1 + (n-1)r',
      'a_n = #1 + (#3 - 1) \\cdot #2',
      (v) => v[0]! + (v[2]! - 1) * v[1]!,
    ],
    [
      'Uma pessoa guarda # reais no primeiro mês e aumenta # reais a cada mês seguinte. Quantos reais ela guardou ao todo nos # primeiros meses?',
      'S_n = \\frac{n(2a_1 + (n-1)r)}{2}',
      'S_n = \\frac{#3 \\cdot (2 \\cdot #1 + (#3 - 1) \\cdot #2)}{2}',
      (v) => (v[2]! * (2 * v[0]! + (v[2]! - 1) * v[1]!)) / 2,
    ],
    [
      'Uma bola cai de # m e, a cada quique, sobe #/# da altura anterior. Quantos metros ela sobe no quique número #?',
      'h_n = h_0 \\left(\\frac{a}{b}\\right)^{n}',
      'h_n = # \\cdot \\left(\\frac{#}{#}\\right)^{#}',
      (v) => v[0]! * (v[1]! / v[2]!) ** v[3]!,
    ],
  ],

  'analise-combinatoria': [
    [
      'De quantos modos se pode escolher uma equipe de # pessoas entre # candidatos, sem distinguir papéis?',
      'C(n, k) = \\frac{n!}{k!(n-k)!}',
      'C(#2, #1) = \\frac{#2!}{#1!\\,(#2 - #1)!}',
      (v) => combinacao(v[1]!, v[0]!),
    ],
    [
      'De quantos modos se pode escolher uma equipe de # pessoas entre # candidatos, sem distinguir cargos?',
      'C(n, k) = \\frac{n!}{k!(n-k)!}',
      'C(#2, #1) = \\frac{#2!}{#1!\\,(#2 - #1)!}',
      (v) => combinacao(v[1]!, v[0]!),
    ],
    [
      'Quantos anagramas distintos tem a palavra *? (todas as letras diferentes)',
      'P_n = n!',
      'P_n = n!',
      (_v, texto) => fatorial((/palavra ([A-ZÁÉÍÓÚÂÊÔÃÕÇ]+)/.exec(texto)?.[1] ?? '').length),
    ],
    [
      'Quantos anagramas distintos tem a palavra *, que tem letras repetidas?',
      'P = \\frac{n!}{n_1!\\,n_2!\\cdots}',
      'P = \\frac{n!}{n_1!\\,n_2!\\cdots}',
      (_v, texto) => anagramas(/palavra ([A-ZÁÉÍÓÚÂÊÔÃÕÇ]+)/.exec(texto)?.[1] ?? ''),
    ],
    [
      'De quantos modos # pessoas podem se sentar em # cadeiras em fila?',
      'A(n, k) = \\frac{n!}{(n-k)!}',
      'A(#1, #2) = \\frac{#1!}{(#1 - #2)!}',
      (v) => arranjo(v[0]!, v[1]!),
    ],
    [
      'De quantos modos # pessoas podem se sentar em fila, em # cadeiras?',
      'A(n, k) = \\frac{n!}{(n-k)!}',
      'A(#1, #2) = \\frac{#1!}{(#1 - #2)!}',
      (v) => arranjo(v[0]!, v[1]!),
    ],
    [
      'Entre # pessoas, de quantos modos se pode formar uma fila de #, importando a ordem?',
      'A(n, k) = \\frac{n!}{(n-k)!}',
      'A(#1, #2) = \\frac{#1!}{(#1 - #2)!}',
      (v) => arranjo(v[0]!, v[1]!),
    ],
    [
      'Quantas senhas de # algarismos existem, usando os dígitos de # a #, podendo repetir?',
      'N = (b - a + 1)^{n}',
      'N = (# - # + 1)^{#}',
      (v) => (v[2]! - v[1]! + 1) ** v[0]!,
    ],
    [
      'Uma comissão terá # entre # engenheiros e # entre # engenheiras. Quantas comissões diferentes são possíveis?',
      'N = C(e, a) \\cdot C(e\\prime, b)',
      'N = C(#, #) \\cdot C(#, #)',
      (v) => combinacao(v[1]!, v[0]!) * combinacao(v[3]!, v[2]!),
    ],
    [
      'De quantos modos se pode escolher um presidente e um vice entre # candidatos, sendo os dois cargos diferentes?',
      'A(n, 2) = n(n-1)',
      'A = #1 \\cdot (#1 - 1)',
      (v) => v[0]! * (v[0]! - 1),
    ],
    [
      'Numa urna há # bolas de uma cor e # de outra. Retirando duas SEM reposição, quantos pares distintos (sem ordem) se podem formar?',
      'C(n, 2) = \\frac{n(n-1)}{2}',
      'C(#1 + #2, 2) = \\frac{(#1 + #2)(#1 + #2 - 1)}{2}',
      (v) => combinacao(v[0]! + v[1]!, 2),
    ],
  ],

  probabilidade: [
    [
      'Num dado honesto de # faces, qual é a probabilidade de sair o número #? (duas casas decimais)',
      'P = \\frac{1}{n}',
      'P = \\frac{1}{#}',
      (v) => 1 / v[0]!,
      2,
    ],
    [
      'Num dado de # faces, qual é a probabilidade de sair um número maior que #? Responda como fração.',
      'P = \\frac{n - k}{n}',
      'P = \\frac{#1 - #2}{#1}',
      (v) => {
        const mdc = (a: number, b: number): number => (b === 0 ? Math.abs(a) : mdc(b, a % b));
        const num = v[0]! - v[1]!;
        const d = mdc(num, v[0]!) || 1;
        return fracao(num / d, v[0]! / d);
      },
    ],
    [
      'Numa urna há # bolas vermelhas e # azuis. Retirando UMA bola, qual é a probabilidade de ser vermelha? (duas casas decimais)',
      'P = \\frac{v}{v + a}',
      'P = \\frac{#1}{#1 + #2}',
      (v) => v[0]! / (v[0]! + v[1]!),
      2,
    ],
    [
      'Numa urna há # bolas brancas e # pretas. Qual é a probabilidade de tirar uma branca? Responda como fração.',
      'P = \\frac{b}{b + p}',
      'P = \\frac{#1}{#1 + #2}',
      (v) => {
        const mdc = (a: number, b: number): number => (b === 0 ? Math.abs(a) : mdc(b, a % b));
        const total = v[0]! + v[1]!;
        const d = mdc(v[0]!, total) || 1;
        return fracao(v[0]! / d, total / d);
      },
    ],
    [
      'Numa urna há # bolas vermelhas e # azuis. Retirando duas SEM reposição, qual é a probabilidade de ambas serem vermelhas? (duas casas decimais)',
      'P = \\frac{v}{v+a} \\cdot \\frac{v-1}{v+a-1}',
      'P = \\frac{#1}{#1 + #2} \\cdot \\frac{#1 - 1}{#1 + #2 - 1}',
      (v) => (v[0]! / (v[0]! + v[1]!)) * ((v[0]! - 1) / (v[0]! + v[1]! - 1)),
      2,
    ],
    [
      'Um lote tem # peças, das quais # são defeituosas. Retirando UMA peça, qual é a probabilidade de ser DEFEITUOSA? (duas casas decimais)',
      'P = \\frac{d}{n}',
      'P = \\frac{#22}{#11}',
      (v) => v[1]! / v[0]!,
      2,
    ],
    [
      'Jogando # moedas honestas, qual é a probabilidade de sair cara em todas? Responda como fração.',
      'P = \\left(\\frac{1}{2}\\right)^{n}',
      'P = \\left(\\frac{1}{2}\\right)^{#}',
      (v) => fracao(1, 2 ** v[0]!),
    ],
    [
      'Numa urna há # bolas brancas e # pretas. Tirando duas sem reposição, qual é a probabilidade de as duas serem brancas? (duas casas decimais)',
      'P = \\frac{b}{b+p} \\cdot \\frac{b-1}{b+p-1}',
      'P = \\frac{#1}{#1 + #2} \\cdot \\frac{#1 - 1}{#1 + #2 - 1}',
      (v) => (v[0]! / (v[0]! + v[1]!)) * ((v[0]! - 1) / (v[0]! + v[1]! - 1)),
      2,
    ],
    [
      'Numa urna há # bolas vermelhas e # azuis. Retirando duas COM reposição, qual é a probabilidade de ambas serem azuis? (duas casas decimais)',
      'P = \\left(\\frac{a}{v+a}\\right)^2',
      'P = \\left(\\frac{#2}{#1 + #2}\\right)^2',
      (v) => (v[1]! / (v[0]! + v[1]!)) ** 2,
      2,
    ],
    [
      'Dois eventos independentes têm probabilidades # e #. Qual é a probabilidade de ambos ocorrerem? (duas casas decimais)',
      'P = P_1 \\cdot P_2',
      'P = # \\cdot #',
      (v) => v[0]! * v[1]!,
      2,
    ],
  ],

  'juros-compostos': [
    [
      'Um capital de # reais é aplicado a #% por período, a juros compostos, durante # períodos. Qual é o montante final, em reais? (duas casas decimais)',
      'M = C(1 + i)^n',
      'M = # \\cdot (1 + \\frac{#}{100})^{#}',
      (v) => v[0]! * (1 + v[1]! / 100) ** v[2]!,
      2,
    ],
    [
      'Um capital de R$ # é aplicado a #% ao período, por # períodos, a juros compostos. Qual é o montante? (duas casas decimais)',
      'M = C(1 + i)^n',
      'M = # \\cdot (1 + \\frac{#}{100})^{#}',
      (v) => v[0]! * (1 + v[1]! / 100) ** v[2]!,
      2,
    ],
    [
      'Um capital de R$ # rende #% ao período, a juros compostos. Qual é o valor dos JUROS após # períodos? (duas casas decimais)',
      'J = C\\left[(1+i)^n - 1\\right]',
      'J = # \\cdot \\left[(1 + \\frac{#}{100})^{#} - 1\\right]',
      (v) => v[0]! * ((1 + v[1]! / 100) ** v[2]! - 1),
      2,
    ],
    [
      'Um capital de # reais é aplicado a #% por período, a juros compostos, durante # períodos. Quantos reais de juros ele rende? (duas casas decimais)',
      'J = C\\left[(1+i)^n - 1\\right]',
      'J = # \\cdot \\left[(1 + \\frac{#}{100})^{#} - 1\\right]',
      (v) => v[0]! * ((1 + v[1]! / 100) ** v[2]! - 1),
      2,
    ],
    [
      'A uma taxa de #% por período, em quantos períodos um capital DOBRA? (duas casas decimais)',
      '(1+i)^n = 2 \\Rightarrow n = \\frac{\\ln 2}{\\ln(1+i)}',
      'n = \\frac{\\ln 2}{\\ln(1 + \\frac{#}{100})}',
      (v) => Math.log(2) / Math.log(1 + v[0]! / 100),
      2,
    ],
    [
      'A uma taxa de #% por período, em quantos períodos um capital TRIPLICA? (duas casas decimais)',
      '(1+i)^n = 3 \\Rightarrow n = \\frac{\\ln 3}{\\ln(1+i)}',
      'n = \\frac{\\ln 3}{\\ln(1 + \\frac{#}{100})}',
      (v) => Math.log(3) / Math.log(1 + v[0]! / 100),
      2,
    ],
    [
      'Em quantos períodos um capital de # reais vira # reais, a #% por período em juros compostos? (duas casas decimais)',
      '(1+i)^n = \\frac{M}{C} \\Rightarrow n = \\frac{\\ln(M/C)}{\\ln(1+i)}',
      'n = \\frac{\\ln(\\frac{#}{#})}{\\ln(1 + \\frac{#}{100})}',
      (v) => Math.log(v[1]! / v[0]!) / Math.log(1 + v[2]! / 100),
      2,
    ],
    [
      'Um capital de R$ # foi aplicado a juros compostos e virou R$ # após # períodos. Qual foi a taxa por período, em %? (duas casas decimais)',
      'i = \\left(\\frac{M}{C}\\right)^{1/n} - 1',
      'i = \\left(\\left(\\frac{#2}{#1}\\right)^{\\frac{1}{#3}} - 1\\right) \\cdot 100',
      (v) => ((v[1]! / v[0]!) ** (1 / v[2]!) - 1) * 100,
      2,
    ],
    [
      'Um capital dobra em # períodos. Qual é a taxa por período, em %? (duas casas decimais)',
      '(1+i)^n = 2 \\Rightarrow i = 2^{1/n} - 1',
      'i = \\left(2^{\\frac{1}{#}} - 1\\right) \\cdot 100',
      (v) => (2 ** (1 / v[0]!) - 1) * 100,
      2,
    ],
    [
      'Uma aplicação rende #% ao ano em juros compostos. Qual é a taxa SEMESTRAL equivalente, em porcentagem? (duas casas decimais)',
      '(1 + i_s)^2 = 1 + i_a',
      'i_s = \\left(\\sqrt{1 + \\frac{#}{100}} - 1\\right) \\cdot 100',
      (v) => (Math.sqrt(1 + v[0]! / 100) - 1) * 100,
      2,
    ],
    [
      'Com uma inflação de #% ao ano, qual é a perda do poder de compra em # anos, em %? (duas casas decimais)',
      'P = \\left[1 - \\frac{1}{(1+i)^n}\\right] \\cdot 100',
      'P = \\left[1 - \\frac{1}{(1 + \\frac{#}{100})^{#}}\\right] \\cdot 100',
      (v) => (1 - 1 / (1 + v[0]! / 100) ** v[1]!) * 100,
      2,
    ],
    [
      'Um empréstimo de R$ # é pago em # parcelas iguais a juros de #% ao período. Qual é o valor da parcela? (duas casas decimais)',
      'P = C \\cdot \\frac{i(1+i)^n}{(1+i)^n - 1}',
      'P = #1 \\cdot \\frac{\\frac{#3}{100}(1 + \\frac{#3}{100})^{#2}}{(1 + \\frac{#3}{100})^{#2} - 1}',
      (v) => {
        const i = v[2]! / 100;
        const n = v[1]!;
        return (v[0]! * i * (1 + i) ** n) / ((1 + i) ** n - 1);
      },
      2,
    ],
  ],
};
