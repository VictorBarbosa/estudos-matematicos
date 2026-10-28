# Integral definida

Área com sinal e as propriedades da integral.

**Área:** Cálculo 2 · **Rota:** `/calculo-2/integral-definida`

## O que este módulo precisa ter

- `integral-definida.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `integral-definida.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `integral-definida.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `integral-definida.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/calculo-2/calculo-2.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
