# Identidades trigonométricas

A identidade fundamental, arco duplo e soma de arcos.

**Área:** Trigonometria · **Rota:** `/trigonometria/identidades-trigonometricas`

## O que este módulo precisa ter

- `identidades-trigonometricas.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `identidades-trigonometricas.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `identidades-trigonometricas.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `identidades-trigonometricas.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/trigonometria/trigonometria.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
