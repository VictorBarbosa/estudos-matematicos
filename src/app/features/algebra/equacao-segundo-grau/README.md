# Equação do 2º grau

Bhaskara, discriminante e as três situações possíveis de raízes.

**Área:** Álgebra · **Rota:** `/algebra/equacao-segundo-grau`

## O que este módulo precisa ter

- `equacao-segundo-grau.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `equacao-segundo-grau.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `equacao-segundo-grau.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `equacao-segundo-grau.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/algebra/algebra.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
