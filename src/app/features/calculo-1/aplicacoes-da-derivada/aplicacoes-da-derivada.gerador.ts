import { Polinomio } from '@core/math';
import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.01;

type Pergunta = 'ponto-critico' | 'valor-maximo' | 'otimizacao';

/** Exercícios de aplicação da derivada: extremos e otimização. */
export const geradorAplicacoesDerivada: GeradorExercicio<number> = {
  topicoId: 'aplicacoes-da-derivada',
  formatoResposta: 'um número, ex.: 25',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pergunta = sortearPergunta(nivel, rng);

    if (pergunta === 'otimizacao') {
      // Perímetro fixo: a área máxima é do quadrado de lado P/4.
      const perimetro = rng.inteiro(5, 80) * 4;
      const lado = perimetro / 4;
      const gabarito = lado * lado;

      return {
        id: `aplic-otim-${perimetro}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado:
          `Com ${perimetro} m de cerca, qual é a MAIOR área retangular que se pode cercar?`,
        enunciadoTex: `2x + 2y = ${perimetro} \\qquad A = xy`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'Usamos a restrição para escrever um lado em função do outro.',
              tex: `y = ${perimetro / 2} - x`,
            },
            {
              descricao: 'A área fica em função de uma única variável.',
              tex: `A(x) = x(${perimetro / 2} - x) = ${perimetro / 2}x - x^{2}`,
            },
            {
              descricao: 'Derivamos e igualamos a zero.',
              tex: `A'(x) = ${perimetro / 2} - 2x = 0 \;\\Rightarrow\; x = ${lado}`,
            },
            {
              descricao: 'A segunda derivada é negativa, confirmando o máximo.',
              tex: `A'' = -2 < 0`,
            },
            {
              descricao: 'A área máxima é a do quadrado.',
              tex: `A(${lado}) = ${lado} \\cdot ${lado} = ${gabarito}`,
            },
          ],
        },
        conceitos: ['aplic-derivada.otimizacao', 'aplic-derivada.extremos'],
        armadilhas: semColisoes(
          [
            {
              resposta: lado,
              diagnostico:
                'Esse é o LADO do retângulo ótimo. A pergunta é pela área, que é o produto ' +
                'dos dois lados.',
              passo: 2,
              conceito: 'aplic-derivada.otimizacao',
            },
            {
              resposta: perimetro,
              diagnostico:
                'Esse é o perímetro dado. A área é outra grandeza — o produto dos lados, não ' +
                'a soma deles.',
              passo: 1,
              conceito: 'aplic-derivada.otimizacao',
            },
          ],
          gabarito,
          proximos,
        ),
        dica: nivel === 'facil' ? 'Escreva a área em função de um lado só e derive.' : undefined,
      };
    }

    // f(x) = x³ − 3k²x tem pontos críticos em ±k.
    const k = rng.inteiro(1, 20);
    const p = Polinomio.de(0, -3 * k * k, 0, 1);
    const derivada = p.derivar();

    if (pergunta === 'valor-maximo') {
      // Máximo local em x = −k.
      const gabarito = p.avaliar(-k);

      return {
        id: `aplic-max-${k}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: 'Qual é o valor do MÁXIMO local desta função?',
        enunciadoTex: `f(x) = ${p.paraTex()}`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            { descricao: 'Derivamos e igualamos a zero.', tex: `f'(x) = ${derivada.paraTex()} = 0` },
            {
              descricao: 'Os pontos críticos são as raízes da derivada.',
              tex: `x = \\pm${k}`,
            },
            {
              descricao: 'A segunda derivada classifica cada um.',
              tex: `f''(x) = 6x \;\\Rightarrow\; f''(-${k}) < 0 \;\\text{(máximo)}`,
            },
            {
              descricao: 'Avaliamos a função no ponto de máximo.',
              tex: `f(-${k}) = ${gabarito}`,
            },
          ],
        },
        conceitos: ['aplic-derivada.extremos', 'aplic-derivada.concavidade'],
        armadilhas: semColisoes(
          [
            {
              resposta: -k,
              diagnostico:
                'Esse é o x onde ocorre o máximo, não o valor máximo. Falta substituir esse ' +
                'x de volta na função.',
              passo: 3,
              conceito: 'aplic-derivada.extremos',
            },
            {
              resposta: p.avaliar(k),
              diagnostico:
                'Esse é o valor do MÍNIMO local, em x = +k. O máximo ocorre do outro lado, ' +
                'onde a segunda derivada é negativa.',
              passo: 2,
              conceito: 'aplic-derivada.concavidade',
            },
          ],
          gabarito,
          proximos,
        ),
      };
    }

    const gabarito = k;

    return {
      id: `aplic-critico-${k}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: 'Esta função tem dois pontos críticos. Informe o MAIOR deles.',
      enunciadoTex: `f(x) = ${p.paraTex()}`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: 'Pontos críticos são onde a derivada se anula.',
            tex: `f'(x) = ${derivada.paraTex()} = 0`,
          },
          {
            descricao: 'Resolvendo a equação.',
            tex: `3x^{2} = ${3 * k * k} \;\\Rightarrow\; x = \\pm${k}`,
          },
          { descricao: 'O maior deles é o pedido.', tex: `x = ${k}` },
        ],
      },
      conceitos: ['aplic-derivada.extremos'],
      armadilhas: semColisoes(
        [
          {
            resposta: -k,
            diagnostico: 'Esse é o menor dos dois pontos críticos; o enunciado pede o maior.',
            passo: 2,
            conceito: 'aplic-derivada.extremos',
          },
          {
            resposta: 3 * k * k,
            diagnostico:
              'Você parou no valor de 3x². Falta dividir por 3 e extrair a raiz para chegar ' +
              'ao x.',
            passo: 1,
            conceito: 'aplic-derivada.extremos',
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
      return rng.escolher<Pergunta>(['ponto-critico', 'otimizacao']);
    case 'medio':
      return rng.escolher<Pergunta>(['ponto-critico', 'valor-maximo', 'otimizacao']);
    case 'dificil':
      return rng.escolher<Pergunta>(['valor-maximo', 'otimizacao']);
  }
}
