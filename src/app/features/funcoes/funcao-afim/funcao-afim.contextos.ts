import { Rng } from '@core/treino/rng/rng';
import { Nivel } from '@core/treino/models/treino.model';
import {
  EnunciadoTrilingue,
  Frases,
  enunciadoTrilingue,
} from '@core/treino/textos/texto-trilingue';

/**
 * Situações que são uma função afim sem dizer que são.
 *
 * «Qual é a raiz de f(x) = 3x − 12?» e «em quantos minutos o tanque esvazia,
 * se perde 3 litros por minuto e começou com 12?» têm a mesma conta e a mesma
 * resposta — e não ensinam a mesma coisa. A segunda obriga a reconhecer, no
 * texto, quem é a taxa e quem é o valor inicial; e essa é a parte do assunto
 * que sobrevive fora da prova.
 *
 * Cada história declara a função (taxa `a`, valor inicial `b`) e uma pergunta.
 * Os três tipos de pergunta do tópico aparecem: o valor num ponto («quanto
 * custa 8 km»), a raiz («quantos km com R$ 40») e a taxa («quanto aumenta por
 * km»). É a mesma decisão de Razão e proporção: a mesma matemática, perguntas
 * de naturezas diferentes.
 */
export type Pergunta = 'valor' | 'raiz' | 'taxa';

export interface Historia {
  /** Coeficiente de x: quanto o total muda por unidade. */
  readonly a: number;
  /** Termo constante: o que existe antes de qualquer unidade. */
  readonly b: number;
  readonly pergunta: Pergunta;
  /** O ponto pedido, quando a pergunta é sobre um valor. */
  readonly x?: number;
  /**
   * O total procurado, quando a pergunta é a raiz de outra equação.
   *
   * «Com R$ 40, quantos km?» não é f(x) = 0, é f(x) = 40. Sem guardar o alvo,
   * o gabarito sairia da equação errada — e a resposta seria negativa, o que
   * num problema de quilômetros denuncia o erro na hora.
   */
  readonly alvo?: number;
  /**
   * A taxa se pergunta como magnitude — «quantos litros perde por minuto».
   *
   * O reservatório tem coeficiente negativo (−8 L/min), mas a pergunta em
   * português pede o quanto se perde, que é 8. Guardar isso aqui evita um
   * gabarito negativo que a própria frase do enunciado contradiz.
   */
  readonly taxaPositiva?: boolean;
  readonly texto: EnunciadoTrilingue;
}

/** Taxa positiva pequena, para que as contas saiam inteiras. */
function taxa(rng: Rng, nivel: Nivel): number {
  return rng.inteiro(2, nivel === 'facil' ? 4 : 9);
}

/**
 * O valor inicial, em múltiplos de 5.
 *
 * Múltiplos de 5 porque as histórias são de dinheiro, litros e páginas: um
 * plano de R$ 137,00 por mês não é impossível, mas desvia a atenção do que o
 * exercício pergunta para a aritmética do troco.
 */
function inicial(rng: Rng, nivel: Nivel, maximo = 8): number {
  return rng.inteiro(2, nivel === 'facil' ? maximo : maximo * 2) * 5;
}

/** Táxi: bandeirada fixa mais preço por quilômetro. */
export function taxi(rng: Rng, nivel: Nivel, pergunta: Pergunta): Historia {
  const a = taxa(rng, nivel);
  const b = inicial(rng, nivel);
  const x = rng.inteiro(2, 12);

  const frases: Frases<[number, number, number]> = {
    pt: (porKm, bandeirada, km) =>
      `Um táxi cobra R$ ${bandeirada} de bandeirada mais R$ ${porKm} por quilômetro rodado. ` +
      (pergunta === 'valor'
        ? `Quanto custa uma corrida de ${km} km?`
        : pergunta === 'raiz'
          ? `Com R$ ${bandeirada + porKm * km}, quantos quilômetros é possível rodar?`
          : 'Quanto aumenta o valor da corrida a cada quilômetro a mais?'),
    fr: (porKm, bandeirada, km) =>
      `Un taxi facture ${bandeirada} $ de prise en charge plus ${porKm} $ par kilomètre. ` +
      (pergunta === 'valor'
        ? `Combien coûte une course de ${km} km ?`
        : pergunta === 'raiz'
          ? `Avec ${bandeirada + porKm * km} $, combien de kilomètres peut-on parcourir ?`
          : 'De combien le prix de la course augmente-t-il par kilomètre supplémentaire ?'),
    en: (porKm, bandeirada, km) =>
      `A taxi charges a $${bandeirada} base fare plus $${porKm} per kilometre driven. ` +
      (pergunta === 'valor'
        ? `How much does a ${km} km ride cost?`
        : pergunta === 'raiz'
          ? `With $${bandeirada + porKm * km}, how many kilometres can you travel?`
          : 'How much does the fare rise for each extra kilometre?'),
  };

  return {
    a,
    b,
    pergunta,
    x,
    alvo: b + a * x,
    texto: enunciadoTrilingue(frases, [a, b, x], {
      pt: () =>
        'A bandeirada é cobrada uma vez, antes de qualquer quilômetro. Qual é o valor fixo e qual se repete?',
      fr: () =>
        'La prise en charge est facturée une fois, avant tout kilomètre. Quelle est la valeur fixe et laquelle se répète ?',
      en: () =>
        'The base fare is charged once, before any kilometre. Which value is fixed and which repeats?',
    }),
  };
}

