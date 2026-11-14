# Comparação de modelos locais para escrever os problemas

Gerado em 2026-11-14 17:17, com 4 pedidos por tópico e por modelo.

A taxa de aprovação é do validador que o site usa de verdade
(`core/problemas/validacao/validar-modelo.ts`): dígito solto, lacuna faltando, ordem
diferente entre idiomas, metatexto, LaTeX, tamanho. «Repetidos» são histórias válidas
mas iguais a outra do mesmo lote.

## O quadro

| Modelo | Tópico | Aprovados | Taxa | Repetidos | Tempo | Recusas |
| --- | --- | --- | --- | --- | --- | --- |
| gpt-oss:20b | Equação do primeiro grau | 4/4 | 100% | 0 | 78.8 s | — |
| gpt-oss:20b | Dois números pela soma e pelo produto | 4/4 | 100% | 0 | 50.0 s | — |
| gpt-oss:20b | Mínimo múltiplo comum | 4/4 | 100% | 0 | 102.9 s | — |
| gpt-oss:20b | Progressão aritmética | 4/4 | 100% | 0 | 39.9 s | — |
| gpt-oss:20b | Juros compostos | 4/4 | 100% | 0 | 112.8 s | — |
| gpt-oss:20b | Estequiometria | 4/4 | 100% | 0 | 82.9 s | — |

## Os textos, para ler

### gpt-oss:20b — Equação do primeiro grau

**1.**

- pt: O carpinteiro adiciona {0} tábuas a cada etapa, já tinha {1} tábuas no estoque e terminou com {2} tábuas. Quantas etapas foram necessárias?
- fr: Le carpentier ajoute {0} planches à chaque étape, il avait déjà {1} planches en stock et a fini avec {2} planches. Combien d'étapes ont été nécessaires?
- en: A carpenter adds {0} planks at each stage, had already {1} planks in stock, and finished with {2} planks. How many stages were needed?

**2.**

- pt: O padeiro adiciona {0} gramas de açúcar a cada lote, já tinha {1} gramas de açúcar no estoque e terminou com {2} gramas de açúcar. Quantos lotes foram produzidos?
- fr: Le boulanger ajoute {0} grammes de sucre à chaque lot, il avait déjà {1} grammes de sucre en stock et a fini avec {2} grammes de sucre. Combien de lots ont été produits?
- en: A baker adds {0} grams of sugar to each batch, had already {1} grams of sugar in stock, and finished with {2} grams of sugar. How many batches were produced?

**3.**

- pt: O ciclista faz {0} voltas a cada sessão de treino, já tinha {1} voltas corridas e terminou com {2} voltas. Quantas sessões de treino foram realizadas?
- fr: Le cycliste fait {0} tours à chaque séance d'entraînement, il avait déjà {1} tours courus et a fini avec {2} tours. Combien de séances d'entraînement ont été réalisées?
- en: A cyclist rides {0} laps in each training session, had already ridden {1} laps, and finished with {2} laps. How many training sessions were completed?

**4.**

- pt: O agricultor coloca {0} maçãs em cada saco, já tinha {1} maçãs já empacotadas e terminou com {2} maçãs. Quantos sacos foram feitos?
- fr: Le agriculteur met {0} pommes dans chaque sac, il avait déjà {1} pommes emballées et a fini avec {2} pommes. Combien de sacs ont été faits?
- en: A farmer puts {0} apples in each bag, had already packed {1} apples, and finished with {2} apples. How many bags were made?


---

### gpt-oss:20b — Dois números pela soma e pelo produto

**1.**

- pt: Dois agricultores tinham juntos {0} sacos de milho, e o produto das quantidades de sacos que cada um tinha era {1}. Qual é o maior número de sacos que um deles possui?
- fr: Deux agriculteurs avaient en tout {0} sacs de maïs, et le produit du nombre de sacs que chacun possédait était {1}. Quel est le plus grand nombre de sacs que l'un d'eux possède?
- en: Two farmers had a total of {0} bags of corn, and the product of the numbers of bags each had was {1}. What is the larger number of bags one of them has?

**2.**

- pt: Dois corredores completaram juntos {0} voltas, e o produto das voltas que cada um completou era {1}. Quantas voltas completou o corredor que fez mais?
- fr: Deux coureurs ont fait ensemble {0} tours, et le produit du nombre de tours que chacun a fait était {1}. Combien de tours a fait le coureur qui a couru le plus?
- en: Two runners completed a total of {0} laps, and the product of the laps each ran was {1}. How many laps did the runner who ran the most complete?

**3.**

- pt: Dois estudantes tinham juntos {0} livros de matemática, e o produto das quantidades de livros que cada um tinha era {1}. Qual é o maior número de livros que um deles possui?
- fr: Deux étudiants avaient en tout {0} livres de mathématiques, et le produit du nombre de livres que chacun possédait était {1}. Quel est le plus grand nombre de livres que l'un d'eux possède?
- en: Two students had a total of {0} math books, and the product of the numbers of books each had was {1}. What is the larger number of books one of them has?

