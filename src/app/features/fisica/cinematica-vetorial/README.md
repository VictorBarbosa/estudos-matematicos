# Cinemática vetorial

Movimento no plano: deslocamento, velocidade relativa e as duas caras da aceleração.

**Área:** Física · **Rota:** `/fisica/cinematica-vetorial`

## O que este módulo precisa ter

- `cinematica-vetorial.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `cinematica-vetorial.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `cinematica-vetorial.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `cinematica-vetorial.spec.ts` — testes do gerador.

A física em si vai em `src/app/core/math/fisica/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/fisica/fisica.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
