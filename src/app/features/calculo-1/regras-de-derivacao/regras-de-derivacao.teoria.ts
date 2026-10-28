import { Polinomio, derivarPolinomioComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_REGRAS: readonly Teoria[] = [
  {
    id: 'regras.potencia',
    titulo: 'Regra da potência',
    resumo: 'O expoente desce multiplicando e diminui em um.',
    definicao:
      'É a regra mais usada do cálculo, e ela não é arbitrária: sai do quociente de Newton ' +
      'aplicado a xⁿ. Expandindo (x+h)ⁿ, todos os termos com h² ou mais somem no limite, e ' +
      'sobra exatamente n·xⁿ⁻¹.',
    formulas: [
      { tex: "\\frac{d}{dx}\\left(x^{n}\\right) = n\\,x^{n-1}" },
      { tex: "\\frac{d}{dx}(c) = 0", legenda: 'Uma constante não varia.' },
      { tex: "\\frac{d}{dx}(cf) = c\\,f'", legenda: 'Constantes saem da derivada.' },
    ],
    demonstracao: [
      {
        descricao: 'Aplicando a definição a x², expandimos o binômio.',
        tex: '\\frac{(x+h)^{2} - x^{2}}{h} = \\frac{x^{2} + 2xh + h^{2} - x^{2}}{h}',
      },
      {
        descricao: 'O x² se cancela, e dividimos por h.',
        tex: '= 2x + h',
      },
      {
        descricao: 'Com h tendendo a zero, sobra o resultado da regra.',
        tex: "\\frac{d}{dx}(x^{2}) = 2x",
        nota: 'O mesmo raciocínio, com o binômio de Newton, vale para qualquer expoente.',
      },
      {
        descricao: 'A derivada de uma constante é zero porque ela nunca muda.',
        tex: '\\frac{c - c}{h} = 0',
      },
    ],
    exemplo: {
      enunciado: 'Derivando 3x³ − 5x² + 7.',
      passos: derivarPolinomioComPassos(Polinomio.de(7, 0, -5, 3)).passos,
    },
    vejaTambem: ['regras.produto', 'regras.quociente'],
  },
  {
    id: 'regras.produto',
    titulo: 'Regra do produto',
    resumo: 'A derivada de um produto NÃO é o produto das derivadas.',
    definicao:
      'Derivar f·g exige dois termos: deriva-se o primeiro mantendo o segundo, e vice-versa. ' +
      'Supor que (fg)′ = f′g′ é um erro grave — basta testar com x·x para ver que falha.',
    formulas: [
      { tex: "(f \\cdot g)' = f'g + fg'" },
      { tex: "(f \\cdot g)' \\neq f' \\cdot g'" },
    ],
    demonstracao: [
      {
        descricao: 'Um contraexemplo derruba a versão ingênua.',
        tex: '(x \\cdot x)\' = (x^{2})\' = 2x',
      },
      {
        descricao: 'Enquanto o produto das derivadas daria outro resultado.',
        tex: "x' \\cdot x' = 1 \\cdot 1 = 1 \\neq 2x",
      },
      {
        descricao: 'Geometricamente: a área de um retângulo cresce pelos dois lados ao mesmo tempo.',
        tex: '\\Delta(fg) \\approx f\\,\\Delta g + g\\,\\Delta f',
        nota: 'Cada lado contribui com sua própria variação — daí as duas parcelas.',
      },
    ],
    exemplo: {
      enunciado: 'Conferindo com (x+1)(x+2) = x² + 3x + 2.',
      passos: derivarPolinomioComPassos(Polinomio.de(2, 3, 1)).passos,
    },
    vejaTambem: ['regras.potencia', 'regras.quociente'],
  },
  {
    id: 'regras.quociente',
    titulo: 'Regra do quociente',
    resumo: 'Menos no meio, e o denominador ao quadrado.',
    definicao:
      'A regra do quociente tem dois detalhes que costumam escapar: o sinal é de subtração, ' +
      'e a ordem dos termos importa. O denominador original aparece elevado ao quadrado.',
    formulas: [
      { tex: "\\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^{2}}" },
    ],
    demonstracao: [
      {
        descricao: 'Escrevendo o quociente como produto por uma potência negativa.',
        tex: '\\frac{f}{g} = f \\cdot g^{-1}',
      },
      {
        descricao: 'Aplicando produto e cadeia.',
        tex: "f'g^{-1} + f \\cdot (-1)g^{-2}g'",
      },
      {
        descricao: 'Reduzindo ao mesmo denominador.',
        tex: "= \\frac{f'g - fg'}{g^{2}}",
        nota: 'Ao contrário do produto, aqui a ordem dos termos no numerador importa.',
      },
    ],
    exemplo: {
      enunciado: 'A derivada de um polinômio, para comparação.',
      passos: derivarPolinomioComPassos(Polinomio.de(0, 1, 0, 2)).passos,
    },
    vejaTambem: ['regras.produto', 'regras.potencia'],
  },
];
