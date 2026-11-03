import { Passo, Resolucao } from '@core/math/tipos/tipos';
import { formatar, formatarEmTexto } from '@core/math/algebra/polinomio/polinomio';

/**
 * Rotação: do movimento circular ao momento angular.
 *
 * Tudo aqui é a mecânica de translação traduzida para o giro — massa vira
 * momento de inércia, força vira torque, momento linear vira momento angular.
 * A tradução é tão fiel que as fórmulas se parecem uma a uma, e é por isso que
 * vale aprender o dicionário em vez de decorar duas listas.
 *
 * O que não se traduz é o detalhe que importa: o momento de inércia depende de
 * ONDE a massa está, não só de quanto ela é. É por isso que uma patinadora
 * acelera ao recolher os braços e que um satélite se estabiliza girando.
 */

/** Um corpo rígido cujo momento de inércia tem fórmula fechada. */
export interface CorpoRigido {
  readonly nome: string;
  /** O fator k de `I = k·m·r²`. */
  readonly fator: number;
  readonly fatorTex: string;
  readonly observacao: string;
}

/**
 * Os corpos que aparecem em qualquer problema de rotação.
 *
 * Repare que o fator cresce conforme a massa se afasta do eixo: a casca
 * cilíndrica, com tudo na borda, tem o dobro do fator do disco maciço.
 */
export const CORPOS_RIGIDOS: readonly CorpoRigido[] = [
  {
    nome: 'partícula',
    fator: 1,
    fatorTex: '1',
    observacao: 'Toda a massa à distância r do eixo — é o caso de referência.',
  },
  {
    nome: 'casca cilíndrica',
    fator: 1,
    fatorTex: '1',
    observacao: 'Um aro, ou um tubo de parede fina: tudo na borda.',
  },
  {
    nome: 'disco ou cilindro maciço',
    fator: 0.5,
    fatorTex: '\\frac{1}{2}',
    observacao: 'Metade da massa está perto do eixo, e por isso o fator cai.',
  },
  {
    nome: 'esfera maciça',
    fator: 0.4,
    fatorTex: '\\frac{2}{5}',
    observacao: 'A massa se concentra ainda mais perto do centro.',
  },
  {
    nome: 'casca esférica',
    fator: 2 / 3,
    fatorTex: '\\frac{2}{3}',
    observacao: 'Mesmo raio, massa toda na superfície — fator maior que o da esfera maciça.',
  },
  {
    nome: 'barra pelo centro',
    fator: 1 / 12,
    fatorTex: '\\frac{1}{12}',
    observacao: 'Aqui r é o comprimento total, e não a distância ao eixo.',
  },
  {
    nome: 'barra pela ponta',
    fator: 1 / 3,
    fatorTex: '\\frac{1}{3}',
    observacao: 'A mesma barra girando pela extremidade resiste quatro vezes mais.',
  },
];

export function corpoPorNome(nome: string): CorpoRigido | undefined {
  return CORPOS_RIGIDOS.find((corpo) => corpo.nome === nome);
}

export function momentoDeInercia(corpo: CorpoRigido, massa: number, raio: number): number {
  return corpo.fator * massa * raio * raio;
}

/** `ω = 2π/T`, a ponte entre período e velocidade angular. */
export function velocidadeAngular(periodo: number): number {
  return (2 * Math.PI) / periodo;
}

export function velocidadeTangencial(omega: number, raio: number): number {
  return omega * raio;
}

export function aceleracaoCentripeta(velocidade: number, raio: number): number {
  return (velocidade * velocidade) / raio;
}

/**
 * O movimento circular uniforme, do período à força centrípeta.
 *
 * A pergunta que o tópico responde é por que existe aceleração mesmo com
 * velocidade de módulo constante: o vetor muda de direção, e mudar de direção
 * já é acelerar.
 */
