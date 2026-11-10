import { Rng } from '@core/treino/rng/rng';
import { Nivel } from '@core/treino/models/treino.model';
import { EnunciadoTrilingue, enunciadoTrilingue } from '@core/treino/textos/texto-trilingue';

/**
 * Situações cujo modelo é uma parábola.
 *
 * A função quadrática é o primeiro lugar em que a matemática responde «qual é
 * o melhor»: o preço que dá mais lucro, a altura máxima do projétil, o lado que
 * aproveita melhor a cerca. Perguntar «qual é a abscissa do vértice» ensina a
 * fórmula; perguntar «que preço dá o maior lucro» ensina por que ela existe.
 *
 * O enunciado não traz f(x): montá-la a partir do texto é a parte do exercício
 * que sobrevive fora da escola. Ela aparece na resolução, com os números da
 * história.
 */
export type Pergunta = 'vertice-x' | 'vertice-y' | 'valor';

export interface Historia {
  /** Coeficiente de x²: negativo quando a parábola abre para baixo (máximo). */
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly pergunta: Pergunta;
  /** O instante ou preço, quando a pergunta é sobre um ponto. */
  readonly x?: number;
  /**
   * O que a variável x significa, para as frases do enunciado.
   *
   * Sem isto, a resolução diria «o vértice é o máximo» num problema em que o
   * aluno precisa escrever «o lucro máximo acontece com 7 reais».
   */
  readonly grandeza: 'tempo' | 'preco' | 'unidades' | 'lado';
  readonly texto: EnunciadoTrilingue;
}

/** Projétil: altura h(t) = −5t² + v₀t + h₀. */
export function projetil(rng: Rng, nivel: Nivel, pergunta: Pergunta): Historia {
  // v₀ par garante vértice inteiro; h₀ pequeno mantém a altura plausível.
  const v0 = rng.inteiro(2, nivel === 'facil' ? 6 : 12) * 10;
  const h0 = rng.inteiro(0, nivel === 'facil' ? 3 : 8) * 5;
  const t = rng.inteiro(1, Math.floor(v0 / 10));

  const frases = {
    pt: (v: number, h: number, instante: number) =>
      `Uma bola é lançada para cima e sua altura, em metros, segue h(t) = −5t² + ${v}t + ${h}, ` +
      'com t em segundos. ' +
      (pergunta === 'vertice-x'
        ? 'Depois de quantos segundos ela atinge a altura máxima?'
        : pergunta === 'vertice-y'
          ? 'Qual é a altura máxima atingida, em metros?'
          : `Qual é a altura da bola ${instante} segundo(s) após o lançamento?`),
    fr: (v: number, h: number, instante: number) =>
      `Une balle est lancée vers le haut et sa hauteur, en mètres, suit h(t) = −5t² + ${v}t + ${h}, ` +
      'avec t en secondes. ' +
      (pergunta === 'vertice-x'
        ? 'Après combien de secondes atteint-elle la hauteur maximale ?'
        : pergunta === 'vertice-y'
          ? 'Quelle est la hauteur maximale atteinte, en mètres ?'
          : `Quelle est la hauteur de la balle ${instante} seconde(s) après le lancer ?`),
    en: (v: number, h: number, instante: number) =>
      `A ball is thrown upwards and its height in metres follows h(t) = −5t² + ${v}t + ${h}, ` +
      'with t in seconds. ' +
      (pergunta === 'vertice-x'
        ? 'After how many seconds does it reach its maximum height?'
        : pergunta === 'vertice-y'
          ? 'What is the maximum height reached, in metres?'
          : `What is the ball’s height ${instante} second(s) after the throw?`),
  };

  // a = −5 (a gravidade já está embutida na fórmula dada).
  return {
    a: -5,
    b: v0,
    c: h0,
    pergunta,
    x: t,
    grandeza: 'tempo',
    texto: enunciadoTrilingue(frases, [v0, h0, t], {
      pt: () =>
        'A fórmula já está dada: −5t² é o termo quadrático, o número que multiplica t é a velocidade inicial.',
      fr: () =>
        'La formule est donnée : −5t² est le terme quadratique, le nombre qui multiplie t est la vitesse initiale.',
      en: () =>
        'The formula is given: −5t² is the quadratic term, and the number multiplying t is the initial speed.',
    }),
  };
}

/**
 * Lucro em função do preço, escrito na forma FATORADA.
 *
 * L(p) = k(p − p₁)(p₂ − p) é como um problema de precificação realmente se
 * parece: p₁ é o preço de custo (lucro zero) e p₂ é o preço em que a demanda
 * zera (lucro zero de novo). Entre os dois a parábola abre para baixo, e o
 * máximo fica exatamente no meio. Mostrar a forma fatorada dá ao aluno os dois
 * pontos que ele reconhece — e o vértice deixa de ser um número mágico.
 */
