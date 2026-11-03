# Funções de várias variáveis

Domínio como região, gráfico como superfície e curvas de nível.

**Área:** Cálculo 3 · **Rota:** `/calculo-3/funcoes-de-varias-variaveis`

## O que este módulo precisa ter

- `funcoes-de-varias-variaveis.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `funcoes-de-varias-variaveis.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `funcoes-de-varias-variaveis.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `funcoes-de-varias-variaveis.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/calculo-3/calculo-3.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
