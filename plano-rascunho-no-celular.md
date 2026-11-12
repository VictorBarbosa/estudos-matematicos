# Rascunho no celular — plano

**Problema.** No computador e no iPad as contas saem no papel, ou na folha de rascunho à mão
livre. No ônibus e no avião não há papel — e **no celular não há como escrever nem desenhar**.
Com o dedo, numa tela de 390 px, armar uma divisão é pior que qualquer caderno; é por isso que
`DispositivoService.folhaPermitida` libera a folha à mão livre **só no tablet**.

**A ideia.** Um **monta monta**: você não escreve, você **encaixa peças prontas**.

> Quarta versão, depois de duas revisões contra o código. O histórico está na seção 12.
>
> **A Fase 1 está implementada** (11/11/2026). O que a implementação revelou está na seção 14, e
> o que uma revisão do código corrigiu depois, na seção 15 — inclusive um defeito que fazia a
> persistência parar de funcionar no segundo tópico.

---

## 1. O princípio

O papel dá duas coisas de graça, e tira uma:

|                           | Papel                   | Celular            |
| ------------------------- | ----------------------- | ------------------ |
| Espaço para armar a conta | de graça — você desenha | **é o que não dá** |
| Saber se errou no meio    | não dá nada             | de graça           |

Daí o desenho inteiro: **o celular dá a forma da conta e nunca o passo.**

### A régua do «nada muito já feito»

A peça é **átomo**: algarismo, `x`, operador, fração. Nunca «divida os dois lados por 2» —
isso seria a ferramenta pensando por você.

O rascunho **nunca**:

- escolhe uma peça, nem preenche um buraco;
- calcula um resultado, nem parcial;
- sugere o próximo passo;
- simplifica, fatora ou reduz;
- vira calculadora — a calculadora continua fora do celular, de propósito
  (`calculadoraPermitida`). **Isto não se negocia:** é o que separa o rascunho de uma
  calculadora com um passo a mais;
- copia nada para o campo de resposta.

**O que ele faz sozinho é desenhar a estrutura** — a barra da fração no lugar certo, o
parêntese que a precedência exige, o alinhamento das peças. Isso é **desenho, não aritmética**,
e é exatamente o que a mão não consegue fazer numa tela de 390 px. A fronteira é essa, e vale
também para os três atalhos de toque da seção 3: eles movem o foco, nunca escolhem peça.

Escolher qual peça, e em que ordem, é o raciocínio inteiro. O que se elimina é só a caligrafia.

---

## 2. Como o monta monta funciona

### 2.1 A linha é uma árvore, não um texto

Cada linha nasce como **um buraco só**. Toca-se no buraco e escolhe-se a peça; se a peça é uma
estrutura, ela entra trazendo buracos novos.

```
  linha nova           ▢

  toco em  ▭/▭         ▢
                      ───
                       ▢

  toco no buraco       3
  de cima, e no 3     ───
                       ▢

  toco no de baixo,    3
  e no 4              ───
                       4
```

**Tocar para escolher, tocar para encaixar — nunca arrastar.** Arrastar em tela pequena disputa
com a rolagem e erra o alvo.

Com árvore, dois problemas da versão anterior desaparecem: **a conta já nasce desenhada certa**,
porque a estrutura _é_ o desenho; e **não existe conversor de texto para TeX** (o projeto só tem
o caminho inverso, `texParaTexto`), porque não há texto para analisar.

### 2.2 As três ações, e como se disparam

| Ação         | Como                                     | O que faz                                                |
| ------------ | ---------------------------------------- | -------------------------------------------------------- |
| **Encaixar** | buraco selecionado + peça                | a peça entra no buraco                                   |
| **Envolver** | **peça** selecionada + peça de estrutura | a selecionada entra no primeiro buraco da estrutura nova |
| **Apagar**   | peça selecionada + `⌫`                   | a peça volta a ser buraco                                |

**Encaixar e envolver são o mesmo gesto** — tocar numa peça da bandeja. O que muda é o que está
selecionado: buraco ou peça já montada. Sem botão de modo, sem menu.

É **envolver** que faz a álgebra andar. Dividir os dois lados por 2: seleciono `2x`, toco em
`÷`, encaixo `2`; seleciono `8`, toco em `÷`, encaixo `2`.

**Quem decidiu dividir por 2 fui eu.** A ferramenta só desenhou.

### 2.3 As regras que o envolver precisa ter por escrito

Sem elas, a implementação decide no escuro:

- **Operações não comutativas.** Envolver `2x` com `−` só dá `2x − ▢`; para `3 − 2x` não
  haveria caminho. Então existe a peça **`⇄` (virar os lados)**, que atua sobre uma operação já
  montada. Vale para `−` e `÷`.
- **`=` só na raiz, e uma vez por linha.** Envolver uma subexpressão com `=` produziria
  `3 + (x = ▢)`, que não é nada. A peça `=` só se oferece quando a seleção é a raiz e a raiz
  ainda não é uma igualdade.
- **Envolver um buraco é permitido.** Seleção `▢` + `÷` dá `▢ ÷ ▢` — é assim que se monta de
  cima para baixo, e é o caminho normal da primeira linha.
- **Parêntese não é peça.** Ele é **desenhado pela precedência**, nunca encaixado: numa árvore o
  agrupamento já está na estrutura, e peça de parêntese era resíduo do plano-teclado. Menos
  peças, menos toques, e nenhuma forma de escrever parêntese desemparelhado.
