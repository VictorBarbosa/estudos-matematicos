import { ErroMatematico, Resolucao } from '@core/math/tipos/tipos';

/**
 * Ondas, som e óptica.
 *
 * Tudo aqui é a mesma ideia — uma perturbação que se propaga com velocidade
 * fixa pelo meio — vista de três lados: a relação v = λf, as frequências que
 * cabem num comprimento (harmônicos) e o desvio da luz ao trocar de meio.
 * Cada função devolve os passos com os números já substituídos.
 */

/** Intensidade de referência do limiar da audição, em W/m². */
export const I0_AUDICAO = 1e-12;

/** Velocidade da luz no vácuo, em m/s. */
export const C_LUZ = 3e8;

/** Número com vírgula decimal para o LaTeX. */
export function numeroOnda(v: number, casas = 2): string {
  return String(Number(v.toFixed(casas))).replace('.', '{,}');
}

/** 3,2 × 10⁻⁵ em LaTeX. */
export function notacaoCientificaTex(v: number, casas = 1): string {
  const [mantissa, expoente] = v.toExponential(casas).split('e');
  return `${mantissa!.replace('.', '{,}')} \\times 10^{${Number(expoente)}}`;
}

const graus = (radianos: number): number => (radianos * 180) / Math.PI;
const radianos = (g: number): number => (g * Math.PI) / 180;
const n = numeroOnda;

/** v = λ·f. */
export function velocidadeDaOndaComPassos(
  comprimento: number,
  frequencia: number,
): Resolucao<number> {
  const resultado = comprimento * frequencia;
  return {
    resultado,
    passos: [
      {
        descricao: 'Em um período a onda avança um comprimento de onda: v = λ·f.',
        tex: 'v = \\lambda f',
      },
      {
        descricao: 'Substituindo.',
        tex: `v = ${n(comprimento)} \\cdot ${n(frequencia)} = ${n(resultado)}\\ \\text{m/s}`,
      },
    ],
  };
}

/** v = √(T/μ) numa corda tensa. */
export function velocidadeNaCordaComPassos(
  tracao: number,
  densidadeLinear: number,
): Resolucao<number> {
  if (tracao <= 0 || densidadeLinear <= 0) {
    throw new ErroMatematico('Tração e densidade linear devem ser positivas.');
  }
  const razao = tracao / densidadeLinear;
  const resultado = Math.sqrt(razao);
  return {
    resultado,
    passos: [
      {
        descricao: 'Mais tração acelera a onda; mais massa por metro a freia.',
        tex: 'v = \\sqrt{\\frac{T}{\\mu}}',
      },
      {
        descricao: 'Substituindo e tirando a raiz.',
        tex: `v = \\sqrt{\\frac{${n(tracao)}}{${n(densidadeLinear, 4)}}} = \\sqrt{${n(razao)}} = ${n(resultado)}\\ \\text{m/s}`,
      },
    ],
  };
}

/**
 * Frequência do harmônico n numa corda (ou tubo aberto nas duas pontas) de
 * comprimento L: fₙ = n·v/(2L). Num tubo fechado numa ponta: fₙ = n·v/(4L),
 * só com n ímpar.
 */
export function harmonicoComPassos(
  ordem: number,
  comprimento: number,
  velocidade: number,
  fechado = false,
): Resolucao<number> {
  if (fechado && ordem % 2 === 0) {
    throw new ErroMatematico('Num tubo fechado só existem harmônicos ímpares.');
  }
  const divisor = fechado ? 4 : 2;
  const resultado = (ordem * velocidade) / (divisor * comprimento);
  return {
    resultado,
    passos: [
      {
        descricao: fechado
          ? 'Tubo fechado numa ponta: nó na ponta fechada, ventre na aberta. Cabem quartos de onda, e só os harmônicos ímpares existem.'
          : 'Pontas iguais (corda presa ou tubo aberto): cabem n meios comprimentos de onda em L.',
        tex: fechado
          ? 'L = n\\frac{\\lambda}{4} \\;\\Rightarrow\\; f_n = \\frac{n v}{4L}'
          : 'L = n\\frac{\\lambda}{2} \\;\\Rightarrow\\; f_n = \\frac{n v}{2L}',
      },
      {
        descricao: 'Substituindo.',
        tex: `f_{${ordem}} = \\frac{${ordem} \\cdot ${n(velocidade)}}{${divisor} \\cdot ${n(comprimento)}} = ${n(resultado)}\\ \\text{Hz}`,
      },
    ],
  };
}