export function lucro(rng: Rng, nivel: Nivel, pergunta: Pergunta): Historia {
  const k = rng.inteiro(2, nivel === 'facil' ? 3 : 5);
  const custo = rng.inteiro(2, 6) * 5;
  const precoTeto = custo + rng.inteiro(2, nivel === 'facil' ? 4 : 8) * 10;
  const preco = (custo + precoTeto) / 2 + rng.inteiro(-2, 2) * 5;

  const frases = {
    pt: (fator: number, piso: number, teto: number, precoDado: number) =>
      `O lucro de um produto, em reais, é L(p) = ${fator}(p − ${piso})(${teto} − p), em que p é ` +
      `o preço de venda em reais. ` +
      (pergunta === 'vertice-x'
        ? 'Que preço de venda dá o lucro máximo?'
        : pergunta === 'vertice-y'
          ? 'Qual é o lucro máximo, em reais?'
          : `Qual é o lucro com o preço de venda a R$ ${precoDado}?`),
    fr: (fator: number, piso: number, teto: number, precoDado: number) =>
      `Le bénéfice d’un produit, en dollars, est B(p) = ${fator}(p − ${piso})(${teto} − p), où p ` +
      `est le prix de vente en dollars. ` +
      (pergunta === 'vertice-x'
        ? 'Quel prix de vente donne le bénéfice maximal ?'
        : pergunta === 'vertice-y'
          ? 'Quel est le bénéfice maximal, en dollars ?'
          : `Quel est le bénéfice avec un prix de vente de ${precoDado} $ ?`),
    en: (fator: number, piso: number, teto: number, precoDado: number) =>
      `A product’s profit, in dollars, is P(p) = ${fator}(p − ${piso})(${teto} − p), where p is ` +
      `the selling price in dollars. ` +
      (pergunta === 'vertice-x'
        ? 'Which selling price gives the maximum profit?'
        : pergunta === 'vertice-y'
          ? 'What is the maximum profit, in dollars?'
          : `What is the profit when the price is $${precoDado}?`),
  };

  // Expandida: L(p) = −k p² + k(piso + teto) p − k·piso·teto.
  return {
    a: -k,
    b: k * (custo + precoTeto),
    c: -k * custo * precoTeto,
    pergunta,
    x: preco,
    grandeza: 'preco',
    texto: enunciadoTrilingue(frases, [k, custo, precoTeto, preco], {
      pt: () =>
        'A forma fatorada mostra os dois preços de lucro zero: o de custo e o que zera a demanda. ' +
        'O máximo fica a meio caminho.',
      fr: () =>
        'La forme factorisée montre les deux prix de bénéfice nul : le prix coûtant et celui qui ' +
        'annule la demande. Le maximum est à mi-chemin.',
      en: () =>
        'The factored form shows the two break-even prices: the cost price and the one that kills ' +
        'demand. The maximum sits halfway between them.',
    }),
  };
}

/** O termo constante em LaTeX, com o sinal que ele já carrega. */
function sinal(termo: number): string {
  return termo >= 0 ? `+ ${termo}` : `- ${Math.abs(termo)}`;
}

/** Cerca aproveitando um muro: área A(x) = x(L − 2x). */
export function cerca(rng: Rng, nivel: Nivel, pergunta: Pergunta): Historia {
  // Múltiplo de 20: o vértice cai em L/4 e a área máxima em L²/8, ambas inteiras.
  const comprimento = rng.inteiro(1, nivel === 'facil' ? 4 : 8) * 20;
  const x = rng.inteiro(1, Math.floor(comprimento / 4) - 1);

  const frases = {
    pt: (total: number, lado: number) =>
      `Um terreno retangular é cercado em três lados, porque o quarto lado é um muro já ` +
      `existente. Há ${total} m de cerca. ` +
      (pergunta === 'vertice-x'
        ? 'Qual deve ser a largura para que a área cercada seja máxima?'
        : pergunta === 'vertice-y'
          ? 'Qual é a área máxima possível, em m²?'
          : `Qual é a área cercada se a largura for ${lado} m?`),
    fr: (total: number, lado: number) =>
      `Un terrain rectangulaire est clôturé sur trois côtés, le quatrième étant un mur déjà ` +
      `existant. On dispose de ${total} m de clôture. ` +
      (pergunta === 'vertice-x'
        ? 'Quelle largeur donne l’aire clôturée maximale ?'
        : pergunta === 'vertice-y'
          ? 'Quelle est l’aire maximale possible, en m² ?'
          : `Quelle est l’aire clôturée si la largeur est ${lado} m ?`),
    en: (total: number, lado: number) =>
      `A rectangular plot is fenced on three sides, the fourth being an existing wall. There are ` +
      `${total} m of fence. ` +
      (pergunta === 'vertice-x'
        ? 'Which width gives the largest fenced area?'
        : pergunta === 'vertice-y'
          ? 'What is the largest possible area, in m²?'
          : `What is the fenced area if the width is ${lado} m?`),
  };

  // A(x) = x·(L − 2x) = −2x² + L·x
  return {
    a: -2,
    b: comprimento,
    c: 0,
    pergunta,
    x,
    grandeza: 'lado',
    texto: enunciadoTrilingue(frases, [comprimento, x], {
      pt: () => 'Se a largura é x, sobram L − 2x metros para o comprimento: a área é x vezes isso.',
      fr: () =>
        'Si la largeur est x, il reste L − 2x mètres pour la longueur : l’aire est x fois cela.',
      en: () => 'If the width is x, L − 2x metres remain for the length: the area is x times that.',
    }),
  };
}

