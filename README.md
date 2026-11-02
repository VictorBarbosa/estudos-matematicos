# Estudos Matemáticos

Preparatório interativo para **engenharia aeroespacial**: da matemática básica ao Cálculo 2,
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
como lista, com o quanto falta em cada uma. **A sequência final é a única que um erro zera**, e a
lista diz isso ao lado dela: as outras três não zeram, apenas podem cair quando a janela anda e
a tentativa mais antiga sai dela.

**O treino oferece o que falta.** A cada sorteio, a sessão diz ao gerador quais tipos ainda não
foram cumpridos, e ele sorteia só entre eles. Sem isso o sorteio é uniforme, e uniforme basta
para travar a etapa: dá para chegar a `soma 9/5` e `decimal em fração 10/5` com `subtração com
mistos` parada em 3/5, porque o que já estava cumprido continuava aparecendo. Numa simulação de
aluno que acerta sempre, Frações caiu de **77 para 45 exercícios** — que é o mínimo possível,
nove tipos vezes cinco acertos. A exceção é o que o nível não produz: pedir um misto no Fácil
seria pedir o impossível, então ali o sorteio volta ao normal até o aluno subir.

Mostrar as quatro não é detalhe de interface. Enquanto a tela mostrava duas, quem tinha tudo em
ordem e errava o último exercício via a etapa continuar fechada sem nada explicando por quê —
e a condição que faltava era justamente a que o erro tinha acabado de zerar.

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

Em Frações são **nove tipos, cinco acertos em cada** — 45 no mínimo. As quatro operações com
frações, as mesmas quatro com números mistos e a conversão de decimal. Mistos são tipos à parte
porque o erro é outro: o transporte na soma, o empréstimo na subtração, os termos cruzados na
multiplicação (2½ × 1½ tem quatro parcelas, não duas), a ordem de converter e inverter na
divisão. É muito de propósito: frações é o tópico cuja falha mais atrapalha adiante.

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

Cinco travas globais cuidam dessa parte, para os 75 geradores de uma vez
(`core/treino/formato-resposta/`, `shared/components/formula/formulas-do-site.spec.ts`,
`core/teoria/teorias/`):

- o gabarito é aceito na forma em que é exibido, e **toda** escrita que ele exibe é aceita;
- fração equivalente ampliada — `10/20` para `1/2` — nunca vira erro;
- o arredondamento que o enunciado pede é aceito;
- a resolução termina mostrando o gabarito;
- toda fórmula compila no KaTeX e todo id de conceito citado existe.

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

**Os 75 tópicos estão implementados**, nas doze áreas do currículo, na ordem de aprendizagem:

| # | Área | Tópicos |
|---|------|---------|
| 1 | Matemática básica | 8 |
| 2 | Álgebra | 9 |
| 3 | Geometria plana e espacial | 5 |
| 4 | Funções | 8 |
| 5 | Trigonometria | 6 |
| 6 | Vetores e matrizes | 4 |
| 7 | Geometria analítica | 3 |
| 8 | Combinatória e estatística | 3 |
| 9 | Física | 12 |
| 10 | Pré-cálculo | 3 |
| 11 | Cálculo 1 | 8 |
| 12 | Cálculo 2 | 6 |

A área de Física fecha com **propulsão de foguetes**: a equação de Tsiolkovsky, onde logaritmo,
conservação de momento, gases e gravitação se encontram.
