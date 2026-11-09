import { resolverLinearComPassos } from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_EQUACAO_1: readonly Teoria[] = [
  {
    id: 'equacao1.igualdade',
    titulo: 'A equação como balança',
    resumo: 'O que se faz de um lado tem de ser feito do outro.',
    definicao:
      'Uma equação afirma que dois lados valem o mesmo. Resolver é isolar a incógnita sem ' +
      'quebrar essa igualdade, e isso só é possível aplicando a MESMA operação aos dois ' +
      'lados — como manter uma balança equilibrada.',
    formulas: [
      {
        tex: 'a = b \\;\\Longrightarrow\\; a + k = b + k',
        legenda: 'Somar o mesmo nos dois lados.',
      },
      { tex: 'a = b \\;\\Longrightarrow\\; a \\cdot k = b \\cdot k \\quad (k \\neq 0)' },
    ],
    demonstracao: [
      {
        descricao: 'Partimos de uma igualdade verdadeira.',
        tex: '2x + 3 = 11',
      },
      {
        descricao: 'Subtraímos 3 dos DOIS lados; a balança continua equilibrada.',
        tex: '2x + 3 - 3 = 11 - 3 \\;\\Rightarrow\\; 2x = 8',
        nota: 'Isto é o que realmente acontece quando se diz "passa para o outro lado trocando o sinal".',
      },
      {
        descricao: 'Dividimos os dois lados por 2.',
        tex: '\\frac{2x}{2} = \\frac{8}{2} \\;\\Rightarrow\\; x = 4',
      },
    ],
    exemplo: {
      enunciado: 'Resolvendo 3x − 5 = 7.',
      passos: resolverLinearComPassos(3, -5, 7).passos,
    },
    vejaTambem: ['equacao1.raiz', 'equacao1.verificacao'],
  },
  {
    id: 'equacao1.raiz',
    titulo: 'A raiz e o gráfico',
    resumo: 'A solução é onde a reta cruza o eixo x.',
    definicao:
      'A equação ax + b = 0 pergunta para qual x a função y = ax + b vale zero. Como essa ' +
      'função é uma reta, a resposta é o ponto em que ela corta o eixo horizontal — e, por ' +
      'ser uma reta não horizontal, esse ponto é único.',
    formulas: [{ tex: 'ax + b = 0 \\;\\Longrightarrow\\; x = -\\frac{b}{a} \\quad (a \\neq 0)' }],
    demonstracao: [
      {
        descricao: 'Pensamos no lado esquerdo como uma função.',
        tex: 'y = ax + b',
      },
      {
        descricao: 'A equação pede o x em que essa função se anula.',
        tex: 'y = 0 \\;\\Longleftrightarrow\\; ax + b = 0',
      },
      {
        descricao: 'Uma reta com inclinação não nula cruza o eixo x exatamente uma vez.',
        tex: 'x = -\\frac{b}{a}',
        nota: 'Se a = 0 a reta é horizontal: ou nunca cruza, ou é o próprio eixo.',
      },
    ],
    exemplo: {
      enunciado: 'A raiz de 2x − 6 = 0 é onde a reta y = 2x − 6 corta o eixo x.',
      passos: resolverLinearComPassos(2, -6).passos,
    },
    vejaTambem: ['equacao1.igualdade', 'equacao1.casos-especiais'],
  },
  {
    id: 'equacao1.casos-especiais',
    titulo: 'Quando não há uma única solução',
    resumo: 'Com a = 0, a equação ou é impossível ou vale para todo x.',
    definicao:
      'Se o coeficiente de x é zero, a incógnita desaparece. Sobra uma afirmação sobre ' +
      'números: ou ela é falsa, e nenhum x serve, ou é verdadeira, e todo x serve.',
    formulas: [
      {
        tex: '0 \\cdot x = k,\\; k \\neq 0 \\;\\Rightarrow\\; S = \\varnothing',
        legenda: 'Impossível.',
      },
      { tex: '0 \\cdot x = 0 \\;\\Rightarrow\\; S = \\mathbb{R}', legenda: 'Identidade.' },
    ],
    demonstracao: [
      {
        descricao: 'Uma equação que simplifica para algo falso não tem solução.',
        tex: '2x + 1 = 2x + 5 \\;\\Rightarrow\\; 1 = 5',
        nota: 'As duas retas são paralelas: nunca se encontram.',
      },
      {
        descricao: 'Já uma que simplifica para algo verdadeiro vale sempre.',
        tex: '2(x + 1) = 2x + 2 \\;\\Rightarrow\\; 0 = 0',
        nota: 'Os dois lados são a MESMA reta, escrita de dois jeitos.',
      },
    ],
    vejaTambem: ['equacao1.raiz'],
  },
  {
    id: 'equacao1.verificacao',
    titulo: 'Verificar a raiz',
    resumo: 'Substituir de volta é parte da resolução, não um extra.',
    definicao:
      'Encontrada a raiz, substituí-la na equação ORIGINAL confirma o resultado e pega ' +
      'qualquer erro de sinal cometido pelo caminho. É a única etapa que não depende de ter ' +
      'acertado as anteriores.',
    formulas: [{ tex: 'a \\cdot x_0 + b \\stackrel{?}{=} c' }],
    demonstracao: [
      {
        descricao: 'Encontramos x = 4 para 2x + 3 = 11.',
        tex: 'x = 4',
      },
      {
        descricao: 'Substituímos na equação original, não numa versão já manipulada.',
        tex: '2 \\cdot 4 + 3 = 8 + 3 = 11 \\;\\checkmark',
        nota: 'Usar uma linha intermediária esconderia um erro cometido antes dela.',
      },
    ],
    vejaTambem: ['equacao1.igualdade', 'equacao1.problemas'],
  },
  {
    id: 'equacao1.fracoes',
    titulo: 'Equações com frações',
    resumo: 'Multiplique tudo pelo mmc dos denominadores, e as frações somem.',
    definicao:
      'Multiplicar os dois lados de uma equação pelo mesmo número não muda a solução. ' +
      'Escolhendo o mmc dos denominadores, cada fração vira um inteiro e a equação volta a ' +
      'ser a de sempre. Dois cuidados: TODOS os termos são multiplicados, inclusive os ' +
      'números soltos; e o menos antes de uma fração vale para o numerador inteiro, que por ' +
      'isso vai entre parênteses.',
    formulas: [
      {
        tex: '\\frac{x + m}{p} = k \\;\\Rightarrow\\; x + m = kp',
        legenda: 'Com um denominador só, multiplica-se por ele.',
      },
      {
        tex: '-\\frac{x - 2}{3} \\;\\to\\; -(x - 2) = -x + 2',
        legenda: 'O sinal troca nos dois termos do numerador.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Partimos de x/2 + x/3 = 10. O mmc de 2 e 3 é 6.',
        tex: '\\text{mmc}(2, 3) = 6',
      },
      {
        descricao: 'Multiplicamos cada termo por 6.',
        tex: '6 \\cdot \\frac{x}{2} + 6 \\cdot \\frac{x}{3} = 6 \\cdot 10 \\;\\Rightarrow\\; 3x + 2x = 60',
        nota: 'Esquecer de multiplicar o 10 é o erro mais comum.',
      },
      {
        descricao: 'Agora é uma equação sem frações.',
        tex: '5x = 60 \\;\\Rightarrow\\; x = 12',
      },
    ],
    exemplo: {
      enunciado: 'Resolvendo (x + 1)/2 − (x − 3)/4 = 2.',
      passos: [
        { descricao: 'O mmc de 2 e 4 é 4.', tex: '\\text{mmc}(2, 4) = 4' },
        {
          descricao: 'Multiplicando tudo por 4, com o segundo numerador entre parênteses.',
          tex: '2(x + 1) - (x - 3) = 8',
        },
        {
          descricao: 'Distribuindo: o menos troca o sinal dos dois termos.',
          tex: '2x + 2 - x + 3 = 8',
        },
        { descricao: 'Isolando x.', tex: 'x + 5 = 8 \\;\\Rightarrow\\; x = 3' },
      ],
    },
    vejaTambem: ['equacao1.igualdade', 'equacao1.verificacao'],
  },
  {
    id: 'equacao1.problemas',
    titulo: 'Do enunciado à equação',
    resumo: 'Escolha o que é x, traduza cada frase, e só então resolva.',
    definicao:
      'Num problema, a equação não vem pronta: é preciso escrevê-la. A receita é sempre a ' +
      'mesma. Primeiro, decidir o que é x — de preferência, o que a pergunta pede. Depois, ' +
      'escrever cada grandeza do texto em função de x. Por fim, achar a frase que diz que ' +
      'duas coisas são iguais: essa é a equação. A unidade acompanha a resposta, e vale ' +
      'conferir se ela responde à pergunta feita — a menor idade, a largura, o maior número.',
    formulas: [
      {
        tex: '\\text{«o triplo de x»} \\to 3x \\qquad \\text{«5 a mais que x»} \\to x + 5',
        legenda: 'Cada expressão do texto tem uma tradução.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Exemplo: um táxi cobra R$ 5 de bandeirada e R$ 3 por km; a corrida deu R$ 41.',
        tex: 'x = \\text{km rodados}',
      },
      {
        descricao: 'O preço é a bandeirada mais 3 por km — e ele é igual a 41.',
        tex: '5 + 3x = 41',
      },
      {
        descricao: 'Resolvendo.',
        tex: '3x = 36 \\;\\Rightarrow\\; x = 12 \\text{ km}',
        nota: 'Conferindo: 5 + 3 · 12 = 41.',
      },
    ],
    exemplo: {
      enunciado:
        'Um retângulo tem comprimento 4 cm maior que a largura e perímetro 28 cm. Qual a largura?',
      passos: [
        {
          descricao: 'Largura x, comprimento x + 4.',
          tex: '\\text{largura} = x \\qquad \\text{comprimento} = x + 4',
        },
        { descricao: 'O perímetro soma os quatro lados.', tex: '2x + 2(x + 4) = 28' },
        { descricao: 'Resolvendo.', tex: '4x + 8 = 28 \\;\\Rightarrow\\; x = 5 \\text{ cm}' },
      ],
    },
    vejaTambem: ['equacao1.igualdade', 'equacao1.verificacao'],
  },
];
