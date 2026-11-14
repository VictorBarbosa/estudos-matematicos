# Comparação de modelos locais para escrever os problemas

Gerado em 2026-11-14 04:23, com 6 pedidos por tópico e por modelo.

A taxa de aprovação é do validador que o site usa de verdade
(`core/problemas/validacao/validar-modelo.ts`): dígito solto, lacuna faltando, ordem
diferente entre idiomas, metatexto, LaTeX, tamanho. «Repetidos» são histórias válidas
mas iguais a outra do mesmo lote.

## O quadro

| Modelo | Tópico | Aprovados | Taxa | Repetidos | Tempo | Recusas |
| --- | --- | --- | --- | --- | --- | --- |
| qwen3.8:27b-mlx | Equação do primeiro grau | 6/6 | 100% | 0 | 51.4 s | — |
| qwen3.8:27b-mlx | Razão e proporção | 6/6 | 100% | 0 | 32.0 s | — |
| qwen3.8:27b-mlx | Estequiometria | 2/6 | 33% | 0 | 52.6 s | sem-pergunta, longo |
| gpt-oss:20b@low | Equação do primeiro grau | 6/6 | 100% | 0 | 27.1 s | — |
| gpt-oss:20b@low | Razão e proporção | 6/6 | 100% | 0 | 14.0 s | — |
| gpt-oss:20b@low | Estequiometria | 3/6 | 50% | 0 | 22.3 s | longo |

## Os textos, para ler

### qwen3.8:27b-mlx — Equação do primeiro grau

**1.**

- pt: Um mecânico já tinha {1} parafusos na caixa. Ele encaixa {0} parafusos em cada máquina e, ao final do turno, conta {2} parafusos no total. Quantas máquinas ele consertou?
- fr: Un mécanicien avait déjà {1} vis dans sa boîte. Il place {0} vis sur chaque machine et, à la fin de sa quinzaine, il en compte {2} au total. Combien de machines a-t-il réparées ?
- en: A mechanic already had {1} bolts in his box. He fits {0} bolts into each machine and, by the end of the shift, he counts {2} bolts in total. How many machines did he repair?

**2.**

- pt: Na obra, o pedreiro começou com {1} tijolos na fila. Ele coloca {0} tijolos em cada parede e, no fim do dia, usou {2} tijolos no total. Quantas paredes foram construídas?
- fr: Sur le chantier, le maçon avait commencé avec {1} briques dans la file. Il pose {0} briques sur chaque mur et, à la fin de la journée, il en a utilisé {2} au total. Combien de murs ont-ils été construits ?
- en: On the construction site, the mason started with {1} bricks in the row. He lays {0} bricks on each wall and, by the end of the day, he used {2} bricks in total. How many walls were built?

**3.**

- pt: O motorista de ônibus transporta {1} passageiros no início da rota. Ele recebe {0} novos passageiros em cada parada e, ao chegar no fim, havia {2} passageiros no total. Quantas paradas foram feitas?
- fr: Le chauffeur d’autobus transporte {1} passagers au début de la ligne. Il reçoit {0} nouveaux passagers à chaque arrêt et, en arrivant à la fin, il y avait {2} passagers au total. Combien d’arrêts ont été faits ?
- en: The bus driver transports {1} passengers at the start of the route. He picks up {0} new passengers at each stop and, upon arrival at the end, there were {2} passengers in total. How many stops were made?

**4.**

- pt: Uma oficina recebe {1} peças no estoque. Ela instala {0} peças em cada veículo e, no final do mês, montou {2} peças no total. Quantos veículos foram atendidos?
- fr: Un atelier reçoit {1} pièces en stock. Il installe {0} pièces sur chaque véhicule et, à la fin du mois, il en a monté {2} au total. Combien de véhicules ont été servis ?
- en: A workshop receives {1} parts in stock. It installs {0} parts on each vehicle and, at the end of the month, it assembled {2} parts in total. How many vehicles were served?

**5.**

- pt: O eletricista tem {1} fios sobrando no rolo. Ele usa {0} fios em cada tomada e, ao terminar o trabalho, gastou {2} fios no total. Quantas tomadas foram instaladas?
- fr: L’électricien a {1} fils restants sur la bobine. Il utilise {0} fils pour chaque prise et, en terminant le travail, il en a dépensé {2} au total. Combien de prises ont été installées ?
- en: The electrician has {1} wires left on the roll. He uses {0} wires on each socket and, upon finishing the job, he spent {2} wires in total. How many sockets were installed?

**6.**

