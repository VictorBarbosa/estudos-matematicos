# Conceito de função

Domínio, contradomínio, imagem e o teste da reta vertical.

**Área:** Funções · **Rota:** `/funcoes/conceito-funcao`

## O que este módulo precisa ter

- `conceito-funcao.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `conceito-funcao.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `conceito-funcao.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `conceito-funcao.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/funcoes/funcoes.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
