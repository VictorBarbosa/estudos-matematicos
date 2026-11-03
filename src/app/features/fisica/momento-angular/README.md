# Conservação do momento angular

Sem torque externo, recolher a massa acelera o giro — e a energia não se conserva.

**Área:** Física · **Rota:** `/fisica/momento-angular`

## O que este módulo precisa ter

- `momento-angular.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `momento-angular.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `momento-angular.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `momento-angular.spec.ts` — testes do gerador.

A física em si vai em `src/app/core/math/fisica/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/fisica/fisica.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
