import { Passo, Resolucao } from '@core/math/tipos/tipos';
import { formatar, formatarEmTexto } from '@core/math/algebra/polinomio/polinomio';

/**
 * Cálculo multivariável.
 *
 * Com duas variáveis, a pergunta "qual é a derivada" perde o sentido: há uma
 * taxa para cada direção em que se pode andar. As derivadas parciais são as
 * duas direções dos eixos, o gradiente as junta num vetor, e a derivada
 * direcional responde pela direção que se quiser.
 *
 * O gradiente é o objeto central, e por um motivo prático: ele aponta para a
 * subida mais íngreme e seu módulo é a inclinação nessa direção. Todo método
 * de otimização — de ajuste de curva a treinamento de rede neural — é alguma
 * variação de andar contra ele.
 *
 * O motor trabalha com quádricas em duas variáveis, que cobrem paraboloides,
 * selas e planos. É pouco para a teoria geral e suficiente para o que os
 * exercícios precisam mostrar, com contas exatas em todos os passos.
 */

/** `a x² + b y² + c xy + d x + e y + f₀`. */
export interface Quadrica {
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly d: number;
  readonly e: number;
  readonly f0: number;
}

/** `kx·x + ky·y + k0`, que é a forma de qualquer derivada parcial da quádrica. */
export interface Linear2 {
  readonly kx: number;
  readonly ky: number;
  readonly k0: number;
}

export interface Ponto2 {
  readonly x: number;
  readonly y: number;
}

export type NaturezaDoPonto = 'mínimo' | 'máximo' | 'sela' | 'indeterminado';

export function avaliarQuadrica(q: Quadrica, x: number, y: number): number {
  return q.a * x * x + q.b * y * y + q.c * x * y + q.d * x + q.e * y + q.f0;
}

/** `3x^{2} + 2y^{2} - xy + 4x - y + 5`, com os sinais arrumados. */
export function quadricaParaTex(q: Quadrica): string {
  const termos: readonly { readonly coeficiente: number; readonly corpo: string }[] = [
    { coeficiente: q.a, corpo: 'x^{2}' },
    { coeficiente: q.b, corpo: 'y^{2}' },
    { coeficiente: q.c, corpo: 'xy' },
    { coeficiente: q.d, corpo: 'x' },
    { coeficiente: q.e, corpo: 'y' },
    { coeficiente: q.f0, corpo: '' },
  ];

  let saida = '';
  for (const termo of termos) {
    saida += termoTex(termo.coeficiente, termo.corpo, saida === '');
  }

  return saida === '' ? '0' : saida;
}

/** A derivada parcial em x: o y vira constante. */
export function parcialX(q: Quadrica): Linear2 {
  return { kx: 2 * q.a, ky: q.c, k0: q.d };
}

/** A derivada parcial em y: agora é o x que vira constante. */
export function parcialY(q: Quadrica): Linear2 {
  return { kx: q.c, ky: 2 * q.b, k0: q.e };
}

export function avaliarLinear2(l: Linear2, x: number, y: number): number {
  return l.kx * x + l.ky * y + l.k0;
}

export function linear2ParaTex(l: Linear2): string {
  let saida = '';
  saida += termoTex(l.kx, 'x', true);
  saida += termoTex(l.ky, 'y', saida === '');
  saida += termoTex(l.k0, '', saida === '');

  return saida === '' ? '0' : saida;
}

export function gradienteEm(q: Quadrica, x: number, y: number): Ponto2 {
  return { x: avaliarLinear2(parcialX(q), x, y), y: avaliarLinear2(parcialY(q), x, y) };
}

/**
 * Uma derivada parcial, passo a passo.
 *
 * O passo que importa é o primeiro: derivar em x tratando y como constante. É
 * a única ideia nova do assunto, e a que o aluno precisa repetir sozinho.
 */
