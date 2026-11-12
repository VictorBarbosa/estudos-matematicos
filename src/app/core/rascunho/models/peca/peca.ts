/**
 * As peças do monta monta, e a árvore que elas formam.
 *
 * No celular não há como escrever nem desenhar: com o dedo, numa tela de
 * 390 px, armar uma conta é pior que qualquer caderno. Então aqui não se
 * escreve — **encaixa-se**. Cada linha de conta é uma árvore de peças que nasce
 * como um buraco só, e cresce quando uma peça entra nele.
 *
 * Que a linha seja árvore, e não texto, resolve dois problemas de uma vez: ela
 * já nasce desenhada certa — a barra da fração no lugar, o parêntese que a
 * precedência exige — e não há texto para analisar, logo não é preciso
 * converter nada em LaTeX para mostrá-la.
 *
 * **Os nós são imutáveis**, como o resto dos modelos do projeto. Toda operação
 * devolve árvore nova, e por isso a linha copiada pode compartilhar nós com a
 * original sem risco: editar uma não alcança a outra.
 *
 * **O nó não guarda ponteiro para o pai.** Quem aponta é o `Caminho`, a lista
 * de índices desde a raiz. Sem ponteiro não há ciclo, a serialização é JSON
 * puro e a cópia de uma linha não duplica identidade nenhuma — em troca, toda
 * edição invalida o caminho, e é por isso que as ações de `montagem` devolvem
 * árvore e seleção juntas.
 */

/** Os operadores que entram numa conta em linha. */
export type Operador = '+' | '-' | '*' | '/';

/**
 * Um nó da conta.
 *
 * A fração é um nó à parte do operador `/` de propósito: as duas são a mesma
 * matemática e desenhos diferentes — uma empilha, a outra corre na linha —, e é
 * o aluno quem escolhe qual quer ver.
 */
export type Arvore =
  | { readonly tipo: 'buraco' }
  | { readonly tipo: 'numero'; readonly algarismos: string; readonly negativo: boolean }
  | { readonly tipo: 'incognita' }
  | {
      readonly tipo: 'operacao';
      readonly operador: Operador;
      readonly esquerda: Arvore;
      readonly direita: Arvore;
    }
  | { readonly tipo: 'fracao'; readonly numerador: Arvore; readonly denominador: Arvore }
  | { readonly tipo: 'igualdade'; readonly esquerda: Arvore; readonly direita: Arvore };

/** Onde está a seleção: os índices de filho, da raiz até o nó. */
export type Caminho = readonly number[];

export const BURACO: Arvore = { tipo: 'buraco' };

/** A raiz de uma linha nova. */
export const RAIZ: Caminho = [];

export function ehBuraco(no: Arvore): boolean {
  return no.tipo === 'buraco';
}

/** Um nó sem filhos: buraco, número ou incógnita. */
export function ehFolha(no: Arvore): boolean {
  return no.tipo === 'buraco' || no.tipo === 'numero' || no.tipo === 'incognita';
}

/** Os filhos, na ordem em que são desenhados. */
export function filhosDe(no: Arvore): readonly Arvore[] {
  switch (no.tipo) {
    case 'operacao':
    case 'igualdade':
      return [no.esquerda, no.direita];
    case 'fracao':
      return [no.numerador, no.denominador];
    default:
      return [];
  }
}

/** O mesmo nó com outros filhos. Quem não tem filhos volta inteiro. */
export function comFilhos(no: Arvore, filhos: readonly Arvore[]): Arvore {
  switch (no.tipo) {
    case 'operacao':
      return { ...no, esquerda: filhos[0] ?? BURACO, direita: filhos[1] ?? BURACO };
    case 'igualdade':
      return { ...no, esquerda: filhos[0] ?? BURACO, direita: filhos[1] ?? BURACO };
    case 'fracao':
      return { ...no, numerador: filhos[0] ?? BURACO, denominador: filhos[1] ?? BURACO };
    default:
      return no;
  }
}

/** O nó que o caminho aponta, ou `null` se o caminho não existe mais. */
export function noEm(arvore: Arvore, caminho: Caminho): Arvore | null {
  let atual: Arvore = arvore;

  for (const indice of caminho) {
    const filho = filhosDe(atual)[indice];
    if (filho === undefined) {
      return null;
    }
    atual = filho;
  }

  return atual;
}

