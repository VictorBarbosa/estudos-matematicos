# Definição de derivada

Da reta secante à tangente: o limite do quociente de Newton.

**Área:** Cálculo 1 · **Rota:** `/calculo-1/definicao-de-derivada`

## O que este módulo precisa ter

- `definicao-de-derivada.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `definicao-de-derivada.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `definicao-de-derivada.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `definicao-de-derivada.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/calculo-1/calculo-1.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
