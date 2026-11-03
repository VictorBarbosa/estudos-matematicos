import { Passo, Resolucao } from '@core/math/tipos/tipos';
import { formatar, formatarEmTexto } from '@core/math/algebra/polinomio/polinomio';

/**
 * Transferência de calor.
 *
 * Calor é energia em trânsito, e ela viaja de três maneiras: por contato
 * (condução), carregada por um fluido que se move (convecção) e por ondas
 * eletromagnéticas, que atravessam o vácuo (radiação). Num veículo espacial as
 * duas primeiras praticamente não existem do lado de fora — só a radiação
 * sobra, e é por isso que o controle térmico orbital é um problema de
 * emissividade e de área, não de ventilação.
 *
 * As três leis têm formas parecidas, mas uma diferença decisiva: condução e
 * convecção são lineares na diferença de temperatura, e a radiação vai com a
 * QUARTA potência da temperatura absoluta. Dobrar a temperatura em kelvin
 * multiplica a emissão por dezesseis.
 */

/** Constante de Stefan-Boltzmann, em W/(m²·K⁴). */
export const STEFAN_BOLTZMANN = 5.670374419e-8;

/** O zero da escala Celsius, em kelvin. */
export const ZERO_CELSIUS = 273.15;

/** Condutividades típicas, em W/(m·K) — a faixa cobre quatro ordens de grandeza. */
export const CONDUTIVIDADES: readonly { readonly material: string; readonly k: number }[] = [
  { material: 'cobre', k: 401 },
  { material: 'alumínio', k: 237 },
  { material: 'aço inoxidável', k: 16 },
  { material: 'vidro', k: 0.8 },
  { material: 'água', k: 0.6 },
  { material: 'madeira', k: 0.12 },
  { material: 'lã de vidro', k: 0.04 },
  { material: 'ar parado', k: 0.026 },
];

export function condutividadeDe(material: string): number | undefined {
  return CONDUTIVIDADES.find((item) => item.material === material)?.k;
}

export function paraKelvin(celsius: number): number {
  return celsius + ZERO_CELSIUS;
}

/**
 * Condução pela lei de Fourier: `Q/t = kA ΔT / L`.
 *
 * É a lei que explica por que uma parede grossa isola melhor e por que um
 * metal esfria a mão mais rápido que a madeira na mesma temperatura.
 */
export function conducaoComPassos(
  k: number,
  area: number,
  deltaT: number,
  espessura: number,
): Resolucao<number> {
  const resultado = (k * area * deltaT) / espessura;

  const passos: Passo[] = [
    {
      descricao: 'A lei de Fourier liga o fluxo à diferença de temperatura e à geometria.',
      tex: '\\frac{Q}{t} = \\frac{kA\\,\\Delta T}{L}',
      nota: 'Mais área e mais diferença aumentam o fluxo; mais espessura o reduz.',
    },
    {
      descricao: 'Substituindo os valores.',
      tex:
        `\\frac{${formatar(k)} \\cdot ${formatar(area)} \\cdot ${formatar(deltaT)}}{${formatar(espessura)}} = ` +
        `${formatar(Number(resultado.toFixed(4)))}\\ \\text{W}`,
    },
    {
      descricao: 'O resultado é uma potência: energia por unidade de tempo.',
      tex: `\\frac{Q}{t} = ${formatar(Number(resultado.toFixed(4)))}\\ \\text{W}`,
      nota:
        k > 100
          ? 'Condutividade alta: o material conduz bem e isola mal.'
          : 'Condutividade baixa: é disso que são feitos os isolantes.',
    },
  ];

  return { resultado, passos };
}

/** A resistência térmica de uma camada, que é o que se soma em série. */
export function resistenciaTermicaComPassos(
  espessura: number,
  k: number,
  area: number,
): Resolucao<number> {
  const resultado = espessura / (k * area);

  const passos: Passo[] = [
    {
      descricao: 'A resistência térmica é o análogo da resistência elétrica.',
      tex: 'R = \\frac{L}{kA}',
      nota: 'Diferença de temperatura faz o papel da tensão, e o fluxo, o da corrente.',
    },
    {
      descricao: 'Substituindo.',
      tex:
        `R = \\frac{${formatar(espessura)}}{${formatar(k)} \\cdot ${formatar(area)}} = ` +
        `${formatar(Number(resultado.toFixed(6)))}\\ \\text{K/W}`,
    },
    {
      descricao: 'Camadas em série somam resistências, como resistores.',
      tex: 'R_{total} = R_{1} + R_{2} + \\cdots',
      nota: 'É por isso que uma parede dupla isola muito mais que uma simples do mesmo total.',
    },
  ];

  return { resultado, passos };
}

/** Convecção pela lei de resfriamento de Newton: `Q/t = hA ΔT`. */
export function conveccaoComPassos(
  h: number,
  area: number,
  deltaT: number,
): Resolucao<number> {
  const resultado = h * area * deltaT;

  const passos: Passo[] = [
    {
      descricao: 'Na convecção, o fluido carrega o calor embora.',
      tex: '\\frac{Q}{t} = hA\\,\\Delta T',
      nota: 'O coeficiente h não é propriedade do material: depende do escoamento.',
    },
    {
      descricao: 'Substituindo.',
      tex:
        `${formatar(h)} \\cdot ${formatar(area)} \\cdot ${formatar(deltaT)} = ` +
        `${formatar(Number(resultado.toFixed(4)))}\\ \\text{W}`,
    },
    {
      descricao: 'Soprar sobre a superfície aumenta h, e com ele o fluxo.',
      tex: `\\frac{Q}{t} = ${formatar(Number(resultado.toFixed(4)))}\\ \\text{W}`,
      nota: 'É por isso que assoprar a comida esfria mais rápido que apenas esperar.',
    },
  ];

  return { resultado, passos };
}

