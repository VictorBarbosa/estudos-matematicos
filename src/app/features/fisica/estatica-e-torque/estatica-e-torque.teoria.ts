import { centroDeMassaComPassos, equilibrioAlavancaComPassos, torqueComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_TORQUE: readonly Teoria[] = [
  {
    id: 'torque.definicao',
    titulo: 'Torque',
    resumo: 'Força vezes braço — e só a componente perpendicular conta.',
    definicao:
      'Torque mede a capacidade de uma força produzir rotação em torno de um ponto. Depende da ' +
      'força, da distância ao eixo e do ângulo entre elas. Força apontando para o eixo não gira ' +
      'nada: é por isso que ninguém abre uma porta empurrando pela dobradiça.',
    formulas: [
      { tex: '\\tau = rF\\sin\\theta' },
      {
        tex: '\\theta = 0 \;\\Rightarrow\; \\tau = 0',
        legenda: 'Força na direção do braço não produz giro.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Decompomos a força em componentes paralela e perpendicular ao braço.',
        tex: 'F_\\perp = F\\sin\\theta',
      },
      {
        descricao: 'A paralela apenas comprime ou estica o braço; só a perpendicular gira.',
        tex: '\\tau = rF_\\perp = rF\\sin\\theta',
        nota: 'Aqui é seno, ao contrário do trabalho, que usa cosseno.',
      },
      {
        descricao: 'Dobrar o braço dobra o torque com a mesma força.',
        tex: '2r \;\\Rightarrow\; 2\\tau',
        nota: 'É a vantagem mecânica da alavanca e da chave de boca comprida.',
      },
    ],
    exemplo: {
      enunciado: 'Torque de 50 N aplicados perpendicularmente a 2 m do eixo.',
      passos: torqueComPassos(50, 2, 90).passos,
    },
    vejaTambem: ['torque.equilibrio', 'torque.centro-massa', 'produtos.vetorial'],
  },
  {
    id: 'torque.equilibrio',
    titulo: 'Equilíbrio estático',
    resumo: 'Duas condições, não uma.',
    definicao:
      'Para um corpo estar em equilíbrio, não basta a resultante das forças ser nula: a soma ' +
      'dos torques também precisa ser. Um corpo pode ter força resultante zero e ainda girar — ' +
      'é o que acontece quando duas forças iguais e opostas atuam em pontos diferentes.',
    formulas: [
      { tex: '\\sum \\vec{F} = 0' },
      { tex: '\\sum \\vec{\\tau} = 0' },
      { tex: 'F_1 d_1 = F_2 d_2', legenda: 'A alavanca em equilíbrio.' },
    ],
    demonstracao: [
      {
        descricao: 'Resultante nula impede translação acelerada.',
        tex: '\\sum F = 0 \;\\Rightarrow\; a = 0',
      },
      {
        descricao: 'Mas duas forças opostas em pontos distintos ainda produzem giro.',
        tex: '\\tau_{total} = F d \\ne 0',
        nota: 'É um binário: força resultante zero, rotação garantida.',
      },
      {
        descricao: 'Por isso o equilíbrio exige a segunda condição.',
        tex: '\\sum \\tau = 0',
      },
      {
        descricao: 'Na alavanca, isso dá a troca entre força e distância.',
        tex: 'F_1 d_1 = F_2 d_2',
        nota: '"Dê-me um ponto de apoio e moverei o mundo" é exatamente esta equação.',
      },
    ],
    exemplo: {
      enunciado: 'Equilibrando 100 N a 0,5 m com 25 N do outro lado.',
      passos: equilibrioAlavancaComPassos(100, 0.5, 25).passos,
    },
    vejaTambem: ['torque.definicao', 'torque.centro-massa'],
  },
  {
    id: 'torque.centro-massa',
    titulo: 'Centro de massa e estabilidade',
    resumo: 'O ponto onde o peso pode ser considerado aplicado.',
    definicao:
      'O centro de massa é a média das posições, ponderada pelas massas. Para efeito de ' +
      'translação e de torque do peso, o corpo se comporta como se toda a massa estivesse ali. ' +
      'Um corpo tomba quando a vertical pelo centro de massa sai da base de apoio — e é por ' +
      'isso que um foguete alto precisa de controle ativo.',
    formulas: [
      { tex: 'x_{cm} = \\frac{\\sum m_i x_i}{\\sum m_i}' },
      {
        tex: '\\text{estável} \\iff x_{cm} \\text{ sobre a base}',
        legenda: 'Fora da base, o peso produz torque de tombamento.',
      },
    ],
    demonstracao: [
      {
        descricao: 'O peso de cada parte produz torque em relação ao apoio.',
        tex: '\\tau_i = m_i g x_i',
      },
      {
        descricao: 'Somando, o resultado equivale ao peso total aplicado no centro de massa.',
        tex: '\\sum m_i g x_i = Mg\\,x_{cm}',
        nota: 'É isso que justifica tratar o corpo como um ponto.',
      },
      {
        descricao: 'Se esse ponto sai da base, o torque do peso derruba o corpo.',
        tex: '\\tau \\ne 0',
        nota: 'Veículos largos e baixos são mais estáveis por exatamente esse motivo.',
      },
    ],
    exemplo: {
      enunciado: 'Centro de massa de 1 kg em x = 0 e 9 kg em x = 10.',
      passos: centroDeMassaComPassos([
        { massa: 1, posicao: 0 },
        { massa: 9, posicao: 10 },
      ]).passos,
    },
    vejaTambem: ['torque.equilibrio', 'solidos.escala'],
  },
];
