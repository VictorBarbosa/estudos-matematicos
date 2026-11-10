import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_PARCIAIS: readonly Teoria[] = [
  {
    id: 'parciais.uma-de-cada-vez',
    titulo: 'Derivar numa direção só',
    resumo: 'A outra variável vira constante, e nada mais muda.',
    definicao:
      'Com duas variáveis, perguntar "qual é a derivada" não basta: há uma taxa para cada ' +
      'direção. A derivada parcial em x responde pela direção do eixo x, tratando y como se ' +
      'fosse um número fixo. A técnica é exatamente a do Cálculo 1 — o que muda é apenas o que ' +
      'se considera constante.',
    formulas: [
      { tex: '\\frac{\\partial f}{\\partial x} = \\lim_{h \\to 0}\\frac{f(x+h,\\,y) - f(x,y)}{h}' },
      { tex: '\\frac{\\partial}{\\partial x}\\left(x^{2}y\\right) = 2xy' },
    ],
    demonstracao: [
      {
        descricao: 'Tomamos uma função com as duas variáveis.',
        tex: 'f(x,y) = 3x^{2} + 2y^{3} + 5xy',
      },
      {
        descricao: 'Derivando em x, o termo em y sozinho some.',
        tex: '\\frac{\\partial f}{\\partial x} = 6x + 5y',
        nota: 'O y do termo misto fica como coeficiente — ele não desaparece.',
      },
      {
        descricao: 'Derivando em y, é o termo em x sozinho que some.',
        tex: '\\frac{\\partial f}{\\partial y} = 6y^{2} + 5x',
      },
      {
        descricao: 'As duas taxas são diferentes, e isso é esperado.',
        tex: '\\frac{\\partial f}{\\partial x}(1,1) = 11 \\qquad \\frac{\\partial f}{\\partial y}(1,1) = 11',
        nota: 'Coincidirem num ponto é acaso; em geral elas discordam.',
      },
    ],
    exemplo: {
      enunciado: 'f(x, y) = x²y + 3y³. Calcule f_x e f_y no ponto (1, 2).',
      passos: [
        {
          descricao: 'Para f_x, y é constante: x²y deriva para 2xy e 3y³ some.',
          tex: 'f_x = 2xy \\;\\Rightarrow\\; f_x(1, 2) = 2 \\cdot 1 \\cdot 2 = 4',
        },
        {
          descricao: 'Para f_y, x é constante: x²y deriva para x² e 3y³ para 9y².',
          tex: 'f_y = x^{2} + 9y^{2} \\;\\Rightarrow\\; f_y(1, 2) = 1 + 9 \\cdot 4 = 37',
        },
      ],
    },
    vejaTambem: ['parciais.significado', 'parciais.termo-misto', 'parciais.segunda-ordem'],
  },
  {
    id: 'parciais.significado',
    titulo: 'O que a parcial mede',
    resumo: 'A inclinação de um corte da superfície.',
    definicao:
      'Fixar y e variar x corresponde a cortar a superfície com um plano vertical: o que sobra ' +
      'é uma curva de uma variável só, e a parcial é a inclinação dessa curva. É por isso que ' +
      'a técnica é a mesma do Cálculo 1 — porque o problema foi reduzido a uma dimensão.',
    formulas: [
      { tex: 'f(x,\\; y_{0}) \\;\\text{é uma função de } x \\text{ só}' },
      {
        tex: '\\frac{\\partial f}{\\partial x}(x_{0},y_{0}) = \\text{inclinação do corte em } y = y_{0}',
      },
    ],
    demonstracao: [
      {
        descricao: 'No paraboloide, cortamos com o plano y igual a 2.',
        tex: 'f(x,\\; 2) = x^{2} + 4',
      },
      {
        descricao: 'O corte é uma parábola, e sua derivada é a parcial.',
        tex: '\\frac{d}{dx}\\left(x^{2} + 4\\right) = 2x',
      },
      {
        descricao: 'Que é exatamente o que a derivada parcial devolve.',
        tex: '\\frac{\\partial f}{\\partial x} = 2x \\;\\checkmark',
        nota: 'Cada plano de corte dá uma curva; a parcial é a inclinação dela.',
      },
    ],
    vejaTambem: ['parciais.uma-de-cada-vez', 'parciais.segunda-ordem'],
  },
  {
    id: 'parciais.termo-misto',
    titulo: 'O termo que tem as duas',
    resumo: 'Em xy, derivar numa variável deixa a outra como coeficiente.',
    definicao:
      'O termo com x e y multiplicados é o que mais escapa. Derivando em x, o y fica como ' +
      'coeficiente; derivando em y, é o x que fica. Ele só desaparece quando se deriva numa ' +
      'variável que ele não tem — e, como tem as duas, isso nunca acontece.',
    formulas: [
      {
        tex: '\\frac{\\partial}{\\partial x}(cxy) = cy \\qquad \\frac{\\partial}{\\partial y}(cxy) = cx',
      },
    ],
    demonstracao: [
      {
        descricao: 'Tratando y como constante, o produto é linear em x.',
        tex: '5xy \\;\\longrightarrow\\; 5y',
      },
      {
        descricao: 'E tratando x como constante, é linear em y.',
        tex: '5xy \\;\\longrightarrow\\; 5x',
      },
      {
        descricao: 'Num ponto, as duas contribuições são bem diferentes.',
        tex: '(x,y) = (3,\\; 1) \\;\\Longrightarrow\\; 5 \\;\\text{e}\\; 15',
        nota: 'É esse termo que acopla as duas direções e impede resolver cada uma isoladamente.',
      },
    ],
    vejaTambem: ['parciais.mista', 'parciais.uma-de-cada-vez'],
  },
  {
    id: 'parciais.segunda-ordem',
    titulo: 'Segunda parcial',
    resumo: 'A concavidade do corte naquela direção.',
    definicao:
      'Derivar duas vezes na mesma variável mede a concavidade do corte correspondente. O ' +
      'sinal dela diz se a superfície, naquela direção, abre para cima ou para baixo — e é com ' +
      'essa informação, nas duas direções, que se classifica um ponto crítico.',
    formulas: [
      {
        tex: '\\frac{\\partial^{2} f}{\\partial x^{2}} = \\frac{\\partial}{\\partial x}\\left(\\frac{\\partial f}{\\partial x}\\right)',
      },
      { tex: 'f_{xx} > 0 \\;\\Longrightarrow\\; \\text{corte com concavidade para cima}' },
    ],
    demonstracao: [
      {
        descricao: 'Começamos pela primeira parcial.',
        tex: 'f(x,y) = 3x^{2} + 2y^{2} \\;\\Longrightarrow\\; f_{x} = 6x',
      },
      {
        descricao: 'E derivamos de novo na mesma variável.',
        tex: 'f_{xx} = 6',
      },
      {
        descricao: 'Numa quádrica ela é constante: a concavidade é a mesma em todo ponto.',
        tex: 'f_{yy} = 4',
        nota: 'Com as duas positivas, a superfície é um paraboloide que abre para cima.',
      },
      {
        descricao: 'Sinais opostos produzem uma sela.',
        tex: 'f_{xx} = 6 \\qquad f_{yy} = -4 \\;\\Longrightarrow\\; \\text{sela}',
      },
    ],
    vejaTambem: ['parciais.mista', 'parciais.significado'],
  },
  {
    id: 'parciais.mista',
    titulo: 'A parcial mista e Clairaut',
    resumo: 'Derivar numa e depois na outra — e a ordem não importa.',
    definicao:
      'A parcial mista deriva uma vez em cada variável, e mede como a inclinação numa direção ' +
      'muda ao se deslocar na outra. O teorema de Clairaut garante que, com as parciais ' +
      'contínuas, a ordem de derivação não altera o resultado — o que é conveniente e nada ' +
      'óbvio.',
    formulas: [
      {
        tex: '\\frac{\\partial^{2} f}{\\partial y\\,\\partial x} = \\frac{\\partial^{2} f}{\\partial x\\,\\partial y}',
      },
      { tex: '\\frac{\\partial^{2}}{\\partial y\\,\\partial x}(cxy) = c' },
    ],
    demonstracao: [
      {
        descricao: 'Derivando primeiro em x.',
        tex: 'f = 3x^{2}y + 5xy \\;\\Longrightarrow\\; f_{x} = 6xy + 5y',
      },
      {
        descricao: 'E agora em y.',
        tex: 'f_{xy} = 6x + 5',
      },
      {
        descricao: 'Pela ordem inversa, primeiro em y.',
        tex: 'f_{y} = 3x^{2} + 5x',
      },
      {
        descricao: 'E depois em x — mesmo resultado.',
        tex: 'f_{yx} = 6x + 5 \\;\\checkmark',
        nota: 'A igualdade vale sempre que as parciais de segunda ordem são contínuas.',
      },
    ],
    exemplo: {
      enunciado: 'f(x, y) = x³y². Compare f_xy e f_yx.',
      passos: [
        {
          descricao: 'Primeiro em x, depois em y.',
          tex: 'f_x = 3x^{2}y^{2} \\;\\Rightarrow\\; f_{xy} = 6x^{2}y',
        },
        {
          descricao: 'Primeiro em y, depois em x.',
          tex: 'f_y = 2x^{3}y \\;\\Rightarrow\\; f_{yx} = 6x^{2}y',
        },
        {
          descricao: 'As duas coincidem, como garante Clairaut. No ponto (1, 1):',
          tex: 'f_{xy}(1, 1) = f_{yx}(1, 1) = 6',
        },
      ],
    },
    vejaTambem: ['parciais.termo-misto', 'parciais.segunda-ordem'],
  },
];
