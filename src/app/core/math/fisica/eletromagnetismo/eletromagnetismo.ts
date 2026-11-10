import { formatar } from '@core/math/algebra/polinomio/polinomio';
import { ErroMatematico, Passo, Resolucao } from '@core/math/tipos/tipos';

/**
 * Eletricidade e magnetismo (0P02).
 *
 * Cada função devolve o resultado com os passos e os números substituídos à
 * vista — a mesma regra das resoluções de mecânica. As entradas usam as
 * unidades em que os problemas são escritos (μC, cm, kΩ, μF) e a conversão
 * para o SI aparece como um passo, porque é nela que mais se erra.
 */

/** Constante de Coulomb, em N·m²/C². */
export const K_COULOMB = 8.99e9;

/** Permissividade do vácuo, em F/m. */
export const EPSILON_0 = 8.85e-12;

/** Permeabilidade do vácuo, em T·m/A. */
export const MU_0 = 4 * Math.PI * 1e-7;

/** Um número grande ou pequeno em LaTeX: 8{,}99 \times 10^{9}. */
export function cientificoTex(valor: number, casas = 3): string {
  if (valor === 0) return '0';
  const expoente = Math.floor(Math.log10(Math.abs(valor)));
  if (expoente >= -2 && expoente <= 4) return formatar(Number(valor.toPrecision(casas + 1)));
  const mantissa = Number((valor / 10 ** expoente).toFixed(casas));
  return `${formatar(mantissa)} \\times 10^{${expoente}}`;
}

/** O mesmo número em texto corrido: 8,99×10⁹. */
export function cientificoTexto(valor: number, casas = 3): string {
  if (valor === 0) return '0';
  const expoente = Math.floor(Math.log10(Math.abs(valor)));
  const decimal = (v: number): string => String(Number(v.toPrecision(casas + 1))).replace('.', ',');
  if (expoente >= -2 && expoente <= 4) return decimal(valor);
  const sobre = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const exp = String(expoente)
    .split('')
    .map((c) => (c === '-' ? '⁻' : sobre[Number(c)]))
    .join('');
  return `${decimal(valor / 10 ** expoente)}×10${exp}`;
}

const par = (v: number): string => (v < 0 ? `(${formatar(v)})` : formatar(v));

/** Lei de Coulomb entre duas cargas em μC separadas por r metros. Resultado em N, com sinal: + repulsão. */
export function coulombComPassos(q1MicroC: number, q2MicroC: number, r: number): Resolucao<number> {
  if (r <= 0) throw new ErroMatematico('A distância deve ser positiva.');
  const resultado = (K_COULOMB * q1MicroC * 1e-6 * q2MicroC * 1e-6) / (r * r);
  const passos: Passo[] = [
    {
      descricao: 'A força entre duas cargas pontuais cai com o QUADRADO da distância.',
      tex: 'F = k\\,\\frac{q_1 q_2}{r^{2}}',
    },
    {
      descricao: 'Microcoulomb para coulomb: 1 μC = 10⁻⁶ C.',
      tex: `q_1 = ${par(q1MicroC)} \\times 10^{-6}\\ \\text{C} \\qquad q_2 = ${par(q2MicroC)} \\times 10^{-6}\\ \\text{C}`,
    },
    {
      descricao: 'Substituindo, com a distância ao quadrado.',
      tex:
        `F = 8{,}99 \\times 10^{9} \\cdot \\frac{${par(q1MicroC)} \\times 10^{-6} \\cdot ${par(q2MicroC)} \\times 10^{-6}}{(${formatar(r)})^{2}}` +
        ` = ${cientificoTex(resultado)}\\ \\text{N}`,
      nota:
        resultado > 0
          ? 'Sinal positivo: cargas de mesmo sinal se repelem.'
          : 'Sinal negativo: cargas de sinais opostos se atraem.',
    },
  ];
  return { resultado, passos };
}

/** Campo de uma carga pontual (μC) a r metros, em N/C. */
export function campoPontualComPassos(qMicroC: number, r: number): Resolucao<number> {
  if (r <= 0) throw new ErroMatematico('A distância deve ser positiva.');
  const resultado = (K_COULOMB * Math.abs(qMicroC) * 1e-6) / (r * r);
  return {
    resultado,
    passos: [
      {
        descricao: 'O campo é a força por unidade de carga de prova: não depende de quem o mede.',
        tex: 'E = k\\,\\frac{|q|}{r^{2}}',
      },
      {
        descricao: 'Substituindo, com a carga em coulombs.',
        tex: `E = 8{,}99 \\times 10^{9} \\cdot \\frac{${formatar(Math.abs(qMicroC))} \\times 10^{-6}}{(${formatar(r)})^{2}} = ${cientificoTex(resultado)}\\ \\text{N/C}`,
        nota:
          qMicroC > 0
            ? 'Carga positiva: o campo aponta para FORA dela.'
            : 'Carga negativa: o campo aponta para DENTRO dela.',
      },
    ],
  };
}

