import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_DINAMICA_ROTACIONAL: readonly Teoria[] = [
  {
    id: 'rotacional.dicionario',
    titulo: 'O dicionário da rotação',
    resumo: 'Cada grandeza da translação tem uma correspondente no giro.',
    definicao:
      'A dinâmica de rotação não é uma teoria nova: é a mecânica de Newton escrita em outras ' +
      'variáveis. Massa vira momento de inércia, força vira torque, velocidade vira velocidade ' +
      'angular, momento linear vira momento angular. Aprender o dicionário poupa decorar duas ' +
      'listas de fórmulas — a forma de cada uma é a mesma dos dois lados.',
    formulas: [
      { tex: 'F = ma \\quad\\longleftrightarrow\\quad \\tau = I\\alpha' },
      { tex: 'p = mv \\quad\\longleftrightarrow\\quad L = I\\omega' },
      {
        tex: 'K = \\tfrac{1}{2}mv^{2} \\quad\\longleftrightarrow\\quad K = \\tfrac{1}{2}I\\omega^{2}',
      },
    ],
    demonstracao: [
      {
        descricao: 'A grandeza que resiste à mudança de movimento muda de nome.',
        tex: 'm \\;\\longrightarrow\\; I',
      },
      {
        descricao: 'E o que provoca a mudança também.',
        tex: 'F \\;\\longrightarrow\\; \\tau = Fr\\operatorname{sen}\\theta',
        nota: 'O torque depende de onde a força é aplicada, e não só de quanto ela vale.',
      },
      {
        descricao: 'Com isso, a segunda lei ganha sua versão rotacional.',
        tex: '\\sum \\tau = I\\alpha',
      },
      {
        descricao: 'E a energia cinética, a sua.',
        tex: 'K_{total} = \\tfrac{1}{2}mv^{2} + \\tfrac{1}{2}I\\omega^{2}',
        nota: 'Um corpo que rola tem as duas parcelas ao mesmo tempo.',
      },
    ],
    vejaTambem: ['rotacional.inercia', 'rotacional.torque-alfa', 'rotacional.energia'],
  },
  {
    id: 'rotacional.inercia',
    titulo: 'Onde a massa está',
    resumo: 'O momento de inércia depende da distribuição, não só da quantidade.',
    definicao:
      'A massa mede resistência à aceleração em linha reta e nada mais. Na rotação, o que ' +
      'importa é a que distância do eixo essa massa se encontra — e com peso quadrático. Por ' +
      'isso um aro e um disco de mesma massa e mesmo raio têm inércias diferentes, e a mesma ' +
      'barra resiste quatro vezes mais girando pela ponta do que pelo centro.',
    formulas: [
      { tex: 'I = \\sum m_{i}r_{i}^{2}' },
      {
        tex: 'I_{aro} = mr^{2} \\qquad I_{disco} = \\tfrac{1}{2}mr^{2} \\qquad I_{esfera} = \\tfrac{2}{5}mr^{2}',
      },
      {
        tex: 'I_{barra}^{centro} = \\tfrac{1}{12}mL^{2} \\qquad I_{barra}^{ponta} = \\tfrac{1}{3}mL^{2}',
      },
    ],
    demonstracao: [
      {
        descricao: 'Toda a massa do aro está à distância r do eixo.',
        tex: 'I_{aro} = mr^{2}',
      },
      {
        descricao: 'No disco, parte dela está mais perto, e a média pesa menos.',
        tex: 'I_{disco} = \\tfrac{1}{2}mr^{2}',
        nota: 'Metade do aro, com a mesma massa e o mesmo raio.',
      },
      {
        descricao: 'Na esfera maciça a massa se concentra ainda mais perto do centro.',
        tex: 'I_{esfera} = \\tfrac{2}{5}mr^{2} = 0{,}4\\,mr^{2}',
      },
      {
        descricao: 'E o eixo escolhido muda tudo, mesmo no mesmo corpo.',
        tex: '\\frac{1/3}{1/12} = 4',
        nota: 'A barra pela ponta resiste quatro vezes mais que pelo centro.',
      },
    ],
    vejaTambem: ['rotacional.dicionario', 'rotacional.torque-alfa', 'rotacional.rolamento'],
  },
  {
    id: 'rotacional.torque-alfa',
    titulo: 'A segunda lei, girando',
    resumo: 'Torque é à rotação o que força é à translação.',
    definicao:
      'O torque mede a capacidade de uma força de provocar giro, e depende de três coisas: do ' +
      'módulo da força, da distância ao eixo e do ângulo entre elas. Uma força aplicada em ' +
      'direção ao eixo não gira nada, por maior que seja — é por isso que maçanetas ficam longe ' +
      'das dobradiças.',
    formulas: [
      { tex: '\\tau = Fr\\operatorname{sen}\\theta' },
      { tex: '\\sum \\tau = I\\alpha' },
      { tex: '\\alpha = \\frac{\\tau}{I}' },
    ],
    demonstracao: [
      {
        descricao: 'Só a componente perpendicular da força produz torque.',
        tex: 'F_{\\perp} = F\\operatorname{sen}\\theta',
      },
      {
        descricao: 'Com a força apontando para o eixo, o seno zera.',
        tex: '\\theta = 0 \\;\\Longrightarrow\\; \\tau = 0',
        nota: 'Empurrar uma porta na direção da dobradiça não a move.',
      },
      {
        descricao: 'Num disco de 2 quilos e meio metro, com torque de 3 newton vezes metro.',
        tex: 'I = \\tfrac{1}{2}(2)(0{,}5)^{2} = 0{,}25\\ \\text{kg}\\cdot\\text{m}^{2}',
      },
      {
        descricao: 'A aceleração angular sai da divisão.',
        tex: '\\alpha = \\frac{3}{0{,}25} = 12\\ \\text{rad/s}^{2}',
      },
    ],
    vejaTambem: ['rotacional.inercia', 'rotacional.dicionario'],
  },
  {
    id: 'rotacional.energia',
    titulo: 'Energia de rotação',
    resumo: 'A mesma forma da energia cinética, com inércia no lugar da massa.',
    definicao:
      'Um corpo que gira armazena energia, e a fórmula é a tradução exata da energia cinética ' +
      'de translação. É o princípio do volante de inércia, usado para guardar energia em ' +
      'ônibus e em sistemas de recuperação de frenagem — e a dependência quadrática na ' +
      'velocidade angular é o que torna o volante eficiente a rotações altas.',
    formulas: [
      { tex: 'K_{rot} = \\frac{1}{2}I\\omega^{2}' },
      { tex: 'K_{total} = \\frac{1}{2}mv^{2} + \\frac{1}{2}I\\omega^{2}' },
    ],
    demonstracao: [
      {
        descricao: 'Somando a energia de cada partícula do corpo.',
        tex: 'K = \\sum \\tfrac{1}{2}m_{i}v_{i}^{2} = \\sum \\tfrac{1}{2}m_{i}(\\omega r_{i})^{2}',
      },
      {
        descricao: 'A velocidade angular é a mesma para todas, e sai da soma.',
        tex: 'K = \\tfrac{1}{2}\\omega^{2}\\sum m_{i}r_{i}^{2}',
      },
      {
        descricao: 'E o que sobrou na soma é exatamente o momento de inércia.',
        tex: 'K_{rot} = \\tfrac{1}{2}I\\omega^{2}',
        nota: 'A fórmula não foi postulada: ela caiu da definição de inércia.',
      },
      {
        descricao: 'Dobrar a rotação quadruplica a energia guardada.',
        tex: '\\omega \\to 2\\omega \\;\\Longrightarrow\\; K \\to 4K',
      },
    ],
    vejaTambem: ['rotacional.rolamento', 'rotacional.dicionario'],
  },
  {
    id: 'rotacional.rolamento',
    titulo: 'Quem chega antes na rampa',
    resumo: 'Só o formato decide — massa e raio se cancelam.',
    definicao:
      'Num corpo que rola sem deslizar, a energia potencial se reparte entre transladar e ' +
      'girar, e a proporção depende apenas do fator de forma. Massa e raio desaparecem da ' +
      'conta, de modo que numa rampa a ordem de chegada é sempre a mesma: esfera, cilindro, ' +
      'aro — independentemente de tamanho ou peso.',
    formulas: [
      { tex: '\\omega = \\frac{v}{r}', legenda: 'A condição de rolar sem deslizar.' },
      { tex: 'v = \\sqrt{\\frac{2gh}{1 + k}}, \\quad I = kmr^{2}' },
    ],
    demonstracao: [
      {
        descricao: 'Toda a energia potencial vira cinética, repartida em duas parcelas.',
        tex: 'mgh = \\tfrac{1}{2}mv^{2} + \\tfrac{1}{2}I\\omega^{2}',
      },
      {
        descricao: 'Substituindo a condição de rolamento e a inércia.',
        tex: 'mgh = \\tfrac{1}{2}mv^{2}(1 + k)',
        nota: 'A massa e o raio se cancelam dos dois lados.',
      },
      {
        descricao: 'Para a esfera, com fator dois quintos.',
        tex: 'v = \\sqrt{\\frac{2gh}{1{,}4}} \\approx 0{,}845\\sqrt{2gh}',
      },
      {
        descricao: 'Para o aro, com fator 1, a velocidade é menor.',
        tex: 'v = \\sqrt{\\frac{2gh}{2}} \\approx 0{,}707\\sqrt{2gh}',
        nota: 'O aro guarda metade da energia na rotação, e por isso chega por último.',
      },
    ],
    vejaTambem: ['rotacional.energia', 'rotacional.inercia'],
  },
];
