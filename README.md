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
```

`gerar:teorias` e `gerar:geradores` reescrevem índices gerados em `core/`. Rode-os depois de
criar, remover ou renomear um conceito ou um tópico — há testes que falham se o índice sair de
sincronia.

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
`.github/workflows/deploy.yml`. A suíte roda antes: se um teste falhar, nada vai ao ar.

Duas particularidades do Pages estão resolvidas em `scripts/preparar-pages.mjs`:

- **Rotas diretas.** O Pages não tem servidor que reescreva URLs, então abrir
  `/fisica/propulsao-de-foguetes` na barra de endereços pediria um arquivo inexistente. O
  script copia `index.html` para `404.html`: o Angular recebe o documento e resolve a rota no
  cliente.
- **Underscore.** O Pages passa o conteúdo pelo Jekyll, que descarta arquivos iniciados por
  `_`. O arquivo `.nojekyll` desliga esse processamento.

O `--base-href /estudos-matematicos/` acompanha o nome do repositório; mudar o nome exige
mudar esse caminho no script `build:pages`.

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

A janela é deslizante de propósito: o domínio medido é o atual, não o histórico. Errar as
últimas tentativas tranca a etapa de novo.

A janela mede **constância**, não abrangência: dá para acertar dez somas seguidas e nunca ter
dividido uma fração. Onde o tópico tem partes que precisam ser todas praticadas, há uma
exigência de **cobertura** por cima dela — em Frações, cinco acertos em cada uma das quatro
operações, contados por conceito (`REQUISITOS_POR_TOPICO` em `models/progressao.model.ts`). A área de
treino mostra a lista inteira, com o que falta em cada operação.

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

Quatro travas globais cuidam dessa parte, para os 75 geradores de uma vez
(`core/treino/formato-resposta/`, `shared/components/formula/formulas-do-site.spec.ts`,
`core/teoria/teorias/`):

- o gabarito é aceito na forma em que é exibido;
- o arredondamento que o enunciado pede é aceito;
- a resolução termina mostrando o gabarito;
- toda fórmula compila no KaTeX e todo id de conceito citado existe.

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