export function movimentoCircularComPassos(
  periodo: number,
  raio: number,
  massa: number,
): Resolucao<number> {
  const omega = velocidadeAngular(periodo);
  const v = velocidadeTangencial(omega, raio);
  const resultado = aceleracaoCentripeta(v, raio);

  const passos: Passo[] = [
    {
      descricao: 'A velocidade angular é uma volta inteira dividida pelo período.',
      tex: `\\omega = \\frac{2\\pi}{T} = \\frac{2\\pi}{${formatar(periodo)}} = ${formatar(Number(omega.toFixed(4)))}\\ \\text{rad/s}`,
    },
    {
      descricao: 'A velocidade tangencial é a angular multiplicada pelo raio.',
      tex: `v = \\omega r = ${formatar(Number(omega.toFixed(4)))} \\cdot ${formatar(raio)} = ${formatar(Number(v.toFixed(4)))}\\ \\text{m/s}`,
      nota: 'Pontos mais afastados do eixo percorrem mais caminho no mesmo tempo.',
    },
    {
      descricao: 'E a aceleração centrípeta sai da velocidade e do raio.',
      tex:
        `a_{c} = \\frac{v^{2}}{r} = \\frac{${formatar(Number((v * v).toFixed(4)))}}{${formatar(raio)}} = ` +
        `${formatar(Number(resultado.toFixed(4)))}\\ \\text{m/s}^{2}`,
      nota: 'Ela aponta sempre para o centro, e é ela que curva a trajetória.',
    },
    {
      descricao: `Com massa de ${formatarEmTexto(massa)} quilogramas, a força que mantém o giro é esta.`,
      tex: `F_{c} = ma_{c} = ${formatar(Number((massa * resultado).toFixed(4)))}\\ \\text{N}`,
      nota: 'Força centrípeta não é uma força nova: é o nome do papel que alguma força cumpre.',
    },
  ];

  return { resultado, passos };
}

/** A segunda lei de Newton em versão rotacional: `τ = Iα`. */
export function segundaLeiRotacionalComPassos(
  corpo: CorpoRigido,
  massa: number,
  raio: number,
  torque: number,
): Resolucao<number> {
  const inercia = momentoDeInercia(corpo, massa, raio);
  const resultado = torque / inercia;

  const passos: Passo[] = [
    {
      descricao: `O momento de inércia de ${corpo.nome} tem fórmula fechada.`,
      tex: `I = ${corpo.fatorTex}mr^{2} = ${corpo.fatorTex} \\cdot ${formatar(massa)} \\cdot ${formatar(raio)}^{2} = ${formatar(Number(inercia.toFixed(4)))}\\ \\text{kg}\\cdot\\text{m}^{2}`,
      nota: corpo.observacao,
    },
    {
      descricao: 'O torque faz pela rotação o que a força faz pela translação.',
      tex: '\\tau = I\\alpha',
      nota: 'Massa vira momento de inércia, força vira torque, aceleração vira aceleração angular.',
    },
    {
      descricao: 'Isolando a aceleração angular.',
      tex:
        `\\alpha = \\frac{\\tau}{I} = \\frac{${formatar(torque)}}{${formatar(Number(inercia.toFixed(4)))}} = ` +
        `${formatar(Number(resultado.toFixed(4)))}\\ \\text{rad/s}^{2}`,
    },
  ];

  return { resultado, passos };
}

