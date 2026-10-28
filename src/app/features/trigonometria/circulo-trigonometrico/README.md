# Círculo trigonométrico

Do triângulo ao círculo de raio 1, radianos e ângulos além de 90°.

**Área:** Trigonometria · **Rota:** `/trigonometria/circulo-trigonometrico`

## O que este módulo precisa ter

- `circulo-trigonometrico.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `circulo-trigonometrico.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `circulo-trigonometrico.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `circulo-trigonometrico.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/trigonometria/trigonometria.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
