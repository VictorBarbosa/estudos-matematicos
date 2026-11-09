# Estudo de sinal e inequações do 2º grau

Quadro de sinais, o sinal do trinômio e as inequações-produto e quociente.

**Área:** Álgebra · **Rota:** `/algebra/inequacoes-segundo-grau`

## O que este módulo tem

- `inequacoes-segundo-grau.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** (parábola e o trecho do eixo que resolve a inequação) e **Treinar**.
- `inequacoes-segundo-grau.gerador.ts` — `GeradorExercicio` cuja resposta é o conjunto solução
  (`-2 < x < 3`, `x <= 1 ou x >= 4`, `x ≠ 2`, `vazio`, `todos`), com as armadilhas do pedaço
  trocado, da bolinha trocada e do zero do denominador incluído.
- `inequacoes-segundo-grau.teoria.ts` — estudo de sinal do produto, sinal do trinômio, Δ ≤ 0 e
  inequação-quociente.
- `inequacoes-segundo-grau.spec.ts` — testes do gerador e do leitor de conjuntos.

A matemática fica em `src/app/core/math/algebra/inequacao-quadratica/`.

## Por que existe

A avaliação de 09/11/2026 apontou o estudo de sinal como pré-requisito ausente:
`aplicacoes-da-derivada` decide crescimento pelo sinal de f′ sem que a técnica fosse ensinada.
