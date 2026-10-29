import { Polinomio } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.01;

type Pergunta = 'coeficiente' | 'valor-primitiva' | 'constante';

/**
 * Exercícios de integral indefinida.
 *
 * Pedimos coeficientes ou valores da primitiva, para manter a resposta
 * numérica sem perder o foco na regra da potência invertida.
 */
export const geradorIndefinida: GeradorExercicio<number> = {
  topicoId: 'integral-indefinida',
  formatoResposta: 'um número, ex.: 3 ou 0,5',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pergunta = sortearPergunta(nivel, rng);

    // Integrando: ax² + bx + c
    const a = rng.inteiro(1, 6);
    const b = rng.inteiro(-6, 6);
    const c = rng.inteiro(-5, 5);

    const integrando = Polinomio.de(c, b, a);
    const primitiva = integrando.integrar(0);

    if (pergunta === 'constante') {
      const condicao = rng.inteiro(-6, 6);
      const ponto = rng.inteiro(0, 3);
      // F(ponto) = condicao  =>  C = condicao − primitiva(ponto)
      const gabarito = condicao - primitiva.avaliar(ponto);

      return {
        id: `indef-const-${a}${b}${c}-${ponto}${condicao}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: `Qual é o valor da constante C, sabendo que F(${ponto}) = ${condicao}?`,
        enunciadoTex: `F(x) = \\int \\left(${integrando.paraTex()}\\right) dx`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'Integramos termo a termo, mantendo a constante.',
              tex: `F(x) = ${primitiva.paraTex()} + C`,
            },
            {
              descricao: `Usamos a condição F(${ponto}) = ${condicao}.`,
              tex: `${primitiva.avaliar(ponto)} + C = ${condicao}`,
            },
            { descricao: 'Isolando C.', tex: `C = ${gabarito}` },
          ],
        },
        conceitos: ['indefinida.constante', 'indefinida.antiderivada'],
        armadilhas: semColisoes(
          [
            {
              resposta: condicao,
              diagnostico:
                'Esse é o valor de F no ponto, não da constante. É preciso subtrair o que a ' +
                'primitiva já vale ali.',
              passo: 2,
              conceito: 'indefinida.constante',
            },
            {
              resposta: 0,
              diagnostico:
                'A constante só seria zero se a primitiva já batesse com a condição. Aqui ' +
                'ela vale outra coisa no ponto, e C corrige a diferença.',
              passo: 1,
              conceito: 'indefinida.constante',
            },
          ],
          gabarito,
          proximos,
        ),
      };
    }

    if (pergunta === 'valor-primitiva') {
      const ponto = rng.inteiro(1, 4);
      const gabarito = primitiva.avaliar(ponto);

      return {
        id: `indef-valor-${a}${b}${c}-${ponto}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: `Tomando C = 0, qual é o valor de F(${ponto})?`,
        enunciadoTex: `F(x) = \\int \\left(${integrando.paraTex()}\\right) dx`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'Pela regra da potência invertida, o expoente sobe e divide.',
              tex: `F(x) = ${primitiva.paraTex()}`,
            },
            { descricao: `Avaliando em x = ${ponto}.`, tex: `F(${ponto}) = ${gabarito}` },
          ],
        },
        conceitos: ['indefinida.antiderivada'],
        armadilhas: semColisoes(
          [
            {
              resposta: integrando.avaliar(ponto),
              diagnostico:
                'Esse é o valor do INTEGRANDO, não da primitiva. Falta integrar antes de ' +
                'substituir.',
              passo: 0,
              conceito: 'indefinida.antiderivada',
            },
            {
              resposta: integrando.derivar().avaliar(ponto),
              diagnostico:
                'Você derivou em vez de integrar. Na integral o expoente SOBE e divide-se ' +
                'por ele; na derivada ele desce multiplicando.',
              passo: 0,
              conceito: 'indefinida.antiderivada',
            },
          ],
          gabarito,
          proximos,
        ),
        dica: nivel === 'facil' ? 'Aumente cada expoente em 1 e divida pelo novo expoente.' : undefined,
      };
    }

    // Coeficiente do termo de maior grau da primitiva.
    const gabarito = primitiva.coeficiente(3);

    return {
      id: `indef-coef-${a}${b}${c}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: 'Integre e informe o coeficiente de x³ na primitiva.',
      enunciadoTex: `\\int \\left(${integrando.paraTex()}\\right) dx`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: 'O termo em x² gera o termo em x³.',
            tex: `\\int ${a}x^{2}\\,dx = \\frac{${a}}{3}x^{3}`,
          },
          {
            descricao: 'O coeficiente é o original dividido pelo novo expoente.',
            tex: `\\frac{${a}}{3} = ${gabarito}`,
          },
        ],
      },
      conceitos: ['indefinida.antiderivada', 'indefinida.propriedades'],
      armadilhas: semColisoes(
        [
          {
            resposta: a,
            diagnostico:
              'Faltou dividir pelo novo expoente. A regra é xⁿ⁺¹/(n+1): o coeficiente é ' +
              'dividido por 3 ao subir de x² para x³.',
            passo: 1,
            conceito: 'indefinida.antiderivada',
          },
          {
            resposta: a * 3,
            diagnostico:
              'Você multiplicou pelo expoente, o que é a regra da DERIVADA. Na integral, ' +
              'divide-se.',
            passo: 1,
            conceito: 'indefinida.antiderivada',
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
    Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 }),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['coeficiente', 'valor-primitiva']);
    case 'medio':
      return rng.escolher<Pergunta>(['valor-primitiva', 'constante', 'coeficiente']);
    case 'dificil':
      return rng.escolher<Pergunta>(['constante', 'valor-primitiva']);
  }
}
