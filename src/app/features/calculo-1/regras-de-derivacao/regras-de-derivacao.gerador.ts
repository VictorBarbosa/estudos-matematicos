import { Polinomio } from '@core/math';
import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.01;

type Pergunta = 'polinomio' | 'produto' | 'coeficiente';

/** Exercícios das regras de derivação. */
export const geradorRegras: GeradorExercicio<number> = {
  topicoId: 'regras-de-derivacao',
  formatoResposta: 'um número, ex.: 12',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
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
      const gabarito = a * (c * ponto + d) + (a * ponto + b) * c;

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
              tex: `${a}(${c * ponto + d}) + (${a * ponto + b})(${c}) = ${gabarito}`,
            },
          ],
        },
        conceitos: ['regras.produto'],
        armadilhas: semColisoes(
          [
            {
              resposta: a * c,
              diagnostico:
                'A derivada de um produto NÃO é o produto das derivadas. Teste com x·x: a ' +
                'derivada é 2x, e não 1·1 = 1.',
              passo: 0,
              conceito: 'regras.produto',
            },
            {
              resposta: a * (c * ponto + d),
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
      const gabarito = derivada.coeficiente(1);

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
            { descricao: 'O coeficiente de x é o pedido.', tex: `${gabarito}` },
          ],
        },
        conceitos: ['regras.potencia'],
        armadilhas: semColisoes(
          [
            {
              resposta: p.coeficiente(1),
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

    const ponto = rng.inteiro(-3, 4);
    const gabarito = derivada.avaliar(ponto);

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
          { descricao: `Avaliando em x = ${ponto}.`, tex: `f'(${ponto}) = ${gabarito}` },
        ],
      },
      conceitos: ['regras.potencia'],
      armadilhas: semColisoes(
        [
          {
            resposta: p.avaliar(ponto),
            diagnostico: 'Esse é o valor da função, não da derivada.',
            passo: 0,
            conceito: 'regras.potencia',
          },
          {
            resposta: derivada.avaliar(ponto) + p.coeficiente(0),
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
      return rng.escolher<Pergunta>(['polinomio', 'coeficiente']);
    case 'medio':
      return rng.escolher<Pergunta>(['polinomio', 'produto', 'coeficiente']);
    case 'dificil':
      return rng.escolher<Pergunta>(['produto', 'polinomio']);
  }
}
