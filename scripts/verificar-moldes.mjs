/**
 * Confere que todo molde do arquivo de enunciados é alcançável.
 *
 * Duas falhas que nenhum teste pegava, porque as duas são SILENCIOSAS:
 *
 * - **molde órfão**: está no arquivo e nenhum código o pede. Alguém escreveu
 *   uma pergunta que nunca vai à tela, e a única pista seria notá-la faltando.
 * - **molde inalcançável**: a forma tem dois ou mais moldes, e o gerador lê
 *   `moldesDe(...)[0]`. Do segundo em diante, ninguém vê. É o caminho natural
 *   de quem quer dar variedade a uma forma — acrescentar um molde ao lado do
 *   que existe — e é o que mais engana, porque o arquivo fica certo.
 *
 * Roda no `npm run verificar:geradores`, ao lado dos outros guardas de
 * arquivo, porque precisa ler o código-fonte e os testes rodam sobre o bundle.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const PASTA = 'src/app/core/enunciados/enunciados';
const CATALOGO = join(PASTA, 'catalogo.ts');
const CATALOGOS = 'src/app/core/enunciados/catalogos';
const RAIZ = 'src/app';

function todosOsArquivos(diretorio) {
  return readdirSync(diretorio).flatMap((nome) => {
    const caminho = join(diretorio, nome);
    if (statSync(caminho).isDirectory()) {
      return todosOsArquivos(caminho);
    }
    return caminho.endsWith('.ts') && !caminho.endsWith('.spec.ts') ? [caminho] : [];
  });
}

/*
 * O catálogo tem de listar TODOS os arquivos da árvore.
 *
 * Um `.json` que ninguém importa não é uma pergunta a menos: é uma pergunta
 * que o site não enxerga. Nada quebra, nada avisa — o aluno só recebe o
 * gerador de sempre, como se o arquivo não existisse. O contrário, um import
 * para arquivo apagado, o compilador pega sozinho.
 */
function todosOsJson(diretorio) {
  return readdirSync(diretorio).flatMap((nome) => {
    const caminho = join(diretorio, nome);
    if (statSync(caminho).isDirectory()) {
      return todosOsJson(caminho);
    }
    return nome.endsWith('.json') ? [caminho.slice(PASTA.length + 1)] : [];
  });
}

const naArvore = todosOsJson(PASTA).sort();

/*
 * O catálogo é uma pilha de índices, um por tópico, e os imports dos JSON
 * estão nos índices. A conferência varre os DOIS níveis: o índice geral e os
 * arquivos de `catalogos/`. Ler só o geral diria que nenhum arquivo está no
 * catálogo, e o guarda acusaria a árvore inteira.
 */
const fontesDoCatalogo = [CATALOGO, ...readdirSync(CATALOGOS).map((nome) => join(CATALOGOS, nome))];
const noCatalogo = fontesDoCatalogo
  .flatMap((caminho) =>
    [...readFileSync(caminho, 'utf8').matchAll(/enunciados\/enunciados\/([^']+\.json)'/g)].map(
      (achado) => achado[1],
    ),
  )
  .sort();

const faltando = naArvore.filter((nome) => !noCatalogo.includes(nome));
if (faltando.length > 0) {
  console.error(`Arquivos na árvore e fora do catálogo (${faltando.length}):`);
  for (const nome of faltando.slice(0, 20)) {
    console.error(`  ${nome}`);
  }
  console.error('Rode `npm run enunciados:catalogo`.');
  process.exit(1);
}

/** Os moldes, com o tópico e a forma que o CAMINHO declara. */
const grupos = [];
for (const caminho of naArvore) {
  const partes = caminho.split('/');
  const [topico, pasta] = partes;
  if (pasta !== 'moldes') {
    continue;
  }
  // `moldes/forma-3.json` ou `moldes/direta/01.json`.
  const forma = partes.length === 3 ? partes[2].replace('.json', '') : partes[2];
  const grupo = grupos.find((g) => g.topico === topico) ?? { topico, enunciados: [] };
  if (!grupos.includes(grupo)) {
    grupos.push(grupo);
  }
  grupo.enunciados.push({ forma });
}

const fontes = todosOsArquivos(RAIZ).map((caminho) => readFileSync(caminho, 'utf8'));
const codigo = fontes.join('\n');

/** As formas pedidas com texto literal: `moldesDe('topico', 'forma')`. */
const literais = new Set();
for (const achado of codigo.matchAll(/moldesDe\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/g)) {
  literais.add(`${achado[1]}/${achado[2]}`);
}

/** As formas pedidas por expressão: `moldesDe('topico', x ? 'a' : 'b')`. */
for (const achado of codigo.matchAll(/moldesDe\(\s*'([^']+)'\s*,([^)]*)\)/g)) {
  for (const texto of achado[2].matchAll(/'([^']+)'/g)) {
    literais.add(`${achado[1]}/${texto[1]}`);
  }
  // `moldesDe(topico, `composta-${tipo}`)` — o prefixo é o que dá para conferir.
  for (const gabarito of achado[2].matchAll(/`([^`$]+)\$\{/g)) {
    literais.add(`${achado[1]}/${gabarito[1]}*`);
  }
}

