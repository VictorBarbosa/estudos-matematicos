/**
 * Confere o service worker num Chrome de verdade.
 *
 * Nada do que este script verifica cabe na suíte de testes. O `ngsw.json`, o
 * escopo do worker, o `base-href` da subpasta do Pages e o manifesto só
 * existem depois do build, e só um navegador com service worker ligado diz se
 * eles combinam. Um erro aqui é invisível até o deploy — e aí já está no ar.
 *
 * A sequência é a mesma de um aluno: abre o site, volta, fica sem rede, e
 * recebe o aviso de versão nova. "Publicar de novo" é, para o service worker,
 * o `ngsw.json` mudar de conteúdo — é o que o passo 5 faz na cópia servida.
 *
 * Uso: `npm run verificar:pwa`. Exige o Chrome instalado; em outro sistema,
 * aponte o executável com a variável CHROME.
 */
import { spawn, execFileSync } from 'node:child_process';
import { createReadStream, readFileSync, statSync, writeFileSync } from 'node:fs';
import { cp, mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, normalize } from 'node:path';

const RAIZ = new URL('..', import.meta.url).pathname;
const CONSTRUIDO = join(RAIZ, 'dist/EstudosMatematicos/browser');

/** A subpasta em que o site é publicado, para valer a pena testar o base-href. */
const BASE = process.argv[2] ?? '/estudos-matematicos/';
const PORTA = 8411;
const DEPURACAO = 9222;

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function acharChrome() {
  if (process.env.CHROME) {
    return process.env.CHROME;
  }

  const candidatos = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ];
  for (const caminho of candidatos) {
    try {
      statSync(caminho);
      return caminho;
    } catch {
      /* tenta o próximo */
    }
  }

  for (const comando of ['google-chrome', 'chromium', 'chromium-browser']) {
    try {
      return execFileSync('which', [comando], { encoding: 'utf8' }).trim();
    } catch {
      /* tenta o próximo */
    }
  }

  throw new Error('Chrome não encontrado. Aponte o executável com a variável CHROME.');
}

const esperar = (ms) => new Promise((ok) => setTimeout(ok, ms));

/** Cliente mínimo do protocolo de depuração do Chrome. */
class Cdp {
  #ws;
  #id = 0;
  #pendentes = new Map();

  static async conectar(url) {
    const cdp = new Cdp();
    cdp.#ws = new WebSocket(url);

    await new Promise((ok, erro) => {
      cdp.#ws.addEventListener('open', ok, { once: true });
      cdp.#ws.addEventListener('error', erro, { once: true });
    });

    cdp.#ws.addEventListener('message', (evento) => {
      const mensagem = JSON.parse(evento.data);
      const espera = cdp.#pendentes.get(mensagem.id);
      if (espera === undefined) {
        return;
      }
      cdp.#pendentes.delete(mensagem.id);
      if (mensagem.error) {
        espera.erro(new Error(mensagem.error.message));
      } else {
        espera.ok(mensagem.result);
      }
    });

    return cdp;
  }

  enviar(metodo, parametros = {}) {
    const id = ++this.#id;
    this.#ws.send(JSON.stringify({ id, method: metodo, params: parametros }));
    return new Promise((ok, erro) => this.#pendentes.set(id, { ok, erro }));
  }

  async avaliar(expressao) {
    const { result, exceptionDetails } = await this.enviar('Runtime.evaluate', {
      expression: expressao,
      awaitPromise: true,
      returnByValue: true,
    });
    if (exceptionDetails) {
      throw new Error(exceptionDetails.text);
    }
    return result.value;
  }

  fechar() {
    this.#ws.close();
  }
}

const passos = [];
const falhas = [];

function conferir(ok, descricao, detalhe = '') {
  const linha = `${ok ? '  ok ' : 'FALHA'} ${descricao}${detalhe ? ` — ${detalhe}` : ''}`;
  (ok ? passos : falhas).push(linha);
}

/*
 * O site é servido de uma cópia: o passo 5 mexe no `ngsw.json` para simular uma
 * publicação, e mexer no `dist` deixaria o diretório de build inconsistente.
 */
