# Derivadas de exponencial e logaritmo

A função que é a própria derivada, e a que vira 1/x.

**Área:** Cálculo 1 · **Rota:** `/calculo-1/derivadas-exponencial-logaritmo`

## O que este módulo precisa ter

- `derivadas-exponencial-logaritmo.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `derivadas-exponencial-logaritmo.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `derivadas-exponencial-logaritmo.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `derivadas-exponencial-logaritmo.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/calculo-1/calculo-1.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
