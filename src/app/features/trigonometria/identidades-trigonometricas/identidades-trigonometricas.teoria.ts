import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_IDENTIDADES: readonly Teoria[] = [
  {
    id: 'identidades.fundamental',
    titulo: 'A identidade fundamental',
    resumo: 'sen²θ + cos²θ = 1, válida para todo ângulo.',
    definicao:
      'É a relação mais usada da trigonometria. No círculo de raio 1, ela é simplesmente a ' +
      'equação da circunferência escrita com as coordenadas do ponto. Conhecendo uma das ' +
      'razões e o quadrante, ela entrega a outra.',
    formulas: [
      { tex: '\\sin^{2}\\theta + \\cos^{2}\\theta = 1' },
      { tex: '1 + \\tan^{2}\\theta = \\sec^{2}\\theta', legenda: 'Dividindo tudo por cos²θ.' },
    ],
    demonstracao: [
      {
        descricao: 'O ponto do círculo tem coordenadas (cos θ, sen θ) e está a distância 1 da origem.',
        tex: 'x^{2} + y^{2} = 1',
      },
      {
        descricao: 'Substituindo as coordenadas.',
        tex: '\\cos^{2}\\theta + \\sin^{2}\\theta = 1',
        nota: 'Vale para qualquer ângulo, inclusive fora do primeiro quadrante.',
      },
      {
        descricao: 'Dividindo a identidade por cos²θ, surge uma segunda relação.',
        tex: '\\frac{\\sin^{2}\\theta}{\\cos^{2}\\theta} + 1 = \\frac{1}{\\cos^{2}\\theta} \\;\\Rightarrow\\; \\tan^{2}\\theta + 1 = \\sec^{2}\\theta',
      },
    ],
    vejaTambem: ['identidades.soma', 'identidades.arco-duplo'],
  },
  {
    id: 'identidades.soma',
    titulo: 'Soma e diferença de arcos',
    resumo: 'O seno da soma NÃO é a soma dos senos.',
    definicao:
      'Um dos erros mais caros da trigonometria é supor que sen(a + b) = sen a + sen b. Isso ' +
      'é falso. As fórmulas corretas misturam senos e cossenos dos dois ângulos — e delas ' +
      'derivam quase todas as outras identidades.',
    formulas: [
      { tex: '\\sin(a + b) = \\sin a \\cos b + \\cos a \\sin b' },
      { tex: '\\cos(a + b) = \\cos a \\cos b - \\sin a \\sin b', legenda: 'Atenção ao sinal invertido.' },
      { tex: '\\sin(a + b) \\neq \\sin a + \\sin b' },
    ],
    demonstracao: [
      {
        descricao: 'Um contraexemplo basta para derrubar a versão ingênua.',
        tex: '\\sin(30° + 60°) = \\sin 90° = 1',
      },
      {
        descricao: 'Enquanto a soma dos senos dá outro valor.',
        tex: '\\sin 30° + \\sin 60° = 0{,}5 + 0{,}866 = 1{,}366',
        nota: 'Os dois resultados são diferentes, então a igualdade é falsa.',
      },
      {
        descricao: 'Pela fórmula correta.',
        tex: '\\sin 30°\\cos 60° + \\cos 30°\\sin 60° = 0{,}25 + 0{,}75 = 1 \\;\\checkmark',
      },
      {
        descricao: 'No cosseno, o sinal do meio é invertido em relação ao da soma dos arcos.',
        tex: '\\cos(a+b) = \\cos a\\cos b - \\sin a\\sin b',
        nota: 'Soma de arcos, menos no meio; diferença de arcos, mais no meio.',
      },
    ],
    vejaTambem: ['identidades.arco-duplo', 'identidades.fundamental'],
  },
  {
    id: 'identidades.arco-duplo',
    titulo: 'Arco duplo',
    resumo: 'Caso particular da soma, com os dois ângulos iguais.',
    definicao:
      'As fórmulas do arco duplo não são novas: saem das fórmulas da soma fazendo b = a. ' +
      'A do cosseno tem três formas equivalentes, obtidas usando a identidade fundamental.',
    formulas: [
      { tex: '\\sin 2a = 2\\sin a \\cos a' },
      { tex: '\\cos 2a = \\cos^{2}a - \\sin^{2}a = 1 - 2\\sin^{2}a = 2\\cos^{2}a - 1' },
    ],
    demonstracao: [
      {
        descricao: 'Partimos da fórmula da soma com b = a.',
        tex: '\\sin(a + a) = \\sin a\\cos a + \\cos a\\sin a',
      },
      {
        descricao: 'As duas parcelas são iguais e se somam.',
        tex: '\\sin 2a = 2\\sin a\\cos a',
      },
      {
        descricao: 'Para o cosseno, o mesmo procedimento.',
        tex: '\\cos 2a = \\cos^{2}a - \\sin^{2}a',
      },
      {
        descricao: 'Usando sen² = 1 − cos², chega-se às outras duas formas.',
        tex: '\\cos 2a = 2\\cos^{2}a - 1 = 1 - 2\\sin^{2}a',
        nota: 'Escolhe-se a forma que tiver a razão já conhecida no problema.',
      },
    ],
    vejaTambem: ['identidades.soma', 'identidades.fundamental'],
  },
];
