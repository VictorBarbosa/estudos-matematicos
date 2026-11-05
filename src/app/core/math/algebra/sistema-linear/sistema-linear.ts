import { Passo, Resolucao } from '@core/math/tipos/tipos';
import { formatar } from '@core/math/algebra/polinomio/polinomio';

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

/** O coeficiente como ele aparece colado na letra: `3`, `-`, ou nada. */
function coeficienteTex(n: number): string {
  return n === 1 ? '' : n === -1 ? '-' : formatar(n);
}

/**
 * `20 - 10y`, `4 - 2y`, `-2y`, `20`: um linear escrito como no caderno.
 *
 * `p` é o termo sem letra e `q` o que multiplica a letra.
 */
function linearTex(p: number, q: number, letra = 'y'): string {
  if (q === 0) {
    return formatar(p);
  }
  const termo = `${Math.abs(q) === 1 ? '' : formatar(Math.abs(q))}${letra}`;
  if (p === 0) {
    return `${q < 0 ? '-' : ''}${termo}`;
  }
  return `${formatar(p)} ${q > 0 ? '+' : '-'} ${termo}`;
}

/** O mesmo linear com o valor no lugar da letra: `20 - 10 \cdot 2`. */
function linearComValorTex(p: number, q: number, valor: number): string {
  if (q === 0) {
    return formatar(p);
  }
  const numero = valor < 0 ? `(${formatar(valor)})` : formatar(valor);
  const produto = Math.abs(q) === 1 ? numero : `${formatar(Math.abs(q))} \\cdot ${numero}`;
  if (p === 0) {
    return `${q < 0 ? '-' : ''}${produto}`;
  }
  return `${formatar(p)} ${q > 0 ? '+' : '-'} ${produto}`;
}

/** `+ 3y`, `- y`, ou nada quando o coeficiente é zero. */
function termoEmY(b: number): string {
  if (b === 0) {
    return '';
  }
  const coeficiente = Math.abs(b) === 1 ? '' : formatar(Math.abs(b));
  return ` ${b > 0 ? '+' : '-'} ${coeficiente}y`;
}

/**
 * Resolve pelo método da substituição.
 *
 * O caminho é o do caderno, e não o do determinante: isola-se x numa das
 * equações — passando o termo em y para o outro lado e dividindo pelo
 * coeficiente —, troca-se essa expressão na outra equação e sobra uma equação
 * só com y. Com y na mão, volta-se à expressão de x.
 *
 * Quando o coeficiente de x divide os outros dois, a expressão isolada sai
 * inteira (`x = 4 - 2y`) e a substituição segue direto. Quando não divide, ela
 * fica em fração e há um passo a mais para tirá-la. Os dois caminhos existem
 * porque o aluno tem de conseguir ir do passo anterior ao seguinte sem salto.
 *
 * Os casos sem solução única aparecem sozinhos no meio do caminho: a equação
 * final fica `0y = k`, e aí ou nenhum y serve, ou todos servem.
 */