/** A árvore com o nó daquele caminho trocado por outro. */
export function trocarEm(arvore: Arvore, caminho: Caminho, novo: Arvore): Arvore {
  if (caminho.length === 0) {
    return novo;
  }

  const [indice, ...resto] = caminho;
  const filhos = filhosDe(arvore);
  const alvo = filhos[indice!];

  if (alvo === undefined) {
    return arvore;
  }

  const trocados = filhos.map((filho, i) => (i === indice ? trocarEm(alvo, resto, novo) : filho));

  return comFilhos(arvore, trocados);
}

/** O caminho do pai, ou `null` para a raiz. */
export function paiDe(caminho: Caminho): Caminho | null {
  return caminho.length === 0 ? null : caminho.slice(0, -1);
}

/**
 * Quantas frações estão encaixadas uma dentro da outra.
 *
 * **Só a fração conta.** É a única estrutura desta fase que cresce para cima e
 * para baixo: ela tem o dobro da altura do filho, e três níveis dentro de uma
 * folha tocável de 44 px já consomem a tela inteira, sem sobrar lugar para a
 * pilha de passos — que é o conceito. Soma, produto e igualdade correm na linha
 * e não custam altura nenhuma, então limitá-las seria barrar `2x + 3 = 11`, que
 * é justamente o caso de uso.
 */
export function profundidadeVertical(no: Arvore): number {
  const filhos = filhosDe(no).map(profundidadeVertical);
  const dentro = filhos.length === 0 ? 0 : Math.max(...filhos);

  return no.tipo === 'fracao' ? dentro + 1 : dentro;
}

/**
 * Quantas igualdades a linha tem, em qualquer profundidade.
 *
 * Contar em toda a árvore, e não só na raiz, é o que impede `(2 = 3) + ? = ?`:
 * bastava envolver a igualdade da raiz numa soma para a raiz deixar de ser
 * igualdade e o lugar voltar a parecer livre.
 */
export function contarIgualdades(no: Arvore): number {
  const dentro = filhosDe(no).reduce((total, filho) => total + contarIgualdades(filho), 0);

  return no.tipo === 'igualdade' ? dentro + 1 : dentro;
}

/**
 * A linha respeita o que a montagem garante?
 *
 * Uma igualdade, e na raiz; e frações aninhadas dentro do teto. Serve à leitura
 * do disco, onde a árvore pode ter vindo de uma versão com outras regras — ou de
 * uma mão alheia.
 */
export function linhaCoerente(arvore: Arvore, limiteDeFracoes: number): boolean {
  if (profundidadeVertical(arvore) > limiteDeFracoes) {
    return false;
  }

  const igualdades = contarIgualdades(arvore);

  if (igualdades === 0) {
    return true;
  }

  return igualdades === 1 && arvore.tipo === 'igualdade';
}

/** Todos os caminhos da árvore, em ordem de leitura (o nó antes dos filhos). */
export function caminhosDe(arvore: Arvore, raiz: Caminho = RAIZ): readonly Caminho[] {
  const filhos = filhosDe(arvore);
  const descendentes = filhos.flatMap((filho, indice) => caminhosDe(filho, [...raiz, indice]));

  return [raiz, ...descendentes];
}

/** Os caminhos dos buracos, em ordem de leitura. */
export function buracosDe(arvore: Arvore): readonly Caminho[] {
  return caminhosDe(arvore).filter((caminho) => {
    const no = noEm(arvore, caminho);
    return no !== null && ehBuraco(no);
  });
}

/**
 * O buraco seguinte, dando a volta.
 *
 * É o que o botão `⇥` da bandeja usa, e é o que faz o avanço automático
 * funcionar: depois de encaixar uma peça, a seleção cai no próximo buraco em
 * vez de esperar um toque para isso.
 */
export function proximoBuraco(arvore: Arvore, depois: Caminho): Caminho | null {
  const buracos = buracosDe(arvore);
  if (buracos.length === 0) {
    return null;
  }

  const chave = depois.join('.');
  const ordem = caminhosDe(arvore).map((caminho) => caminho.join('.'));
  const posicao = ordem.indexOf(chave);

  const seguinte = buracos.find((buraco) => ordem.indexOf(buraco.join('.')) > posicao);

  return seguinte ?? buracos[0]!;
}

