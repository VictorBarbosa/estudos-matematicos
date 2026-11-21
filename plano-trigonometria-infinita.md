# Trigonometria com enunciado infinito — plano

> Escrito em 20/11/2026, revisado por dois agentes antes de virar código.
> O estado de cada fase está na última seção, e é atualizado conforme elas saem.

## Contexto

Você está estudando trigonometria e quer exercícios que não se repitam: valores sorteados,
histórias variadas (profissões, lugares, direções), **coerentes**, com a resolução passo a passo
quando se erra, e tudo nas três línguas. Hoje o tópico `triangulo-retangulo` tem 5 formas de
pergunta no Fácil e 3 no Difícil — o aluno reencontra a mesma pergunta com outros números.

O pedido trouxe também uma exigência de clareza que vira regra do desenho: **nunca dizer «qual é o
ângulo» sem dizer com o que ele é formado** — com o chão, com a horizontal, com a parede.

Este plano foi revisado por dois agentes (um de língua e pedagogia, outro de arquitetura e
guardas); o que eles corrigiram está incorporado e assinalado onde muda uma decisão.

## As decisões que você tomou

| Pergunta | Resposta |
|---|---|
| Onde mora | Motor no core, consumido pelos tópicos de trigonometria que já existem |
| Escopo da 1ª entrega | Só triângulo retângulo: sen, cos, tg e o ângulo pela inversa |
| Personagens | Profissão genérica (sem nome próprio), com gênero correto nas três línguas |
| Tamanho | 20 cenas ou mais |
| Profissão × cena | **Cada cena declara quem cabe** — o padeiro sobe na escada do depósito, não mede a torre |
| O que já existe | Poste, prédio e torre viram cenas do motor |
| Alcance | Só o treino ao vivo; o banco da prova final continua escrito à mão |

## A ideia

Um enunciado é montado de três partes, e cada parte é um arquivo JSON nas três línguas:

```
CENA (a história, com a profissão e a linha de referência)
    «O pedreiro apoia uma escada de 6 m numa parede. A escada faz 68° com o chão.»
+ PERGUNTA (o que se pede, com o nome do lado por língua)
    «A que altura da parede a escada encosta?»
+ SUFIXO (já existe)
    «Responda com 2 casas decimais.»
```

O custo cresce **somado**: 20 cenas + 7 perguntas = 27 moldes, não 140. A variedade cresce
**multiplicada**: cena × pergunta × profissão × números sorteados.

### A regra editorial que faz o francês e o inglês saírem certos

Esta é a correção mais importante do revisor de língua. Colar `artigo + nome` quebra em francês
(`de + le = du`, `l'échelle`, `le astronaute`) e em inglês (`a/an`, adjetivo antes do substantivo).

> **A lacuna traz o seu próprio determinante, já elidido e contraído. Nada fora da lacuna
> concorda com o que entra nela** — nem artigo, nem preposição, nem `quel/quelle`, nem `a/an`.
> A profissão aparece **sempre no início da frase**, e o catálogo guarda a forma já maiúscula.

