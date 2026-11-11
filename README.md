# Estudos Matemáticos

Preparatório interativo para **engenharia aeroespacial**: da matemática básica ao Cálculo 4,
com a física que dá sentido a tudo — gráficos, demonstrações passo a passo e exercícios
corrigidos.

O objetivo é chegar ao primeiro ano de engenharia sem buracos, não formar um engenheiro.

Cada tópico tem a mesma anatomia:

- **Explorar** — mexer nos parâmetros e ver a matemática reagir na hora.
- **Treinar** — resolver exercícios e receber uma correção que diz _onde_ o raciocínio saiu do
  trilho, não apenas que a resposta está errada.

## Como rodar

```bash
npm install
npm start          # http://localhost:4200
npm test           # suíte com Vitest (jsdom)
npm run test:cobertura   # a mesma suíte, com cobertura por arquivo
npm run build      # build de produção
npm run build:pages  # build para o GitHub Pages
npm run gerar:teorias    # reindexa os conceitos (title/tópico/carregador)
npm run gerar:geradores  # reindexa os geradores de exercício
npm run gerar:icones     # redesenha os ícones do aplicativo
npm run verificar:pwa    # service worker e manifesto, num Chrome de verdade
```

`gerar:teorias` e `gerar:geradores` reescrevem índices gerados em `core/`. Rode-os depois de
criar, remover ou renomear um conceito ou um tópico — há testes que falham se o índice sair de
sincronia.

`gerar:icones` exige o `rsvg-convert` (`brew install librsvg`) e `verificar:pwa` exige o Chrome
instalado; nenhum dos dois roda na integração contínua.

### Cobertura

`npm run test:cobertura` imprime a tabela por arquivo no terminal — percentual de instruções,
ramos, funções e linhas, com os números das linhas descobertas — e grava dois relatórios em
`coverage/EstudosMatematicos/`:

- `index.html`: navegável, mostra o código com as linhas não cobertas destacadas;
- `lcov.info`: formato que a extensão Coverage Gutters do VS Code, o Codecov e o SonarQube leem.

Os índices gerados e os catálogos usados só por teste ficam fora da conta (`coverageExclude` em
`angular.json`): são dados, e contá-los só diluía o número.

## Publicação

O site é publicado no GitHub Pages a cada push na `main`, pelo workflow em
`.github/workflows/static.yml`. A suíte roda antes: se um teste falhar, nada vai ao ar.

Duas particularidades do Pages estão resolvidas em `scripts/preparar-pages.mjs`:

- **Rotas diretas.** O Pages não tem servidor que reescreva URLs, então abrir
  `/fisica/propulsao-de-foguetes` na barra de endereços pediria um arquivo inexistente. O
  script copia `index.html` para `404.html`: o Angular recebe o documento e resolve a rota no
  cliente.
- **Underscore.** O Pages passa o conteúdo pelo Jekyll, que descarta arquivos iniciados por
  `_`. O arquivo `.nojekyll` desliga esse processamento.

O `--base-href /estudos-matematicos/` acompanha o nome do repositório; mudar o nome exige
mudar esse caminho no script `build:pages`. O `ngsw.json` nasce com esse prefixo embutido, então
o service worker funciona na subpasta sem ajuste nenhum.

## Versão nova: o aviso

Um service worker guarda a versão em uso e **continua servindo ela** depois de um deploy. A
troca só acontece quando o aluno aceita — e aceitar é recarregar.

A ordem dos motivos importa. O primeiro não é funcionar sem rede, é não quebrar: o Pages apaga
os arquivos com hash a cada publicação, e antes disso uma aba aberta durante um deploy quebrava
ao abrir o próximo tópico — o `chunk-*.js` que ela foi buscar tinha deixado de existir. Com o
cache, ela termina a sessão na versão com que começou. Funcionar sem rede veio junto.

Quando a versão nova termina de baixar, `AtualizacaoService` anuncia e o
`app-atualizacao-dialog` abre: **Reiniciar agora**, ou o X para adiar. Adiar não cancela — os
arquivos novos já estão no disco e entram sozinhos no próximo carregamento.