/**
 * Custo de produção com mínimo: C(q) = a(q − q₀)² + Cmin.
 *
 * Escrito assim, o vértice (q₀, Cmin) é conhecido antes de a conta começar, e
 * o enunciado mostra a forma expandida — que é a que o aluno tem de trabalhar.
 * O mínimo NUNCA é negativo: um custo negativo não é um exercício difícil, é
 * um enunciado errado.
 */
export function custo(rng: Rng, nivel: Nivel, pergunta: Pergunta): Historia {
  const a = rng.inteiro(1, nivel === 'facil' ? 2 : 4);
  const quantidadeOtima = rng.inteiro(4, 12);
  const custoMinimo = rng.inteiro(2, 8) * 10;
  const q = quantidadeOtima + rng.inteiro(-3, 3);

  // Expandida: a q² − 2a q₀ q + (a q₀² + Cmin).
  const b = -2 * a * quantidadeOtima;
  const c = a * quantidadeOtima ** 2 + custoMinimo;

  const frases = {
    pt: (coef: number, termoB: number, termoC: number, quantidade: number) =>
      `O custo de produção de uma peça, em reais, é C(q) = ${coef}q² − ${termoB}q + ${termoC}, ` +
      'com q em milhares de peças. ' +
      (pergunta === 'vertice-x'
        ? 'Que quantidade produzida dá o menor custo?'
        : pergunta === 'vertice-y'
          ? 'Qual é o custo mínimo, em reais?'
          : `Qual é o custo para ${quantidade} mil peças?`),
    fr: (coef: number, termoB: number, termoC: number, quantidade: number) =>
      `Le coût de production d’une pièce, en dollars, est C(q) = ${coef}q² − ${termoB}q + ${termoC}, ` +
      'avec q en milliers de pièces. ' +
      (pergunta === 'vertice-x'
        ? 'Quelle quantité produite donne le coût le plus bas ?'
        : pergunta === 'vertice-y'
          ? 'Quel est le coût minimal, en dollars ?'
          : `Quel est le coût pour ${quantidade} mille pièces ?`),
    en: (coef: number, termoB: number, termoC: number, quantidade: number) =>
      `The production cost of a part, in dollars, is C(q) = ${coef}q² − ${termoB}q + ${termoC}, ` +
      'with q in thousands of parts. ' +
      (pergunta === 'vertice-x'
        ? 'Which production quantity gives the lowest cost?'
        : pergunta === 'vertice-y'
          ? 'What is the minimum cost, in dollars?'
          : `What is the cost for ${quantidade} thousand parts?`),
  };

  return {
    a,
    b,
    c,
    pergunta,
    x: q,
    grandeza: 'unidades',
    texto: enunciadoTrilingue(frases, [a, -b, c, q], {
      pt: () =>
        'O coeficiente de q² é positivo: a parábola abre para cima, então o vértice é um MÍNIMO.',
      fr: () =>
        'Le coefficient de q² est positif : la parabole s’ouvre vers le haut, le sommet est donc un MINIMUM.',
      en: () =>
        'The q² coefficient is positive: the parabola opens upwards, so the vertex is a MINIMUM.',
    }),
  };
}

type Construtor = (rng: Rng, nivel: Nivel, pergunta: Pergunta) => Historia;

/**
 * As histórias de cada nível.
 *
 * O Fácil pergunta um ponto (substituir); do Médio em diante a pergunta é o
 * vértice, que é o motivo de a parábola aparecer em problemas de otimização.
 * O projétil entra primeiro porque é o exemplo em que a fórmula já vem pronta
 * e a parábola é reconhecível no ar.
 */
const CATALOGO: Readonly<Record<Nivel, readonly (readonly [Construtor, readonly Pergunta[]])[]>> = {
  facil: [
    [projetil, ['valor', 'vertice-x']],
    [cerca, ['valor', 'vertice-x']],
    [custo, ['valor', 'vertice-x']],
  ],
  medio: [
    [projetil, ['vertice-x', 'vertice-y', 'valor']],
    [lucro, ['vertice-x', 'vertice-y', 'valor']],
    [cerca, ['vertice-x', 'vertice-y']],
    [custo, ['vertice-x', 'vertice-y', 'valor']],
  ],
  dificil: [
    [lucro, ['vertice-x', 'vertice-y']],
    [cerca, ['vertice-x', 'vertice-y']],
    [custo, ['vertice-x', 'vertice-y']],
    [projetil, ['vertice-y']],
  ],
  extremo: [
    [lucro, ['vertice-y']],
    [custo, ['vertice-y']],
    [cerca, ['vertice-y']],
    [projetil, ['vertice-y']],
  ],
};

/** Sorteia uma história do nível, com a pergunta que ela sabe fazer. */
export function historiaPara(nivel: Nivel, rng: Rng): Historia {
  const [construtor, perguntas] = rng.escolher(CATALOGO[nivel]);
  return construtor(rng, nivel, rng.escolher(perguntas));
}