/** Nível sonoro em decibéis: β = 10·log(I/I₀). */
export function nivelSonoroComPassos(intensidade: number): Resolucao<number> {
  if (intensidade <= 0) {
    throw new ErroMatematico('A intensidade deve ser positiva.');
  }
  const razao = intensidade / I0_AUDICAO;
  const logaritmo = Math.log10(razao);
  const resultado = 10 * logaritmo;
  return {
    resultado,
    passos: [
      {
        descricao:
          'O ouvido percebe razões, não diferenças: a escala é logarítmica, com I₀ = 10⁻¹² W/m².',
        tex: '\\beta = 10\\log\\frac{I}{I_0}',
      },
      {
        descricao: 'A razão entre a intensidade e a de referência.',
        tex: `\\frac{I}{I_0} = \\frac{${notacaoCientificaTex(intensidade)}}{10^{-12}} = ${notacaoCientificaTex(razao)}`,
      },
      {
        descricao: 'Dez vezes o logaritmo decimal.',
        tex: `\\beta = 10 \\cdot ${n(logaritmo, 4)} = ${n(resultado)}\\ \\text{dB}`,
      },
    ],
  };
}

/**
 * Efeito Doppler para o som: f′ = f·(v + vₒ)/(v − v_f), com vₒ positivo
 * quando o observador se aproxima e v_f positivo quando a fonte se aproxima.
 */
export function dopplerComPassos(
  frequencia: number,
  somNoAr: number,
  observador: number,
  fonte: number,
): Resolucao<number> {
  const numerador = somNoAr + observador;
  const denominador = somNoAr - fonte;
  if (denominador <= 0) {
    throw new ErroMatematico('A fonte não pode ir mais rápido que o som.');
  }
  const resultado = (frequencia * numerador) / denominador;
  const sinal = (v: number): string => (v >= 0 ? `+ ${n(v)}` : `- ${n(Math.abs(v))}`);
  return {
    resultado,
    passos: [
      {
        descricao:
          'Aproximar-se comprime as ondas e aumenta a frequência ouvida. Sinais: vₒ positivo se o observador se aproxima, v_f positivo se a fonte se aproxima.',
        tex: "f' = f\\,\\frac{v + v_o}{v - v_f}",
      },
      {
        descricao: `Substituindo, com o som a ${somNoAr} m/s.`,
        tex:
          `f' = ${n(frequencia)} \\cdot \\frac{${n(somNoAr)} ${sinal(observador)}}{${n(somNoAr)} ${sinal(-fonte)}}` +
          ` = ${n(frequencia)} \\cdot \\frac{${n(numerador)}}{${n(denominador)}} = ${n(resultado)}\\ \\text{Hz}`,
      },
    ],
  };
}

/** Snell: n₁ sen θ₁ = n₂ sen θ₂. Devolve θ₂ em graus, ou NaN se houver reflexão total. */
export function snellComPassos(n1: number, theta1Graus: number, n2: number): Resolucao<number> {
  const seno1 = Math.sin(radianos(theta1Graus));
  const seno2 = (n1 * seno1) / n2;
  const total = seno2 > 1;
  const resultado = total ? Number.NaN : graus(Math.asin(seno2));
  return {
    resultado,
    passos: [
      {
        descricao: 'A lei de Snell liga os ângulos medidos a partir da normal nos dois meios.',
        tex: 'n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2',
      },
      {
        descricao: 'Isolando o seno do ângulo refratado.',
        tex:
          `\\sin\\theta_2 = \\frac{${n(n1)} \\cdot \\sin ${n(theta1Graus)}^{\\circ}}{${n(n2)}}` +
          ` = \\frac{${n(n1)} \\cdot ${n(seno1, 4)}}{${n(n2)}} = ${n(seno2, 4)}`,
      },
      total
        ? {
            descricao: 'Um seno maior que 1 não existe: não há raio refratado, a luz reflete toda.',
            tex: '\\sin\\theta_2 > 1 \\;\\Rightarrow\\; \\text{reflexão total}',
          }
        : {
            descricao: 'O ângulo cujo seno é esse.',
            tex: `\\theta_2 = \\arcsin(${n(seno2, 4)}) = ${n(resultado)}^{\\circ}`,
          },
    ],
  };
}

