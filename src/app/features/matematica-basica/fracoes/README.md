# Frações

Partes de um inteiro, equivalência, simplificação e as quatro operações.

**Área:** Matemática básica · **Rota:** `/matematica-basica/fracoes`

## O que este módulo precisa ter

- `fracoes.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `fracoes.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `fracoes.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `fracoes.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## As formas de escrita dos operandos

Um operando aparece de três maneiras, e cada combinação é um tipo de exercício
com conceito próprio:

| Combinação | Exemplo | Conceito |
|---|---|---|
| fração com fração | `3/4 + 2/5` | `fracoes.soma` … |
| fração com inteiro | `3/4 × 5` | `fracoes.inteiro` |
| misto com fração | `2½ + ¾` | `fracoes.mista-fracao` |
| misto com misto | `2½ × 1⅓` | `fracoes.mista-soma` … |

O texto de cada uma vive em `core/enunciados/enunciados/fracoes/moldes/`, nas
três línguas — o gerador escolhe o molde pela combinação, não por um `if` com
a frase escrita dentro.

O inteiro nunca é 1: multiplicar ou dividir por 1 devolve o próprio enunciado,
e a lição — que todo inteiro é uma fração de denominador 1 — ficaria invisível.

## Ao concluir

1. Registre a rota em `src/app/features/matematica-basica/matematica-basica.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
