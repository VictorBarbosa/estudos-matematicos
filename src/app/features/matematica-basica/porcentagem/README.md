# Porcentagem

Porcentagem como fração de denominador cem, acréscimos e descontos sucessivos.

**Área:** Matemática básica · **Rota:** `/matematica-basica/porcentagem`

## O que este módulo precisa ter

- `porcentagem.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `porcentagem.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `porcentagem.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `porcentagem.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/matematica-basica/matematica-basica.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
