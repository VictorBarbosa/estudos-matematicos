# Comparação de modelos locais para escrever os problemas

Gerado em 2026-11-14 15:54, com 6 pedidos por tópico e por modelo.

A taxa de aprovação é do validador que o site usa de verdade
(`core/problemas/validacao/validar-modelo.ts`): dígito solto, lacuna faltando, ordem
diferente entre idiomas, metatexto, LaTeX, tamanho. «Repetidos» são histórias válidas
mas iguais a outra do mesmo lote.

## O quadro

| Modelo | Tópico | Aprovados | Taxa | Repetidos | Tempo | Recusas |
| --- | --- | --- | --- | --- | --- | --- |
| gpt-oss:20b | Equação do primeiro grau | 5/6 | 83% | 0 | 80.0 s | longo |
| gpt-oss:20b | Razão e proporção | 6/6 | 100% | 0 | 117.6 s | — |
| gpt-oss:20b | Estequiometria | 6/6 | 100% | 0 | 97.7 s | — |

## Os textos, para ler

### gpt-oss:20b — Equação do primeiro grau

**1.**

- pt: Um mecânico pintou {0} carros a cada sessão, já tinha pintado {1} antes de iniciar a nova série, e ao fim havia pintado {2} carros. Quantas sessões de pintura foram necessárias?
- fr: Un mécanicien a peint {0} voitures à chaque séance, il avait déjà peint {1} avant de commencer la nouvelle série, et à la fin il avait peint {2} voitures. Combien de séances de peinture ont été nécessaires?
- en: A mechanic painted {0} cars each session, he had already painted {1} before starting the new batch, and at the end he had painted {2} cars. How many painting sessions were needed?

**2.**

- pt: Um caminhão entregou {0} pacotes a cada viagem, já tinha entregue {1} antes de começar a rota, e no fim totalizou {2} pacotes. Quantas viagens o caminhão realizou?
- fr: Un camion a livré {0} colis à chaque voyage, il avait déjà livré {1} avant de commencer la tournée, et à la fin il avait totalisé {2} colis. Combien de voyages le camion a-t-il effectués?
- en: A truck delivered {0} packages each trip, it had already delivered {1} before starting the route, and at the end it had totaled {2} packages. How many trips did the truck make?

**3.**

- pt: Na obra, cada etapa acrescentou {0} metros de andaime, já havia montado {1} metros antes de começar a nova etapa, e ao fim o total de metros de andaime era {2}. Quantas etapas de montagem foram realizadas?
- fr: Sur le chantier, chaque étape ajoutait {0} mètres de échafaudage, on avait déjà monté {1} mètres avant de commencer la nouvelle étape, et à la fin le total de mètres d'échafaudage était de {2}. Combien d'étapes de montage ont été réalisées?
- en: At the construction site, each step added {0} meters of scaffold, we had already assembled {1} meters before starting the new step, and at the end the total meters of scaffold was {2}. How many assembly steps were carried out?

**4.**

- pt: Um atleta corria {0} voltas por treino, já tinha completado {1} voltas antes do último treino, e ao fim havia corrido {2} voltas. Quantos treinos de corrida foram feitos?
- fr: Un athlète courait {0} tours par entraînement, il avait déjà couru {1} tours avant le dernier entraînement, et à la fin il avait couru {2} tours. Combien d'entraînements de course ont été faits?
- en: A runner ran {0} laps per workout, he had already run {1} laps before the last workout, and at the end he had run {2} laps. How many workout sessions were performed?

**5.**

- pt: Na fábrica, cada caixa continha {0} unidades de doces, já havia empilhado {1} caixas antes da nova linha, e no fim a quantidade total de doces era {2}. Quantas caixas foram empilhadas na nova linha?
- fr: Dans l'usine, chaque boîte contenait {0} unités de bonbons, on avait déjà empilé {1} boîtes avant la nouvelle ligne, et à la fin le nombre total de bonbons était de {2}. Combien de boîtes ont été empilées sur la nouvelle ligne?
- en: In the factory, each box contained {0} units of candy, we had already stacked {1} boxes before the new line, and at the end the total number of candies was {2}. How many boxes were stacked on the new line?


#### Recusados

- _longo_: Um pintor cobriu {0} metros quadrados de cerca a cada dia, já havia pintado {1} metros quadrados antes de começar a nova fase, e ao fim a área total pintada era {2} metros quadrados. Quantos dias de pintura foram necessários?

---

### gpt-oss:20b — Razão e proporção

**1.**

- pt: Em uma padaria, {0} padeiros produzem {1} pães em uma manhã. Quando {2} padeiros trabalham, a produção de pães aumenta. Quantos pães serão produzidos?
- fr: Dans une boulangerie, {0} boulangers produisent {1} pains en un matin. Lorsque {2} boulangers travaillent, la production de pains augmente. Combien de pains seront produits ?
- en: In a bakery, {0} bakers produce {1} loaves of bread in one morning. When {2} bakers work, the bread production increases. How many loaves of bread will be produced?

**2.**

