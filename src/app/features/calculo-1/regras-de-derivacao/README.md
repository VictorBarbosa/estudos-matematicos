# Regras de derivação

Potência, produto e quociente, demonstradas pela definição.

**Área:** Cálculo 1 · **Rota:** `/calculo-1/regras-de-derivacao`

## O que este módulo precisa ter

- `regras-de-derivacao.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `regras-de-derivacao.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `regras-de-derivacao.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `regras-de-derivacao.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/calculo-1/calculo-1.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
