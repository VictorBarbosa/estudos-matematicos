import { Fracao, observarSimplificacao } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import {
  Exercicio,
  GeradorExercicio,
  Nivel,
  SEM_FORMULA,
  pedindoFracao,
  semColisoes,
} from '@core/treino/models/treino.model';
import { Historia, historiaPara } from '@features/funcoes/funcao-afim/funcao-afim.contextos';

const saoEquivalentes = (a: Fracao, b: Fracao): boolean => a.igualA(b);

type Pergunta = 'raiz' | 'taxa' | 'valor';

/**
 * Exercícios de função afim.
 *
 * Alternamos entre três perguntas — raiz, taxa de variação e valor num ponto —
 * para que o aluno precise reconhecer o que está sendo pedido, e não apenas
 * aplicar a mesma fórmula sempre.
 */
export const geradorAfim: GeradorExercicio<Fracao> = {
  topicoId: 'funcao-afim',
  formatoResposta: 'inteiro ou fração, ex.: 3 ou -1/2 — decimal só se for exato',

  gerar(nivel: Nivel, rng: Rng): Exercicio<Fracao> {
    /*
     * Metade das vezes, a função vem descrita por uma situação em vez de
     * escrita como fórmula. É a mesma reta: o que muda é que o aluno precisa
     * decidir, no texto, quem é a taxa e quem é o valor inicial — e essa
     * decisão é o que sobra do assunto quando a prova acaba.
     */
    if (rng.booleano(0.5)) {
      return exercicioComHistoria(nivel, rng);
    }

    const pergunta = sortearPergunta(nivel, rng);
    const a = sortearCoeficiente(nivel, rng);
    const b = rng.inteiro(-12, 12);

    const funcaoTex = `f(x) = ${a === 1 ? '' : a === -1 ? '-' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}`;

    switch (pergunta) {
      case 'raiz': {
        const gabarito = Fracao.criar(-b, a).simplificar();

        return {
          id: `afim-raiz-${a}-${b}-${rng.inteiro(0, 9999)}`,
          nivel,
          enunciado: pedindoFracao(
            'Qual é a raiz da função, isto é, o valor de x em que ela se anula?',
            gabarito,
          ),
          enunciadoTex: funcaoTex,
          gabarito,
          resolucao: {
            resultado: gabarito,
            passos: [
              {
                descricao: 'A raiz é o x que faz f(x) valer zero.',
                tex: `${a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)} = 0`,
              },
              { descricao: 'Isolamos o termo com x.', tex: `${a}x = ${-b}` },
              { descricao: 'Dividimos pelo coeficiente de x.', tex: `x = ${gabarito.paraTex()}` },
              {
                descricao: 'É o ponto em que a reta cruza o eixo horizontal.',
                tex: `\\left(${gabarito.paraTex()},\\; 0\\right)`,
              },
            ],
          },
          conceitos: ['afim.raiz', 'afim.coeficientes'],
          armadilhas: semColisoes(
            [
              {
                resposta: Fracao.deInteiro(b),
                diagnostico:
                  `${b} é o valor de f(0), ou seja, onde a reta corta o eixo VERTICAL. A raiz ` +
                  'é onde ela corta o eixo horizontal — são pontos diferentes.',
                passo: 0,
                conceito: 'afim.raiz',
              },
              {
                resposta: Fracao.criar(b, a).simplificar(),
                diagnostico:
                  'Faltou o sinal negativo. Ao isolar, o termo b passa para o outro lado da ' +
                  'igualdade trocando de sinal: x = −b/a.',
                passo: 1,
                conceito: 'afim.raiz',
              },
            ],
            gabarito,
            saoEquivalentes,
          ),
          dica: nivel === 'facil' ? 'Iguale a função a zero e isole o x.' : undefined,
        };
      }

      case 'taxa': {
        const gabarito = Fracao.deInteiro(a);

        return {
          id: `afim-taxa-${a}-${b}-${rng.inteiro(0, 9999)}`,
          nivel,
          enunciado:
            'Qual é a taxa de variação da função, ou seja, quanto y muda quando x avança 1?',
          enunciadoTex: funcaoTex,
          gabarito,
          resolucao: {
            resultado: gabarito,
            passos: [
              {
                descricao: 'Calculamos a diferença entre dois valores consecutivos.',
                tex: 'f(x+1) - f(x)',
              },
              {
                descricao: 'Substituindo e expandindo.',
                tex: `\\left[${a}(x+1) ${b >= 0 ? '+' : '-'} ${Math.abs(b)}\\right] - \\left[${a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}\\right]`,
              },
              {
                descricao: 'Tudo se cancela menos o coeficiente de x.',
                tex: `= ${a}`,
                nota: 'A taxa de variação de uma função afim é o próprio coeficiente a.',
              },
            ],
          },
          conceitos: ['afim.coeficientes', 'afim.crescimento'],
          armadilhas: semColisoes(
            [
              {
                resposta: Fracao.deInteiro(b),
                diagnostico:
                  'Esse é o coeficiente b, o valor inicial. A taxa de variação é o coeficiente ' +
                  'que multiplica o x.',
                passo: 2,
                conceito: 'afim.coeficientes',
              },
              {
                resposta: Fracao.deInteiro(a + b),
                diagnostico:
                  'Você calculou f(1), que é o valor da função em x = 1. A taxa é a DIFERENÇA ' +
                  'entre dois valores consecutivos, não um valor isolado.',
                passo: 0,
                conceito: 'afim.coeficientes',
              },
            ],
            gabarito,
            saoEquivalentes,
          ),
          dica:
            nivel === 'medio'
              ? `Calcule f(1) e f(0) e subtraia: quanto y mudou quando x passou de 0 para 1?`
              : undefined,
        };
      }

      case 'valor': {
        const x = rng.inteiro(-5, 6);
        const gabarito = Fracao.deInteiro(a * x + b);

        return {
          id: `afim-valor-${a}-${b}-${x}-${rng.inteiro(0, 9999)}`,
          nivel,
          enunciado: `Qual é o valor de f(${x})?`,
          enunciadoTex: funcaoTex,
          gabarito,
          resolucao: {
            resultado: gabarito,
            passos: [
              {
                descricao: `Substituímos x por ${x}.`,
                tex: `f(${x}) = ${a}(${x}) ${b >= 0 ? '+' : '-'} ${Math.abs(b)}`,
              },
              {
                descricao: 'Efetuamos o produto.',
                tex: `= ${a * x} ${b >= 0 ? '+' : '-'} ${Math.abs(b)}`,
              },
              { descricao: 'E a soma.', tex: `= ${a * x + b}` },
            ],
          },
          conceitos: ['afim.coeficientes'],
          armadilhas: semColisoes(
            [
              {
                resposta: Fracao.deInteiro(a * (x + b)),
                diagnostico:
                  'A ordem das operações foi trocada: primeiro multiplica-se a por x, e só ' +
                  'depois soma-se b.',
                passo: 1,
                conceito: 'afim.coeficientes',
              },
            ],
            gabarito,
            saoEquivalentes,
          ),
          dica:
            nivel === 'facil'
              ? `Troque x por ${x}: primeiro ${a} vezes ${x < 0 ? `(${x})` : x}, depois some ${b < 0 ? `(${b})` : b}.`
              : undefined,
        };
      }
    }
  },

  analisar: (entrada) => Fracao.analisar(entrada),
  saoEquivalentes,
  formatar: (valor) => valor.toString(),
  // Resposta certa em forma ampliada conta como acerto e ganha o recado de
  // que existe uma menor — a mesma regra de Frações.
  observarResposta: observarSimplificacao,
};

