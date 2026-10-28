# Juros compostos

Crescimento exponencial aplicado a dinheiro ao longo do tempo.

**Área:** Aplicações · **Rota:** `/aplicacoes/juros-compostos`

## O que este módulo precisa ter

- `juros-compostos.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `juros-compostos.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `juros-compostos.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `juros-compostos.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/aplicacoes/aplicacoes.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
