# Regra da cadeia

Derivar funções compostas e por que os diferenciais se cancelam.

**Área:** Cálculo 1 · **Rota:** `/calculo-1/regra-da-cadeia`

## O que este módulo precisa ter

- `regra-da-cadeia.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `regra-da-cadeia.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `regra-da-cadeia.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `regra-da-cadeia.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/calculo-1/calculo-1.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