/**
 * Tópicos em que a forma vem de uma VARIÁVEL ou de uma CHAMADA.
 *
 * `moldesDe('x', forma)` e `moldesDe('x', formaDoMolde(escritas))` são o mesmo
 * caso: não há como saber estaticamente quais formas são pedidas, e acusar
 * órfão seria acusar o inocente. O tópico sai da conta — e é por isso que este
 * guarda não substitui `lacunas-preenchidas.spec.ts`, que executa de verdade.
 */
const porVariavel = new Set();
for (const achado of codigo.matchAll(
  /moldesDe\(\s*'([^']+)'\s*,\s*[A-Za-z_$][\w$]*\s*(?:\([^)]*\))?\s*\)/g,
)) {
  porVariavel.add(achado[1]);
}

/** Uma forma é pedida quando foi citada, ou quando casa com um prefixo. */
function pedida(topico, forma) {
  if (porVariavel.has(topico)) {
    return true;
  }
  if (literais.has(`${topico}/${forma}`)) {
    return true;
  }
  return [...literais].some(
    (chave) => chave.endsWith('*') && `${topico}/${forma}`.startsWith(chave.slice(0, -1)),
  );
}

/** As formas lidas com `[0]`, em que um segundo molde nunca apareceria. */
const porIndiceZero = new Set();
for (const achado of codigo.matchAll(/moldesDe\(\s*'([^']+)'\s*,([^)]*)\)\s*\[0\]/g)) {
  for (const texto of achado[2].matchAll(/'([^']+)'/g)) {
    porIndiceZero.add(`${achado[1]}/${texto[1]}`);
  }
}

const orfaos = [];
const inalcancaveis = [];

for (const grupo of grupos) {
  const porForma = new Map();
  for (const entrada of grupo.enunciados) {
    if (entrada.forma === undefined) {
      continue;
    }
    porForma.set(entrada.forma, (porForma.get(entrada.forma) ?? 0) + 1);
  }

  for (const [forma, quantos] of porForma) {
    if (!pedida(grupo.topico, forma)) {
      orfaos.push(`${grupo.topico}/${forma}`);
    } else if (quantos > 1 && porIndiceZero.has(`${grupo.topico}/${forma}`)) {
      inalcancaveis.push(`${grupo.topico}/${forma} (${quantos} moldes, lidos com [0])`);
    }
  }
}

const problemas = [
  ...orfaos.map((o) => `órfão: ${o}`),
  ...inalcancaveis.map((i) => `inalcançável: ${i}`),
];

if (problemas.length > 0) {
  console.error(`Moldes que nunca chegam à tela (${problemas.length}):`);
  for (const problema of problemas) {
    console.error(`  ${problema}`);
  }
  process.exit(1);
}

const total = grupos.flatMap((g) => g.enunciados).length;
console.log(`Moldes alcançáveis: ${total} conferidos, em ${naArvore.length} arquivos.`);
