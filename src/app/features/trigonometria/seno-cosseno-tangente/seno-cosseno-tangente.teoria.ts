import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_RAZOES: readonly Teoria[] = [
  {
    id: 'razoes.relacao',
    titulo: 'Como as três se relacionam',
    resumo: 'A tangente é o quociente das outras duas.',
    definicao:
      'Seno e cosseno são as coordenadas do ponto no círculo; a tangente é a razão entre ' +
      'elas. Dessa única relação decorrem o domínio da tangente, suas assíntotas e seu ' +
      'comportamento em cada quadrante.',
    formulas: [
      { tex: '\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}' },
      { tex: '\\sin^{2}\\theta + \\cos^{2}\\theta = 1' },
    ],
    demonstracao: [
      {
        descricao: 'No triângulo, a tangente é oposto sobre adjacente.',
        tex: '\\tan\\theta = \\frac{o}{a}',
      },
      {
        descricao: 'Dividindo numerador e denominador pela hipotenusa.',
        tex: '= \\frac{o/h}{a/h} = \\frac{\\sin\\theta}{\\cos\\theta}',
        nota: 'A hipotenusa se cancela, e a relação vale também no círculo.',
      },
      {
        descricao: 'Onde o cosseno zera, a tangente deixa de existir.',
        tex: '\\cos 90° = 0 \;\\Rightarrow\; \\tan 90° \\text{ indefinida}',
      },
    ],
    vejaTambem: ['razoes.assintotas', 'razoes.complementares'],
  },
  {
    id: 'razoes.assintotas',
    titulo: 'As assíntotas da tangente',
    resumo: 'A tangente explode onde o cosseno zera.',
    definicao:
      'Como a tangente é uma fração com cosseno no denominador, ela dispara para o infinito ' +
      'sempre que o cosseno se aproxima de zero — ou seja, a cada 90° a partir de 90°. O ' +
      'gráfico se parte em ramos separados por retas verticais.',
    formulas: [
      { tex: '\\tan\\theta \\text{ indefinida em } \\theta = 90° + k \\cdot 180°' },
      { tex: 'T_{\\tan} = 180°', legenda: 'O período da tangente é metade do de seno e cosseno.' },
    ],
    demonstracao: [
      {
        descricao: 'Perto de 90°, o cosseno fica muito pequeno.',
        tex: '\\cos 89{,}9° \\approx 0{,}0017',
      },
      {
        descricao: 'Dividir por um número minúsculo gera um resultado enorme.',
        tex: '\\tan 89{,}9° \\approx 573',
      },
      {
        descricao: 'Exatamente em 90° a divisão é impossível.',
        tex: '\\frac{1}{0} \\text{ não existe}',
        nota: 'O gráfico tem ali uma assíntota vertical, e não um ponto.',
      },
      {
        descricao: 'Em 180° seno e cosseno trocam de sinal juntos, e a tangente se repete.',
        tex: '\\tan(\\theta + 180°) = \\frac{-\\sin\\theta}{-\\cos\\theta} = \\tan\\theta',
      },
    ],
    vejaTambem: ['razoes.relacao', 'funcoes-trig.periodo'],
  },
  {
    id: 'razoes.complementares',
    titulo: 'Ângulos complementares',
    resumo: 'O seno de um é o cosseno do outro.',
    definicao:
      'Dois ângulos que somam 90° são complementares. Num triângulo retângulo, eles são os ' +
      'dois ângulos agudos — e o cateto oposto a um é o adjacente ao outro. Daí a relação ' +
      'entre seno e cosseno, que também explica o nome "co-seno".',
    formulas: [
      { tex: '\\sin(90° - \\theta) = \\cos\\theta' },
      { tex: '\\cos(90° - \\theta) = \\sin\\theta' },
    ],
    demonstracao: [
      {
        descricao: 'Num triângulo retângulo, os ângulos agudos somam 90°.',
        tex: '\\alpha + \\beta = 90°',
      },
      {
        descricao: 'O cateto oposto a α é o adjacente a β.',
        tex: '\\sin\\alpha = \\frac{o}{h} \\qquad \\cos\\beta = \\frac{o}{h}',
      },
      {
        descricao: 'Logo as duas razões são o mesmo número.',
        tex: '\\sin\\alpha = \\cos(90° - \\alpha)',
        nota: 'O prefixo "co" em cosseno vem justamente de "complementar".',
      },
    ],
    vejaTambem: ['razoes.relacao', 'triangulo.notaveis'],
  },
];
