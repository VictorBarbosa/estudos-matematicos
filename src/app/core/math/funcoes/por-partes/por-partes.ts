import { Passo, Resolucao } from '@core/math/tipos/tipos';
import { Polinomio, formatar, formatarEmTexto } from '@core/math/algebra/polinomio/polinomio';

/**
 * Funções definidas por partes.
 *
 * São a forma natural de descrever qualquer coisa que muda de regime: uma
 * tarifa com faixas, um imposto progressivo, o empuxo de um foguete antes e
 * depois da separação do estágio. A matemática nova está toda nas FRONTEIRAS —
 * dentro de cada trecho é uma função comum.
 *
 * Na fronteira, três perguntas: qual trecho vale exatamente ali (o sinal de
 * igual decide), o que acontece chegando pela esquerda, e o que acontece
 * chegando pela direita. Quando as três respostas coincidem, a função é
 * contínua; quando não, há um salto, e o tamanho dele é o que importa.
 */

/** Um trecho válido de `de` (inclusive, se `fechadoAEsquerda`) até `ate`. */
export interface TrechoDaFuncao {
  readonly expressao: Polinomio;
  /** `-Infinity` para o primeiro trecho. */
  readonly de: number;
  /** `Infinity` para o último. */
  readonly ate: number;
  /** O extremo esquerdo pertence a este trecho? */
  readonly fechadoAEsquerda: boolean;
}

export interface FuncaoPorPartes {
  readonly trechos: readonly TrechoDaFuncao[];
}

/** Qual trecho vale em x, ou `null` se nenhum cobre o ponto. */
export function trechoEm(f: FuncaoPorPartes, x: number): TrechoDaFuncao | null {
  return (
    f.trechos.find((trecho) => {
      const acimaDoInicio = trecho.fechadoAEsquerda ? x >= trecho.de : x > trecho.de;
      const abaixoDoFim = trecho.fechadoAEsquerda ? x < trecho.ate : x <= trecho.ate;
      return acimaDoInicio && abaixoDoFim;
    }) ?? null
  );
}

export function avaliarPorPartes(f: FuncaoPorPartes, x: number): number {
  const trecho = trechoEm(f, x);
  return trecho === null ? Number.NaN : trecho.expressao.avaliar(x);
}

/** O limite pela esquerda numa fronteira: o trecho que termina ali. */
export function limiteEsquerda(f: FuncaoPorPartes, fronteira: number): number {
  const trecho = f.trechos.find((candidato) => Math.abs(candidato.ate - fronteira) < 1e-9);
  return trecho === undefined ? Number.NaN : trecho.expressao.avaliar(fronteira);
}

/** O limite pela direita: o trecho que começa ali. */
export function limiteDireita(f: FuncaoPorPartes, fronteira: number): number {
  const trecho = f.trechos.find((candidato) => Math.abs(candidato.de - fronteira) < 1e-9);
  return trecho === undefined ? Number.NaN : trecho.expressao.avaliar(fronteira);
}

/** O tamanho do salto na fronteira: zero quando a função é contínua ali. */
export function saltoEm(f: FuncaoPorPartes, fronteira: number): number {
  return limiteDireita(f, fronteira) - limiteEsquerda(f, fronteira);
}

export function ehContinuaEm(f: FuncaoPorPartes, fronteira: number): boolean {
  const valor = avaliarPorPartes(f, fronteira);
  return (
    Math.abs(saltoEm(f, fronteira)) < 1e-9 && Math.abs(valor - limiteEsquerda(f, fronteira)) < 1e-9
  );
}

/** As fronteiras internas, que é onde o tópico mora. */
export function fronteirasDe(f: FuncaoPorPartes): readonly number[] {
  return f.trechos.map((trecho) => trecho.ate).filter((valor) => Number.isFinite(valor));
}

/** `\begin{cases} … \end{cases}`, como se escreve no papel. */
export function porPartesParaTex(f: FuncaoPorPartes): string {
  const linhas = f.trechos.map((trecho) => {
    const condicao = condicaoTex(trecho);
    return `${trecho.expressao.paraTex()}, & ${condicao}`;
  });

  return `f(x) = \\begin{cases} ${linhas.join(' \\\\ ')} \\end{cases}`;
}

/** Avaliar num ponto: achar o trecho certo é a parte que se erra. */
export function avaliarPorPartesComPassos(f: FuncaoPorPartes, x: number): Resolucao<number> {
  const trecho = trechoEm(f, x);
  const resultado = trecho === null ? Number.NaN : trecho.expressao.avaliar(x);

  const passos: Passo[] = [
    {
      descricao: `Primeiro, descobrimos qual trecho cobre x igual a ${formatarEmTexto(x)}.`,
      tex: porPartesParaTex(f),
      nota: 'O sinal de igual na condição é quem decide a quem pertence a fronteira.',
    },
    {
      descricao:
        trecho === null
          ? 'Nenhum trecho cobre esse ponto: ele está fora do domínio.'
          : `A condição que vale é ${condicaoTexto(trecho)}.`,
      tex: trecho === null ? 'x \\notin \\text{dom}(f)' : `f(x) = ${trecho.expressao.paraTex()}`,
    },
    {
      descricao: 'Agora é só substituir na expressão desse trecho.',
      tex: `f(${formatar(x)}) = ${formatar(Number(resultado.toFixed(6)))}`,
    },
  ];

  return { resultado, passos };
}

