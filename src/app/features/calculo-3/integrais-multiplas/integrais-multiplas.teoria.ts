import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_MULTIPLAS: readonly Teoria[] = [
  {
    id: 'multiplas.iterada',
    titulo: 'Duas integrais encadeadas',
    resumo: 'Integra-se numa variável de cada vez.',
    definicao:
      'A integral dupla soma os valores da função sobre uma região do plano. Num retângulo ela ' +
      'se calcula como duas integrais simples encadeadas: integra-se em x tratando y como ' +
      'constante, e depois integra-se o resultado em y. É a mesma ideia das derivadas parciais, ' +
      'na direção contrária.',
    formulas: [
      { tex: '\\iint_{R} f\\,dA = \\int_{c}^{d}\\left(\\int_{a}^{b} f(x,y)\\,dx\\right)dy' },
    ],
    demonstracao: [
      {
        descricao: 'Integramos primeiro em x, com y parado.',
        tex: '\\int_{0}^{2}\\left(x + y\\right)dx = \\left[\\frac{x^{2}}{2} + xy\\right]_{0}^{2} = 2 + 2y',
      },
      {
        descricao: 'O resultado depende só de y.',
        tex: '2 + 2y',
      },
      {
        descricao: 'E agora integramos em y.',
        tex: '\\int_{0}^{1}\\left(2 + 2y\\right)dy = 2 + 1 = 3',
        nota: 'Cada passo é uma integral do Cálculo 2, sem nada novo na técnica.',
      },
    ],
    exemplo: {
      enunciado: 'Calcule a integral de (x + y) com y de 0 a 1 e x de 0 a 2.',
      passos: [
        {
          descricao: 'A de dentro, em y, com x parado.',
          tex: '\\int_{0}^{1} (x + y)\\,dy = \\left[xy + \\frac{y^{2}}{2}\\right]_{0}^{1} = x + \\frac{1}{2}',
        },
        {
          descricao: 'A de fora, em x.',
          tex: '\\int_{0}^{2} \\left(x + \\frac{1}{2}\\right)dx = \\left[\\frac{x^{2}}{2} + \\frac{x}{2}\\right]_{0}^{2} = 2 + 1 = 3',
        },
      ],
    },
    vejaTambem: ['multiplas.fubini', 'multiplas.volume', 'multiplas.polares'],
  },
  {
    id: 'multiplas.fubini',
    titulo: 'A ordem não importa',
    resumo: 'No retângulo, integrar em x ou em y primeiro dá o mesmo.',
    definicao:
      'O teorema de Fubini garante que, numa região retangular e com a função bem comportada, ' +
      'trocar a ordem de integração não altera o resultado. Isso é mais do que uma curiosidade: ' +
      'muitas integrais são impossíveis numa ordem e imediatas na outra.',
    formulas: [
      { tex: '\\int_{c}^{d}\\int_{a}^{b} f\\,dx\\,dy = \\int_{a}^{b}\\int_{c}^{d} f\\,dy\\,dx' },
    ],
    demonstracao: [
      {
        descricao: 'Integrando primeiro em x.',
        tex: '\\int_{0}^{1}\\int_{0}^{2} xy\\,dx\\,dy = \\int_{0}^{1} 2y\\,dy = 1',
      },
      {
        descricao: 'E agora na ordem inversa.',
        tex: '\\int_{0}^{2}\\int_{0}^{1} xy\\,dy\\,dx = \\int_{0}^{2} \\frac{x}{2}\\,dx = 1 \\;\\checkmark',
      },
      {
        descricao: 'A liberdade de escolher é o que torna o teorema útil.',
        tex: '\\int_{0}^{1}\\int_{y}^{1} e^{x^{2}}\\,dx\\,dy',
        nota: 'Nessa ordem é impossível; trocando a ordem, a integral sai em duas linhas.',
      },
    ],
    vejaTambem: ['multiplas.iterada', 'multiplas.polares'],
  },
  {
    id: 'multiplas.volume',
    titulo: 'A integral dupla como volume',
    resumo: 'Com a função positiva, ela mede o volume sob a superfície.',
    definicao:
      'Assim como a integral simples de uma função positiva é a área sob a curva, a integral ' +
      'dupla de uma função positiva é o volume entre a região e a superfície. A leitura é ' +
      'literal, e vale também quando a função muda de sinal — aí o volume abaixo do plano ' +
      'conta negativo.',
    formulas: [
      { tex: 'V = \\iint_{R} f(x,y)\\,dA, \\qquad f \\geq 0' },
      { tex: '\\iint_{R} 1\\,dA = \\text{área de } R' },
    ],
    demonstracao: [
      {
        descricao: 'Com a função constante igual a 1, o volume é a própria área.',
        tex: '\\iint_{R} 1\\,dA = \\text{área}',
      },
      {
        descricao: 'Com uma altura constante h, é um prisma.',
        tex: '\\iint_{R} h\\,dA = h \\cdot \\text{área}',
      },
      {
        descricao: 'E com altura variável, o volume acompanha a superfície.',
        tex: '\\iint_{[0,1]^{2}} \\left(x + y\\right)dA = 1',
        nota: 'É o volume de uma cunha sobre o quadrado unitário.',
      },
    ],
    vejaTambem: ['multiplas.valor-medio', 'multiplas.iterada'],
  },
  {
    id: 'multiplas.valor-medio',
    titulo: 'O valor médio numa região',
    resumo: 'A integral dividida pela área.',
    definicao:
      'O valor médio de uma função sobre uma região é a integral dela dividida pela área da ' +
      'região — a mesma ideia da média em uma variável, com área no lugar de comprimento. É ' +
      'com ela que se responde qual é a temperatura média de uma placa ou a pressão média ' +
      'sobre uma superfície.',
    formulas: [{ tex: '\\bar{f} = \\frac{1}{A}\\iint_{R} f\\,dA' }],
    demonstracao: [
      {
        descricao: 'Calculamos a integral sobre o quadrado unitário.',
        tex: '\\iint_{[0,1]^{2}} \\left(x + y\\right)dA = 1',
      },
      {
        descricao: 'A área dessa região é 1.',
        tex: 'A = 1',
      },
      {
        descricao: 'Logo a média é 1.',
        tex: '\\bar{f} = 1',
        nota: 'Que é o valor da função no centro — coincidência que só ocorre em superfícies planas.',
      },
    ],
    vejaTambem: ['multiplas.volume', 'multiplas.iterada'],
  },
  {
    id: 'multiplas.polares',
    titulo: 'Polares e o jacobiano',
    resumo: 'O fator r corrige a área de cada pedacinho.',
    definicao:
      'Em regiões circulares, coordenadas polares transformam limites complicados em números ' +
      'fixos. Mas a troca cobra um preço: o elemento de área ganha um fator r. Ele não é ' +
      'decoração — pedaços mais afastados da origem são maiores, e o jacobiano é o que corrige ' +
      'isso. Esquecê-lo é o erro mais comum de toda a mudança de variáveis.',
    formulas: [
      { tex: 'x = r\\cos\\theta \\qquad y = r\\operatorname{sen}\\theta' },
      { tex: 'dA = r\\,dr\\,d\\theta' },
    ],
    demonstracao: [
      {
        descricao: 'A área do círculo, em polares, sai imediata.',
        tex: '\\int_{0}^{2\\pi}\\int_{0}^{R} r\\,dr\\,d\\theta',
      },
      {
        descricao: 'A integral em r dá metade do raio ao quadrado.',
        tex: '\\int_{0}^{R} r\\,dr = \\frac{R^{2}}{2}',
      },
      {
        descricao: 'E a integral em ângulo multiplica por uma volta.',
        tex: '2\\pi \\cdot \\frac{R^{2}}{2} = \\pi R^{2} \\;\\checkmark',
        nota: 'Sem o fator r, sairia 2πR, que é o perímetro — não a área.',
      },
      {
        descricao: 'Em cartesianas, a mesma área exigiria uma raiz nos limites.',
        tex: '\\int_{-R}^{R}\\int_{-\\sqrt{R^{2}-x^{2}}}^{\\sqrt{R^{2}-x^{2}}} dy\\,dx',
        nota: 'É o tipo de limite que polares existem para eliminar.',
      },
    ],
    exemplo: {
      enunciado: 'Integre x² + y² sobre o disco de raio 2 centrado na origem.',
      passos: [
        {
          descricao: 'Em polares, x² + y² vira r², e a área ganha o jacobiano r.',
          tex: 'x^{2} + y^{2} = r^{2} \\qquad dA = r\\,dr\\,d\\theta',
        },
        {
          descricao: 'A integral em r, de 0 a 2.',
          tex: '\\int_{0}^{2} r^{2} \\cdot r\\,dr = \\left[\\frac{r^{4}}{4}\\right]_{0}^{2} = 4',
        },
        {
          descricao: 'A integral em θ, de 0 a 2π.',
          tex: '\\int_{0}^{2\\pi} 4\\,d\\theta = 8\\pi \\approx 25{,}13',
        },
      ],
    },
    vejaTambem: ['multiplas.iterada', 'multiplas.fubini'],
  },
];
