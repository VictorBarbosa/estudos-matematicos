# Integrais impróprias

Integrais com limite infinito ou integrando ilimitado, e quando elas convergem.

**Área:** Cálculo 2 · **Rota:** `/calculo-2/integrais-improprias`

## O que este módulo precisa ter

- `integrais-improprias.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `integrais-improprias.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `integrais-improprias.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `integrais-improprias.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/calculo-2/calculo-2.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
