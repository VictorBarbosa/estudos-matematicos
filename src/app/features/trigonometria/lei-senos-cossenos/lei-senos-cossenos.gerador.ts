import { leiDosCossenosComPassos, leiDosSenosComPassos, paraRadianos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.05;

/** Exercícios das leis dos senos e dos cossenos. */
export const geradorLeis: GeradorExercicio<number> = {
  topicoId: 'lei-senos-cossenos',
  formatoResposta: 'um número com até 2 casas, ex.: 6,24',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    // No Extremo entra a lei dos cossenos de trás para a frente: os três lados
    // dados, o maior ângulo pedido.
    if (nivel === 'extremo' && rng.booleano()) {
      return exercicioMaiorAngulo(nivel, rng);
    }

    const usaCossenos = nivel === 'facil' ? true : rng.booleano();

    if (usaCossenos) {
      const b = rng.inteiro(3, 12);
      const c = rng.inteiro(3, 12);
      const angulo = rng.escolher(
        nivel === 'facil' ? [60, 90, 120] : [30, 45, 60, 75, 90, 105, 120, 135],
      );

      const resolucao = leiDosCossenosComPassos(b, c, angulo);
      const gabarito = resolucao.resultado;

      return {
        id: `leis-cossenos-${b}-${c}-${angulo}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado:
          `Um triângulo tem lados ${b} e ${c}, com ângulo de ${angulo}° entre eles. ` +
          'Quanto mede o terceiro lado? (2 casas)',
        enunciadoTex: `b = ${b} \\qquad c = ${c} \\qquad A = ${angulo}° \\qquad a = \\;?`,
        gabarito,
        resolucao,
        conceitos: ['leis.cossenos', 'leis.quando-usar'],
        armadilhas: semColisoes(
          [
            {
              resposta: Math.sqrt(b * b + c * c),
              diagnostico:
                'Você aplicou Pitágoras direto, o que só vale para ângulo de 90°. Com outro ' +
                'ângulo é preciso o termo de correção −2bc·cos A.',
              passo: 0,
              conceito: 'leis.cossenos',
            },
            {
              resposta: Math.sqrt(b * b + c * c + 2 * b * c * Math.cos(paraRadianos(angulo))),
              diagnostico:
                'O sinal do termo de correção está trocado: a fórmula tem MENOS 2bc·cos A.',
              passo: 1,
              conceito: 'leis.cossenos',
            },
            {
              resposta: b * b + c * c - 2 * b * c * Math.cos(paraRadianos(angulo)),
              diagnostico:
                'Esse é o valor de a², não de a. Falta extrair a raiz quadrada no último passo.',
              passo: 2,
              conceito: 'leis.cossenos',
            },
          ],
          gabarito,
          proximos,
        ),
        dica:
          nivel === 'facil'
            ? 'Dois lados e o ângulo entre eles pedem a lei dos cossenos.'
            : undefined,
      };
    }

    // Lei dos senos: um par completo mais outro ângulo.
    const anguloA = rng.escolher([30, 40, 45, 50, 60, 70]);
    const anguloB = rng.escolher([40, 50, 60, 70, 80]);
    const ladoA = rng.inteiro(4, 15);

    const resolucao = leiDosSenosComPassos(ladoA, anguloA, anguloB);
    const gabarito = resolucao.resultado;

    return {
      id: `leis-senos-${ladoA}-${anguloA}-${anguloB}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado:
        `Num triângulo, o lado de medida ${ladoA} é oposto ao ângulo de ${anguloA}°. ` +
        `Quanto mede o lado oposto ao ângulo de ${anguloB}°? (2 casas)`,
      enunciadoTex: `\\frac{${ladoA}}{\\sin ${anguloA}°} = \\frac{x}{\\sin ${anguloB}°}`,
      gabarito,
      resolucao,
      conceitos: ['leis.senos', 'leis.quando-usar'],
      armadilhas: semColisoes(
        [
          {
            resposta: (ladoA * Math.sin(paraRadianos(anguloA))) / Math.sin(paraRadianos(anguloB)),
            diagnostico:
              'A proporção está invertida. Cada lado fica sobre o seno do SEU ângulo oposto — ' +
              'confira qual seno vai no numerador.',
            passo: 1,
            conceito: 'leis.senos',
          },
          {
            resposta: (ladoA * anguloB) / anguloA,
            diagnostico:
              'A proporção é entre lados e SENOS dos ângulos, não entre lados e os ângulos ' +
              'em si. Dobrar o ângulo não dobra o lado oposto.',
            passo: 0,
            conceito: 'leis.senos',
          },
        ],
        gabarito,
        proximos,
      ),
      dica:
        nivel === 'medio'
          ? `Lado sobre o seno do ângulo oposto é constante: ${ladoA}/sen ${anguloA}° = x/sen ${anguloB}°. Isole x.`
          : undefined,
    };
  },

  analisar: analisarNumero,

  saoEquivalentes: proximos,
  formatar: (valor) => valor.toFixed(2).replace('.', ','),
};

/**
 * O maior ângulo a partir dos três lados.
 *
 * Antes, o Extremo usava os mesmos ângulos e lados do Médio. Esta é a lei dos
 * cossenos isolando o cosseno — e decide, pelo sinal dele, se o triângulo é
 * obtusângulo, que é a leitura que a fórmula de ida não ensina.
 */
function exercicioMaiorAngulo(nivel: Nivel, rng: Rng): Exercicio<number> {
  // Três lados que fecham um triângulo: o maior menor que a soma dos outros.
  let lados: number[];
  do {
    lados = [rng.inteiro(3, 15), rng.inteiro(3, 15), rng.inteiro(3, 15)].sort((x, y) => x - y);
  } while (lados[2]! >= lados[0]! + lados[1]! || lados[0] === lados[2]);

  const [b, c, a] = lados as [number, number, number];
  const numerador = b * b + c * c - a * a;
  const denominador = 2 * b * c;
  const cosseno = numerador / denominador;
  const gabarito = (Math.acos(cosseno) * 180) / Math.PI;

  return {
    id: `leis-maior-angulo-${b}-${c}-${a}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um triângulo tem lados ${b}, ${c} e ${a}. Quanto mede o MAIOR ângulo, em graus? ` +
      '(2 casas)',
    enunciadoTex: `a = ${a} \\qquad b = ${b} \\qquad c = ${c} \\qquad \\hat{A} = \\;?`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'O maior ângulo fica oposto ao maior lado, que aqui é a.',
          tex: `a = ${a}`,
        },
        {
          descricao: 'Isolamos o cosseno na lei dos cossenos.',
          tex: '\\cos\\hat{A} = \\frac{b^{2} + c^{2} - a^{2}}{2bc}',
        },
        {
          descricao: 'Substituímos os três lados, cada um ao quadrado.',
          tex:
            `\\cos\\hat{A} = \\frac{${b * b} + ${c * c} - ${a * a}}{2 \\cdot ${b} \\cdot ${c}} = ` +
            `\\frac{${numerador}}{${denominador}} = ${cosseno.toFixed(4)}`,
          nota:
            cosseno < 0
              ? 'Cosseno negativo: o ângulo passa de 90°, e o triângulo é obtusângulo.'
              : 'Cosseno positivo: o ângulo é agudo, e o triângulo é acutângulo.',
        },
        {
          descricao: 'O arco-cosseno devolve o ângulo.',
          tex: `\\hat{A} = \\arccos(${cosseno.toFixed(4)}) = ${gabarito.toFixed(2)}°`,
        },
      ],
    },
    conceitos: ['leis.cossenos', 'leis.quando-usar'],
    armadilhas: semColisoes(
      [
        {
          // Oposto ao menor lado (b): cos = (a² + c² − b²) / (2ac).
          resposta: (Math.acos((a * a + c * c - b * b) / (2 * a * c)) * 180) / Math.PI,
          diagnostico:
            'Esse é o ângulo oposto ao MENOR lado. O maior ângulo fica sempre em frente ao ' +
            'maior lado — é ele que entra com sinal de menos no numerador.',
          passo: 0,
          conceito: 'leis.cossenos',
        },
        {
          resposta: Math.acos(cosseno),
          diagnostico: 'Esse é o ângulo em RADIANOS. A pergunta pede graus.',
          passo: 3,
          conceito: 'leis.cossenos',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `O maior ângulo fica oposto ao maior lado (${a}). Use a lei dos cossenos para ele: cos = (${b}² + ${c}² − ${a}²) / (2 · ${b} · ${c}).`,
  };
}
