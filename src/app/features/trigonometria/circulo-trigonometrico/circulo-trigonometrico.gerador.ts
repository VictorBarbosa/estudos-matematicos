import { paraRadianos, quadrante } from '@core/math';
import { Rng } from '@core/treino/rng';
import { anguloNaVolta } from '@core/treino/sorteio';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.02;

type Pergunta = 'quadrante' | 'sinal' | 'valor' | 'radianos';

/**
 * Exercícios do círculo trigonométrico.
 *
 * O foco é o que o triângulo retângulo não cobre: ângulos além de 90°, os
 * sinais que deles decorrem e a medida em radianos.
 */
export const geradorCirculo: GeradorExercicio<number> = {
  topicoId: 'circulo-trigonometrico',
  formatoResposta: 'um número, ex.: 3 ou -0,87',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pergunta = sortearPergunta(nivel, rng);
    const graus = sortearAngulo(nivel, rng);

    if (pergunta === 'quadrante') {
      const gabarito = quadrante(graus);

      return {
        id: `circulo-quadrante-${graus}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: 'Em qual quadrante está este ângulo? Responda com 1, 2, 3 ou 4.',
        enunciadoTex: `\\theta = ${graus}°`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'Reduzimos o ângulo à primeira volta.',
              tex: `${graus}° \\equiv ${((graus % 360) + 360) % 360}°`,
            },
            {
              descricao: 'Cada quadrante ocupa 90°.',
              tex: '1º: 0°–90° \\quad 2º: 90°–180° \\quad 3º: 180°–270° \\quad 4º: 270°–360°',
            },
            { descricao: 'Logo o ângulo cai no quadrante.', tex: `${gabarito}º` },
          ],
        },
        conceitos: ['circulo.quadrantes'],
        armadilhas: semColisoes(
          [
            {
              resposta: gabarito === 4 ? 1 : gabarito + 1,
              diagnostico:
                'Os quadrantes são contados no sentido anti-horário a partir do eixo x ' +
                'positivo, em faixas de 90°. Confira a redução à primeira volta.',
              passo: 1,
              conceito: 'circulo.quadrantes',
            },
          ],
          gabarito,
          proximos,
        ),
        dica: nivel === 'facil' ? 'Entre quais múltiplos de 90° o ângulo está?' : undefined,
      };
    }

    if (pergunta === 'radianos') {
      const gabarito = paraRadianos(graus);

      return {
        id: `circulo-radianos-${graus}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: `Converta ${graus}° para radianos. (2 casas decimais)`,
        enunciadoTex: `${graus}° = \;?\\text{ rad}`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            { descricao: 'Usamos a proporção com a volta completa.', tex: '180° = \\pi \\text{ rad}' },
            {
              descricao: 'Multiplicamos os graus por π/180.',
              tex: `${graus} \\cdot \\frac{\\pi}{180} = ${gabarito.toFixed(4)}`,
            },
          ],
        },
        conceitos: ['circulo.radianos'],
        armadilhas: semColisoes(
          [
            {
              resposta: graus * (180 / Math.PI),
              diagnostico:
                'A conversão ficou invertida. Para ir de graus a radianos multiplica-se por ' +
                'π/180; o fator 180/π faz o caminho contrário.',
              passo: 1,
              conceito: 'circulo.radianos',
            },
          ],
          gabarito,
          proximos,
        ),
      };
    }

    // Valor de seno ou cosseno, incluindo quadrantes com sinal negativo.
    const ehSeno = rng.booleano();
    const radianos = paraRadianos(graus);
    const gabarito = ehSeno ? Math.sin(radianos) : Math.cos(radianos);
    const nome = ehSeno ? '\\sin' : '\\cos';

    return {
      id: `circulo-valor-${graus}-${ehSeno}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: `Qual é o valor de ${ehSeno ? 'sen' : 'cos'} ${graus}°? (2 casas decimais)`,
      enunciadoTex: `${nome} ${graus}° = \;?`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: `O ângulo está no ${quadrante(graus)}º quadrante.`,
            tex: `\\theta = ${graus}°`,
          },
          {
            descricao: ehSeno
              ? 'O seno é a ORDENADA do ponto sobre o círculo.'
              : 'O cosseno é a ABSCISSA do ponto sobre o círculo.',
            tex: `${nome}\\theta = ${ehSeno ? 'y' : 'x'}`,
          },
          {
            descricao: `Nesse quadrante o valor é ${gabarito >= 0 ? 'positivo' : 'negativo'}.`,
            tex: `${nome} ${graus}° = ${gabarito.toFixed(4)}`,
          },
        ],
      },
      conceitos: ['circulo.coordenadas', 'circulo.quadrantes'],
      armadilhas: semColisoes(
        [
          {
            resposta: -gabarito,
            diagnostico:
              `O valor absoluto está correto, mas o sinal não. No ${quadrante(graus)}º ` +
              `quadrante, ${ehSeno ? 'a ordenada' : 'a abscissa'} do ponto é ` +
              `${gabarito >= 0 ? 'positiva' : 'negativa'}.`,
            passo: 2,
            conceito: 'circulo.quadrantes',
          },
          {
            resposta: ehSeno ? Math.cos(radianos) : Math.sin(radianos),
            diagnostico: ehSeno
              ? 'Você deu o cosseno. O seno é a coordenada VERTICAL do ponto.'
              : 'Você deu o seno. O cosseno é a coordenada HORIZONTAL do ponto.',
            passo: 1,
            conceito: 'circulo.coordenadas',
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
      return rng.escolher<Pergunta>(['quadrante', 'radianos']);
    case 'medio':
      return rng.escolher<Pergunta>(['quadrante', 'radianos', 'valor']);
    case 'dificil':
      return rng.escolher<Pergunta>(['valor', 'quadrante']);
  }
}

function sortearAngulo(nivel: Nivel, rng: Rng): number {
  if (nivel === 'facil') {
    // Qualquer ângulo da volta, não só os oito de sempre.
    return anguloNaVolta(rng, nivel);
  }
  if (nivel === 'medio') {
    return rng.inteiro(95, 355);
  }
  // Difícil: ângulos além da volta e negativos, que é onde a redução ao
  // primeiro giro importa. Sorteados num intervalo, e não de uma lista de
  // nove: o aluno percebia a repetição em poucos cliques.
  return rng.booleano()
    ? -rng.inteiro(5, 355)
    : rng.inteiro(365, 1080);
}
