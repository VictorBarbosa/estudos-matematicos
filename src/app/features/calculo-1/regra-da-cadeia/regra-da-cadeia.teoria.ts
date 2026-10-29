import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_CADEIA: readonly Teoria[] = [
  {
    id: 'cadeia.regra',
    titulo: 'Derivar de fora para dentro',
    resumo: 'A derivada externa vezes a derivada interna.',
    definicao:
      'Para derivar uma função composta, deriva-se a função de fora mantendo o miolo intacto, ' +
      'e multiplica-se pela derivada do miolo. Esquecer esse segundo fator é o erro mais ' +
      'frequente de todo o cálculo diferencial.',
    formulas: [
      { tex: "\\left[f(g(x))\\right]' = f'(g(x)) \\cdot g'(x)" },
      { tex: '\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}', legenda: 'Notação de Leibniz.' },
    ],
    demonstracao: [
      {
        descricao: 'Na notação de Leibniz, os diferenciais parecem se cancelar.',
        tex: '\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}',
        nota: 'É uma mnemônica muito boa, embora a demonstração rigorosa seja mais cuidadosa.',
      },
      {
        descricao: 'Intuitivamente: se y muda 3× mais rápido que u, e u muda 2× mais rápido que x…',
        tex: '3 \\cdot 2 = 6',
        nota: '…então y muda 6 vezes mais rápido que x. As taxas se multiplicam.',
      },
      {
        descricao: 'Em (3x+1)², a função de fora é o quadrado e a de dentro é 3x+1.',
        tex: "2(3x+1) \\cdot 3 = 6(3x+1)",
      },
      {
        descricao: 'Conferindo pela expansão: (3x+1)² = 9x² + 6x + 1.',
        tex: "\\frac{d}{dx}(9x^{2} + 6x + 1) = 18x + 6 = 6(3x+1) \\;\\checkmark",
      },
    ],
    vejaTambem: ['cadeia.erro-comum', 'cadeia.camadas'],
  },
  {
    id: 'cadeia.erro-comum',
    titulo: 'O fator que se esquece',
    resumo: 'Sem a derivada interna, a conta fica errada por um múltiplo.',
    definicao:
      'Derivar (3x+1)² como 2(3x+1) esquece o fator 3. O resultado fica proporcional ao ' +
      'correto, mas errado — e o erro cresce com o coeficiente interno.',
    formulas: [
      { tex: "\\left[(ax+b)^{n}\\right]' = n(ax+b)^{n-1} \\cdot a" },
    ],
    demonstracao: [
      {
        descricao: 'Expandindo (2x+1)² para conferir sem a cadeia.',
        tex: '(2x+1)^{2} = 4x^{2} + 4x + 1',
      },
      {
        descricao: 'Derivando a expansão.',
        tex: '8x + 4',
      },
      {
        descricao: 'Pela cadeia, com o fator interno.',
        tex: '2(2x+1) \\cdot 2 = 8x + 4 \\;\\checkmark',
      },
      {
        descricao: 'Sem o fator interno, o resultado seria a metade.',
        tex: '2(2x+1) = 4x + 2 \\;\\times',
        nota: 'Exatamente metade — porque faltou multiplicar pelo 2 de dentro.',
      },
    ],
    vejaTambem: ['cadeia.regra', 'cadeia.camadas'],
  },
  {
    id: 'cadeia.camadas',
    titulo: 'Várias camadas',
    resumo: 'Cada camada contribui com um fator.',
    definicao:
      'Com três funções encadeadas, multiplicam-se três derivadas. O procedimento é sempre o ' +
      'mesmo: desmonta-se a composição de fora para dentro, e cada nível acrescenta um fator.',
    formulas: [
      { tex: "\\left[f(g(h(x)))\\right]' = f'(g(h(x))) \\cdot g'(h(x)) \\cdot h'(x)" },
    ],
    demonstracao: [
      {
        descricao: 'Identificamos as camadas de fora para dentro.',
        tex: '\\sin\\left((2x+1)^{3}\\right): \\;\\sin \\to (\\;)^{3} \\to 2x+1',
      },
      {
        descricao: 'Cada uma contribui com sua derivada.',
        tex: '\\cos\\left((2x+1)^{3}\\right) \\cdot 3(2x+1)^{2} \\cdot 2',
      },
      {
        descricao: 'O produto dos três fatores é a derivada.',
        tex: '= 6(2x+1)^{2}\\cos\\left((2x+1)^{3}\\right)',
      },
    ],
    vejaTambem: ['cadeia.regra', 'cadeia.erro-comum'],
  },
];
