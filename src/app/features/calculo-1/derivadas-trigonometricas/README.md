# Derivadas trigonométricas

Derivar seno, cosseno e tangente — e por que a derivada do seno é o cosseno.

**Área:** Cálculo 1 · **Rota:** `/calculo-1/derivadas-trigonometricas`

## O que este módulo precisa ter

- `derivadas-trigonometricas.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `derivadas-trigonometricas.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `derivadas-trigonometricas.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `derivadas-trigonometricas.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/calculo-1/calculo-1.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
