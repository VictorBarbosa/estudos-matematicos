# Integrais de linha

Acumular ao longo de um caminho, e quando o caminho deixa de importar.

**Área:** Cálculo 3 · **Rota:** `/calculo-3/integrais-de-linha`

## O que este módulo precisa ter

- `integrais-de-linha.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `integrais-de-linha.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `integrais-de-linha.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `integrais-de-linha.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/calculo-3/calculo-3.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
