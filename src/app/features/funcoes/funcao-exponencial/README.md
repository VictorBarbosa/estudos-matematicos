# Função exponencial

Crescimento multiplicativo, o número e e meia-vida.

**Área:** Funções · **Rota:** `/funcoes/funcao-exponencial`

## O que este módulo precisa ter

- `funcao-exponencial.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `funcao-exponencial.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `funcao-exponencial.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `funcao-exponencial.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/funcoes/funcoes.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
