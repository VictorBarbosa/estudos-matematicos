import { Teoria } from '@core/teoria/models/teoria.model';
import {
  inteirosNoIntervaloComPassos,
  operacaoDeConjuntoComPassos,
  somatorioComPassos,
} from '@core/math';

export const TEORIA_NOTACAO: readonly Teoria[] = [
  {
    id: 'notacao.leitura',
    titulo: 'Ler uma expressão em voz alta',
    resumo: 'O símbolo que não se sabe dizer é o símbolo que não se usa para pensar.',
    definicao:
      'Notação matemática é linguagem escrita, e como toda linguagem ela se aprende lendo em ' +
      'voz alta. Quem lê "para todo x pertencente aos reais, x ao quadrado é maior ou igual a ' +
      'zero" entende a frase; quem vê um amontoado de desenhos, não. A regra prática é esta: ' +
      'antes de resolver, diga a expressão em palavras. Se não sair uma frase, o problema não ' +
      'é de conta — é de leitura.',
    formulas: [
      {
        tex: '\\forall x \\in \\mathbb{R},\\ x^2 \\geq 0',
        legenda: 'Para todo x real, x ao quadrado é maior ou igual a zero.',
      },
      {
        tex: '\\exists n \\in \\mathbb{N},\\ n > 5',
        legenda: 'Existe um natural maior que cinco.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Cada símbolo é uma palavra: leia da esquerda para a direita.',
        tex: 'f: \\mathbb{R} \\to \\mathbb{R}',
        nota: '"f de erre em erre" — f recebe um real e devolve um real.',
      },
      {
        descricao: 'Os dois-pontos e a vírgula separam o que se diz do que se afirma.',
        tex: '\\forall x \\in \\mathbb{R},\\ x^2 \\geq 0',
        nota: 'Antes da vírgula, de quem se fala; depois, o que se afirma sobre ele.',
      },
    ],
    vejaTambem: ['notacao.quantificadores', 'notacao.conjuntos', 'notacao.escrita'],
  },
  {
    id: 'notacao.escrita',
    titulo: 'Escrever o que se quer dizer',
    resumo: 'Traduzir a frase em símbolos é o que separa entender de reconhecer.',
    definicao:
      'Ler notação e escrever notação são habilidades diferentes, e a segunda é a que revela ' +
      'se a primeira é real. Reconhecer ∀ numa página é fácil; decidir que a frase "todo ' +
      'quadrado é não negativo" pede ∀, ∈ e ≥, nessa ordem, exige saber o que cada símbolo ' +
      'faz. Comece identificando o quantificador, depois o conjunto, depois a afirmação.',
    formulas: [
      {
        tex: '\\text{"existe um inteiro maior que 7"} \\;\\Rightarrow\\; \\exists n \\in \\mathbb{Z},\\ n > 7',
        legenda: 'Quantificador, conjunto, afirmação — sempre nessa ordem.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Primeiro o quantificador: "todo" é ∀, "existe" ou "algum" é ∃.',
        tex: '\\text{todo} \\to \\forall \\qquad \\text{existe} \\to \\exists',
      },
      {
        descricao: 'Depois onde a variável mora.',
        tex: 'x \\in \\mathbb{R} \\qquad n \\in \\mathbb{N} \\qquad k \\in \\mathbb{Z}',
      },
      {
        descricao: 'Por fim o que se afirma, depois da vírgula.',
        tex: '\\forall x \\in \\mathbb{R},\\ x^2 \\geq 0',
        nota: 'Dois-pontos no lugar da vírgula também é escrita corrente.',
      },
    ],
    vejaTambem: ['notacao.leitura', 'notacao.quantificadores'],
  },
  {
    id: 'notacao.conjuntos',
    titulo: 'Pertencer e estar contido',
    resumo: '∈ liga elemento a conjunto; ⊂ liga conjunto a conjunto.',
    definicao:
      'É o erro mais comum do assunto, e ele não é de distração: 3 ∈ ℕ está certo porque 3 é ' +
      'um elemento, e {3} ⊂ ℕ está certo porque {3} é um conjunto. Trocar um pelo outro muda ' +
      'o tipo do que se está afirmando. As operações entre conjuntos seguem a mesma lógica: ' +
      'união junta tudo, interseção guarda só o comum, e a diferença tira de A o que está em B.',
    formulas: [
      { tex: '3 \\in \\mathbb{N} \\qquad \\{3\\} \\subset \\mathbb{N}', legenda: 'Elemento e subconjunto.' },
      {
        tex: '\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}',
        legenda: 'Cada conjunto numérico cabe dentro do seguinte.',
      },
    ],
    demonstracao: [
      {
        descricao: 'A união junta, sem repetir.',
        tex: '\\{1,2\\} \\cup \\{2,3\\} = \\{1,2,3\\}',
        nota: 'O 2 aparece uma vez só: num conjunto não há repetição.',
      },
      {
        descricao: 'A interseção guarda só o que está nos dois.',
        tex: '\\{1,2\\} \\cap \\{2,3\\} = \\{2\\}',
      },
      {
        descricao: 'As barras em volta de um conjunto pedem quantos elementos ele tem.',
        tex: '\\left|\\{1,2,3\\}\\right| = 3',
      },
    ],
    exemplo: {
      enunciado: 'A interseção de {1, 3, 5, 7} com {3, 4, 5}.',
      passos: operacaoDeConjuntoComPassos([1, 3, 5, 7], [3, 4, 5], 'intersecao').passos,
    },
    vejaTambem: ['notacao.leitura', 'notacao.intervalos'],
  },
  {
    id: 'notacao.quantificadores',
    titulo: 'Para todo e existe',
    resumo: '∀ exige de todos; ∃ basta um.',
    definicao:
      '∀ e ∃ dizem de quantos elementos a afirmação vale, e trocá-los inverte o sentido da ' +
      'frase. "∀x ∈ ℝ, x² ≥ 0" é verdadeiro — não há real cujo quadrado seja negativo. ' +
      '"∃x ∈ ℝ, x² < 0" é falso, porque nenhum serve. Para derrubar um ∀ basta um ' +
      'contraexemplo; para provar um ∃ basta um exemplo.',
    formulas: [
      { tex: '\\forall x \\in \\mathbb{R},\\ x^2 \\geq 0', legenda: 'Vale para todos, sem exceção.' },
      { tex: '\\exists n \\in \\mathbb{N},\\ n > 10^6', legenda: 'Basta exibir um.' },
    ],
    demonstracao: [
      {
        descricao: 'Negar um "para todo" produz um "existe".',
        tex: '\\lnot(\\forall x,\\ P(x)) \\;\\Leftrightarrow\\; \\exists x,\\ \\lnot P(x)',
        nota: 'Se não vale para todos, é porque algum escapa.',
      },
      {
        descricao: 'E negar um "existe" produz um "para todo".',
        tex: '\\lnot(\\exists x,\\ P(x)) \\;\\Leftrightarrow\\; \\forall x,\\ \\lnot P(x)',
      },
    ],
    vejaTambem: ['notacao.escrita', 'notacao.leitura'],
  },
  {
    id: 'notacao.intervalos',
    titulo: 'Colchete inclui, parêntese não',
    resumo: 'A diferença entre [2, 5] e [2, 5) é um número inteiro.',
    definicao:
      'Um intervalo é um pedaço da reta, e o desenho da ponta diz se o extremo entra. ' +
      'Colchete inclui, parêntese exclui — e os dois se misturam na mesma expressão: [2, 5) ' +
      'contém o 2 e não contém o 5. O infinito nunca leva colchete, porque não é um número ' +
      'que se possa incluir.',
    formulas: [
      { tex: '[2,\\, 5] = \\{x \\in \\mathbb{R} : 2 \\leq x \\leq 5\\}', legenda: 'Fechado nos dois lados.' },
      { tex: '(2,\\, 5] = \\{x \\in \\mathbb{R} : 2 < x \\leq 5\\}', legenda: 'Aberto à esquerda.' },
      { tex: '[2,\\, +\\infty)', legenda: 'De 2 em diante; o infinito nunca é incluído.' },
    ],
    demonstracao: [
      {
        descricao: 'Os inteiros de [2, 5] são quatro.',
        tex: '\\{2, 3, 4, 5\\}',
      },
      {
        descricao: 'Trocar um colchete por parêntese derruba um deles.',
        tex: '[2,\\, 5) \\;\\Rightarrow\\; \\{2, 3, 4\\}',
      },
    ],
    exemplo: {
      enunciado: 'Quantos inteiros há em (−3, 4]?',
      passos: inteirosNoIntervaloComPassos({
        de: -3,
        ate: 4,
        fechadoEsquerda: false,
        fechadoDireita: true,
      }).passos,
    },
    vejaTambem: ['notacao.conjuntos', 'notacao.leitura'],
  },
  {
    id: 'notacao.somatorio',
    titulo: 'Somatório',
    resumo: 'Um sigma é uma soma escrita de forma compacta.',
    definicao:
      'O sigma maiúsculo manda somar. Embaixo dele vai o índice e onde ele começa; em cima, ' +
      'onde ele para; à direita, o termo a somar, escrito em função do índice. Expandir é ' +
      'sempre o primeiro passo: escrever as parcelas uma a uma transforma o símbolo em conta, ' +
      'e é nessa expansão que o erro aparece.',
    formulas: [
      {
        tex: '\\sum_{k=1}^{n} a_k = a_1 + a_2 + \\cdots + a_n',
        legenda: 'O índice k percorre de 1 até n.',
      },
      {
        tex: '\\sum_{k=1}^{4} k^2 = 1 + 4 + 9 + 16 = 30',
        legenda: 'Trocar k pelo valor, somar.',
      },
    ],
    demonstracao: [
      {
        descricao: 'O número em cima diz onde parar, não o que somar.',
        tex: '\\sum_{k=1}^{4} k^2 \\neq 16',
        nota: 'O erro mais comum é responder só o último termo.',
      },
      {
        descricao: 'O pi maiúsculo tem o mesmo arranjo, mas multiplica.',
        tex: '\\prod_{k=1}^{4} k = 1 \\cdot 2 \\cdot 3 \\cdot 4 = 24',
      },
    ],
    exemplo: {
      enunciado: 'O somatório dos quadrados de 1 a 5.',
      passos: somatorioComPassos(1, 5, (k) => k * k, (k) => `${k}^2`, 'k^2').passos,
    },
    vejaTambem: ['notacao.produtorio', 'notacao.leitura'],
  },
  {
    id: 'notacao.produtorio',
    titulo: 'Produtório',
    resumo: 'O mesmo arranjo do somatório, multiplicando.',
    definicao:
      'O pi maiúsculo é para a multiplicação o que o sigma é para a soma: mesmos índices, ' +
      'mesma leitura, operação diferente. O fatorial é o caso mais conhecido dele — n! é o ' +
      'produtório de k de 1 até n.',
    formulas: [
      { tex: '\\prod_{k=1}^{n} a_k = a_1 \\cdot a_2 \\cdots a_n', legenda: 'Produto dos termos.' },
      { tex: 'n! = \\prod_{k=1}^{n} k', legenda: 'O fatorial escrito como produtório.' },
    ],
    demonstracao: [
      {
        descricao: 'Expandir também é o primeiro passo aqui.',
        tex: '\\prod_{k=1}^{4} k = 1 \\cdot 2 \\cdot 3 \\cdot 4 = 24',
      },
      {
        descricao: 'Um fator igual a zero zera o produto inteiro.',
        tex: '\\prod_{k=0}^{3} k = 0',
        nota: 'Na soma um zero não muda nada; no produto, muda tudo.',
      },
    ],
    vejaTambem: ['notacao.somatorio', 'notacao.modulo'],
  },
  {
    id: 'notacao.modulo',
    titulo: 'Módulo e fatorial',
    resumo: 'Barras são distância; a exclamação é produto.',
    definicao:
      'As barras em volta de um número pedem a distância dele até zero, e por isso o ' +
      'resultado nunca é negativo: |−7| = 7. Em volta de um conjunto, as mesmas barras pedem ' +
      'outra coisa — quantos elementos ele tem. A exclamação depois de um natural pede o ' +
      'produto de todos os naturais até ele.',
    formulas: [
      { tex: '|x| = \\begin{cases} x & \\text{se } x \\geq 0 \\\\ -x & \\text{se } x < 0 \\end{cases}' },
      { tex: 'n! = n \\cdot (n-1) \\cdots 2 \\cdot 1 \\qquad 0! = 1' },
    ],
    demonstracao: [
      {
        descricao: 'O módulo tira o sinal, não subtrai.',
        tex: '|-7| = 7 \\qquad |7| = 7',
      },
      {
        descricao: 'As barras abraçam tudo o que está dentro.',
        tex: '|x - 3| \\neq |x| - 3',
        nota: 'Em x = 1: o primeiro vale 2, o segundo vale −2.',
      },
      {
        descricao: 'O fatorial cresce depressa.',
        tex: '5! = 120 \\qquad 10! = 3\\,628\\,800',
      },
    ],
    vejaTambem: ['notacao.produtorio', 'notacao.leitura'],
  },
  {
    id: 'notacao.funcoes',
    titulo: 'A assinatura de uma função',
    resumo: 'f: A → B diz o que entra e o que sai, não como calcular.',
    definicao:
      'A assinatura e a regra são duas coisas. "f: ℝ → ℝ" diz que f recebe um real e devolve ' +
      'um real — é o tipo da função. "f(x) = 2x + 1" diz o que ela faz. Separar as duas é o ' +
      'que permite falar de uma função antes de saber a fórmula dela, que é como o Cálculo ' +
      'trabalha o tempo todo.',
    formulas: [
      { tex: 'f: \\mathbb{R} \\to \\mathbb{R}, \\quad f(x) = 2x + 1', legenda: 'Assinatura e regra.' },
      { tex: 'f(3) = 2 \\cdot 3 + 1 = 7', legenda: 'Aplicar é trocar x pelo valor.' },
    ],
    demonstracao: [
      {
        descricao: 'O domínio pode ser menor que ℝ, e a assinatura diz isso.',
        tex: 'g: [0, +\\infty) \\to \\mathbb{R}, \\quad g(x) = \\sqrt{x}',
        nota: 'A raiz não aceita negativo, e a assinatura avisa antes da conta.',
      },
      {
        descricao: 'Escrever 2x é multiplicar, nunca somar.',
        tex: '2x = 2 \\cdot x \\neq 2 + x',
      },
    ],
    vejaTambem: ['notacao.leitura', 'notacao.conjuntos'],
  },
];