Há um segundo aviso, de outra natureza. Se o cache ficar inconsistente e a aplicação não
conseguir mais montar um pedaço de si mesma (`UNRECOVERABLE_STATE`), o modal aparece sem X,
sem Esc e sem clique fora: ali não existe "mais tarde", porque a tela por trás dele já não
funciona.

O que ajustar, se precisar:

| Onde | O quê |
| --- | --- |
| `ngsw-config.json` | O que entra em cache. `casca` vem junto na instalação (~375 kB); os 402 `chunk-*.js` dos tópicos e as fontes do KaTeX ficam `lazy`, cada um guardado na primeira visita — prefetch de tudo baixaria 4 MB para quem só quer abrir Frações. |
| `INTERVALO_DE_CHECAGEM` | De quanto em quanto tempo perguntar se saiu versão nova (30 min). Também se pergunta a cada volta para a aba, com piso de 1 min entre checagens. |

Em desenvolvimento o service worker não é registrado — `enabled: !isDevMode()` —, senão o
cache serviria código velho a cada recarga. Para desligar o service worker de um navegador que
já o tenha, o build emite `safety-worker.js`, que se registra no lugar dele e se desfaz.

### Instalar como aplicativo

Com o manifesto e os ícones, o site se instala na tela inicial e abre em janela própria, sem
barra de endereços. `public/manifest.webmanifest` descreve isso; os caminhos dentro dele são
relativos, que é o que mantém a instalação funcionando na subpasta do Pages.

Os onze ícones saem de um desenho só — o mesmo sinal de integral do cabeçalho, sobre o azul de
acento — por `npm run gerar:icones`. O símbolo entra como texto, então o desenho é rasterizado
na geração, com as fontes da máquina: são os PNGs que vão para o repositório, nunca um SVG com
`<text>`, que cada aparelho renderizaria com a fonte que tivesse. Há duas versões do desenho: a
comum, de cantos arredondados, e a *maskable*, de canto reto e símbolo menor — ali quem recorta
é o Android, e um canto já arredondado apareceria cortado duas vezes.

A cor da barra do navegador acompanha o tema, por duas `<meta name="theme-color">` com
`prefers-color-scheme`.

### Verificando antes de publicar

Nada disso cabe na suíte: o `ngsw.json`, o escopo do worker, o `base-href` da subpasta e o
manifesto só existem depois do build, e só um navegador com service worker ligado diz se eles
combinam. `npm run verificar:pwa` constrói para o Pages, serve a saída em
`localhost:8411/estudos-matematicos/` e dirige um Chrome headless pela sequência de um aluno:
abre o site, volta, fica sem rede, e recebe o aviso de versão nova — que ele provoca mudando o
`ngsw.json` da cópia servida, que é o que uma publicação é, do ponto de vista do worker.

## Arquitetura

O princípio central: **a matemática não depende do Angular**. Todo cálculo vive em TypeScript
puro, testável sem `TestBed`, e os componentes apenas apresentam.

```
src/app/
  core/
    math/        motor matemático em TS puro: números, álgebra, geometria, vetores,
                 matrizes, complexos, trigonometria, estatística, cálculo e física
    teoria/      conteúdo dos popups como dado tipado, e o serviço que controla o modal
    treino/      exercícios, RNG com semente, sessão de treino e progresso
    tema/        preferência de tema claro/escuro
  shared/
    components/  math-plot, formula (KaTeX), barra-fracao, area-treino, passo-a-passo…
    styles/      design tokens e mixins
  layout/        shell, sidebar e a moldura de tópico com as abas
  curriculo/     a árvore de áreas e tópicos, com o que já está pronto
  features/      um diretório por tópico, carregado sob demanda
```

### Resolver é devolver a demonstração

Nenhuma rotina do motor devolve só o resultado. Todas devolvem a trilha algébrica junto:

```ts
export interface Resolucao<T> {
  readonly resultado: T;
  readonly passos: readonly Passo[];
}
```

É isso que faz a explicação da aba Explorar e o gabarito comentado do treino serem **o mesmo
código** — eles não têm como divergir.

### Correção que diagnostica

