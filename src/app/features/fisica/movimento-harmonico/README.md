# Movimento harmônico

Oscilação de uma mola descrita por seno e cosseno.

**Área:** Aplicações · **Rota:** `/aplicacoes/movimento-harmonico`

## O que este módulo precisa ter

- `movimento-harmonico.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `movimento-harmonico.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `movimento-harmonico.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `movimento-harmonico.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/aplicacoes/aplicacoes.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
