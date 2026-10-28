# Sequências e séries

Progressões, somas infinitas e convergência.

**Área:** Pré-cálculo · **Rota:** `/pre-calculo/sequencias-e-series`

## O que este módulo precisa ter

- `sequencias-e-series.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `sequencias-e-series.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `sequencias-e-series.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `sequencias-e-series.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/pre-calculo/pre-calculo.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