- **`−` é dois nós diferentes:** operação binária e sinal negativo. Na bandeja são duas peças —
  `−` e `±`.
- **Número acumula algarismos.** `487` são três toques no mesmo nó, não três peças: a régua da
  seção 1 diz que a peça é o algarismo, e o nó número é quem os junta. Ele tem estado «em
  composição», que termina quando a seleção sai dele; a vírgula decimal e o `±` pertencem a ele.

### 2.4 A bandeja

Fixa — você compõe os números. Os números do enunciado vindos prontos ficam para a Fase 3
(seção 5.2).

```
  7  8  9    ÷   ▭/▭        ⬆  subir um nível
  4  5  6    ×   ▢x         ⇥  próximo buraco
  1  2  3    +   =          ⇄  virar os lados
  0  ,  ±    −   ⌫
```

Medida das teclas: `$tecla: 3.25rem`, a da casa
(`shared/components/calculadora/calculadora.scss:13`), com `aria-label` por peça como em
`calculadora.html:267-269`.

**`⬆` e `⇥` não são enfeite** — são o que torna o monta monta usável sem precisão de dedo
(seção 3.2). «Andar de buraco em buraco» já estava no modelo, e faltava na interface.

**`▢x` entra na Fase 1.** `2x` pelo caminho geral são três encaixes (`×`, `2`, `x`), e `2x`
aparece em quase toda linha de álgebra; a versão anterior deixava essa peça como «avaliar
depois», e a contagem de toques da seção 3.2 mostrou que ela não é opcional.

### 2.5 A pilha de linhas, e por que a cópia é o caminho principal

Uma linha por passo. Cada linha nova nasce vazia, **ou copiando a anterior** — e a cópia é o
caminho normal, não uma conveniência:

```
  2x + 3 = 11      ← esta custa ~9 toques
  2x = 8           ← copiada e editada: ~5
  x = 4            ← copiada e editada: ~4
```

**Só a primeira linha é caríssima.** As seguintes se obtêm copiando e editando — seleciono o
`3` e apago, seleciono o `11` e troco por `8`. É também o que mais se parece com o papel, onde
a linha de baixo repete a de cima com uma diferença.

### 2.6 O desenho é nosso, não do KaTeX

O tabuleiro desenha a árvore com layout próprio, e **cada peça é um alvo de toque**. O KaTeX
produz HTML sem alças nossas (`shared/components/formula/formula.html:2` é `[innerHTML]`), e
numa tela de dedo cada peça precisa ser tocável. O KaTeX continua onde já está: enunciados e
teoria.

Não há o que reaproveitar: `barra-fracao` desenha o **valor** de uma fração em partes iguais
(`barra-fracao.ts:29-42`), é ilustração didática e não notação; e **não existe componente
recursivo no projeto** — o único `ngTemplateOutlet` está em `assistente-dialog.html`. O
tabuleiro será o primeiro, e é o maior item da Fase 1 (seção 6).

---

## 3. As duas decisões de geometria, que a revisão forçou

### 3.1 Alvo tocável contra aninhamento: os dois requisitos se excluem

A conta é implacável. Cabeçalho de `3.5rem` (56 px) mais bandeja de 4 linhas de `3.25rem`
(~225 px) deixam **~375 px de tabuleiro** num iPhone — e nele mora a _pilha_ de linhas, não uma
linha só. Uma fração tem o dobro da altura do filho, então três níveis de aninhamento com folha
tocável de 44 px dão **~350 px**: a expressão ocupa o tabuleiro inteiro e a pilha de passos, que
é o conceito, não tem onde existir.

O caminho tipográfico vai para o lado oposto: encolhendo como o KaTeX (0,7 por nível), três
níveis dão **5,5 px** — ilegível e intocável.

Nenhum CSS satisfaz os dois. Então, por escrito:

1. **Nada encolhe.** Toda peça tem o mesmo corpo em qualquer nível. Fica tipograficamente tosco
   — e é a troca certa, porque é um rascunho e todo alvo fica tocável.
2. **Alvo maior que o desenho**, por área sensível estendida além da caixa pintada, com empate
   resolvido pelo nó mais profundo.
3. **Profundidade máxima de 3 níveis de estrutura.** Envolver além disso é recusado, com aviso.
   Isso torna o layout dimensionável e deixa a recursão de desenho e de serialização
   trivialmente seguras.
4. **Seleção por navegação, não por precisão de dedo:** o toque pega a peça mais próxima, e
   `⬆` / `⇥` movem a seleção na árvore. **É o conserto que de fato resolve**, porque desacopla o
   polegar da profundidade.

**Zoom: não.** _Pinch_ dentro da gaveta disputa com a rolagem e com o toque de seleção — o mesmo
motivo que já baniu o arraste.

### 3.2 Quinze toques é o número que decide se a ferramenta é usada

Montar `2x + 3 = 11` pelo caminho ingênuo — dois toques por átomo, buraco e peça — dá **15
toques**. A caneta escreve essa linha em três segundos; numa pilha de oito linhas seriam ~100
toques por exercício. **Uma Fase 1 entregue completa e abandonada é o pior desfecho possível, e
é o único que nenhum teste pega.**

Três atalhos derrubam isso para **~9**, e os três **entram na Fase 1**:

