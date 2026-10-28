import { anguloEntreComPassos, areaParalelogramoComPassos, projecaoComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_PRODUTOS: readonly Teoria[] = [
  {
    id: 'produtos.escalar',
    titulo: 'Produto escalar',
    resumo: 'Quanto um vetor vai na direção do outro.',
    definicao:
      'O produto escalar devolve um número, não um vetor, e esse número mede alinhamento: ' +
      'máximo quando os vetores apontam para o mesmo lado, zero quando são perpendiculares, ' +
      'negativo quando se opõem. É a conta que define trabalho em física.',
    formulas: [
      { tex: '\\vec{a}\\cdot\\vec{b} = a_x b_x + a_y b_y' },
      { tex: '\\vec{a}\\cdot\\vec{b} = |\\vec{a}||\\vec{b}|\\cos\\theta' },
      {
        tex: '\\vec{a}\\cdot\\vec{b} = 0 \\iff \\vec{a} \\perp \\vec{b}',
        legenda: 'O teste de perpendicularidade mais barato que existe.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Pela lei dos cossenos aplicada ao triângulo dos dois vetores.',
        tex: '|\\vec{a}-\\vec{b}|^{2} = |\\vec{a}|^{2} + |\\vec{b}|^{2} - 2|\\vec{a}||\\vec{b}|\\cos\\theta',
      },
      {
        descricao: 'Expandindo o lado esquerdo em componentes.',
        tex: '|\\vec{a}-\\vec{b}|^{2} = |\\vec{a}|^{2} + |\\vec{b}|^{2} - 2(a_x b_x + a_y b_y)',
      },
      {
        descricao: 'Comparando os dois, as duas definições coincidem.',
        tex: 'a_x b_x + a_y b_y = |\\vec{a}||\\vec{b}|\\cos\\theta',
        nota: 'Uma forma é fácil de calcular; a outra é fácil de interpretar.',
      },
    ],
    exemplo: {
      enunciado: 'O ângulo entre (1, 0) e (1, 1).',
      passos: anguloEntreComPassos({ x: 1, y: 0 }, { x: 1, y: 1 }).passos,
    },
    vejaTambem: ['produtos.projecao', 'produtos.vetorial', 'leis.cossenos'],
  },
  {
    id: 'produtos.projecao',
    titulo: 'Projeção e trabalho',
    resumo: 'Só a parte alinhada conta.',
    definicao:
      'A projeção de um vetor sobre outro é sua "sombra" naquela direção. É por isso que ' +
      'empurrar uma caixa obliquamente realiza menos trabalho do que empurrá-la na horizontal: ' +
      'a componente vertical da força não participa do deslocamento.',
    formulas: [
      { tex: 'a_b = \\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{b}|} = |\\vec{a}|\\cos\\theta' },
      {
        tex: 'W = \\vec{F}\\cdot\\vec{d} = |\\vec{F}||\\vec{d}|\\cos\\theta',
        legenda: 'Trabalho é o produto escalar entre força e deslocamento.',
      },
    ],
    demonstracao: [
      {
        descricao: 'O pé da perpendicular define um triângulo retângulo.',
        tex: 'a_b = |\\vec{a}|\\cos\\theta',
      },
      {
        descricao: 'Usando a definição do produto escalar para eliminar o cosseno.',
        tex: 'a_b = \\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{b}|}',
        nota: 'A projeção depende só da direção de b, não do seu comprimento.',
      },
      {
        descricao: 'Com θ = 90°, a projeção é nula: força perpendicular não realiza trabalho.',
        tex: '\\cos 90^\\circ = 0 \;\\Rightarrow\; W = 0',
        nota: 'É por isso que carregar um peso andando na horizontal não realiza trabalho sobre ele.',
      },
    ],
    exemplo: {
      enunciado: 'A projeção de (3, 4) sobre o eixo x.',
      passos: projecaoComPassos({ x: 3, y: 4 }, { x: 1, y: 0 }).passos,
    },
    vejaTambem: ['produtos.escalar', 'energia.trabalho'],
  },
  {
    id: 'produtos.vetorial',
    titulo: 'Produto vetorial e torque',
    resumo: 'O que mede giro, não alinhamento.',
    definicao:
      'O produto vetorial é máximo quando os vetores são perpendiculares e nulo quando são ' +
      'paralelos — o oposto do escalar. Seu módulo é a área do paralelogramo formado pelos ' +
      'dois, e é essa conta que define torque: empurrar na direção do eixo não gira nada.',
    formulas: [
      { tex: '|\\vec{a}\\times\\vec{b}| = |\\vec{a}||\\vec{b}|\\sin\\theta' },
      {
        tex: '(\\vec{a}\\times\\vec{b})_z = a_x b_y - a_y b_x',
        legenda: 'No plano, basta um número: o determinante 2×2.',
      },
      {
        tex: '\\vec{\\tau} = \\vec{r}\\times\\vec{F}',
        legenda: 'Torque: o giro que uma força produz em torno de um ponto.',
      },
    ],
    demonstracao: [
      {
        descricao: 'A área de um paralelogramo é base vezes altura.',
        tex: 'A = |\\vec{a}| \\cdot h',
      },
      {
        descricao: 'A altura é a componente de b perpendicular a a.',
        tex: 'h = |\\vec{b}|\\sin\\theta',
        nota: 'Daí o seno, no lugar do cosseno do produto escalar.',
      },
      {
        descricao: 'Logo o módulo do produto vetorial é a área.',
        tex: 'A = |\\vec{a}||\\vec{b}|\\sin\\theta',
      },
      {
        descricao: 'Vetores paralelos dão área zero — e torque zero.',
        tex: '\\sin 0^\\circ = 0',
        nota: 'Empurrar uma porta pela dobradiça não a abre, por mais força que se faça.',
      },
    ],
    exemplo: {
      enunciado: 'A área do paralelogramo formado por (3, 0) e (0, 4).',
      passos: areaParalelogramoComPassos({ x: 3, y: 0 }, { x: 0, y: 4 }).passos,
    },
    vejaTambem: ['produtos.escalar', 'matrizes.determinante', 'torque.equilibrio'],
  },
];