/** Ângulo crítico de n₁ (mais refringente) para n₂: sen θc = n₂/n₁. */
export function anguloLimiteComPassos(n1: number, n2: number): Resolucao<number> {
  if (n2 >= n1) {
    throw new ErroMatematico('Só há ângulo crítico indo do meio mais refringente para o menos.');
  }
  const razao = n2 / n1;
  const resultado = graus(Math.asin(razao));
  return {
    resultado,
    passos: [
      {
        descricao: 'No ângulo crítico o raio refratado sai rasante: θ₂ = 90°, e sen 90° = 1.',
        tex: 'n_1 \\sin\\theta_c = n_2 \\sin 90^{\\circ} \\;\\Rightarrow\\; \\sin\\theta_c = \\frac{n_2}{n_1}',
      },
      {
        descricao: 'Substituindo e invertendo o seno.',
        tex: `\\theta_c = \\arcsin\\frac{${n(n2)}}{${n(n1)}} = \\arcsin(${n(razao, 4)}) = ${n(resultado)}^{\\circ}`,
      },
    ],
  };
}

/** Lente delgada (ou espelho): 1/f = 1/p + 1/p′. Devolve p′; positivo é imagem real. */
export function lenteDelgadaComPassos(focal: number, objeto: number): Resolucao<number> {
  const inverso = 1 / focal - 1 / objeto;
  if (Math.abs(inverso) < 1e-12) {
    throw new ErroMatematico('Objeto no foco: a imagem vai para o infinito.');
  }
  const resultado = 1 / inverso;
  return {
    resultado,
    passos: [
      {
        descricao: 'A equação de Gauss, que vale para lentes delgadas e espelhos esféricos.',
        tex: "\\frac{1}{f} = \\frac{1}{p} + \\frac{1}{p'}",
      },
      {
        descricao: 'Isolando 1/p′.',
        tex: `\\frac{1}{p'} = \\frac{1}{${n(focal)}} - \\frac{1}{${n(objeto)}} = ${n(inverso, 5)}`,
      },
      {
        descricao:
          resultado > 0
            ? 'p′ positivo: imagem real, do outro lado da lente.'
            : 'p′ negativo: imagem virtual, do mesmo lado do objeto.',
        tex: `p' = \\frac{1}{${n(inverso, 5)}} = ${n(resultado)}\\ \\text{cm}`,
      },
    ],
  };
}

/** Fenda dupla: posição da franja clara m, y = m·λ·L/d. Entradas em nm, m e mm; saída em mm. */
export function fendaDuplaComPassos(
  ordem: number,
  comprimentoNm: number,
  distanciaTela: number,
  separacaoMm: number,
): Resolucao<number> {
  const y = (ordem * comprimentoNm * 1e-9 * distanciaTela) / (separacaoMm * 1e-3);
  const resultado = y * 1e3;
  return {
    resultado,
    passos: [
      {
        descricao:
          'Franja clara: a diferença de caminho é um número inteiro de comprimentos de onda. Para ângulos pequenos, y = m·λ·L/d.',
        tex: 'y_m = \\frac{m \\lambda L}{d}',
      },
      {
        descricao: 'Tudo em metros: 1 nm = 10⁻⁹ m e 1 mm = 10⁻³ m.',
        tex:
          `y_{${ordem}} = \\frac{${ordem} \\cdot ${n(comprimentoNm)} \\times 10^{-9} \\cdot ${n(distanciaTela)}}` +
          `{${n(separacaoMm)} \\times 10^{-3}} = ${notacaoCientificaTex(y, 3)}\\ \\text{m}`,
      },
      {
        descricao: 'Em milímetros.',
        tex: `y_{${ordem}} = ${n(resultado)}\\ \\text{mm}`,
      },
    ],
  };
}