/**
 * Radiação pela lei de Stefan-Boltzmann: `Q/t = εσA T⁴`.
 *
 * A quarta potência é o que separa esta lei das outras duas — e o que torna o
 * controle térmico de um satélite um problema de área e emissividade.
 */
export function radiacaoComPassos(
  emissividade: number,
  area: number,
  temperaturaKelvin: number,
): Resolucao<number> {
  const resultado = emissividade * STEFAN_BOLTZMANN * area * temperaturaKelvin ** 4;

  const passos: Passo[] = [
    {
      descricao: 'Todo corpo acima do zero absoluto irradia.',
      tex: '\\frac{Q}{t} = \\varepsilon\\sigma A T^{4}',
      nota: 'A temperatura precisa estar em kelvin: a quarta potência não perdoa escala errada.',
    },
    {
      descricao: 'A quarta potência da temperatura absoluta.',
      tex: `T^{4} = ${formatar(temperaturaKelvin)}^{4} = ${formatar(Number((temperaturaKelvin ** 4).toExponential(4)))}`,
    },
    {
      descricao: 'Multiplicando pela constante, pela área e pela emissividade.',
      tex: `\\frac{Q}{t} = ${formatar(Number(resultado.toFixed(4)))}\\ \\text{W}`,
      nota: 'Dobrar a temperatura em kelvin multiplica a emissão por dezesseis.',
    },
  ];

  return { resultado, passos };
}

/**
 * A temperatura de equilíbrio de um corpo que só troca calor por radiação.
 *
 * É o cálculo que dimensiona o radiador de um satélite: ele absorve do Sol e
 * emite para o espaço, e a temperatura se acomoda onde os dois se igualam.
 */
export function equilibrioRadiativoComPassos(
  potenciaAbsorvida: number,
  emissividade: number,
  area: number,
): Resolucao<number> {
  const resultado = (potenciaAbsorvida / (emissividade * STEFAN_BOLTZMANN * area)) ** 0.25;

  const passos: Passo[] = [
    {
      descricao: 'No equilíbrio, o que entra é igual ao que sai.',
      tex: 'P_{absorvida} = \\varepsilon\\sigma A T^{4}',
      nota: 'No vácuo não há condução nem convecção: só sobra a radiação.',
    },
    {
      descricao: 'Isolamos a quarta potência da temperatura.',
      tex:
        `T^{4} = \\frac{${formatar(potenciaAbsorvida)}}{${formatar(emissividade)} \\cdot \\sigma \\cdot ${formatar(area)}}`,
    },
    {
      descricao: 'E extraímos a raiz quarta.',
      tex: `T = ${formatar(Number(resultado.toFixed(4)))}\\ \\text{K}`,
      nota: `Isso equivale a ${formatarEmTexto(Number((resultado - ZERO_CELSIUS).toFixed(2)))} graus Celsius.`,
    },
  ];

  return { resultado, passos };
}

/** Calor sensível: `Q = mcΔT`, o que aquece sem mudar de fase. */
export function calorSensivelComPassos(
  massa: number,
  calorEspecifico: number,
  deltaT: number,
): Resolucao<number> {
  const resultado = massa * calorEspecifico * deltaT;

  const passos: Passo[] = [
    {
      descricao: 'O calor sensível muda a temperatura sem mudar o estado.',
      tex: 'Q = mc\\,\\Delta T',
    },
    {
      descricao: 'Substituindo.',
      tex:
        `Q = ${formatar(massa)} \\cdot ${formatar(calorEspecifico)} \\cdot ${formatar(deltaT)} = ` +
        `${formatar(Number(resultado.toFixed(4)))}\\ \\text{J}`,
    },
    {
      descricao: 'O calor específico é o preço de aquecer um quilo em um grau.',
      tex: `c = ${formatar(calorEspecifico)}\\ \\text{J/(kg}\\cdot\\text{K)}`,
      nota: 'A água tem um dos maiores de todos, e é por isso que ela serve de refrigerante.',
    },
  ];

  return { resultado, passos };
}

/**
 * A temperatura final de uma mistura, por conservação de energia.
 *
 * O calor que um corpo perde é exatamente o que o outro ganha — desde que o
 * recipiente seja isolado.
 */
export function equilibrioTermicoComPassos(
  m1: number,
  c1: number,
  t1: number,
  m2: number,
  c2: number,
  t2: number,
): Resolucao<number> {
  const resultado = (m1 * c1 * t1 + m2 * c2 * t2) / (m1 * c1 + m2 * c2);

  const passos: Passo[] = [
    {
      descricao: 'Num sistema isolado, a soma dos calores trocados é zero.',
      tex: 'Q_{1} + Q_{2} = 0',
      nota: 'Quem esfria cede exatamente o que quem esquenta recebe.',
    },
    {
      descricao: 'Escrevendo cada parcela com a temperatura final comum.',
      tex: `m_{1}c_{1}(T_{f} - ${formatar(t1)}) + m_{2}c_{2}(T_{f} - ${formatar(t2)}) = 0`,
    },
    {
      descricao: 'Isolando a temperatura final, aparece uma média ponderada.',
      tex: 'T_{f} = \\frac{m_{1}c_{1}T_{1} + m_{2}c_{2}T_{2}}{m_{1}c_{1} + m_{2}c_{2}}',
      nota: 'O peso de cada corpo é a sua capacidade térmica, não a sua massa sozinha.',
    },
    {
      descricao: 'Substituindo.',
      tex: `T_{f} = ${formatar(Number(resultado.toFixed(4)))}`,
    },
  ];

  return { resultado, passos };
}
