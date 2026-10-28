# Expressões algébricas

Variáveis, termos semelhantes e avaliação de expressões.

**Área:** Álgebra · **Rota:** `/algebra/expressoes-algebricas`

## O que este módulo precisa ter

- `expressoes-algebricas.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `expressoes-algebricas.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `expressoes-algebricas.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `expressoes-algebricas.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/algebra/algebra.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