- **`▢x`** (seção 2.4): −3 toques;
- **encaixe direto quando há exatamente um buraco na árvore**: a peça entra nele sem o toque de
  seleção. −4 toques, e a melhor relação economia/risco das três;
- **avanço automático para o próximo buraco** depois de encaixar, como campo de código de
  verificação: −2.

Mais a cópia da linha anterior (seção 2.5), que resolve todas as linhas após a primeira.

**Nenhum dos três escolhe peça nem preenche buraco** — todos movem o foco. A régua da seção 1
continua intacta, e isto está escrito aqui para que ninguém os corte em nome do princípio.

---

## 4. Fase 1 — a entrega mínima que resolve o avião

**4.0 Primeiro, medir — dois números, não um.** Num iPhone real: quanta altura sobra abaixo do
cabeçalho com as barras do Safari visíveis, **e** qual o menor corpo de peça ainda tocável com o
polegar. É o segundo que confirma ou derruba a profundidade máxima de 3.

Depois, com **cinco tipos de nó apenas** — número, `x`, as quatro operações, fração,
igualdade:

- o modelo da árvore e as três ações, com as regras de 2.3;
- o tabuleiro recursivo, com peças tocáveis, sem encolher, até 3 níveis;
- a bandeja, com `▢x`, `⬆`, `⇥`, `⇄` e `⌫`;
- os dois atalhos de toque (encaixe direto, avanço automático);
- a pilha de linhas com cópia da anterior;
- a gaveta em tela cheia, só no celular;
- **em paisagem, a gaveta diz «vire o aparelho»** — cinco linhas, e honesto: ali sobram ~390 px
  de altura e o layout de duas colunas é da Fase 2;
- persistência por tópico com chave versionada e validação na leitura;
- i18n (~60 chaves, contando rótulo falado por nó);
- testes.

**`√`, `^` e a conta armada ficam de fora.** São as peças cujo desenho custa mais — o telhado do
radical não estica, o sobrescrito reabre a decisão de escala de 3.1 — e as menos usadas para
isolar `x`, que é o caso declarado. **Desfazer** também sai: com trocar e apagar existindo, uma
pilha genérica de estados é item autônomo.

---

## 5. O que ficou para depois, e por quê

### 5.1 Conferir se o passo manteve a igualdade — Fase 3

A intenção era um botão dizendo se a última linha ainda equivale à primeira, por
`simbolicasEquivalentes`. Ela **não funciona como estava escrita**:

1. **`analisarSimbolica` não conhece `=`.** `primario()`
   (`core/treino/resposta-simbolica/resposta-simbolica.ts:253-304`) não tem regra para o sinal,
   `normalizar` (`:317-345`) não o trata, e `compilar` (`:306-315`) só aceita a árvore se
   consumir o texto inteiro. Logo `analisarSimbolica('2x + 3 = 11')` devolve `null` — e linhas
   de passo são **equações**.
2. **O conserto óbvio também erra.** Passar tudo para a esquerda dá `2x−8` e `x−4`:
   proporcionais, não iguais, e `simbolicasEquivalentes` (`:99-119`) compara ponto a ponto —
   responderia «não bateu» a um passo **correto**.

E mesmo consertado, mentiria numa classe grande de passos legítimos: `Simbolica.avaliar` tem
**uma só variável** (`:18-22`), então linha com `y`, `t`, `n`, `θ` ou `dx` sai de alcance — fora
Física, Vetores e boa parte de Cálculo 2 a 4 —, e passo correto não linear dá «não bateu»
(`x² = 4` → `x = 2` tem razão `x+2`, não constante).

**Um verificador que diz «errado» a quem acertou é pior que não ter verificador**, e contradiz o
princípio desta ferramenta. Volta com **três vereditos** — `bateu`, `não bateu` e **`não sei
conferir`**, o terceiro honesto sobre o limite do analisador.

**A árvore ajuda:** `paraTexto(no)` dá o texto que o analisador **que já existe** lê, então
basta partir no `=` e chamar `analisarSimbolica` nos dois lados — sem segundo motor matemático,
que é o princípio escrito no README.

> **Aviso para quem implementar isso:** `formula.ts:53-56` chama `bypassSecurityTrustHtml` sob o
> comentário «o LaTeX vem do código do projeto, nunca de texto digitado pelo usuário». Não passe
> `paraTexto` nem TeX derivado da árvore do aluno para `<app-formula>` só para «mostrar a linha
> bonita» — o tabuleiro já a desenha, e essa frase no código não deve ser violada.

**Consequência boa:** sem conferência não há o que configurar, e cai **todo** o trabalho na tela
de configurações — que não é genérica: a lista de blocos é literal
(`features/configuracoes/configuracoes.ts:95`) e a caixa de seleção está presa ao texto
`'ativa'` (`configuracoes.html:26`). Também cai `rascunho.ativo`, que duplicava
`rascunhoPermitido`.

### 5.2 Os números do enunciado vindos prontos — Fase 3

Decidido: bandeja só com algarismos. Trazer `[487]` pronto exige um serviço de root novo, porque
**não existe de onde ler o enunciado atual**:

- a `SessaoTreino` nasce num **`computed` local** de
  `shared/components/area-treino/area-treino.ts:72`, com `untracked`;
