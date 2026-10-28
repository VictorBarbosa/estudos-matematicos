import { Teoria } from '@core/teoria/teoria.model';

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
        tex: 'u = 2x + 1 \;\\Rightarrow\; du = 2\\,dx',
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
        tex: '\\int x e^{x}\\,dx: \; u = x \;\\Rightarrow\; du = dx',
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
      { tex: "\\text{composta} + g' \;\\to\; \\text{substituição}" },
      { tex: '\\text{polinômio} \\times \\text{exponencial ou trig.} \;\\to\; \\text{por partes}' },
    ],
    demonstracao: [
      {
        descricao: 'Aqui o x de fora é quase a derivada de x²+1: substituição.',
        tex: '\\int x\\sqrt{x^{2}+1}\\,dx \;\\Rightarrow\; u = x^{2}+1',
      },
      {
        descricao: 'Aqui não há derivada interna à vista: por partes.',
        tex: '\\int x\\cos x\\,dx \;\\Rightarrow\; u = x,\; dv = \\cos x\\,dx',
      },
      {
        descricao: 'E muitas integrais simplesmente não têm primitiva elementar.',
        tex: '\\int e^{-x^{2}}\\,dx',
        nota: 'Nesses casos resta a integração numérica — como a soma de Riemann.',
      },
    ],
    vejaTambem: ['tecnicas.substituicao', 'tecnicas.por-partes'],
  },
];
