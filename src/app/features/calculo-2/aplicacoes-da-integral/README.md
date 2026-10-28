# Aplicações da integral

Área entre curvas, volume de sólidos de revolução e comprimento de arco.

**Área:** Cálculo 2 · **Rota:** `/calculo-2/aplicacoes-da-integral`

## O que este módulo precisa ter

- `aplicacoes-da-integral.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `aplicacoes-da-integral.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `aplicacoes-da-integral.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `aplicacoes-da-integral.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/calculo-2/calculo-2.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
