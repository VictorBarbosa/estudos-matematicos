import { Arvore } from '../peca/peca';
import { MONTAGEM_VAZIA, Montagem, Resultado, montagemDe } from '../montagem/montagem';

/**
 * A pilha de linhas: uma por passo da conta.
 *
 * **A cópia da linha anterior é o caminho principal, não uma conveniência.**
 * Montar `2x + 3 = 11` do zero custa uns nove toques; a linha seguinte sai
 * copiando e editando — apagar o `3`, trocar o `11` pelo `8` — em uns cinco. Só
 * a primeira linha é caríssima, e é também assim no papel, onde a linha de
 * baixo repete a de cima com uma diferença.
 */
export interface Linhas {
  readonly linhas: readonly Montagem[];
  /** Qual delas está em edição. */
  readonly atual: number;
}

/**
 * Teto de linhas por tópico.
 *
 * Não é limitação pedagógica: é o que mantém o rascunho dentro do teto de bytes
 * do `localStorage` (ver `guarda-rascunho`). Vinte passos é mais do que qualquer
 * exercício deste site pede.
 */
export const LIMITE_DE_LINHAS = 20;

export const LINHAS_VAZIAS: Linhas = { linhas: [MONTAGEM_VAZIA], atual: 0 };

export function linhasDe(arvores: readonly Arvore[], atual: number): Linhas {
  if (arvores.length === 0) {
    return LINHAS_VAZIAS;
  }

  const linhas = arvores.map(montagemDe);
  const dentro = Math.min(Math.max(atual, 0), linhas.length - 1);

  return { linhas, atual: dentro };
}

export function linhaAtual(estado: Linhas): Montagem {
  return estado.linhas[estado.atual] ?? MONTAGEM_VAZIA;
}

/** Troca a linha em edição pelo resultado de uma ação de montagem. */
export function comLinhaAtual(estado: Linhas, montagem: Montagem): Linhas {
  const linhas = estado.linhas.map((linha, indice) => (indice === estado.atual ? montagem : linha));

  return { ...estado, linhas };
}

/** Aplica uma ação à linha em edição e devolve a pilha e a recusa. */
export function aplicar(
  estado: Linhas,
  acao: (montagem: Montagem) => Resultado,
): { readonly estado: Linhas; readonly recusa: Resultado['recusa'] } {
  const resultado = acao(linhaAtual(estado));

  return { estado: comLinhaAtual(estado, resultado.montagem), recusa: resultado.recusa };
}

/** Uma linha nova e vazia no fim, já em edição. */
export function novaLinha(estado: Linhas): Linhas {
  if (estado.linhas.length >= LIMITE_DE_LINHAS) {
    return estado;
  }

  const linhas = [...estado.linhas, MONTAGEM_VAZIA];

  return { linhas, atual: linhas.length - 1 };
}

/**
 * Uma linha nova que começa igual à de baixo da pilha.
 *
 * Os nós são imutáveis, então a cópia compartilha a árvore com a original sem
 * risco nenhum: editar a nova devolve árvore nova e não alcança a antiga. O que
 * importa é essa propriedade, e é ela que o teste cobra — não a ausência de
 * referência compartilhada, que só faria sentido com nós mutáveis.
 */
export function copiarAnterior(estado: Linhas): Linhas {
  if (estado.linhas.length >= LIMITE_DE_LINHAS) {
    return estado;
  }

  const ultima = estado.linhas.at(-1) ?? MONTAGEM_VAZIA;
  const linhas = [...estado.linhas, montagemDe(ultima.arvore)];

  return { linhas, atual: linhas.length - 1 };
}

/** Põe outra linha em edição. */
export function escolherLinha(estado: Linhas, indice: number): Linhas {
  if (indice < 0 || indice >= estado.linhas.length) {
    return estado;
  }

  return { ...estado, atual: indice };
}

/** Tira uma linha da pilha. A última que sobra volta a ser uma linha vazia. */
export function removerLinha(estado: Linhas, indice: number): Linhas {
  if (indice < 0 || indice >= estado.linhas.length) {
    return estado;
  }

  if (estado.linhas.length === 1) {
    return LINHAS_VAZIAS;
  }

  const linhas = estado.linhas.filter((_, i) => i !== indice);
  const atual = Math.min(estado.atual, linhas.length - 1);

  return { linhas, atual };
}

export function vazia(estado: Linhas): boolean {
  return estado.linhas.length === 1 && estado.linhas[0]!.arvore.tipo === 'buraco';
}
