# Entregas pendentes

Medido em 19 de novembro de 2026. Última atualização: **frentes 2, 3 e 4
fechadas** (o dicionário de resolução chegou ao fim da fila) e **frente 7 de
3 071 para 1 487 entradas** — as 283 formas que mostravam a conta pela metade
agora mostram a conta inteira, e seis tópicos de química ganharam resolvedor.

Cada número aqui saiu de um comando, não de estimativa. A coluna **como medir**
é o comando que refaz a conta — use-a para conferir o progresso em vez de
confiar neste arquivo, que envelhece.

## O resumo

| # | Frente | Falta | Entregas |
|---|---|---|---|
| 1 | ~~Enunciado que não troca de idioma na tela~~ | **0** | ✅ |
| 2 | ~~Descrições de passo sem tradução~~ | **0** (5 de notação) | ✅ |
| 3 | ~~Dicas sem tradução~~ | **0** (14 de notação) | ✅ |
| 4 | ~~Diagnósticos sem tradução~~ | **0** | ✅ |
| 5 | Texto de exercício ainda em TypeScript | 19 arquivos, 3 832 linhas | **5** |
| 6 | ~~Palavra em português injetada no molde~~ | **0** | ✅ |
| 7 | Entrada do banco sem resolução própria | 1 487 entradas, 80 tópicos | **5** |
| 8 | ~~Legenda que explica o termo do enunciado~~ | **0** | ✅ |
| | **Total** | | **10** |

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

## 2, 3 e 4 · O dicionário de frases — **fechadas**

`math-translations.json` indexa por frase normalizada (`#` no lugar dos
números). O que a tela mostra do motor de resolução passa por ele — e agora
passa inteiro.

| O que | Traduzido | Total | Falta |
|---|---|---|---|
| Descrições de passo | 3 139 | 3 144 | 5, só notação |
| Dicas | 1 114 | 1 128 | 14, só notação |
| Diagnósticos | 1 641 | 1 641 | 0 |

As dezenove frases que sobram são fórmula escrita em texto — «p = mv»,
«ΔU = Q − W», «# × # = #», «A = b·h» —, e notação não muda de idioma. Traduzi-las
seria repetir a chave, e o guarda «cada entrada tem francês e inglês de
verdade» recusa exatamente isso. Por esse motivo os pisos de
`traducoes-de-resolucao.spec.ts` ficam em 0,998 (passos) e 0,987 (dicas), e em
**1** para os diagnósticos: frase nova sem tradução derruba o teste no dia em
que for escrita.

Os diagnósticos eram a frente que eu nunca tinha medido, e eram a maior: 1 de
1 641 no dicionário. A maior parte já chegava traduzida à tela por outro
caminho — os geradores que escrevem `diagnosticoTraducoes` à mão —, e o resto
entrou aqui.

O trabalho rendeu por FAMÍLIA, não por linha: as frases de um tópico são
variações de poucos moldes («Zeramos o resto da coluna #: L₂ ← L₂ − #·L₁» tem
trinta irmãs que mudam só a notação), então cada rodada fechava dois tópicos
inteiros em vez de percorrer a lista geral. Foram ~90 tópicos nesse ritmo.

**Como medir:** subir os pisos de
`src/app/core/math/translations/traducoes-de-resolucao.spec.ts` para 1.1 e
rodar; as três mensagens trazem os números, e as de passos e dicas listam as
frases que faltam.

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

## 6 · Palavra em português injetada no molde — **fechada**

O molde estava nas três línguas, mas a lacuna recebia o que o gerador mandava
— «retângulo», «SÉRIE», «o dobro», «uma esfera maciça» —, e a palavra no meio
da frase traduzida ficava em português.

Catorze arquivos, duas saídas. Quando as variações são poucas, um molde por
variação; quando são dezenas, `enunciadoDoMoldePorIdioma`, que dá à mesma
lacuna o valor de cada língua. Os catálogos do core — grandezas, corpos
rígidos, materiais, astros — passaram a guardar o nome nas três línguas, e o
artigo junto, porque o gênero muda com a palavra e o francês não o deduz do
português.

`scripts/verificar-palavras-injetadas.mjs` reprova quem voltar ao caminho
antigo: um literal com espaço ou acento dentro de uma chamada de molde, ou um
valor lido de um campo de nome. Roda em `npm run verificar:geradores`.

**Como medir:** `npm run verificar:geradores`.

## 7 · Entrada do banco sem resolução própria — 1 487 entradas, 5 entregas

5 893 das 7 380 entradas prontas têm passos próprios (79,9 %). As outras caem
nas etapas genéricas: o aluno vê a resposta certa e não vê de onde ela sai —
foi exatamente a queixa da fração geratriz.

A rodada teve duas partes.

**As 283 formas com marcador vazado.** A substituição escreve `#` no lugar de
cada número, e quando a fórmula repete um valor que o texto traz uma vez só — a
lei dos cossenos usa cada lado duas vezes — os marcadores acabavam antes da
conta e a trilha inteira era recusada. Todas levaram o mesmo conserto: `#1`,
`#2`… apontando o grupo. Cinco não cabiam em marcador nenhum (o numerador da
fração geratriz, a carga do íon, os lados ordenados do triângulo) e passaram a
calcular a própria linha.

Junto veio um defeito mais sério: `avaliarLatex`, que confere se a conta
mostrada fecha com a resposta, não sabia elevar um parêntese — e em JavaScript
`^` é o OU-exclusivo, não a potência. A régua estava torta nos dois sentidos.
Com ela reta, 60 regras mostravam conta errada na tela (o traço de
[[1, 2], [3, 4]] aparecia como 1 + 2); hoje são 120 entradas, nenhuma por
índice trocado — é substituição que mostra comparação, módulo ou um fator que
só existe em símbolo.

**Seis tópicos de química, 336 entradas.** Mol e massa molar, gases ideais,
soluções, átomos e íons, estrutura eletrônica e composição centesimal. Química
não cabe nas regras declarativas, porque uma fórmula tem número dentro — o `3`
do CaCO₃ seria lido como dado do exercício —, então esses tópicos têm
resolvedores de texto em `resolvedores-quimica.ts`, que leem a fórmula com a
mesma leitura do resto do site.

Falta: 80 tópicos **sem nenhuma regra**, com destaque para os cinco de química
que sobraram (estequiometria, limitante e rendimento, equações e
balanceamento, fórmulas e nomenclatura, tabela e ligação), que pedem o motor de
equação química, e as variantes de física e geometria com os dados só no texto.

**Como medir:** subir `COBERTURA_MINIMA` em
`src/app/core/enunciados/passos-do-banco.spec.ts` para 1.1 e rodar.

## 8 · Legenda que explica o termo — **fechada**

Quinze termos — abscissa, ordenada, vértice, diretriz, discriminante,
assíntota, geratriz, dízima periódica… — ganham um pontilhado no enunciado e
a explicação ao lado do cursor, nas três línguas: a palavra a reconhecer na
tela francesa é «abscisse», não «abscissa».

O catálogo está em `core/enunciados/glossario/termos-do-enunciado.json`, e o
guarda confere que cada termo cadastrado aparece de verdade em algum enunciado
do site — um glossário que ninguém vê é peso morto. A explicação nunca é
necessária para resolver, só para entender: em toque, a dica do navegador não
abre.

**Como medir:** `npm test -- --watch=false --include=app/core/enunciados/glossario/`.
