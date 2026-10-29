import { resolverOscilacaoComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_MHS: readonly Teoria[] = [
  {
    id: 'mhs.equacao',
    titulo: 'Por que o cosseno aparece',
    resumo: 'É a função cuja segunda derivada é ela mesma, com sinal trocado.',
    definicao:
      'Na mola, a força é proporcional ao deslocamento e aponta de volta ao centro. Pela ' +
      'segunda lei de Newton, isso significa que a aceleração é proporcional à posição, com ' +
      'sinal oposto — e o cosseno é exatamente a função que satisfaz essa condição.',
    formulas: [
      { tex: 'F = -kx \\;\\Rightarrow\\; a = -\\frac{k}{m}x' },
      { tex: 'x(t) = A\\cos(\\omega t + \\varphi), \\quad \\omega = \\sqrt{\\frac{k}{m}}' },
    ],
    demonstracao: [
      {
        descricao: 'Derivando o cosseno duas vezes, voltamos ao cosseno negativo.',
        tex: "x = A\\cos(\\omega t) \\;\\Rightarrow\\; x'' = -A\\omega^{2}\\cos(\\omega t)",
      },
      {
        descricao: 'Ou seja, a segunda derivada é proporcional à própria função.',
        tex: "x'' = -\\omega^{2}x",
      },
      {
        descricao: 'Comparando com a equação da física, identificamos ω.',
        tex: '\\omega^{2} = \\frac{k}{m} \\;\\Rightarrow\\; \\omega = \\sqrt{\\frac{k}{m}}',
        nota: 'A trigonometria entra não por acaso, mas porque resolve essa equação.',
      },
    ],
    exemplo: {
      enunciado: 'Uma massa de 2 kg numa mola de constante 8 N/m.',
      passos: resolverOscilacaoComPassos(0.1, 8, 2).passos,
    },
    vejaTambem: ['mhs.periodo', 'mhs.derivadas'],
  },
  {
    id: 'mhs.periodo',
    titulo: 'O período não depende da amplitude',
    resumo: 'Puxar mais a mola não muda o tempo de ida e volta.',
    definicao:
      'Este é o fato surpreendente do MHS: aumentar a amplitude faz o corpo percorrer mais ' +
      'distância, mas também o faz ir mais rápido — e os dois efeitos se cancelam ' +
      'exatamente. É por isso que osciladores servem para marcar tempo.',
    formulas: [
      { tex: 'T = 2\\pi\\sqrt{\\frac{m}{k}}', legenda: 'A amplitude não aparece.' },
      { tex: 'f = \\frac{1}{T}' },
    ],
    demonstracao: [
      {
        descricao: 'O período sai direto da frequência angular.',
        tex: 'T = \\frac{2\\pi}{\\omega} = 2\\pi\\sqrt{\\frac{m}{k}}',
      },
      {
        descricao: 'Nenhum A aparece na fórmula.',
        tex: 'T \\neq f(A)',
        nota: 'Dobrar a amplitude dobra a distância percorrida e também a velocidade máxima.',
      },
      {
        descricao: 'Mais massa deixa o movimento mais lento; mola mais rígida, mais rápido.',
        tex: 'm \\uparrow \\;\\Rightarrow\\; T \\uparrow \\qquad k \\uparrow \\;\\Rightarrow\\; T \\downarrow',
      },
    ],
    exemplo: {
      enunciado: 'Dobrando a amplitude, o período permanece o mesmo.',
      passos: resolverOscilacaoComPassos(0.2, 8, 2).passos,
    },
    vejaTambem: ['mhs.equacao', 'mhs.derivadas'],
  },
  {
    id: 'mhs.derivadas',
    titulo: 'Posição, velocidade e aceleração',
    resumo: 'Cada derivada adianta a onda em um quarto de período.',
    definicao:
      'Derivando a posição obtemos a velocidade; derivando de novo, a aceleração. Como a ' +
      'derivada do cosseno é menos seno, cada derivação desloca a onda — e a aceleração ' +
      'acaba em oposição de fase com a posição.',
    formulas: [
      { tex: 'x(t) = A\\cos(\\omega t)' },
      { tex: 'v(t) = -A\\omega\\sin(\\omega t)' },
      { tex: 'a(t) = -A\\omega^{2}\\cos(\\omega t) = -\\omega^{2}x(t)' },
    ],
    demonstracao: [
      {
        descricao: 'Nos extremos, o corpo para por um instante.',
        tex: 'x = \\pm A \\;\\Rightarrow\\; v = 0',
      },
      {
        descricao: 'No centro, a velocidade é máxima e a aceleração é nula.',
        tex: 'x = 0 \\;\\Rightarrow\\; |v| = A\\omega,\\; a = 0',
        nota: 'A força da mola é zero ali, porque não há deslocamento.',
      },
      {
        descricao: 'A aceleração sempre aponta de volta ao centro.',
        tex: 'a = -\\omega^{2}x',
        nota: 'É essa oposição de sinal que mantém o corpo oscilando em vez de escapar.',
      },
    ],
    exemplo: {
      enunciado: 'Uma oscilação mais rígida, com período menor.',
      passos: resolverOscilacaoComPassos(0.15, 32, 2).passos,
    },
    vejaTambem: ['mhs.equacao', 'mhs.periodo'],
  },
];
