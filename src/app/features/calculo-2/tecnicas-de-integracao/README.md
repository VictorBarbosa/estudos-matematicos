# Técnicas de integração

Substituição, integração por partes e frações parciais.

**Área:** Cálculo 2 · **Rota:** `/calculo-2/tecnicas-de-integracao`

## O que este módulo precisa ter

- `tecnicas-de-integracao.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `tecnicas-de-integracao.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `tecnicas-de-integracao.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `tecnicas-de-integracao.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/calculo-2/calculo-2.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
