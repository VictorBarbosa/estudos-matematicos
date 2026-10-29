import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.02;

type Pergunta = 'raio' | 'centro-x' | 'posicao';

/** Exercícios de circunferência, sempre com centro e raio inteiros. */
export const geradorCircunferencia: GeradorExercicio<number> = {
  topicoId: 'circunferencia',
  formatoResposta: 'um número, ex.: 5',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pergunta = sortearPergunta(nivel, rng);

    const a = rng.inteiro(-6, 6);
    const b = rng.inteiro(-6, 6);
    const raio = rng.inteiro(1, 8);

    // Equação geral correspondente: D = -2a, E = -2b, F = a² + b² - r².
    const d = -2 * a;
    const e = -2 * b;
    const f = a * a + b * b - raio * raio;

    const geralTex =
      `x^{2} + y^{2} ${d >= 0 ? '+' : '-'} ${Math.abs(d)}x ` +
      `${e >= 0 ? '+' : '-'} ${Math.abs(e)}y ${f >= 0 ? '+' : '-'} ${Math.abs(f)} = 0`;

    if (pergunta === 'posicao') {
      // Um ponto a distância conhecida do centro: pedimos essa distância.
      const deslocamento = rng.inteiro(1, 10);
      const ponto = { x: a + deslocamento, y: b };
      const gabarito = deslocamento;

      return {
        id: `circunf-posicao-${a}${b}${raio}-${deslocamento}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado:
          `Qual é a distância do ponto (${ponto.x}, ${ponto.y}) ao centro desta circunferência?`,
        enunciadoTex: `(x ${a >= 0 ? '-' : '+'} ${Math.abs(a)})^{2} + (y ${b >= 0 ? '-' : '+'} ${Math.abs(b)})^{2} = ${raio * raio}`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'Lemos o centro na equação reduzida, trocando o sinal do parêntese.',
              tex: `C(${a},\\; ${b}) \\qquad r = ${raio}`,
            },
            {
              descricao: 'Calculamos a distância do ponto ao centro.',
              tex: `d = \\sqrt{(${ponto.x} - ${a})^{2} + (${ponto.y} - ${b})^{2}} = ${gabarito}`,
            },
            {
              descricao:
                gabarito < raio
                  ? 'Como d < r, o ponto está DENTRO da circunferência.'
                  : gabarito === raio
                    ? 'Como d = r, o ponto está SOBRE a circunferência.'
                    : 'Como d > r, o ponto está FORA da circunferência.',
              tex: `${gabarito} ${gabarito < raio ? '<' : gabarito === raio ? '=' : '>'} ${raio}`,
            },
          ],
        },
        conceitos: ['circunferencia.posicao', 'circunferencia.definicao'],
        armadilhas: semColisoes(
          [
            {
              resposta: raio,
              diagnostico:
                'Esse é o raio da circunferência, não a distância do ponto ao centro. São ' +
                'medidas diferentes — compará-las é justamente o que decide a posição.',
              passo: 1,
              conceito: 'circunferencia.posicao',
            },
          ],
          gabarito,
          proximos,
        ),
      };
    }

    if (pergunta === 'centro-x') {
      const gabarito = a;

      return {
        id: `circunf-centro-${a}${b}${raio}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: 'Qual é a abscissa do centro desta circunferência?',
        enunciadoTex: geralTex,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'Na forma geral, a abscissa do centro é menos a metade do coeficiente de x.',
              tex: `a = -\\frac{D}{2} = -\\frac{${d}}{2} = ${a}`,
            },
            {
              descricao: 'Completando o quadrado, o mesmo valor aparece no parêntese com sinal trocado.',
              tex: `\\left(x ${a >= 0 ? '-' : '+'} ${Math.abs(a)}\\right)^{2}`,
            },
          ],
        },
        conceitos: ['circunferencia.geral'],
        armadilhas: semColisoes(
          [
            {
              resposta: d,
              diagnostico:
                'Esse é o coeficiente D da equação geral. O centro é −D/2: falta dividir por ' +
                'dois e trocar o sinal.',
              passo: 0,
              conceito: 'circunferencia.geral',
            },
            {
              resposta: -a,
              diagnostico:
                'O sinal está trocado. Como a fórmula é a = −D/2, o sinal do centro é oposto ' +
                'ao do coeficiente.',
              passo: 0,
              conceito: 'circunferencia.geral',
            },
          ],
          gabarito,
          proximos,
        ),
        dica: nivel === 'facil' ? 'Use a = −D/2.' : undefined,
      };
    }

    const gabarito = raio;

    return {
      id: `circunf-raio-${a}${b}${raio}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: 'Qual é o raio desta circunferência?',
      enunciadoTex: nivel === 'facil'
        ? `(x ${a >= 0 ? '-' : '+'} ${Math.abs(a)})^{2} + (y ${b >= 0 ? '-' : '+'} ${Math.abs(b)})^{2} = ${raio * raio}`
        : geralTex,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos:
          nivel === 'facil'
            ? [
                {
                  descricao: 'Na forma reduzida, o lado direito é o raio AO QUADRADO.',
                  tex: `r^{2} = ${raio * raio}`,
                },
                { descricao: 'Extraímos a raiz.', tex: `r = ${raio}` },
              ]
            : [
                {
                  descricao: 'Primeiro achamos o centro.',
                  tex: `a = -\\frac{${d}}{2} = ${a} \\qquad b = -\\frac{${e}}{2} = ${b}`,
                },
                {
                  descricao: 'Depois usamos r² = a² + b² − F.',
                  tex: `r^{2} = ${a * a} + ${b * b} - (${f}) = ${raio * raio}`,
                },
                { descricao: 'Extraímos a raiz.', tex: `r = ${raio}` },
              ],
      },
      conceitos: nivel === 'facil' ? ['circunferencia.definicao'] : ['circunferencia.geral'],
      armadilhas: semColisoes(
        [
          {
            resposta: raio * raio,
            diagnostico:
              'Esse é r², o valor que aparece no lado direito da equação. O raio é a RAIZ ' +
              'quadrada dele.',
            passo: nivel === 'facil' ? 0 : 1,
            conceito: 'circunferencia.definicao',
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

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['raio', 'centro-x']);
    case 'medio':
      return rng.escolher<Pergunta>(['raio', 'centro-x', 'posicao']);
    case 'dificil':
      return rng.escolher<Pergunta>(['raio', 'posicao']);
  }
}
