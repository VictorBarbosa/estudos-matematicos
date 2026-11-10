/**
 * Nenhum gerador de exercício pode ter entropia fora do RNG semeado.
 *
 * O motivo é concreto: em 10/11/2026 um exercício de `analise-dimensional`
 * embaralhava as opções com `sort(() => rng.inteiro(-1, 1))`. Parecia sorteio,
 * mas o `sort` do V8 chama o comparador um número de vezes que depende da
 * implementação e do tamanho da lista — cinco vezes, com quatro elementos, na
 * versão de Node desta máquina, e um número diferente em outra. O efeito é que
 * o mesmo seed produzia exercícios diferentes em cada ambiente: a contagem de
 * formas do tópico dava 207 aqui e 205 no runner do GitHub Actions (Node 22), e
 * o guarda de variedade acusava uma queda que não existia.
 *
 * A regra que fica: dentro de um gerador, a única fonte de aleatoriedade é o
 * `rng` recebido como argumento — e ele só pode ser consumido por chamadas cujo
 * número não depende do ambiente. `rng.embaralhar` (Fisher-Yates) consome
 * exatamente n − 1 números, sempre; `sort` com comparador aleatório, não.
 *
 * Uso: `npm run verificar:geradores`. Roda também na integração contínua, logo
 * antes dos testes.
 */
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const RAIZ = new URL('..', import.meta.url).pathname;

/** Arquivos de exercício: geradores e os catálogos de situação que eles usam. */
const arquivos = execSync(
  'find src/app/features src/app/core/treino -name "*.gerador.ts" -o -name "*.contextos.ts"',
  { cwd: RAIZ, encoding: 'utf8' },
)
  .trim()
  .split('\n')
  .filter((caminho) => caminho !== '' && !caminho.includes('.spec.'))
  .sort();

/** Entropia que não vem do `rng`: quebra a reprodutibilidade por completo. */
const ENTROPIA = [
  { padrao: /Math\.random\s*\(/, nome: 'Math.random()' },
  { padrao: /Date\.now\s*\(/, nome: 'Date.now()' },
  { padrao: /new Date\s*\(\s*\)/, nome: 'new Date()' },
  { padrao: /performance\.now\s*\(/, nome: 'performance.now()' },
];

/**
 * Comparador de `sort` que consulta o RNG.
 *
 * É o caso que originou este script: o número de chamadas do comparador é
 * detalhe de implementação do motor, então o fluxo do RNG passa a depender da
 * versão do Node.
 */
function comparadorAleatorio(linha) {
  const indice = linha.indexOf('.sort(');
  if (indice === -1) {
    return false;
  }
  const trecho = linha.slice(indice, indice + 120);

  return /\brng\b|\bRng\b|Math\.random/.test(trecho);
}

const problemas = [];

for (const caminho of arquivos) {
  const fonte = readFileSync(RAIZ + caminho, 'utf8');

  fonte.split('\n').forEach((linha, indice) => {
    // Comentário e import não contam: o texto explicativo cita os padrões.
    const codigo = linha.replace(/\/\/.*$/, '').trim();
    if (codigo === '' || codigo.startsWith('*') || codigo.startsWith('/*')) {
      return;
    }

    for (const { padrao, nome } of ENTROPIA) {
      if (padrao.test(codigo)) {
        problemas.push(`${caminho}:${indice + 1}: usa ${nome}, fora do RNG semeado`);
      }
    }

    if (comparadorAleatorio(codigo)) {
      problemas.push(
        `${caminho}:${indice + 1}: sort() com comparador que consulta o rng — ` +
          'use rng.embaralhar(), que consome sempre o mesmo número de valores',
      );
    }
  });
}

if (problemas.length > 0) {
  console.error('Geradores com aleatoriedade fora do RNG semeado:\n');
  for (const problema of problemas) {
    console.error(`  ✗ ${problema}`);
  }
  console.error(`\n${problemas.length} problema(s).`);
  process.exit(1);
}

console.log(`Geradores determinísticos: ${arquivos.length} arquivos conferidos.`);
