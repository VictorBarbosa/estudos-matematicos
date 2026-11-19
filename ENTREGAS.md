# Entregas pendentes

Medido em 19 de novembro de 2026. Última atualização: entrega 1/12 da frente 1
fechada.

Cada número aqui saiu de um comando, não de estimativa. A coluna **como medir**
é o comando que refaz a conta — use-a para conferir o progresso em vez de
confiar neste arquivo, que envelhece.

## O resumo

| # | Frente | Falta | Entregas |
|---|---|---|---|
| 1 | Enunciado que não troca de idioma na tela | 48 tópicos | **11** |
| 2 | Descrições de passo sem tradução | 1 734 frases | **9** |
| 3 | Dicas sem tradução | 805 frases | **5** |
| 4 | Diagnósticos sem tradução | 1 640 frases | **8** |
| 5 | Texto de exercício ainda em TypeScript | 19 arquivos, 3 832 linhas | **5** |
| 6 | Palavra em português injetada no molde | 33 ocorrências, 13 arquivos | **2** |
| 7 | Entrada do banco sem resolução própria | 3 071 entradas, 113 tópicos | **10** |
| 8 | Legenda que explica o termo do enunciado | não começou | **2** |
| | **Total** | | **52** |

Uma «entrega» é uma rodada de trabalho que fecha um pedaço verificável e deixa
a suíte verde. Pelo ritmo das últimas sessões, cada uma leva de uma a duas
horas. O número é o que eu consigo prever; ele muda quando a frente revela o
que ainda não se vê.

## 1 · Enunciado que não troca de idioma — 48 tópicos, 11 entregas

> **Entrega 1 de 12, fechada.** A varredura olhava três sementes, e três não
> bastavam: um gerador com seis ramos mostra cada ramo numa fração dos
> sorteios, e o ramo sem tradução não saía. Com sessenta sementes eram 53
> tópicos, não 45 — o guarda não estava errado, estava olhando pouco.
>
> A entrega acabou com `pedindoFracao`, a função que colava « Responda como
> fração.» em português ao enunciado de quatro tópicos, e fechou cinco:
> `fatoracao`, `funcao-afim`, `funcao-modular`, `equacao-primeiro-grau` e
> `composicao-inversa` — este último nem usava moldes. De 53 para **48**.
>
> O que ficou para as próximas: `enunciadoComSufixos`, que junta a pergunta e
> os sufixos pelo arquivo, nas três línguas, sem duplicar o enunciado. É o
> mecanismo que as outras entregas desta frente vão usar.

O texto está no arquivo, nas três línguas, mas a tela mostra português a quem
escolheu francês. São duas causas, e a proporção importa porque elas custam
diferente:

| Causa | Tópicos | O que fazer |
|---|---|---|
| Enunciado é `molde + sufixo escrito em TypeScript` | 45 | dobrar o sufixo para dentro do molde |
| Enunciado inteiro em TypeScript | 3 | criar os moldes do zero |

Os três do segundo grupo: `equacao-segundo-grau`, `inequacoes-segundo-grau`,
`mmc-mdc`. Atenção: `mmc-mdc` **não está na lista dos 122 tópicos**
autorizados, então ele só pode receber moldes, nunca perguntas prontas — o que
vale também para `fatoracao`, que já foi fechado assim.

Não há mais atalho de script aqui — os 115 casos que um script resolveu já
foram. Cada tópico é uma leitura e uma decisão sobre onde a frase se parte, a
uns cinco por entrega.

**Como medir:** baixar `SEM_TRADUCAO_MAXIMO` para 0 em
`src/app/core/enunciados/traducao-na-tela.spec.ts` e rodar o spec; a mensagem
lista os tópicos. O piso hoje é 48 e só pode descer.

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

## 6 · Palavra em português injetada no molde — 33 ocorrências, 2 entregas

O molde está nas três línguas, mas recebe do TypeScript um valor que é uma
palavra portuguesa — `'retângulo'`, `'PARALELO'`, `'no MESMO sentido'` —, e ela
atravessa a tradução intacta. O enunciado francês sai com a palavra em
português no meio.

A saída é a de Áreas de figuras planas, repetida agora em
`equacao-primeiro-grau`, onde «o dobro» virava «Ana has the dobro of Bia's
age»: um molde por variação, com a palavra já escrita em cada língua. Estão em 13 arquivos; alguns dos 33 são notação
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
- fração geratriz mostrando o método dos deslocamentos.
