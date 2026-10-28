import { Fracao } from '@core/math';
import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

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
  formatoResposta: 'um número ou fração, ex.: 3 ou -1/2',

  gerar(nivel: Nivel, rng: Rng): Exercicio<Fracao> {
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
          enunciado: 'Qual é a raiz da função, isto é, o valor de x em que ela se anula?',
          enunciadoTex: funcaoTex,
          gabarito,
          resolucao: {
            resultado: gabarito,
            passos: [
              { descricao: 'A raiz é o x que faz f(x) valer zero.', tex: `${a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)} = 0` },
              { descricao: 'Isolamos o termo com x.', tex: `${a}x = ${-b}` },
              { descricao: 'Dividimos pelo coeficiente de x.', tex: `x = ${gabarito.paraTex()}` },
              {
                descricao: 'É o ponto em que a reta cruza o eixo horizontal.',
                tex: `\\left(${gabarito.paraTex()},\; 0\\right)`,
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
          enunciado: 'Qual é a taxa de variação da função, ou seja, quanto y muda quando x avança 1?',
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
              { descricao: `Substituímos x por ${x}.`, tex: `f(${x}) = ${a}(${x}) ${b >= 0 ? '+' : '-'} ${Math.abs(b)}` },
              { descricao: 'Efetuamos o produto.', tex: `= ${a * x} ${b >= 0 ? '+' : '-'} ${Math.abs(b)}` },
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
        };
      }
    }
  },

  analisar: (entrada) => Fracao.analisar(entrada),
  saoEquivalentes,
  formatar: (valor) => valor.toString(),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['valor', 'raiz']);
    case 'medio':
      return rng.escolher<Pergunta>(['raiz', 'taxa', 'valor']);
    case 'dificil':
      return rng.escolher<Pergunta>(['raiz', 'taxa']);
  }
}

function sortearCoeficiente(nivel: Nivel, rng: Rng): number {
  if (nivel === 'facil') {
    return rng.inteiro(1, 5);
  }
  const valor = rng.inteiro(2, 9) * rng.sinal();
  return valor === 0 ? 2 : valor;
}
