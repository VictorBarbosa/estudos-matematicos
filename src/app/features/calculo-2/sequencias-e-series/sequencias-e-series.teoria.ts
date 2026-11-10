import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_SEQUENCIAS: readonly Teoria[] = [
  {
    id: 'series.termo-geral',
    titulo: 'O teste do termo geral',
    resumo: 'Se aₙ não vai a zero, a série diverge. Se vai, o teste não diz nada.',
    definicao:
      'Uma série Σ aₙ é a sequência das somas parciais Sₙ = a₁ + … + aₙ; ela converge quando Sₙ ' +
      'tende a um número. Se aₙ não tende a zero, cada parcela nova empurra a soma por um valor ' +
      'que não some, e Sₙ não se acomoda: a série diverge. A volta é falsa: a harmônica Σ 1/n tem ' +
      'termo indo a zero e mesmo assim diverge. Por isso este teste só serve para provar divergência.',
    formulas: [
      { tex: '\\lim_{n \\to \\infty} a_n \\neq 0 \\;\\Rightarrow\\; \\sum a_n \\text{ diverge}' },
      {
        tex: '\\lim_{n \\to \\infty} a_n = 0 \\;\\Rightarrow\\; \\text{nada se conclui}',
        legenda: 'É condição necessária, não suficiente.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Cada termo é a diferença de duas somas parciais seguidas.',
        tex: 'a_n = S_n - S_{n-1}',
      },
      {
        descricao:
          'Se a série converge para S, as duas somas tendem a S e a diferença tende a zero.',
        tex: 'a_n \\to S - S = 0',
        nota: 'Logo, termo que não vai a zero é incompatível com convergência.',
      },
    ],
    exemplo: {
      enunciado: 'Σ (3n + 1)/(2n + 5).',
      passos: [
        {
          descricao: 'Para n grande, só os termos de maior grau.',
          tex: '\\frac{3n + 1}{2n + 5} \\to \\frac{3}{2}',
        },
        { descricao: 'O limite não é zero: diverge.', tex: '\\frac{3}{2} \\neq 0' },
      ],
    },
    vejaTambem: ['series.p-serie', 'series.comparacao'],
  },
  {
    id: 'series.p-serie',
    titulo: 'A p-série',
    resumo: 'Σ 1/nᵖ converge se, e só se, p > 1.',
    definicao:
      'As p-séries são a régua com que se medem as outras. Com p > 1 os termos caem rápido o ' +
      'bastante para a soma ficar limitada; com p ≤ 1, não. O caso p = 1 é a série harmônica, que ' +
      'diverge — devagar, mas sem limite. Junto com a geométrica (que converge quando |r| < 1), é ' +
      'com elas que se compara quase tudo.',
    formulas: [
      { tex: '\\sum_{n=1}^{\\infty} \\frac{1}{n^{p}} \\text{ converge} \\iff p > 1' },
      { tex: '\\sum_{n=1}^{\\infty} \\frac{1}{n^{2}} = \\frac{\\pi^{2}}{6}', legenda: 'Euler.' },
    ],
    demonstracao: [
      {
        descricao: 'A soma fica entre áreas sob a curva y = 1/xᵖ: é o teste da integral.',
        tex: '\\int_{1}^{\\infty} \\frac{dx}{x^{p}} = \\left[\\frac{x^{1-p}}{1-p}\\right]_{1}^{\\infty}',
      },
      {
        descricao: 'A integral é finita exatamente quando p > 1 (o expoente 1 − p é negativo).',
        tex: 'p > 1: \\;\\frac{1}{p - 1} \\qquad p \\leq 1: \\;\\infty',
      },
    ],
    exemplo: {
      enunciado: 'Σ 1/(n√n).',
      passos: [
        {
          descricao: 'n√n = n elevado a 1,5.',
          tex: '\\frac{1}{n\\sqrt{n}} = \\frac{1}{n^{1{,}5}}',
        },
        { descricao: 'p = 1,5 > 1: converge.', tex: 'p = 1{,}5 > 1' },
      ],
    },
    vejaTambem: ['series.comparacao', 'series.termo-geral'],
  },
  {
    id: 'series.comparacao',
    titulo: 'Comparação',
    resumo: 'Para n grande, fique com o que domina e compare com uma série conhecida.',
    definicao:
      'Se 0 ≤ aₙ ≤ bₙ e Σ bₙ converge, Σ aₙ também converge; se aₙ ≥ bₙ ≥ 0 e Σ bₙ diverge, Σ aₙ ' +
      'também diverge. Na prática usa-se a comparação no limite: se aₙ/bₙ tende a um número ' +
      'positivo, as duas séries têm o mesmo destino. Isso permite desprezar constantes somadas — ' +
      '1/(n² + 7) se comporta como 1/n², e 1/(n + 7) como 1/n.',
    formulas: [
      {
        tex: '0 \\leq a_n \\leq b_n,\\; \\sum b_n < \\infty \\;\\Rightarrow\\; \\sum a_n < \\infty',
      },
      {
        tex: '\\lim \\frac{a_n}{b_n} = c > 0 \\;\\Rightarrow\\; \\text{mesmo destino}',
        legenda: 'Comparação no limite.',
      },
    ],
    demonstracao: [
      {
        descricao: 'As somas parciais de Σ aₙ crescem e ficam abaixo das de Σ bₙ.',
        tex: 'S_n(a) \\leq S_n(b) \\leq \\sum b_n',
      },
      {
        descricao: 'Sequência crescente e limitada converge.',
        tex: 'S_n(a) \\nearrow \\;\\text{e limitada} \\;\\Rightarrow\\; \\text{converge}',
      },
    ],
    exemplo: {
      enunciado: 'Σ n/(n³ + 4).',
      passos: [
        {
          descricao: 'Para n grande.',
          tex: '\\frac{n}{n^{3} + 4} \\sim \\frac{n}{n^{3}} = \\frac{1}{n^{2}}',
        },
        {
          descricao: 'Σ 1/n² converge (p = 2): a série também.',
          tex: '\\Rightarrow \\text{converge}',
        },
      ],
    },
    vejaTambem: ['series.p-serie', 'series.razao'],
  },
  {
    id: 'series.razao',
    titulo: 'O teste da razão',
    resumo: 'L = lim |aₙ₊₁/aₙ|: L < 1 converge, L > 1 diverge, L = 1 não decide.',
    definicao:
      'Quando o termo tem potências bⁿ ou fatoriais, compare cada termo com o anterior. Se a ' +
      'razão aₙ₊₁/aₙ tende a L < 1, a série se comporta, no fim, como uma geométrica de razão ' +
      'menor que 1, e converge. Se L > 1, os termos crescem e ela diverge. Com L = 1 o teste ' +
      'cala — como em todas as p-séries.',
    formulas: [
      { tex: 'L = \\lim_{n \\to \\infty} \\left|\\frac{a_{n+1}}{a_n}\\right|' },
      {
        tex: 'L < 1 \\to \\text{converge} \\qquad L > 1 \\to \\text{diverge} \\qquad L = 1 \\to \\;?',
      },
    ],
    demonstracao: [
      {
        descricao:
          'Se L < 1, a partir de algum termo cada parcela é menor que r vezes a anterior, com L < r < 1.',
        tex: '|a_{N+k}| \\leq |a_N|\\, r^{k}',
      },
      {
        descricao: 'A cauda fica abaixo de uma geométrica convergente.',
        tex: '\\sum_{k} |a_N| r^{k} = \\frac{|a_N|}{1 - r} < \\infty',
      },
    ],
    exemplo: {
      enunciado: 'Σ 3ⁿ/n!.',
      passos: [
        {
          descricao: 'A razão entre termos seguidos.',
          tex: '\\frac{3^{n+1}}{(n+1)!} \\cdot \\frac{n!}{3^{n}} = \\frac{3}{n + 1}',
        },
        { descricao: 'Tende a 0 < 1: converge.', tex: 'L = 0' },
      ],
    },
    vejaTambem: ['series.potencias', 'series.comparacao'],
  },
  {
    id: 'series.telescopica',
    titulo: 'Séries telescópicas',
    resumo: 'Termo = diferença de vizinhos: na soma parcial, quase tudo se cancela.',
    definicao:
      'Quando o termo se escreve como bₙ − bₙ₊₁, a soma parcial desmorona como uma luneta: ' +
      'Sₙ = b₁ − bₙ₊₁. Se bₙ tende a zero, a soma da série é simplesmente b₁. As frações ' +
      'parciais são o caminho usual para chegar a essa forma.',
    formulas: [
      { tex: '\\sum_{n=1}^{N} (b_n - b_{n+1}) = b_1 - b_{N+1}' },
      { tex: '\\frac{1}{n(n+1)} = \\frac{1}{n} - \\frac{1}{n + 1}' },
    ],
    demonstracao: [
      {
        descricao: 'Escrevendo os termos lado a lado, cada −bₖ cancela o +bₖ seguinte.',
        tex: '(b_1 - b_2) + (b_2 - b_3) + \\cdots + (b_N - b_{N+1})',
      },
      { descricao: 'Sobram só as pontas.', tex: '= b_1 - b_{N+1}' },
    ],
    exemplo: {
      enunciado: 'Σ 2/((n + 1)(n + 2)), de n = 1 ao infinito.',
      passos: [
        { descricao: 'Frações parciais.', tex: '\\frac{2}{n + 1} - \\frac{2}{n + 2}' },
        { descricao: 'Soma parcial.', tex: 'S_N = \\frac{2}{2} - \\frac{2}{N + 2}' },
        { descricao: 'No limite.', tex: 'S = 1' },
      ],
    },
    vejaTambem: ['series.termo-geral'],
  },
  {
    id: 'series.alternada',
    titulo: 'Séries alternadas',
    resumo:
      'Termos que alternam o sinal, decrescem e vão a zero convergem — e o erro é o próximo termo.',
    definicao:
      'Se bₙ decresce e tende a zero, Σ (−1)ⁿ⁺¹bₙ converge (critério de Leibniz): as somas ' +
      'parciais pulam para cima e para baixo, cada vez menos, cercando o limite. Isso dá de ' +
      'brinde uma cota do erro: parar no termo N erra no máximo bₙ₊₁, o primeiro termo desprezado. ' +
      'A harmônica alternada 1 − 1/2 + 1/3 − … converge (para ln 2), embora a harmônica não.',
    formulas: [
      { tex: 'b_n \\searrow 0 \\;\\Rightarrow\\; \\sum (-1)^{n+1} b_n \\text{ converge}' },
      { tex: '|S - S_N| \\leq b_{N+1}', legenda: 'A cota do erro.' },
    ],
    demonstracao: [
      {
        descricao: 'As somas pares sobem e as ímpares descem, sempre umas abaixo das outras.',
        tex: 'S_2 \\leq S_4 \\leq \\cdots \\leq S_5 \\leq S_3 \\leq S_1',
      },
      {
        descricao:
          'A distância entre elas é um termo, que vai a zero: as duas convergem ao mesmo S.',
        tex: 'S_{2k+1} - S_{2k} = b_{2k+1} \\to 0',
      },
    ],
    exemplo: {
      enunciado: 'Quantos termos de Σ (−1)ⁿ⁺¹/n² garantem erro menor que 0,01?',
      passos: [
        {
          descricao: 'O erro é no máximo o próximo termo.',
          tex: '\\frac{1}{(N + 1)^{2}} < 0{,}01',
        },
        { descricao: 'Isolando.', tex: '(N + 1)^{2} > 100 \\;\\Rightarrow\\; N + 1 > 10' },
        { descricao: 'O menor inteiro.', tex: 'N = 10' },
      ],
    },
    vejaTambem: ['series.potencias', 'series.p-serie'],
  },
  {
    id: 'series.potencias',
    titulo: 'Séries de potências e o raio de convergência',
    resumo: 'Σ cₙ(x − a)ⁿ converge num intervalo |x − a| < R; os extremos se testam à parte.',
    definicao:
      'Uma série de potências é um polinômio infinito em torno de x = a. Pelo teste da razão, ela ' +
      'converge quando |x − a| < R, o raio de convergência, e diverge quando |x − a| > R. Nos ' +
      'extremos x = a ± R o teste dá L = 1 e não decide: substitui-se cada um e testa-se a série ' +
      'numérica que sobra. É a base das séries de Taylor, que valem justamente nesse intervalo.',
    formulas: [
      { tex: '\\sum_{n=0}^{\\infty} c_n (x - a)^{n} \\qquad |x - a| < R \\to \\text{converge}' },
      {
        tex: 'R = \\lim_{n \\to \\infty} \\left|\\frac{c_n}{c_{n+1}}\\right|',
        legenda: 'Quando o limite existe.',
      },
    ],
    demonstracao: [
      {
        descricao: 'O teste da razão com x fixo.',
        tex: '\\left|\\frac{c_{n+1}(x - a)^{n+1}}{c_n (x - a)^{n}}\\right| \\to \\frac{|x - a|}{R}',
      },
      {
        descricao: 'Converge quando isso é menor que 1.',
        tex: '\\frac{|x - a|}{R} < 1 \\iff |x - a| < R',
      },
    ],
    exemplo: {
      enunciado: 'Σ (x − 1)ⁿ/(3ⁿ·n).',
      passos: [
        {
          descricao: 'Razão.',
          tex: '\\frac{n}{n + 1} \\cdot \\frac{|x - 1|}{3} \\to \\frac{|x - 1|}{3}',
        },
        { descricao: 'Raio.', tex: '|x - 1| < 3 \\;\\Rightarrow\\; R = 3' },
        {
          descricao:
            'Extremos: em x = 4 sobra a harmônica (diverge); em x = −2, a alternada (converge).',
          tex: '[-2,\\; 4)',
        },
      ],
    },
    vejaTambem: ['series.razao', 'series.alternada', 'taylor.coeficientes'],
  },
];
