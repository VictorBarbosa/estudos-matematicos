import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_REGRESSAO: readonly Teoria[] = [
  {
    id: 'regressao.minimos-quadrados',
    titulo: 'A reta que erra menos',
    resumo: 'Minimizar a soma dos quadrados dos resíduos.',
    definicao:
      'Entre todas as retas possíveis, a de mínimos quadrados é a que torna mínima a soma dos ' +
      'quadrados das distâncias verticais aos pontos. Os quadrados existem para que erros para ' +
      'cima e para baixo não se cancelem — e para que um erro grande pese mais que dois ' +
      'pequenos, o que é o comportamento desejado quando se ajusta um modelo.',
    formulas: [
      { tex: '\\min \\sum (y_i - ax_i - b)^{2}' },
      { tex: 'a = \\frac{n\\sum xy - \\sum x\\sum y}{n\\sum x^{2} - (\\sum x)^{2}}' },
      { tex: 'b = \\bar{y} - a\\bar{x}' },
    ],
    demonstracao: [
      {
        descricao: 'Derivamos a soma dos quadrados em relação aos dois coeficientes.',
        tex: '\\frac{\\partial}{\\partial a}\\sum (y_i - ax_i - b)^{2} = 0',
      },
      {
        descricao: 'Isso produz um sistema de duas equações.',
        tex: '\\begin{cases} a\\sum x^{2} + b\\sum x = \\sum xy \\\\ a\\sum x + bn = \\sum y \\end{cases}',
      },
      {
        descricao: 'Resolvendo, saem os coeficientes.',
        tex: 'a = \\frac{\\text{cov}(x,y)}{\\text{var}(x)}',
        nota: 'A inclinação é a covariância dividida pela variância de x — e daí sai tudo o mais.',
      },
      {
        descricao: 'A reta sempre passa pelo ponto das médias.',
        tex: '(\\bar{x},\\; \\bar{y}) \\in \\text{reta}',
      },
    ],
    vejaTambem: ['regressao.reta', 'regressao.residuos', 'correlacao.pearson'],
  },
  {
    id: 'regressao.reta',
    titulo: 'Inclinação e intercepto',
    resumo: 'Um diz a taxa; o outro, onde a reta corta o eixo.',
    definicao:
      'A inclinação é a grandeza que costuma interessar: ela diz quanto y muda por unidade de ' +
      'x, e carrega as unidades das duas variáveis. O intercepto é o valor previsto em x igual ' +
      'a zero, que muitas vezes está fora da faixa medida — e aí ele é um número matemático, ' +
      'não uma previsão confiável.',
    formulas: [
      { tex: '\\hat{y} = ax + b' },
      { tex: 'a = \\frac{\\Delta y}{\\Delta x}', legenda: 'A inclinação é a taxa de variação.' },
    ],
    demonstracao: [
      {
        descricao: 'Numa medida de alongamento contra força, a inclinação é a grandeza buscada.',
        tex: 'a = \\frac{\\Delta L}{\\Delta F}',
      },
      {
        descricao: 'E o inverso dela é a constante elástica.',
        tex: 'k = \\frac{1}{a}',
        nota: 'É assim que uma constante física se extrai de uma série de medidas.',
      },
      {
        descricao: 'O intercepto, nesse caso, deveria ser zero.',
        tex: 'b \\approx 0',
        nota: 'Um intercepto grande demais denuncia erro sistemático na montagem.',
      },
    ],
    vejaTambem: ['regressao.minimos-quadrados', 'regressao.extrapolar'],
  },
  {
    id: 'regressao.residuos',
    titulo: 'O que a reta errou',
    resumo: 'Resíduo é o observado menos o previsto.',
    definicao:
      'O resíduo de um ponto é a diferença entre o valor medido e o que a reta prevê para ' +
      'aquele x. Ele tem sinal: positivo quer dizer que o ponto está acima da reta. Olhar o ' +
      'padrão dos resíduos vale mais que olhar o R²: se eles formarem uma curva, o modelo ' +
      'linear era o errado, por melhor que o ajuste pareça.',
    formulas: [
      { tex: 'e_i = y_i - \\hat{y}_i' },
      { tex: '\\sum e_i = 0', legenda: 'Os resíduos sempre somam zero na reta de mínimos quadrados.' },
    ],
    demonstracao: [
      {
        descricao: 'A reta prevê um valor para o ponto.',
        tex: '\\hat{y} = 2 \\cdot 3 + 1 = 7',
      },
      {
        descricao: 'O medido foi outro.',
        tex: 'y = 8',
      },
      {
        descricao: 'O resíduo é positivo: o ponto está acima da reta.',
        tex: 'e = 8 - 7 = 1',
      },
      {
        descricao: 'Resíduos em padrão de curva denunciam modelo errado.',
        tex: 'e_i \\;\\text{com tendência} \\;\\Longrightarrow\\; \\text{a relação não era linear}',
        nota: 'O R² pode estar alto e o modelo ainda assim ser inadequado.',
      },
    ],
    vejaTambem: ['regressao.minimos-quadrados', 'correlacao.determinacao'],
  },
  {
    id: 'regressao.extrapolar',
    titulo: 'Interpolar, sim; extrapolar, cuidado',
    resumo: 'Fora da faixa medida, a reta só supõe.',
    definicao:
      'Dentro do intervalo observado, a reta interpola, e isso é exatamente o que ela foi ' +
      'ajustada para fazer. Fora dele, ela apenas supõe que o padrão continua — e nada nos ' +
      'dados garante isso. Materiais escoam, sensores saturam, sistemas mudam de regime: a ' +
      'reta não sabe de nada disso.',
    formulas: [
      { tex: 'x_{min} \\leq x \\leq x_{max} \\;\\Longrightarrow\\; \\text{interpolação}' },
      { tex: 'x \\notin [x_{min},\\; x_{max}] \\;\\Longrightarrow\\; \\text{extrapolação}' },
    ],
    demonstracao: [
      {
        descricao: 'Medidas de deformação feitas entre 0 e 100 newtons.',
        tex: 'F \\in [0,\\; 100]\\ \\text{N}',
      },
      {
        descricao: 'A reta prevê bem dentro dessa faixa.',
        tex: '\\hat{L}(50) \\;\\text{confiável}',
      },
      {
        descricao: 'Mas em 500 newtons o material já escoou.',
        tex: '\\hat{L}(500) \\;\\text{sem sentido físico}',
        nota: 'A reta continua dando um número; é o número que deixou de significar algo.',
      },
    ],
    vejaTambem: ['regressao.reta', 'correlacao.nao-e-causa'],
  },
  {
    id: 'correlacao.pearson',
    titulo: 'O quanto os dados seguem uma reta',
    resumo: 'Entre menos um e um, e sem unidade.',
    definicao:
      'O coeficiente de Pearson é a covariância normalizada pelos dois desvios padrão. Ele ' +
      'mede o alinhamento, não a taxa: trocar metros por centímetros não o altera. Fica sempre ' +
      'entre menos um e um, e o sinal diz o sentido — mas ele só enxerga relações LINEARES.',
    formulas: [
      { tex: 'r = \\frac{\\text{cov}(x,y)}{s_x s_y}' },
      { tex: '-1 \\leq r \\leq 1' },
    ],
    demonstracao: [
      {
        descricao: 'A covariância já diz o sentido, mas depende das unidades.',
        tex: '\\text{cov} = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{n - 1}',
      },
      {
        descricao: 'Dividindo pelos dois desvios, o resultado perde a unidade.',
        tex: 'r = \\frac{\\text{cov}}{s_x s_y}',
      },
      {
        descricao: 'Alinhamento perfeito dá módulo 1.',
        tex: 'y = 2x + 1 \\;\\Longrightarrow\\; r = 1',
      },
      {
        descricao: 'E uma relação forte, porém curva, pode dar r próximo de zero.',
        tex: 'y = x^{2}, \\; x \\in [-1,\\; 1] \\;\\Longrightarrow\\; r \\approx 0',
        nota: 'A relação é perfeita e determinística, e mesmo assim o Pearson não a vê.',
      },
    ],
    vejaTambem: ['correlacao.determinacao', 'correlacao.nao-e-causa', 'regressao.minimos-quadrados'],
  },
  {
    id: 'correlacao.determinacao',
    titulo: 'Quanto a reta explica',
    resumo: 'R² é o quadrado de r, e isso muda a leitura.',
    definicao:
      'O coeficiente de determinação é a fração da variação de y que a reta consegue explicar. ' +
      'Como é o quadrado do coeficiente de correlação, ele é sempre menor — e é por isso que ' +
      'uma correlação de 0,7, que soa alta, explica menos da metade dos dados.',
    formulas: [
      { tex: 'R^{2} = r^{2}' },
      { tex: 'R^{2} = 1 - \\frac{\\sum e_i^{2}}{\\sum (y_i - \\bar{y})^{2}}' },
    ],
    demonstracao: [
      {
        descricao: 'Com correlação de 0,7.',
        tex: 'R^{2} = 0{,}49',
      },
      {
        descricao: 'Menos da metade da variação explicada.',
        tex: '49\\% \\;\\text{explicado} \\qquad 51\\% \\;\\text{não}',
        nota: 'O número que soava alto conta outra história depois de elevado ao quadrado.',
      },
      {
        descricao: 'Já com 0,95 o cenário é outro.',
        tex: 'R^{2} = 0{,}9025',
      },
      {
        descricao: 'O que sobra é a variação que os resíduos carregam.',
        tex: '1 - R^{2} = \\frac{\\text{variação não explicada}}{\\text{variação total}}',
      },
    ],
    vejaTambem: ['correlacao.pearson', 'regressao.residuos'],
  },
  {
    id: 'correlacao.nao-e-causa',
    titulo: 'Correlação não é causalidade',
    resumo: 'Andar junto não é causar.',
    definicao:
      'Duas grandezas podem andar juntas por três motivos muito diferentes: uma causa a ' +
      'outra, uma terceira causa as duas, ou foi coincidência amostral. O coeficiente não ' +
      'distingue os casos — ele mede associação, e associação é um fato estatístico, não uma ' +
      'explicação. Só o desenho do experimento decide causa.',
    formulas: [
      { tex: 'r \\neq 0 \\;\\not\\Longrightarrow\\; x \\to y' },
      { tex: 'x \\leftarrow z \\rightarrow y', legenda: 'Uma terceira variável causando as duas.' },
    ],
    demonstracao: [
      {
        descricao: 'Vendas de sorvete e afogamentos têm correlação alta.',
        tex: 'r \\approx 0{,}9',
      },
      {
        descricao: 'Mas nenhuma das duas causa a outra.',
        tex: '\\text{calor} \\rightarrow \\text{sorvete} \\qquad \\text{calor} \\rightarrow \\text{banhos de mar}',
        nota: 'A terceira variável explica as duas, e some da análise se não for medida.',
      },
      {
        descricao: 'E com amostras pequenas, o acaso basta.',
        tex: 'n = 4 \\;\\Longrightarrow\\; r \\;\\text{alto por sorte não é raro}',
      },
    ],
    vejaTambem: ['correlacao.pearson', 'regressao.extrapolar'],
  },
];
