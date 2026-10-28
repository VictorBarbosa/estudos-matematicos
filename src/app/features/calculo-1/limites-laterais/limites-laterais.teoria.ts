import { limiteComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_LATERAIS: readonly Teoria[] = [
  {
    id: 'laterais.definicao',
    titulo: 'Chegar pela esquerda e pela direita',
    resumo: 'Dois caminhos até o mesmo ponto.',
    definicao:
      'O limite pela esquerda considera apenas valores menores que o ponto; o pela direita, ' +
      'apenas maiores. São duas perguntas separadas, e o limite comum só existe quando as ' +
      'duas têm a mesma resposta.',
    formulas: [
      { tex: '\\lim_{x \\to a^{-}} f(x) \\qquad \\lim_{x \\to a^{+}} f(x)' },
      { tex: '\\lim_{x \\to a} f(x) = L \\iff \\lim_{x \\to a^{-}} f(x) = \\lim_{x \\to a^{+}} f(x) = L' },
    ],
    demonstracao: [
      {
        descricao: 'O sinal de menos no expoente indica aproximação por valores menores.',
        tex: 'x \\to a^{-} \;\\Rightarrow\; x < a',
      },
      {
        descricao: 'O de mais, por valores maiores.',
        tex: 'x \\to a^{+} \;\\Rightarrow\; x > a',
      },
      {
        descricao: 'Se os dois destinos diferem, não há um valor único para o limite.',
        tex: 'L^{-} \\neq L^{+} \;\\Rightarrow\; \\lim_{x \\to a} f(x) \;\\text{não existe}',
      },
    ],
    exemplo: {
      enunciado: 'A função |x|/x tem limites laterais diferentes em zero.',
      passos: limiteComPassos((x) => Math.abs(x) / x, 0, '\\frac{|x|}{x}').passos,
    },
    vejaTambem: ['laterais.por-partes', 'laterais.infinitos'],
  },
  {
    id: 'laterais.por-partes',
    titulo: 'Funções definidas por partes',
    resumo: 'Cada lado usa uma sentença diferente.',
    definicao:
      'Quando a função muda de fórmula num ponto, os limites laterais usam sentenças ' +
      'distintas. O limite só existe se as duas sentenças convergirem para o mesmo valor ' +
      'naquele ponto de transição.',
    formulas: [
      {
        tex: 'f(x) = \\begin{cases} g(x) & x < a \\\\ h(x) & x \\geq a \\end{cases}',
      },
      { tex: '\\lim_{x \\to a^{-}} f = \\lim_{x \\to a} g \\qquad \\lim_{x \\to a^{+}} f = \\lim_{x \\to a} h' },
    ],
    demonstracao: [
      {
        descricao: 'À esquerda do ponto, só a primeira sentença está em vigor.',
        tex: 'x < a \;\\Rightarrow\; f(x) = g(x)',
      },
      {
        descricao: 'À direita, só a segunda.',
        tex: 'x > a \;\\Rightarrow\; f(x) = h(x)',
      },
      {
        descricao: 'Para o limite existir, as duas precisam coincidir no ponto de emenda.',
        tex: 'g(a) = h(a)',
        nota: 'É essa igualdade que faz o gráfico emendar sem salto.',
      },
    ],
    exemplo: {
      enunciado: 'Uma função com salto, cujos laterais discordam.',
      passos: limiteComPassos((x) => (x < 2 ? x + 1 : x + 4), 2, 'f(x)').passos,
    },
    vejaTambem: ['laterais.definicao', 'continuidade.definicao'],
  },
  {
    id: 'laterais.infinitos',
    titulo: 'Limites laterais infinitos',
    resumo: 'Cada lado pode explodir para um lado diferente.',
    definicao:
      'Junto de uma assíntota vertical, os dois lados costumam divergir — e às vezes para ' +
      'sinais opostos. Em 1/x, a função despenca para −∞ pela esquerda e dispara para +∞ ' +
      'pela direita.',
    formulas: [
      { tex: '\\lim_{x \\to 0^{-}} \\frac{1}{x} = -\\infty \\qquad \\lim_{x \\to 0^{+}} \\frac{1}{x} = +\\infty' },
      { tex: '\\lim_{x \\to 0} \\frac{1}{x^{2}} = +\\infty', legenda: 'Aqui os dois lados concordam.' },
    ],
    demonstracao: [
      {
        descricao: 'Pela esquerda, x é negativo e pequeno em módulo.',
        tex: '\\frac{1}{-0{,}001} = -1000',
      },
      {
        descricao: 'Pela direita, positivo e pequeno.',
        tex: '\\frac{1}{0{,}001} = 1000',
      },
      {
        descricao: 'Com o quadrado no denominador, o sinal some e os dois lados vão para +∞.',
        tex: '\\frac{1}{(\\pm 0{,}001)^{2}} = 10^{6}',
        nota: 'Por isso 1/x² tem comportamento simétrico, e 1/x não.',
      },
    ],
    exemplo: {
      enunciado: 'Os dois lados de 1/x na origem.',
      passos: limiteComPassos((x) => 1 / x, 0, '\\frac{1}{x}').passos,
    },
    vejaTambem: ['laterais.definicao', 'vizinhancas.assintotas'],
  },
];
