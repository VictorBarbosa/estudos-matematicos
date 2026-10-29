import { formatar } from '@core/math/algebra/polinomio/polinomio';
import { paraRadianos } from '@core/math/trigonometria/trigonometria/trigonometria';
import { ErroMatematico, Passo, Resolucao } from '@core/math/tipos/tipos';

/**
 * Cinemática escalar e dinâmica.
 *
 * Duas ideias organizam tudo aqui: a área sob o gráfico da velocidade é o
 * deslocamento, e força resultante não nula produz aceleração. A primeira
 * antecipa a integral; a segunda é a segunda lei de Newton.
 */

export const GRAVIDADE_PADRAO = 9.81;

export interface EstadoMovimento {
  readonly posicao: number;
  readonly velocidade: number;
  readonly aceleracao: number;
}

/** Movimento uniformemente variado: posição e velocidade num instante. */
export function movimentoUniformementeVariado(
  posicaoInicial: number,
  velocidadeInicial: number,
  aceleracao: number,
  t: number,
): EstadoMovimento {
  return {
    posicao: posicaoInicial + velocidadeInicial * t + (aceleracao * t * t) / 2,
    velocidade: velocidadeInicial + aceleracao * t,
    aceleracao,
  };
}

/**
 * Equação de Torricelli, deduzida eliminando o tempo.
 *
 * É a equação que responde "com que velocidade chega?" sem precisar saber
 * quando — útil justamente quando o tempo não interessa.
 */
export function torricelliComPassos(
  velocidadeInicial: number,
  aceleracao: number,
  deslocamento: number,
): Resolucao<number> {
  const quadrado = velocidadeInicial * velocidadeInicial + 2 * aceleracao * deslocamento;

  if (quadrado < 0) {
    throw new ErroMatematico(
      'Esse deslocamento não é alcançável: a velocidade zeraria antes de chegar lá.',
    );
  }

  const resultado = Math.sqrt(quadrado);

  return {
    resultado,
    passos: [
      {
        descricao: 'Partimos das duas equações do movimento uniformemente variado.',
        tex: 'v = v_0 + at \\qquad \\Delta s = v_0 t + \\frac{at^{2}}{2}',
      },
      {
        descricao: 'Isolamos o tempo na primeira e substituímos na segunda.',
        tex: 't = \\frac{v - v_0}{a}',
        nota: 'O tempo desaparece — é isso que torna a equação útil.',
      },
      {
        descricao: 'Simplificando, resta a relação entre velocidades e deslocamento.',
        tex: 'v^{2} = v_0^{2} + 2a\\Delta s',
      },
      {
        descricao: 'Substituindo os valores.',
        tex:
          `v^{2} = ${formatar(velocidadeInicial)}^{2} + 2(${formatar(aceleracao)})(${formatar(deslocamento)})` +
          ` = ${formatar(Number(quadrado.toFixed(4)))}`,
      },
      {
        descricao: 'Extraímos a raiz.',
        tex: `v = ${formatar(Number(resultado.toFixed(4)))}\\,\\text{m/s}`,
      },
    ],
  };
}

/** Deslocamento como área sob o gráfico da velocidade. */
export function deslocamentoPorAreaComPassos(
  velocidadeInicial: number,
  aceleracao: number,
  t: number,
): Resolucao<number> {
  if (t < 0) {
    throw new ErroMatematico('O intervalo de tempo não pode ser negativo.');
  }

  const retangulo = velocidadeInicial * t;
  const triangulo = (aceleracao * t * t) / 2;
  const resultado = retangulo + triangulo;

  return {
    resultado,
    passos: [
      {
        descricao: 'No gráfico v × t, o movimento uniformemente variado é uma reta.',
        tex: `v(t) = ${formatar(velocidadeInicial)} + ${formatar(aceleracao)}t`,
      },
      {
        descricao: 'A área abaixo dela se parte num retângulo e num triângulo.',
        tex: `A_{\\square} = v_0 t = ${formatar(retangulo)} \\qquad A_{\\triangle} = \\frac{at^{2}}{2} = ${formatar(Number(triangulo.toFixed(4)))}`,
      },
      {
        descricao: 'A soma das duas áreas é o deslocamento.',
        tex: `\\Delta s = ${formatar(Number(resultado.toFixed(4)))}\\,\\text{m}`,
        nota: 'Área sob a velocidade é deslocamento — a integral já está aqui, disfarçada.',
      },
    ],
  };
}

export interface ForcaResultante {
  readonly resultante: number;
  readonly aceleracao: number;
}

/**
 * Segunda lei de Newton, aplicada a um corpo com várias forças colineares.
 *
 * O passo que mais se erra não é a divisão final, e sim montar a resultante:
 * forças contrárias entram com sinal negativo.
 */
