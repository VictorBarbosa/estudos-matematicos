# Plano de adições ao currículo — Preparação para Engenharia Aeroespacial

**Revisado em 14/11/2026**, conferindo cada premissa contra o código. O original está no
histórico (`a6d87b8`), e a seção 15 lista o que mudou e por quê.

**Tipo de documento:** especificação de conteúdo e implementação
**Escopo:** ampliar o currículo preparatório sem prejudicar a trilha existente

---

## 1. Objetivo

Fortalecer a preparação matemática e física para a graduação em Engenharia Aeroespacial,
complementando a formação existente sem reproduzir uma graduação e sem alterar a sequência
que já funciona.

**O princípio que decide o que entra** já está escrito no README, e é o critério deste
documento:

> O objetivo é chegar ao primeiro ano de engenharia sem buracos, **não formar um engenheiro**.

Toda proposta abaixo foi medida contra essa frase. Três dos cinco módulos do plano original
não passam nela — ver a seção 10.

## 2. Premissas, conferidas contra o código

| O que o plano original afirmava                               | O que o código diz                                                                 |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 118 aulas                                                     | **confere** — 118 tópicos                                                          |
| 16 áreas                                                      | **confere**                                                                        |
| 10 faixas                                                     | **não existe.** O currículo se organiza em áreas; não há «faixa» em `curriculo.ts` |
| Fatoração, Inequações e Sistemas lineares estão desabilitadas | **não.** As três existem e estão `pronto: true`                                    |
| Estudo de sinal está desabilitado e deve ser reativado        | **não existe**, nunca existiu                                                      |

As contagens saem de `src/app/curriculo/curriculo.ts`: 7 + 9 + 6 + 13 + 7 + 7 + 5 + 17 + 4 +
3 + 2 + 11 + 10 + 6 + 7 + 4 = 118.

## 3. Instruções obrigatórias de preservação

Mantidas do original, com uma correção de método:

1. Não excluir, reordenar, renumerar ou substituir nenhuma das 118 aulas.
2. Não tornar os complementos pré-requisitos da trilha principal.
3. Criar camada separada, **Complementos para Engenharia Aeroespacial**.
4. Declarar pré-requisitos, nível e posição de cada aula nova.
5. Preservar identificadores, rotas, progresso, configurações e estado.
6. **A validação é por teste, não por inspeção.** O repositório já guarda contagem de trilha,
   variedade por nível, dicas de estreia, contrato de casas decimais, leitura de unidade e
   completude de tradução. Um complemento novo passa por todos eles, e é isso que substitui
   o checklist conferido a olho (ver a seção 12).

---

## 4. Seção 3 do original — o que ela pedia não é trabalho de código

O plano mandava «reativar» quatro aulas. Conferindo:

| Aula                | Estado real            |
| ------------------- | ---------------------- |
| Fatoração           | existe, `pronto: true` |
| Inequações          | existe, `pronto: true` |
| Sistemas lineares   | existe, `pronto: true` |
| **Estudo de sinal** | **não existe**         |

As três primeiras estão ativas no código. Se aparecem desligadas, é no **plano pessoal** —
a tela de Configurações permite tirar tópicos da trilha, e isso vive no navegador do aluno,
não no repositório. **Reativá-las é marcar três caixas em Configurações; nenhuma linha de
código muda, e nenhuma deve mudar.** Mexer no currículo por isso seria confundir preferência
pessoal com conteúdo.

MMC e MDC e Círculo e polígonos: mesma coisa, no sentido inverso. Desligar no plano pessoal
não apaga do currículo.

**Estudo de sinal é criação, não reativação** — e já está registrado como lacuna em
`avaliacao-estudos-matematicos.md`, na lista de pré-requisitos que travam tópicos de cima.
Ver a seção 5.

---

## 5. Prioridade zero: os pré-requisitos que travam o que já existe

**Isto não estava no plano original, e deveria vir antes de qualquer módulo novo.** A
avaliação do site já identificou lacunas que não são aprofundamento: são buracos no caminho
de tópicos que já estão no ar.

| Falta                           | Trava                                         | Por que vem primeiro                                                           |
| ------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------ |
| **Estudo de sinal**             | aplicações da derivada, inequações do 2º grau | o aluno precisa dele para analisar crescimento e concavidade, e ele não existe |
| **Trigonometria inversa**       | técnicas de integração                        | sem ela, a substituição trigonométrica não tem como ser ensinada               |
| **Substituição trigonométrica** | integrais com raízes                          | listada como ausente na avaliação, depende da anterior                         |

Três aulas que **destravam conteúdo já publicado** valem mais que trinta que acrescentam uma
camada nova. Elas também são baratas: entram nas áreas existentes, com os pré-requisitos já
no lugar.

---

## 6. O que uma aula nova custa neste repositório

O plano original tratava cada aula como uma linha de tabela. Aqui ela é, no mínimo:

