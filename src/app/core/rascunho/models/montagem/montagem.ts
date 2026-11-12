import {
  Arvore,
  BURACO,
  Caminho,
  Operador,
  RAIZ,
  buracosDe,
  ehBuraco,
  noEm,
  paiDe,
  profundidadeVertical,
  proximoBuraco,
  trocarEm,
} from '../peca/peca';

/**
 * As ações do monta monta.
 *
 * Três gestos, e dois deles são o mesmo toque: tocar numa peça da bandeja
 * **encaixa**, se o que está selecionado é um buraco, e **envolve**, se é uma
 * peça já montada. Não há botão de modo nem menu — o que decide é a seleção.
 *
 * É o envolver que faz a álgebra andar. Dividir os dois lados por 2 é
 * selecionar `2x`, tocar em `÷` e encaixar `2`; depois selecionar `8`, tocar em
 * `÷` e encaixar `2`. **Quem decidiu dividir por 2 foi o aluno** — aqui só se
 * desenha o que ele mandou.
 *
 * O que estas funções NUNCA fazem: escolher peça, preencher buraco, calcular
 * resultado, sugerir passo, simplificar. O atalho de foco de `encaixar` — ver
 * `redirecionarParaBuracoUnico` — é a única esperteza, e ele move o foco, não
 * decide conteúdo.
 */

/** Uma linha em edição: a árvore e onde está a seleção. */
export interface Montagem {
  readonly arvore: Arvore;
  readonly selecao: Caminho;
}

/** Por que uma ação não teve efeito. A interface avisa; nada acontece. */
export type Recusa = 'profundidade' | 'igualdade-repetida' | 'sem-efeito';

export interface Resultado {
  readonly montagem: Montagem;
  readonly recusa: Recusa | null;
}

/**
 * Quantas frações podem ficar uma dentro da outra.
 *
 * Três, e o motivo é geométrico: alvo tocável e aninhamento se excluem. Uma
 * fração tem o dobro da altura do filho, então três níveis com folha de 44 px
 * já tomam a tela inteira; encolher os níveis, como a tipografia manda, levaria
 * a peça a 5 px no terceiro — ilegível e intocável. Aqui nada encolhe, e em
 * troca a profundidade tem teto.
 */
export const LIMITE_DE_FRACOES = 3;

/** O que a bandeja oferece. */
export type Peca =
  | { readonly tipo: 'algarismo'; readonly valor: string }
  | { readonly tipo: 'virgula' }
  | { readonly tipo: 'sinal' }
  | { readonly tipo: 'incognita' }
  | { readonly tipo: 'operacao'; readonly operador: Operador }
  | { readonly tipo: 'fracao' }
  | { readonly tipo: 'igualdade' }
  /** Atalho: `▢x`, o coeficiente vezes a incógnita, que aparece em quase toda linha. */
  | { readonly tipo: 'coeficiente' };

/** Uma linha nova: um buraco só, selecionado. */
export const MONTAGEM_VAZIA: Montagem = { arvore: BURACO, selecao: RAIZ };

export function montagemDe(arvore: Arvore): Montagem {
  return { arvore, selecao: RAIZ };
}

function sem(montagem: Montagem, recusa: Recusa): Resultado {
  return { montagem, recusa };
}

function feito(arvore: Arvore, selecao: Caminho): Resultado {
  return { montagem: { arvore, selecao }, recusa: null };
}

/**
 * Encaixa a peça no que está selecionado — ou a envolve em volta dele.
 *
 * Se a seleção é buraco, a peça entra nele. Se é uma peça já montada e a peça
 * nova é estrutura, a montada vira o primeiro filho da estrutura e a seleção
 * cai no buraco que sobrou — é assim que se divide os dois lados por 2.
 */
export function encaixar(montagem: Montagem, peca: Peca): Resultado {
  const alvo = noEm(montagem.arvore, montagem.selecao);
  if (alvo === null) {
    return sem(montagem, 'sem-efeito');
  }

  switch (peca.tipo) {
    case 'algarismo':
      return algarismo(montagem, alvo, peca.valor);
    case 'virgula':
      return algarismo(montagem, alvo, ',');
    case 'sinal':
      return sinal(montagem, alvo);
    case 'incognita':
      return incognita(montagem, alvo);
    case 'coeficiente':
      return coeficiente(montagem, alvo);
    case 'operacao':
      return estrutura(montagem, alvo, (dentro) => ({
        tipo: 'operacao',
        operador: peca.operador,
        esquerda: dentro,
        direita: BURACO,
      }));
    case 'fracao':
      return estrutura(montagem, alvo, (dentro) => ({
        tipo: 'fracao',
        numerador: dentro,
        denominador: BURACO,
      }));
    case 'igualdade':
      return igualdade(montagem);
  }
}

