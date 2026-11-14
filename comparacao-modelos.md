# Comparação de modelos locais para escrever os problemas

Gerado em 2026-11-14 15:35, com 6 pedidos por tópico e por modelo.

A taxa de aprovação é do validador que o site usa de verdade
(`core/problemas/validacao/validar-modelo.ts`): dígito solto, lacuna faltando, ordem
diferente entre idiomas, metatexto, LaTeX, tamanho. «Repetidos» são histórias válidas
mas iguais a outra do mesmo lote.

## O quadro

| Modelo | Tópico | Aprovados | Taxa | Repetidos | Tempo | Recusas |
| --- | --- | --- | --- | --- | --- | --- |
| gpt-oss:20b@low | Equação do primeiro grau | 2/6 | 33% | 0 | 24.9 s | longo |
| gpt-oss:20b@low | Razão e proporção | 2/6 | 33% | 0 | 33.9 s | lacuna-faltando, numero-escrito, digito-solto |
| gpt-oss:20b@low | Estequiometria | 4/6 | 67% | 0 | 16.4 s | sem-pergunta |

## Os textos, para ler

### gpt-oss:20b@low — Equação do primeiro grau

**1.**

- pt: Na oficina de João, cada caixa de parafusos contém {0} peças. Ele já usou uma caixa inteira e ainda precisa de {1} peças. Se, ao final, ele terá usado {2} peças, quantas caixas completas ele usou?
- fr: Dans l'atelier de Jean, chaque boîte de vis contient {0} pièces. Il a déjà utilisé une boîte entière et lui manque encore {1} pièces. S'il utilisera finalement {2} pièces, combien de boîtes complètes aura-t-il utilisées?
- en: At João’s workshop, each box of screws holds {0} pieces. He has already used one whole box and still needs {1} pieces. If he will use {2} pieces in total, how many full boxes has he used?

**2.**

- pt: No transporte de mantimentos, cada caminhão carrega {0} toneladas. Um caminhão já foi enviado e ainda faltam {1} toneladas. Quando tudo estiver entregue, o total será {2} toneladas. Quantos caminhões completos foram enviados?
- fr: Dans le transport de provisions, chaque camion transporte {0} tonnes. Un camion a déjà été envoyé et il manque encore {1} tonnes. À la fin, le total sera de {2} tonnes. Combien de camions complets ont été envoyés?
- en: In the food transport, each truck carries {0} tonnes. One truck has already been sent and {1} tonnes are still missing. Once everything is delivered, the total will be {2} tonnes. How many full trucks were sent?


#### Recusados

- _longo_: Na construção da escola, cada trabalhador leva {0} metros de cimento em cada carga. Ele já trouxe uma carga completa e falta {1} metros. Quando terminar, terá trazido {2} metros no total. Quantas cargas completas ele trouxe?
- _longo_: Na feira de produtos artesanais, cada sacola contém {0} unidades de flores. Já foram vendidas uma sacola inteira e ainda faltam {1} unidades. Quando todas as sacolas forem vendidas, o total será {2} unidades. Quantas sacolas completas foram vendidas?
- _longo_: Na fábrica de brinquedos, cada máquina produz {0} peças por hora. Uma máquina já operou por uma hora completa e faltam ainda {1} peças para atingir o objetivo. Quando terminar, o total produzido será {2} peças. Quantas máquinas completas operaram?
- _longo_: No parque de diversões, cada carrinho de brinquedo percorre {0} voltas por minuto. Um carrinho já completou uma volta inteira e ainda falta {1} voltas. Quando terminar, ele terá completado {2} voltas no total. Quantas voltas completas o carrinho realizou?

---

### gpt-oss:20b@low — Razão e proporção

**1.**

- pt: Uma fábrica de biscoitos produz {0} pacotes em uma hora. Se cada pacote contém {1} biscoitos, quantos biscoitos há em {2} pacotes?
- fr: Une usine de biscuits produit {0} paquets en une heure. Si chaque paquet contient {1} biscuits, combien de biscuits y a-t-il dans {2} paquets ?
- en: A biscuit factory makes {0} boxes in one hour. If each box contains {1} biscuits, how many biscuits are in {2} boxes?

**2.**

- pt: Um caminhão transporta {0} toneladas de trigo. Se ele carrega {1} toneladas em cada viagem, quantas viagens serão necessárias para transportar {2} toneladas?
- fr: Un camion transporte {0} tonnes de blé. S’il charge {1} tonnes à chaque voyage, combien de voyages sont nécessaires pour transporter {2} tonnes ?
- en: A truck carries {0} tons of wheat. If it loads {1} tons per trip, how many trips are needed to carry {2} tons?


#### Recusados

- _lacuna-faltando, numero-escrito_: Um ciclista percorre {0} quilômetros em duas horas. Se a velocidade permanece constante, quantos quilômetros ele percorrerá em {2} horas?
- _lacuna-faltando, digito-solto, numero-escrito_: Um produtor de café faz {0} litros de café em 10 minutos. Se mantém a mesma taxa, quantos litros serão produzidos em {2} minutos?
- _lacuna-faltando, numero-escrito_: Um artista pinta {0} quadros em três dias. Se o ritmo não mudar, quantos quadros ele pintará em {2} dias?
- _lacuna-faltando, numero-escrito_: Um robô monta {0} componentes em cinco minutos. Se continua a velocidade, quantos componentes serão montados em {2} minutos?

---

### gpt-oss:20b@low — Estequiometria

**1.**

- pt: Em uma estação de tratamento de esgotos, {0} gramas de {1} são convertidos em {2}. Qual é a massa de {2} formada?
- fr: Dans une station d'épuration, {0} grammes de {1} sont transformés en {2}. Quelle est la masse de {2} produite?
- en: At a wastewater treatment plant, {0} grams of {1} are converted into {2}. What is the mass of {2} produced?

**2.**

- pt: Em um processo de purificação de minerais, {0} gramas de {1} são usados para produzir {2}. Qual é a massa de {2} que será gerada?
- fr: Dans un processus de purification de minéraux, {0} grammes de {1} sont utilisés pour produire {2}. Quelle sera la masse de {2} générée?
- en: In a mineral purification process, {0} grams of {1} are used to produce {2}. What is the mass of {2} that will be generated?

**3.**

- pt: Na elaboração de um corante industrial, {0} gramas de {1} reagem para formar {2}. Quanto de {2} é formado?
- fr: Dans la production d'un colorant industriel, {0} grammes de {1} réagissent pour former {2}. Combien de {2} est formé?
- en: In the manufacture of an industrial dye, {0} grams of {1} react to form {2}. How much {2} is formed?

**4.**

- pt: Em um experimento de laboratório, {0} gramas de {1} são transformados em {2}. Qual a massa de {2} obtida?
- fr: Dans une expérience de laboratoire, {0} grammes de {1} sont transformés en {2}. Quelle est la masse de {2} obtenue?
- en: In a laboratory experiment, {0} grams of {1} are transformed into {2}. What is the mass of {2} obtained?


#### Recusados

- _sem-pergunta_: Na síntese de um composto farmacêutico, {0} gramas de {1} reagem para formar {2}. Calcule a massa de {2} obtida.
- _sem-pergunta_: Durante a fabricação de fertilizantes, {0} gramas de {1} são convertidos em {2}. Determine a massa de {2} produzida.
