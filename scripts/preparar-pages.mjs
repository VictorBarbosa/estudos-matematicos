/**
 * Ajustes que o GitHub Pages exige de uma aplicação Angular.
 *
 * O Pages serve arquivos estáticos, sem servidor que reescreva rotas. Duas
 * consequências práticas:
 *
 * 1. Abrir /fisica/propulsao-de-foguetes direto na barra de endereços pede ao
 *    servidor um arquivo que não existe. A saída conhecida é entregar o
 *    próprio index.html como página 404: o Angular recebe o documento, lê a
 *    URL e resolve a rota no cliente.
 * 2. O Pages passa o conteúdo pelo Jekyll por padrão, que descarta pastas e
 *    arquivos começados por underscore. O arquivo .nojekyll desliga isso.
 */
import { copyFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const saida = process.argv[2] ?? 'dist/EstudosMatematicos/browser';

await copyFile(join(saida, 'index.html'), join(saida, '404.html'));
await writeFile(join(saida, '.nojekyll'), '');

console.log(`GitHub Pages preparado em ${saida}: 404.html e .nojekyll criados.`);
