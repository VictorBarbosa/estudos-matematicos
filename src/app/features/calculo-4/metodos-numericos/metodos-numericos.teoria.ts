import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_NUMERICO: readonly Teoria[] = [
  {
    id: 'numerico.euler',
    titulo: 'O método de Euler',
    resumo: 'Seguir a tangente por um passo e recomeçar.',
    definicao:
      'Quase nenhuma equação diferencial real tem solução fechada — o que se faz na prática é ' +
      'integrá-la numericamente. O método de Euler é o mais simples possível: a derivada dá a ' +
      'inclinação, segue-se por ela um passo, e recomeça-se do ponto novo. É a definição de ' +
      'derivada lida ao contrário, com h finito.',
    formulas: [{ tex: 'y_{n+1} = y_{n} + h\\,f(t_{n},\\, y_{n})' }, { tex: 't_{n+1} = t_{n} + h' }],
    demonstracao: [
      {
        descricao: 'Partimos do valor inicial e da inclinação ali.',
        tex: "y' = y, \\quad y(0) = 1 \\;\\Longrightarrow\\; \\text{inclinação} = 1",
      },
      {
        descricao: 'Com passo 0,5, avançamos pela tangente.',
        tex: 'y_{1} = 1 + 0{,}5 \\cdot 1 = 1{,}5',
      },
      {
        descricao: 'Do novo ponto, a inclinação já é outra.',
        tex: 'y_{2} = 1{,}5 + 0{,}5 \\cdot 1{,}5 = 2{,}25',
      },
      {
        descricao: 'E o exato era maior.',
        tex: 'e^{1} \\approx 2{,}718',
        nota: 'A tangente subestima uma função convexa, e o erro se acumula a cada passo.',
      },
    ],
    vejaTambem: ['numerico.passo', 'numerico.erro', 'numerico.runge-kutta'],
  },
  {
    id: 'numerico.passo',
    titulo: 'O passo é o compromisso',
    resumo: 'Menor passo, menos erro, mais contas.',
    definicao:
      'Diminuir o passo reduz o erro e aumenta o número de iterações — é o compromisso central ' +
      'de toda integração numérica. E ele tem um limite: passos pequenos demais fazem o erro ' +
      'de arredondamento da máquina dominar, e aí reduzir mais piora o resultado.',
    formulas: [{ tex: 'n = \\frac{T}{h}' }, { tex: 'e_{total} \\approx Ch \\;\\text{(Euler)}' }],
    demonstracao: [
      {
        descricao: 'Metade do passo dobra o número de iterações.',
        tex: 'h = 0{,}1 \\;\\Longrightarrow\\; n = 10 \\qquad h = 0{,}05 \\;\\Longrightarrow\\; n = 20',
      },
      {
        descricao: 'E aproximadamente divide o erro por dois.',
        tex: '\\frac{e_{1}}{e_{2}} \\approx 2',
        nota: 'É o que quer dizer "método de primeira ordem".',
      },
      {
        descricao: 'Mas há um piso, imposto pela precisão da máquina.',
        tex: 'h \\to 0 \\;\\Longrightarrow\\; \\text{erro de arredondamento domina}',
        nota: 'Por isso não se resolve o problema simplesmente diminuindo o passo indefinidamente.',
      },
    ],
    vejaTambem: ['numerico.erro', 'numerico.ordem'],
  },
  {
    id: 'numerico.erro',
    titulo: 'O erro existe sempre',
    resumo: 'E saber estimá-lo é o que separa usar de confiar.',
    definicao:
      'Todo método numérico erra, e o que se faz com isso é estimar o tamanho do erro. Há duas ' +
      'fontes: o erro de truncamento, que vem de aproximar a curva por segmentos, e o de ' +
      'arredondamento, que vem da aritmética finita da máquina. Na prática eles puxam em ' +
      'direções opostas conforme o passo muda.',
    formulas: [
      { tex: 'e = \\left|y_{exato} - y_{aproximado}\\right|' },
      { tex: 'e_{relativo} = \\frac{e}{\\left|y_{exato}\\right|}' },
    ],
    demonstracao: [
      {
        descricao: 'O erro de truncamento cai com o passo.',
        tex: 'e_{trunc} \\propto h^{p}',
      },
      {
        descricao: 'O de arredondamento cresce com o número de operações.',
        tex: 'e_{arred} \\propto \\frac{1}{h}',
      },
      {
        descricao: 'A soma dos dois tem um mínimo.',
        tex: 'h_{ótimo} \\;\\text{existe e é finito}',
        nota: 'É por isso que diminuir o passo indefinidamente não melhora o resultado.',
      },
      {
        descricao: 'Sem solução exata, compara-se dois passos diferentes.',
        tex: 'e \\approx \\left|y_{h} - y_{h/2}\\right|',
        nota: 'É a estimativa prática, usada quando não há com que comparar.',
      },
    ],
    vejaTambem: ['numerico.ordem', 'numerico.euler'],
  },
  {
    id: 'numerico.runge-kutta',
    titulo: 'Runge-Kutta de quarta ordem',
    resumo: 'Quatro inclinações por passo, e muito mais precisão.',
    definicao:
      'Em vez de uma inclinação por passo, o Runge-Kutta avalia quatro — no início, duas vezes ' +
      'no meio e no fim — e combina as quatro numa média ponderada. O custo por passo ' +
      'quadruplica, e o erro cai com a quarta potência do passo. É o método padrão de ' +
      'praticamente toda simulação.',
    formulas: [
      { tex: 'y_{n+1} = y_{n} + \\frac{h}{6}\\left(k_{1} + 2k_{2} + 2k_{3} + k_{4}\\right)' },
      {
        tex: 'k_{1} = f(t_{n},\\, y_{n}) \\qquad k_{2} = f\\left(t_{n} + \\tfrac{h}{2},\\; y_{n} + \\tfrac{h}{2}k_{1}\\right)',
      },
    ],
    demonstracao: [
      {
        descricao: 'A primeira inclinação é a do próprio ponto.',
        tex: 'k_{1} = f(t_{n},\\, y_{n})',
      },
      {
        descricao: 'As duas do meio corrigem a curvatura.',
        tex: 'k_{2},\\; k_{3} \\;\\text{avaliadas no meio do passo}',
        nota: 'Elas recebem peso dobrado na média, e é daí que vem quase toda a precisão.',
      },
      {
        descricao: 'E a última olha o fim do passo.',
        tex: 'k_{4} = f\\left(t_{n} + h,\\; y_{n} + hk_{3}\\right)',
      },
      {
        descricao: 'O ganho é de várias ordens de grandeza.',
        tex: 'e_{Euler} \\sim 10^{-2} \\qquad e_{RK4} \\sim 10^{-8}',
        nota: 'Com o mesmo passo, e apenas quatro vezes mais contas.',
      },
    ],
    vejaTambem: ['numerico.ordem', 'numerico.euler'],
  },
  {
    id: 'numerico.ordem',
    titulo: 'A ordem de um método',
    resumo: 'O expoente com que o erro responde ao passo.',
    definicao:
      'Dizer que um método é de ordem p significa que o erro cai com a p-ésima potência do ' +
      'passo: metade do passo divide o erro por dois elevado a p. Euler é de ordem 1, ' +
      'Runge-Kutta clássico é de ordem 4 — e essa diferença de expoente é o que torna um ' +
      'inviável e o outro padrão.',
    formulas: [{ tex: 'e \\propto h^{p}' }, { tex: '\\frac{e(h)}{e(h/2)} \\approx 2^{p}' }],
    demonstracao: [
      {
        descricao: 'Com Euler, metade do passo dá metade do erro.',
        tex: '2^{1} = 2',
      },
      {
        descricao: 'Com um método de segunda ordem, um quarto.',
        tex: '2^{2} = 4',
      },
      {
        descricao: 'E com Runge-Kutta de quarta ordem, um dezesseis avos.',
        tex: '2^{4} = 16',
        nota: 'Para ganhar uma casa decimal, Euler precisa de dez vezes mais passos; o RK4, de 1,8 vez.',
      },
      {
        descricao: 'Medir essa razão é como se descobre a ordem na prática.',
        tex: 'p = \\log_{2}\\frac{e(h)}{e(h/2)}',
      },
    ],
    vejaTambem: ['numerico.erro', 'numerico.runge-kutta'],
  },
  {
    id: 'numerico.newton',
    titulo: 'Método de Newton-Raphson',
    resumo: 'Siga a tangente até o eixo x: ali está um palpite melhor para a raiz.',
    definicao:
      'Para achar uma raiz de f(x) = 0, parte-se de um palpite x₀ e troca-se a curva pela sua ' +
      'tangente. O ponto onde a tangente corta o eixo x é o próximo palpite. Repetindo, perto ' +
      'de uma raiz simples o número de casas corretas praticamente dobra a cada iteração. O ' +
      'método falha quando f′(xₙ) é zero ou muito pequena: a tangente quase horizontal manda o ' +
      'palpite para longe.',
    formulas: [
      {
        tex: "x_{n+1} = x_{n} - \\frac{f(x_{n})}{f'(x_{n})}",
        legenda: 'Uma iteração de Newton.',
      },
    ],
    demonstracao: [
      {
        descricao:
          'A tangente em xₙ é a reta com a inclinação f′(xₙ) que passa pelo ponto da curva.',
        tex: "y = f(x_{n}) + f'(x_{n})(x - x_{n})",
      },
      {
        descricao: 'Ela corta o eixo x onde y = 0; isolando x sai a fórmula.',
        tex: "0 = f(x_{n}) + f'(x_{n})(x - x_{n}) \\;\\Rightarrow\\; x = x_{n} - \\frac{f(x_{n})}{f'(x_{n})}",
      },
    ],
    exemplo: {
      enunciado: 'Uma aproximação de √2: raiz de f(x) = x² − 2, partindo de x₀ = 1.',
      passos: [
        { descricao: 'A derivada.', tex: "f'(x) = 2x" },
        {
          descricao: 'Primeira iteração.',
          tex: 'x_{1} = 1 - \\frac{1 - 2}{2} = 1{,}5',
        },
        {
          descricao: 'Segunda iteração.',
          tex: 'x_{2} = 1{,}5 - \\frac{2{,}25 - 2}{3} = 1{,}41667',
          nota: '√2 = 1,41421…: duas iterações já acertam duas casas.',
        },
      ],
    },
    vejaTambem: ['numerico.erro', 'numerico.ordem'],
  },
];
