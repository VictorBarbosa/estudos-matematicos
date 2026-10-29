import { Polinomio } from '@core/math';
import { Rng } from '@core/treino/rng';
import {
  Simbolica,
  analisarSimbolica,
  simbolica,
  simbolicasEquivalentes,
  texParaTexto,
} from '@core/treino/resposta-simbolica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

type Pergunta = 'polinomio' | 'produto' | 'coeficiente' | 'expressao';

/**
 * Um número como resposta simbólica: a função constante.
 *
 * Assim as perguntas que pedem um valor — f′(2), um coeficiente — convivem no
 * mesmo tópico com a que pede a expressão da derivada, que é a pergunta de
 * prova de verdade.
 */
function constante(valor: number): Simbolica {
  return simbolica(
    Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 }),
    () => valor,
  );
}

const proximos = simbolicasEquivalentes;

/** Exercícios das regras de derivação. */
export const geradorRegras: GeradorExercicio<Simbolica> = {
  topicoId: 'regras-de-derivacao',
  formatoResposta: 'um número ou uma expressão em x, ex.: 12 ou 6x^2 - 4x + 1',

  gerar(nivel: Nivel, rng: Rng): Exercicio<Simbolica> {
    const pergunta = sortearPergunta(nivel, rng);

    if (pergunta === 'produto') {
      // f = (ax + b)(cx + d). A derivada no ponto sai da regra do produto.
      const [a, b, c, d] = [
        rng.inteiro(1, 4),
        rng.inteiro(-5, 5),
        rng.inteiro(1, 4),
        rng.inteiro(-5, 5),
      ];
      const ponto = rng.inteiro(-3, 4);

      // (fg)' = f'g + fg' = a(cx+d) + (ax+b)c
      const valor = a * (c * ponto + d) + (a * ponto + b) * c;
      const gabarito = constante(valor);

      return {
        id: `regras-produto-${a}${b}${c}${d}-${ponto}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: `Use a regra do produto e calcule f'(${ponto}).`,
        enunciadoTex:
          `f(x) = \\left(${a === 1 ? '' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}\\right)` +
          `\\left(${c === 1 ? '' : c}x ${d >= 0 ? '+' : '-'} ${Math.abs(d)}\\right)`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'A regra do produto tem DOIS termos.',
              tex: "(fg)' = f'g + fg'",
            },
            {
              descricao: 'As derivadas de cada fator são os próprios coeficientes de x.',
              tex: `f' = ${a} \\qquad g' = ${c}`,
            },
            {
              descricao: `Avaliando tudo em x = ${ponto}.`,
              tex: `${a}(${c * ponto + d}) + (${a * ponto + b})(${c}) = ${valor}`,
            },
          ],
        },
        conceitos: ['regras.produto'],
        armadilhas: semColisoes(
          [
            {
              resposta: constante(a * c),
              diagnostico:
                'A derivada de um produto NÃO é o produto das derivadas. Teste com x·x: a ' +
                'derivada é 2x, e não 1·1 = 1.',
              passo: 0,
              conceito: 'regras.produto',
            },
            {
              resposta: constante(a * (c * ponto + d)),
              diagnostico:
                'Você escreveu só o primeiro termo da regra. Falta somar f·g′, que trata da ' +
                'variação do segundo fator.',
              passo: 2,
              conceito: 'regras.produto',
            },
          ],
          gabarito,
          proximos,
        ),
        dica: nivel === 'facil' ? 'Derive um fator por vez, mantendo o outro.' : undefined,
      };
    }

    const grau3 = nivel !== 'facil';
    const p = grau3
      ? Polinomio.de(rng.inteiro(-6, 6), rng.inteiro(-5, 5), rng.inteiro(-4, 4), rng.inteiro(1, 3))
      : Polinomio.de(rng.inteiro(-6, 6), rng.inteiro(-5, 5), rng.inteiro(1, 4));

    const derivada = p.derivar();

    if (pergunta === 'coeficiente') {
      const coeficiente = derivada.coeficiente(1);
      const gabarito = constante(coeficiente);

      return {
        id: `regras-coef-${p.paraTex()}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: 'Derive e informe o coeficiente de x na derivada.',
        enunciadoTex: `f(x) = ${p.paraTex()}`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            { descricao: 'Aplicamos a regra da potência a cada termo.', tex: "\\frac{d}{dx}(x^{n}) = nx^{n-1}" },
            { descricao: 'A derivada completa.', tex: `f'(x) = ${derivada.paraTex()}` },
            { descricao: 'O coeficiente de x é o pedido.', tex: `${coeficiente}` },
          ],
        },
        conceitos: ['regras.potencia'],
        armadilhas: semColisoes(
          [
            {
              resposta: constante(p.coeficiente(1)),
              diagnostico:
                'Esse é o coeficiente de x na função ORIGINAL. Depois de derivar, o termo em ' +
                'x vem do termo em x² da função.',
              passo: 1,
              conceito: 'regras.potencia',
            },
          ],
          gabarito,
          proximos,
        ),
      };
    }

    if (pergunta === 'expressao') {
      const gabarito = simbolica(derivada.paraTex(), (x) => derivada.avaliar(x));

      return {
        id: `regras-expr-${p.paraTex()}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: "Derive e escreva f'(x) — a expressão inteira, não um valor.",
        enunciadoTex: `f(x) = ${p.paraTex()}`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'Pela regra da potência, o expoente desce e diminui em um.',
              tex: '\\frac{d}{dx}(ax^{n}) = nax^{n-1}',
            },
            {
              descricao: 'Termo a termo, e a constante desaparece.',
              tex: `f'(x) = ${derivada.paraTex()}`,
            },
          ],
        },
        conceitos: ['regras.potencia'],
        armadilhas: semColisoes(
          [
            {
              resposta: simbolica(p.paraTex(), (x) => p.avaliar(x)),
              diagnostico: 'Essa é a função original: ela não foi derivada.',
              passo: 0,
              conceito: 'regras.potencia',
            },
            {
              // Desceu o expoente mas não o diminuiu.
              resposta: (() => {
                const semBaixar = Polinomio.deGraus(
                  Object.fromEntries(
                    p.coeficientes
                      .map((coeficiente, grau) => [grau, coeficiente * grau] as const)
                      .filter(([, valor]) => valor !== 0),
                  ),
                );
                return simbolica(semBaixar.paraTex(), (x) => semBaixar.avaliar(x));
              })(),
              diagnostico:
                'O expoente desce como fator E diminui em um: de x³ sai 3x², não 3x³.',
              passo: 0,
              conceito: 'regras.potencia',
            },
            {
              // Derivou os expoentes mas manteve o termo constante.
              resposta: (() => {
                const comConstante = derivada.somar(Polinomio.de(p.coeficiente(0)));
                return simbolica(comConstante.paraTex(), (x) => comConstante.avaliar(x));
              })(),
              diagnostico:
                'O termo constante some ao derivar: ele não varia, então sua derivada é zero.',
              passo: 1,
              conceito: 'regras.potencia',
            },
          ],
          gabarito,
          proximos,
        ),
        dica:
          nivel === 'medio'
            ? 'Derive um termo por vez; a soma das derivadas é a derivada da soma.'
            : undefined,
      };
    }

    const ponto = rng.inteiro(-3, 4);
    const valorNoPonto = derivada.avaliar(ponto);
    const gabarito = constante(valorNoPonto);

    return {
      id: `regras-poli-${p.paraTex()}-${ponto}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: `Derive e calcule f'(${ponto}).`,
      enunciadoTex: `f(x) = ${p.paraTex()}`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: 'Pela regra da potência, o expoente desce e diminui em um.',
            tex: `f'(x) = ${derivada.paraTex()}`,
          },
          {
            descricao: 'A constante desaparece: ela não varia.',
            tex: `\\frac{d}{dx}(${p.coeficiente(0)}) = 0`,
          },
          { descricao: `Avaliando em x = ${ponto}.`, tex: `f'(${ponto}) = ${valorNoPonto}` },
        ],
      },
      conceitos: ['regras.potencia'],
      armadilhas: semColisoes(
        [
          {
            resposta: constante(p.avaliar(ponto)),
            diagnostico: 'Esse é o valor da função, não da derivada.',
            passo: 0,
            conceito: 'regras.potencia',
          },
          {
            resposta: constante(derivada.avaliar(ponto) + p.coeficiente(0)),
            diagnostico:
              'O termo constante some ao derivar — ele não varia, então sua derivada é zero.',
            passo: 1,
            conceito: 'regras.potencia',
          },
        ],
        gabarito,
        proximos,
      ),
    };
  },

  analisar: analisarSimbolica,

  // A comparação é por valor da função, não por texto: `6x + 4`, `4 + 6x` e
  // `2(3x + 2)` são a mesma derivada.
  saoEquivalentes: simbolicasEquivalentes,
  formatar: (valor) => texParaTexto(valor.tex),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['polinomio', 'coeficiente', 'expressao']);
    case 'medio':
      return rng.escolher<Pergunta>(['polinomio', 'produto', 'coeficiente', 'expressao']);
    case 'dificil':
      return rng.escolher<Pergunta>(['produto', 'polinomio', 'expressao', 'expressao']);
  }
}
