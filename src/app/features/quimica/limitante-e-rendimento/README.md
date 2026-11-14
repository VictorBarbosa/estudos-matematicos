# Reagente limitante e rendimento

O que acontece quando um dos reagentes acaba antes do outro.

Numa receita de dois ingredientes, não adianta ter farinha para vinte bolos se
há ovo para três. A reação é igual: quem acaba primeiro decide quanto de
produto se forma, e o resto do outro fica parado.

## O erro que o tópico existe para corrigir

Escolher o limitante **pela massa** — achar que o reagente mais leve, ou o de
menos gramas, é o que acaba antes. Não é. O que decide é

```
receitas = mols ÷ coeficiente
```

e o menor valor é o do limitante. O caso que mostra isso de uma vez é 10 g de
H₂ com 32 g de O₂: o oxigênio pesa três vezes mais e ainda assim é ele que
limita.

Dividir pelo coeficiente é a metade esquecida. Comparar só os mols já acerta
quando os coeficientes são iguais, e é por isso que o erro passa despercebido
até aparecer uma reação como `N₂ + 3 H₂`.

## Por que as massas têm folga de propósito

`massasComLimitante` sorteia as duas massas de modo que um reagente alcance
pelo menos 1,5 vez mais receitas que o outro. Com os dois quase empatados, a
resposta passaria a depender da terceira casa decimal, e o exercício viraria
teste de arredondamento em vez de teste de conceito. O teste do tópico fixa
esse piso.

## O rendimento, e o número impossível

A massa que a estequiometria calcula é a **teórica**: o teto. Na bancada sempre
se perde, e por isso o rendimento fica abaixo de 100%. Um valor acima disso não
é reação generosa — é erro de medida ou produto impuro. A armadilha da fração
invertida existe justamente porque ela produz esse número impossível, e o aluno
pode aprender a usá-lo como alarme.

## Armadilhas

| O que o aluno fez                    | Pergunta   |
| ------------------------------------ | ---------- |
| Usou o reagente em excesso como base | produto    |
| Somou as duas massas                 | produto    |
| Deu o consumido em vez do que sobrou | sobra      |
| Deu a massa do limitante             | sobra      |
| Inverteu a fração do rendimento      | rendimento |
| Deu a massa perdida, em gramas       | rendimento |

## Por que as reações são uma lista fechada

Pelo mesmo motivo de [estequiometria](../estequiometria/README.md): balancear é
outro tópico, e sortear combinações produziria química falsa com aparência de
verdadeira. São seis reações conhecidas, todas com dois reagentes — exigência
do tópico, e não de todas elas se poderia dizer isso.
