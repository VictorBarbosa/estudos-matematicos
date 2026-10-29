import { ErroMatematico, Passo, Resolucao } from '@core/math/tipos/tipos';
import { formatar } from '@core/math/algebra/polinomio/polinomio';

/**
 * Trigonometria: do triângulo retângulo ao círculo.
 *
 * O fio condutor do módulo é mostrar que seno e cosseno não mudam de
 * definição quando saímos do triângulo — apenas ganham sinal, porque passam a
 * ser coordenadas num círculo de raio 1.
 */

export const GRAUS_PARA_RADIANOS = Math.PI / 180;

export function paraRadianos(graus: number): number {
  return graus * GRAUS_PARA_RADIANOS;
}

export function paraGraus(radianos: number): number {
  return radianos / GRAUS_PARA_RADIANOS;
}

/** Ângulos cujos valores se conhecem de cor, com a forma exata em LaTeX. */
export interface AnguloNotavel {
  readonly graus: number;
  readonly radianosTex: string;
  readonly senoTex: string;
  readonly cossenoTex: string;
  readonly tangenteTex: string | null;
}

export const ANGULOS_NOTAVEIS: readonly AnguloNotavel[] = [
  { graus: 0, radianosTex: '0', senoTex: '0', cossenoTex: '1', tangenteTex: '0' },
  {
    graus: 30,
    radianosTex: '\\frac{\\pi}{6}',
    senoTex: '\\frac{1}{2}',
    cossenoTex: '\\frac{\\sqrt{3}}{2}',
    tangenteTex: '\\frac{\\sqrt{3}}{3}',
  },
  {
    graus: 45,
    radianosTex: '\\frac{\\pi}{4}',
    senoTex: '\\frac{\\sqrt{2}}{2}',
    cossenoTex: '\\frac{\\sqrt{2}}{2}',
    tangenteTex: '1',
  },
  {
    graus: 60,
    radianosTex: '\\frac{\\pi}{3}',
    senoTex: '\\frac{\\sqrt{3}}{2}',
    cossenoTex: '\\frac{1}{2}',
    tangenteTex: '\\sqrt{3}',
  },
  { graus: 90, radianosTex: '\\frac{\\pi}{2}', senoTex: '1', cossenoTex: '0', tangenteTex: null },
];

export function anguloNotavel(graus: number): AnguloNotavel | undefined {
  return ANGULOS_NOTAVEIS.find((angulo) => angulo.graus === graus);
}

/** Em qual quadrante o ângulo cai, de 1 a 4. */
export function quadrante(graus: number): 1 | 2 | 3 | 4 {
  const normalizado = ((graus % 360) + 360) % 360;

  if (normalizado < 90) return 1;
  if (normalizado < 180) return 2;
  if (normalizado < 270) return 3;
  return 4;
}

/** Os sinais de seno, cosseno e tangente em cada quadrante. */
export function sinaisNoQuadrante(graus: number): {
  readonly seno: number;
  readonly cosseno: number;
  readonly tangente: number;
} {
  const radianos = paraRadianos(graus);
  return {
    seno: Math.sign(Math.sin(radianos)),
    cosseno: Math.sign(Math.cos(radianos)),
    tangente: Math.sign(Math.tan(radianos)),
  };
}

export type Razao = 'seno' | 'cosseno' | 'tangente';

export const DESCRICAO_RAZAO: Readonly<Record<Razao, string>> = {
  seno: 'cateto oposto sobre hipotenusa',
  cosseno: 'cateto adjacente sobre hipotenusa',
  tangente: 'cateto oposto sobre cateto adjacente',
};

/**
 * Resolve um triângulo retângulo a partir de um ângulo e um lado.
 *
 * Os passos explicitam a escolha da razão, que é a decisão difícil do tema —
 * feita a escolha, a conta é imediata.
 */
export function resolverTrianguloComPassos(
  anguloGraus: number,
  hipotenusa: number,
): Resolucao<{ readonly oposto: number; readonly adjacente: number }> {
  if (anguloGraus <= 0 || anguloGraus >= 90) {
    throw new ErroMatematico('Num triângulo retângulo, o ângulo agudo fica entre 0° e 90°.');
  }

  const radianos = paraRadianos(anguloGraus);
  const oposto = hipotenusa * Math.sin(radianos);
  const adjacente = hipotenusa * Math.cos(radianos);

  return {
    resultado: { oposto, adjacente },
    passos: [
      {
        descricao: 'As razões comparam dois lados do triângulo em relação ao ângulo escolhido.',
        tex: `\\sin \\theta = \\frac{\\text{oposto}}{\\text{hipotenusa}} \\qquad \\cos \\theta = \\frac{\\text{adjacente}}{\\text{hipotenusa}}`,
      },
      {
        descricao: 'Isolando o cateto oposto.',
        tex: `\\text{oposto} = ${formatar(hipotenusa)} \\cdot \\sin ${anguloGraus}° = ${formatar(oposto)}`,
      },
      {
        descricao: 'E o cateto adjacente.',
        tex: `\\text{adjacente} = ${formatar(hipotenusa)} \\cdot \\cos ${anguloGraus}° = ${formatar(adjacente)}`,
      },
      {
        descricao: 'Conferindo com Pitágoras.',
        tex: `${formatar(oposto)}^{2} + ${formatar(adjacente)}^{2} \\approx ${formatar(hipotenusa)}^{2}`,
        nota: 'É a identidade fundamental disfarçada: sen²θ + cos²θ = 1, multiplicada por h².',
      },
    ],
  };
}

