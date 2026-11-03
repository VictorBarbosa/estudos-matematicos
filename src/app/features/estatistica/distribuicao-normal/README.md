# Distribuição normal

A curva que aparece sozinha: padronizar, ler áreas e julgar uma medida.

**Área:** Combinatória e estatística · **Rota:** `/estatistica/distribuicao-normal`

## O que este módulo precisa ter

- `distribuicao-normal.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `distribuicao-normal.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `distribuicao-normal.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `distribuicao-normal.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/estatistica/estatistica.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
