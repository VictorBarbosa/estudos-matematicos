# Aplicações da derivada

Máximos e mínimos, concavidade, otimização e taxas relacionadas.

**Área:** Cálculo 1 · **Rota:** `/calculo-1/aplicacoes-da-derivada`

## O que este módulo precisa ter

- `aplicacoes-da-derivada.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `aplicacoes-da-derivada.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `aplicacoes-da-derivada.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `aplicacoes-da-derivada.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/calculo-1/calculo-1.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
