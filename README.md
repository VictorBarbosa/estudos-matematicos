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
npm run build             # gera www/
npx cap sync ios          # leva o www/ para o projeto nativo
npx cap open ios          # abre o Xcode
```

No Xcode: escolher o aparelho, ajustar o *Team* em **Signing & Capabilities** e
apertar ▶. O identificador do aplicativo está em `capacitor.config.ts`.

## O ícone

`npm run icones:ios` desenha o ícone e a tela de abertura e fatia os tamanhos
que o Xcode pede. O desenho é o mesmo símbolo do site — o sinal de integral
sobre o azul de acento — e vive em `scripts/gerar-icones.mjs`: trocar o glifo
é mudar uma linha. Exige `rsvg-convert` (`brew install librsvg`).
