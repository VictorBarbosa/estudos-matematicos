import { limiteComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_LIMITES: readonly Teoria[] = [
  {
    id: 'limites.propriedades',
    titulo: 'Propriedades operatórias',
    resumo: 'O limite distribui sobre soma, produto e quociente.',
    definicao:
      'Limites se comportam bem com as operações: o limite de uma soma é a soma dos limites, ' +
      'e assim por diante. A única ressalva é o quociente, que exige denominador com limite ' +
      'diferente de zero.',
    formulas: [
      { tex: '\\lim (f \\pm g) = \\lim f \\pm \\lim g' },
      { tex: '\\lim (f \\cdot g) = \\lim f \\cdot \\lim g' },
      { tex: '\\lim \\frac{f}{g} = \\frac{\\lim f}{\\lim g}, \\quad \\lim g \\neq 0' },
    ],
    demonstracao: [
      {
        descricao: 'Se f se aproxima de L e g de M, a soma se aproxima de L + M.',
        tex: 'f \\to L,\\; g \\to M \\;\\Rightarrow\\; f + g \\to L + M',
      },
      {
        descricao: 'Isso permite quebrar limites complicados em partes simples.',
        tex: '\\lim_{x \\to 2}(x^{2} + 3x) = \\lim x^{2} + 3\\lim x = 4 + 6 = 10',
      },
      {
        descricao: 'No quociente, limite nulo no denominador quebra a regra.',
        tex: '\\lim g = 0 \\;\\Rightarrow\\; \\text{a propriedade não se aplica}',
        nota: 'É justamente aí que aparecem as indeterminações interessantes.',
      },
    ],
    exemplo: {
      enunciado: 'Um limite que se resolve por substituição direta.',
      passos: limiteComPassos((x) => x * x + 3 * x, 2, 'x^{2} + 3x').passos,
    },
    vejaTambem: ['limites.tecnicas', 'limites.notaveis'],
  },
  {
    id: 'limites.tecnicas',
    titulo: 'Técnicas para indeterminações',
    resumo: 'Fatorar, racionalizar ou dividir pela maior potência.',
    definicao:
      'Quando a substituição direta dá 0/0 ou ∞/∞, é preciso reescrever a expressão. Três ' +
      'manobras resolvem a maioria dos casos: fatorar e cancelar, multiplicar pelo conjugado ' +
      'e dividir tudo pela maior potência.',
    formulas: [
      { tex: '\\frac{x^{2}-a^{2}}{x-a} = x + a', legenda: 'Fatoração.' },
      { tex: '\\frac{\\sqrt{x}-\\sqrt{a}}{x-a} \\cdot \\frac{\\sqrt{x}+\\sqrt{a}}{\\sqrt{x}+\\sqrt{a}}', legenda: 'Conjugado.' },
    ],
    demonstracao: [
      {
        descricao: 'Na indeterminação 0/0, numerador e denominador têm um fator comum.',
        tex: '\\frac{(x-a) \\cdot g(x)}{(x-a) \\cdot h(x)}',
      },
      {
        descricao: 'Cancelar esse fator é legítimo, porque x nunca é exatamente a.',
        tex: '= \\frac{g(x)}{h(x)}',
      },
      {
        descricao: 'Com raízes, o conjugado transforma a diferença numa diferença de quadrados.',
        tex: '(\\sqrt{x}-\\sqrt{a})(\\sqrt{x}+\\sqrt{a}) = x - a',
        nota: 'O fator problemático aparece e pode ser cancelado.',
      },
      {
        descricao: 'Em ∞/∞, dividir pela maior potência faz os termos menores sumirem.',
        tex: '\\frac{3x^{2}+x}{x^{2}-5} = \\frac{3 + \\frac{1}{x}}{1 - \\frac{5}{x^{2}}} \\to 3',
      },
    ],
    exemplo: {
      enunciado: 'Uma indeterminação resolvida por fatoração.',
      passos: limiteComPassos((x) => (x * x - 9) / (x - 3), 3, '\\frac{x^{2}-9}{x-3}').passos,
    },
    vejaTambem: ['limites.propriedades', 'limites.notaveis'],
  },
  {
    id: 'limites.notaveis',
    titulo: 'O limite trigonométrico fundamental',
    resumo: 'sen(x)/x tende a 1 quando x tende a zero.',
    definicao:
      'Esse limite é a base de toda a derivação trigonométrica. Ele diz que, para ângulos ' +
      'pequenos, o seno é praticamente igual ao próprio ângulo — desde que medido em ' +
      'radianos.',
    formulas: [
      { tex: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1' },
      { tex: '\\lim_{x \\to 0} \\frac{1 - \\cos x}{x} = 0' },
    ],
    demonstracao: [
      {
        descricao: 'No círculo de raio 1, compara-se o arco com o seno e com a tangente.',
        tex: '\\sin x < x < \\tan x \\quad (0 < x < \\tfrac{\\pi}{2})',
      },
      {
        descricao: 'Dividindo tudo por sen x e invertendo as desigualdades.',
        tex: '\\cos x < \\frac{\\sin x}{x} < 1',
      },
      {
        descricao: 'Como cos x tende a 1, a expressão fica espremida entre dois valores que convergem.',
        tex: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1',
        nota: 'É o teorema do confronto: se os vizinhos convergem para 1, ela também converge.',
      },
      {
        descricao: 'Só vale em radianos: em graus o fator de conversão estragaria o limite.',
        tex: '\\frac{\\sin(1°)}{1°} \\neq 1',
      },
    ],
    exemplo: {
      enunciado: 'Verificando numericamente sen(x)/x perto de zero.',
      passos: limiteComPassos((x) => Math.sin(x) / x, 0, '\\frac{\\sin x}{x}').passos,
    },
    vejaTambem: ['limites.tecnicas', 'limite.intuicao'],
  },
];
