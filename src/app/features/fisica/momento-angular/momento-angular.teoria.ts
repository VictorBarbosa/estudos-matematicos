import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_MOMENTO_ANGULAR: readonly Teoria[] = [
  {
    id: 'angular.momento',
    titulo: 'O momento linear, girando',
    resumo: 'Inércia vezes velocidade angular.',
    definicao:
      'O momento angular é a tradução rotacional do momento linear: onde havia massa vezes ' +
      'velocidade, há momento de inércia vezes velocidade angular. Como toda grandeza ' +
      'rotacional, ele depende do eixo escolhido — a mesma situação pode ter momentos ' +
      'angulares diferentes em relação a pontos diferentes.',
    formulas: [
      { tex: 'L = I\\omega' },
      { tex: 'p = mv \\quad\\longleftrightarrow\\quad L = I\\omega' },
    ],
    demonstracao: [
      {
        descricao: 'Um disco de 2 quilos e meio metro de raio.',
        tex: 'I = \\tfrac{1}{2}(2)(0{,}5)^{2} = 0{,}25\\ \\text{kg}\\cdot\\text{m}^{2}',
      },
      {
        descricao: 'Girando a 10 radianos por segundo.',
        tex: 'L = 0{,}25 \\cdot 10 = 2{,}5\\ \\text{kg}\\cdot\\text{m}^{2}\\text{/s}',
      },
      {
        descricao: 'Repare que o momento angular é linear em ômega, sem quadrado nem meio.',
        tex: 'L = I\\omega \\qquad K = \\tfrac{1}{2}I\\omega^{2}',
        nota: 'Confundir os dois é o engano mais comum: um é momento, o outro é energia.',
      },
    ],
    vejaTambem: ['angular.dicionario', 'angular.particula', 'angular.conservacao'],
  },
  {
    id: 'angular.dicionario',
    titulo: 'Torque muda o momento angular',
    resumo: 'Assim como força muda o momento linear.',
    definicao:
      'A relação entre torque e momento angular é a forma mais geral da segunda lei para ' +
      'rotações: o torque resultante é a taxa de variação do momento angular. Dela sai, de ' +
      'imediato, a conservação — sem torque externo, o momento angular é constante.',
    formulas: [
      { tex: '\\vec{\\tau} = \\frac{d\\vec{L}}{dt}' },
      {
        tex: '\\vec{F} = \\frac{d\\vec{p}}{dt} \\quad\\longleftrightarrow\\quad \\vec{\\tau} = \\frac{d\\vec{L}}{dt}',
      },
    ],
    demonstracao: [
      {
        descricao: 'Derivando o momento angular de um corpo rígido.',
        tex: '\\frac{dL}{dt} = I\\frac{d\\omega}{dt} = I\\alpha',
      },
      {
        descricao: 'E isso é exatamente o torque.',
        tex: 'I\\alpha = \\tau \\;\\checkmark',
      },
      {
        descricao: 'Sem torque externo, a derivada é nula.',
        tex: '\\tau = 0 \\;\\Longrightarrow\\; L = \\text{const.}',
        nota: 'É daqui que a conservação do momento angular sai — de uma linha só.',
      },
    ],
    vejaTambem: ['angular.conservacao', 'angular.momento'],
  },
  {
    id: 'angular.particula',
    titulo: 'Momento angular de uma partícula',
    resumo: 'Só a parte perpendicular da velocidade conta.',
    definicao:
      'Uma partícula que nem gira tem momento angular em relação a um ponto, desde que sua ' +
      'velocidade não aponte para ele. O que entra na conta é a distância perpendicular — o ' +
      'braço — e por isso uma partícula indo em linha reta tem momento angular constante em ' +
      'relação a qualquer ponto fora da reta.',
    formulas: [
      { tex: 'L = mvr\\operatorname{sen}\\theta' },
      { tex: 'L = mvr_{\\perp}', legenda: 'O braço é a distância perpendicular do ponto à reta.' },
    ],
    demonstracao: [
      {
        descricao: 'Com a velocidade perpendicular ao raio, o seno vale 1.',
        tex: '\\theta = 90^\\circ \\;\\Longrightarrow\\; L = mvr',
        nota: 'É o valor máximo possível para aquela distância.',
      },
      {
        descricao: 'Com a velocidade apontando para o ponto, o seno zera.',
        tex: '\\theta = 0 \\;\\Longrightarrow\\; L = 0',
      },
      {
        descricao: 'Numa reta, o braço não muda enquanto a partícula avança.',
        tex: 'r\\operatorname{sen}\\theta = r_{\\perp} = \\text{const.}',
        nota: 'Daí a segunda lei de Kepler: áreas iguais em tempos iguais é conservação de L.',
      },
    ],
    vejaTambem: ['angular.momento', 'angular.conservacao'],
  },
  {
    id: 'angular.conservacao',
    titulo: 'A patinadora',
    resumo: 'Sem torque externo, recolher a massa acelera o giro.',
    definicao:
      'Sem torque externo, o produto da inércia pela velocidade angular não muda. Diminuir a ' +
      'inércia obriga a velocidade angular a crescer na mesma proporção — é a patinadora que ' +
      'recolhe os braços, o satélite que se estabiliza girando, e a razão de uma estrela em ' +
      'colapso virar um pulsar com rotações de milissegundos.',
    formulas: [
      { tex: 'I_{1}\\omega_{1} = I_{2}\\omega_{2}' },
      { tex: '\\omega_{2} = \\frac{I_{1}}{I_{2}}\\omega_{1}' },
    ],
    demonstracao: [
      {
        descricao: 'Uma patinadora com braços abertos, inércia 4 e rotação 2.',
        tex: 'L = 4 \\cdot 2 = 8\\ \\text{kg}\\cdot\\text{m}^{2}\\text{/s}',
      },
      {
        descricao: 'Recolhendo os braços, a inércia cai para 1.',
        tex: '\\omega_{2} = \\frac{8}{1} = 8\\ \\text{rad/s}',
        nota: 'A inércia caiu quatro vezes, a rotação subiu quatro vezes.',
      },
      {
        descricao: 'O momento angular é o mesmo dos dois lados.',
        tex: '1 \\cdot 8 = 8 \\;\\checkmark',
      },
      {
        descricao: 'Num satélite, isso se usa para controlar atitude sem gastar propelente.',
        tex: 'L_{total} = L_{corpo} + L_{roda} = \\text{const.}',
        nota: 'Acelerar uma roda interna faz o corpo girar para o outro lado.',
      },
    ],
    vejaTambem: ['angular.energia-nao-se-conserva', 'angular.dicionario'],
  },
  {
    id: 'angular.energia-nao-se-conserva',
    titulo: 'O momento se conserva, a energia não',
    resumo: 'Recolher a massa custa trabalho, e esse trabalho vira energia de rotação.',
    definicao:
      'É o ponto que surpreende: na patinadora o momento angular é o mesmo antes e depois, mas ' +
      'a energia de rotação aumenta. Não há violação — alguém puxou os braços contra a força ' +
      'centrífuga, e esse trabalho entrou no sistema. Quando o movimento é o inverso, abrindo ' +
      'os braços, a energia diminui e o trabalho sai.',
    formulas: [
      { tex: 'K = \\frac{1}{2}I\\omega^{2} = \\frac{L^{2}}{2I}' },
      { tex: 'L \\;\\text{constante} \\;\\Longrightarrow\\; K \\propto \\frac{1}{I}' },
    ],
    demonstracao: [
      {
        descricao: 'Escrevendo a energia em termos do momento angular conservado.',
        tex: 'K = \\frac{1}{2}I\\omega^{2} = \\frac{(I\\omega)^{2}}{2I} = \\frac{L^{2}}{2I}',
      },
      {
        descricao: 'Com L fixo, a energia é inversamente proporcional à inércia.',
        tex: 'I \\to \\frac{I}{4} \\;\\Longrightarrow\\; K \\to 4K',
      },
      {
        descricao: 'Na patinadora de inércia 4 a 2 radianos por segundo.',
        tex: 'K_{1} = \\tfrac{1}{2}(4)(2)^{2} = 8\\ \\text{J}',
      },
      {
        descricao: 'Depois de recolher, com inércia 1 a 8 radianos por segundo.',
        tex: 'K_{2} = \\tfrac{1}{2}(1)(8)^{2} = 32\\ \\text{J}',
        nota: 'Os 24 joules a mais foram o trabalho dos músculos ao puxar os braços.',
      },
    ],
    vejaTambem: ['angular.conservacao', 'angular.momento'],
  },
];
