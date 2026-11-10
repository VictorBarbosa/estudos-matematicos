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

  const frases: Frases<[number, number, number]> = {
    pt: (q, preco, taxa) =>
      `Paguei R$ ${taxa} de frete e comprei ${q} cadernos a R$ ${preco} cada um. ` +
      'Quanto gastei ao todo?',
    fr: (q, preco, taxa) =>
      `J'ai payé ${taxa} $ de livraison et acheté ${q} cahiers à ${preco} $ chacun. ` +
      'Combien ai-je dépensé en tout ?',
    en: (q, preco, taxa) =>
      `I paid $${taxa} for shipping and bought ${q} notebooks at $${preco} each. ` +
      'How much did I spend in total?',
  };

  return {
    arvore: somar(numero(c), multiplicar(numero(a), numero(b))),
    termos: {
      inicial: numero(c),
      seguintes: [
        { operador: '+', valor: numero(a) },
        { operador: '*', valor: numero(b) },
      ],
    },
    texto: enunciadoTrilingue(frases, [a, b, c], {
      pt: () => 'O frete é cobrado uma vez, não por caderno. Qual parcela multiplica e qual soma?',
      fr: () =>
        'La livraison est facturée une fois, pas par cahier. Quelle part multiplie et quelle part additionne ?',
      en: () =>
        'Shipping is charged once, not per notebook. Which part multiplies and which one adds?',
    }),
  };
}

/** Troco: `a − b × c`. */
export function troco(rng: Rng, nivel: Nivel): Contexto {
  const a = rng.inteiro(40, nivel === 'facil' ? 60 : 120);
  const b = rng.inteiro(2, nivel === 'facil' ? 5 : 9);
  const c = rng.inteiro(4, nivel === 'facil' ? 9 : 14);

  const frases: Frases<[number, number, number]> = {
    pt: (pago, q, preco) =>
      `Paguei uma compra com R$ ${pago}. Levei ${q} camisetas de R$ ${preco} cada. ` +
      'Quanto recebi de troco?',
    fr: (pago, q, preco) =>
      `J'ai payé un achat avec ${pago} $. J'ai pris ${q} t-shirts à ${preco} $ chacune. ` +
      'Combien m’a-t-on rendu ?',
    en: (pago, q, preco) =>
      `I paid for a purchase with $${pago}. I took ${q} shirts at $${preco} each. ` +
      'How much change did I get?',
  };

  return {
    arvore: subtrair(numero(a), multiplicar(numero(b), numero(c))),
    termos: {
      inicial: numero(a),
      seguintes: [
        { operador: '-', valor: numero(b) },
        { operador: '*', valor: numero(c) },
      ],
    },
    texto: enunciadoTrilingue(frases, [a, b, c]),
  };
}

/** Produção com bônus fixo: `a × b + c`. */
export function producaoComBonus(rng: Rng, nivel: Nivel): Contexto {
  const a = rng.inteiro(4, nivel === 'facil' ? 9 : 15);
  const b = rng.inteiro(6, nivel === 'facil' ? 12 : 18);
  const c = rng.inteiro(5, 30);

  const frases: Frases<[number, number, number]> = {
    pt: (entregas, valor, bonus) =>
      `Um entregador ganhou R$ ${bonus} de bônus e, além disso, R$ ${valor} por cada uma das ` +
      `${entregas} entregas do dia. Quanto recebeu ao todo?`,
    fr: (entregas, valor, bonus) =>
      `Un livreur a reçu ${bonus} $ de prime et, en plus, ${valor} $ pour chacune des ` +
      `${entregas} livraisons du jour. Combien a-t-il gagné en tout ?`,
    en: (entregas, valor, bonus) =>
      `A courier got a $${bonus} bonus and, on top of that, $${valor} for each of the ${entregas} ` +
      'deliveries that day. How much did he earn in total?',
  };

  return {
    arvore: somar(numero(c), multiplicar(numero(a), numero(b))),
    termos: {
      inicial: numero(c),
      seguintes: [
        { operador: '+', valor: numero(a) },
        { operador: '*', valor: numero(b) },
      ],
    },
    texto: enunciadoTrilingue(frases, [a, b, c]),
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

  const frases: Frases<[number, number, number, number]> = {
    pt: (caixas, porCaixa, devolvidas, porDevolucao) =>
      `Um mercado recebeu ${caixas} caixas com ${porCaixa} garrafas cada. Depois devolveu ` +
      `${devolvidas} caixas com ${porDevolucao} garrafas cada. Quantas garrafas ficaram?`,
    fr: (caixas, porCaixa, devolvidas, porDevolucao) =>
      `Un magasin a reçu ${caixas} caisses de ${porCaixa} bouteilles chacune. Il en a ensuite ` +
      `renvoyé ${devolvidas} de ${porDevolucao} bouteilles chacune. Combien de bouteilles reste-t-il ?`,
    en: (caixas, porCaixa, devolvidas, porDevolucao) =>
      `A shop received ${caixas} boxes of ${porCaixa} bottles each. It then returned ${devolvidas} ` +
      `boxes of ${porDevolucao} bottles each. How many bottles are left?`,
  };

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
    texto: enunciadoTrilingue(frases, [a, b, c, d], {
      pt: () =>
        'São dois produtos inteiros, um subtraindo o outro. Resolva cada um antes de subtrair.',
      fr: () =>
        'Ce sont deux produits entiers, l’un soustrait de l’autre. Calculez chacun avant de soustraire.',
      en: () => 'These are two whole products, one subtracted from the other. Work out each first.',
    }),
  };
}

