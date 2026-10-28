# Sistemas lineares

Substituição e adição, com a solução vista como intersecção de retas.

**Área:** Álgebra · **Rota:** `/algebra/sistemas-lineares`

## O que este módulo precisa ter

- `sistemas-lineares.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `sistemas-lineares.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `sistemas-lineares.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `sistemas-lineares.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/algebra/algebra.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
