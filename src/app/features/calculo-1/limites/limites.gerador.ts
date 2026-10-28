import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.01;

type Tipo = 'substituicao' | 'fatoracao' | 'conjugado' | 'infinito';

/** Exercícios de cálculo de limites, cobrindo as três técnicas principais. */
export const geradorLimites: GeradorExercicio<number> = {
  topicoId: 'limites',
  formatoResposta: 'um número, ex.: 6 ou 0,25',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const tipo = sortearTipo(nivel, rng);

    if (tipo === 'substituicao') {
      const a = rng.inteiro(1, 4);
      const b = rng.inteiro(-8, 8);
      const ponto = rng.inteiro(-3, 4);
      const gabarito = a * ponto * ponto + b * ponto;

      return {
        id: `lim-subst-${a}${b}-${ponto}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: 'Calcule o limite.',
        enunciadoTex: `\\lim_{x \\to ${ponto}} \\left(${a === 1 ? '' : a}x^{2} ${b >= 0 ? '+' : '-'} ${Math.abs(b)}x\\right)`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'O limite distribui sobre a soma e sobre o produto.',
              tex: `\\lim x^{2} \\cdot ${a} ${b >= 0 ? '+' : '-'} ${Math.abs(b)}\\lim x`,
            },
            {
              descricao: 'Como a função é contínua, substituímos direto.',
              tex: `${a}(${ponto})^{2} ${b >= 0 ? '+' : '-'} ${Math.abs(b)}(${ponto}) = ${gabarito}`,
            },
          ],
        },
        conceitos: ['limites.propriedades'],
        armadilhas: semColisoes(
          [
            {
              resposta: a * 2 * ponto + b * ponto,
              diagnostico: 'x² foi tratado como 2x na substituição.',
              passo: 1,
              conceito: 'limites.propriedades',
            },
          ],
          gabarito,
          proximos,
        ),
      };
    }

    if (tipo === 'conjugado') {
      // (√(x+k) − √k)/x -> 1/(2√k) quando x → 0
      const k = rng.escolher([1, 4, 9, 16, 25]);
      const gabarito = 1 / (2 * Math.sqrt(k));

      return {
        id: `lim-conj-${k}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: 'Calcule o limite, racionalizando o numerador. (3 casas decimais)',
        enunciadoTex: `\\lim_{x \\to 0} \\frac{\\sqrt{x + ${k}} - ${Math.sqrt(k)}}{x}`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            { descricao: 'A substituição direta dá 0/0.', tex: '\\frac{0}{0}' },
            {
              descricao: 'Multiplicamos numerador e denominador pelo conjugado.',
              tex: `\\frac{\\sqrt{x+${k}} - ${Math.sqrt(k)}}{x} \\cdot \\frac{\\sqrt{x+${k}} + ${Math.sqrt(k)}}{\\sqrt{x+${k}} + ${Math.sqrt(k)}}`,
            },
            {
              descricao: 'No numerador aparece uma diferença de quadrados, que simplifica.',
              tex: `\\frac{(x + ${k}) - ${k}}{x\\left(\\sqrt{x+${k}} + ${Math.sqrt(k)}\\right)} = \\frac{x}{x(\\ldots)}`,
            },
            {
              descricao: 'Cancelando o x e substituindo zero.',
              tex: `\\frac{1}{2\\sqrt{${k}}} = ${gabarito.toFixed(4)}`,
            },
          ],
        },
        conceitos: ['limites.tecnicas'],
        armadilhas: semColisoes(
          [
            {
              resposta: 0,
              diagnostico:
                'A indeterminação 0/0 não vale zero. Depois de racionalizar, o limite é ' +
                'perfeitamente finito e diferente de zero.',
              passo: 0,
              conceito: 'limites.tecnicas',
            },
            {
              resposta: 1 / Math.sqrt(k),
              diagnostico:
                'Faltou o fator 2 no denominador: ao substituir x = 0, as duas raízes do ' +
                'conjugado ficam iguais e se somam.',
              passo: 3,
              conceito: 'limites.tecnicas',
            },
          ],
          gabarito,
          proximos,
        ),
      };
    }

    if (tipo === 'infinito') {
      const a = rng.inteiro(1, 9);
      const b = rng.inteiro(1, 9);
      const gabarito = a / b;

      return {
        id: `lim-inf-${a}${b}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: 'Calcule o limite no infinito. (3 casas decimais)',
        enunciadoTex: `\\lim_{x \\to \\infty} \\frac{${a}x^{2} + ${rng.inteiro(1, 9)}x}{${b}x^{2} - ${rng.inteiro(1, 9)}}`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            { descricao: 'Substituir direto daria ∞/∞.', tex: '\\frac{\\infty}{\\infty}' },
            {
              descricao: 'Dividimos numerador e denominador por x², a maior potência.',
              tex: `\\frac{${a} + \\frac{\\ldots}{x}}{${b} - \\frac{\\ldots}{x^{2}}}`,
            },
            {
              descricao: 'Os termos com 1/x somem, sobrando os coeficientes líderes.',
              tex: `\\frac{${a}}{${b}} = ${gabarito.toFixed(4)}`,
            },
          ],
        },
        conceitos: ['limites.tecnicas'],
        armadilhas: semColisoes(
          [
            {
              resposta: b / a,
              diagnostico: 'A razão está invertida: é o coeficiente de cima sobre o de baixo.',
              passo: 2,
              conceito: 'limites.tecnicas',
            },
            {
              resposta: 1,
              diagnostico:
                '∞/∞ não vale 1. O resultado depende dos coeficientes dos termos dominantes.',
              passo: 0,
              conceito: 'limites.tecnicas',
            },
          ],
          gabarito,
          proximos,
        ),
      };
    }

    // Fatoração: (x³ − a³)/(x − a) -> 3a²
    const a = rng.inteiro(1, 5);
    const gabarito = 3 * a * a;

    return {
      id: `lim-fat-${a}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: 'Calcule o limite, fatorando o numerador.',
      enunciadoTex: `\\lim_{x \\to ${a}} \\frac{x^{3} - ${a ** 3}}{x - ${a}}`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          { descricao: 'A substituição direta dá 0/0.', tex: '\\frac{0}{0}' },
          {
            descricao: 'A diferença de cubos fatora com um fator (x − a).',
            tex: `x^{3} - ${a ** 3} = (x - ${a})(x^{2} + ${a}x + ${a * a})`,
          },
          {
            descricao: 'Cancelamos o fator comum.',
            tex: `= x^{2} + ${a}x + ${a * a}`,
          },
          {
            descricao: 'Agora substituímos o ponto.',
            tex: `${a * a} + ${a * a} + ${a * a} = ${gabarito}`,
          },
        ],
      },
      conceitos: ['limites.tecnicas', 'limites.propriedades'],
      armadilhas: semColisoes(
        [
          {
            resposta: 0,
            diagnostico: 'A indeterminação 0/0 não é zero: é um aviso de que falta fatorar.',
            passo: 0,
            conceito: 'limites.tecnicas',
          },
          {
            resposta: a * a,
            diagnostico:
              'Depois de cancelar sobram TRÊS termos, todos iguais a a² no ponto — o ' +
              'resultado é 3a², não a².',
            passo: 3,
            conceito: 'limites.tecnicas',
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

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 }),
};

function sortearTipo(nivel: Nivel, rng: Rng): Tipo {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Tipo>(['substituicao', 'fatoracao']);
    case 'medio':
      return rng.escolher<Tipo>(['fatoracao', 'infinito', 'substituicao']);
    case 'dificil':
      return rng.escolher<Tipo>(['conjugado', 'infinito', 'fatoracao']);
  }
}