**4.**

- pt: Dois padeiros venderam juntos {0} pães, e o produto das quantidades de pães que cada um vendeu era {1}. Quantos pães vendeu o padeiro que vendeu mais?
- fr: Deux boulangers ont vendu ensemble {0} pains, et le produit du nombre de pains que chacun a vendu était {1}. Combien de pains a vendu le boulanger qui a vendu le plus?
- en: Two bakers sold a total of {0} loaves, and the product of the numbers of loaves each sold was {1}. How many loaves did the baker who sold the most sell?


---

### gpt-oss:20b — Mínimo múltiplo comum

**1.**

- pt: A cada {0} minutos, o ônibus que vai para o centro parte do terminal, e a cada {1} minutos, o ônibus que vai para o bairro parte do mesmo terminal. Depois de quantos minutos ambos partirem novamente?
- fr: Chaque {0} minutes, le bus qui va vers le centre part du terminal, et chaque {1} minutes, le bus qui va vers le quartier part du même terminal. Dans combien de minutes les deux bus partiront-ils de nouveau ensemble?
- en: Every {0} minutes, the bus heading to the city center departs from the terminal, and every {1} minutes, the bus heading to the suburbs departs from the same terminal. After how many minutes will both buses depart again together?

**2.**

- pt: Um poste de iluminação pública pisca a cada {0} segundos, enquanto outro pisca a cada {1} segundos. Depois de quantos segundos ambos piscarão ao mesmo tempo?
- fr: Une lampe de rue clignote toutes les {0} secondes, tandis qu’une autre clignote toutes les {1} secondes. Dans combien de secondes les deux lampes clignoteront-elles en même temps?
- en: A streetlamp flashes every {0} seconds, while another flashes every {1} seconds. After how many seconds will both lamps flash simultaneously again?

**3.**

- pt: Um sistema de irrigação rega a cada {0} minutos um setor de plantio, e outro sistema rega a cada {1} minutos outro setor. Depois de quantos minutos ambos regarão ao mesmo tempo?
- fr: Un système d'irrigation arrose toutes les {0} minutes un secteur de culture, et un autre arrose toutes les {1} minutes un autre secteur. Dans combien de minutes les deux systèmes arroseront-ils en même temps?
- en: An irrigation system waters every {0} minutes a crop area, and another system waters every {1} minutes a different area. After how many minutes will both systems water simultaneously again?

**4.**

- pt: Uma engrenagem completa uma rotação a cada {0} voltas, e outra engrenagem completa uma rotação a cada {1} voltas. Depois de quantas voltas ambos girarão na mesma posição?
- fr: Une engrenure effectue une rotation toutes les {0} tours, et une autre engrenure effectue une rotation toutes les {1} tours. Dans combien de tours les deux engrenures se retrouveront-elles en même position?
- en: One gear completes a rotation every {0} turns, and another gear completes a rotation every {1} turns. After how many turns will both gears align in the same position again?


---

### gpt-oss:20b — Progressão aritmética

**1.**

- pt: Um trabalhador coloca {0} tijolos no primeiro dia. Cada dia seguinte ele acrescenta {1} tijolos a mais. Quantos tijolos há no dia {2}?
- fr: Un ouvrier pose {0} briques le premier jour. Chaque jour suivant, il ajoute {1} briques de plus. Combien de briques y aura-t-il le jour {2}?
- en: A worker lays {0} bricks on the first day. Each following day he adds {1} more bricks. How many bricks will there be on day {2}?

**2.**

- pt: Um trem tem {0} vagões no primeiro ponto de parada. Em cada parada subsequente, ele adiciona {1} vagões extras. Quantos vagões haverá na parada número {2}?
- fr: Un train a {0} wagons au premier arrêt. À chaque arrêt suivant, il ajoute {1} wagons supplémentaires. Combien de wagons y aura-t-il à l'arrêt numéro {2}?
- en: A train has {0} cars at the first stop. At each subsequent stop, it adds {1} more cars. How many cars will there be at stop number {2}?

**3.**

- pt: Um jardineiro planta {0} mudas na primeira fileira. Em cada fileira seguinte, ele planta {1} mudas a mais. Quantas mudas haverá na fileira número {2}?
- fr: Un jardinier plante {0} semis dans la première rangée. Dans chaque rangée suivante, il plante {1} semis de plus. Combien de semis y aura-t-il dans la rangée numéro {2}?
- en: A gardener plants {0} seedlings in the first row. In each subsequent row, he plants {1} more seedlings. How many seedlings will be in row number {2}?

**4.**

