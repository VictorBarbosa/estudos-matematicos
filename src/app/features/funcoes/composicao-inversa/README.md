# Composição e inversa

Encadear funções e refletir o gráfico na reta y = x.

**Área:** Funções · **Rota:** `/funcoes/composicao-inversa`

## O que este módulo precisa ter

- `composicao-inversa.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `composicao-inversa.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `composicao-inversa.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `composicao-inversa.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/funcoes/funcoes.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
