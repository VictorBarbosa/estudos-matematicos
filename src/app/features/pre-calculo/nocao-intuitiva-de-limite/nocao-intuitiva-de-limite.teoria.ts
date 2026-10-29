import { limiteComPassos } from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_LIMITE_INTUITIVO: readonly Teoria[] = [
  {
    id: 'limite.intuicao',
    titulo: 'Para onde a função tende',
    resumo: 'O limite pergunta o destino, não o valor no ponto.',
    definicao:
      'O limite de f quando x tende a um ponto é o valor do qual f se aproxima — ' +
      'independentemente do que aconteça EXATAMENTE nesse ponto. A função pode nem estar ' +
      'definida ali, e o limite existir mesmo assim.',
    formulas: [
      { tex: '\\lim_{x \\to a} f(x) = L' },
      { tex: '\\lim_{x \\to a} f(x) \\;\\text{independe de}\\; f(a)' },
    ],
    demonstracao: [
      {
        descricao: 'Tomamos valores de x cada vez mais próximos de a.',
        tex: 'x = a \\pm 0{,}1,\\; a \\pm 0{,}01,\\; a \\pm 0{,}001,\\; \\ldots',
      },
      {
        descricao: 'Observamos para onde f(x) caminha.',
        tex: 'f(x) \\to L',
      },
      {
        descricao: 'O ponto a em si é deliberadamente excluído da investigação.',
        tex: '0 < |x - a| < \\delta',
        nota: 'O "0 <" é o que afasta o próprio ponto: só a vizinhança importa.',
      },
    ],
    exemplo: {
      enunciado: 'Em (x²−1)/(x−1), a função não existe em x = 1, mas o limite é 2.',
      passos: limiteComPassos((x) => (x * x - 1) / (x - 1), 1, '\\frac{x^{2}-1}{x-1}').passos,
    },
    vejaTambem: ['limite.indeterminacao', 'limite.lateral'],
  },
  {
    id: 'limite.indeterminacao',
    titulo: 'A indeterminação 0/0',
    resumo: 'Não é "zero"; é um aviso de que falta simplificar.',
    definicao:
      'Quando substituir o ponto produz 0/0, isso não significa que o limite seja zero nem ' +
      'que não exista. Significa apenas que a substituição direta não resolve — é preciso ' +
      'manipular a expressão primeiro.',
    formulas: [
      { tex: '\\frac{0}{0} \\;\\text{é uma indeterminação, não um valor}' },
      { tex: '\\frac{x^{2}-1}{x-1} = \\frac{(x+1)(x-1)}{x-1} = x+1 \\quad (x \\neq 1)' },
    ],
    demonstracao: [
      {
        descricao: 'Substituir direto não leva a lugar nenhum.',
        tex: '\\frac{1^{2}-1}{1-1} = \\frac{0}{0}',
      },
      {
        descricao: 'Fatorando o numerador, aparece o fator que causa o problema.',
        tex: '\\frac{(x+1)(x-1)}{x-1}',
      },
      {
        descricao: 'Para x diferente de 1, podemos cancelar — e é só disso que o limite trata.',
        tex: '= x + 1',
        nota: 'O cancelamento é legítimo porque o limite nunca avalia o ponto exato.',
      },
      {
        descricao: 'Agora a substituição funciona.',
        tex: '\\lim_{x \\to 1} (x+1) = 2',
      },
    ],
    exemplo: {
      enunciado: 'O mesmo limite, visto numericamente.',
      passos: limiteComPassos((x) => (x * x - 4) / (x - 2), 2, '\\frac{x^{2}-4}{x-2}').passos,
    },
    vejaTambem: ['limite.intuicao', 'limite.lateral'],
  },
  {
    id: 'limite.lateral',
    titulo: 'Limites laterais',
    resumo: 'Os dois lados precisam concordar.',
    definicao:
      'Aproximar-se por valores menores que o ponto dá o limite pela esquerda; por valores ' +
      'maiores, pela direita. O limite só existe quando os dois coincidem — se a função ' +
      'salta, cada lado tende a um valor diferente e o limite não existe.',
    formulas: [
      { tex: '\\lim_{x \\to a} f(x) = L \\iff \\lim_{x \\to a^{-}} f(x) = \\lim_{x \\to a^{+}} f(x) = L' },
    ],
    demonstracao: [
      {
        descricao: 'Numa função com salto, cada lado tende a um patamar.',
        tex: '\\lim_{x \\to 0^{-}} f(x) = -1 \\qquad \\lim_{x \\to 0^{+}} f(x) = 1',
      },
      {
        descricao: 'Como os valores discordam, não há um único destino.',
        tex: '\\lim_{x \\to 0} f(x) \\;\\text{não existe}',
        nota: 'Não é que seja infinito: é que simplesmente não há um valor único.',
      },
    ],
    exemplo: {
      enunciado: 'Uma função com salto em zero.',
      passos: limiteComPassos((x) => (x < 0 ? -1 : 1), 0, 'f(x)').passos,
    },
    vejaTambem: ['limite.intuicao', 'limite.indeterminacao'],
  },
];
