# Comparação de modelos locais para escrever os problemas

Gerado em 2026-11-14 05:51, com 6 pedidos por tópico e por modelo.

A taxa de aprovação é do validador que o site usa de verdade
(`core/problemas/validacao/validar-modelo.ts`): dígito solto, lacuna faltando, ordem
diferente entre idiomas, metatexto, LaTeX, tamanho. «Repetidos» são histórias válidas
mas iguais a outra do mesmo lote.

## O quadro

| Modelo | Tópico | Aprovados | Taxa | Repetidos | Tempo | Recusas |
| --- | --- | --- | --- | --- | --- | --- |
| gpt-oss:20b@low | Equação do primeiro grau | 6/6 | 100% | 0 | 13.2 s | — |
| gpt-oss:20b@low | Razão e proporção | 6/6 | 100% | 0 | 12.0 s | — |
| gpt-oss:20b@low | Estequiometria | 6/6 | 100% | 0 | 13.8 s | — |

## Os textos, para ler

### gpt-oss:20b@low — Equação do primeiro grau

**1.**

- pt: Na oficina, cada caixa contém {0} peças e o trabalhador já montou {1} caixas. O estoque total agora é {2} peças. Quantas caixas foram montadas?
- fr: Dans l'atelier, chaque boîte contient {0} pièces et l'ouvrier a déjà monté {1} boîtes. Le stock total est désormais de {2} pièces. Combien de boîtes ont été montées ?
- en: In the workshop, each box holds {0} pieces and the worker has already assembled {1} boxes. The total inventory is now {2} pieces. How many boxes were assembled?

**2.**

- pt: Um ônibus viaja com {0} passageiros por assento e já transportou {1} ônibus. O número total de passageiros agora é {2}. Quantos ônibus foram usados?
- fr: Un bus transporte {0} passagers par siège et a déjà transporté {1} bus. Le nombre total de passagers est désormais de {2}. Combien de bus ont été utilisés ?
- en: A bus carries {0} passengers per seat and has already transported {1} buses. The total number of passengers is now {2}. How many buses were used?

**3.**

- pt: Durante a construção, cada escavadeira remove {0} metros cúbicos de solo, e o operário já usou {1} escavadeiras. O volume total removido é {2} metros cúbicos. Quantas escavadeiras foram operadas?
- fr: Pendant la construction, chaque excavatrice enlève {0} mètres cubes de sol, et l'opérateur a déjà utilisé {1} excavatrices. Le volume total enlevé est désormais de {2} mètres cubes. Combien d'excavatrices ont été utilisées ?
- en: During construction, each excavator removes {0} cubic meters of soil, and the operator has already used {1} excavators. The total volume removed is now {2} cubic meters. How many excavators were used?

**4.**

- pt: Em um parque de diversões, cada carrinho de passeio tem {0} lugares e o operador já conduziu {1} carrinhos. O número total de passageiros é {2}. Quantos carrinhos foram conduzidos?
- fr: Dans un parc d'attractions, chaque tramway a {0} places et l'opérateur a déjà conduit {1} tramways. Le nombre total de passagers est désormais de {2}. Combien de tramways ont été conduits ?
- en: At an amusement park, each ride vehicle has {0} seats and the operator has already driven {1} vehicles. The total number of passengers is now {2}. How many vehicles were driven?

**5.**

- pt: Na feira, cada barraca vende {0} frutas por cliente, e o vendedor já atendiu {1} barracas. O total de frutas vendidas é {2}. Quantas barracas foram atendidas?
- fr: Au marché, chaque stand vend {0} fruits par client, et le vendeur a déjà servi {1} stands. Le total de fruits vendus est désormais de {2}. Combien de stands ont été servis ?
- en: At the market, each stall sells {0} fruits per customer, and the vendor has already served {1} stalls. The total number of fruits sold is now {2}. How many stalls were served?

**6.**

- pt: Durante a maratona, cada corredor cobre {0} quilômetros por volta e o atleta já completou {1} voltas. A distância total percorrida é {2} quilômetros. Quantas voltas foram completadas?
- fr: Pendant le marathon, chaque coureur parcourt {0} kilomètres par tour et l'athlète a déjà complété {1} tours. La distance totale parcourue est désormais de {2} kilomètres. Combien de tours ont été complétés ?
- en: During the marathon, each runner covers {0} kilometers per lap, and the athlete has already completed {1} laps. The total distance run is now {2} kilometers. How many laps were completed?


---

### gpt-oss:20b@low — Razão e proporção

**1.**

- pt: Para fazer {0} porções de pão, a receita pede {1} gramas de farinha. Quantas gramas de farinha são necessárias para {2} porções?
- fr: Pour réaliser {0} portions de pain, la recette demande {1} grammes de farine. Combien de grammes de farine sont nécessaires pour {2} portions ?
- en: To make {0} loaves of bread, the recipe calls for {1} grams of flour. How many grams of flour are needed for {2} loaves?

**2.**

