import {
  Polinomio,
  Relacao,
  Resolucao,
  SIMBOLO_RELACAO,
  binomioParaTex,
  resolverInequacaoProdutoComPassos,
  resolverInequacaoQuadraticaComPassos,
  resolverInequacaoQuocienteComPassos,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { Nivel } from '@core/treino/models/treino.model';
import {
  EnunciadoTrilingue,
  Frases,
  enunciadoTrilingue,
} from '@core/treino/textos/texto-trilingue';
import { ConjuntoSolucaoReal } from '@core/math';

/**
 * Situações cuja resposta é um pedaço da reta — e não um intervalo qualquer.
 *
 * O tópico existe para ensinar UMA decisão: entre as raízes ou fora delas?
 * Numa conta solta, o aluno escolhe pelo sinal do coeficiente e segue; numa
 * situação, ele precisa saber o que «entre» significa — que o lucro é positivo
 * entre dois preços, que o projétil está acima de certa altura durante um
 * intervalo de tempo, que a área máxima de um terreno cercado acontece num
 * ponto e a área desejada num intervalo.
 *
 * A expressão CONTINUA visível no enunciado (`tex`), ao contrário do que
 * acontece em `inequacoes`: lá montar a inequação é a lição, aqui a lição é
 * interpretar o sinal. Exigir as duas coisas na mesma questão dobraria a
 * dificuldade sem ensinar mais.
 */
export type ExpressaoDaHistoria =
  | { readonly tipo: 'trinomio'; readonly a: number; readonly b: number; readonly c: number }
  | {
      readonly tipo: 'produto' | 'quociente';
      readonly p: number;
      readonly q: number;
      readonly r: number;
      readonly s: number;
    };

export interface HistoriaSinal {
  /** Nome curto da situação, para o `id` e para os testes. */
  readonly cenario: string;
  readonly expressao: ExpressaoDaHistoria;
  readonly relacao: Relacao;
  /** O conceito que o erro aponta. */
  readonly conceito: string;
  readonly texto: EnunciadoTrilingue;
  /** A expressão como o aluno a vê — é ela que a resolução desenvolve. */
  readonly tex: string;
}

/** Resolve a expressão da história com o motor de sempre. */
export function resolverHistoria(historia: HistoriaSinal): Resolucao<ConjuntoSolucaoReal> {
  const { expressao, relacao } = historia;
  switch (expressao.tipo) {
    case 'trinomio':
      return resolverInequacaoQuadraticaComPassos(expressao.a, expressao.b, expressao.c, relacao);
    case 'produto':
      return resolverInequacaoProdutoComPassos(
        expressao.p,
        expressao.q,
        expressao.r,
        expressao.s,
        relacao,
      );
    case 'quociente':
      return resolverInequacaoQuocienteComPassos(
        expressao.p,
        expressao.q,
        expressao.r,
        expressao.s,
        relacao,
      );
  }
}

/**
 * Desce o nível do trinômio para o termo constante.
 *
 * O enunciado diz «a área é MAIOR que 400 m²», e o 400 tem de entrar na conta:
 * `−2x² + 60x − 400 > 0`. Deixá-lo só no texto era o erro que fazia a expressão
 * exibida e o conjunto solução discordarem — o enunciado pedia 400 e a
 * resolução respondia como se fossem 0.
 */
/**
 * Desce o nível do trinômio para o termo constante — usado só onde o alvo é
 * escolhido DEPOIS das raízes.
 *
 * Cuidado: subtrair uma constante de um trinômio MUDA as raízes. Por isso este
 * helper não serve para «custo abaixo do teto» nem para «projétil acima da
 * altura»: lá o trinômio é a diferença e as raízes são as que o quadro de
 * sinais usa, sem deslocamento nenhum.
 */
function deslocarNivel(expressao: ExpressaoDaHistoria, nivel: number): ExpressaoDaHistoria {
  if (expressao.tipo !== 'trinomio') {
    return expressao;
  }
  return { ...expressao, c: expressao.c - nivel };
}

/** O trinômio de raízes inteiras `k(x − r1)(x − r2)`, expandido. */
function trinomioPorRaizes(k: number, r1: number, r2: number): ExpressaoDaHistoria {
  return { tipo: 'trinomio', a: k, b: -k * (r1 + r2), c: k * r1 * r2 };
}

/**
 * `(x + 4)` ou `(x − 3)` — o fator da raiz, já com o sinal resolvido.
 *
 * Escrever «(x − (-4))» entrega que a frase foi montada por concatenação, e
 * faz o aluno tropeçar na leitura justamente no ponto que o exercício quer
 * que ele leia com clareza.
 */
/**
 * A frase que explica o que é o trinômio quando ele já vem deslocado.
 *
 * Sem ela o enunciado dizia que o trinômio É o custo, quando na verdade ele é
 * o custo menos o teto — e o aluno ia procurar a fonte do erro na conta.
 */
const COMO_O_TRINOMIO = ' O trinômio abaixo é o custo MENOS o teto.';
const COMO_O_TRINOMIO_FR = ' Le trinôme est le coût MOINS le plafond.';
const COMO_O_TRINOMIO_EN = ' The trinomial is the cost MINUS the cap.';

function fator(raiz: number): string {
  return raiz === 0 ? '(x)' : raiz > 0 ? `(x − ${raiz})` : `(x + ${-raiz})`;
}

const texDoTrinomio = (e: ExpressaoDaHistoria): string =>
  e.tipo === 'trinomio' ? Polinomio.de(e.c, e.b, e.a).paraTex() : '';

/** `(p·x + q)(r·x + s) REL 0`. */
const texDoProduto = (e: ExpressaoDaHistoria, relacao: Relacao): string =>
  e.tipo === 'trinomio'
    ? ''
    : `\\left(${binomioParaTex(e.p, e.q)}\\right)\\left(${binomioParaTex(e.r, e.s)}\\right) ${SIMBOLO_RELACAO[relacao]} 0`;

/** `(p·x + q)/(r·x + s) REL 0`. */
const texDoQuociente = (e: ExpressaoDaHistoria, relacao: Relacao): string =>
  e.tipo === 'trinomio'
    ? ''
    : `\\frac{${binomioParaTex(e.p, e.q)}}{${binomioParaTex(e.r, e.s)}} ${SIMBOLO_RELACAO[relacao]} 0`;

// ─────────────────────────────────────────────────────────────────────────────
// Lucro, custo e preço: a parábola que abre para baixo ou para cima.
// ─────────────────────────────────────────────────────────────────────────────

export function lucroPositivo(rng: Rng, nivel: Nivel): HistoriaSinal {
  const custo = rng.inteiro(2, 6) * 5;
  const teto = custo + rng.inteiro(2, nivel === 'facil' ? 4 : 8) * 10;
  // (p − custo)(teto − p) > 0: positivo ENTRE os dois preços de lucro zero.
  const expressao: ExpressaoDaHistoria = { tipo: 'produto', p: 1, q: -custo, r: -1, s: teto };
  const relacao: Relacao = '>';

  const frases: Frases<[number, number]> = {
    pt: (a, b) =>
      `O lucro de uma peça é L(x) = (x − ${a})(${b} − x), em reais, com x o preço de venda. ` +
      'Escreva o conjunto de preços para os quais o lucro é positivo.',
    fr: (a, b) =>
      `Le bénéfice d’une pièce est B(x) = (x − ${a})(${b} − x), en dollars, où x est le prix de ` +
      'vente. Écrivez l’ensemble des prix pour lesquels le bénéfice est positif.',
    en: (a, b) =>
      `A part’s profit is P(x) = (x − ${a})(${b} − x), in dollars, where x is the selling price. ` +
      'Write the set of prices for which the profit is positive.',
  };

  return {
    cenario: 'lucro',
    expressao,
    relacao,
    conceito: 'sinal.produto',
    tex: texDoProduto(expressao, relacao),
    texto: enunciadoTrilingue(frases, [custo, teto], {
      pt: () =>
        `Cada fator zera num preço: ${custo} e ${teto}. O lucro é nulo nesses dois e positivo ` +
        'entre eles — teste um preço do meio para confirmar.',
      fr: () =>
        `Chaque facteur s’annule à un prix : ${custo} et ${teto}. Le bénéfice est nul à ces ` +
        'deux prix et positif entre eux.',
      en: () =>
        `Each factor is zero at one price: ${custo} and ${teto}. The profit is zero at those ` +
        'two and positive between them.',
    }),
  };
}

export function custoAbaixoDe(rng: Rng, nivel: Nivel): HistoriaSinal {
  const raiz = rng.inteiro(4, 10);
  const distancia = rng.inteiro(2, nivel === 'facil' ? 4 : 7);
  // (q − raiz)² + piso < limite → entre as raízes.
  const piso = rng.inteiro(2, 8) * 5;
  const limite = piso + distancia * distancia;
  const expressao = trinomioPorRaizes(1, raiz - distancia, raiz + distancia);
  const relacao: Relacao = '<';

  const frases: Frases<[number]> = {
    pt: (l) =>
      `O custo de produção de uma peça, em reais, é o trinômio abaixo MAIS R$ ${l}, com x em ` +
      `milhares de peças. A empresa fixou um teto de R$ ${l} por peça. ` +
      'Escreva o conjunto de quantidades em que o custo fica abaixo do teto.' +
      COMO_O_TRINOMIO,
    fr: (l) =>
      `Le coût de production d’une pièce, en dollars, est le trinôme ci-dessous PLUS ${l} $, ` +
      `avec x en milliers de pièces. L’entreprise a fixé un plafond de ${l} $ par pièce. ` +
      'Écrivez l’ensemble des quantités pour lesquelles le coût reste sous le plafond.' +
      COMO_O_TRINOMIO_FR,
    en: (l) =>
      `A part’s production cost, in dollars, is the trinomial below PLUS $${l}, with x in ` +
      `thousands of parts. The company set a cap of $${l} per part. Write the set of quantities ` +
      'for which the cost stays under the cap.' +
      COMO_O_TRINOMIO_EN,
  };

  return {
    cenario: 'custo',
    expressao,
    relacao,
    conceito: 'sinal.trinomio',
    tex: `${texDoTrinomio(expressao)} ${SIMBOLO_RELACAO[relacao]} 0`,
    texto: enunciadoTrilingue(frases, [limite], {
      pt: () =>
        'Ache as raízes desse trinômio e teste um valor entre elas: é ali que o custo fica ' +
        'abaixo do limite.',
      fr: () =>
        'Passez la limite à gauche, trouvez les racines et testez une valeur entre elles : le ' +
        'coût est sous la limite justement là.',
      en: () =>
        'Move the limit to the left, find the roots, and test a value between them: that is ' +
        'exactly where the cost is below the limit.',
    }),
  };
}

export function projetilAcimaDe(rng: Rng, nivel: Nivel): HistoriaSinal {
  const altura = rng.inteiro(1, nivel === 'facil' ? 3 : 5) * 5;
  const base = rng.inteiro(2, nivel === 'facil' ? 4 : 8);
  // h(t) = −5t² + 10·base·t − 5·base² + altura → acima de 0 por distância.
  const distancia = rng.inteiro(1, base - 1);
  const expressao = trinomioPorRaizes(-5, base - distancia, base + distancia);
  const relacao: Relacao = '>';

  const frases: Frases<[number]> = {
    pt: (h) =>
      `A altura de um projétil é de ${h} m mais o trinômio abaixo, em metros, com x em ` +
      `segundos. O trinômio é a altura MENOS ${h} m: escreva o conjunto de instantes em que ` +
      'ele é positivo.',
    fr: (h) =>
      `La hauteur d’un projectile est de ${h} m plus le trinôme ci-dessous, en mètres, avec x ` +
      `en secondes. Le trinôme est la hauteur MOINS ${h} m : écrivez l’ensemble des instants ` +
      'où il est positif.',
    en: (h) =>
      `A projectile’s height is ${h} m plus the trinomial below, in metres, with x in seconds. ` +
      `The trinomial is the height MINUS ${h} m: write the set of instants when it is positive.`,
  };

  return {
    cenario: 'projetil',
    expressao,
    relacao,
    conceito: 'sinal.trinomio',
    tex: `${texDoTrinomio(expressao)} ${SIMBOLO_RELACAO[relacao]} 0`,
    texto: enunciadoTrilingue(frases, [altura], {
      pt: () =>
        'A parábola abre para baixo: o projétil sobe, passa pela altura, desce e volta a passar. ' +
        'O saldo é positivo ENTRE os dois instantes.',
      fr: () =>
        'La parabole s’ouvre vers le bas : le projectile monte, passe la hauteur, redescend et ' +
        'la repasse. Il reste au-dessus ENTRE les deux instants.',
      en: () =>
        'The parabola opens downwards: it rises, crosses the height, falls and crosses again. ' +
        'It stays above the height BETWEEN the two instants.',
    }),
  };
}

export function areaDesejada(rng: Rng, nivel: Nivel): HistoriaSinal {
  /*
   * As duas larguras que dão a MESMA área são escolhidas primeiro, e com elas
   * se monta o enunciado.
   *
   * A(x) = x(L − 2x) tem o máximo em x = L/4; dois valores simétricos em torno
   * dele dão a mesma área. Como L = 2(x₁ + x₂), basta sortear x₁ e obter
   * x₂ = L/2 − x₁. Assim o alvo sai exato — antes ele era calculado por
   * subtração e podia cair fora da parábola, produzindo «vazio» numa situação
   * que deveria ter resposta.
   */
  // Mínimo de 15 m de meia-cerca: com 10 a largura menor cairia exatamente no
  // ponto de área máxima, o alvo viraria o próprio máximo e a resposta seria
  // «vazio» toda vez — matematicamente certo e pedagogicamente enganoso.
  const metadeCerca = rng.inteiro(3, nivel === 'facil' ? 4 : 6) * 5;
  const cerca = 2 * metadeCerca;
  // A largura menor fica ABAIXO do ponto ótimo (metadeCerca/2) para que a maior
  // fique acima dele — as duas dão a mesma área, e é isso que cria as raízes.
  const larguraMenor = rng.inteiro(1, Math.max(1, Math.floor(metadeCerca / 10) - 1)) * 5;
  const larguraMaior = metadeCerca - larguraMenor;
  const alvo = 2 * larguraMenor * larguraMaior;

  const expressao: ExpressaoDaHistoria = { tipo: 'trinomio', a: -2, b: cerca, c: -alvo };
  const relacao: Relacao = '>';

  const frases: Frases<[number, number]> = {
    pt: (c, a) =>
      `Um terreno retangular é cercado em três lados com ${c} m de cerca (o quarto lado é um ` +
      `muro). Chamando de x a largura, a área MENOS ${a} m² é o trinômio abaixo. Escreva o ` +
      'conjunto de larguras em que ele é positivo, isto é, a área passa do alvo.',
    fr: (c, a) =>
      `Un terrain rectangulaire est clôturé sur trois côtés avec ${c} m de clôture (le quatrième ` +
      `est un mur). En appelant x la largeur, l’aire MOINS ${a} m² est le trinôme ci-dessous. ` +
      'Écrivez l’ensemble des largeurs pour lesquelles il est positif.',
    en: (c, a) =>
      `A rectangular plot is fenced on three sides with ${c} m of fence (the fourth is a wall). ` +
      `Calling x the width, the area MINUS ${a} m² is the trinomial below. Write the set of ` +
      'widths for which it is positive.',
  };

  return {
    cenario: 'area',
    expressao,
    relacao,
    conceito: 'sinal.trinomio',
    tex: `${texDoTrinomio(expressao)} ${SIMBOLO_RELACAO[relacao]} 0`,
    texto: enunciadoTrilingue(frases, [cerca, alvo], {
      pt: () =>
        'A área cresce até a largura ótima e depois cai: por isso as duas raízes, e a resposta ' +
        'ENTRE elas. Uma largura pequena demais e uma grande demais dão a mesma área.',
      fr: () =>
        'L’aire croît jusqu’à la largeur optimale puis décroît : d’où deux racines et une ' +
        'réponse ENTRE elles.',
      en: () =>
        'The area grows up to the best width and then falls: hence two roots and an answer ' +
        'BETWEEN them.',
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Produto e quociente: o sinal troca nas raízes.
// ─────────────────────────────────────────────────────────────────────────────

export function produtoNegativo(rng: Rng, nivel: Nivel): HistoriaSinal {
  const r1 = rng.inteiro(-6, 0);
  const r2 = r1 + rng.inteiro(2, nivel === 'facil' ? 4 : 8);
  const expressao: ExpressaoDaHistoria = { tipo: 'produto', p: 1, q: -r1, r: 1, s: -r2 };
  const relacao: Relacao = '<';

  const frases: Frases<[number, number]> = {
    pt: (a, b) =>
      `Uma grandeza é dada por ${fator(a)}${fator(b)}, e seu valor precisa ser NEGATIVO. ` +
      'Escreva o conjunto de valores de x que satisfazem a condição.',
    fr: (a, b) =>
      `Une grandeur vaut ${fator(a)}${fator(b)} et doit être NÉGATIVE. Écrivez l’ensemble des ` +
      'valeurs de x qui satisfont la condition.',
    en: (a, b) =>
      `A quantity equals ${fator(a)}${fator(b)} and must be NEGATIVE. Write the set of x values ` +
      'that satisfy the condition.',
  };

  return {
    cenario: 'produto',
    expressao,
    relacao,
    conceito: 'sinal.produto',
    tex: texDoProduto(expressao, relacao),
    texto: enunciadoTrilingue(frases, [r1, r2], {
      pt: () =>
        'Um produto é negativo quando os fatores têm sinais contrários — isso acontece entre as raízes.',
      fr: () =>
        'Un produit est négatif quand les facteurs ont des signes contraires — cela arrive entre les racines.',
      en: () =>
        'A product is negative when the factors have opposite signs — that happens between the roots.',
    }),
  };
}

export function fracaoPositiva(rng: Rng, nivel: Nivel): HistoriaSinal {
  const zeroCima = rng.inteiro(-6, 4);
  const zeroBaixo = zeroCima + rng.inteiro(2, nivel === 'facil' ? 4 : 8);
  const expressao: ExpressaoDaHistoria = {
    tipo: 'quociente',
    p: 1,
    q: -zeroCima,
    r: 1,
    s: -zeroBaixo,
  };
  const relacao: Relacao = '>=';

  const frases: Frases<[number, number]> = {
    pt: (c, b) =>
      `Uma razão é dada por ${fator(c)} dividido por ${fator(b)}, e o resultado precisa ser ` +
      'POSITIVO ou nulo. Escreva o conjunto de valores de x, lembrando que o denominador não ' +
      'pode se anular.',
    fr: (c, b) =>
      `Un rapport vaut ${fator(c)} divisé par ${fator(b)}, et le résultat doit être POSITIF ou ` +
      'nul. Écrivez l’ensemble des valeurs de x, en rappelant que le dénominateur ne peut pas ' +
      's’annuler.',
    en: (c, b) =>
      `A ratio equals ${fator(c)} divided by ${fator(b)}, and the result must be POSITIVE or ` +
      'zero. Write the set of x values, remembering the denominator cannot vanish.',
  };

  return {
    cenario: 'fracao',
    expressao,
    relacao,
    conceito: 'sinal.quociente',
    tex: texDoQuociente(expressao, relacao),
    texto: enunciadoTrilingue(frases, [zeroCima, zeroBaixo], {
      pt: () =>
        `O zero de cima (x = ${zeroCima}) ENTRA, porque a relação tem «ou igual». O de baixo ` +
        `(x = ${zeroBaixo}) NUNCA entra: ali a fração não existe.`,
      fr: () =>
        `Le zéro du haut (x = ${zeroCima}) ENTRE, car la relation comporte « ou égal ». Celui du ` +
        `bas (x = ${zeroBaixo}) n’entre JAMAIS : là, la fraction n’existe pas.`,
      en: () =>
        `The top zero (x = ${zeroCima}) IS included, because the relation has “or equal”. The ` +
        `bottom one (x = ${zeroBaixo}) is NEVER included: the fraction does not exist there.`,
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Delta: nenhuma raiz, ou uma só.
// ─────────────────────────────────────────────────────────────────────────────

export function semprePositivo(rng: Rng, nivel: Nivel): HistoriaSinal {
  const deslocamento = rng.inteiro(-4, 4);
  const sobra = rng.inteiro(1, nivel === 'facil' ? 4 : 9);
  // (x − h)² + sobra > 0 → Δ < 0, sempre positivo.
  const a = 1;
  const b = -2 * deslocamento;
  const c = deslocamento * deslocamento + sobra;
  const trinomio: ExpressaoDaHistoria = { tipo: 'trinomio', a, b, c };

  const frases: Frases<[]> = {
    pt: () =>
      'Em uma loja, o saldo do dia é dado pelo trinômio abaixo, em reais, com x o número de ' +
      'clientes atendidos. Escreva o conjunto de valores de x em que o saldo é POSITIVO.',
    fr: () =>
      'Dans un magasin, le solde du jour est donné par le trinôme ci-dessous, en dollars, avec x ' +
      'le nombre de clients servis. Écrivez l’ensemble des valeurs de x pour lesquelles le ' +
      'solde est POSITIF.',
    en: () =>
      'In a shop, the day’s balance is given by the trinomial below, in dollars, with x the ' +
      'number of customers served. Write the set of x values for which the balance is POSITIVE.',
  };

  return {
    cenario: 'sempre',
    expressao: trinomio,
    relacao: '>',
    conceito: 'sinal.delta',
    tex: `${Polinomio.de(c, b, a).paraTex()} > 0`,
    texto: enunciadoTrilingue(frases as Frases<[]>, [], {
      pt: () =>
        'Calcule Δ. Se ele for negativo, o trinômio tem SEMPRE o sinal de a — e a resposta é «todos» ou «vazio».',
      fr: () =>
        'Calculez Δ. S’il est négatif, le trinôme a TOUJOURS le signe de a — et la réponse est « tous » ou « vide ».',
      en: () =>
        'Compute Δ. If it is negative, the trinomial ALWAYS has the sign of a — and the answer is “all” or “empty”.',
    }),
  };
}

export function semSolucao(rng: Rng, nivel: Nivel): HistoriaSinal {
  const deslocamento = rng.inteiro(-4, 4);
  const sobra = rng.inteiro(1, nivel === 'facil' ? 4 : 9);
  const a = 1;
  const b = -2 * deslocamento;
  const c = deslocamento * deslocamento + sobra;

  const frases: Frases<[]> = {
    pt: () =>
      'O lucro de uma campanha, em reais, é o trinômio abaixo, com x o número de dias. Escreva ' +
      'o conjunto de dias em que o lucro é NEGATIVO.',
    fr: () =>
      'Le bénéfice d’une campagne, en dollars, est le trinôme ci-dessous, avec x le nombre de ' +
      'jours. Écrivez l’ensemble des jours où le bénéfice est NÉGATIF.',
    en: () =>
      'A campaign’s profit, in dollars, is the trinomial below, with x the number of days. ' +
      'Write the set of days when the profit is NEGATIVE.',
  };

  return {
    cenario: 'impossivel',
    expressao: { tipo: 'trinomio', a, b, c },
    relacao: '<',
    conceito: 'sinal.delta',
    tex: `${Polinomio.de(c, b, a).paraTex()} < 0`,
    texto: enunciadoTrilingue(frases as Frases<[]>, [], {
      pt: () =>
        'Com Δ negativo e a positivo, o trinômio nunca fica negativo: o conjunto é VAZIO. «Vazio» é uma resposta, não um erro.',
      fr: () =>
        'Avec Δ négatif et a positif, le trinôme n’est jamais négatif : l’ensemble est VIDE. « Vide » est une réponse, pas une erreur.',
      en: () =>
        'With negative Δ and positive a, the trinomial is never negative: the set is EMPTY. “Empty” is an answer, not a mistake.',
    }),
  };
}

export function raizDupla(rng: Rng, nivel: Nivel): HistoriaSinal {
  const raiz = rng.inteiro(-5, 5);
  const a = 1;
  const b = -2 * raiz;
  const c = raiz * raiz;

  const frases: Frases<[number]> = {
    pt: (r) =>
      `O desvio de uma peça em torno de ${r} mm, ao quadrado, é o trinômio abaixo. Escreva o ` +
      'conjunto de medidas em que o desvio é MAIOR que zero.',
    fr: (r) =>
      `L’écart d’une pièce autour de ${r} mm, au carré, est le trinôme ci-dessous. Écrivez ` +
      'l’ensemble des mesures pour lesquelles l’écart est SUPÉRIEUR à zéro.',
    en: (r) =>
      `A part’s deviation about ${r} mm, squared, is the trinomial below. Write the set of ` +
      'measurements for which the deviation is GREATER than zero.',
  };

  return {
    cenario: 'raiz-dupla',
    expressao: { tipo: 'trinomio', a, b, c },
    relacao: '>',
    conceito: 'sinal.delta',
    tex: `${Polinomio.de(c, b, a).paraTex()} > 0`,
    texto: enunciadoTrilingue(frases, [raiz], {
      pt: () =>
        'Δ = 0: o trinômio zera num ponto só e é positivo em todo o resto. Esse ponto fica de fora.',
      fr: () =>
        'Δ = 0 : le trinôme s’annule en un seul point et est positif partout ailleurs. Ce point est exclu.',
      en: () =>
        'Δ = 0: the trinomial is zero at one single point and positive everywhere else. That point is excluded.',
    }),
  };
}

type Construtor = (rng: Rng, nivel: Nivel) => HistoriaSinal;

/**
 * As situações de cada nível.
 *
 * O Fácil trabalha o produto e o trinômio com raízes inteiras — a decisão
 * entre/fora com números legíveis. O Médio traz o Δ = 0 e o lucro. O Difícil
 * acrescenta a fração e o Δ < 0, onde a resposta pode ser «todos» ou «vazio»;
 * o Extremo repete essas, que são as que exigem interpretar, não aplicar.
 */
const CATALOGO: Readonly<Record<Nivel, readonly Construtor[]>> = {
  facil: [produtoNegativo, lucroPositivo, custoAbaixoDe, projetilAcimaDe],
  medio: [
    produtoNegativo,
    lucroPositivo,
    custoAbaixoDe,
    projetilAcimaDe,
    areaDesejada,
    raizDupla,
    semprePositivo,
  ],
  /*
   * A fração fica só no Extremo, como no caminho simbólico.
   *
   * O zero do denominador é a lição mais difícil do tópico — a única que
   * separa quem aplicou a regra de quem decorou «≥ fecha a bolinha». Deixá-la
   * no Difícil anteciparia o degrau e tiraria do Extremo a sua razão de ser.
   */
  dificil: [lucroPositivo, areaDesejada, semprePositivo, semSolucao, raizDupla, custoAbaixoDe],
  extremo: [fracaoPositiva, semprePositivo, semSolucao, raizDupla, areaDesejada, lucroPositivo],
};

/** Sorteia uma situação do nível. */
export function historiaSinalPara(nivel: Nivel, rng: Rng): HistoriaSinal {
  return rng.escolher(CATALOGO[nivel])(rng, nivel);
}
