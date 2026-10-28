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
npm test           # suíte com Vitest
npm run build      # build de produção
npm run build:pages  # build para o GitHub Pages
```

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
libera a seguinte depois de **três acertos seguidos** na aba Treinar daquele tópico — é
sequência, e não total de acertos, porque o que deve liberar o próximo assunto é domínio, não
insistência.

```
core/progressao/
  progressao.model.ts        a trilha derivada do currículo e o alvo de acertos
  progressao.service.ts      quem está aberto, quem foi vencido, onde o estudo parou
  topico-liberado.guard.ts   nem pela URL se pula a fila
```

Nada disso guarda estado novo: a conquista é derivada da **melhor sequência** que o
`ProgressoService` já registra por tópico no `localStorage`. Um refresh devolve a trilha
exatamente onde ela estava.

O **modo livre**, no painel da página inicial, destranca tudo para consulta sem apagar o
progresso — ele também é lembrado entre sessões.

## Convenções

- Standalone em tudo, `ChangeDetectionStrategy.OnPush`.
- **Zoneless**: não há `zone.js`. Todo estado passa por signals (`signal`, `computed`, `model`).
- `input()` / `output()` / `model()` e `inject()`, nunca decoradores.
- Novo control flow (`@if`, `@for` com `track`, `@switch`).
- Template e estilo em arquivos separados: `.ts` / `.html` / `.scss`.
- Imports por alias — `@core`, `@shared`, `@features`, `@layout`, `@curriculo` — nunca `../../`.
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