/** Potencial de uma carga pontual (μC) a r metros, em V (com sinal). */
export function potencialPontualComPassos(qMicroC: number, r: number): Resolucao<number> {
  if (r <= 0) throw new ErroMatematico('A distância deve ser positiva.');
  const resultado = (K_COULOMB * qMicroC * 1e-6) / r;
  return {
    resultado,
    passos: [
      {
        descricao: 'O potencial cai com r (não com r²) e carrega o sinal da carga: é um escalar.',
        tex: 'V = k\\,\\frac{q}{r}',
      },
      {
        descricao: 'Substituindo.',
        tex: `V = 8{,}99 \\times 10^{9} \\cdot \\frac{${par(qMicroC)} \\times 10^{-6}}{${formatar(r)}} = ${cientificoTex(resultado)}\\ \\text{V}`,
      },
    ],
  };
}

/** Capacitor de placas paralelas: área em cm², distância em mm. Resultado em pF. */
export function capacitorPlanoComPassos(areaCm2: number, dMm: number): Resolucao<number> {
  if (areaCm2 <= 0 || dMm <= 0) throw new ErroMatematico('Área e distância devem ser positivas.');
  const farad = (EPSILON_0 * areaCm2 * 1e-4) / (dMm * 1e-3);
  const resultado = farad * 1e12;
  return {
    resultado,
    passos: [
      {
        descricao: 'A capacitância cresce com a área e cai com a separação.',
        tex: 'C = \\frac{\\varepsilon_0 A}{d}',
      },
      {
        descricao: 'Para o SI: 1 cm² = 10⁻⁴ m² e 1 mm = 10⁻³ m.',
        tex: `A = ${formatar(areaCm2)} \\times 10^{-4}\\ \\text{m}^{2} \\qquad d = ${formatar(dMm)} \\times 10^{-3}\\ \\text{m}`,
      },
      {
        descricao: 'Substituindo, e passando para picofarads (1 pF = 10⁻¹² F).',
        tex: `C = \\frac{8{,}85 \\times 10^{-12} \\cdot ${formatar(areaCm2)} \\times 10^{-4}}{${formatar(dMm)} \\times 10^{-3}} = ${cientificoTex(farad)}\\ \\text{F} = ${formatar(Number(resultado.toFixed(3)))}\\ \\text{pF}`,
      },
    ],
  };
}

export type Associacao = 'serie' | 'paralelo';

/**
 * Associação de resistores ou de capacitores.
 *
 * As regras são espelhadas: resistores em série somam e capacitores em
 * paralelo somam; o outro caso é o inverso da soma dos inversos.
 */
export function associacaoComPassos(
  valores: readonly number[],
  tipo: Associacao,
  elemento: 'resistor' | 'capacitor',
): Resolucao<number> {
  if (valores.length < 2 || valores.some((v) => v <= 0)) {
    throw new ErroMatematico('São precisos ao menos dois valores positivos.');
  }
  const soma = (elemento === 'resistor') === (tipo === 'serie');
  const simbolo = elemento === 'resistor' ? 'R' : 'C';
  const lista = valores.map((v) => formatar(v));
  if (soma) {
    const resultado = valores.reduce((a, b) => a + b, 0);
    return {
      resultado,
      passos: [
        {
          descricao:
            elemento === 'resistor'
              ? 'Em série a corrente atravessa um depois do outro: as resistências se somam.'
              : 'Em paralelo as placas se juntam numa área maior: as capacitâncias se somam.',
          tex: `${simbolo}_{eq} = ${lista.join(' + ')} = ${formatar(resultado)}`,
        },
      ],
    };
  }
  const inversos = valores.reduce((a, b) => a + 1 / b, 0);
  const resultado = 1 / inversos;
  return {
    resultado,
    passos: [
      {
        descricao:
          elemento === 'resistor'
            ? 'Em paralelo a corrente ganha caminhos: somam-se os INVERSOS.'
            : 'Em série a carga é a mesma em todos: somam-se os INVERSOS.',
        tex: `\\frac{1}{${simbolo}_{eq}} = ${lista.map((v) => `\\frac{1}{${v}}`).join(' + ')} = ${formatar(Number(inversos.toFixed(6)))}`,
      },
      {
        descricao: 'Invertendo. O equivalente fica MENOR que o menor dos valores.',
        tex: `${simbolo}_{eq} = \\frac{1}{${formatar(Number(inversos.toFixed(6)))}} = ${formatar(Number(resultado.toFixed(4)))}`,
      },
    ],
  };
}

