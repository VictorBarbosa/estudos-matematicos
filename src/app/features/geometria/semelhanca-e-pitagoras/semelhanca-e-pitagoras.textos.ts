import { Frases } from '@core/treino/textos/texto-trilingue';

/**
 * Os enunciados e as dicas deste tópico, nas três línguas.
 *
 * Ficam fora do gerador por dois motivos. O primeiro é tamanho: nove formas de
 * pergunta vezes três línguas enterrariam a matemática no meio do texto. O
 * segundo é que **aqui o texto é o exercício**. «Quanto mede a projeção do
 * cateto sobre a hipotenusa?» é a pergunta certa e estava incompreensível para
 * quem está aprendendo: o nome supõe a figura que o aluno ainda não sabe
 * desenhar. Reescrevê-las juntas, lado a lado, é o que deixa ver se o tópico
 * fala a mesma língua em todas as perguntas.
 *
 * **A regra que elas seguem:** o enunciado mostra a figura antes de dar nome a
 * ela, e o nome continua na pergunta. Tirar o termo técnico pouparia o aluno
 * hoje e o abandonaria na prova; apresentá-lo ensina as duas coisas de uma vez.
 *
 * O vocabulário acompanha o que o tópico já escolheu na aba Explorar
 * (`semelhanca-e-pitagoras.i18n.json`): «côté de l'angle droit» para cateto,
 * «hauteur» para a altura, «projection» para a projeção.
 */

export const HIPOTENUSA: Frases<[number, number]> = {
  pt: (b, c) =>
    `Um triângulo retângulo tem catetos ${b} cm e ${c} cm. Quanto mede a hipotenusa, em cm?`,
  fr: (b, c) =>
    `Un triangle rectangle a des côtés de l’angle droit de ${b} cm et ${c} cm. Combien mesure ` +
    'l’hypoténuse, en cm ?',
  en: (b, c) =>
    `A right triangle has legs of ${b} cm and ${c} cm. How long is the hypotenuse, in cm?`,
};

export const DICA_HIPOTENUSA: Frases<[number, number]> = {
  pt: (b, c) =>
    `A hipotenusa ao quadrado é a soma dos catetos ao quadrado: ${b}² + ${c}² = ${b * b} + ${c * c}. ` +
    'Depois tire a raiz.',
  fr: (b, c) =>
    `L’hypoténuse au carré est la somme des carrés des côtés de l’angle droit : ${b}² + ${c}² = ` +
    `${b * b} + ${c * c}. Ensuite, prenez la racine.`,
  en: (b, c) =>
    `The hypotenuse squared is the sum of the squares of the legs: ${b}² + ${c}² = ${b * b} + ` +
    `${c * c}. Then take the square root.`,
};

export const CATETO: Frases<[number, number]> = {
  pt: (a, conhecido) =>
    `Um triângulo retângulo tem hipotenusa ${a} cm e um cateto ${conhecido} cm. Quanto mede o ` +
    'outro cateto, em cm?',
  fr: (a, conhecido) =>
    `Un triangle rectangle a une hypoténuse de ${a} cm et un côté de l’angle droit de ` +
    `${conhecido} cm. Combien mesure l’autre côté de l’angle droit, en cm ?`,
  en: (a, conhecido) =>
    `A right triangle has a hypotenuse of ${a} cm and one leg of ${conhecido} cm. How long is ` +
    'the other leg, in cm?',
};

export const DICA_CATETO: Frases<[number, number]> = {
  pt: (a, conhecido) =>
    `O cateto ao quadrado é a hipotenusa ao quadrado menos o outro cateto ao quadrado: ${a}² − ` +
    `${conhecido}². Depois tire a raiz.`,
  fr: (a, conhecido) =>
    `Le carré du côté cherché est le carré de l’hypoténuse moins le carré de l’autre côté : ` +
    `${a}² − ${conhecido}². Ensuite, prenez la racine.`,
  en: (a, conhecido) =>
    `The leg squared is the hypotenuse squared minus the other leg squared: ${a}² − ` +
    `${conhecido}². Then take the square root.`,
};

/**
 * Tales, com a cena montada peça por peça.
 *
 * «Um feixe de paralelas corta duas transversais» descreve a figura para quem
 * já a conhece. Para quem está aprendendo não há figura nenhuma: as palavras
 * não dizem quantas retas são, onde ficam os pedaços, nem o que
 * «correspondente» significa. Dizer «entre a 1ª e a 2ª paralela» resolve isso
 * sem perder nada — e é o que torna a proporção óbvia.
 */