- o enunciado é outro `computed` local (`area-treino.ts:209-211`);
- há **três** consumidores independentes: `area-treino`, `features/prova/prova.ts` e
  `features/surpresa/surpresa.ts`;
- e a gaveta vive no `shell.html`, **fora** do `<router-outlet />` (`shell.html:148`).

Acrescentar depois não refaz nada: a bandeja ganha uma fileira.

---

## 6. O tabuleiro — o maior item, e suas três armadilhas

O modelo puro é rápido e direto. **O tabuleiro é maior que modelo, ações, bandeja e persistência
somados**, e o custo está nos últimos 20%:

1. **Alinhamento pelo eixo, não pela linha de base.** Numa linha, os operandos alinham pela
   _barra da fração_. `inline-flex` com centralização resolve um nível; com `a/b` ao lado de
   `(a/b)/(c/d)` as barras deixam de coincidir. Layout matemático de verdade carrega altura e
   profundidade por caixa — é o que o KaTeX faz. Em CSS puro a aproximação é aceitável, e fica
   **declarada aqui** para não virar relatório de bug.
2. **Escala por nível** — resolvida em 3.1: nada encolhe.
3. **Anel de foco.** `@include foco-visivel` (`shared/styles/_mixins.scss:5-9`) tem
   `outline-offset: 2px`, e dentro de uma árvore apertada isso é mais pressão sobre o espaço de
   3.1. Precisa ser contado no desenho, não descoberto depois.

**Recursão por `ng-template` + `ngTemplateOutlet` dentro de um único componente**, como
`assistente-dialog.html` já faz — não por um componente que se importa a si mesmo. Mantém OnPush
simples e evita a auto-importação em standalone.

**Acessibilidade.** O tabuleiro é uma árvore interativa: `role="tree"` / `treeitem` com
`aria-selected`, e rótulo falado por nó («numerador da fração: 3»). O padrão da casa é alto —
`barra-fracao.html:1` tem `role="img"` com descrição falada, e `shell.html` e `folha.html` têm
rótulo em tudo. É isto que põe as chaves de i18n em ~60, não ~40.

---

## 7. Persistência — divergindo da folha, de propósito

`FolhaService` guarda os traços **só em memória**, e a razão está escrita lá
(`core/folha/services/folha.service.ts:38-48`): um rascunho à mão são milhares de pontos.

Aqui é o contrário: uma árvore de peças são **bytes**, e serializa em JSON sem esforço — é a
forma em que ela já vive. E o cenário é o avião, onde o Safari do iOS descarta aba em segundo
plano; perder oito linhas de conta para o gerenciador de memória é o pior resultado possível.

Então persiste em `localStorage`, **por tópico**, com **chave versionada**
(`estudos-matematicos.rascunho.v1`, no padrão de `folha.service.ts:3` — obrigatório, porque o
formato da árvore vai crescer entre as fases) e:

- **Seleção por caminho, não por id.** A seleção é a lista de índices desde a raiz (`[0,1,0]`),
  e o nó **não** guarda ponteiro para o pai: sem ciclos, serialização mínima, e nada de ids
  duplicados quando a linha é copiada. Em troca, toda edição invalida o caminho — então **cada
  ação devolve `{ arvore, selecao }` juntos**.
- **Nós imutáveis**, com `readonly`, como o resto do projeto (`configuracao.model.ts:11-22`,
  `folha.service.ts:11-23`). Logo compartilhar referência entre a linha copiada e a original é
  inofensivo e desejável — ver a correção de teste na seção 8.
- **Validação na leitura.** `JSON.parse` de união discriminada volta `unknown`; é preciso um
  `validarArvore` no espírito de `validar` da configuração
  (`core/configuracao/models/configuracao.model.ts:202-223`) e de `carregar` da folha
  (`folha.service.ts:112-132`), que validam campo por campo e trocam por padrão o que não fizer
  sentido.
- **Teto com regra de estouro escrita:** ≈8 KB por tópico, 5 tópicos mais recentes. Ao estourar,
  **recusa-se a gravar e avisa-se**, mantendo o que está em memória — descartar a linha mais
  antiga apagaria o ponto de partida da conta.

**Quando chega exercício novo no mesmo tópico**, o rascunho anterior fica na tela marcado como
«da questão anterior» e some com um toque — perder a conta por engano é pior que vê-la sobrando.

Da folha reaproveita-se o que é de serviço, não de desenho: `carregar`/`salvar` com `try/catch`
para janela privada (`folha.service.ts:112-140`), o `effect(() => salvar(…))` (`:62-64`) e a API
`limpar()` / `vazia` (`:102-109`). **Do componente da folha, nada** — é canvas, `PointerEvent` e
janela flutuante arrastável.

---

## 8. Testes

- **Modelos (puros, sem `TestBed`):** encaixar peça em buraco; **envolver** põe a selecionada no
  primeiro buraco e preserva o resto da árvore; `⇄` troca os lados de `−` e `÷`; `=` é recusada
  fora da raiz e na raiz que já é igualdade; envolver além de 3 níveis é recusado; número
  acumula algarismos e fecha a composição ao sair; cada ação devolve `{ arvore, selecao }`
  coerentes; **editar a linha copiada não altera a anterior** (a propriedade que importa com nós
  imutáveis — a versão anterior deste plano pedia «não compartilhar referência», que só faria
  sentido com nós mutáveis); serialização com teto, regra de estouro e `validarArvore`
  recusando lixo.