| Arquivo                           | O quê                                                      |
| --------------------------------- | ---------------------------------------------------------- |
| `curriculo.ts`                    | entrada na área, na posição certa da ordem de aprendizagem |
| `<area>.routes.ts`                | rota com carregamento sob demanda                          |
| `<topico>.ts` / `.html` / `.scss` | a aba **Explorar**, interativa                             |
| `<topico>.teoria.ts`              | os verbetes dos popups, com demonstração                   |
| `<topico>.gerador.ts`             | o gerador de exercícios, com armadilhas diagnosticadas     |
| `<topico>.spec.ts`                | os testes do tópico                                        |
| `<topico>.i18n.json`              | os textos da aba Explorar, em três idiomas                 |

E ela precisa passar nos guardas globais, que não negociam:

- **variedade**: ao menos 60 enunciados distintos por nível, medidos em 1 200 sorteios;
- **dica de estreia**: toda forma de pergunta tem dica no nível em que aparece pela primeira
  vez;
- **contrato de casas decimais**: o enunciado que promete 2 casas aceita 2 casas;
- **unidade digitada**: o gabarito exibido, mais a unidade do enunciado, é aceito;
- **armadilhas**: nenhuma coincide com o gabarito, e cada uma diagnostica um erro real;
- **fórmulas**: todo LaTeX compila, todo id de conceito citado existe;
- **determinismo**: o gerador produz o mesmo exercício para a mesma semente.

Uma estimativa honesta é **de dois a quatro dias de trabalho por aula**, não uma hora. Os
cinco módulos do plano original somam **30 aulas** — ou seja, de dois a quatro **meses**.
Este número é a informação que faltava para decidir o que cortar.

---

## 7. Dívida que cada aula nova aumenta

`levantamento-traducao.md`, medido em 13/11: dos 118 geradores, **3** têm o enunciado
traduzido; dicas 2, diagnósticos 2. A resolução passo a passo e os 497 verbetes de teoria
**não têm nem campo de tradução no modelo**.

O conteúdo já escrito soma ≈ 10 000 frases por traduzir. Cada aula nova acrescenta ≈ 85.
Não é argumento contra crescer — é argumento para **escolher** o que cresce, e para decidir
antes se a tradução acompanha ou fica para depois.

---

## 8. Módulo A — Álgebra Linear · **recomendado**

**Posição:** depois de Vetores, matrizes e coordenadas · **5 aulas**

Passa no critério da seção 1: álgebra linear é disciplina de **primeiro ano** de engenharia,
e o site já tem exatamente os pré-requisitos — `matrizes-determinantes`,
`escalonamento-e-inversa`, `vetores-no-plano`, `vetores-no-espaco`,
`produto-escalar-vetorial`. Nenhuma das cinco existe hoje.

| Aula                               | Conteúdo                                                           |
| ---------------------------------- | ------------------------------------------------------------------ |
| Espaços vetoriais                  | subespaços, combinações lineares, conjunto gerador, base, dimensão |
| Transformações lineares            | núcleo, imagem, posto, mudança de coordenadas                      |
| Autovalores e autovetores          | cálculo e interpretação geométrica                                 |
| Diagonalização                     | matrizes diagonalizáveis e mudança para uma base adequada          |
| Ortogonalidade e mínimos quadrados | projeções, bases ortogonais, ajuste                                |

Não duplicar as aulas existentes de matrizes, determinantes, escalonamento ou vetores: o
módulo **começa** onde elas terminam.

---

## 9. Módulo B — Matemática Aplicada · **recomendado em parte**

**Posição:** depois do Cálculo 4

| Aula                        | Veredito                            | Razão                                                                              |
| --------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------- |
| **Séries de Fourier**       | **entra**                           | depende só de trigonometria e integração, que já existem; é primeiro e segundo ano |
| **Transformada de Laplace** | **entra**                           | ferramenta de EDO, e o site já tem EDOs de 1ª e 2ª ordem                           |
| **Sistemas de EDOs**        | **entra**, depois da Álgebra Linear | é onde autovalores ganham sentido físico                                           |
| Introdução às EDPs          | **fica fora por ora**               | é conteúdo de segundo ou terceiro ano, e sem ele não falta nada no primeiro        |

---

## 10. Módulos C, D e E — **recomendo remover**

Esta é a mudança de fundo em relação ao plano original, e a decisão é do usuário. O
argumento:

**Módulo C — Mecânica dos Materiais e Estruturas** (tensão, Hooke, Poisson, flexão, torção,
flambagem, fadiga, compósitos). São **oito aulas de uma disciplina de graduação**. Nenhuma
delas é pré-requisito de admissão, e nenhuma destrava conteúdo do site. «Resistência dos
Materiais» é uma cadeira do segundo ano — cursá-la antes, por conta e em nível introdutório,
não acelera a entrada e consome os meses que faltam para fechar as lacunas da seção 5.

**Módulo D — Mecânica dos Fluidos** (viscosidade, continuidade, Reynolds, camada limite,
Navier–Stokes, escoamento compressível, Mach). Mesmo argumento, com um agravante: o site já
tem `fluidos-e-aerodinamica`, com pressão, empuxo, Bernoulli e sustentação — que é
exatamente a parte de fluidos que cabe na preparação. As sete propostas são o curso.

