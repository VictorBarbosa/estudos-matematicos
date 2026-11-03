# Funções racionais

Um polinômio dividido por outro: domínio, assíntotas e o buraco que não é assíntota.

**Área:** Funções · **Rota:** `/funcoes/funcoes-racionais`

## O que este módulo precisa ter

- `funcoes-racionais.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `funcoes-racionais.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `funcoes-racionais.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `funcoes-racionais.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/funcoes/funcoes.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
