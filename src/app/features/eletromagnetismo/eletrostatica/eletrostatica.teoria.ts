import { campoPontualComPassos, coulombComPassos } from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_ELETROSTATICA: readonly Teoria[] = [
  {
    id: 'eletrostatica.coulomb',
    titulo: 'Lei de Coulomb',
    resumo: 'A força entre cargas cresce com o produto delas e cai com o quadrado da distância.',
    definicao:
      'Cargas de mesmo sinal se repelem; de sinais opostos, se atraem. A intensidade da força é ' +
      'proporcional ao produto das cargas e inversamente proporcional ao quadrado da distância ' +
      'entre elas — a mesma forma da gravitação de Newton, só que muito mais forte e com dois ' +
      'sinais possíveis. A constante k vale 8,99×10⁹ N·m²/C². As cargas do dia a dia são de ' +
      'microcoulombs (μC = 10⁻⁶ C), e as distâncias entram em metros.',
    formulas: [
      {
        tex: 'F = k\\,\\frac{|q_1 q_2|}{r^{2}} \\qquad k = 8{,}99 \\times 10^{9}\\ \\text{N·m}^{2}/\\text{C}^{2}',
      },
      {
        tex: 'k = \\frac{1}{4\\pi\\varepsilon_0}',
        legenda: 'A mesma constante escrita com a permissividade do vácuo.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Dobrar uma das cargas dobra a força; dobrar a distância a divide por quatro.',
        tex: 'F(2q_1) = 2F \\qquad F(2r) = \\frac{F}{4}',
      },
      {
        descricao: 'O 1/r² vem da geometria: o efeito se espalha por uma esfera de área 4πr².',
        tex: '\\text{área} = 4\\pi r^{2} \\;\\Rightarrow\\; \\text{intensidade} \\propto \\frac{1}{r^{2}}',
      },
    ],
    exemplo: {
      enunciado: 'Cargas de 3 μC e −2 μC a 0,2 m.',
      passos: coulombComPassos(3, -2, 0.2).passos,
    },
    vejaTambem: ['eletrostatica.campo', 'eletrostatica.superposicao'],
  },
  {
    id: 'eletrostatica.campo',
    titulo: 'Campo elétrico',
    resumo: 'A força por unidade de carga: E = F/q, e para uma carga pontual, kq/r².',
    definicao:
      'O campo elétrico descreve o efeito que uma carga cria no espaço em volta, antes de ' +
      'qualquer outra carga aparecer: E = F/q₀ para uma carga de prova q₀. De uma carga pontual, ' +
      'E = k|q|/r², apontando para fora se q é positiva e para dentro se é negativa. Uma carga q ' +
      'colocada num campo E sente a força F = qE — no sentido do campo se q > 0, contra ele se q < 0.',
    formulas: [
      { tex: 'E = \\frac{F}{q_0} \\qquad E = k\\,\\frac{|q|}{r^{2}}' },
      { tex: '\\vec{F} = q\\,\\vec{E}' },
    ],
    demonstracao: [
      {
        descricao: 'Dividindo a força de Coulomb pela carga de prova, ela some.',
        tex: 'E = \\frac{k|q|q_0/r^{2}}{q_0} = k\\,\\frac{|q|}{r^{2}}',
      },
    ],
    exemplo: {
      enunciado: 'O campo de 5 μC a 0,3 m.',
      passos: campoPontualComPassos(5, 0.3).passos,
    },
    vejaTambem: ['eletrostatica.coulomb', 'potencial.definicao'],
  },
  {
    id: 'eletrostatica.superposicao',
    titulo: 'Superposição',
    resumo: 'Cada carga age como se estivesse sozinha; as forças se somam como vetores.',
    definicao:
      'Com várias cargas, calcula-se a força (ou o campo) de cada uma separadamente e somam-se ' +
      'os vetores. Na mesma reta, a soma é com sinal: forças para lados opostos se subtraem. Em ' +
      'direções perpendiculares, a resultante é a hipotenusa, √(F₁² + F₂²). Entre duas cargas de ' +
      'mesmo sinal existe um ponto onde os campos se anulam — mais perto da carga menor.',
    formulas: [
      { tex: '\\vec{F} = \\vec{F}_1 + \\vec{F}_2 + \\cdots' },
      { tex: 'F_1 \\perp F_2 \\;\\Rightarrow\\; F = \\sqrt{F_1^{2} + F_2^{2}}' },
    ],
    demonstracao: [
      {
        descricao: 'Na reta, escolhe-se um sentido positivo e cada força entra com o seu sinal.',
        tex: 'F = F_A - F_B \\quad (\\text{sentidos opostos})',
      },
    ],
    exemplo: {
      enunciado: 'Forças de 3 N e 4 N perpendiculares sobre a mesma carga.',
      passos: [
        { descricao: 'Formam um triângulo retângulo.', tex: 'F = \\sqrt{3^{2} + 4^{2}}' },
        { descricao: 'Calculando.', tex: 'F = \\sqrt{25} = 5\\ \\text{N}' },
      ],
    },
    vejaTambem: ['eletrostatica.coulomb', 'vetores.soma'],
  },
];
