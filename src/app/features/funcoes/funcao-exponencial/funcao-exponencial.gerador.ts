import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 1e-6;

type Pergunta = 'valor' | 'inicial' | 'duplicacao';

/**
 * Exercícios de função exponencial.
 *
 * As armadilhas atacam a confusão central do tema: tratar bˣ como b·x, ou
 * seja, aplicar raciocínio linear a um crescimento multiplicativo.
 */
export const geradorExponencial: GeradorExercicio<number> = {
  topicoId: 'funcao-exponencial',
  formatoResposta: 'um número, ex.: 800 ou 0,25',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pergunta = sortearPergunta(nivel, rng);
    const base = sortearBase(nivel, rng);
    const inicial = rng.escolher([1, 2, 5, 10, 50, 100]);

    const funcaoTex = `f(x) = ${inicial === 1 ? '' : inicial + ' \\cdot '}${base}^{x}`;

    if (pergunta === 'duplicacao') {
      const gabarito = Math.log(2) / Math.log(base);

      return {
        id: `exponencial-duplicacao-${base}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado:
          'Quantas unidades de x são necessárias para o valor DOBRAR? (arredonde para 2 casas)',
        enunciadoTex: funcaoTex,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            { descricao: 'Queremos o t que faz o valor dobrar.', tex: `${base}^{t} = 2` },
            {
              descricao: 'Aplicamos logaritmo nos dois lados para tirar t do expoente.',
              tex: `t \\cdot \\ln ${base} = \\ln 2`,
            },
            {
              descricao: 'Isolando t.',
              tex: `t = \\frac{\\ln 2}{\\ln ${base}} \\approx ${gabarito.toFixed(4)}`,
              nota: 'Esse tempo é o mesmo partindo de qualquer valor.',
            },
          ],
        },
        conceitos: ['exponencial.crescimento'],
        armadilhas: semColisoes(
          [
            {
              resposta: 2 / base,
              diagnostico:
                'Dobrar não é dividir 2 pela base. O t aparece no EXPOENTE, então é preciso ' +
                'usar logaritmo para isolá-lo.',
              passo: 1,
              conceito: 'exponencial.crescimento',
            },
          ],
          gabarito,
          proximos,
        ),
      };
    }

    if (pergunta === 'inicial') {
      const gabarito = inicial;

      return {
        id: `exponencial-inicial-${inicial}-${base}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: 'Qual é o valor da função em x = 0?',
        enunciadoTex: funcaoTex,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            { descricao: 'Substituímos x por zero.', tex: `f(0) = ${inicial} \\cdot ${base}^{0}` },
            {
              descricao: 'Qualquer base não nula elevada a zero vale 1.',
              tex: `${base}^{0} = 1`,
              nota: 'Isso vem da regra do quociente de potências, não de convenção.',
            },
            { descricao: 'Sobra apenas o coeficiente inicial.', tex: `f(0) = ${inicial}` },
          ],
        },
        conceitos: ['exponencial.definicao'],
        armadilhas: semColisoes(
          [
            {
              resposta: 0,
              diagnostico:
                'Base elevada a zero não é zero, é UM. Por isso f(0) é o coeficiente que ' +
                'multiplica a potência, e a exponencial nunca passa pela origem.',
              passo: 1,
              conceito: 'exponencial.definicao',
            },
            {
              resposta: inicial * base,
              diagnostico: 'Esse é o valor em x = 1. Em x = 0 a potência vale 1, não a base.',
              passo: 1,
              conceito: 'exponencial.definicao',
            },
          ],
          gabarito,
          proximos,
        ),
        dica: 'Quanto vale qualquer número elevado a zero?',
      };
    }

    const x = rng.inteiro(nivel === 'dificil' ? -3 : 1, 4);
    const gabarito = inicial * base ** x;

    return {
      id: `exponencial-valor-${inicial}-${base}-${x}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: `Qual é o valor de f(${x})?`,
      enunciadoTex: funcaoTex,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          { descricao: `Substituímos x por ${x}.`, tex: `f(${x}) = ${inicial} \\cdot ${base}^{${x}}` },
          {
            descricao:
              x >= 0
                ? 'Calculamos a potência.'
                : 'Expoente negativo significa inverter a potência.',
            tex:
              x >= 0
                ? `${base}^{${x}} = ${base ** x}`
                : `${base}^{${x}} = \\frac{1}{${base}^{${-x}}} = ${base ** x}`,
          },
          { descricao: 'Multiplicamos pelo coeficiente.', tex: `f(${x}) = ${gabarito}` },
        ],
      },
      conceitos: ['exponencial.definicao', 'exponencial.crescimento'],
      armadilhas: semColisoes(
        [
          {
            resposta: inicial * base * x,
            diagnostico:
              `Você multiplicou a base por ${x} em vez de elevá-la. Potência é multiplicação ` +
              `REPETIDA: ${base}^${x} significa multiplicar ${base} por si mesmo ${Math.abs(x)} vezes.`,
            passo: 1,
            conceito: 'exponencial.definicao',
          },
          {
            resposta: (inicial * base) ** x,
            diagnostico:
              'O coeficiente não entra na potência. Na expressão a·bˣ, o expoente age apenas ' +
              'sobre a base b.',
            passo: 0,
            conceito: 'exponencial.definicao',
          },
          {
            resposta: -(inicial * base ** Math.abs(x)),
            diagnostico:
              'Expoente negativo não torna o resultado negativo: ele INVERTE o valor. ' +
              'A exponencial de base positiva é sempre positiva.',
            passo: 1,
            conceito: 'exponencial.assintota',
          },
        ],
        gabarito,
        proximos,
      ),
    };
  },

  analisar: (entrada) => {
    const limpo = entrada.trim().replace(/\s/g, '').replace(',', '.');

    const fracao = /^([+-]?\d+)\/(\d+)$/.exec(limpo);
    if (fracao) {
      const denominador = Number(fracao[2]);
      return denominador === 0 ? null : Number(fracao[1]) / denominador;
    }

    return /^[+-]?\d*\.?\d+$/.test(limpo) ? Number(limpo) : null;
  },

  saoEquivalentes: (a, b) => Math.abs(a - b) < Math.max(1e-6, Math.abs(a) * 1e-4),
  formatar: (valor) =>
    Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 }),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['valor', 'inicial']);
    case 'medio':
      return rng.escolher<Pergunta>(['valor', 'inicial', 'duplicacao']);
    case 'dificil':
      return rng.escolher<Pergunta>(['valor', 'duplicacao']);
  }
}

function sortearBase(nivel: Nivel, rng: Rng): number {
  if (nivel === 'facil') {
    return rng.escolher([2, 3, 10]);
  }
  return rng.escolher(nivel === 'medio' ? [2, 3, 4, 5, 10] : [2, 3, 5, 0.5, 0.2]);
}
