import { Polinomio } from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_EXPRESSOES: readonly Teoria[] = [
  {
    id: 'expressoes.variavel',
    titulo: 'A letra é um número que ainda não sabemos',
    resumo: 'Variáveis obedecem às mesmas regras dos números.',
    definicao:
      'Uma variável não é um símbolo mágico: é um espaço reservado para um número. Por isso ' +
      'toda propriedade da aritmética — comutativa, associativa, distributiva — continua ' +
      'valendo exatamente igual quando há letras na expressão.',
    formulas: [
      { tex: '3x \\;\\text{significa}\\; 3 \\cdot x', legenda: 'A multiplicação fica implícita.' },
      {
        tex: 'x + x = 2x \\qquad x \\cdot x = x^{2}',
        legenda: 'Somar não é o mesmo que multiplicar.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Avaliar é substituir a letra por um número e calcular.',
        tex: '3x + 2 \\quad \\text{com} \\quad x = 4 \\;\\Rightarrow\\; 3 \\cdot 4 + 2 = 14',
      },
      {
        descricao: 'Somar x com x é contar duas parcelas iguais.',
        tex: 'x + x = 2x',
      },
      {
        descricao: 'Multiplicar x por x é contar dois fatores iguais, o que dá uma potência.',
        tex: 'x \\cdot x = x^{2}',
        nota: 'Confundir 2x com x² é um dos erros mais frequentes de quem começa.',
      },
    ],
    exemplo: {
      enunciado: 'Avaliando 2x² − 3x + 1 em x = 3.',
      passos: [
        { descricao: 'Substituímos x por 3.', tex: '2 \\cdot 3^{2} - 3 \\cdot 3 + 1' },
        { descricao: 'Resolvemos a potência primeiro.', tex: '= 2 \\cdot 9 - 9 + 1' },
        { descricao: 'Depois os produtos, e por fim as somas.', tex: '= 18 - 9 + 1 = 10' },
      ],
    },
    vejaTambem: ['expressoes.semelhantes', 'expressoes.distributiva'],
  },
  {
    id: 'expressoes.semelhantes',
    titulo: 'Termos semelhantes',
    resumo: 'Só se somam termos com a mesma parte literal.',
    definicao:
      'Termos semelhantes têm exatamente a mesma letra elevada ao mesmo expoente. Reduzi-los ' +
      'é apenas somar seus coeficientes — a parte literal fica intacta, porque ela funciona ' +
      'como uma unidade.',
    formulas: [
      { tex: 'ax^{n} + bx^{n} = (a + b)x^{n}' },
      {
        tex: '3x + 2x^{2} \\;\\text{não reduz}',
        legenda: 'Expoentes diferentes, termos diferentes.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Pela distributiva lida ao contrário, a parte literal sai em evidência.',
        tex: '3x + 5x = (3 + 5)x = 8x',
      },
      {
        descricao: 'Pense em unidades: 3 maçãs mais 5 maçãs são 8 maçãs.',
        tex: '3 \\text{ maçãs} + 5 \\text{ maçãs} = 8 \\text{ maçãs}',
        nota: 'Mas 3 maçãs e 5 laranjas não somam: é o caso de x e x².',
      },
      {
        descricao: 'Por isso termos de graus diferentes permanecem separados.',
        tex: '3x + 2x^{2} \\;\\text{continua} \\; 2x^{2} + 3x',
      },
    ],
    exemplo: {
      enunciado: 'Reduzindo 4x² + 3x − x² + 5x.',
      passos: [
        {
          descricao: 'Agrupamos os termos de mesmo grau.',
          tex: '(4x^{2} - x^{2}) + (3x + 5x)',
        },
        {
          descricao: 'Somamos os coeficientes de cada grupo.',
          tex: `= ${Polinomio.de(0, 8, 3).paraTex()}`,
        },
      ],
    },
    vejaTambem: ['expressoes.distributiva', 'expressoes.variavel'],
  },
  {
    id: 'expressoes.distributiva',
    titulo: 'Distributiva com parênteses',
    resumo: 'O sinal de menos na frente do parêntese troca TUDO que está dentro.',
    definicao:
      'Multiplicar um número por um parêntese distribui esse número sobre cada termo interno. ' +
      'Quando há apenas um sinal de menos antes do parêntese, ele equivale a multiplicar por ' +
      '−1 — e por isso inverte o sinal de todos os termos, não só do primeiro.',
    formulas: [
      { tex: 'a(b + c) = ab + ac' },
      { tex: '-(b + c) = -b - c', legenda: 'O erro clássico é escrever −b + c.' },
    ],
    demonstracao: [
      {
        descricao: 'Um sinal de menos isolado é uma multiplicação por −1.',
        tex: '-(x - 3) = (-1)(x - 3)',
      },
      {
        descricao: 'Distribuindo o −1 por cada termo de dentro.',
        tex: '= (-1)(x) + (-1)(-3) = -x + 3',
        nota: 'O segundo termo mudou de sinal também — é isso que costuma escapar.',
      },
      {
        descricao: 'Conferindo com números: para x = 5, os dois lados dão o mesmo.',
        tex: '-(5 - 3) = -2 \\qquad -5 + 3 = -2 \\;\\checkmark',
      },
    ],
    exemplo: {
      enunciado: 'Expandindo 2(x + 3) − (x − 4).',
      passos: [
        { descricao: 'Distribuímos o 2.', tex: '2x + 6 - (x - 4)' },
        {
          descricao: 'Distribuímos o sinal negativo sobre os DOIS termos.',
          tex: '= 2x + 6 - x + 4',
        },
        { descricao: 'Reduzimos os termos semelhantes.', tex: '= x + 10' },
      ],
    },
    vejaTambem: ['expressoes.semelhantes', 'produtos.quadrado'],
  },
];
