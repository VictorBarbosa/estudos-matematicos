# Estrutura eletrônica

Os elétrons ocupam os subníveis em ordem de **energia**, não de número. O 4s vem
antes do 3d.

## Por que isso não é pegadinha

Quem preenche na ordem dos números erra **todos** os elementos do quarto
período, e erra sempre — não por descuido, mas por estar usando a regra errada.
É por isso que o gerador tem uma função `eletronsPelaOrdemNumerica` que existe
só para ser armadilha: ela calcula exatamente o que o aluno calcula quando lê o
diagrama como se 3d viesse antes de 4s.

O 3d do potássio está **vazio**, e zero é resposta legítima. Há guarda no spec
para que o caso apareça.

## As exceções, e por que elas ficam fora dos exercícios

A regra diagonal erra. O cromo deveria terminar em 3d⁴ 4s² e termina em
3d⁵ 4s¹, porque o subnível semicheio custa menos energia do que a regra prevê;
o cobre faz o mesmo. São exceções **medidas**, não ajustes de conveniência.

`SEGUE_A_REGRA` existe para que nenhum exercício as sorteie: cobrar a regra
onde ela falha ensinaria a regra errada, e o aluno levaria isso para a prova. A
aba Explorar, que percorre o Z livremente, **diz** quando chegou numa delas.

## Última camada: só dos representativos

Nos metais de transição a «valência» não é só a última camada — o d incompleto
também participa. Perguntar isso deles seria apresentar uma simplificação como
verdade, e por isso a pergunta sorteia só até o cálcio, mais os halogênios
pesados. Guarda no spec.

## Camada não é subnível

A camada é o valor de n e reúne vários subníveis: a camada 2 tem o 2s e o 2p. O
cloro tem **cinco** subníveis e **três** camadas, e contar um no lugar do outro
é uma das armadilhas. Capacidade também não é ocupação: a camada 3 do cloro
cabe 18 e tem 7.

## O que isto explica

A tabela periódica não é uma lista arbitrária: é o desenho da distribuição
eletrônica. O período é o número de camadas ocupadas; sódio e potássio reagem
do mesmo jeito porque têm um elétron na última camada. Os gases nobres quase
não reagem não por nobreza — por não ter o que ganhar.

## Armadilhas

| O que o aluno fez                               | Pergunta         |
| ----------------------------------------------- | ---------------- |
| Deu o número atômico                            | última / período |
| Deu a penúltima camada                          | última           |
| Deu a capacidade 2n² em vez da ocupação         | camada           |
| Preencheu na ordem dos números (3d antes de 4s) | subnível         |
| Deu a capacidade do subnível                    | subnível         |
| Contou subníveis em vez de camadas              | período          |
