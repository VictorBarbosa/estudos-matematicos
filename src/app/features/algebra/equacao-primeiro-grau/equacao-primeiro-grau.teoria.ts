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
      { tex: 'a = b \\;\\Longrightarrow\\; a + k = b + k', legenda: 'Somar o mesmo nos dois lados.' },
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
    vejaTambem: ['equacao1.igualdade'],
  },
];
