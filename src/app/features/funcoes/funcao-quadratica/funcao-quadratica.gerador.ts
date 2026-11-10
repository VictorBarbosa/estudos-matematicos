import { resolverQuadraticaComPassos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import {
  Exercicio,
  GeradorExercicio,
  Nivel,
  SEM_FORMULA,
  nivelAoMenos,
  semColisoes,
} from '@core/treino/models/treino.model';
import {
  Historia,
  historiaPara,
} from '@features/funcoes/funcao-quadratica/funcao-quadratica.contextos';

const { saoEquivalentes: proximos } = numeroComCasas(2, 1e-4);

type Pergunta = 'vertice-x' | 'vertice-y' | 'valor';

/**
 * Exercícios de função quadrática.
 *
 * O foco é o vértice — o elemento que resolve problemas de otimização e que
 * costuma ser confundido com as raízes.
 */
export const geradorQuadratica: GeradorExercicio<number> = {
  topicoId: 'funcao-quadratica',
  formatoResposta: 'um número, ex.: 2,5',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    /*
     * Metade dos exercícios vem de uma situação. «Qual é a abscissa do
     * vértice» treina a fórmula; «que preço dá o maior lucro» treina por que
     * ela existe — e é a segunda pergunta que aparece fora da escola.
     */
    if (rng.booleano(0.5)) {
      return exercicioComHistoria(nivel, rng);
    }

    const pergunta = sortearPergunta(nivel, rng);
    const { a, b, c } = sortear(nivel, rng);

    const resolucao = resolverQuadraticaComPassos(a, b, c);
    const { vertice, raizes } = resolucao.resultado;

    const funcaoTex = montar(a, b, c);

    if (pergunta === 'valor') {
      const x = rng.inteiro(-4, 5);
      const gabarito = a * x * x + b * x + c;

      return {
        id: `quadratica-valor-${a}${b}${c}-${x}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: `Qual é o valor de f(${x})?`,
        enunciadoTex: `f(x) = ${funcaoTex}`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: `Substituímos x por ${x}.`,
              tex: `f(${x}) = ${a}(${x})^{2} ${b >= 0 ? '+' : '-'} ${Math.abs(b)}(${x}) ${c >= 0 ? '+' : '-'} ${Math.abs(c)}`,
            },
            {
              descricao: 'Resolvemos a potência primeiro.',
              tex: `= ${a} \\cdot ${x * x} ${b >= 0 ? '+' : '-'} ${Math.abs(b * x)} ${c >= 0 ? '+' : '-'} ${Math.abs(c)}`,
            },
            { descricao: 'Somamos.', tex: `= ${gabarito}` },
          ],
        },
        conceitos: ['quadratica.parabola'],
        armadilhas: semColisoes(
          [
            {
              resposta: a * 2 * x + b * x + c,
              diagnostico:
                'x² foi tratado como 2x. Elevar ao quadrado é multiplicar x por ele mesmo.',
              passo: 1,
              conceito: 'quadratica.parabola',
            },
          ],
          gabarito,
          proximos,
        ),
        dica:
          nivel === 'facil'
            ? `Troque x por ${x} e resolva a potência primeiro: (${x})² = ${x * x}.`
            : undefined,
      };
    }

    const gabarito = pergunta === 'vertice-x' ? vertice.x : vertice.y;

    return {
      id: `quadratica-${pergunta}-${a}${b}${c}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado:
        pergunta === 'vertice-x'
          ? 'Qual é a abscissa do vértice (o valor de x onde ocorre o máximo ou o mínimo)?'
          : 'Qual é o valor máximo ou mínimo da função, ou seja, a ordenada do vértice?',
      enunciadoTex: `f(x) = ${funcaoTex}`,
      gabarito,
      resolucao: { resultado: gabarito, passos: resolucao.passos },
      conceitos: ['quadratica.parabola', 'quadratica.otimizacao'],
      armadilhas: semColisoes(
        [
          {
            // Confundiu vértice com raiz.
            resposta: raizes.length > 0 ? raizes[0]! : vertice.x + 1,
            diagnostico:
              'Esse é o valor de uma RAIZ, onde a parábola cruza o eixo x. O vértice é o ponto ' +
              'extremo da curva, que fica a meio caminho entre as duas raízes.',
            passo: 3,
            conceito: 'quadratica.parabola',
          },
          {
            // Esqueceu o sinal negativo em -b/2a.
            resposta: pergunta === 'vertice-x' ? b / (2 * a) : resolucao.resultado.delta / (4 * a),
            diagnostico:
              pergunta === 'vertice-x'
                ? 'Faltou o sinal negativo: a fórmula é x_v = −b/(2a).'
                : 'Faltou o sinal negativo: a fórmula é y_v = −Δ/(4a).',
            passo: 3,
            conceito: 'quadratica.parabola',
          },
          {
            // Trocou x_v por y_v.
            resposta: pergunta === 'vertice-x' ? vertice.y : vertice.x,
            diagnostico:
              pergunta === 'vertice-x'
                ? 'Esse é o valor de y do vértice. A pergunta é pela abscissa, isto é, o x.'
                : 'Esse é o valor de x do vértice. A pergunta é pela ordenada, isto é, o y.',
            passo: 3,
            conceito: 'quadratica.parabola',
          },
        ],
        gabarito,
        proximos,
      ),
      dica:
        pergunta === 'vertice-x' && nivel === 'facil'
          ? `Comece calculando x_v = −b/(2a), com a = ${a} e b = ${b}.`
          : pergunta === 'vertice-y' && nivel === 'medio'
            ? `Ache primeiro x_v = −b/(2a) e depois calcule f(x_v): esse é o valor máximo ou mínimo.`
            : undefined,
    };
  },

  analisar: analisarNumero,

  ...numeroComCasas(2, 1e-4),
};

/** A frase que diz o que o valor do vértice significa NAQUELA história. */
/**
 * A dica mínima quando a história não traz a própria.
 *
 * Nenhuma forma de pergunta pode estrear sem orientação — é a regra do guarda
 * `dicas-de-estreia.spec.ts`.
 */
const DICA_PADRAO_VERTICE =
  'O ponto de máximo ou de mínimo fica no vértice: calcule −b/(2a) para achar onde ele acontece ' +
  'e substitua esse valor na função para achar quanto vale.';

const SIGNIFICADO: Readonly<Record<Historia['grandeza'], string>> = {
  preco: 'É o preço que maximiza o lucro.',
  tempo: 'É o instante em que a altura é máxima.',
  lado: 'É a largura que aproveita melhor a cerca disponível.',
  unidades: 'É a quantidade que minimiza o custo de produção.',
};

/**
 * A parábola que vem de uma história.
 *
 * O enunciado traz a função pronta — ao contrário de Razão e proporção e de
 * Função afim, aqui modelar não é o objetivo: o objetivo é o vértice. O que a
 * história acrescenta é o SIGNIFICADO do vértice, que a versão simbólica não
 * tem como dar.
 */
function exercicioComHistoria(nivel: Nivel, rng: Rng): Exercicio<number> {
  const historia = historiaPara(nivel, rng);
  const { a, b, c, pergunta } = historia;

  const resolucao = resolverQuadraticaComPassos(a, b, c);
  const { vertice, raizes } = resolucao.resultado;

  if (pergunta === 'valor') {
    const x = historia.x ?? 0;
    const gabarito = a * x * x + b * x + c;

    return {
      id: `quadratica-historia-valor-${a}${b}${c}-${x}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: historia.texto.enunciado,
      traducoes: historia.texto.traducoes,
      enunciadoTex: SEM_FORMULA,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao:
              'A fórmula já está dada: é uma parábola, e o sinal do coeficiente de x² decide se ' +
              'ela abre para cima ou para baixo.',
            tex: `f(x) = ${montar(a, b, c)}`,
          },
          {
            descricao: `Substituímos x por ${x}.`,
            tex: `f(${x}) = ${a}(${x})^{2} ${b >= 0 ? '+' : '-'} ${Math.abs(b)}(${x}) ${c >= 0 ? '+' : '-'} ${Math.abs(c)}`,
          },
          {
            descricao: 'Resolvemos a potência primeiro.',
            tex: `= ${a * x * x} ${b * x >= 0 ? '+' : '-'} ${Math.abs(b * x)} ${c >= 0 ? '+' : '-'} ${Math.abs(c)}`,
          },
          { descricao: 'Somamos.', tex: `= ${gabarito}` },
        ],
      },
      conceitos: ['quadratica.parabola', 'quadratica.otimizacao'],
      armadilhas: semColisoes(
        [
          {
            resposta: a * 2 * x + b * x + c,
            diagnostico:
              'x² foi tratado como 2x. Elevar ao quadrado é multiplicar x por ele mesmo.',
            diagnosticoTraducoes: {
              fr: 'x² a été traité comme 2x. Élever au carré, c’est multiplier x par lui-même.',
              en: 'x² was treated as 2x. Squaring means multiplying x by itself.',
            },
            passo: 2,
            conceito: 'quadratica.parabola',
          },
        ],
        gabarito,
        proximos,
      ),
      dica: [
        historia.texto.dica ??
          'Troque x pelo número pedido na função dada e resolva a potência antes da multiplicação.',
        nivel === 'facil' ? `Troque x por ${x} e resolva a potência primeiro.` : undefined,
      ]
        .filter(Boolean)
        .join(' '),
    };
  }

  const gabarito = pergunta === 'vertice-x' ? vertice.x : vertice.y;
  const abreParaBaixo = a < 0;

  const passos: { descricao: string; tex: string; nota?: string }[] = [
    {
      descricao:
        'A fórmula já está dada: é uma parábola, e o sinal do coeficiente de x² decide se ela ' +
        'abre para cima ou para baixo.',
      tex: `f(x) = ${montar(a, b, c)}`,
    },
    {
      descricao:
        'O vértice é o ponto extremo da parábola: é ele que responde «qual é o maior» ou ' +
        '«qual é o menor».',
      tex: 'x_v = \\frac{-b}{2a}',
    },
    {
      descricao: 'A abscissa do vértice é −b dividido por 2a.',
      tex: `x_v = \\frac{${-b}}{2 \\cdot ${a}} = ${vertice.x}`,
    },
  ];

  if (pergunta === 'vertice-y') {
    passos.push(
      {
        descricao: 'Substituímos essa abscissa na função para obter a ordenada do vértice.',
        tex: `f(${vertice.x}) = ${a}(${vertice.x})^{2} ${b >= 0 ? '+' : '-'} ${Math.abs(b)}(${vertice.x}) ${c >= 0 ? '+' : '-'} ${Math.abs(c)}`,
      },
      {
        descricao: abreParaBaixo
          ? 'Como a parábola abre para baixo, o vértice é um MÁXIMO: é o maior valor que a função assume.'
          : 'Como a parábola abre para cima, o vértice é um MÍNIMO: é o menor valor que a função assume.',
        tex: `f(x_v) = ${gabarito}`,
        nota: SIGNIFICADO[historia.grandeza],
      },
    );
  } else {
    passos.push({
      descricao: abreParaBaixo
        ? 'Como a parábola abre para baixo, o vértice é um MÁXIMO: é o maior valor que a função assume.'
        : 'Como a parábola abre para cima, o vértice é um MÍNIMO: é o menor valor que a função assume.',
      tex: `x_v = ${vertice.x}`,
      nota: SIGNIFICADO[historia.grandeza],
    });
  }

  return {
    id: `quadratica-historia-${pergunta}-${a}${b}${c}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: historia.texto.enunciado,
    traducoes: historia.texto.traducoes,
    enunciadoTex: SEM_FORMULA,
    gabarito,
    resolucao: { resultado: gabarito, passos },
    conceitos: ['quadratica.parabola', 'quadratica.otimizacao'],
    armadilhas: semColisoes(
      [
        {
          resposta: raizes.length > 0 ? raizes[0]! : vertice.x + 1,
          diagnostico:
            'Esse é o valor de uma RAIZ, onde a parábola cruza o eixo x — o ponto em que o lucro, ' +
            'a altura ou a área se anulam. O vértice é o ponto extremo, a meio caminho entre as ' +
            'duas raízes.',
          diagnosticoTraducoes: {
            fr:
              'C’est la valeur d’une RACINE, où la parabole coupe l’axe des x — le point où le ' +
              'bénéfice, la hauteur ou l’aire s’annulent. Le sommet est le point extrême, à ' +
              'mi-chemin entre les deux racines.',
            en:
              'That is the value of a ROOT, where the parabola crosses the x-axis — the point ' +
              'where the profit, height or area is zero. The vertex is the extreme point, ' +
              'halfway between the two roots.',
          },
          passo: 2,
          conceito: 'quadratica.parabola',
        },
        {
          resposta: pergunta === 'vertice-x' ? vertice.y : vertice.x,
          diagnostico:
            pergunta === 'vertice-x'
              ? 'Esse é o valor máximo ou mínimo (a ordenada). A pergunta é pelo preço, tempo ou ' +
                'quantidade que o produz — a abscissa.'
              : 'Esse é o preço, tempo ou quantidade do vértice (a abscissa). A pergunta é pelo ' +
                'valor máximo ou mínimo que acontece ali.',
          diagnosticoTraducoes: {
            fr:
              pergunta === 'vertice-x'
                ? 'C’est la valeur maximale ou minimale (l’ordonnée). La question porte sur le ' +
                  'prix, le temps ou la quantité qui la produit — l’abscisse.'
                : 'C’est le prix, le temps ou la quantité du sommet (l’abscisse). La question ' +
                  'porte sur la valeur maximale ou minimale atteinte là.',
            en:
              pergunta === 'vertice-x'
                ? 'That is the maximum or minimum value (the y-coordinate). The question asks for ' +
                  'the price, time or quantity that produces it — the x-coordinate.'
                : 'That is the price, time or quantity at the vertex (the x-coordinate). The ' +
                  'question asks for the maximum or minimum value reached there.',
          },
          passo: 2,
          conceito: 'quadratica.parabola',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: [
      historia.texto.dica ?? DICA_PADRAO_VERTICE,
      pergunta === 'vertice-x' && nivel === 'facil'
        ? `Comece calculando x_v = −b/(2a), com a = ${a} e b = ${b}.`
        : pergunta === 'vertice-y' && nivelAoMenos(nivel, 'medio')
          ? 'Ache primeiro a abscissa do vértice e depois volte com ela à função: esse é o maior ou o menor valor.'
          : undefined,
    ]
      .filter(Boolean)
      .join(' '),
  };
}

function montar(a: number, b: number, c: number): string {
  const termoA = a === 1 ? 'x^{2}' : a === -1 ? '-x^{2}' : `${a}x^{2}`;
  const termoB = b === 0 ? '' : ` ${b > 0 ? '+' : '-'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}x`;
  const termoC = c === 0 ? '' : ` ${c > 0 ? '+' : '-'} ${Math.abs(c)}`;
  return `${termoA}${termoB}${termoC}`;
}

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['valor', 'vertice-x']);
    case 'medio':
      return rng.escolher<Pergunta>(['vertice-x', 'vertice-y', 'valor']);
    case 'dificil':
      return rng.escolher<Pergunta>(['vertice-x', 'vertice-y']);
    // O y do vértice encadeia as duas contas: achar o x e substituir.
    case 'extremo':
      return 'vertice-y';
  }
}

function sortear(nivel: Nivel, rng: Rng): { a: number; b: number; c: number } {
  if (nivel === 'facil') {
    // a = ±1 e b par, para que o vértice caia em valor inteiro.
    return { a: rng.booleano() ? 1 : -1, b: rng.inteiro(-5, 5) * 2, c: rng.inteiro(-8, 8) };
  }

  if (nivel === 'extremo') {
    /*
     * Coeficiente líder grande e `b` nunca nulo.
     *
     * Com b = 0 o vértice está na origem e a resposta é o próprio c — a
     * pergunta perde a graça justamente no nível que devia ser o mais duro.
     */
    const a = rng.inteiro(3, 9) * rng.sinal();
    const b = rng.inteiro(1, 20) * rng.sinal();
    return { a, b, c: rng.inteiro(-25, 25) };
  }

  const a = rng.inteiro(1, nivelAoMenos(nivel, 'dificil') ? 4 : 2) * rng.sinal();
  return { a, b: rng.inteiro(-10, 10), c: rng.inteiro(-10, 10) };
}