export function parcialComPassos(
  q: Quadrica,
  x: number,
  y: number,
  emX: boolean,
): Resolucao<number> {
  const parcial = emX ? parcialX(q) : parcialY(q);
  const resultado = avaliarLinear2(parcial, x, y);
  const variavel = emX ? 'x' : 'y';
  const outra = emX ? 'y' : 'x';

  const passos: Passo[] = [
    {
      descricao: `Derivamos em relação a ${variavel}, tratando ${outra} como constante.`,
      tex: `f(x,y) = ${quadricaParaTex(q)}`,
      nota: `Tudo que não tem ${variavel} some, e o que multiplica ${variavel} permanece.`,
    },
    {
      descricao: 'Termo a termo, sobra uma expressão linear.',
      tex: `\\frac{\\partial f}{\\partial ${variavel}} = ${linear2ParaTex(parcial)}`,
    },
    {
      descricao: `Avaliando no ponto (${formatarEmTexto(x)}, ${formatarEmTexto(y)}).`,
      tex:
        `\\frac{\\partial f}{\\partial ${variavel}}\\Big|_{(${formatar(x)},\\; ${formatar(y)})} = ` +
        `${formatar(Number(resultado.toFixed(6)))}`,
      nota: `É a taxa de variação ao andar só na direção de ${variavel}.`,
    },
  ];

  return { resultado, passos };
}

/**
 * O gradiente e o que ele significa.
 *
 * O resultado devolvido é o MÓDULO, porque é ele que responde "quão íngreme" —
 * a direção aparece no passo anterior.
 */
export function gradienteComPassos(q: Quadrica, x: number, y: number): Resolucao<number> {
  const g = gradienteEm(q, x, y);
  const resultado = Math.hypot(g.x, g.y);

  const passos: Passo[] = [
    {
      descricao: 'O gradiente junta as duas parciais num vetor.',
      tex: `\\nabla f = \\left(\\frac{\\partial f}{\\partial x},\\; \\frac{\\partial f}{\\partial y}\\right)`,
    },
    {
      descricao: 'Cada componente é uma parcial avaliada no ponto.',
      tex:
        `\\nabla f(${formatar(x)},\\; ${formatar(y)}) = \\left(${formatar(g.x)},\\; ${formatar(g.y)}\\right)`,
      nota: 'Ele aponta para a direção de subida mais íngreme a partir daquele ponto.',
    },
    {
      descricao: 'E o módulo dele é a inclinação nessa direção.',
      tex:
        `\\left|\\nabla f\\right| = \\sqrt{${formatar(g.x * g.x)} + ${formatar(g.y * g.y)}} = ` +
        `${formatar(Number(resultado.toFixed(6)))}`,
      nota: 'Nenhuma outra direção sobe mais rápido que essa.',
    },
  ];

  return { resultado, passos };
}

/**
 * A derivada direcional: a taxa numa direção qualquer.
 *
 * A direção precisa ser unitária, e esquecer de normalizá-la é o erro mais
 * comum do assunto — o resultado sai escalado pelo comprimento do vetor dado.
 */
export function derivadaDirecionalComPassos(
  q: Quadrica,
  x: number,
  y: number,
  direcao: Ponto2,
): Resolucao<number> {
  const comprimento = Math.hypot(direcao.x, direcao.y);
  const unitario = { x: direcao.x / comprimento, y: direcao.y / comprimento };
  const g = gradienteEm(q, x, y);
  const resultado = g.x * unitario.x + g.y * unitario.y;

  const passos: Passo[] = [
    {
      descricao: 'A direção precisa ser unitária, senão a taxa sai escalada.',
      tex:
        `\\hat{u} = \\frac{(${formatar(direcao.x)},\\; ${formatar(direcao.y)})}{${formatar(Number(comprimento.toFixed(6)))}} = ` +
        `\\left(${formatar(Number(unitario.x.toFixed(6)))},\\; ${formatar(Number(unitario.y.toFixed(6)))}\\right)`,
      nota: 'Normalizar é o passo que mais se esquece aqui.',
    },
    {
      descricao: 'A derivada direcional é o gradiente projetado na direção.',
      tex: `D_{\\hat{u}}f = \\nabla f \\cdot \\hat{u}`,
    },
    {
      descricao: 'Substituindo o gradiente no ponto.',
      tex:
        `\\left(${formatar(g.x)},\\; ${formatar(g.y)}\\right) \\cdot ` +
        `\\left(${formatar(Number(unitario.x.toFixed(4)))},\\; ${formatar(Number(unitario.y.toFixed(4)))}\\right) = ` +
        `${formatar(Number(resultado.toFixed(6)))}`,
      nota:
        Math.abs(resultado) < 1e-9
          ? 'Taxa nula: essa direção é tangente à curva de nível.'
          : 'O máximo possível é o módulo do gradiente, quando a direção coincide com ele.',
    },
  ];

  return { resultado, passos };
}

