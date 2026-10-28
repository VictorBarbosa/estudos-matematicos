import { ErroMatematico, Passo, Resolucao } from '@core/math/tipos';

/**
 * Expressões aritméticas e a ordem das operações.
 *
 * A expressão é convertida numa árvore, que já carrega a precedência correta.
 * A avaliação então reduz **um nó por vez**, sempre o que a ordem das operações
 * manda resolver primeiro, reescrevendo a expressão inteira a cada etapa. É
 * assim que o aluno vê a conta encolher passo a passo, em vez de receber só o
 * número final.
 */

export type Operador = '+' | '-' | '*' | '/' | '^';

export type No =
  | { readonly tipo: 'numero'; readonly valor: number }
  | { readonly tipo: 'negativo'; readonly operando: No }
  | {
      readonly tipo: 'binario';
      readonly operador: Operador;
      readonly esquerda: No;
      readonly direita: No;
    };

const PRECEDENCIA: Readonly<Record<Operador, number>> = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  '^': 3,
};

const NOME_OPERACAO: Readonly<Record<Operador, string>> = {
  '+': 'a adição',
  '-': 'a subtração',
  '*': 'a multiplicação',
  '/': 'a divisão',
  '^': 'a potência',
};

const TEX_OPERADOR: Readonly<Record<Operador, string>> = {
  '+': '+',
  '-': '-',
  '*': '\\times',
  '/': '\\div',
  '^': '^',
};

export function numero(valor: number): No {
  return { tipo: 'numero', valor };
}

export function op(operador: Operador, esquerda: No, direita: No): No {
  return { tipo: 'binario', operador, esquerda, direita };
}

/**
 * Analisador recursivo descendente.
 *
 * A gramática codifica a precedência: soma chama produto, que chama potência,
 * que chama o fator. Por isso a árvore já nasce na ordem certa.
 */
export function analisarExpressao(texto: string): No {
  let posicao = 0;
  const entrada = texto
    .replace(/\s+/g, '')
    .replace(/,/g, '.')
    .replace(/×/g, '*')
    .replace(/÷/g, '/');

  const espiar = (): string | undefined => entrada[posicao];

  const consumir = (esperado: string): void => {
    if (entrada[posicao] !== esperado) {
      throw new ErroMatematico(`Esperava "${esperado}" na posição ${posicao}.`);
    }
    posicao++;
  };

  // soma := produto (('+' | '-') produto)*
  const soma = (): No => {
    let no = produto();
    while (espiar() === '+' || espiar() === '-') {
      const operador = entrada[posicao] as Operador;
      posicao++;
      no = op(operador, no, produto());
    }
    return no;
  };

  // produto := unario (('*' | '/') unario)*
  const produto = (): No => {
    let no = unario();
    while (espiar() === '*' || espiar() === '/') {
      const operador = entrada[posicao] as Operador;
      posicao++;
      no = op(operador, no, unario());
    }
    return no;
  };

  const unario = (): No => {
    if (espiar() === '-') {
      posicao++;
      return { tipo: 'negativo', operando: unario() };
    }
    return potencia();
  };

  // potencia := primario ('^' unario)?  — associativa à direita
  const potencia = (): No => {
    const base = primario();
    if (espiar() === '^') {
      posicao++;
      return op('^', base, unario());
    }
    return base;
  };

  const primario = (): No => {
    if (espiar() === '(') {
      consumir('(');
      const interno = soma();
      consumir(')');
      return interno;
    }

    const inicio = posicao;
    while (posicao < entrada.length && /[\d.]/.test(entrada[posicao]!)) {
      posicao++;
    }

    if (inicio === posicao) {
      throw new ErroMatematico(`Não consegui ler um número na posição ${posicao}.`);
    }

    return numero(Number(entrada.slice(inicio, posicao)));
  };

  const arvore = soma();

  if (posicao !== entrada.length) {
    throw new ErroMatematico(`Sobrou "${entrada.slice(posicao)}" no fim da expressão.`);
  }

  return arvore;
}

function formatarNumero(valor: number): string {
  return Number(valor.toFixed(6)).toString().replace('.', '{,}');
}

/**
 * Escreve a árvore em LaTeX, com parênteses apenas onde a precedência exige —
 * é o que mantém a expressão legível enquanto ela encolhe.
 */
