/**
 * Gera os ícones do aplicativo a partir de um desenho só.
 *
 * O ícone é o mesmo símbolo que o cabeçalho usa — o sinal de integral sobre o
 * azul de acento do tema claro. Manter os dois sincronizados à mão seria
 * convite a esquecer um; aqui o desenho vive em um lugar e os onze arquivos
 * saem dele.
 *
 * O símbolo entra como texto, e por isso o desenho é rasterizado **uma vez**,
 * aqui, com as fontes desta máquina: um SVG com `<text>` servido ao navegador
 * renderizaria com a fonte que cada aparelho tiver. Os PNGs é que vão para o
 * repositório.
 *
 * Uso: `npm run gerar:icones`. Exige o `rsvg-convert` (`brew install librsvg`).
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const RAIZ = new URL('..', import.meta.url).pathname;
const SAIDA = join(RAIZ, 'public/icons');

/** O azul de acento do tema claro, `oklch(52% 0.2 265)` em sRGB. */
const ACENTO = '#2e5bda';

/**
 * O desenho.
 *
 * `recorte` é o raio dos cantos: arredondado no ícone comum, reto no
 * maskable — ali quem recorta é o sistema, e um canto já arredondado apareceria
 * cortado duas vezes. `corpo` é o tamanho do símbolo: menor no maskable, para
 * caber na área segura que o Android garante não aparar.
 */
function desenho({ recorte, corpo }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${recorte}" fill="${ACENTO}"/>
  <text x="250" y="258" font-family="Georgia, 'Times New Roman', serif" font-size="${corpo}"
        fill="#ffffff" text-anchor="middle" dominant-baseline="central">∫</text>
</svg>
`;
}

/** Os tamanhos que o manifesto anuncia, mais o do atalho no iOS. */
const COMUNS = [72, 96, 128, 144, 152, 192, 384, 512];
const MASCARAVEIS = [192, 512];
const APPLE = 180;

const temporario = join(tmpdir(), 'estudos-matematicos-icones');
mkdirSync(temporario, { recursive: true });
mkdirSync(SAIDA, { recursive: true });

const comum = join(temporario, 'comum.svg');
const mascaravel = join(temporario, 'mascaravel.svg');

writeFileSync(comum, desenho({ recorte: 112, corpo: 340 }));
// Área segura do maskable: o símbolo cabe no círculo central de 80%.
writeFileSync(mascaravel, desenho({ recorte: 0, corpo: 268 }));

function render(origem, tamanho, nome) {
  const destino = join(SAIDA, nome);
  execFileSync('rsvg-convert', [
    '-w',
    String(tamanho),
    '-h',
    String(tamanho),
    origem,
    '-o',
    destino,
  ]);
  return nome;
}

const gerados = [
  ...COMUNS.map((tamanho) => render(comum, tamanho, `icon-${tamanho}.png`)),
  ...MASCARAVEIS.map((tamanho) => render(mascaravel, tamanho, `icon-maskable-${tamanho}.png`)),
  render(comum, APPLE, 'apple-touch-icon.png'),
];

console.log(`public/icons: ${gerados.length} arquivos — ${gerados.join(', ')}`);
