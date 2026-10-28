import { colisaoComPassos, impulsoComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_MOMENTO: readonly Teoria[] = [
  {
    id: 'momento.impulso',
    titulo: 'Impulso e momento',
    resumo: 'Força × tempo muda a quantidade de movimento.',
    definicao:
      'Momento linear é massa vezes velocidade. O impulso — força multiplicada pelo tempo de ' +
      'aplicação — é exatamente a variação do momento. Isso explica airbag, capacete e zona de ' +
      'deformação: para a mesma variação de momento, mais tempo significa menos força.',
    formulas: [
      { tex: '\\vec{p} = m\\vec{v}' },
      { tex: '\\vec{J} = \\vec{F}\\Delta t = \\Delta\\vec{p}' },
      {
        tex: 'F = \\frac{\\Delta p}{\\Delta t}',
        legenda: 'A segunda lei de Newton, na forma original que ele escreveu.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Partimos da segunda lei com aceleração como variação de velocidade.',
        tex: 'F = ma = m\\frac{\\Delta v}{\\Delta t}',
      },
      {
        descricao: 'Multiplicando os dois lados pelo intervalo de tempo.',
        tex: 'F\\Delta t = m\\Delta v = \\Delta p',
        nota: 'É literalmente a segunda lei reorganizada.',
      },
      {
        descricao: 'Para a mesma variação de momento, estender o tempo reduz a força.',
        tex: '\\Delta t \\uparrow \;\\Rightarrow\; F \\downarrow',
        nota: 'Um airbag não reduz a variação de momento; ele a espalha no tempo.',
      },
    ],
    exemplo: {
      enunciado: 'Impulso de 20 N aplicados por 3 s sobre 4 kg.',
      passos: impulsoComPassos(20, 3, 4).passos,
    },
    vejaTambem: ['momento.conservacao', 'momento.colisoes', 'energia.trabalho'],
  },
  {
    id: 'momento.conservacao',
    titulo: 'Conservação do momento',
    resumo: 'O princípio que move um foguete.',
    definicao:
      'Num sistema isolado, o momento linear total não muda. A razão é a terceira lei: as ' +
      'forças internas vêm em pares opostos e se cancelam. É por isso que um foguete acelera ' +
      'no vácuo — ele não empurra nada externo, apenas joga massa para trás.',
    formulas: [
      { tex: '\\sum \\vec{p}_i = \\sum \\vec{p}_f' },
      { tex: 'm_1 v_1 + m_2 v_2 = m_1 v_1\' + m_2 v_2\'' },
    ],
    demonstracao: [
      {
        descricao: 'As forças internas atuam em pares de ação e reação.',
        tex: '\\vec{F}_{12} = -\\vec{F}_{21}',
      },
      {
        descricao: 'Os impulsos que elas produzem também são opostos.',
        tex: '\\Delta\\vec{p}_1 = -\\Delta\\vec{p}_2',
        nota: 'O que um corpo ganha de momento, o outro perde.',
      },
      {
        descricao: 'Somando, a variação total é nula.',
        tex: '\\Delta\\vec{p}_{total} = 0',
      },
      {
        descricao: 'Num foguete, "o outro corpo" é o gás expelido.',
        tex: 'm_{foguete}\\Delta v = -\\dot{m}v_e\\Delta t',
        nota: 'Não é preciso ar para empurrar: o gás é o que recebe o momento oposto.',
      },
    ],
    exemplo: {
      enunciado: 'Colisão inelástica: 2 kg a 10 m/s atinge 3 kg parado.',
      passos: colisaoComPassos(2, 10, 3, 0, 'perfeitamente-inelastica').passos,
    },
    vejaTambem: ['momento.impulso', 'momento.colisoes', 'propulsao.tsiolkovsky'],
  },
  {
    id: 'momento.colisoes',
    titulo: 'Colisões',
    resumo: 'Momento sempre; energia, só nas elásticas.',
    definicao:
      'Em toda colisão o momento se conserva. A energia cinética, não: numa colisão ' +
      'perfeitamente inelástica os corpos seguem juntos e parte da energia vira deformação e ' +
      'calor. Na elástica, ambos se conservam — e com massas iguais os corpos simplesmente ' +
      'trocam de velocidade.',
    formulas: [
      { tex: 'v_f = \\frac{m_1 v_1 + m_2 v_2}{m_1 + m_2}', legenda: 'Perfeitamente inelástica.' },
      {
        tex: 'v_1\' = \\frac{(m_1-m_2)v_1 + 2m_2 v_2}{m_1+m_2}',
        legenda: 'Elástica: resolve momento e energia juntos.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Na inelástica, impor velocidade comum basta para resolver.',
        tex: 'm_1 v_1 + m_2 v_2 = (m_1+m_2)v_f',
      },
      {
        descricao: 'A energia perdida é a diferença entre antes e depois.',
        tex: '\\Delta E = E_i - E_f > 0',
        nota: 'Ela não desaparece: vira deformação, som e calor.',
      },
      {
        descricao: 'Na elástica, o sistema tem duas equações e duas incógnitas.',
        tex: 'p_i = p_f \\quad \\text{e} \\quad E_i = E_f',
      },
      {
        descricao: 'Com massas iguais, a solução é a troca de velocidades.',
        tex: 'm_1 = m_2 \;\\Rightarrow\; v_1\' = v_2,\; v_2\' = v_1',
        nota: 'É o que se vê no berço de Newton.',
      },
    ],
    exemplo: {
      enunciado: 'Colisão elástica entre 2 kg a 8 m/s e 5 kg a −3 m/s.',
      passos: colisaoComPassos(2, 8, 5, -3, 'elastica').passos,
    },
    vejaTambem: ['momento.conservacao', 'energia.conservacao'],
  },
];