- **Serviço:** persiste e volta; troca de tópico não mistura rascunhos; `localStorage` que lança
  não derruba nada — o padrão de `FolhaService`.
- **Componente:** tocar na peça a seleciona; tocar na bandeja encaixa ou envolve conforme a
  seleção; `⬆` e `⇥` andam na árvore; com exatamente um buraco a peça entra direto; **não existe
  `<input>` editável** no tabuleiro, logo o teclado do sistema nunca é convocado; não aparece
  fora do celular.
- **Guardas:** nenhum caminho escreve no campo de resposta; nenhum buraco nasce preenchido;
  nenhuma peça composta (do tipo «divida por 2») existe na bandeja.
- A suíte inteira verde, mais `npm run verificar:geradores`.

**O que os testes não cobrem, e precisa de aparelho:** se a gaveta e a bandeja cabem na tela (o
Vitest com jsdom não faz layout), qual o menor corpo tocável, e se nove toques por linha
incomodam na prática. Começa em 4.0.

---

## 9. Arquivos

| Arquivo                                                   | O quê                                                                                                                                                                                                                                             |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core/rascunho/models/peca/peca.ts`                       | **TS puro**: os cinco tipos de nó da Fase 1 — buraco, número, incógnita, operação, fração, igualdade — todos `readonly`.                                                                                                                          |
| `core/rascunho/models/montagem/montagem.ts`               | **TS puro**: encaixar, envolver, apagar, virar os lados, andar na árvore; as regras de 2.3; devolve `{ arvore, selecao }`. O coração, e onde ficam os testes de verdade.                                                                          |
| `core/rascunho/models/linhas/linhas.ts`                   | **TS puro**: a pilha de linhas e a cópia da anterior.                                                                                                                                                                                             |
| `core/rascunho/models/guarda-rascunho/guarda-rascunho.ts` | **TS puro**: serialização, `validarArvore`, teto e regra de estouro.                                                                                                                                                                              |
| `core/rascunho/services/rascunho.service.ts`              | Estado: aberto, seleção, rascunho por tópico, persistência.                                                                                                                                                                                       |
| `shared/components/rascunho/`                             | A gaveta.                                                                                                                                                                                                                                         |
| `shared/components/rascunho-tabuleiro/`                   | A árvore desenhada, recursiva por `ngTemplateOutlet`, cada peça tocável.                                                                                                                                                                          |
| `shared/components/rascunho-bandeja/`                     | As peças.                                                                                                                                                                                                                                         |
| `core/dispositivo/services/dispositivo.service.ts`        | `rascunhoPermitido = computed(() => this.ehCelular())`.                                                                                                                                                                                           |
| `layout/shell/shell.html` + `shell.ts`                    | Botão no cabeçalho, `@defer` no arranjo de `shell.html:160-172`, e os `inject`/`imports` de `shell.ts:39-59`.                                                                                                                                     |
| `layout/shell/shell.scss`                                 | Corrigir o comentário do bloco `.prova-surpresa`: ele diz que «no celular o cabeçalho já carrega cinco botões», e está desatualizado — lá sobram menu, marca, tema e idioma, porque assistente, folha e calculadora todos se escondem no celular. |
| `core/i18n/dicionarios/{pt,fr,en}.json`                   | Chaves `rascunho.*` (~60, com rótulo falado por nó) e `npm run gerar:chaves`.                                                                                                                                                                     |

**Zero** alterações em `area-treino`, `prova`, `surpresa` e na tela de configurações.

---

## 10. O que o celular decide, e as ressalvas

`rascunhoPermitido = ehCelular()` é confiável
(`core/dispositivo/services/dispositivo.service.ts:42-50,93-117`), com quatro coisas a
registrar:

- **iPad que se diz Mac: já tratado.** `ehIpad` usa `maxTouchPoints > 1` (`:115`) e
  `menorLado >= 600` o manda para `'tablet'` (`:49`). O iPad nunca recebe o rascunho — correto,
  lá existe a folha à mão livre.
- **Paisagem.** `menorLado` não muda ao girar (`:112`), então o celular deitado continua
  `'celular'` — com ~390 px de altura. Na Fase 1 a gaveta pede para virar o aparelho; as duas
  colunas são da Fase 2.
- **Teclado acoplado ao vivo.** Com `pointer: fine` o tipo vira `'computador'` (`:45-47`), e há
  listener de `change` no `matchMedia` (`:90`) — a gaveta pode **desmontar com conteúdo
  dentro**. Com a persistência da seção 7 nada se perde, e o `@defer` não deve apagar o
  rascunho.
- **Atrito de desenvolvimento.** Estreitar a janela no Mac dá `'computador'`, não `'celular'`:
  não há como ver o rascunho redimensionando o navegador. Os testes de componente vão dublar o
  `DispositivoService`, e a conferência visual exige aparelho real ou emulação de toque.

---

## 11. Fases

**Fase 1** — medir os dois números; modelo da árvore com cinco tipos de nó e as três ações;
tabuleiro recursivo sem encolher até 3 níveis; bandeja com `▢x`, `⬆`, `⇥`, `⇄`, `⌫`; encaixe
direto e avanço automático; pilha com cópia da anterior; gaveta em tela cheia, só no celular,
pedindo para virar o aparelho em paisagem; persistência versionada com validação; i18n; testes.

**Fase 1.5** — `√`, `^` (com a decisão de `(2x)^▢` contra `2x^▢`), desfazer genérico.

**Fase 2** — conta armada de `+` e `−` (grade de buracos com linha do «vai um»), depois `×`
(produtos parciais deslocados) e `÷` (chave, descidas, restos). Layout de duas colunas para a
paisagem.

**Fase 3** — serviço «exercício em foco», e com ele os números do enunciado na bandeja e o
enunciado condensado no topo da gaveta; conferência com três vereditos, e aí sim o grupo
`rascunho` em Configurações.

**Fase 4** — tabela de valores `x | f(x)`; eixo de estudo de sinal; **tira de fatoração** — a
grade da divisão simultânea **vazia**, em que o aluno escolhe os divisores, ao contrário da
calculadora, que entrega MMC e MDC prontos.

---

## 12. O histórico do plano

1. **O mecanismo.** A v1 tinha um **teclado** e o aluno digitando algarismos em células. Mas
   teclado é escrever, e escrever é o que o celular não permite. Agora é encaixe de peças.
2. **O conversor de texto para TeX desapareceu** — era uma fase inteira da v1; com árvore, o
   problema não existe.
3. **`inputmode="none"` saiu** — instável no Safari; sem `<input>`, o teclado do sistema não tem
   como aparecer.
4. **A conferência saiu da Fase 1** (5.1): o analisador não aceita `=`, e o conserto óbvio daria
   falso negativo em passo correto. Com ela caiu todo o trabalho em Configurações.
5. **O enunciado fixo saiu da Fase 1** (5.2): exigiria serviço novo e mexer em três telas.
6. **A «meia tela» saiu**, e entrou «medir antes de desenhar» — agora com **dois** números.
7. **A geometria virou decisão escrita** (3.1): nada encolhe, profundidade máxima 3, alvo maior
   que o desenho, seleção por navegação. A v3 não reconhecia que alvo tocável e aninhamento se
   excluem.
8. **Os toques foram contados** (3.2): 15 para a primeira linha, o que decide se a ferramenta é
   usada. `▢x`, encaixe direto e avanço automático entraram na Fase 1 por causa disso, e a cópia
   da linha anterior virou o caminho principal.
9. **Envolver ganhou regras** (2.3): não comutativas com `⇄`, `=` só na raiz, parêntese
   desenhado pela precedência em vez de peça, `−` como dois nós, número acumulando algarismos.
10. **`√`, `^` e a conta armada saíram da Fase 1** — são o desenho mais caro e o menos usado
    para isolar `x`.
11. **A modelagem ficou explícita** (7): seleção por caminho, nós imutáveis, `validarArvore`,
    regra de estouro — e um teste da v3 estava cobrando a coisa errada.
12. **O tabuleiro foi reconhecido como o maior item** (6), com alinhamento pelo eixo,
    acessibilidade de árvore e anel de foco orçados.
13. **Voltou o contrapeso do princípio** (1): a ferramenta faz sim algo sozinha — desenha a
    estrutura —, e dizer isso é o que autoriza o parêntese automático.
14. **Caiu a premissa de que o cabeçalho do celular estava cheio** — está vazio, e há um
    comentário desatualizado em `shell.scss` a corrigir.

---

## 13. O que isto não resolve

- Gráficos à mão: esboçar uma parábola no celular continua fora de alcance. A aba **Explorar**
  já desenha, e ela não precisa de rascunho.
- Geometria com figuras: um triângulo rabiscado com medidas é coisa de tablet, onde a folha à
  mão livre já existe.
- Conta muito longa: nove toques por linha cansam mais que nove traços de caneta. O monta monta
  resolve o avião; não substitui o caderno em casa.
- Notação tipograficamente perfeita: nada encolhe e o alinhamento pelo eixo é aproximado. É
  rascunho, não livro.
- O computador e o tablet não mudam em nada: lá o papel, a folha e a calculadora continuam como
  estão.

---

## 14. O que a implementação revelou (11/11/2026)

A Fase 1 está no ar. Cinco coisas saíram diferentes do planejado, e vale registrar por quê.

### 14.1 Dois defeitos de desenho que só os testes acharam

**O envolver mirava a peça errada.** Montar `2x` deixa a seleção no `2`; tocar em `+` então
envolvia **o `2`**, produzindo `(2 + 3)x` em vez de `2x + 3`. O teste da contagem de toques
pegou isso na primeira execução, com o resultado `(2 + 311) * x`. Não há conserto automático que
não vire adivinhação: envolver age sobre o que está selecionado, e sair do `2` para o produto é
um toque do aluno — o `⬆`. É o preço de uma regra previsível, e está nos oito toques.

**O `=` sofria do mesmo mal, e aí havia conserto.** Ele era recusado fora da raiz, com aviso.
Mas o lugar do `=` é **único** — ele separa os dois lados da conta —, então não há escolha a
fazer, e exigir que o aluno subisse até a raiz era cobrar um toque por um destino só. Agora ele
acha a raiz sozinho. Isso não é a ferramenta pensando: é a ferramenta não fingindo que há uma
decisão onde não há. A recusa `igualdade-fora-da-raiz` deixou de existir.

### 14.2 O teto de profundidade é só de frações, não de estruturas

O plano dizia «profundidade máxima de 3 níveis de estrutura». Implementando, ficou claro que
isso barraria `2x + 3 = 11` — três estruturas encaixadas e nenhuma fração. O raciocínio
geométrico que motivou o teto era sobre **altura**, e só a fração cresce para cima e para baixo;
soma, produto e igualdade correm na linha e não custam altura nenhuma. Então
`profundidadeVertical` conta apenas frações. Há teste fixando que a equação do caso de uso dá
profundidade zero.

### 14.3 A seleção não se guarda

O plano mandava persistir a árvore, e isso está feito. Mas a seleção, posta no mesmo lugar,
fazia o estado ser relido do disco a cada toque — e voltar à raiz. A seleção é **foco**, da
mesma natureza do cursor num campo de texto: mora num signal próprio, fora do que se guarda, e
recomeça na raiz ao trocar de tópico ou de linha.

### 14.4 Um serviço a mais, por 13 kB

`RascunhoAberturaService` não estava no plano. Ele existe porque o cabeçalho precisa saber se a
gaveta está aberta, e perguntar isso ao `RascunhoService` punha a árvore, as três ações, a pilha
e a guarda do disco no **pacote inicial**: medido, 12,8 kB para todo visitante, inclusive quem
está no computador e nunca verá a ferramenta. Com a pergunta separada, o pacote inicial subiu
apenas 2,8 kB — e esses são o dicionário português, que é empacotado junto por desenho.

Os três avisos de orçamento do build **já existiam** antes desta mudança (medido com o trabalho
guardado: 506,30 kB de base, 509,10 kB agora).

### 14.5 Duas coisas do plano que não foram feitas, e por quê

- **A medição no aparelho (passo 4.0) não aconteceu** — ela depende de um iPhone na mão. Em vez
  de supor um número, a gaveta usa `dvh` e a bandeja tem piso de tecla: o layout se adapta à
  altura que houver. A medição continua valendo, agora como ajuste fino, e é ela que confirma ou
  derruba o teto de três frações.
- **A marca «rascunho da questão anterior» não entrou.** Ela precisa distinguir uma questão da
  seguinte, e isso exige saber o enunciado — justamente o acoplamento que a Fase 1 evita. O
  rascunho é do tópico, e quem quiser recomeçar usa o cesto. A marca volta com o serviço
  «exercício em foco».

### 14.6 O que ficou medido

|                           |                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------- |
| Suíte                     | 201 arquivos, 7.993 testes, verde                                                     |
| Geradores                 | 123 arquivos conferidos                                                               |
| Build                     | passa; pacote inicial 509,10 kB (base: 506,30)                                        |
| Toques para `2x + 3 = 11` | 8, com teste que os conta                                                             |
| Arquivos novos            | 5 de modelo e serviço, 3 de componente, 6 de teste                                    |
| Tocados                   | `DispositivoService`, `shell` (`.ts`/`.html`/`.scss`), 3 dicionários, `chaves-usadas` |
| Não tocados               | `area-treino`, `prova`, `surpresa`, tela de configurações                             |

---

## 15. O que a revisão do código corrigiu (11/11/2026)

A Fase 1 passou por uma revisão de código. Três defeitos graves, dois deles reproduzidos pelo
revisor com medição.

### 15.1 A persistência parava de funcionar no segundo tópico

`LIMITE_DE_BYTES` eram 8 kB e valiam para **a gravação inteira**, não por tópico — enquanto
`LIMITE_DE_TOPICOS` prometia cinco tópicos guardados. Medido: um tópico com as 20 linhas
permitidas ocupa perto de 7 kB, ou **82% do teto**; o segundo estourava e a gravação parava
**para todos**. O aluno continuava montando, o disco ficava com a versão velha, e a aba morta no
avião levava tudo — exatamente o acidente que esta persistência existe para evitar.

Pior: a reação era global (não gravar nada) e o controle de quantidade era local (`guardar` já
descartava o sexto tópico). A assimetria não tinha defesa.

Agora o teto são 128 kB — 2,5% de uma cota típica de 5 MB —, e ao estourar **largam-se os
tópicos mais antigos até caber**, o mesmo critério que a contagem já aplicava. `null` ficou
reservado ao caso em que nem o tópico mais recente cabe: aí não se grava nada, porque gravar
uma lista vazia apagaria o rascunho dos outros para registrar o fracasso deste.

O teste antigo usava dado sintético e por isso não viu nada. Agora há um com cinco tópicos de
pilha cheia e equações reais.

### 15.2 Duas igualdades numa linha, em seis toques

`igualdade()` recusava só quando **a raiz** já era igualdade, mas envolver era permitido sobre
qualquer nó. Então: `2 = 3`, tocar no sinal `=` (que seleciona a raiz **em um toque**), envolver
em `+` — e a raiz deixava de ser igualdade, liberando o `=` outra vez. Saía `(2 = 3) + ? = ?`,
que não é conta nenhuma, e que a conferência da fase seguinte não saberia tratar.

Dois consertos: envolver recusa quando o alvo é igualdade (recusa nova,
`igualdade-envolvida`), e a contagem de igualdades passou a varrer a árvore toda.

### 15.3 Dois toques apagavam vinte linhas, sem volta

O sinal `=` seleciona a raiz com um toque; o `⌫` logo depois levava a linha inteira. E havia
outros dois caminhos sem volta: o cesto, que joga fora o rascunho do tópico, e o `×` de uma
linha — num alvo de 28 px encostado nas peças. Como o desfazer genérico ficou para depois, não
havia volta de nenhum.

Entrou uma **lixeira de um slot**: apagar com a raiz selecionada, o cesto e tirar uma linha
guardam o estado de antes, e a gaveta mostra um botão de desfazer. Um slot basta, e é melhor que
uma pilha — cobre exatamente o arrependimento imediato. Qualquer alteração seguinte a esvazia,
para que o botão nunca desfaça algo mais antigo do que o aluno espera.

### 15.4 `role="tree"` era pior que papel nenhum

O contêiner anunciava `role="tree"` e não havia um único `treeitem` dentro: para a tecnologia
assistiva, uma árvore **vazia** — a expressão inteira podia desaparecer da navegação. E um
`tree` promete um só ponto de tabulação com setas, enquanto aqui cada peça é um botão tabulável.

Agora é `role="math"` com a conta falada inteira no `aria-label`, que é o padrão da casa — a
barra de fração didática já é `role="img"` com descrição. O `aria-pressed` das peças virou
`aria-current`, porque a seleção é «o item em foco de uma coleção», não um liga/desliga. E a
gaveta ganhou `aria-modal`, que aqui é verdade: ela ocupa a tela toda.

### 15.5 O alvo tocável não era de 44 px, e a barra da fração tinha 14

Todo o argumento geométrico fala de 44 px. O código tinha peças de 36 px mais 4 px de área
sensível por lado: chegava a 44, mas por via de halo — e halos de peças vizinhas se sobrepunham
sobre um vão de 2 px, com o empate indo para a última peça na ordem do documento. Tocar a borda
do `+` podia acertar o número antes dele.

Agora a peça tem 44 px de verdade e não há halo nenhum. E a barra da fração — que é a **única**
alça da fração — deixou de ser um botão de 2 px com 6 de halo: ela tem altura de dedo, com a
linha fina pintada por dentro.

### 15.6 A seleção passou a ser saneada por construção

Trocar de tópico mudava `linhas()` na hora, e o efeito que recomeçava a seleção rodava depois:
havia uma janela de um quadro em que a árvore nova convivia com o caminho antigo, e um toque
nela escreveria no nó errado. O `computed` da montagem agora verifica o caminho contra a árvore,
o que troca um invariante temporal por um estrutural.

### 15.7 As teclas mudas, e as que não cabem

A tela engole a recusa «sem efeito» de propósito, para não virar ruído — e o efeito colateral
era uma bandeja com teclas que simplesmente não respondiam. Agora:

- tecla **muda**, sem nada a explicar (`±` sobre buraco, `⇄` sobre número, `⬆` na raiz): fica
  **desabilitada**, e a regra se vê antes do toque;
- tecla que não cabe **por um motivo** (igualdade repetida, quarta fração): fica **apagada mas
  tocável**, porque botão desabilitado não pode ser tocado e aí o recado nunca apareceria.

A resposta vem de um **ensaio com o próprio modelo** — pergunta-se à ação o que ela faria —,
nunca de uma segunda cópia das regras. Por construção não há como as duas discordarem.

### 15.8 Miudezas da mesma rodada

- `avancarSePreciso` relatava `'sem-efeito'` numa ação **bem-sucedida** quando não havia buraco
  para onde avançar. Invisível na tela, mas `recusa` é API.
- `paraTexto` levava a vírgula pendurada: `5,` virava `5.` na gramática do corretor, que não
  reconhece isso como número — a conferência da fase seguinte diria «não sei conferir» por causa
  de uma vírgula que o aluno ia preencher. Na tela ela continua aparecendo, porque ali é honesto.
- `validarArvore` validava a **forma** e não os **invariantes**: uma árvore vinda do disco podia
  ter sete frações aninhadas, ser desenhada, tomar a tela e travar todo envolvimento sem
  explicação. Agora a leitura também confere profundidade e igualdade única na raiz.
- Linha estragada no disco **virava buraco** em vez de desaparecer: descartá-la renumerava as
  outras e `atual` passava a apontar para outra linha.
- O regex do número aceitava vírgula solta e número vazio.
- `@switch` do tabuleiro ganhou `@default`: quando `√` e `^` chegarem, um caso esquecido vira
  defeito visível em vez de peça invisível.
- O comentário do `@defer` dizia que fechar a gaveta «não a descarrega, e nem poderia». A razão
  real é outra: `@defer (when …)` dispara uma vez e não volta. Corrigido.

### 15.9 O que a revisão apontou e ficou de fora

- **Mostrar na gaveta de que tópico é o rascunho.** Navegar troca o tópico e a conta sai da tela
  — não está perdida, mas parece. Mostrar um nome exige traduzir a chave da URL em título de
  currículo, e isso vai junto com o enunciado no topo, na fase que traz o «exercício em foco».
- **A gaveta cobrir o cabeçalho.** Tela cheia foi escolha minha; o revisor preferia deixar o
  enunciado espiando. Fica como está até a medição no aparelho dizer quanto cabe.
- **Decisão mantida, com apoio:** envolver age sobre a peça selecionada, e montar `2x` e tocar
  `+` exige um `⬆` antes. Qualquer heurística ali seria adivinhação, e a primeira vez que
  adivinhasse errado custaria a confiança na ferramenta inteira.
