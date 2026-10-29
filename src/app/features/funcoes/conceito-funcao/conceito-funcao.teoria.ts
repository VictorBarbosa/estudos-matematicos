import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_CONCEITO: readonly Teoria[] = [
  {
    id: 'conceito.definicao',
    titulo: 'O que é uma função',
    resumo: 'Cada entrada leva a exatamente uma saída.',
    definicao:
      'Uma função é uma regra que associa cada elemento de um conjunto de partida a UM ÚNICO ' +
      'elemento do conjunto de chegada. A palavra-chave é "único": uma entrada não pode ter ' +
      'duas saídas. O contrário é permitido — duas entradas podem levar à mesma saída.',
    formulas: [
      { tex: 'f: A \\to B', legenda: 'A é o domínio, B é o contradomínio.' },
      { tex: 'x_1 = x_2 \\;\\Rightarrow\\; f(x_1) = f(x_2)', legenda: 'Mesma entrada, mesma saída.' },
    ],
    demonstracao: [
      {
        descricao: 'Uma máquina que para cada entrada devolve uma saída previsível.',
        tex: 'x \\;\\longrightarrow\\; \\boxed{f} \\;\\longrightarrow\\; f(x)',
      },
      {
        descricao: 'Duas entradas diferentes podem dar a mesma saída — isso é permitido.',
        tex: 'f(x) = x^{2} \\;\\Rightarrow\\; f(2) = f(-2) = 4',
      },
      {
        descricao: 'Mas uma entrada com duas saídas não define função.',
        tex: 'y^{2} = x \\;\\Rightarrow\\; x = 4 \\text{ daria } y = 2 \\text{ e } y = -2',
        nota: 'Por isso essa relação não é função de x.',
      },
    ],
    exemplo: {
      enunciado: 'Na função f(x) = 2x + 1, cada x tem exatamente um valor associado.',
      passos: [
        { descricao: 'Para x = 0.', tex: 'f(0) = 1' },
        { descricao: 'Para x = 3.', tex: 'f(3) = 7' },
        { descricao: 'Nunca há ambiguidade: a regra decide sozinha.', tex: 'f(3) \\neq 8' },
      ],
    },
    vejaTambem: ['conceito.dominio', 'conceito.reta-vertical'],
  },
  {
    id: 'conceito.dominio',
    titulo: 'Domínio, contradomínio e imagem',
    resumo: 'Onde pode entrar, onde pode sair e o que de fato sai.',
    definicao:
      'O domínio é o conjunto das entradas permitidas. O contradomínio é onde as saídas podem ' +
      'cair. A imagem é o conjunto das saídas que realmente acontecem — e é sempre um ' +
      'subconjunto do contradomínio, podendo ser menor que ele.',
    formulas: [
      { tex: '\\operatorname{Im}(f) = \\{f(x) \\mid x \\in D\\} \\subseteq B' },
      { tex: 'f(x) = \\frac{1}{x} \\;\\Rightarrow\\; D = \\mathbb{R} - \\{0\\}', legenda: 'Divisão por zero exclui o zero.' },
      { tex: 'f(x) = \\sqrt{x} \\;\\Rightarrow\\; D = [0, +\\infty)', legenda: 'Raiz par exige radicando não negativo.' },
    ],
    demonstracao: [
      {
        descricao: 'O domínio é limitado pelo que a expressão não permite.',
        tex: '\\text{denominador} \\neq 0 \\qquad \\text{radicando par} \\geq 0',
      },
      {
        descricao: 'Em f(x) = x², o contradomínio pode ser todo ℝ.',
        tex: 'f: \\mathbb{R} \\to \\mathbb{R}',
      },
      {
        descricao: 'Mas a imagem é apenas a parte não negativa, porque quadrado nunca é negativo.',
        tex: '\\operatorname{Im}(f) = [0, +\\infty)',
        nota: 'Contradomínio é onde PODE cair; imagem é onde REALMENTE cai.',
      },
    ],
    exemplo: {
      enunciado: 'Domínio de f(x) = 1/(x − 3).',
      passos: [
        { descricao: 'O denominador não pode ser zero.', tex: 'x - 3 \\neq 0' },
        { descricao: 'Logo x não pode valer 3.', tex: 'D = \\mathbb{R} - \\{3\\}' },
      ],
    },
    vejaTambem: ['conceito.definicao', 'conceito.reta-vertical'],
  },
  {
    id: 'conceito.reta-vertical',
    titulo: 'O teste da reta vertical',
    resumo: 'Se uma vertical corta o gráfico duas vezes, não é função.',
    definicao:
      'Como cada x deve ter uma única saída, qualquer reta vertical pode encontrar o gráfico ' +
      'no máximo uma vez. Dois encontros significariam duas saídas para a mesma entrada — e ' +
      'isso violaria a definição.',
    formulas: [
      { tex: '\\text{reta } x = a \\text{ corta o gráfico} \\leq 1 \\text{ vez} \\iff \\text{é função}' },
    ],
    demonstracao: [
      {
        descricao: 'Uma reta vertical reúne todos os pontos com o mesmo x.',
        tex: 'x = a',
      },
      {
        descricao: 'Se ela cruza o gráfico em dois pontos, há dois valores para o mesmo x.',
        tex: '(a, y_1) \\;\\text{e}\\; (a, y_2) \\;\\text{com}\\; y_1 \\neq y_2',
        nota: 'A regra deixaria de ser determinística.',
      },
      {
        descricao: 'A circunferência falha no teste; a parábola de boca para cima passa.',
        tex: 'x^{2} + y^{2} = 1 \\;\\text{não é função} \\qquad y = x^{2} \\;\\text{é}',
      },
    ],
    exemplo: {
      enunciado: 'Por que y² = x não define y como função de x.',
      passos: [
        { descricao: 'Isolando y aparecem dois valores.', tex: 'y = \\pm\\sqrt{x}' },
        { descricao: 'Para x = 9, por exemplo.', tex: 'y = 3 \\;\\text{e}\\; y = -3' },
        { descricao: 'Uma entrada com duas saídas quebra a definição.', tex: '\\text{não é função}' },
      ],
    },
    vejaTambem: ['conceito.definicao', 'conceito.dominio'],
  },
];
