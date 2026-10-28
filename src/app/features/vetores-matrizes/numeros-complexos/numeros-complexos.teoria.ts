import {
  multiplicarComplexosComPassos,
  paraPolarComPassos,
  potenciaComPassos,
} from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_COMPLEXOS: readonly Teoria[] = [
  {
    id: 'complexos.plano',
    titulo: 'Um número com duas coordenadas',
    resumo: 'O plano de Argand-Gauss.',
    definicao:
      'Definir i como a raiz de −1 parece um truque, mas o que se ganha é geométrico: todo ' +
      'complexo a + bi é um ponto do plano, com a no eixo real e b no imaginário. Somar ' +
      'complexos é somar vetores; o módulo é a distância até a origem.',
    formulas: [
      { tex: 'i^{2} = -1' },
      { tex: 'z = a + bi \\longleftrightarrow (a,\\, b)' },
      { tex: '|z| = \\sqrt{a^{2} + b^{2}}' },
    ],
    demonstracao: [
      {
        descricao: 'Nenhum real ao quadrado dá negativo, então inventa-se uma unidade nova.',
        tex: 'i = \\sqrt{-1}',
      },
      {
        descricao: 'Com ela, todo complexo tem duas partes independentes.',
        tex: 'z = a + bi',
        nota: 'Independentes como os eixos de um plano — não há como somar a com b.',
      },
      {
        descricao: 'As potências de i giram de quatro em quatro.',
        tex: 'i^{1} = i,\; i^{2} = -1,\; i^{3} = -i,\; i^{4} = 1',
        nota: 'Esse ciclo é a primeira pista de que multiplicar por i é girar 90°.',
      },
    ],
    exemplo: {
      enunciado: 'Escrevendo 3 + 4i na forma polar.',
      passos: paraPolarComPassos({ real: 3, imaginario: 4 }).passos,
    },
    vejaTambem: ['complexos.multiplicacao', 'complexos.demoivre', 'vetores.definicao'],
  },
  {
    id: 'complexos.multiplicacao',
    titulo: 'Multiplicar é girar e esticar',
    resumo: 'Módulos multiplicam, argumentos somam.',
    definicao:
      'Na forma algébrica, multiplicar complexos é só a distributiva com i² = −1. Na forma ' +
      'polar, revela-se o que realmente acontece: o módulo do produto é o produto dos ' +
      'módulos, e o argumento é a soma dos argumentos. Multiplicar por um complexo é aplicar ' +
      'uma rotação combinada com uma mudança de escala.',
    formulas: [
      { tex: '(a+bi)(c+di) = (ac - bd) + (ad + bc)i' },
      { tex: '|z_1 z_2| = |z_1||z_2| \\qquad \\arg(z_1 z_2) = \\arg z_1 + \\arg z_2' },
      {
        tex: 'z \\cdot i: \\text{ gira } 90^\\circ',
        legenda: 'Multiplicar por i é um quarto de volta anti-horária.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Distribuímos como em qualquer binômio.',
        tex: 'ac + adi + bci + bdi^{2}',
      },
      {
        descricao: 'O termo com i² vira real e com sinal trocado.',
        tex: '= (ac - bd) + (ad + bc)i',
        nota: 'É daqui que vem o menos na parte real.',
      },
      {
        descricao: 'Em forma polar, escrevendo cada fator com módulo e ângulo.',
        tex: 'r_1(\\cos\\alpha + i\\sin\\alpha) \\cdot r_2(\\cos\\beta + i\\sin\\beta)',
      },
      {
        descricao: 'As identidades de soma de arcos recombinam tudo.',
        tex: '= r_1 r_2\\left[\\cos(\\alpha+\\beta) + i\\sin(\\alpha+\\beta)\\right]',
        nota: 'É literalmente a soma de arcos da trigonometria aparecendo aqui.',
      },
    ],
    exemplo: {
      enunciado: 'Multiplicando (2 + 3i) por (1 − i).',
      passos: multiplicarComplexosComPassos(
        { real: 2, imaginario: 3 },
        { real: 1, imaginario: -1 },
      ).passos,
    },
    vejaTambem: ['complexos.plano', 'complexos.demoivre', 'identidades.soma-arcos'],
  },
  {
    id: 'complexos.demoivre',
    titulo: 'De Moivre e as potências',
    resumo: 'Elevar é girar várias vezes o mesmo ângulo.',
    definicao:
      'Elevar um complexo à n-ésima potência, na forma algébrica, dá um trabalho enorme. Na ' +
      'polar, é imediato: o módulo se eleva a n e o argumento se multiplica por n. Essa é a ' +
      'fórmula de De Moivre, e é ela que torna complexos a ferramenta natural para tudo que ' +
      'oscila ou gira.',
    formulas: [
      { tex: 'z^{n} = r^{n}\\left[\\cos(n\\theta) + i\\sin(n\\theta)\\right]' },
      {
        tex: 'i^{4} = 1',
        legenda: 'Quatro giros de 90° fecham a volta.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Multiplicar z por si mesmo soma o argumento com ele mesmo.',
        tex: 'z^{2} = r^{2}\\,\\angle\\,2\\theta',
      },
      {
        descricao: 'Repetindo n vezes, o padrão se mantém.',
        tex: 'z^{n} = r^{n}\\,\\angle\\,n\\theta',
        nota: 'Cada multiplicação aplica o mesmo giro outra vez.',
      },
      {
        descricao: 'Com r = 1, o número apenas gira sobre o círculo unitário.',
        tex: '|z| = 1 \;\\Rightarrow\; |z^{n}| = 1',
        nota: 'É a origem das raízes da unidade, distribuídas igualmente no círculo.',
      },
    ],
    exemplo: {
      enunciado: 'Calculando (1 + i)⁵ por De Moivre.',
      passos: potenciaComPassos({ real: 1, imaginario: 1 }, 5).passos,
    },
    vejaTambem: ['complexos.multiplicacao', 'circulo.radianos'],
  },
];
