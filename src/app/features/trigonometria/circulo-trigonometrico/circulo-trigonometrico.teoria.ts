import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_CIRCULO: readonly Teoria[] = [
  {
    id: 'circulo.coordenadas',
    titulo: 'Seno e cosseno são coordenadas',
    resumo: 'No círculo de raio 1, o ponto é (cos θ, sen θ).',
    definicao:
      'O círculo trigonométrico tem raio 1 e centro na origem. Girando um raio a partir do ' +
      'eixo x, o ponto onde ele toca o círculo tem abscissa cos θ e ordenada sen θ. Essa é ' +
      'a mesma definição do triângulo retângulo — só que agora vale para qualquer ângulo.',
    formulas: [
      { tex: 'P = (\\cos\\theta,\\; \\sin\\theta)' },
      { tex: '\\cos^{2}\\theta + \\sin^{2}\\theta = 1', legenda: 'A equação do próprio círculo.' },
    ],
    demonstracao: [
      {
        descricao: 'Do centro ao ponto forma-se um triângulo retângulo de hipotenusa 1.',
        tex: '\\sin\\theta = \\frac{\\text{oposto}}{1} = \\text{oposto}',
      },
      {
        descricao: 'Com hipotenusa 1, as razões viram as próprias medidas dos catetos.',
        tex: '\\cos\\theta = \\frac{\\text{adjacente}}{1} = \\text{adjacente}',
        nota: 'Os catetos são exatamente as coordenadas do ponto.',
      },
      {
        descricao: 'Pitágoras nesse triângulo é a equação da circunferência.',
        tex: 'x^{2} + y^{2} = 1',
        nota: 'A identidade fundamental e a equação do círculo são a mesma coisa.',
      },
    ],
    exemplo: {
      enunciado: 'Em 60°, o ponto fica em (1/2, √3/2).',
      passos: [
        { descricao: 'A abscissa é o cosseno.', tex: '\\cos 60° = \\frac{1}{2}' },
        { descricao: 'A ordenada é o seno.', tex: '\\sin 60° = \\frac{\\sqrt{3}}{2}' },
        {
          descricao: 'Conferindo com a equação do círculo.',
          tex: '\\left(\\frac{1}{2}\\right)^{2} + \\left(\\frac{\\sqrt{3}}{2}\\right)^{2} = \\frac{1}{4} + \\frac{3}{4} = 1',
        },
      ],
    },
    vejaTambem: ['circulo.quadrantes', 'circulo.radianos'],
  },
  {
    id: 'circulo.quadrantes',
    titulo: 'Sinais em cada quadrante',
    resumo: 'O sinal vem da posição do ponto, não de uma regra decorada.',
    definicao:
      'Como seno e cosseno são coordenadas, seus sinais seguem os sinais de x e y em cada ' +
      'quadrante. Não há nada a memorizar: basta perguntar se o ponto está à direita ou à ' +
      'esquerda, acima ou abaixo.',
    formulas: [
      { tex: '1º: (+,+) \\qquad 2º: (-,+) \\qquad 3º: (-,-) \\qquad 4º: (+,-)', legenda: '(cos, sen).' },
      { tex: '\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}', legenda: 'Positiva no 1º e 3º quadrantes.' },
    ],
    demonstracao: [
      {
        descricao: 'No 2º quadrante o ponto está à esquerda e acima.',
        tex: 'x < 0 \\;\\Rightarrow\\; \\cos\\theta < 0 \\qquad y > 0 \\;\\Rightarrow\\; \\sin\\theta > 0',
      },
      {
        descricao: 'A tangente, sendo um quociente, é positiva quando os dois têm o mesmo sinal.',
        tex: '\\frac{-}{+} < 0 \\qquad \\frac{-}{-} > 0',
        nota: 'Por isso ela é positiva no 1º e no 3º, e negativa no 2º e no 4º.',
      },
      {
        descricao: 'Ângulos além de 360° dão a volta e repetem tudo.',
        tex: '\\sin(\\theta + 360°) = \\sin\\theta',
        nota: 'É daqui que vem a periodicidade das funções trigonométricas.',
      },
    ],
    vejaTambem: ['circulo.coordenadas', 'circulo.radianos'],
  },
  {
    id: 'circulo.radianos',
    titulo: 'Radianos',
    resumo: 'Medir o ângulo pelo comprimento do arco.',
    definicao:
      'Um radiano é o ângulo que corresponde a um arco de comprimento igual ao raio. Como a ' +
      'circunferência toda mede 2πr, a volta completa tem 2π radianos — e é por isso que π ' +
      'aparece em tudo na trigonometria.',
    formulas: [
      { tex: '360° = 2\\pi \\text{ rad} \\qquad 180° = \\pi \\text{ rad}' },
      { tex: '\\text{rad} = \\text{graus} \\cdot \\frac{\\pi}{180}' },
    ],
    demonstracao: [
      {
        descricao: 'O comprimento da circunferência de raio 1 é 2π.',
        tex: 'C = 2\\pi r = 2\\pi',
      },
      {
        descricao: 'Medindo o ângulo pelo arco percorrido, a volta inteira vale 2π.',
        tex: '360° \\;\\longleftrightarrow\\; 2\\pi',
      },
      {
        descricao: 'Daí sai a regra de conversão, por proporção simples.',
        tex: '\\frac{\\theta_{\\text{rad}}}{2\\pi} = \\frac{\\theta_{\\text{graus}}}{360°}',
      },
      {
        descricao: 'Por exemplo, 90° é um quarto de volta.',
        tex: '90° = \\frac{2\\pi}{4} = \\frac{\\pi}{2}',
      },
    ],
    vejaTambem: ['circulo.coordenadas', 'circulo.quadrantes'],
  },
];
