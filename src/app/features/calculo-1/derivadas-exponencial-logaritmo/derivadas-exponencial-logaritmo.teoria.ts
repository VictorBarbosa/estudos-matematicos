import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_DERIVADAS_EXP_LOG: readonly Teoria[] = [
  {
    id: 'exp-log.exponencial',
    titulo: 'A função que é a própria derivada',
    resumo: 'A exponencial natural não muda de forma ao ser derivada.',
    definicao:
      'A exponencial de base e é a única função não nula que coincide com a própria derivada. ' +
      'Essa propriedade é o que a torna a solução natural de todo crescimento proporcional ao ' +
      'que já existe: juros contínuos, decaimento radioativo, carga de um capacitor.',
    formulas: [
      { tex: "\\left[e^{x}\\right]' = e^{x}" },
      { tex: "\\left[ae^{x}\\right]' = ae^{x}", legenda: 'O coeficiente apenas acompanha.' },
    ],
    demonstracao: [
      {
        descricao: 'Pela definição, o fator que depende de x sai do limite.',
        tex: "\\left[e^{x}\\right]' = \\lim_{h \\to 0}\\frac{e^{x+h} - e^{x}}{h} = e^{x}\\lim_{h \\to 0}\\frac{e^{h} - 1}{h}",
      },
      {
        descricao: 'O limite que sobra vale exatamente um — é o que define a base e.',
        tex: '\\lim_{h \\to 0}\\frac{e^{h} - 1}{h} = 1',
        nota: 'Com qualquer outra base esse limite daria o logaritmo natural da base.',
      },
      {
        descricao: 'Sobrando apenas o fator de fora, a derivada é a própria função.',
        tex: "\\left[e^{x}\\right]' = e^{x}",
      },
    ],
    vejaTambem: ['exp-log.cadeia-no-expoente', 'exp-log.base-qualquer', 'exp-log.logaritmo'],
  },
  {
    id: 'exp-log.cadeia-no-expoente',
    titulo: 'O fator que desce do expoente',
    resumo: 'Um múltiplo de x no expoente vira fator na derivada.',
    definicao:
      'Quando o expoente é um múltiplo de x, a regra da cadeia traz esse múltiplo para fora. É ' +
      'ele que controla a velocidade do crescimento: um expoente duas vezes maior dobra a taxa ' +
      'em todo ponto, e um expoente negativo transforma crescimento em decaimento.',
    formulas: [
      { tex: "\\left[e^{kx}\\right]' = ke^{kx}" },
      { tex: "\\left[e^{-kx}\\right]' = -ke^{-kx}", legenda: 'O sinal negativo é o decaimento.' },
    ],
    demonstracao: [
      {
        descricao: 'Separamos as camadas.',
        tex: 'u = 3x \\qquad f = e^{u}',
      },
      {
        descricao: 'A exponencial se mantém, e a derivada do expoente multiplica.',
        tex: "f'(x) = e^{3x}\\cdot 3 = 3e^{3x}",
      },
      {
        descricao: 'Em zero a diferença aparece: a inclinação é três vezes maior.',
        tex: "f'(0) = 3 \\quad\\text{contra}\\quad \\left[e^{x}\\right]'(0) = 1",
        nota: 'Com expoente igual a x o fator vale 1, e por isso ele passa despercebido.',
      },
    ],
    vejaTambem: ['exp-log.exponencial', 'exp-log.produto', 'exp-log.base-ou-expoente'],
  },
  {
    id: 'exp-log.base-ou-expoente',
    titulo: 'Base ou expoente: regras diferentes',
    resumo: 'Onde o x está decide qual regra vale.',
    definicao:
      'Na potência o x é a base e o expoente é constante; na exponencial é o contrário. São ' +
      'funções de comportamento muito diferente, e aplicar a regra de uma na outra é o engano ' +
      'mais caro do tópico, porque o resultado parece plausível e não é.',
    formulas: [
      { tex: "\\left[x^{n}\\right]' = nx^{n-1}", legenda: 'Base variável, expoente constante.' },
      { tex: "\\left[a^{x}\\right]' = a^{x}\\ln a", legenda: 'Base constante, expoente variável.' },
    ],
    demonstracao: [
      {
        descricao: 'Comparando as duas no mesmo ponto, com os mesmos números.',
        tex: 'f(x) = x^{2} \\qquad g(x) = 2^{x}',
      },
      {
        descricao: 'As duas valem 4 em x igual a 2, mas as derivadas discordam.',
        tex: "f'(2) = 4 \\qquad g'(2) = 4\\ln 2 \\approx 2{,}77",
      },
      {
        descricao: 'E mais adiante a exponencial ultrapassa qualquer potência.',
        tex: 'f(10) = 100 \\qquad g(10) = 1024',
        nota: 'Crescimento exponencial sempre vence crescimento polinomial, a partir de algum ponto.',
      },
    ],
    vejaTambem: ['exp-log.base-qualquer', 'exp-log.exponencial'],
  },
  {
    id: 'exp-log.base-qualquer',
    titulo: 'Exponencial de base qualquer',
    resumo: 'Fora da base e sobra um fator: o logaritmo natural da base.',
    definicao:
      'Toda exponencial se reescreve na base e, e daí sai o fator que aparece na derivada. É ' +
      'exatamente esse fator que justifica chamar e de base natural: só com ela ele vale um e ' +
      'desaparece da conta.',
    formulas: [
      { tex: 'a^{x} = e^{x\\ln a}' },
      { tex: "\\left[a^{x}\\right]' = a^{x}\\ln a" },
    ],
    demonstracao: [
      {
        descricao: 'Reescrevemos na base natural.',
        tex: '2^{x} = e^{x\\ln 2}',
      },
      {
        descricao: 'Derivando pela cadeia, o logaritmo da base vira fator.',
        tex: "\\left[e^{x\\ln 2}\\right]' = e^{x\\ln 2}\\ln 2 = 2^{x}\\ln 2",
      },
      {
        descricao: 'Com base e o fator some, porque o logaritmo natural de e vale um.',
        tex: '\\ln e = 1',
        nota: 'É só por isso que a exponencial natural é a própria derivada.',
      },
    ],
    vejaTambem: ['exp-log.exponencial', 'exp-log.base-ou-expoente', 'exp-log.logaritmo-de-base'],
  },
  {
    id: 'exp-log.logaritmo',
    titulo: 'A derivada mais útil da engenharia',
    resumo: 'O logaritmo natural vira o inverso de x.',
    definicao:
      'A derivada do logaritmo natural é um sobre x. Ela aparece sempre que uma grandeza varia ' +
      'proporcionalmente ao inverso do que já existe, e é a única primitiva que faltava à ' +
      'tabela das potências, já que x elevado a menos um não tem primitiva polinomial.',
    formulas: [
      { tex: "\\left[\\ln x\\right]' = \\frac{1}{x}, \\quad x > 0" },
      { tex: "\\left[a\\ln x\\right]' = \\frac{a}{x}" },
    ],
    demonstracao: [
      {
        descricao: 'Partimos da relação entre as duas funções inversas.',
        tex: 'e^{\\ln x} = x',
      },
      {
        descricao: 'Derivando os dois lados, a cadeia age no lado esquerdo.',
        tex: "e^{\\ln x}\\cdot\\left[\\ln x\\right]' = 1",
      },
      {
        descricao: 'Mas a exponencial do logaritmo é o próprio x.',
        tex: "x\\cdot\\left[\\ln x\\right]' = 1",
      },
      {
        descricao: 'Isolando, aparece o inverso.',
        tex: "\\left[\\ln x\\right]' = \\frac{1}{x}",
        nota: 'A derivada cai quando x cresce: o logaritmo sobe cada vez mais devagar.',
      },
    ],
    vejaTambem: [
      'exp-log.constante-no-logaritmo',
      'exp-log.potencia-no-logaritmo',
      'exp-log.logaritmo-de-base',
    ],
  },
  {
    id: 'exp-log.constante-no-logaritmo',
    titulo: 'A constante que some',
    resumo: 'O logaritmo de um produto vira soma, e a parcela constante derivada dá zero.',
    definicao:
      'Derivar o logaritmo de um múltiplo de x dá o mesmo resultado que derivar o logaritmo de ' +
      'x. A propriedade do produto separa a constante numa parcela, e parcela constante ' +
      'desaparece ao derivar — de modo que o múltiplo não deixa rastro.',
    formulas: [
      { tex: '\\ln(kx) = \\ln k + \\ln x' },
      { tex: "\\left[\\ln(kx)\\right]' = \\frac{1}{x}" },
    ],
    demonstracao: [
      {
        descricao: 'Separamos o produto dentro do logaritmo.',
        tex: '\\ln(5x) = \\ln 5 + \\ln x',
      },
      {
        descricao: 'A primeira parcela é um número, e sua derivada é zero.',
        tex: "\\left[\\ln 5\\right]' = 0",
      },
      {
        descricao: 'Sobra a derivada do logaritmo de x.',
        tex: "\\left[\\ln(5x)\\right]' = \\frac{1}{x}",
      },
      {
        descricao: 'Pela cadeia dá no mesmo, porque o fator se cancela.',
        tex: '\\frac{1}{5x}\\cdot 5 = \\frac{1}{x}',
        nota: 'Os dois caminhos concordam, e é isso que confirma que o cinco não sobrevive.',
      },
    ],
    vejaTambem: ['exp-log.logaritmo', 'exp-log.potencia-no-logaritmo'],
  },
  {
    id: 'exp-log.potencia-no-logaritmo',
    titulo: 'Simplificar antes de derivar',
    resumo: 'O expoente desce como fator e poupa a regra da cadeia.',
    definicao:
      'O logaritmo de uma potência é o expoente multiplicando o logaritmo. Aplicar essa ' +
      'propriedade antes de derivar troca uma conta com cadeia por uma multiplicação — e, no ' +
      'meio de um problema maior, é a diferença entre três linhas e meia página.',
    formulas: [
      { tex: '\\ln\\left(x^{n}\\right) = n\\ln x' },
      { tex: "\\left[\\ln\\left(x^{n}\\right)\\right]' = \\frac{n}{x}" },
    ],
    demonstracao: [
      {
        descricao: 'Baixamos o expoente primeiro.',
        tex: '\\ln\\left(x^{4}\\right) = 4\\ln x',
      },
      {
        descricao: 'Agora é só a derivada do logaritmo vezes uma constante.',
        tex: "\\left[4\\ln x\\right]' = \\frac{4}{x}",
      },
      {
        descricao: 'Pela cadeia, sem simplificar, chega-se ao mesmo lugar com mais trabalho.',
        tex: '\\frac{1}{x^{4}}\\cdot 4x^{3} = \\frac{4}{x}',
        nota: 'Mesma resposta, caminho mais longo e com mais chance de erro.',
      },
    ],
    vejaTambem: ['exp-log.logaritmo', 'exp-log.constante-no-logaritmo'],
  },
  {
    id: 'exp-log.logaritmo-de-base',
    titulo: 'Logaritmo de base qualquer',
    resumo: 'Mudança de base: o natural dividido por uma constante.',
    definicao:
      'Um logaritmo de base diferente de e é apenas o logaritmo natural dividido por uma ' +
      'constante. Derivar fica imediato: a constante é só um divisor, e o que varia continua ' +
      'sendo o inverso de x.',
    formulas: [
      { tex: '\\log_{b} x = \\frac{\\ln x}{\\ln b}' },
      { tex: "\\left[\\log_{b} x\\right]' = \\frac{1}{x\\ln b}" },
    ],
    demonstracao: [
      {
        descricao: 'Escrevemos o logaritmo na base natural.',
        tex: '\\log_{2} x = \\frac{\\ln x}{\\ln 2}',
      },
      {
        descricao: 'O denominador é constante e sai da derivada.',
        tex: "\\left[\\log_{2} x\\right]' = \\frac{1}{\\ln 2}\\cdot\\frac{1}{x}",
      },
      {
        descricao: 'Juntando, o logaritmo da base fica no denominador.',
        tex: "\\left[\\log_{2} x\\right]' = \\frac{1}{x\\ln 2}",
        nota: 'Na exponencial o mesmo fator multiplica; no logaritmo ele divide.',
      },
    ],
    vejaTambem: ['exp-log.logaritmo', 'exp-log.base-qualquer'],
  },
  {
    id: 'exp-log.produto',
    titulo: 'Potência vezes exponencial',
    resumo: 'A exponencial sai em evidência e sobra um colchete.',
    definicao:
      'A forma de uma potência multiplicada por uma exponencial aparece em todo sistema que ' +
      'cresce e decai ao mesmo tempo — da resposta de um circuito à concentração de um ' +
      'medicamento. A exponencial está nas duas parcelas, e pô-la em evidência deixa a conta ' +
      'pronta para achar o máximo.',
    formulas: [
      { tex: "\\left[x^{n}e^{kx}\\right]' = e^{kx}\\left(nx^{n-1} + kx^{n}\\right)" },
      { tex: 'x^{n-1}e^{kx}\\left(n + kx\\right)', legenda: 'A mesma expressão, mais fatorada.' },
    ],
    demonstracao: [
      {
        descricao: 'Aplicamos a regra do produto.',
        tex: "\\left[xe^{-x}\\right]' = 1\\cdot e^{-x} + x\\cdot\\left(-e^{-x}\\right)",
      },
      {
        descricao: 'A exponencial é comum às duas parcelas.',
        tex: 'e^{-x}\\left(1 - x\\right)',
      },
      {
        descricao: 'E o máximo aparece onde o colchete zera.',
        tex: '1 - x = 0 \\quad\\Longrightarrow\\quad x = 1',
        nota: 'Como a exponencial nunca é zero, só o colchete pode anular a derivada.',
      },
    ],
    vejaTambem: ['exp-log.exponencial', 'exp-log.cadeia-no-expoente'],
  },
];
