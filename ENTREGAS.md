# Entregas pendentes

Medido em 19 de novembro de 2026. Última atualização: **frente 1 fechada por
inteiro** — todo enunciado do site troca de idioma.

Cada número aqui saiu de um comando, não de estimativa. A coluna **como medir**
é o comando que refaz a conta — use-a para conferir o progresso em vez de
confiar neste arquivo, que envelhece.

## O resumo

| # | Frente | Falta | Entregas |
|---|---|---|---|
| 1 | ~~Enunciado que não troca de idioma na tela~~ | **0** | ✅ |
| 2 | Descrições de passo sem tradução | 1 734 frases | **9** |
| 3 | Dicas sem tradução | 805 frases | **5** |
| 4 | Diagnósticos sem tradução | 1 640 frases | **8** |
| 5 | Texto de exercício ainda em TypeScript | 19 arquivos, 3 832 linhas | **5** |
| 6 | Palavra em português injetada no molde | 55 ocorrências, 14 arquivos | **2** |
| 7 | Entrada do banco sem resolução própria | 3 071 entradas, 113 tópicos | **10** |
| 8 | Legenda que explica o termo do enunciado | não começou | **2** |
| | **Total** | | **34** |

Uma «entrega» é uma rodada de trabalho que fecha um pedaço verificável e deixa
a suíte verde. Pelo ritmo das últimas sessões, cada uma leva de uma a duas
horas. O número é o que eu consigo prever; ele muda quando a frente revela o
que ainda não se vê.

## 1 · Enunciado que não troca de idioma — **fechada**

Eram 113 tópicos no começo deste trabalho, 53 quando a varredura passou a olhar
sessenta sementes em vez de três, e **zero** agora. O piso de
`traducao-na-tela.spec.ts` está em 0 e só pode descer — se subir, é um ramo
novo que nasceu falando só português.

O que fechou a conta não foi traduzir texto: o texto já estava traduzido nos
moldes. Foi tirar do TypeScript as três coisas que o molde não alcançava.

| O que ficava em código | Exemplo | A saída |
|---|---|---|
| o SUFIXO colado ao fim da frase | « Responda como fração.» | `enunciadoComSufixos` junta pergunta e sufixos pelo arquivo |
| a PALAVRA escolhida por um `if` | «o dobro», «cilindro», «esquerda» | um molde por variação, com a palavra escrita em cada língua |
| a HISTÓRIA inteira escrita em código | os cenários dos sistemas lineares | um molde por cenário; o código fica com os pesos |

Para o caso em que as variações são dezenas — as grandezas da análise
dimensional são vinte e três —, um molde por palavra seria vinte e três
arquivos dizendo a mesma frase. Para esses, `enunciadoDoMoldePorIdioma` dá à
mesma lacuna o valor de cada língua, e o nome viaja com a grandeza.

Duas frases de resolução também mudaram de propósito, porque não tinham como
ser traduzidas como estavam: «o 4º termo» virou «o termo de ordem 4» (o
ordinal com `º` é português) e «5 kg em x = 2 m» virou «5 kg, x = 2 m» (a
preposição era a única palavra na lista).

**Como medir:** baixar `SEM_TRADUCAO_MAXIMO` para 0 em
`src/app/core/enunciados/traducao-na-tela.spec.ts` — ele já está em 0, então o
spec verde é a medida.

## 2, 3 e 4 · O dicionário de frases — 4 179 frases, 22 entregas

`math-translations.json` indexa por frase normalizada (`#` no lugar dos
números). O que a tela mostra do motor de resolução passa por ele.

| O que | Traduzido | Total | Falta |
|---|---|---|---|
| Descrições de passo | 1 413 | 3 147 | 1 734 |
| Dicas | 323 | 1 128 | 805 |
| Diagnósticos | 1 | 1 641 | **1 640** |

Os diagnósticos são a frente que eu nunca tinha medido, e são a maior: 1 de
1 641. Parte deles já chega traduzida à tela por outro caminho — os geradores
que escrevem `diagnosticoTraducoes` à mão —, então o número do dicionário é
pior do que a tela. Quantos exatamente ainda não sei, e descobrir isso é a
primeira das oito entregas desta linha.

