import { analisarOndaComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_ONDAS: readonly Teoria[] = [
  {
    id: 'funcoes-trig.periodo',
    titulo: 'Periodicidade',
    resumo: 'O ponto dá a volta no círculo e tudo recomeça.',
    definicao:
      'Seno e cosseno se repetem a cada volta completa porque são as coordenadas de um ponto ' +
      'girando. Essa repetição é o que torna essas funções a linguagem natural de tudo que ' +
      'oscila: som, luz, corrente alternada, marés.',
    formulas: [
      { tex: '\\sin(x + 2\\pi) = \\sin x \\qquad \\cos(x + 2\\pi) = \\cos x' },
      { tex: 'T = \\frac{2\\pi}{|B|}', legenda: 'Período de sen(Bx).' },
    ],
    demonstracao: [
      {
        descricao: 'Depois de 2π radianos, o ponto volta exatamente ao lugar de partida.',
        tex: '\\theta + 2\\pi \;\\longrightarrow\; \\text{mesmo ponto}',
      },
      {
        descricao: 'Multiplicar x por B faz o argumento crescer B vezes mais rápido.',
        tex: 'Bx \\text{ percorre } 2\\pi \\text{ quando } x \\text{ percorre } \\frac{2\\pi}{B}',
        nota: 'Por isso o período encolhe na mesma proporção em que B cresce.',
      },
    ],
    exemplo: {
      enunciado: 'A onda y = sen(2x) tem período π.',
      passos: analisarOndaComPassos(1, 2, 0, 0).passos,
    },
    vejaTambem: ['funcoes-trig.amplitude', 'funcoes-trig.fase'],
  },
  {
    id: 'funcoes-trig.amplitude',
    titulo: 'Amplitude e deslocamento vertical',
    resumo: 'A estica na vertical; D sobe ou desce a onda inteira.',
    definicao:
      'Em y = A·sen(x) + D, o coeficiente A controla a altura da oscilação e D define a ' +
      'linha em torno da qual ela acontece. Juntos, determinam o conjunto imagem da função.',
    formulas: [
      { tex: 'y = A\\sin x + D \;\\Rightarrow\; y \\in [D - |A|,\; D + |A|]' },
      { tex: 'A < 0 \;\\Rightarrow\; \\text{a onda é espelhada verticalmente}' },
    ],
    demonstracao: [
      {
        descricao: 'O seno sozinho varia entre −1 e 1.',
        tex: '-1 \\leq \\sin x \\leq 1',
      },
      {
        descricao: 'Multiplicar por A estica esse intervalo.',
        tex: '-|A| \\leq A\\sin x \\leq |A|',
      },
      {
        descricao: 'Somar D desloca o intervalo inteiro.',
        tex: 'D - |A| \\leq A\\sin x + D \\leq D + |A|',
        nota: 'A onda passa a oscilar em torno da reta y = D.',
      },
    ],
    exemplo: {
      enunciado: 'A onda y = 3·sen(x) + 2 oscila entre −1 e 5.',
      passos: analisarOndaComPassos(3, 1, 0, 2).passos,
    },
    vejaTambem: ['funcoes-trig.periodo', 'funcoes-trig.fase'],
  },
  {
    id: 'funcoes-trig.fase',
    titulo: 'Fase: o deslocamento horizontal',
    resumo: 'C desloca a onda para a esquerda ou para a direita.',
    definicao:
      'Em y = sen(Bx + C), a constante C antecipa ou atrasa a oscilação. O deslocamento real ' +
      'não é C, e sim −C/B: é preciso dividir pelo coeficiente de x, porque ele comprime o ' +
      'eixo horizontal.',
    formulas: [
      { tex: 'y = \\sin(Bx + C) \;\\Rightarrow\; \\text{deslocamento} = -\\frac{C}{B}' },
      { tex: '\\cos x = \\sin\\left(x + \\frac{\\pi}{2}\\right)', legenda: 'Cosseno é o seno adiantado em 90°.' },
    ],
    demonstracao: [
      {
        descricao: 'A onda começa seu ciclo onde o argumento vale zero.',
        tex: 'Bx + C = 0 \;\\Rightarrow\; x = -\\frac{C}{B}',
      },
      {
        descricao: 'Com C positivo, o início acontece antes: a onda se desloca para a esquerda.',
        tex: 'C > 0 \;\\Rightarrow\; \\text{desloca para a esquerda}',
        nota: 'É contraintuitivo, mas o sinal do deslocamento é oposto ao de C.',
      },
      {
        descricao: 'O cosseno é exatamente o seno deslocado de um quarto de volta.',
        tex: '\\cos x = \\sin\\left(x + \\frac{\\pi}{2}\\right)',
      },
    ],
    exemplo: {
      enunciado: 'A onda y = sen(2x + π) está deslocada em −π/2.',
      passos: analisarOndaComPassos(1, 2, Math.PI, 0).passos,
    },
    vejaTambem: ['funcoes-trig.periodo', 'funcoes-trig.amplitude'],
  },
];
