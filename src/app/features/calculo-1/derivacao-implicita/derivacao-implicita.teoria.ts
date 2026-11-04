import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_DERIVACAO_IMPLICITA: readonly Teoria[] = [
  {
    id: 'implicita.quando-usar',
    titulo: 'Quando isolar y não é opção',
    resumo: 'Nem toda curva é gráfico de função.',
    definicao:
      'Uma circunferência tem dois valores de y para cada x, e portanto não é gráfico de ' +
      'função nenhuma. Isolar obriga a escolher um ramo e a carregar uma raiz pelo resto da ' +
      'conta; em curvas como o fólio de Descartes, isolar é simplesmente impossível. A saída é ' +
      'derivar a equação como ela está.',
    formulas: [
      { tex: 'x^{2} + y^{2} = 25' },
      { tex: 'y = \\pm\\sqrt{25 - x^{2}}', legenda: 'Isolar custa um sinal e uma raiz.' },
      { tex: 'x^{3} + y^{3} = 6xy', legenda: 'Aqui não há como isolar.' },
    ],
    demonstracao: [
      {
        descricao: 'Pelo caminho explícito, escolhemos o ramo de cima e derivamos a raiz.',
        tex: "y' = \\frac{-x}{\\sqrt{25 - x^{2}}}",
      },
      {
        descricao: 'Mas a própria raiz é y, de modo que a expressão se simplifica.',
        tex: "y' = -\\frac{x}{y}",
      },
      {
        descricao: 'A derivação implícita chega direto a essa forma, e vale nos dois ramos.',
        tex: "2x + 2yy' = 0 \\quad\\Longrightarrow\\quad y' = -\\frac{x}{y}",
        nota: 'Uma conta só, e nenhuma escolha de ramo.',
      },
    ],
    vejaTambem: ['implicita.cadeia', 'implicita.isolamento', 'implicita.tangente'],
  },
  {
    id: 'implicita.cadeia',
    titulo: 'y é função de x',
    resumo: 'Cada termo em y ganha um fator dy/dx.',
    definicao:
      'Toda a técnica repousa numa suposição: y é alguma função de x, mesmo que não saibamos ' +
      'escrevê-la. Então derivar um termo em y é derivar uma função composta, e a regra da ' +
      'cadeia acrescenta o fator dy/dx. Esquecer esse fator é o erro que desmonta o método ' +
      'inteiro, porque sem ele não há o que isolar.',
    formulas: [
      { tex: '\\frac{d}{dx}\\left[y^{n}\\right] = ny^{n-1}\\frac{dy}{dx}' },
      {
        tex: '\\frac{d}{dx}\\left[xy\\right] = y + x\\frac{dy}{dx}',
        legenda: 'Produto e cadeia na mesma linha.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Derivar y ao quadrado em relação a x é derivar uma composta.',
        tex: '\\frac{d}{dx}\\left[y^{2}\\right] = 2y\\cdot\\frac{dy}{dx}',
      },
      {
        descricao: 'Num termo com x e y juntos entra também a regra do produto.',
        tex: '\\frac{d}{dx}\\left[x^{2}y\\right] = 2xy + x^{2}\\frac{dy}{dx}',
        nota: 'A primeira metade vem sem o fator; a segunda, com ele.',
      },
      {
        descricao: 'O lado constante da equação vira zero.',
        tex: '\\frac{d}{dx}\\left[25\\right] = 0',
      },
    ],
    vejaTambem: ['implicita.isolamento', 'implicita.quando-usar'],
  },
  {
    id: 'implicita.isolamento',
    titulo: 'Isolar vem depois',
    resumo: 'Primeiro deriva-se tudo; só então a derivada se isola.',
    definicao:
      'Depois de derivar, a equação é linear em dy/dx: basta juntar os termos que o contêm de ' +
      'um lado e os demais do outro. A ordem importa — tentar isolar antes de derivar devolve o ' +
      'problema de isolar y, que é justamente o que se queria evitar.',
    formulas: [
      { tex: 'A(x,y) + B(x,y)\\frac{dy}{dx} = 0' },
      { tex: '\\frac{dy}{dx} = -\\frac{A(x,y)}{B(x,y)}' },
    ],
    demonstracao: [
      {
        descricao: 'Derivamos a elipse termo a termo.',
        tex: '9x^{2} + 4y^{2} = 72 \\quad\\Longrightarrow\\quad 18x + 8y\\frac{dy}{dx} = 0',
      },
      {
        descricao: 'Passamos a parcela sem a derivada para o outro lado.',
        tex: '8y\\frac{dy}{dx} = -18x',
      },
      {
        descricao: 'E dividimos pelo que multiplica a derivada.',
        tex: '\\frac{dy}{dx} = -\\frac{18x}{8y} = -\\frac{9x}{4y}',
        nota: 'O resultado depende de x e de y — é o preço de não ter isolado y antes.',
      },
      {
        descricao: 'No ponto onde o denominador zera, a tangente é vertical.',
        tex: 'y = 0 \\quad\\Longrightarrow\\quad \\frac{dy}{dx} \\text{ não existe}',
      },
    ],
    vejaTambem: ['implicita.cadeia', 'implicita.tangente'],
  },
  {
    id: 'implicita.tangente',
    titulo: 'A reta tangente a uma curva',
    resumo: 'É o uso que justifica o método.',
    definicao:
      'Com a derivada no ponto, a reta tangente sai da equação ponto-inclinação. É o que ' +
      'permite achar a direção de uma trajetória dada por uma restrição, calcular o ângulo de ' +
      'um contato e decidir onde uma curva tem tangente horizontal ou vertical.',
    formulas: [
      { tex: 'y - y_{0} = m\\left(x - x_{0}\\right)' },
      { tex: 'm = \\left.\\frac{dy}{dx}\\right|_{(x_{0},\\,y_{0})}' },
    ],
    demonstracao: [
      {
        descricao: 'Na circunferência de raio 5, tomamos o ponto de coordenadas 3 e 4.',
        tex: 'x^{2} + y^{2} = 25',
      },
      {
        descricao: 'A derivada implícita dá a inclinação ali.',
        tex: 'm = -\\frac{3}{4}',
      },
      {
        descricao: 'E a reta sai da equação ponto-inclinação.',
        tex: 'y - 4 = -\\frac{3}{4}\\left(x - 3\\right)',
      },
      {
        descricao: 'Repare que ela é perpendicular ao raio, como a geometria já mandava.',
        tex: '-\\frac{3}{4}\\cdot\\frac{4}{3} = -1',
        nota: 'O produto das inclinações dá menos um, que é a condição de perpendicularidade.',
      },
    ],
    vejaTambem: ['implicita.isolamento', 'implicita.quando-usar'],
  },
];
