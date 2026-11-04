// Junta as chaves que o código pede ao dicionário global, para os testes conferirem.
//
// Uma chave que falta no dicionário não quebra nada: `t()` devolve a própria
// chave, e o rótulo aparece como `folha.desfazer` na tela. Já aconteceu. O
// compilador não vê isso, e o teste não pode ler o disco — daí esta lista,
// gerada do código e percorrida por `i18n.spec.ts`. Não entra no pacote.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const RAIZ = new URL('..', import.meta.url).pathname;
const APP = join(RAIZ, 'src/app');
const DESTINO = join(RAIZ, 'src/app/core/i18n/textos.catalogo/chaves-usadas.ts');

/**
 * Só o que o dicionário global atende: `i18n.t('alguma.chave')` escrito à mão.
 *
 * O `[,)]` no fim é o que separa a chave inteira do prefixo de uma chave
 * montada — `i18n.t('corpo.' + nome)` não é chave nenhuma, e conferi-la
 * acusaria falta onde não há.
 */
const PEDIDO = /i18n\.t\(\s*'([a-zA-Z0-9_.]+)'\s*[,)]/g;

function procurar(pasta) {
  const achados = [];
  for (const entrada of readdirSync(pasta, { withFileTypes: true })) {
    const caminho = join(pasta, entrada.name);
    if (entrada.isDirectory()) {
      achados.push(...procurar(caminho));
    } else if (/\.(ts|html)$/.test(entrada.name) && !entrada.name.endsWith('.spec.ts')) {
      achados.push(caminho);
    }
  }
  return achados;
}

const usos = new Map();
for (const caminho of procurar(APP)) {
  const texto = readFileSync(caminho, 'utf8');
  const onde = relative(APP, caminho).replace(/\\/g, '/');
  for (const [, chave] of texto.matchAll(PEDIDO)) {
    if (!usos.has(chave)) usos.set(chave, onde);
  }
}

const ordenadas = [...usos].sort(([a], [b]) => a.localeCompare(b));
const conteudo = `// Gerado por scripts/gerar-chaves-usadas.mjs — não editar à mão.
//
// Rode \`npm run gerar:chaves\` depois de usar uma chave nova no código.
// Só \`i18n.spec.ts\` importa este arquivo; ele não vai para o pacote.

/** Cada chave pedida ao dicionário global e um arquivo onde ela aparece. */
export const CHAVES_USADAS: readonly (readonly [string, string])[] = [
${ordenadas.map(([chave, onde]) => `  ['${chave}', '${onde}'],`).join('\n')}
];
`;

writeFileSync(DESTINO, conteudo);
console.log(`${ordenadas.length} chaves globais em uso.`);