/**
 * O ponto crítico da quádrica, onde as duas parciais zeram.
 *
 * Como as parciais são lineares, isso é um sistema 2×2 — e ele tem solução
 * única exatamente quando o determinante da hessiana não zera.
 */
export function pontoCriticoComPassos(q: Quadrica): Resolucao<number> {
  const determinante = 4 * q.a * q.b - q.c * q.c;
  const x = (q.c * q.e - 2 * q.b * q.d) / determinante;
  const y = (q.c * q.d - 2 * q.a * q.e) / determinante;

  const passos: Passo[] = [
    {
      descricao: 'Num ponto crítico, as duas parciais zeram ao mesmo tempo.',
      tex: `\\begin{cases} ${linear2ParaTex(parcialX(q))} = 0 \\\\ ${linear2ParaTex(parcialY(q))} = 0 \\end{cases}`,
    },
    {
      descricao: 'As duas são lineares, então é um sistema dois por dois.',
      tex: `\\det H = ${formatar(2 * q.a)}\\cdot${formatar(2 * q.b)} - ${formatar(q.c)}^{2} = ${formatar(determinante)}`,
      nota: 'Determinante não nulo garante solução única.',
    },
    {
      descricao: 'Resolvendo.',
      tex:
        `x = ${formatar(Number(x.toFixed(6)))} \\qquad y = ${formatar(Number(y.toFixed(6)))}`,
    },
    {
      descricao: `O teste da segunda derivada classifica o ponto.`,
      tex: `\\det H = ${formatar(determinante)} \\qquad f_{xx} = ${formatar(2 * q.a)}`,
      nota: `É ${classificarCritico(q)}.`,
    },
  ];

  return { resultado: x, passos };
}

/**
 * O teste da hessiana.
 *
 * Determinante positivo decide entre máximo e mínimo pelo sinal da segunda
 * parcial em x; determinante negativo é sela, que é o caso que não existe em
 * uma variável.
 */
export function classificarCritico(q: Quadrica): NaturezaDoPonto {
  const determinante = 4 * q.a * q.b - q.c * q.c;

  if (determinante < 0) {
    return 'sela';
  }
  if (determinante === 0) {
    return 'indeterminado';
  }
  return q.a > 0 ? 'mínimo' : 'máximo';
}

/**
 * A integral dupla sobre um retângulo, por integração iterada.
 *
 * O teorema de Fubini diz que a ordem não importa num retângulo, e a conta é
 * exata para a quádrica.
 */
