import { resolverSistemaComPassos } from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_SISTEMAS: readonly Teoria[] = [
  {
    id: 'sistemas.intersecao',
    titulo: 'Um sistema é um cruzamento de retas',
    resumo: 'Resolver é achar o ponto que satisfaz as duas equações ao mesmo tempo.',
    definicao:
      'Cada equação do tipo ax + by = c descreve uma reta no plano. O par (x, y) que resolve o ' +
      'sistema é o ponto que pertence às DUAS retas — ou seja, o ponto onde elas se cruzam. ' +
      'Essa leitura explica de imediato por que às vezes não há solução, e às vezes há infinitas.',
    formulas: [
      {
        tex: '\\begin{cases} a_1x + b_1y = c_1 \\\\ a_2x + b_2y = c_2 \\end{cases}',
      },
    ],
    demonstracao: [
      {
        descricao: 'Isolando y, cada equação vira a função de uma reta.',
        tex: 'y = \\frac{c_1 - a_1x}{b_1} \\qquad y = \\frac{c_2 - a_2x}{b_2}',
      },
      {
        descricao: 'Resolver o sistema é igualar as duas e achar o x comum.',
        tex: '\\frac{c_1 - a_1x}{b_1} = \\frac{c_2 - a_2x}{b_2}',
        nota: 'Esse é o método da substituição, visto geometricamente.',
      },
      {
        descricao: 'Duas retas no plano só podem se cruzar em um ponto, em nenhum ou em todos.',
        tex: '1 \\quad\\text{ou}\\quad 0 \\quad\\text{ou}\\quad \\infty',
      },
    ],
    exemplo: {
      enunciado: 'Resolvendo x + y = 5 e x − y = 1.',
      passos: resolverSistemaComPassos({ a1: 1, b1: 1, c1: 5, a2: 1, b2: -1, c2: 1 }).passos,
    },
    vejaTambem: ['sistemas.metodos', 'sistemas.classificacao'],
  },
  {
    id: 'sistemas.metodos',
    titulo: 'Substituição e adição',
    resumo: 'Dois caminhos para a mesma ideia: eliminar uma das incógnitas.',
    definicao:
      'Ambos os métodos buscam reduzir o sistema a uma única equação com uma única incógnita. ' +
      'Na substituição, isola-se uma variável e troca-se na outra equação. Na adição, somam-se ' +
      'múltiplos das equações para que uma variável desapareça.',
    formulas: [
      {
        tex: 'b_2 \\cdot E_1 - b_1 \\cdot E_2 \\;\\Rightarrow\\; (a_1b_2 - a_2b_1)x = c_1b_2 - c_2b_1',
        legenda: 'O método da adição, escrito no caso geral.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Multiplicamos cada equação de modo que os coeficientes de y fiquem iguais.',
        tex: 'b_2(a_1x + b_1y) = b_2c_1 \\qquad b_1(a_2x + b_2y) = b_1c_2',
      },
      {
        descricao: 'Nos dois casos o termo em y virou b₁b₂y — subtraindo, ele some.',
        tex: '(a_1b_2 - a_2b_1)x = c_1b_2 - c_2b_1',
        nota: 'O coeficiente que sobrou é o determinante do sistema.',
      },
      {
        descricao: 'Resta uma equação do 1º grau, que já sabemos resolver.',
        tex: 'x = \\frac{c_1b_2 - c_2b_1}{a_1b_2 - a_2b_1}',
      },
    ],
    exemplo: {
      enunciado: 'Um sistema resolvido por adição.',
      passos: resolverSistemaComPassos({ a1: 2, b1: 3, c1: 12, a2: 1, b2: -1, c2: 1 }).passos,
    },
    vejaTambem: ['sistemas.classificacao', 'sistemas.intersecao'],
  },
  {
    id: 'sistemas.classificacao',
    titulo: 'Os três tipos de sistema',
    resumo: 'O determinante responde antes de resolver.',
    definicao:
      'Se o determinante dos coeficientes é diferente de zero, as retas têm inclinações ' +
      'diferentes e se cruzam uma única vez. Se é zero, elas são paralelas: ou nunca se tocam ' +
      '(impossível) ou são a mesma reta (indeterminado).',
    formulas: [
      { tex: 'D = a_1b_2 - a_2b_1' },
      {
        tex: 'D \\neq 0 \\to \\text{determinado} \\qquad D = 0 \\to \\text{impossível ou indeterminado}',
      },
    ],
    demonstracao: [
      {
        descricao: 'O determinante zero significa coeficientes proporcionais.',
        tex: 'a_1b_2 = a_2b_1 \\;\\Longleftrightarrow\\; \\frac{a_1}{a_2} = \\frac{b_1}{b_2}',
        nota: 'Proporção entre os coeficientes é o mesmo que igualdade de inclinações.',
      },
      {
        descricao: 'Se os termos independentes seguem a mesma proporção, é a mesma reta.',
        tex: '\\frac{a_1}{a_2} = \\frac{b_1}{b_2} = \\frac{c_1}{c_2} \\;\\Rightarrow\\; \\text{infinitas soluções}',
      },
      {
        descricao: 'Se não seguem, as retas são paralelas distintas.',
        tex: '\\frac{a_1}{a_2} = \\frac{b_1}{b_2} \\neq \\frac{c_1}{c_2} \\;\\Rightarrow\\; \\text{nenhuma solução}',
      },
    ],
    exemplo: {
      enunciado: 'Um sistema impossível: x + y = 2 e 2x + 2y = 7.',
      passos: resolverSistemaComPassos({ a1: 1, b1: 1, c1: 2, a2: 2, b2: 2, c2: 7 }).passos,
    },
    vejaTambem: ['sistemas.intersecao', 'sistemas.metodos'],
  },
];