/** Kits com dois itens: `a × (b + c)`. */
export function kits(rng: Rng): Contexto {
  const a = rng.inteiro(3, 9);
  const b = rng.inteiro(2, 8);
  const c = rng.inteiro(2, 8);

  const frases: Frases<[number, number, number]> = {
    pt: (kits, lapis, borrachas) =>
      `Comprei ${kits} kits. Cada kit traz ${lapis} lápis e ${borrachas} borrachas. ` +
      'Quantos itens vieram ao todo?',
    fr: (kits, lapis, borrachas) =>
      `J'ai acheté ${kits} kits. Chaque kit contient ${lapis} crayons et ${borrachas} gommes. ` +
      'Combien d’objets ai-je reçus en tout ?',
    en: (kits, lapis, borrachas) =>
      `I bought ${kits} kits. Each kit has ${lapis} pencils and ${borrachas} erasers. ` +
      'How many items came in total?',
  };

  return {
    arvore: multiplicar(numero(a), somar(numero(b), numero(c))),
    termos: {
      inicial: numero(a),
      seguintes: [
        { operador: '*', valor: numero(b) },
        { operador: '+', valor: numero(c) },
      ],
    },
    texto: enunciadoTrilingue(frases, [a, b, c], {
      pt: () =>
        'Os dois itens do kit andam juntos: some-os primeiro, depois multiplique pelos kits.',
      fr: () =>
        'Les deux objets du kit vont ensemble : additionnez-les, puis multipliez par le nombre de kits.',
      en: () => 'The two items go together: add them first, then multiply by the number of kits.',
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

  const frases: Frases<[number, number, number, number]> = {
    pt: (pronto, pecas, lado, sobra) =>
      `Um piso já tem ${pronto} m² assentados. Falta assentar ${pecas} peças quadradas cujo ` +
      `lado útil é ${lado} m menos um corte de ${sobra} m em cada lado. Quantos metros ` +
      'quadrados de piso a obra terá ao todo?',
    fr: (pronto, pecas, lado, sobra) =>
      `Un sol a déjà ${pronto} m² posés. Il reste à poser ${pecas} pièces carrées dont le côté ` +
      `utile est ${lado} m moins une coupe de ${sobra} m sur chaque côté. Combien de mètres ` +
      'carrés le chantier aura-t-il en tout ?',
    en: (pronto, pecas, lado, sobra) =>
      `A floor already has ${pronto} m² laid. Still to lay: ${pecas} square pieces whose usable ` +
      `side is ${lado} m minus a ${sobra} m cut on each side. How many square metres will the ` +
      'work have in total?',
  };

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
    texto: enunciadoTrilingue(frases, [a, b, c, d], {
      pt: () =>
        'Ordem: o parêntese, depois a potência, depois a multiplicação, e a soma por último.',
      fr: () =>
        'Ordre : la parenthèse, puis la puissance, puis la multiplication, et l’addition en dernier.',
      en: () => 'Order: the bracket, then the power, then the multiplication, and the sum last.',
    }),
  };
}

/** Crescimento em quadrados: `(a + b)² − c`. */
export function quadradoDaSoma(rng: Rng): Contexto {
  const a = rng.inteiro(3, 9);
  const b = rng.inteiro(2, 8);
  const c = rng.inteiro(5, 25);

  const frases: Frases<[number, number, number]> = {
    pt: (primeiro, segundo, retirados) =>
      `Uma sala quadrada tinha ${primeiro} m de lado e foi ampliada: cada lado cresceu ` +
      `${segundo} m. Do piso novo, ${retirados} m² ficam ocupados por um balcão. Quantos metros ` +
      'quadrados de piso livre sobram?',
    fr: (primeiro, segundo, retirados) =>
      `Une salle carrée avait ${primeiro} m de côté et a été agrandie : chaque côté a augmenté de ` +
      `${segundo} m. Sur le nouveau plancher, ${retirados} m² sont occupés par un comptoir. ` +
      'Combien de mètres carrés de plancher libre restent ?',
    en: (primeiro, segundo, retirados) =>
      `A square room was ${primeiro} m on a side and was enlarged: each side grew by ${segundo} ` +
      `m. Of the new floor, ${retirados} m² are taken by a counter. How many square metres of ` +
      'free floor remain?',
  };

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
    texto: enunciadoTrilingue(frases, [a, b, c], {
      pt: () => 'O lado novo é uma soma: calcule o lado primeiro e só então eleve ao quadrado.',
      fr: () => 'Le nouveau côté est une somme : calculez le côté d’abord, puis élevez au carré.',
      en: () => 'The new side is a sum: work out the side first, then square it.',
    }),
  };
}

/** Conta de restaurante com cupom: `a × (b + c) − d`. */
export function contaComCupom(rng: Rng): Contexto {
  const a = rng.inteiro(3, 9);
  const b = rng.inteiro(12, 30);
  const c = rng.inteiro(5, 15);
  const d = rng.inteiro(10, 40);

  const frases: Frases<[number, number, number, number]> = {
    pt: (pessoas, prato, sobremesa, cupom) =>
      `Um grupo de ${pessoas} pessoas pediu, cada uma, um prato de R$ ${prato} e uma sobremesa ` +
      `de R$ ${c}. Na hora de pagar, usaram um cupom de R$ ${cupom} de desconto. Quanto o ` +
      'grupo pagou?',
    fr: (pessoas, prato, sobremesa, cupom) =>
      `Un groupe de ${pessoas} personnes a commandé, chacune, un plat à ${prato} $ et un dessert ` +
      `à ${c} $. Au moment de payer, ils ont utilisé un coupon de ${cupom} $ de réduction. ` +
      'Combien le groupe a-t-il payé ?',
    en: (pessoas, prato, sobremesa, cupom) =>
      `A group of ${pessoas} people each ordered a $${prato} dish and a $${c} dessert. At the ` +
      `counter they used a $${cupom} coupon. How much did the group pay?`,
  };

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
    texto: enunciadoTrilingue(frases, [a, b, c, d], {
      pt: () => 'Cada pessoa paga prato e sobremesa; o cupom é descontado uma vez, do total.',
      fr: () => 'Chaque personne paie plat et dessert ; le coupon est déduit une fois, du total.',
      en: () => 'Each person pays for dish and dessert; the coupon is taken off the total once.',
    }),
  };
}

