import { Relacao } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { Nivel } from '@core/treino/models/treino.model';
import {
  EnunciadoTrilingue,
  Frases,
  enunciadoTrilingue,
} from '@core/treino/textos/texto-trilingue';

/**
 * Situações que terminam numa inequação do 1º grau.
 *
 * «Resolva 8x + 4 ≤ 60» treina o algoritmo; «tenho R$ 60, cada caderno custa
 * R$ 8 e o frete é R$ 4» treina *escrever* a inequação — e é a escrita que
 * falta fora da escola. O aluno sabe dividir dos dois lados; o que ele não
 * sabe é decidir que «no máximo» vira ≤ e que o frete é cobrado uma vez, não
 * por caderno.
 *
 * Por isso o enunciado NÃO traz a conta: montá-la é metade do exercício. Ela
 * aparece na resolução, depois da resposta, que é quando ela ensina.
 *
 * Os números ficam explícitos no objeto (e não só dentro do texto) porque o
 * teste do tópico confere a coerência da história: a fronteira do conjunto
 * solução tem de ser exatamente o valor em que a·x + b iguala c. Se a frase e
 * a conta divergirem, o teste acusa.
 */
export interface HistoriaInequacao {
  /** Nome curto da situação, para o `id` do exercício e para os testes. */
  readonly cenario: string;
  /** Coeficiente de x em `a·x + b REL c`. */
  readonly a: number;
  readonly b: number;
  readonly c: number;
  /** O sentido que a situação impõe. */
  readonly relacao: Relacao;
  readonly texto: EnunciadoTrilingue;
}

// ─────────────────────────────────────────────────────────────────────────────
// Orçamento: um gasto por unidade mais um gasto fixo.
// ─────────────────────────────────────────────────────────────────────────────

export function orcamentoComFrete(rng: Rng, nivel: Nivel): HistoriaInequacao {
  const preco = rng.inteiro(4, nivel === 'facil' ? 9 : 14);
  const frete = rng.inteiro(3, 15);
  const quantos = rng.inteiro(3, nivel === 'facil' ? 9 : 16);
  const orcamento = preco * quantos + frete;

  const frases: Frases<[number, number, number]> = {
    pt: (p, f, o) =>
      `Tenho R$ ${o} para gastar. Cada caderno custa R$ ${p} e o frete da compra é R$ ${f}, ` +
      'cobrado uma vez só. Chamando de x a quantidade de cadernos, escreva o conjunto de ' +
      'valores de x que cabem no orçamento.',
    fr: (p, f, o) =>
      `J’ai ${o} $ à dépenser. Chaque cahier coûte ${p} $ et la livraison coûte ${f} $, ` +
      'facturée une seule fois. En appelant x le nombre de cahiers, écrivez l’ensemble des ' +
      'valeurs de x qui tiennent dans le budget.',
    en: (p, f, o) =>
      `I have $${o} to spend. Each notebook costs $${p} and shipping is $${f}, charged once. ` +
      'Calling x the number of notebooks, write the set of x values that fit the budget.',
  };

  return {
    cenario: 'orcamento',
    a: preco,
    b: frete,
    c: orcamento,
    relacao: '<=',
    texto: enunciadoTrilingue(frases, [preco, frete, orcamento], {
      pt: () => 'O frete é cobrado uma vez, não por caderno. Monte: (preço)·x + frete ≤ orçamento.',
      fr: () =>
        'La livraison est facturée une fois, pas par cahier. Posez : (prix)·x + livraison ≤ budget.',
      en: () =>
        'Shipping is charged once, not per notebook. Set up: (price)·x + shipping ≤ budget.',
    }),
  };
}

