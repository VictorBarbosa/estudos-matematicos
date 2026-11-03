import { Passo, Resolucao } from '@core/math/tipos/tipos';
import { formatar, formatarEmTexto } from '@core/math/algebra/polinomio/polinomio';

/**
 * Derivação implícita.
 *
 * Uma circunferência não é gráfico de função: para cada x há dois y. Isolar y
 * obriga a escolher um ramo e a arrastar uma raiz pelo resto da conta — e em
 * curvas como `x³ + y³ = 6xy` isolar é simplesmente impossível.
 *
 * A saída é tratar y como função de x sem escrevê-la: derivar os dois lados da
 * equação e deixar `dy/dx` aparecer sozinho, trazido pela regra da cadeia. É
 * assim que se acha a reta tangente de qualquer curva dada por uma equação, o
 * que em engenharia é a regra, não a exceção.
 */

/** Um monômio `c · xⁱ · yʲ`. */
export interface TermoImplicito {
  readonly coeficiente: number;
  readonly grauX: number;
  readonly grauY: number;
}

/** Uma curva escrita como `Σ termos = constante`. */
export interface CurvaImplicita {
  readonly termos: readonly TermoImplicito[];
  readonly constante: number;
  /** Nome da família, para o enunciado: "circunferência", "elipse"… */
  readonly nome: string;
}

/** O lado esquerdo avaliado em (x, y) — serve para conferir se o ponto é da curva. */
export function valorDaCurva(curva: CurvaImplicita, x: number, y: number): number {
  return curva.termos.reduce(
    (soma, termo) => soma + termo.coeficiente * x ** termo.grauX * y ** termo.grauY,
    0,
  );
}

/** O ponto está sobre a curva? */
export function pontoEstaNaCurva(curva: CurvaImplicita, x: number, y: number): boolean {
  return Math.abs(valorDaCurva(curva, x, y) - curva.constante) < 1e-9;
}

/** `x^{2} + y^{2} = 25`. */
export function curvaImplicitaParaTex(curva: CurvaImplicita): string {
  return `${somaParaTex(curva.termos)} = ${formatar(curva.constante)}`;
}

/**
 * A parte da derivada que NÃO acompanha `dy/dx`.
 *
 * Cada termo contribui com a derivada parcial em x: o expoente desce e o grau
 * cai em um.
 */
export function parteSemDerivada(curva: CurvaImplicita): readonly TermoImplicito[] {
  return curva.termos
    .filter((termo) => termo.grauX > 0)
    .map((termo) => ({
      coeficiente: termo.coeficiente * termo.grauX,
      grauX: termo.grauX - 1,
      grauY: termo.grauY,
    }));
}

/**
 * O fator que multiplica `dy/dx`.
 *
 * É aqui que a regra da cadeia entra: derivar `y³` em relação a x dá `3y²`
 * vezes `dy/dx`, porque y é função de x.
 */
export function fatorDaDerivada(curva: CurvaImplicita): readonly TermoImplicito[] {
  return curva.termos
    .filter((termo) => termo.grauY > 0)
    .map((termo) => ({
      coeficiente: termo.coeficiente * termo.grauY,
      grauX: termo.grauX,
      grauY: termo.grauY - 1,
    }));
}

/** `dy/dx` no ponto, ou `NaN` quando a tangente é vertical. */
export function derivadaImplicitaNoPonto(curva: CurvaImplicita, x: number, y: number): number {
  const numerador = avaliar(parteSemDerivada(curva), x, y);
  const denominador = avaliar(fatorDaDerivada(curva), x, y);

  return denominador === 0 ? Number.NaN : -numerador / denominador;
}

/** A tangente é vertical neste ponto? Aí `dy/dx` não existe. */
export function tangenteEhVertical(curva: CurvaImplicita, x: number, y: number): boolean {
  return avaliar(fatorDaDerivada(curva), x, y) === 0;
}

