# Regressão e correlação

Qual reta descreve os dados, e o quanto eles realmente seguem uma reta.

**Área:** Combinatória e estatística · **Rota:** `/estatistica/regressao-e-correlacao`

## O que este módulo precisa ter

- `regressao-e-correlacao.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `regressao-e-correlacao.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `regressao-e-correlacao.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `regressao-e-correlacao.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/estatistica/estatistica.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
