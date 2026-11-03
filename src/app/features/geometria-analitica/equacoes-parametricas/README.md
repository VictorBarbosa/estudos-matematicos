# Equações paramétricas

Cada coordenada em função do tempo — e por que isso guarda o que a cartesiana perde.

**Área:** Geometria analítica · **Rota:** `/geometria-analitica/equacoes-parametricas`

## O que este módulo precisa ter

- `equacoes-parametricas.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `equacoes-parametricas.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `equacoes-parametricas.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `equacoes-parametricas.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/geometria-analitica/geometria-analitica.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
