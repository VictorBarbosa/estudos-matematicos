# Frações

Partes de um inteiro, equivalência, simplificação e as quatro operações.

**Área:** Matemática básica · **Rota:** `/matematica-basica/fracoes`

## O que este módulo precisa ter

- `fracoes.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `fracoes.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `fracoes.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `fracoes.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/matematica-basica/matematica-basica.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
