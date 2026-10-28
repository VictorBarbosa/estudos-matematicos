# Produtos notáveis

Quadrado da soma e diferença de quadrados, com demonstração geométrica.

**Área:** Álgebra · **Rota:** `/algebra/produtos-notaveis`

## O que este módulo precisa ter

- `produtos-notaveis.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `produtos-notaveis.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `produtos-notaveis.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `produtos-notaveis.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/algebra/algebra.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
