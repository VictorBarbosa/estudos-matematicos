import { ErroMatematico, Passo, Resolucao } from '@core/math/tipos/tipos';
import { formatar } from '@core/math/algebra/polinomio/polinomio';

/**
 * As funções elementares do ensino médio.
 *
 * Cada família é descrita pelo que a caracteriza: a afim cresce a uma taxa
 * constante, a exponencial multiplica por um fator fixo, a logarítmica conta
 * quantas multiplicações foram feitas. Os textos aqui buscam sempre essa
 * ideia central, não apenas a fórmula.
 */

export interface AnaliseAfim {
  readonly raiz: number | null;
  readonly crescente: boolean;
  readonly constante: boolean;
  /** Onde a reta corta o eixo y. */
  readonly interceptoY: number;
}

export function analisarAfimComPassos(a: number, b: number): Resolucao<AnaliseAfim> {
  const constante = a === 0;
  const raiz = constante ? null : -b / a;

  const passos: Passo[] = [
    {
      descricao: 'A função afim tem a forma f(x) = ax + b.',
      tex: `f(x) = ${formatar(a)}x ${b >= 0 ? '+' : '-'} ${formatar(Math.abs(b))}`,
    },
    {
      descricao: 'O coeficiente b é onde a reta corta o eixo vertical, pois f(0) = b.',
      tex: `f(0) = ${formatar(b)}`,
    },
  ];

  if (constante) {
    passos.push({
      descricao: 'Com a = 0 a função é constante: uma reta horizontal.',
      tex: `f(x) = ${formatar(b)} \\quad \\text{para todo } x`,
    });
  } else {
    passos.push({
      descricao: 'O coeficiente a é a taxa de variação: quanto y muda quando x avança 1.',
      tex: `f(x+1) - f(x) = ${formatar(a)}`,
      nota:
        a > 0
          ? 'Positivo: a função é crescente.'
          : 'Negativo: a função é decrescente.',
    });
    passos.push({
      descricao: 'A raiz é o x em que a função se anula.',
      tex: `${formatar(a)}x ${b >= 0 ? '+' : '-'} ${formatar(Math.abs(b))} = 0 \\;\\Rightarrow\\; x = ${formatar(raiz!)}`,
    });
  }

  return {
    resultado: { raiz, crescente: a > 0, constante, interceptoY: b },
    passos,
  };
}

export interface AnaliseExponencial {
  readonly crescente: boolean;
  /** Valor em x = 0, que é sempre o coeficiente inicial. */
  readonly valorInicial: number;
  /** Quanto tempo leva para dobrar, ou para cair à metade. */
  readonly tempoCaracteristico: number;
}

export function analisarExponencialComPassos(
  inicial: number,
  base: number,
): Resolucao<AnaliseExponencial> {
  if (base <= 0 || base === 1) {
    throw new ErroMatematico('A base de uma exponencial deve ser positiva e diferente de 1.');
  }

  const crescente = base > 1;
  const tempoCaracteristico = Math.log(crescente ? 2 : 0.5) / Math.log(base);

  return {
    resultado: { crescente, valorInicial: inicial, tempoCaracteristico },
    passos: [
      {
        descricao: 'Na exponencial, a variável está no EXPOENTE.',
        tex: `f(x) = ${formatar(inicial)} \\cdot ${formatar(base)}^{x}`,
        nota: 'Compare com a potência xⁿ, em que a variável é a base — são funções bem diferentes.',
      },
      {
        descricao: 'Avançar uma unidade em x multiplica o valor pela base.',
        tex: `\\frac{f(x+1)}{f(x)} = ${formatar(base)}`,
        nota:
          'Enquanto a função afim SOMA sempre a mesma quantidade, a exponencial MULTIPLICA ' +
          'sempre pelo mesmo fator.',
      },
      {
        descricao: 'Em x = 0 qualquer base elevada a zero vale 1, então sobra o coeficiente.',
        tex: `f(0) = ${formatar(inicial)} \\cdot ${formatar(base)}^{0} = ${formatar(inicial)}`,
      },
      {
        descricao: crescente
          ? 'O tempo de duplicação é constante, não importa de onde se parta.'
          : 'A meia-vida é constante, não importa de onde se parta.',
        tex: `${formatar(base)}^{t} = ${crescente ? 2 : '0{,}5'} \\;\\Rightarrow\\; t = ${formatar(tempoCaracteristico)}`,
      },
      {
        descricao: 'A função nunca chega a zero: o eixo x é uma assíntota horizontal.',
        tex: '\\lim_{x \\to -\\infty} a \\cdot b^{x} = 0 \\quad (b > 1)',
      },
    ],
  };
}