export function integralDuplaComPassos(
  q: Quadrica,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
): Resolucao<number> {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const x2 = (x1 * x1 - x0 * x0) / 2;
  const y2 = (y1 * y1 - y0 * y0) / 2;
  const x3 = (x1 ** 3 - x0 ** 3) / 3;
  const y3 = (y1 ** 3 - y0 ** 3) / 3;

  const resultado =
    q.a * x3 * dy + q.b * dx * y3 + q.c * x2 * y2 + q.d * x2 * dy + q.e * dx * y2 + q.f0 * dx * dy;

  const passos: Passo[] = [
    {
      descricao: 'Num retângulo, a integral dupla vira duas integrais simples.',
      tex:
        `\\int_{${formatar(y0)}}^{${formatar(y1)}}\\int_{${formatar(x0)}}^{${formatar(x1)}} ` +
        `\\left(${quadricaParaTex(q)}\\right)dx\\,dy`,
      nota: 'É o teorema de Fubini: num retângulo a ordem de integração não altera o resultado.',
    },
    {
      descricao: 'Integramos primeiro em x, tratando y como constante.',
      tex: `\\int x^{2}dx = \\frac{x^{3}}{3} \\qquad \\int x\\,dx = \\frac{x^{2}}{2}`,
    },
    {
      descricao: 'Depois integramos o que sobrou em y.',
      tex:
        `\\Delta x = ${formatar(dx)} \\qquad \\Delta y = ${formatar(dy)}`,
    },
    {
      descricao: 'Somando as contribuições de cada termo.',
      tex: `\\iint_{R} f\\,dA = ${formatar(Number(resultado.toFixed(6)))}`,
      nota: 'Com f positiva, isso é o volume sob a superfície e acima do retângulo.',
    },
  ];

  return { resultado, passos };
}

/**
 * A mudança para coordenadas polares, com o jacobiano.
 *
 * O fator `r` que aparece não é enfeite: ele corrige a área de cada pedacinho,
 * que cresce à medida que se afasta da origem. Esquecê-lo é o erro clássico.
 */
export function integralPolarComPassos(
  constante: number,
  raio: number,
  anguloFinal: number,
): Resolucao<number> {
  // ∫∫ k·r dr dθ sobre o setor de raio R e ângulo θ.
  const resultado = (constante * anguloFinal * raio * raio) / 2;

  const passos: Passo[] = [
    {
      descricao: 'Em polares, o elemento de área ganha um fator r.',
      tex: 'dA = r\\,dr\\,d\\theta',
      nota: 'É o jacobiano da mudança: pedaços mais afastados da origem são maiores.',
    },
    {
      descricao: 'A integral sobre o setor fica imediata.',
      tex:
        `\\int_{0}^{${formatar(Number(anguloFinal.toFixed(4)))}}\\int_{0}^{${formatar(raio)}} ` +
        `${formatar(constante)}\\,r\\,dr\\,d\\theta`,
    },
    {
      descricao: 'A integral em r dá metade do raio ao quadrado.',
      tex: `\\int_{0}^{${formatar(raio)}} r\\,dr = \\frac{${formatar(raio * raio)}}{2}`,
    },
    {
      descricao: 'E a integral em ângulo apenas multiplica.',
      tex: `${formatar(Number(resultado.toFixed(6)))}`,
      nota:
        Math.abs(anguloFinal - 2 * Math.PI) < 1e-9 && constante === 1
          ? 'Com a volta inteira e integrando 1, isso é a área do círculo.'
          : 'Sem o fator r, o resultado sairia menor e sem significado geométrico.',
    },
  ];

  return { resultado, passos };
}

/** Cilíndricas para cartesianas. */
export function cilindricasComPassos(
  r: number,
  thetaGraus: number,
  z: number,
): Resolucao<number> {
  const radianos = (thetaGraus * Math.PI) / 180;
  const x = r * Math.cos(radianos);
  const y = r * Math.sin(radianos);

  const passos: Passo[] = [
    {
      descricao: 'Cilíndricas são polares no plano, com o z intocado.',
      tex: 'x = r\\cos\\theta \\qquad y = r\\operatorname{sen}\\theta \\qquad z = z',
      nota: 'Servem a tudo que tem eixo de simetria: tubos, tanques, bocais.',
    },
    {
      descricao: `Com r igual a ${formatarEmTexto(r)} e ângulo de ${formatarEmTexto(thetaGraus)} graus.`,
      tex:
        `x = ${formatar(Number(x.toFixed(6)))} \\qquad y = ${formatar(Number(y.toFixed(6)))} \\qquad ` +
        `z = ${formatar(z)}`,
    },
    {
      descricao: 'A distância ao eixo é o próprio r.',
      tex: `\\sqrt{x^{2} + y^{2}} = ${formatar(Number(Math.hypot(x, y).toFixed(6)))}`,
    },
  ];

  return { resultado: x, passos };
}

