# Noção intuitiva de limite

Aproximar-se de um valor sem necessariamente alcançá-lo.

**Área:** Pré-cálculo · **Rota:** `/pre-calculo/nocao-intuitiva-de-limite`

## O que este módulo precisa ter

- `nocao-intuitiva-de-limite.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `nocao-intuitiva-de-limite.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `nocao-intuitiva-de-limite.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `nocao-intuitiva-de-limite.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/pre-calculo/pre-calculo.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
