import { Passo, Resolucao } from '@core/math/tipos/tipos';
import { formatar, formatarEmTexto } from '@core/math/algebra/polinomio/polinomio';

/**
 * Transformações de gráficos.
 *
 * Saber reconhecer `a·f(b(x − h)) + k` poupa refazer tabela de valores toda
 * vez: a forma do gráfico é a mesma, o que muda é onde e com que escala ele
 * está desenhado. Em engenharia, é como se lê um sinal deslocado no tempo ou
 * uma resposta com ganho.
 *
 * A assimetria entre dentro e fora dos parênteses é o que confunde. Fora, tudo
 * se comporta como a intuição manda: multiplicar por 2 estica na vertical,
 * somar 3 sobe três. Dentro, tudo se inverte: somar 3 desloca para a ESQUERDA,
 * e multiplicar por 2 COMPRIME pela metade. O motivo é que o x precisa
 * compensar a operação para que o argumento chegue ao mesmo valor de antes.
 */

export interface Transformacao {
  /** Fator vertical: estica, comprime e, se negativo, reflete no eixo x. */
  readonly a: number;
  /** Fator horizontal: comprime quando passa de 1, e reflete se negativo. */
  readonly b: number;
  /** Deslocamento horizontal, no sentido que a intuição espera. */
  readonly h: number;
  /** Deslocamento vertical. */
  readonly k: number;
}

export const IDENTIDADE: Transformacao = { a: 1, b: 1, h: 0, k: 0 };

/** Aplica a transformação a uma função qualquer. */
export function aplicar(f: (x: number) => number, t: Transformacao): (x: number) => number {
  return (x: number) => t.a * f(t.b * (x - t.h)) + t.k;
}

/**
 * Para onde vai um ponto do gráfico original.
 *
 * A conta é o avesso da que se faz no argumento: um ponto em `x₀` passa a
 * aparecer em `x₀/b + h`, porque é aí que o argumento volta a valer `x₀`.
 */
export function transformarPonto(
  ponto: { readonly x: number; readonly y: number },
  t: Transformacao,
): { readonly x: number; readonly y: number } {
  return { x: ponto.x / t.b + t.h, y: t.a * ponto.y + t.k };
}

/** `2f\left(3(x - 1)\right) + 4`, escrito como se lê. */
export function transformacaoParaTex(t: Transformacao, nome = 'f'): string {
  const dentro =
    t.b === 1 ? deslocamentoTex(t.h) : `${formatar(t.b)}\\left(${deslocamentoTex(t.h)}\\right)`;

  const corpo = `${coeficienteTex(t.a)}${nome}\\left(${dentro}\\right)`;
  if (t.k === 0) {
    return corpo;
  }
  return `${corpo} ${t.k > 0 ? '+' : '-'} ${formatar(Math.abs(t.k))}`;
}

/** Um passo da transformação, pronto para traduzir. */
export interface PassoDaTransformacao {
  readonly chave: string;
  readonly valores?: Readonly<Record<string, string | number>>;
}

/**
 * Os passos da transformação, na ordem em que se aplicam.
 *
 * Devolve chaves em vez de frases: o motor sabe o que acontece, e quem
 * desenha escolhe a língua. {@link descreverTransformacao} é a mesma lista
 * dita em português, para quem ainda não traduz.
 */
export function passosDaTransformacao(t: Transformacao): readonly PassoDaTransformacao[] {
  const passos: PassoDaTransformacao[] = [];

  if (t.b !== 1) {
    const fator = Math.abs(t.b);
    if (fator > 1) {
      passos.push({
        chave: 'transf.comprimeHorizontal',
        valores: { fator: formatarEmTexto(fator) },
      });
    } else if (fator < 1) {
      passos.push({
        chave: 'transf.esticaHorizontal',
        valores: { fator: formatarEmTexto(1 / fator) },
      });
    }
    if (t.b < 0) {
      passos.push({ chave: 'transf.refleteVertical' });
    }
  }

  if (t.h !== 0) {
    passos.push({
      chave: t.h > 0 ? 'transf.deslocaDireita' : 'transf.deslocaEsquerda',
      valores: { quanto: formatarEmTexto(Math.abs(t.h)) },
    });
  }

  if (t.a !== 1) {
    const fator = Math.abs(t.a);
    if (fator > 1) {
      passos.push({ chave: 'transf.esticaVertical', valores: { fator: formatarEmTexto(fator) } });
    } else if (fator < 1) {
      passos.push({
        chave: 'transf.comprimeVertical',
        valores: { fator: formatarEmTexto(1 / fator) },
      });
    }
    if (t.a < 0) {
      passos.push({ chave: 'transf.refleteHorizontal' });
    }
  }

  if (t.k !== 0) {
    passos.push({
      chave: t.k > 0 ? 'transf.deslocaCima' : 'transf.deslocaBaixo',
      valores: { quanto: formatarEmTexto(Math.abs(t.k)) },
    });
  }

  return passos.length === 0 ? [{ chave: 'transf.nadaMuda' }] : passos;
}

