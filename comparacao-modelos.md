# Comparação de modelos locais para escrever os problemas

Gerado em 2026-11-14 16:29, com 4 pedidos por tópico e por modelo.

A taxa de aprovação é do validador que o site usa de verdade
(`core/problemas/validacao/validar-modelo.ts`): dígito solto, lacuna faltando, ordem
diferente entre idiomas, metatexto, LaTeX, tamanho. «Repetidos» são histórias válidas
mas iguais a outra do mesmo lote.

## O quadro

| Modelo | Tópico | Aprovados | Taxa | Repetidos | Tempo | Recusas |
| --- | --- | --- | --- | --- | --- | --- |
| gpt-oss:20b | Equação do primeiro grau | 4/4 | 100% | 0 | 79.5 s | — |
| gpt-oss:20b | Mínimo múltiplo comum | 4/4 | 100% | 0 | 66.7 s | — |
| gpt-oss:20b | Progressão aritmética | 4/4 | 100% | 0 | 58.3 s | — |
| gpt-oss:20b | Juros compostos | 4/4 | 100% | 0 | 79.5 s | — |
| gpt-oss:20b | Estequiometria | 4/4 | 100% | 0 | 45.8 s | — |

## Os textos, para ler

### gpt-oss:20b — Equação do primeiro grau

**1.**

- pt: O canteiro de obras adiciona {0} tijolos por dia, já tinha {1} tijolos, totalizando {2} tijolos. Quantas vezes foram adicionados tijolos?
- fr: Le chantier ajoute {0} briques par jour, il avait déjà {1} briques, pour un total de {2} briques. Combien de fois ont été ajoutées des briques?
- en: The construction site adds {0} bricks per day, it already had {1} bricks, ending up with {2} bricks. How many times were bricks added?

**2.**

- pt: A padaria produz {0} biscoitos em cada lote, já tinha {1} biscoitos, totalizando {2} biscoitos. Quantas vezes foram produzidos biscoitos?
- fr: La boulangerie produit {0} biscuits par lot, elle avait déjà {1} biscuits, pour un total de {2} biscuits. Combien de fois ont été produits des biscuits?
- en: The bakery produces {0} cookies per batch, it already had {1} cookies, ending up with {2} cookies. How many times were cookies produced?

**3.**

- pt: A linha de montagem adiciona {0} unidades a cada turno, já tinha {1} unidades, totalizando {2} unidades. Quantas vezes foram adicionadas unidades?
- fr: La ligne de production ajoute {0} unités à chaque quart, elle avait déjà {1} unités, pour un total de {2} unités. Combien de fois ont été ajoutées des unités?
- en: The assembly line adds {0} units each shift, it already had {1} units, ending up with {2} units. How many times were units added?

**4.**

- pt: O corredor cobre {0} quilômetros a cada corrida, já tinha percorrido {1} quilômetros, totalizando {2} quilômetros. Quantas vezes foram cobertos quilômetros?
- fr: Le coureur parcourt {0} kilomètres à chaque course, il avait déjà parcouru {1} kilomètres, pour un total de {2} kilomètres. Combien de fois ont été parcourus des kilomètres?
- en: The runner covers {0} kilometers per run, it already had {1} kilometers, ending up with {2} kilometers. How many times were kilometers covered?


---

### gpt-oss:20b — Mínimo múltiplo comum

**1.**

- pt: O ônibus parte a cada {0} minutos e o trem a cada {1} minutos. Quando eles sairão juntos novamente?
- fr: Le bus part toutes les {0} minutes et le train toutes les {1} minutes. Quand repartiront-ils ensemble?
- en: The bus leaves every {0} minutes and the train every {1} minutes. When will they depart together again?

**2.**

- pt: Uma engrenagem gira a cada {0} revoluções e a outra a cada {1} revoluções. Quando ambas girarão juntas pela próxima vez?
- fr: Une roue dentée tourne toutes les {0} révolutions et l'autre toutes les {1} révolutions. Quand tourneront-elles ensemble la prochaine fois?
- en: One gear turns every {0} rotations and the other every {1} rotations. When will they turn together again?

**3.**

- pt: Um semáforo pisca a cada {0} segundos e outro a cada {1} segundos. Quando ambos piscarão ao mesmo tempo novamente?
- fr: Un feu clignote toutes les {0} secondes et un autre toutes les {1} secondes. Quand clignoteront-ils en même temps à nouveau?
- en: One streetlight flickers every {0} seconds and another every {1} seconds. When will they flicker together again?

**4.**

- pt: Um aspersor abre a cada {0} minutos e o outro a cada {1} minutos. Quando eles abrirão simultaneamente novamente?
- fr: Un arroseur s'ouvre toutes les {0} minutes et l'autre toutes les {1} minutes. Quand s'ouvriront-ils simultanément à nouveau?
- en: One sprinkler turns on every {0} minutes and the other every {1} minutes. When will they turn on at the same time again?


---

### gpt-oss:20b — Progressão aritmética

**1.**

- pt: Na fila do supermercado, {0} pessoas já esperam na primeira posição. Em cada nova posição, mais {1} pessoas se juntam. Quantas pessoas haverá na posição {2}?
- fr: Dans la file d'attente du supermarché, {0} personnes attendent déjà à la première place. À chaque nouvelle place, plus {1} personnes se joignent. Combien de personnes y aura-t-il à la place {2}?
- en: In the supermarket line, {0} people are already waiting at the first spot. With each new spot, an additional {1} people join. How many people will be at spot {2}?

**2.**