/**
 * A continuidade numa fronteira, pelas três perguntas.
 *
 * É a mesma definição de continuidade do Cálculo, só que aqui ela tem um lugar
 * concreto para ser testada.
 */
export function continuidadeComPassos(f: FuncaoPorPartes, fronteira: number): Resolucao<number> {
  const esquerda = limiteEsquerda(f, fronteira);
  const direita = limiteDireita(f, fronteira);
  const valor = avaliarPorPartes(f, fronteira);
  const resultado = direita - esquerda;

  const passos: Passo[] = [
    {
      descricao: `Chegando por valores menores que ${formatarEmTexto(fronteira)}.`,
      tex: `\\lim_{x \\to ${formatar(fronteira)}^{-}} f(x) = ${formatar(Number(esquerda.toFixed(6)))}`,
    },
    {
      descricao: 'Chegando por valores maiores.',
      tex: `\\lim_{x \\to ${formatar(fronteira)}^{+}} f(x) = ${formatar(Number(direita.toFixed(6)))}`,
    },
    {
      descricao: 'E o valor que a função realmente assume no ponto.',
      tex: `f(${formatar(fronteira)}) = ${formatar(Number(valor.toFixed(6)))}`,
      nota: 'Quem define este valor é o trecho cuja condição inclui o igual.',
    },
    Math.abs(resultado) < 1e-9
      ? {
          descricao: 'Os três coincidem: a função é contínua nesse ponto.',
          tex: '\\text{salto} = 0',
          nota: 'Dá para desenhar o gráfico sem tirar o lápis do papel.',
        }
      : {
          descricao: 'Os limites laterais discordam: há um salto.',
          tex: `\\text{salto} = ${formatar(Number(direita.toFixed(6)))} - ${formatar(Number(esquerda.toFixed(6)))} = ${formatar(Number(resultado.toFixed(6)))}`,
          nota: 'O gráfico se parte, e nenhum valor no ponto consegue colar as duas pontas.',
        },
  ];

  return { resultado, passos };
}

/**
 * O valor que torna a função contínua, quando há um parâmetro livre.
 *
 * É o exercício clássico do tema: ajustar uma constante para que as duas
 * pontas se encontrem.
 */
export function parametroQueColaComPassos(
  esquerda: Polinomio,
  direitaSemConstante: Polinomio,
  fronteira: number,
): Resolucao<number> {
  const alvo = esquerda.avaliar(fronteira);
  const semAjuste = direitaSemConstante.avaliar(fronteira);
  const resultado = alvo - semAjuste;

  const passos: Passo[] = [
    {
      descricao: 'Para colar as pontas, os dois limites laterais precisam coincidir.',
      tex: `\\lim_{x \\to ${formatar(fronteira)}^{-}} f(x) = \\lim_{x \\to ${formatar(fronteira)}^{+}} f(x)`,
    },
    {
      descricao: 'Avaliamos o trecho da esquerda na fronteira.',
      tex: `${esquerda.paraTex()} \\big|_{x = ${formatar(fronteira)}} = ${formatar(alvo)}`,
    },
    {
      descricao: 'E o da direita, sem a constante que falta.',
      tex: `${direitaSemConstante.paraTex()} \\big|_{x = ${formatar(fronteira)}} = ${formatar(semAjuste)}`,
    },
    {
      descricao: 'A constante é exatamente a diferença entre os dois.',
      tex: `c = ${formatar(alvo)} - ${formatar(semAjuste)} = ${formatar(resultado)}`,
      nota: 'Com esse valor o gráfico fica inteiro, sem salto na fronteira.',
    },
  ];

  return { resultado, passos };
}

function condicaoTex(trecho: TrechoDaFuncao): string {
  if (!Number.isFinite(trecho.de)) {
    return `x ${trecho.fechadoAEsquerda ? '<' : '\\leq'} ${formatar(trecho.ate)}`;
  }
  if (!Number.isFinite(trecho.ate)) {
    return `x ${trecho.fechadoAEsquerda ? '\\geq' : '>'} ${formatar(trecho.de)}`;
  }
  return trecho.fechadoAEsquerda
    ? `${formatar(trecho.de)} \\leq x < ${formatar(trecho.ate)}`
    : `${formatar(trecho.de)} < x \\leq ${formatar(trecho.ate)}`;
}

function condicaoTexto(trecho: TrechoDaFuncao): string {
  if (!Number.isFinite(trecho.de)) {
    return `x ${trecho.fechadoAEsquerda ? 'menor que' : 'menor ou igual a'} ${formatarEmTexto(trecho.ate)}`;
  }
  if (!Number.isFinite(trecho.ate)) {
    return `x ${trecho.fechadoAEsquerda ? 'maior ou igual a' : 'maior que'} ${formatarEmTexto(trecho.de)}`;
  }
  return `x entre ${formatarEmTexto(trecho.de)} e ${formatarEmTexto(trecho.ate)}`;
}
