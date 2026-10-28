import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.01;

type Lado = 'esquerda' | 'direita';

/**
 * Exercícios de limites laterais em funções definidas por partes.
 *
 * A armadilha central é usar a sentença do lado errado — por isso o enunciado
 * sempre apresenta as duas.
 */
export const geradorLaterais: GeradorExercicio<number> = {
  topicoId: 'limites-laterais',
  formatoResposta: 'um número, ex.: 5',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const ponto = rng.inteiro(-3, 4);
    const lado: Lado = rng.booleano() ? 'esquerda' : 'direita';

    // Sentença da esquerda: ax + b. Da direita: cx + d.
    const a = rng.inteiro(1, 4);
    const b = rng.inteiro(-6, 6);
    const c = rng.inteiro(1, 4);
    // No nível fácil as sentenças emendam, para que o limite exista.
    const d = nivel === 'facil' ? a * ponto + b - c * ponto : rng.inteiro(-6, 6);

    const valorEsquerda = a * ponto + b;
    const valorDireita = c * ponto + d;
    const gabarito = lado === 'esquerda' ? valorEsquerda : valorDireita;

    const esquerdaTex = `${a === 1 ? '' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}`;
    const direitaTex = `${c === 1 ? '' : c}x ${d >= 0 ? '+' : '-'} ${Math.abs(d)}`;

    const existe = Math.abs(valorEsquerda - valorDireita) < 1e-9;

    return {
      id: `laterais-${ponto}-${lado}-${a}${b}${c}${d}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: `Calcule o limite pela ${lado} no ponto x = ${ponto}.`,
      enunciadoTex:
        `f(x) = \\begin{cases} ${esquerdaTex} & x < ${ponto} \\\\ ${direitaTex} & x \\geq ${ponto} \\end{cases}` +
        ` \\qquad \\lim_{x \\to ${ponto}^{${lado === 'esquerda' ? '-' : '+'}}} f(x) = \;?`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: `Pela ${lado}, x é ${lado === 'esquerda' ? 'MENOR' : 'MAIOR'} que o ponto.`,
            tex: `x ${lado === 'esquerda' ? '<' : '>'} ${ponto}`,
          },
          {
            descricao: 'Nessa região vale apenas uma das sentenças.',
            tex: `f(x) = ${lado === 'esquerda' ? esquerdaTex : direitaTex}`,
          },
          {
            descricao: 'Essa sentença é contínua, então basta substituir o ponto.',
            tex: `${lado === 'esquerda' ? a : c}(${ponto}) ${(lado === 'esquerda' ? b : d) >= 0 ? '+' : '-'} ${Math.abs(lado === 'esquerda' ? b : d)} = ${gabarito}`,
          },
          {
            descricao: existe
              ? 'Os dois laterais coincidem, então o limite comum existe.'
              : 'Os dois laterais discordam, então o limite comum NÃO existe.',
            tex: `${valorEsquerda} ${existe ? '=' : '\\neq'} ${valorDireita}`,
            nota: existe
              ? 'O gráfico emenda sem salto nesse ponto.'
              : 'Há um salto de altura ' + Math.abs(valorEsquerda - valorDireita) + ' no gráfico.',
          },
        ],
      },
      conceitos: ['laterais.definicao', 'laterais.por-partes'],
      armadilhas: semColisoes(
        [
          {
            resposta: lado === 'esquerda' ? valorDireita : valorEsquerda,
            diagnostico:
              `Você usou a sentença do lado errado. Pela ${lado}, x é ` +
              `${lado === 'esquerda' ? 'menor' : 'maior'} que ${ponto}, então vale a outra ` +
              'sentença do sistema.',
            passo: 1,
            conceito: 'laterais.por-partes',
          },
        ],
        gabarito,
        proximos,
      ),
      dica:
        nivel === 'facil'
          ? 'Veja qual das duas sentenças vale do lado pedido.'
          : undefined,
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
