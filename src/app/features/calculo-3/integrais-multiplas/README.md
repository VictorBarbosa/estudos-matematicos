# Integrais múltiplas

Somar sobre uma região: integração iterada, volume e valor médio.

**Área:** Cálculo 3 · **Rota:** `/calculo-3/integrais-multiplas`

## O que este módulo precisa ter

- `integrais-multiplas.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `integrais-multiplas.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `integrais-multiplas.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `integrais-multiplas.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/calculo-3/calculo-3.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
