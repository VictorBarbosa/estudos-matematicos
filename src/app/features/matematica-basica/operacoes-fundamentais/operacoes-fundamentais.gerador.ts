import { No, avaliar, expressaoParaTex, numero, op, resolverExpressaoComPassos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarValorSimples } from '@core/treino/resposta-numerica/resposta-numerica';
import {
  Exercicio,
  GeradorExercicio,
  Nivel,
  SEM_FORMULA,
  semColisoes,
} from '@core/treino/models/treino.model';
import {
  CONTEXTOS_POR_NIVEL,
  Termos,
} from '@features/matematica-basica/operacoes-fundamentais/operacoes-fundamentais.contextos';

const saoIguais = (a: number, b: number): boolean => Math.abs(a - b) < 1e-9;

/**
 * Exercícios de ordem das operações.
 *
 * A armadilha central é sempre a mesma: resolver da esquerda para a direita,
 * ignorando a precedência. Ela é calculada avaliando a mesma expressão numa
 * árvore remontada linearmente — ou seja, exatamente o que o aluno faria.
 */
export const geradorOperacoes: GeradorExercicio<number> = {
  topicoId: 'operacoes-fundamentais',
  formatoResposta: 'um número, ex.: 14 ou -3',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    /*
     * Metade dos exercícios nasce de uma história.
     *
     * «Resolva 3 + 4 × 5» treina a regra; «comprei 3 cadernos de R$ 4 e paguei
     * R$ 5 de frete» treina o que a regra significa — e é a segunda que aparece
     * na vida. As duas convivem porque a conta simbólica continua sendo o
     * caminho mais curto para a fluência, e a história é a que faz a regra
     * valer alguma coisa.
     */
    const comHistoria = rng.booleano(0.55);

    return comHistoria ? exercicioComHistoria(nivel, rng) : exercicioSimbolico(nivel, rng);
  },

  analisar: analisarValorSimples,

  saoEquivalentes: saoIguais,
  formatar: (valor) =>
    Number(valor.toFixed(6)).toLocaleString('pt-BR', { maximumFractionDigits: 6 }),
};

/**
 * A conta escrita como expressão, sem contexto.
 *
 * A fórmula ao lado do enunciado é a própria pergunta: não há o que montar,
 * só a ordem a respeitar.
 */
function exercicioSimbolico(nivel: Nivel, rng: Rng): Exercicio<number> {
  const { arvore, termos } = sortearExpressao(nivel, rng);

  const resolucao = resolverExpressaoComPassos(arvore);
  const gabarito = resolucao.resultado;

  return {
    id: `operacoes-simbolico-${nivel}-${rng.inteiro(0, 99999)}`,
    nivel,
    enunciado: 'Resolva respeitando a ordem das operações.',
    traducoes: {
      fr: {
        enunciado: 'Calculez en respectant l’ordre des opérations.',
        dica: 'Que faut-il calculer en premier dans cette expression ?',
      },
      en: {
        enunciado: 'Evaluate, respecting the order of operations.',
        dica: 'What has to be computed first in this expression?',
      },
    },
    enunciadoTex: `${expressaoParaTex(arvore)} = \\;?`,
    gabarito,
    resolucao,
    conceitos: ['operacoes.ordem', 'operacoes.sinais'],
    armadilhas: semColisoes([armadilhaDaLeituraLinear(termos, gabarito)], gabarito, saoIguais),
    dica: nivel === 'facil' ? 'O que deve ser resolvido primeiro nessa expressão?' : undefined,
  };
}

/**
 * A conta escondida numa situação real.
 *
 * O enunciado NÃO mostra a expressão: montá-la é metade do exercício, e é
 * justamente a parte em que a precedência deixa de ser um regulamento e passa
 * a ser a descrição de uma situação. A conta aparece na resolução, depois da
 * resposta, que é quando ela ensina.
 */
function exercicioComHistoria(nivel: Nivel, rng: Rng): Exercicio<number> {
  const contexto = rng.escolher(CONTEXTOS_POR_NIVEL[nivel])(rng, nivel);

  const resolucao = resolverExpressaoComPassos(contexto.arvore);
  const gabarito = resolucao.resultado;

  return {
    id: `operacoes-historia-${nivel}-${rng.inteiro(0, 99999)}`,
    nivel,
    enunciado: contexto.texto.enunciado,
    traducoes: contexto.texto.traducoes,
    dica:
      contexto.texto.dica ??
      'Escreva a conta que a situação descreve, respeitando o que se repete e o que é cobrado ' +
        'uma vez só, e resolva na ordem das operações.',
    enunciadoTex: SEM_FORMULA,
    gabarito,
    resolucao,
    conceitos: ['operacoes.ordem', 'operacoes.sinais'],
    armadilhas: semColisoes(
      [armadilhaDaLeituraLinear(contexto.termos, gabarito)],
      gabarito,
      saoIguais,
    ),
  };
}