/** A energia cinética de rotação, `½Iω²`. */
export function energiaDeRotacaoComPassos(
  corpo: CorpoRigido,
  massa: number,
  raio: number,
  omega: number,
): Resolucao<number> {
  const inercia = momentoDeInercia(corpo, massa, raio);
  const resultado = 0.5 * inercia * omega * omega;

  const passos: Passo[] = [
    {
      descricao: `Começamos pelo momento de inércia de ${corpo.nome}.`,
      tex: `I = ${corpo.fatorTex}mr^{2} = ${formatar(Number(inercia.toFixed(4)))}\\ \\text{kg}\\cdot\\text{m}^{2}`,
    },
    {
      descricao: 'A energia de rotação copia a de translação, trocando massa por inércia.',
      tex: 'K_{rot} = \\frac{1}{2}I\\omega^{2}',
      nota: 'A mesma forma de meia massa vezes velocidade ao quadrado.',
    },
    {
      descricao: 'Substituindo.',
      tex:
        `K_{rot} = \\frac{1}{2} \\cdot ${formatar(Number(inercia.toFixed(4)))} \\cdot ${formatar(omega)}^{2} = ` +
        `${formatar(Number(resultado.toFixed(4)))}\\ \\text{J}`,
    },
  ];

  return { resultado, passos };
}

/** O momento angular de um corpo rígido, `L = Iω`. */
export function momentoAngularComPassos(
  corpo: CorpoRigido,
  massa: number,
  raio: number,
  omega: number,
): Resolucao<number> {
  const inercia = momentoDeInercia(corpo, massa, raio);
  const resultado = inercia * omega;

  const passos: Passo[] = [
    {
      descricao: `O momento de inércia de ${corpo.nome}.`,
      tex: `I = ${corpo.fatorTex}mr^{2} = ${formatar(Number(inercia.toFixed(4)))}\\ \\text{kg}\\cdot\\text{m}^{2}`,
    },
    {
      descricao: 'O momento angular é o análogo rotacional do momento linear.',
      tex: 'L = I\\omega \\qquad \\text{assim como} \\qquad p = mv',
    },
    {
      descricao: 'Substituindo.',
      tex:
        `L = ${formatar(Number(inercia.toFixed(4)))} \\cdot ${formatar(omega)} = ` +
        `${formatar(Number(resultado.toFixed(4)))}\\ \\text{kg}\\cdot\\text{m}^{2}\\text{/s}`,
    },
  ];

  return { resultado, passos };
}

/**
 * A conservação do momento angular — a patinadora que recolhe os braços.
 *
 * Sem torque externo, `Iω` não muda. Diminuir a inércia obriga a velocidade
 * angular a crescer, e é assim que um satélite controla sua rotação sem gastar
 * combustível.
 */
export function conservacaoAngularComPassos(
  inerciaInicial: number,
  omegaInicial: number,
  inerciaFinal: number,
): Resolucao<number> {
  const resultado = (inerciaInicial * omegaInicial) / inerciaFinal;
  const energiaAntes = 0.5 * inerciaInicial * omegaInicial ** 2;
  const energiaDepois = 0.5 * inerciaFinal * resultado ** 2;

  const passos: Passo[] = [
    {
      descricao: 'Sem torque externo, o momento angular total não muda.',
      tex: 'I_{1}\\omega_{1} = I_{2}\\omega_{2}',
      nota: 'É a mesma ideia da conservação do momento linear, aplicada ao giro.',
    },
    {
      descricao: 'Calculamos o momento angular inicial.',
      tex: `L = ${formatar(inerciaInicial)} \\cdot ${formatar(omegaInicial)} = ${formatar(Number((inerciaInicial * omegaInicial).toFixed(4)))}`,
    },
    {
      descricao: 'E dividimos pela nova inércia para achar a nova velocidade angular.',
      tex:
        `\\omega_{2} = \\frac{${formatar(Number((inerciaInicial * omegaInicial).toFixed(4)))}}{${formatar(inerciaFinal)}} = ` +
        `${formatar(Number(resultado.toFixed(4)))}\\ \\text{rad/s}`,
    },
    {
      descricao: 'A energia de rotação, porém, mudou.',
      tex:
        `K_{1} = ${formatar(Number(energiaAntes.toFixed(2)))}\\ \\text{J} \\qquad ` +
        `K_{2} = ${formatar(Number(energiaDepois.toFixed(2)))}\\ \\text{J}`,
      nota:
        energiaDepois > energiaAntes
          ? 'A energia aumentou porque quem recolheu os braços realizou trabalho para isso.'
          : 'A energia diminuiu: afastar a massa do eixo contra a rotação consome trabalho.',
    },
  ];

  return { resultado, passos };
}

