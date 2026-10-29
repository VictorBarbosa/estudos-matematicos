import { deslocamentoPorAreaComPassos, torricelliComPassos } from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_CINEMATICA: readonly Teoria[] = [
  {
    id: 'cinematica.equacoes',
    titulo: 'As equações do movimento',
    resumo: 'Duas equações, e uma terceira que vem delas.',
    definicao:
      'No movimento uniformemente variado, a velocidade cresce linearmente e a posição ' +
      'quadraticamente. Só isso. A equação de Torricelli não é uma terceira lei: é o que ' +
      'sobra quando se elimina o tempo entre as duas primeiras.',
    formulas: [
      { tex: 'v = v_0 + at' },
      { tex: 's = s_0 + v_0 t + \\frac{at^{2}}{2}' },
      {
        tex: 'v^{2} = v_0^{2} + 2a\\Delta s',
        legenda: 'Torricelli: útil quando o tempo não interessa.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Aceleração constante significa que a velocidade varia por igual a cada segundo.',
        tex: 'v = v_0 + at',
      },
      {
        descricao: 'A posição acumula a velocidade média do intervalo.',
        tex: 's = s_0 + \\bar{v}\\,t = s_0 + \\frac{v_0 + v}{2}t',
        nota: 'A média funciona porque a velocidade varia linearmente.',
      },
      {
        descricao: 'Substituindo v e simplificando, aparece o termo quadrático.',
        tex: 's = s_0 + v_0 t + \\frac{at^{2}}{2}',
      },
      {
        descricao: 'Isolando o tempo na primeira e substituindo na segunda, ele desaparece.',
        tex: 'v^{2} = v_0^{2} + 2a\\Delta s',
      },
    ],
    exemplo: {
      enunciado: 'A velocidade após 25 m com v₀ = 4 m/s e a = 3 m/s².',
      passos: torricelliComPassos(4, 3, 25).passos,
    },
    vejaTambem: ['cinematica.graficos', 'taxa.instantanea'],
  },
  {
    id: 'cinematica.graficos',
    titulo: 'O que os gráficos contam',
    resumo: 'Inclinação é derivada; área é integral.',
    definicao:
      'No gráfico de posição, a inclinação é a velocidade. No de velocidade, a inclinação é a ' +
      'aceleração e a ÁREA é o deslocamento. Essas duas leituras — inclinação e área — são ' +
      'exatamente a derivada e a integral, encontradas aqui antes de qualquer formalismo: ' +
      'nada neste tópico depende delas, e os exercícios se resolvem com as equações do ' +
      'movimento. Quando a trilha chegar ao cálculo, estas duas frases ganharão a definição ' +
      'formal — e o mesmo gráfico voltará a aparecer.',
    formulas: [
      { tex: 'v = \\text{inclinação de } s(t)' },
      { tex: '\\Delta s = \\text{área sob } v(t)' },
    ],
    demonstracao: [
      {
        descricao: 'Num movimento uniforme, a área sob v × t é um retângulo.',
        tex: '\\Delta s = v\\,\\Delta t',
      },
      {
        descricao: 'Com aceleração constante, o gráfico é uma reta e a área ganha um triângulo.',
        tex: '\\Delta s = v_0 t + \\frac{at^{2}}{2}',
        nota: 'Retângulo mais triângulo: exatamente os dois termos da equação da posição.',
      },
      {
        descricao: 'Para qualquer v(t), a área continua sendo o deslocamento.',
        tex: '\\Delta s = \\int v\\,dt',
        nota: 'É a integral, aparecendo numa aula de cinemática do ensino médio.',
      },
    ],
    exemplo: {
      enunciado: 'O deslocamento como área, com v₀ = 6 m/s, a = 2 m/s², em 4 s.',
      passos: deslocamentoPorAreaComPassos(6, 2, 4).passos,
    },
    vejaTambem: ['cinematica.equacoes', 'riemann.ideia', 'taxa.media'],
  },
];
