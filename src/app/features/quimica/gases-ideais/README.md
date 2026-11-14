# Gases ideais e pressões parciais

Uma equação só — `PV = nRT` — e uma régua que não se negocia: a temperatura vai
em kelvin.

## Por que kelvin não é detalhe de unidade

A equação afirma que o volume é **proporcional** à temperatura. Proporção só
significa alguma coisa numa escala cujo zero é a ausência da grandeza. Em
Celsius, 20 °C não é o dobro de 10 °C: o zero ali é o congelamento da água, um
ponto escolhido. Em kelvin, 293 K contra 283 K mostram o que de fato acontece —
três e meio por cento, não o dobro.

Por isso **todas as temperaturas dos enunciados vêm em °C**. Dá-las já em
kelvin pouparia o aluno do passo que a equação mais cobra; há guarda no spec
para que esse conforto não entre depois.

### Temperaturas sempre positivas, e por quê

`sortearCelsius` fica entre 5 °C e 150 °C. Com 0 °C a armadilha de «deixar em
Celsius» dividiria por zero; com temperatura negativa ela devolveria um volume
negativo — um absurdo que entregaria o erro antes de o aluno pensar. A
armadilha precisa sair **plausível** para ensinar.

## A lei combinada não é uma lei nova

`P₁V₁/T₁ = P₂V₂/T₂` é `PV = nRT` escrita duas vezes para a mesma quantidade de
gás, com `nR` cancelando. Daí ela valer só enquanto nada escapa do recipiente —
e daí também saírem Boyle (T fixa) e Charles (P fixa) sem precisarem de nome
próprio.

## Pressões parciais, e a fração que engana

Num gás ideal as partículas não se enxergam, nem as de outra espécie: cada uma
empurra como se estivesse sozinha. O que decide a parcela de cada gás é
**quantas partículas** ele traz, não quanto pesa. Os gases sorteados têm massas
molares bem diferentes — He contra Ar, por exemplo — justamente para que a
fração em massa e a fração molar não coincidam, e o erro apareça.

## O R, e o outro R

Aqui `R_LITRO_ATM = 0,08206 L·atm/(mol·K)`; em `core/math/fisica/fluidos` há
`R_GASES = 8,314 J/(mol·K)`. É a mesma constante: muda a unidade de energia,
não a física. A química usa esta forma porque pressão vem em atm e volume em
litros. A conversão para kelvin vem de `fisica/termica` (`paraKelvin`), e não é
uma cópia: a escala absoluta é uma só.

## Armadilhas

| O que o aluno fez                    | Pergunta      |
| ------------------------------------ | ------------- |
| Deixou T em graus Celsius            | todas         |
| Trocou n e P de lugar                | volume        |
| Multiplicou pelo R em vez de dividir | quantidade    |
| Inverteu T₁ e T₂                     | transformação |
| Usou a fração em massa               | parcial       |
| Deu a parcial do outro gás           | parcial       |
