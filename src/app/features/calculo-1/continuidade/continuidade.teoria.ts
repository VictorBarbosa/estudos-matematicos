import { limiteComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_CONTINUIDADE: readonly Teoria[] = [
  {
    id: 'continuidade.definicao',
    titulo: 'As três condições',
    resumo: 'Existir, ter limite, e os dois coincidirem.',
    definicao:
      'Uma função é contínua num ponto quando três coisas acontecem ao mesmo tempo: ela está ' +
      'definida ali, o limite existe, e os dois valores são iguais. Falhar em qualquer uma ' +
      'quebra a continuidade — e cada falha produz um tipo diferente de descontinuidade.',
    formulas: [
      { tex: 'f \\text{ contínua em } a \\iff \\lim_{x \\to a} f(x) = f(a)' },
      { tex: '1)\\; \\exists f(a) \\qquad 2)\\; \\exists \\lim_{x \\to a} f(x) \\qquad 3)\\; \\text{são iguais}' },
    ],
    demonstracao: [
      {
        descricao: 'Se a função não está definida no ponto, há um buraco.',
        tex: '\\frac{x^{2}-1}{x-1} \\;\\text{em}\\; x = 1',
      },
      {
        descricao: 'Se os laterais discordam, há um salto.',
        tex: '\\frac{|x|}{x} \\;\\text{em}\\; x = 0',
      },
      {
        descricao: 'Se existem mas não coincidem, o ponto está "fora do lugar".',
        tex: 'f(a) \\neq \\lim_{x \\to a} f(x)',
        nota: 'Graficamente: a curva passa por um lugar, e o ponto isolado está em outro.',
      },
      {
        descricao: 'Intuitivamente, contínua é a função que se desenha sem tirar o lápis.',
        tex: '\\text{sem buracos, saltos ou explosões}',
      },
    ],
    exemplo: {
      enunciado: 'Uma função contínua, em que limite e valor coincidem.',
      passos: limiteComPassos((x) => x * x + 1, 2, 'x^{2}+1').passos,
    },
    vejaTambem: ['continuidade.tipos', 'continuidade.tvi'],
  },
  {
    id: 'continuidade.tipos',
    titulo: 'Tipos de descontinuidade',
    resumo: 'Removível, de salto ou infinita.',
    definicao:
      'A descontinuidade removível é a mais branda: o limite existe e bastaria redefinir o ' +
      'ponto para consertar. A de salto não tem conserto: os laterais discordam. A infinita ' +
      'ocorre junto de uma assíntota vertical.',
    formulas: [
      { tex: '\\text{removível: } \\exists \\lim, \\;\\text{mas} \\neq f(a) \\;\\text{ou}\\; \\nexists f(a)' },
      { tex: '\\text{salto: } \\lim^{-} \\neq \\lim^{+}' },
      { tex: '\\text{infinita: } \\lim = \\pm\\infty' },
    ],
    demonstracao: [
      {
        descricao: 'Na removível, há um buraco que pode ser tapado.',
        tex: 'f(x) = \\frac{x^{2}-4}{x-2} \\;\\Rightarrow\\; \\text{defina } f(2) = 4',
        nota: 'Com essa definição, a função passa a ser contínua.',
      },
      {
        descricao: 'No salto, nenhum valor atribuído ao ponto resolve.',
        tex: '\\lim^{-} = -1 \\neq 1 = \\lim^{+}',
        nota: 'Qualquer f(a) escolhido vai discordar de pelo menos um dos lados.',
      },
      {
        descricao: 'Na infinita, nem sequer há um valor finito para atribuir.',
        tex: '\\lim_{x \\to 0} \\frac{1}{x^{2}} = +\\infty',
      },
    ],
    exemplo: {
      enunciado: 'Uma descontinuidade removível.',
      passos: limiteComPassos((x) => (x * x - 4) / (x - 2), 2, '\\frac{x^{2}-4}{x-2}').passos,
    },
    vejaTambem: ['continuidade.definicao', 'laterais.definicao'],
  },
  {
    id: 'continuidade.tvi',
    titulo: 'Teorema do valor intermediário',
    resumo: 'Uma função contínua não pula valores.',
    definicao:
      'Se uma função contínua vale −3 em um ponto e +5 em outro, ela necessariamente passou ' +
      'por todos os valores entre eles — inclusive o zero. É o que garante que existe uma ' +
      'raiz naquele intervalo, mesmo sem saber calculá-la.',
    formulas: [
      {
        tex: 'f \\text{ contínua em } [a,b],\\; f(a) \\cdot f(b) < 0 \\;\\Rightarrow\\; \\exists c \\in (a,b) : f(c) = 0',
      },
    ],
    demonstracao: [
      {
        descricao: 'Se a função muda de sinal, ela estava abaixo e passou para cima do eixo.',
        tex: 'f(a) < 0 < f(b)',
      },
      {
        descricao: 'Sendo contínua, o gráfico é traçado sem tirar o lápis.',
        tex: '\\text{nenhum salto entre } a \\text{ e } b',
      },
      {
        descricao: 'Logo ela teve de cruzar o eixo em algum ponto do intervalo.',
        tex: '\\exists c : f(c) = 0',
        nota: 'O teorema garante a existência, mas não diz onde — é um resultado de existência.',
      },
      {
        descricao: 'Sem continuidade, a conclusão falha: a função pode pular o zero.',
        tex: '\\frac{1}{x} \\;\\text{vai de } -1 \\text{ a } 1 \\text{ sem passar por } 0',
      },
    ],
    exemplo: {
      enunciado: 'Uma função contínua que muda de sinal tem raiz no intervalo.',
      passos: limiteComPassos((x) => x * x * x - 2, 1.26, 'x^{3}-2').passos,
    },
    vejaTambem: ['continuidade.definicao', 'continuidade.tipos'],
  },
];
