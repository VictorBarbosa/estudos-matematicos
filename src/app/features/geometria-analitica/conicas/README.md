# Cônicas

Elipse, parábola e hipérbole como secções de um cone.

**Área:** Geometria analítica · **Rota:** `/geometria-analitica/conicas`

## O que este módulo precisa ter

- `conicas.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `conicas.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `conicas.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `conicas.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/geometria-analitica/geometria-analitica.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