/** Carga de um capacitor no circuito RC: R em kΩ, C em μF, fonte V, tempo em s. Resultado em μC. */
export function cargaRcComPassos(
  rKohm: number,
  cMicroF: number,
  v: number,
  t: number,
): Resolucao<number> {
  if (rKohm <= 0 || cMicroF <= 0) throw new ErroMatematico('R e C devem ser positivos.');
  const tau = rKohm * 1e3 * cMicroF * 1e-6;
  const qMax = cMicroF * v;
  const fracao = 1 - Math.exp(-t / tau);
  const resultado = qMax * fracao;
  return {
    resultado,
    passos: [
      {
        descricao: 'A constante de tempo é RC, com R em ohms e C em farads.',
        tex: `\\tau = RC = ${formatar(rKohm)} \\times 10^{3} \\cdot ${formatar(cMicroF)} \\times 10^{-6} = ${formatar(Number(tau.toFixed(4)))}\\ \\text{s}`,
      },
      {
        descricao: 'A carga final é CV.',
        tex: `Q = CV = ${formatar(cMicroF)}\\ \\mu\\text{F} \\cdot ${formatar(v)}\\ \\text{V} = ${formatar(qMax)}\\ \\mu\\text{C}`,
      },
      {
        descricao: 'A carga cresce como 1 − e elevado a (−t/τ).',
        tex:
          `q(${formatar(t)}) = ${formatar(qMax)}\\left(1 - e^{-${formatar(t)}/${formatar(Number(tau.toFixed(4)))}}\\right)` +
          ` = ${formatar(qMax)} \\cdot ${formatar(Number(fracao.toFixed(4)))} = ${formatar(Number(resultado.toFixed(3)))}\\ \\mu\\text{C}`,
      },
    ],
  };
}

/** Força magnética numa carga (μC) com velocidade v (m/s) em campo B (T), ângulo em graus. Em N. */
export function lorentzComPassos(
  qMicroC: number,
  v: number,
  b: number,
  anguloGraus: number,
): Resolucao<number> {
  const seno = Math.sin((anguloGraus * Math.PI) / 180);
  const resultado = Math.abs(qMicroC) * 1e-6 * v * b * seno;
  return {
    resultado,
    passos: [
      {
        descricao: 'Só a componente da velocidade PERPENDICULAR ao campo conta: por isso o seno.',
        tex: 'F = |q|\\,v\\,B\\sin\\theta',
      },
      {
        descricao: 'Substituindo, com a carga em coulombs.',
        tex: `F = ${formatar(Math.abs(qMicroC))} \\times 10^{-6} \\cdot ${cientificoTex(v)} \\cdot ${formatar(b)} \\cdot \\sin ${formatar(anguloGraus)}^{\\circ} = ${cientificoTex(resultado)}\\ \\text{N}`,
        nota: 'A força é perpendicular à velocidade: muda a direção, nunca a rapidez.',
      },
    ],
  };
}

/** Campo de um fio longo: corrente em A, distância em cm. Resultado em μT. */
export function campoFioComPassos(corrente: number, rCm: number): Resolucao<number> {
  if (rCm <= 0) throw new ErroMatematico('A distância deve ser positiva.');
  const tesla = (MU_0 * corrente) / (2 * Math.PI * rCm * 1e-2);
  const resultado = tesla * 1e6;
  return {
    resultado,
    passos: [
      {
        descricao: 'O campo circula em volta do fio e cai com 1/r.',
        tex: 'B = \\frac{\\mu_0 I}{2\\pi r}',
      },
      {
        descricao: 'Com μ₀ = 4π × 10⁻⁷, o π se cancela, e a distância vai em metros.',
        tex: `B = \\frac{4\\pi \\times 10^{-7} \\cdot ${formatar(corrente)}}{2\\pi \\cdot ${formatar(rCm)} \\times 10^{-2}} = ${cientificoTex(tesla)}\\ \\text{T} = ${formatar(Number(resultado.toFixed(3)))}\\ \\mu\\text{T}`,
      },
    ],
  };
}

/** Faraday: N espiras de área A (cm²), campo de b1 a b2 (T) em Δt (s), perpendicular. Resultado: |ε| em V. */
export function faradayComPassos(
  n: number,
  areaCm2: number,
  b1: number,
  b2: number,
  dt: number,
): Resolucao<number> {
  if (dt <= 0) throw new ErroMatematico('O intervalo de tempo deve ser positivo.');
  const dPhi = (b2 - b1) * areaCm2 * 1e-4;
  const resultado = Math.abs((n * dPhi) / dt);
  return {
    resultado,
    passos: [
      {
        descricao: 'O fluxo é campo vezes área (campo perpendicular à espira).',
        tex: '\\Phi = BA',
      },
      {
        descricao: 'A variação do fluxo, com a área no SI.',
        tex: `\\Delta\\Phi = (${formatar(b2)} - ${par(b1)}) \\cdot ${formatar(areaCm2)} \\times 10^{-4} = ${cientificoTex(dPhi)}\\ \\text{Wb}`,
      },
      {
        descricao:
          'Faraday: a fem é N vezes a taxa de variação do fluxo (o sinal, pela lei de Lenz, só diz o sentido).',
        tex: `|\\varepsilon| = N\\,\\frac{|\\Delta\\Phi|}{\\Delta t} = ${formatar(n)} \\cdot \\frac{${cientificoTex(Math.abs(dPhi))}}{${formatar(dt)}} = ${formatar(Number(resultado.toFixed(4)))}\\ \\text{V}`,
      },
    ],
  };
}
