import { Passo, Resolucao } from '@core/math/tipos/tipos';
import { mdcLista } from '@core/math/numeros/inteiros/inteiros';
import { Polinomio, formatar } from '@core/math/algebra/polinomio/polinomio';

/**
 * Fatoração de polinômios.
 *
 * Fatorar é o caminho inverso da distributiva: em vez de abrir parênteses,
 * procuramos a estrutura que permite fechá-los. O resultado é sempre
 * verificável — basta expandir de volta.
 */

export type TipoFatoracao =
  | 'fator-comum'
  | 'diferenca-de-quadrados'
  | 'trinomio-quadrado-perfeito'
  | 'trinomio-soma-produto'
  | 'nao-fatoravel';

export interface Fatoracao {
  readonly tipo: TipoFatoracao;
  /** A forma fatorada em LaTeX, ou o próprio polinômio se não fatorar. */
  readonly tex: string;
}

/**
 * Identifica e aplica a fatoração cabível, na ordem em que se deve tentar:
 * fator comum primeiro, depois os casos de dois e de três termos.
 */
export function fatorarComPassos(polinomio: Polinomio): Resolucao<Fatoracao> {
  const original = polinomio.paraTex();
  const passos: Passo[] = [{ descricao: 'Partimos do polinômio.', tex: original }];

  // 1. Fator comum: sempre a primeira coisa a procurar.
  const naoNulos = polinomio.coeficientes.filter((c) => c !== 0);
  const comum = mdcLista(naoNulos.map((c) => Math.round(Math.abs(c))));
  const menorGrau = polinomio.coeficientes.findIndex((c) => c !== 0);

  if ((comum > 1 || menorGrau > 0) && naoNulos.length > 1) {
    const fatorTex =
      (comum > 1 ? formatar(comum) : '') +
      (menorGrau > 0 ? (menorGrau === 1 ? 'x' : `x^{${menorGrau}}`) : '');

    const restante = Polinomio.de(...polinomio.coeficientes.slice(menorGrau).map((c) => c / comum));

    passos.push({
      descricao: 'Todos os termos compartilham um fator — ele sai em evidência.',
      tex: `${original} = ${fatorTex}\\left(${restante.paraTex()}\\right)`,
      nota: 'É a distributiva lida de trás para frente.',
    });

    // Tenta continuar fatorando o que sobrou dentro dos parênteses.
    const interna = fatorarComPassos(restante);
    if (interna.resultado.tipo !== 'nao-fatoravel') {
      passos.push(...interna.passos.slice(1));
      return {
        resultado: {
          tipo: 'fator-comum',
          tex: `${fatorTex}${interna.resultado.tex}`,
        },
        passos,
      };
    }

    return {
      resultado: { tipo: 'fator-comum', tex: `${fatorTex}\\left(${restante.paraTex()}\\right)` },
      passos,
    };
  }

  // 2. Diferença de quadrados: dois termos, graus par, sinais opostos.
  const a = polinomio.coeficiente(2);
  const b = polinomio.coeficiente(1);
  const c = polinomio.coeficiente(0);

  if (polinomio.grau === 2 && b === 0 && a > 0 && c < 0) {
    const raizA = Math.sqrt(a);
    const raizC = Math.sqrt(-c);

    if (Number.isInteger(raizA) && Number.isInteger(raizC)) {
      const termoA = raizA === 1 ? 'x' : `${formatar(raizA)}x`;
      const tex = `\\left(${termoA} + ${formatar(raizC)}\\right)\\left(${termoA} - ${formatar(raizC)}\\right)`;

      passos.push({
        descricao: 'São dois quadrados perfeitos subtraídos.',
        tex: `${original} = \\left(${termoA}\\right)^{2} - \\left(${formatar(raizC)}\\right)^{2}`,
      });
      passos.push({
        descricao: 'Diferença de quadrados é o produto da soma pela diferença.',
        tex: `= ${tex}`,
        nota: 'Expandindo de volta, os termos do meio se cancelam e confirmam a identidade.',
      });

      return { resultado: { tipo: 'diferenca-de-quadrados', tex }, passos };
    }
  }

  // 3. Trinômio: quadrado perfeito ou soma e produto.
  if (polinomio.grau === 2 && a !== 0) {
    const delta = b * b - 4 * a * c;

    if (delta === 0) {
      const raiz = -b / (2 * a);
      const coeficiente = a === 1 ? '' : formatar(a);
      const tex = `${coeficiente}\\left(x ${raiz > 0 ? '-' : '+'} ${formatar(Math.abs(raiz))}\\right)^{2}`;

      passos.push({
        descricao: 'O discriminante é zero, então o trinômio é um quadrado perfeito.',
        tex: `\\Delta = ${formatar(delta)}`,
      });
      passos.push({
        descricao: 'Ele é o quadrado de um único binômio.',
        tex: `${original} = ${tex}`,
      });

      return { resultado: { tipo: 'trinomio-quadrado-perfeito', tex }, passos };
    }

    if (delta > 0 && Number.isInteger(Math.sqrt(delta))) {
      const r1 = (-b - Math.sqrt(delta)) / (2 * a);
      const r2 = (-b + Math.sqrt(delta)) / (2 * a);
      const coeficiente = a === 1 ? '' : formatar(a);
      const fator = (raiz: number): string =>
        raiz === 0 ? 'x' : `\\left(x ${raiz > 0 ? '-' : '+'} ${formatar(Math.abs(raiz))}\\right)`;
      const tex = `${coeficiente}${fator(r1)}${fator(r2)}`;

      passos.push({
        descricao: 'Procuramos dois números cuja soma e produto reproduzam o trinômio.',
        tex: `x_1 + x_2 = ${formatar(-b / a)} \\qquad x_1 \\cdot x_2 = ${formatar(c / a)}`,
        nota: 'São as relações de Girard, que evitam recorrer a Bhaskara.',
      });
      passos.push({
        descricao: 'Os números encontrados são as raízes, e cada uma gera um fator.',
        tex: `${original} = ${tex}`,
      });

      return { resultado: { tipo: 'trinomio-soma-produto', tex }, passos };
    }
  }

  passos.push({
    descricao: 'Não há fatoração com coeficientes inteiros para este polinômio.',
    tex: original,
    nota: 'Nem todo polinômio fatora nos inteiros — e reconhecer isso também faz parte.',
  });

  return { resultado: { tipo: 'nao-fatoravel', tex: original }, passos };
}
