# Séries de Taylor e Maclaurin

Aproximar uma função por polinômios, e o erro que sobra.

**Área:** Cálculo 2 · **Rota:** `/calculo-2/series-de-taylor`

## O que este módulo precisa ter

- `series-de-taylor.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `series-de-taylor.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `series-de-taylor.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `series-de-taylor.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/calculo-2/calculo-2.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
