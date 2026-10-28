import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_VIZINHANCAS: readonly Teoria[] = [
  {
    id: 'vizinhancas.epsilon-delta',
    titulo: 'Épsilon e delta',
    resumo: 'A definição formal do limite, como um desafio e uma resposta.',
    definicao:
      'Dizer que o limite é L significa: para qualquer margem de erro ε que alguém exija em ' +
      'torno de L, consigo encontrar uma vizinhança δ em torno de a dentro da qual a função ' +
      'respeita essa margem. É um jogo — o desafiante escolhe ε, eu respondo com δ.',
    formulas: [
      {
        tex: '\\forall \\varepsilon > 0,\; \\exists \\delta > 0 : 0 < |x - a| < \\delta \\Rightarrow |f(x) - L| < \\varepsilon',
      },
    ],
    demonstracao: [
      {
        descricao: 'O ε delimita uma faixa horizontal em torno do valor-limite.',
        tex: 'L - \\varepsilon < f(x) < L + \\varepsilon',
      },
      {
        descricao: 'O δ delimita uma faixa vertical em torno do ponto.',
        tex: 'a - \\delta < x < a + \\delta',
      },
      {
        descricao: 'O limite existe se, por menor que seja ε, há um δ que mantém a curva na faixa.',
        tex: '\\varepsilon \\to 0 \;\\Rightarrow\; \\delta \\to 0',
        nota: 'Quanto mais apertada a exigência, mais estreita a vizinhança — mas sempre existe uma.',
      },
      {
        descricao: 'O "0 < |x − a|" exclui o próprio ponto da verificação.',
        tex: '0 < |x - a|',
        nota: 'É por isso que o limite pode existir mesmo onde a função não está definida.',
      },
    ],
    vejaTambem: ['vizinhancas.infinito', 'limite.intuicao'],
  },
  {
    id: 'vizinhancas.infinito',
    titulo: 'Comportamento no infinito',
    resumo: 'O que acontece quando x cresce sem parar.',
    definicao:
      'Limites no infinito descrevem a tendência de longo prazo da função. Numa razão de ' +
      'polinômios, quem decide é a comparação entre os graus: o termo de maior grau domina ' +
      'todos os outros quando x fica grande.',
    formulas: [
      { tex: '\\lim_{x \\to \\infty} \\frac{1}{x} = 0' },
      {
        tex: '\\lim_{x \\to \\infty} \\frac{a_nx^{n} + \\cdots}{b_mx^{m} + \\cdots} = \\begin{cases} 0 & n < m \\\\ \\frac{a_n}{b_m} & n = m \\\\ \\pm\\infty & n > m \\end{cases}',
      },
    ],
    demonstracao: [
      {
        descricao: 'Dividindo numerador e denominador pela maior potência presente.',
        tex: '\\frac{2x + 1}{x + 3} = \\frac{2 + \\frac{1}{x}}{1 + \\frac{3}{x}}',
      },
      {
        descricao: 'Todos os termos com 1/x tendem a zero.',
        tex: '\\frac{1}{x} \\to 0 \\quad \\text{quando} \\quad x \\to \\infty',
      },
      {
        descricao: 'Sobram apenas os coeficientes dos termos de maior grau.',
        tex: '\\to \\frac{2}{1} = 2',
        nota: 'Essa é a assíntota horizontal: a reta que a curva persegue no infinito.',
      },
    ],
    vejaTambem: ['vizinhancas.epsilon-delta', 'vizinhancas.assintotas'],
  },
  {
    id: 'vizinhancas.assintotas',
    titulo: 'Assíntotas',
    resumo: 'Retas que a curva persegue sem nunca alcançar.',
    definicao:
      'Uma assíntota horizontal aparece quando a função tende a um valor fixo no infinito. ' +
      'Uma vertical aparece onde a função explode — tipicamente onde um denominador zera sem ' +
      'que o numerador também zere.',
    formulas: [
      { tex: '\\lim_{x \\to \\pm\\infty} f(x) = L \;\\Rightarrow\; y = L \;\\text{é assíntota horizontal}' },
      { tex: '\\lim_{x \\to a} f(x) = \\pm\\infty \;\\Rightarrow\; x = a \;\\text{é assíntota vertical}' },
    ],
    demonstracao: [
      {
        descricao: 'Em 1/x, o denominador zera na origem.',
        tex: '\\lim_{x \\to 0^{+}} \\frac{1}{x} = +\\infty \\qquad \\lim_{x \\to 0^{-}} \\frac{1}{x} = -\\infty',
      },
      {
        descricao: 'A curva se afasta indefinidamente da reta x = 0, sem tocá-la.',
        tex: 'x = 0 \;\\text{é assíntota vertical}',
      },
      {
        descricao: 'Longe da origem, a mesma função se aproxima do eixo horizontal.',
        tex: '\\lim_{x \\to \\pm\\infty} \\frac{1}{x} = 0 \;\\Rightarrow\; y = 0 \;\\text{é assíntota horizontal}',
      },
      {
        descricao: 'Se numerador e denominador zeram juntos, não há assíntota: há um buraco.',
        tex: '\\frac{x^{2}-1}{x-1} \;\\text{tem buraco em } x = 1, \\text{não assíntota}',
      },
    ],
    vejaTambem: ['vizinhancas.infinito', 'limite.lateral'],
  },
];