/** Precedência, para decidir onde o parêntese é necessário. */
function precedenciaDe(no: Arvore): number {
  switch (no.tipo) {
    case 'igualdade':
      return 0;
    case 'operacao':
      return no.operador === '+' || no.operador === '-' ? 1 : 2;
    default:
      // Número, incógnita, buraco e fração já se leem como um bloco só.
      return 3;
  }
}

/**
 * O filho precisa de parêntese dentro do pai?
 *
 * **Parêntese não é peça.** Numa árvore o agrupamento já está na estrutura, e
 * oferecer `(` e `)` na bandeja — como fazia o plano enquanto ele era um
 * teclado — permitiria escrever parêntese desemparelhado, que não quer dizer
 * nada. Aqui ele é desenho derivado da precedência, e por isso não há como
 * errá-lo.
 *
 * O lado direito de `−` e de `/` também pede parêntese quando empata na
 * precedência: `a − (b − c)` não é `a − b − c`.
 */
export function precisaParenteses(pai: Arvore, filho: Arvore, ladoDireito: boolean): boolean {
  const dentro = precedenciaDe(filho);
  const fora = precedenciaDe(pai);

  if (dentro < fora) {
    return true;
  }

  if (dentro > fora || pai.tipo !== 'operacao') {
    return false;
  }

  const naoAssociativo = pai.operador === '-' || pai.operador === '/';

  return ladoDireito && naoAssociativo;
}

/**
 * O produto se desenha sem o sinal?
 *
 * `2x` é como se escreve no papel, e é o que o aluno espera ver depois de
 * encaixar o `2` e o `x`. A regra é estreita de propósito — número à esquerda,
 * incógnita à direita —, porque `x·x` virando `xx` confundiria em vez de
 * abreviar.
 */
export function produtoImplicito(no: Arvore): boolean {
  return (
    no.tipo === 'operacao' &&
    no.operador === '*' &&
    no.esquerda.tipo === 'numero' &&
    no.direita.tipo === 'incognita'
  );
}

/** O número como se lê: sinal, algarismos e a vírgula que o aluno pôs. */
export function textoDoNumero(no: Extract<Arvore, { tipo: 'numero' }>): string {
  const corpo = no.algarismos === '' ? '0' : no.algarismos;

  return no.negativo ? `-${corpo}` : corpo;
}

/**
 * O número para quem vai fazer conta com ele: sem a vírgula pendurada.
 *
 * Na tela `5,` é um número em composição, e mostrá-lo assim é honesto — o aluno
 * está no meio de escrevê-lo. Num texto a ser analisado, `5.` não casa com o
 * número que o corretor do treino reconhece, e a conferência diria «não sei
 * conferir» por causa de uma vírgula que o aluno ia preencher.
 */
function numeroParaConta(no: Extract<Arvore, { tipo: 'numero' }>): string {
  const corpo = (no.algarismos === '' ? '0' : no.algarismos).replace(/,$/, '');

  return no.negativo ? `-${corpo}` : corpo;
}

/**
 * A linha como texto, na gramática que o corretor do treino já lê.
 *
 * Serve aos rótulos falados, e é o que a conferência de igualdade vai usar
 * quando chegar: partir no `=` e entregar cada lado a `analisarSimbolica`, sem
 * um segundo motor matemático. Cuidado ao usá-la: este texto vem do aluno, e
 * `formula.ts` confia no LaTeX justamente porque ele nunca vem de fora.
 */
export function paraTexto(no: Arvore): string {
  switch (no.tipo) {
    case 'buraco':
      return '?';
    case 'numero':
      return numeroParaConta(no);
    case 'incognita':
      return 'x';
    case 'fracao':
      return `(${paraTexto(no.numerador)})/(${paraTexto(no.denominador)})`;
    case 'igualdade':
      return `${paraTexto(no.esquerda)} = ${paraTexto(no.direita)}`;
    case 'operacao': {
      const esquerda = parentizar(no, no.esquerda, false);
      const direita = parentizar(no, no.direita, true);

      return produtoImplicito(no)
        ? `${esquerda}${direita}`
        : `${esquerda} ${no.operador} ${direita}`;
    }
  }
}

function parentizar(pai: Arvore, filho: Arvore, ladoDireito: boolean): string {
  const texto = paraTexto(filho);

  return precisaParenteses(pai, filho, ladoDireito) ? `(${texto})` : texto;
}
