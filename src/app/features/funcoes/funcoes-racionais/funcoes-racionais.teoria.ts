import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_RACIONAIS: readonly Teoria[] = [
  {
    id: 'racionais.dominio',
    titulo: 'Onde a função não existe',
    resumo: 'O domínio exclui os zeros do denominador.',
    definicao:
      'Uma função racional é um polinômio dividido por outro, e ela existe em todo ponto em ' +
      'que o denominador não zera. Achar o domínio é, portanto, resolver uma equação ' +
      'polinomial — e cada raiz encontrada é um ponto que o gráfico não alcança, seja por uma ' +
      'assíntota, seja por um buraco.',
    formulas: [
      { tex: 'f(x) = \\frac{p(x)}{q(x)}' },
      { tex: '\\text{dom}(f) = \\{x \\in \\mathbb{R} : q(x) \\neq 0\\}' },
    ],
    demonstracao: [
      {
        descricao: 'Procuramos onde o denominador zera.',
        tex: 'x^{2} - 4 = 0 \\;\\Longrightarrow\\; x = \\pm 2',
      },
      {
        descricao: 'Esses dois pontos saem do domínio.',
        tex: '\\text{dom}(f) = \\mathbb{R} \\setminus \\{-2,\\; 2\\}',
      },
      {
        descricao: 'O que acontece em cada um deles depende do numerador.',
        tex: 'f(x) = \\frac{x - 2}{x^{2} - 4} = \\frac{1}{x + 2}, \\quad x \\neq 2',
        nota: 'Aqui um dos pontos vira buraco e o outro, assíntota.',
      },
    ],
    vejaTambem: ['racionais.assintota-vertical', 'racionais.buraco'],
  },
  {
    id: 'racionais.assintota-vertical',
    titulo: 'Assíntota vertical',
    resumo: 'O denominador zera, o numerador não — e a função dispara.',
    definicao:
      'Quando o denominador zera num ponto em que o numerador não zera, a função cresce sem ' +
      'limite em módulo ao se aproximar dali. O gráfico encosta numa reta vertical sem nunca ' +
      'tocá-la, e os sinais dos dois lados costumam ser opostos — vale conferir cada lado ' +
      'separadamente.',
    formulas: [
      { tex: 'q(a) = 0 \\;\\text{e}\\; p(a) \\neq 0 \\;\\Longrightarrow\\; x = a \\;\\text{é assíntota}' },
      { tex: '\\lim_{x \\to a} \\left|f(x)\\right| = \\infty' },
    ],
    demonstracao: [
      {
        descricao: 'Perto de 2, o denominador fica minúsculo e o numerador não.',
        tex: 'f(x) = \\frac{1}{x - 2}',
      },
      {
        descricao: 'Chegando pela direita, o denominador é positivo e pequeno.',
        tex: '\\lim_{x \\to 2^{+}} \\frac{1}{x - 2} = +\\infty',
      },
      {
        descricao: 'Pela esquerda, ele é negativo e pequeno.',
        tex: '\\lim_{x \\to 2^{-}} \\frac{1}{x - 2} = -\\infty',
        nota: 'Os dois lados disparam em sentidos opostos — é o comportamento típico.',
      },
    ],
    vejaTambem: ['racionais.buraco', 'racionais.dominio', 'racionais.comportamento-no-infinito'],
  },
  {
    id: 'racionais.buraco',
    titulo: 'O buraco que não é assíntota',
    resumo: 'Quando numerador e denominador zeram juntos, o fator se cancela.',
    definicao:
      'Se o mesmo fator aparece em cima e embaixo, ele se cancela e a função coincide com uma ' +
      'mais simples em toda parte, menos naquele ponto. O resultado é um buraco: o limite ' +
      'existe e é finito, mas o ponto não pertence ao domínio. É a diferença entre o gráfico ' +
      'explodir e apenas faltar um ponto nele.',
    formulas: [
      { tex: 'p(a) = q(a) = 0 \\;\\Longrightarrow\\; \\text{buraco em } x = a' },
      { tex: '\\frac{(x - a)r(x)}{(x - a)s(x)} = \\frac{r(x)}{s(x)}, \\quad x \\neq a' },
    ],
    demonstracao: [
      {
        descricao: 'Os dois lados compartilham um fator.',
        tex: 'f(x) = \\frac{(x - 3)(x + 1)}{(x - 3)(x - 5)}',
      },
      {
        descricao: 'Fora de x igual a 3, ele se cancela.',
        tex: 'f(x) = \\frac{x + 1}{x - 5}, \\quad x \\neq 3',
      },
      {
        descricao: 'O limite ali existe, e é o valor da função simplificada.',
        tex: '\\lim_{x \\to 3} f(x) = \\frac{4}{-2} = -2',
        nota: 'O gráfico passa por ali com um furo: tudo normal em volta, menos o ponto.',
      },
      {
        descricao: 'Em 5, porém, só o denominador zera.',
        tex: 'x = 5 \\;\\text{é assíntota vertical}',
      },
    ],
    vejaTambem: ['racionais.assintota-vertical', 'racionais.dominio'],
  },
  {
    id: 'racionais.comportamento-no-infinito',
    titulo: 'O que acontece longe da origem',
    resumo: 'A comparação dos graus decide tudo.',
    definicao:
      'Longe da origem, só o termo de maior grau de cada lado importa. Se o numerador tem grau ' +
      'menor, a função tende a zero. Se os graus são iguais, ela tende à razão dos coeficientes ' +
      'líderes. Se o numerador tem um grau a mais, a função segue uma reta inclinada. É a ' +
      'leitura do regime permanente de um sistema.',
    formulas: [
      { tex: '\\deg p < \\deg q \\;\\Longrightarrow\\; y = 0' },
      { tex: '\\deg p = \\deg q \\;\\Longrightarrow\\; y = \\frac{a_{n}}{b_{n}}' },
      { tex: '\\deg p = \\deg q + 1 \\;\\Longrightarrow\\; \\text{assíntota oblíqua}' },
    ],
    demonstracao: [
      {
        descricao: 'Dividindo tudo pela maior potência presente.',
        tex: '\\frac{3x^{2} + 1}{2x^{2} - x} = \\frac{3 + 1/x^{2}}{2 - 1/x}',
      },
      {
        descricao: 'As frações com x no denominador somem no infinito.',
        tex: '\\lim_{x \\to \\infty} \\frac{3 + 0}{2 - 0} = \\frac{3}{2}',
      },
      {
        descricao: 'Com numerador de grau menor, o de cima some antes.',
        tex: '\\frac{x + 1}{x^{2}} \\to 0',
      },
      {
        descricao: 'E com grau maior, a função cresce sem limite.',
        tex: '\\frac{x^{3}}{x} = x^{2} \\to \\infty',
        nota: 'Aí não há assíntota horizontal nenhuma a procurar.',
      },
    ],
    vejaTambem: ['racionais.assintota-obliqua', 'racionais.assintota-vertical'],
  },
  {
    id: 'racionais.assintota-obliqua',
    titulo: 'Assíntota oblíqua',
    resumo: 'Um grau a mais em cima produz uma reta inclinada.',
    definicao:
      'Quando o numerador tem exatamente um grau a mais que o denominador, a função se ' +
      'aproxima de uma reta inclinada. Essa reta é o quociente da divisão de polinômios — o ' +
      'resto, dividido pelo denominador, tende a zero e some. É a mesma ideia da divisão com ' +
      'resto, aplicada ao infinito.',
    formulas: [
      { tex: '\\frac{p(x)}{q(x)} = Q(x) + \\frac{R(x)}{q(x)}' },
      { tex: 'y = Q(x) \\;\\text{é a assíntota, pois} \\; \\frac{R(x)}{q(x)} \\to 0' },
    ],
    demonstracao: [
      {
        descricao: 'Dividimos o numerador pelo denominador.',
        tex: '\\frac{x^{2} + 1}{x - 1} = x + 1 + \\frac{2}{x - 1}',
      },
      {
        descricao: 'O resto dividido pelo denominador tende a zero.',
        tex: '\\lim_{x \\to \\infty} \\frac{2}{x - 1} = 0',
      },
      {
        descricao: 'Sobra a reta, que é o quociente.',
        tex: 'y = x + 1',
        nota: 'O gráfico se cola nessa reta longe da origem, por cima ou por baixo.',
      },
    ],
    vejaTambem: ['racionais.comportamento-no-infinito', 'racionais.assintota-vertical'],
  },
];
