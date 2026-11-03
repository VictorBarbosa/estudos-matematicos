# Métodos numéricos

Euler, Runge-Kutta e a ordem com que o erro responde ao passo.

**Área:** Cálculo 4 · **Rota:** `/calculo-4/metodos-numericos`

## O que este módulo precisa ter

- `metodos-numericos.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `metodos-numericos.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `metodos-numericos.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `metodos-numericos.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/calculo-4/calculo-4.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
