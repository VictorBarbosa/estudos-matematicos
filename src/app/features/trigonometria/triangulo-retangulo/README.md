# Triângulo retângulo

Seno, cosseno e tangente como razões entre lados, e Pitágoras.

**Área:** Trigonometria · **Rota:** `/trigonometria/triangulo-retangulo`

## O que este módulo precisa ter

- `triangulo-retangulo.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `triangulo-retangulo.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `triangulo-retangulo.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `triangulo-retangulo.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/trigonometria/trigonometria.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
