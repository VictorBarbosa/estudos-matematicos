import { enunciadoDoMolde, moldesDe } from '@core/enunciados/moldes/moldes.model';
import { No, numero, op } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { Nivel } from '@core/treino/models/treino.model';
import {
  EnunciadoTrilingue,
  Frases,
  enunciadoTrilingue,
} from '@core/treino/textos/texto-trilingue';

/**
 * Histórias que terminam numa conta com mais de uma operação.
 *
 * A ordem das operações deixa de ser um regulamento decorado quando a conta
 * nasce de uma situação: «comprei 3 cadernos de R$ 8 e paguei R$ 5 de frete»
 * só tem uma leitura, e é essa leitura que a precedência descreve. É o mesmo
 * movimento que Razão e proporção faz com a regra de três — o enunciado diz a
 * situação, e a expressão é o que o aluno precisa montar.
 *
 * Por isso estas variantes não mostram a expressão ao lado do texto
 * (`SEM_FORMULA`): exibi-la responderia a única pergunta que importa aqui —
 * *qual* é a conta.
 */

/** Um termo da expressão, na ordem em que foi escrito. */
export interface Termo {
  readonly operador: '+' | '-' | '*' | '/' | '^';
  readonly valor: No;
}

export interface Termos {
  readonly inicial: No;
  readonly seguintes: readonly Termo[];
}

export interface Contexto {
  readonly arvore: No;
  readonly termos: Termos;
  readonly texto: EnunciadoTrilingue;
}

const somar = (a: No, b: No): No => op('+', a, b);
const subtrair = (a: No, b: No): No => op('-', a, b);
const multiplicar = (a: No, b: No): No => op('*', a, b);
const potencia = (base: No, expoente: No): No => op('^', base, expoente);

// ─────────────────────────────────────────────────────────────────────────────
// Histórias do Fácil e do Médio: a precedência muda a resposta.
// ─────────────────────────────────────────────────────────────────────────────

/** Compras com frete, gorjeta, taxa fixa: `a × b + c`. */
export function compraComTaxa(rng: Rng, nivel: Nivel): Contexto {
  const a = rng.inteiro(2, nivel === 'facil' ? 6 : 9);
  const b = rng.inteiro(3, nivel === 'facil' ? 12 : 25);
  const c = rng.inteiro(2, 15);

  return {
    arvore: somar(numero(c), multiplicar(numero(a), numero(b))),
    termos: {
      inicial: numero(c),
      seguintes: [
        { operador: '+', valor: numero(a) },
        { operador: '*', valor: numero(b) },
      ],
    },
    texto: enunciadoDoMolde(moldesDe('operacoes-fundamentais', 'forma-4')[0]!, {
      q: a,
      preco: b,
      taxa: c,
    }),
  };
}

/** Troco: `a − b × c`. */
export function troco(rng: Rng, nivel: Nivel): Contexto {
  const a = rng.inteiro(40, nivel === 'facil' ? 60 : 120);
  const b = rng.inteiro(2, nivel === 'facil' ? 5 : 9);
  const c = rng.inteiro(4, nivel === 'facil' ? 9 : 14);

  return {
    arvore: subtrair(numero(a), multiplicar(numero(b), numero(c))),
    termos: {
      inicial: numero(a),
      seguintes: [
        { operador: '-', valor: numero(b) },
        { operador: '*', valor: numero(c) },
      ],
    },
    texto: enunciadoDoMolde(moldesDe('operacoes-fundamentais', 'forma-5')[0]!, {
      pago: a,
      q: b,
      preco: c,
    }),
  };
}

/** Produção com bônus fixo: `a × b + c`. */
export function producaoComBonus(rng: Rng, nivel: Nivel): Contexto {
  const a = rng.inteiro(4, nivel === 'facil' ? 9 : 15);
  const b = rng.inteiro(6, nivel === 'facil' ? 12 : 18);
  const c = rng.inteiro(5, 30);

  return {
    arvore: somar(numero(c), multiplicar(numero(a), numero(b))),
    termos: {
      inicial: numero(c),
      seguintes: [
        { operador: '+', valor: numero(a) },
        { operador: '*', valor: numero(b) },
      ],
    },
    texto: enunciadoDoMolde(moldesDe('operacoes-fundamentais', 'forma-6')[0]!, {
      entregas: a,
      valor: b,
      bonus: c,
    }),
  };
}

/** Dois lotes: `a × b − c × d`. */
export function doisLotes(rng: Rng): Contexto {
  // A subtração é a história: um lote tem de ser maior que o outro, senão a
  // resposta sai negativa e a pergunta («quantas garrafas ficaram?») deixa de
  // ter sentido.
  const a = rng.inteiro(4, 8);
  const b = rng.inteiro(5, 9);
  let c = rng.inteiro(2, 3);
  let d = rng.inteiro(3, 6);
  if (a * b <= c * d) {
    c = 2;
    d = 3;
  }

  const arvore = subtrair(multiplicar(numero(a), numero(b)), multiplicar(numero(c), numero(d)));

  return {
    arvore,
    termos: {
      inicial: numero(a),
      seguintes: [
        { operador: '*', valor: numero(b) },
        { operador: '-', valor: numero(c) },
        { operador: '*', valor: numero(d) },
      ],
    },
    texto: enunciadoDoMolde(moldesDe('operacoes-fundamentais', 'forma-7')[0]!, {
      caixas: a,
      porCaixa: b,
      devolvidas: c,
      porDevolucao: d,
    }),
  };
}

