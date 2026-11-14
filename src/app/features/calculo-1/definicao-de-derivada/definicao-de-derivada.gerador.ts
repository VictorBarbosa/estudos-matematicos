import { Polinomio } from '@core/math';
import { numeroEmPortugues } from '@core/treino/textos/numero-escrito';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.01;

type Pergunta = 'derivada-no-ponto' | 'inclinacao-secante' | 'taxa-media';

/**
 * Exercícios de derivada pela definição.
 *
 * Todas as funções são polinomiais, de modo que a derivada exata seja
 * conferível à mão e o foco fique no conceito de limite do quociente.
 */
export const geradorDefinicaoDerivada: GeradorExercicio<number> = {
  topicoId: 'definicao-de-derivada',
  formatoResposta: 'um número, ex.: 6',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pergunta = sortearPergunta(nivel, rng);

    const a = rng.inteiro(1, 4);
    const b = rng.inteiro(-5, 5);
    const c = rng.inteiro(-6, 6);
    const ponto = rng.inteiro(-3, 4);

    const p = Polinomio.de(c, b, a);
    const derivada = p.derivar();

    if (pergunta === 'inclinacao-secante') {
      const h = rng.escolher([1, 2, 0.5]);
      const gabarito = (p.avaliar(ponto + h) - p.avaliar(ponto)) / h;

      return {
        id: `defder-secante-${a}${b}${c}-${ponto}-${h}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado:
          `Qual é a inclinação da reta secante que passa pelos pontos de abscissas ` +
          `${numeroEmPortugues(ponto)} e ${numeroEmPortugues(ponto + h)}? (2 casas)`,
        enunciadoTex: `f(x) = ${p.paraTex()}`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'A inclinação da secante é a razão entre as variações.',
              tex: `\\frac{f(${ponto + h}) - f(${ponto})}{${h}}`,
            },
            {
              descricao: 'Calculamos os dois valores da função.',
              tex: `\\frac{${p.avaliar(ponto + h)} - ${p.avaliar(ponto)}}{${h}}`,
            },
            { descricao: 'Dividindo.', tex: `= ${gabarito}` },
            {
              descricao: 'Com h menor, essa inclinação se aproximaria da derivada.',
              tex: `f'(${ponto}) = ${derivada.avaliar(ponto)}`,
            },
          ],
        },
        conceitos: ['derivada.secante'],
        armadilhas: semColisoes(
          [
            {
              resposta: p.avaliar(ponto + h) - p.avaliar(ponto),
              diagnostico:
                'Faltou dividir pela variação de x. A inclinação é uma RAZÃO entre as duas ' +
                'variações, não apenas a diferença das alturas.',
              passo: 2,
              conceito: 'derivada.secante',
            },
            {
              resposta: derivada.avaliar(ponto),
              diagnostico:
                'Esse é o valor da derivada, ou seja, da inclinação da TANGENTE. A secante ' +
                'usa dois pontos distintos e tem inclinação um pouco diferente.',
              passo: 0,
              conceito: 'derivada.secante',
            },
          ],
          gabarito,
          proximos,
        ),
        dica:
          nivel === 'facil' ? 'Calcule f nos dois pontos e divida pela diferença de x.' : undefined,
      };
    }

    if (pergunta === 'taxa-media') {
      return exercicioTaxaMedia(nivel, rng, p);
    }

    const gabarito = derivada.avaliar(ponto);

    return {
      id: `defder-derivada-${a}${b}${c}-${ponto}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: `Usando a definição, calcule f'(${numeroEmPortugues(ponto)}).`,
      enunciadoTex: `f(x) = ${p.paraTex()}`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: 'Partimos do quociente de Newton.',
            tex: `f'(${ponto}) = \\lim_{h \\to 0} \\frac{f(${ponto}+h) - f(${ponto})}{h}`,
          },
          {
            descricao: 'Expandindo e simplificando, o h do denominador se cancela.',
            tex: `= \\lim_{h \\to 0} \\left(${2 * a * ponto + b} + ${a}h\\right)`,
          },
          {
            descricao: 'Com h tendendo a zero, sobra apenas o termo constante.',
            tex: `f'(${ponto}) = ${gabarito}`,
          },
          {
            descricao: 'Conferindo com a regra da potência.',
            tex: `f'(x) = ${derivada.paraTex()} \\;\\Rightarrow\\; f'(${ponto}) = ${gabarito}`,
          },
        ],
      },
      conceitos: ['derivada.secante', 'derivada.interpretacao'],
      armadilhas: semColisoes(
        [
          {
            resposta: p.avaliar(ponto),
            diagnostico:
              'Esse é o valor da FUNÇÃO no ponto, não da derivada. A derivada mede a ' +
              'inclinação ali, que é outra coisa.',
            passo: 0,
            conceito: 'derivada.secante',
          },
          {
            resposta: a * ponto + b,
            diagnostico:
              'A derivada de ax² é 2ax, e não ax: o expoente desce multiplicando. Confira a ' +
              'regra da potência.',
            passo: 2,
            conceito: 'derivada.secante',
          },
        ],
        gabarito,
        proximos,
      ),
      dica:
        nivel === 'facil'
          ? `Monte f(${ponto} + h) − f(${ponto}), divida por h e simplifique; só no fim faça h tender a zero.`
          : undefined,
    };
  },

  analisar: analisarNumero,

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 }),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['inclinacao-secante', 'derivada-no-ponto']);
    case 'medio':
      return rng.escolher<Pergunta>(['derivada-no-ponto', 'inclinacao-secante', 'taxa-media']);
    case 'dificil':
      return rng.escolher<Pergunta>(['derivada-no-ponto', 'taxa-media']);
    // A derivada pelo limite e a taxa média num intervalo de extremos não
    // inteiros: as duas leituras do mesmo quociente, com a conta mais pesada.
    case 'extremo':
      return rng.escolher<Pergunta>(['derivada-no-ponto', 'taxa-media']);
  }
}

