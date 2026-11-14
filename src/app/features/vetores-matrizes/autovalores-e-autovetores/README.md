# Autovalores e autovetores

Uma matriz geralmente muda o tamanho **e** a direção de um vetor. Para algumas
direções ela só muda o tamanho: o vetor sai paralelo ao que entrou,
multiplicado por um número. É isso — e só isso — que `A·v = λ·v` diz.

## Por que isso importa em engenharia

As direções que a matriz não torce são os **modos naturais** do sistema:

- numa estrutura, as frequências em que ela vibra sozinha;
- num sistema de EDOs, as soluções que crescem ou decaem sem mudar de forma;
- numa rotação de eixos, os eixos principais de inércia.

É sempre a mesma ideia: achar o referencial em que o problema fica simples.

## As duas identidades são a ferramenta de conferência

A soma dos autovalores é o **traço**; o produto é o **determinante**. Duas das
cinco perguntas do tópico pedem exatamente isso, e a dica **entrega** a
identidade de propósito — ela não é uma pegadinha a descobrir. Quem a conhece
verifica a própria resposta sem gabarito, e isso vale mais que acertar um
exercício.

Há um corolário que o tópico aproveita: se o produto é o determinante, então
autovalor zero e «não tem inversa» são a mesma notícia.

## O discriminante negativo não é falha

Quando `tr² − 4det < 0` não há autovalor real, e isso tem significado
geométrico: a matriz **gira**. Nenhuma direção sobrevive a uma rotação de 90°.
`autovalores` devolve `undefined` nesse caso, e a aba Explorar **diz** que a
matriz gira em vez de mostrar um número que não existe — mexer nos quatro
controles até atravessar essa fronteira é a lição que exercício de conta não
dá.

## Como as matrizes dos exercícios são construídas

`A = P D P⁻¹` com `P = [[1, 1], [k, k+1]]`, cujo determinante é 1 — o que
mantém `A` inteira — e cujas colunas `(1, k)` e `(1, k+1)` são os autovetores.
É daí que a pergunta sobre a direção tem resposta inteira.

`k = 0` e `k = −1` ficam **fora**: deixariam a matriz triangular, e aí os
autovalores estariam na diagonal — o exercício não cobraria conta nenhuma. Há
guarda no spec que confere que nenhuma matriz 2×2 sorteada é triangular.

A pergunta da triangular 3×3 existe separada, e de propósito: ali a resposta é
de leitura, e é esse contraste que explica por que diagonalizar vale o esforço.

## Armadilhas

| O que o aluno fez                       | Pergunta   |
| --------------------------------------- | ---------- |
| Deu o determinante onde cabia o traço   | soma       |
| Deu o traço onde cabia o determinante   | produto    |
| Deu o outro autovalor, o menor          | maior      |
| Trocou o sinal do termo em λ            | maior      |
| Trocou o sinal em (λ − a)/b             | direção    |
| Deu o autovalor em vez da coordenada    | direção    |
| Somou a diagonal em vez de comparar     | triangular |
| Deu o primeiro da diagonal, não o maior | triangular |
