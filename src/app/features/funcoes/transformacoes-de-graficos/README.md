# Transformações de gráficos

Deslocar, esticar e refletir — e por que dentro dos parênteses tudo se inverte.

**Área:** Funções · **Rota:** `/funcoes/transformacoes-de-graficos`

## O que este módulo precisa ter

- `transformacoes-de-graficos.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `transformacoes-de-graficos.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `transformacoes-de-graficos.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `transformacoes-de-graficos.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/funcoes/funcoes.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
