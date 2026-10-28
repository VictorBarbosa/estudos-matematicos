# Razão e proporção

Comparação entre grandezas, regra de três e proporcionalidade inversa.

**Área:** Matemática básica · **Rota:** `/matematica-basica/razao-proporcao`

## O que este módulo precisa ter

- `razao-proporcao.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `razao-proporcao.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `razao-proporcao.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `razao-proporcao.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/matematica-basica/matematica-basica.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
