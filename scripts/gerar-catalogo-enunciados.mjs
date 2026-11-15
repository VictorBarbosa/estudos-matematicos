/**
 * Gera `enunciados/catalogo.ts` a partir da árvore de arquivos.
 *
 * O texto está espalhado em um arquivo por pergunta — `fracoes/facil/01.json`,
 * `retas-e-planos/moldes/forma-3.json` —, e alguém tem de juntá-los para o
 * site ler. Esse alguém é o catálogo, e ele é GERADO: escrito à mão, mil
 * imports viram mil chances de esquecer um, e um import esquecido é uma
 * pergunta que nunca chega à tela, sem quebrar nada.
 *
 * Rodar `npm run enunciados:catalogo` depois de acrescentar ou remover um
 * arquivo. `npm run verificar:geradores` reprova quando o catálogo está
 * desatualizado, para que o esquecimento apareça antes de ir para o ar.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PASTA = 'src/app/core/enunciados/enunciados';
const NIVEIS = ['facil', 'medio', 'dificil', 'extremo'];

/** Os arquivos de um tópico, na ordem em que o site deve lê-los. */
function arquivosDoTopico(topico) {
  const raiz = join(PASTA, topico);
  const saida = [];

  for (const nivel of NIVEIS) {
    const pasta = join(raiz, nivel);
    if (!existe(pasta)) {
      continue;
    }
    for (const nome of readdirSync(pasta)
      .filter((n) => n.endsWith('.json'))
      .sort()) {
      saida.push({ caminho: `${topico}/${nivel}/${nome}`, nivel });
    }
  }

  const moldes = join(raiz, 'moldes');
  if (existe(moldes)) {
    /*
     * Dois jeitos de guardar molde, e o caminho diz qual é:
     *
     *   moldes/forma-3.json        → a forma tem UM molde;
     *   moldes/direta/01.json      → a forma tem VÁRIOS, e o gerador sorteia.
     *
     * A pasta existe para que o nome do arquivo não precise carregar número:
     * `forma-1-02.json` obrigaria a descontar o sufixo para achar a forma, e
     * descontar sufixo numérico de `forma-1` dá `forma`.
     */
    for (const nome of readdirSync(moldes).sort(porNumero)) {
      const dentro = join(moldes, nome);
      if (existe(dentro)) {
        for (const arquivo of readdirSync(dentro)
          .filter((n) => n.endsWith('.json'))
          .sort()) {
          saida.push({ caminho: `${topico}/moldes/${nome}/${arquivo}`, forma: nome });
        }
      } else if (nome.endsWith('.json')) {
        saida.push({ caminho: `${topico}/moldes/${nome}`, forma: nome.replace('.json', '') });
      }
    }
  }

  return saida;
}

/** Ordem numérica, e não alfabética: `forma-10` vem depois de `forma-9`. */
function porNumero(a, b) {
  return numero(a) - numero(b) || a.localeCompare(b);
}

function numero(nome) {
  const achado = /(\d+)/.exec(nome);
  return achado === null ? Number.MAX_SAFE_INTEGER : Number(achado[1]);
}

function existe(caminho) {
  try {
    return statSync(caminho).isDirectory();
  } catch {
    return false;
  }
}

function identificador(caminho) {
  return (
    'e' +
    caminho.replace(/\.json$/, '').replace(/[^A-Za-z0-9]+(.)?/g, (_t, c) => (c ?? '').toUpperCase())
  );
}

const topicos = readdirSync(PASTA)
  .filter((nome) => existe(join(PASTA, nome)))
  .sort();

const linhas = [
  '/**',
  ' * Os enunciados de todos os tópicos, reunidos para o site ler.',
  ' *',
  ' * ARQUIVO GERADO por `npm run enunciados:catalogo`. Não edite à mão: o que',
  ' * se edita são os arquivos de `enunciados/<tópico>/<nível>/` e de',
  ' * `enunciados/<tópico>/moldes/`, e o catálogo se refaz a partir deles.',
  ' *',
  ' * O nível e a forma vêm do CAMINHO do arquivo, não de um campo escrito',
  ' * dentro dele: `fracoes/facil/01.json` é uma pergunta pronta de Frações no',
  ' * Fácil, e `fracoes/moldes/forma-2.json` é um molde. Assim não há como o',
  ' * arquivo dizer uma coisa e a pasta dizer outra.',
  ' */',
  '',
];

const entradas = [];
for (const topico of topicos) {
  for (const arquivo of arquivosDoTopico(topico)) {
    const nome = identificador(arquivo.caminho);
    linhas.push(`import ${nome} from '@core/enunciados/enunciados/${arquivo.caminho}';`);
    entradas.push({ ...arquivo, nome, topico });
  }
}

linhas.push(
  '',
  '/** Uma entrada do arquivo, com o que o caminho dela diz. */',
  'export interface EntradaDeEnunciado {',
  '  readonly topico: string;',
  '  readonly nivel?: string;',
  '  readonly forma?: string;',
  '  readonly conteudo: unknown;',
  '}',
  '',
  'export const ENTRADAS_DE_ENUNCIADO: readonly EntradaDeEnunciado[] = [',
);

for (const entrada of entradas) {
  const partes = [`topico: '${entrada.topico}'`];
  if (entrada.nivel !== undefined) {
    partes.push(`nivel: '${entrada.nivel}'`);
  }
  if (entrada.forma !== undefined) {
    partes.push(`forma: '${entrada.forma}'`);
  }
  partes.push(`conteudo: ${entrada.nome}`);
  linhas.push(`  { ${partes.join(', ')} },`);
}

linhas.push('];', '');

writeFileSync(join(PASTA, 'catalogo.ts'), linhas.join('\n'), 'utf8');
console.log(`Catálogo gerado: ${entradas.length} entradas em ${topicos.length} tópicos.`);
