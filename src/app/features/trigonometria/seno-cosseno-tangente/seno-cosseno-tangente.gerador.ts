import { paraRadianos } from '@core/math';
import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.02;

type Pergunta = 'tangente' | 'complementar' | 'identidade';

/** Exercícios sobre as relações entre as três razões. */
export const geradorRazoes: GeradorExercicio<number> = {
  topicoId: 'seno-cosseno-tangente',
  formatoResposta: 'um número com até 2 casas, ex.: 0,58',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pergunta = sortearPergunta(nivel, rng);
    const graus = rng.escolher(
      nivel === 'facil' ? [30, 45, 60] : [15, 20, 30, 40, 45, 55, 60, 70, 75, 120, 135, 150],
    );
    const radianos = paraRadianos(graus);

    if (pergunta === 'complementar') {
      const gabarito = Math.cos(radianos);

      return {
        id: `razoes-complementar-${graus}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: `Sabendo que sen ${90 - graus}° vale isso, qual é o valor? (2 casas)`,
        enunciadoTex: `\\sin(90° - ${graus}°) = \;?`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'O seno do complemento é o cosseno do ângulo.',
              tex: `\\sin(90° - \\theta) = \\cos\\theta`,
            },
            {
              descricao: 'Aplicando ao nosso ângulo.',
              tex: `\\sin(90° - ${graus}°) = \\cos ${graus}° = ${gabarito.toFixed(4)}`,
            },
          ],
        },
        conceitos: ['razoes.complementares'],
        armadilhas: semColisoes(
          [
            {
              resposta: Math.sin(radianos),
              diagnostico:
                'Você manteve o seno. Em ângulos complementares, o seno de um vira o COSSENO ' +
                'do outro — é daí que vem o nome "co-seno".',
              passo: 0,
              conceito: 'razoes.complementares',
            },
          ],
          gabarito,
          proximos,
        ),
      };
    }

    if (pergunta === 'identidade') {
      // Dado o seno, achar o cosseno pela identidade fundamental.
      const seno = Math.sin(radianos);
      const gabarito = Math.cos(radianos);

      return {
        id: `razoes-identidade-${graus}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado:
          `Se sen θ = ${seno.toFixed(2)} e θ está no 1º quadrante, qual é cos θ? (2 casas)`,
        enunciadoTex: `\\sin\\theta = ${seno.toFixed(2)} \\qquad \\cos\\theta = \;?`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            { descricao: 'Usamos a identidade fundamental.', tex: '\\sin^{2}\\theta + \\cos^{2}\\theta = 1' },
            {
              descricao: 'Isolamos o cosseno.',
              tex: `\\cos^{2}\\theta = 1 - ${seno.toFixed(2)}^{2} = ${(1 - seno * seno).toFixed(4)}`,
            },
            {
              descricao: 'Extraímos a raiz, tomando o sinal do quadrante.',
              tex: `\\cos\\theta = ${gabarito.toFixed(4)}`,
              nota: 'No 1º quadrante o cosseno é positivo, então ficamos com a raiz positiva.',
            },
          ],
        },
        conceitos: ['razoes.relacao', 'triangulo.pitagoras'],
        armadilhas: semColisoes(
          [
            {
              resposta: 1 - seno,
              diagnostico:
                'A identidade envolve os QUADRADOS: cos²θ = 1 − sen²θ. Não basta subtrair o ' +
                'seno de 1; é preciso elevar ao quadrado antes e extrair a raiz depois.',
              passo: 1,
              conceito: 'razoes.relacao',
            },
            {
              resposta: 1 - seno * seno,
              diagnostico:
                'Esse é o valor de cos²θ. Falta extrair a raiz quadrada para chegar ao cosseno.',
              passo: 2,
              conceito: 'razoes.relacao',
            },
          ],
          gabarito,
          proximos,
        ),
      };
    }

    const gabarito = Math.tan(radianos);

    return {
      id: `razoes-tangente-${graus}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: `Qual é o valor de tg ${graus}°? (2 casas decimais)`,
      enunciadoTex: `\\tan ${graus}° = \;?`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          { descricao: 'A tangente é o quociente entre seno e cosseno.', tex: '\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}' },
          {
            descricao: 'Substituindo os valores.',
            tex: `\\frac{${Math.sin(radianos).toFixed(4)}}{${Math.cos(radianos).toFixed(4)}} = ${gabarito.toFixed(4)}`,
          },
        ],
      },
      conceitos: ['razoes.relacao', 'razoes.assintotas'],
      armadilhas: semColisoes(
        [
          {
            resposta: Math.cos(radianos) / Math.sin(radianos),
            diagnostico:
              'O quociente está invertido. A tangente é SENO sobre cosseno; o inverso dela ' +
              'chama-se cotangente.',
            passo: 0,
            conceito: 'razoes.relacao',
          },
          {
            resposta: Math.sin(radianos) * Math.cos(radianos),
            diagnostico:
              'A tangente é uma DIVISÃO entre seno e cosseno, não um produto.',
            passo: 0,
            conceito: 'razoes.relacao',
          },
        ],
        gabarito,
        proximos,
      ),
      dica: nivel === 'facil' ? 'Divida o seno pelo cosseno.' : undefined,
    };
  },

  analisar: (entrada) => {
    const limpo = entrada.trim().replace(/\s/g, '').replace(',', '.');
    return /^[+-]?\d*\.?\d+$/.test(limpo) ? Number(limpo) : null;
  },

  saoEquivalentes: proximos,
  formatar: (valor) => valor.toFixed(2).replace('.', ','),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['tangente', 'complementar']);
    case 'medio':
      return rng.escolher<Pergunta>(['tangente', 'complementar', 'identidade']);
    case 'dificil':
      return rng.escolher<Pergunta>(['identidade', 'tangente']);
  }
}