/** Reservatório que esvazia: valor inicial positivo, taxa negativa. */
export function reservatorio(rng: Rng, nivel: Nivel, pergunta: Pergunta): Historia {
  const vazao = taxa(rng, nivel);
  const minutosAteEsvaziar = rng.inteiro(4, nivel === 'facil' ? 8 : 16);
  const litros = vazao * minutosAteEsvaziar;
  // A pergunta sobre um instante tem de ser ANTES de esvaziar: «quantos litros
  // restam depois de 7 minutos» num tanque de 12 L e 3 L/min daria −9, e uma
  // resposta negativa numa história de litros denuncia o exercício mal-feito.
  const x = rng.inteiro(1, minutosAteEsvaziar - 1);

  const frases: Frases<[number, number, number]> = {
    pt: (porMinuto, total, minutos) =>
      `Um reservatório começa com ${total} litros e perde ${porMinuto} litros por minuto. ` +
      (pergunta === 'valor'
        ? `Quantos litros restam depois de ${minutos} minutos?`
        : pergunta === 'raiz'
          ? 'Em quantos minutos o reservatório se esvazia?'
          : 'Quantos litros o reservatório perde a cada minuto?'),
    fr: (porMinuto, total, minutos) =>
      `Un réservoir commence avec ${total} litres et perd ${porMinuto} litres par minute. ` +
      (pergunta === 'valor'
        ? `Combien de litres reste-t-il après ${minutos} minutes ?`
        : pergunta === 'raiz'
          ? 'En combien de minutes le réservoir se vide-t-il ?'
          : 'Combien de litres le réservoir perd-il par minute ?'),
    en: (porMinuto, total, minutos) =>
      `A tank starts with ${total} litres and loses ${porMinuto} litres per minute. ` +
      (pergunta === 'valor'
        ? `How many litres remain after ${minutos} minutes?`
        : pergunta === 'raiz'
          ? 'In how many minutes does the tank empty?'
          : 'How many litres does the tank lose per minute?'),
  };

  return {
    a: -vazao,
    b: litros,
    pergunta,
    x,
    alvo: 0,
    taxaPositiva: true,
    texto: enunciadoTrilingue(frases, [vazao, litros, x], {
      pt: () =>
        'O reservatório PERDE água: a taxa entra com sinal negativo. Esvaziar é chegar a zero.',
      fr: () =>
        'Le réservoir PERD de l’eau : le taux entre avec un signe négatif. Se vider, c’est arriver à zéro.',
      en: () =>
        'The tank LOSES water: the rate enters with a negative sign. Emptying means reaching zero.',
    }),
  };
}

