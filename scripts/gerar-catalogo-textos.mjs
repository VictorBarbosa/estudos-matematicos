// Junta os dicionários de tópico num catálogo que só os testes importam.
//
// Cada tópico guarda o seu `<nome>.i18n.json` ao lado do template, para viajar
// no mesmo pedaço preguiçoso. Isso é bom para quem usa o site e ruim para quem
// quer conferir os 101 de uma vez: daí este índice, que a trava de integridade
// percorre. Ele não entra no pacote — nenhum código de produção o importa.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const RAIZ = new URL('..', import.meta.url).pathname;
const FEATURES = join(RAIZ, 'src/app/features');
const DESTINO = join(RAIZ, 'src/app/core/i18n/textos.catalogo/textos.catalogo.ts');

function procurar(pasta) {
  const achados = [];
  for (const entrada of readdirSync(pasta, { withFileTypes: true })) {
    const caminho = join(pasta, entrada.name);
    if (entrada.isDirectory()) {
      achados.push(...procurar(caminho));
    } else if (entrada.name.endsWith('.i18n.json')) {
      achados.push(caminho);
    }
  }
  return achados;
}

const arquivos = procurar(FEATURES).sort();
const linhas = arquivos.map((caminho) => {
  const relativo = relative(join(RAIZ, 'src/app'), caminho).replace(/\\/g, '/');
  const alias = '@' + relativo.replace(/^features\//, 'features/');
  const nome = 't_' + relativo.split('/').at(-1).replace('.i18n.json', '').replace(/-/g, '_');
  return { alias, nome, chave: relativo.split('/').at(-1).replace('.i18n.json', '') };
});

const conteudo = `// Gerado por scripts/gerar-catalogo-textos.mjs — não editar à mão.
//
// Rode \`npm run gerar:textos\` depois de criar ou remover um \`*.i18n.json\`.
// Só \`textos.spec.ts\` importa este arquivo; ele não vai para o pacote.
import { TabelaDeTextos } from '@core/i18n/textos-locais';

${linhas.map((l) => `import ${l.nome} from '${l.alias}';`).join('\n')}

/** Cada tópico e o dicionário que viaja com ele. */
export const TODOS_OS_TEXTOS: ReadonlyMap<string, TabelaDeTextos> = new Map([
${linhas.map((l) => `  ['${l.chave}', ${l.nome} as TabelaDeTextos],`).join('\n')}
]);
`;

writeFileSync(DESTINO, conteudo);
console.log(`${linhas.length} dicionários de tópico no catálogo.`);
