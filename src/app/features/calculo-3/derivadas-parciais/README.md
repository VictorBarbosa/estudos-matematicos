# Derivadas parciais

Derivar numa direção de cada vez, e o que a segunda ordem revela.

**Área:** Cálculo 3 · **Rota:** `/calculo-3/derivadas-parciais`

## O que este módulo precisa ter

- `derivadas-parciais.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `derivadas-parciais.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `derivadas-parciais.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `derivadas-parciais.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/calculo-3/calculo-3.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