/**
 * O erro de quem lê a conta na ordem em que ela foi escrita.
 *
 * Calculado de verdade — avaliando a mesma árvore numa leitura linear —, e não
 * somando dois a mais: o diagnóstico só aparece quando o aluno chega ao valor
 * que essa leitura produz.
 */
function armadilhaDaLeituraLinear(termos: Termos, gabarito: number) {
  return {
    resposta: avaliarLinearmente(termos),
    diagnostico:
      'Você resolveu da esquerda para a direita, na ordem em que a conta aparece. ' +
      'Multiplicação, divisão e potências têm prioridade sobre adição e subtração, ' +
      'independentemente da posição em que estão escritas.',
    diagnosticoTraducoes: {
      fr:
        'Vous avez calculé de gauche à droite, dans l’ordre d’écriture. La multiplication, la ' +
        'division et les puissances passent avant l’addition et la soustraction, quelle que ' +
        'soit leur position.',
      en:
        'You computed left to right, in the order written. Multiplication, division and powers ' +
        'come before addition and subtraction, whatever their position.',
    },
    passo: 1,
    conceito: 'operacoes.ordem',
  } as const;
}

/** Um termo da expressão, guardado na ordem em que foi escrito. */
interface Termo {
  readonly operador: '+' | '-' | '*' | '/';
  readonly valor: No;
}

interface ExpressaoSorteada {
  readonly arvore: No;
  /** Primeiro valor e a sequência de operações, para simular a leitura linear. */
  readonly termos: { readonly inicial: No; readonly seguintes: readonly Termo[] };
}

function sortearExpressao(nivel: Nivel, rng: Rng): ExpressaoSorteada {
  const pequeno = (): number => rng.inteiro(2, 9);

  if (nivel === 'facil') {
    // a + b × c — o caso mínimo em que a precedência muda o resultado.
    const [a, b, c] = [pequeno(), pequeno(), pequeno()];
    const operador = rng.booleano() ? '+' : '-';
    const arvore = op(operador, numero(a), op('*', numero(b), numero(c)));

    return {
      arvore,
      termos: {
        inicial: numero(a),
        seguintes: [
          { operador, valor: numero(b) },
          { operador: '*', valor: numero(c) },
        ],
      },
    };
  }

  if (nivel === 'medio') {
    // a + b × c - d, ou com parênteses conduzindo a outra leitura.
    const [a, b, c, d] = [pequeno(), pequeno(), pequeno(), pequeno()];

    if (rng.booleano()) {
      const arvore = op('-', op('+', numero(a), op('*', numero(b), numero(c))), numero(d));
      return {
        arvore,
        termos: {
          inicial: numero(a),
          seguintes: [
            { operador: '+', valor: numero(b) },
            { operador: '*', valor: numero(c) },
            { operador: '-', valor: numero(d) },
          ],
        },
      };
    }

    const arvore = op('*', op('+', numero(a), numero(b)), numero(c));
    return {
      arvore,
      termos: {
        inicial: numero(a),
        seguintes: [
          { operador: '+', valor: numero(b) },
          { operador: '*', valor: numero(c) },
        ],
      },
    };
  }

  // Difícil: potência e parênteses na mesma expressão.
  const [a, b, c, d] = [pequeno(), rng.inteiro(2, 6), rng.inteiro(1, 4), pequeno()];
  const potencia = op('^', op('-', numero(b), numero(c)), numero(2));
  const arvore = op('+', numero(a), op('*', numero(d), potencia));

  return {
    arvore,
    termos: {
      inicial: numero(a),
      seguintes: [
        { operador: '+', valor: numero(d) },
        { operador: '*', valor: potencia },
      ],
    },
  };
}

/**
 * Avalia ignorando a precedência, como quem lê a conta da esquerda para a
 * direita. É exatamente o erro que a armadilha quer reconhecer.
 */
function avaliarLinearmente({ inicial, seguintes }: Termos): number {
  return seguintes.reduce((acumulado, termo) => {
    const valor = avaliar(termo.valor);
    switch (termo.operador) {
      case '+':
        return acumulado + valor;
      case '-':
        return acumulado - valor;
      case '*':
        return acumulado * valor;
      case '/':
        return valor === 0 ? acumulado : acumulado / valor;
      // Ler da esquerda para a direita também trata a potência assim: aplica
      // ao acumulado, em vez de respeitar a base inteira.
      case '^':
        return acumulado ** valor;
    }
  }, avaliar(inicial));
}