- pt: No muro, o primeiro degrau tem {0} tijolos. A cada degrau subsequente, adiciona-se mais {1} tijolos. Quantos tijolos haverá no degrau {2}?
- fr: Sur le mur, le premier escalier comporte {0} briques. À chaque escalier suivant, on ajoute plus {1} briques. Combien de briques y aura-t-il au escalier {2}?
- en: On the wall, the first step contains {0} bricks. For each subsequent step, an additional {1} bricks are added. How many bricks will the step {2} have?

**3.**

- pt: Na prateleira de livros, a primeira prateleira contém {0} livros. Em cada prateleira seguinte, coloca-se mais {1} livros. Quantos livros estarão na prateleira {2}?
- fr: Sur l'étagère, la première étagère contient {0} livres. À chaque étagère suivante, on ajoute plus {1} livres. Combien de livres y aura-t-il à l'étagère {2}?
- en: On the bookshelf, the first shelf holds {0} books. On each following shelf, an additional {1} books are added. How many books will be on shelf {2}?

**4.**

- pt: Ao começar a economizar, você tem {0} dólares. A cada mês, acrescenta-se mais {1} dólares. Quanto dinheiro você terá no mês {2}?
- fr: En commençant à économiser, vous avez {0} dollars. Chaque mois, vous ajoutez plus {1} dollars. Combien d'argent aurez-vous au mois {2}?
- en: When starting to save, you have {0} dollars. Each month, you add an additional {1} dollars. How much money will you have at month {2}?


---

### gpt-oss:20b — Juros compostos

**1.**

- pt: Um investidor deposita {0} reais em uma conta de poupança que rende {1} por cento ao mês, por {2} meses. Qual será o valor total acumulado ao final desses meses?
- fr: Un investisseur dépose {0} euros dans un compte d'épargne qui rapporte {1} pour cent par mois, pendant {2} mois. Quelle sera la valeur totale accumulée à la fin de ces mois?
- en: An investor deposits {0} dollars in a savings account that earns {1} percent per month, for {2} months. What will be the total amount accumulated at the end of those months?

**2.**

- pt: Um proprietário pede um empréstimo de {0} reais para reformar sua casa, com juros de {1} por cento por mês, durante {2} meses. Qual será o valor total que ele terá que pagar ao final desses meses?
- fr: Un propriétaire contracte un prêt de {0} euros pour rénover sa maison, avec un taux d'intérêt de {1} pour cent par mois, pendant {2} mois. Quelle sera la valeur totale qu'il devra rembourser à la fin de ces mois?
- en: A homeowner takes a loan of {0} dollars to renovate his house, with an interest rate of {1} percent per month, for {2} months. What will be the total amount he will have to repay at the end of those months?

**3.**

- pt: Um agricultor compra sementes no valor de {0} reais, que rendem {1} por cento a cada estação, por {2} estações. Qual será o valor total acumulado ao final dessas estações?
- fr: Un agriculteur achète des semences d'une valeur de {0} euros, qui donnent un rendement de {1} pour cent à chaque saison, pendant {2} saisons. Quelle sera la valeur totale accumulée à la fin de ces saisons?
- en: A farmer buys seeds worth {0} dollars, which yield {1} percent each season, for {2} seasons. What will be the total amount accumulated at the end of those seasons?

**4.**

- pt: Um investidor compra um título no valor de {0} reais, que paga juros de {1} por cento ao ano, por {2} anos. Qual será o valor total acumulado ao final desses anos?
- fr: Un investisseur achète une obligation d'une valeur de {0} euros, qui verse un taux d'intérêt de {1} pour cent par an, pendant {2} ans. Quelle sera la valeur totale accumulée à la fin de ces années?
- en: An investor buys a bond worth {0} dollars, which pays interest at {1} percent per year, for {2} years. What will be the total amount accumulated at the end of those years?


---

### gpt-oss:20b — Estequiometria

**1.**

- pt: No laboratório, o químico misturou {0} gramas de {1} em um recipiente e observou a formação de {2}. Qual é a massa de {2} formada?
- fr: Dans le laboratoire, le chimiste a mélangé {0} grammes de {1} dans un récipient et a observé la formation de {2}. Quelle est la masse de {2} produite?
- en: In the laboratory, the chemist mixed {0} grams of {1} in a container and observed the formation of {2}. What is the mass of {2} produced?

**2.**

- pt: Durante a inspeção de qualidade, o inspetor verificou que {0} gramas de {1} foram utilizados no processo e que {2} resultou da reação. Qual é a massa de {2} formada?
- fr: Lors de l'inspection qualité, l'inspecteur a constaté que {0} grammes de {1} étaient utilisés dans le processus et que {2} résultait de la réaction. Quelle est la masse de {2} produite?
- en: During quality inspection, the inspector verified that {0} grams of {1} were used in the process and that {2} resulted from the reaction. What is the mass of {2} produced?

**3.**

- pt: No centro de tratamento de água, o operador adicionou {0} gramas de {1} à estação e observou que {2} foi gerado. Qual é a massa de {2} formada?
- fr: Au centre de traitement de l'eau, l'opérateur a ajouté {0} grammes de {1} à l'installation et a constaté que {2} était généré. Quelle est la masse de {2} produite?
- en: At the water treatment plant, the operator added {0} grams of {1} to the station and observed that {2} was generated. What is the mass of {2} produced?

**4.**

- pt: Para a análise, o pesquisador preparou {0} gramas de {1} e notou que {2} resultou da reação. Qual é a massa de {2} formada?
- fr: Pour l'analyse, le chercheur a préparé {0} grammes de {1} et a constaté que {2} résultait de la réaction. Quelle est la masse de {2} produite?
- en: For the analysis, the researcher prepared {0} grams of {1} and noted that {2} resulted from the reaction. What is the mass of {2} produced?

