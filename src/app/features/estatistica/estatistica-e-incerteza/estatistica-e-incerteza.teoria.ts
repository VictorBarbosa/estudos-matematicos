import {
  ajustarRetaComPassos,
  desvioPadraoComPassos,
  propagarProdutoComPassos,
  propagarSomaComPassos,
} from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_INCERTEZA: readonly Teoria[] = [
  {
    id: 'incerteza.dispersao',
    titulo: 'Média e dispersão',
    resumo: 'Duas medidas: onde está o valor, e quão espalhado ele é.',
    definicao:
      'Repetir uma medição nunca dá exatamente o mesmo número. A média estima o valor ' +
      'verdadeiro; o desvio padrão mede o espalhamento. Os dois juntos — e não a média ' +
      'sozinha — é que descrevem um resultado experimental.',
    formulas: [
      { tex: '\\bar{x} = \\frac{1}{n}\\sum x_i' },
      { tex: 's = \\sqrt{\\frac{\\sum (x_i - \\bar{x})^{2}}{n - 1}}' },
      {
        tex: '\\sigma_{\\bar{x}} = \\frac{s}{\\sqrt{n}}',
        legenda: 'A incerteza da média cai com a raiz do número de medidas.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Somar os desvios simples daria zero: a média está no meio, por construção.',
        tex: '\\sum (x_i - \\bar{x}) = 0',
      },
      {
        descricao: 'Elevar ao quadrado impede que desvios opostos se cancelem.',
        tex: '\\sum (x_i - \\bar{x})^{2} > 0',
      },
      {
        descricao: 'Divide-se por n − 1, porque a média já foi estimada desta mesma amostra.',
        tex: 's^{2} = \\frac{\\sum (x_i - \\bar{x})^{2}}{n-1}',
        nota: 'Dividir por n subestimaria sistematicamente a dispersão real.',
      },
      {
        descricao: 'Medir mais vezes não reduz a dispersão, mas melhora a estimativa da média.',
        tex: '\\sigma_{\\bar{x}} = \\frac{s}{\\sqrt{n}}',
        nota: 'Para dobrar a precisão da média, são necessárias quatro vezes mais medidas.',
      },
    ],
    exemplo: {
      enunciado: 'O desvio padrão de 2, 4, 4, 4, 5, 5, 7, 9.',
      passos: desvioPadraoComPassos([2, 4, 4, 4, 5, 5, 7, 9]).passos,
    },
    vejaTambem: ['incerteza.propagacao', 'incerteza.ajuste'],
  },
  {
    id: 'incerteza.propagacao',
    titulo: 'Propagação de incerteza',
    resumo: 'Erros se combinam em quadratura, não somando.',
    definicao:
      'Quando medidas entram numa conta, suas incertezas se propagam. Em somas e subtrações, ' +
      'combinam-se as incertezas ABSOLUTAS; em produtos e quocientes, as RELATIVAS. Nos dois ' +
      'casos a combinação é em quadratura, porque é improvável que todos os erros apontem ' +
      'para o mesmo lado.',
    formulas: [
      { tex: 'R = A \\pm B: \\quad \\sigma_R = \\sqrt{\\sigma_A^{2} + \\sigma_B^{2}}' },
      {
        tex: 'R = AB: \\quad \\frac{\\sigma_R}{R} = \\sqrt{\\left(\\frac{\\sigma_A}{A}\\right)^{2} + \\left(\\frac{\\sigma_B}{B}\\right)^{2}}',
      },
      {
        tex: 'R = A^{n}: \\quad \\frac{\\sigma_R}{R} = n\\frac{\\sigma_A}{A}',
        legenda: 'Expoentes amplificam a incerteza relativa.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Somar as incertezas diretamente suporia que todas erram no mesmo sentido.',
        tex: '\\sigma_A + \\sigma_B',
        nota: 'Isso é o pior caso, não o caso típico.',
      },
      {
        descricao: 'Sendo independentes, é mais provável que se compensem em parte.',
        tex: '\\sigma_R = \\sqrt{\\sigma_A^{2} + \\sigma_B^{2}} < \\sigma_A + \\sigma_B',
      },
      {
        descricao: 'Em produtos, o que importa é o erro proporcional de cada fator.',
        tex: '\\frac{\\sigma_R}{R} = \\sqrt{\\sum \\left(n_i\\frac{\\sigma_i}{x_i}\\right)^{2}}',
        nota: 'Daí a regra prática: melhore primeiro a medida que entra com maior expoente.',
      },
    ],
    exemplo: {
      enunciado: 'Combinando incertezas de 3 e 4 numa soma.',
      passos: propagarSomaComPassos([3, 4]).passos,
    },
    vejaTambem: ['incerteza.dispersao', 'notacao.significativos'],
  },
  {
    id: 'incerteza.ajuste',
    titulo: 'Ajuste de reta',
    resumo: 'A inclinação é a grandeza que se quer medir.',
    definicao:
      'Num experimento bem planejado, a grandeza procurada é a inclinação de uma reta. O ' +
      'método dos mínimos quadrados encontra a reta que minimiza a soma dos quadrados dos ' +
      'resíduos, e o R² informa se o modelo linear descrevia bem os dados.',
    formulas: [
      { tex: 'a = \\frac{n\\sum xy - \\sum x\\sum y}{n\\sum x^{2} - (\\sum x)^{2}}' },
      { tex: 'R^{2} = 1 - \\frac{\\sum \\text{resíduos}^{2}}{\\sum (y_i - \\bar{y})^{2}}' },
    ],
    demonstracao: [
      {
        descricao: 'Procuramos a e b que minimizem a soma dos quadrados dos resíduos.',
        tex: 'S(a,b) = \\sum (y_i - ax_i - b)^{2}',
      },
      {
        descricao: 'No mínimo, as derivadas parciais em relação a a e b se anulam.',
        tex: '\\frac{\\partial S}{\\partial a} = 0 \\qquad \\frac{\\partial S}{\\partial b} = 0',
        nota: 'É o critério de máximos e mínimos do cálculo, aplicado a duas variáveis.',
      },
      {
        descricao: 'Isso dá um sistema linear em a e b, cuja solução é a fórmula acima.',
        tex: 'a, b',
      },
      {
        descricao: 'A reta sempre passa pelo ponto médio dos dados.',
        tex: '(\\bar{x},\\, \\bar{y})',
      },
    ],
    exemplo: {
      enunciado: 'Ajustando uma reta a pontos perfeitamente alinhados.',
      passos: ajustarRetaComPassos([
        { x: 0, y: 2 },
        { x: 1, y: 5 },
        { x: 2, y: 8 },
        { x: 3, y: 11 },
      ]).passos,
    },
    vejaTambem: ['incerteza.dispersao', 'afim.coeficientes', 'aplic-derivada.otimizacao'],
  },
];