export function expressaoParaTex(no: No, precedenciaPai = 0): string {
  switch (no.tipo) {
    case 'numero':
      return formatarNumero(no.valor);

    case 'negativo': {
      const interno = expressaoParaTex(no.operando, 4);
      return precedenciaPai >= 2 ? `(-${interno})` : `-${interno}`;
    }

    case 'binario': {
      const precedencia = PRECEDENCIA[no.operador];

      if (no.operador === '/') {
        return `\\frac{${expressaoParaTex(no.esquerda)}}{${expressaoParaTex(no.direita)}}`;
      }
      if (no.operador === '^') {
        return `${expressaoParaTex(no.esquerda, 4)}^{${expressaoParaTex(no.direita)}}`;
      }

      const corpo =
        `${expressaoParaTex(no.esquerda, precedencia)} ` +
        `${TEX_OPERADOR[no.operador]} ` +
        `${expressaoParaTex(no.direita, precedencia + 1)}`;

      return precedencia < precedenciaPai ? `\\left(${corpo}\\right)` : corpo;
    }
  }
}

export function avaliar(no: No): number {
  switch (no.tipo) {
    case 'numero':
      return no.valor;
    case 'negativo':
      return -avaliar(no.operando);
    case 'binario': {
      const a = avaliar(no.esquerda);
      const b = avaliar(no.direita);
      switch (no.operador) {
        case '+':
          return a + b;
        case '-':
          return a - b;
        case '*':
          return a * b;
        case '/':
          if (b === 0) {
            throw new ErroMatematico('Divisão por zero na expressão.');
          }
          return a / b;
        case '^':
          return a ** b;
      }
    }
  }
}

interface Reducao {
  readonly arvore: No;
  readonly descricao: string;
  readonly nota?: string;
}

/**
 * Reduz exatamente um nó: o primeiro, em percurso pós-ordem, cujos operandos
 * já são números.
 *
 * Pós-ordem resolve naturalmente a ordem das operações — o interior dos
 * parênteses e os operadores de maior precedência ficam mais fundo na árvore,
 * e portanto são visitados antes.
 */
function reduzirUmPasso(no: No): Reducao | null {
  switch (no.tipo) {
    case 'numero':
      return null;

    case 'negativo': {
      if (no.operando.tipo === 'numero') {
        return {
          arvore: numero(-no.operando.valor),
          descricao: 'Aplicamos o sinal negativo.',
        };
      }
      const interna = reduzirUmPasso(no.operando);
      return interna === null
        ? null
        : { ...interna, arvore: { tipo: 'negativo', operando: interna.arvore } };
    }

    case 'binario': {
      const naEsquerda = reduzirUmPasso(no.esquerda);
      if (naEsquerda !== null) {
        return { ...naEsquerda, arvore: op(no.operador, naEsquerda.arvore, no.direita) };
      }

      const naDireita = reduzirUmPasso(no.direita);
      if (naDireita !== null) {
        return { ...naDireita, arvore: op(no.operador, no.esquerda, naDireita.arvore) };
      }

      const valor = avaliar(no);
      return {
        arvore: numero(valor),
        descricao: `Resolvemos ${NOME_OPERACAO[no.operador]}.`,
        nota: `${expressaoParaTex(no)} = ${formatarNumero(valor)}`,
      };
    }
  }
}

/** Avalia a expressão mostrando a reescrita a cada operação resolvida. */
export function resolverExpressaoComPassos(entrada: string | No): Resolucao<number> {
  let arvore = typeof entrada === 'string' ? analisarExpressao(entrada) : entrada;

  const passos: Passo[] = [
    {
      descricao: 'Partimos da expressão completa.',
      tex: expressaoParaTex(arvore),
      nota: 'A ordem é: parênteses, depois potências, depois multiplicação e divisão, e por fim adição e subtração.',
    },
  ];

  // O limite protege contra uma expressão patológica; expressões didáticas
  // terminam em poucas reduções.
  for (let i = 0; i < 100; i++) {
    const reducao = reduzirUmPasso(arvore);
    if (reducao === null) {
      break;
    }

    arvore = reducao.arvore;
    passos.push({
      descricao: reducao.descricao,
      tex: expressaoParaTex(arvore),
      nota: reducao.nota,
    });
  }

  return { resultado: avaliar(arvore), passos };
}
