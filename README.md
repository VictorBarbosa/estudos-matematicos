# Calculadora Matemática

A calculadora do [Estudos Matemáticos](../EstudosMatematicos), empacotada para
rodar no iPhone. Mesma mecânica, outra moldura: em vez de uma janela flutuante
com abas, uma página inteira com os modos num menu lateral.

## Os quatro modos

| Modo | O que faz |
| --- | --- |
| **Básica** | As quatro operações, porcentagem e troca de sinal |
| **Científica** | Seno, cosseno, tangente, logaritmos, potências, raiz, π e *e* |
| **MMC e MDC** | Dois ou mais inteiros, com a divisão simultânea passo a passo |
| **Fatorar** | Dois números por produto e soma, com a fatoração e as raízes |
| **Decimal em fração** | `0,375` vira `3/8`; `0,1(6)` vira `1/6`, com a conta à vista |

Os três últimos usam campo de texto com o teclado numérico do iPhone, que não
traz vírgula, parênteses nem sinal de menos. Cada campo ganha ao lado a tecla
que lhe falta: `,` para separar os inteiros do MMC, `±` para o produto ou a
soma negativos do Fatorar, e `,` `(` `)` `±` para escrever a dízima. Tocar
nessas teclas não fecha o teclado do sistema — o `pointerdown` é barrado, para
o campo não perder o foco.

O teclado tem um **apagar** (⌫) que a calculadora da Apple não tem: lá se
apaga arrastando o dedo sobre o visor, gesto que ninguém descobre, e sem ele
um dígito errado obriga a refazer a conta.

A dízima periódica se escreve com o período entre parênteses — `0,(3)`,
`1,2(45)` —, que é a notação da escola e a única sem ambiguidade: em `0,1212…`
não dá para saber se repete `12` ou `2`. A conversão mostra a conta inteira,
inclusive a subtração que elimina a cauda infinita.

O visor mostra a **expressão inteira**, e não um número solto: num aplicativo
que nasceu de um site que ensina a ordem das operações, esconder que
`2 + 3 × 4` é 14 e não 20 seria contraproducente.

## De onde vem o código

O núcleo veio copiado do site, sem uma linha alterada — é o mesmo código que
roda em produção lá, com os mesmos 81 testes:

```
src/app/core/calculadora/models/calculadora.model.ts   a mecânica
src/app/core/treino/resposta-simbolica/…               o analisador de expressões
src/app/core/treino/resposta-numerica/…                a leitura de números
src/app/core/math/numeros/inteiros/…                   MMC, MDC e fatoração
```

O que é próprio daqui: a página (`src/app/calculadora/`), o menu lateral
(`src/app/app.component.*`) e as frases em português — no site elas vêm do
dicionário de três idiomas, e aqui a tabela cabe em vinte linhas.

Atualizar o núcleo depois de mexer no site é recopiar esses quatro caminhos.

## Rodar

```sh
npm install
npm start                 # no navegador, em http://localhost:4200
npm run test:unit         # os 94 testes
```

## Levar para o iPhone

```sh
npm run cap:run           # compila, sincroniza e roda no aparelho
```

É o atalho do dia a dia: ele compila a web, leva o `www/` para o projeto
nativo e abre o aplicativo. Sem argumento, pergunta em qual aparelho rodar.
Para escolher direto, ou para ver o que está conectado:

```sh
npm run cap:run -- --list              # os aparelhos e simuladores disponíveis
npm run cap:run -- --target <id>       # roda num deles, sem perguntar
npm run cap:run -- --target-name "iPhone de Victor"
```

Os outros dois atalhos, para quando o Xcode é necessário — assinatura,
perfil de provisionamento, publicação:

```sh
npm run cap:sync          # só compila e sincroniza
npm run cap:open          # compila, sincroniza e abre o Xcode
```

No Xcode: escolher o aparelho, ajustar o *Team* em **Signing & Capabilities** e
apertar ▶. O identificador do aplicativo está em `capacitor.config.ts`.

> Toda mudança no código web exige um desses comandos antes de rodar no
> aparelho: o `www/` é copiado para dentro do projeto nativo, e sem a cópia o
> Xcode compila feliz com a versão anterior.

## O ícone

`npm run icones:ios` desenha o ícone e a tela de abertura e fatia os tamanhos
que o Xcode pede. O desenho é o mesmo símbolo do site — o sinal de integral
sobre o azul de acento — e vive em `scripts/gerar-icones.mjs`: trocar o glifo
é mudar uma linha. Exige `rsvg-convert` (`brew install librsvg`).
