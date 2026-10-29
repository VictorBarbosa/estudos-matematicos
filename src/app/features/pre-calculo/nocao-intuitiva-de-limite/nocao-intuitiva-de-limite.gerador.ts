import { Rng } from '@core/treino/rng';
import { analisarNumero } from '@core/treino/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.01;

type Tipo = 'fatoravel' | 'continua' | 'diferenca-de-quadrados';

/**
 * Exercícios de limite por substituição e fatoração.
 *
 * O caso central é a indeterminação 0/0 que se resolve cancelando um fator —
 * é o primeiro contato com a ideia de que o limite ignora o ponto.
 */
export const geradorLimiteIntuitivo: GeradorExercicio<number> = {
  topicoId: 'nocao-intuitiva-de-limite',
  formatoResposta: 'um número, ex.: 4 ou -2,5',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const tipo = sortearTipo(nivel, rng);

    if (tipo === 'continua') {
      const a = rng.inteiro(1, 4);
      const b = rng.inteiro(-6, 6);
      const ponto = rng.inteiro(-3, 4);
      const gabarito = a * ponto * ponto + b;

      return {
        id: `limite-continua-${a}${b}-${ponto}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: 'Calcule o limite.',
        enunciadoTex: `\\lim_{x \\to ${ponto}} \\left(${a === 1 ? '' : a}x^{2} ${b >= 0 ? '+' : '-'} ${Math.abs(b)}\\right)`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'A função é contínua: basta substituir o ponto.',
              tex: `${a === 1 ? '' : a}(${ponto})^{2} ${b >= 0 ? '+' : '-'} ${Math.abs(b)}`,
            },
            { descricao: 'Calculando.', tex: `= ${gabarito}` },
            {
              descricao: 'Em funções contínuas, limite e valor no ponto coincidem.',
              tex: `\\lim_{x \\to ${ponto}} f(x) = f(${ponto}) = ${gabarito}`,
            },
          ],
        },
        conceitos: ['limite.intuicao'],
        armadilhas: semColisoes(
          [
            {
              resposta: a * 2 * ponto + b,
              diagnostico: 'x² foi tratado como 2x ao substituir o ponto.',
              passo: 0,
              conceito: 'limite.intuicao',
            },
          ],
          gabarito,
          proximos,
        ),
        dica: 'A função é contínua aqui — substitua direto.',
      };
    }

    if (tipo === 'diferenca-de-quadrados') {
      // (x² − k²)/(x − k) -> limite 2k
      const k = rng.inteiro(1, 8);
      const gabarito = 2 * k;

      return {
        id: `limite-difquad-${k}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: 'Calcule o limite. Atenção: a substituição direta dá 0/0.',
        enunciadoTex: `\\lim_{x \\to ${k}} \\frac{x^{2} - ${k * k}}{x - ${k}}`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'Substituindo direto, chegamos a uma indeterminação.',
              tex: `\\frac{${k}^{2} - ${k * k}}{${k} - ${k}} = \\frac{0}{0}`,
              nota: 'Isso não é um valor: é um aviso de que falta simplificar.',
            },
            {
              descricao: 'O numerador é uma diferença de quadrados.',
              tex: `\\frac{(x + ${k})(x - ${k})}{x - ${k}}`,
            },
            {
              descricao: 'Cancelamos o fator comum — legítimo, porque x nunca é exatamente o ponto.',
              tex: `= x + ${k}`,
            },
            {
              descricao: 'Agora a substituição funciona.',
              tex: `\\lim_{x \\to ${k}} (x + ${k}) = ${gabarito}`,
            },
          ],
        },
        conceitos: ['limite.indeterminacao', 'limite.intuicao'],
        armadilhas: semColisoes(
          [
            {
              resposta: 0,
              diagnostico:
                'A indeterminação 0/0 NÃO significa que o limite seja zero. Ela indica que a ' +
                'substituição direta não serve e a expressão precisa ser simplificada antes.',
              passo: 0,
              conceito: 'limite.indeterminacao',
            },
            {
              resposta: k,
              diagnostico:
                'Depois de cancelar sobra x + k, e substituindo x por k o resultado é 2k, ' +
                'não k.',
              passo: 3,
              conceito: 'limite.indeterminacao',
            },
          ],
          gabarito,
          proximos,
        ),
      };
    }

    // (x² + (p+q)x + pq)/(x + p) -> limite q − p... construímos por fatoração.
    const r1 = rng.inteiro(-6, 6);
    const r2 = rng.inteiro(-6, 6);
    const ponto = r1;
    const gabarito = r1 - r2;

    return {
      id: `limite-fatoravel-${r1}-${r2}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: 'Calcule o limite, simplificando a expressão primeiro.',
      enunciadoTex:
        `\\lim_{x \\to ${ponto}} \\frac{(x ${r1 >= 0 ? '-' : '+'} ${Math.abs(r1)})` +
        `(x ${r2 >= 0 ? '-' : '+'} ${Math.abs(r2)})}{x ${r1 >= 0 ? '-' : '+'} ${Math.abs(r1)}}`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: 'Substituir direto anula numerador e denominador.',
            tex: '\\frac{0}{0}',
          },
          {
            descricao: 'O mesmo fator aparece em cima e embaixo, e pode ser cancelado.',
            tex: `= x ${r2 >= 0 ? '-' : '+'} ${Math.abs(r2)}`,
            nota: 'O cancelamento vale para todo x diferente do ponto — e é só disso que o limite precisa.',
          },
          {
            descricao: 'Substituindo o ponto na expressão simplificada.',
            tex: `${ponto} ${r2 >= 0 ? '-' : '+'} ${Math.abs(r2)} = ${gabarito}`,
          },
        ],
      },
      conceitos: ['limite.indeterminacao'],
      armadilhas: semColisoes(
        [
          {
            resposta: 0,
            diagnostico:
              '0/0 é indeterminado, não zero. É preciso cancelar o fator comum antes de ' +
              'substituir.',
            passo: 0,
            conceito: 'limite.indeterminacao',
          },
          {
            resposta: r1 + r2,
            diagnostico:
              'Depois do cancelamento sobra (x − r₂). Substituindo x pelo ponto, o resultado ' +
              'é uma SUBTRAÇÃO, não uma soma.',
            passo: 2,
            conceito: 'limite.indeterminacao',
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

function sortearTipo(nivel: Nivel, rng: Rng): Tipo {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Tipo>(['continua', 'diferenca-de-quadrados']);
    case 'medio':
      return rng.escolher<Tipo>(['diferenca-de-quadrados', 'fatoravel', 'continua']);
    case 'dificil':
      return rng.escolher<Tipo>(['fatoravel', 'diferenca-de-quadrados']);
  }
}
