import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_EQUACOES_EXPONENCIAIS: readonly Teoria[] = [
  {
    id: 'expeq.mesma-base',
    titulo: 'Igualar as bases',
    resumo: 'Se os dois lados são potências da mesma base, os expoentes são iguais.',
    definicao:
      'A função bˣ (com b > 0 e b ≠ 1) é injetora: dois expoentes diferentes nunca dão o mesmo ' +
      'resultado. Então, quando os dois lados de uma equação se escrevem como potências da MESMA ' +
      'base, basta igualar os expoentes. O trabalho está em reescrever: 8 = 2³, 1/9 = 3⁻², ' +
      '√5 = 5^(1/2), 4ˣ = 2^(2x).',
    formulas: [
      { tex: 'b^{m} = b^{n} \\iff m = n \\quad (b > 0,\\; b \\neq 1)' },
      {
        tex: '\\frac{1}{b^{n}} = b^{-n} \\qquad (b^{m})^{x} = b^{mx}',
        legenda: 'As duas reescritas que mais aparecem.',
      },
    ],
    demonstracao: [
      {
        descricao: 'bˣ é estritamente crescente (b > 1) ou decrescente (0 < b < 1).',
        tex: 'm < n \\;\\Rightarrow\\; b^{m} < b^{n} \\quad (b > 1)',
      },
      {
        descricao:
          'Uma função estritamente monótona não repete valores: se as imagens são iguais, as entradas também.',
        tex: 'b^{m} = b^{n} \\;\\Rightarrow\\; m = n',
      },
    ],
    exemplo: {
      enunciado: '4ˣ = 1/8',
      passos: [
        { descricao: 'Tudo em base 2.', tex: '(2^{2})^{x} = 2^{-3}' },
        { descricao: 'Potência de potência.', tex: '2^{2x} = 2^{-3} \\;\\Rightarrow\\; 2x = -3' },
        { descricao: 'Isolando x.', tex: 'x = -\\frac{3}{2}' },
      ],
    },
    vejaTambem: ['expeq.logaritmo', 'exponencial.definicao'],
  },
  {
    id: 'expeq.logaritmo',
    titulo: 'Tirar o logaritmo dos dois lados',
    resumo: 'Quando as bases não se igualam, o ln traz o expoente para a frente.',
    definicao:
      'Se 2ˣ = 7, não há expoente inteiro que sirva: x está entre 2 e 3. O logaritmo resolve: ' +
      'aplicando ln aos dois lados, a propriedade ln(bˣ) = x·ln b desce o x do expoente, e ele se ' +
      'isola com uma divisão. Antes, isole a potência — um número multiplicando bˣ não está ' +
      'dentro do expoente. É assim que se tira qualquer tempo de um crescimento ou decaimento.',
    formulas: [
      { tex: 'b^{x} = c \\;\\Rightarrow\\; x = \\frac{\\ln c}{\\ln b} = \\log_{b} c' },
      { tex: 'P_0\\,e^{rt} = P \\;\\Rightarrow\\; t = \\frac{1}{r}\\ln\\frac{P}{P_0}' },
    ],
    demonstracao: [
      {
        descricao: 'Aplicamos ln aos dois lados; a igualdade se mantém porque ln é uma função.',
        tex: '\\ln(b^{x}) = \\ln c',
      },
      {
        descricao: 'A propriedade da potência traz o expoente para a frente.',
        tex: 'x \\ln b = \\ln c \\;\\Rightarrow\\; x = \\frac{\\ln c}{\\ln b}',
        nota: 'É a fórmula de mudança de base: log₂ 7 = ln 7 / ln 2.',
      },
    ],
    exemplo: {
      enunciado: '3 · 2ˣ = 21',
      passos: [
        { descricao: 'Isolamos a potência.', tex: '2^{x} = 7' },
        { descricao: 'ln dos dois lados.', tex: 'x \\ln 2 = \\ln 7' },
        {
          descricao: 'Dividindo.',
          tex: 'x = \\frac{\\ln 7}{\\ln 2} = \\frac{1{,}9459}{0{,}6931} \\approx 2{,}807',
        },
      ],
    },
    vejaTambem: ['expeq.mesma-base', 'logaritmica.propriedades'],
  },
  {
    id: 'expeq.substituicao',
    titulo: 'Trocar a potência por t',
    resumo: 'Quando aparecem a²ˣ e aˣ juntos, a equação é do 2º grau disfarçada.',
    definicao:
      'Em 4ˣ − 6·2ˣ + 8 = 0, note que 4ˣ = (2ˣ)². Chamando 2ˣ de t, fica t² − 6t + 8 = 0, ' +
      'que se resolve por soma e produto. Depois volta-se a x em cada t. Como aˣ é sempre ' +
      'positivo, um t negativo (ou zero) não gera solução — é o detalhe que mais se esquece.',
    formulas: [{ tex: 'a^{2x} = (a^{x})^{2} = t^{2} \\qquad t = a^{x} > 0' }],
    demonstracao: [
      {
        descricao: 'Reescrevemos a potência de expoente dobrado.',
        tex: 'a^{2x} = \\left(a^{x}\\right)^{2}',
      },
      {
        descricao: 'Com t = aˣ, só os t positivos voltam a x.',
        tex: 'a^{x} = t \\;\\Rightarrow\\; x = \\log_{a} t \\quad (t > 0)',
      },
    ],
    exemplo: {
      enunciado: '9ˣ − 2·3ˣ − 3 = 0',
      passos: [
        { descricao: 'Com t = 3ˣ.', tex: 't^{2} - 2t - 3 = 0' },
        { descricao: 'Soma 2, produto −3.', tex: 't = 3 \\quad \\text{ou} \\quad t = -1' },
        {
          descricao: '3ˣ = −1 não tem solução; fica 3ˣ = 3.',
          tex: 'x = 1',
        },
      ],
    },
    vejaTambem: ['expeq.mesma-base', 'equacao2.biquadrada'],
  },
  {
    id: 'expeq.dominio',
    titulo: 'Equação logarítmica e o domínio',
    resumo: 'Resolva, e depois descarte o que deixa algum logaritmo sem sentido.',
    definicao:
      'log_b(u) só existe para u > 0. Ao juntar logaritmos (log u + log v = log(u·v)), a equação ' +
      'fica mais fácil, mas o produto u·v pode ser positivo com u e v negativos — e aí aparecem ' +
      'soluções falsas. Por isso a última etapa é sempre conferir cada candidato na equação ' +
      'ORIGINAL: todo argumento de log precisa ser positivo.',
    formulas: [
      { tex: '\\log_{b} u + \\log_{b} v = \\log_{b}(uv) \\qquad u > 0,\\; v > 0' },
      { tex: '\\log_{b} u = n \\iff u = b^{n}' },
    ],
    demonstracao: [
      {
        descricao: 'A propriedade do produto vale quando cada log existe.',
        tex: 'b^{p} \\cdot b^{q} = b^{p + q} \\;\\Rightarrow\\; \\log_{b}(uv) = \\log_{b} u + \\log_{b} v',
      },
      {
        descricao: 'Mas log(uv) também existe com u e v negativos: a volta não vale sem conferir.',
        tex: 'u = v = -2 \\;\\Rightarrow\\; \\log_{2}(4) = 2, \\text{ mas } \\log_{2}(-2) \\;\\nexists',
      },
    ],
    exemplo: {
      enunciado: 'log₂ x + log₂(x + 2) = 3',
      passos: [
        { descricao: 'Juntando os logs.', tex: '\\log_{2}\\big(x(x + 2)\\big) = 3' },
        {
          descricao: 'Pela definição.',
          tex: 'x^{2} + 2x = 8 \\;\\Rightarrow\\; x = 2 \\text{ ou } x = -4',
        },
        { descricao: 'x = −4 deixaria log₂(−4): descartado.', tex: 'x = 2' },
      ],
    },
    vejaTambem: ['logaritmica.dominio', 'expeq.logaritmo'],
  },
];
