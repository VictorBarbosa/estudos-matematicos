# Dinâmica rotacional

Momento de inércia, torque e energia: a mecânica de Newton traduzida para o giro.

**Área:** Física · **Rota:** `/fisica/dinamica-rotacional`

## O que este módulo precisa ter

- `dinamica-rotacional.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `dinamica-rotacional.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `dinamica-rotacional.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `dinamica-rotacional.spec.ts` — testes do gerador.

A física em si vai em `src/app/core/math/fisica/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/fisica/fisica.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