Com isso o gênero diferente entre línguas (a escada / l'échelle / the ladder) deixa de importar.

Três consequências práticas:

- o catálogo guarda **sintagma por língua** (`O pedreiro` / `Le maçon` / `The bricklayer`), e não
  `artigo` + `nome` para o código colar;
- a **unidade** («metros») não é lacuna — é escrita dentro do texto da cena, nas três línguas;
- cada parte é uma frase completa, com maiúscula e pontuação próprias (o colador junta com espaço).

## As peças

Tudo em `src/app/core/treino/cenas/` — **não** em `core/math`. Motivo (revisor de arquitetura):
`core/math` hoje não importa `@core/treino` nem `@core/enunciados`, e o motor precisa dos dois; e
`scripts/verificar-geradores.mjs` só varre `src/app/features` e `src/app/core/treino`, procurando
`*.gerador.ts` e `*.contextos.ts` — fora dali o motor ficaria **sem o guarda de determinismo**.

| Arquivo | O que guarda |
|---|---|
| `cenas.contextos.ts` | o catálogo de cenas |
| `profissoes.contextos.ts` | o catálogo de profissões (sintagma por língua) |
| `cena.gerador.ts` | o motor: sorteia e monta o `Exercicio<number>` |
| `faixas.ts` | a interseção de limites, em forma fechada |
| `cenas.spec.ts` | o guarda dos dados (ver §Guardas) |

### A cena

```ts
interface Cena {
  readonly id: string;                      // 'escada-parede'  → molde `cena-escada-parede.json`
  readonly vertical: Sintagma;              // «a altura que a escada alcança na parede»
  readonly horizontal: Sintagma;            // «a distância do pé da escada até a parede»
  readonly inclinado: Sintagma;             // «o comprimento da escada»
  readonly referencia: 'chao' | 'horizontal';   // com o que o ângulo é formado
  readonly vista: 'de-baixo' | 'de-cima';       // elevação ou depressão
  readonly limites: {                           // obrigatórios, os quatro
    readonly vertical: readonly [number, number];
    readonly horizontal: readonly [number, number];
    readonly inclinado: readonly [number, number];
    readonly angulo: readonly [number, number];
  };
  readonly formas: readonly Forma[];        // só as perguntas que fazem sentido na cena
  readonly profissoes: readonly string[];   // ids compatíveis, ou [] para cena sem gente
}

type Sintagma = { readonly pt: string; readonly fr: string; readonly en: string };
```

`referencia: 'parede'` **fica de fora da 1ª entrega**: com o ângulo no topo, vertical vira cateto
adjacente e toda a tabela de formas, passos e armadilhas se inverte.

### As sete formas

| forma | dá | pede | razão |
|---|---|---|---|
| `oposto-por-hipotenusa` | ângulo, inclinado | vertical | sen |
| `adjacente-por-hipotenusa` | ângulo, inclinado | horizontal | cos |
| `oposto-por-adjacente` | ângulo, horizontal | vertical | tg |
| `adjacente-por-oposto` | ângulo, vertical | horizontal | tg |
| `hipotenusa-por-oposto` | ângulo, vertical | inclinado | sen (divide) |
| `hipotenusa-por-adjacente` | ângulo, horizontal | inclinado | cos (divide) |
| `angulo-por-dois-lados` | dois lados | o ângulo **com a referência nomeada** | inversa |

### Os moldes JSON

- `triangulo-retangulo/moldes/cena-<id>.json` — a história **e a dica da cena** (ver §Dica).
- `triangulo-retangulo/moldes/pergunta-<forma>.json` — a pergunta, com a lacuna do lado procurado.
- reusa `sufixo-casas-2.json`.

O motor pede o molde por template literal — `` moldesDe('triangulo-retangulo', `cena-${cena.id}`) ``
— para `verificar-moldes.mjs` continuar enxergando o prefixo e **não desligar a checagem de
órfãos do tópico inteiro** (ele desliga quando a forma vem de variável pura).

### Uma função nova em `moldes.model.ts`

`enunciadoComSufixos` aceita um só conjunto de valores para as três línguas;
`enunciadoDoMoldePorIdioma` aceita valores por língua mas não compõe partes. O motor precisa das
duas coisas ao mesmo tempo:

```ts
enunciadoComSufixosPorIdioma(molde, sufixos, valoresPorIdioma): EnunciadoTrilingue
```

É a generalização das duas que já existem, no mesmo arquivo e no mesmo estilo.

## Coerência: o que garante que o enunciado faz sentido

1. **A linha de referência é obrigatória no texto.** Toda cena diz «faz 68° **com o chão**» ou
   «**com a horizontal**». Em cena de observador, «sob um ângulo de **elevação**» (de baixo para
   cima) ou «de **depressão**» (de cima para baixo) — e a de depressão ganha um passo próprio,
   porque o ângulo medido está **fora** do triângulo.
2. **Nomes que não mentem.** `vertical` nunca é «a altura da escada» (isso é o comprimento dela):
   é «a altura que a escada alcança na parede». `horizontal` é «a distância do pé da escada até a
   parede».
3. **Números plausíveis, sem laço de rejeição.** O motor sorteia o ângulo dentro de
   `limites.angulo` (via `anguloRedondo`/`anguloAgudo`, com clamp por cena), **calcula em forma
   fechada** o intervalo admissível do lado que será sorteado — interseção de `limites.inclinado`,
   `limites.vertical / sen θ` e `limites.horizontal / cos θ` — e sorteia **uma vez** dentro dele.
   Sortear-e-repetir consumiria um número variável de valores do rng e quebraria o determinismo.
   Interseção vazia é defeito de dados: `cenas.spec.ts` varre o catálogo e falha no build.
4. **`limites.angulo` por cena é obrigatório.** Escada 60–75°, rampa 5–20°, aproximação de avião
   3–15°. Sem isso, 85° põe o pé da escada a 0,3 m da parede.
5. **No `angulo-por-dois-lados`, sorteia-se o ângulo e deriva-se o segundo lado** — sortear os dois
   lados independentes produz 4° e 86° com frequência.
6. **As palavras de direção que você citou não são lacunas.** chão ↔ teto, subida ↔ descida,
   de baixo ↔ de cima **mudam a geometria**, não só a palavra: cada uma é uma **cena própria**.
   Só é lacuna o que for semanticamente inerte — a profissão e o objeto em posição de sujeito.

## Passos, dica e armadilhas

**Passos por forma, não por cena** — e o motivo é duro: passo é texto em TypeScript traduzido pelo
dicionário, cuja chave normaliza números (`#`) mas não palavras. Passo por cena seria
20 × 7 entradas de dicionário; por forma são ~20 no total.

Redação pronta (português; cada uma ganha `fr`/`en` no mesmo commit):

- **sen / cos:** «O lado procurado está de frente para o ângulo dado: é o cateto OPOSTO.» ·
  «O lado conhecido é o maior, de frente para o ângulo reto: é a hipotenusa.» ·
  «Oposto sobre hipotenusa é o seno.» · «Isolamos o lado procurado multiplicando pela hipotenusa.»
  · «Calculando.»
- **tg:** «Do ângulo dado, o lado conhecido está encostado nele (ADJACENTE) e o procurado está de
  frente para ele (OPOSTO).» · «Oposto sobre adjacente é a tangente.» · «Multiplicamos pelo lado
  conhecido para isolar o procurado.» · «Calculando.»
- **pede a hipotenusa:** «A hipotenusa fica EMBAIXO da razão.» · «A incógnita está no denominador:
  para isolá-la, DIVIDIMOS em vez de multiplicar.» · «Calculando.»
- **ângulo pela inversa:** reaproveitar as frases de `exercicioAngulo`, que **já estão traduzidas**
  (inclusive a nota «Na calculadora: tan⁻¹, com o modo em GRAUS»).
- **depressão (passo extra, antes dos demais):** «O ângulo de depressão é medido a partir da
  HORIZONTAL do observador, para baixo. Ele é igual ao ângulo de elevação visto lá de baixo — é
  esse que fica dentro do triângulo.»

**TeX só com símbolos** (`\theta`, `h`, `x`): o gerador atual escreve `\text{cateto adjacente}`,
português cru na tela francesa.

**A dica é obrigatória em toda cena, e é ela que faz a ponte história → triângulo.**
`formaDaPergunta` troca só números por `N`, então **cada cena × forma é uma «forma» distinta** e
`dicas-de-estreia.spec.ts` (regra absoluta desde 10/11/2026) exige dica na estreia de cada uma.
Regra do motor: **emite dica sempre**. E a dica mora no **JSON da cena** — texto trilíngue de
graça, sem custo de dicionário:

> «A escada é a hipotenusa; a parede, o cateto oposto ao ângulo de 68°; o chão, o adjacente.»

**Armadilhas por forma**, todas passando por `semColisoes` (o complemento 90−θ coincide com o
gabarito em 45°, que é dos ângulos mais sorteados): razão trocada · multiplicar onde era dividir
(**reusar a string que já existe**, para não criar chave nova) · complemento 90−θ · responder a
hipotenusa no lugar do cateto · responder o lado inclinado no lugar da altura · (cenas com
observador) esquecer a altura dos olhos.

## Os guardas e o que este trabalho deve a cada um

| Guarda | O que exige daqui |
|---|---|
| `verificar-geradores.mjs` | motor em `core/treino` com nome `*.gerador.ts`; nenhuma fonte de acaso fora do rng; nenhum laço de rejeição |
| `verificar-palavras-injetadas.mjs` | **estender o glob para `src/app/core/treino/**/*.ts`** — hoje só varre `features`, e é justamente no motor que a injeção acontece |
| `verificar-moldes.mjs` | molde pedido por template literal; nenhum órfão |
| `moldes.spec.ts` | br/fr/en citam as **mesmas lacunas na mesma ordem** — ao escrever as cenas, não reordenar os números para o francês ficar mais idiomático |
| `lacunas-preenchidas.spec.ts` | nenhum `{dados-calculo.…}` sobrando em nenhuma língua |
| `traducao-na-tela.spec.ts` | o motor sempre devolve `traducoes.fr` e `traducoes.en` |
| `dicas-de-estreia.spec.ts` | **dica sempre** |
| `traducoes-de-resolucao.spec.ts` | piso **global** 0,998 (passos) e 0,987 (dicas): toda frase nova entra no dicionário **no mesmo commit**, com os `#` batendo nas três línguas |
| `variedade-de-formas.spec.ts` | remedir o piso **depois** da fase 1b, com margem (ver abaixo) |
| `casas.spec.ts` / `formato-resposta` | manter `sufixo-casas-2` e a tolerância `0,02` dos geradores atuais |
| `cenas.spec.ts` (novo) | toda cena tem molde e todo `cena-*.json` tem cena; nenhuma cena tem interseção de limites vazia |

**Sobre o piso de formas:** a amostra é de 600 sorteios por nível e o espaço combinatório passa
disso (20 cenas × formas × profissões). O número medido satura e vira artefato de amostragem —
registrar o máximo medido deixaria o teste vermelho na primeira refatoração. Medir apagando a
linha do tópico, rodar `npx vitest run variedade-de-formas`, e **registrar com margem (medido ×
0,9, para baixo), explicando no comentário** — o arquivo já tem a tradição de justificar cada
número.

## Fases

| # | Entrega | O que prova |
|---|---|---|
| **0** | Conserta `forma-1.json`: hoje injeta «oposto»/«adjacente» em português nas três línguas («the side adjacente»). Vira **dois moldes**, um por lado, cada língua com a sua ordem natural (`the opposite leg`). | `npm test` verde; o texto PT não muda, então nenhum piso se mexe |
| **1a** | Esqueleto andante: tipos, `faixas.ts`, motor, **1 cena e 2 formas**, ligado em `triangulo-retangulo`, dicionário completo, glob do guarda estendido, `cenas.spec.ts` | a tubulação inteira: catálogo → molde → três línguas → guardas → tela |
| **1b** | O conteúdo: chegar a **20 cenas**, as profissões e o `angulo-por-dois-lados` (é o seu pedido explícito). Quase só JSON — sem passo novo, sem custo de dicionário | é aqui que você vê valor |
| **2** | Migrar `altura-do-poste` e `altura-do-predio` para o motor, com o conceito de **correção aditiva** (altura dos olhos, altura do cais) | um caminho só para manter |
| **3** | `referencia: 'parede'` (ângulo no topo) e cenas de depressão com observador alto | — |

**Duas coisas que ficam de fora, com motivo.** `exercicioDuasVisadas` **não migra**: são dois
triângulos, outro modelo matemático, e continua aplicação própria. E a expansão para outros
tópicos **não começa por `seno-cosseno-tangente`** — aquele tópico é sobre as relações entre as
razões (complementares, identidade fundamental), e enfiar cenas lá borra a identidade dele; os
candidatos bons são `semelhanca-e-pitagoras`, `angulos-e-triangulos` e `lei-senos-cossenos`.

## Vocabulário: o que fica decidido

- **Francês:** o texto novo usa **«côté opposé / côté adjacent»** (o que o aluno francês lê no
  livro). O dicionário tem hoje 40 entradas com «cathète» e 12 com «côté» — **não serão
  reescritas** nesta entrega; fica registrado como dívida.
- **Inglês:** **«leg»**, que já é o termo dominante (4 moldes e 42 entradas do dicionário); só
  `forma-1`/`forma-2` dizem «side», e a fase 0 corrige. «angle of elevation» / «angle of
  depression», não «elevation angle».
- **Glossário:** cadastrar **«ângulo de elevação»** e **«ângulo de depressão»** (`pt/fr/en`,
  definição > 30 caracteres). O guarda exige que o termo apareça de fato num enunciado — as cenas
  garantem isso, desde que a grafia no molde seja exatamente a cadastrada.

## Arquivos que mudam

**Novos:** `core/treino/cenas/{cenas.contextos.ts, profissoes.contextos.ts, cena.gerador.ts,
faixas.ts, cenas.spec.ts}`; os moldes `core/enunciados/enunciados/triangulo-retangulo/moldes/{cena-*.json,
pergunta-*.json}`; `plano-trigonometria-infinita.md` na raiz (o documento que você pediu para
reler quando quiser — este plano, em definitivo).

**Tocados:** `moldes.model.ts` (+`enunciadoComSufixosPorIdioma`), `triangulo-retangulo.gerador.ts`
(chama o motor), `scripts/verificar-palavras-injetadas.mjs` (glob), `variedade-de-formas.spec.ts`
(piso), `math-translations.json` (frases novas), `termos-do-enunciado.json` (dois termos),
`forma-1.json` → dois moldes.

## Verificação

1. `npm run verificar:geradores` — determinismo, moldes alcançáveis, palavra injetada (já com o
   glob novo).
2. `npm test` — a suíte inteira, com atenção a `dicas-de-estreia`, `traducoes-de-resolucao`,
   `variedade-de-formas`, `lacunas-preenchidas` e `cenas.spec`.
3. `npm start` e abrir `triangulo-retangulo` nos três idiomas: confirmar que a cena nomeia a linha
   de referência, que a dica faz a ponte com o triângulo, e que errar de propósito (usar cosseno no
   lugar de seno) mostra o diagnóstico certo.
4. Amostragem de leitura: gerar ~30 enunciados em francês e inglês e conferir elisão e contração
   («L'astronaute», «Le maçon», «The electrician»), que é o ponto onde este desenho pode falhar.

---

## Estado

| Fase | Situação |
|---|---|
| 0 · `forma-1` dividido em dois moldes | **feita** em 20/11/2026 |
| 1a · esqueleto andante | a fazer |
| 1b · as 20 cenas e as profissões | a fazer |
| 2 · migrar poste e prédio | a fazer |
| 3 · ângulo no topo e depressão | a fazer |
