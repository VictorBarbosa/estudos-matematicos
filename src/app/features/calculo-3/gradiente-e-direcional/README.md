# Gradiente e derivada direcional

O vetor da subida mais íngreme, e a taxa em qualquer direção.

**Área:** Cálculo 3 · **Rota:** `/calculo-3/gradiente-e-direcional`

## O que este módulo precisa ter

- `gradiente-e-direcional.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `gradiente-e-direcional.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `gradiente-e-direcional.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `gradiente-e-direcional.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/calculo-3/calculo-3.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