export const TALES: Frases<[number, number, number]> = {
  pt: (a, b, c) =>
    'Três retas paralelas são cortadas por duas outras retas, chamadas transversais. Numa das ' +
    `transversais, o pedaço entre a 1ª e a 2ª paralela mede ${a} cm, e o pedaço entre a 2ª e a ` +
    `3ª mede ${b} cm. Na outra transversal, o pedaço entre a 1ª e a 2ª paralela mede ${c} cm. ` +
    'Quanto mede, nessa outra transversal, o pedaço entre a 2ª e a 3ª paralela, em cm?',
  fr: (a, b, c) =>
    'Trois droites parallèles sont coupées par deux autres droites, appelées sécantes. Sur une ' +
    `des sécantes, le segment entre la 1ʳᵉ et la 2ᵉ parallèle mesure ${a} cm, et celui entre la ` +
    `2ᵉ et la 3ᵉ mesure ${b} cm. Sur l’autre sécante, le segment entre la 1ʳᵉ et la 2ᵉ ` +
    `parallèle mesure ${c} cm. Combien mesure, sur cette autre sécante, le segment entre la 2ᵉ ` +
    'et la 3ᵉ parallèle, en cm ?',
  en: (a, b, c) =>
    'Three parallel lines are cut by two other lines, called transversals. On one transversal, ' +
    `the piece between the 1st and 2nd parallel is ${a} cm, and the piece between the 2nd and ` +
    `3rd is ${b} cm. On the other transversal, the piece between the 1st and 2nd parallel is ` +
    `${c} cm. On that other transversal, how long is the piece between the 2nd and 3rd ` +
    'parallel, in cm?',
};

export const DICA_TALES: Frases<[number, number, number]> = {
  pt: (a, b, c) =>
    `Os pedaços guardam a mesma razão nas duas transversais: ${a} está para ${b} como ${c} ` +
    'está para o pedaço que falta. Multiplique cruzado.',
  fr: (a, b, c) =>
    `Les segments gardent le même rapport sur les deux sécantes : ${a} est à ${b} comme ${c} ` +
    'est au segment cherché. Faites le produit en croix.',
  en: (a, b, c) =>
    `The pieces keep the same ratio on both transversals: ${a} is to ${b} as ${c} is to the ` +
    'missing piece. Cross-multiply.',
};

export const ESCALA_AREA: Frases<[number, string]> = {
  pt: (original, k) =>
    `Uma figura tem área de ${original} cm². Ampliando todos os comprimentos por ${k}, qual é a ` +
    'nova área, em cm²?',
  fr: (original, k) =>
    `Une figure a une aire de ${original} cm². En multipliant toutes les longueurs par ${k}, ` +
    'quelle est la nouvelle aire, en cm² ?',
  en: (original, k) =>
    `A figure has an area of ${original} cm². Scaling every length by ${k}, what is the new ` +
    'area, in cm²?',
};

export const ESCALA_VOLUME: Frases<[number, string]> = {
  pt: (original, k) =>
    `Um sólido tem volume de ${original} cm³. Ampliando todos os comprimentos por ${k}, qual é ` +
    'o novo volume, em cm³?',
  fr: (original, k) =>
    `Un solide a un volume de ${original} cm³. En multipliant toutes les longueurs par ${k}, ` +
    'quel est le nouveau volume, en cm³ ?',
  en: (original, k) =>
    `A solid has a volume of ${original} cm³. Scaling every length by ${k}, what is the new ` +
    'volume, in cm³?',
};

/*
 * As dicas repetem a assinatura do enunciado a que pertencem, mesmo quando não
 * usam todos os números: é o que permite entregá-las a `enunciadoTrilingue` na
 * mesma chamada, sem uma segunda montagem só para elas.
 */
export const DICA_ESCALA_AREA: Frases<[number, string]> = {
  pt: (_original, k) => `A área escala com k², não com k. Aqui k = ${k}, então o fator é ${k}².`,
  fr: (_original, k) => `L’aire varie en k², pas en k. Ici k = ${k}, donc le facteur est ${k}².`,
  en: (_original, k) => `Area scales with k², not with k. Here k = ${k}, so the factor is ${k}².`,
};

