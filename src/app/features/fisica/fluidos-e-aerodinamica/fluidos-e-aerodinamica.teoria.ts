import {
  bernoulliComPassos,
  empuxoArquimedesComPassos,
  pressaoHidrostaticaComPassos,
  sustentacaoComPassos,
} from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_FLUIDOS: readonly Teoria[] = [
  {
    id: 'fluidos.pressao',
    titulo: 'Pressão e empuxo',
    resumo: 'Flutua o que é menos denso — não o que é mais leve.',
    definicao:
      'A pressão num fluido cresce com a profundidade e não depende da forma do recipiente. O ' +
      'empuxo é o peso do fluido DESLOCADO, e comparar empuxo com peso se reduz a comparar ' +
      'densidades: o volume aparece nos dois lados e se cancela. Um navio de aço flutua porque ' +
      'sua densidade média, com o ar interno, é menor que a da água.',
    formulas: [
      { tex: 'p = p_0 + \\rho g h' },
      { tex: 'E = \\rho_{fluido}\\,V g' },
      {
        tex: '\\frac{V_{sub}}{V} = \\frac{\\rho_{corpo}}{\\rho_{fluido}}',
        legenda: 'A fração submersa de um corpo que flutua.',
      },
    ],
    demonstracao: [
      {
        descricao: 'A pressão numa profundidade é o peso da coluna de fluido acima, por unidade de área.',
        tex: 'p = \\frac{mg}{A} = \\frac{\\rho V g}{A} = \\rho g h',
        nota: 'A área se cancela — e é por isso que a forma do recipiente não importa.',
      },
      {
        descricao: 'A diferença de pressão entre topo e base de um corpo gera força resultante para cima.',
        tex: 'E = (p_{base} - p_{topo})A = \\rho g h A = \\rho V g',
      },
      {
        descricao: 'Comparando empuxo e peso, o volume se cancela.',
        tex: '\\rho_{fluido} V g \;\\text{vs}\; \\rho_{corpo} V g',
        nota: 'Sobra uma comparação de densidades: o tamanho do corpo é irrelevante.',
      },
    ],
    exemplo: {
      enunciado: 'Um corpo de densidade 920 kg/m³ na água.',
      passos: empuxoArquimedesComPassos(1, 920).passos,
    },
    vejaTambem: ['fluidos.bernoulli', 'fluidos.sustentacao'],
  },
  {
    id: 'fluidos.bernoulli',
    titulo: 'Equação de Bernoulli',
    resumo: 'Conservação de energia, por unidade de volume.',
    definicao:
      'Bernoulli não é uma lei nova: é a conservação de energia escrita para um fluido em ' +
      'escoamento, dividida pelo volume. A consequência que importa: onde o fluido vai mais ' +
      'rápido, a pressão é menor.',
    formulas: [
      { tex: 'p + \\frac{\\rho v^{2}}{2} + \\rho g h = \\text{constante}' },
      {
        tex: 'v \\uparrow \;\\Rightarrow\; p \\downarrow',
        legenda: 'A troca entre pressão e velocidade.',
      },
    ],
    demonstracao: [
      {
        descricao: 'A energia de uma porção de fluido tem três parcelas.',
        tex: 'W_{pressão} + E_c + E_p',
      },
      {
        descricao: 'Dividindo tudo pelo volume, cada termo vira uma "pressão".',
        tex: 'p + \\frac{\\rho v^{2}}{2} + \\rho g h',
        nota: 'Todos os três termos têm dimensão de pressão — conferir isso é um bom exercício.',
      },
      {
        descricao: 'Como a energia se conserva, a soma é a mesma em qualquer ponto do escoamento.',
        tex: 'p_A + \\frac{\\rho v_A^{2}}{2} = p_B + \\frac{\\rho v_B^{2}}{2}',
        nota: 'Se a velocidade cresce de A para B, a pressão tem de cair.',
      },
    ],
    exemplo: {
      enunciado: 'Ar acelerando de 10 para 30 m/s a partir da pressão atmosférica.',
      passos: bernoulliComPassos(101325, 10, 30).passos,
    },
    vejaTambem: ['fluidos.pressao', 'fluidos.sustentacao', 'energia.conservacao'],
  },
  {
    id: 'fluidos.sustentacao',
    titulo: 'De onde vem a sustentação',
    resumo: 'Diferença de pressão sobre a área da asa.',
    definicao:
      'O ar passa mais rápido sobre a asa do que sob ela, e por Bernoulli a pressão em cima é ' +
      'menor. Essa diferença, multiplicada pela área, é a força de sustentação. Como a ' +
      'velocidade entra ao quadrado, dobrar a velocidade de voo quadruplica a sustentação — e ' +
      'é por isso que existe uma velocidade mínima de decolagem.',
    formulas: [
      { tex: 'L = \\Delta p \\cdot A = \\frac{\\rho}{2}\\left(v_{sup}^{2} - v_{inf}^{2}\\right)A' },
      {
        tex: 'L \\propto v^{2}',
        legenda: 'A sustentação cresce com o quadrado da velocidade.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Aplicamos Bernoulli acima e abaixo da asa, à mesma altura.',
        tex: 'p_{sup} + \\frac{\\rho v_{sup}^{2}}{2} = p_{inf} + \\frac{\\rho v_{inf}^{2}}{2}',
      },
      {
        descricao: 'A diferença de pressão sai direto.',
        tex: '\\Delta p = \\frac{\\rho}{2}\\left(v_{sup}^{2} - v_{inf}^{2}\\right)',
      },
      {
        descricao: 'A força é a pressão aplicada sobre a área.',
        tex: 'L = \\Delta p \\cdot A',
        nota: 'Daí asas grandes sustentarem mais — e aviões lentos precisarem de asas maiores.',
      },
      {
        descricao: 'Em voo nivelado, a sustentação iguala o peso.',
        tex: 'L = mg',
        nota: 'Abaixo da velocidade em que isso é possível, o avião não voa.',
      },
    ],
    exemplo: {
      enunciado: 'Asa de 20 m² com ar a 60 m/s em cima e 50 m/s embaixo.',
      passos: sustentacaoComPassos(20, 60, 50).passos,
    },
    vejaTambem: ['fluidos.bernoulli', 'fluidos.pressao'],
  },
];
