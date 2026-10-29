import { leiDosCossenosComPassos, leiDosSenosComPassos, paraRadianos } from '@core/math';
import { Rng } from '@core/treino/rng';
import { analisarNumero } from '@core/treino/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.05;

/** Exercícios das leis dos senos e dos cossenos. */
export const geradorLeis: GeradorExercicio<number> = {
  topicoId: 'lei-senos-cossenos',
  formatoResposta: 'um número com até 2 casas, ex.: 6,24',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
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
        dica: nivel === 'facil' ? 'Dois lados e o ângulo entre eles pedem a lei dos cossenos.' : undefined,
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
    };
  },

  analisar: analisarNumero,

  saoEquivalentes: proximos,
  formatar: (valor) => valor.toFixed(2).replace('.', ','),
};