- pt: Na linha de montagem, há {1} parafusos soltos. A máquina aperta {0} parafusos em cada produto e, no fim do lote, foram apertados {2} parafusos no total. Quantos produtos foram fabricados?
- fr: Sur la ligne de montage, il y a {1} vis lâches. La machine serre {0} vis sur chaque produit et, à la fin du lot, on en a serré {2} au total. Combien de produits ont été fabriqués ?
- en: On the assembly line, there are {1} loose bolts. The machine tightens {0} bolts on each product and, at the end of the batch, {2} bolts were tightened in total. How many products were manufactured?


---

### qwen3.8:27b-mlx — Razão e proporção

**1.**

- pt: Em uma fábrica, {0} operadores produzem {1} unidades em um turno. Quantas unidades serão fabricadas por {2} operadores no mesmo período?
- fr: Dans une usine, {0} opérateurs produisent {1} unités pendant un quart. Combien d'unités seront fabriquées par {2} opérateurs dans la même période ?
- en: In a factory, {0} operators produce {1} units in one shift. How many units will be manufactured by {2} operators in the same period?

**2.**

- pt: Um carro consome {1} litros de combustível para percorrer {0} quilômetros. Quantos litros serão necessários para uma viagem de {2} quilômetros?
- fr: Une voiture consomme {1} litres de carburant pour parcourir {0} kilomètres. Combien de litres seront nécessaires pour un trajet de {2} kilomètres ?
- en: A car consumes {1} liters of fuel to travel {0} kilometers. How many liters will be needed for a trip of {2} kilometers?

**3.**

- pt: Uma receita de pães exige {0} ovos para preparar {1} porções. Quantos ovos são necessários para fazer {2} porções?
- fr: Une recette de pains exige {0} œufs pour préparer {1} portions. Combien d'œufs sont nécessaires pour faire {2} portions ?
- en: A bread recipe requires {0} eggs to prepare {1} portions. How many eggs are needed to make {2} portions?

**4.**

- pt: Uma máquina costura {0} camisas em {1} minutos. Em quantos minutos ela costurará {2} camisas?
- fr: Une machine coud {0} chemises en {1} minutes. En combien de temps coudra-t-elle {2} chemises ?
- en: A machine sews {0} shirts in {1} minutes. In how many minutes will it sew {2} shirts?

**5.**

- pt: Se {0} caminhões transportam {1} sacos de areia, quantos sacos serão transportados por {2} caminhões?
- fr: Si {0} camions transportent {1} sacs de sable, combien de sacs seront transportés par {2} camions ?
- en: If {0} trucks transport {1} bags of sand, how many bags will be transported by {2} trucks?

**6.**

- pt: Um torneira enche um tanque de {1} litros em {0} minutos. Quantos litros estarão no tanque após {2} minutos?
- fr: Un robinet remplit un réservoir de {1} litres en {0} minutes. Combien de litres y aura-t-il dans le réservoir après {2} minutes ?
- en: A tap fills a tank of {1} liters in {0} minutes. How many liters will be in the tank after {2} minutes?


---

### qwen3.8:27b-mlx — Estequiometria

**1.**

- pt: Em uma fábrica de fertilizantes, {0} de cloruro de amônio são decompostos para recuperar amônia. Qual é a massa de amônia gasosa que pode ser capturada, sabendo que a reação vai até o fim e não há perdas?
- fr: Dans une usine d'engrais, {0} de chlorure d'ammonium sont décomposés pour récupérer de l'ammoniac. Quelle masse d'ammoniac gazeux peut être capturée, sachant que la réaction va à son terme et qu'il n'y a pas de pertes ?
- en: At a fertilizer plant, {0} of ammonium chloride are decomposed to recover ammonia. What mass of gaseous ammonia can be captured, given that the reaction goes to completion and there are no losses?

**2.**

- pt: Um técnico de qualidade em uma usina química mede {0} de carbonato de cálcio antes de submetê-lo à calcinação. Após a conversão total em óxido de cálcio, qual massa de óxido de cálcio resulta desse processo?
- fr: Un technicien de qualité dans une usine chimique mesure {0} de carbonate de calcium avant de le soumettre à la calcination. Après la conversion totale en oxyde de calcium, quelle masse d'oxyde de calcium résulte de ce processus ?
- en: A quality technician at a chemical plant measures {0} of calcium carbonate before subjecting it to calcination. After total conversion to calcium oxide, what mass of calcium oxide results from this process?


#### Recusados

