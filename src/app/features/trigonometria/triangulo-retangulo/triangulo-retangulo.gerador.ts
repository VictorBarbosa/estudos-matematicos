import { Razao, paraRadianos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { anguloRedondo } from '@core/treino/sorteio/sorteio';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.02;

/**
 * Exercícios de triângulo retângulo.
 *
 * As armadilhas são as trocas clássicas: usar cosseno onde cabia seno, e
 * multiplicar quando era para dividir.
 */
export const geradorTriangulo: GeradorExercicio<number> = {
  topicoId: 'triangulo-retangulo',
  formatoResposta: 'um número com até 2 casas, ex.: 8,66',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    // No Extremo entra a pergunta inversa: dos lados para o ângulo.
    if (nivel === 'extremo' && rng.booleano()) {
      return exercicioAngulo(nivel, rng);
    }

    // Múltiplos de 5°: no fácil, entre 15° e 75°. Os notáveis continuam
    // aparecendo, mas não são os únicos — era isso que limitava o tópico a
    // três exercícios por nível.
    const anguloGraus = anguloRedondo(rng, nivel);
    const hipotenusa = rng.inteiro(4, 60);
    const radianos = paraRadianos(anguloGraus);

    const procurado: Razao = rng.booleano() ? 'seno' : 'cosseno';
    const gabarito =
      procurado === 'seno' ? hipotenusa * Math.sin(radianos) : hipotenusa * Math.cos(radianos);

    const outro =
      procurado === 'seno' ? hipotenusa * Math.cos(radianos) : hipotenusa * Math.sin(radianos);

    const nomeLado = procurado === 'seno' ? 'oposto' : 'adjacente';
    const razaoCerta = procurado === 'seno' ? '\\sin' : '\\cos';

    return {
      id: `triangulo-${anguloGraus}-${hipotenusa}-${procurado}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado:
        `Num triângulo retângulo com hipotenusa ${hipotenusa} e um ângulo de ${anguloGraus}°, ` +
        `qual é a medida do cateto ${nomeLado}? (2 casas decimais)`,
      enunciadoTex: `h = ${hipotenusa} \\qquad \\theta = ${anguloGraus}° \\qquad \\text{cateto } ${nomeLado} = \\;?`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: `O cateto ${nomeLado} se relaciona com a hipotenusa pelo ${procurado}.`,
            tex: `${razaoCerta} ${anguloGraus}° = \\frac{\\text{${nomeLado}}}{${hipotenusa}}`,
          },
          {
            descricao: 'Isolamos o cateto multiplicando pela hipotenusa.',
            tex: `\\text{${nomeLado}} = ${hipotenusa} \\cdot ${razaoCerta} ${anguloGraus}°`,
          },
          {
            descricao: 'Calculando.',
            tex: `= ${hipotenusa} \\cdot ${(procurado === 'seno' ? Math.sin(radianos) : Math.cos(radianos)).toFixed(4)} = ${gabarito.toFixed(2)}`,
          },
        ],
      },
      conceitos: ['triangulo.razoes', 'triangulo.notaveis'],
      armadilhas: semColisoes(
        [
          {
            resposta: outro,
            diagnostico:
              procurado === 'seno'
                ? 'Você usou o cosseno. O cateto OPOSTO ao ângulo se relaciona pelo seno; o ' +
                  'cosseno trata do cateto adjacente.'
                : 'Você usou o seno. O cateto ADJACENTE ao ângulo se relaciona pelo cosseno; o ' +
                  'seno trata do oposto.',
            passo: 0,
            conceito: 'triangulo.razoes',
          },
          {
            resposta: hipotenusa / (procurado === 'seno' ? Math.sin(radianos) : Math.cos(radianos)),
            diagnostico:
              'A operação ficou invertida: para achar o cateto, MULTIPLICAMOS a hipotenusa ' +
              'pela razão. Dividir seria o caminho para encontrar a hipotenusa a partir do cateto.',
            passo: 1,
            conceito: 'triangulo.razoes',
          },
          {
            resposta: hipotenusa * Math.tan(radianos),
            diagnostico:
              'A tangente relaciona os dois CATETOS entre si, sem envolver a hipotenusa. ' +
              'Quando a hipotenusa aparece no problema, a razão é seno ou cosseno.',
            passo: 0,
            conceito: 'triangulo.razoes',
          },
        ],
        gabarito,
        proximos,
      ),
      dica: nivel === 'facil' ? 'O cateto está à frente do ângulo ou encostado nele?' : undefined,
    };
  },

  analisar: analisarNumero,

  saoEquivalentes: proximos,
  formatar: (valor) => valor.toFixed(2).replace('.', ','),
};

/**
 * O ângulo a partir dos dois catetos — a pergunta inversa.
 *
 * Antes o Extremo era a pergunta do Difícil com os mesmos números. Esta pede o
 * caminho de volta: a razão sai dos lados, e o ângulo sai da razão pela função
 * inversa, que é a ferramenta que o resto do tópico só usava de ida.
 */
function exercicioAngulo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const oposto = rng.inteiro(3, 40);
  const adjacente = rng.inteiro(3, 40);
  const razao = oposto / adjacente;
  const gabarito = (Math.atan(razao) * 180) / Math.PI;

  return {
    id: `triangulo-angulo-${oposto}-${adjacente}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Num triângulo retângulo, o cateto oposto a um ângulo mede ${oposto} e o adjacente ` +
      `mede ${adjacente}. Quanto mede esse ângulo, em graus? (2 casas decimais)`,
    enunciadoTex: `\\text{oposto} = ${oposto} \\qquad \\text{adjacente} = ${adjacente} \\qquad \\theta = \\;?`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Oposto e adjacente juntos dão a tangente do ângulo.',
          tex: `\\tan\\theta = \\frac{\\text{oposto}}{\\text{adjacente}} = \\frac{${oposto}}{${adjacente}} = ${razao.toFixed(4)}`,
        },
        {
          descricao: 'Para voltar da razão ao ângulo, usamos a função inversa, o arco-tangente.',
          tex: `\\theta = \\arctan(${razao.toFixed(4)})`,
          nota: 'Na calculadora: tan⁻¹, com o modo em GRAUS.',
        },
        {
          descricao: 'Calculando.',
          tex: `\\theta = ${gabarito.toFixed(2)}°`,
        },
      ],
    },
    conceitos: ['triangulo.razoes'],
    armadilhas: semColisoes(
      [
        {
          resposta: 90 - gabarito,
          diagnostico:
            'Esse é o OUTRO ângulo agudo: a razão ficou invertida. A tangente é oposto sobre ' +
            'adjacente, vistos a partir do ângulo pedido.',
          passo: 0,
          conceito: 'triangulo.razoes',
        },
        {
          resposta: Math.atan(razao),
          diagnostico:
            'Esse é o ângulo em RADIANOS. A calculadora estava no modo errado: passe para graus.',
          passo: 1,
          conceito: 'triangulo.razoes',
        },
        {
          resposta: razao,
          diagnostico: 'Essa é a tangente, não o ângulo. Falta aplicar o arco-tangente.',
          passo: 1,
          conceito: 'triangulo.razoes',
        },
      ],
      gabarito,
      proximos,
    ),
  };
}