Cada exercício declara as `armadilhas` do tema: os erros clássicos, previstos de antemão.
Quando a resposta coincide com uma delas, o feedback nomeia o equívoco e aponta o passo em que
ele ocorre. Nada de IA — é matemática previsível.

```ts
{
  resposta: Fracao.criar(2, 10),
  diagnostico: 'Você somou numeradores com numeradores e denominadores com denominadores…',
  passo: 3,
  conceito: 'fracoes.operacoes',
}
```

O erro é registrado no nível do **conceito**, não só do tópico, de modo que o painel de
progresso consegue dizer _o que_ revisar e levar direto à teoria correspondente.

## A trilha: um tópico de cada vez

Os tópicos não abrem todos de uma vez. A trilha segue a ordem do currículo, e cada etapa só
libera a seguinte quando o tópico é **dominado**:

- **8 acertos nas últimas 10 tentativas** daquele tópico;
- entre elas, **3 acertos no nível Médio ou Difícil**;
- terminando com **3 acertos seguidos**, para a etapa não abrir logo depois de um erro.

As quatro condições — a quarta é a janela precisar estar cheia — aparecem na área de treino
como lista, com o quanto falta em cada uma. E o placar do topo, que contava só a rodada
(acertos, erros, sequência), ganhou um quarto número: **Falta**, quantas das treze condições —
as quatro mais os nove tipos — ainda não foram cumpridas. Zero significa etapa liberada, e o
`title` lista quais são, para quem não quer rolar até o fim da página. **A sequência final é a única que um erro zera**, e a
lista diz isso ao lado dela: as outras três não zeram, apenas podem cair quando a janela anda e
a tentativa mais antiga sai dela.

**O treino oferece o que falta.** A cada sorteio, a sessão diz ao gerador quais tipos ainda não
foram cumpridos, e ele sorteia só entre eles. Sem isso o sorteio é uniforme, e uniforme basta
para travar a etapa: dá para passar do exigido em `soma` e em `decimal em fração` com
`subtração com mistos` parada, porque o que já estava cumprido continuava aparecendo. Numa
simulação de aluno que acerta sempre, Frações passou a fechar no mínimo possível — nove tipos
vezes os acertos exigidos em cada. A exceção é o que o nível não produz: pedir um misto no Fácil
seria pedir o impossível, então ali o sorteio volta ao normal até o aluno subir.

Mostrar as quatro não é detalhe de interface. Enquanto a tela mostrava duas, quem tinha tudo em
ordem e errava o último exercício via a etapa continuar fechada sem nada explicando por quê —
e a condição que faltava era justamente a que o erro tinha acabado de zerar.

### A ordem vem do plano de estudo

Duas mudanças de sequência vieram do plano de estudo, hoje consolidado em
`avaliacao-estudos-matematicos.md`:

- **Leis de Newton antes de trajetória balística.** Entender as forças antes de descrever o
  movimento que elas produzem é o que permite identificar o que age sobre o projétil, em vez
  de decorar a parábola. Pelo mesmo motivo, estática e torque vem antes de movimento
  harmônico.
- **Sequências e séries saiu do pré-cálculo para o Cálculo 2.** Convergência é assunto de
  limite já construído, e no pré-cálculo ela adiava o que realmente prepara para o Cálculo 1 —
  funções, gráficos e a noção intuitiva de limite. A rota antiga
  (`/pre-calculo/sequencias-e-series`) cai no curinga e volta para a home, sem erro.

## O nível não se escolhe

A dificuldade é consequência do desempenho, não uma opção: começa no Fácil, sobe um degrau a
cada **3 acertos seguidos** e desce um a cada **2 erros seguidos**. Descer importa tanto quanto
subir — insistir num nível que ainda não se sustenta não ensina, só frustra.

Antes havia três botões, e o problema dessa escolha é conhecido: quase ninguém escolhe o
Difícil, e o Fácil não sorteia todos os tipos de questão. Com a escada automática, o conteúdo
mais exigente — em Frações, os números mistos — só aparece para quem chegou lá.

O nível também não é estado novo: `nivelDoTopico` o relê do mesmo histórico de tentativas, então
um refresh devolve o aluno no degrau em que estava.

