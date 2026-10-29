import { Polinomio, analisarMovimentoComPassos, taxaMediaComPassos } from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

/** s(t) = t³ − 6t² + 9t, usada como exemplo nos três conceitos. */
const EXEMPLO = Polinomio.de(0, 9, -6, 1);

export const TEORIA_TAXA: readonly Teoria[] = [
  {
    id: 'taxa.media',
    titulo: 'Taxa média de variação',
    resumo: 'Quanto mudou dividido pelo tempo que levou.',
    definicao:
      'A taxa média de variação compara duas grandezas num intervalo: o quanto a primeira ' +
      'mudou dividido pelo quanto a segunda mudou. No gráfico, é a inclinação da reta ' +
      'secante que liga os dois pontos — uma média, que não diz nada sobre o que aconteceu ' +
      'dentro do intervalo.',
    formulas: [
      { tex: '\\bar{v} = \\frac{\\Delta s}{\\Delta t} = \\frac{s(t_1) - s(t_0)}{t_1 - t_0}' },
      {
        tex: 'm_{\\text{sec}} = \\frac{f(b) - f(a)}{b - a}',
        legenda: 'A mesma conta, escrita para uma função qualquer.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Marcamos dois instantes e as posições correspondentes.',
        tex: '(t_0,\\, s(t_0)) \\quad \\text{e} \\quad (t_1,\\, s(t_1))',
      },
      {
        descricao: 'A reta que passa por eles tem a inclinação de sempre.',
        tex: 'm = \\frac{\\Delta y}{\\Delta x} = \\frac{s(t_1) - s(t_0)}{t_1 - t_0}',
        nota: 'É a mesma fórmula do coeficiente angular da geometria analítica.',
      },
      {
        descricao: 'Uma média pode esconder o percurso: ida e volta dão taxa zero.',
        tex: 's(t_1) = s(t_0) \\;\\Rightarrow\\; \\bar{v} = 0',
        nota: 'O corpo se moveu, mas terminou onde começou.',
      },
    ],
    exemplo: {
      enunciado: 'A taxa média de s(t) = t³ − 6t² + 9t entre t = 0 e t = 3.',
      passos: taxaMediaComPassos(EXEMPLO, 0, 3).passos,
    },
    vejaTambem: ['taxa.instantanea', 'derivada.secante'],
  },
  {
    id: 'taxa.instantanea',
    titulo: 'Da taxa média à instantânea',
    resumo: 'Encolher o intervalo até sobrar um instante só.',
    definicao:
      'A velocidade que o velocímetro marca não é uma média: é o valor para o qual a taxa ' +
      'média converge quando o intervalo encolhe até zero. Esse limite é exatamente a ' +
      'derivada — a taxa de variação instantânea. Geometricamente, a secante gira até virar ' +
      'a tangente.',
    formulas: [
      { tex: "v(t) = s'(t) = \\lim_{\\Delta t \\to 0} \\frac{s(t + \\Delta t) - s(t)}{\\Delta t}" },
      {
        tex: "a(t) = v'(t) = s''(t)",
        legenda: 'A aceleração é a taxa de variação da velocidade.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Começamos com a taxa média num intervalo de largura Δt.',
        tex: '\\frac{s(t + \\Delta t) - s(t)}{\\Delta t}',
      },
      {
        descricao: 'Encolhemos o intervalo mantendo t fixo.',
        tex: '\\Delta t \\to 0',
        nota: 'A secante vai se deitando sobre a curva até tocá-la num ponto só.',
      },
      {
        descricao: 'O limite é a derivada: a inclinação da tangente naquele ponto.',
        tex: "v(t) = s'(t)",
      },
      {
        descricao: 'Derivando de novo, obtemos o ritmo com que a própria velocidade muda.',
        tex: "a(t) = s''(t)",
        nota: 'Aceleração não é "ir rápido": é mudar de velocidade.',
      },
    ],
    exemplo: {
      enunciado: 'Posição, velocidade e aceleração de s(t) = t³ − 6t² + 9t em t = 2.',
      passos: analisarMovimentoComPassos(EXEMPLO, 2).passos,
    },
    vejaTambem: ['taxa.media', 'taxa.sinais', 'derivada.secante'],
  },
  {
    id: 'taxa.sinais',
    titulo: 'O que os sinais contam',
    resumo: 'Velocidade e aceleração lidas juntas.',
    definicao:
      'O sinal da velocidade diz para que lado o corpo vai; o sinal da aceleração diz se ele ' +
      'ganha ou perde velocidade naquele sentido. Quando os dois têm o mesmo sinal, o ' +
      'movimento acelera; quando têm sinais opostos, freia. E onde a velocidade zera, a ' +
      'posição atinge um extremo.',
    formulas: [
      { tex: "v(t) > 0 \\;\\Rightarrow\\; s \\text{ cresce} \\qquad v(t) < 0 \\;\\Rightarrow\\; s \\text{ decresce}" },
      {
        tex: 'v(t)\\,a(t) > 0 \\;\\Rightarrow\\; \\text{acelera}',
        legenda: 'Mesmo sinal: o módulo da velocidade aumenta.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Onde a velocidade zera, a tangente da posição fica horizontal.',
        tex: "v(t) = s'(t) = 0",
        nota: 'É o mesmo critério dos pontos críticos no estudo de máximos e mínimos.',
      },
      {
        descricao: 'A aceleração desempata: positiva ali, a posição tem um mínimo.',
        tex: "s''(t) > 0 \\;\\Rightarrow\\; \\text{mínimo local}",
      },
      {
        descricao: 'Negativa, um máximo.',
        tex: "s''(t) < 0 \\;\\Rightarrow\\; \\text{máximo local}",
      },
      {
        descricao: 'Frear é ter aceleração contrária ao movimento, não aceleração negativa.',
        tex: 'v < 0,\\; a > 0 \\;\\Rightarrow\\; \\text{o corpo freia}',
        nota: 'Um carro de ré desacelerando tem aceleração positiva.',
      },
    ],
    exemplo: {
      enunciado: 'Em t = 1 a velocidade zera: o corpo para e inverte o sentido.',
      passos: analisarMovimentoComPassos(EXEMPLO, 1).passos,
    },
    vejaTambem: ['taxa.instantanea', 'derivada.interpretacao'],
  },
];
