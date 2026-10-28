# Seno, cosseno e tangente

Como as três razões se relacionam e por que a tangente tem assíntotas.

**Área:** Trigonometria · **Rota:** `/trigonometria/seno-cosseno-tangente`

## O que este módulo precisa ter

- `seno-cosseno-tangente.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `seno-cosseno-tangente.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `seno-cosseno-tangente.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `seno-cosseno-tangente.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/trigonometria/trigonometria.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
