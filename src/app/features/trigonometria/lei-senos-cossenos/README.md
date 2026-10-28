# Leis dos senos e dos cossenos

Resolver triângulos que não têm ângulo reto.

**Área:** Trigonometria · **Rota:** `/trigonometria/lei-senos-cossenos`

## O que este módulo precisa ter

- `lei-senos-cossenos.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `lei-senos-cossenos.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `lei-senos-cossenos.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `lei-senos-cossenos.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/trigonometria/trigonometria.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
