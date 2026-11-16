/**
 * A chave de tradução de um texto que carrega números.
 *
 * As descrições de passo e as dicas são escritas com os dados embutidos —
 * «Substituímos x por 3 em cada termo.», «O seno vale no máximo 1.» —, e por
 * isso há milhares de variantes da MESMA frase. Um dicionário indexado pelo
 * texto literal precisaria de uma entrada por combinação de números, e foi
 * exatamente assim que o dicionário antigo nasceu quebrado: ele guardava o
 * código-fonte (`${x}`) em vez do texto que chega à tela.
 *
 * Aqui todo número vira um curinga, `#`. A entrada do dicionário é a frase com
 * `#` no lugar dos números, e a tradução também traz `#`, na mesma ordem — a
 * mesma exigência que o banco de enunciados já faz das três línguas. Na hora de
 * exibir, os números do texto original voltam para as posições dos curingas.
 *
 * O separador decimal entra na conta: `7,5` e `7.5` são o mesmo número, e o
 * curinga engole os dois. Também o sinal: `-3` é um número, não um hífen.
 */

/** O curinga. Escolhido porque não aparece em texto matemático em português. */
export const CURINGA = '#';

const NUMERO = /-?\d+(?:[.,]\d+)?/g;

/** Os números de um texto, na ordem em que aparecem, como estão escritos. */
export function numerosDe(texto: string): readonly string[] {
  return texto.match(NUMERO) ?? [];
}

/** O texto com cada número trocado pelo curinga. É a chave do dicionário. */
export function normalizarTexto(texto: string): string {
  return texto.replace(NUMERO, CURINGA);
}

/**
 * Devolve os números do texto original às posições dos curingas da tradução.
 *
 * Um curinga a mais na tradução do que no original fica como está — é erro de
 * quem traduziu, e o guarda do dicionário reprova antes de chegar aqui. Um
 * curinga a menos simplesmente não recebe número.
 */
export function vestirCuringas(traducao: string, numeros: readonly string[]): string {
  let proximo = 0;
  return traducao.replace(new RegExp(CURINGA, 'g'), (inteiro) => numeros[proximo++] ?? inteiro);
}
