import { Polinomio, teoremaFundamentalComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_TFC: readonly Teoria[] = [
  {
    id: 'tfc.enunciado',
    titulo: 'A ponte entre as duas operações',
    resumo: 'Derivar e integrar são inversas uma da outra.',
    definicao:
      'O Teorema Fundamental do Cálculo liga as duas grandes ideias do curso: a derivada, ' +
      'que mede variação, e a integral, que acumula. Ele transforma o cálculo de áreas — ' +
      'que exigiria um limite de somas infinitas — numa simples subtração.',
    formulas: [
      { tex: "\\int_{a}^{b} f(x)\\,dx = F(b) - F(a), \\quad F' = f" },
      { tex: "\\frac{d}{dx}\\int_{a}^{x} f(t)\\,dt = f(x)", legenda: 'A outra metade do teorema.' },
    ],
    demonstracao: [
      {
        descricao: 'Definimos a função área acumulada até x.',
        tex: 'A(x) = \\int_{a}^{x} f(t)\\,dt',
      },
      {
        descricao: 'Aumentando x um pouco, a área cresce por uma tira estreita.',
        tex: 'A(x + h) - A(x) \\approx f(x) \\cdot h',
        nota: 'A tira é quase um retângulo de base h e altura f(x).',
      },
      {
        descricao: 'Dividindo por h e tomando o limite, aparece a derivada.',
        tex: "A'(x) = \\lim_{h \\to 0} \\frac{A(x+h) - A(x)}{h} = f(x)",
      },
      {
        descricao: 'Ou seja, a função área É uma antiderivada de f.',
        tex: "A' = f",
        nota: 'Daí a integral definida poder ser calculada por qualquer antiderivada.',
      },
    ],
    exemplo: {
      enunciado: 'Calculando a área sob x² de 0 a 3 sem nenhuma soma de Riemann.',
      passos: teoremaFundamentalComPassos(Polinomio.de(0, 0, 1), 0, 3).passos,
    },
    vejaTambem: ['tfc.constante', 'tfc.funcao-area'],
  },
  {
    id: 'tfc.constante',
    titulo: 'Por que o + C não importa aqui',
    resumo: 'A constante se cancela na subtração.',
    definicao:
      'Na integral indefinida a constante é indispensável; na definida, ela desaparece. ' +
      'Como calculamos F(b) − F(a), qualquer constante somada aparece dos dois lados e se ' +
      'anula.',
    formulas: [
      { tex: '(F(b) + C) - (F(a) + C) = F(b) - F(a)' },
    ],
    demonstracao: [
      {
        descricao: 'Tomando duas antiderivadas diferentes da mesma função.',
        tex: 'F(x) \\quad \\text{e} \\quad F(x) + 7',
      },
      {
        descricao: 'Avaliando a diferença com a primeira.',
        tex: 'F(b) - F(a)',
      },
      {
        descricao: 'E com a segunda.',
        tex: '[F(b) + 7] - [F(a) + 7] = F(b) - F(a)',
        nota: 'Idênticas — por isso escolhemos sempre a antiderivada mais simples, com C = 0.',
      },
    ],
    exemplo: {
      enunciado: 'A mesma integral, com qualquer constante.',
      passos: teoremaFundamentalComPassos(Polinomio.de(0, 2), 1, 4).passos,
    },
    vejaTambem: ['tfc.enunciado', 'indefinida.constante'],
  },
  {
    id: 'tfc.funcao-area',
    titulo: 'A função área acumulada',
    resumo: 'Derivar a área devolve a altura.',
    definicao:
      'A segunda parte do teorema é talvez mais surpreendente: se definirmos uma função que ' +
      'acumula área da esquerda até x, sua derivada em cada ponto é exatamente a altura da ' +
      'curva ali. Acumular e medir variação são operações opostas.',
    formulas: [
      { tex: "A(x) = \\int_{a}^{x} f(t)\\,dt \;\\Rightarrow\; A'(x) = f(x)" },
    ],
    demonstracao: [
      {
        descricao: 'Onde a função é alta, a área acumula depressa.',
        tex: 'f \\text{ grande} \;\\Rightarrow\; A \\text{ cresce rápido}',
      },
      {
        descricao: 'Onde a função é zero, a área para de crescer.',
        tex: "f = 0 \;\\Rightarrow\; A' = 0",
        nota: 'A função acumulada tem um ponto crítico onde a curva cruza o eixo.',
      },
      {
        descricao: 'Onde a função é negativa, a área acumulada diminui.',
        tex: 'f < 0 \;\\Rightarrow\; A \\text{ decresce}',
      },
    ],
    exemplo: {
      enunciado: 'A área acumulada sob uma reta cresce como uma parábola.',
      passos: teoremaFundamentalComPassos(Polinomio.de(0, 1), 0, 4).passos,
    },
    vejaTambem: ['tfc.enunciado', 'integral-def.definicao'],
  },
];