/** Esféricas para cartesianas, na convenção com o ângulo polar medido do eixo z. */
export function esfericasComPassos(
  rho: number,
  phiGraus: number,
  thetaGraus: number,
): Resolucao<number> {
  const phi = (phiGraus * Math.PI) / 180;
  const theta = (thetaGraus * Math.PI) / 180;

  const x = rho * Math.sin(phi) * Math.cos(theta);
  const y = rho * Math.sin(phi) * Math.sin(theta);
  const z = rho * Math.cos(phi);

  const passos: Passo[] = [
    {
      descricao: 'Em esféricas, o ângulo polar é medido a partir do eixo z.',
      tex:
        'x = \\rho\\operatorname{sen}\\varphi\\cos\\theta \\qquad ' +
        'y = \\rho\\operatorname{sen}\\varphi\\operatorname{sen}\\theta \\qquad z = \\rho\\cos\\varphi',
      nota: 'É a convenção da física e da engenharia; em matemática pura às vezes se troca.',
    },
    {
      descricao: `Com raio ${formatarEmTexto(rho)}, polar ${formatarEmTexto(phiGraus)} e azimute ${formatarEmTexto(thetaGraus)} graus.`,
      tex:
        `x = ${formatar(Number(x.toFixed(6)))} \\qquad y = ${formatar(Number(y.toFixed(6)))} \\qquad ` +
        `z = ${formatar(Number(z.toFixed(6)))}`,
    },
    {
      descricao: 'E a distância à origem é o próprio raio.',
      tex: `\\sqrt{x^{2} + y^{2} + z^{2}} = ${formatar(Number(Math.hypot(x, y, z).toFixed(6)))}`,
      nota: 'O elemento de volume aqui é rho ao quadrado vezes o seno do ângulo polar.',
    },
  ];

  return { resultado: z, passos };
}

/**
 * O trabalho de um campo linear ao longo de um segmento.
 *
 * É a integral de linha na sua forma mais útil: quanto o campo empurra ao
 * longo do caminho. O cálculo é exato porque o integrando resultante é
 * quadrático no parâmetro.
 */
export function trabalhoNoSegmentoComPassos(
  campoX: Linear2,
  campoY: Linear2,
  de: Ponto2,
  ate: Ponto2,
): Resolucao<number> {
  const dx = ate.x - de.x;
  const dy = ate.y - de.y;

  // Integra numericamente com passo fino: o integrando é polinomial de grau 2,
  // e Simpson com três pontos já é exato nesse caso.
  const integrando = (t: number): number => {
    const x = de.x + dx * t;
    const y = de.y + dy * t;
    return avaliarLinear2(campoX, x, y) * dx + avaliarLinear2(campoY, x, y) * dy;
  };

  const resultado = (integrando(0) + 4 * integrando(0.5) + integrando(1)) / 6;

  const passos: Passo[] = [
    {
      descricao: 'Parametrizamos o segmento com um parâmetro de 0 a 1.',
      tex:
        `\\vec{r}(t) = \\left(${formatar(de.x)} + ${formatar(dx)}t,\\; ` +
        `${formatar(de.y)} + ${formatar(dy)}t\\right)`,
    },
    {
      descricao: 'O trabalho é a integral do campo projetado no deslocamento.',
      tex: `W = \\int_{C} \\vec{F} \\cdot d\\vec{r} = \\int_{0}^{1} \\vec{F}(\\vec{r}(t)) \\cdot \\vec{r}\\,^{\\prime}(t)\\,dt`,
      nota: 'Só a componente do campo ao longo do caminho realiza trabalho.',
    },
    {
      descricao: 'O vetor tangente é constante num segmento.',
      tex: `\\vec{r}\\,^{\\prime}(t) = \\left(${formatar(dx)},\\; ${formatar(dy)}\\right)`,
    },
    {
      descricao: 'Integrando em t.',
      tex: `W = ${formatar(Number(resultado.toFixed(6)))}`,
      nota: 'Num campo conservativo, esse valor dependeria só das pontas, não do caminho.',
    },
  ];

  return { resultado, passos };
}

