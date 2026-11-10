import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_COORDENADAS: readonly Teoria[] = [
  {
    id: 'coordenadas.escolher-o-sistema',
    titulo: 'Escolher o sistema certo',
    resumo: 'O bom sistema faz a simetria do problema sumir da conta.',
    definicao:
      'Coordenadas não são verdade, são escolha. Um tanque cilíndrico descrito em cartesianas ' +
      'exige raízes nos limites de integração; em cilíndricas, vira um retângulo de limites ' +
      'constantes. Escolher o sistema que respeita a simetria do problema é, muitas vezes, a ' +
      'única diferença entre uma integral impossível e uma imediata.',
    formulas: [
      { tex: '\\text{simetria axial} \\;\\Longrightarrow\\; \\text{cilíndricas}' },
      { tex: '\\text{simetria esférica} \\;\\Longrightarrow\\; \\text{esféricas}' },
    ],
    demonstracao: [
      {
        descricao: 'Um cilindro em cartesianas tem limites com raiz.',
        tex: '-\\sqrt{R^{2} - x^{2}} \\leq y \\leq \\sqrt{R^{2} - x^{2}}',
      },
      {
        descricao: 'Em cilíndricas, os limites são constantes.',
        tex: '0 \\leq r \\leq R \\qquad 0 \\leq \\theta \\leq 2\\pi \\qquad 0 \\leq z \\leq h',
        nota: 'A região vira um bloco retangular no espaço dos novos parâmetros.',
      },
      {
        descricao: 'E o volume sai em uma linha.',
        tex: '\\int_{0}^{h}\\int_{0}^{2\\pi}\\int_{0}^{R} r\\,dr\\,d\\theta\\,dz = \\pi R^{2}h',
      },
    ],
    vejaTambem: ['coordenadas.cilindricas', 'coordenadas.esfericas'],
  },
  {
    id: 'coordenadas.cilindricas',
    titulo: 'Cilíndricas',
    resumo: 'Polares no plano, com o z intocado.',
    definicao:
      'As coordenadas cilíndricas são as polares do plano acrescidas da altura. O r mede a ' +
      'distância ao EIXO z, não à origem — essa é a distinção que as separa das esféricas. ' +
      'Servem a tudo que tem eixo de simetria: tubos, tanques, bocais, eixos girantes.',
    formulas: [
      { tex: 'x = r\\cos\\theta \\qquad y = r\\operatorname{sen}\\theta \\qquad z = z' },
      { tex: 'dV = r\\,dr\\,d\\theta\\,dz' },
      { tex: 'r = \\sqrt{x^{2} + y^{2}}' },
    ],
    demonstracao: [
      {
        descricao: 'Um ponto a 60 graus, raio 2 e altura 5.',
        tex: 'x = 2\\cos 60^\\circ = 1 \\qquad y = 2\\operatorname{sen} 60^\\circ \\approx 1{,}73',
      },
      {
        descricao: 'A altura não participa da conversão.',
        tex: 'z = 5',
      },
      {
        descricao: 'E a distância ao eixo é o próprio r.',
        tex: '\\sqrt{1^{2} + 1{,}73^{2}} = 2 \\;\\checkmark',
        nota: 'A distância à ORIGEM seria outra, e envolveria o z.',
      },
    ],
    exemplo: {
      enunciado:
        'Converta o ponto cilíndrico (r, θ, z) = (2, 60°, 5) para coordenadas cartesianas.',
      passos: [
        {
          descricao: 'x é a projeção de r no eixo x.',
          tex: 'x = r\\cos\\theta = 2\\cos 60^{\\circ} = 2 \\cdot \\frac{1}{2} = 1',
        },
        {
          descricao: 'y é a projeção de r no eixo y.',
          tex: 'y = r\\sin\\theta = 2\\sin 60^{\\circ} = 2 \\cdot \\frac{\\sqrt{3}}{2} = \\sqrt{3} \\approx 1{,}732',
        },
        {
          descricao: 'A altura z é a mesma nos dois sistemas.',
          tex: '(x, y, z) = (1,\\; \\sqrt{3},\\; 5)',
        },
      ],
    },
    vejaTambem: ['coordenadas.esfericas', 'coordenadas.escolher-o-sistema'],
  },
  {
    id: 'coordenadas.esfericas',
    titulo: 'Esféricas',
    resumo: 'Raio até a origem, com dois ângulos — e o polar sai do eixo z.',
    definicao:
      'Em esféricas o raio mede a distância até a ORIGEM, e dois ângulos localizam a direção: ' +
      'o polar, medido a partir do eixo z, e o azimutal, no plano. A convenção do ângulo polar ' +
      'é a fonte da maior parte dos erros — trocar seno por cosseno nele é o engano padrão do ' +
      'assunto.',
    formulas: [
      {
        tex:
          'x = \\rho\\operatorname{sen}\\varphi\\cos\\theta \\qquad ' +
          'y = \\rho\\operatorname{sen}\\varphi\\operatorname{sen}\\theta \\qquad z = \\rho\\cos\\varphi',
      },
      { tex: 'dV = \\rho^{2}\\operatorname{sen}\\varphi\\,d\\rho\\,d\\varphi\\,d\\theta' },
    ],
    demonstracao: [
      {
        descricao: 'No polo norte, o ângulo polar é zero.',
        tex: '\\varphi = 0 \\;\\Longrightarrow\\; z = \\rho,\\quad x = y = 0',
        nota: 'O cosseno de zero é 1, e o seno é zero: o ponto sobe direto pelo eixo.',
      },
      {
        descricao: 'No equador, ele vale 90 graus.',
        tex: '\\varphi = 90^\\circ \\;\\Longrightarrow\\; z = 0,\\quad \\sqrt{x^{2} + y^{2}} = \\rho',
      },
      {
        descricao: 'O volume da esfera sai da integral tripla.',
        tex: '\\int_{0}^{2\\pi}\\int_{0}^{\\pi}\\int_{0}^{R} \\rho^{2}\\operatorname{sen}\\varphi\\,d\\rho\\,d\\varphi\\,d\\theta',
      },
      {
        descricao: 'E dá o valor conhecido.',
        tex: '\\frac{4}{3}\\pi R^{3} \\;\\checkmark',
        nota: 'O jacobiano aqui tem rho ao quadrado e seno do polar; esquecer qualquer um estraga tudo.',
      },
    ],
    vejaTambem: ['coordenadas.cilindricas', 'coordenadas.escolher-o-sistema'],
  },
];
