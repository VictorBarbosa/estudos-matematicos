# Aplicações de EDO

Montar a equação: resfriamento, decaimento, circuito RL e mistura.

**Área:** Cálculo 4 · **Rota:** `/calculo-4/aplicacoes-de-edo`

## O que este módulo precisa ter

- `aplicacoes-de-edo.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `aplicacoes-de-edo.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `aplicacoes-de-edo.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `aplicacoes-de-edo.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/calculo-4/calculo-4.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
