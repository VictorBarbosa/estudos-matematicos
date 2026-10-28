# Vizinhanças e infinito

Épsilon e delta, e o comportamento de funções no infinito.

**Área:** Pré-cálculo · **Rota:** `/pre-calculo/vizinhancas-e-infinito`

## O que este módulo precisa ter

- `vizinhancas-e-infinito.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `vizinhancas-e-infinito.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `vizinhancas-e-infinito.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `vizinhancas-e-infinito.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/pre-calculo/pre-calculo.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
