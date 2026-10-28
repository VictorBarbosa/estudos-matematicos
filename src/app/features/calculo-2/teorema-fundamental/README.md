# Teorema fundamental do cálculo

A ponte que mostra que derivar e integrar são operações inversas.

**Área:** Cálculo 2 · **Rota:** `/calculo-2/teorema-fundamental`

## O que este módulo precisa ter

- `teorema-fundamental.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `teorema-fundamental.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `teorema-fundamental.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `teorema-fundamental.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/calculo-2/calculo-2.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