/** Salário com comissão: fixo mais comissão por venda. */
export function salarioComComissao(rng: Rng, nivel: Nivel, pergunta: Pergunta): Historia {
  const a = rng.inteiro(2, nivel === 'facil' ? 5 : 15);
  const b = inicial(rng, nivel, 20);
  const x = rng.inteiro(3, 15);

  const frases: Frases<[number, number, number]> = {
    pt: (comissao, fixo, vendas) =>
      `Um vendedor recebe R$ ${fixo} de salário fixo mais R$ ${comissao} de comissão por venda. ` +
      (pergunta === 'valor'
        ? `Quanto recebe num mês com ${vendas} vendas?`
        : pergunta === 'raiz'
          ? `Quantas vendas ele precisa fazer para receber R$ ${fixo + comissao * vendas}?`
          : 'Quanto a mais ele recebe por cada venda?'),
    fr: (comissao, fixo, vendas) =>
      `Un vendeur reçoit ${fixo} $ de salaire fixe plus ${comissao} $ de commission par vente. ` +
      (pergunta === 'valor'
        ? `Combien reçoit-il un mois avec ${vendas} ventes ?`
        : pergunta === 'raiz'
          ? `Combien de ventes doit-il faire pour recevoir ${fixo + comissao * vendas} $ ?`
          : 'Combien reçoit-il de plus par vente ?'),
    en: (comissao, fixo, vendas) =>
      `A salesperson earns a $${fixo} base salary plus $${comissao} commission per sale. ` +
      (pergunta === 'valor'
        ? `How much does he earn in a month with ${vendas} sales?`
        : pergunta === 'raiz'
          ? `How many sales does he need to earn $${fixo + comissao * vendas}?`
          : 'How much more does he earn per sale?'),
  };

  return {
    a,
    b,
    pergunta,
    x,
    alvo: b + a * x,
    texto: enunciadoTrilingue(frases, [a, b, x], {
      pt: () => 'O salário fixo é o valor de f(0): existe mesmo sem nenhuma venda.',
      fr: () => 'Le salaire fixe est la valeur de f(0) : il existe même sans aucune vente.',
      en: () => 'The base salary is the value of f(0): it exists even with no sales at all.',
    }),
  };
}

/** Plano de dados: mensalidade mais preço por GB excedente. */
export function planoDeDados(rng: Rng, nivel: Nivel, pergunta: Pergunta): Historia {
  const a = rng.inteiro(2, nivel === 'facil' ? 5 : 12);
  const b = inicial(rng, nivel);
  const x = rng.inteiro(2, 14);

  const frases: Frases<[number, number, number]> = {
    pt: (porGb, mensalidade, gb) =>
      `Um plano de celular custa R$ ${mensalidade} por mês mais R$ ${porGb} por GB excedente. ` +
      (pergunta === 'valor'
        ? `Quanto se paga num mês com ${gb} GB excedentes?`
        : pergunta === 'raiz'
          ? `Com quantos GB excedentes a conta fica em R$ ${mensalidade + porGb * gb}?`
          : 'Quanto custa cada GB excedente?'),
    fr: (porGb, mensalidade, gb) =>
      `Un forfait mobile coûte ${mensalidade} $ par mois plus ${porGb} $ par Go dépassé. ` +
      (pergunta === 'valor'
        ? `Combien paie-t-on un mois avec ${gb} Go dépassés ?`
        : pergunta === 'raiz'
          ? `Avec combien de Go dépassés la facture atteint-elle ${mensalidade + porGb * gb} $ ?`
          : 'Combien coûte chaque Go dépassé ?'),
    en: (porGb, mensalidade, gb) =>
      `A mobile plan costs $${mensalidade} a month plus $${porGb} per extra GB. ` +
      (pergunta === 'valor'
        ? `How much do you pay in a month with ${gb} extra GB?`
        : pergunta === 'raiz'
          ? `With how many extra GB does the bill reach $${mensalidade + porGb * gb}?`
          : 'How much does each extra GB cost?'),
  };

  return {
    a,
    b,
    pergunta,
    x,
    alvo: b + a * x,
    texto: enunciadoTrilingue(frases, [a, b, x]),
  };
}

/** Impressão: páginas restantes diminuindo dia a dia. */
export function impressao(rng: Rng, nivel: Nivel, pergunta: Pergunta): Historia {
  const porDia = rng.inteiro(5, nivel === 'facil' ? 10 : 20);
  const paginas = porDia * rng.inteiro(4, 12);
  const x = rng.inteiro(2, 10);

  const frases: Frases<[number, number, number]> = {
    pt: (diarias, total, dias) =>
      `Uma gráfica tem ${total} páginas para imprimir e imprime ${diarias} por dia. ` +
      (pergunta === 'valor'
        ? `Quantas páginas faltam depois de ${dias} dias?`
        : pergunta === 'raiz'
          ? 'Em quantos dias a encomenda fica pronta?'
          : 'Quantas páginas ela imprime por dia?'),
    fr: (diarias, total, dias) =>
      `Un atelier a ${total} pages à imprimer et en imprime ${diarias} par jour. ` +
      (pergunta === 'valor'
        ? `Combien de pages reste-t-il après ${dias} jours ?`
        : pergunta === 'raiz'
          ? 'En combien de jours la commande est-elle prête ?'
          : 'Combien de pages imprime-t-il par jour ?'),
    en: (diarias, total, dias) =>
      `A print shop has ${total} pages to print and prints ${diarias} a day. ` +
      (pergunta === 'valor'
        ? `How many pages are left after ${dias} days?`
        : pergunta === 'raiz'
          ? 'In how many days is the order finished?'
          : 'How many pages does it print per day?'),
  };

  return {
    a: -porDia,
    b: paginas,
    pergunta,
    x,
    alvo: 0,
    taxaPositiva: true,
    texto: enunciadoTrilingue(frases, [porDia, paginas, x]),
  };
}