/** Distância em dois trechos: `a × b + c`. */
export function doisTrechos(rng: Rng): Contexto {
  const a = rng.inteiro(3, 9);
  const b = rng.inteiro(15, 60);
  const c = rng.inteiro(10, 80);

  const frases: Frases<[number, number, number]> = {
    pt: (dias, porDia, ultimoTrecho) =>
      `Um ciclista já tinha pedalado ${ultimoTrecho} km. Depois disso, pedalou ${porDia} km por ` +
      `dia durante ${dias} dias. Quantos quilômetros pedalou no total?`,
    fr: (dias, porDia, ultimoTrecho) =>
      `Un cycliste avait déjà roulé ${ultimoTrecho} km. Ensuite, il a roulé ${porDia} km par jour ` +
      `pendant ${dias} jours. Combien de kilomètres a-t-il parcourus en tout ?`,
    en: (dias, porDia, ultimoTrecho) =>
      `A cyclist had already ridden ${ultimoTrecho} km. After that, he rode ${porDia} km a day ` +
      `for ${dias} days. How many kilometres did he ride in total?`,
  };

  return {
    arvore: somar(numero(c), multiplicar(numero(a), numero(b))),
    termos: {
      inicial: numero(c),
      seguintes: [
        { operador: '+', valor: numero(a) },
        { operador: '*', valor: numero(b) },
      ],
    },
    texto: enunciadoTrilingue(frases, [a, b, c]),
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
