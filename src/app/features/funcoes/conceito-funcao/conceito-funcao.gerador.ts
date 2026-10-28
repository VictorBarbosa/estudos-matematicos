import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 1e-9;

type Pergunta = 'imagem' | 'dominio-excluido' | 'avaliar';

/**
 * Exercícios sobre o conceito de função.
 *
 * Trabalham as três perguntas que o tema exige: avaliar, identificar o que
 * sai do domínio e reconhecer a imagem.
 */
export const geradorConceito: GeradorExercicio<number> = {
  topicoId: 'conceito-funcao',
  formatoResposta: 'um número, ex.: 3 ou -0,5',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pergunta = sortearPergunta(nivel, rng);

    if (pergunta === 'dominio-excluido') {
      // f(x) = 1/(x - k): o valor proibido é k.
      const k = rng.inteiro(-8, 8);
      const gabarito = k;

      return {
        id: `conceito-dominio-${k}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: 'Qual é o único valor de x que NÃO pertence ao domínio desta função?',
        enunciadoTex: `f(x) = \\frac{1}{x ${k >= 0 ? '-' : '+'} ${Math.abs(k)}}`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'O denominador de uma fração nunca pode ser zero.',
              tex: `x ${k >= 0 ? '-' : '+'} ${Math.abs(k)} \\neq 0`,
            },
            { descricao: 'Resolvemos a igualdade para achar o valor proibido.', tex: `x = ${k}` },
            {
              descricao: 'O domínio é todo o conjunto dos reais, menos esse ponto.',
              tex: `D = \\mathbb{R} - \\{${k}\\}`,
            },
          ],
        },
        conceitos: ['conceito.dominio'],
        armadilhas: semColisoes(
          [
            {
              resposta: -k,
              diagnostico:
                'O sinal está trocado. Para anular o denominador x − k, é preciso que x seja ' +
                'igual a +k, não a −k.',
              passo: 1,
              conceito: 'conceito.dominio',
            },
            {
              resposta: 0,
              diagnostico:
                'Zero só sairia do domínio se o denominador fosse o próprio x. Aqui há um ' +
                'deslocamento, e o valor proibido se desloca junto.',
              passo: 0,
              conceito: 'conceito.dominio',
            },
          ],
          gabarito,
          proximos,
        ),
        dica: nivel === 'facil' ? 'O que faria o denominador virar zero?' : undefined,
      };
    }

    if (pergunta === 'imagem') {
      // f(x) = x² + k: a imagem começa em k.
      const k = rng.inteiro(-8, 8);
      const gabarito = k;

      return {
        id: `conceito-imagem-${k}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: 'Qual é o MENOR valor que esta função pode assumir?',
        enunciadoTex: `f(x) = x^{2} ${k >= 0 ? '+' : '-'} ${Math.abs(k)}`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'Um quadrado nunca é negativo: seu menor valor possível é zero.',
              tex: 'x^{2} \\geq 0',
            },
            {
              descricao: 'Somando a constante aos dois lados da desigualdade.',
              tex: `x^{2} ${k >= 0 ? '+' : '-'} ${Math.abs(k)} \\geq ${k}`,
            },
            {
              descricao: 'O mínimo ocorre em x = 0, e a imagem começa nele.',
              tex: `\\operatorname{Im}(f) = [${k}, +\\infty)`,
            },
          ],
        },
        conceitos: ['conceito.dominio', 'conceito.definicao'],
        armadilhas: semColisoes(
          [
            {
              resposta: 0,
              diagnostico:
                'Zero é o menor valor de x², mas a função ainda soma uma constante depois. ' +
                'O mínimo da função inteira fica deslocado.',
              passo: 1,
              conceito: 'conceito.dominio',
            },
            {
              resposta: -k,
              diagnostico:
                'O sinal da constante está invertido. Ela é somada ao quadrado, então entra no ' +
                'mínimo com o próprio sinal.',
              passo: 1,
              conceito: 'conceito.dominio',
            },
          ],
          gabarito,
          proximos,
        ),
      };
    }

    const a = rng.inteiro(1, 4);
    const b = rng.inteiro(-8, 8);
    const x = rng.inteiro(-5, 5);
    const gabarito = a * x * x + b;

    return {
      id: `conceito-avaliar-${a}-${b}-${x}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: `Calcule f(${x}).`,
      enunciadoTex: `f(x) = ${a === 1 ? '' : a}x^{2} ${b >= 0 ? '+' : '-'} ${Math.abs(b)}`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: `Substituímos cada x por ${x}.`,
            tex: `f(${x}) = ${a === 1 ? '' : a}(${x})^{2} ${b >= 0 ? '+' : '-'} ${Math.abs(b)}`,
          },
          {
            descricao: 'Resolvemos a potência antes do produto.',
            tex: `= ${a === 1 ? '' : `${a} \\cdot `}${x * x} ${b >= 0 ? '+' : '-'} ${Math.abs(b)}`,
          },
          { descricao: 'E somamos.', tex: `= ${gabarito}` },
        ],
      },
      conceitos: ['conceito.definicao'],
      armadilhas: semColisoes(
        [
          {
            resposta: a * x * 2 + b,
            diagnostico:
              'x² foi tratado como 2x. Elevar ao quadrado é multiplicar x por ele mesmo, não ' +
              'por dois.',
            passo: 1,
            conceito: 'conceito.definicao',
          },
          {
            resposta: -(a * x * x) + b,
            diagnostico:
              'Um número negativo elevado ao quadrado dá resultado POSITIVO: os dois sinais ' +
              'se cancelam na multiplicação.',
            passo: 1,
            conceito: 'conceito.definicao',
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
    Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 }),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['avaliar', 'dominio-excluido']);
    case 'medio':
      return rng.escolher<Pergunta>(['avaliar', 'dominio-excluido', 'imagem']);
    case 'dificil':
      return rng.escolher<Pergunta>(['dominio-excluido', 'imagem']);
  }
}
