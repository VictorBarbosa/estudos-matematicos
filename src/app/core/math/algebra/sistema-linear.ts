import { Passo, Resolucao } from '@core/math/tipos';
import { formatar } from './polinomio';

/**
 * Sistemas lineares 2×2.
 *
 * As duas equações são retas; resolver o sistema é achar onde elas se cruzam.
 * Essa leitura geométrica explica de imediato os três casos possíveis —
 * uma solução, nenhuma ou infinitas.
 */

export interface Sistema {
  readonly a1: number;
  readonly b1: number;
  readonly c1: number;
  readonly a2: number;
  readonly b2: number;
  readonly c2: number;
}

export type TipoSistema = 'determinado' | 'impossivel' | 'indeterminado';

export interface SolucaoSistema {
  readonly tipo: TipoSistema;
  /** Preenchido apenas quando o sistema é determinado. */
  readonly x?: number;
  readonly y?: number;
  readonly determinante: number;
}

export function equacaoParaTex(a: number, b: number, c: number): string {
  const termoX = a === 0 ? '' : `${a === 1 ? '' : a === -1 ? '-' : formatar(a)}x`;
  const sinal = b < 0 ? '-' : termoX === '' ? '' : '+';
  const coeficienteY = Math.abs(b) === 1 ? '' : formatar(Math.abs(b));
  const termoY = b === 0 ? '' : `${sinal} ${coeficienteY}y`;

  return `${termoX} ${termoY} = ${formatar(c)}`.trim();
}

/** Resolve por escalonamento, que é a adição feita de forma sistemática. */
export function resolverSistemaComPassos(sistema: Sistema): Resolucao<SolucaoSistema> {
  const { a1, b1, c1, a2, b2, c2 } = sistema;
  const determinante = a1 * b2 - a2 * b1;

  const passos: Passo[] = [
    {
      descricao: 'Partimos do sistema.',
      tex: `\\begin{cases} ${equacaoParaTex(a1, b1, c1)} \\\\ ${equacaoParaTex(a2, b2, c2)} \\end{cases}`,
    },
    {
      descricao: 'O determinante dos coeficientes decide o tipo de sistema.',
      tex:
        `D = \\begin{vmatrix} ${formatar(a1)} & ${formatar(b1)} \\\\ ${formatar(a2)} & ` +
        `${formatar(b2)} \\end{vmatrix} = ${formatar(a1)} \\cdot ${formatar(b2)} - ` +
        `${formatar(a2)} \\cdot ${formatar(b1)} = ${formatar(determinante)}`,
      nota: 'D ≠ 0 significa retas concorrentes, portanto um único ponto de encontro.',
    },
  ];

  if (determinante === 0) {
    // Retas paralelas: mesma inclinação. Coincidem se os termos independentes
    // também forem proporcionais.
    const proporcional = a1 * c2 - a2 * c1 === 0 && b1 * c2 - b2 * c1 === 0;

    passos.push({
      descricao: 'Determinante zero: as duas retas têm a mesma inclinação.',
      tex: `D = 0`,
    });

    if (proporcional) {
      passos.push({
        descricao: 'As equações são múltiplas uma da outra: descrevem a MESMA reta.',
        tex: '\\text{infinitas soluções}',
        nota: 'Qualquer ponto de uma das retas resolve o sistema.',
      });
      return { resultado: { tipo: 'indeterminado', determinante }, passos };
    }

    passos.push({
      descricao: 'As retas são paralelas distintas e nunca se cruzam.',
      tex: '\\text{nenhuma solução}',
      nota: 'Mesma inclinação, alturas diferentes — o sistema é impossível.',
    });
    return { resultado: { tipo: 'impossivel', determinante }, passos };
  }

  const x = (c1 * b2 - c2 * b1) / determinante;
  const y = (a1 * c2 - a2 * c1) / determinante;

  // Multiplicadores que zeram y ao somar as duas equações.
  passos.push({
    descricao: 'Para eliminar y, multiplicamos cada equação pelo coeficiente de y da outra.',
    tex:
      `(${formatar(b2)}) \\cdot \\left[${equacaoParaTex(a1, b1, c1)}\\right] \\quad - \\quad ` +
      `(${formatar(b1)}) \\cdot \\left[${equacaoParaTex(a2, b2, c2)}\\right]`,
    nota: 'Assim os termos em y ficam iguais e se cancelam na subtração.',
  });

  passos.push({
    descricao: 'Subtraindo, resta uma equação só com x.',
    tex: `${formatar(determinante)}x = ${formatar(c1 * b2 - c2 * b1)} \;\\Rightarrow\; x = ${formatar(x)}`,
  });

  passos.push({
    descricao: 'Substituímos x em uma das equações originais para achar y.',
    tex: `y = ${formatar(y)}`,
  });

  passos.push({
    descricao: 'A solução é o ponto onde as duas retas se cruzam.',
    tex: `(x, y) = (${formatar(x)},\; ${formatar(y)})`,
  });

  return { resultado: { tipo: 'determinado', x, y, determinante }, passos };
}

/** Isola y para desenhar a reta: y = (c − ax)/b. */
export function comoFuncao(a: number, b: number, c: number): ((x: number) => number) | null {
  if (b === 0) {
    return null;
  }
  return (x: number) => (c - a * x) / b;
}