export function resolverSistemaComPassos(sistema: Sistema): Resolucao<SolucaoSistema> {
  const { a1, b1, c1, a2, b2, c2 } = sistema;
  const determinante = a1 * b2 - a2 * b1;

  const passos: Passo[] = [
    {
      descricao: 'Partimos do sistema.',
      tex: `\\begin{cases} ${equacaoParaTex(a1, b1, c1)} \\\\ ${equacaoParaTex(a2, b2, c2)} \\end{cases}`,
    },
  ];

  // Isolamos x na primeira equação que tiver x; é dela que sai a substituição.
  const primeiroTemX = a1 !== 0;
  const [A, B, C] = primeiroTemX ? [a1, b1, c1] : [a2, b2, c2];
  const [A2, B2, C2] = primeiroTemX ? [a2, b2, c2] : [a1, b1, c1];
  const qual = primeiroTemX ? 'primeira' : 'segunda';
  const outra = primeiroTemX ? 'segunda' : 'primeira';

  if (A === 0) {
    // Nenhuma das duas tem x: não há o que isolar, e o sistema não é 2×2.
    passos.push({
      descricao: 'Nenhuma das equações tem x, então x não fica determinado.',
      tex: '\\text{sem solução única}',
      nota: 'Com x ausente, as duas equações falam só de y.',
    });
    return {
      resultado: { tipo: b1 * c2 - b2 * c1 === 0 ? 'indeterminado' : 'impossivel', determinante },
      passos,
    };
  }

  /* ---- 1º passo: o termo em y vai para o outro lado ---- */
  if (B !== 0) {
    passos.push({
      descricao: `Na ${qual} equação, passamos o termo em y para o outro lado.`,
      tex: `${coeficienteTex(A)}x = ${linearTex(C, -B)}`,
      nota: `O que está somando de um lado passa subtraindo do outro: o${termoEmY(B)} sai da esquerda e entra na direita com o sinal trocado.`,
    });
  }

  /* ---- 2º passo: dividimos pelo coeficiente de x, isolando x ---- */
  // `x = p + qy` quando a divisão é exata; senão, x fica em fração.
  const exata = C % A === 0 && B % A === 0;
  const p = C / A;
  const q = -B / A;
  const fracaoTex = `\\frac{${linearTex(C, -B)}}{${formatar(A)}}`;
  const xIsoladoTex = exata ? linearTex(p, q) : fracaoTex;

  if (A !== 1) {
    passos.push({
      descricao:
        A === -1
          ? 'Trocamos o sinal dos dois lados, isolando x.'
          : `Dividimos os dois lados por ${formatar(A)}, isolando x.`,
      tex: exata && A !== -1 ? `x = ${fracaoTex} = ${xIsoladoTex}` : `x = ${xIsoladoTex}`,
      nota:
        B === 0
          ? 'Esta equação já dá x sozinha: é esse número que entra na outra.'
          : 'Agora x está escrito em função de y: é essa expressão que entra no lugar do x da outra equação.',
    });
  }

  /* ---- 3º passo: a expressão entra no lugar do x da outra equação ---- */
  const entreParenteses =
    exata && Math.abs(q) === 0 ? xIsoladoTex : `\\left(${xIsoladoTex}\\right)`;

  passos.push({
    descricao: `Substituímos esse x na ${outra} equação.`,
    tex: `${coeficienteTex(A2)}${entreParenteses}${termoEmY(B2)} = ${formatar(C2)}`,
    nota: 'A equação passa a ter uma incógnita só, que é o ponto do método.',
  });

  /* ---- 4º passo: sobra uma equação em y ---- */
  let coeficienteDeY: number;
  let independente: number;

  if (exata) {
    // A2(p + qy) + B2·y = C2  →  (A2·q + B2)y = C2 - A2·p
    coeficienteDeY = A2 * q + B2;
    independente = C2 - A2 * p;
  } else {
    // Multiplicar por A é o que tira a fração; sem este passo o aluno não
    // consegue ir do anterior ao seguinte.
    passos.push({
      descricao: `Multiplicamos tudo por ${formatar(A)} para tirar a fração.`,
      tex: `${coeficienteTex(A2)}\\left(${linearTex(C, -B)}\\right)${termoEmY(A * B2)} = ${formatar(A * C2)}`,
    });
    coeficienteDeY = A * B2 - A2 * B;
    independente = A * C2 - A2 * C;
  }

  passos.push({
    descricao: 'Juntamos os termos em y.',
    tex: `${formatar(coeficienteDeY)}y = ${formatar(independente)}`,
  });

  if (coeficienteDeY === 0) {
    if (independente === 0) {
      passos.push({
        descricao: 'Sobrou 0 = 0: qualquer y serve, e as equações são a MESMA reta.',
        tex: '\\text{infinitas soluções}',
        nota: 'Uma equação é múltipla da outra, então ela não acrescenta informação nenhuma.',
      });
      return { resultado: { tipo: 'indeterminado', determinante }, passos };
    }

    passos.push({
      descricao: 'Sobrou uma igualdade falsa: nenhum y serve.',
      tex: `0 = ${formatar(independente)}`,
    });
    passos.push({
      descricao: 'As retas são paralelas distintas e nunca se cruzam.',
      tex: '\\text{nenhuma solução}',
      nota: 'Mesma inclinação, alturas diferentes — o sistema é impossível.',
    });
    return { resultado: { tipo: 'impossivel', determinante }, passos };
  }

  const y = independente / coeficienteDeY;
  const x = (C - B * y) / A;

  passos.push({
    descricao: `Dividimos por ${formatar(coeficienteDeY)} e achamos y.`,
    tex:
      coeficienteDeY === 1
        ? `y = ${formatar(y)}`
        : `y = \\frac{${formatar(independente)}}{${formatar(coeficienteDeY)}} = ${formatar(y)}`,
  });

  /* ---- 5º passo: y volta para a expressão de x ---- */
  passos.push({
    descricao: 'Voltamos à expressão de x e trocamos y pelo valor encontrado.',
    tex: exata
      ? `x = ${linearComValorTex(p, q, y)} = ${formatar(x)}`
      : `x = \\frac{${linearComValorTex(C, -B, y)}}{${formatar(A)}} = ${formatar(x)}`,
    nota: 'É a mesma expressão de antes, agora com número no lugar da letra.',
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
