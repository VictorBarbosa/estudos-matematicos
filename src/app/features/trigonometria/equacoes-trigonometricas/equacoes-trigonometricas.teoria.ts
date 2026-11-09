import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_EQUACOES_TRIG: readonly Teoria[] = [
  {
    id: 'eqtrig.inversas',
    titulo: 'Funções inversas: arcsen, arccos e arctg',
    resumo: 'A inversa devolve UM ângulo, dentro de uma faixa escolhida de propósito.',
    definicao:
      'Seno, cosseno e tangente não são injetoras: o seno vale 1/2 em 30°, em 150°, em 390° e ' +
      'em infinitos outros ângulos. Para ter uma inversa é preciso restringir o domínio a um ' +
      'trecho onde a função não se repete. O arcsen devolve um ângulo entre −90° e 90°, o ' +
      'arccos entre 0° e 180°, o arctg entre −90° e 90° (sem os extremos). É isso que a ' +
      'calculadora mostra — e por isso ela nunca dá, sozinha, todas as soluções de uma equação.',
    formulas: [
      {
        tex: '\\arcsin y = \\theta \\iff \\sin\\theta = y, \\quad \\theta \\in [-90°, 90°], \\; y \\in [-1, 1]',
      },
      {
        tex: '\\arccos y = \\theta \\iff \\cos\\theta = y, \\quad \\theta \\in [0°, 180°], \\; y \\in [-1, 1]',
      },
      {
        tex: '\\arctan y = \\theta \\iff \\tan\\theta = y, \\quad \\theta \\in (-90°, 90°), \\; y \\in \\mathbb{R}',
      },
      {
        tex: '\\arccos(-y) = 180° - \\arccos y \\qquad \\arcsin(-y) = -\\arcsin y',
        legenda: 'O arccos não é ímpar: a imagem dele não tem ângulos negativos.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Entre −90° e 90° o seno só cresce: cada valor de −1 a 1 aparece uma vez.',
        tex: '\\sin(-90°) = -1 \\;\\nearrow\\; \\sin 90° = 1',
      },
      {
        descricao:
          'O cosseno não serve nessa faixa (vale o mesmo em −60° e 60°); entre 0° e 180° ele só decresce.',
        tex: '\\cos 0° = 1 \\;\\searrow\\; \\cos 180° = -1',
        nota: 'Por isso as imagens de arcsen e arccos são diferentes.',
      },
    ],
    exemplo: {
      enunciado: 'Calcule arccos(−1/2).',
      passos: [
        {
          descricao: 'O ângulo tem de estar entre 0° e 180°.',
          tex: '\\cos 60° = \\frac{1}{2}',
        },
        {
          descricao: 'Valor negativo: o ângulo vai para o segundo quadrante.',
          tex: '\\arccos\\left(-\\frac{1}{2}\\right) = 180° - 60° = 120°',
          nota: 'Responder −60° é o erro clássico: −60° está fora da imagem do arccos.',
        },
      ],
    },
    vejaTambem: ['eqtrig.seno-cosseno', 'circulo.quadrantes'],
  },
  {
    id: 'eqtrig.seno-cosseno',
    titulo: 'Resolver sen x = k e cos x = k',
    resumo: 'Na volta inteira, quase sempre há DUAS soluções.',
    definicao:
      'A inversa dá uma solução, x₀. A segunda vem da simetria do círculo. O seno é a altura ' +
      'do ponto: a mesma altura aparece no ângulo simétrico pelo eixo vertical, 180° − x₀. O ' +
      'cosseno é a abscissa: a mesma abscissa aparece no simétrico pelo eixo horizontal, ' +
      '360° − x₀. Se |k| > 1 não há solução; se k = ±1 as duas coincidem e há uma só.',
    formulas: [
      { tex: '\\sin x = k \\;\\Rightarrow\\; x = x_{0} \\;\\text{ou}\\; x = 180° - x_{0}' },
      { tex: '\\cos x = k \\;\\Rightarrow\\; x = x_{0} \\;\\text{ou}\\; x = 360° - x_{0}' },
      {
        tex: 'x + 360° \\cdot n',
        legenda: 'Fora da primeira volta, cada solução se repete a cada 360°.',
      },
    ],
    demonstracao: [
      {
        descricao: 'O ponto do ângulo x no círculo tem coordenadas (cos x, sen x).',
        tex: 'P(x) = (\\cos x,\\, \\sin x)',
      },
      {
        descricao: 'Refletir P pelo eixo vertical mantém a altura e troca o ângulo por 180° − x.',
        tex: '\\sin(180° - x) = \\sin x',
      },
      {
        descricao:
          'Refletir pelo eixo horizontal mantém a abscissa e troca o ângulo por −x, isto é, 360° − x.',
        tex: '\\cos(360° - x) = \\cos x',
      },
    ],
    exemplo: {
      enunciado: 'Resolva sen x = −1/2 em [0°, 360°).',
      passos: [
        {
          descricao: 'A inversa dá um ângulo negativo, ainda fora da volta pedida.',
          tex: 'x_{0} = \\arcsin\\left(-\\frac{1}{2}\\right) = -30°',
        },
        {
          descricao: 'A segunda solução, pelo simétrico do seno.',
          tex: '180° - (-30°) = 210°',
        },
        {
          descricao: 'E o −30° volta para a primeira volta somando 360°.',
          tex: '-30° + 360° = 330° \\qquad x \\in \\{210°,\\; 330°\\}',
          nota: 'Seno negativo: as soluções ficam no 3º e no 4º quadrantes, como esperado.',
        },
      ],
    },
    vejaTambem: ['eqtrig.inversas', 'eqtrig.tangente', 'eqtrig.redutiveis'],
  },
  {
    id: 'eqtrig.tangente',
    titulo: 'Resolver tg x = k',
    resumo: 'A tangente se repete a cada 180°, não a cada 360°.',
    definicao:
      'A tangente é a inclinação da reta que liga a origem ao ponto do círculo. Girar o ponto ' +
      'em 180° leva-o ao lado oposto da MESMA reta, com a mesma inclinação. Por isso a ' +
      'tangente tem período 180°: qualquer k real tem exatamente duas soluções na volta, ' +
      'x₀ e x₀ + 180°.',
    formulas: [
      { tex: '\\tan x = k \\;\\Rightarrow\\; x = x_{0} \\;\\text{ou}\\; x = x_{0} + 180°' },
      { tex: '\\tan(x + 180°) = \\frac{-\\sin x}{-\\cos x} = \\tan x' },
    ],
    demonstracao: [
      {
        descricao: 'Somar 180° troca o sinal do seno e do cosseno ao mesmo tempo.',
        tex: '\\sin(x + 180°) = -\\sin x \\qquad \\cos(x + 180°) = -\\cos x',
      },
      {
        descricao: 'No quociente, os dois sinais se cancelam.',
        tex: '\\tan(x + 180°) = \\frac{-\\sin x}{-\\cos x} = \\tan x',
      },
    ],
    exemplo: {
      enunciado: 'Resolva tg x = −1 em [0°, 360°).',
      passos: [
        { descricao: 'A inversa.', tex: 'x_{0} = \\arctan(-1) = -45°' },
        { descricao: 'Mais 180°.', tex: '-45° + 180° = 135°' },
        {
          descricao: 'E o −45° somando uma volta.',
          tex: '-45° + 360° = 315° \\qquad x \\in \\{135°,\\; 315°\\}',
        },
      ],
    },
    vejaTambem: ['eqtrig.seno-cosseno', 'eqtrig.inversas'],
  },
  {
    id: 'eqtrig.redutiveis',
    titulo: 'Equações que se reduzem às básicas',
    resumo: 'Isole, troque a variável, resolva a básica e volte.',
    definicao:
      'Quase toda equação trigonométrica de prova vira uma das básicas depois de um passo de ' +
      'álgebra. Em 2sen x − 1 = 0, isola-se o seno. Em sen(2x) = k, chama-se u = 2x — mas, ' +
      'se x percorre uma volta, u percorre DUAS, e as soluções dobram. Em 2sen²x − sen x − 1 = 0, ' +
      'chama-se s = sen x, resolve-se o 2º grau e descarta-se o s fora de [−1, 1].',
    formulas: [
      { tex: 'a\\sin x + b = c \\;\\Rightarrow\\; \\sin x = \\frac{c - b}{a}' },
      {
        tex: '\\sin(nx) = k: \\quad u = nx \\in [0°, n \\cdot 360°)',
        legenda: 'n voltas de u: até 2n soluções em x.',
      },
      {
        tex: 'a\\sin^{2}x + b\\sin x + c = 0 \\;\\Rightarrow\\; as^{2} + bs + c = 0, \\; |s| \\le 1',
      },
    ],
    demonstracao: [
      {
        descricao: 'Com u = 2x e x em [0°, 360°), u vai de 0° a 720°.',
        tex: '0° \\le x < 360° \\iff 0° \\le 2x < 720°',
      },
      {
        descricao:
          'Cada volta de u traz as suas soluções; dividir por 2 traz todas para a volta de x.',
        tex: 'x = \\frac{u}{2}',
        nota: 'Esquecer a segunda volta de u perde metade das soluções.',
      },
    ],
    exemplo: {
      enunciado: 'Resolva 2sen²x − sen x − 1 = 0 em [0°, 360°).',
      passos: [
        {
          descricao: 'Com s = sen x, é uma equação do 2º grau.',
          tex: '2s^{2} - s - 1 = 0 \\;\\Rightarrow\\; s = \\frac{1 \\pm 3}{4}',
        },
        {
          descricao: 'As duas raízes servem: estão em [−1, 1].',
          tex: 's = 1 \\quad s = -\\frac{1}{2}',
        },
        {
          descricao: 'sen x = 1 dá uma solução; sen x = −1/2 dá duas.',
          tex: 'x \\in \\{90°,\\; 210°,\\; 330°\\}',
        },
      ],
    },
    vejaTambem: ['eqtrig.seno-cosseno', 'eqtrig.tangente', 'identidades.arco-duplo'],
  },
];
