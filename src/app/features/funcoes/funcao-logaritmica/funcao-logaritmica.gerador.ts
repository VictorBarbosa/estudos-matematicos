import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 1e-6;

type Pergunta = 'valor' | 'propriedade' | 'equacao';

/**
 * Exercícios de função logarítmica.
 *
 * Todos os valores são escolhidos para dar logaritmo inteiro, de modo que o
 * aluno trabalhe o conceito — "qual é o expoente?" — sem depender de
 * calculadora.
 */
export const geradorLogaritmica: GeradorExercicio<number> = {
  topicoId: 'funcao-logaritmica',
  formatoResposta: 'um número, ex.: 3 ou -2',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pergunta = sortearPergunta(nivel, rng);
    const base = rng.inteiro(2, nivel === 'facil' ? 9 : 16);

    if (pergunta === 'propriedade') {
      const m = rng.inteiro(1, 16);
      const n = rng.inteiro(1, 16);
      const gabarito = m + n;

      return {
        id: `log-propriedade-${base}-${m}-${n}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: 'Use a propriedade do produto e informe o valor.',
        enunciadoTex: `\\log_{${base}} \\left(${base ** m} \\cdot ${base ** n}\\right) = \;?`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'O logaritmo de um produto é a soma dos logaritmos.',
              tex: `\\log_{${base}} ${base ** m} + \\log_{${base}} ${base ** n}`,
            },
            {
              descricao: 'Cada parcela é o expoente que leva a base até o número.',
              tex: `${base}^{${m}} = ${base ** m} \;\\Rightarrow\; ${m} \\qquad ${base}^{${n}} = ${base ** n} \;\\Rightarrow\; ${n}`,
            },
            { descricao: 'Somamos.', tex: `${m} + ${n} = ${gabarito}` },
          ],
        },
        conceitos: ['logaritmica.propriedades', 'logaritmica.definicao'],
        armadilhas: semColisoes(
          [
            {
              resposta: m * n,
              diagnostico:
                'O logaritmo de um PRODUTO vira SOMA de logaritmos, não produto. É justamente ' +
                'essa troca que tornava o logaritmo útil para simplificar contas grandes.',
              passo: 0,
              conceito: 'logaritmica.propriedades',
            },
            {
              resposta: base ** m * base ** n,
              diagnostico:
                'Você respondeu o valor do produto, não o seu logaritmo. O logaritmo devolve o ' +
                'EXPOENTE, que é um número bem menor.',
              passo: 0,
              conceito: 'logaritmica.definicao',
            },
          ],
          gabarito,
          proximos,
        ),
      };
    }

    if (pergunta === 'equacao') {
      const y = rng.inteiro(1, 8);
      const gabarito = base ** y;

      return {
        id: `log-equacao-${base}-${y}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: 'Resolva a equação logarítmica.',
        enunciadoTex: `\\log_{${base}} x = ${y}`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'Aplicamos a definição: o logaritmo é o expoente.',
              tex: `\\log_{${base}} x = ${y} \\iff ${base}^{${y}} = x`,
            },
            { descricao: 'Calculamos a potência.', tex: `x = ${gabarito}` },
          ],
        },
        conceitos: ['logaritmica.definicao'],
        armadilhas: semColisoes(
          [
            {
              resposta: base * y,
              diagnostico:
                `Você multiplicou a base pelo resultado. A definição diz que ${base} deve ser ` +
                `ELEVADO a ${y}, não multiplicado por ele.`,
              passo: 0,
              conceito: 'logaritmica.definicao',
            },
            {
              resposta: y ** base,
              diagnostico:
                'A base e o expoente estão trocados. Em log_b(x) = y, é a BASE que vai elevada ' +
                'ao resultado.',
              passo: 0,
              conceito: 'logaritmica.definicao',
            },
          ],
          gabarito,
          proximos,
        ),
        dica: nivel === 'facil' ? 'Reescreva na forma exponencial.' : undefined,
      };
    }

    // Valor direto, inclusive com expoente negativo nos níveis mais altos.
    const expoente = nivel === 'dificil' ? rng.inteiro(-5, 6) : rng.inteiro(0, 7);
    const argumento = base ** expoente;

    return {
      id: `log-valor-${base}-${expoente}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: 'Calcule o logaritmo.',
      enunciadoTex:
        expoente < 0
          ? `\\log_{${base}} \\frac{1}{${base ** -expoente}} = \;?`
          : `\\log_{${base}} ${argumento} = \;?`,
      gabarito: expoente,
      resolucao: {
        resultado: expoente,
        passos: [
          {
            descricao: 'Perguntamos: a que expoente elevar a base para chegar nesse número?',
            tex: `${base}^{?} = ${expoente < 0 ? `\\frac{1}{${base ** -expoente}}` : argumento}`,
          },
          {
            descricao:
              expoente < 0
                ? 'Uma fração com 1 no numerador corresponde a expoente negativo.'
                : 'Escrevemos o número como potência da base.',
            tex: `${base}^{${expoente}} = ${expoente < 0 ? `\\frac{1}{${base ** -expoente}}` : argumento}`,
          },
          { descricao: 'Logo o logaritmo é esse expoente.', tex: `${expoente}` },
        ],
      },
      conceitos: ['logaritmica.definicao'],
      armadilhas: semColisoes(
        [
          {
            resposta: argumento,
            diagnostico:
              'Você repetiu o argumento. O logaritmo não devolve o número, e sim o EXPOENTE ' +
              'que leva a base até ele.',
            passo: 0,
            conceito: 'logaritmica.definicao',
          },
          {
            resposta: argumento / base,
            diagnostico:
              'Logaritmo não é divisão pela base. É quantas VEZES a base precisa ser ' +
              'multiplicada por si mesma.',
            passo: 1,
            conceito: 'logaritmica.definicao',
          },
        ],
        expoente,
        proximos,
      ),
    };
  },

  analisar: (entrada) => {
    const limpo = entrada.trim().replace(/\s/g, '').replace(',', '.');
    return /^[+-]?\d*\.?\d+$/.test(limpo) ? Number(limpo) : null;
  },

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 }),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['valor', 'equacao']);
    case 'medio':
      return rng.escolher<Pergunta>(['valor', 'equacao', 'propriedade']);
    case 'dificil':
      return rng.escolher<Pergunta>(['valor', 'propriedade']);
  }
}
