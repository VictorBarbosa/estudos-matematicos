import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_POR_PARTES: readonly Teoria[] = [
  {
    id: 'por-partes.qual-trecho',
    titulo: 'Qual expressão vale aqui',
    resumo: 'Primeiro encontre o trecho; só então substitua.',
    definicao:
      'Uma função por partes é uma função só, descrita por expressões diferentes em regiões ' +
      'diferentes do domínio. Em cada ponto apenas UMA delas vale — elas não se somam nem se ' +
      'combinam. O erro mais comum é substituir na expressão errada por não ter conferido a ' +
      'condição antes.',
    formulas: [
      {
        tex: 'f(x) = \\begin{cases} 2x + 1, & x < 3 \\\\ x^{2}, & x \\geq 3 \\end{cases}',
      },
    ],
    demonstracao: [
      {
        descricao: 'Em x igual a 1, a condição satisfeita é a primeira.',
        tex: '1 < 3 \\;\\Longrightarrow\\; f(1) = 2(1) + 1 = 3',
      },
      {
        descricao: 'Em x igual a 5, é a segunda.',
        tex: '5 \\geq 3 \\;\\Longrightarrow\\; f(5) = 25',
      },
      {
        descricao: 'E em x igual a 3, o sinal de igual decide.',
        tex: 'f(3) = 3^{2} = 9',
        nota: 'A condição com o igual é quem recebe a fronteira.',
      },
    ],
    vejaTambem: ['por-partes.fronteira', 'por-partes.continuidade'],
  },
  {
    id: 'por-partes.fronteira',
    titulo: 'Os dois lados da fronteira',
    resumo: 'Chegar pela esquerda e pela direita pode dar respostas diferentes.',
    definicao:
      'Na fronteira entre dois trechos há três números a distinguir: o limite pela esquerda, o ' +
      'limite pela direita e o valor que a função assume ali. Os dois limites usam as ' +
      'expressões vizinhas; o valor usa a expressão cuja condição inclui o igual. Quando os ' +
      'três coincidem, a função é contínua.',
    formulas: [
      { tex: '\\lim_{x \\to a^{-}} f(x) \\quad \\lim_{x \\to a^{+}} f(x) \\quad f(a)' },
      {
        tex: '\\text{contínua em } a \\iff \\lim_{x \\to a^{-}} f = \\lim_{x \\to a^{+}} f = f(a)',
      },
    ],
    demonstracao: [
      {
        descricao: 'Pela esquerda, vale o trecho que termina na fronteira.',
        tex: '\\lim_{x \\to 3^{-}} (2x + 1) = 7',
      },
      {
        descricao: 'Pela direita, o que começa nela.',
        tex: '\\lim_{x \\to 3^{+}} x^{2} = 9',
      },
      {
        descricao: 'E o valor é o do trecho com o igual.',
        tex: 'f(3) = 9',
        nota: 'Aqui os limites discordam, então a função não é contínua nesse ponto.',
      },
    ],
    vejaTambem: ['por-partes.salto', 'por-partes.continuidade'],
  },
  {
    id: 'por-partes.salto',
    titulo: 'O tamanho do salto',
    resumo: 'A diferença entre os limites laterais.',
    definicao:
      'Quando os dois limites laterais discordam, a função dá um salto na fronteira, e o ' +
      'tamanho dele é a diferença entre eles. Nenhum valor atribuído ao ponto consegue colar as ' +
      'duas pontas: a descontinuidade é do tipo salto, e é irremovível. É o que acontece numa ' +
      'tarifa que muda de faixa de uma vez.',
    formulas: [
      { tex: '\\text{salto} = \\lim_{x \\to a^{+}} f(x) - \\lim_{x \\to a^{-}} f(x)' },
      { tex: '\\text{salto} = 0 \\iff \\text{os dois lados se encontram}' },
    ],
    demonstracao: [
      {
        descricao: 'Com os dois limites calculados.',
        tex: '\\lim_{x \\to 3^{-}} f = 7 \\qquad \\lim_{x \\to 3^{+}} f = 9',
      },
      {
        descricao: 'O salto é a diferença, na ordem direita menos esquerda.',
        tex: '\\text{salto} = 9 - 7 = 2',
      },
      {
        descricao: 'Nenhum valor em 3 resolve: a função sobe 2 de uma vez.',
        tex: 'f(3) = 9 \\;\\text{ou}\\; 7 \\;\\text{ou qualquer outro: o salto permanece}',
        nota: 'Por isso a descontinuidade de salto é chamada de irremovível.',
      },
    ],
    vejaTambem: ['por-partes.continuidade', 'por-partes.fronteira'],
  },
  {
    id: 'por-partes.continuidade',
    titulo: 'Colar as pontas',
    resumo: 'Achar a constante que faz os dois lados se encontrarem.',
    definicao:
      'Quando um dos trechos traz uma constante livre, dá para escolhê-la de modo que os dois ' +
      'limites laterais coincidam — e aí a função fica contínua. É um exercício de uma equação ' +
      'só: iguale os dois lados na fronteira e isole a constante. Em engenharia é o que se faz ' +
      'ao emendar dois modelos que valem em faixas diferentes.',
    formulas: [
      { tex: '\\lim_{x \\to a^{-}} f(x) = \\lim_{x \\to a^{+}} f(x)' },
      { tex: 'c = \\text{(valor da esquerda)} - \\text{(valor da direita sem c)}' },
    ],
    demonstracao: [
      {
        descricao: 'O trecho da esquerda na fronteira.',
        tex: '2(3) + 1 = 7',
      },
      {
        descricao: 'O da direita, sem a constante.',
        tex: '3^{2} = 9',
      },
      {
        descricao: 'A constante é a diferença que falta.',
        tex: 'c = 7 - 9 = -2',
      },
      {
        descricao: 'Conferindo com o valor achado.',
        tex: '3^{2} - 2 = 7 \\;\\checkmark',
        nota: 'Agora as duas pontas se encontram e o gráfico fica inteiro.',
      },
    ],
    exemplo: {
      enunciado: 'f(x) = x + k para x < 2 e f(x) = x² para x ≥ 2. Que valor de k torna f contínua?',
      passos: [
        {
          descricao: 'Pela esquerda vale a primeira sentença.',
          tex: '\\lim_{x \\to 2^{-}} f(x) = 2 + k',
        },
        {
          descricao: 'Pela direita, e no próprio ponto, vale a segunda.',
          tex: '\\lim_{x \\to 2^{+}} f(x) = f(2) = 2^{2} = 4',
        },
        {
          descricao: 'Contínua: os dois lados precisam coincidir.',
          tex: '2 + k = 4 \\;\\Rightarrow\\; k = 2',
        },
      ],
    },
    vejaTambem: ['por-partes.salto', 'por-partes.fronteira'],
  },
];