/** Kits com dois itens: `a × (b + c)`. */
export function kits(rng: Rng): Contexto {
  const a = rng.inteiro(3, 9);
  const b = rng.inteiro(2, 8);
  const c = rng.inteiro(2, 8);

  return {
    arvore: multiplicar(numero(a), somar(numero(b), numero(c))),
    termos: {
      inicial: numero(a),
      seguintes: [
        { operador: '*', valor: numero(b) },
        { operador: '+', valor: numero(c) },
      ],
    },
    texto: enunciadoDoMolde(moldesDe('operacoes-fundamentais', 'forma-8')[0]!, {
      kits: a,
      lapis: b,
      borrachas: c,
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Histórias do Difícil e do Extremo: potência na mesma conta.
// ─────────────────────────────────────────────────────────────────────────────

/** Área de um quadrado menos um gasto: `a + b × (c − d)²`. */
export function areaMenosGasto(rng: Rng): Contexto {
  const a = rng.inteiro(10, 40);
  const b = rng.inteiro(2, 5);
  const c = rng.inteiro(5, 9);
  const d = rng.inteiro(1, 4);

  // b·(c−d)² + a — a potência é resolvida antes da multiplicação, e o parêntese antes dela.
  const arvore = somar(
    numero(a),
    multiplicar(numero(b), potencia(subtrair(numero(c), numero(d)), numero(2))),
  );

  return {
    arvore,
    termos: {
      inicial: numero(a),
      seguintes: [
        { operador: '+', valor: numero(b) },
        { operador: '*', valor: potencia(subtrair(numero(c), numero(d)), numero(2)) },
      ],
    },
    texto: enunciadoDoMolde(moldesDe('operacoes-fundamentais', 'forma-9')[0]!, {
      pronto: a,
      pecas: b,
      lado: c,
      sobra: d,
    }),
  };
}

/** Crescimento em quadrados: `(a + b)² − c`. */
export function quadradoDaSoma(rng: Rng): Contexto {
  const a = rng.inteiro(3, 9);
  const b = rng.inteiro(2, 8);
  const c = rng.inteiro(5, 25);

  const lado = somar(numero(a), numero(b));
  const arvore = subtrair(potencia(lado, numero(2)), numero(c));

  return {
    arvore,
    termos: {
      inicial: lado,
      seguintes: [
        { operador: '^', valor: numero(2) },
        { operador: '-', valor: numero(c) },
      ],
    },
    texto: enunciadoDoMolde(moldesDe('operacoes-fundamentais', 'forma-10')[0]!, {
      primeiro: a,
      segundo: b,
      retirados: c,
    }),
  };
}

/** Conta de restaurante com cupom: `a × (b + c) − d`. */
export function contaComCupom(rng: Rng): Contexto {
  const a = rng.inteiro(3, 9);
  const b = rng.inteiro(12, 30);
  const c = rng.inteiro(5, 15);
  const d = rng.inteiro(10, 40);

  return {
    arvore: subtrair(multiplicar(numero(a), somar(numero(b), numero(c))), numero(d)),
    termos: {
      inicial: numero(a),
      seguintes: [
        { operador: '*', valor: numero(b) },
        { operador: '+', valor: numero(c) },
        { operador: '-', valor: numero(d) },
      ],
    },
    texto: enunciadoDoMolde(moldesDe('operacoes-fundamentais', 'forma-11')[0]!, {
      pessoas: a,
      prato: b,
      sobremesa: c,
      cupom: d,
    }),
  };
}

/** Distância em dois trechos: `a × b + c`. */
export function doisTrechos(rng: Rng): Contexto {
  const a = rng.inteiro(3, 9);
  const b = rng.inteiro(15, 60);
  const c = rng.inteiro(10, 80);

  return {
    arvore: somar(numero(c), multiplicar(numero(a), numero(b))),
    termos: {
      inicial: numero(c),
      seguintes: [
        { operador: '+', valor: numero(a) },
        { operador: '*', valor: numero(b) },
      ],
    },
    texto: enunciadoDoMolde(moldesDe('operacoes-fundamentais', 'forma-12')[0]!, {
      dias: a,
      porDia: b,
      ultimoTrecho: c,
    }),
  };
}

/** O catálogo, por nível, na ordem em que cada história estreia. */
export const CONTEXTOS_POR_NIVEL: Readonly<
  Record<Nivel, readonly ((rng: Rng, nivel: Nivel) => Contexto)[]>
> = {
  facil: [compraComTaxa, troco, producaoComBonus, doisTrechos],
  medio: [compraComTaxa, troco, producaoComBonus, doisTrechos, doisLotes, kits],
  dificil: [doisLotes, kits, contaComCupom, areaMenosGasto, quadradoDaSoma],
  extremo: [areaMenosGasto, quadradoDaSoma, doisLotes, kits, contaComCupom],
};
