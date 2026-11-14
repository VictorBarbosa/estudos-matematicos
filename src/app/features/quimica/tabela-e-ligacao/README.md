# Tabela periódica e ligação

A tabela está arrumada por número atômico, e o que se repete a cada linha é a
configuração da **última camada**. Tudo o mais é consequência disso.

## As três perguntas são a mesma leitura

| Pergunta                   | O que ela lê                              |
| -------------------------- | ----------------------------------------- |
| Grupo                      | os elétrons da última camada (+10 se ≥ 3) |
| Carga do íon               | quantos faltam ou sobram para fechar      |
| Fórmula do composto iônico | as duas cargas, cruzadas e reduzidas      |

Sódio e potássio dão exatamente a mesma coisa com o cloro, e a aba Explorar
mostra isso trocando um dos dois elementos: é a regularidade, não uma
coincidência.

## O que o treino NÃO cobra, e por quê

Classificar a ligação a partir da diferença de eletronegatividade. Os cortes de
**1,7** e **0,4** são convenção de ensino, não lei: o HF tem 1,78 e cai do lado
iônico numa régua que o chama de molécula covalente muito polar. Compostos
perto do limite são parcialmente iônicos, e nenhum número decide por eles.

Então: a **conta** da diferença é pergunta de treino; o **rótulo** que ela
sugere fica na teoria e na aba Explorar, onde pode vir com a ressalva ao lado.
Há guarda no spec para que o rótulo não vire gabarito.

## As recusas honestas

`grupo` devolve `undefined` no bloco d e f, e `cargaMaisProvavel` devolve
`undefined` para gases nobres e para o grupo 14. Não é limitação de
implementação: é que a leitura pela última camada **não vale** ali, e inventar
um número seria pior que não dar nenhum. O gerador sorteia só os elementos em
que a resposta existe — guarda no spec.

O hidrogênio fica fora da lista de cátions. Ele tem um elétron na última camada
e carga +1 pela conta, mas HCl não é composto iônico: é molécula covalente
polar. Fórmula certa não compensa pergunta falsa.

## A fórmula iônica é uma proporção

O cruzamento — o índice de cada um é a carga do outro — não é truque: é a
condição de neutralidade escrita curta. E a redução não é detalhe: a fórmula
iônica não descreve uma molécula, descreve a proporção dos íons no retículo.
Mg²⁺ com O²⁻ dá **MgO**, nunca Mg₂O₂ — e Mg₂O₂ é uma das armadilhas, porque é
o que sai de cruzar sem reduzir.

## Armadilhas

| O que o aluno fez                           | Pergunta  |
| ------------------------------------------- | --------- |
| Deu a contagem da última camada (1A–8A)     | grupo     |
| Deu o período em vez do grupo               | grupo     |
| Trocou o sinal da carga                     | carga     |
| Deu quantos elétrons tem, não quantos troca | carga     |
| Cruzou e não reduziu                        | fórmula   |
| Pôs em cada um o próprio número como índice | fórmula   |
| Somou as eletronegatividades                | diferença |