/** Lei dos cossenos: generaliza Pitágoras para triângulos quaisquer. */
export function leiDosCossenosComPassos(
  b: number,
  c: number,
  anguloGraus: number,
): Resolucao<number> {
  const radianos = paraRadianos(anguloGraus);
  const aQuadrado = b * b + c * c - 2 * b * c * Math.cos(radianos);
  const a = Math.sqrt(aQuadrado);

  return {
    resultado: a,
    passos: [
      {
        descricao: 'A lei dos cossenos relaciona os três lados e um ângulo.',
        tex: 'a^{2} = b^{2} + c^{2} - 2bc\\cos A',
      },
      {
        descricao: 'Substituímos os valores conhecidos.',
        tex: `a^{2} = ${formatar(b)}^{2} + ${formatar(c)}^{2} - 2 \\cdot ${formatar(b)} \\cdot ${formatar(c)} \\cdot \\cos ${anguloGraus}°`,
      },
      {
        descricao: 'Calculando.',
        tex: `a^{2} = ${formatar(aQuadrado)} \\;\\Rightarrow\\; a = ${formatar(a)}`,
      },
      {
        descricao: 'Com ângulo de 90°, o cosseno zera e sobra o teorema de Pitágoras.',
        tex: '\\cos 90° = 0 \\;\\Rightarrow\\; a^{2} = b^{2} + c^{2}',
        nota: 'Pitágoras é o caso particular da lei dos cossenos para o ângulo reto.',
      },
    ],
  };
}

/** Lei dos senos: lados e senos dos ângulos opostos são proporcionais. */
export function leiDosSenosComPassos(
  ladoConhecido: number,
  anguloOpostoGraus: number,
  outroAnguloGraus: number,
): Resolucao<number> {
  const razao = ladoConhecido / Math.sin(paraRadianos(anguloOpostoGraus));
  const resultado = razao * Math.sin(paraRadianos(outroAnguloGraus));

  return {
    resultado,
    passos: [
      {
        descricao: 'Em qualquer triângulo, a razão lado/seno do ângulo oposto é constante.',
        tex: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}',
      },
      {
        descricao: 'Calculamos a razão com o par conhecido.',
        tex: `\\frac{${formatar(ladoConhecido)}}{\\sin ${anguloOpostoGraus}°} = ${formatar(razao)}`,
      },
      {
        descricao: 'E usamos essa razão para o lado procurado.',
        tex: `x = ${formatar(razao)} \\cdot \\sin ${outroAnguloGraus}° = ${formatar(resultado)}`,
      },
    ],
  };
}

export interface OndaSenoidal {
  readonly amplitude: number;
  readonly periodo: number;
  readonly fase: number;
  readonly deslocamento: number;
}

/** Descreve como cada parâmetro deforma a onda y = A·sen(Bx + C) + D. */
export function analisarOndaComPassos(
  amplitude: number,
  frequencia: number,
  fase: number,
  deslocamento: number,
): Resolucao<OndaSenoidal> {
  const periodo = (2 * Math.PI) / Math.abs(frequencia);

  return {
    resultado: { amplitude, periodo, fase, deslocamento },
    passos: [
      {
        descricao: 'Partimos da forma geral.',
        tex: `y = ${formatar(amplitude)}\\sin\\left(${formatar(frequencia)}x ${fase >= 0 ? '+' : '-'} ${formatar(Math.abs(fase))}\\right) ${deslocamento >= 0 ? '+' : '-'} ${formatar(Math.abs(deslocamento))}`,
      },
      {
        descricao: 'A amplitude estica o gráfico na vertical: ela é o afastamento máximo do eixo.',
        tex: `|A| = ${formatar(Math.abs(amplitude))} \\;\\Rightarrow\\; y \\in [${formatar(deslocamento - Math.abs(amplitude))},\\; ${formatar(deslocamento + Math.abs(amplitude))}]`,
      },
      {
        descricao: 'O coeficiente de x comprime a onda: o período é 2π dividido por ele.',
        tex: `T = \\frac{2\\pi}{|B|} = \\frac{2\\pi}{${formatar(Math.abs(frequencia))}} = ${formatar(periodo)}`,
        nota: 'Quanto maior B, mais oscilações cabem no mesmo intervalo.',
      },
      {
        descricao: 'A fase desloca a onda horizontalmente.',
        tex: `\\text{deslocamento horizontal} = -\\frac{C}{B} = ${formatar(-fase / frequencia)}`,
      },
      {
        descricao: 'E a constante final sobe ou desce a onda inteira.',
        tex: `\\text{eixo da oscilação: } y = ${formatar(deslocamento)}`,
      },
    ],
  };
}
