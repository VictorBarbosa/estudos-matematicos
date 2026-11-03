# Movimento circular

Período, velocidade angular e a aceleração que existe mesmo com rapidez constante.

**Área:** Física · **Rota:** `/fisica/movimento-circular`

## O que este módulo precisa ter

- `movimento-circular.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `movimento-circular.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `movimento-circular.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `movimento-circular.spec.ts` — testes do gerador.

A física em si vai em `src/app/core/math/fisica/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/fisica/fisica.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