export interface AnaliseLogaritmica {
  /** O logaritmo só aceita argumento positivo. */
  readonly dominioMinimo: number;
  readonly raiz: number;
  readonly crescente: boolean;
}

export function analisarLogaritmicaComPassos(base: number): Resolucao<AnaliseLogaritmica> {
  if (base <= 0 || base === 1) {
    throw new ErroMatematico('A base de um logaritmo deve ser positiva e diferente de 1.');
  }

  return {
    resultado: { dominioMinimo: 0, raiz: 1, crescente: base > 1 },
    passos: [
      {
        descricao: 'O logaritmo responde "a que expoente elevar a base para chegar a x?".',
        tex: `\\log_{${formatar(base)}} x = y \\iff ${formatar(base)}^{y} = x`,
      },
      {
        descricao: 'Por isso ele é a função inversa da exponencial de mesma base.',
        tex: `\\log_{${formatar(base)}}\\left(${formatar(base)}^{x}\\right) = x`,
        nota: 'Os dois gráficos são reflexos um do outro na reta y = x.',
      },
      {
        descricao: 'Nenhuma potência de base positiva resulta em zero ou negativo.',
        tex: `${formatar(base)}^{y} > 0 \\quad \\text{para todo } y`,
        nota: 'É daí que vem a restrição: o domínio do logaritmo é x > 0.',
      },
      {
        descricao: 'A raiz está em x = 1, porque qualquer base elevada a zero dá 1.',
        tex: `\\log_{${formatar(base)}} 1 = 0`,
      },
    ],
  };
}

export interface AnaliseModular {
  /** O "bico" do V, onde a expressão interna se anula. */
  readonly vertice: { readonly x: number; readonly y: number };
}

export function analisarModularComPassos(
  a: number,
  b: number,
  deslocamentoVertical = 0,
): Resolucao<AnaliseModular> {
  if (a === 0) {
    throw new ErroMatematico('Com a = 0 não há função modular para analisar.');
  }

  const xVertice = -b / a;

  return {
    resultado: { vertice: { x: xVertice, y: deslocamentoVertical } },
    passos: [
      {
        descricao: 'O módulo devolve a distância até zero, sempre não negativa.',
        tex: '|u| = \\begin{cases} u & \\text{se } u \\geq 0 \\\\ -u & \\text{se } u < 0 \\end{cases}',
      },
      {
        descricao: 'Por isso o gráfico tem um bico onde a expressão interna troca de sinal.',
        tex: `${formatar(a)}x ${b >= 0 ? '+' : '-'} ${formatar(Math.abs(b))} = 0 \\;\\Rightarrow\\; x = ${formatar(xVertice)}`,
      },
      {
        descricao: 'À direita do bico a expressão é positiva e o módulo não muda nada.',
        tex: `f(x) = ${formatar(a)}x ${b >= 0 ? '+' : '-'} ${formatar(Math.abs(b))} ${deslocamentoVertical >= 0 ? '+' : '-'} ${formatar(Math.abs(deslocamentoVertical))}`,
      },
      {
        descricao: 'À esquerda ela é negativa, e o módulo espelha a reta para cima.',
        tex: `f(x) = -\\left(${formatar(a)}x ${b >= 0 ? '+' : '-'} ${formatar(Math.abs(b))}\\right) ${deslocamentoVertical >= 0 ? '+' : '-'} ${formatar(Math.abs(deslocamentoVertical))}`,
        nota: 'É esse espelhamento que forma o V característico.',
      },
    ],
  };
}

/** Procura as raízes de uma função contínua por varredura e bisseção. */
export function raizesNumericas(
  f: (x: number) => number,
  xMin: number,
  xMax: number,
  amostras = 400,
): readonly number[] {
  const raizes: number[] = [];
  const passo = (xMax - xMin) / amostras;

  let anterior = f(xMin);

  for (let i = 1; i <= amostras; i++) {
    const x = xMin + i * passo;
    const atual = f(x);

    if (!Number.isFinite(anterior) || !Number.isFinite(atual)) {
      anterior = atual;
      continue;
    }

    if (Math.abs(atual) < 1e-12) {
      raizes.push(x);
    } else if (anterior * atual < 0) {
      // Houve troca de sinal: refina por bisseção.
      let baixo = x - passo;
      let alto = x;

      for (let k = 0; k < 60; k++) {
        const meio = (baixo + alto) / 2;
        if (f(baixo) * f(meio) <= 0) {
          alto = meio;
        } else {
          baixo = meio;
        }
      }

      raizes.push((baixo + alto) / 2);
    }

    anterior = atual;
  }

  // Remove duplicatas próximas, que a varredura pode gerar.
  return raizes.filter(
    (raiz, indice) => indice === 0 || Math.abs(raiz - raizes[indice - 1]!) > 1e-6,
  );
}