export function metaDeVendas(rng: Rng, nivel: Nivel): HistoriaInequacao {
  const fixo = rng.inteiro(8, 24) * 50;
  const comissao = rng.inteiro(20, 80);
  const vendas = rng.inteiro(5, nivel === 'facil' ? 15 : 30);
  const meta = fixo + comissao * vendas;

  const frases: Frases<[number, number, number]> = {
    pt: (f, c, m) =>
      `Um vendedor recebe R$ ${f} de salário fixo mais R$ ${c} por venda. Chamando de x o ` +
      `número de vendas do mês, escreva o conjunto de valores de x com que ele fatura pelo ` +
      `menos R$ ${m}.`,
    fr: (f, c, m) =>
      `Un vendeur reçoit ${f} $ de salaire fixe plus ${c} $ par vente. En appelant x le nombre ` +
      `de ventes du mois, écrivez l’ensemble des valeurs de x pour lesquelles il gagne au ` +
      `moins ${m} $.`,
    en: (f, c, m) =>
      `A salesperson earns a $${f} base salary plus $${c} per sale. Calling x the number of ` +
      `sales in the month, write the set of x values for which he earns at least $${m}.`,
  };

  return {
    cenario: 'vendas',
    a: comissao,
    b: fixo,
    c: meta,
    relacao: '>=',
    texto: enunciadoTrilingue(frases, [fixo, comissao, meta], {
      pt: () => '«Pelo menos» vira ≥. O salário fixo é somado uma vez, não por venda.',
      fr: () => '« Au moins » devient ≥. Le salaire fixe s’ajoute une fois, pas par vente.',
      en: () => '“At least” becomes ≥. The base salary is added once, not per sale.',
    }),
  };
}

