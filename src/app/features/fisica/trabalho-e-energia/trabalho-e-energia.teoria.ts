import { conservacaoEnergiaComPassos, potenciaMediaComPassos, trabalhoComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_ENERGIA: readonly Teoria[] = [
  {
    id: 'energia.trabalho',
    titulo: 'Trabalho',
    resumo: 'Só a força alinhada ao movimento trabalha.',
    definicao:
      'Trabalho é o produto escalar entre força e deslocamento. A consequência prática: uma ' +
      'força perpendicular ao movimento não realiza trabalho nenhum — nem a normal, nem a ' +
      'força centrípeta, nem a sua mão ao carregar uma caixa andando na horizontal.',
    formulas: [
      { tex: 'W = \\vec{F}\\cdot\\vec{d} = Fd\\cos\\theta' },
      {
        tex: '\\theta = 90^\\circ \\;\\Rightarrow\\; W = 0',
        legenda: 'Força perpendicular ao deslocamento não trabalha.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Decompomos a força em paralela e perpendicular ao deslocamento.',
        tex: 'F_\\parallel = F\\cos\\theta',
      },
      {
        descricao: 'Só a componente paralela acompanha o movimento.',
        tex: 'W = F_\\parallel d = Fd\\cos\\theta',
        nota: 'A perpendicular muda a direção, mas não transfere energia ao longo do caminho.',
      },
      {
        descricao: 'Força contrária ao movimento realiza trabalho negativo.',
        tex: '\\cos 180^\\circ = -1 \\;\\Rightarrow\\; W = -Fd',
        nota: 'É o caso do atrito, que retira energia do movimento.',
      },
    ],
    exemplo: {
      enunciado: 'Trabalho de uma força de 40 N a 60° do deslocamento de 5 m.',
      passos: trabalhoComPassos(40, 5, 60).passos,
    },
    vejaTambem: ['energia.conservacao', 'energia.potencia', 'produtos.projecao'],
  },
  {
    id: 'energia.conservacao',
    titulo: 'Conservação de energia mecânica',
    resumo: 'Sem atrito, a velocidade final só depende da altura.',
    definicao:
      'Na ausência de atrito, a soma de energia cinética e potencial permanece constante. O ' +
      'resultado notável é que a massa se cancela: a velocidade no fim de uma rampa não ' +
      'depende de quanto o corpo pesa, nem do caminho percorrido — só da altura perdida.',
    formulas: [
      { tex: '\\frac{mv^{2}}{2} + mgh = \\text{constante}' },
      { tex: 'v = \\sqrt{v_0^{2} + 2g\\Delta h}' },
    ],
    demonstracao: [
      {
        descricao: 'Escrevemos o balanço entre o início e o fim.',
        tex: '\\frac{mv_0^{2}}{2} + mgh_0 = \\frac{mv^{2}}{2} + mgh',
      },
      {
        descricao: 'A massa divide todos os termos.',
        tex: '\\frac{v_0^{2}}{2} + gh_0 = \\frac{v^{2}}{2} + gh',
        nota: 'Daí a velocidade final não depender da massa — nem o tempo de queda.',
      },
      {
        descricao: 'Isolando a velocidade final.',
        tex: 'v = \\sqrt{v_0^{2} + 2g(h_0 - h)}',
      },
      {
        descricao: 'Com atrito, parte da energia vira calor e o balanço deixa de fechar.',
        tex: 'E_{mec} \\text{ diminui}',
        nota: 'A energia total continua conservada; só não está mais toda em forma mecânica.',
      },
    ],
    exemplo: {
      enunciado: 'A velocidade ao fim de uma queda de 20 m.',
      passos: conservacaoEnergiaComPassos(2, 20, 0).passos,
    },
    vejaTambem: ['energia.trabalho', 'energia.potencia', 'cinematica.equacoes'],
  },
  {
    id: 'energia.potencia',
    titulo: 'Potência',
    resumo: 'A mesma energia, em menos tempo.',
    definicao:
      'Potência é energia por unidade de tempo. Subir uma escada andando ou correndo exige a ' +
      'mesma energia — mas correr exige mais potência. É a potência, e não a energia, que ' +
      'dimensiona motores.',
    formulas: [
      { tex: 'P = \\frac{W}{\\Delta t}' },
      { tex: 'P = Fv', legenda: 'Para força constante na direção do movimento.' },
    ],
    demonstracao: [
      {
        descricao: 'Partimos da definição.',
        tex: 'P = \\frac{W}{\\Delta t} = \\frac{Fd}{\\Delta t}',
      },
      {
        descricao: 'Reconhecendo a velocidade na razão d/Δt.',
        tex: 'P = Fv',
        nota: 'Por isso um carro precisa de mais potência para manter velocidade alta: a resistência do ar cresce.',
      },
      {
        descricao: 'A mesma energia entregue mais rápido exige potência maior.',
        tex: '\\Delta t \\downarrow \\;\\Rightarrow\\; P \\uparrow',
      },
    ],
    exemplo: {
      enunciado: '600 J realizados em 4 s.',
      passos: potenciaMediaComPassos(600, 4).passos,
    },
    vejaTambem: ['energia.trabalho', 'energia.conservacao'],
  },
];
