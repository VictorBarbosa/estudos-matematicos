import { Rng } from '@core/treino/rng/rng';
import { Exercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.02;

/** ` − 5` para tirar 5 de um lado, ` + 5` para tirar −5, nada para 0. */
const menos = (v: number): string => (v === 0 ? '' : ` ${v > 0 ? '-' : '+'} ${Math.abs(v)}`);

const par = (v: number): string => (v < 0 ? `(${v})` : `${v}`);

/** `(x − h)²`, ou `x²` quando h = 0. */
const quadradoTex = (h: number): string =>
  h === 0 ? 'x^{2}' : `(x ${h > 0 ? '-' : '+'} ${Math.abs(h)})^{2}`;

/** `(y − k)`, ou `y` quando k = 0. */
const linearTex = (k: number): string =>
  k === 0 ? 'y' : `(y ${k > 0 ? '-' : '+'} ${Math.abs(k)})`;

/**
 * A parábola como cônica: foco, diretriz e o parâmetro p.
 *
 * Faltava no tópico — e é a cônica da trajetória de um projétil e da antena
 * parabólica. Todos os níveis usam o eixo vertical, (x − h)² = 4p(y − k):
 *
 * - Fácil: x² = 4py, a ordenada do foco.
 * - Médio: a diretriz, com a parábola às vezes escrita como y = x²/(4p).
 * - Difícil: a forma transladada, foco ou diretriz a partir do vértice.
 * - Extremo: a equação expandida, que exige completar o quadrado.
 */
export function exercicioParabola(nivel: Nivel, rng: Rng): Exercicio<number> {
  const p = rng.inteiro(1, nivel === 'facil' ? 4 : 5) * (nivel === 'facil' ? 1 : rng.sinal());
  const quatroP = 4 * p;

  if (nivel === 'facil' || nivel === 'medio') {
    const pedeDiretriz = nivel === 'medio' && rng.booleano(0.6);
    const comoFracao = nivel === 'medio' && rng.booleano();
    const gabarito = pedeDiretriz ? -p : p;
    const enunciadoTex = comoFracao ? `y = \\frac{x^{2}}{${quatroP}}` : `x^{2} = ${quatroP}y`;

    return {
      id: `conicas-parabola-${nivel}-${p}-${pedeDiretriz ? 'd' : 'f'}${comoFracao ? 'q' : ''}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: pedeDiretriz
        ? 'A diretriz desta parábola é a reta horizontal y = d. Qual é o valor de d?'
        : 'Qual é a ordenada (coordenada y) do foco desta parábola?',
      enunciadoTex,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          ...(comoFracao
            ? [
                {
                  descricao: `Multiplicamos os dois lados por ${quatroP} para chegar à forma x² = 4py.`,
                  tex: `x^{2} = ${quatroP}y`,
                },
              ]
            : []),
          {
            descricao: 'Comparamos com a forma padrão: o número que multiplica y é 4p.',
            tex: `4p = ${quatroP} \\;\\Rightarrow\\; p = ${p}`,
            nota:
              p > 0
                ? 'p positivo: a parábola abre para cima.'
                : 'p negativo: a parábola abre para baixo.',
          },
          {
            descricao: 'O vértice é a origem; o foco fica p acima dele, e a diretriz, p abaixo.',
            tex: `F = (0,\\; ${p}) \\qquad \\text{diretriz: } y = ${-p}`,
          },
          {
            descricao: pedeDiretriz ? 'A diretriz é y = −p.' : 'A ordenada do foco é p.',
            tex: `${pedeDiretriz ? 'd' : 'y_F'} = ${gabarito}`,
          },
        ],
      },
      conceitos: ['conicas.parabola'],
      armadilhas: semColisoes(
        [
          {
            resposta: quatroP,
            diagnostico: `${quatroP} é 4p, não p. Divida por 4: p = ${p}.`,
            passo: comoFracao ? 1 : 0,
            conceito: 'conicas.parabola',
          },
          {
            resposta: -gabarito,
            diagnostico: pedeDiretriz
              ? 'Esse é o foco. A diretriz fica do lado OPOSTO, à mesma distância do vértice: y = −p.'
              : 'Essa é a diretriz. O foco fica do lado para onde a parábola abre: (0, p).',
            passo: comoFracao ? 2 : 1,
            conceito: 'conicas.parabola',
          },
          {
            resposta: pedeDiretriz ? -quatroP : 1 / quatroP,
            diagnostico: 'Compare com x² = 4py: o coeficiente de y é 4p, e p é ele dividido por 4.',
            passo: comoFracao ? 1 : 0,
            conceito: 'conicas.parabola',
          },
        ],
        gabarito,
        proximos,
      ),
      dica:
        nivel === 'facil'
          ? 'Compare com x² = 4py: o número que multiplica y é 4p, e o foco fica em (0, p).'
          : 'Escreva como x² = 4py. A diretriz é a reta y = −p, do lado oposto ao foco.',
    };
  }

  const h = rng.inteiro(-5, 5);
  const k = rng.inteiro(-5, 5);
  const pedeDiretriz = rng.booleano();
  const gabarito = pedeDiretriz ? k - p : k + p;

  const passosFinais = [
    {
      descricao: 'Na forma (x − h)² = 4p(y − k), o vértice é (h, k) e o número na frente é 4p.',
      tex: `V = (${h},\\; ${k}) \\qquad 4p = ${quatroP} \\;\\Rightarrow\\; p = ${p}`,
    },
    {
      descricao: pedeDiretriz
        ? 'A diretriz fica p do lado oposto à abertura: y = k − p.'
        : 'O foco fica p na direção da abertura: (h, k + p).',
      tex: pedeDiretriz
        ? `y = ${k} - ${par(p)} = ${gabarito}`
        : `y_F = ${k} + ${par(p)} = ${gabarito}`,
    },
  ];

  if (nivel === 'dificil') {
    return {
      id: `conicas-parabola-transl-${h}${k}${p}-${pedeDiretriz ? 'd' : 'f'}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: pedeDiretriz
        ? 'A diretriz desta parábola é a reta horizontal y = d. Qual é o valor de d?'
        : 'Qual é a ordenada (coordenada y) do foco desta parábola?',
      enunciadoTex: `${quadradoTex(h)} = ${quatroP}${linearTex(k)}`,
      gabarito,
      resolucao: { resultado: gabarito, passos: passosFinais },
      conceitos: ['conicas.parabola'],
      armadilhas: semColisoes(
        [
          {
            resposta: pedeDiretriz ? -p : p,
            diagnostico: `A parábola foi deslocada: o vértice é (${h}, ${k}), não a origem. Some o deslocamento k = ${k}.`,
            passo: 0,
            conceito: 'conicas.parabola',
          },
          {
            resposta: pedeDiretriz ? k + p : k - p,
            diagnostico: pedeDiretriz
              ? 'Esse é o foco. A diretriz fica do outro lado do vértice: y = k − p.'
              : 'Essa é a diretriz. O foco fica do lado da abertura: y = k + p.',
            passo: 1,
            conceito: 'conicas.parabola',
          },
          {
            resposta: pedeDiretriz ? -k - p : -k + p,
            diagnostico: `Em (y − k), o k aparece com sinal trocado: (y ${k > 0 ? '−' : '+'} ${Math.abs(k)}) quer dizer k = ${k}.`,
            passo: 0,
            conceito: 'conicas.parabola',
          },
        ],
        gabarito,
        proximos,
      ),
      dica: 'O vértice é (h, k), lido com os sinais trocados dos parênteses. O foco fica a p do vértice, para o lado da abertura.',
    };
  }

  // Extremo: y = (x² − 2hx + h² + 4pk)/(4p), que é preciso fatorar de volta.
  const termoX = -2 * h;
  const constante = h * h + quatroP * k;
  const numerador =
    `x^{2}${termoX === 0 ? '' : ` ${termoX > 0 ? '+' : '-'} ${Math.abs(termoX)}x`}` +
    `${constante === 0 ? '' : ` ${constante > 0 ? '+' : '-'} ${Math.abs(constante)}`}`;

  return {
    id: `conicas-parabola-exp-${h}${k}${p}-${pedeDiretriz ? 'd' : 'f'}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: pedeDiretriz
      ? 'A diretriz desta parábola é a reta horizontal y = d. Qual é o valor de d?'
      : 'Qual é a ordenada (coordenada y) do foco desta parábola?',
    enunciadoTex: `y = \\frac{${numerador}}{${quatroP}}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `Multiplicamos por ${quatroP} e deixamos só os termos em x de um lado.`,
          tex: `${quatroP}y${menos(constante)} = ${numerador.replace(/ [+-] \d+$/, '')}`,
        },
        {
          descricao: `Completamos o quadrado: somamos h² = ${h * h} dos dois lados (h é metade de ${-termoX}).`,
          tex: `${quatroP}y${menos(constante - h * h)} = ${quadradoTex(h)}`,
        },
        {
          descricao: `Pomos ${quatroP} em evidência do lado de y.`,
          tex: `${quadradoTex(h)} = ${quatroP}${linearTex(k)}`,
        },
        ...passosFinais,
      ],
    },
    conceitos: ['conicas.parabola'],
    armadilhas: semColisoes(
      [
        {
          resposta: pedeDiretriz ? constante / quatroP - p : constante / quatroP + p,
          diagnostico: `O termo independente sobre ${quatroP} não é o k do vértice: falta tirar o h² = ${h * h} que entrou ao completar o quadrado.`,
          passo: 1,
          conceito: 'conicas.parabola',
        },
        {
          resposta: pedeDiretriz ? k + p : k - p,
          diagnostico: pedeDiretriz
            ? 'Esse é o foco. A diretriz fica do outro lado do vértice: y = k − p.'
            : 'Essa é a diretriz. O foco fica do lado da abertura: y = k + p.',
          passo: 4,
          conceito: 'conicas.parabola',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: 'Complete o quadrado até chegar a (x − h)² = 4p(y − k); aí o foco é (h, k + p) e a diretriz, y = k − p.',
  };
}
