# Fórmulas e nomenclatura

O nome de um composto binário não é rótulo arbitrário: é descrição. Sabendo o
nome, sabem-se os elementos; sabendo os elementos, sabem-se as cargas; e das
cargas sai a fórmula.

## Numa direção só, e de propósito

O tópico vai **do nome para a fórmula**. A direção contrária — escrever o nome
a partir da fórmula — seria texto livre em três línguas, com acento, artigo e
ordem de palavras, e corrigir isso seria corrigir redação em vez de química.

Quem sabe ir do nome à fórmula sabe a regra. O caminho de volta é o mesmo
caminho.

## O numeral romano é a carga

Ferro é +2 ou +3; cobre, +1 ou +2; chumbo e estanho, +2 ou +4. Para eles
**«cloreto de ferro» não é um nome completo**: não diz se é FeCl₂ ou FeCl₃. O
numeral de Stock é a carga escrita, e é informação, não decoração. Com metal de
carga fixa ele não se usa, porque não há o que desambiguar — há guarda no spec
para que ele apareça exatamente onde é necessário.

## Por que o arquivo de textos é o maior do tópico

Nomenclatura **é** língua, diferente de todo o resto do site. Uma fórmula não se
traduz; o nome dela se traduz três vezes — e a ordem das palavras muda:

| Língua    | Nome               |
| --------- | ------------------ |
| Português | cloreto de sódio   |
| Francês   | chlorure de sodium |
| Inglês    | sodium chloride    |

As tabelas de nomes ficam no `textos.ts` do tópico, e não em `core`: o núcleo
calcula e não fala línguas. O que o núcleo faz aqui é a fórmula a partir das
cargas (`quimica/ligacao`) e o nox a partir da soma zero (`quimica/nox`).

## O nox, e as exceções que ele respeita

A regra é uma só: num composto neutro a soma dos nox, cada um multiplicado pelo
seu índice, é **zero**. Com uma âncora conhecida — flúor −1, oxigênio −2 — o
nox do metal sai por subtração.

`EXCECOES_DE_OXIGENIO` existe porque o «quase sempre» importa: no H₂O₂ o
oxigênio é −1, e um motor que respondesse −2 daria uma resposta errada com toda
a confiança. `noxDoElemento` também recusa composto de três elementos, par sem
âncora e nox fracionário — Fe₃O₄ daria +8/3, existe na natureza e não sai desta
regra. O gerador só sorteia casos em que a resposta existe; guarda no spec.

## Armadilhas

| O que o aluno fez                              | Pergunta |
| ---------------------------------------------- | -------- |
| Cruzou e não reduziu                           | fórmula  |
| Pôs em cada um o próprio número como índice    | fórmula  |
| Deu o índice antes de reduzir                  | índice   |
| Deu a carga do próprio ânion                   | índice   |
| Trocou o sinal do nox                          | nox      |
| Não dividiu pelo índice do metal (+6 em Fe₂O₃) | nox      |