export const DICA_ESCALA_VOLUME: Frases<[number, string]> = {
  pt: (_original, k) => `O volume escala com k³, não com k. Aqui k = ${k}, então o fator é ${k}³.`,
  fr: (_original, k) => `Le volume varie en k³, pas en k. Ici k = ${k}, donc le facteur est ${k}³.`,
  en: (_original, k) => `Volume scales with k³, not with k. Here k = ${k}, so the factor is ${k}³.`,
};

/**
 * O quadrado do maior lado, dizendo para que ele serve.
 *
 * O enunciado antigo terminava com «(o enunciado seguinte compara com a soma
 * dos outros dois)» — e não existe enunciado seguinte: o aluno vê uma pergunta
 * por vez. Era instrução de autor vazada para a tela.
 */
export const MAIOR_LADO: Frases<[number, number, number]> = {
  pt: (b, c, maior) =>
    `Um triângulo tem lados ${b} cm, ${c} cm e ${maior} cm. Para descobrir se ele é retângulo, ` +
    'compara-se o quadrado do maior lado com a soma dos quadrados dos outros dois. Quanto vale ' +
    'o quadrado do maior lado?',
  fr: (b, c, maior) =>
    `Un triangle a des côtés de ${b} cm, ${c} cm et ${maior} cm. Pour savoir s’il est ` +
    'rectangle, on compare le carré du plus grand côté à la somme des carrés des deux autres. ' +
    'Combien vaut le carré du plus grand côté ?',
  en: (b, c, maior) =>
    `A triangle has sides of ${b} cm, ${c} cm and ${maior} cm. To find out whether it is right-` +
    'angled, you compare the square of the longest side with the sum of the squares of the ' +
    'other two. What is the square of the longest side?',
};

export const DICA_MAIOR_LADO: Frases<[number, number, number]> = {
  pt: (_b, _c, maior) => `O maior lado mede ${maior} cm: eleve ao quadrado, ${maior} · ${maior}.`,
  fr: (_b, _c, maior) =>
    `Le plus grand côté mesure ${maior} cm : élevez-le au carré, ${maior} · ${maior}.`,
  en: (_b, _c, maior) => `The longest side is ${maior} cm: square it, ${maior} · ${maior}.`,
};

/**
 * A altura relativa à hipotenusa, desenhada antes de nomeada.
 *
 * O nome sozinho não diz de onde o segmento sai nem onde chega. «Do vértice do
 * ângulo reto, até a hipotenusa, formando 90° com ela» diz, e em palavras que
 * o aluno já tem.
 */
export const ALTURA: Frases<[number, number]> = {
  pt: (b, c) =>
    `Um triângulo retângulo tem catetos ${b} cm e ${c} cm. Do vértice do ângulo reto, traça-se ` +
    'um segmento até a hipotenusa, formando 90° com ela: é a altura relativa à hipotenusa. ' +
    'Quanto esse segmento mede, em cm?',
  fr: (b, c) =>
    `Un triangle rectangle a des côtés de l’angle droit de ${b} cm et ${c} cm. Du sommet de ` +
    'l’angle droit, on trace un segment jusqu’à l’hypoténuse, en formant 90° avec elle : c’est ' +
    'la hauteur relative à l’hypoténuse. Combien ce segment mesure-t-il, en cm ?',
  en: (b, c) =>
    `A right triangle has legs of ${b} cm and ${c} cm. From the right-angle vertex, draw a ` +
    'segment to the hypotenuse meeting it at 90°: that is the altitude to the hypotenuse. How ' +
    'long is that segment, in cm?',
};

/**
 * A projeção, que foi o caso que denunciou o problema.
 *
 * «Quanto mede a projeção do cateto de 63 cm sobre a hipotenusa?» era tudo o
 * que a pergunta dizia. Agora a altura corta a hipotenusa, aparecem dois
 * pedaços, e o pedaço vizinho ao cateto recebe o nome — nessa ordem.
 */
