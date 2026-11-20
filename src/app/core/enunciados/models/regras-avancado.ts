import { PI, mdc, type Regra } from '@core/enunciados/models/regras-de-passos';

/**
 * As regras de polinômios, EDO, integrais múltiplas e de linha, gradiente,
 * séries e métodos numéricos.
 */

const rad = (graus: number): number => (graus * PI) / 180;

/** Raízes de `a x² + b x + c`, da maior para a menor. */
function raizes(a: number, b: number, c: number): readonly number[] {
  const delta = b * b - 4 * a * c;
  if (delta < 0) return [];
  const raiz = Math.sqrt(delta);
  return [(-b + raiz) / (2 * a), (-b - raiz) / (2 * a)].sort((x, y) => y - x);
}

export const REGRAS_AVANCADO: Readonly<Record<string, readonly Regra[]>> = {
  polinomios: [
    [
      'Um polinômio de grau # é dividido por um polinômio de grau #. Qual é o grau do quociente?',
      '\\deg(q) = \\deg(P) - \\deg(D)',
      '\\deg(q) = # - #',
      (v) => v[0]! - v[1]!,
    ],
    [
      'Dividindo um polinômio de grau # por outro de grau #, qual é o grau do quociente?',
      '\\deg(q) = \\deg(P) - \\deg(D)',
      '\\deg(q) = # - #',
      (v) => v[0]! - v[1]!,
    ],
    [
      'Para P(x) = #x² − #x + #, qual é o valor de P(#)?',
      'P(x) = ax^2 - bx + c',
      'P(#4) = #1 \\cdot #4^2 - #2 \\cdot #4 + #3',
      (v) => v[0]! * v[3]! ** 2 - v[1]! * v[3]! + v[2]!,
    ],
    [
      'Para P(x) = #x² + #x + #, qual é o valor de P(#)?',
      'P(x) = ax^2 + bx + c',
      'P(#4) = #1 \\cdot #4^2 + #2 \\cdot #4 + #3',
      (v) => v[0]! * v[3]! ** 2 + v[1]! * v[3]! + v[2]!,
    ],
    [
      'Qual é o resto da divisão de x³ − #x + # por (x − #)?',
      'P(a) = r',
      'P(#3) = #3^3 - #1 \\cdot #3 + #2',
      (v) => v[2]! ** 3 - v[0]! * v[2]! + v[1]!,
    ],
    [
      'Qual é o resto da divisão de x⁴ − # por (x + #)?',
      'P(-a) = r',
      'P(-#2) = (-#2)^4 - #1',
      (v) => (-v[1]!) ** 4 - v[0]!,
    ],
    [
      'Qual é o resto da divisão de #x³ + x² − # por (x − #)?',
      'P(a) = r',
      'P(#3) = #1 \\cdot #3^3 + #3^2 - #2',
      (v) => v[0]! * v[2]! ** 3 + v[2]! ** 2 - v[1]!,
    ],
    [
      'Um polinômio de grau # tem como raízes #, # e #. Qual é a soma das raízes?',
      'S = r_1 + r_2 + r_3',
      '# + # + #',
      (v) => v[1]! + v[2]! + v[3]!,
    ],
    [
      'O polinômio P(x) = x³ + ax + # tem # como raiz. Qual é o valor de a?',
      'a = -\\frac{r^3 + c}{r}',
      'a = -\\frac{#2^3 + #1}{#2}',
      (v) => -(v[1]! ** 3 + v[0]!) / v[1]!,
    ],
    [
      'Quantas raízes REAIS tem a equação x⁴ + # = #?',
      'x^4 = b - a',
      'x^4 = # - #',
      (v) => (v[1]! - v[0]! > 0 ? 2 : v[1]! - v[0]! === 0 ? 1 : 0),
    ],
  ],

  'derivacao-implicita': [
    [
      'Na curva x² + y² = #, qual é o valor de dy/dx no ponto (#, #)? (duas casas decimais)',
      '\\frac{dy}{dx} = -\\frac{x}{y}',
      '\\frac{dy}{dx} = -\\frac{#2}{#3}',
      (v) => -v[1]! / v[2]!,
      2,
    ],
    [
      'Uma circunferência tem a soma dos quadrados de x e y igual a #. No ponto (#, #), qual é a inclinação da reta tangente? Responda como fração.',
      '\\frac{dy}{dx} = -\\frac{x}{y}',
      '\\frac{dy}{dx} = -\\frac{#2}{#3}',
      (v) => {
        const mdc = (a: number, b: number): number => (b === 0 ? Math.abs(a) : mdc(b, a % b));
        const d = mdc(-v[1]!, v[2]!) || 1;
        const num = -v[1]! / d;
        const den = v[2]! / d;
        return den === 1 ? String(num) : `${num}/${den}`;
      },
    ],
    [
      'Uma circunferência tem a soma dos quadrados de x e y igual a #. No ponto (#, #), qual é a inclinação da reta tangente?',
      '\\frac{dy}{dx} = -\\frac{x}{y}',
      '\\frac{dy}{dx} = -\\frac{#2}{#3}',
      (v) => -v[1]! / v[2]!,
    ],
    [
      'Na curva x² + y² = #, qual é o coeficiente angular da reta tangente no ponto (#, #)? (duas casas decimais)',
      '\\frac{dy}{dx} = -\\frac{x}{y}',
      '\\frac{dy}{dx} = -\\frac{#2}{#3}',
      (v) => -v[1]! / v[2]!,
      2,
    ],
    [
      'Na curva x² + y² = #, em que ponto do primeiro quadrante a tangente é HORIZONTAL? Informe a ordenada y.',
      'x = 0 \\Rightarrow y = \\sqrt{r^2}',
      'y = \\sqrt{#}',
      (v) => Math.sqrt(v[0]!),
    ],
    [
      'A curva x² + y² = # passa por (#, #). Onde a reta tangente nesse ponto corta o eixo y? (duas casas decimais)',
      'y_{corte} = \\frac{r^2}{y_0}',
      'y = \\frac{#1}{#3}',
      (v) => v[0]! / v[2]!,
      2,
    ],
    [
      'Na curva y² = #x, qual é o valor de dy/dx no ponto (#, #)? (duas casas decimais)',
      '\\frac{dy}{dx} = \\frac{a}{2y}',
      '\\frac{dy}{dx} = \\frac{#1}{2 \\cdot #3}',
      (v) => v[0]! / (2 * v[2]!),
      2,
    ],
    [
      'Na curva x·y = #, qual é o valor de dy/dx no ponto (#, #)? (duas casas decimais)',
      '\\frac{dy}{dx} = -\\frac{y}{x}',
      '\\frac{dy}{dx} = -\\frac{#3}{#2}',
      (v) => -v[2]! / v[1]!,
      2,
    ],
    [
      'Uma curva satisfaz: o produto de x por y vale #. No ponto (#, #), qual é a inclinação da reta tangente?',
      '\\frac{dy}{dx} = -\\frac{y}{x}',
      '\\frac{dy}{dx} = -\\frac{#3}{#2}',
      (v) => -v[2]! / v[1]!,
    ],
    [
      'Uma curva satisfaz: o quadrado de x mais o quadrado de y vale #. Qual é a coordenada x do ponto mais alto dessa curva, onde a tangente é horizontal?',
      "2x + 2y\\,y' = 0 \\Rightarrow x = 0",
      'x = 0',
      () => 0,
    ],
  ],

  'aplicacoes-da-derivada': [
    [
      'Com # m de cerca, qual é a MAIOR área retangular, em metros quadrados, que se pode cercar?',
      'A_{max} = \\frac{P^2}{16}',
      'A_{max} = \\frac{#^2}{16}',
      (v) => v[0]! ** 2 / 16,
    ],
    [
      'Com # m de cerca, qual é a MAIOR área retangular que se pode cercar? (em m²; duas casas decimais)',
      'A_{max} = \\frac{P^2}{16}',
      'A_{max} = \\frac{#^2}{16}',
      (v) => v[0]! ** 2 / 16,
      2,
    ],
    [
      'Qual é o valor do MÁXIMO local de f(x) = −x² + #x? (duas casas decimais)',
      'y_v = \\frac{b^2}{4}',
      'y_v = \\frac{#^2}{4}',
      (v) => v[0]! ** 2 / 4,
      2,
    ],
    [
      'Uma função vale o quadrado de x menos # vezes x. Em que valor de x ela atinge o mínimo?',
      'f(x) = x^2 - ax \\Rightarrow x = \\frac{a}{2}',
      'x = \\frac{#}{2}',
      (v) => v[0]! / 2,
    ],
    [
      'Esta função tem dois pontos críticos: f(x) = x³ − #x. Informe o MAIOR deles. (duas casas decimais)',
      '3x^2 - a = 0 \\Rightarrow x = \\sqrt{\\frac{a}{3}}',
      'x = \\sqrt{\\frac{#}{3}}',
      (v) => Math.sqrt(v[0]! / 3),
      2,
    ],
    [
      'A função f(x) = x³ − #x tem um MÍNIMO local. Em que valor de x ele ocorre? (duas casas decimais)',
      '3x^2 - a = 0 \\Rightarrow x = -\\sqrt{\\frac{a}{3}}',
      'x = -\\sqrt{\\frac{#}{3}}',
      (v) => -Math.sqrt(v[0]! / 3),
      2,
    ],
    [
      'A posição de um corpo, em metros, é o cubo do tempo menos # vezes o quadrado do tempo. Em que instante, em segundos, a aceleração é zero?',
      "s''(t) = 6t - 2a = 0 \\Rightarrow t = \\frac{a}{3}",
      't = \\frac{#}{3}',
      (v) => v[0]! / 3,
    ],
    [
      'Qual é a área MÁXIMA de um retângulo inscrito num círculo de raio #? (em unidades²; duas casas decimais)',
      'A_{max} = 2r^2',
      'A_{max} = 2 \\cdot #^2',
      (v) => 2 * v[0]! ** 2,
      2,
    ],
    [
      'Uma caixa sem tampa é feita de uma folha quadrada de # cm de lado, cortando quadrados dos cantos e dobrando. Que lado, em centímetros, devem ter os quadrados cortados para o volume ser máximo?',
      'V = x(L-2x)^2 \\Rightarrow x = \\frac{L}{6}',
      'x = \\frac{#}{6}',
      (v) => v[0]! / 6,
    ],
  ],

  'integrais-multiplas': [
    [
      'Qual é a integral dupla da função constante igual a # sobre um retângulo de lados # e #?',
      '\\iint k\,dA = k \\cdot A',
      '\\iint = # \\cdot (# \\cdot #)',
      (v) => v[0]! * (v[1]! * v[2]!),
    ],
    [
      'Qual é o volume sob o plano de altura constante # sobre um quadrado de lado #?',
      'V = k \\cdot L^2',
      'V = # \\cdot #^2',
      (v) => v[0]! * v[1]! ** 2,
    ],
    [
      'Calcule a integral dupla de # sobre o retângulo de # a # em x e de # a # em y. (duas casas decimais)',
      '\\iint_R k\,dA = k(b-a)(d-c)',
      '= # \\cdot (# - #) \\cdot (# - #)',
      (v) => v[0]! * (v[2]! - v[1]!) * (v[4]! - v[3]!),
      2,
    ],
    [
      'Calcule a integral dupla de x sobre o retângulo de # a # em x e de # a # em y. (duas casas decimais)',
      '\\iint_R x\,dA = \\frac{b^2-a^2}{2}(d-c)',
      '= \\frac{#^2 - #^2}{2} \\cdot (# - #)',
      (v) => ((v[1]! ** 2 - v[0]! ** 2) / 2) * (v[3]! - v[2]!),
      2,
    ],
    [
      'Qual é a integral dupla da função que vale x, sobre o retângulo em que x vai de # a # e y vai de # a #?',
      '\\iint_R x\,dA = \\frac{b^2-a^2}{2}(d-c)',
      '= \\frac{#^2 - #^2}{2} \\cdot (# - #)',
      (v) => ((v[1]! ** 2 - v[0]! ** 2) / 2) * (v[3]! - v[2]!),
    ],
    [
      'Calcule a integral dupla de x² sobre o retângulo de # a # em x e de # a # em y. (duas casas decimais)',
      '\\iint_R x^2 dA = \\frac{b^3-a^3}{3}(d-c)',
      '= \\frac{#^3 - #^3}{3} \\cdot (# - #)',
      (v) => ((v[1]! ** 3 - v[0]! ** 3) / 3) * (v[3]! - v[2]!),
      2,
    ],
    [
      'Calcule a integral dupla de x·y sobre o retângulo de # a # em x e de # a # em y. (duas casas decimais)',
      '\\iint xy\,dA = \\frac{b^2-a^2}{2}\\cdot\\frac{d^2-c^2}{2}',
      '= \\frac{#^2 - #^2}{2} \\cdot \\frac{#^2 - #^2}{2}',
      (v) => ((v[1]! ** 2 - v[0]! ** 2) / 2) * ((v[3]! ** 2 - v[2]! ** 2) / 2),
      2,
    ],
    [
      'Qual é a integral dupla da função que vale o produto de x por y, sobre o retângulo em que x vai de # a # e y vai de # a #?',
      '\\iint xy\,dA',
      '= \\frac{#^2 - #^2}{2} \\cdot \\frac{#^2 - #^2}{2}',
      (v) => ((v[1]! ** 2 - v[0]! ** 2) / 2) * ((v[3]! ** 2 - v[2]! ** 2) / 2),
    ],
    [
      'Qual é o valor médio de f(x, y) = x sobre o retângulo de # a # em x e de # a # em y? (duas casas decimais)',
      '\\bar{f} = \\frac{1}{A}\\iint x\,dA = \\frac{a+b}{2}',
      '\\bar{f} = \\frac{# + #}{2}',
      (v) => (v[0]! + v[1]!) / 2,
      2,
    ],
    [
      'Integre a função constante # sobre um setor circular de raio # e ângulo de #°, usando coordenadas polares. (duas casas decimais)',
      '\\iint k\,dA = k \\cdot \\frac{\\theta}{360}\\pi r^2',
      '= # \\cdot \\frac{#}{360}\\pi \\cdot #^2',
      (v) => v[0]! * ((v[2]! / 360) * PI * v[1]! ** 2),
      2,
    ],
    [
      'Calcule a integral tripla da constante # sobre o cubo de # a # em x, y e z. (duas casas decimais)',
      '\\iiint k\,dV = k(L)^3',
      '= #1 \\cdot (#3 - #2)^3',
      (v) => v[0]! * (v[2]! - v[1]!) ** 3,
      2,
    ],
  ],

  'integrais-de-linha': [
    [
      'Um campo de força constante de # N, na direção do movimento, atua ao longo de um caminho de # m. Qual é o trabalho, em joules?',
      'W = F \\cdot d',
      'W = # \\cdot #',
      (v) => v[0]! * v[1]!,
    ],
    [
      'Um campo de força constante de # N atua PERPENDICULARMENTE ao caminho, de # m. Qual é o trabalho, em joules?',
      'W = F d \\cos 90^\\circ = 0',
      'W = # \\cdot # \\cdot \\cos 90^\\circ',
      () => 0,
    ],
    [
      'Qual é o trabalho do campo F = (#, #) ao longo do segmento de (#, #) a (#, #)? (duas casas decimais)',
      'W = \\vec{F}\\cdot(\\vec{B} - \\vec{A})',
      'W = #(# - #) + #(# - #)',
      (v) => v[0]! * (v[4]! - v[2]!) + v[1]! * (v[5]! - v[3]!),
      2,
    ],
    [
      'Qual é o trabalho do campo F = (#, #) ao longo do segmento horizontal de (#, #) a (#, #)? (duas casas decimais)',
      'W = F_x(x_2 - x_1)',
      'W = # \\cdot (# - #)',
      (v) => v[0]! * (v[3]! - v[2]!),
      2,
    ],
    [
      'Qual é o trabalho do campo F = (y, x) ao longo do segmento de (#, #) a (#, #)? (duas casas decimais)',
      'W = \\int y\,dx + x\,dy = x_2y_2 - x_1y_1',
      'W = #4 \\cdot #3 + #3 \\cdot #4',
      (v) => v[3]! * v[2]! + v[2]! * v[3]!,
      2,
    ],
    [
      'Qual é o trabalho do campo F = (#y, #x) ao longo do segmento de (#, #) a (#, #)? (duas casas decimais)',
      'W = k(x_2y_2 - x_1y_1)',
      'W = #1 \\cdot #6 \\cdot (#5 - #3) + #2 \\cdot #5 \\cdot (#6 - #4)',
      (v) => v[0]! * v[5]! * (v[4]! - v[2]!) + v[1]! * v[4]! * (v[5]! - v[3]!),
      2,
    ],
    [
      'Qual é o trabalho do campo F = (#x, #y) ao longo do segmento de (#, #) a (#, #)? (duas casas decimais)',
      'W = \\frac{k}{2}(x_2^2 - x_1^2 + y_2^2 - y_1^2)',
      'W = \\frac{#}{2}(#^2 - #^2) + \\frac{#}{2}(#^2 - #^2)',
      (v) => (v[0]! / 2) * (v[4]! ** 2 - v[2]! ** 2) + (v[1]! / 2) * (v[5]! ** 2 - v[3]! ** 2),
      2,
    ],
    [
      'Um campo conservativo tem potencial # no início do caminho e # no fim. Qual é o trabalho realizado ao longo do caminho?',
      'W = -\\Delta \\phi = \\phi_1 - \\phi_2',
      'W = #2 - #1',
      (v) => v[1]! - v[0]!,
    ],
    [
      'Um campo conservativo tem potencial # num ponto. Qual é o trabalho ao longo de um caminho FECHADO que começa e termina nesse ponto?',
      'W = \\oint = 0',
      'W = 0',
      () => 0,
    ],
    [
      'Qual é o trabalho do campo F = (y, x) ao percorrer o segmento de (#, #) a (#, #) e voltar pelo mesmo caminho? (duas casas decimais)',
      'W = 0',
      'W = 0',
      () => 0,
      2,
    ],
    [
      'Ao longo do círculo unitário, percorrido no sentido anti-horário, qual é a circulação do campo F = (−y, x)? (duas casas decimais)',
      '\\oint (-y\,dx + x\,dy) = 2\\pi r^2',
      '= 2\\pi',
      () => 2 * PI,
      2,
    ],
  ],

  'gradiente-e-direcional': [
    [
      'Uma função vale # vezes x mais # vezes y. Qual é o módulo do gradiente, que é a maior taxa de variação possível?',
      '|\\nabla f| = \\sqrt{a^2 + b^2}',
      '|\\nabla f| = \\sqrt{#^2 + #^2}',
      (v) => Math.hypot(v[0]!, v[1]!),
    ],
    [
      'Qual é o módulo do gradiente de f(x, y) = #x + #y? (duas casas decimais)',
      '|\\nabla f| = \\sqrt{a^2 + b^2}',
      '|\\nabla f| = \\sqrt{#^2 + #^2}',
      (v) => Math.hypot(v[0]!, v[1]!),
      2,
    ],
    [
      'Uma função vale # vezes x mais # vezes y. Qual é a derivada direcional na direção do eixo x?',
      '\\frac{\\partial f}{\\partial x} = a',
      'D_x f = #',
      (v) => v[0]!,
    ],
    [
      'Uma função vale # vezes x mais # vezes y. Qual é a derivada direcional numa direção PERPENDICULAR ao gradiente?',
      '\\nabla f \\cdot \\vec{u}_\\perp = 0',
      'D_{\\perp} f = 0',
      () => 0,
    ],
    [
      'Qual é a componente x do gradiente de f(x, y) = x² + y² no ponto (#, #)?',
      '\\frac{\\partial f}{\\partial x} = 2x',
      '\\frac{\\partial f}{\\partial x} = 2 \\cdot #',
      (v) => 2 * v[0]!,
    ],
    [
      'Qual é a componente y do gradiente de f(x, y) = x² + y² no ponto (#, #)?',
      '\\frac{\\partial f}{\\partial y} = 2y',
      '\\frac{\\partial f}{\\partial y} = 2 \\cdot #',
      (v) => 2 * v[1]!,
    ],
    [
      'Qual é a componente x do gradiente de f(x, y) = x²y no ponto (#, #)?',
      '\\frac{\\partial f}{\\partial x} = 2xy',
      '\\frac{\\partial f}{\\partial x} = 2 \\cdot # \\cdot #',
      (v) => 2 * v[0]! * v[1]!,
    ],
    [
      'Qual é a MAIOR taxa de variação possível de f(x, y) = x² + y² no ponto (#, #)? (duas casas decimais)',
      '|\\nabla f| = 2\\sqrt{x^2 + y^2}',
      '|\\nabla f| = 2\\sqrt{#^2 + #^2}',
      (v) => 2 * Math.hypot(v[0]!, v[1]!),
      2,
    ],
    [
      'Uma função vale o quadrado de x mais o quadrado de y. Qual é o módulo do gradiente no ponto (#, #)?',
      '|\\nabla f| = 2\\sqrt{x^2 + y^2}',
      '|\\nabla f| = 2\\sqrt{#^2 + #^2}',
      (v) => 2 * Math.hypot(v[0]!, v[1]!),
    ],
    [
      'A função f(x, y) = x² + y² tem um único ponto crítico. Qual é a abscissa dele?',
      '2x = 0 \\Rightarrow x = 0',
      'x = 0',
      () => 0,
    ],
  ],

  'sequencias-e-series': [
    [
      'Calcule o limite do termo geral #/n quando n tende ao infinito. (duas casas decimais)',
      '\\lim_{n\\to\\infty}\\frac{k}{n} = 0',
      '\\lim = 0',
      () => 0,
      2,
    ],
    [
      'Calcule o limite do termo geral #/n^# quando n tende ao infinito. (duas casas decimais)',
      '\\lim_{n\\to\\infty}\\frac{k}{n^p} = 0',
      '\\lim = 0',
      () => 0,
      2,
    ],
    [
      'Qual é o limite do termo geral aₙ = #/n^# quando n tende ao infinito?',
      '\\lim_{n\\to\\infty}\\frac{k}{n^p} = 0',
      '\\lim = 0',
      () => 0,
    ],
    [
      'Calcule o limite do termo geral n/(n+#) quando n tende ao infinito. (duas casas decimais)',
      '\\lim_{n\\to\\infty}\\frac{n}{n + k} = 1',
      '\\lim = 1',
      () => 1,
      2,
    ],
    [
      'Calcule o limite do termo geral #n/n quando n tende ao infinito. (duas casas decimais)',
      '\\lim_{n\\to\\infty}\\frac{kn}{n} = k',
      '\\lim = #',
      (v) => v[0]!,
      2,
    ],
    [
      'Calcule o limite do termo geral #n/(n+#) quando n tende ao infinito. (duas casas decimais)',
      '\\lim_{n\\to\\infty}\\frac{kn}{n + c} = k',
      '\\lim = #',
      (v) => v[0]!,
      2,
    ],
    [
      'Calcule o limite do termo geral n/(#n+#) quando n tende ao infinito. (duas casas decimais)',
      '\\lim_{n\\to\\infty}\\frac{n}{kn + c} = \\frac{1}{k}',
      '\\lim = \\frac{1}{#}',
      (v) => 1 / v[0]!,
      2,
    ],
    [
      'Uma série geométrica tem primeiro termo # e razão #/#. Ela converge? Responda # se converge e # se diverge.',
      '|q| < 1 \\Rightarrow \\sum a_n < \\infty',
      '|#/#| < 1\,?',
      (v) => (Math.abs(v[1]! / v[2]!) < 1 ? 1 : 0),
    ],
    [
      'Uma série geométrica tem primeiro termo # e razão #. Ela converge? Responda # se converge e # se diverge.',
      '|q| < 1 \\Rightarrow \\sum a_n < \\infty',
      '|#| < 1\,?',
      (v) => (Math.abs(v[1]!) < 1 ? 1 : 0),
    ],
    [
      'Qual é a soma de uma série geométrica infinita de primeiro termo # e razão #/#?',
      'S = \\frac{a}{1 - q}',
      'S = \\frac{#}{1 - \\frac{#}{#}}',
      (v) => v[0]! / (1 - v[1]! / v[2]!),
    ],
    [
      'Qual é a soma de uma série geométrica infinita de primeiro termo # e razão #/#? Responda como fração.',
      'S = \\frac{a}{1 - q}',
      'S = \\frac{#}{1 - \\frac{#}{#}}',
      (v) => {
        const num = v[0]! * v[2]!;
        const den = v[2]! - v[1]!;
        const mdc = (a: number, b: number): number => (b === 0 ? Math.abs(a) : mdc(b, a % b));
        const d = mdc(num, den) || 1;
        return den / d === 1 ? String(num / d) : `${num / d}/${den / d}`;
      },
    ],
    [
      'Calcule a soma da série geométrica de primeiro termo # e razão #/#. (duas casas decimais)',
      'S = \\frac{a}{1 - q}',
      'S = \\frac{#}{1 - \\frac{#}{#}}',
      (v) => v[0]! / (1 - v[1]! / v[2]!),
      2,
    ],
    [
      'Qual é o raio de convergência R da série de potências de termo x^n/#^n? (duas casas decimais)',
      'R = a',
      'R = #',
      (v) => v[0]!,
      2,
    ],
    [
      'Pelo teste da razão, calcule L = lim |aₙ₊₁/aₙ| para a série de termo #/#^n. (duas casas decimais)',
      'L = \\frac{1}{a}',
      'L = \\frac{1}{#2}',
      (v) => 1 / v[1]!,
      2,
    ],
    [
      'Somando só os # primeiros termos da série alternada, qual é a cota do erro dada pelo teorema? (duas casas decimais)',
      '|R_N| \\le a_{N+1} = \\frac{1}{N+1}',
      '|R| \\le \\frac{1}{# + 1}',
      (v) => 1 / (v[0]! + 1),
      2,
    ],
  ],

  'series-de-taylor': [
    [
      'O polinômio de Maclaurin de grau # do seno é o próprio x. Quanto vale essa aproximação em x = #?',
      'P_1(x) = x',
      'P_1(#) = #',
      (v) => v[1]!,
    ],
    [
      'O polinômio de Maclaurin de grau # da função cosseno é # menos metade do quadrado de x. Quanto vale essa aproximação em x = #? Responda como fração.',
      'P_2(x) = 1 - \\frac{x^2}{2}',
      'P_2(#) = 1 - \\frac{#^2}{2}',
      (v) => {
        const num = 2 - v[1]! ** 2;
        const mdc = (a: number, b: number): number => (b === 0 ? Math.abs(a) : mdc(b, a % b));
        const d = mdc(num, 2) || 1;
        return 2 / d === 1 ? String(num / d) : `${num / d}/${2 / d}`;
      },
    ],
    [
      'Use o polinômio de Maclaurin de grau # para aproximar e^(#). (duas casas decimais)',
      'P_n(x) = \\sum_{k=0}^{n}\\frac{x^k}{k!}',
      'P_{#1}(#2) = \\sum \\frac{#2^k}{k!}',
      (v) => {
        const [grau, x] = [v[0]!, v[1]!];
        let soma = 0;
        let fatorial = 1;
        for (let k = 0; k <= grau; k += 1) {
          if (k > 0) fatorial *= k;
          soma += x ** k / fatorial;
        }
        return soma;
      },
      2,
    ],
    [
      'Aproximando e^(#) pelo polinômio de Maclaurin de grau #, de quanto é o erro cometido? (duas casas decimais)',
      'E = e^x - P_n(x)',
      'E = e^{#1} - P_{#2}(#1)',
      (v) => {
        const [x, grau] = [v[0]!, v[1]!];
        let soma = 0;
        let fatorial = 1;
        for (let k = 0; k <= grau; k += 1) {
          if (k > 0) fatorial *= k;
          soma += x ** k / fatorial;
        }
        return Math.exp(x) - soma;
      },
      2,
    ],
    [
      'Qual é o coeficiente de x^# na série de Maclaurin de e^x? Responda com # casas decimais.',
      'a_n = \\frac{1}{n!}',
      'a_n = \\frac{1}{#!}',
      (v) => {
        let fatorial = 1;
        for (let k = 2; k <= v[0]!; k += 1) fatorial *= k;
        return 1 / fatorial;
      },
      6,
    ],
    [
      'Qual é o coeficiente de x^# na série de Maclaurin de sen(x)? Responda com # casas decimais, com sinal.',
      'a_n = \\frac{(-1)^k}{(2k+1)!}',
      'a_n = \\frac{(-1)^k}{#!}',
      (v) => {
        const n = v[0]!;
        // Em sen(x) só os graus ÍMPARES têm coeficiente.
        if (n % 2 === 0) return 0;
        let fatorial = 1;
        for (let k = 2; k <= n; k += 1) fatorial *= k;
        return (((n - 1) / 2) % 2 === 0 ? 1 : -1) / fatorial;
      },
      6,
    ],
    [
      'Qual é o coeficiente de x^# na série de Maclaurin de cos(x)? Responda com # casas decimais, com sinal.',
      'a_n = \\frac{(-1)^k}{(2k)!}',
      'a_n = \\frac{(-1)^k}{#!}',
      (v) => {
        const n = v[0]!;
        // Em cos(x) só os graus PARES têm coeficiente.
        if (n % 2 !== 0) return 0;
        let fatorial = 1;
        for (let k = 2; k <= n; k += 1) fatorial *= k;
        return ((n / 2) % 2 === 0 ? 1 : -1) / fatorial;
      },
      6,
    ],
  ],

  'metodos-numericos': [
    [
      'Pelo método da bisseção, qual é o ponto médio do intervalo entre # e #?',
      'x_m = \\frac{a + b}{2}',
      'x_m = \\frac{# + #}{2}',
      (v) => (v[0]! + v[1]!) / 2,
    ],
    [
      'Pela regra do trapézio, qual é a área aproximada sob uma curva num intervalo de largura #, cujas alturas nas pontas valem # e #?',
      'A = \\frac{h}{2}(f_1 + f_2)',
      'A = \\frac{#}{2}(# + #)',
      (v) => (v[0]! / 2) * (v[1]! + v[2]!),
    ],
    [
      "Quantos passos de Euler com h = # são necessários para integrar y' = y de # a #?",
      'n = \\frac{T}{h}',
      'n = \\frac{#3 - #2}{#1}',
      (v) => (v[2]! - v[1]!) / v[0]!,
    ],
    [
      'No método de Newton-Raphson, o próximo valor é o atual menos a função dividida pela derivada. Partindo de x igual a #, com a função valendo # e a derivada #, qual é o próximo valor?',
      "x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}",
      'x_1 = # - \\frac{#}{#}',
      (v) => v[0]! - v[1]! / v[2]!,
    ],
    [
      "Aplique o método de Euler com passo h = # e # passos, partindo de y(#) = # e y' = y. Qual é o valor aproximado? (duas casas decimais)",
      'y_{n+1} = y_n + h y_n',
      'y = #4(1 + #1)^{#2}',
      (v) => v[3]! * (1 + v[0]!) ** v[1]!,
      2,
    ],
    [
      "Aplique Euler com passo h = # e # passos para y' = y, partindo de y(#) = #. Qual é o valor obtido? (duas casas decimais)",
      'y_{n+1} = y_n + h y_n',
      'y = #4(1 + #1)^{#2}',
      (v) => v[3]! * (1 + v[0]!) ** v[1]!,
      2,
    ],
    [
      "Aplique Euler com passo h = # e # passos para y' = −y, partindo de y(#) = #. Qual é o valor obtido? (duas casas decimais)",
      'y_{n+1} = y_n - h y_n',
      'y = #4(1 - #1)^{#2}',
      (v) => v[3]! * (1 - v[0]!) ** v[1]!,
      2,
    ],
    [
      'Uma função vale # em x = # e # em x = #, e é contínua. A raiz está entre eles? Responda # para sim e # para não.',
      'f(a)f(b) < 0 \\Rightarrow \\exists\\,r',
      '# \\cdot # < 0\\,?',
      (v) => (v[0]! * v[2]! < 0 ? 1 : 0),
    ],
  ],

  'edo-primeira-ordem': [
    [
      'Uma população cresce de modo que a taxa de variação é # vezes a própria população. Qual é a constante que multiplica o tempo no expoente da solução?',
      'y = y_0 e^{kt} \\Rightarrow k',
      'k = #',
      (v) => v[0]!,
    ],
    [
      "Resolva y' = #y com y(#) = # e calcule y(#). (duas casas decimais)",
      'y = y_0 e^{k(t - t_0)}',
      'y = # \\cdot e^{# \\cdot (# - #)}',
      (v) => v[2]! * Math.exp(v[0]! * (v[3]! - v[1]!)),
      2,
    ],
    [
      "Uma grandeza obedece a y' = #y, com valor inicial #. Quanto ela vale em t = #? (duas casas decimais)",
      'y = y_0 e^{kt}',
      'y = # \\cdot e^{# \\cdot #}',
      (v) => v[1]! * Math.exp(v[0]! * v[2]!),
      2,
    ],
    [
      "Uma substância decai segundo y' = −#y, com y(#) = #. Quanto resta em t = #? (duas casas decimais)",
      'y = y_0 e^{-kt}',
      'y = # \\cdot e^{-# \\cdot #}',
      (v) => v[2]! * Math.exp(-v[0]! * v[3]!),
      2,
    ],
    [
      "Uma substância decai segundo y' = −#y. Qual é a meia-vida dela? (duas casas decimais)",
      't_{1/2} = \\frac{\\ln 2}{k}',
      't_{1/2} = \\frac{\\ln 2}{#}',
      (v) => Math.log(2) / v[0]!,
      2,
    ],
    [
      'Uma grandeza tem taxa de variação constante igual a # e vale # no instante zero. Quanto ela vale no instante #?',
      'y = y_0 + kt',
      'y = #2 + #3 \\cdot #1',
      (v) => v[1]! + v[0]! * v[2]!,
    ],
    [
      "Para onde a solução de y' = #(# − y) tende quando o tempo cresce, partindo de y(#) = #? (duas casas decimais)",
      'y \\to K',
      'y \\to \\text{#}',
      (v) => v[1]!,
      2,
    ],
    [
      'Um corpo a # °C é deixado num ambiente a # °C, com constante # por minuto. Qual é a temperatura em t = # minutos? (duas casas decimais)',
      'T = T_a + (T_0 - T_a)e^{-kt}',
      'T = #2 + (#1 - #2)e^{-#3 \\cdot #4}',
      (v) => v[1]! + (v[0]! - v[1]!) * Math.exp(-v[2]! * v[3]!),
      2,
    ],
  ],

  'edo-segunda-ordem': [
    [
      'A equação característica de uma equação diferencial tem raízes # e #. Qual é a MAIOR delas?',
      'r^2 + br + c = 0',
      '\\max(#, #)',
      (v) => Math.max(v[0]!, v[1]!),
    ],
    [
      "Qual é a MAIOR raiz da equação característica de y'' + #y' + #y = #? (duas casas decimais)",
      'r^2 + br + c = 0',
      'r = \\frac{-#2 + \\sqrt{#3^2 - 4 \\cdot #1}}{2}',
      (v) => raizes(1, v[0]!, v[1]!)[0] ?? Number.NaN,
      2,
    ],
    [
      "Qual é a MENOR raiz da equação característica de y'' + #y' + #y = #? (duas casas decimais)",
      'r^2 + br + c = 0',
      'r = \\frac{-#2 - \\sqrt{#3^2 - 4 \\cdot #1}}{2}',
      (v) => raizes(1, v[0]!, v[1]!)[1] ?? Number.NaN,
      2,
    ],
    [
      "Qual é o discriminante da equação característica de y'' + #y' + #y = #?",
      '\\Delta = b^2 - 4ac',
      '\\Delta = #^2 - 4 \\cdot #',
      (v) => v[0]! ** 2 - 4 * v[1]!,
    ],
    [
      'A equação característica tem soma das raízes igual a # e produto igual a #. Sabendo que uma raiz vale #, qual é a outra?',
      'r_2 = r_1 + r_2 - r_1',
      'r_2 = # - #',
      (v) => v[0]! - v[2]!,
    ],
    [
      'A equação característica tem raiz dupla igual a #. Quantas raízes DISTINTAS ela tem?',
      '\\Delta = 0 \\Rightarrow 1',
      'n = 1',
      () => 1,
    ],
    [
      "Qual é o período da oscilação descrita por y'' + #y = #? (duas casas decimais)",
      'T = \\frac{2\\pi}{\\sqrt{k}}',
      'T = \\frac{2\\pi}{\\sqrt{#}}',
      (v) => (2 * PI) / Math.sqrt(v[0]!),
      2,
    ],
    [
      'Um oscilador sem amortecimento tem massa # kg e constante elástica # N/m. Qual é a frequência angular da solução, em rad/s?',
      '\\omega = \\sqrt{\\frac{k}{m}}',
      '\\omega = \\sqrt{\\frac{#2}{#1}}',
      (v) => Math.sqrt(v[1]! / v[0]!),
    ],
    [
      'Num sistema massa-mola amortecido com m = #, b = # e k = #, qual é o discriminante da equação característica?',
      '\\Delta = b^2 - 4mk',
      '\\Delta = #2^2 - 4 \\cdot #3 \\cdot #1',
      (v) => v[1]! ** 2 - 4 * v[0]! * v[2]!,
    ],
  ],

  'aplicacoes-de-edo': [
    [
      'Um corpo a # °C é deixado num ambiente a # °C. De que temperatura, em °C, ele se aproxima depois de muito tempo?',
      'T \\to T_a',
      'T \\to #',
      (v) => v[1]!,
    ],
    [
      'Uma população dobra a cada # anos. Partindo de # indivíduos, quantos haverá depois de # anos?',
      'P = P_0 2^{t/\\tau}',
      'P = #2 \\cdot 2^{\\frac{#3}{#1}}',
      (v) => v[1]! * 2 ** (v[2]! / v[0]!),
    ],
    [
      'Uma amostra de # g tem meia-vida de # anos. Quanto resta depois de # anos, em g? (duas casas decimais)',
      'N = N_0\\left(\\frac{1}{2}\\right)^{t/T}',
      'N = #1 \\cdot \\left(\\frac{1}{2}\\right)^{\\frac{#3}{#2}}',
      (v) => v[0]! * 0.5 ** (v[2]! / v[1]!),
      2,
    ],
    [
      'Um tanque recebe # L por minuto e perde # L por minuto. Partindo de # L, quantos litros há depois de # minutos?',
      'V = V_0 + (e - s)t',
      'V = #3 + (#1 - #2) \\cdot #4',
      (v) => v[2]! + (v[0]! - v[1]!) * v[3]!,
    ],
    [
      'Num circuito com fem # V, resistência # Ω e indutância # H, a corrente tende a um valor estacionário. Qual é, em A? (duas casas decimais)',
      'i \\to \\frac{E}{R}',
      'i = \\frac{#}{#}',
      (v) => v[0]! / v[1]!,
      2,
    ],
    [
      'Um corpo cai com resistência do ar proporcional à velocidade, com constante # por segundo, partindo do repouso. Qual é a velocidade terminal, em m/s?',
      'v_t = \\frac{g}{k}',
      'v_t = \\frac{9{,}81}{#}',
      (v) => 9.81 / v[0]!,
    ],
  ],
};
