import { PI, fracao, type Regra } from '@core/enunciados/models/regras-de-passos';

/**
 * As regras de geometria analítica e coordenadas.
 *
 * São fórmulas fechadas — distância, ponto médio, coeficiente angular —, e a
 * regra escreve a fórmula geral antes de pôr os números do caso.
 */

const rad = (graus: number): number => (graus * PI) / 180;
const graus = (radianos: number): number => (radianos * 180) / PI;

export const REGRAS_GEOMETRIA_ANALITICA: Readonly<Record<string, readonly Regra[]>> = {
  'ponto-e-reta': [
    [
      'Qual é a distância entre os pontos (#, #) e (#, #)? (duas casas decimais)',
      'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}',
      'd = \\sqrt{(#3334 - #4443)^2 + (#2222 - #1111)^2}',
      (v) => Math.hypot(v[2]! - v[0]!, v[3]! - v[1]!),
      2,
    ],
    [
      'Qual é a distância entre os pontos A(#, #) e B(#, #)? (duas casas decimais)',
      'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}',
      'd = \\sqrt{(#3 - #4)^2 + (#2 - #1)^2}',
      (v) => Math.hypot(v[2]! - v[0]!, v[3]! - v[1]!),
      2,
    ],
    [
      'Qual é a ordenada (coordenada y) do ponto médio do segmento que vai de A(#, #) a B(#, #)?',
      'y_m = \\frac{y_1 + y_2}{2}',
      'y_m = \\frac{# + #}{2}',
      (v) => (v[1]! + v[3]!) / 2,
    ],
    [
      'Qual é a abscissa do ponto médio do segmento que une (#, #) e (#, #)?',
      'x_m = \\frac{x_1 + x_2}{2}',
      'x_m = \\frac{# + #}{2}',
      (v) => (v[0]! + v[2]!) / 2,
    ],
    [
      'Qual é o coeficiente angular da reta que passa por A(#, #) e B(#, #)?',
      'm = \\frac{y_2 - y_1}{x_2 - x_1}',
      'm = \\frac{#4 - #2}{#3 - #1}',
      (v) => (v[3]! - v[1]!) / (v[2]! - v[0]!),
    ],
    [
      'Uma reta passa por (#, #) e (#, #). Qual é o seu coeficiente angular?',
      'm = \\frac{y_2 - y_1}{x_2 - x_1}',
      'm = \\frac{#4 - #2}{#3 - #1}',
      (v) => (v[3]! - v[1]!) / (v[2]! - v[0]!),
    ],
    [
      'A reta que passa por A(#, #) e B(#, #) tem equação y = mx + n. Qual é o valor de n?',
      'n = y_1 - m x_1',
      'n = # - \\frac{# - #}{# - #} \\cdot #',
      (v) => v[1]! - ((v[3]! - v[1]!) / (v[2]! - v[0]!)) * v[0]!,
    ],
    [
      'Qual é a distância do ponto P(#, #) à reta #x + #y + # = #? (duas casas decimais)',
      'd = \\frac{|ax_0 + by_0 + c|}{\\sqrt{a^2 + b^2}}',
      'd = \\frac{|# \\cdot # + # \\cdot # + #|}{\\sqrt{#^2 + #^2}}',
      (v) => Math.abs(v[2]! * v[0]! + v[3]! * v[1]! + v[4]!) / Math.hypot(v[2]!, v[3]!),
      2,
    ],
    [
      'Qual é a distância entre as retas paralelas y = #x + # e y = #x + #? (duas casas decimais)',
      'd = \\frac{|c_1 - c_2|}{\\sqrt{m^2 + 1}}',
      'd = \\frac{|# - #|}{\\sqrt{#^2 + 1}}',
      (v) => Math.abs(v[1]! - v[3]!) / Math.sqrt(v[0]! ** 2 + 1),
      2,
    ],
    [
      'Qual é a equação da reta que passa por P(#, #) e é PERPENDICULAR à reta de coeficiente angular #? Informe o coeficiente angular dela.',
      'm_{\\perp} = -\\frac{1}{m}',
      'm_{\\perp} = -\\frac{1}{#}',
      (v) => -1 / v[2]!,
    ],
    [
      'Uma reta tem coeficiente angular #. Qual é o coeficiente angular de uma reta perpendicular a ela? Responda como fração.',
      'm_{\\perp} = -\\frac{1}{m}',
      'm_{\\perp} = -\\frac{1}{#}',
      (v) => fracao(-1, v[0]!),
    ],
    [
      'Qual é o coeficiente linear (onde corta o eixo y) da reta que passa por A(#, #) e é perpendicular à reta de coeficiente angular #?',
      'm_{\\perp} = -\\frac{1}{m}, \\quad n = y_0 - m_{\\perp}x_0',
      'n = #2 - \\left(-\\frac{1}{#3}\\right) \\cdot #1',
      (v) => v[1]! + v[0]! / v[2]!,
    ],
    [
      'Os pontos A(#, #), B(#, #) e C(#, #) estão alinhados? Responda # se sim e # se não.',
      'A, B, C \\text{ } \\iff (x_2-x_1)(y_3-y_1) = (x_3-x_1)(y_2-y_1)',
      '(# - #)(# - #) = (# - #)(# - #)',
      (v) => ((v[2]! - v[0]!) * (v[5]! - v[1]!) === (v[4]! - v[0]!) * (v[3]! - v[1]!) ? 1 : 0),
    ],
    [
      'Qual é a área do triângulo de vértices A(#, #), B(#, #) e C(#, #)? (duas casas decimais)',
      'A = \\frac{|x_1(y_2-y_3) + x_2(y_3-y_1) + x_3(y_1-y_2)|}{2}',
      'A = \\frac{|#(# - #) + #(# - #) + #(# - #)|}{2}',
      (v) =>
        Math.abs(v[0]! * (v[3]! - v[5]!) + v[2]! * (v[5]! - v[1]!) + v[4]! * (v[1]! - v[3]!)) / 2,
      2,
    ],
    [
      'Qual é a distância do ponto P(#, #) à reta que passa por A(#, #) e B(#, #)? (duas casas decimais)',
      'd = \\frac{|(y_2-y_1)x_0 - (x_2-x_1)y_0 + x_2y_1 - y_2x_1|}{\\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}}',
      'd = \\frac{|(# - #) \\cdot # - (# - #) \\cdot # + # \\cdot # - # \\cdot #|}{\\sqrt{(# - #)^2 + (# - #)^2}}',
      (v) => {
        const numerador = Math.abs(
          (v[5]! - v[3]!) * v[0]! - (v[4]! - v[2]!) * v[1]! + v[4]! * v[3]! - v[5]! * v[2]!,
        );
        return numerador / Math.hypot(v[4]! - v[2]!, v[5]! - v[3]!);
      },
      2,
    ],
    [
      'A reta r tem coeficiente angular # e passa por P(#, #). Qual é a distância da origem (#, #) a essa reta? (duas casas decimais)',
      'd = \\frac{|y_0 - m x_0|}{\\sqrt{m^2 + 1}}',
      'd = \\frac{|# - # \\cdot #|}{\\sqrt{#^2 + 1}}',
      (v) => Math.abs(v[2]! - v[0]! * v[1]!) / Math.sqrt(v[0]! ** 2 + 1),
      2,
    ],
  ],

  circunferencia: [
    [
      'Uma circunferência tem centro em (#, #) e raio #. Qual é a abscissa do centro?',
      '(x - x_c)^2 + (y - y_c)^2 = r^2 \\Rightarrow x_c = a',
      'x_c = #',
      (v) => v[0]!,
    ],
    [
      'Qual é a ordenada (coordenada y) do centro da circunferência de equação (x − #)² + (y + #)² = #?',
      '(x - x_c)^2 + (y - y_c)^2 = r^2',
      'y_c = -#',
      (v) => -v[1]!,
    ],
    [
      'Qual é o raio da circunferência de equação (x − #)² + (y − #)² = #?',
      '(x - x_c)^2 + (y - y_c)^2 = r^2',
      'r = \\sqrt{#}',
      (v) => Math.sqrt(v[2]!),
    ],
    [
      'Uma circunferência tem centro em (#, #) e passa pelo ponto (#, #). Qual é o seu raio?',
      'r = \\sqrt{(x-x_c)^2 + (y-y_c)^2}',
      'r = \\sqrt{(#3 - #4)^2 + (#2 - #1)^2}',
      (v) => Math.hypot(v[2]! - v[0]!, v[3]! - v[1]!),
    ],
    [
      'O ponto (#, #) pertence à circunferência de centro (#, #) e raio #? Responda # se sim e # se não.',
      'd(P, C) = r ?',
      '\\sqrt{(# - #)^2 + (# - #)^2} = # ?',
      (v) => (Math.abs(Math.hypot(v[0]! - v[2]!, v[1]! - v[3]!) - v[4]!) < 1e-9 ? 1 : 0),
    ],
    [
      'Qual é a distância do centro da circunferência (x − #)² + (y − #)² = # até a origem (#, #)? (duas casas decimais)',
      'd = \\sqrt{x_c^2 + y_c^2}',
      'd = \\sqrt{#^2 + #^2}',
      (v) => Math.hypot(v[0]!, v[1]!),
      2,
    ],
    [
      'A circunferência tem equação x² + y² − #x + #y = #. Qual é a abscissa do centro dela?',
      'x^2 + y^2 - 2ax - 2by + c = 0 \\Rightarrow x_c = a',
      'x_c = \\frac{#}{2}',
      (v) => v[0]! / 2,
    ],
    [
      'A circunferência tem equação x² + y² − #x + #y = #. Qual é o raio dela?',
      'r = \\sqrt{a^2 + b^2 - c}',
      'r = \\sqrt{\\left(\\frac{#3}{2}\\right)^2 + \\left(\\frac{#2}{2}\\right)^2 - #1}',
      (v) => Math.sqrt((v[0]! / 2) ** 2 + (v[1]! / 2) ** 2 - v[2]!),
    ],
    [
      'Qual é a distância entre o ponto (#, #) e o centro de uma circunferência que fica em (#, #)?',
      'd = \\sqrt{(x-x_c)^2 + (y-y_c)^2}',
      'd = \\sqrt{(#4 - #3)^2 + (#2 - #1)^2}',
      (v) => Math.hypot(v[2]! - v[0]!, v[3]! - v[1]!),
    ],
    [
      'Qual é o comprimento da corda que a reta y = # determina na circunferência x² + y² = #? (duas casas decimais)',
      'L = 2\\sqrt{r^2 - y^2}',
      'L = 2\\sqrt{# - #^2}',
      (v) => 2 * Math.sqrt(v[1]! - v[0]! ** 2),
      2,
    ],
    [
      'Qual é a equação da reta TANGENTE à circunferência x² + y² = # no ponto (#, #)? Informe o coeficiente angular dela.',
      'm_t = -\\frac{x_0}{y_0}',
      'm_t = -\\frac{#}{#}',
      (v) => -v[1]! / v[2]!,
    ],
    [
      'Duas circunferências de raios # e # têm centros a # de distância. Quantos pontos elas têm em comum? Responda #, # ou #.',
      '|r_1 - r_2| < d < r_1 + r_2 \\Rightarrow 2',
      '# \\lessgtr # \\pm #',
      (v) => (v[2]! < v[0]! + v[1]! && v[2]! > Math.abs(v[0]! - v[1]!) ? 2 : 1),
    ],
    [
      'Uma circunferência tem centro na origem e raio #. Um ponto está a # unidades da origem. Quantas unidades separam esse ponto da circunferência?',
      's = |d - r|',
      '|# - #|',
      (v) => Math.abs(v[1]! - v[0]!),
    ],
    [
      'Qual é a área do círculo de equação x² + y² − #x − #y + # = #? (duas casas decimais)',
      'A = \\pi r^2,\\ r^2 = a^2 + b^2 - c',
      'A = \\pi\\left(\\left(\\frac{#}{2}\\right)^2 + \\left(\\frac{#}{2}\\right)^2 - #\\right)',
      (v) => PI * ((v[0]! / 2) ** 2 + (v[1]! / 2) ** 2 - v[2]!),
      2,
    ],
    [
      'Qual é a distância máxima de um ponto da circunferência x² + y² = # ao ponto (#, #)? (duas casas decimais)',
      'd_{max} = \\sqrt{x_0^2 + y_0^2} + r',
      'd_{max} = \\sqrt{#3^2 + #2^2} + \\sqrt{#1}',
      (v) => Math.hypot(v[1]!, v[2]!) + Math.sqrt(v[0]!),
      2,
    ],
    [
      'Qual é o comprimento da corda comum às circunferências x² + y² = # e (x − #)² + y² = #? (duas casas decimais)',
      'L = 2\\sqrt{r_1^2 - x^2},\\ x = \\frac{r_1^2 - r_2^2 + d^2}{2d}',
      'L = 2\\sqrt{# - \\left(\\frac{# - # + #^2}{2 \\cdot #}\\right)^2}',
      (v) => {
        const x = (v[0]! - v[2]! + v[1]! ** 2) / (2 * v[1]!);
        return 2 * Math.sqrt(v[0]! - x * x);
      },
      2,
    ],
  ],

  conicas: [
    [
      'Uma elipse tem semieixo maior # e semieixo menor #. Qual é a distância focal c?',
      'c^2 = a^2 - b^2',
      'c = \\sqrt{#^2 - #^2}',
      (v) => Math.sqrt(v[0]! ** 2 - v[1]! ** 2),
    ],
    [
      'Uma elipse tem semieixo maior # e distância focal #. Qual é o semieixo menor?',
      'b^2 = a^2 - c^2',
      'b = \\sqrt{#^2 - #^2}',
      (v) => Math.sqrt(v[0]! ** 2 - v[1]! ** 2),
    ],
    [
      'Uma hipérbole tem semieixo real # e semieixo imaginário #. Qual é a distância focal c?',
      'c^2 = a^2 + b^2',
      'c = \\sqrt{#^2 + #^2}',
      (v) => Math.sqrt(v[0]! ** 2 + v[1]! ** 2),
    ],
    [
      'Uma hipérbole tem semieixo real # e semieixo imaginário #. Qual é a distância focal c? (duas casas decimais)',
      'c^2 = a^2 + b^2',
      'c = \\sqrt{#^2 + #^2}',
      (v) => Math.sqrt(v[0]! ** 2 + v[1]! ** 2),
      2,
    ],
    [
      'Uma elipse tem semieixo maior #. Qual é a excentricidade dela, sabendo que a distância focal é #? (duas casas decimais)',
      'e = \\frac{c}{a}',
      'e = \\frac{#2222}{#1111}',
      (v) => v[1]! / v[0]!,
      2,
    ],
    [
      'Uma elipse tem semieixo maior # e semieixo menor #. Qual é a sua excentricidade?',
      'e = \\frac{\\sqrt{a^2 - b^2}}{a}',
      'e = \\frac{\\sqrt{#^2 - #^2}}{#}',
      (v) => Math.sqrt(v[0]! ** 2 - v[1]! ** 2) / v[0]!,
    ],
    [
      'Uma elipse tem focos em (#, #) e (−#, #) e semieixo maior #. Qual é o semieixo menor b? (duas casas decimais)',
      'b = \\sqrt{a^2 - c^2}',
      'b = \\sqrt{#^2 - #^2}',
      (v) => Math.sqrt(v[1]! ** 2 - v[0]! ** 2),
      2,
    ],
    [
      'Uma elipse tem excentricidade # e semieixo maior #. Qual é a distância entre os dois focos? (duas casas decimais)',
      '2c = 2ea',
      '2c = 2 \\cdot # \\cdot #',
      (v) => 2 * v[0]! * v[1]!,
      2,
    ],
    [
      'Uma elipse tem equação x²/# + y²/# = #. Qual é o semieixo MAIOR?',
      '\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1 \\Rightarrow a = \\sqrt{\\max(a^2, b^2)}',
      'a = \\sqrt{\\max(#, #)}',
      (v) => Math.sqrt(Math.max(v[0]!, v[1]!)),
    ],
    [
      'Uma hipérbole tem equação x²/# − y²/# = #. Qual é a excentricidade dela? (duas casas decimais)',
      'e = \\frac{\\sqrt{a^2 + b^2}}{a}',
      'e = \\frac{\\sqrt{# + #}}{\\sqrt{#}}',
      (v) => Math.sqrt(v[0]! + v[1]!) / Math.sqrt(v[0]!),
      2,
    ],
    [
      'A hipérbole x²/# − y²/# = # tem assíntotas y = ±kx. Qual é o valor de k? (duas casas decimais)',
      'k = \\frac{b}{a}',
      'k = \\sqrt{\\frac{#2222}{#1111}}',
      (v) => Math.sqrt(v[1]! / v[0]!),
      2,
    ],
    [
      'Uma hipérbole equilátera tem semieixo real #. Qual é a excentricidade dela? (duas casas decimais)',
      'e = \\sqrt{2}',
      'e = \\frac{\\sqrt{#^2 + #^2}}{#}',
      (v) => Math.sqrt(v[0]! ** 2 + v[0]! ** 2) / v[0]!,
      2,
    ],
    [
      'Uma parábola tem equação y² = #x. Qual é o parâmetro p dela? (duas casas decimais)',
      'y^2 = 4px \\Rightarrow p = \\frac{c}{4}',
      'p = \\frac{#}{4}',
      (v) => v[0]! / 4,
      2,
    ],
    [
      'A parábola y² = #x tem foco em (f, #). Qual é a distância do vértice ao foco? (duas casas decimais)',
      'f = p = \\frac{c}{4}',
      'f = \\frac{#}{4}',
      (v) => v[0]! / 4,
      2,
    ],
    [
      'Uma parábola tem foco em (#, #) e diretriz x = −#. Qual é o parâmetro p dela? (duas casas decimais)',
      'p = x_{foco} - x_{diretriz}',
      'p = # - (-#)',
      (v) => v[0]! - -v[0]!,
      2,
    ],
  ],

  'coordenadas-polares': [
    [
      'Qual é a distância r, da origem até o ponto (#, #), que é a coordenada polar r?',
      'r = \\sqrt{x^2 + y^2}',
      'r = \\sqrt{#^2 + #^2}',
      (v) => Math.hypot(v[0]!, v[1]!),
    ],
    [
      'Qual é a distância r do ponto (#, #) até a origem?',
      'r = \\sqrt{x^2 + y^2}',
      'r = \\sqrt{#^2 + #^2}',
      (v) => Math.hypot(v[0]!, v[1]!),
    ],
    [
      'O ponto tem coordenadas polares (r, θ) = (#, #°). Qual é a coordenada x dele? (duas casas decimais)',
      'x = r\\cos\\theta',
      'x = # \\cdot \\cos #^\\circ',
      (v) => v[0]! * Math.cos(rad(v[1]!)),
      2,
    ],
    [
      'Um ponto tem coordenadas polares r igual a # e ângulo #°. Qual é a sua coordenada x?',
      'x = r\\cos\\theta',
      'x = # \\cdot \\cos #^\\circ',
      (v) => v[0]! * Math.cos(rad(v[1]!)),
    ],
    [
      'O ponto tem coordenadas polares (r, θ) = (#, #°). Qual é a coordenada y dele? (duas casas decimais)',
      'y = r\\sin\\theta',
      'y = # \\cdot \\sin #^\\circ',
      (v) => v[0]! * Math.sin(rad(v[1]!)),
      2,
    ],
    [
      'Qual é o ângulo polar θ do ponto (#, #), em graus, com #° ≤ θ < #°?',
      '\\theta = \\operatorname{atan2}(y, x)',
      '\\theta = \\arctan\\left(\\frac{#}{#}\\right)',
      (v) => {
        const angulo = graus(Math.atan2(v[1]!, v[0]!));
        return ((angulo % 360) + 360) % 360;
      },
    ],
    [
      'Um ponto está sobre o eixo y positivo, a # unidades da origem. Qual é o seu ângulo polar, em graus?',
      '\\theta = 90^\\circ',
      '(0, #)',
      () => 90,
    ],
    [
      'Qual é a distância entre os pontos polares (#, #°) e (#, #°)? (duas casas decimais)',
      'd = \\sqrt{r_1^2 + r_2^2 - 2r_1r_2\\cos(\\theta_2-\\theta_1)}',
      'd = \\sqrt{#^2 + #^2 - 2 \\cdot # \\cdot # \\cos(# - #)^\\circ}',
      (v) => Math.sqrt(v[0]! ** 2 + v[2]! ** 2 - 2 * v[0]! * v[2]! * Math.cos(rad(v[3]! - v[1]!))),
      2,
    ],
    [
      'Qual é a distância entre os pontos de coordenadas polares (#, #°) e (#, #°)? (duas casas decimais)',
      'd = \\sqrt{r_1^2 + r_2^2 - 2r_1r_2\\cos(\\theta_2-\\theta_1)}',
      'd = \\sqrt{#^2 + #^2 - 2 \\cdot # \\cdot # \\cos(# - #)^\\circ}',
      (v) => Math.sqrt(v[0]! ** 2 + v[2]! ** 2 - 2 * v[0]! * v[2]! * Math.cos(rad(v[3]! - v[1]!))),
      2,
    ],
    [
      'A curva polar r = #cos θ é uma circunferência. Qual é o diâmetro dela?',
      'r = D\\cos\\theta \\Rightarrow D = c',
      'D = #',
      (v) => v[0]!,
    ],
    [
      'Qual é a área da região limitada pela curva polar r = # (uma circunferência)? (duas casas decimais)',
      'A = \\pi r^2',
      'A = \\pi \\cdot #^2',
      (v) => PI * v[0]! ** 2,
      2,
    ],
    [
      'A curva polar r = # + #cos θ é uma limaçon. Qual é o valor MÁXIMO de r?',
      'r_{max} = a + b',
      'r_{max} = # + #',
      (v) => v[0]! + v[1]!,
    ],
    [
      'A curva polar r = # + #cos θ é uma limaçon. Quantas vezes ela passa pela origem?',
      'r = 0 \\Rightarrow \\cos\\theta = -\\frac{a}{b}',
      'r = 0 \\Rightarrow n_0',
      (v) => (Math.abs(v[0]!) === Math.abs(v[1]!) ? 1 : Math.abs(v[0]!) < Math.abs(v[1]!) ? 2 : 0),
    ],
    [
      'A curva polar r² = #cos #θ é uma lemniscata. Qual é o valor MÁXIMO de r? (duas casas decimais)',
      'r_{max} = \\sqrt{a}',
      'r_{max} = \\sqrt{#}',
      (v) => Math.sqrt(v[0]!),
      2,
    ],
    [
      'Um satélite descreve r = #/(# + #cos θ), em milhares de km. Qual é a distância no PERIÉLIO? (duas casas decimais)',
      'r_{peri} = \\frac{p}{1 + e}',
      'r_{peri} = \\frac{#}{# + #}',
      (v) => v[0]! / (v[1]! + v[2]!),
      2,
    ],
  ],
};