export function elevador(rng: Rng, nivel: Nivel): HistoriaInequacao {
  const pesoCaixa = rng.inteiro(40, 90);
  const pesoCarrinho = rng.inteiro(20, 120);
  const caixas = rng.inteiro(2, nivel === 'facil' ? 6 : 12);
  const carga = pesoCaixa * caixas + pesoCarrinho;

  const frases: Frases<[number, number, number]> = {
    pt: (p, c, l) =>
      `O elevador de carga suporta ${l} kg. Cada caixa pesa ${p} kg e o carrinho que as ` +
      `transporta pesa ${c} kg. Chamando de x o número de caixas, escreva o conjunto de ` +
      'valores de x que o elevador leva numa viagem.',
    fr: (p, c, l) =>
      `Le monte-charge supporte ${l} kg. Chaque caisse pèse ${p} kg et le chariot qui les ` +
      `transporte pèse ${c} kg. En appelant x le nombre de caisses, écrivez l’ensemble des ` +
      'valeurs de x que l’ascenseur transporte en un voyage.',
    en: (p, c, l) =>
      `The freight lift holds ${l} kg. Each box weighs ${p} kg and the trolley that carries ` +
      `them weighs ${c} kg. Calling x the number of boxes, write the set of x values the lift ` +
      'takes in one trip.',
  };

  return {
    cenario: 'elevador',
    a: pesoCaixa,
    b: pesoCarrinho,
    c: carga,
    relacao: '<=',
    texto: enunciadoTrilingue(frases, [pesoCaixa, pesoCarrinho, carga], {
      pt: () => 'O carrinho pesa também, e é um peso só dele, não por caixa.',
      fr: () => 'Le chariot pèse aussi, et c’est son poids à lui, pas par caisse.',
      en: () => 'The trolley weighs too, and that is its own weight, not per box.',
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Comparar duas ofertas: x aparece dos dois lados.
// ─────────────────────────────────────────────────────────────────────────────

export function doisPlanos(rng: Rng, nivel: Nivel): HistoriaInequacao {
  const mensalidade = rng.inteiro(2, nivel === 'facil' ? 5 : 9) * 10;
  const porFilmeA = rng.inteiro(2, 5);
  const porFilmeB = porFilmeA + rng.inteiro(2, 5);
  // B fica mais barato quando porFilmeB·x < mensalidade + porFilmeA·x,
  // isto é: −(B−A)·x + mensalidade > 0.
  const diferenca = porFilmeB - porFilmeA;
  const corte = mensalidade / diferenca;

  // O corte só faz sentido como número redondo: a mensalidade é múltipla da diferença.
  const mensalidadeAjustada = diferenca * Math.round(corte) || diferenca * 4;

  const frases: Frases<[number, number, number]> = {
    pt: (m, a, b) =>
      `O plano A custa R$ ${m} por mês mais R$ ${a} por filme alugado. O plano B não tem ` +
      `mensalidade e cobra R$ ${b} por filme. Chamando de x o número de filmes alugados no ` +
      'mês, escreva o conjunto de valores de x em que o plano B sai mais barato.',
    fr: (m, a, b) =>
      `La formule A coûte ${m} $ par mois plus ${a} $ par film loué. La formule B n’a pas ` +
      `d’abonnement et facture ${b} $ par film. En appelant x le nombre de films loués dans ` +
      'le mois, écrivez l’ensemble des valeurs de x pour lesquelles la formule B coûte moins cher.',
    en: (m, a, b) =>
      `Plan A costs $${m} a month plus $${a} per rented film. Plan B has no monthly fee and ` +
      `charges $${b} per film. Calling x the number of films rented in the month, write the ` +
      'set of x values for which plan B is cheaper.',
  };

  return {
    cenario: 'planos',
    a: -diferenca,
    b: mensalidadeAjustada,
    c: 0,
    relacao: '>',
    texto: enunciadoTrilingue(frases, [mensalidadeAjustada, porFilmeA, porFilmeB], {
      pt: () =>
        'Monte as duas despesas e compare: mensalidade + (A)·x > (B)·x. Passe tudo para um ' +
        'lado antes de isolar x.',
      fr: () =>
        'Posez les deux dépenses et comparez : abonnement + (A)·x > (B)·x. Passez tout d’un ' +
        'côté avant d’isoler x.',
      en: () =>
        'Set up both costs and compare: fee + (A)·x > (B)·x. Move everything to one side ' +
        'before isolating x.',
    }),
  };
}

export function duasOfertas(rng: Rng, nivel: Nivel): HistoriaInequacao {
  const barato = rng.inteiro(2, 6);
  const caro = barato + rng.inteiro(1, 4);
  const taxa = (caro - barato) * rng.inteiro(3, nivel === 'facil' ? 6 : 12);
  const diferenca = caro - barato;

  const frases: Frases<[number, number, number]> = {
    pt: (a, b, t) =>
      `A gráfica A cobra R$ ${a} por página impressa. A gráfica B cobra R$ ${b} por página e ` +
      `mais uma taxa fixa de R$ ${t} para preparar o arquivo. Chamando de x o número de ` +
      'páginas, escreva o conjunto de valores de x em que a gráfica B sai mais cara.',
    fr: (a, b, t) =>
      `L’imprimerie A facture ${a} $ par page. L’imprimerie B facture ${b} $ par page plus des ` +
      `frais fixes de ${t} $ pour préparer le fichier. En appelant x le nombre de pages, ` +
      'écrivez l’ensemble des valeurs de x pour lesquelles B coûte plus cher.',
    en: (a, b, t) =>
      `Print shop A charges $${a} per page. Print shop B charges $${b} per page plus a flat ` +
      `$${t} file setup fee. Calling x the number of pages, write the set of x values for ` +
      'which B is more expensive.',
  };

  return {
    cenario: 'graficas',
    a: diferenca,
    b: -taxa,
    c: 0,
    relacao: '>',
    texto: enunciadoTrilingue(frases, [barato, caro, taxa], {
      pt: () =>
        'Compare as duas despesas: (B)·x + taxa > (A)·x. A taxa entra uma vez e com sinal negativo quando muda de lado.',
      fr: () =>
        'Comparez les deux dépenses : (B)·x + frais > (A)·x. Les frais entrent une fois et changent de signe en passant de l’autre côté.',
      en: () =>
        'Compare both costs: (B)·x + fee > (A)·x. The fee enters once and changes sign when moved across.',
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Medidas que mudam com o tempo: o coeficiente é negativo.
// ─────────────────────────────────────────────────────────────────────────────

export function reservatorio(rng: Rng, nivel: Nivel): HistoriaInequacao {
  const consumo = rng.inteiro(3, nivel === 'facil' ? 8 : 15);
  const horas = rng.inteiro(2, nivel === 'facil' ? 8 : 14);
  const nivelInicial = consumo * horas + rng.inteiro(10, 40);
  const minimo = rng.inteiro(5, 30);

  const frases: Frases<[number, number, number]> = {
    pt: (c, n, m) =>
      `Um tanque tem ${n} litros e perde ${c} litros por hora. Chamando de x o número de ` +
      `horas, escreva o conjunto de valores de x em que ainda restam pelo menos ${m} litros.`,
    fr: (c, n, m) =>
      `Un réservoir contient ${n} litres et perd ${c} litres par heure. En appelant x le ` +
      `nombre d’heures, écrivez l’ensemble des valeurs de x pour lesquelles il reste au moins ` +
      `${m} litres.`,
    en: (c, n, m) =>
      `A tank holds ${n} litres and loses ${c} litres per hour. Calling x the number of hours, ` +
      `write the set of x values for which at least ${m} litres remain.`,
  };

  return {
    cenario: 'tanque',
    a: -consumo,
    b: nivelInicial,
    c: minimo,
    relacao: '>=',
    texto: enunciadoTrilingue(frases, [consumo, nivelInicial, minimo], {
      pt: () =>
        'O tanque PERDE água, então o coeficiente de x é negativo. «Pelo menos» vira ≥, mas não inverta o sentido duas vezes.',
      fr: () =>
        'Le réservoir PERD de l’eau, le coefficient de x est donc négatif. « Au moins » devient ≥, mais n’inversez pas le sens deux fois.',
      en: () =>
        'The tank LOSES water, so the coefficient of x is negative. “At least” becomes ≥, but do not flip the direction twice.',
    }),
  };
}

export function temperatura(rng: Rng, nivel: Nivel): HistoriaInequacao {
  const queda = rng.inteiro(1, nivel === 'facil' ? 4 : 8);
  const horas = rng.inteiro(3, nivel === 'facil' ? 9 : 15);
  // A base é uma temperatura de madrugada de verdade: 60 °C à meia-noite
  // tornaria a história absurda e desviaria a atenção do que se quer ensinar.
  const inicial = Math.min(queda * horas, rng.inteiro(3, 6) * 5);

  const frases: Frases<[number, number]> = {
    pt: (q, i) =>
      `À meia-noite a temperatura era de ${i} °C e cai ${q} °C por hora. Chamando de x o ` +
      'número de horas, escreva o conjunto de valores de x em que a temperatura ainda está ' +
      'acima de 0 °C.',
    fr: (q, i) =>
      `À minuit, la température était de ${i} °C et elle baisse de ${q} °C par heure. En ` +
      'appelant x le nombre d’heures, écrivez l’ensemble des valeurs de x pour lesquelles la ' +
      'température est encore au-dessus de 0 °C.',
    en: (q, i) =>
      `At midnight the temperature was ${i} °C and it drops ${q} °C per hour. Calling x the ` +
      'number of hours, write the set of x values for which the temperature is still above ' +
      '0 °C.',
  };

  return {
    cenario: 'temperatura',
    a: -queda,
    b: inicial,
    c: 0,
    relacao: '>',
    texto: enunciadoTrilingue(frases, [queda, inicial], {
      pt: () =>
        '«Acima de zero» é estrito: > e não ≥. A temperatura CHEGA a zero exatamente na fronteira, e ali já não está acima.',
      fr: () =>
        '« Au-dessus de zéro » est strict : > et non ≥. La température ATTEINT zéro exactement à la frontière, et là elle n’est plus au-dessus.',
      en: () =>
        '“Above zero” is strict: > not ≥. The temperature REACHES zero exactly at the boundary, and there it is no longer above.',
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Resultado acumulado: custo, lucro, média.
// ─────────────────────────────────────────────────────────────────────────────

export function lucroNegativo(rng: Rng, nivel: Nivel): HistoriaInequacao {
  const porPeca = rng.inteiro(3, nivel === 'facil' ? 9 : 18);
  const pecas = rng.inteiro(3, nivel === 'facil' ? 9 : 15);
  const custoFixo = porPeca * pecas;

  const frases: Frases<[number, number]> = {
    pt: (p, c) =>
      `Cada peça vendida deixa R$ ${p} de margem, e a produção teve R$ ${c} de custo fixo. ` +
      'Chamando de x o número de peças vendidas, escreva o conjunto de valores de x em que o ' +
      'negócio ainda está no prejuízo.',
    fr: (p, c) =>
      `Chaque pièce vendue laisse ${p} $ de marge, et la production a coûté ${c} $ de frais ` +
      'fixes. En appelant x le nombre de pièces vendues, écrivez l’ensemble des valeurs de x ' +
      'pour lesquelles l’affaire est encore en perte.',
    en: (p, c) =>
      `Each piece sold brings a margin of $${p}, and production had $${c} in fixed costs. ` +
      'Calling x the number of pieces sold, write the set of x values for which the business ' +
      'is still at a loss.',
  };

  return {
    cenario: 'prejuizo',
    a: porPeca,
    b: -custoFixo,
    c: 0,
    relacao: '<',
    texto: enunciadoTrilingue(frases, [porPeca, custoFixo], {
      pt: () =>
        'Prejuízo é lucro NEGATIVO: (margem)·x − custo fixo < 0. O custo fixo entra subtraindo.',
      fr: () =>
        'Perte = bénéfice NÉGATIF : (marge)·x − frais fixes < 0. Les frais fixes entrent en soustraction.',
      en: () =>
        'A loss is NEGATIVE profit: (margin)·x − fixed costs < 0. The fixed cost enters subtracting.',
    }),
  };
}

export function mediaDeNotas(rng: Rng, nivel: Nivel): HistoriaInequacao {
  const alvo = rng.inteiro(6, 9);

  /*
   * As três notas cabem na escala 0–10.
   *
   * A ordem do sorteio é invertida de propósito: primeiro a resposta (a nota
   * que falta), depois a soma que ela exige, e só então as duas notas já
   * feitas. Sorteando as duas primeiras notas e calculando a terceira, saía
   * «tirei 5 e 5, média pelo menos 7» → x ≥ 11 — uma nota que não existe. A
   * conta estaria certa e a situação, falsa.
   */
  const falta = rng.inteiro(Math.max(0, 3 * alvo - 20), 10);
  const soma = 3 * alvo - falta;
  const primeira = rng.inteiro(Math.max(0, soma - 10), Math.min(10, soma));
  const segunda = soma - primeira;

  const frases: Frases<[number, number, number]> = {
    pt: (p, s, a) =>
      `Nas duas primeiras provas tirei ${p} e ${s}. A média das três provas precisa ser de ` +
      `pelo menos ${a}. Chamando de x a nota da terceira prova, escreva o conjunto de valores ` +
      'de x que garantem essa média.',
    fr: (p, s, a) =>
      `Aux deux premiers examens, j’ai eu ${p} et ${s}. La moyenne des trois examens doit ` +
      `être d’au moins ${a}. En appelant x la note du troisième examen, écrivez l’ensemble des ` +
      'valeurs de x qui garantissent cette moyenne.',
    en: (p, s, a) =>
      `On the first two exams I got ${p} and ${s}. The average of the three exams must be at ` +
      `least ${a}. Calling x the third exam score, write the set of x values that guarantee ` +
      'that average.',
  };

  return {
    cenario: 'media',
    a: 1,
    b: soma,
    c: 3 * alvo,
    relacao: '>=',
    texto: enunciadoTrilingue(frases, [primeira, segunda, alvo], {
      pt: () =>
        'Média de três provas é (soma)/3. Multiplique os dois lados por 3 — é positivo, o ' +
        'sentido não muda — e depois tire a soma das duas notas já feitas.',
      fr: () =>
        'La moyenne de trois examens, c’est (somme)/3. Multipliez les deux côtés par 3 — c’est ' +
        'positif, le sens ne change pas — puis retirez la somme des deux notes déjà obtenues.',
      en: () =>
        'The average of three exams is (sum)/3. Multiply both sides by 3 — it is positive, so ' +
        'the direction does not change — then subtract the two scores you already have.',
    }),
  };
}

export function velocidadeMinima(rng: Rng, nivel: Nivel): HistoriaInequacao {
  const horas = rng.inteiro(2, nivel === 'facil' ? 5 : 9);
  const porHora = rng.inteiro(40, 110);
  const distancia = horas * porHora;

  const frases: Frases<[number, number]> = {
    pt: (d, h) =>
      `Preciso percorrer ${d} km e o trajeto tem de ser feito em no máximo ${h} horas. ` +
      'Chamando de x a velocidade média, em km/h, escreva o conjunto de valores de x que ' +
      'cumprem o prazo.',
    fr: (d, h) =>
      `Je dois parcourir ${d} km et le trajet doit être fait en ${h} heures au maximum. En ` +
      'appelant x la vitesse moyenne, en km/h, écrivez l’ensemble des valeurs de x qui ' +
      'respectent le délai.',
    en: (d, h) =>
      `I must travel ${d} km and the trip has to be done in at most ${h} hours. Calling x the ` +
      'average speed in km/h, write the set of x values that meet the deadline.',
  };

  return {
    cenario: 'velocidade',
    a: horas,
    b: 0,
    c: distancia,
    relacao: '>=',
    texto: enunciadoTrilingue(frases, [distancia, horas], {
      pt: () =>
        'Distância = velocidade × tempo. Com a distância fixa, tempo ≤ limite vira ' +
        'velocidade ≥ distância ÷ limite.',
      fr: () =>
        'Distance = vitesse × temps. À distance fixe, temps ≤ limite devient ' +
        'vitesse ≥ distance ÷ limite.',
      en: () =>
        'Distance = speed × time. With a fixed distance, time ≤ limit becomes ' +
        'speed ≥ distance ÷ limit.',
    }),
  };
}

type Construtor = (rng: Rng, nivel: Nivel) => HistoriaInequacao;

/**
 * As situações de cada nível.
 *
 * O Fácil só tem coeficiente positivo e sentido que não inverte: a lição ali é
 * ler «no máximo» e «pelo menos». Do Médio em diante entram o coeficiente
 * negativo (tanque, temperatura, comparar planos), que é onde o erro clássico
 * mora, e no Extremo ficam as três em que o x aparece dos dois lados.
 */
const CATALOGO: Readonly<Record<Nivel, readonly Construtor[]>> = {
  facil: [orcamentoComFrete, elevador, metaDeVendas, mediaDeNotas],
  medio: [
    orcamentoComFrete,
    elevador,
    metaDeVendas,
    mediaDeNotas,
    doisPlanos,
    reservatorio,
    lucroNegativo,
  ],
  dificil: [
    orcamentoComFrete,
    metaDeVendas,
    mediaDeNotas,
    doisPlanos,
    reservatorio,
    temperatura,
    duasOfertas,
    lucroNegativo,
  ],
  extremo: [
    orcamentoComFrete,
    mediaDeNotas,
    doisPlanos,
    reservatorio,
    temperatura,
    duasOfertas,
    velocidadeMinima,
  ],
};

/** Sorteia uma situação do nível. */
export function historiaPara(nivel: Nivel, rng: Rng): HistoriaInequacao {
  return rng.escolher(CATALOGO[nivel])(rng, nivel);
}
