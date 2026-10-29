import { areaComPassos, escalaComPassos } from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_AREAS: readonly Teoria[] = [
  {
    id: 'areas.origem',
    titulo: 'Toda área vem do retângulo',
    resumo: 'Contar quadradinhos, e depois cortar e colar.',
    definicao:
      'Área é quantidade de superfície, medida em quadrados de lado unitário. No retângulo a ' +
      'contagem é direta: base vezes altura. Todas as outras fórmulas se obtêm recortando a ' +
      'figura e recompondo-a num retângulo — nenhuma delas precisa ser decorada isoladamente.',
    formulas: [
      { tex: 'A_{\\text{retângulo}} = b \\cdot h' },
      {
        tex: 'A_{\\text{paralelogramo}} = b \\cdot h',
        legenda: 'Um corte transforma o paralelogramo num retângulo de mesma base e altura.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Num retângulo de lados inteiros, basta contar as fileiras de quadrados.',
        tex: 'A = b \\cdot h',
      },
      {
        descricao: 'No paralelogramo, corta-se o triângulo de uma ponta e cola-se na outra.',
        tex: 'A_{\\text{paralelogramo}} = A_{\\text{retângulo}}',
        nota: 'A altura é a distância entre as bases, nunca o lado inclinado.',
      },
      {
        descricao: 'Esse recortar e recompor preserva a área: nada se perde nem se cria.',
        tex: 'b \\cdot h',
      },
    ],
    exemplo: {
      enunciado: 'A área de um paralelogramo de base 5 e altura 3.',
      passos: areaComPassos('paralelogramo', { base: 5, altura: 3 }).passos,
    },
    vejaTambem: ['areas.deducao', 'areas.escala'],
  },
  {
    id: 'areas.deducao',
    titulo: 'Triângulo e trapézio',
    resumo: 'Duas cópias e um paralelogramo.',
    definicao:
      'O triângulo é metade de um paralelogramo de mesma base e altura — duas cópias, uma ' +
      'girada meia volta, encaixam exatamente. O trapézio segue a mesma ideia: duas cópias ' +
      'formam um paralelogramo de base B + b, e por isso a área é a média das bases vezes a ' +
      'altura.',
    formulas: [
      { tex: 'A_{\\triangle} = \\frac{b \\cdot h}{2}' },
      { tex: 'A_{\\text{trapézio}} = \\frac{(B + b) \\cdot h}{2}' },
    ],
    demonstracao: [
      {
        descricao: 'Duas cópias do triângulo, uma girada 180°, formam um paralelogramo.',
        tex: '2A_{\\triangle} = b \\cdot h',
      },
      {
        descricao: 'Logo a área do triângulo é a metade.',
        tex: 'A_{\\triangle} = \\frac{bh}{2}',
        nota: 'Vale para qualquer triângulo, agudo ou obtuso.',
      },
      {
        descricao: 'Com o trapézio, duas cópias dão base B + b.',
        tex: '2A = (B + b)h',
      },
      {
        descricao: 'Metade disso é a média das bases vezes a altura.',
        tex: 'A = \\frac{B+b}{2} \\cdot h',
        nota: 'Se B = b, o trapézio é um paralelogramo e a fórmula se reduz a bh.',
      },
    ],
    exemplo: {
      enunciado: 'A área de um trapézio de bases 8 e 4, altura 3.',
      passos: areaComPassos('trapezio', { base: 8, baseMenor: 4, altura: 3 }).passos,
    },
    vejaTambem: ['areas.origem', 'areas.escala'],
  },
  {
    id: 'areas.escala',
    titulo: 'Ampliar a figura, quadruplicar a área',
    resumo: 'A área responde ao quadrado da razão.',
    definicao:
      'Dobrar os comprimentos de uma figura multiplica a área por quatro, não por dois. A ' +
      'razão é que área é produto de duas medidas, e cada uma foi dobrada. Esse é o erro de ' +
      'estimativa mais comum em problemas de escala.',
    formulas: [
      { tex: '\\frac{A\'}{A} = k^{2}' },
      {
        tex: 'k = 2 \\;\\Rightarrow\\; A\' = 4A',
        legenda: 'Dobrar o lado quadruplica a área.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Base e altura são ambas multiplicadas por k.',
        tex: "b' = kb \\qquad h' = kh",
      },
      {
        descricao: 'A área é o produto delas.',
        tex: "A' = (kb)(kh) = k^{2}bh",
      },
      {
        descricao: 'Portanto o fator da área é k ao quadrado.',
        tex: "\\frac{A'}{A} = k^{2}",
        nota: 'Num mapa de escala 1:100, uma área real é 10 000 vezes a do papel.',
      },
    ],
    exemplo: {
      enunciado: 'O fator de área quando a razão de semelhança é 3.',
      passos: escalaComPassos(3, 2).passos,
    },
    vejaTambem: ['areas.origem', 'semelhanca.razao'],
  },
];
