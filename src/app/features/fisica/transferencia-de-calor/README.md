# Transferência de calor

Condução, convecção e radiação — e por que no vácuo só a última sobra.

**Área:** Física · **Rota:** `/fisica/transferencia-de-calor`

## O que este módulo precisa ter

- `transferencia-de-calor.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `transferencia-de-calor.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `transferencia-de-calor.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `transferencia-de-calor.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/fisica/fisica.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