- _sem-pergunta, longo_: Em uma planta de tratamento de água, {0} de hipoclorito de cálcio são adicionados ao reservatório para gerar cloro ativo. Considerando a reação completa e a estequiometria do processo, determine a massa de cloro molecular produzida.
- _longo_: Um laboratório de síntese orgânica possui {0} de brometo de sódio puro. Ao reagir esse sal com ácido sulfúrico concentrado, forma-se brometo de hidrogênio. Qual será a massa de brometo de hidrogênio obtida, supondo rendimento total?
- _longo_: Na produção industrial de ácido nítrico, {0} de amônia são oxidados em um conversor catalítico. Após a série de reações até a formação do ácido, quanto de ácido nítrico é gerado, considerando que toda a amônia é consumida?
- _longo, sem-pergunta_: Durante a análise de um efluente em um laboratório ambiental, {0} de sulfato de bário são precipitados a partir de uma amostra. Se essa massa provém da reação do íon bário com o íon sulfato, determine a massa de bário metálico que estava originalmente na solução.

---

### gpt-oss:20b@low — Equação do primeiro grau

**1.**

- pt: Um mecânico precisa montar {0} peças em cada kit, começa com {1} peças extras e termina com {2} peças no total. Quantos kits foram montados?
- fr: Un mécanicien doit assembler {0} pièces dans chaque kit, commence avec {1} pièces supplémentaires et finit avec {2} pièces au total. Combien de kits ont été assemblés ?
- en: A mechanic needs to assemble {0} parts in each kit, starts with {1} extra parts, and ends with {2} parts in total. How many kits were assembled?

**2.**

- pt: Um caminhão faz {0} voltas por dia, tem {1} cargas iniciais e chega a {2} cargas no final da jornada. Quantas voltas completou?
- fr: Un camion effectue {0} tours par jour, a {1} chargements initiaux et termine avec {2} chargements au total. Combien de tours a-t-il effectués ?
- en: A truck makes {0} trips per day, starts with {1} loads, and ends with {2} loads in total. How many trips did it complete?

**3.**

- pt: Na construção, cada piso requer {0} metros de tijolo, a obra já tem {1} metros e termina com {2} metros. Quantos pisos foram construídos?
- fr: Sur le chantier, chaque étage nécessite {0} mètres de briques, la construction a déjà {1} mètres et se termine avec {2} mètres. Combien d'étages ont été construits ?
- en: In construction, each floor requires {0} meters of brick, the site already has {1} meters, and finishes with {2} meters in total. How many floors were built?

**4.**

- pt: Um fazendeiro planta {0} mudas por horta, começa com {1} mudas de reserva e termina com {2} mudas plantadas. Quantas hortas foram preparadas?
- fr: Un agriculteur plante {0} semences par potager, commence avec {1} semences de réserve et termine avec {2} semences plantées. Combien de potagers ont été préparés ?
- en: A farmer plants {0} seedlings per garden, starts with {1} reserve seedlings, and ends with {2} seedlings planted. How many gardens were prepared?

**5.**

- pt: Um artista cria {0} esculturas em cada série, tem {1} peças de reserva e termina com {2} esculturas concluídas. Quantas séries foram feitas?
- fr: Un artiste crée {0} sculptures dans chaque série, dispose de {1} pièces de réserve et termine avec {2} sculptures terminées. Combien de séries ont été réalisées ?
- en: An artist creates {0} sculptures in each series, has {1} reserve pieces, and ends with {2} sculptures completed. How many series were made?

**6.**

- pt: Um pescador lança {0} anzóis por rede, começa com {1} anzóis de reserva e termina com {2} anzóis no total. Quantas redes foram usadas?
- fr: Un pêcheur lance {0} hameçons par filet, commence avec {1} hameçons de réserve et termine avec {2} hameçons au total. Combien de filets ont été utilisés ?
- en: A fisherman casts {0} hooks per net, starts with {1} reserve hooks, and ends with {2} hooks in total. How many nets were used?


---

### gpt-oss:20b@low — Razão e proporção

**1.**

- pt: Um padeiro usa {0} pacotes de farinha para fazer {1} pães. Se ele quiser produzir {2} pães, quantos pacotes de farinha ele precisará?
- fr: Un boulanger utilise {0} sacs de farine pour faire {1} pains. Si il veut produire {2} pains, combien de sacs de farine devra-t-il utiliser ?
- en: A baker uses {0} bags of flour to make {1} loaves of bread. If he wants to make {2} loaves, how many bags of flour will he need?

**2.**

- pt: Uma fábrica produz {0} unidades de um brinquedo em {1} dias. Quantos dias serão necessários para produzir {2} unidades?
- fr: Une usine produit {0} unités d’un jouet en {1} jours. Combien de jours seront nécessaires pour produire {2} unités ?
- en: A factory produces {0} units of a toy in {1} days. How many days will be needed to produce {2} units?

**3.**