A janela é deslizante de propósito: o domínio medido é o atual, não o histórico. Errar as
últimas tentativas tranca a etapa de novo.

A janela mede **constância**, não abrangência: dá para acertar dez somas seguidas e nunca ter
dividido uma fração. Onde o tópico tem partes que precisam ser todas praticadas, há uma
exigência de **cobertura** por cima dela, contada por conceito (`REQUISITOS_POR_TOPICO` em
`models/progressao.model.ts`). A área de treino mostra a lista inteira, com o que falta em cada
tipo.

Em Frações são **nove tipos, três acertos em cada** — 27 no mínimo. As quatro operações com
frações, as mesmas quatro com números mistos e a conversão de decimal. Mistos são tipos à parte
porque o erro é outro: o transporte na soma, o empréstimo na subtração, os termos cruzados na
multiplicação (2½ × 1½ tem quatro parcelas, não duas), a ordem de converter e inverter na
divisão. Eram cinco acertos por tipo, o que dava 45 exercícios só de cobertura: garantia a
mesma coisa e cansava mais, então o número desceu para três.

O critério anterior era "3 acertos seguidos", sem olhar o nível — e isso abria a etapa para
quem acerta metade dos exercícios em 79% das rodadas de 20 tentativas. Com o critério atual,
em 15%. **Pedir a resolução conta como tentativa não resolvida**: o campo tranca, a sequência
zera, e o atalho de ler a resposta no último passo deixa de valer ponto.

```
core/progressao/
  models/progressao.model.ts           a trilha derivada do currículo e o critério de domínio
  services/progressao.service.ts       quem está aberto, quem foi vencido, onde o estudo parou
  topico-liberado.guard/               nem pela URL se pula a fila
```

Nada disso guarda estado novo: a conquista é derivada do **histórico de tentativas** — nível,
acerto e desistência — que o `ProgressoService` já registra por tópico no `localStorage`. Um
refresh devolve a trilha exatamente onde ela estava.

O **modo livre**, no painel da página inicial, destranca tudo para consulta sem apagar o
progresso — ele também é lembrado entre sessões.

## A prova surpresa

A prova de fim de área chega anunciada: o aluno vence a última etapa, vê o
convite e escolhe o dia. Ela mede o que ele sabe naquele dia.

A prova surpresa mede outra coisa: **o que ficou**. Ela aparece sem aviso, de
tempos em tempos (`Configurações → Prova surpresa`), e cobra tudo o que já foi
vencido até ali — os tópicos fora do plano ficam de fora, como em todo o resto
do site. Não há contagem regressiva de propósito: saber quando ela vem é o mesmo
que saber o que revisar antes.

O que a torna útil é o que a torna desconfortável:

- **Ela não se adia.** Enquanto está aberta, o guard `semSurpresaAtivaGuard`
  fecha os tópicos, a revisão do dia e a prova de área. Sobram a própria prova,
  a home e as configurações — sem essas portas, um gerador com problema
  prenderia o aluno numa tela sem saída.
- **Ela sobrevive ao refresh.** O `localStorage` guarda o plano, a semente, a
  questão atual e as respostas dadas. Os exercícios são sorteados de novo com a
  mesma semente, porque os geradores são determinísticos — persistir os
  exercícios prontos não funcionaria, já que o gabarito de Frações é uma
  instância de classe e o JSON lhe tiraria os métodos de comparação.
- **Abaixo de 75% (`Configurações`), os tópicos errados voltam a ser exigidos.**
  O histórico deles é apagado — o que trava a trilha naquele ponto — e a
  aprovação da área é revogada, senão ela valeria como «todos os tópicos
  vencidos» e o trancamento não teria efeito. A tranca se desfaz sozinha quando
  o tópico é vencido de novo: é o reestudar que a reprovação exige.

```
core/prova/
  models/prova-surpresa.model.ts     quando ela é devida, o que cobra, a régua
  services/prova-surpresa.service.ts o estado guardado, o trancamento, o resultado
  surpresa.guard/                    o que fecha enquanto ela está aberta
features/surpresa/                   a tela: questão, veredito, resultado
```

## Revisão espaçada