- pt: Um caminhão percorre {0} quilômetros usando {1} litros de combustível. Quantos litros o mesmo caminhão precisará para percorrer {2} quilômetros?
- fr: Un camion parcourt {0} kilomètres en consommant {1} litres de carburant. Combien de litres ce même camion devra-t-il consommer pour parcourir {2} kilomètres ?
- en: A truck travels {0} kilometers using {1} liters of fuel. How many liters will the same truck need to travel {2} kilometers?

**3.**

- pt: Um atleta completa {0} voltas em uma pista de atletismo usando {1} minutos. Quantos minutos levará para completar {2} voltas?
- fr: Un athlète termine {0} tours sur une piste d’athlétisme en {1} minutes. Combien de minutes lui faudra-t‑il pour terminer {2} tours ?
- en: An athlete runs {0} laps around a track in {1} minutes. How many minutes will it take to run {2} laps?

**4.**

- pt: Para produzir {0} unidades de um produto industrial, a fábrica consome {1} metros cúbicos de água. Quanto de água será consumido para produzir {2} unidades?
- fr: Pour fabriquer {0} unités d’un produit industriel, l’usine consomme {1} mètres cubes d’eau. Combien de mètres cubes d’eau seront consommés pour fabriquer {2} unités ?
- en: To produce {0} units of an industrial product, the factory uses {1} cubic meters of water. How much water will be used to produce {2} units?

**5.**

- pt: Um cozinheiro utiliza {0} colheres de chá de açúcar para preparar {1} porções de bolo. Quantas colheres de chá são necessárias para fazer {2} porções?
- fr: Un chef utilise {0} cuillères à café de sucre pour préparer {1} portions de gâteau. Combien de cuillères à café sont nécessaires pour faire {2} portions ?
- en: A cook uses {0} teaspoons of sugar to make {1} servings of cake. How many teaspoons of sugar are needed for {2} servings?

**6.**

- pt: Um robô consome {0} joules de energia para completar {1} ciclos de montagem. Quantos joules serão consumidos para completar {2} ciclos?
- fr: Un robot consomme {0} joules d’énergie pour accomplir {1} cycles d’assemblage. Combien de joules seront consommés pour accomplir {2} cycles ?
- en: A robot uses {0} joules of energy to complete {1} assembly cycles. How many joules will be used to complete {2} cycles?


---

### gpt-oss:20b@low — Estequiometria

**1.**

- pt: Um engenheiro de tratamento de água precisa converter {0} gramas do reagente {1} em massa de produto {2} para melhorar a qualidade da água. Quantos gramas de {2} são produzidos?
- fr: Un ingénieur de traitement de l'eau doit convertir {0} grammes du réactif {1} en masse de produit {2} afin d'améliorer la qualité de l'eau. Combien de grammes de {2} sont produits ?
- en: An water treatment engineer needs to convert {0} grams of reactant {1} into mass of product {2} to improve water quality. How many grams of {2} are produced?

**2.**

- pt: Na fabricação de um catalisador, o operário transforma {0} gramas do reagente {1} em {2}. Qual é a massa de {2} obtida?
- fr: Dans la fabrication d'un catalyseur, l'opérateur transforme {0} grammes du réactif {1} en {2}. Quelle est la masse de {2} obtenue ?
- en: During the production of a catalyst, the operator converts {0} grams of reactant {1} into {2}. What is the mass of {2} obtained?

**3.**

- pt: Um laboratório de química analítica converte {0} gramas do reagente {1} em {2} para análise de pureza. Quantos gramas de {2} são formados?
- fr: Un laboratoire d'analyse chimique convertit {0} grammes du réactif {1} en {2} pour l'analyse de pureté. Combien de grammes de {2} sont formés ?
- en: A chemical analysis laboratory converts {0} grams of reactant {1} into {2} for purity testing. How many grams of {2} are formed?

**4.**

- pt: Um produtor de fertilizante usa {0} gramas do reagente {1} para gerar {2}. Qual a massa de {2} produzida?
- fr: Un producteur d'engrais utilise {0} grammes du réactif {1} pour produire {2}. Quelle est la masse de {2} produite ?
- en: A fertilizer producer uses {0} grams of reactant {1} to produce {2}. What is the mass of {2} produced?

**5.**

- pt: Em uma planta de reciclagem, {0} gramas do reagente {1} são transformados em {2} para reuso. Quanto de {2} se obtém?
- fr: Dans une usine de recyclage, {0} grammes du réactif {1} sont transformés en {2} pour réutilisation. Combien de {2} est obtenu ?
- en: In a recycling plant, {0} grams of reactant {1} are converted into {2} for reuse. How much {2} is obtained?

**6.**

- pt: Um técnico de controle de qualidade converte {0} gramas do reagente {1} em {2} para testar a eficiência do processo. Qual a massa de {2} formada?
- fr: Un technicien de contrôle qualité convertit {0} grammes du réactif {1} en {2} pour tester l'efficacité du processus. Quelle est la masse de {2} formée ?
- en: A quality control technician converts {0} grams of reactant {1} into {2} to test process efficiency. What is the mass of {2} formed?