/**
 * A função que vem de uma história.
 *
 * O enunciado não mostra `f(x) = ax + b`: deduzi-lo do texto é a parte do
 * exercício que tem valor fora do site. A fórmula aparece na resolução, já com
 * os números da situação, que é quando ela ensina em vez de entregar.
 */
function exercicioComHistoria(nivel: Nivel, rng: Rng): Exercicio<Fracao> {
  const historia = historiaPara(nivel, rng);
  const { a, b, pergunta, x } = historia;

  const funcaoTex = `f(x) = ${a === 1 ? '' : a === -1 ? '-' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}`;

  if (pergunta === 'valor') {
    const ponto = x ?? 1;
    const gabarito = Fracao.deInteiro(a * ponto + b);

    return {
      id: `afim-historia-valor-${a}-${b}-${ponto}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: historia.texto.enunciado,
      traducoes: historia.texto.traducoes,
      enunciadoTex: SEM_FORMULA,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          ...passosDeInterpretacao(historia),
          {
            descricao: 'A pergunta é o valor em um ponto: substituímos x pelo número dado.',
            tex: `f(${ponto}) = ${a}(${ponto}) ${b >= 0 ? '+' : '-'} ${Math.abs(b)}`,
          },
          {
            descricao: 'Efetuamos o produto.',
            tex: `= ${a * ponto} ${b >= 0 ? '+' : '-'} ${Math.abs(b)}`,
          },
          { descricao: 'E a soma.', tex: `= ${a * ponto + b}` },
        ],
      },
      conceitos: ['afim.coeficientes', 'afim.modelagem'],
      armadilhas: semColisoes(
        [
          {
            resposta: Fracao.deInteiro(a * (ponto + b)),
            diagnostico:
              'A ordem das operações foi trocada: primeiro multiplica-se a taxa pelo número de ' +
              'unidades, e só depois soma-se o valor inicial.',
            diagnosticoTraducoes: {
              fr:
                'L’ordre des opérations est inversé : on multiplie d’abord le taux par le nombre ' +
                'd’unités, puis on ajoute la valeur initiale.',
              en:
                'The order of operations is reversed: multiply the rate by the number of units ' +
                'first, then add the starting value.',
            },
            passo: 1,
            conceito: 'afim.coeficientes',
          },
          {
            resposta: Fracao.deInteiro(b),
            diagnostico:
              'Esse é o valor inicial, o que existe antes de qualquer unidade. A pergunta pede ' +
              'o total, que já inclui a taxa.',
            diagnosticoTraducoes: {
              fr:
                'C’est la valeur initiale, ce qui existe avant toute unité. La question demande ' +
                'le total, qui inclut déjà le taux.',
              en:
                'That is the starting value, what exists before any unit. The question asks for ' +
                'the total, which already includes the rate.',
            },
            passo: 0,
            conceito: 'afim.coeficientes',
          },
        ],
        gabarito,
        saoEquivalentes,
      ),
      // A dica da história primeiro (é a que lê o texto), a da conta depois.
      dica: [
        historia.texto.dica ?? DICA_PADRAO.valor,
        nivel === 'facil'
          ? `São ${ponto} unidades: multiplique ${ponto} pela taxa e depois some o valor fixo.`
          : undefined,
      ]
        .filter(Boolean)
        .join(' '),
    };
  }

  if (pergunta === 'raiz') {
    // A pergunta pode ser f(x) = 0 (o tanque esvaziar) ou f(x) = alvo (o
    // orçamento acabar). Resolver a equação certa é o que separa a história
    // de um exercício sem sentido.
    const alvo = historia.alvo ?? 0;
    const gabarito = Fracao.criar(alvo - b, a).simplificar();

    return {
      id: `afim-historia-raiz-${a}-${b}-${alvo}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: historia.texto.enunciado,
      traducoes: historia.texto.traducoes,
      enunciadoTex: SEM_FORMULA,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          ...passosDeInterpretacao(historia),
          {
            descricao:
              alvo === 0
                ? 'O total chega a zero: igualamos a função a zero.'
                : `O total procurado é ${alvo}: igualamos a função a esse valor.`,
            tex: `${a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)} = ${alvo}`,
          },
          { descricao: 'Isolamos o termo com x.', tex: `${a}x = ${alvo - b}` },
          { descricao: 'Dividimos pelo coeficiente de x.', tex: `x = ${gabarito.paraTex()}` },
        ],
      },
      conceitos: ['afim.raiz', 'afim.modelagem'],
      dica: historia.texto.dica ?? DICA_PADRAO.raiz,
      armadilhas: semColisoes(
        [
          {
            resposta: Fracao.deInteiro(b),
            diagnostico:
              'Esse é o valor inicial, não o ponto em que o total zera. A pergunta é onde a ' +
              'função chega a zero.',
            diagnosticoTraducoes: {
              fr:
                'C’est la valeur initiale, pas le point où le total s’annule. La question porte ' +
                'sur l’endroit où la fonction atteint zéro.',
              en:
                'That is the starting value, not the point where the total reaches zero. The ' +
                'question asks where the function hits zero.',
            },
            passo: 0,
            conceito: 'afim.raiz',
          },
          {
            resposta: Fracao.criar(b, a).simplificar(),
            diagnostico:
              'Faltou o sinal: ao isolar, o valor inicial passa para o outro lado trocando de ' +
              'sinal, então a conta é −b dividido por a.',
            diagnosticoTraducoes: {
              fr:
                'Le signe manque : en isolant, la valeur initiale passe de l’autre côté en ' +
                'changeant de signe, donc le calcul est −b divisé par a.',
              en:
                'The sign is missing: isolating moves the starting value across with the ' +
                'opposite sign, so the computation is −b divided by a.',
            },
            passo: 1,
            conceito: 'afim.raiz',
          },
        ],
        gabarito,
        saoEquivalentes,
      ),
    };
  }

  // Nas histórias de perda, a pergunta é «quanto se perde por minuto», que é a
  // magnitude do coeficiente — não o coeficiente negativo.
  const gabarito = Fracao.deInteiro(historia.taxaPositiva === true ? Math.abs(a) : a);

  return {
    id: `afim-historia-taxa-${a}-${b}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: historia.texto.enunciado,
    traducoes: historia.texto.traducoes,
    enunciadoTex: SEM_FORMULA,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        ...passosDeInterpretacao(historia),
        { descricao: 'Comparamos dois totais consecutivos.', tex: 'f(x+1) - f(x)' },
        {
          descricao: 'O valor inicial se cancela e sobra o coeficiente de x.',
          tex: `${a}`,
          nota: 'A taxa de variação de uma função afim é o próprio coeficiente a.',
        },
      ],
    },
    conceitos: ['afim.coeficientes', 'afim.crescimento'],
    armadilhas: semColisoes(
      [
        {
          resposta: Fracao.deInteiro(Math.abs(b)),
          diagnostico:
            'Esse é o valor fixo, que não muda com o número de unidades. A pergunta é quanto o ' +
            'total cresce a cada unidade a mais.',
          diagnosticoTraducoes: {
            fr:
              'C’est la valeur fixe, qui ne change pas avec le nombre d’unités. La question ' +
              'porte sur la croissance du total par unité supplémentaire.',
            en:
              'That is the fixed value, which does not change with the number of units. The ' +
              'question asks how much the total grows per extra unit.',
          },
          passo: 0,
          conceito: 'afim.coeficientes',
        },
        {
          resposta: Fracao.deInteiro(a + b),
          diagnostico:
            'Você somou a taxa com o valor fixo. A taxa é só a parte que se repete a cada ' +
            'unidade — o valor fixo não entra nela.',
          diagnosticoTraducoes: {
            fr:
              'Vous avez additionné le taux et la valeur fixe. Le taux est seulement la part qui ' +
              'se répète à chaque unité — la valeur fixe n’en fait pas partie.',
            en:
              'You added the rate and the fixed value. The rate is only the part that repeats ' +
              'each unit — the fixed value is not in it.',
          },
          passo: 1,
          conceito: 'afim.coeficientes',
        },
      ],
      gabarito,
      saoEquivalentes,
    ),
    dica: historia.texto.dica ?? DICA_PADRAO.taxa,
  };
}

/**
 * A dica mínima de cada tipo de pergunta.
 *
 * As histórias que trazem a própria dica usam a delas; estas servem às que não
 * trazem, para que nenhuma forma de pergunta estreie sem orientação — é a regra
 * do guarda `dicas-de-estreia.spec.ts`, e ela vale mesmo quando o enunciado já
 * se explica bem.
 */
const DICA_PADRAO: Readonly<Record<'valor' | 'raiz' | 'taxa', string>> = {
  valor:
    'São duas parcelas: o que se repete a cada unidade e o que existe antes de qualquer uma. ' +
    'Multiplique a primeira pelo número de unidades e some a segunda.',
  raiz:
    'Monte a equação: valor fixo mais (taxa × número de unidades) igual ao total pedido. ' +
    'Isole o número de unidades.',
  taxa:
    'O valor fixo é o que já existe com zero unidades; a taxa é quanto o total sobe a cada ' +
    'unidade a mais.',
};

/** Os dois primeiros passos, comuns às três perguntas: ler a situação. */
function passosDeInterpretacao(historia: Historia): readonly { descricao: string; tex: string }[] {
  return [
    {
      descricao:
        'A situação já descreve uma função afim: um valor inicial fixo e uma taxa que se repete ' +
        'a cada unidade.',
      tex: `f(x) = ${historia.a}x ${historia.b >= 0 ? '+' : '-'} ${Math.abs(historia.b)}`,
    },
    {
      descricao: `O valor inicial é ${historia.b} e a taxa é ${historia.a}: é a leitura de f(0) e de a.`,
      tex: `f(0) = ${historia.b}, \\qquad a = ${historia.a}`,
    },
  ];
}

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['valor', 'raiz']);
    case 'medio':
      return rng.escolher<Pergunta>(['raiz', 'taxa', 'valor']);
    case 'dificil':
      return rng.escolher<Pergunta>(['raiz', 'taxa']);
    // A taxa pede ler dois pontos e dividir: é a leitura inversa do gráfico.
    case 'extremo':
      return 'taxa';
  }
}

function sortearCoeficiente(nivel: Nivel, rng: Rng): number {
  if (nivel === 'facil') {
    return rng.inteiro(1, 5);
  }
  const valor = rng.inteiro(2, 9) * rng.sinal();
  return valor === 0 ? 2 : valor;
}
