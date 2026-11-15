/**
 * Move o texto de enunciado de um gerador para `moldes.json`.
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
const moldesPath = 'src/app/core/enunciados/moldes/moldes.json';
const moldes = JSON.parse(readFileSync(moldesPath, 'utf8'));

/** `${a}` vira `{dados-calculo.a}`; expressões viram chaves sintéticas. */
function converter(template) {
  const valores = [];
  let sintetico = 0;

  const texto = template.replace(/\$\{([^}]*)\}/g, (_inteiro, expressao) => {
    const limpa = expressao.trim();
    if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(limpa)) {
      valores.push([limpa, limpa]);
      return `{dados-calculo.${limpa}}`;
    }
    const nome = `v${++sintetico}`;
    valores.push([nome, limpa]);
    return `{dados-calculo.${nome}}`;
  });

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
  novos.push({ topico, forma, texto: { br: texto } });

  const dados = valores
    .map(([nome, expressao]) => (nome === expressao ? nome : `${nome}: ${expressao}`))
    .join(', ');

  const chamada = `textoDoMolde(moldesDe('${topico}', '${forma}')[0]!, { ${dados} }, 'pt')`;
  saida = saida.replace(achado.inteiro, `enunciado${achado.ligacao}${chamada}${achado.fim}`);
});

if (!saida.includes("from '@core/enunciados/moldes/moldes.model'")) {
  saida = saida.replace(
    /^(import .*\n)/,
    `$1import { moldesDe, textoDoMolde } from '@core/enunciados/moldes/moldes.model';\n`,
  );
}

console.log(`${topico}: ${achados.length} enunciado(s).`);
for (const molde of novos) {
  console.log(`  ${molde.forma}: ${molde.texto.br.slice(0, 90)}`);
}

if (aplicar) {
  writeFileSync(caminho, saida, 'utf8');
  writeFileSync(moldesPath, `${JSON.stringify([...moldes, ...novos], null, 2)}\n`, 'utf8');
  console.log('Aplicado.');
} else {
  console.log('(simulação — passe --aplicar para gravar)');
}