/**
 * Quando há um buraco só na árvore, a peça entra nele sem o toque de seleção.
 *
 * É um dos três atalhos que derrubam a primeira linha de quinze toques para uns
 * nove — e quinze é o número que decide se a ferramenta é usada ou abandonada.
 * Ele vale só para peça-átomo: com estrutura, a peça selecionada precisa
 * continuar sendo envolvida, que é a ação que faz a álgebra andar.
 */
function redirecionarParaBuracoUnico(montagem: Montagem): Caminho | null {
  const buracos = buracosDe(montagem.arvore);

  return buracos.length === 1 ? buracos[0]! : null;
}

function comAtalho(montagem: Montagem, alvo: Arvore): { alvo: Arvore; selecao: Caminho } {
  /*
   * O número em composição ganha do atalho, e tem de ganhar.
   *
   * Com a regra ao contrário, um número de dois algarismos seria impossível
   * sempre que houvesse outro buraco na árvore: o segundo algarismo pularia
   * para lá. Então algarismo tocado sobre número continua no mesmo número, e
   * quem quer sair dele usa `⇥` — é o mesmo gesto de qualquer calculadora.
   */
  if (ehBuraco(alvo) || alvo.tipo === 'numero') {
    return { alvo, selecao: montagem.selecao };
  }

  const unico = redirecionarParaBuracoUnico(montagem);
  if (unico === null) {
    return { alvo, selecao: montagem.selecao };
  }

  return { alvo: BURACO, selecao: unico };
}

/**
 * Um algarismo (ou a vírgula) entra no buraco, ou se junta ao número.
 *
 * `487` são três toques no mesmo nó, e não três peças: a peça é o algarismo, e
 * é o número que os acumula. A composição termina quando a seleção sai dele.
 */
function algarismo(montagem: Montagem, original: Arvore, valor: string): Resultado {
  const { alvo, selecao } = comAtalho(montagem, original);

  if (alvo.tipo === 'numero') {
    // Uma vírgula só por número: `1,2,3` não é número nenhum.
    if (valor === ',' && alvo.algarismos.includes(',')) {
      return sem(montagem, 'sem-efeito');
    }

    const juntos = alvo.algarismos + valor;
    const novo: Arvore = { ...alvo, algarismos: juntos };

    return feito(trocarEm(montagem.arvore, selecao, novo), selecao);
  }

  if (!ehBuraco(alvo)) {
    return sem(montagem, 'sem-efeito');
  }

  // A vírgula sozinha não começa número: `,5` não se escreve assim no papel.
  const algarismos = valor === ',' ? '0,' : valor;
  const novo: Arvore = { tipo: 'numero', algarismos, negativo: false };

  return feito(trocarEm(montagem.arvore, selecao, novo), selecao);
}

/** O `±` troca o sinal do número selecionado. */
function sinal(montagem: Montagem, alvo: Arvore): Resultado {
  if (alvo.tipo !== 'numero') {
    return sem(montagem, 'sem-efeito');
  }

  const novo: Arvore = { ...alvo, negativo: !alvo.negativo };

  return feito(trocarEm(montagem.arvore, montagem.selecao, novo), montagem.selecao);
}

/**
 * A incógnita entra no buraco — ou multiplica o número que está selecionado.
 *
 * Tocar `2` e depois `x` dá `2x`, que é o que essa sequência significa no
 * papel. Não é a ferramenta decidindo: justapor número e letra é a notação, e o
 * aluno a escreveu.
 */
function incognita(montagem: Montagem, original: Arvore): Resultado {
  const { alvo, selecao } = comAtalho(montagem, original);

  if (alvo.tipo === 'numero') {
    const produto: Arvore = {
      tipo: 'operacao',
      operador: '*',
      esquerda: alvo,
      direita: { tipo: 'incognita' },
    };

    return feito(trocarEm(montagem.arvore, selecao, produto), [...selecao, 1]);
  }

  if (!ehBuraco(alvo)) {
    return sem(montagem, 'sem-efeito');
  }

  return feito(trocarEm(montagem.arvore, selecao, { tipo: 'incognita' }), selecao);
}

/** `▢x`: o produto já montado, com o coeficiente esperando. */
function coeficiente(montagem: Montagem, alvo: Arvore): Resultado {
  if (!ehBuraco(alvo)) {
    return sem(montagem, 'sem-efeito');
  }

  const produto: Arvore = {
    tipo: 'operacao',
    operador: '*',
    esquerda: BURACO,
    direita: { tipo: 'incognita' },
  };

  return feito(trocarEm(montagem.arvore, montagem.selecao, produto), [...montagem.selecao, 0]);
}

/**
 * Operação e fração: encaixa no buraco, ou envolve a peça selecionada.
 *
 * `montar` recebe o que vai para o primeiro filho — um buraco, quando se
 * encaixa; a peça selecionada, quando se envolve.
 */
