import type { Regra } from '@core/enunciados/models/regras-de-passos';

/**
 * As regras dos tópicos de Química que se calculam do próprio texto.
 *
 * Ficam de fora as perguntas de CONHECIMENTO — «qual é a fórmula do gás
 * carbônico?» —, porque a resposta não sai de uma conta: sai de uma tabela de
 * substâncias, e essa tabela vive no gerador do tópico. As que estão aqui são
 * as que têm conta: contar átomos numa fórmula e elétrons num íon.
 */

/** A carga de um íon escrito com sobrescrito: `Na⁺`, `Mg²⁺`, `Cl⁻`, `O²⁻`. */
const SOBRESCRITOS: Readonly<Record<string, number>> = {
  '⁰': 0,
  '¹': 1,
  '²': 2,
  '³': 3,
  '⁴': 4,
  '⁵': 5,
  '⁶': 6,
  '⁷': 7,
  '⁸': 8,
  '⁹': 9,
  '⁺': 1,
  '⁻': -1,
};

/**
 * A carga de um íon, lida do sobrescrito.
 *
 * `Mg²⁺` é +2; `Cl⁻` é −1; e um átomo sem sobrescrito é 0.
 */
function cargaDoIon(ion: string, texto: string): number {
  const trecho = ion.trim();
  let sinal = 0;
  let modulo = '';

  for (const caractere of trecho) {
    if (caractere === '⁺') sinal = 1;
    else if (caractere === '⁻') sinal = -1;
    else if (SOBRESCRITOS[caractere] !== undefined && !'⁺⁻'.includes(caractere)) {
      modulo += SOBRESCRITOS[caractere];
    }
  }

  if (sinal === 0) {
    // Sem sinal no símbolo: a carga é a que o texto declarar, ou zero.
    return 0;
  }

  void texto;
  return sinal * (modulo === '' ? 1 : Number(modulo));
}

/**
 * Quantos átomos há numa fórmula como `H2SO4`, `C6H12O6` ou `Ca(OH)2`.
 *
 * Leitura recursiva: um símbolo conta 1 mais o seu índice, e um parêntese
 * multiplica o que está dentro pelo índice de fora — é o caso de `Ca(OH)2`,
 * que tem um cálcio, dois oxigênios e dois hidrogênios.
 */
export function atomosDaFormula(formula: string): number {
  let posicao = 0;

  const lerIndice = (): number => {
    let digitos = '';
    while (posicao < formula.length && /\d/.test(formula[posicao]!)) {
      digitos += formula[posicao];
      posicao += 1;
    }
    return digitos === '' ? 1 : Number(digitos);
  };

  const lerGrupo = (): number => {
    let total = 0;

    while (posicao < formula.length) {
      const caractere = formula[posicao]!;

      if (caractere === '(') {
        posicao += 1;
        total += lerGrupo() * lerIndice();
      } else if (caractere === ')') {
        posicao += 1;
        return total;
      } else if (/[A-Z]/.test(caractere)) {
        posicao += 1;
        while (posicao < formula.length && /[a-z]/.test(formula[posicao]!)) {
          posicao += 1;
        }
        total += lerIndice();
      } else {
        // Carga, espaço ou sinal: não é átomo.
        posicao += 1;
      }
    }

    return total;
  };

  return lerGrupo();
}

export const REGRAS_QUIMICA: Readonly<Record<string, readonly Regra[]>> = {
  'formulas-e-nomenclatura': [
    [
      'Quantos átomos há ao todo na molécula de *?',
      'N = \\sum n_i',
      'N = \\sum n_i',
      (_v, texto) => atomosDaFormula(/molécula de ([^.]+)\?/.exec(texto)?.[1] ?? ''),
    ],
  ],

  'atomos-isotopos-ions': [
    [
      'O íon * perdeu # elétrons. Se o átomo neutro tinha # elétrons, quantos elétrons o íon tem?',
      'e^- = Z - p',
      'e^- = # - #',
      (v) => v[1]! - v[0]!,
    ],
    [
      'O íon * ganhou # elétrons. Se o átomo neutro tinha # elétrons, quantos elétrons o íon tem?',
      'e^- = Z + g',
      'e^- = # + #',
      (v) => v[1]! + v[0]!,
    ],
    [
      'Quantos elétrons o íon * ganhou ou perdeu em relação ao átomo neutro, que tem # elétrons? Resposta em número de elétrons.',
      'e^- = Z - q',
      (v, texto) => {
        const ion = /o íon (.+?) ganhou/.exec(texto)?.[1] ?? '';
        return `e^- = ${v[0]!} - (${cargaDoIon(ion, texto)})`;
      },
      (v, texto) => {
        const ion = /o íon (.+?) ganhou/.exec(texto)?.[1] ?? '';
        return v[0]! - cargaDoIon(ion, texto);
      },
    ],
  ],

  'tabela-e-ligacao': [
    [
      'Quantos elétrons o íon * ganhou ou perdeu em relação ao átomo neutro, que tem # elétrons? Resposta em número de elétrons.',
      'e^- = Z - q',
      (v, texto) => {
        const ion = /o íon (.+?) ganhou/.exec(texto)?.[1] ?? '';
        return `e^- = ${v[0]!} - (${cargaDoIon(ion, texto)})`;
      },
      (v, texto) => {
        const ion = /o íon (.+?) ganhou/.exec(texto)?.[1] ?? '';
        return v[0]! - cargaDoIon(ion, texto);
      },
    ],
  ],
};