- pt: Um ciclista percorre {0} quilômetros em {1} horas. Quantas horas ele levará para percorrer {2} quilômetros?
- fr: Un cycliste parcourt {0} kilomètres en {1} heures. Combien d’heures lui faudra-t-il pour parcourir {2} kilomètres ?
- en: A cyclist rides {0} kilometers in {1} hours. How many hours will it take him to ride {2} kilometers?

**4.**

- pt: Um trabalhador usa {0} litros de óleo para fazer {1} horas de trabalho. Quantos litros de óleo são necessários para fazer {2} horas de trabalho?
- fr: Un ouvrier utilise {0} litres d’huile pour accomplir {1} heures de travail. Combien de litres d’huile sont nécessaires pour accomplir {2} heures de travail ?
- en: A worker uses {0} liters of oil to work for {1} hours. How many liters of oil are needed to work for {2} hours?

**5.**

- pt: Um produtor de queijo faz {0} caixas de queijo em {1} dias. Quantos dias levará para fazer {2} caixas de queijo?
- fr: Un producteur de fromage produit {0} caisses de fromage en {1} jours. Combien de jours faudra-t-il pour produire {2} caisses de fromage ?
- en: A cheese producer makes {0} boxes of cheese in {1} days. How many days will it take to make {2} boxes of cheese?

**6.**

- pt: Uma fábrica de tinta consome {0} litros de tinta para produzir {1} metros quadrados de parede. Quantos litros de tinta serão consumidos para produzir {2} metros quadrados?
- fr: Une usine de peinture consomme {0} litres de peinture pour produire {1} mètres carrés de mur. Combien de litres de peinture seront consommés pour produire {2} mètres carrés ?
- en: A paint factory consumes {0} liters of paint to produce {1} square meters of wall. How many liters of paint will be consumed to produce {2} square meters?


---

### gpt-oss:20b@low — Estequiometria

**1.**

- pt: Um laboratório de química analítica utiliza {0} gramas de permanganato de potássio para oxidar uma amostra de água. O objetivo é calcular a massa de dióxido de manganês que se forma. Quanto de dióxido de manganês será gerado?
- fr: Un laboratoire d’analyse chimique utilise {0} grammes de permanganate de potassium pour oxyder un échantillon d’eau. L’objectif est de calculer la masse de dioxyde de manganèse qui se forme. Combien de dioxyde de manganèse sera produit ?
- en: A chemical analysis laboratory uses {0} grams of potassium permanganate to oxidize a water sample. The goal is to calculate the mass of manganese dioxide that is produced. How much manganese dioxide will be generated?

**2.**

- pt: Durante a síntese de um composto farmacêutico, um químico acrescenta {0} gramas de cloreto de vinil. Ele precisa determinar a massa de ácido acético que será obtida após a reação de hidrólise. Qual a massa de ácido acético formada?
- fr: Lors de la synthèse d’un composé pharmaceutique, un chimiste ajoute {0} grammes de chlorure de vinyle. Il doit déterminer la masse d’acide acétique qui sera obtenue après l’hydrolyse. Quelle est la masse d’acide acétique produite ?
- en: During the synthesis of a pharmaceutical compound, a chemist adds {0} grams of vinyl chloride. He needs to determine the mass of acetic acid that will be obtained after the hydrolysis reaction. What is the mass of acetic acid formed?

**3.**

- pt: Em uma planta de produção de fertilizantes, o operador usa {0} gramas de nitrato de amônio como matéria-prima. Ele quer saber a massa de nitrogênio que será liberada na reação de decomposição. Quanto nitrogênio será emitido?
- fr: Dans une usine de production d’engrais, l’opérateur utilise {0} grammes de nitrate d’ammonium comme matière première. Il veut connaître la masse d’azote qui sera libérée lors de la décomposition. Combien d’azote sera émis ?
- en: In a fertilizer production plant, an operator uses {0} grams of ammonium nitrate as the raw material. He wants to know the mass of nitrogen that will be released during the decomposition reaction. How much nitrogen will be emitted?


#### Recusados

- _longo_: Um engenheiro de processos está ajustando uma reação de produção de ácido sulfúrico. Ele tem {0} gramas de sulfato de potássio como reagente principal e precisa saber a quantidade de ácido que será gerada. Quanto de ácido sulfúrico será formado?
- _longo_: No tratamento de efluentes, um técnico adiciona {0} gramas de cloreto de cálcio para precipitar as impurezas. Ele quer saber a massa de carbonato de cálcio que resultará da reação equilibrada. Qual é a massa de carbonato de cálcio formada?
- _longo_: Para fabricar ácido fosfórico, um técnico mistura {0} gramas de fosfato de cálcio em reação com ácido clorídrico. Ele precisa calcular a massa de fosfato de hidrogênio que aparecerá no produto final. Qual é a massa de fosfato de hidrogênio formada?
