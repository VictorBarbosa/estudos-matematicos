import { comporComPassos, inverterComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_COMPOSICAO: readonly Teoria[] = [
  {
    id: 'composicao.encadear',
    titulo: 'Compor é encadear',
    resumo: 'A saída de uma função vira a entrada da outra.',
    definicao:
      'Em f(g(x)), primeiro aplica-se g, e o resultado entra em f. A ordem de leitura é de ' +
      'dentro para fora, ao contrário da ordem em que se escreve — e é justamente aí que ' +
      'mora a confusão mais comum do tema.',
    formulas: [
      { tex: '(f \\circ g)(x) = f(g(x))', legenda: 'Lê-se "f composta com g".' },
      { tex: 'f \\circ g \\neq g \\circ f', legenda: 'Em geral a ordem importa.' },
    ],
    demonstracao: [
      {
        descricao: 'Aplicamos a função de dentro primeiro.',
        tex: 'x \;\\longrightarrow\; \\boxed{g} \;\\longrightarrow\; g(x) \;\\longrightarrow\; \\boxed{f} \;\\longrightarrow\; f(g(x))',
      },
      {
        descricao: 'Com f(x) = 2x e g(x) = x + 3, compondo numa ordem.',
        tex: 'f(g(x)) = 2(x + 3) = 2x + 6',
      },
      {
        descricao: 'E na outra ordem o resultado é diferente.',
        tex: 'g(f(x)) = 2x + 3',
        nota: 'Somar antes de dobrar não é o mesmo que dobrar antes de somar.',
      },
    ],
    exemplo: {
      enunciado: 'Compondo f(x) = 2x + 1 com g(x) = x − 3.',
      passos: comporComPassos({ a: 2, b: 1 }, { a: 1, b: -3 }).passos,
    },
    vejaTambem: ['composicao.inversa', 'composicao.reflexo'],
  },
  {
    id: 'composicao.inversa',
    titulo: 'A função inversa',
    resumo: 'Desfaz o que a função fez.',
    definicao:
      'A inversa f⁻¹ é a função que desfaz f: aplicando as duas em sequência, volta-se ao ' +
      'valor original. Para encontrá-la, isola-se x na equação y = f(x) e depois trocam-se ' +
      'os nomes das variáveis.',
    formulas: [
      { tex: 'f^{-1}(f(x)) = x \\qquad f(f^{-1}(x)) = x' },
      { tex: 'f^{-1} \\neq \\frac{1}{f}', legenda: 'O expoente −1 aqui NÃO significa inverso multiplicativo.' },
    ],
    demonstracao: [
      {
        descricao: 'Partimos de y = f(x) e isolamos x.',
        tex: 'y = 2x + 1 \;\\Rightarrow\; x = \\frac{y - 1}{2}',
      },
      {
        descricao: 'Trocamos os nomes, por convenção de escrever a entrada como x.',
        tex: 'f^{-1}(x) = \\frac{x - 1}{2}',
      },
      {
        descricao: 'Conferindo: compor as duas devolve o próprio x.',
        tex: 'f^{-1}(f(x)) = \\frac{(2x + 1) - 1}{2} = x \;\\checkmark',
        nota: 'Essa verificação é a definição de inversa, não um extra.',
      },
      {
        descricao: 'Cada operação é desfeita na ordem contrária.',
        tex: '\\text{dobrar, somar 1} \;\\longrightarrow\; \\text{subtrair 1, dividir por 2}',
      },
    ],
    exemplo: {
      enunciado: 'Invertendo f(x) = 3x − 6.',
      passos: inverterComPassos({ a: 3, b: -6 }).passos,
    },
    vejaTambem: ['composicao.encadear', 'composicao.reflexo'],
  },
  {
    id: 'composicao.reflexo',
    titulo: 'O gráfico da inversa',
    resumo: 'É o reflexo do original na reta y = x.',
    definicao:
      'Inverter uma função troca os papéis de entrada e saída. No gráfico, isso corresponde ' +
      'a trocar as coordenadas de cada ponto — e trocar x com y é exatamente refletir na ' +
      'reta y = x. Só funções que nunca repetem valores têm inversa.',
    formulas: [
      { tex: '(a, b) \\in f \\iff (b, a) \\in f^{-1}' },
      { tex: '\\text{tem inversa} \\iff \\text{é injetora}' },
    ],
    demonstracao: [
      {
        descricao: 'Se f leva a até b, a inversa leva b de volta a a.',
        tex: 'f(a) = b \\iff f^{-1}(b) = a',
      },
      {
        descricao: 'Trocar as coordenadas de um ponto é refleti-lo na reta y = x.',
        tex: '(a, b) \;\\longleftrightarrow\; (b, a)',
      },
      {
        descricao: 'Se duas entradas dessem a mesma saída, a volta seria ambígua.',
        tex: 'f(2) = f(-2) = 4 \;\\Rightarrow\; f^{-1}(4) = ?',
        nota: 'Por isso x² só tem inversa se restringirmos o domínio a x ≥ 0.',
      },
    ],
    exemplo: {
      enunciado: 'Invertendo f(x) = −2x + 4.',
      passos: inverterComPassos({ a: -2, b: 4 }).passos,
    },
    vejaTambem: ['composicao.inversa', 'logaritmica.definicao'],
  },
];
