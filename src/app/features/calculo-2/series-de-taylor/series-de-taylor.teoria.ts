import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_TAYLOR: readonly Teoria[] = [
  {
    id: 'taylor.polinomio',
    titulo: 'Trocar a função por um polinômio',
    resumo: 'Perto de um ponto, um polinômio imita qualquer função suave.',
    definicao:
      'O polinômio de Taylor de grau n é o único polinômio desse grau que concorda com a ' +
      'função no ponto e tem as mesmas n primeiras derivadas ali. Quando o centro é zero ele ' +
      'recebe o nome de Maclaurin. É assim que uma calculadora obtém o seno, e é assim que a ' +
      'engenharia lineariza um sistema antes de projetar um controlador.',
    formulas: [
      { tex: 'P_{n}(x) = \\sum_{k=0}^{n} \\frac{f^{(k)}(a)}{k!}(x - a)^{k}' },
      {
        tex: 'P_{n}(x) = \\sum_{k=0}^{n} \\frac{f^{(k)}(0)}{k!}x^{k}',
        legenda: 'Maclaurin: centro em zero.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Exigimos que o polinômio e a função concordem no ponto.',
        tex: 'P(0) = f(0) \\;\\Longrightarrow\\; a_{0} = f(0)',
      },
      {
        descricao: 'E que concordem também na primeira derivada.',
        tex: "P'(0) = f'(0) \\;\\Longrightarrow\\; a_{1} = f'(0)",
      },
      {
        descricao: 'Na segunda, derivar duas vezes faz aparecer um fator 2.',
        tex: "P''(0) = 2a_{2} = f''(0) \\;\\Longrightarrow\\; a_{2} = \\frac{f''(0)}{2}",
      },
      {
        descricao: 'Na ordem k o fator é o fatorial, e daí sai a fórmula geral.',
        tex: 'a_{k} = \\frac{f^{(k)}(0)}{k!}',
        nota: 'O fatorial no denominador não é enfeite: ele desfaz o que derivar repetidamente produz.',
      },
    ],
    exemplo: {
      enunciado:
        'Use o polinômio de Taylor de grau 3 de eˣ em torno de 0 para aproximar e elevado a 0,1.',
      passos: [
        {
          descricao: 'Todas as derivadas de eˣ valem 1 em x = 0.',
          tex: 'P_{3}(x) = 1 + x + \\frac{x^{2}}{2} + \\frac{x^{3}}{6}',
        },
        {
          descricao: 'Substituindo x = 0,1.',
          tex: 'P_{3}(0{,}1) = 1 + 0{,}1 + 0{,}005 + 0{,}000167 = 1{,}105167',
        },
        {
          descricao: 'Comparando com o valor exato.',
          tex: 'e^{0{,}1} = 1{,}105171 \\;\\Rightarrow\\; \\text{erro} \\approx 0{,}000004',
        },
      ],
    },
    vejaTambem: ['taylor.coeficientes', 'taylor.erro', 'taylor.fora-da-origem'],
  },
  {
    id: 'taylor.coeficientes',
    titulo: 'De onde vêm os coeficientes',
    resumo: 'Derivada de ordem k no centro, dividida por k fatorial.',
    definicao:
      'Cada coeficiente carrega uma informação local da função: o de ordem zero é o valor, o ' +
      'de ordem um é a inclinação, o de ordem dois é metade da concavidade. É por isso que a ' +
      'aproximação é local — ela só sabe o que acontece no ponto, e extrapola a partir dali.',
    formulas: [
      { tex: 'a_{k} = \\frac{f^{(k)}(a)}{k!}' },
      {
        tex: 'f^{(k)}(a) = k!\\,a_{k}',
        legenda: 'A leitura inversa: o coeficiente devolve a derivada.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Na exponencial toda derivada é ela mesma, e em zero vale 1.',
        tex: 'f^{(k)}(0) = 1 \\;\\Longrightarrow\\; a_{k} = \\frac{1}{k!}',
      },
      {
        descricao: 'No seno as derivadas giram num ciclo de quatro.',
        tex: '\\operatorname{sen} \\to \\cos \\to -\\operatorname{sen} \\to -\\cos \\to \\operatorname{sen}',
      },
      {
        descricao: 'Em zero esse ciclo vale 0, 1, 0, menos 1 — e metade dos coeficientes some.',
        tex: '\\operatorname{sen} x = x - \\frac{x^{3}}{6} + \\frac{x^{5}}{120} - \\cdots',
        nota: 'Só potências ímpares sobrevivem, porque o seno é uma função ímpar.',
      },
      {
        descricao: 'No logaritmo o padrão é outro: o denominador é a própria ordem.',
        tex: '\\ln(1 + x) = x - \\frac{x^{2}}{2} + \\frac{x^{3}}{3} - \\cdots',
      },
    ],
    vejaTambem: ['taylor.polinomio', 'taylor.series-conhecidas'],
  },
  {
    id: 'taylor.series-conhecidas',
    titulo: 'As cinco que se sabe de cor',
    resumo: 'Da exponencial à geométrica, e quase tudo sai delas.',
    definicao:
      'Cinco séries cobrem a maior parte do que se usa, e combiná-las costuma ser mais rápido ' +
      'que derivar: trocar x por menos x ao quadrado na exponencial dá a curva de Gauss, ' +
      'integrar a geométrica dá o logaritmo, derivar o seno dá o cosseno. Três delas valem ' +
      'para todo x; duas, só dentro do raio 1.',
    formulas: [
      { tex: 'e^{x} = \\sum_{n=0}^{\\infty} \\frac{x^{n}}{n!}' },
      { tex: '\\operatorname{sen} x = \\sum_{k=0}^{\\infty} \\frac{(-1)^{k}x^{2k+1}}{(2k+1)!}' },
      { tex: '\\cos x = \\sum_{k=0}^{\\infty} \\frac{(-1)^{k}x^{2k}}{(2k)!}' },
      { tex: '\\ln(1 + x) = \\sum_{n=1}^{\\infty} \\frac{(-1)^{n+1}x^{n}}{n}, \\quad |x| < 1' },
      { tex: '\\frac{1}{1 - x} = \\sum_{n=0}^{\\infty} x^{n}, \\quad |x| < 1' },
    ],
    demonstracao: [
      {
        descricao: 'A geométrica sai da soma de uma progressão infinita.',
        tex: '1 + x + x^{2} + \\cdots = \\frac{1}{1 - x}, \\quad |x| < 1',
      },
      {
        descricao: 'Trocando x por menos x e integrando termo a termo, aparece o logaritmo.',
        tex: '\\int \\frac{dx}{1 + x} = \\ln(1 + x)',
      },
      {
        descricao: 'E na exponencial, trocar x por menos x ao quadrado dá a curva de Gauss.',
        tex: 'e^{-x^{2}} = 1 - x^{2} + \\frac{x^{4}}{2} - \\cdots',
        nota: 'Esta função não tem primitiva elementar, mas a série se integra termo a termo.',
      },
      {
        descricao: 'Fora do raio, a série deixa de representar a função.',
        tex: '|x| \\geq 1 \\;\\Longrightarrow\\; \\sum x^{n} \\;\\text{diverge}',
      },
    ],
    vejaTambem: ['taylor.coeficientes', 'taylor.polinomio'],
  },
  {
    id: 'taylor.erro',
    titulo: 'O que a aproximação custa',
    resumo: 'A diferença entre a função e o polinômio, e como ela cresce.',
    definicao:
      'O erro é a diferença entre a função e o polinômio que a imita. Perto do centro ele é ' +
      'minúsculo e cada termo a mais o derruba por um fator grande; longe do centro ele cresce ' +
      'depressa, e nenhum grau razoável salva a aproximação. Entender isso é o que separa usar ' +
      'a série de confiar nela cegamente.',
    formulas: [
      { tex: 'R_{n}(x) = f(x) - P_{n}(x)' },
      {
        tex: 'R_{n}(x) \\approx \\frac{f^{(n+1)}(a)}{(n+1)!}(x - a)^{n+1}',
        legenda: 'O primeiro termo desprezado domina o erro.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Aproximando a exponencial em 1 com grau 2.',
        tex: 'P_{2}(1) = 1 + 1 + \\frac{1}{2} = 2{,}5',
      },
      {
        descricao: 'O valor verdadeiro é maior.',
        tex: 'e \\approx 2{,}71828 \\quad\\Longrightarrow\\quad R_{2} \\approx 0{,}21828',
      },
      {
        descricao: 'Com um termo a mais o erro cai quase quatro vezes.',
        tex: 'P_{3}(1) \\approx 2{,}66667 \\quad\\Longrightarrow\\quad R_{3} \\approx 0{,}05161',
      },
      {
        descricao: 'Mas longe do centro a história muda.',
        tex: 'P_{3}(5) \\approx 39{,}3 \\quad\\text{contra}\\quad e^{5} \\approx 148{,}4',
        nota: 'O mesmo grau 3 que era excelente em 1 erra por um fator quatro em 5.',
      },
    ],
    vejaTambem: ['taylor.lagrange', 'taylor.polinomio'],
  },
  {
    id: 'taylor.lagrange',
    titulo: 'Estimar o erro sem a resposta',
    resumo: 'O resto de Lagrange dá uma cota, e é dela que se vive.',
    definicao:
      'Na prática o valor exato não está disponível — se estivesse, não haveria por que ' +
      'aproximar. O resto de Lagrange resolve isso: ele tem a forma do primeiro termo ' +
      'desprezado, com a derivada seguinte avaliada num ponto intermediário desconhecido. ' +
      'Trocando essa derivada por uma cota superior, obtém-se um limite confiável para o erro.',
    formulas: [
      { tex: 'R_{n}(x) = \\frac{f^{(n+1)}(\\xi)}{(n+1)!}(x - a)^{n+1}' },
      {
        tex: '\\left|R_{n}(x)\\right| \\leq \\frac{M\\left|x - a\\right|^{n+1}}{(n+1)!}, \\quad \\left|f^{(n+1)}\\right| \\leq M',
      },
    ],
    demonstracao: [
      {
        descricao: 'No seno toda derivada é limitada por 1, de modo que M vale 1.',
        tex: '\\left|\\operatorname{sen}^{(n)}(x)\\right| \\leq 1',
      },
      {
        descricao: 'Aproximando o seno de 1 com grau 3, a cota fica assim.',
        tex: '\\left|R_{3}\\right| \\leq \\frac{1 \\cdot 1^{4}}{4!} = \\frac{1}{24} \\approx 0{,}04167',
      },
      {
        descricao: 'E o erro verdadeiro é bem menor que a cota.',
        tex: '\\left|\\operatorname{sen} 1 - P_{3}(1)\\right| \\approx 0{,}00813',
        nota: 'A cota é sempre generosa; o que ela garante é que o erro não passa dali.',
      },
      {
        descricao: 'Com grau 5 a cota já desce abaixo de um milésimo.',
        tex: '\\frac{1}{6!} = \\frac{1}{720} \\approx 0{,}00139',
      },
    ],
    exemplo: {
      enunciado:
        'Estime, sem o valor exato, o erro máximo de P₃(0,1) como aproximação de e elevado a 0,1.',
      passos: [
        {
          descricao: 'O resto de Lagrange usa a quarta derivada num ponto entre 0 e 0,1.',
          tex: '|R_{3}| \\leq \\frac{M \\cdot x^{4}}{4!}',
        },
        {
          descricao: 'A quarta derivada é eˣ, que entre 0 e 0,1 não passa de 1,2.',
          tex: 'M = 1{,}2',
        },
        {
          descricao: 'Substituindo x = 0,1.',
          tex: '|R_{3}| \\leq \\frac{1{,}2 \\cdot 0{,}1^{4}}{24} = \\frac{0{,}00012}{24} = 0{,}000005',
          nota: 'O erro real, 0,000004, fica abaixo da estimativa — como tem de ser.',
        },
      ],
    },
    vejaTambem: ['taylor.erro', 'taylor.polinomio'],
  },
  {
    id: 'taylor.fora-da-origem',
    titulo: 'Centrar onde interessa',
    resumo: 'O centro vai onde a função é conhecida, não onde é conveniente.',
    definicao:
      'Maclaurin é apenas o caso de centro zero. O caso geral centra num ponto em que a função ' +
      'e suas derivadas são conhecidas — a raiz de 4 para estimar a raiz de 4,2, ou a altitude ' +
      'de cruzeiro para linearizar a pressão atmosférica. O que varia na fórmula é a potência: ' +
      'não é x, é o afastamento em relação ao centro.',
    formulas: [
      { tex: 'P_{n}(x) = \\sum_{k=0}^{n} \\frac{f^{(k)}(a)}{k!}(x - a)^{k}' },
      {
        tex: '\\sqrt{x} \\approx \\sqrt{a} + \\frac{x - a}{2\\sqrt{a}} - \\frac{(x - a)^{2}}{8a\\sqrt{a}}',
      },
    ],
    demonstracao: [
      {
        descricao: 'Para estimar a raiz de 4,2, centramos em 4, onde a raiz é exata.',
        tex: "f(4) = 2 \\qquad f'(4) = \\frac{1}{4}",
      },
      {
        descricao: 'O termo linear corrige pelo afastamento.',
        tex: 'P_{1}(4{,}2) = 2 + \\frac{0{,}2}{4} = 2{,}05',
      },
      {
        descricao: 'O valor verdadeiro está bem perto.',
        tex: '\\sqrt{4{,}2} \\approx 2{,}04939',
        nota: 'Um termo só já acerta quatro casas, porque o afastamento é pequeno.',
      },
      {
        descricao: 'Centrar longe estraga tudo: o mesmo grau 1 centrado em 1 erraria feio.',
        tex: 'P_{1}(4{,}2) \\big|_{a = 1} = 1 + \\frac{3{,}2}{2} = 2{,}6',
      },
    ],
    vejaTambem: ['taylor.polinomio', 'taylor.erro'],
  },
];
