import { PI, type Regra } from '@core/enunciados/models/regras-de-passos';

/**
 * As regras de vetores, retas e planos, e coordenadas no espaço.
 */

const rad = (graus: number): number => (graus * PI) / 180;
const graus = (radianos: number): number => (radianos * 180) / PI;

/** O ângulo entre dois vetores, em graus. */
function anguloEntre(
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
): number {
  const escalar = ax * bx + ay * by + az * bz;
  const norma = Math.hypot(ax, ay, az) * Math.hypot(bx, by, bz);
  return graus(Math.acos(Math.max(-1, Math.min(1, escalar / norma))));
}

export const REGRAS_VETORES: Readonly<Record<string, readonly Regra[]>> = {
  'vetores-no-plano': [
    [
      'Qual é o módulo do vetor (#, #)? (duas casas decimais)',
      '|v| = \\sqrt{x^2 + y^2}',
      '|v| = \\sqrt{#^2 + #^2}',
      (v) => Math.hypot(v[0]!, v[1]!),
      2,
    ],
    [
      'Somando os vetores (#, #) e (#, #), qual é a componente x do resultado?',
      '(a_x + b_x,\\ a_y + b_y)',
      'x = #1 + #3',
      (v) => v[0]! + v[2]!,
    ],
    [
      'Um barco é empurrado # km para o leste e # km para o norte. Qual é a distância em linha reta até o ponto de partida, em km? (duas casas decimais)',
      'd = \\sqrt{x^2 + y^2}',
      'd = \\sqrt{#^2 + #^2}',
      (v) => Math.hypot(v[0]!, v[1]!),
      2,
    ],
    [
      'Um avião voa a # km/h numa direção que forma #° com o leste. Qual é a componente para o leste, em km/h? (duas casas decimais)',
      'v_x = v\\cos\\theta',
      'v_x = # \\cdot \\cos #^\\circ',
      (v) => v[0]! * Math.cos(rad(v[1]!)),
      2,
    ],
    [
      'Um vetor de módulo # forma #° com o eixo x. Qual é a componente y dele? (duas casas decimais)',
      'v_y = v\\sin\\theta',
      'v_y = # \\cdot \\sin #^\\circ',
      (v) => v[0]! * Math.sin(rad(v[1]!)),
      2,
    ],
    [
      'Qual é o ângulo que o vetor (#, #) forma com o eixo x positivo, em graus? (duas casas decimais)',
      '\\theta = \\arctan\\frac{y}{x}',
      '\\theta = \\arctan\\left(\\frac{#}{#}\\right)',
      (v) => {
        const angulo = graus(Math.atan2(v[1]!, v[0]!));
        return ((angulo % 360) + 360) % 360;
      },
      2,
    ],
    [
      'Um deslocamento tem # km para o leste e # km para o norte. Que ângulo ele forma com o leste, em graus, no sentido anti-horário? (duas casas decimais)',
      '\\theta = \\arctan\\frac{N}{L}',
      '\\theta = \\arctan\\left(\\frac{#}{#}\\right)',
      (v) => graus(Math.atan2(v[1]!, v[0]!)),
      2,
    ],
    [
      'Qual é o módulo do vetor diferença entre (#, #) e (#, #)? (duas casas decimais)',
      '|a - b| = \\sqrt{(a_x-b_x)^2 + (a_y-b_y)^2}',
      '|a - b| = \\sqrt{(#4444 - #2221)^2 + (#1112 - #3333)^2}',
      (v) => Math.hypot(v[0]! - v[2]!, v[1]! - v[3]!),
      2,
    ],
    [
      'Qual é a componente x do vetor unitário na direção de (#, #)? (duas casas decimais)',
      '\\hat{u}_x = \\frac{x}{\\sqrt{x^2 + y^2}}',
      '\\hat{u}_x = \\frac{#1}{\\sqrt{#1^2 + #2^2}}',
      (v) => v[0]! / Math.hypot(v[0]!, v[1]!),
      2,
    ],
    [
      'Duas forças agem no mesmo ponto: uma de # N para o leste e outra de # N para o norte. Qual é o módulo da força resultante, em newtons? (duas casas decimais)',
      'F = \\sqrt{F_1^2 + F_2^2}',
      'F = \\sqrt{#^2 + #^2}',
      (v) => Math.hypot(v[0]!, v[1]!),
      2,
    ],
    [
      'Qual é a área do paralelogramo formado pelos vetores (#, #) e (#, #)? (duas casas decimais)',
      'A = |x_1y_2 - x_2y_1|',
      'A = |# \\cdot # - # \\cdot #|',
      (v) => Math.abs(v[0]! * v[3]! - v[2]! * v[1]!),
      2,
    ],
    [
      'Uma força de módulo # N atua na direção do vetor (#, #) e o deslocamento é (#, #) m. Qual é o trabalho realizado, em joules? (duas casas decimais)',
      'W = F \\frac{\\vec{u}\\cdot\\vec{d}}{|\\vec{u}|}',
      'W = # \\cdot \\frac{#4 \\cdot #2 + #3 \\cdot #1}{\\sqrt{#^2 + #^2}}',
      (v) => v[0]! * ((v[1]! * v[3]! + v[2]! * v[4]!) / Math.hypot(v[1]!, v[2]!)),
      2,
    ],
  ],

  'produto-escalar-vetorial': [
    [
      'Uma força de # N é aplicada na mesma direção de um deslocamento de # m. Qual é o trabalho realizado, em joules? (duas casas decimais)',
      'W = F \\cdot d\\cos 0^\\circ',
      'W = # \\cdot #',
      (v) => v[0]! * v[1]!,
      2,
    ],
    [
      'Uma força de # N é aplicada perpendicularmente a um deslocamento de # m. Qual é o trabalho realizado, em joules? (duas casas decimais)',
      'W = F d\\cos 90^\\circ = 0',
      'W = # \\cdot # \\cdot \\cos 90^\\circ',
      () => 0,
      2,
    ],
    [
      'Uma força de # N é aplicada a #° do deslocamento, que vale # m. Qual é o trabalho realizado, em joules? (duas casas decimais)',
      'W = F d\\cos\\theta',
      'W = # \\cdot # \\cdot \\cos #^\\circ',
      (v) => v[0]! * v[2]! * Math.cos(rad(v[1]!)),
      2,
    ],
    [
      'Qual é o produto escalar de (#, #) por (#, #)?',
      '\\vec{a}\\cdot\\vec{b} = a_xb_x + a_yb_y',
      '#4 \\cdot #2 + #3 \\cdot #1',
      (v) => v[0]! * v[2]! + v[1]! * v[3]!,
    ],
    [
      'Qual é o produto escalar dos vetores (#, #) e (#, #)?',
      '\\vec{a}\\cdot\\vec{b} = a_xb_x + a_yb_y',
      '#4 \\cdot #2 + #3 \\cdot #1',
      (v) => v[0]! * v[2]! + v[1]! * v[3]!,
    ],
    [
      'Qual é o ângulo entre (#, #) e (#, #)? (em graus, duas casas decimais)',
      '\\cos\\theta = \\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{a}||\\vec{b}|}',
      '\\theta = \\arccos\\left(\\frac{#1 \\cdot #3 + #2 \\cdot #4}{\\sqrt{#1^2 + #2^2}\\sqrt{#3^2 + #4^2}}\\right)',
      (v) => anguloEntre(v[0]!, v[1]!, 0, v[2]!, v[3]!, 0),
      2,
    ],
    [
      'Qual é o ângulo entre os vetores (#, #) e (#, #), em graus? (duas casas decimais)',
      '\\cos\\theta = \\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{a}||\\vec{b}|}',
      '\\theta = \\arccos\\left(\\frac{#1 \\cdot #3 + #2 \\cdot #4}{\\sqrt{#1^2 + #2^2}\\sqrt{#3^2 + #4^2}}\\right)',
      (v) => anguloEntre(v[0]!, v[1]!, 0, v[2]!, v[3]!, 0),
      2,
    ],
    [
      'Qual é a projeção de (#, #) sobre a direção de (#, #)? (duas casas decimais)',
      'proj = \\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{b}|}',
      'proj = \\frac{#1 \\cdot #3 + #2 \\cdot #4}{\\sqrt{#3^2 + #4^2}}',
      (v) => (v[0]! * v[2]! + v[1]! * v[3]!) / Math.hypot(v[2]!, v[3]!),
      2,
    ],
    [
      'Qual é a área do paralelogramo formado por (#, #) e (#, #)? (duas casas decimais)',
      'A = |x_1y_2 - x_2y_1|',
      'A = |# \\cdot # - # \\cdot #|',
      (v) => Math.abs(v[0]! * v[3]! - v[2]! * v[1]!),
      2,
    ],
    [
      'Um terreno em forma de paralelogramo é definido por dois deslocamentos: um de (#, #) e outro de (#, #), em metros. Qual é a área, em metros quadrados? (duas casas decimais)',
      'A = |x_1y_2 - x_2y_1|',
      'A = |# \\cdot # - # \\cdot #|',
      (v) => Math.abs(v[0]! * v[3]! - v[2]! * v[1]!),
      2,
    ],
    [
      'Os vetores (#, #) e (#, #) são perpendiculares? Responda # se sim e # se não.',
      '\\vec{a}\\cdot\\vec{b} = 0',
      '# \\cdot # + # \\cdot # = 0\\,?',
      (v) => (v[0]! * v[2]! + v[1]! * v[3]! === 0 ? 1 : 0),
    ],
  ],

  'vetores-no-espaco': [
    [
      'Qual é o produto escalar dos vetores (#, #, #) e (#, #, #)?',
      '\\vec{a}\\cdot\\vec{b} = a_xb_x + a_yb_y + a_zb_z',
      '#1 \\cdot #4 + #2 \\cdot #5 + #3 \\cdot #6',
      (v) => v[0]! * v[3]! + v[1]! * v[4]! + v[2]! * v[5]!,
    ],
    [
      'Calcule o produto escalar entre o deslocamento (#, #, #) e a força (#, #, #).',
      '\\vec{a}\\cdot\\vec{b} = a_xb_x + a_yb_y + a_zb_z',
      '#1 \\cdot #4 + #2 \\cdot #5 + #3 \\cdot #6',
      (v) => v[0]! * v[3]! + v[1]! * v[4]! + v[2]! * v[5]!,
    ],
    [
      'Qual é o módulo do vetor (#, #, #)? (duas casas decimais)',
      '|v| = \\sqrt{x^2 + y^2 + z^2}',
      '|v| = \\sqrt{#^2 + #^2 + #^2}',
      (v) => Math.hypot(v[0]!, v[1]!, v[2]!),
      2,
    ],
    [
      'Qual é o módulo do vetor de componentes (#, #, #)?',
      '|v| = \\sqrt{x^2 + y^2 + z^2}',
      '|v| = \\sqrt{#^2 + #^2 + #^2}',
      (v) => Math.hypot(v[0]!, v[1]!, v[2]!),
    ],
    [
      'Qual é a componente z do produto vetorial a × b, com a = (#, #, #) e b = (#, #, #)?',
      '(a\\times b)_z = a_xb_y - a_yb_x',
      '#1 \\cdot #5 - #2 \\cdot #4',
      (v) => v[0]! * v[4]! - v[1]! * v[3]!,
    ],
    [
      'Qual é a componente y do produto vetorial a × b, com a = (#, #, #) e b = (#, #, #)?',
      '(a\\times b)_y = a_zb_x - a_xb_z',
      '#3 \\cdot #4 - #1 \\cdot #6',
      (v) => v[2]! * v[3]! - v[0]! * v[5]!,
    ],
    [
      'Qual é o ângulo entre os vetores (#, #, #) e (#, #, #), em graus? Arredonde para duas casas decimais.',
      '\\cos\\theta = \\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{a}||\\vec{b}|}',
      '\\theta = \\arccos\\left(\\frac{#1 \\cdot #4 + #2 \\cdot #5 + #3 \\cdot #6}{\\sqrt{#1^2+#2^2+#3^2}\\sqrt{#4^2+#5^2+#6^2}}\\right)',
      (v) => anguloEntre(v[0]!, v[1]!, v[2]!, v[3]!, v[4]!, v[5]!),
      2,
    ],
    [
      'Qual é o ângulo, em graus, entre os vetores (#, #, #) e (#, #, #)? (duas casas decimais)',
      '\\cos\\theta = \\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{a}||\\vec{b}|}',
      '\\theta = \\arccos\\left(\\frac{#1 \\cdot #4 + #2 \\cdot #5 + #3 \\cdot #6}{\\sqrt{#1^2+#2^2+#3^2}\\sqrt{#4^2+#5^2+#6^2}}\\right)',
      (v) => anguloEntre(v[0]!, v[1]!, v[2]!, v[3]!, v[4]!, v[5]!),
      2,
    ],
    [
      'Qual é o volume do paralelepípedo formado pelos vetores (#, #, #), (#, #, #) e (#, #, #)? (duas casas decimais)',
      'V = |\\vec{a}\\cdot(\\vec{b}\\times\\vec{c})|',
      'V = \\left|\\det\\begin{pmatrix}# & # & #\\\\ # & # & #\\\\ # & # & #\\end{pmatrix}\\right|',
      (v) =>
        Math.abs(
          v[0]! * (v[4]! * v[8]! - v[5]! * v[7]!) -
            v[1]! * (v[3]! * v[8]! - v[5]! * v[6]!) +
            v[2]! * (v[3]! * v[7]! - v[4]! * v[6]!),
        ),
      2,
    ],
    [
      'Dois vetores têm produto escalar igual a zero: (#, #, #) e (#, #, k). Qual é o valor de k?',
      'k = -\\frac{a_xb_x + a_yb_y}{a_z}',
      'k = -\\frac{#5 \\cdot #3 + #2 \\cdot #1}{#4}',
      (v) => -(v[0]! * v[3]! + v[1]! * v[4]!) / v[2]!,
    ],
    [
      'Qual é a distância entre os pontos (#, #, #) e (#, #, #)? (duas casas decimais)',
      'd = \\sqrt{\\Delta x^2 + \\Delta y^2 + \\Delta z^2}',
      'd = \\sqrt{(#4 - #1)^2 + (#5 - #2)^2 + (#6 - #3)^2}',
      (v) => Math.hypot(v[3]! - v[0]!, v[4]! - v[1]!, v[5]! - v[2]!),
      2,
    ],
    [
      'Qual é a componente x do vetor unitário na direção de (#, #, #)? Arredonde para duas casas decimais.',
      '\\hat{u}_x = \\frac{x}{\\sqrt{x^2+y^2+z^2}}',
      '\\hat{u}_x = \\frac{#1}{\\sqrt{#1^2 + #2^2 + #3^2}}',
      (v) => v[0]! / Math.hypot(v[0]!, v[1]!, v[2]!),
      2,
    ],
  ],

  'retas-e-planos': [
    [
      'Um plano passa pelo ponto (#, #, #) e tem vetor normal (#, #, #). Escrito na forma ax mais by mais cz igual a d, quanto vale d?',
      'd = ax_0 + by_0 + cz_0',
      'd = #4 \\cdot #1 + #5 \\cdot #2 + #6 \\cdot #3',
      (v) => v[3]! * v[0]! + v[4]! * v[1]! + v[5]! * v[2]!,
    ],
    [
      'O plano passa por P(#, #, #) e tem vetor normal n = (#, #, #). Escrito como ax + by + cz = d, quanto vale d?',
      'd = ax_0 + by_0 + cz_0',
      'd = #4 \\cdot #1 + #5 \\cdot #2 + #6 \\cdot #3',
      (v) => v[3]! * v[0]! + v[4]! * v[1]! + v[5]! * v[2]!,
    ],
    [
      'Qual é a coordenada x da combinação linear w = #u + #v?',
      'w_x = a u_x + b v_x',
      'w_x = #3 \\cdot #1 + #2 \\cdot #',
      (v) => v[0]! * v[1]! + v[2]! * v[3]!,
    ],
    [
      'Qual é a coordenada y da combinação linear w = #u + #v?',
      'w_y = a u_y + b v_y',
      'w_y = # \\cdot # + # \\cdot #',
      (v) => v[0]! * v[2]! + v[1]! * v[3]!,
    ],
    [
      'Qual é a coordenada z da combinação linear w = #u + #v?',
      'w_z = a u_z + b v_z',
      'w_z = # \\cdot # + # \\cdot #',
      (v) => v[0]! * v[3]! + v[1]! * v[4]!,
    ],
    [
      'Uma reta passa pelos pontos (#, #, #) e (#, #, #). Qual é a componente z do vetor diretor obtido subtraindo o primeiro ponto do segundo?',
      '\\vec{d} = B - A',
      'd_z = # - #',
      (v) => v[5]! - v[2]!,
    ],
    [
      'Qual é a distância do ponto P(#, #, #) ao plano #x + #y + #z = #? (duas casas decimais)',
      'd = \\frac{|ax_0 + by_0 + cz_0 - d|}{\\sqrt{a^2 + b^2 + c^2}}',
      'd = \\frac{|#4 \\cdot #1 + #5 \\cdot #2 + #6 \\cdot #3 - #7|}{\\sqrt{#4^2 + #5^2 + #6^2}}',
      (v) =>
        Math.abs(v[3]! * v[0]! + v[4]! * v[1]! + v[5]! * v[2]! - v[6]!) /
        Math.hypot(v[3]!, v[4]!, v[5]!),
      2,
    ],
    [
      'Qual é o ângulo entre o vetor n = (#, #, #) e o vetor m = (#, #, #), em graus? (duas casas decimais)',
      '\\cos\\theta = \\frac{\\vec{n}\\cdot\\vec{m}}{|\\vec{n}||\\vec{m}|}',
      '\\theta = \\arccos\\left(\\frac{#1 \\cdot #4 + #2 \\cdot #5 + #3 \\cdot #6}{\\sqrt{#1^2+#2^2+#3^2}\\sqrt{#4^2+#5^2+#6^2}}\\right)',
      (v) => anguloEntre(v[0]!, v[1]!, v[2]!, v[3]!, v[4]!, v[5]!),
      2,
    ],
    [
      'Dois planos têm vetores normais (#, #, #) e (#, #, #). Qual é o ângulo agudo entre eles, em graus? (duas casas decimais)',
      '\\cos\\theta = \\frac{|\\vec{n}_1\\cdot\\vec{n}_2|}{|\\vec{n}_1||\\vec{n}_2|}',
      '\\theta = \\arccos\\left(\\frac{#1 \\cdot #4 + #2 \\cdot #5 + #3 \\cdot #6}{\\sqrt{#1^2+#2^2+#3^2}\\sqrt{#4^2+#5^2+#6^2}}\\right)',
      (v) => {
        const angulo = anguloEntre(v[0]!, v[1]!, v[2]!, v[3]!, v[4]!, v[5]!);
        return Math.min(angulo, 180 - angulo);
      },
      2,
    ],
    [
      'Um plano tem vetor normal (#, #, #) e uma reta tem vetor diretor (#, #, k). Para que valor de k a reta é paralela ao plano, ou seja, o produto escalar é zero?',
      'k = -\\frac{n_xd_x + n_yd_y}{n_z}',
      'k = -\\frac{#5 \\cdot #4 + #2 \\cdot #1}{#3}',
      (v) => -(v[0]! * v[3]! + v[1]! * v[4]!) / v[2]!,
    ],
  ],

  'coordenadas-no-espaco': [
    [
      'Um ponto tem coordenadas cilíndricas r igual a #, ângulo #° e altura #. Qual é a sua coordenada z cartesiana?',
      'z = z',
      'z = #',
      (v) => v[2]!,
    ],
    [
      'Um ponto tem coordenadas cilíndricas r = #, θ = #° e z = #. Qual é a coordenada x cartesiana? (duas casas decimais)',
      'x = r\\cos\\theta',
      'x = # \\cdot \\cos #^\\circ',
      (v) => v[0]! * Math.cos(rad(v[1]!)),
      2,
    ],
    [
      'Um ponto tem coordenadas cilíndricas r = #, θ = #° e z = #. Qual é a coordenada y cartesiana? (duas casas decimais)',
      'y = r\\sin\\theta',
      'y = # \\cdot \\sin #^\\circ',
      (v) => v[0]! * Math.sin(rad(v[1]!)),
      2,
    ],
    [
      'Um ponto tem coordenadas cilíndricas r igual a # e ângulo #°. Qual é a sua coordenada x cartesiana?',
      'x = r\\cos\\theta',
      'x = # \\cdot \\cos #^\\circ',
      (v) => v[0]! * Math.cos(rad(v[1]!)),
    ],
    [
      'Um ponto tem coordenadas cartesianas (#, #, #). Qual é o raio ρ em coordenadas esféricas? (duas casas decimais)',
      '\\rho = \\sqrt{x^2 + y^2 + z^2}',
      '\\rho = \\sqrt{#^2 + #^2 + #^2}',
      (v) => Math.hypot(v[0]!, v[1]!, v[2]!),
      2,
    ],
    [
      'Um ponto está a #, # e # nos eixos cartesianos. Qual é a sua distância até a origem, que é a coordenada esférica rô?',
      '\\rho = \\sqrt{x^2 + y^2 + z^2}',
      '\\rho = \\sqrt{#^2 + #^2 + #^2}',
      (v) => Math.hypot(v[0]!, v[1]!, v[2]!),
    ],
    [
      'Um ponto tem coordenadas esféricas ρ = #, φ = #° (do eixo z) e θ = #°. Qual é a coordenada x cartesiana? (duas casas decimais)',
      'x = \\rho\\sin\\varphi\\cos\\theta',
      'x = # \\cdot \\sin #^\\circ \\cdot \\cos #^\\circ',
      (v) => v[0]! * Math.sin(rad(v[1]!)) * Math.cos(rad(v[2]!)),
      2,
    ],
    [
      'Um ponto tem coordenadas esféricas ρ = #, φ = #° (do eixo z) e θ = #°. Qual é a coordenada y cartesiana? (duas casas decimais)',
      'y = \\rho\\sin\\varphi\\sin\\theta',
      'y = # \\cdot \\sin #^\\circ \\cdot \\sin #^\\circ',
      (v) => v[0]! * Math.sin(rad(v[1]!)) * Math.sin(rad(v[2]!)),
      2,
    ],
    [
      'Um ponto tem coordenadas esféricas ρ = #, φ = #° (do eixo z) e θ = #°. Qual é a coordenada z cartesiana? (duas casas decimais)',
      'z = \\rho\\cos\\varphi',
      'z = # \\cdot \\cos #^\\circ',
      (v) => v[0]! * Math.cos(rad(v[1]!)),
      2,
    ],
    [
      'Um ponto tem coordenada esférica rô igual a # e está sobre o eixo z positivo. Qual é a sua coordenada z cartesiana?',
      'z = \\rho',
      'z = #',
      (v) => v[0]!,
    ],
    [
      'Converta o ponto (#, #, #) para coordenadas cilíndricas e informe o raio r. (duas casas decimais)',
      'r = \\sqrt{x^2 + y^2}',
      'r = \\sqrt{#^2 + #^2}',
      (v) => Math.hypot(v[0]!, v[1]!),
      2,
    ],
  ],

  'equacoes-parametricas': [
    [
      'Um móvel segue x(t) = #t e y(t) = #t. Qual é a coordenada x no instante t = #?',
      'x(t) = v_x t',
      'x = # \\cdot #',
      (v) => v[0]! * v[2]!,
    ],
    [
      'Um móvel segue x(t) = #t e y(t) = #t. Qual é a coordenada y no instante t = #?',
      'y(t) = v_y t',
      'y = # \\cdot #',
      (v) => v[1]! * v[2]!,
    ],
    [
      'Um ponto se move com x igual a # vezes o tempo e y igual a # vezes o tempo. Qual é a coordenada y quando o tempo vale #?',
      'y(t) = v_y t',
      'y = # \\cdot #',
      (v) => v[1]! * v[2]!,
    ],
    [
      'Um móvel segue x(t) = #t + #. Qual é a coordenada x no instante t = #?',
      'x(t) = v t + x_0',
      'x = #3 \\cdot #1 + #2',
      (v) => v[0]! * v[2]! + v[1]!,
    ],
    [
      'Um ponto percorre uma circunferência de raio # centrada na origem. Qual é a coordenada x quando o parâmetro angular vale #°?',
      'x = r\\cos\\theta',
      'x = # \\cdot \\cos #^\\circ',
      (v) => v[0]! * Math.cos(rad(v[1]!)),
    ],
    [
      'Um móvel segue x(t) = #t e y(t) = #t. Qual é a velocidade escalar dele, em unidades por segundo? (duas casas decimais)',
      'v = \\sqrt{v_x^2 + v_y^2}',
      'v = \\sqrt{#^2 + #^2}',
      (v) => Math.hypot(v[0]!, v[1]!),
      2,
    ],
    [
      'Um móvel segue x(t) = #t e y(t) = #t. Eliminando t, qual é a coordenada y quando x = #?',
      'y = \\frac{v_y}{v_x}x',
      'y = \\frac{#2}{#1} \\cdot #3',
      (v) => (v[1]! / v[0]!) * v[2]!,
    ],
    [
      'Um móvel segue x(t) = t² e y(t) = #t. Qual é a coordenada y no instante em que x = #? (duas casas decimais)',
      't = \\sqrt{x},\\ y = v_y t',
      'y = # \\cdot \\sqrt{#}',
      (v) => v[0]! * Math.sqrt(v[1]!),
      2,
    ],
    [
      'Um projétil parte com velocidade horizontal # m/s e velocidade vertical # m/s. Em quantos segundos ele volta à altura de partida, com a gravidade valendo # m/s²?',
      't = \\frac{2v_y}{g}',
      't = \\frac{2 \\cdot #}{#}',
      (v) => (2 * v[1]!) / v[2]!,
    ],
    [
      'Um projétil parte com velocidade horizontal # m/s e velocidade vertical # m/s, com a gravidade valendo # m/s². Qual é o alcance horizontal, em metros, quando ele volta à altura de partida?',
      'A = v_x \\cdot \\frac{2v_y}{g}',
      'A = # \\cdot \\frac{2 \\cdot #}{#}',
      (v) => (v[0]! * 2 * v[1]!) / v[2]!,
    ],
    [
      'Um projétil segue x(t) = #t e y(t) = #t − #t². Qual é a altura máxima atingida? (duas casas decimais)',
      'y_{max} = \\frac{v_y^2}{4k}',
      'y_{max} = \\frac{#^2}{4 \\cdot #}',
      (v) => v[1]! ** 2 / (4 * v[2]!),
      2,
    ],
    [
      'Um projétil segue x(t) = #t e y(t) = # − #t². Em que instante ele atinge o solo? (duas casas decimais)',
      'y = 0 \\Rightarrow t = \\sqrt{\\frac{y_0}{k}}',
      't = \\sqrt{\\frac{#}{#}}',
      (v) => Math.sqrt(v[1]! / v[2]!),
      2,
    ],
    [
      'Um móvel segue x(t) = #cos t e y(t) = #sen t. Qual é o raio da trajetória circular?',
      'x^2 + y^2 = r^2',
      'r = #',
      (v) => v[0]!,
    ],
    [
      'Um móvel segue x(t) = #t e y(t) = #t². Qual é o módulo da velocidade no instante t = #? (duas casas decimais)',
      'v = \\sqrt{v_x^2 + (2v_y t)^2}',
      'v = \\sqrt{#^2 + (2 \\cdot # \\cdot #)^2}',
      (v) => Math.hypot(v[0]!, 2 * v[1]! * v[2]!),
      2,
    ],
    [
      'Um móvel segue x(t) = t³ − #t e y(t) = t². Qual é a coordenada y no instante em que a coordenada x se anula pela primeira vez, com t > #? (duas casas decimais)',
      'x = 0 \\Rightarrow t = \\sqrt{a},\\ y = t^2 = a',
      'y = \\left(\\sqrt{#}\\right)^2',
      (v) => v[0]!,
      2,
    ],
  ],
};
