import { ErroMatematico, Resolucao } from '@core/math/tipos/tipos';
import { cientificoTex, numeroOnda as n } from '@core/math/fisica/ondas/ondas';

/**
 * Física moderna: relatividade restrita e a luz como partícula.
 *
 * Duas surpresas do começo do século XX, ambas com contas curtas: o tempo e o
 * comprimento dependem de quem mede (fator γ), e a luz troca energia em
 * pacotes de tamanho hf. As constantes usam os valores arredondados dos
 * livros-texto, para que as contas fechem à mão.
 */

/** h·c em eV·nm: a conversão direta entre comprimento de onda e energia do fóton. */
export const HC_EV_NM = 1240;

/** Constante de Planck em eV·s e em J·s. */
export const H_EV_S = 4.136e-15;
export const H_J_S = 6.626e-34;

/** Massa do elétron, em kg, e sua energia de repouso, em keV. */
export const MASSA_ELETRON = 9.11e-31;
export const REPOUSO_ELETRON_KEV = 511;

/** γ = 1/√(1 − β²), com β = v/c. */
export function fatorDeLorentzComPassos(beta: number): Resolucao<number> {
  if (beta < 0 || beta >= 1) {
    throw new ErroMatematico('A velocidade deve estar entre 0 e c.');
  }
  const quadrado = beta * beta;
  const raiz = Math.sqrt(1 - quadrado);
  const resultado = 1 / raiz;
  return {
    resultado,
    passos: [
      {
        descricao:
          'O fator de Lorentz mede o quanto o tempo e o espaço se deformam a velocidade v.',
        tex: '\\gamma = \\frac{1}{\\sqrt{1 - (v/c)^{2}}}',
      },
      {
        descricao: 'Substituindo v/c.',
        tex: `\\gamma = \\frac{1}{\\sqrt{1 - ${n(beta, 3)}^{2}}} = \\frac{1}{\\sqrt{${n(1 - quadrado, 4)}}} = \\frac{1}{${n(raiz, 4)}} = ${n(resultado, 4)}`,
      },
    ],
  };
}

/** Δt = γ·Δt₀: o relógio que se move marca menos tempo. */
export function dilatacaoDoTempoComPassos(tempoProprio: number, beta: number): Resolucao<number> {
  const gama = fatorDeLorentzComPassos(beta);
  const resultado = gama.resultado * tempoProprio;
  return {
    resultado,
    passos: [
      ...gama.passos,
      {
        descricao: 'Quem vê o relógio passar mede um intervalo γ vezes maior que o tempo próprio.',
        tex: `\\Delta t = \\gamma \\Delta t_0 = ${n(gama.resultado, 4)} \\cdot ${n(tempoProprio)} = ${n(resultado)}`,
      },
    ],
  };
}

/** L = L₀/γ: o comprimento na direção do movimento encolhe. */
export function contracaoDoComprimentoComPassos(
  comprimentoProprio: number,
  beta: number,
): Resolucao<number> {
  const gama = fatorDeLorentzComPassos(beta);
  const resultado = comprimentoProprio / gama.resultado;
  return {
    resultado,
    passos: [
      ...gama.passos,
      {
        descricao: 'O comprimento medido em movimento é o próprio dividido por γ.',
        tex: `L = \\frac{L_0}{\\gamma} = \\frac{${n(comprimentoProprio)}}{${n(gama.resultado, 4)}} = ${n(resultado)}`,
      },
    ],
  };
}

/** Energia do fóton em eV: E = hc/λ = 1240/λ(nm). */
export function energiaDoFotonComPassos(comprimentoNm: number): Resolucao<number> {
  if (comprimentoNm <= 0) {
    throw new ErroMatematico('O comprimento de onda deve ser positivo.');
  }
  const resultado = HC_EV_NM / comprimentoNm;
  return {
    resultado,
    passos: [
      {
        descricao:
          'A luz chega em pacotes de energia E = hf = hc/λ. Com λ em nm, hc vale 1240 eV·nm.',
        tex: 'E = \\frac{hc}{\\lambda} = \\frac{1240\\ \\text{eV·nm}}{\\lambda}',
      },
      {
        descricao: 'Substituindo.',
        tex: `E = \\frac{1240}{${n(comprimentoNm)}} = ${n(resultado)}\\ \\text{eV}`,
      },
    ],
  };
}

/** Efeito fotoelétrico: K_max = hf − φ, em eV. */
export function fotoeletricoComPassos(
  comprimentoNm: number,
  funcaoTrabalho: number,
): Resolucao<number> {
  const foton = energiaDoFotonComPassos(comprimentoNm);
  const resultado = foton.resultado - funcaoTrabalho;
  return {
    resultado,
    passos: [
      ...foton.passos,
      {
        descricao:
          'Cada fóton entrega toda a energia a um elétron; φ é o custo de arrancá-lo do metal, e o resto vira energia cinética.',
        tex: `K_{max} = E - \\phi = ${n(foton.resultado)} - ${n(funcaoTrabalho)} = ${n(resultado)}\\ \\text{eV}`,
      },
    ],
  };
}

/** Comprimento de onda de corte: o maior λ que ainda arranca elétrons, λc = 1240/φ (nm). */
export function comprimentoDeCorteComPassos(funcaoTrabalho: number): Resolucao<number> {
  const resultado = HC_EV_NM / funcaoTrabalho;
  return {
    resultado,
    passos: [
      {
        descricao: 'No limite, o fóton tem só a energia para arrancar o elétron: hc/λc = φ.',
        tex: '\\lambda_c = \\frac{hc}{\\phi} = \\frac{1240\\ \\text{eV·nm}}{\\phi}',
      },
      {
        descricao: 'Substituindo.',
        tex: `\\lambda_c = \\frac{1240}{${n(funcaoTrabalho)}} = ${n(resultado)}\\ \\text{nm}`,
      },
    ],
  };
}

/** De Broglie: λ = h/(m·v), em nm. */
export function deBroglieComPassos(massa: number, velocidade: number): Resolucao<number> {
  const momento = massa * velocidade;
  const metros = H_J_S / momento;
  const resultado = metros * 1e9;
  return {
    resultado,
    passos: [
      {
        descricao: 'Toda partícula com momento p tem um comprimento de onda associado.',
        tex: '\\lambda = \\frac{h}{p} = \\frac{h}{mv}',
      },
      {
        descricao: 'O momento.',
        tex: `p = ${cientificoTex(massa, 2)} \\cdot ${cientificoTex(velocidade, 1)} = ${cientificoTex(momento, 3)}\\ \\text{kg·m/s}`,
      },
      {
        descricao: 'Dividindo h por p, e passando para nanômetros (1 nm = 10⁻⁹ m).',
        tex: `\\lambda = \\frac{6{,}626 \\times 10^{-34}}{${cientificoTex(momento, 3)}} = ${cientificoTex(metros, 3)}\\ \\text{m} = ${n(resultado, 4)}\\ \\text{nm}`,
      },
    ],
  };
}
