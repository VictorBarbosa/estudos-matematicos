# Derivação implícita

Derivar sem isolar y, que é o caminho quando a curva não é uma função.

**Área:** Cálculo 1 · **Rota:** `/calculo-1/derivacao-implicita`

## O que este módulo precisa ter

- `derivacao-implicita.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `derivacao-implicita.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `derivacao-implicita.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `derivacao-implicita.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/calculo-1/calculo-1.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
