import { Polinomio } from '@core/math';
import { Rng } from '@core/treino/rng';
import { analisarNumero } from '@core/treino/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

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
          `${ponto} e ${ponto + h}? (2 casas)`,
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
        dica: nivel === 'facil' ? 'Calcule f nos dois pontos e divida pela diferença de x.' : undefined,
      };
    }

    const gabarito = derivada.avaliar(ponto);

    return {
      id: `defder-derivada-${a}${b}${c}-${ponto}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: `Usando a definição, calcule f'(${ponto}).`,
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
      return rng.escolher<Pergunta>(['derivada-no-ponto', 'inclinacao-secante']);
    case 'dificil':
      return 'derivada-no-ponto';
  }
}
