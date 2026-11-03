# Coordenadas cilíndricas e esféricas

Trocar de sistema para que a simetria some da conta — e o jacobiano.

**Área:** Cálculo 3 · **Rota:** `/calculo-3/coordenadas-no-espaco`

## O que este módulo precisa ter

- `coordenadas-no-espaco.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `coordenadas-no-espaco.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `coordenadas-no-espaco.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `coordenadas-no-espaco.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/calculo-3/calculo-3.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
