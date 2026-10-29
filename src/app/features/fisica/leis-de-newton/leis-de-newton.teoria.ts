import { anguloCriticoComPassos, planoInclinadoComPassos, segundaLeiComPassos } from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_NEWTON: readonly Teoria[] = [
  {
    id: 'newton.leis',
    titulo: 'As três leis',
    resumo: 'Força não mantém movimento: força muda movimento.',
    definicao:
      'A primeira lei diz que, sem força resultante, o corpo mantém sua velocidade — inclusive ' +
      'se ela for zero. A segunda quantifica: força resultante produz aceleração proporcional. ' +
      'A terceira diz que forças vêm em pares opostos, em corpos diferentes. A confusão mais ' +
      'comum do assunto é achar que movimento exige força; movimento exige apenas ausência de ' +
      'força contrária.',
    formulas: [
      { tex: '\\vec{F}_R = 0 \\;\\Rightarrow\\; \\vec{v} = \\text{constante}' },
      { tex: '\\vec{F}_R = m\\vec{a}' },
      {
        tex: '\\vec{F}_{AB} = -\\vec{F}_{BA}',
        legenda: 'Ação e reação atuam em corpos DIFERENTES, e por isso não se cancelam.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Sem resultante, a aceleração é nula — e velocidade constante inclui o repouso.',
        tex: 'a = \\frac{F_R}{m} = 0',
      },
      {
        descricao: 'Com a mesma força, um corpo mais massivo acelera menos.',
        tex: 'a = \\frac{F_R}{m}',
        nota: 'Massa é exatamente a medida dessa resistência à mudança: inércia.',
      },
      {
        descricao: 'O par ação-reação atua em corpos distintos.',
        tex: 'F_{\\text{Terra sobre você}} = -F_{\\text{você sobre a Terra}}',
        nota: 'Se se cancelassem, nada jamais aceleraria.',
      },
    ],
    exemplo: {
      enunciado: 'Uma tração de 50 N e um atrito de 20 N sobre 10 kg.',
      passos: segundaLeiComPassos(10, [
        { valor: 50, descricao: 'tração' },
        { valor: -20, descricao: 'atrito' },
      ]).passos,
    },
    vejaTambem: ['newton.plano', 'newton.atrito'],
  },
  {
    id: 'newton.plano',
    titulo: 'Plano inclinado',
    resumo: 'Decompor o peso resolve o problema.',
    definicao:
      'No plano inclinado, o peso se divide em duas componentes: uma paralela ao plano, que ' +
      'puxa o corpo para baixo, e outra perpendicular, que o aperta contra a superfície e ' +
      'determina a normal. É o exemplo que mostra para que serviu aprender trigonometria.',
    formulas: [
      { tex: 'P_x = mg\\sin\\theta \\qquad N = mg\\cos\\theta' },
      {
        tex: 'a = g(\\sin\\theta - \\mu\\cos\\theta)',
        legenda: 'A massa se cancela: a aceleração não depende dela.',
      },
    ],
    demonstracao: [
      {
        descricao: 'O peso aponta para baixo; o plano define as direções úteis.',
        tex: 'P = mg',
      },
      {
        descricao: 'A componente paralela usa seno, por ser o cateto oposto ao ângulo.',
        tex: 'P_x = mg\\sin\\theta',
        nota: 'Com θ = 0 ela se anula; com θ = 90° vale o peso inteiro, como na queda livre.',
      },
      {
        descricao: 'A perpendicular usa cosseno e define a normal.',
        tex: 'N = mg\\cos\\theta',
        nota: 'A normal não é igual ao peso no plano inclinado — esse é um erro frequente.',
      },
      {
        descricao: 'Na segunda lei, a massa aparece dos dois lados e se cancela.',
        tex: 'ma = mg\\sin\\theta - \\mu mg\\cos\\theta',
      },
    ],
    exemplo: {
      enunciado: 'Bloco de 10 kg num plano de 30°, com μ = 0,2.',
      passos: planoInclinadoComPassos(10, 30, 0.2).passos,
    },
    vejaTambem: ['newton.leis', 'newton.atrito', 'vetores.definicao'],
  },
  {
    id: 'newton.atrito',
    titulo: 'Atrito',
    resumo: 'Proporcional à normal, não à área.',
    definicao:
      'O atrito máximo é proporcional à força normal, com o coeficiente μ dependendo apenas ' +
      'do par de materiais. Não depende da área de contato nem da velocidade — resultados ' +
      'contraintuitivos, mas é o que o modelo descreve bem na prática.',
    formulas: [
      { tex: 'f_{max} = \\mu N' },
      {
        tex: '\\tan\\theta_c = \\mu',
        legenda: 'O ângulo em que o corpo começa a deslizar mede o coeficiente.',
      },
    ],
    demonstracao: [
      {
        descricao: 'O corpo começa a deslizar quando a componente do peso iguala o atrito máximo.',
        tex: 'mg\\sin\\theta = \\mu\\,mg\\cos\\theta',
      },
      {
        descricao: 'A massa e a gravidade se cancelam.',
        tex: '\\tan\\theta_c = \\mu',
        nota: 'O ângulo crítico é o mesmo para um bloco leve e um pesado do mesmo material.',
      },
      {
        descricao: 'Abaixo desse ângulo, o atrito vale apenas o necessário — não o máximo.',
        tex: 'f = P_x < f_{max}',
        nota: 'O atrito estático se ajusta: ele não "escolhe" ser máximo sem necessidade.',
      },
    ],
    exemplo: {
      enunciado: 'O ângulo em que um bloco com μ = 0,4 começa a deslizar.',
      passos: anguloCriticoComPassos(0.4).passos,
    },
    vejaTambem: ['newton.plano', 'newton.leis'],
  },
];
