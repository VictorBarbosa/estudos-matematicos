# Estequiometria

Onde o mol deixa de ser definição e vira ferramenta.

A equação balanceada dá uma proporção **de contagem** — `2 H₂ + O₂ → 2 H₂O` diz
dois para um, em moléculas, nunca em gramas. A balança, porém, mede gramas. O
tópico inteiro é o trajeto que liga os dois:

```
massa de A → mols de A → mols de B → massa de B
```

## O erro clássico, e por que ele é perigoso

Pular o trecho do meio: aplicar a proporção direto sobre as massas. Isso só
acerta quando as duas substâncias têm a mesma massa molar, o que praticamente
nunca acontece.

O perigo não é errar — é **errar de forma plausível**. O número sai na mesma
ordem de grandeza, e nada nele denuncia o engano. Por isso a aba Explorar mostra
os dois resultados lado a lado, o certo e o da proporção crua: só a comparação
denuncia.

`massaPelaProporcaoCrua` existe no motor **para ser armadilha**, não para ser
usada. Tê-la ali, ao lado da conta certa, deixa claro no código que as duas não
coincidem — e por quê.

## Por que as reações são uma lista fechada

Balancear é outro tópico, e vai precisar da canonização de fórmulas, que ainda
não existe. Aqui a equação chega pronta, e o que se exerce é usar a proporção
dela — que é, afinal, para que o balanceamento serve.

São oito reações conhecidas, e não combinações sorteadas: uma equação inventada
seria química falsa com aparência de verdadeira, que é o pior tipo de exercício.
