# Ponto e reta

Distância entre pontos, equação da reta, paralelismo e perpendicularidade.

**Área:** Geometria analítica · **Rota:** `/geometria-analitica/ponto-e-reta`

## O que este módulo precisa ter

- `ponto-e-reta.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `ponto-e-reta.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `ponto-e-reta.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `ponto-e-reta.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/geometria-analitica/geometria-analitica.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
