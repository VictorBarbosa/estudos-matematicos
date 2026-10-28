# Trajetória balística

Lançamento oblíquo: alcance, altura máxima e tempo de voo.

**Área:** Aplicações · **Rota:** `/aplicacoes/trajetoria-balistica`

## O que este módulo precisa ter

- `trajetoria-balistica.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `trajetoria-balistica.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `trajetoria-balistica.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `trajetoria-balistica.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/aplicacoes/aplicacoes.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