/**
 * Taxa média de variação, com unidade: a velocidade média de um móvel.
 *
 * Declarada no tipo desde o começo e nunca sorteada. É a secante com nome
 * físico — e a ponte entre «inclinação» e «velocidade» que a derivada vai
 * formalizar no instante seguinte.
 */
function exercicioTaxaMedia(nivel: Nivel, rng: Rng, s: Polinomio): Exercicio<number> {
  const inicio = rng.inteiro(0, 4);
  const duracao = nivel === 'extremo' ? rng.escolher([0.5, 1.5, 2.5]) : rng.inteiro(1, 4);
  const fim = inicio + duracao;

  const si = s.avaliar(inicio);
  const sf = s.avaliar(fim);
  const gabarito = (sf - si) / duracao;
  const num = (v: number): string => String(Number(v.toFixed(4))).replace('.', '{,}');

  return {
    id: `defder-taxa-${s.coeficientes.join('_')}-${inicio}-${fim}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `A posição de um carro, em metros, é s(t) com t em segundos. Qual é a velocidade ` +
      `média entre t = ${num(inicio).replace('{,}', ',')} s e t = ${num(fim).replace('{,}', ',')} s, ` +
      'em m/s? (2 casas)',
    enunciadoTex: `s(t) = ${s.paraTex('t')}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'A velocidade média é a variação da posição dividida pela variação do tempo.',
          tex: `v_m = \\frac{s(${num(fim)}) - s(${num(inicio)})}{${num(fim)} - ${num(inicio)}}`,
          nota: 'É a inclinação da secante ao gráfico de s — a derivada é o limite dela.',
        },
        {
          descricao: 'Calculamos a posição nos dois instantes.',
          tex: `s(${num(inicio)}) = ${num(si)} \\qquad s(${num(fim)}) = ${num(sf)}`,
        },
        {
          descricao: 'Variação da posição sobre variação do tempo.',
          tex: `v_m = \\frac{${num(sf)} - ${num(si)}}{${num(duracao)}} = \\frac{${num(sf - si)}}{${num(duracao)}} = ${num(gabarito)}`,
        },
      ],
    },
    conceitos: ['derivada.secante', 'derivada.interpretacao'],
    armadilhas: semColisoes(
      [
        {
          resposta: sf - si,
          diagnostico:
            'Esse é o DESLOCAMENTO, em metros. A velocidade média divide-o pelo tempo gasto.',
          passo: 2,
          conceito: 'derivada.secante',
        },
        {
          resposta: sf / fim,
          diagnostico:
            'Dividir a posição final pelo instante final só funciona se o carro partiu de ' +
            's = 0 em t = 0. A média usa as VARIAÇÕES entre os dois instantes.',
          passo: 0,
          conceito: 'derivada.secante',
        },
        {
          resposta: s.derivar().avaliar(fim),
          diagnostico:
            'Essa é a velocidade INSTANTÂNEA no fim do intervalo (a derivada). A média ' +
            'olha o intervalo inteiro.',
          passo: 0,
          conceito: 'derivada.interpretacao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'medio'
        ? 'v média = Δs / Δt: posição final menos inicial, sobre o tempo.'
        : undefined,
  };
}
