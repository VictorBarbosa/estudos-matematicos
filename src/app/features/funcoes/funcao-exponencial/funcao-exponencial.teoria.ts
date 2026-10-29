import { analisarExponencialComPassos } from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_EXPONENCIAL: readonly Teoria[] = [
  {
    id: 'exponencial.definicao',
    titulo: 'A variável no expoente',
    resumo: 'Somar no x significa multiplicar no y.',
    definicao:
      'Na função exponencial f(x) = a·bˣ a variável está no EXPOENTE, não na base. Essa troca ' +
      'de lugar muda tudo: enquanto a função afim soma sempre a mesma quantidade, a ' +
      'exponencial multiplica sempre pelo mesmo fator.',
    formulas: [
      { tex: 'f(x) = a \\cdot b^{x} \\quad (a \\neq 0,\\; b > 0,\\; b \\neq 1)' },
      { tex: '\\frac{f(x+1)}{f(x)} = b', legenda: 'A razão entre valores consecutivos é constante.' },
    ],
    demonstracao: [
      {
        descricao: 'Avançando uma unidade em x, o expoente aumenta 1.',
        tex: 'f(x+1) = a \\cdot b^{x+1} = a \\cdot b^{x} \\cdot b',
      },
      {
        descricao: 'Ou seja, o novo valor é o anterior multiplicado pela base.',
        tex: 'f(x+1) = f(x) \\cdot b',
        nota:
          'Compare com a função afim, em que f(x+1) = f(x) + a. Lá se soma; aqui se multiplica.',
      },
      {
        descricao: 'Em x = 0, qualquer base elevada a zero vale 1.',
        tex: 'f(0) = a \\cdot b^{0} = a',
        nota: 'Por isso o coeficiente a é sempre o valor inicial.',
      },
    ],
    exemplo: {
      enunciado: 'Analisando f(x) = 100 · 2ˣ.',
      passos: analisarExponencialComPassos(100, 2).passos,
    },
    vejaTambem: ['exponencial.crescimento', 'exponencial.assintota'],
  },
  {
    id: 'exponencial.crescimento',
    titulo: 'Crescimento e decaimento',
    resumo: 'Base maior que 1 cresce; entre 0 e 1 decai.',
    definicao:
      'Se a base é maior que 1, cada passo multiplica por algo maior que 1 e a função cresce. ' +
      'Se está entre 0 e 1, cada passo reduz o valor. O tempo para dobrar — ou para cair à ' +
      'metade — é sempre o mesmo, não importa de onde se parta.',
    formulas: [
      { tex: 'b > 1 \\to \\text{crescimento} \\qquad 0 < b < 1 \\to \\text{decaimento}' },
      { tex: 'b^{t} = 2 \\;\\Rightarrow\\; t = \\frac{\\ln 2}{\\ln b}', legenda: 'Tempo de duplicação.' },
    ],
    demonstracao: [
      {
        descricao: 'Procuramos o tempo t que dobra o valor, partindo de qualquer ponto.',
        tex: 'f(x + t) = 2 f(x)',
      },
      {
        descricao: 'Substituindo a expressão da função.',
        tex: 'a \\cdot b^{x} \\cdot b^{t} = 2 \\cdot a \\cdot b^{x}',
      },
      {
        descricao: 'O termo com x se cancela — e é por isso que t não depende do ponto de partida.',
        tex: 'b^{t} = 2',
        nota: 'Dobrar de 100 para 200 leva o mesmo tempo que de 1000 para 2000.',
      },
    ],
    exemplo: {
      enunciado: 'Decaimento: f(x) = 80 · 0,5ˣ.',
      passos: analisarExponencialComPassos(80, 0.5).passos,
    },
    vejaTambem: ['exponencial.definicao', 'exponencial.assintota'],
  },
  {
    id: 'exponencial.assintota',
    titulo: 'A assíntota horizontal',
    resumo: 'A função se aproxima de zero, mas nunca chega.',
    definicao:
      'Uma potência de base positiva nunca resulta em zero. Por isso o gráfico da exponencial ' +
      'se aproxima indefinidamente do eixo x sem jamais tocá-lo — e isso significa que a ' +
      'função nunca tem raiz.',
    formulas: [
      { tex: '\\lim_{x \\to -\\infty} b^{x} = 0 \\quad (b > 1)' },
      { tex: 'b^{x} > 0 \\quad \\text{para todo } x \\in \\mathbb{R}' },
    ],
    demonstracao: [
      {
        descricao: 'Para x negativo, a potência vira uma fração.',
        tex: '2^{-3} = \\frac{1}{2^{3}} = \\frac{1}{8}',
      },
      {
        descricao: 'Quanto mais negativo o expoente, menor a fração — mas sempre positiva.',
        tex: '2^{-10} = \\frac{1}{1024} > 0',
        nota: 'Dividir repetidamente aproxima de zero sem nunca alcançá-lo.',
      },
      {
        descricao: 'Logo a equação a·bˣ = 0 não tem solução.',
        tex: 'a \\cdot b^{x} \\neq 0 \\quad \\text{sempre}',
      },
    ],
    exemplo: {
      enunciado: 'Uma exponencial de base 3.',
      passos: analisarExponencialComPassos(1, 3).passos,
    },
    vejaTambem: ['exponencial.crescimento', 'logaritmica.definicao'],
  },
  {
    id: 'exponencial.numero-e',
    titulo: 'O número e',
    resumo: 'A base em que a taxa de crescimento é igual ao próprio valor.',
    definicao:
      'e ≈ 2,718281828 é a base natural. Ele aparece quando o crescimento é contínuo em vez ' +
      'de acontecer em passos: aplicar juros de 100% ao ano uma vez dobra o capital, mas ' +
      'aplicá-los em n parcelas cada vez menores leva a e. A propriedade que o torna a base ' +
      'preferida do cálculo é que a derivada de eˣ é eˣ — a taxa de crescimento em cada ponto ' +
      'é igual ao valor da função ali.',
    formulas: [
      {
        tex: 'e = \\lim_{n \\to \\infty} \\left(1 + \\frac{1}{n}\\right)^{n} \\approx 2{,}71828',
        legenda: 'Juros de 100% compostos em parcelas cada vez menores.',
      },
      {
        tex: '\\frac{d}{dx} e^{x} = e^{x}',
        legenda: 'A única função que é sua própria derivada (a menos de constante).',
      },
      {
        tex: 'e^{x} = \\lim_{n \\to \\infty} \\left(1 + \\frac{x}{n}\\right)^{n}',
        legenda: 'Crescimento contínuo a uma taxa x.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Capitalizar 100% uma vez por ano dobra o valor.',
        tex: '\\left(1 + \\frac{1}{1}\\right)^{1} = 2',
      },
      {
        descricao: 'Capitalizando em doze parcelas de 1/12, o resultado já é maior.',
        tex: '\\left(1 + \\frac{1}{12}\\right)^{12} \\approx 2{,}613',
      },
      {
        descricao: 'Reduzindo a parcela indefinidamente, o resultado converge.',
        tex: '\\left(1 + \\frac{1}{1000}\\right)^{1000} \\approx 2{,}717',
        nota:
          'O limite não é infinito, e é esse teto que recebe o nome de e. É o mesmo tipo de ' +
          'raciocínio dos juros compostos, levado ao caso contínuo.',
      },
      {
        descricao: 'Toda exponencial pode ser escrita na base e.',
        tex: 'b^{x} = e^{x \\ln b}',
        nota: 'Por isso basta estudar eˣ e ln para cobrir todas as exponenciais.',
      },
    ],
    vejaTambem: ['exponencial.crescimento', 'exponencial.meia-vida', 'logaritmica.definicao'],
  },
  {
    id: 'exponencial.meia-vida',
    titulo: 'Meia-vida e tempo de duplicação',
    resumo: 'O tempo é constante, não importa de quanto se parte.',
    definicao:
      'Num decaimento exponencial, o tempo para a quantidade cair à metade é sempre o mesmo, ' +
      'venha de 1 kg ou de 1 g: é a meia-vida. A razão é que a exponencial multiplica, e não ' +
      'subtrai — em cada intervalo de meia-vida o que resta é multiplicado por 1/2. O mesmo ' +
      'vale no crescimento, onde o tempo de duplicação é constante.',
    formulas: [
      { tex: 'N(t) = N_0 \\cdot \\left(\\frac{1}{2}\\right)^{t / t_{1/2}}' },
      {
        tex: 't_{1/2} = \\frac{\\ln 2}{\\lambda} \\qquad N(t) = N_0 e^{-\\lambda t}',
        legenda: 'A forma com a constante de decaimento λ, na base natural.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Queremos o tempo em que resta metade.',
        tex: 'N_0 e^{-\\lambda t} = \\frac{N_0}{2}',
      },
      {
        descricao: 'O N₀ se cancela — é por isso que a meia-vida não depende da quantidade.',
        tex: 'e^{-\\lambda t} = \\frac{1}{2}',
      },
      {
        descricao: 'Aplicamos o logaritmo natural para tirar t do expoente.',
        tex: '-\\lambda t = \\ln \\frac{1}{2} = -\\ln 2 \\;\\Rightarrow\\; t = \\frac{\\ln 2}{\\lambda}',
        nota:
          'Com três meias-vidas resta 1/8, não zero: o decaimento exponencial nunca chega a ' +
          'zero em tempo finito.',
      },
    ],
    vejaTambem: ['exponencial.numero-e', 'exponencial.crescimento', 'logaritmica.propriedades'],
  },
];
