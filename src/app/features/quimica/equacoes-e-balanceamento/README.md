# Equações e balanceamento

Uma reação rearranja átomos: não os cria nem os destrói. Os coeficientes são a
única coisa ajustável.

## O erro que o tópico existe para corrigir

Mexer no **índice**. Querendo fechar o oxigênio da água, a tentação é escrever
`H₂ + O₂ → H₂O₂`: a conta fecha, e a química não — isso é peróxido de
hidrogênio. O índice faz parte da identidade da substância; o coeficiente diz
quantas moléculas dela participam. Por isso a dica do tópico nomeia a diferença
em vez de dar um método.

O coeficiente 1 não se escreve, mas existe: ele conta na soma e na contagem de
átomos. Duas das armadilhas vivem exatamente disso.

## Contar é a prova

A pergunta «quantos átomos de O há em cada lado?» não é decorativa. Quem sabe
contar coeficiente × índice nos dois lados **confere a própria resposta sem
gabarito**, e isso vale mais que acertar um exercício. A aba Explorar mostra as
duas colunas lado a lado pelo mesmo motivo.

## Balancear é resolver um sistema

`core/math/quimica/balanceamento` não tenta e erra: monta a matriz em que cada
elemento é uma linha (átomos que entram menos os que saem, igual a zero), acha
o núcleo e reduz aos menores inteiros positivos.

A aritmética é **exata**, com frações de inteiros. Em ponto flutuante um
coeficiente 3 sairia 2,9999999999999996, e o arredondamento decidiria a
química — num tópico cuja lição é que a conta fecha, isso seria contradizer o
próprio tópico.

Daí saem três recusas honestas, em vez de uma resposta inventada:

| Situação                     | Por que                                       |
| ---------------------------- | --------------------------------------------- |
| Fórmula ilegível             | não há o que contar                           |
| Sistema sem solução positiva | equação impossível                            |
| Duas variáveis livres        | ambígua: `C + O₂ → CO + CO₂` são duas reações |

## Por que a lista de equações é fechada, e testada

São 38 reações conhecidas. Uma equação inventada seria química falsa com
aparência de verdadeira — e, pior, poderia ser ambígua ou impossível sem que se
notasse. O spec do tópico confere **todas** elas: balanceiam, fecham, e os
coeficientes são inteiros positivos. É esse teste que autoriza acrescentar
equações à lista.

## Armadilhas

| O que o aluno fez                     | Pergunta    |
| ------------------------------------- | ----------- |
| Deixou a substância sem coeficiente   | coeficiente |
| Leu o coeficiente de outra substância | coeficiente |
| Somou só o lado esquerdo              | soma        |
| Esqueceu os coeficientes 1 na soma    | soma        |
| Somou os índices sem os coeficientes  | átomos      |
