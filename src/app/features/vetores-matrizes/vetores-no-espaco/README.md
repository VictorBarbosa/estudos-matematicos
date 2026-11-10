# Vetores no espaço

Componentes x, y e z, vetores unitários e os dois produtos em três dimensões.

**Área:** Vetores e matrizes · **Rota:** `/vetores-matrizes/vetores-no-espaco`

## Por que ele existe

O plano é onde se aprende; o espaço é onde a engenharia acontece. Uma força sobre uma asa, a
posição de um satélite e o torque de um motor têm três componentes — e o plano de estudo
chama vetores de _"uma das áreas que mais precisam de complementação"_ justamente por isso.

Dois exercícios daqui **não existem no plano**:

- o **produto vetorial**, que em duas dimensões é um número solto e aqui é um vetor
  perpendicular aos dois — é o que dá sentido a torque e a momento angular, que apontam numa
  direção que não é a do movimento;
- o **produto misto**, cujo módulo é o volume do paralelepípedo e cujo zero responde, de uma
  vez, se três vetores cabem num mesmo plano.

## Toda resposta é um número

Inclusive nos exercícios que produzem vetores: ali se pede **uma componente**, sorteada no
enunciado. É o que permite corrigir com a tolerância do campo numérico — duas casas decimais —
em vez de inventar um formato de resposta para vetor, com todas as formas de escrever `(1, 2, 3)`
que teriam de ser aceitas.

## As armadilhas

Cada uma é um erro que se comete de verdade, não um distrator:

| Erro                                     | O que o diagnóstico diz                          |
| ---------------------------------------- | ------------------------------------------------ |
| Somar as componentes para achar o módulo | O módulo é a raiz da soma dos **quadrados**      |
| Esquecer o z                             | Pitágoras se aplica duas vezes, não uma          |
| Responder `b × a`                        | A ordem importa: trocar os vetores troca o sinal |
| Dar o escalar quando se pede o vetorial  | Um devolve número, o outro devolve vetor         |
| Esquecer o módulo no produto misto       | O sinal é a orientação; volume é sempre positivo |

A componente **y** do produto vetorial tem dica própria: a ordem dos termos é trocada ali, e é
onde o sinal se perde.

## O que este módulo precisa ter

- `vetores-no-espaco.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`.
- `vetores-no-espaco.gerador.ts` — `GeradorExercicio`, com as armadilhas.
- `vetores-no-espaco.teoria.ts` — os sete conceitos do tópico.
- `vetores-no-espaco.spec.ts` — testes do gerador e do motor.

A matemática vai em `src/app/core/math/algebra/vetores-espaco/`, com nomes próprios
(`modulo3ComPassos`, `produtoVetorial3ComPassos`) porque o barril `@core/math` já exporta os
equivalentes do plano e de geometria espacial.

## A aba Explorar

Os dois produtos lado a lado, com os mesmos vetores — é a comparação que ensina a diferença.
E uma conferência que vale ver mudando: o escalar do produto vetorial com qualquer um dos
originais fica em zero, mexa-se no que se mexer. É a perpendicularidade acontecendo na tela.
