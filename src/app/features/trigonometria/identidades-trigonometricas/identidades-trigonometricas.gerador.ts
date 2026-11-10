import { paraRadianos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { anguloAgudo } from '@core/treino/sorteio/sorteio';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.02;

type Pergunta = 'fundamental' | 'soma' | 'arco-duplo';

/**
 * Exercícios de identidades trigonométricas.
 *
 * A armadilha principal é sempre a mesma e vale para todas as fórmulas:
 * distribuir a função sobre a soma, como se sen(a+b) fosse sen a + sen b.
 */
export const geradorIdentidades: GeradorExercicio<number> = {
  topicoId: 'identidades-trigonometricas',
  formatoResposta: 'um número com até 2 casas, ex.: 0,87',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pergunta = sortearPergunta(nivel, rng);

    if (pergunta === 'fundamental') {
      const graus = anguloAgudo(rng, nivel);
      const seno = Math.sin(paraRadianos(graus));
      const gabarito = Math.cos(paraRadianos(graus));

      return {
        id: `identidades-fundamental-${graus}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: `Se sen θ = ${seno.toFixed(2)} com θ no 1º quadrante, quanto vale cos θ?`,
        enunciadoTex: `\\sin\\theta = ${seno.toFixed(2)} \\quad \\Rightarrow \\quad \\cos\\theta = \\;?`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'Partimos da identidade fundamental.',
              tex: '\\sin^{2}\\theta + \\cos^{2}\\theta = 1',
            },
            {
              descricao: 'Isolamos o cosseno ao quadrado.',
              tex: `\\cos^{2}\\theta = 1 - (${seno.toFixed(2)})^{2} = ${(1 - seno * seno).toFixed(4)}`,
            },
            {
              descricao: 'Extraímos a raiz com o sinal do quadrante.',
              tex: `\\cos\\theta = ${gabarito.toFixed(4)}`,
            },
          ],
        },
        conceitos: ['identidades.fundamental'],
        armadilhas: semColisoes(
          [
            {
              resposta: 1 - seno,
              diagnostico:
                'A identidade relaciona os QUADRADOS das razões. Subtrair o seno de 1 pularia ' +
                'tanto o quadrado quanto a raiz.',
              passo: 1,
              conceito: 'identidades.fundamental',
            },
            {
              resposta: 1 - seno * seno,
              diagnostico: 'Esse é cos²θ. Falta extrair a raiz quadrada.',
              passo: 2,
              conceito: 'identidades.fundamental',
            },
          ],
          gabarito,
          proximos,
        ),
        dica:
          nivel === 'facil'
            ? `Use sen²θ + cos²θ = 1: cos θ é a raiz de 1 − (${seno.toFixed(2).replace('.', ',')})², positiva no 1º quadrante.`
            : undefined,
      };
    }

    if (pergunta === 'arco-duplo') {
      // Arco duplo: o ângulo vai até 44° para que 2θ fique agudo.
      /*
       * O dobro passa de 90° e o seno começa a descer — o que o nível extremo
       * cobra. A faixa de 43° a 47° fica de fora: ali 2θ encosta em 90° e a
       * resposta arredonda para 1,00, que não exercita nada.
       */
      const bruto = rng.inteiro(5, 84);
      const graus = bruto >= 43 ? bruto + 5 : bruto;
      const radianos = paraRadianos(graus);
      const gabarito = Math.sin(2 * radianos);

      return {
        id: `identidades-duplo-${graus}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: `Use a fórmula do arco duplo para calcular sen ${2 * graus}°.`,
        enunciadoTex: `\\sin ${2 * graus}° = \\;?`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'A fórmula do arco duplo para o seno.',
              tex: '\\sin 2a = 2\\sin a\\cos a',
            },
            {
              descricao: `Com a = ${graus}°.`,
              tex: `2 \\cdot ${Math.sin(radianos).toFixed(4)} \\cdot ${Math.cos(radianos).toFixed(4)}`,
            },
            { descricao: 'Calculando.', tex: `= ${gabarito.toFixed(4)}` },
          ],
        },
        conceitos: ['identidades.arco-duplo', 'identidades.soma'],
        armadilhas: semColisoes(
          [
            {
              resposta: 2 * Math.sin(radianos),
              diagnostico:
                'sen 2a NÃO é 2·sen a. O "2" multiplica o ÂNGULO, e dobrar o ângulo não dobra ' +
                'o seno — a fórmula correta é 2·sen a·cos a.',
              passo: 0,
              conceito: 'identidades.arco-duplo',
            },
            {
              resposta: Math.sin(radianos) * Math.cos(radianos),
              diagnostico: 'Faltou o fator 2 da fórmula: sen 2a = 2·sen a·cos a.',
              passo: 1,
              conceito: 'identidades.arco-duplo',
            },
          ],
          gabarito,
          proximos,
        ),
        dica:
          nivel === 'medio'
            ? `sen ${2 * graus}° = sen(2 · ${graus}°) = 2 · sen ${graus}° · cos ${graus}°. Calcule seno e cosseno de ${graus}° e multiplique.`
            : undefined,
      };
    }

    // Soma de arcos, com ângulos notáveis.
    const a = rng.inteiro(5, 80);
    const b = rng.inteiro(5, 80);
    const radA = paraRadianos(a);
    const radB = paraRadianos(b);
    const gabarito = Math.sin(radA + radB);

    return {
      id: `identidades-soma-${a}-${b}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: `Calcule sen(${a}° + ${b}°) usando a fórmula da soma de arcos.`,
      enunciadoTex: `\\sin(${a}° + ${b}°) = \\;?`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: 'A fórmula da soma mistura senos e cossenos dos dois ângulos.',
            tex: '\\sin(a + b) = \\sin a\\cos b + \\cos a\\sin b',
          },
          {
            descricao: 'Substituindo os valores.',
            tex:
              `${Math.sin(radA).toFixed(4)} \\cdot ${Math.cos(radB).toFixed(4)} + ` +
              `${Math.cos(radA).toFixed(4)} \\cdot ${Math.sin(radB).toFixed(4)}`,
          },
          { descricao: 'Somando.', tex: `= ${gabarito.toFixed(4)}` },
        ],
      },
      conceitos: ['identidades.soma'],
      armadilhas: semColisoes(
        [
          {
            resposta: Math.sin(radA) + Math.sin(radB),
            diagnostico:
              'O seno NÃO se distribui sobre a soma: sen(a+b) ≠ sen a + sen b. Um ' +
              'contraexemplo imediato é sen(30°+60°) = 1, enquanto sen30° + sen60° ≈ 1,37.',
            passo: 0,
            conceito: 'identidades.soma',
          },
          {
            resposta: Math.sin(radA) * Math.cos(radB) - Math.cos(radA) * Math.sin(radB),
            diagnostico:
              'O sinal do meio está invertido: essa é a fórmula da DIFERENÇA de arcos. Na ' +
              'soma do seno, as duas parcelas se somam.',
            passo: 1,
            conceito: 'identidades.soma',
          },
        ],
        gabarito,
        proximos,
      ),
      dica: nivel === 'facil' ? 'Cuidado: o seno não se distribui sobre a soma.' : undefined,
    };
  },

  analisar: analisarNumero,

  saoEquivalentes: proximos,
  formatar: (valor) => valor.toFixed(2).replace('.', ','),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['fundamental', 'soma']);
    case 'medio':
      return rng.escolher<Pergunta>(['fundamental', 'soma', 'arco-duplo']);
    case 'dificil':
      return rng.escolher<Pergunta>(['soma', 'arco-duplo']);
    // O arco duplo é a identidade que se deduz da soma: duas em uma.
    case 'extremo':
      return 'arco-duplo';
  }
}