O ritmo medido é de ~200 frases por rodada traduzindo por tópico com regras de
frase (as frases de um tópico são variações de poucos moldes), o que dá as 22.

**Como medir:** subir os pisos de
`src/app/core/math/translations/traducoes-de-resolucao.spec.ts` para 1.1 e
rodar; as três mensagens trazem os números.

## 5 · Texto de exercício ainda em TypeScript — 19 arquivos, 5 entregas

Restam 3 832 linhas em `*.textos.ts` e `*.contextos.ts`. Onze dos dezenove são
de química, e é por isso que são poucas entregas: o mesmo formato se repete, e
uma rodada leva o bloco inteiro.

18 dos 130 geradores ainda não importam `moldes.model` — os onze de química,
mais `semelhanca-e-pitagoras`, `equacao-segundo-grau`, `inequacoes-segundo-grau`,
`autovalores-e-autovetores`, `mmc-mdc`, `composicao-inversa` e
`tecnicas-de-integracao`.

**Como medir:**
`find src/app/features -name "*.textos.ts" -o -name "*.contextos.ts" | wc -l`
e `grep -L "moldes.model" $(find src/app/features -name "*.gerador.ts") | wc -l`.

## 6 · Palavra em português injetada no molde — 55 ocorrências, 2 entregas

O molde está nas três línguas, mas recebe do TypeScript um valor que é uma
palavra portuguesa — `'retângulo'`, `'PARALELO'`, `'no MESMO sentido'` —, e ela
atravessa a tradução intacta. O enunciado francês sai com a palavra em
português no meio.

A saída é a de Áreas de figuras planas, repetida agora em
`equacao-primeiro-grau`, onde «o dobro» virava «Ana has the dobro of Bia's
age»: um molde por variação, com a palavra já escrita em cada língua. Estão em 14 arquivos; parte das 55 já é legítima — quando o gerador usa
`enunciadoDoMoldePorIdioma`, o valor em português é o da tela portuguesa, e as
outras duas línguas têm o seu. Separar um caso do outro
(`cos`), que não se traduz, e a primeira entrega é separar um do outro.

**Como medir:** o script em
`$CLAUDE_JOB_DIR/tmp` que varre as chamadas a `textoDoMolde` procurando valores
que são string literal; ou, à mão, `grep -n "': '" nos geradores da lista`.

## 7 · Entrada do banco sem resolução própria — 3 071 entradas, 10 entregas

4 309 das 7 380 entradas prontas têm passos próprios (58,4 %). As outras caem
nas etapas genéricas: o aluno vê a resposta certa e não vê de onde ela sai —
foi exatamente a queixa da fração geratriz.

Cada forma de pergunta ganha passos quando alguém escreve a regra dela. São
113 tópicos sem resolvedor, e uma rodada cobre um tópico inteiro quando as
formas dele se parecem.

**Como medir:** subir `COBERTURA_MINIMA` em
`src/app/core/enunciados/passos-do-banco.spec.ts` para 1.1 e rodar.

## 8 · Legenda que explica o termo — não começou, 2 entregas

«Qual é a abscissa do vértice?» não diz o que é uma abscissa. O pedido foi uma
legenda no próprio exercício.

O que existe hoje é `src/app/curriculo/glossario.ts`: 231 termos em três
línguas, mostrados na home por área. Falta tudo o que liga um ao outro — não há
campo de definição (só tradução), «abscissa» e «ordenada» não estão lá, e nada
no enunciado aponta para o glossário.

Duas entregas: a primeira dá ao glossário uma definição por termo e acrescenta
os que faltam; a segunda liga o enunciado a ele, marcando o termo no texto.

## O que já está fechado

Para não recontar o que foi feito:

- banco de enunciados em JSON, 7 935 arquivos, um por pergunta, separados por
  tópico e nível;
- 555 moldes alcançáveis, todos com guarda contra órfão e inalcançável;
- 93 723 testes, 241 arquivos, verdes;
- fórmulas do banco renderizadas com KaTeX no teste, e escape perdido agora
  reprova;
- frações com as quatro formas de operando (fração, inteiro, misto, misto com
  fração);
- fração geratriz mostrando o método dos deslocamentos;
- **todo enunciado do site nas três línguas**, em todos os níveis e ramos, com
  729 moldes alcançáveis em 8 109 arquivos.
