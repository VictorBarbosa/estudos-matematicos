# Funções definidas por partes

Expressões diferentes em faixas diferentes, e tudo que importa acontece nas fronteiras.

**Área:** Funções · **Rota:** `/funcoes/funcoes-por-partes`

## O que este módulo precisa ter

- `funcoes-por-partes.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `funcoes-por-partes.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `funcoes-por-partes.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `funcoes-por-partes.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/funcoes/funcoes.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
