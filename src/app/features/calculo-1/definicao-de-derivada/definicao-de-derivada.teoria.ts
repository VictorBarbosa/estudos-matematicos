import { derivadaPelaDefinicaoComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_DEFINICAO_DERIVADA: readonly Teoria[] = [
  {
    id: 'derivada.secante',
    titulo: 'Da secante à tangente',
    resumo: 'A derivada é o limite da inclinação de uma reta que corta a curva.',
    definicao:
      'Tomando dois pontos sobre a curva, a reta que os une tem uma inclinação calculável. ' +
      'Aproximando o segundo ponto do primeiro, essa secante gira até virar a tangente — e ' +
      'sua inclinação no limite é a derivada.',
    formulas: [
      { tex: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}" },
      { tex: 'm_{\\text{secante}} = \\frac{\\Delta y}{\\Delta x} = \\frac{f(x+h) - f(x)}{h}' },
    ],
    demonstracao: [
      {
        descricao: 'Com dois pontos, a inclinação é a razão entre as variações.',
        tex: '\\frac{f(x+h) - f(x)}{(x+h) - x} = \\frac{f(x+h) - f(x)}{h}',
      },
      {
        descricao: 'Diminuindo h, o segundo ponto desliza em direção ao primeiro.',
        tex: 'h \\to 0',
      },
      {
        descricao: 'No limite, a secante encosta na curva num ponto só: é a tangente.',
        tex: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h)-f(x)}{h}",
        nota: 'Com h = 0 exato a fração seria 0/0 — por isso o limite é indispensável.',
      },
    ],
    exemplo: {
      enunciado: 'A derivada de x² em x = 3.',
      passos: derivadaPelaDefinicaoComPassos((x) => x * x, 3, 'x^{2}').passos,
    },
    vejaTambem: ['derivada.interpretacao', 'derivada.notacao'],
  },
  {
    id: 'derivada.interpretacao',
    titulo: 'Taxa de variação instantânea',
    resumo: 'Velocidade é a derivada da posição.',
    definicao:
      'A mesma conta que dá a inclinação da tangente dá a taxa de variação instantânea. Se ' +
      'f é a posição em função do tempo, f′ é a velocidade naquele instante — não a média ' +
      'num intervalo, mas o valor exato num ponto.',
    formulas: [
      { tex: 'v_{\\text{média}} = \\frac{\\Delta s}{\\Delta t} \\qquad v_{\\text{instantânea}} = \\lim_{\\Delta t \\to 0} \\frac{\\Delta s}{\\Delta t}' },
    ],
    demonstracao: [
      {
        descricao: 'A velocidade média usa um intervalo de tempo.',
        tex: '\\frac{s(t + \\Delta t) - s(t)}{\\Delta t}',
      },
      {
        descricao: 'Encolhendo o intervalo, aproximamo-nos do instante.',
        tex: '\\Delta t \\to 0',
        nota: 'O velocímetro do carro mostra exatamente isso.',
      },
      {
        descricao: 'É a mesma estrutura da derivada, com outro nome.',
        tex: "v(t) = s'(t)",
      },
    ],
    exemplo: {
      enunciado: 'A derivada de x³ em x = 2.',
      passos: derivadaPelaDefinicaoComPassos((x) => x ** 3, 2, 'x^{3}').passos,
    },
    vejaTambem: ['derivada.secante', 'derivada.notacao'],
  },
  {
    id: 'derivada.notacao',
    titulo: 'Notações e derivabilidade',
    resumo: 'Nem toda função contínua tem derivada.',
    definicao:
      'A derivada aparece escrita de várias formas: f′(x), dy/dx, df/dx. E nem toda função ' +
      'contínua é derivável — num bico, os limites laterais do quociente discordam, e a ' +
      'tangente não fica definida.',
    formulas: [
      { tex: "f'(x) = \\frac{dy}{dx} = \\frac{df}{dx}" },
      { tex: '\\text{derivável} \\Rightarrow \\text{contínua, mas não o contrário}' },
    ],
    demonstracao: [
      {
        descricao: 'Em |x|, a inclinação pela esquerda é −1.',
        tex: '\\lim_{h \\to 0^{-}} \\frac{|h|}{h} = -1',
      },
      {
        descricao: 'E pela direita é +1.',
        tex: '\\lim_{h \\to 0^{+}} \\frac{|h|}{h} = 1',
      },
      {
        descricao: 'Os lados discordam: não há tangente única no bico.',
        tex: "\\nexists f'(0)",
        nota: 'A função é contínua ali, mas não derivável — derivabilidade é mais exigente.',
      },
    ],
    exemplo: {
      enunciado: 'A derivada de uma função suave, onde tudo funciona.',
      passos: derivadaPelaDefinicaoComPassos((x) => 2 * x * x + 1, 1, '2x^{2}+1').passos,
    },
    vejaTambem: ['derivada.secante', 'continuidade.definicao'],
  },
];