- pt: Um colecionador coloca {0} livros na primeira pilha. Em cada pilha seguinte, ele adiciona {1} livros a mais. Quantos livros haverá na pilha número {2}?
- fr: Un collectionneur met {0} livres sur la première pile. Sur chaque pile suivante, il ajoute {1} livres supplémentaires. Combien de livres y aura-t-il sur la pile numéro {2}?
- en: A collector puts {0} books on the first pile. On each subsequent pile, he adds {1} more books. How many books will be on pile number {2}?


---

### gpt-oss:20b — Juros compostos

**1.**

- pt: Ana deposita {0} reais em uma conta que rende {1} % ao mês. Ao final de cada mês, o rendimento é adicionado ao saldo antes do próximo mês. Quanto terá em total após {2} meses?
- fr: Ana dépose {0} reais dans un compte qui rapporte {1} % par mois. À la fin de chaque mois, les gains sont ajoutés au solde avant le mois suivant. Combien aura-t-elle en tout après {2} mois?
- en: Ana deposits {0} reais in an account that pays {1} % per month. At the end of each month, the earnings are added to the balance before the next month. How much will she have in total after {2} months?

**2.**

- pt: A construtora toma emprestado {0} reais para financiar um projeto. O empréstimo rende {1} % ao mês, e os juros são adicionados ao saldo a cada mês. Quanto total de dívida terá após {2} meses?
- fr: La société de construction emprunte {0} reais pour financer un projet. Le prêt rapporte {1} % par mois, et les intérêts sont ajoutés au solde chaque mois. Combien de dette totale aura-t-elle après {2} mois?
- en: The construction company borrows {0} reais to finance a project. The loan accrues {1} % per month, and interest is added to the balance each month. How much total debt will the company owe after {2} months?

**3.**

- pt: Um jardineiro investe {0} reais na compra de sementes. O jardim produz um retorno de {1} % por estação de cultivo, e o rendimento é reinvestido a cada estação. Qual será o valor total do jardim após {2} estações?
- fr: Un jardinier investit {0} reais dans l'achat de graines. Le jardin produit un rendement de {1} % par saison de culture, et le rendement est réinvesti à chaque saison. Quelle sera la valeur totale du jardin après {2} saisons?
- en: A gardener invests {0} reais in buying seeds. The garden yields a return of {1} % per growing season, and the yield is reinvested each season. What will be the total value of the garden after {2} seasons?

**4.**

- pt: Um estudante contrai {0} reais de empréstimo para pagar a faculdade. O empréstimo acumula {1} % por semestre, e os juros são adicionados ao saldo a cada semestre. Quanto total o estudante deve ao fim de {2} semestres?
- fr: Un étudiant contracte un prêt de {0} reais pour payer les frais de scolarité. Le prêt accumule {1} % par semestre, et les intérêts sont ajoutés au solde chaque semestre. Combien total l'étudiant devra-t-il après {2} semestres?
- en: A student takes a loan of {0} reais to pay tuition. The loan accrues {1} % per semester, and interest is added to the balance each semester. How much total will the student owe after {2} semesters?


---

### gpt-oss:20b — Estequiometria

**1.**

- pt: Na bancada de análises, {0} gramas de {1} foram combinados em um béquer, resultando em {2}. Qual é a massa de {2} que será formada?
- fr: Sur la table de laboratoire, {0} grammes de {1} ont été combinés dans un bécher, donnant {2}. Quelle est la masse de {2} qui sera formée?
- en: On the lab bench, {0} grams of {1} were combined in a beaker, yielding {2}. What is the mass of {2} that will be formed?

**2.**

- pt: Na linha de produção, {0} gramas de {1} são alimentados em um reator, gerando {2}. Qual é a massa de {2} que será produzida?
- fr: Dans la chaîne de production, {0} grammes de {1} sont introduits dans un réacteur, produisant {2}. Quelle est la masse de {2} qui sera produite?
- en: In the production line, {0} grams of {1} are fed into a reactor, producing {2}. What is the mass of {2} that will be produced?

**3.**

- pt: Durante o tratamento de água, {0} gramas de {1} são adicionados a um tanque, resultando em {2}. Qual é a massa de {2} que será obtida?
- fr: Pendant le traitement de l'eau, {0} grammes de {1} sont ajoutés à un réservoir, produisant {2}. Quelle est la masse de {2} qui sera obtenue?
- en: During water treatment, {0} grams of {1} are added to a tank, yielding {2}. What is the mass of {2} that will be obtained?

**4.**

- pt: Na análise de controle de qualidade, {0} gramas de {1} são pesados e reagem para formar {2}. Qual é a massa de {2} que será gerada?
- fr: Dans l'analyse de contrôle qualité, {0} grammes de {1} sont pesés et réagissent pour former {2}. Quelle est la masse de {2} qui sera générée?
- en: In the quality control analysis, {0} grams of {1} are weighed and react to form {2}. What is the mass of {2} that will be generated?