A trilha só anda para a frente. A rota `/revisar` faz o caminho de volta: uma fila diária de
até oito tópicos já vencidos, ordenada por **conceito frágil** (onde os erros se concentram) e
por **tempo sem praticar** — a parte espaçada da revisão. A fila é derivada, não guardada:
responder hoje muda a fila de amanhã.

```
core/revisao/services/revisao.service.ts          como a fila de hoje é escolhida
core/treino/registro-geradores/registro-geradores.ts  índice gerado: cada tópico carrega
                                                      seu gerador sob demanda
```

## Respostas: número, fração, raiz ou expressão

O campo de resposta não aceita só decimais. `core/treino/resposta-numerica/` lê fração
(`3/4`), raiz (`(1+√5)/2`), π, notação científica e separador de milhar, de modo que a forma
exata do gabarito seja sempre digitável — antes, metade das raízes do nível Difícil era
impossível de escrever. E `core/treino/resposta-simbolica/` lê **expressões em x**, para
que um tópico de cálculo possa pedir `f'(x)` e não apenas `f'(2)`; a comparação é por
avaliação em vários pontos, então `6x + 4`, `4 + 6x` e `2(3x + 2)` contam igual.

A correção é **por valor, nunca por forma**: `10/20` vale o mesmo que `1/2` e conta como
acerto, como contam `6/8` para `3/4` e `0,5` para `1/2`. O que o site acrescenta é um recado —
*"Aceita — 10/20 é o mesmo número que 1/2, que é a forma mais simples: divida os dois termos
por 10"* —, porque a forma menor é a que o gabarito mostra e a que deixa a conta seguinte mais
leve. O recado não muda o veredito nem o conceito contado: é sobre a escrita, não uma ressalva
sobre a matemática. Quem respondeu `0,5` não o recebe — apontar termos que ele não escreveu
soaria como erro de leitura.

Cinco travas globais cuidam dessa parte, para os 102 geradores de uma vez
(`core/treino/formato-resposta/`, `shared/components/formula/formulas-do-site.spec.ts`,
`core/teoria/teorias/`):

- o gabarito é aceito na forma em que é exibido, e **toda** escrita que ele exibe é aceita;
- fração equivalente ampliada — `10/20` para `1/2` — nunca vira erro;
- o arredondamento que o enunciado pede é aceito;
- a resolução termina mostrando o gabarito;
- toda fórmula compila no KaTeX e todo id de conceito citado existe;
- enunciado sem fórmula diz tudo em palavras, com os números da conta.

## O assistente local

