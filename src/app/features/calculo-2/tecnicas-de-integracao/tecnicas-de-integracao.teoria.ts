import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_TECNICAS: readonly Teoria[] = [
  {
    id: 'tecnicas.substituicao',
    titulo: 'Substituição',
    resumo: 'A regra da cadeia lida ao contrário.',
    definicao:
      'Quando o integrando contém uma função composta e, por perto, a derivada do miolo, a ' +
      'substituição desfaz a cadeia. Troca-se o miolo por u, e a integral vira uma muito ' +
      'mais simples.',
    formulas: [
      { tex: "\\int f(g(x))\\,g'(x)\\,dx = \\int f(u)\\,du, \\quad u = g(x)" },
      { tex: '\\int (ax+b)^{n}\\,dx = \\frac{(ax+b)^{n+1}}{a(n+1)} + C' },
    ],
    demonstracao: [
      {
        descricao: 'Escolhemos o miolo como nova variável.',
        tex: 'u = 2x + 1 \\;\\Rightarrow\\; du = 2\\,dx',
      },
      {
        descricao: 'Trocamos dx por du/2.',
        tex: '\\int (2x+1)^{3}\\,dx = \\int u^{3}\\,\\frac{du}{2}',
      },
      {
        descricao: 'Agora é a regra da potência simples.',
        tex: '= \\frac{1}{2} \\cdot \\frac{u^{4}}{4} = \\frac{u^{4}}{8}',
      },
      {
        descricao: 'Voltamos à variável original.',
        tex: '= \\frac{(2x+1)^{4}}{8} + C',
        nota: 'Derivando de volta, a cadeia devolve o fator 2 e confirma o resultado.',
      },
    ],
    vejaTambem: ['tecnicas.por-partes', 'tecnicas.escolha'],
  },
  {
    id: 'tecnicas.por-partes',
    titulo: 'Integração por partes',
    resumo: 'Vem da regra do produto, isolada.',
    definicao:
      'Quando o integrando é um produto de naturezas diferentes — um polinômio vezes uma ' +
      'exponencial, por exemplo — a integração por partes troca a integral original por ' +
      'outra, mais fácil.',
    formulas: [
      { tex: '\\int u\\,dv = uv - \\int v\\,du' },
    ],
    demonstracao: [
      {
        descricao: 'Partimos da regra do produto.',
        tex: "(uv)' = u'v + uv'",
      },
      {
        descricao: 'Integrando os dois lados.',
        tex: "uv = \\int u'v\\,dx + \\int uv'\\,dx",
      },
      {
        descricao: 'Isolando uma das integrais.',
        tex: "\\int uv'\\,dx = uv - \\int u'v\\,dx",
        nota: 'Em notação compacta: ∫u dv = uv − ∫v du.',
      },
      {
        descricao: 'A escolha de u deve simplificar a nova integral.',
        tex: '\\int x e^{x}\\,dx: \\; u = x \\;\\Rightarrow\\; du = dx',
        nota: 'Derivar x o faz sumir; derivar eˣ não muda nada. Por isso u = x.',
      },
    ],
    vejaTambem: ['tecnicas.substituicao', 'tecnicas.escolha'],
  },
  {
    id: 'tecnicas.escolha',
    titulo: 'Qual técnica usar',
    resumo: 'Procure a derivada do miolo; se não houver, tente por partes.',
    definicao:
      'A substituição serve quando o integrando tem uma composição acompanhada da derivada ' +
      'interna. Por partes serve para produtos de naturezas diferentes. Reconhecer o padrão ' +
      'é metade do trabalho.',
    formulas: [
      { tex: "\\text{composta} + g' \\;\\to\\; \\text{substituição}" },
      { tex: '\\text{polinômio} \\times \\text{exponencial ou trig.} \\;\\to\\; \\text{por partes}' },
    ],
    demonstracao: [
      {
        descricao: 'Aqui o x de fora é quase a derivada de x²+1: substituição.',
        tex: '\\int x\\sqrt{x^{2}+1}\\,dx \\;\\Rightarrow\\; u = x^{2}+1',
      },
      {
        descricao: 'Aqui não há derivada interna à vista: por partes.',
        tex: '\\int x\\cos x\\,dx \\;\\Rightarrow\\; u = x,\\; dv = \\cos x\\,dx',
      },
      {
        descricao: 'E muitas integrais simplesmente não têm primitiva elementar.',
        tex: '\\int e^{-x^{2}}\\,dx',
        nota: 'Nesses casos resta a integração numérica — como a soma de Riemann.',
      },
    ],
    vejaTambem: ['tecnicas.substituicao', 'tecnicas.por-partes'],
  },
  {
    id: 'tecnicas.fracoes-parciais',
    titulo: 'Frações parciais',
    resumo: 'Quebrar uma fração em parcelas simples, cada uma com primitiva conhecida.',
    definicao:
      'Uma fração cujo denominador fatora pode ser reescrita como soma de frações mais simples, ' +
      'uma por fator. Isso importa porque não existe regra para integrar um quociente, mas ' +
      'cada parcela A/(x − r) integra direto em A·ln|x − r|. A técnica é o caminho inverso de ' +
      'somar frações com denominadores diferentes.',
    formulas: [
      {
        tex: '\\frac{px + q}{(x - r_1)(x - r_2)} = \\frac{A}{x - r_1} + \\frac{B}{x - r_2}',
        legenda: 'Dois fatores lineares distintos: uma parcela para cada.',
      },
      {
        tex: '\\int \\frac{A}{x - r}\\,dx = A\\ln|x - r| + C',
        legenda: 'A primitiva de cada parcela. O módulo não é decoração.',
      },
      {
        tex: 'A = \\frac{p r_1 + q}{r_1 - r_2} \\qquad B = \\frac{p r_2 + q}{r_2 - r_1}',
        legenda: 'Os coeficientes, obtidos avaliando a identidade em cada raiz.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Fatoramos o denominador e propomos a decomposição.',
        tex: '\\frac{5x - 1}{(x - 1)(x + 2)} = \\frac{A}{x - 1} + \\frac{B}{x + 2}',
      },
      {
        descricao: 'Multiplicamos tudo pelo denominador comum.',
        tex: '5x - 1 = A(x + 2) + B(x - 1)',
      },
      {
        descricao: 'Avaliar em x = 1 mata o termo de B e entrega A.',
        tex: '4 = 3A \\;\\Rightarrow\\; A = \\frac{4}{3}',
        nota:
          'Substituir as raízes é mais rápido que montar o sistema: cada raiz anula um dos ' +
          'termos.',
      },
      {
        descricao: 'Avaliar em x = −2 entrega B.',
        tex: '-11 = -3B \\;\\Rightarrow\\; B = \\frac{11}{3}',
      },
      {
        descricao: 'Agora cada parcela integra pela regra do logaritmo.',
        tex: '\\int \\frac{5x - 1}{(x-1)(x+2)}dx = \\frac{4}{3}\\ln|x-1| + \\frac{11}{3}\\ln|x+2| + C',
      },
    ],
    vejaTambem: ['tecnicas.substituicao', 'tecnicas.escolha', 'fatoracao.diferenca'],
  },
];
