import { resolverTrianguloComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_TRIANGULO: readonly Teoria[] = [
  {
    id: 'triangulo.razoes',
    titulo: 'Seno, cosseno e tangente',
    resumo: 'Três razões entre lados, definidas em relação a um ângulo.',
    definicao:
      'Num triângulo retângulo, fixado um ângulo agudo, os catetos ganham nomes: o que está ' +
      'à frente do ângulo é o oposto, o que forma o ângulo é o adjacente. As três razões ' +
      'comparam esses lados dois a dois — e só dependem do ÂNGULO, não do tamanho do triângulo.',
    formulas: [
      { tex: '\\sin \\theta = \\frac{\\text{cateto oposto}}{\\text{hipotenusa}}' },
      { tex: '\\cos \\theta = \\frac{\\text{cateto adjacente}}{\\text{hipotenusa}}' },
      { tex: '\\tan \\theta = \\frac{\\text{cateto oposto}}{\\text{cateto adjacente}} = \\frac{\\sin \\theta}{\\cos \\theta}' },
    ],
    demonstracao: [
      {
        descricao: 'Dois triângulos com o mesmo ângulo são semelhantes.',
        tex: '\\frac{a_1}{h_1} = \\frac{a_2}{h_2}',
        nota: 'Semelhança preserva razões entre lados, mesmo mudando o tamanho.',
      },
      {
        descricao: 'Por isso a razão depende só do ângulo, e pode receber um nome.',
        tex: '\\sin \\theta = \\frac{\\text{oposto}}{\\text{hipotenusa}}',
      },
      {
        descricao: 'A tangente é o quociente das outras duas, pois a hipotenusa se cancela.',
        tex: '\\frac{\\sin\\theta}{\\cos\\theta} = \\frac{o/h}{a/h} = \\frac{o}{a} = \\tan\\theta',
      },
    ],
    exemplo: {
      enunciado: 'Num triângulo com hipotenusa 10 e ângulo de 30°.',
      passos: resolverTrianguloComPassos(30, 10).passos,
    },
    vejaTambem: ['triangulo.notaveis', 'triangulo.pitagoras'],
  },
  {
    id: 'triangulo.notaveis',
    titulo: 'Os ângulos notáveis',
    resumo: '30°, 45° e 60° saem de dois triângulos simples.',
    definicao:
      'Os valores de 30°, 45° e 60° não precisam ser decorados: eles saem da geometria de ' +
      'dois triângulos — o quadrado cortado pela diagonal e o triângulo equilátero cortado ' +
      'pela altura.',
    formulas: [
      { tex: '\\sin 30° = \\frac{1}{2} \\qquad \\cos 30° = \\frac{\\sqrt{3}}{2}' },
      { tex: '\\sin 45° = \\cos 45° = \\frac{\\sqrt{2}}{2}' },
      { tex: '\\sin 60° = \\frac{\\sqrt{3}}{2} \\qquad \\cos 60° = \\frac{1}{2}' },
    ],
    demonstracao: [
      {
        descricao: 'Um quadrado de lado 1 cortado na diagonal dá dois triângulos de 45°.',
        tex: 'd = \\sqrt{1^{2} + 1^{2}} = \\sqrt{2}',
      },
      {
        descricao: 'Daí as razões de 45°, iguais entre si por simetria.',
        tex: '\\sin 45° = \\frac{1}{\\sqrt{2}} = \\frac{\\sqrt{2}}{2}',
      },
      {
        descricao: 'Um equilátero de lado 2 cortado pela altura dá um triângulo de 30° e 60°.',
        tex: 'h = \\sqrt{2^{2} - 1^{2}} = \\sqrt{3}',
      },
      {
        descricao: 'O cateto oposto a 30° é metade da hipotenusa.',
        tex: '\\sin 30° = \\frac{1}{2}',
        nota: 'Repare que sen 30° = cos 60°: os dois ângulos são complementares.',
      },
    ],
    exemplo: {
      enunciado: 'Um triângulo com hipotenusa 8 e ângulo de 45°.',
      passos: resolverTrianguloComPassos(45, 8).passos,
    },
    vejaTambem: ['triangulo.razoes', 'triangulo.pitagoras'],
  },
  {
    id: 'triangulo.pitagoras',
    titulo: 'Pitágoras e a identidade fundamental',
    resumo: 'sen²θ + cos²θ = 1 é Pitágoras disfarçado.',
    definicao:
      'A identidade mais usada de toda a trigonometria não é um fato novo: é o teorema de ' +
      'Pitágoras aplicado a um triângulo de hipotenusa 1, escrito com as razões no lugar dos ' +
      'lados.',
    formulas: [
      { tex: 'a^{2} + b^{2} = c^{2}', legenda: 'Pitágoras.' },
      { tex: '\\sin^{2}\\theta + \\cos^{2}\\theta = 1', legenda: 'A identidade fundamental.' },
    ],
    demonstracao: [
      {
        descricao: 'Partimos de Pitágoras num triângulo retângulo qualquer.',
        tex: 'o^{2} + a^{2} = h^{2}',
      },
      {
        descricao: 'Dividimos tudo pelo quadrado da hipotenusa.',
        tex: '\\frac{o^{2}}{h^{2}} + \\frac{a^{2}}{h^{2}} = 1',
      },
      {
        descricao: 'Cada fração é o quadrado de uma das razões.',
        tex: '\\left(\\frac{o}{h}\\right)^{2} + \\left(\\frac{a}{h}\\right)^{2} = \\sin^{2}\\theta + \\cos^{2}\\theta = 1',
        nota: 'É a mesma verdade geométrica, escrita com outra notação.',
      },
    ],
    exemplo: {
      enunciado: 'Verificando com o triângulo de 60° e hipotenusa 10.',
      passos: resolverTrianguloComPassos(60, 10).passos,
    },
    vejaTambem: ['triangulo.razoes', 'identidades.fundamental'],
  },
];