/** As mesmas frases em português, para o gerador de exercícios. */
const EM_PORTUGUES: Readonly<Record<string, (v: Record<string, string | number>) => string>> = {
  'transf.comprimeHorizontal': (v) => `comprime na horizontal por um fator ${v['fator']}`,
  'transf.esticaHorizontal': (v) => `estica na horizontal por um fator ${v['fator']}`,
  'transf.refleteVertical': () => 'reflete no eixo vertical',
  'transf.deslocaDireita': (v) => `desloca ${v['quanto']} para a direita`,
  'transf.deslocaEsquerda': (v) => `desloca ${v['quanto']} para a esquerda`,
  'transf.esticaVertical': (v) => `estica na vertical por um fator ${v['fator']}`,
  'transf.comprimeVertical': (v) => `comprime na vertical por um fator ${v['fator']}`,
  'transf.refleteHorizontal': () => 'reflete no eixo horizontal',
  'transf.deslocaCima': (v) => `desloca ${v['quanto']} para cima`,
  'transf.deslocaBaixo': (v) => `desloca ${v['quanto']} para baixo`,
  'transf.nadaMuda': () => 'não muda nada',
};

/** A descrição em palavras, na ordem em que as transformações se aplicam. */
export function descreverTransformacao(t: Transformacao): readonly string[] {
  return passosDaTransformacao(t).map((passo) => EM_PORTUGUES[passo.chave]!(passo.valores ?? {}));
}

/**
 * Para onde vai um ponto, passo a passo.
 *
 * O exercício mais honesto do tópico: seguir um ponto conhecido em vez de
 * tentar imaginar a curva inteira de uma vez.
 */
export function pontoTransformadoComPassos(
  ponto: { readonly x: number; readonly y: number },
  t: Transformacao,
): Resolucao<number> {
  const destino = transformarPonto(ponto, t);

  const passos: Passo[] = [
    {
      descricao: 'Seguimos um ponto conhecido do gráfico original.',
      tex: `\\left(${formatar(ponto.x)},\\; ${formatar(ponto.y)}\\right) \\text{ no gráfico de } f`,
    },
    {
      descricao:
        'Na horizontal, a conta é o avesso do que está escrito: o x precisa compensar para que ' +
        'o argumento chegue ao mesmo valor.',
      tex:
        `${formatar(t.b)}(x - ${formatar(t.h)}) = ${formatar(ponto.x)} \\;\\Longrightarrow\\; ` +
        `x = ${formatar(Number(destino.x.toFixed(6)))}`,
      nota:
        t.b !== 1 || t.h !== 0
          ? 'Somar dentro dos parênteses desloca para a esquerda, e multiplicar comprime.'
          : undefined,
    },
    {
      descricao: 'Na vertical, a conta é direta: multiplica e soma.',
      tex:
        `y = ${formatar(t.a)} \\cdot ${formatar(ponto.y)} + ${formatar(t.k)} = ` +
        `${formatar(Number(destino.y.toFixed(6)))}`,
    },
    {
      descricao: 'O ponto correspondente no gráfico transformado.',
      tex: `\\left(${formatar(Number(destino.x.toFixed(6)))},\\; ${formatar(Number(destino.y.toFixed(6)))}\\right)`,
    },
  ];

  return { resultado: destino.x, passos };
}

/** A sequência de transformações, dita em palavras e em fórmula. */
export function descreverComPassos(t: Transformacao, nome = 'f'): Resolucao<number> {
  const descricoes = descreverTransformacao(t);

  const passos: Passo[] = [
    {
      descricao: 'Separamos o que está dentro do argumento do que está fora.',
      tex: `${nome}(x) \\;\\longrightarrow\\; ${transformacaoParaTex(t, nome)}`,
      nota: 'Dentro dos parênteses tudo se inverte; fora, tudo é direto.',
    },
    {
      descricao: 'Primeiro o que age na horizontal, de dentro para fora.',
      tex: `x \\;\\longrightarrow\\; ${formatar(t.b)}(x - ${formatar(t.h)})`,
      nota: descricoes.slice(0, 2).join('; ') || 'nada muda na horizontal',
    },
    {
      descricao: 'Depois o que age na vertical.',
      tex: `y \\;\\longrightarrow\\; ${formatar(t.a)}y + ${formatar(t.k)}`,
      nota: descricoes.slice(-2).join('; '),
    },
    {
      descricao: 'E o vértice, ou qualquer ponto de referência, acompanha.',
      tex: `\\left(0,\\; 0\\right) \\;\\longrightarrow\\; \\left(${formatar(t.h)},\\; ${formatar(t.k)}\\right)`,
    },
  ];

  return { resultado: t.h, passos };
}

/**
 * O vértice de uma parábola transformada.
 *
 * É a aplicação mais direta do tópico: ler `h` e `k` direto da forma canônica,
 * sem completar quadrado nem derivar nada.
 */
export function verticeTransformadoComPassos(t: Transformacao): Resolucao<number> {
  const passos: Passo[] = [
    {
      descricao: 'A parábola básica tem vértice na origem.',
      tex: 'y = x^{2} \\;\\Longrightarrow\\; V = (0,\\; 0)',
    },
    {
      descricao: 'A forma canônica mostra o deslocamento direto.',
      tex: `y = ${formatar(t.a)}\\left(${formatar(t.b)}(x - ${formatar(t.h)})\\right)^{2} + ${formatar(t.k)}`,
    },
    {
      descricao: 'O vértice vai para onde o argumento zera.',
      tex: `V = \\left(${formatar(t.h)},\\; ${formatar(t.k)}\\right)`,
      nota:
        t.h !== 0
          ? 'Repare no sinal: subtrair h dentro dos parênteses desloca h para a DIREITA.'
          : undefined,
    },
  ];

  return { resultado: t.h, passos };
}

function deslocamentoTex(h: number): string {
  if (h === 0) {
    return 'x';
  }
  return `x ${h > 0 ? '-' : '+'} ${formatar(Math.abs(h))}`;
}

function coeficienteTex(a: number): string {
  if (a === 1) {
    return '';
  }
  return a === -1 ? '-' : formatar(a);
}
