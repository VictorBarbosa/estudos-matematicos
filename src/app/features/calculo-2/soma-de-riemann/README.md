# Soma de Riemann

Aproximar área por retângulos e refinar a partição até o limite.

**Área:** Cálculo 2 · **Rota:** `/calculo-2/soma-de-riemann`

## O que este módulo precisa ter

- `soma-de-riemann.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `soma-de-riemann.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `soma-de-riemann.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `soma-de-riemann.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/calculo-2/calculo-2.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
