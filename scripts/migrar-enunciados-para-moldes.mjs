/**
 * Move o texto de enunciado de um gerador para `enunciados.json`.
 *
 * Uso: node scripts/migrar-enunciados-para-moldes.mjs <caminho do gerador> [--aplicar]
 *
 * Sem `--aplicar`, apenas mostra o que faria. É deliberado: o script reescreve
 * TypeScript com expressões regulares, e isso só é seguro quando quem roda
 * olha o resultado e roda os testes do tópico logo depois.
 *
 * ## O que ele reconhece
 *
 * As duas formas em que os geradores escrevem o enunciado:
 *
 *   enunciado: `texto com ${a} e ${b}`,
 *   enunciado = `texto com ${a}` + `continuação com ${b}`;
 *
 * Cada uma vira um molde no arquivo JSON, com `${a}` trocado por
 * `{dados-calculo.a}`, e a linha do gerador vira uma chamada a `textoDoMolde`.
 *
 * ## O que ele NÃO faz
 *
 * Traduzir. O molde nasce só com `br`, que é o que o gerador tinha. E ele não
 * toca em enunciado montado por `enunciadoTrilingue`, que já vive fora do
 * fluxo de texto cru.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';

const [, , caminho, ...flags] = process.argv;
const aplicar = flags.includes('--aplicar');

if (caminho === undefined) {
  console.error('Falta o caminho do gerador.');
  process.exit(1);
}

const topico = basename(caminho).replace('.gerador.ts', '');
const fonte = readFileSync(caminho, 'utf8');
const moldesPath = 'src/app/core/enunciados/enunciados.json';
const moldes = JSON.parse(readFileSync(moldesPath, 'utf8'));

/** `${a}` vira `{dados-calculo.a}`; expressões viram chaves sintéticas. */
function converter(template) {
  /*
   * `nomes` guarda expressão -> chave, e é ele que impede duas armadilhas.
   *
   * A mesma expressão citada duas vezes tem de virar a MESMA chave — o objeto
   * não aceita `{ r3, r3 }`. E uma expressão diferente nunca pode cair numa
   * chave já usada: um gerador com uma variável chamada `v1` e uma expressão
   * sintética também chamada `v1` perdia uma das duas, calado, e o enunciado
   * saía com o número errado no lugar certo. Por isso o nome sintético é
   * `expressao1`, e ainda assim é conferido contra os que já existem.
   */
  const nomes = new Map();
  let sintetico = 0;

  const chave = (expressao) => {
    if (nomes.has(expressao)) {
      return nomes.get(expressao);
    }
    const simples = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(expressao);
    let nome = simples ? expressao : `expressao${++sintetico}`;
    while ([...nomes.values()].includes(nome)) {
      nome = `expressao${++sintetico}`;
    }
    nomes.set(expressao, nome);
    return nome;
  };

  const texto = template.replace(/\$\{([^}]*)\}/g, (_inteiro, expressao) => {
    return `{dados-calculo.${chave(expressao.trim())}}`;
  });

  const valores = [...nomes].map(([expressao, nome]) => [nome, expressao]);
  return { texto, valores };
}

/** Os templates concatenados de uma atribuição, juntados num texto só. */
function juntar(trecho) {
  const partes = [...trecho.matchAll(/`([^`]*)`|'([^'\n]*)'/g)].map((m) => m[1] ?? m[2]);
  return partes.join('');
}

const achados = [];

// enunciado: `...`,  /  enunciado = `...` + `...`;
const padrao =
  /enunciado(\s*[:=]\s*)((?:(?:`[^`]*`|'[^'\n]*')\s*\+\s*)*(?:`[^`]*`|'[^'\n]*'))\s*([,;])/g;

let encontro;
while ((encontro = padrao.exec(fonte)) !== null) {
  const bruto = juntar(encontro[2]);
  if (bruto.trim().length < 10) {
    continue; // Pedaço solto, não uma pergunta.
  }
  /*
   * Template ANINHADO fica para a mão.
   *
   * `${altura > 0 ? \`, de uma altura de ${altura} m\` : ''}` é texto que só
   * aparece às vezes, e a crase de dentro fecha o template de fora antes da
   * hora: o recorte sai pela metade e leva junto o que vinha depois. Foi o que
   * aconteceu em quatro geradores de física antes desta guarda existir — e o
   * TypeScript só reclamou dez linhas adiante, no `formatar`.
   */
  if (/\$\{[^}]*`/.test(encontro[2])) {
    console.log(`  (pulado: template aninhado) ${bruto.slice(0, 70)}`);
    continue;
  }
  /*
   * Chave dentro de texto também fica para a mão.
   *
   * `${num(x).replace('{,}', ',')}` tem uma `}` que é PARTE de uma string, e o
   * recorte — que procura a primeira `}` — para ali, no meio da expressão. O
   * sinal é sempre uma aspa com chave dentro.
   */
  if (/\$\{[^}]*['"][^'"]*[{}]/.test(encontro[2])) {
    console.log(`  (pulado: chave dentro de texto) ${bruto.slice(0, 70)}`);
    continue;
  }
  achados.push({ inteiro: encontro[0], ligacao: encontro[1], fim: encontro[3], bruto });
}

if (achados.length === 0) {
  console.log(`${topico}: nenhum enunciado no padrão reconhecido.`);
  process.exit(0);
}

let saida = fonte;
const novos = [];

achados.forEach((achado, indice) => {
  const { texto, valores } = converter(achado.bruto);
  const forma = `forma-${indice + 1}`;
  novos.push({ topico, forma, enunciado: { br: texto } });

  const dados = valores
    .map(([nome, expressao]) => (nome === expressao ? nome : `${nome}: ${expressao}`))
    .join(', ');

  const chamada = `textoDoMolde(moldesDe('${topico}', '${forma}')[0]!, { ${dados} }, 'pt')`;
  saida = saida.replace(achado.inteiro, `enunciado${achado.ligacao}${chamada}${achado.fim}`);
});

if (!saida.includes("from '@core/enunciados/moldes/moldes.model'")) {
  // Depois do PRIMEIRO import do arquivo, e não no topo: muitos geradores
  // abrem com um comentário de bloco que explica o tópico, e um import antes
  // dele deixaria a explicação órfã no meio do arquivo.
  const primeiro = saida.search(/^import /m);
  const linha = `import { moldesDe, textoDoMolde } from '@core/enunciados/moldes/moldes.model';\n`;
  // ANTES do primeiro import, nunca depois: um `import {` de várias linhas não
  // tem o seu `;` na primeira delas, e inserir ali parte o import ao meio.
  saida =
    primeiro === -1 ? linha + saida : saida.slice(0, primeiro) + linha + saida.slice(primeiro);
}

console.log(`${topico}: ${achados.length} enunciado(s).`);
for (const molde of novos) {
  console.log(`  ${molde.forma}: ${molde.enunciado.br.slice(0, 90)}`);
}

if (aplicar) {
  writeFileSync(caminho, saida, 'utf8');
  writeFileSync(moldesPath, `${JSON.stringify([...moldes, ...novos], null, 2)}\n`, 'utf8');
  console.log('Aplicado.');
} else {
  console.log('(simulação — passe --aplicar para gravar)');
}
