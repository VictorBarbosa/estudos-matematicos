# Potenciação e radiciação

Propriedades das potências, expoentes negativos e raízes como potências.

**Área:** Matemática básica · **Rota:** `/matematica-basica/potenciacao-radiciacao`

## O que este módulo precisa ter

- `potenciacao-radiciacao.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `potenciacao-radiciacao.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `potenciacao-radiciacao.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `potenciacao-radiciacao.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/matematica-basica/matematica-basica.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
