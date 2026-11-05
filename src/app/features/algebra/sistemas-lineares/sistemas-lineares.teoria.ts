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
        nota: 'É a substituição vista de lado: isolar a mesma letra nas duas e igualar.',
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
    titulo: 'O método da substituição',
    resumo: 'Isolar x numa equação e trocá-lo na outra deixa uma incógnita só.',
    definicao:
      'A dificuldade de um sistema é ter duas incógnitas de uma vez. A substituição desfaz ' +
      'isso em dois movimentos: numa das equações, o termo em y passa para o outro lado e o ' +
      'coeficiente de x passa dividindo, deixando x escrito em função de y; essa expressão ' +
      'entra no lugar do x da outra equação, que passa a ter só y. Achado o y, volta-se à ' +
      'expressão de x. É o mesmo que se faz numa equação do 1º grau, duas vezes.',
    formulas: [
      {
        tex: 'a_1x + b_1y = c_1 \\;\\Longrightarrow\\; x = \\frac{c_1 - b_1y}{a_1}',
        legenda: 'O que está somando passa subtraindo; o que multiplica passa dividindo.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Numa das equações, o termo em y vai para o outro lado.',
        tex: 'a_1x + b_1y = c_1 \\;\\Rightarrow\\; a_1x = c_1 - b_1y',
        nota: 'Exemplo: de 5x + 10y = 20 resta 5x = 20 − 10y.',
      },
      {
        descricao: 'O coeficiente de x passa dividindo, e x fica isolado.',
        tex: 'x = \\frac{c_1 - b_1y}{a_1}',
        nota: 'No exemplo: x = (20 − 10y)/5, isto é, x = 4 − 2y.',
      },
      {
        descricao: 'Essa expressão entra no lugar do x da outra equação.',
        tex: 'a_2\\left(\\frac{c_1 - b_1y}{a_1}\\right) + b_2y = c_2',
        nota: 'Agora há uma incógnita só — é este o ganho do método.',
      },
      {
        descricao: 'Multiplicando por a₁ e juntando os termos em y, sobra uma equação do 1º grau.',
        tex: '(a_1b_2 - a_2b_1)\\,y = a_1c_2 - a_2c_1',
        nota: 'O coeficiente que sobrou é o determinante do sistema. Zero ali significa que o y sumiu junto com o x, e aí não há solução única.',
      },
      {
        descricao: 'Com y na mão, volta-se à expressão de x.',
        tex: 'y = \\frac{a_1c_2 - a_2c_1}{a_1b_2 - a_2b_1} \\qquad x = \\frac{c_1 - b_1y}{a_1}',
      },
    ],
    exemplo: {
      enunciado: 'Um sistema resolvido por substituição.',
      passos: resolverSistemaComPassos({ a1: 5, b1: 10, c1: 20, a2: 1, b2: -1, c2: -2 }).passos,
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
