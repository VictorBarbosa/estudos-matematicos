# Continuidade

Funções sem saltos e o teorema do valor intermediário.

**Área:** Cálculo 1 · **Rota:** `/calculo-1/continuidade`

## O que este módulo precisa ter

- `continuidade.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `continuidade.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `continuidade.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `continuidade.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/calculo-1/calculo-1.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
