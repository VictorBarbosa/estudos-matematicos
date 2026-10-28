# Funções trigonométricas

Amplitude, período e fase: a forma da onda.

**Área:** Trigonometria · **Rota:** `/trigonometria/funcoes-trigonometricas`

## O que este módulo precisa ter

- `funcoes-trigonometricas.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `funcoes-trigonometricas.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `funcoes-trigonometricas.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `funcoes-trigonometricas.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/trigonometria/trigonometria.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