**Módulo E — Sistemas de Controle** (malha aberta e fechada, realimentação, funções de
transferência, estabilidade, PID, espaço de estados). Disciplina de terceiro ano, e depende
de Laplace e Álgebra Linear, que ainda não existem aqui.

Os três somam **21 das 30 aulas propostas** — de um e meio a três meses de trabalho — e
nenhum ajuda a chegar ao primeiro ano sem buracos. Eles ajudam a chegar ao **terceiro**, o
que é outra coisa, e para a qual a universidade existe.

**Se o objetivo mudou** — se não é mais «chegar preparado», mas «adiantar matéria de
graduação» —, então os três fazem sentido e este documento precisa ser reescrito a partir
de outro princípio. É a única pergunta aqui que eu não consigo responder.

---

## 11. Ordem recomendada

| Etapa | O quê                                                                   | Aulas | Por que nesta ordem                       |
| ----- | ----------------------------------------------------------------------- | ----- | ----------------------------------------- |
| 0     | Reativar no **plano pessoal** Fatoração, Inequações, Sistemas lineares  | 0     | três caixas em Configurações, zero código |
| 1     | **Estudo de sinal**, trigonometria inversa, substituição trigonométrica | 3     | destravam conteúdo já publicado           |
| 2     | **Álgebra Linear**                                                      | 5     | primeiro ano, pré-requisitos prontos      |
| 3     | Fourier, Laplace, Sistemas de EDOs                                      | 3     | aproveitam a Álgebra Linear               |
| —     | EDPs, Materiais, Fluidos avançado, Controle                             | 22    | fora do escopo declarado do site          |

**11 aulas em vez de 30**, e as três primeiras consertam o que já existe.

---

## 12. Validação — por teste, não por checklist

O original trazia um checklist para conferir a olho. Boa parte dele já é teste neste
repositório, e o resto deveria virar teste:

| O que validar                                | Como                                                    |
| -------------------------------------------- | ------------------------------------------------------- |
| as 118 aulas continuam presentes, na ordem   | teste que fixa a lista e a ordem de `curriculo.ts`      |
| nenhum identificador ou rota mudou           | os testes de rota já falham se um id sumir              |
| o progresso foi preservado                   | `progressao.service.spec.ts`                            |
| os complementos não são pré-requisito        | teste que confere que a trilha principal fecha sem eles |
| cada aula nova declara pré-requisito e nível | campo obrigatório no tipo, verificado pelo compilador   |
| a aula nova passa nos guardas                | a suíte inteira, mais `verificar:geradores`             |

**Conferir a olho uma lista de 118 itens é como o erro entra.** Um teste que fixa a lista
falha no instante em que alguém a altera, e diz qual item mudou.

---

## 13. Fora de escopo, mantido do original

Mecânica quântica avançada, relatividade geral, combustão, projeto de motores e projeto
estrutural aeroespacial. **Manter `propulsao-de-foguetes`** como está.

**Química** continua separada: os requisitos variam com a rota de candidatura e com o
histórico, e presumir uma lista única seria inventar exigência. Conferir no edital antes de
criar área.

---

## 14. Instrução para quem implementar

Antes de tocar no código, inspecionar `src/app/curriculo/curriculo.ts`. Implementar **apenas**
o que estiver aprovado neste documento. Não inventar aulas, não remover conteúdo, não
renumerar, não refatorar o que não foi pedido.

Se uma decisão puder alterar ordem, contagem, identificadores, rotas ou progresso da trilha
principal, **não fazer automaticamente**: registrar e perguntar.

Ao terminar, apresentar resumo verificável — arquivos tocados, aulas novas, testes rodados —
e confirmar que as 118 aulas e sua ordem foram preservadas, **citando a saída do teste que
mede isso**, não a inspeção.

---

## 15. O que esta revisão mudou

1. **Três premissas de fato.** «10 faixas» não existe; Fatoração, Inequações e Sistemas
   lineares **estão ativas** no código; **Estudo de sinal não existe** e nunca existiu — era
   criação, não reativação.
2. **Entrou a prioridade zero** (seção 5): três pré-requisitos que travam conteúdo já
   publicado, que o plano original não mencionava.
3. **Entrou o custo real** (seção 6): sete arquivos e sete guardas por aula, de dois a quatro
   dias cada — logo, 30 aulas são de dois a quatro meses. Sem esse número não havia como
   decidir o que cortar.
4. **Entrou a dívida de tradução** (seção 7), que cada aula nova aumenta.
5. **Saiu a recomendação dos módulos C, D e E** (seção 10): 21 das 30 aulas são disciplinas
   de graduação, e contrariam o princípio escrito do projeto. A decisão é do usuário, e a
   pergunta que a resolve está no fim da seção.
6. **O checklist virou teste** (seção 12): conferir 118 itens a olho é como o erro entra.
7. **A seção 4 deixou de pedir código** para o que é configuração pessoal.
