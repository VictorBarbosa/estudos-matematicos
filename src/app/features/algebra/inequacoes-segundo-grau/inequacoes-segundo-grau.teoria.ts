import {
  resolverInequacaoProdutoComPassos,
  resolverInequacaoQuadraticaComPassos,
  resolverInequacaoQuocienteComPassos,
} from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_INEQUACOES_SEGUNDO_GRAU: readonly Teoria[] = [
  {
    id: 'sinal.produto',
    titulo: 'Estudo de sinal de um produto',
    resumo: 'Marque onde cada fator zera; entre essas marcas, o sinal não muda.',
    definicao:
      'Uma expressão contínua só troca de sinal passando por zero. Então, para saber onde ' +
      'ela é positiva ou negativa, basta achar seus zeros, marcá-los na reta e descobrir o ' +
      'sinal em cada pedaço. Num produto de fatores do 1º grau, cada fator zera num ponto e ' +
      'troca de sinal ali; o sinal do produto sai da regra dos sinais. Este é o quadro de ' +
      'sinais — a mesma ferramenta que decide, mais adiante, onde uma função cresce pelo ' +
      'sinal da derivada.',
    formulas: [
      {
        tex: 'ax + b \\text{ tem o sinal de } a \\text{ à DIREITA da raiz } x = -\\tfrac{b}{a}',
        legenda: 'E o sinal contrário à esquerda.',
      },
      {
        tex: '(+)(+) = + \\quad (+)(-) = - \\quad (-)(-) = +',
        legenda: 'A regra dos sinais, pedaço por pedaço.',
      },
    ],
    demonstracao: [
      {
        descricao: 'O fator x − 2 é negativo antes de 2 e positivo depois.',
        tex: 'x = 0 \\to 0 - 2 = -2 < 0 \\qquad x = 5 \\to 5 - 2 = 3 > 0',
      },
      {
        descricao: 'Um fator com coeficiente negativo, como 3 − x, faz o contrário.',
        tex: 'x = 0 \\to 3 > 0 \\qquad x = 5 \\to -2 < 0',
        nota: 'É o detalhe que mais derruba: olhe o sinal do coeficiente de x, não o do número solto.',
      },
    ],
    exemplo: {
      enunciado: '(x + 1)(x − 4) < 0',
      passos: resolverInequacaoProdutoComPassos(1, 1, 1, -4, '<').passos,
    },
    vejaTambem: ['sinal.trinomio', 'sinal.quociente', 'inequacoes.conjunto'],
  },
  {
    id: 'sinal.trinomio',
    titulo: 'O sinal do trinômio',
    resumo: 'Fora das raízes, o sinal de a; entre elas, o contrário.',
    definicao:
      'Com duas raízes reais x₁ < x₂, o trinômio ax² + bx + c fatora em a(x − x₁)(x − x₂). ' +
      'Fora das raízes, os dois parênteses têm o mesmo sinal e o produto deles é positivo: ' +
      'sobra o sinal de a. Entre as raízes, os parênteses têm sinais opostos: o sinal é o ' +
      'contrário do de a. No gráfico, é a parábola acima ou abaixo do eixo x.',
    formulas: [
      {
        tex: 'ax^{2} + bx + c = a(x - x_1)(x - x_2)',
        legenda: 'A forma fatorada mostra o sinal de uma vez.',
      },
      {
        tex: '\\begin{array}{c|ccccc} x & & x_1 & & x_2 & \\\\ \\hline \\text{sinal} & \\text{de } a & 0 & \\text{contrário} & 0 & \\text{de } a \\end{array}',
        legenda: '«Fora, sinal de a; entre, contrário.»',
      },
    ],
    demonstracao: [
      {
        descricao: 'Fatoramos pelo valor das raízes.',
        tex: 'ax^{2} + bx + c = a(x - x_1)(x - x_2)',
      },
      {
        descricao: 'Para x > x₂, os dois parênteses são positivos; para x < x₁, os dois negativos.',
        tex: '(x - x_1)(x - x_2) > 0 \\;\\Rightarrow\\; \\text{sinal} = \\text{sinal de } a',
      },
      {
        descricao: 'Entre as raízes, um parêntese é positivo e o outro negativo.',
        tex: '(x - x_1)(x - x_2) < 0 \\;\\Rightarrow\\; \\text{sinal} = -\\text{sinal de } a',
      },
    ],
    exemplo: {
      enunciado: '−x² + x + 6 ≥ 0',
      passos: resolverInequacaoQuadraticaComPassos(-1, 1, 6, '>=').passos,
    },
    vejaTambem: ['sinal.produto', 'sinal.delta', 'equacao2.vertice'],
  },
  {
    id: 'sinal.delta',
    titulo: 'Quando Δ ≤ 0',
    resumo: 'Sem raízes, o trinômio tem sempre o sinal de a — a resposta é tudo ou nada.',
    definicao:
      'Se Δ < 0, a parábola não toca o eixo x: fica inteira acima (a > 0) ou inteira abaixo ' +
      '(a < 0), e o trinômio tem o mesmo sinal para todo x. A inequação então vale para todos ' +
      'os reais ou para nenhum. Se Δ = 0, a parábola encosta no eixo num ponto só, a raiz ' +
      'dupla: ali o trinômio vale 0, e em todo o resto tem o sinal de a. Daí saem respostas ' +
      'como «x ≠ 3» ou «x = 3».',
    formulas: [
      {
        tex: '\\Delta < 0,\\; a > 0 \\;\\Rightarrow\\; ax^{2} + bx + c > 0 \\text{ para todo } x',
      },
      {
        tex: '\\Delta = 0 \\;\\Rightarrow\\; ax^{2} + bx + c = a(x - x_0)^{2}',
        legenda: 'O quadrado nunca é negativo: o sinal é o de a, exceto em x₀.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Completando o quadrado, o trinômio vira a vezes uma soma.',
        tex: 'ax^{2} + bx + c = a\\left[\\left(x + \\frac{b}{2a}\\right)^{2} - \\frac{\\Delta}{4a^{2}}\\right]',
      },
      {
        descricao: 'Com Δ < 0, o colchete é um quadrado mais um número positivo: sempre positivo.',
        tex: '\\left(x + \\frac{b}{2a}\\right)^{2} + \\frac{|\\Delta|}{4a^{2}} > 0',
        nota: 'Por isso o sinal do trinômio é, em toda a reta, o sinal de a.',
      },
    ],
    exemplo: {
      enunciado: 'x² − 6x + 9 > 0',
      passos: resolverInequacaoQuadraticaComPassos(1, -6, 9, '>').passos,
    },
    vejaTambem: ['sinal.trinomio', 'equacao2.discriminante'],
  },
  {
    id: 'sinal.quociente',
    titulo: 'Inequação-quociente',
    resumo: 'Mesmo quadro do produto — mas o zero do denominador nunca entra.',
    definicao:
      'Uma fração tem o mesmo sinal do produto numerador × denominador, então o quadro de ' +
      'sinais é o mesmo. Há duas diferenças. Primeira: não se pode multiplicar cruzado, porque ' +
      'o sinal do denominador é desconhecido e o sentido da desigualdade poderia inverter. ' +
      'Segunda: onde o denominador zera, a fração não existe — essa fronteira fica de fora ' +
      'mesmo com ≤ ou ≥. Só o zero do numerador pode entrar.',
    formulas: [
      {
        tex: '\\frac{N}{D} \\geq 0 \\iff N \\cdot D \\geq 0 \\text{ e } D \\neq 0',
        legenda: 'A condição D ≠ 0 é a que se esquece.',
      },
    ],
    demonstracao: [
      {
        descricao:
          'Fração e produto têm o mesmo sinal, porque dividir por D e multiplicar por D obedecem à mesma regra.',
        tex: '\\frac{N}{D} = \\frac{N \\cdot D}{D^{2}} \\quad (D^{2} > 0)',
      },
      {
        descricao: 'Mas em D = 0 a fração não está definida, e ali não há o que comparar.',
        tex: 'D = 0 \\;\\Rightarrow\\; \\frac{N}{D} \\;\\nexists',
        nota: 'No quadro, marca-se ∄ nessa coluna, e a bolinha fica sempre aberta.',
      },
    ],
    exemplo: {
      enunciado: '(x − 2)/(x + 3) ≤ 0',
      passos: resolverInequacaoQuocienteComPassos(1, -2, 1, 3, '<=').passos,
    },
    vejaTambem: ['sinal.produto', 'inequacoes.representacao'],
  },
  {
    id: 'sinal.modelagem',
    titulo: 'Entre ou fora: o que a situação está perguntando',
    resumo: 'O quadro de sinais responde «onde» — a situação diz «o quê» é bom ali.',
    definicao:
      'Uma inequação do 2º grau tem sempre a mesma forma de resposta: um pedaço da reta ' +
      'determinado pelas raízes. O que muda de um problema para outro é o SIGNIFICADO desse ' +
      'pedaço. Lucro positivo costuma ficar ENTRE dois preços — abaixo deles não cobre o custo, ' +
      'acima deles a demanda some. Custo abaixo de um limite também fica entre duas quantidades. ' +
      'Já «nunca abaixo de zero», com discriminante negativo, não tem pedaço nenhum: a resposta ' +
      'é todos os reais ou o vazio, e as duas são respostas legítimas.',
    formulas: [
      {
        tex: 'a(x - r_1)(x - r_2) \\;\\text{tem o sinal de } a \\text{ FORA e o oposto ENTRE}',
        legenda: 'A regra que o quadro de sinais mostra.',
      },
      {
        tex: '\\Delta < 0 \\;\\Rightarrow\\; \\text{sempre o sinal de } a',
        legenda: 'Sem raízes, não há troca de sinal: a resposta é «todos» ou «vazio».',
      },
    ],
    demonstracao: [
      {
        descricao:
          'O lucro de uma peça é (p − 10)(50 − p): ele é zero nos dois preços em que a conta ' +
          'empata, e positivo entre eles.',
        tex: '(p - 10)(50 - p) > 0 \\;\\Longleftrightarrow\\; 10 < p < 50',
      },
      {
        descricao:
          'Um custo nunca fica negativo: se Δ < 0 e a > 0, o trinômio é positivo em toda a reta ' +
          'e «custo < 0» não tem solução.',
        tex: 'x^{2} + 2 > 0 \\;\\Rightarrow\\; S = \\mathbb{R}',
        nota: '«Vazio» e «todos» são respostas — não sinais de que a conta deu errado.',
      },
      {
        descricao:
          'Na fração, o zero do denominador nunca entra: ali a expressão não existe, e nenhuma ' +
          'relação com «ou igual» muda isso.',
        tex: '\\frac{x+1}{x-3} \\geq 0 \\;\\Rightarrow\\; x \\leq -1 \\;\\text{ou}\\; x > 3',
      },
    ],
    exemplo: {
      enunciado:
        'Com 60 m de cerca em três lados, a área menos 400 m² é −2x² + 60x − 400. Para que ' +
        'larguras a área passa de 400 m²?',
      passos: resolverInequacaoQuadraticaComPassos(-2, 60, -400, '>').passos,
    },
    vejaTambem: ['sinal.trinomio', 'sinal.delta', 'sinal.quociente'],
  },
];