const copia = await mkdtemp(join(tmpdir(), 'verificar-pwa-'));
await cp(CONSTRUIDO, copia, { recursive: true });

const servidor = createServer((requisicao, resposta) => {
  const pedido = decodeURIComponent(requisicao.url.split('?')[0]);
  if (!pedido.startsWith(BASE)) {
    resposta.writeHead(404).end();
    return;
  }

  const caminho = join(copia, normalize('/' + pedido.slice(BASE.length)));
  try {
    if (statSync(caminho).isDirectory()) {
      throw new Error('é diretório');
    }
    resposta.writeHead(200, {
      'Content-Type': TIPOS[extname(caminho)] ?? 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    createReadStream(caminho).pipe(resposta);
  } catch {
    // O Pages devolve o index para qualquer rota; aqui vale o mesmo.
    resposta.writeHead(200, { 'Content-Type': TIPOS['.html'] });
    createReadStream(join(copia, 'index.html')).pipe(resposta);
  }
});
await new Promise((ok) => servidor.listen(PORTA, ok));

const perfil = await mkdtemp(join(tmpdir(), 'verificar-pwa-chrome-'));
const chrome = spawn(
  acharChrome(),
  [
    '--headless=new',
    `--remote-debugging-port=${DEPURACAO}`,
    `--user-data-dir=${perfil}`,
    '--no-first-run',
    '--disable-gpu',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

async function aba() {
  for (let tentativa = 0; tentativa < 50; tentativa++) {
    try {
      const alvos = await fetch(`http://127.0.0.1:${DEPURACAO}/json/list`).then((r) => r.json());
      const pagina = alvos.find((alvo) => alvo.type === 'page');
      if (pagina) {
        return pagina;
      }
    } catch {
      /* o Chrome ainda está subindo */
    }
    await esperar(200);
  }
  throw new Error('o Chrome não respondeu na porta de depuração.');
}

try {
  const pagina = await aba();
  const cdp = await Cdp.conectar(pagina.webSocketDebuggerUrl);
  await cdp.enviar('Page.enable');
  await cdp.enviar('Runtime.enable');
  await cdp.enviar('Network.enable');

  /** Carrega a página e espera o Angular desenhar a moldura. */
  async function abrir() {
    await cdp.enviar('Page.navigate', { url: `http://localhost:${PORTA}${BASE}` });
    for (let tentativa = 0; tentativa < 60; tentativa++) {
      await esperar(250);
      if (await cdp.avaliar(`!!document.querySelector('app-root .shell')`)) {
        return;
      }
    }
    throw new Error('a aplicação não desenhou.');
  }

  // ---- 1. o worker registra ---------------------------------------------
  await abrir();

  let registro = null;
  for (let tentativa = 0; tentativa < 60; tentativa++) {
    registro = await cdp.avaliar(`
      navigator.serviceWorker.getRegistration().then((r) =>
        r ? { escopo: r.scope, ativo: r.active?.scriptURL ?? null } : null)
    `);
    if (registro?.ativo) {
      break;
    }
    await esperar(500);
  }

  conferir(
    registro?.ativo?.endsWith('/ngsw-worker.js') === true,
    'o service worker registra e ativa',
    registro?.ativo ?? 'nenhum',
  );
  conferir(
    registro?.escopo === `http://localhost:${PORTA}${BASE}`,
    `o escopo acompanha o base-href ${BASE}`,
    registro?.escopo,
  );

  // ---- 2. o manifesto é válido ------------------------------------------
  const manifesto = await cdp.enviar('Page.getAppManifest');
  const criticos = (manifesto.errors ?? []).filter((erro) => erro.critical);
  conferir(
    criticos.length === 0,
    'o manifesto é aceito sem erro crítico',
    criticos.map((erro) => erro.message).join('; '),
  );

  const dados = manifesto.data ? JSON.parse(manifesto.data) : {};
  conferir(dados.name === 'Estudos Matemáticos', 'o manifesto traz o nome', dados.name);
  conferir(dados.display === 'standalone', 'o site abre em janela própria', dados.display);
  conferir(
    (dados.icons ?? []).some((icone) => icone.purpose === 'maskable'),
    'há ícone maskable, que o Android recorta sem aparar o símbolo',
  );

  // ---- 3. a segunda visita vem do cache ---------------------------------
  await abrir();
  conferir(
    await cdp.avaliar(`!!navigator.serviceWorker.controller`),
    'na segunda visita a página já é servida pelo service worker',
  );

  const cache = await cdp.avaliar(`
    caches.keys().then(async (nomes) => {
      let entradas = 0;
      for (const nome of nomes) entradas += (await (await caches.open(nome)).keys()).length;
      return entradas;
    })
  `);
  conferir(cache > 0, 'a casca do site está guardada', `${cache} entradas`);

  // ---- 4. sem rede -------------------------------------------------------
  await cdp.enviar('Network.emulateNetworkConditions', {
    offline: true,
    latency: 0,
    downloadThroughput: 0,
    uploadThroughput: 0,
  });

  let semRede = false;
  try {
    await abrir();
    semRede = await cdp.avaliar(`document.body.textContent.includes('Estudos Matemáticos')`);
  } catch {
    semRede = false;
  }
  conferir(semRede, 'o site abre sem rede');

  await cdp.enviar('Network.emulateNetworkConditions', {
    offline: false,
    latency: 0,
    downloadThroughput: -1,
    uploadThroughput: -1,
  });

  // ---- 5. o aviso de versão nova ----------------------------------------
  const ngsw = JSON.parse(readFileSync(join(copia, 'ngsw.json'), 'utf8'));
  ngsw.timestamp = Date.now();
  writeFileSync(join(copia, 'ngsw.json'), JSON.stringify(ngsw));

  await abrir();

  let aviso = null;
  for (let tentativa = 0; tentativa < 60; tentativa++) {
    await esperar(500);
    aviso = await cdp.avaliar(`
      (() => {
        const dialogo = document.querySelector('app-atualizacao-dialog dialog');
        if (!dialogo || !dialogo.open) return null;
        return {
          titulo: dialogo.querySelector('h2')?.textContent?.trim(),
          botoes: [...dialogo.querySelectorAll('button')]
            .map((b) => b.textContent.trim() || b.getAttribute('aria-label')),
        };
      })()
    `);
    if (aviso) {
      break;
    }
  }

  conferir(aviso !== null, 'o modal abre quando sai versão nova');
  conferir(
    aviso?.titulo === 'Nova versão disponível',
    'o modal anuncia a versão nova',
    aviso?.titulo ?? '—',
  );
  conferir(aviso?.botoes?.includes('Fechar') === true, 'o modal tem o x para fechar');
  conferir(aviso?.botoes?.includes('Reiniciar agora') === true, 'o modal tem o botão de reiniciar');

  // ---- 6. reiniciar devolve a aplicação ---------------------------------
  if (aviso !== null) {
    await cdp.avaliar(`
      [...document.querySelectorAll('app-atualizacao-dialog button')]
        .find((b) => b.textContent.includes('Reiniciar'))
        .click()
    `);
    await esperar(3000);

    const depois = await cdp.avaliar(`
      (() => {
        const dialogo = document.querySelector('app-atualizacao-dialog dialog');
        return { aberto: !!dialogo?.open, desenhou: !!document.querySelector('app-root .shell') };
      })()
    `);
    conferir(
      depois.desenhou && !depois.aberto,
      'depois de reiniciar, a aplicação volta sem o aviso',
      JSON.stringify(depois),
    );
  }

  cdp.fechar();
} finally {
  chrome.kill();
  servidor.close();
  await rm(copia, { recursive: true, force: true });
  await rm(perfil, { recursive: true, force: true });
}

console.log(passos.join('\n'));

if (falhas.length > 0) {
  console.log('\n' + falhas.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`\n${passos.length} verificações, todas passaram.`);
}
