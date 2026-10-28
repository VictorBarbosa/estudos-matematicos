# Equação do 1º grau

Resolver ax + b = 0 e ver a raiz como o cruzamento da reta com o eixo x.

**Área:** Álgebra · **Rota:** `/algebra/equacao-primeiro-grau`

## O que este módulo precisa ter

- `equacao-primeiro-grau.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `equacao-primeiro-grau.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `equacao-primeiro-grau.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `equacao-primeiro-grau.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/algebra/algebra.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
