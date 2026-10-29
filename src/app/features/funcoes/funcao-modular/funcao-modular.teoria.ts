import { analisarModularComPassos } from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_MODULAR: readonly Teoria[] = [
  {
    id: 'modular.distancia',
    titulo: 'Módulo é distância',
    resumo: '|x| é a distância de x até zero — nunca negativa.',
    definicao:
      'O módulo de um número é sua distância até a origem na reta numérica. Distância não ' +
      'tem sinal, e é por isso que |x| nunca é negativo. Entender o módulo assim, em vez de ' +
      'como "tirar o sinal", evita quase todos os erros do tema.',
    formulas: [
      {
        tex: '|x| = \\begin{cases} x & \\text{se } x \\geq 0 \\\\ -x & \\text{se } x < 0 \\end{cases}',
      },
      { tex: '|x - a| = \\text{distância entre } x \\text{ e } a' },
    ],
    demonstracao: [
      {
        descricao: 'Para x positivo, a distância até zero é o próprio x.',
        tex: '|5| = 5',
      },
      {
        descricao: 'Para x negativo, a distância é o oposto de x — que é positivo.',
        tex: '|-5| = -(-5) = 5',
        nota: 'O sinal de menos na definição não torna o resultado negativo; ele o torna positivo.',
      },
      {
        descricao: 'A leitura como distância generaliza para dois pontos quaisquer.',
        tex: '|7 - 3| = 4 \\qquad |3 - 7| = 4',
        nota: 'A distância de A a B é a mesma de B a A — por isso a ordem não importa.',
      },
    ],
    exemplo: {
      enunciado: 'Analisando f(x) = |x − 2|.',
      passos: analisarModularComPassos(1, -2).passos,
    },
    vejaTambem: ['modular.grafico', 'modular.equacoes'],
  },
  {
    id: 'modular.grafico',
    titulo: 'O gráfico em V',
    resumo: 'O bico está onde a expressão interna troca de sinal.',
    definicao:
      'O módulo espelha para cima tudo que estaria abaixo do eixo x. Por isso o gráfico de ' +
      'uma função modular de primeiro grau tem a forma de V — e o bico fica exatamente no ' +
      'ponto em que a expressão dentro do módulo se anula.',
    formulas: [
      { tex: 'f(x) = |ax + b| \\;\\Rightarrow\\; \\text{bico em } x = -\\frac{b}{a}' },
    ],
    demonstracao: [
      {
        descricao: 'À direita do ponto crítico, a expressão interna é positiva.',
        tex: 'ax + b > 0 \\;\\Rightarrow\\; f(x) = ax + b',
        nota: 'O módulo não altera nada: é a reta original.',
      },
      {
        descricao: 'À esquerda, ela é negativa, e o módulo inverte o sinal.',
        tex: 'ax + b < 0 \\;\\Rightarrow\\; f(x) = -(ax + b)',
        nota: 'A reta é refletida para cima do eixo x.',
      },
      {
        descricao: 'As duas semirretas se encontram onde a expressão vale zero.',
        tex: 'ax + b = 0 \\;\\Rightarrow\\; x = -\\frac{b}{a}',
        nota: 'Esse encontro é o bico — ponto em que a função não tem uma inclinação única.',
      },
    ],
    exemplo: {
      enunciado: 'Analisando f(x) = |2x + 4|.',
      passos: analisarModularComPassos(2, 4).passos,
    },
    vejaTambem: ['modular.distancia', 'modular.equacoes'],
  },
  {
    id: 'modular.equacoes',
    titulo: 'Equações com módulo',
    resumo: '|u| = k geralmente dá DUAS soluções.',
    definicao:
      'Se o módulo de algo vale k, esse algo pode ser +k ou −k: existem dois pontos à mesma ' +
      'distância da origem. Esquecer a segunda solução é o erro mais frequente. E se k for ' +
      'negativo, não há solução alguma.',
    formulas: [
      { tex: '|u| = k \\iff u = k \\;\\text{ou}\\; u = -k \\quad (k > 0)' },
      { tex: '|u| = k \\;\\text{não tem solução se}\\; k < 0' },
    ],
    demonstracao: [
      {
        descricao: 'Dois números distintos têm a mesma distância até zero.',
        tex: '|x| = 3 \\;\\Rightarrow\\; x = 3 \\;\\text{ou}\\; x = -3',
      },
      {
        descricao: 'Com uma expressão dentro, o raciocínio é o mesmo.',
        tex: '|x - 1| = 3 \\;\\Rightarrow\\; x - 1 = 3 \\;\\text{ou}\\; x - 1 = -3',
      },
      {
        descricao: 'Resolvendo cada caso separadamente.',
        tex: 'x = 4 \\qquad \\text{ou} \\qquad x = -2',
        nota: 'Graficamente: a reta horizontal y = 3 corta o V em dois pontos.',
      },
      {
        descricao: 'Como o módulo nunca é negativo, uma igualdade a número negativo é impossível.',
        tex: '|x - 1| = -3 \\;\\Rightarrow\\; S = \\varnothing',
      },
    ],
    exemplo: {
      enunciado: 'A função f(x) = |x − 1|, cujo V é cortado por y = 3 em dois pontos.',
      passos: analisarModularComPassos(1, -1).passos,
    },
    vejaTambem: ['modular.grafico', 'modular.distancia'],
  },
];
