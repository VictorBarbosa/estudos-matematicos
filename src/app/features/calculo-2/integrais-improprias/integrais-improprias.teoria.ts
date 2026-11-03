import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_IMPROPRIAS: readonly Teoria[] = [
  {
    id: 'improprias.limite-na-borda',
    titulo: 'A borda vira um limite',
    resumo: 'Onde a integral não cabe, entra um limite.',
    definicao:
      'O Teorema Fundamental pede um intervalo fechado e um integrando contínuo nele. Quando ' +
      'uma das bordas é infinita, a saída é integrar até um valor finito e só então fazer essa ' +
      'borda crescer. A integral imprópria é, por definição, esse limite — e ela existe ' +
      'exatamente quando o limite existe.',
    formulas: [
      { tex: '\\int_{a}^{\\infty} f(x)\\,dx = \\lim_{t \\to \\infty} \\int_{a}^{t} f(x)\\,dx' },
      {
        tex: '\\int_{-\\infty}^{\\infty} f = \\int_{-\\infty}^{c} f + \\int_{c}^{\\infty} f',
        legenda: 'Com duas bordas ruins, separa-se em duas integrais.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Tomamos uma borda finita e integramos normalmente.',
        tex: '\\int_{1}^{t} \\frac{dx}{x^{2}} = \\left[-\\frac{1}{x}\\right]_{1}^{t} = 1 - \\frac{1}{t}',
      },
      {
        descricao: 'Agora deixamos a borda crescer.',
        tex: '\\lim_{t \\to \\infty}\\left(1 - \\frac{1}{t}\\right) = 1',
      },
      {
        descricao: 'O limite existe, então a integral converge e vale 1.',
        tex: '\\int_{1}^{\\infty} \\frac{dx}{x^{2}} = 1',
        nota: 'Uma região de comprimento infinito pode ter área finita — é o que este 1 diz.',
      },
      {
        descricao: 'Com o expoente 1 a conta muda de figura.',
        tex: '\\int_{1}^{t} \\frac{dx}{x} = \\ln t \\xrightarrow{t \\to \\infty} \\infty',
        nota: 'O logaritmo cresce devagar, mas cresce sem parar: aqui não há limite.',
      },
    ],
    vejaTambem: [
      'improprias.criterio-da-potencia',
      'improprias.integrando-ilimitado',
      'improprias.comparacao',
    ],
  },
  {
    id: 'improprias.criterio-da-potencia',
    titulo: 'O critério da potência',
    resumo: 'No infinito, p maior que 1; na origem, p menor que 1.',
    definicao:
      'É o resultado que se usa de olho, e o mais útil do tópico. No infinito a integral de 1 ' +
      'sobre x elevado a p converge quando p passa de 1, porque a cauda precisa cair rápido o ' +
      'bastante. Na origem o critério se inverte: ali a função explode, e só um expoente ' +
      'pequeno deixa a área finita. O expoente 1 é a fronteira, e diverge dos dois lados.',
    formulas: [
      {
        tex: '\\int_{a}^{\\infty} \\frac{dx}{x^{p}} \\; \\text{converge} \\iff p > 1',
        legenda: 'Com a positivo.',
      },
      { tex: '\\int_{0}^{b} \\frac{dx}{x^{p}} \\; \\text{converge} \\iff p < 1' },
      { tex: '\\int_{a}^{\\infty} \\frac{dx}{x^{p}} = \\frac{a^{1-p}}{p - 1}, \\quad p > 1' },
    ],
    demonstracao: [
      {
        descricao: 'Integrando a potência entre 1 e t, o expoente sobe em um.',
        tex: '\\int_{1}^{t} x^{-p}\\,dx = \\frac{t^{1-p} - 1}{1 - p}',
      },
      {
        descricao: 'Com p acima de 1, o expoente de t é negativo e o termo some.',
        tex: 'p > 1 \\;\\Longrightarrow\\; t^{1-p} \\to 0',
      },
      {
        descricao: 'Com p abaixo de 1, o expoente é positivo e o termo cresce.',
        tex: 'p < 1 \\;\\Longrightarrow\\; t^{1-p} \\to \\infty',
      },
      {
        descricao: 'Na origem a mesma conta vale, só que o termo que decide é o da borda de baixo.',
        tex: '\\int_{\\varepsilon}^{1} x^{-p}\\,dx = \\frac{1 - \\varepsilon^{1-p}}{1 - p}',
        nota: 'Agora é o épsilon que explode, e o critério se inverte.',
      },
    ],
    vejaTambem: ['improprias.limite-na-borda', 'improprias.comparacao'],
  },
  {
    id: 'improprias.integrando-ilimitado',
    titulo: 'Quando o integrando explode',
    resumo: 'A borda ruim pode estar dentro do intervalo.',
    definicao:
      'A outra espécie de integral imprópria tem intervalo finito, mas integrando que vai ao ' +
      'infinito numa das bordas, ou mesmo num ponto interno. O tratamento é o mesmo: afastar a ' +
      'borda problemática com um limite. O perigo aqui é não perceber o problema e aplicar o ' +
      'Teorema Fundamental direto, o que produz respostas absurdas.',
    formulas: [
      {
        tex: '\\int_{0}^{b} f(x)\\,dx = \\lim_{\\varepsilon \\to 0^{+}} \\int_{\\varepsilon}^{b} f(x)\\,dx',
      },
      { tex: '\\int_{0}^{1} \\frac{dx}{\\sqrt{x}} = 2' },
    ],
    demonstracao: [
      {
        descricao: 'Aplicar o Teorema Fundamental sem olhar dá um resultado impossível.',
        tex: '\\int_{-1}^{1} \\frac{dx}{x^{2}} = \\left[-\\frac{1}{x}\\right]_{-1}^{1} = -2',
        nota: 'O integrando é sempre positivo, e mesmo assim saiu área negativa.',
      },
      {
        descricao: 'O erro foi ignorar que o integrando explode em zero, dentro do intervalo.',
        tex: '\\lim_{x \\to 0} \\frac{1}{x^{2}} = \\infty',
      },
      {
        descricao: 'Separando no ponto ruim, cada metade diverge.',
        tex: '\\int_{0}^{1} \\frac{dx}{x^{2}} = \\lim_{\\varepsilon \\to 0^{+}} \\left(1 - \\frac{1}{\\varepsilon}\\right) = \\infty',
      },
      {
        descricao: 'Já a raiz, que explode mais devagar, tem área finita.',
        tex: '\\int_{0}^{1} x^{-1/2}\\,dx = \\left[2\\sqrt{x}\\right]_{0}^{1} = 2 \\;\\checkmark',
      },
    ],
    vejaTambem: ['improprias.criterio-da-potencia', 'improprias.limite-na-borda'],
  },
  {
    id: 'improprias.exponencial',
    titulo: 'A exponencial converge sempre',
    resumo: 'Ela cai mais rápido que qualquer potência.',
    definicao:
      'A integral da exponencial negativa sobre uma semirreta converge para qualquer fator ' +
      'positivo no expoente. É o resultado por trás de vida média, de tempo de resposta de um ' +
      'circuito e da normalização da distribuição exponencial: a área acumulada ao longo de ' +
      'todo o tempo é finita, mesmo que o processo nunca termine de fato.',
    formulas: [
      { tex: '\\int_{a}^{\\infty} e^{-kx}\\,dx = \\frac{e^{-ka}}{k}, \\quad k > 0' },
      { tex: '\\int_{0}^{\\infty} e^{-kx}\\,dx = \\frac{1}{k}' },
    ],
    demonstracao: [
      {
        descricao: 'A primitiva traz o fator do expoente para o denominador.',
        tex: '\\int e^{-kx}\\,dx = -\\frac{e^{-kx}}{k} + C',
      },
      {
        descricao: 'Avaliando até t, o termo de cima desaba.',
        tex: '\\left[-\\frac{e^{-kx}}{k}\\right]_{a}^{t} = \\frac{e^{-ka} - e^{-kt}}{k}',
      },
      {
        descricao: 'E a exponencial negativa tende a zero mais rápido que qualquer potência.',
        tex: '\\lim_{t \\to \\infty} e^{-kt} = 0',
        nota: 'É por isso que este caso nunca diverge, por menor que seja o fator k.',
      },
    ],
    vejaTambem: ['improprias.limite-na-borda', 'improprias.comparacao'],
  },
  {
    id: 'improprias.arcotangente',
    titulo: 'Quando a primitiva é limitada',
    resumo: 'Primitiva com assíntota horizontal garante convergência.',
    definicao:
      'A integral de 1 sobre 1 mais x ao quadrado tem primitiva arco-tangente, que é limitada: ' +
      'por maior que seja a borda, o valor não passa de meio pi. Toda vez que a primitiva tem ' +
      'assíntota horizontal, a integral imprópria converge — e o valor é a diferença entre a ' +
      'assíntota e a primitiva na borda de baixo.',
    formulas: [
      { tex: '\\int \\frac{dx}{1 + x^{2}} = \\arctan x + C' },
      { tex: '\\int_{a}^{\\infty} \\frac{dx}{1 + x^{2}} = \\frac{\\pi}{2} - \\arctan a' },
      { tex: '\\int_{-\\infty}^{\\infty} \\frac{dx}{1 + x^{2}} = \\pi' },
    ],
    demonstracao: [
      {
        descricao: 'O arco-tangente tem duas assíntotas horizontais.',
        tex: '\\lim_{x \\to \\infty} \\arctan x = \\frac{\\pi}{2} \\qquad \\lim_{x \\to -\\infty} \\arctan x = -\\frac{\\pi}{2}',
      },
      {
        descricao: 'Então a integral sobre toda a reta é a distância entre elas.',
        tex: '\\frac{\\pi}{2} - \\left(-\\frac{\\pi}{2}\\right) = \\pi',
      },
      {
        descricao: 'Partindo de zero, sobra metade.',
        tex: '\\int_{0}^{\\infty} \\frac{dx}{1 + x^{2}} = \\frac{\\pi}{2}',
        nota: 'Esta é a integral que normaliza a distribuição de Cauchy.',
      },
    ],
    vejaTambem: ['improprias.limite-na-borda', 'improprias.exponencial'],
  },
  {
    id: 'improprias.comparacao',
    titulo: 'Decidir sem calcular',
    resumo: 'Comparar com uma potência conhecida dá o veredito.',
    definicao:
      'Quase nenhum integrando interessante tem primitiva elementar. O teste da comparação ' +
      'resolve isso: se o integrando fica abaixo de algo que converge, ele converge; se fica ' +
      'acima de algo que diverge, ele diverge. O teste dá o veredito, nunca o valor — e é ' +
      'exatamente o veredito que costuma bastar.',
    formulas: [
      { tex: '0 \\leq f \\leq g \\;\\text{e}\\; \\int g \\;\\text{converge} \\Longrightarrow \\int f \\;\\text{converge}' },
      { tex: 'f \\geq g \\geq 0 \\;\\text{e}\\; \\int g \\;\\text{diverge} \\Longrightarrow \\int f \\;\\text{diverge}' },
    ],
    demonstracao: [
      {
        descricao: 'A curva de Gauss não tem primitiva elementar, mas é limitada por uma que tem.',
        tex: 'e^{-x^{2}} \\leq \\frac{1}{x^{2}}, \\quad x \\geq 1',
      },
      {
        descricao: 'E a potência de comparação converge, pelo critério do expoente.',
        tex: '\\int_{1}^{\\infty} \\frac{dx}{x^{2}} = 1',
      },
      {
        descricao: 'Logo a integral de Gauss também converge, sem que se saiba seu valor por aqui.',
        tex: '\\int_{1}^{\\infty} e^{-x^{2}}\\,dx \\;\\text{converge}',
        nota: 'Sobre toda a reta ela vale a raiz de pi, o que exige outra técnica inteira.',
      },
      {
        descricao: 'A desigualdade só serve no sentido em que aponta.',
        tex: '\\frac{1 + \\ln x}{x} \\geq \\frac{1}{x}, \\quad x \\geq 1 \\;\\Longrightarrow\\; \\text{diverge}',
        nota: 'Ficar acima de algo que diverge é o que condena a integral.',
      },
    ],
    vejaTambem: ['improprias.criterio-da-potencia', 'improprias.limite-na-borda'],
  },
];
