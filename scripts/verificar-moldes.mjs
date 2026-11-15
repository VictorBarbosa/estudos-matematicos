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
const CATALOGO = 'src/app/core/enunciados/enunciados/catalogo.ts';
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
 * O catálogo tem de listar TODOS os arquivos da pasta.
 *
 * Um `.json` que ninguém importa não é um tópico sem perguntas: é um tópico
 * cujas perguntas o site não enxerga. Nada quebra, nada avisa — o aluno só
 * recebe o gerador de sempre, como se o arquivo não existisse. O contrário,
 * um import para arquivo apagado, o compilador pega sozinho.
 */
const naPasta = readdirSync(PASTA)
  .filter((nome) => nome.endsWith('.json'))
  .map((nome) => nome.replace('.json', ''))
  .sort();

const fonteCatalogo = readFileSync(CATALOGO, 'utf8');
const noCatalogo = [...fonteCatalogo.matchAll(/enunciados\/([a-z0-9-]+)\.json'/g)]
  .map((achado) => achado[1])
  .sort();

const faltando = naPasta.filter((nome) => !noCatalogo.includes(nome));
if (faltando.length > 0) {
  console.error(`Tópicos na pasta e fora do catálogo (${faltando.length}):`);
  for (const nome of faltando) {
    console.error(`  ${nome}`);
  }
  process.exit(1);
}

const grupos = naPasta.map((nome) => JSON.parse(readFileSync(join(PASTA, `${nome}.json`), 'utf8')));

for (const grupo of grupos) {
  const esperado = naPasta[grupos.indexOf(grupo)];
  if (grupo.topico !== esperado) {
    console.error(`O arquivo ${esperado}.json diz ser do tópico "${grupo.topico}".`);
    process.exit(1);
  }
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
console.log(`Moldes alcançáveis: ${total} conferidos, em ${naPasta.length} arquivos de tópico.`);