- pt: Em uma fábrica de brinquedos, {0} máquinas produzem {1} brinquedos por hora. Quando {2} máquinas operam, a produção de brinquedos aumenta. Quantos brinquedos serão produzidos por hora?
- fr: Dans une usine de jouets, {0} machines produisent {1} jouets par heure. Lorsque {2} machines fonctionnent, la production de jouets augmente. Combien de jouets seront produits par heure ?
- en: In a toy factory, {0} machines produce {1} toys per hour. When {2} machines operate, the toy production increases. How many toys will be produced per hour?

**3.**

- pt: Em uma granja, {0} galinhas põem {1} ovos em um dia. Quando {2} galinhas estão na granja, a produção de ovos aumenta. Quantos ovos serão produzidos?
- fr: Dans une ferme, {0} poules pondent {1} œufs en un jour. Lorsque {2} poules sont dans la ferme, la production d'œufs augmente. Combien d'œufs seront produits ?
- en: In a farm, {0} hens lay {1} eggs in one day. When {2} hens are on the farm, egg production increases. How many eggs will be produced?

**4.**

- pt: Em um festival de música, {0} músicos tocam {1} músicas em um palco. Quando {2} músicos tocarem, a quantidade de músicas aumenta. Quantas músicas serão tocadas?
- fr: Lors d'un festival de musique, {0} musiciens jouent {1} chansons sur une scène. Lorsque {2} musiciens jouent, le nombre de chansons augmente. Combien de chansons seront jouées ?
- en: At a music festival, {0} musicians play {1} songs on a stage. When {2} musicians play, the number of songs increases. How many songs will be played?

**5.**

- pt: Em uma escola, {0} professores dão {1} aulas por semana. Quando {2} professores dão aulas, o número de aulas aumenta. Quantas aulas serão dadas?
- fr: Dans une école, {0} professeurs donnent {1} cours par semaine. Lorsque {2} professeurs donnent des cours, le nombre de cours augmente. Combien de cours seront donnés ?
- en: In a school, {0} teachers give {1} lessons per week. When {2} teachers give lessons, the number of lessons increases. How many lessons will be given?

**6.**

- pt: Em uma livraria, {0} atendentes vendem {1} livros por dia. Quando {2} atendentes vendem, a quantidade de livros aumenta. Quantos livros serão vendidos?
- fr: Dans une librairie, {0} vendeurs vendent {1} livres par jour. Lorsque {2} vendeurs vendent, le nombre de livres augmente. Combien de livres seront vendus ?
- en: In a bookstore, {0} attendants sell {1} books per day. When {2} attendants sell, the number of books increases. How many books will be sold?


---

### gpt-oss:20b — Estequiometria

**1.**

- pt: Um químico de laboratório mistura {0} gramas de {1} e observa a formação de {2}. Qual a massa de {2} formada?
- fr: Un chimiste de laboratoire mélange {0} grammes de {1} et observe la formation de {2}. Quelle est la masse de {2} formée?
- en: A laboratory chemist mixes {0} grams of {1} and observes the formation of {2}. What is the mass of {2} formed?

**2.**

- pt: Um engenheiro industrial adiciona {0} gramas de {1} a uma reação e monitora a produção de {2}. Qual a massa de {2} formada?
- fr: Un ingénieur industriel ajoute {0} grammes de {1} à une réaction et surveille la production de {2}. Quelle est la masse de {2} formée?
- en: An industrial engineer adds {0} grams of {1} to a reaction and monitors the production of {2}. What is the mass of {2} formed?

**3.**

- pt: Um operador de estação de tratamento de água coloca {0} gramas de {1} na solução e observa a formação de {2}. Qual a massa de {2} formada?
- fr: Un opérateur d'usine de traitement de l'eau introduit {0} grammes de {1} dans la solution et observe la formation de {2}. Quelle est la masse de {2} formée?
- en: A water treatment plant operator adds {0} grams of {1} to the solution and observes the formation of {2}. What is the mass of {2} formed?

**4.**

- pt: Um cientista agrícola aplica {0} gramas de {1} em um ensaio e mede a produção de {2}. Qual a massa de {2} formada?
- fr: Un scientifique agricole applique {0} grammes de {1} dans une expérience et mesure la production de {2}. Quelle est la masse de {2} formée?
- en: An agricultural scientist applies {0} grams of {1} in a trial and measures the production of {2}. What is the mass of {2} formed?

**5.**

- pt: Um pesquisador de materiais mistura {0} gramas de {1} e observa a criação de {2}. Qual a massa de {2} formada?
- fr: Un chercheur en matériaux mélange {0} grammes de {1} et observe la création de {2}. Quelle est la masse de {2} formée?
- en: A materials researcher mixes {0} grams of {1} and observes the creation of {2}. What is the mass of {2} formed?

**6.**

- pt: Um técnico de controle de qualidade adiciona {0} gramas de {1} à amostra e verifica a formação de {2}. Qual a massa de {2} formada?
- fr: Un technicien de contrôle qualité ajoute {0} grammes de {1} à l'échantillon et vérifie la formation de {2}. Quelle est la masse de {2} formée?
- en: A quality control technician adds {0} grams of {1} to the sample and checks the formation of {2}. What is the mass of {2} formed?