O botão ao lado da calculadora abre uma janela de conversa ligada a um **LLM rodando na
própria máquina**, pelo [Ollama](https://ollama.com). O dropdown no topo lista os modelos
instalados, com o tamanho de cada um; a escolha e a posição da janela voltam na sessão
seguinte.

**A pergunta vai com a tela junto.** O que está em `<main>` — tópico aberto, enunciado,
resposta dada, veredito — acompanha cada pergunta, cortado em 4 000 caracteres. É o que
torna *"por que isso está errado?"* uma pergunta respondível: sem o contexto, quem responde
não enxerga o "isso". A navegação lateral fica de fora de propósito — ela tem os 75 tópicos
e encheria o contexto com uma lista de links.

A tela entra marcada como **dado, não como instrução**. Ela é gerada por este site, mas a
regra vale de qualquer forma: texto que chega junto do contexto não manda no assistente.

**A conversa fica só em memória.** Ela carrega trechos da tela e dúvidas de estudo; guardar
isso no `localStorage` seria acumular sem que ninguém tivesse pedido. O que persiste é o que
poupa cliques: janela aberta, posição, endereço do servidor e modelo escolhido.

### Para funcionar

O Ollama precisa estar no ar — `ollama serve` — e, se o site estiver aberto pela internet
(GitHub Pages), precisa autorizar a origem:

```bash
OLLAMA_ORIGINS="*" ollama serve
```

Sem isso o navegador recusa a requisição por CORS, e o erro chega à aplicação como um
`TypeError` sem detalhe — indistinguível de "servidor desligado". Por isso o recado na tela
cobre os dois casos e traz o endereço do servidor editável ali mesmo.

### Sem pensar em voz alta

Modelos de raciocínio deliberam antes de responder, e numa máquina de estudo isso é a
diferença entre perguntar e desistir de perguntar. O assistente desliga isso em três
camadas, porque nenhuma delas sozinha cobre todos os modelos:

1. **`think: false` na API.** Modelo que não pensa recusa o campo com 400, e aí a mesma
   pergunta vai de novo sem ele — tentar e recuar sai mais barato que manter uma lista de
   quem suporta o quê.
2. **O rascunho no texto é filtrado.** Há modelo que despeja `<think>...</think>` dentro do
   próprio conteúdo. `semPensamento` o remove, e um bloco **ainda aberto esconde tudo o que
   vem depois**: no meio do fluxo o rascunho chega antes do fecho, e mostrá-lo seria mostrar
   exatamente o que se quer esconder. Enquanto isso, o cursor piscando diz que algo vem.
3. **As instruções pedem resposta direta** — sem preâmbulo, sem repetir a pergunta, sem
   narrar o que vai fazer antes de fazer.

### A resposta é lida como Markdown

Um modelo responde com títulos, listas e negrito, e mostrar isso como uma string corrida
joga fora justamente a estrutura que torna a explicação legível. `interpretar` lê o pouco de
Markdown que um tutor usa: título, lista (numerada ou não), bloco de código, negrito,
itálico, código na linha — e as quatro formas de escrever matemática.

**A matemática sai primeiro**, de propósito: dentro de `$a_1 * b_2$` há asteriscos e
sublinhados que são notação, não negrito. Só o que sobra passa pelo leitor de marcação.

E nada vira HTML: cada bloco é um dado que o template desenha com os elementos dele.
Resposta de modelo é texto de terceiro, e injetar `innerHTML` com ela seria abrir uma porta
que não precisa existir — não há biblioteca de Markdown no projeto, nem sanitização a
manter.

### O tamanho é do aluno

A janela tem alça no canto (`resize: both`) e o tamanho volta na sessão seguinte. Quem manda
nele é o navegador: o valor guardado é aplicado uma vez, quando a janela nasce, e daí em
diante um `ResizeObserver` só anota onde a alça parou. Se o template também escrevesse
largura e altura, os dois brigariam a cada arrasto.

A resposta chega em **fluxo**, pedaço a pedaço: um modelo local leva dezenas de segundos
para uma resposta inteira, e ver o texto nascer é a diferença entre esperar e achar que
travou. O botão vira **Parar** enquanto ela chega. Fórmulas entre cifrões são desenhadas
pelo KaTeX — um tutor de matemática responde com matemática, e `\frac{1}{2}` como texto
cru não ajuda ninguém.

Some abaixo de 60rem, como a calculadora, e aqui não é só espaço: `localhost:11434` visto do
celular é o próprio celular, onde não há servidor nenhum.

## A calculadora flutuante

O botão no cabeçalho abre uma calculadora que **não é um modal**: ela flutua, arrasta pela
barra do topo e fica onde foi deixada — posição, modo e unidade de ângulo voltam na sessão
seguinte. Dois modos: **básica**, quatro colunas como a do iPhone, e **científica**, que
acrescenta uma ala de três colunas à esquerda em vez de abrir outra janela.

Três decisões que valem registrar:

- **O visor mostra a conta inteira, não só o número.** É a diferença em relação à do iPhone, e
  é de propósito: num site que ensina a ordem das operações, esconder que `2 + 3 × 4` dá 14 e
  não 20 seria trabalhar contra o conteúdo.
- **O avaliador não é novo.** `avaliarExpressao` é o mesmo analisador que lê as respostas do
  treino — mesmas funções, mesmas constantes, mesma recusa a usar `eval`. Um segundo motor
  seria uma segunda gramática para manter e, pior, uma calculadora que concorda com uma conta
  que o campo de resposta recusa.
- **RAD e GRAU.** O motor trabalha em radianos, que é o que o Cálculo pede; metade deste site
  — trajetória, torque, vetores — fala em graus. No modo GRAU, `emGraus` reescreve `sin(A)`
  como `sin((A)·π/180` antes de avaliar, pelo parêntese correspondente e não por regex: em
  `sin(30+60)` o ângulo é a soma inteira, e converter só o 30 daria um número errado que
  continua parecendo plausível.

`cos(90°)` mostra `0`, e não `6,12·10⁻¹⁷`: abaixo de 10⁻¹², o resultado de uma conta **com
trigonometria** é a poeira de π não caber num `double`. O corte vale só nesse caso — em Física,
6,6·10⁻³⁴ é a constante de Planck, não ruído.

A terceira aba faz **MMC e MDC** de dois ou mais inteiros escritos separados por vírgula — ali
a vírgula separa números, e não casas decimais, porque as duas contas só existem entre inteiros.

Junto do resultado vem a **divisão simultânea**, linha a linha, que é o método da escola e o
único que dá as duas respostas de uma vez:

```
12  18  24 │ 2   ← coube em todos
 6   9  12 │ 2
 3   9   6 │ 2
 3   9   3 │ 3   ← coube em todos
 1   3   1 │ 3
 1   1   1
```

O **MMC é o produto de toda a coluna da direita** (2³·3² = 72); o **MDC, só das linhas em que o
divisor coube em todos os números** (2·3 = 6) — e são essas que a tela destaca quando o MDC está
escolhido. A linha de montagem sai de `fatoracaoParaTexto` aplicada ao próprio resultado: por
construção, ela é o produto dos divisores que o formaram, então não há como a tabela e a
resposta discordarem.

O zero é recusado de propósito — mdc(0, n) = n e mmc(n, 0) = 0 são verdades inúteis para quem
está aprendendo o que as contas significam.

Ela **some abaixo de 60rem**, a mesma largura em que a navegação lateral vira menu: num celular
cobriria justamente o exercício que existe para ajudar a resolver. E só é baixada quando alguém
a abre pela primeira vez (`@defer` no shell), porque traz o analisador junto.

### Ler e escrever notação

**Notação matemática** é um tópico de duas mãos, e nenhuma delas é múltipla escolha.

**Ler vira conta**: quem entende `\sum_{k=1}^{4} k^2` chega a 30, e quem não entende não chega.
Pedir o valor em vez da tradução em palavras tem uma vantagem que múltipla escolha não tem —
não há como acertar por eliminação. **Escrever revela se a leitura é real**: reconhecer `∀`
numa página é fácil, decidir que a frase pede `∀`, `∈` e `≥` nessa ordem exige saber o que
cada símbolo faz.

A correção cobra conteúdo, não digitação: `canonizarNotacao` reduz `\forall x \in \mathbb{R},
x^{2} \geq 0`, `∀x∈R, x^2 >= 0` e `∀x ∈ ℝ: x² ≥ 0` à mesma forma. O `R` solto só vira `ℝ`
depois de `∈`, `⊂` ou `→` — numa fórmula de física, `R` é resistência.

E o campo de resposta ganhou uma **paleta de símbolos**, porque `∀`, `∈` e `∑` não estão no
teclado de ninguém: sem ela o tópico pediria o impossível. Algumas teclas inserem um símbolo
solto, outras um esqueleto com o cursor onde falta preencher — `f()`, `| |`, `∑_{k=1}^{n}`. É um
campo opcional do `GeradorExercicio`: quem não declara nada segue com o campo de sempre.

### Quando a fórmula é a resposta

`enunciadoTex` pode vir como `SEM_FORMULA`, e aí a tela mostra só o texto. Não é exceção
técnica, é pedagógica: em **Razão e proporção**, no Difícil, decidir se as grandezas são
direta ou inversamente proporcionais e montar a proporção é a tarefa — exibir
`a \cdot b = c \cdot x` ao lado do enunciado responderia a pergunta antes dela ser feita. A
fórmula reaparece na resolução, depois da resposta.

É string vazia, e não `undefined`, para que o campo continue obrigatório: omitir a fórmula tem
de ser uma escolha escrita, não um esquecimento. E uma trava global cobre o resto — sem
fórmula, o enunciado precisa trazer os números da conta, ou o exercício fica impossível em vez
de difícil.

### A mesma calculadora no iPhone

`CalculadoraMatematica/` é um segundo projeto Angular, dentro deste repositório, que empacota
a calculadora com Capacitor e Ionic para rodar como aplicativo nativo no iPhone. Ele não entra
no build do site: a compilação e os testes daqui olham só para `src/`, e o Pages publica
apenas `dist/`.

O núcleo da conta — `avaliarExpressao`, MMC e MDC, a fatoração por produto e soma — é **cópia
literal** dos arquivos de `src/app/core/`, não um segundo motor. A cópia é o preço de não
publicar um pacote npm para dois projetos de um autor só; o README de lá lista arquivo por
arquivo o que veio daqui, para que a recópia continue sendo um `cp`. O que é só do telefone —
o menu lateral, o teclado que não fecha, o modo **Decimal em fração** — vive lá e nunca aqui.

## Convenções

- Standalone em tudo, `ChangeDetectionStrategy.OnPush`.
- **Zoneless**: não há `zone.js`. Todo estado passa por signals (`signal`, `computed`, `model`).
- `input()` / `output()` / `model()` e `inject()`, nunca decoradores.
- Novo control flow (`@if`, `@for` com `track`, `@switch`).
- Template e estilo em arquivos separados: `.ts` / `.html` / `.scss`.
- Imports por alias — `@core`, `@shared`, `@features`, `@layout`, `@curriculo` — nunca `../../`.
- **Uma pasta por arquivo**, com o nome do arquivo: `core/treino/rng/rng.ts`, ao lado do seu
  `.spec.ts`. O barril `index.ts` é a exceção — ele é a porta da pasta e fica na raiz dela.
- **Serviços e modelos vão para pastas de papel dentro do próprio domínio**: `services/` e
  `models/`. Quem usa não precisa saber onde o arquivo mora, porque o alias aponta para o
  domínio: `@core/teoria/services/teoria.service`, `@core/treino/models/treino.model`.
- Nomes de domínio em português (`Fracao`, `Resolucao`, `Passo`); APIs do framework em inglês.
- Estilos usam os tokens de `shared/styles`; `@use 'mixins' as *;` resolve sem caminho relativo.

## Acrescentando um tópico

Todos os tópicos do currículo estão implementados. Para acrescentar um novo, declare-o em
`curriculo/curriculo.ts` na posição certa da ordem de aprendizagem e então:

1. Ponha a matemática em `core/math/` — nunca na pasta do tópico, para que outros tópicos
   possam reaproveitá-la.
2. Crie `<topico>.ts` / `.html` / `.scss` dentro de `<app-topico-layout>`.
3. Escreva `<topico>.teoria.ts` com os conceitos dos popups.
4. Escreva `<topico>.gerador.ts` implementando `GeradorExercicio`, com as armadilhas do tema.
5. Registre a rota no `<area>.routes.ts` e marque `pronto: true` em `curriculo/curriculo.ts`.

## Estado atual

**Os 102 tópicos do currículo estão implementados**, nas catorze áreas, na ordem de
aprendizagem. As duas últimas — Cálculo 3 e Cálculo 4 — são a quarta etapa do plano de
estudo, aquela que costuma acontecer já dentro da graduação. O campo `pronto` continua no
currículo: ele é o que torna visível, na navegação, qualquer tópico novo que entre no plano
antes de ser escrito.

| # | Área | Tópicos |
|---|------|---------|
| 1 | Matemática básica | 8 |
| 2 | Álgebra | 8 |
| 3 | Geometria plana e espacial | 5 |
| 4 | Funções | 12 |
| 5 | Trigonometria | 6 |
| 6 | Vetores e matrizes | 5 |
| 7 | Geometria analítica | 4 |
| 8 | Física | 17 |
| 9 | Pré-cálculo | 2 |
| 10 | Cálculo 1 | 11 |
| 11 | Cálculo 2 | 9 |
| 12 | Combinatória e estatística | 5 |
| 13 | Cálculo 3 | 6 |
| 14 | Cálculo 4 | 4 |

A área de Física fecha com **propulsão de foguetes**: a equação de Tsiolkovsky, onde logaritmo,
conservação de momento, gases e gravitação se encontram.
