# Números decimais

Decimais como frações de denominador potência de dez, e dízimas periódicas.

**Área:** Matemática básica · **Rota:** `/matematica-basica/numeros-decimais`

## O que este módulo precisa ter

- `numeros-decimais.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `numeros-decimais.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `numeros-decimais.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `numeros-decimais.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/matematica-basica/matematica-basica.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
