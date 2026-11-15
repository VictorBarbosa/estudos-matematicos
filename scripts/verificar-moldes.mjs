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

const ARQUIVO = 'src/app/core/enunciados/enunciados.json';
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

const grupos = JSON.parse(readFileSync(ARQUIVO, 'utf8'));
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
 * Tópicos em que a forma vem de uma VARIÁVEL: `moldesDe('x', forma)`.
 *
 * Aí não há como saber estaticamente quais formas são pedidas, e acusar órfão
 * seria acusar o inocente. O tópico sai da conta — e é por isso que este
 * guarda não substitui `lacunas-preenchidas.spec.ts`, que executa de verdade.
 */
const porVariavel = new Set();
for (const achado of codigo.matchAll(/moldesDe\(\s*'([^']+)'\s*,\s*([A-Za-z_$][\w$]*)\s*\)/g)) {
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

const total = grupos.flatMap((g) => g.enunciados).filter((e) => e.forma !== undefined).length;
console.log(`Moldes alcançáveis: ${total} conferidos.`);