/** Estacionamento: primeira hora mais fração por hora, crescendo. */
export function estacionamento(rng: Rng, nivel: Nivel, pergunta: Pergunta): Historia {
  const a = rng.inteiro(2, nivel === 'facil' ? 5 : 9);
  const b = rng.inteiro(2, 4) * 5;
  const x = rng.inteiro(2, 10);

  const frases: Frases<[number, number, number]> = {
    pt: (porHora, entrada, horas) =>
      `Um estacionamento cobra R$ ${entrada} pela entrada mais R$ ${porHora} por hora. ` +
      (pergunta === 'valor'
        ? `Quanto custa deixar o carro por ${horas} horas?`
        : pergunta === 'raiz'
          ? `Quantas horas o carro pode ficar com R$ ${entrada + porHora * horas}?`
          : 'Quanto custa cada hora adicional?'),
    fr: (porHora, entrada, horas) =>
      `Un parking facture ${entrada} $ à l’entrée plus ${porHora} $ par heure. ` +
      (pergunta === 'valor'
        ? `Combien coûte ${horas} heures de stationnement ?`
        : pergunta === 'raiz'
          ? `Combien d’heures peut-on stationner avec ${entrada + porHora * horas} $ ?`
          : 'Combien coûte chaque heure supplémentaire ?'),
    en: (porHora, entrada, horas) =>
      `A car park charges $${entrada} on entry plus $${porHora} per hour. ` +
      (pergunta === 'valor'
        ? `How much does ${horas} hours of parking cost?`
        : pergunta === 'raiz'
          ? `How many hours can you park with $${entrada + porHora * horas}?`
          : 'How much does each extra hour cost?'),
  };

  return {
    a,
    b,
    pergunta,
    x,
    alvo: b + a * x,
    texto: enunciadoTrilingue(frases, [a, b, x]),
  };
}

type Construtor = (rng: Rng, nivel: Nivel, pergunta: Pergunta) => Historia;

/**
 * As histórias de cada nível, e a pergunta que cada uma sabe fazer.
 *
 * O Fácil só pergunta o valor — a substituição. A raiz entra no Médio e a taxa
 * no Difícil, que é a ordem em que as três leituras se tornam abstratas: achar
 * f(x) pede uma conta; achar x pede isolar; reconhecer a taxa pede ler o
 * coeficiente por trás da situação.
 */
const CATALOGO: Readonly<Record<Nivel, readonly (readonly [Construtor, readonly Pergunta[]])[]>> = {
  facil: [
    [taxi, ['valor']],
    [reservatorio, ['valor']],
    [salarioComComissao, ['valor']],
    [estacionamento, ['valor']],
  ],
  medio: [
    [taxi, ['valor', 'raiz']],
    [reservatorio, ['valor', 'raiz']],
    [salarioComComissao, ['valor', 'raiz']],
    [planoDeDados, ['valor', 'raiz']],
  ],
  dificil: [
    [taxi, ['raiz', 'taxa']],
    [reservatorio, ['raiz', 'taxa']],
    [planoDeDados, ['raiz', 'taxa']],
    [impressao, ['raiz', 'taxa']],
  ],
  extremo: [
    [taxi, ['taxa']],
    [salarioComComissao, ['taxa']],
    [impressao, ['taxa']],
    [reservatorio, ['taxa']],
  ],
};

/** Sorteia uma história do nível, com a pergunta que ela sabe fazer. */
export function historiaPara(nivel: Nivel, rng: Rng): Historia {
  const [construtor, perguntas] = rng.escolher(CATALOGO[nivel]);
  return construtor(rng, nivel, rng.escolher(perguntas));
}