/**
 * O domínio de `√(R² − x² − y²)`, que é um disco.
 *
 * Em duas variáveis o domínio deixa de ser um intervalo e passa a ser uma
 * região do plano — e visualizá-la é metade do trabalho.
 */
export function dominioDaRaizComPassos(raio: number, y0: number): Resolucao<number> {
  const resultado = Math.sqrt(Math.max(0, raio * raio - y0 * y0));

  const passos: Passo[] = [
    {
      descricao: 'A raiz exige que o radicando não seja negativo.',
      tex: `${formatar(raio * raio)} - x^{2} - y^{2} \\geq 0`,
      nota: 'O domínio é um disco de raio ' + formatarEmTexto(raio) + ', e não um intervalo.',
    },
    {
      descricao: `Fixando y igual a ${formatarEmTexto(y0)}, sobra uma condição só em x.`,
      tex: `x^{2} \\leq ${formatar(raio * raio - y0 * y0)}`,
    },
    {
      descricao: 'O maior x admissível é a raiz desse limite.',
      tex: `x_{max} = ${formatar(Number(resultado.toFixed(6)))}`,
      nota: 'Fora dele a função simplesmente não existe, por mais bem definida que a fórmula pareça.',
    },
  ];

  return { resultado, passos };
}

/**
 * O corte vertical da superfície: fixa-se y e sobra uma parábola em x.
 *
 * É a forma mais honesta de enxergar uma superfície — uma fatia de cada vez,
 * cada uma delas uma função de uma variável só.
 */
export function corteVerticalComPassos(q: Quadrica, y0: number): Resolucao<number> {
  // f(x, y0) = a x² + (c y0 + d) x + (b y0² + e y0 + f0)
  const linearEmX = q.c * y0 + q.d;
  const resultado = -linearEmX / (2 * q.a);

  const passos: Passo[] = [
    {
      descricao: `Fixamos y igual a ${formatarEmTexto(y0)} e olhamos o que sobra.`,
      tex: `f(x,\\; ${formatar(y0)}) = ${formatar(q.a)}x^{2} ${linearEmX >= 0 ? '+' : '-'} ${formatar(Math.abs(linearEmX))}x + ${formatar(q.b * y0 * y0 + q.e * y0 + q.f0)}`,
      nota: 'Uma superfície cortada por um plano devolve uma curva de uma variável só.',
    },
    {
      descricao: 'É uma parábola, e o vértice está na fórmula de sempre.',
      tex: `x_{v} = -\\frac{b}{2a} = -\\frac{${formatar(linearEmX)}}{${formatar(2 * q.a)}}`,
    },
    {
      descricao: 'E daí sai o x do ponto mais baixo (ou mais alto) do corte.',
      tex: `x_{v} = ${formatar(Number(resultado.toFixed(6)))}`,
      nota: q.a > 0 ? 'Com o coeficiente positivo, é um mínimo do corte.' : 'Com o coeficiente negativo, é um máximo.',
    },
  ];

  return { resultado, passos };
}

/** Um termo com sinal, omitindo coeficientes e corpos redundantes. */
function termoTex(coeficiente: number, corpo: string, primeiro: boolean): string {
  if (coeficiente === 0) {
    return '';
  }

  const sinal = coeficiente < 0 ? ' - ' : primeiro ? '' : ' + ';
  const magnitude = Math.abs(coeficiente);
  const numero = magnitude === 1 && corpo !== '' ? '' : formatar(magnitude);

  return `${sinal}${numero}${corpo}`;
}
