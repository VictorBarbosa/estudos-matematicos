import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_LINHA: readonly Teoria[] = [
  {
    id: 'linha.parametrizar',
    titulo: 'Integrar ao longo de um caminho',
    resumo: 'O caminho vira parâmetro, e a integral vira simples.',
    definicao:
      'Uma integral de linha acumula valores ao longo de uma curva, e não sobre um intervalo. ' +
      'A técnica é sempre a mesma: parametrizar a curva, substituir, e o que sobra é uma ' +
      'integral comum no parâmetro. É a ponte entre as equações paramétricas e a integração.',
    formulas: [
      {
        tex: '\\int_{C} \\vec{F} \\cdot d\\vec{r} = \\int_{a}^{b} \\vec{F}(\\vec{r}(t)) \\cdot \\vec{r}\\,^{\\prime}(t)\\,dt',
      },
      { tex: '\\vec{r}(t) = \\left(x(t),\\; y(t)\\right)' },
    ],
    demonstracao: [
      {
        descricao: 'Parametrizamos o segmento de (0,0) a (1,2).',
        tex: '\\vec{r}(t) = (t,\\; 2t), \\quad 0 \\leq t \\leq 1',
      },
      {
        descricao: 'O vetor tangente é a derivada.',
        tex: '\\vec{r}\\,^{\\prime}(t) = (1,\\; 2)',
      },
      {
        descricao: 'E a integral vira uma integral simples em t.',
        tex: '\\int_{0}^{1} \\vec{F}(t,\\; 2t) \\cdot (1,\\; 2)\\,dt',
        nota: 'Nada de novo na técnica: o difícil é montar a parametrização.',
      },
    ],
    vejaTambem: ['linha.trabalho', 'linha.caminho-fechado'],
  },
  {
    id: 'linha.trabalho',
    titulo: 'O trabalho de um campo',
    resumo: 'Só a componente ao longo do caminho conta.',
    definicao:
      'O exemplo físico que dá sentido à integral de linha é o trabalho: quanto uma força ' +
      'empurra ao longo de um percurso. O produto escalar no integrando não é detalhe técnico ' +
      '— ele é o que descarta a parte da força perpendicular ao movimento, que não realiza ' +
      'trabalho nenhum.',
    formulas: [
      { tex: 'W = \\int_{C} \\vec{F} \\cdot d\\vec{r}' },
      {
        tex: 'W = \\vec{F} \\cdot \\Delta\\vec{r}',
        legenda: 'Com força constante e caminho reto.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Com força constante e deslocamento reto, é um produto escalar só.',
        tex: '\\vec{F} = (3,\\; 4) \\qquad \\Delta\\vec{r} = (2,\\; 0)',
      },
      {
        descricao: 'Apenas a componente horizontal trabalha.',
        tex: 'W = 3(2) + 4(0) = 6',
        nota: 'A componente vertical da força não contribui com nada.',
      },
      {
        descricao: 'Perpendicular ao movimento, o trabalho é nulo.',
        tex: '\\vec{F} \\perp \\Delta\\vec{r} \\;\\Longrightarrow\\; W = 0',
        nota: 'É por isso que a força centrípeta não realiza trabalho num movimento circular.',
      },
      {
        descricao: 'Inverter o sentido do percurso inverte o sinal.',
        tex: '\\int_{-C} \\vec{F} \\cdot d\\vec{r} = -\\int_{C} \\vec{F} \\cdot d\\vec{r}',
      },
    ],
    exemplo: {
      enunciado: 'Trabalho do campo F = (y, x) ao longo de r(t) = (t, t²), com t de 0 a 1.',
      passos: [
        {
          descricao: 'O campo sobre a curva e a velocidade da parametrização.',
          tex: "\\mathbf{F}(\\mathbf{r}(t)) = (t^{2},\\; t) \\qquad \\mathbf{r}'(t) = (1,\\; 2t)",
        },
        {
          descricao: 'O produto escalar dá o integrando.',
          tex: "\\mathbf{F} \\cdot \\mathbf{r}' = t^{2} \\cdot 1 + t \\cdot 2t = 3t^{2}",
        },
        {
          descricao: 'Integramos em t.',
          tex: 'W = \\int_{0}^{1} 3t^{2}\\,dt = \\left[t^{3}\\right]_{0}^{1} = 1',
          nota: 'F é o gradiente de xy, que vale 0 em (0, 0) e 1 em (1, 1): o caminho não importa.',
        },
      ],
    },
    vejaTambem: ['linha.conservativo', 'linha.parametrizar'],
  },
  {
    id: 'linha.caminho-fechado',
    titulo: 'Caminho fechado',
    resumo: 'Voltar pelo mesmo caminho sempre cancela.',
    definicao:
      'Percorrer um caminho e voltar por ele desfaz exatamente o trabalho feito, em qualquer ' +
      'campo: o vetor tangente inverte e o integrando troca de sinal. Já um caminho fechado ' +
      'que não repete o trajeto — uma volta num circuito — pode dar trabalho diferente de ' +
      'zero, e isso distingue campos conservativos dos demais.',
    formulas: [
      { tex: '\\oint_{C} \\vec{F} \\cdot d\\vec{r}' },
      {
        tex: '\\oint_{C} \\nabla\\varphi \\cdot d\\vec{r} = 0',
        legenda: 'Num campo conservativo, sempre zero.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Na volta, o parâmetro percorre o caminho ao contrário.',
        tex: '\\vec{r}\\,^{\\prime}(t) \\;\\longrightarrow\\; -\\vec{r}\\,^{\\prime}(t)',
      },
      {
        descricao: 'O integrando troca de sinal, e as duas metades se cancelam.',
        tex: 'W_{ida} + W_{volta} = 0',
      },
      {
        descricao: 'Mas numa volta que não repete o trajeto, pode sobrar algo.',
        tex: '\\oint_{C} \\left(-y,\\; x\\right) \\cdot d\\vec{r} = 2\\,\\text{área}',
        nota: 'Esse campo não é conservativo, e a circulação dele mede a área cercada.',
      },
    ],
    vejaTambem: ['linha.conservativo', 'linha.trabalho'],
  },
  {
    id: 'linha.conservativo',
    titulo: 'Campos conservativos',
    resumo: 'O trabalho depende só das pontas, não do caminho.',
    definicao:
      'Quando o campo é o gradiente de alguma função, o trabalho entre dois pontos é a ' +
      'diferença dessa função nas pontas — e o caminho deixa de importar. É o que acontece com ' +
      'a gravidade e com a força elétrica, e é a razão de existir energia potencial: ela é ' +
      'essa função.',
    formulas: [
      {
        tex: '\\vec{F} = \\nabla\\varphi \\;\\Longrightarrow\\; \\int_{C} \\vec{F} \\cdot d\\vec{r} = \\varphi(B) - \\varphi(A)',
      },
      {
        tex: '\\frac{\\partial P}{\\partial y} = \\frac{\\partial Q}{\\partial x}',
        legenda: 'O teste que detecta um campo conservativo.',
      },
    ],
    demonstracao: [
      {
        descricao: 'O campo é o gradiente de uma função potencial.',
        tex: '\\vec{F} = (2x,\\; 2y) = \\nabla\\left(x^{2} + y^{2}\\right)',
      },
      {
        descricao: 'Então o trabalho é a diferença do potencial.',
        tex: 'W = \\left(x_{B}^{2} + y_{B}^{2}\\right) - \\left(x_{A}^{2} + y_{A}^{2}\\right)',
        nota: 'Por qualquer caminho: reto, curvo, longo ou curto.',
      },
      {
        descricao: 'Num caminho fechado, as pontas coincidem.',
        tex: '\\oint \\vec{F} \\cdot d\\vec{r} = 0',
      },
      {
        descricao: 'O teste das parciais cruzadas detecta o caso.',
        tex: '\\frac{\\partial}{\\partial y}(2x) = 0 = \\frac{\\partial}{\\partial x}(2y) \\;\\checkmark',
        nota: 'É a condição de Clairaut aplicada à função potencial que se procura.',
      },
    ],
    vejaTambem: ['linha.caminho-fechado', 'linha.trabalho'],
  },
];
