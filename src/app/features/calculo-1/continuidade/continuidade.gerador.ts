import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.01;

type Pergunta = 'valor-que-torna-continua' | 'buraco' | 'tvi';

/**
 * Exercícios de continuidade.
 *
 * A pergunta mais instrutiva é "que valor tornaria a função contínua?",
 * porque ela só pode ser respondida calculando o limite.
 */
export const geradorContinuidade: GeradorExercicio<number> = {
  topicoId: 'continuidade',
  formatoResposta: 'um número, ex.: 4',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pergunta = sortearPergunta(nivel, rng);

    if (pergunta === 'buraco') {
      // (x² − k²)/(x − k): o buraco deveria valer 2k.
      const k = rng.inteiro(1, 8);
      const gabarito = 2 * k;

      return {
        id: `cont-buraco-${k}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado:
          `Esta função não está definida em x = ${k}. Que valor deveria ser atribuído ali ` +
          'para torná-la contínua?',
        enunciadoTex: `f(x) = \\frac{x^{2} - ${k * k}}{x - ${k}}`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'Para a função ser contínua, o valor no ponto deve igualar o limite.',
              tex: `f(${k}) = \\lim_{x \\to ${k}} f(x)`,
            },
            {
              descricao: 'Calculamos o limite fatorando e cancelando.',
              tex: `\\frac{(x+${k})(x-${k})}{x-${k}} = x + ${k}`,
            },
            {
              descricao: 'Substituindo o ponto na expressão simplificada.',
              tex: `${k} + ${k} = ${gabarito}`,
            },
            {
              descricao: 'Definindo esse valor, a descontinuidade é removida.',
              tex: `f(${k}) = ${gabarito} \;\\Rightarrow\; f \\text{ contínua}`,
            },
          ],
        },
        conceitos: ['continuidade.tipos', 'continuidade.definicao'],
        armadilhas: semColisoes(
          [
            {
              resposta: 0,
              diagnostico:
                'Atribuir zero não resolve: o limite vale 2k, e a continuidade exige que o ' +
                'valor no ponto seja exatamente o limite.',
              passo: 0,
              conceito: 'continuidade.definicao',
            },
            {
              resposta: k,
              diagnostico:
                'Depois de cancelar sobra x + k. Substituindo x por k o resultado é 2k.',
              passo: 2,
              conceito: 'continuidade.tipos',
            },
          ],
          gabarito,
          proximos,
        ),
        dica: nivel === 'facil' ? 'Calcule o limite: é esse o valor que falta.' : undefined,
      };
    }

    if (pergunta === 'tvi') {
      // x³ − k tem raiz entre dois inteiros consecutivos.
      const raizInteira = rng.inteiro(2, 5);
      const k = raizInteira ** 3 + rng.inteiro(1, raizInteira * 2);
      const gabarito = raizInteira;

      return {
        id: `cont-tvi-${k}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado:
          `Pelo teorema do valor intermediário, entre quais inteiros consecutivos está a raiz ` +
          `de f(x) = x³ − ${k}? Informe o MENOR deles.`,
        enunciadoTex: `f(x) = x^{3} - ${k}`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'Testamos valores inteiros até encontrar uma troca de sinal.',
              tex: `f(${raizInteira}) = ${raizInteira ** 3 - k} \\qquad f(${raizInteira + 1}) = ${(raizInteira + 1) ** 3 - k}`,
            },
            {
              descricao: 'A função é contínua e muda de sinal entre esses dois pontos.',
              tex: `f(${raizInteira}) < 0 < f(${raizInteira + 1})`,
            },
            {
              descricao: 'Pelo TVI, existe uma raiz no intervalo.',
              tex: `\\exists c \\in (${raizInteira},\; ${raizInteira + 1}) : f(c) = 0`,
              nota: 'O teorema garante que a raiz existe, sem precisar calculá-la.',
            },
          ],
        },
        conceitos: ['continuidade.tvi'],
        armadilhas: semColisoes(
          [
            {
              resposta: raizInteira + 1,
              diagnostico:
                'Esse é o extremo SUPERIOR do intervalo. O enunciado pede o menor dos dois ' +
                'inteiros consecutivos.',
              passo: 2,
              conceito: 'continuidade.tvi',
            },
          ],
          gabarito,
          proximos,
        ),
      };
    }

    // Função por partes: achar o valor de k que emenda as sentenças.
    const ponto = rng.inteiro(1, 5);
    const a = rng.inteiro(1, 4);
    const b = rng.inteiro(-5, 5);
    const c = rng.inteiro(1, 4);
    const gabarito = a * ponto + b - c * ponto;

    return {
      id: `cont-emenda-${ponto}${a}${b}${c}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: `Qual valor de k torna a função contínua em x = ${ponto}?`,
      enunciadoTex:
        `f(x) = \\begin{cases} ${a === 1 ? '' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)} & x < ${ponto} \\\\ ` +
        `${c === 1 ? '' : c}x + k & x \\geq ${ponto} \\end{cases}`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: 'A continuidade exige que os dois laterais coincidam.',
            tex: `\\lim_{x \\to ${ponto}^{-}} f(x) = \\lim_{x \\to ${ponto}^{+}} f(x)`,
          },
          {
            descricao: 'Calculamos cada lado com sua sentença.',
            tex: `${a}(${ponto}) ${b >= 0 ? '+' : '-'} ${Math.abs(b)} = ${c}(${ponto}) + k`,
          },
          {
            descricao: 'Isolando k.',
            tex: `${a * ponto + b} = ${c * ponto} + k \;\\Rightarrow\; k = ${gabarito}`,
          },
        ],
      },
      conceitos: ['continuidade.definicao', 'laterais.por-partes'],
      armadilhas: semColisoes(
        [
          {
            resposta: a * ponto + b,
            diagnostico:
              'Esse é o valor do limite pela esquerda, não o k. Falta subtrair a parte da ' +
              'segunda sentença que já depende de x.',
            passo: 2,
            conceito: 'continuidade.definicao',
          },
          {
            resposta: -gabarito,
            diagnostico: 'Sinal trocado ao isolar k. Confira a passagem do termo para o outro lado.',
            passo: 2,
            conceito: 'continuidade.definicao',
          },
        ],
        gabarito,
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
    Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 }),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['buraco', 'tvi']);
    case 'medio':
      return rng.escolher<Pergunta>(['buraco', 'valor-que-torna-continua', 'tvi']);
    case 'dificil':
      return rng.escolher<Pergunta>(['valor-que-torna-continua', 'buraco']);
  }
}
