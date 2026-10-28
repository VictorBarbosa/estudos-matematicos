# MMC e MDC

Fatoração em primos, algoritmo de Euclides e onde cada um é usado.

**Área:** Matemática básica · **Rota:** `/matematica-basica/mmc-mdc`

## O que este módulo precisa ter

- `mmc-mdc.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `mmc-mdc.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `mmc-mdc.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `mmc-mdc.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/matematica-basica/matematica-basica.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
