/**
 * Nenhuma PALAVRA em português entra num molde como se fosse um número.
 *
 * O molde está nas três línguas, mas a lacuna recebe o que o gerador manda —
 * e durante muito tempo o que ele mandava era «retângulo», «SÉRIE», «o
 * dobro». A frase era traduzida, a palavra no meio dela não: o enunciado
 * inglês dizia «Ana has the dobro of Bia's age».
 *
 * A saída, quando as variações são poucas, é um molde por variação; quando
 * são dezenas, é `enunciadoDoMoldePorIdioma`, que dá à mesma lacuna o valor
 * de cada língua. Este guarda reprova o que voltar ao caminho antigo.
 *
 * O que ele procura, dentro de uma chamada de molde:
 * - um literal com ESPAÇO ou ACENTO («no MESMO sentido», «água»), que é
 *   texto, não notação — o nome de uma forma é kebab-case e passa;
 * - um valor lido de um campo de nome (`.nome`, `.material`, `.descricao`),
 *   que é como os catálogos guardavam a palavra.
 *
 * Fora de `enunciadoDoMoldePorIdioma`, onde o português é o valor da tela
 * portuguesa e as outras línguas têm o seu.
 */
import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';

/*
 * Os geradores vivem em `features`, e o motor de cenas vive em
 * `core/treino/cenas` — é ele que mais injeta, porque a cena põe o nome de
 * cada lado na lacuna. Varrer só `features` deixaria cego exatamente o lugar
 * onde a palavra portuguesa tem mais chance de passar.
 */
const ARQUIVOS = [
  ...globSync('src/app/features/**/*.ts'),
  ...globSync('src/app/core/treino/**/*.ts'),
].filter((a) => !a.endsWith('.spec.ts'));

const CHAMADA =
  /(?:textoDoMolde|enunciadoDoMolde|textosDoMolde|traducoesDoMolde|enunciadoComSufixos)\s*\(/g;
const ACENTO = /[çãõáéíóúâêôàÇÃÕÁÉÍÓÚÂÊÔÀ]/;

const achados = [];

for (const arquivo of ARQUIVOS) {
  const codigo = readFileSync(arquivo, 'utf8');

  for (const chamada of codigo.matchAll(CHAMADA)) {
    // Recorta a chamada inteira, equilibrando os parênteses.
    let i = chamada.index + chamada[0].length;
    let nivel = 1;
    while (i < codigo.length && nivel > 0) {
      if (codigo[i] === '(') nivel += 1;
      else if (codigo[i] === ')') nivel -= 1;
      i += 1;
    }
    const trecho = codigo.slice(chamada.index + chamada[0].length, i);

    for (const literal of trecho.matchAll(/'([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ ]{2,})'/g)) {
      const texto = literal[1];
      if (texto.includes(' ') || ACENTO.test(texto)) {
        achados.push(`${arquivo}: «${texto}»`);
      }
    }

    for (const campo of trecho.matchAll(/[\w$]+\s*:\s*[\w$.]*\.(nome|descricao|adjetivo|material)\b/g)) {
      achados.push(`${arquivo}: valor vindo de .${campo[1]}`);
    }
  }
}

if (achados.length > 0) {
  console.error(`Palavras em português injetadas em moldes (${achados.length}):`);
  for (const achado of [...new Set(achados)].slice(0, 20)) {
    console.error(`  ${achado}`);
  }
  process.exit(1);
}

console.log(`Moldes sem palavra injetada: ${ARQUIVOS.length} arquivos conferidos.`);