/** A reta tangente à curva no ponto, como `y = mx + n`. */
export function retaTangenteTex(curva: CurvaImplicita, x: number, y: number): string {
  const m = derivadaImplicitaNoPonto(curva, x, y);
  if (!Number.isFinite(m)) {
    return `x = ${formatar(x)}`;
  }

  const n = y - m * x;
  const sinal = n < 0 ? '-' : '+';
  return n === 0
    ? `y = ${formatar(Number(m.toFixed(4)))}x`
    : `y = ${formatar(Number(m.toFixed(4)))}x ${sinal} ${formatar(Number(Math.abs(n).toFixed(4)))}`;
}

/**
 * A resolução completa, do "derivamos os dois lados" até o número.
 *
 * Os quatro passos são a receita inteira, e é a ordem deles que o aluno precisa
 * internalizar — isolar `dy/dx` vem DEPOIS de derivar, nunca antes.
 */
export function derivadaImplicitaComPassos(
  curva: CurvaImplicita,
  x: number,
  y: number,
): Resolucao<number> {
  const semDerivada = parteSemDerivada(curva);
  const fator = fatorDaDerivada(curva);

  const a = avaliar(semDerivada, x, y);
  const b = avaliar(fator, x, y);
  const resultado = -a / b;

  // Quando a fração já reduz a um inteiro, a forma exata e a decimal são a
  // mesma coisa — repetir as duas só deixaria "= -3 = -3" na tela.
  const exata = fracaoTex(-a, b);
  const decimal = formatar(Number(resultado.toFixed(6)));

  const passos: Passo[] = [
    {
      descricao: 'Derivamos os dois lados em relação a x, tratando y como função de x.',
      tex: `\\frac{d}{dx}\\left[${somaParaTex(curva.termos)}\\right] = \\frac{d}{dx}\\left[${formatar(curva.constante)}\\right]`,
      nota: 'Todo termo com y ganha um fator dy/dx, trazido pela regra da cadeia.',
    },
    {
      descricao: 'Cada termo contribui com sua derivada; a constante vira zero.',
      tex: `${somaParaTex(semDerivada)} + \\left(${somaParaTex(fator)}\\right)\\frac{dy}{dx} = 0`,
    },
    {
      descricao: 'Agora, e só agora, isolamos a derivada.',
      tex: `\\frac{dy}{dx} = -\\frac{${somaParaTex(semDerivada)}}{${somaParaTex(fator)}}`,
      nota: 'A expressão depende de x e de y — é o preço de não ter isolado y antes.',
    },
    {
      descricao: `Substituímos o ponto (${formatarEmTexto(x)}, ${formatarEmTexto(y)}), que está sobre a curva.`,
      tex:
        `\\frac{dy}{dx} = -\\frac{${comParenteses(a)}}{${comParenteses(b)}} = ${exata}` +
        `${exata === decimal ? '' : ` = ${decimal}`}`,
    },
  ];

  return { resultado, passos };
}

/** `3x^{2}y` — um monômio escrito sem coeficientes nem expoentes redundantes. */
export function termoImplicitoParaTex(termo: TermoImplicito, comSinal = false): string {
  const magnitude = Math.abs(termo.coeficiente);
  const partes: string[] = [];

  if (magnitude !== 1 || (termo.grauX === 0 && termo.grauY === 0)) {
    partes.push(formatar(magnitude));
  }
  if (termo.grauX > 0) {
    partes.push(termo.grauX === 1 ? 'x' : `x^{${termo.grauX}}`);
  }
  if (termo.grauY > 0) {
    partes.push(termo.grauY === 1 ? 'y' : `y^{${termo.grauY}}`);
  }

  const corpo = partes.join('');
  if (!comSinal) {
    return termo.coeficiente < 0 ? `-${corpo}` : corpo;
  }
  return termo.coeficiente < 0 ? ` - ${corpo}` : ` + ${corpo}`;
}

/** A soma dos termos, com os sinais arrumados. */
export function somaParaTex(termos: readonly TermoImplicito[]): string {
  const vivos = termos.filter((termo) => termo.coeficiente !== 0);
  if (vivos.length === 0) {
    return '0';
  }

  return vivos
    .map((termo, indice) => termoImplicitoParaTex(termo, indice > 0))
    .join('')
    .trim();
}

