# Taxa de variação

Velocidade e aceleração como derivadas da posição.

**Área:** Aplicações · **Rota:** `/aplicacoes/taxa-de-variacao`

## O que este módulo precisa ter

- `taxa-de-variacao.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `taxa-de-variacao.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `taxa-de-variacao.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `taxa-de-variacao.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/aplicacoes/aplicacoes.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
