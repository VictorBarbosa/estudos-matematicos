/**
 * Gera o índice de conceitos a partir dos arquivos `*.teoria.ts`.
 *
 * O modal de teoria pode ser aberto por um link "Veja também" que aponta para
 * um conceito de OUTRO tópico. Sem este índice, o botão mostrava o id cru
 * (`limite.intuicao`) e abria um modal vazio, porque a teoria daquele tópico
 * só era registrada quando o próprio tópico fosse visitado.
 *
 * O índice traz duas coisas pequenas — o título de cada conceito e a qual
 * tópico ele pertence — e um carregador sob demanda por tópico. Assim os 355 KB
 * de teoria continuam fora do bundle inicial.
 *
 * Uso: `npm run gerar:teorias`. O teste `teorias.spec.ts` falha se o índice
 * sair de sincronia com os arquivos.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const RAIZ = new URL('..', import.meta.url).pathname;
const SAIDA = 'src/app/core/teoria/registro-teorias/registro-teorias.ts';

const arquivos = execSync('find src/app/features -name "*.teoria.ts"', {
  cwd: RAIZ,
  encoding: 'utf8',
})
  .trim()
  .split('\n')
  .sort();

const topicos = arquivos.map((caminho) => {
  const fonte = readFileSync(RAIZ + caminho, 'utf8');
  const exportado = /export const (TEORIA_[A-Z_0-9]+)/.exec(fonte);
  if (exportado === null) {
    throw new Error(`${caminho} não exporta uma constante TEORIA_*.`);
  }

  const conceitos = [...fonte.matchAll(/^ {4}id: '([^']+)',\n {4}titulo: '([^']*)'/gm)].map(
    ([, id, titulo]) => ({ id, titulo }),
  );
  const soltos = [...fonte.matchAll(/\n {4}id: '([^']+)',/g)].length;
  if (conceitos.length !== soltos) {
    throw new Error(`${caminho}: ${soltos} ids, mas só ${conceitos.length} com título na linha seguinte.`);
  }

  return {
    topicoId: caminho.split('/').at(-2),
    modulo: '@features/' + caminho.replace('src/app/features/', '').replace(/\.ts$/, ''),
    exportado: exportado[1],
    conceitos,
  };
});

const titulos = topicos
  .flatMap(({ conceitos }) => conceitos)
  .sort((a, b) => a.id.localeCompare(b.id))
  .map(({ id, titulo }) => `  '${id}': '${titulo.replace(/'/g, "\\'")}',`)
  .join('\n');

const donos = topicos
  .flatMap(({ topicoId, conceitos }) => conceitos.map(({ id }) => ({ id, topicoId })))
  .sort((a, b) => a.id.localeCompare(b.id))
  .map(({ id, topicoId }) => `  '${id}': '${topicoId}',`)
  .join('\n');

const carregadores = topicos
  .map(
    ({ topicoId, modulo, exportado }) =>
      `  '${topicoId}': () => import('${modulo}').then((m) => m.${exportado}),`,
  )
  .join('\n');

const conteudo = `// Gerado por scripts/gerar-registro-teorias.mjs — não editar à mão.
//
// Rode \`npm run gerar:teorias\` depois de criar, remover ou renomear um
// conceito. O teste core/teoria/teorias.spec.ts garante que este índice
// corresponde aos arquivos \`*.teoria.ts\`.
import { Teoria } from '@core/teoria/models/teoria.model';

/** Título de cada conceito, conhecido antes de carregar a teoria dele. */
export const TITULO_DO_CONCEITO: Readonly<Record<string, string>> = {
${titulos}
};

/** A qual tópico cada conceito pertence. */
export const TOPICO_DO_CONCEITO: Readonly<Record<string, string>> = {
${donos}
};

/** Carrega sob demanda toda a teoria de um tópico. */
export const CARREGAR_TEORIA_DO_TOPICO: Readonly<
  Record<string, () => Promise<readonly Teoria[]>>
> = {
${carregadores}
};
`;

writeFileSync(RAIZ + SAIDA, conteudo);
console.log(
  `${SAIDA}: ${topicos.length} tópicos, ${Object.keys(titulos.split('\n')).length} conceitos.`,
);