export const PROJECAO: Frases<[number, number]> = {
  pt: (b, c) =>
    `Um triângulo retângulo tem catetos ${b} cm e ${c} cm. Do vértice do ângulo reto, traça-se ` +
    'um segmento até a hipotenusa, formando 90° com ela, e isso parte a hipotenusa em dois ' +
    `pedaços. O pedaço vizinho ao cateto de ${c} cm é a projeção desse cateto sobre a ` +
    'hipotenusa. Quanto ele mede, em cm?',
  fr: (b, c) =>
    `Un triangle rectangle a des côtés de l’angle droit de ${b} cm et ${c} cm. Du sommet de ` +
    'l’angle droit, on trace un segment jusqu’à l’hypoténuse en formant 90° avec elle, ce qui ' +
    `partage l’hypoténuse en deux morceaux. Le morceau voisin du côté de ${c} cm est la ` +
    'projection de ce côté sur l’hypoténuse. Combien mesure-t-il, en cm ?',
  en: (b, c) =>
    `A right triangle has legs of ${b} cm and ${c} cm. From the right-angle vertex, draw a ` +
    'segment to the hypotenuse meeting it at 90°; that splits the hypotenuse into two pieces. ' +
    `The piece next to the ${c} cm leg is the projection of that leg onto the hypotenuse. How ` +
    'long is it, in cm?',
};

/**
 * As dicas das relações métricas, com os números em vez das letras.
 *
 * A dica era `a·h = b·c, e c² = a·m.` — fórmula crua, com quatro letras que
 * ninguém apresentou, para quem já tinha travado no enunciado. O padrão do
 * projeto é dizer o caminho em palavras e com os números do exercício.
 */
export const DICA_ALTURA: Frases<[number, number]> = {
  pt: (b, c) =>
    `Ache a hipotenusa primeiro, por Pitágoras. Depois use que o produto dos catetos, ${b} · ` +
    `${c}, é igual à hipotenusa vezes essa altura.`,
  fr: (b, c) =>
    `Trouvez d’abord l’hypoténuse, par Pythagore. Ensuite, le produit des côtés de l’angle ` +
    `droit, ${b} · ${c}, est égal à l’hypoténuse multipliée par cette hauteur.`,
  en: (b, c) =>
    `Find the hypotenuse first, with Pythagoras. Then use that the product of the legs, ${b} · ` +
    `${c}, equals the hypotenuse times this altitude.`,
};

export const DICA_PROJECAO: Frases<[number, number]> = {
  pt: (b, c) =>
    `Ache a hipotenusa primeiro, por Pitágoras. Depois use que o cateto ao quadrado, ${c}², é ` +
    'igual à hipotenusa vezes a projeção dele.',
  fr: (b, c) =>
    `Trouvez d’abord l’hypoténuse, par Pythagore. Ensuite, le carré du côté, ${c}², est égal à ` +
    'l’hypoténuse multipliée par sa projection.',
  en: (b, c) =>
    `Find the hypotenuse first, with Pythagoras. Then use that the leg squared, ${c}², equals ` +
    'the hypotenuse times its projection.',
};

export const SOMBRA: Frases<[number, number, number]> = {
  pt: (alturaVara, sombraVara, sombraPredio) =>
    `No mesmo instante, uma vara de ${alturaVara} m projeta uma sombra de ${sombraVara} m e um ` +
    `prédio projeta uma sombra de ${sombraPredio} m. Qual é a altura do prédio, em m?`,
  fr: (alturaVara, sombraVara, sombraPredio) =>
    `Au même instant, une perche de ${alturaVara} m projette une ombre de ${sombraVara} m et un ` +
    `immeuble projette une ombre de ${sombraPredio} m. Quelle est la hauteur de l’immeuble, en m ?`,
  en: (alturaVara, sombraVara, sombraPredio) =>
    `At the same moment, a ${alturaVara} m pole casts a ${sombraVara} m shadow and a building ` +
    `casts a ${sombraPredio} m shadow. How tall is the building, in m?`,
};

export const DICA_SOMBRA: Frases<[number, number, number]> = {
  pt: (alturaVara, sombraVara, _sombraPredio) =>
    `O Sol está no mesmo lugar para os dois, então altura e sombra guardam a mesma razão: ` +
    `${alturaVara} para ${sombraVara}.`,
  fr: (alturaVara, sombraVara, _sombraPredio) =>
    'Le Soleil est au même endroit pour les deux, donc hauteur et ombre gardent le même ' +
    `rapport : ${alturaVara} pour ${sombraVara}.`,
  en: (alturaVara, sombraVara, _sombraPredio) =>
    'The Sun is in the same place for both, so height and shadow keep the same ratio: ' +
    `${alturaVara} to ${sombraVara}.`,
};
