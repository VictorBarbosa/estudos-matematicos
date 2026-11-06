/*
 * Procura dado pessoal no que está versionado.
 *
 * O motivo é o Xcode: ao assinar o aplicativo para um iPhone de verdade, ele
 * escreve o `DEVELOPMENT_TEAM` da conta Apple dentro do `project.pbxproj` —
 * sem avisar, e num arquivo que ninguém lê antes de comitar. O repositório é
 * público, e o Team ID identifica a conta. Daí esta trava.
 *
 * O Team ID em uso mora em `ios/local.xcconfig`, que o .gitignore cobre; o
 * `debug.xcconfig` e o `release.xcconfig` o incluem com `#include?`, que é
 * opcional — quem clonar compila para o simulador sem criar arquivo nenhum.
 *
 * Uso: `npm run verificar:privacidade`. Entra no `npm run lint`.
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const RAIZ = new URL('..', import.meta.url).pathname;
const ESTE_ARQUIVO = 'scripts/verificar-privacidade.mjs';

/** Cada padrão vem com o motivo, que é o que a mensagem de erro precisa dizer. */
const PROIBIDOS = [
  // O alvo é o VALOR, não o nome da configuração — o README fala dela.
  { nome: 'Team ID da conta Apple', regex: /DEVELOPMENT_TEAM\s*=\s*[A-Z0-9]{10}\b/ },
  { nome: 'perfil de provisionamento', regex: /PROVISIONING_PROFILE\w*\s*=\s*[\w"-]|\.mobileprovision/ },
  { nome: 'caminho absoluto deste Mac', regex: /\/Users\/[a-z]/i },
  {
    nome: 'endereço de e-mail',
    // O `@2x` dos nomes de imagem do iOS tem a forma de um endereço; a
    // lista de extensões é o que distingue um do outro.
    regex:
      /[\w.+-]+@[\w-]+(?:\.[\w-]+)*\.(?!png|jpe?g|svg|m?js|ts|json|md|html|s?css|plist|swift|xcconfig|storyboard|lock|ya?ml|txt)[a-z]{2,}\b/i,
  },
  { nome: 'chave privada', regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { nome: 'credencial de serviço', regex: /\b(ghp_|github_pat_|sk-[a-zA-Z0-9]{20}|AKIA[0-9A-Z]{16})/ },
  { nome: 'token de registro npm', regex: /_authToken|\/\/registry\.[^\s]*:_auth/ },
];

/** Arquivos que o Xcode gera com dado de usuário e nunca deveriam ser versionados. */
const CAMINHOS_PROIBIDOS = /xcuserdata|\.p12$|\.cer$|\.keychain|\.DS_Store$/;

const versionados = execSync('git ls-files', { cwd: RAIZ, encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter((caminho) => caminho !== '' && caminho !== ESTE_ARQUIVO);

const achados = [];

for (const caminho of versionados) {
  if (CAMINHOS_PROIBIDOS.test(caminho)) {
    achados.push(`${caminho}: arquivo de dados do usuário, não deveria estar versionado`);
    continue;
  }

  // Imagens e o lock são grandes e binários ou gerados; nada a procurar em texto.
  if (/\.(png|jpg|jpeg|ico|woff2?|ttf)$/.test(caminho)) {
    continue;
  }

  const conteudo = readFileSync(RAIZ + caminho, 'utf8');

  for (const { nome, regex } of PROIBIDOS) {
    const achado = regex.exec(conteudo);
    if (achado !== null) {
      const linha = conteudo.slice(0, achado.index).split('\n').length;
      achados.push(`${caminho}:${linha}: ${nome}`);
    }
  }
}

if (achados.length > 0) {
  console.error(`${achados.length} achado(s) de dado pessoal no que está versionado:\n`);
  for (const achado of achados) {
    console.error(`  ${achado}`);
  }
  console.error('\nTire o dado do arquivo versionado antes de comitar.');
  process.exit(1);
}

console.log(`${versionados.length} arquivos versionados, nenhum dado pessoal.`);
