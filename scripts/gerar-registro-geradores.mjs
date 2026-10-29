/**
 * Gera o índice de geradores de exercício, carregados sob demanda.
 *
 * A fila de revisão precisa sortear exercícios de QUALQUER tópico já estudado,
 * sem que isso traga os 75 geradores para o bundle inicial. O índice mapeia o
 * id do tópico para um import dinâmico — o mesmo arranjo usado para a teoria.
 *
 * Uso: `npm run gerar:geradores`. O teste `core/revisao/revisao.spec.ts` falha
 * se o índice sair de sincronia com os arquivos.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const RAIZ = new URL('..', import.meta.url).pathname;
const SAIDA = 'src/app/core/treino/registro-geradores/registro-geradores.ts';

const arquivos = execSync('find src/app/features -name "*.gerador.ts"', {
  cwd: RAIZ,
  encoding: 'utf8',
})
  .trim()
  .split('\n')
  .sort();

const topicos = arquivos.map((caminho) => {
  const fonte = readFileSync(RAIZ + caminho, 'utf8');
  const exportado = /export const (gerador[A-Za-z0-9_]*)/.exec(fonte);
  if (exportado === null) {
    throw new Error(`${caminho} não exporta uma constante gerador*.`);
  }

  return {
    topicoId: caminho.split('/').at(-2),
    modulo: '@features/' + caminho.replace('src/app/features/', '').replace(/\.ts$/, ''),
    exportado: exportado[1],
  };
});

const linhas = topicos
  .map(
    ({ topicoId, modulo, exportado }) =>
      `  '${topicoId}': () => import('${modulo}').then((m) => m.${exportado}),`,
  )
  .join('\n');

const conteudo = `// Gerado por scripts/gerar-registro-geradores.mjs — não editar à mão.
//
// Rode \`npm run gerar:geradores\` depois de criar, remover ou renomear um
// tópico. O teste core/revisao/revisao.spec.ts garante que este índice
// corresponde aos arquivos \`*.gerador.ts\`.
import { GeradorExercicio } from '@core/treino/models/treino.model';

/** Carrega sob demanda o gerador de exercícios de um tópico. */
export const CARREGAR_GERADOR: Readonly<
  Record<string, () => Promise<GeradorExercicio<unknown>>>
> = {
${linhas}
};
`;

writeFileSync(RAIZ + SAIDA, conteudo);
console.log(`${SAIDA}: ${topicos.length} geradores.`);
