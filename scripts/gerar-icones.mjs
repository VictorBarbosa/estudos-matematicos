/**
 * Gera o ícone do aplicativo a partir de um desenho só.
 *
 * O símbolo é o mesmo do site — o sinal de integral sobre o azul de acento —,
 * para que o atalho na tela do telefone e a página na web sejam reconhecidos
 * como a mesma coisa. O que muda é o fundo do ícone: o iOS não aceita
 * transparência e recorta os cantos sozinho, então o quadrado vai cheio e sem
 * arredondamento.
 *
 * Saídas:
 * - `resources/icon.png` (1024), que o `@capacitor/assets` fatia para o Xcode;
 * - `resources/splash.png` e `splash-dark.png` (2732), a tela de abertura;
 * - `src/assets/icon/favicon.png`, para quando o app roda no navegador.
 *
 * Uso: `npm run gerar:icones`. Exige o `rsvg-convert` (`brew install librsvg`).
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const RAIZ = new URL('..', import.meta.url).pathname;

/** O azul de acento do tema claro do site, `oklch(52% 0.2 265)` em sRGB. */
const ACENTO = '#2e5bda';

/** O desenho do ícone: o símbolo centrado num quadrado cheio. */
function icone(corpo) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="${ACENTO}"/>
  <text x="500" y="516" font-family="Georgia, 'Times New Roman', serif" font-size="${corpo}"
        fill="#ffffff" text-anchor="middle" dominant-baseline="central">∫</text>
</svg>
`;
}

/**
 * A abertura.
 *
 * Fundo liso com o símbolo pequeno no centro: a tela fica no ar por um
 * instante, e qualquer coisa além disso seria ruído.
 */
function abertura(fundo, tinta) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="2732" height="2732" viewBox="0 0 2732 2732">
  <rect width="2732" height="2732" fill="${fundo}"/>
  <text x="1352" y="1380" font-family="Georgia, 'Times New Roman', serif" font-size="620"
        fill="${tinta}" text-anchor="middle" dominant-baseline="central">∫</text>
</svg>
`;
}

const temporario = join(tmpdir(), 'calculadora-matematica-icones');
mkdirSync(temporario, { recursive: true });
mkdirSync(join(RAIZ, 'resources'), { recursive: true });
mkdirSync(join(RAIZ, 'src/assets/icon'), { recursive: true });

function render(svg, tamanho, destino) {
  const origem = join(temporario, `${Math.random().toString(36).slice(2)}.svg`);
  writeFileSync(origem, svg);
  execFileSync('rsvg-convert', ['-w', String(tamanho), '-h', String(tamanho), origem, '-o', destino]);
  return destino.replace(RAIZ, '');
}

const gerados = [
  render(icone(700), 1024, join(RAIZ, 'resources/icon.png')),
  render(abertura('#ffffff', ACENTO), 2732, join(RAIZ, 'resources/splash.png')),
  render(abertura('#1c1c1e', '#ffffff'), 2732, join(RAIZ, 'resources/splash-dark.png')),
  render(icone(700), 512, join(RAIZ, 'src/assets/icon/favicon.png')),
];

console.log(`${gerados.length} arquivos: ${gerados.join(', ')}`);