/** As famílias de curva que o treino usa, da mais conhecida à mais estranha. */
export const FAMILIAS_IMPLICITAS: readonly {
  readonly nome: string;
  readonly montar: (p: number, q: number) => readonly TermoImplicito[];
  readonly descricao: string;
}[] = [
  {
    nome: 'circunferência',
    montar: () => [
      { coeficiente: 1, grauX: 2, grauY: 0 },
      { coeficiente: 1, grauX: 0, grauY: 2 },
    ],
    descricao: 'Dois y para cada x: isolar obriga a escolher um ramo.',
  },
  {
    nome: 'elipse',
    montar: (p, q) => [
      { coeficiente: p, grauX: 2, grauY: 0 },
      { coeficiente: q, grauX: 0, grauY: 2 },
    ],
    descricao: 'A circunferência esticada; a derivada carrega a razão dos eixos.',
  },
  {
    nome: 'hipérbole',
    montar: (p, q) => [
      { coeficiente: p, grauX: 2, grauY: 0 },
      { coeficiente: -q, grauX: 0, grauY: 2 },
    ],
    descricao: 'Mesma receita, sinal trocado — e dois ramos separados.',
  },
  {
    nome: 'hipérbole equilátera',
    montar: (p) => [{ coeficiente: p, grauX: 1, grauY: 1 }],
    descricao: 'O produto xy exige a regra do produto logo no primeiro passo.',
  },
  {
    nome: 'cúbica',
    montar: (p, q) => [
      { coeficiente: p, grauX: 3, grauY: 0 },
      { coeficiente: q, grauX: 0, grauY: 3 },
    ],
    descricao: 'Aqui isolar y ainda é possível, mas já não compensa.',
  },
  {
    nome: 'cônica com termo misto',
    montar: (p, q) => [
      { coeficiente: p, grauX: 2, grauY: 0 },
      { coeficiente: q, grauX: 1, grauY: 1 },
      { coeficiente: 1, grauX: 0, grauY: 2 },
    ],
    descricao: 'O termo xy gira a cônica, e nenhum isolamento é razoável.',
  },
  {
    nome: 'curva com produto misto',
    montar: (p, q) => [
      { coeficiente: p, grauX: 2, grauY: 1 },
      { coeficiente: q, grauX: 0, grauY: 2 },
    ],
    descricao: 'Um termo com x e y juntos: a regra do produto entra duas vezes.',
  },
];

/** Monta a curva de uma família passando por um ponto dado. */
export function curvaPeloPonto(
  familia: (typeof FAMILIAS_IMPLICITAS)[number],
  p: number,
  q: number,
  x: number,
  y: number,
): CurvaImplicita {
  const termos = familia.montar(p, q);
  return {
    termos,
    constante: termos.reduce(
      (soma, termo) => soma + termo.coeficiente * x ** termo.grauX * y ** termo.grauY,
      0,
    ),
    nome: familia.nome,
  };
}

/** Um negativo substituído fica entre parênteses, como se escreve à mão. */
function comParenteses(valor: number): string {
  return valor < 0 ? `\\left(${formatar(valor)}\\right)` : formatar(valor);
}

function avaliar(termos: readonly TermoImplicito[], x: number, y: number): number {
  return termos.reduce(
    (soma, termo) => soma + termo.coeficiente * x ** termo.grauX * y ** termo.grauY,
    0,
  );
}

/** `-\frac{3}{4}`, já simplificada, ou o inteiro quando ele existe. */
function fracaoTex(numerador: number, denominador: number): string {
  const sinal = Math.sign(numerador) * Math.sign(denominador) < 0 ? '-' : '';
  const cima = Math.abs(numerador);
  const baixo = Math.abs(denominador);
  const divisor = mdcInterno(cima, baixo) || 1;

  const p = cima / divisor;
  const q = baixo / divisor;

  return q === 1 ? `${sinal}${formatar(p)}` : `${sinal}\\frac{${formatar(p)}}{${formatar(q)}}`;
}

function mdcInterno(a: number, b: number): number {
  return b === 0 ? a : mdcInterno(b, a % b);
}
