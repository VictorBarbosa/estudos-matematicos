import { paraRadianos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { Exercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.05;
const tex2 = (v: number): string => v.toFixed(2).replace('.', '{,}');
const tex4 = (v: number): string => v.toFixed(4).replace('.', '{,}');

/** Ternos de lados que formam triângulo, com área não trivial. */
const TERNOS: readonly (readonly [number, number, number])[] = [
  [5, 6, 7],
  [7, 8, 9],
  [4, 7, 9],
  [6, 8, 11],
  [5, 9, 11],
  [8, 10, 13],
];

/**
 * Área de um triângulo por dois lados e o ângulo entre eles: ½·a·b·sen C.
 *
 * É a base vezes a altura sobre dois, com a altura escrita como b·sen C. No
 * Extremo vêm os três lados: primeiro a lei dos cossenos dá o ângulo, depois a
 * fórmula da área.
 */
export function exercicioArea(nivel: Nivel, rng: Rng): Exercicio<number> {
  if (nivel === 'extremo') return areaPorTresLados(nivel, rng);

  const a = rng.inteiro(3, 15);
  const b = rng.inteiro(3, 15);
  const angulo = rng.escolher(
    nivel === 'facil' ? [30, 60, 90, 150] : [40, 45, 70, 110, 120, 135, 160],
  );
  const seno = Math.sin(paraRadianos(angulo));
  const gabarito = 0.5 * a * b * seno;

  return {
    id: `leis-area-${a}-${b}-${angulo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um triângulo tem lados de ${a} cm e ${b} cm, com ângulo de ${angulo}° entre eles. ` +
      'Qual é a área, em cm²? (2 casas)',
    enunciadoTex: `a = ${a}\\ \\text{cm} \\qquad b = ${b}\\ \\text{cm} \\qquad C = ${angulo}^{\\circ}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao:
            'Tomando a como base, a altura é b·sen C: a área é metade da base vezes a altura.',
          tex: 'A = \\tfrac{1}{2}\\,a\\,b\\,\\sin C',
          nota:
            angulo > 90
              ? `Com C obtuso, sen ${angulo}° = sen ${180 - angulo}°: a área continua positiva.`
              : undefined,
        },
        {
          descricao: 'Substituindo.',
          tex: `A = \\tfrac{1}{2} \\cdot ${a} \\cdot ${b} \\cdot \\sin ${angulo}^{\\circ} = \\tfrac{1}{2} \\cdot ${a * b} \\cdot ${tex4(seno)} = ${tex2(gabarito)}\\ \\text{cm}^{2}`,
        },
      ],
    },
    conceitos: ['leis.area'],
    armadilhas: semColisoes(
      [
        {
          resposta: a * b * seno,
          diagnostico: 'Faltou o ½: base vezes altura dá um paralelogramo, o triângulo é a metade.',
          passo: 0,
          conceito: 'leis.area',
        },
        {
          resposta: 0.5 * a * b * Math.cos(paraRadianos(angulo)),
          diagnostico: 'A altura é b·SENO de C (o cateto oposto ao ângulo), não b·cosseno.',
          passo: 0,
          conceito: 'leis.area',
        },
        {
          resposta: 0.5 * a * b,
          diagnostico: `½·a·b só vale com ângulo reto entre os lados. Com ${angulo}°, multiplique por sen ${angulo}°.`,
          passo: 0,
          conceito: 'leis.area',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Área = ½·${a}·${b}·sen ${angulo}°: metade do produto dos dois lados vezes o seno do ângulo entre eles.`,
  };
}

function areaPorTresLados(nivel: Nivel, rng: Rng): Exercicio<number> {
  const [a, b, c] = rng.escolher(TERNOS);
  const k = rng.escolher([1, 1, 2]);
  const [x, y, z] = [a * k, b * k, c * k];
  // Ângulo C oposto ao lado z, pela lei dos cossenos.
  const cosC = (x * x + y * y - z * z) / (2 * x * y);
  const C = Math.acos(cosC);
  const gabarito = 0.5 * x * y * Math.sin(C);
  const graus = (C * 180) / Math.PI;

  return {
    id: `leis-area3-${x}-${y}-${z}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Um triângulo tem lados de ${x} cm, ${y} cm e ${z} cm. Qual é a área, em cm²? (2 casas)`,
    enunciadoTex: `a = ${x}\\ \\text{cm} \\qquad b = ${y}\\ \\text{cm} \\qquad c = ${z}\\ \\text{cm}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Sem ângulo dado, a lei dos cossenos dá o ângulo C entre a e b.',
          tex: `\\cos C = \\frac{${x}^{2} + ${y}^{2} - ${z}^{2}}{2 \\cdot ${x} \\cdot ${y}} = \\frac{${x * x + y * y - z * z}}{${2 * x * y}} = ${tex4(cosC)}`,
        },
        {
          descricao: 'O ângulo, e o seno dele.',
          tex: `C = ${tex2(graus)}^{\\circ} \\qquad \\sin C = ${tex4(Math.sin(C))}`,
        },
        {
          descricao: 'A área pelos dois lados e o ângulo entre eles.',
          tex: `A = \\tfrac{1}{2} \\cdot ${x} \\cdot ${y} \\cdot ${tex4(Math.sin(C))} = ${tex2(gabarito)}\\ \\text{cm}^{2}`,
          nota: 'A fórmula de Herão dá o mesmo valor direto dos três lados.',
        },
      ],
    },
    conceitos: ['leis.area', 'leis.cossenos'],
    armadilhas: semColisoes(
      [
        {
          resposta: 0.5 * x * y,
          diagnostico:
            'Isso supõe um ângulo reto entre a e b. Calcule o ângulo pela lei dos cossenos antes.',
          passo: 0,
          conceito: 'leis.area',
        },
        {
          resposta: 0.5 * x * y * cosC,
          diagnostico:
            'Você usou o cosseno de C na área. A área usa o SENO; o cosseno só serviu para achar C.',
          passo: 2,
          conceito: 'leis.area',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Primeiro ache o ângulo entre os lados ${x} e ${y} pela lei dos cossenos; depois use área = ½·${x}·${y}·sen C.`,
  };
}