/** O momento angular de uma partícula em relação a um ponto: `L = mvr⊥`. */
export function momentoAngularDePartiComPassos(
  massa: number,
  velocidade: number,
  distancia: number,
  anguloGraus: number,
): Resolucao<number> {
  const seno = Math.sin((anguloGraus * Math.PI) / 180);
  const braco = distancia * seno;
  const resultado = massa * velocidade * braco;

  const passos: Passo[] = [
    {
      descricao: 'Para uma partícula, o momento angular usa a distância perpendicular.',
      tex: 'L = mvr\\operatorname{sen}\\theta',
      nota: 'Só a parte da velocidade perpendicular ao raio contribui para o giro.',
    },
    {
      descricao: `O braço efetivo é o raio vezes o seno de ${formatarEmTexto(anguloGraus)} graus.`,
      tex: `r_{\\perp} = ${formatar(distancia)}\\operatorname{sen}${formatar(anguloGraus)}^\\circ = ${formatar(Number(braco.toFixed(4)))}\\ \\text{m}`,
    },
    {
      descricao: 'Multiplicando pela massa e pela velocidade.',
      tex:
        `L = ${formatar(massa)} \\cdot ${formatar(velocidade)} \\cdot ${formatar(Number(braco.toFixed(4)))} = ` +
        `${formatar(Number(resultado.toFixed(4)))}\\ \\text{kg}\\cdot\\text{m}^{2}\\text{/s}`,
      nota:
        anguloGraus === 90
          ? 'Com ângulo reto o braço é o próprio raio, e o momento angular é máximo.'
          : 'Com a velocidade alinhada ao raio o momento angular seria zero.',
    },
  ];

  return { resultado, passos };
}

/**
 * O rolamento sem deslizar, em que translação e rotação se amarram.
 *
 * A energia se reparte entre as duas, e a proporção depende só do formato —
 * é por isso que, numa rampa, uma esfera sempre chega antes de um aro.
 */
export function rolamentoComPassos(
  corpo: CorpoRigido,
  altura: number,
  gravidade = 9.81,
): Resolucao<number> {
  // mgh = ½mv² + ½Iω², com ω = v/r e I = k m r²  ⟹  v = √(2gh/(1+k))
  const resultado = Math.sqrt((2 * gravidade * altura) / (1 + corpo.fator));
  const fracaoRotacional = corpo.fator / (1 + corpo.fator);

  const passos: Passo[] = [
    {
      descricao: 'Toda a energia potencial vira cinética, repartida entre transladar e girar.',
      tex: 'mgh = \\frac{1}{2}mv^{2} + \\frac{1}{2}I\\omega^{2}',
    },
    {
      descricao: 'Rolar sem deslizar amarra as duas velocidades.',
      tex: '\\omega = \\frac{v}{r}',
      nota: 'É essa condição que torna o problema resolvível com uma incógnita só.',
    },
    {
      descricao: `Com o momento de inércia de ${corpo.nome}, a massa e o raio se cancelam.`,
      tex: `v = \\sqrt{\\frac{2gh}{1 + ${corpo.fatorTex}}}`,
      nota: 'O resultado não depende da massa nem do raio: só do formato.',
    },
    {
      descricao: `Com altura de ${formatarEmTexto(altura)} metros.`,
      tex: `v = ${formatar(Number(resultado.toFixed(4)))}\\ \\text{m/s}`,
      nota: `Do total, ${formatarEmTexto(Number((fracaoRotacional * 100).toFixed(1)))} por cento da energia ficou na rotação.`,
    },
  ];

  return { resultado, passos };
}