export function segundaLeiComPassos(
  massa: number,
  forcas: readonly { readonly valor: number; readonly descricao: string }[],
): Resolucao<ForcaResultante> {
  if (massa <= 0) {
    throw new ErroMatematico('A massa deve ser positiva.');
  }

  const resultante = forcas.reduce((total, { valor }) => total + valor, 0);
  const aceleracao = resultante / massa;

  return {
    resultado: { resultante, aceleracao },
    passos: [
      {
        descricao: 'Somamos as forças com seus sinais, conforme o sentido.',
        tex: forcas.map(({ valor }) => formatar(valor)).join(' + ').replace(/\+ -/g, '- '),
      },
      {
        descricao: 'A resultante é essa soma.',
        tex: `F_R = ${formatar(resultante)}\\,\\text{N}`,
        nota: forcas.map(({ descricao }) => descricao).join('; '),
      },
      {
        descricao: 'Pela segunda lei, a aceleração é a resultante dividida pela massa.',
        tex: `a = \\frac{${formatar(resultante)}}{${formatar(massa)}} = ${formatar(Number(aceleracao.toFixed(4)))}\\,\\text{m/s}^{2}`,
        nota:
          Math.abs(resultante) < 1e-9
            ? 'Resultante nula: o corpo mantém sua velocidade, qualquer que seja ela.'
            : undefined,
      },
    ],
  };
}

/** Peso de um corpo. */
export function peso(massa: number, gravidade = GRAVIDADE_PADRAO): number {
  return massa * gravidade;
}

export interface PlanoInclinado {
  readonly componentePeso: number;
  readonly normal: number;
  readonly atritoMaximo: number;
  readonly aceleracao: number;
  readonly desliza: boolean;
}

/**
 * Bloco em plano inclinado, com atrito.
 *
 * O exercício que mais aparece em prova, e o que melhor mostra para que serve
 * decompor vetores: o peso se divide em uma componente que puxa o bloco para
 * baixo do plano e outra que o aperta contra a superfície.
 */
export function planoInclinadoComPassos(
  massa: number,
  anguloGraus: number,
  coeficienteAtrito: number,
  gravidade = GRAVIDADE_PADRAO,
): Resolucao<PlanoInclinado> {
  if (massa <= 0) {
    throw new ErroMatematico('A massa deve ser positiva.');
  }

  if (anguloGraus < 0 || anguloGraus > 90) {
    throw new ErroMatematico('O ângulo do plano deve estar entre 0° e 90°.');
  }

  if (coeficienteAtrito < 0) {
    throw new ErroMatematico('O coeficiente de atrito não é negativo.');
  }

  const radianos = paraRadianos(anguloGraus);
  const pesoTotal = massa * gravidade;

  const componentePeso = pesoTotal * Math.sin(radianos);
  const normal = pesoTotal * Math.cos(radianos);
  const atritoMaximo = coeficienteAtrito * normal;

  const desliza = componentePeso > atritoMaximo;
  const aceleracao = desliza ? (componentePeso - atritoMaximo) / massa : 0;

  const passos: Passo[] = [
    {
      descricao: 'Decompomos o peso em componentes paralela e perpendicular ao plano.',
      tex: `P = mg = ${formatar(Number(pesoTotal.toFixed(3)))}\\,\\text{N}`,
    },
    {
      descricao: 'A componente paralela é a que tende a fazer o bloco descer.',
      tex: `P_x = mg\\sin\\theta = ${formatar(Number(componentePeso.toFixed(3)))}\\,\\text{N}`,
      nota: 'Seno, porque é o cateto oposto ao ângulo do plano.',
    },
    {
      descricao: 'A perpendicular aperta o bloco contra a superfície e define a normal.',
      tex: `N = mg\\cos\\theta = ${formatar(Number(normal.toFixed(3)))}\\,\\text{N}`,
    },
    {
      descricao: 'O atrito máximo é proporcional à normal.',
      tex: `f_{max} = \\mu N = ${formatar(Number(atritoMaximo.toFixed(3)))}\\,\\text{N}`,
      nota: 'O atrito não depende da área de contato, mas de quanto o corpo é comprimido.',
    },
  ];

  passos.push(
    desliza
      ? {
          descricao: 'A componente do peso vence o atrito: o bloco desliza.',
          tex: `a = \\frac{P_x - f_{max}}{m} = ${formatar(Number(aceleracao.toFixed(4)))}\\,\\text{m/s}^{2}`,
        }
      : {
          descricao: 'O atrito dá conta da componente do peso: o bloco fica parado.',
          tex: `P_x \\le f_{max} \\;\\Rightarrow\\; a = 0`,
          nota: 'Nesse caso o atrito vale exatamente Pₓ, não o máximo.',
        },
  );

  return {
    resultado: { componentePeso, normal, atritoMaximo, aceleracao, desliza },
    passos,
  };
}

/** Ângulo em que o bloco começa a deslizar: tan θ = μ. */
export function anguloCriticoComPassos(coeficienteAtrito: number): Resolucao<number> {
  if (coeficienteAtrito < 0) {
    throw new ErroMatematico('O coeficiente de atrito não é negativo.');
  }

  const resultado = (Math.atan(coeficienteAtrito) * 180) / Math.PI;

  return {
    resultado,
    passos: [
      {
        descricao: 'O bloco começa a deslizar quando a componente do peso iguala o atrito máximo.',
        tex: 'mg\\sin\\theta = \\mu\\, mg\\cos\\theta',
      },
      {
        descricao: 'A massa e a gravidade se cancelam dos dois lados.',
        tex: '\\tan\\theta = \\mu',
        nota: 'O ângulo crítico não depende da massa: um bloco leve e um pesado deslizam juntos.',
      },
      {
        descricao: 'Tomando o arco-tangente.',
        tex: `\\theta = \\arctan ${formatar(coeficienteAtrito)} = ${formatar(Number(resultado.toFixed(2)))}^\\circ`,
      },
    ],
  };
}
