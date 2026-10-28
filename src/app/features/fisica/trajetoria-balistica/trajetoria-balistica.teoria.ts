import { GRAVIDADE, resolverLancamentoComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

const exemplo = { velocidadeInicial: 20, anguloGraus: 45, alturaInicial: 0, gravidade: GRAVIDADE };

export const TEORIA_BALISTICA: readonly Teoria[] = [
  {
    id: 'balistica.independencia',
    titulo: 'Dois movimentos independentes',
    resumo: 'Horizontal uniforme, vertical acelerado.',
    definicao:
      'A chave do lançamento oblíquo é tratar as duas direções separadamente. Na ' +
      'horizontal, nada freia o projétil, e a velocidade é constante. Na vertical, a ' +
      'gravidade age sozinha, exatamente como numa queda livre.',
    formulas: [
      { tex: 'x(t) = v_x t', legenda: 'Horizontal: movimento uniforme.' },
      { tex: 'y(t) = h_0 + v_y t - \\frac{g t^{2}}{2}', legenda: 'Vertical: uniformemente acelerado.' },
      { tex: 'v_x = v_0\\cos\\theta \\qquad v_y = v_0\\sin\\theta' },
    ],
    demonstracao: [
      {
        descricao: 'A velocidade inicial se decompõe por trigonometria.',
        tex: 'v_x = v_0\\cos\\theta \\qquad v_y = v_0\\sin\\theta',
      },
      {
        descricao: 'A gravidade atua só na vertical.',
        tex: 'a_x = 0 \\qquad a_y = -g',
      },
      {
        descricao: 'Por isso uma bala disparada na horizontal cai junto com uma solta do repouso.',
        tex: 'y(t) \\text{ é a mesma nos dois casos}',
        nota: 'O movimento horizontal não atrasa nem adianta a queda — é o experimento clássico.',
      },
    ],
    exemplo: {
      enunciado: 'Um lançamento a 20 m/s e 45°.',
      passos: resolverLancamentoComPassos(exemplo).passos,
    },
    vejaTambem: ['balistica.parabola', 'balistica.alcance'],
  },
  {
    id: 'balistica.parabola',
    titulo: 'Por que a trajetória é uma parábola',
    resumo: 'Eliminando o tempo, sobra uma função quadrática.',
    definicao:
      'As duas equações dependem do tempo. Isolando t na horizontal e substituindo na ' +
      'vertical, o tempo some e sobra y em função de x — uma quadrática. É daí que vem a ' +
      'parábola.',
    formulas: [
      { tex: 'y = h_0 + x\\tan\\theta - \\frac{g}{2v_0^{2}\\cos^{2}\\theta}x^{2}' },
    ],
    demonstracao: [
      {
        descricao: 'Isolamos o tempo na equação horizontal.',
        tex: 't = \\frac{x}{v_x}',
      },
      {
        descricao: 'Substituímos na vertical.',
        tex: 'y = h_0 + v_y\\frac{x}{v_x} - \\frac{g}{2}\\left(\\frac{x}{v_x}\\right)^{2}',
      },
      {
        descricao: 'Reorganizando, aparece uma quadrática em x.',
        tex: 'y = h_0 + x\\tan\\theta - \\frac{g}{2v_x^{2}}x^{2}',
        nota: 'Coeficiente de x² negativo: a parábola abre para baixo, como esperado.',
      },
      {
        descricao: 'O vértice dessa parábola é o ponto mais alto do voo.',
        tex: 'x_v = \\frac{v_x v_y}{g}',
      },
    ],
    exemplo: {
      enunciado: 'A mesma trajetória, vista como função de x.',
      passos: resolverLancamentoComPassos({ ...exemplo, anguloGraus: 60 }).passos,
    },
    vejaTambem: ['balistica.independencia', 'balistica.alcance'],
  },
  {
    id: 'balistica.alcance',
    titulo: 'O ângulo de alcance máximo',
    resumo: '45° no plano — mas menos que isso de um ponto elevado.',
    definicao:
      'Sem altura inicial, o alcance é máximo a 45°. A razão é que aumentar o ângulo ganha ' +
      'tempo de voo mas perde velocidade horizontal, e 45° equilibra os dois efeitos. ' +
      'Lançando de uma altura, o equilíbrio muda e o ângulo ótimo cai abaixo de 45°.',
    formulas: [
      { tex: 'A = \\frac{v_0^{2}\\sin(2\\theta)}{g}', legenda: 'Alcance com altura inicial zero.' },
      { tex: '\\sin(2\\theta) = 1 \\iff \\theta = 45°' },
    ],
    demonstracao: [
      {
        descricao: 'Com h₀ = 0, o tempo de voo é o dobro do tempo até o ápice.',
        tex: 't_{\\text{voo}} = \\frac{2v_0\\sin\\theta}{g}',
      },
      {
        descricao: 'O alcance é a velocidade horizontal vezes esse tempo.',
        tex: 'A = v_0\\cos\\theta \\cdot \\frac{2v_0\\sin\\theta}{g} = \\frac{v_0^{2} \\cdot 2\\sin\\theta\\cos\\theta}{g}',
      },
      {
        descricao: 'Pela fórmula do arco duplo, isso é sen(2θ).',
        tex: 'A = \\frac{v_0^{2}\\sin(2\\theta)}{g}',
      },
      {
        descricao: 'O seno vale no máximo 1, quando o arco é 90°.',
        tex: '2\\theta = 90° \;\\Rightarrow\; \\theta = 45°',
        nota: 'Por isso ângulos complementares, como 30° e 60°, dão o mesmo alcance.',
      },
    ],
    exemplo: {
      enunciado: 'Lançando de uma altura, o ótimo deixa de ser 45°.',
      passos: resolverLancamentoComPassos({ ...exemplo, alturaInicial: 20 }).passos,
    },
    vejaTambem: ['balistica.parabola', 'identidades.arco-duplo'],
  },
];