function estrutura(
  montagem: Montagem,
  alvo: Arvore,
  montar: (dentro: Arvore) => Arvore,
): Resultado {
  const dentro = ehBuraco(alvo) ? BURACO : alvo;
  const nova = montar(dentro);
  const arvore = trocarEm(montagem.arvore, montagem.selecao, nova);

  if (profundidadeVertical(arvore) > LIMITE_DE_FRACOES) {
    return sem(montagem, 'profundidade');
  }

  // Encaixando, a seleção vai ao primeiro buraco; envolvendo, ao que sobrou.
  const indice = ehBuraco(alvo) ? 0 : 1;

  return feito(arvore, [...montagem.selecao, indice]);
}

/**
 * A igualdade envolve a linha inteira, onde quer que esteja a seleção.
 *
 * Ela é a única peça que não obedece à seleção, e não é esperteza: `=` separa
 * os dois lados da conta, logo só pode existir na raiz — envolver uma
 * subexpressão daria `3 + (x = ▢)`, que não é nada. Como o lugar é único, não
 * há escolha a fazer, e exigir que o aluno primeiro subisse até a raiz seria
 * cobrar um toque para chegar ao único destino possível.
 *
 * Repetir, sim, é recusado: duas igualdades numa linha não são uma conta.
 */
function igualdade(montagem: Montagem): Resultado {
  const raiz = montagem.arvore;

  if (raiz.tipo === 'igualdade') {
    return sem(montagem, 'igualdade-repetida');
  }

  const dentro = ehBuraco(raiz) ? BURACO : raiz;
  const nova: Arvore = { tipo: 'igualdade', esquerda: dentro, direita: BURACO };
  const indice = ehBuraco(raiz) ? 0 : 1;

  return feito(trocarEm(montagem.arvore, RAIZ, nova), [indice]);
}

/** A peça selecionada volta a ser buraco. */
export function apagar(montagem: Montagem): Resultado {
  const alvo = noEm(montagem.arvore, montagem.selecao);

  if (alvo === null || ehBuraco(alvo)) {
    return sem(montagem, 'sem-efeito');
  }

  return feito(trocarEm(montagem.arvore, montagem.selecao, BURACO), montagem.selecao);
}

/**
 * `⇄`: troca os lados da operação selecionada.
 *
 * Sem isto, envolver `2x` com `−` só produziria `2x − ▢`, e `3 − 2x` não teria
 * caminho nenhum. Vale também na fração e nas operações comutativas, onde não
 * muda o valor — mas muda o que está escrito, e quem escreve é o aluno.
 */
export function virarLados(montagem: Montagem): Resultado {
  const alvo = noEm(montagem.arvore, montagem.selecao);
  if (alvo === null) {
    return sem(montagem, 'sem-efeito');
  }

  if (alvo.tipo === 'operacao' || alvo.tipo === 'igualdade') {
    const virado: Arvore = { ...alvo, esquerda: alvo.direita, direita: alvo.esquerda };
    return feito(trocarEm(montagem.arvore, montagem.selecao, virado), montagem.selecao);
  }

  if (alvo.tipo === 'fracao') {
    const virado: Arvore = {
      ...alvo,
      numerador: alvo.denominador,
      denominador: alvo.numerador,
    };
    return feito(trocarEm(montagem.arvore, montagem.selecao, virado), montagem.selecao);
  }

  return sem(montagem, 'sem-efeito');
}

/** `⬆`: a seleção sobe para o nó de fora. */
export function subirNivel(montagem: Montagem): Resultado {
  const pai = paiDe(montagem.selecao);

  if (pai === null) {
    return sem(montagem, 'sem-efeito');
  }

  return feito(montagem.arvore, pai);
}

/** `⇥`: a seleção vai ao próximo buraco, dando a volta. */
export function irAoProximoBuraco(montagem: Montagem): Resultado {
  const seguinte = proximoBuraco(montagem.arvore, montagem.selecao);

  if (seguinte === null) {
    return sem(montagem, 'sem-efeito');
  }

  return feito(montagem.arvore, seguinte);
}

/** Põe a seleção num caminho escolhido na tela. */
export function selecionar(montagem: Montagem, caminho: Caminho): Resultado {
  if (noEm(montagem.arvore, caminho) === null) {
    return sem(montagem, 'sem-efeito');
  }

  return feito(montagem.arvore, caminho);
}

/**
 * Depois de encaixar um átomo, a seleção cai no próximo buraco.
 *
 * É o terceiro atalho de toque, no feitio do campo de código de verificação:
 * quem acabou de pôr um algarismo quer o buraco seguinte, não o que acabou de
 * preencher. Número em composição é a exceção — ali os algarismos continuam
 * entrando no mesmo nó.
 */
export function avancarSePreciso(resultado: Resultado, peca: Peca): Resultado {
  if (resultado.recusa !== null) {
    return resultado;
  }

  const emComposicao =
    peca.tipo === 'algarismo' || peca.tipo === 'virgula' || peca.tipo === 'sinal';

  if (emComposicao) {
    return resultado;
  }

  const atual = noEm(resultado.montagem.arvore, resultado.montagem.selecao);
  if (atual !== null && ehBuraco(atual)) {
    return resultado;
  }

  return irAoProximoBuraco(resultado.montagem);
}
