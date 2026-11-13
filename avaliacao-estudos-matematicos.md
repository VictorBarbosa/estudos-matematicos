# Estudos Matemáticos — avaliação e plano, num arquivo só

**Meta:** chegar preparado à graduação em engenharia aeroespacial (Québec), da matemática
básica ao cálculo, com a física que dá sentido a tudo.

- **Site:** https://victorbarbosa.github.io/estudos-matematicos/
- **Versão avaliada:** commit `afe6b98`, de 09/11/2026 — **101 tópicos em 14 áreas** (104 depois da Fase 1, em 09/11)
- **Documentos consolidados aqui (e removidos):** `plano_matematica_engenharia_aeroespacial.md`,
  `PROPOSTA_EDUCATIVA.md` e a avaliação anterior (commit `808dbc7`, 28/10/2026, 75 tópicos)
- **Como foi feita:** um comitê de três relatores leu o código-fonte — currículo e cobertura;
  didática; treino e avaliação. Cada achado deles foi reconferido no repositório antes de
  entrar aqui. As medições são reproduzíveis (seção 9).

Legenda: `[x]` feito · `[ ]` pendente · **◐** feito em parte (o que falta vem em seguida).

> Caminhos citados são relativos a `src/app/`.

---

## 1. Propósito

Cada tópico ensina de duas formas: **Explorar** (mexer nos valores e ver a matemática reagir)
e **Treinar** (exercícios gerados com semente e corrigidos com diagnóstico — não «errado»,
mas «você somou numeradores com denominadores no passo 3»). A ordem da trilha é a ordem de
aprendizagem: nada aparece antes do que precisa. Um tópico só é vencido com domínio medido
(8 acertos nas últimas 10 tentativas, 3 deles no Médio ou no Difícil, terminando com 3
seguidos), e cada área termina numa prova final.

A meta não é formar um engenheiro: é chegar ao primeiro ano sem buracos.

---

## 2. Resposta curta

**O site está bom onde cresceu com cuidado e frágil onde cresceu por acréscimo.**

- **O que está bom:** a arquitetura (resolução e gabarito saem do mesmo código), a correção que
  diagnostica o erro (101 de 101 tópicos têm armadilhas com diagnóstico), a trilha com domínio
  medido, a revisão espaçada, a prova final por área, a interface em três idiomas, e a física
  numericamente correta. Da avaliação anterior, **quase todo o plano de ação foi executado**:
  passamos de 75 para 101 tópicos, com derivadas transcendentes, implícita, técnicas de
  integração completas, impróprias, séries, Taylor, EDOs, vetores em R³, Cálculo 3 e métodos
  numéricos.
- **O que está frágil, em três frentes:**
  1. **Treino raso em metade das áreas.** 22 dos 45 tópicos das áreas magras fazem **uma única
     pergunta**; 19 tópicos têm o nível Extremo com uma pergunta só. Álgebra tem 2,8 formas de
     pergunta por tópico contra 55,8 em Vetores.
  2. **A prova final não cobre a área.** Ela só exige cobertura por tipo onde o tópico declara
     tipos — e só Frações declara. Nos outros ~100 tópicos a prova sorteia **uma** pergunta ao
     acaso: dá para passar na prova de Funções sem nunca ver uma PG.
  3. **Lacunas de conteúdo que travam tópicos de cima:** estudo de sinal (usado em aplicações da
     derivada), trigonometria inversa (usada em integração), escalonamento e matriz inversa,
     L'Hôpital, testes de convergência. E, para a admissão, **eletromagnetismo, ondas e química
     continuam fora**.
- **A teoria não é o problema.** São de 3,0 a 5,8 verbetes por tópico em todas as áreas, sem
  área destoante. O que falta nela é pontual: 32 tópicos sem um único exemplo numérico
  resolvido, e resoluções de Física que saltam da fórmula para o resultado.

---

## 3. Cobertura por área — o que foi pedido, o que existe, o que falta

Veredito do comitê por área: **sólida** = cobre o esperado e treina bem; **aceitável** = cobre,
treina pouco; **frágil** = falta conteúdo ou o treino é de uma pergunta.

### 3.1 Matemática básica — sólida

- [x] Operações, notação, MMC/MDC, frações, decimais, razão e proporção, potências e raízes
- [x] Frações com cobertura por tipo (nove operações, cinco acertos em cada)
- [x] Nada a acrescentar. Simplificação pedida no plano anterior (MMC/MDC sem aprofundamento) — decidido: manter o tópico como está.

### 3.2 Álgebra — frágil (treino)

- [x] Os oito tópicos do plano: expressões, 1º grau, produtos notáveis, fatoração, 2º grau, inequações, sistemas, polinômios
- [x] Equação do 2º grau e fatoração aceitam fração e raiz na resposta (bugs 7 e 8 da avaliação anterior)
- [x] Inequações passaram a avaliar o sentido, não só a fronteira (bug 13)
- [x] **Estudo de sinal e inequações de 2º grau, produto e quociente** — tópico novo `inequacoes-segundo-grau` (09/11), depois de Inequações: quadro de sinais, sinal do trinômio, Δ ≤ 0 e inequação-quociente; a resposta é o conjunto escrito como no caderno (`-2 < x < 3`, `x <= 1 ou x >= 4`, `x ≠ 2`, `vazio`, `todos`). Antes: não existia (`features/algebra/inequacoes/inequacoes.teoria.ts` só trata 1º grau; `curriculo.ts:137` admite). É pré-requisito do quadro de sinais em `calculo-1/aplicacoes-da-derivada`. **Prioridade alta.**
- [ ] Frações algébricas (expressões racionais) — pedidas na avaliação anterior, ausentes
- [x] **Treino (09/11):** os 6 tópicos de uma pergunta só passaram a ter 3 ou mais, nenhum nível com uma só e o Extremo diferente do Difícil — 2º grau: soma e produto (Girard), k da raiz dupla, biquadrada, x₁² + x₂² = S² − 2P; sistemas: problema de enunciado, k do sistema impossível, k e m do indeterminado (o 3×3 ficou no tópico de escalonamento); fatoração: agrupamento, soma/diferença de cubos; produtos notáveis: direção inversa, inclusive do cubo; 1º grau: equação com frações (mmc) e problema de enunciado com unidade. `inequacoes` (1º grau) segue com uma forma, agora complementada por Estudo de sinal. Antes: 6 dos 8 tópicos faziam uma pergunta só (`equacao-primeiro-grau`, `equacao-segundo-grau`, `fatoracao`, `inequacoes`, `produtos-notaveis`, `sistemas-lineares`). Faltam as clássicas: soma e produto das raízes; condição sobre Δ; equação biquadrada; sistema 3×3 e classificação (possível/impossível/indeterminado); fatoração por agrupamento e soma/diferença de cubos; produto notável na direção inversa.

### 3.3 Geometria plana e espacial — aceitável (melhorou em 09/11)

- [x] Os cinco tópicos do plano
- [x] Unidades em todos os enunciados; ângulos desenhados com arco e medida; resoluções com a potência do raio à vista (`core/math/geometria/espacial/espacial.ts`)
- [x] Variedade: semelhança e círculo subiram de 5 para 9 formas; nenhum nível com uma pergunta só (guarda em `features/geometria/geometria-variedade.spec.ts`)
- [x] **Congruência de triângulos** — em `angulos-e-triangulos` (10/11): lado e ângulo correspondentes, inclusive por equação; verbete com LAL, ALA, LLL, LAAₒ
- [x] Quadriláteros e polígonos — em `angulos-e-triangulos` (10/11): quarto ângulo, paralelogramo, trapézio isósceles, losango, diagonais pelo ângulo externo ou interno
- [x] Poliedros e relação de Euler — tópico novo `poliedros` antes de sólidos (10/11), com os cinco de Platão, prismas e pirâmides em 3D
- [x] Teoria de `angulos-e-triangulos` ganhou 4 verbetes: congruência, classificação de triângulos, polígono regular e quadriláteros (10/11)
- [x] Explorar de `solidos-e-volumes` desenha o sólido em 3D girável, com r, h e g marcados (09/11). Antes: único painel da área sem figura

### 3.4 Funções — sólida (conteúdo) · aceitável (treino)

- [x] Os nove tópicos do plano, mais os quatro que ele pedia: **racionais, por partes, transformações de gráficos**, e progressões movidas da Álgebra para cá
- [x] O número **e** é apresentado na exponencial (`funcao-exponencial.teoria.ts`)
- [x] **Equações exponenciais e logarítmicas** — tópico novo `equacoes-exponenciais` (10/11), depois de função logarítmica: mesma base, tirar o ln, soma de logs com domínio, substituição t = aˣ, tempo de crescimento e bases diferentes
- [ ] **◐** Domínio e imagem «com maior profundidade»: o treino ainda pede só «o único valor excluído», nunca o domínio como intervalo
- [ ] **◐** Logaritmo natural: mencionado, sem verbete próprio
- [ ] **◐** Treino (09/11): entraram inequação modular, razão e primeiro termo da PA/PG dados dois termos e taxa equivalente em juros, e esses três tópicos deixaram de ter Extremo com uma pergunta só. Faltam: injetora/sobrejetora; a^x = b por igualdade de bases
- [x] `juros-compostos` — decidido: manter como aplicação do crescimento exponencial (ganhou taxa equivalente em 09/11)

### 3.5 Trigonometria — aceitável

- [x] Os seis tópicos, na ordem certa (funções antes de identidades, como a avaliação anterior pediu)
- [x] **Equações trigonométricas e funções inversas** — tópico novo `equacoes-trigonometricas` (09/11), depois de identidades: inversas e suas imagens, sen/cos/tg x = k na volta, a·f(x) + b = c, arco múltiplo e, no Extremo, equação do 2º grau em sen x com raiz a descartar. Antes: não havia tópico; as inversas aparecem só em menções. É **pré-requisito da substituição trigonométrica** em `calculo-2/tecnicas-de-integracao`. **Prioridade alta.**
- [x] Tipo de pergunta `'sinal'` ligado em `circulo-trigonometrico` (Médio em diante; resposta 1 ou −1) — 09/11
- [ ] **◐** `triangulo-retangulo`: o **ângulo** dados os dois catetos (arctg, em graus) entrou no Extremo em 09/11; faltam 30-60-90 e 45-45-90, altura por tangente
- [ ] **◐** `lei-senos-cossenos`: o **maior ângulo** pelos três lados (arccos) entrou no Extremo em 09/11; falta a área ½·a·b·sen C
- [x] Extremo igual ao Difícil em `triangulo-retangulo` e `lei-senos-cossenos` — cada um ganhou pergunta própria no Extremo (09/11)

### 3.6 Vetores e matrizes — frágil (conteúdo)

- [x] Vetores no plano, produto escalar e vetorial, **vetores no espaço (R³)** — o pedido central do plano anterior
- [x] Matrizes: determinantes 2×2 e 3×3, Cramer, produto
- [x] Números complexos, mantidos como complementar
- [x] **Escalonamento (Gauss-Jordan) e matriz inversa** — tópico novo `escalonamento-e-inversa` (09/11), depois de matrizes: operações de linha, Gauss-Jordan 3×3 (com troca de linhas no Extremo), classificação pelo escalonamento, inversa 2×2 e 3×3 por (A | I). Antes: `curriculo.ts:386` listava como o que falta; `sistemas-lineares` só ensina substituição 2×2. É o que fecha o 0M04. **Prioridade alta.**
- [ ] Retas e planos no espaço; combinação linear, independência e bases
- [x] «det = 0 ⟺ linhas proporcionais»: reconferido em 09/11 — a teoria já explica que no 3×3 a condição é dependência linear, e «proporcionais» só aparece onde vale (2×2 ou como caso particular)
- [x] Explorar de `vetores-no-espaco` desenha a, b, o paralelogramo e a × b em 3D girável, com a regra da mão direita (09/11)
- [ ] Teoria de `vetores-no-plano`: a pergunta `direcao` existe sem verbete próprio
- [x] Álgebra linear avançada (espaços vetoriais, autovalores) — decidido: fora do escopo, **não é pré-requisito de admissão** (autovalores aparecem só nos sistemas de EDOs)

### 3.7 Geometria analítica — aceitável

- [x] Ponto e reta, circunferência, cônicas e **equações paramétricas** (pedidas no plano anterior)
- [x] Distância entre dois pontos (`ponto-e-reta`)
- [ ] **◐** Feito em 09/11: **distância de ponto a reta** e **perpendicular** (inclinação −1/m e coeficiente linear pela reta por P). Faltam: reta por dois pontos, interseção de retas
- [x] **Parábola** em `conicas` (09/11): foco, diretriz, forma transladada e, no Extremo, completar o quadrado
- [ ] Circunferência: completar quadrados para achar centro e raio; reta tangente
- [x] Coordenadas polares — tópico novo `coordenadas-polares` (10/11): conversão, ângulo com quadrante, circunferência polar, distância entre pontos polares e a órbita r = p/(1 + e·cos θ)
- [ ] **◐** Extremo com uma pergunta só: `ponto-e-reta` e `conicas` resolvidos em 09/11; falta `circunferencia`

### 3.8 Física — sólida (mecânica, E&M e ondas desde 10/11)

- [x] A reordenação pedida: Leis de Newton antes de balística; estática antes de harmônico
- [x] Os sete acréscimos do plano anterior: cinemática vetorial, movimento circular, dinâmica rotacional, momento angular, continuidade e Bernoulli (com as hipóteses, bug 19), transferência de calor
- [x] Bernoulli corrigido pela variação de pressão (bug 9); gravitação com tolerância coerente (bug 12)
- [x] **Eletricidade e magnetismo (0P02)** — área nova `eletromagnetismo` depois de Física (10/11): eletrostática, potencial e capacitores, circuitos (com RC e Kirchhoff), magnetismo e indução; 17 verbetes. Fora: lei de Gauss, dielétricos, indutância/RL
- [x] **Ondas e física moderna (0P03)** — área nova `ondas-e-fisica-moderna` (10/11): ondas e som (harmônicos, dB, Doppler), óptica (Snell, reflexão total, lentes, fenda dupla), física moderna (relatividade, fóton, fotoelétrico, de Broglie); 15 verbetes. Fora: espelho esférico como pergunta, difração por fenda única
- [x] Física com cálculo — feito como tópico `fisica-com-calculo` em Cálculo 2 (10/11), mantendo a ordem da trilha. O MHS como EDO já está em Cálculo 4
- [x] ~~**Resoluções que saltam da fórmula para o número**~~ — feito em 09/11: todos os passos citados agora mostram a substituição (plano inclinado, gravidade na altitude, órbita, escape, Kepler, Tsiolkovsky, Isp, empuxo, Bernoulli, sustentação, mistura térmica, impulso, colisões, centro de massa). Antes: nos módulos do núcleo: `core/math/fisica/mecanica/mecanica.ts:219-242` (plano inclinado, cinco resultados e nenhuma conta), `gravitacao/gravitacao.ts` (oito saltos), `fluidos/fluidos.ts:91,95,193,198`, `termica/termica.ts:269` («Substituindo.» sem substituir), `energia/energia.ts:189,259,323`. O padrão certo já existe no mesmo repositório (`espacial.ts`, `termica.ts:67`)
- [ ] Teoria curta demais: `cinematica-escalar` (2 verbetes para 5 perguntas; falta Torricelli e referencial), `analise-dimensional` (2 para 6; falta o teorema Π)
- [ ] Química (0C01–0C02) — fora do escopo do site; fazer pelo curso formal

### 3.9 Pré-cálculo — aceitável

- [x] Ordem corrigida: noção intuitiva antes de vizinhanças e infinito (a inversão da avaliação anterior)
- [x] Sequências e séries transferidas para o Cálculo 2
- [x] A reformulação ampla do plano anterior (revisão de funções, gráficos, exponenciais) — decidido: não refazer; essas revisões já vivem nos tópicos de Funções, e o Pré-cálculo fica como ponte de dois tópicos
- [ ] Seção «Limites laterais» de `nocao-intuitiva-de-limite.teoria.ts:77` repete `calculo-1/limites-laterais` inteiro — remover a seção

### 3.10 Cálculo 1 — frágil (treino)

- [x] Os oito tópicos originais mais os acréscimos pedidos: **derivadas trigonométricas, exponencial e logaritmo, derivação implícita, taxas relacionadas, otimização** (em `aplicacoes-da-derivada`)
- [x] **Regra de L'Hôpital** — em `aplicacoes-da-derivada` (09/11): transcendente sobre mx (Médio), dois polinômios em a ≠ 0 (Difícil), aplicada duas vezes (Extremo), com verbete de teoria. Antes: zero ocorrências; `limites` resolve indeterminação só por fatoração e conjugado
- [x] **Teorema do valor médio e Rolle** — em `aplicacoes-da-derivada` (09/11): o c da parábola (Médio), da cúbica em [0, b] (Difícil) e em [a, b] (Extremo); verbete com a demonstração por Rolle
- [x] **Regra do quociente** — pergunta no Difícil e no Extremo de `regras-de-derivacao`, com resposta em fração e as armadilhas da ordem e do quadrado; o exemplo da teoria agora é um quociente de verdade (09/11)
- [x] Tipo `'taxa-media'` ligado em `definicao-de-derivada`: velocidade média de um carro em m/s, do Médio ao Extremo (09/11)
- [x] Dica da regra do produto movida para o Médio, onde a pergunta estreia (09/11)
- [ ] 6 dos 11 tópicos fazem uma pergunta só (`derivacao-implicita`, `derivadas-exponencial-logaritmo`, `derivadas-trigonometricas`, `limites`, `limites-laterais`, `regra-da-cadeia`). Faltam: reta tangente; derivada segunda; sen x/x; limite que não existe; ~~classificação de descontinuidade; crescimento, concavidade e inflexão~~ (feitos em 09/11, em `continuidade` e `aplicacoes-da-derivada`); cadeia com √, e^u, ln u (**feito no Extremo em 09/11**: √, eᵘ, ln u e sen u por fora)
- [x] Extremo igual ao Difícil em `limites-laterais` (agora pede o salto: lateral direita menos esquerda, com parábola), `regra-da-cadeia` (outra função por fora) e `derivacao-implicita` (reta tangente e onde corta o eixo y) — 09/11
- [x] Exemplo numérico resolvido na teoria de `derivacao-implicita`, `derivadas-exponencial-logaritmo`, `derivadas-trigonometricas`, `regra-da-cadeia` (09/11)

### 3.11 Cálculo 2 — frágil (um tópico duplicado)

- [x] Técnicas de integração com **substituição, por partes e frações parciais** no gerador; integrais impróprias; áreas, volumes, comprimento de arco; séries de Taylor
- [x] Resolução da área entre curvas corrigida (bug 16: o `b` entrou no integrando)
- [x] **Refundado em 10/11 como «Séries e convergência»** (mesmo id e rota): termo geral, p-série, razão, comparação, telescópica, alternada com cota do erro, raio e extremos do intervalo de convergência; 7 verbetes; Explorar com as somas parciais. Antes: **`sequencias-e-series` era duplicata de `funcoes/progressoes`**: mesmos três imports de `@core/math` (`somaComPassos`, `somaInfinitaComPassos`, `termoGeral`), mesmos tipos de questão. A descrição promete «convergência» e o gerador só pergunta soma de PG infinita. **Decisão: refundar o tópico como «Testes de convergência»** (razão, integral, comparação, alternada, p-série), em vez de removê-lo
- [x] Séries de potências e raio de convergência — no tópico refundado (10/11)
- [ ] Substituição trigonométrica — ausente (depende da trigonometria inversa, 3.5)
- [ ] Volumes por cascas cilíndricas
- [x] `integral-definida` antes de `teorema-fundamental` — decidido: manter a ordem (a primitiva é ensinada em `integral-indefinida`, que vem logo depois, e o enunciado pede a primitiva)
- [x] Exemplo resolvido na teoria de `aplicacoes-da-integral`, `integrais-improprias`, `series-de-taylor`, `tecnicas-de-integracao` (09/11)

### 3.12 Combinatória e estatística — aceitável

- [x] Os três tópicos originais mais os acréscimos pedidos: **distribuição normal, regressão e correlação**, incerteza e propagação
- [x] Teoria de incerteza não usa mais derivadas parciais (bug da avaliação anterior)
- [x] Anagramas: a lista fixa de repetições (`['CARRO', [2, 2]]`, bug 17) não existe mais
- [x] Binômio de Newton — tópico novo `binomio-de-newton` (10/11): Pascal, soma dos coeficientes, coeficiente de xᵖ, k-ésimo termo e termo independente
- [ ] Intervalos de confiança e testes de hipótese
- [ ] «Ajuste de reta» duplicado: uma seção em `estatistica-e-incerteza.teoria.ts:95` e sete em `regressao-e-correlacao` — mover para o tópico dedicado
- [x] Dica de `ao-menos-um` movida para o Médio; `uniao` ganhou dica no Fácil (09/11)

### 3.13 Cálculo 3 — aceitável

- [x] Funções de várias variáveis, parciais, gradiente e direcional, integrais múltiplas, coordenadas no espaço, integrais de linha — toda a etapa futura do plano anterior
- [x] Integrais de superfície e os teoremas de Green, Stokes e da divergência — tópico novo `teoremas-integrais` (10/11), depois de `integrais-de-linha`, com Explorar que mostra circulação e integral dupla coincidindo
- [x] Os 6 tópicos têm exemplo numérico resolvido na teoria (09/11)
- [ ] ~24 diagnósticos de armadilha só corretivos («Faltou extrair a raiz quadrada.»), concentrados aqui e no Cálculo 4

### 3.14 Cálculo 4 — sólida

- [x] EDO de 1ª e 2ª ordem, aplicações, métodos numéricos — o núcleo de um primeiro curso
- [ ] **◐** Feito em 09/11: **EDO exata** (k da exatidão e constante C), **regime de amortecimento** (c crítico, rigidez, meia-amplitude) e **Newton-Raphson** (uma e duas iterações). Faltam: sistemas de EDOs; fator integrante; não homogênea; logístico
- [x] Os 4 tópicos têm exemplo numérico resolvido na teoria (09/11)
- [x] Fácil com duas perguntas em `edo-primeira-ordem` (separável e exata) e `metodos-numericos` (Euler e Newton) — 09/11

---

## 4. Mecânica de treino, correção e prova

### 4.1 O que a avaliação anterior apontou (itens 1–21) — estado

- [x] 1. Revelar a resolução conta como desistência, trava o campo e zera a sequência
- [x] 2–3. O domínio exige nível: 8 de 10, 3 no Médio ou Difícil, 3 seguidos ao final; o Fácil não libera etapa
- [x] 4. «Vale revisar» por tópico: confirmado em 10/11 — o painel usa o índice `TOPICO_DO_CONCEITO`; `startsWith` só aparece no comentário que explica o bug antigo, e há teste para isso
- [x] 5. Links «Veja também»: há teste garantindo que todo id citado existe (`core/teoria/teorias/teorias.spec.ts`)
- [x] 6–13. Tolerâncias e formatos: fração aceita em todo gerador numérico; √ e π aceitos; tolerância coerente com as casas pedidas (ver 4.2)
- [x] 16–17. Erros de conteúdo da área entre curvas e dos anagramas
- [x] 18. Determinante: reconferido em 09/11 — a teoria já distingue 2×2 (proporcionais) de 3×3 (dependência linear)
- [x] 19. Bernoulli com hipóteses
- [x] 20. Descrições que prometem o que não existe: taxas relacionadas, frações parciais, **congruência** e **convergência** — todas entregues (a última em 10/11)
- [x] 21. `\;` com barra única: das 5 linhas restantes, só 1 era erro real (`sistema-linear.ts:239`), corrigida em 09/11; as outras 4 eram comentário ou teste

### 4.2 O que este comitê encontrou e já está feito (sessões de 06 a 09/11)

- [x] A prova final aparece como destino ao fim da última etapa da área, e o guard nunca redireciona para rota trancada (era um laço que travava a página)
- [x] Na prova, errar mostra o diagnóstico e a resolução, com o passo divergente destacado; acertar não mostra nada
- [x] Enunciado diz a forma da resposta: «valor exato», «responda como fração» quando a raiz é fracionária, e o campo avisa «decimal só se for exato»
- [x] Máscara do campo numérico: milhar e vírgula decimal se arrumam enquanto se digita, com a mesma regra de leitura do corretor; `6.082.12` deixou de ser lido como 6,082 × 0,12
- [x] Resposta certa arredondada uma casa antes do pedido é aceita, com aviso de precisão (44 tópicos recusavam)
- [x] Resoluções passo a passo com os números do enunciado no teorema do resto, na fatoração (que agora para no grau 2 e chama Bhaskara), na escala de semelhança e nos sólidos
- [x] Cinco dicas presas em nível que a pergunta nunca alcançava, corrigidas (escala, cônicas, polígono regular, superfície de sólidos)
- [x] Guardas automáticos: unidade em todo enunciado de Geometria; piso de variedade por tópico; nenhum nível com uma pergunta só; gabarito aceito como resposta; contrato de casas decimais em todos os geradores

### 4.3 O que falta na mecânica

- [x] **Cobertura da prova (10/11).** Cada tópico entra 2 vezes na prova (configurável de 1 a 3), com formas de pergunta diferentes e alternando Médio e Difícil; tópicos com tipos declarados entram uma vez por tipo. Optou-se por isso em vez de declarar `TIPOS_POR_TOPICO` em todos os tópicos, que mexeria na progressão das etapas. Antes: `planoDaProva` só exige um item por tipo onde há `TIPOS_POR_TOPICO`, e **só `fracoes` declara** (`core/progressao/models/progressao.model.ts:155-168`).
  - **Feito em 09/11 (a parte barata):** quando um tópico repete na prova, a segunda questão sai com **forma de enunciado diferente** da primeira (`sortearInedita`, até 30 tentativas, em `core/prova/models/prova.model.ts`), e o **nível alterna** Médio/Difícil por tópico — antes, com número par de tópicos, cada tópico caía sempre no mesmo nível. Testado em `prova.model.spec.ts`.
  - **Falta (não é barato):** `TIPOS_POR_TOPICO` também alimenta os requisitos das ETAPAS (`REQUISITOS_POR_TOPICO`) e exige geradores que aceitem `pendentes`. Declará-lo em outros tópicos muda a progressão do treino, não só a prova — ao menos `aplicacoes-da-derivada` (6), `equacoes-parametricas` (6), `progressoes` (5), `funcoes-por-partes` (5), `funcoes-racionais` (5), `transformacoes-de-graficos` (5). Esforço médio; decidir junto com a exigência da prova (item abaixo).
- [x] **Exigência da prova proporcional (10/11)**: a régua agora é «acerto mínimo» de 75% (configurável); os erros tolerados saem do tamanho da prova — 8 questões toleram 2, 34 toleram 8. Antes: 2 erros fixos valiam 75% em 8 questões e 88% em 16
- [x] **Dois tipos de pergunta mortos** ligados: `'sinal'` em `circulo-trigonometrico` e `'taxa-media'` em `definicao-de-derivada` (09/11)
- [x] **Extremo igual ao Difícil** nos 6 tópicos — cada um ganhou uma pergunta própria do Extremo, sorteada em metade das vezes (09/11): `limites-laterais` (salto com parábola), `triangulo-retangulo` (ângulo por arctg), `regra-da-cadeia` (√, eᵘ, ln, sen por fora), `expressoes-algebricas` (distribuir k(p) − (dx+e)(fx+g) e achar o coeficiente de x), `derivacao-implicita` (reta tangente, corte no eixo y), `lei-senos-cossenos` (maior ângulo pelos três lados)
- [x] **Dicas presas em nível que a pergunta não alcança**: as 9 listadas e mais uma achada no caminho (`estatistica-e-incerteza`, inclinação) — 10 ao todo, movidas para o nível em que a pergunta estreia, com o expoente em palavras (09/11)
- [x] **Perguntas que estreiam no Fácil sem dica**: as 10 listadas ganharam dica (`ponto-e-reta:197` era uma função auxiliar, não pergunta) — 09/11. O guarda `core/treino/dicas-alcancaveis.spec.ts` amostra 300 exercícios por caso e falha se alguma dessas 20 dicas deixar de aparecer
- [x] **Toda forma de pergunta tem dica no nível em que estreia** (10/11): eram 573 de 1046 formas em 92 tópicos; zeradas, com dicas que usam os números do exercício. O guarda `core/treino/dicas-de-estreia.spec.ts` agora é absoluto — pergunta nova sem dica de estreia não passa
- [x] **A resposta segue do dado como ele foi escrito (13/11).** Três enunciados davam um dado arredondado e cobravam o gabarito do valor exato, de modo que o aluno errava fazendo tudo certo. «Polígono regular com ângulo interno de 169,71°» não descrevia polígono nenhum (35 lados têm 169,714285…°), e dividir 360 por 10,29 dava 34,98 sem como saber o lado do arredondamento — agora só entram polígonos cujo ângulo é exato (divisores de 1440, 23 opções, mantendo o piso de variedade). «Se sen θ = 0,99, quanto vale cos θ?» recusava a resposta certa em 80°, 84° e 85°, porque o gabarito vinha do ângulo exato — agora vem do seno exibido, e 85° saiu por implicar 90°. «Para qual valor de k a integral vale 12,3333?» passou a dizer **valor inteiro de k**. O teste do polígono já existia e deixava passar por usar `toBeCloseTo(angulo, 1)`, que tolera 0,05°. De passagem, a vírgula decimal: o enunciado imprimia 169.71 com ponto. Princípio documentado no README, com o porquê de não ser trava global.
- [ ] **Dicas com fórmula crua** (`'v = √(2gh)'`, `'σ = √(σ₁² + σ₂²)'`): o padrão é dizer o expoente em palavras e usar o número do enunciado — `gravitacao-e-orbitas:109,299`, `fluidos-e-aerodinamica:161`, `trabalho-e-energia:161`, `vetores-no-plano:106`, `numeros-complexos:145`, `circulo-e-poligonos:140,422`, `semelhanca-e-pitagoras:120,161`, `juros-compostos:155`, `probabilidade:123`
- [ ] **Respostas simbólicas** (derivadas e primitivas como expressão, comparadas por avaliação em pontos): o analisador existe (`core/treino/resposta-simbolica`) mas só **um** gerador o usa
- [x] **Prova surpresa (10/11)**: nasce sem aviso a cada N dias (fábrica: 7, depois de 3 tópicos vencidos), sobre todos os tópicos vencidos que estão no plano; sobrevive ao refresh (estado com semente, questão atual e respostas) e não se adia — o casco leva o aluno à prova quando ela nasce e o guard `semSurpresaAtivaGuard` fecha tópicos, revisão e prova de área. Abaixo do acerto mínimo (75%), o histórico dos tópicos errados é apagado e a aprovação da área revogada; a tranca se desfaz quando o tópico é vencido de novo. Ajustes em Configurações → Prova surpresa
- [x] Teste de nivelamento por área (10/11): a prova de uma área já aberta na trilha pode ser feita antes das etapas; passando, a área inteira conta como vencida e a próxima abre; falhando, nada é apagado. A barra lateral marca «nivelamento»
- ◐ Textos dos geradores (enunciados, dicas, diagnósticos) em português; a interface tem pt/fr/en. **7 de 118 geradores** declaram `traducoes`: os seis de álgebra, funções e matemática básica, mais **Semelhança e Pitágoras (13/11)**. O mecanismo está pronto e guardado — `enunciadoTrilingue` monta as três línguas com os mesmos números, e `core/treino/textos-traduzidos.spec.ts` reprova meia tradução ou número perdido. Falta aplicá-lo nos outros 111, e as **resoluções e diagnósticos** continuam em português mesmo nos traduzidos
- [x] **Enunciado que se explica antes de se nomear (13/11).** «Quanto mede a projeção do cateto de 63 cm sobre a hipotenusa?» era tudo o que a pergunta dizia, e o nome supõe a figura que o aluno ainda não sabe desenhar; a dica era `a·h = b·c, e c² = a·m.`, quatro letras que ninguém apresentou. Em Semelhança e Pitágoras, as nove formas foram reescritas: o enunciado mostra de onde o segmento sai e que ângulo faz, e só então dá o nome — que **fica**, porque tirá-lo abandonaria o aluno na prova. Também caíram o «feixe de paralelas corta duas transversais» (agora cada pedaço é localizado entre a 1ª e a 2ª paralela), o «(o enunciado seguinte compara…)» — instrução de autor vazada para a tela —, o «qual é a nova volume?» de concordância, e a sombra da vara igual à altura dela, que fazia razão 1:1. Guardas de clareza no spec do tópico
- [ ] A mesma revisão de clareza nos outros 117 tópicos: este foi revisto porque o usuário tropeçou nele
- ◐ **Armar a conta no celular — o monta monta (11/11).** No celular não há como escrever nem desenhar, e por isso a folha à mão livre é liberada só no tablet: quem estuda no ônibus ou no avião não tinha onde armar a conta. A Fase 1 está no ar: a linha é uma árvore de peças que nasce como um buraco só, com três ações — encaixar, **envolver** (o que faz a álgebra andar: seleciono `2x`, toco em `÷`, encaixo `2`) e apagar —, bandeja fixa de algarismos, pilha de linhas com cópia da anterior, persistência por tópico com chave versionada e leitura validada nó por nó. Só no celular (`rascunhoPermitido`), em paisagem pede para virar o aparelho, e `RascunhoAberturaService` mantém 13 kB de modelos fora do pacote inicial. A régua: a peça é átomo, nunca «divida os dois lados por 2», e nada copia para o campo de resposta — com testes que falham se isso mudar. Montar `2x + 3 = 11` custa 8 toques (eram 15 no caminho ingênuo), e há teste que os conta.
  - **Falta (Fase 1.5 e seguintes):** `√` e `^`; a **conta armada** em colunas com «vai um» e restos; desfazer genérico; layout de duas colunas para a paisagem; os números do enunciado prontos na bandeja (exige um serviço «exercício em foco», porque a `SessaoTreino` nasce num `computed` local de `area-treino.ts:72` e há três consumidores de exercício); e **conferir se o passo manteve a igualdade**, que precisa de três vereditos — `analisarSimbolica` não conhece `=` e avalia uma variável só, então um verificador ingênuo diria «errado» a quem acertou. Plano completo em `plano-rascunho-no-celular.md`.
  - **Revisão de código aplicada (11/11):** três defeitos graves consertados — o teto de bytes era global e fazia a **persistência parar de funcionar no segundo tópico** (8 kB → 128 kB, e ao estourar largam-se os tópicos mais antigos em vez de desistir de gravar); havia caminho para **duas igualdades numa linha** em seis toques; e **dois toques apagavam vinte linhas sem volta**, agora cobertos por uma lixeira de um slot. Mais: `role="tree"` sem `treeitem` (lido como árvore vazia) virou `role="math"` com a conta falada; a peça passou a ter 44 px de verdade e a barra da fração deixou de ser um alvo de 14 px; a seleção é saneada por construção; e as teclas que não podem agir aparecem desabilitadas, ou apagadas-mas-tocáveis quando há um motivo a explicar. Detalhes na seção 15 do plano.
  - **Enunciado dentro da gaveta (12/11).** Publicado e usado num iPhone, apareceu o que nenhum teste pegaria: a gaveta ocupa a tela toda e cobria a pergunta, então não se sabia qual conta fazer. O serviço `ExercicioEmFocoService` subiu da Fase 3 para agora — as três telas de exercício publicam o que estão perguntando e a gaveta lê, sem que nenhuma delas conheça o monta monta. Com isso a Fase 3 perdeu seu item mais caro, e os números do enunciado na bandeja ficaram ao alcance.
  - **Pendente de aparelho:** medir num iPhone real quanta altura sobra abaixo do cabeçalho e qual o menor corpo de peça que o polegar acerta — o segundo confirma ou derruba o teto de três frações aninhadas. O layout se adapta (`dvh`) em vez de depender de um número suposto.

---

## 5. Decisões: remover ou fundir

- [x] **Refundar** `calculo-2/sequencias-e-series` como testes de convergência (3.11) — feito em 10/11
- [ ] **Remover** a seção «Limites laterais» de `pre-calculo/nocao-intuitiva-de-limite.teoria.ts:77`
- [ ] **Mover** «Ajuste de reta» de `estatistica-e-incerteza` para `regressao-e-correlacao`
- [x] **Não fundir** `triangulo-retangulo` com `seno-cosseno-tangente`: o comitê conferiu as seções e o conteúdo é complementar
- [x] **Não remover** `juros-compostos` nem `numeros-complexos`: ficam como complementares
- [x] **Não mover** Combinatória e estatística para o fim da trilha (proposta anterior): com a trilha configurável por tópico, quem não precisa tira do plano em Configurações

---

## 6. Plano de ação priorizado

Ordem pela regra «primeiro o que está quebrado e é barato; depois o que destrava o resto».

### Fase 0 — Quebrado e barato (dias)

**Concluída em 09/11/2026**, exceto a parte cara da cobertura da prova (detalhe em 4.3).

- [x] Cobertura da prova — feito em 09–10/11: forma inédita, alternância de nível e 2 questões por tópico
- [x] Ligar os dois tipos mortos (`'sinal'`, `'taxa-media'`)
- [x] Corrigir as dicas presas (10) e dar dica às perguntas de estreia (10); guarda `dicas-alcancaveis.spec.ts`
- [x] `\;` (1 linha real) e «proporcionais» (já estava certo)
- [x] Diferenciar o Extremo nos 6 tópicos em que ele é igual ao Difícil
- [x] Resoluções de Física com os números à vista (`mecanica.ts`, `gravitacao.ts`, `fluidos.ts`, `termica.ts`, `energia.ts`)

### Fase 1 — Álgebra e os pré-requisitos ausentes (semanas)

**Feita em 09/11/2026**, exceto `TIPOS_POR_TOPICO`, que depende de uma decisão sobre a exigência da prova (4.3). Efeito colateral dos tópicos novos: a trilha só fica aberta até a primeira etapa não vencida, então quem já tinha passado de Álgebra, Trigonometria ou Vetores e matrizes encontra a etapa nova a vencer.

- [x] Cobertura da prova e régua proporcional (10/11) — resolvido com 2 questões por tópico em vez de `TIPOS_POR_TOPICO`
- [x] Novo tópico **Estudo de sinal e inequações de 2º grau** (destrava `aplicacoes-da-derivada`) — 09/11
- [x] Novo tópico **Equações trigonométricas e funções inversas** (destrava substituição trigonométrica) — 09/11
- [x] Novo tópico **Escalonamento e matriz inversa** (fecha o 0M04) — 09/11
- [x] Álgebra: as perguntas clássicas da seção 3.2, levando cada tópico a ao menos 3 tipos e nenhum nível a uma pergunta só — 09/11 (exceto `inequacoes`, ver 3.2)
- [x] L'Hôpital e TVM em Cálculo 1; regra do quociente em `regras-de-derivacao` — 09/11

### Fase 2 — Treino nas demais áreas magras (semanas)

**Feita em 09–10/11/2026.**

- [x] As 20 perguntas priorizadas pelo relator de treino — todas feitas em 09/11: soma e produto das raízes; inequação de 2º grau; equação trigonométrica; regra do quociente; distância de ponto a reta; perpendicular; foco da parábola; intervalo de crescimento; L'Hôpital; tipo de descontinuidade; sistema 3×3; fatoração por agrupamento; inequação modular; razão da PA; taxa equivalente; EDO exata; regime de amortecimento; Newton-Raphson; ângulo no triângulo retângulo; maior ângulo pela lei dos cossenos
- [x] Dica no nível de estreia em todas as formas de pergunta, com guarda absoluto (10/11)
- [x] Exemplo numérico resolvido nos 32 tópicos de teoria que não tinham nenhum — 44 exemplos, contas conferidas (09/11)
- [x] Desenho nos Explorar de `solidos-e-volumes` e `vetores-no-espaco` — componente novo `app-vista-3d` (09/11)

### Fase 3 — Conteúdo novo de cobertura (meses)

**Feita em 10/11/2026** — 6 tópicos novos (equações exponenciais, binômio de Newton, coordenadas polares, poliedros, teoremas integrais) mais a refundação de séries e a ampliação de ângulos e triângulos. O site passou a ter 109 tópicos.

- [x] Refundar `sequencias-e-series` como testes de convergência; séries de potências (10/11)
- [x] Geometria: congruência, quadriláteros, poliedros e Euler (10/11)
- [x] Geometria analítica: coordenadas polares (10/11)
- [x] Combinatória: binômio de Newton (10/11)
- [x] Cálculo 3: integrais de superfície e teoremas (10/11)
- [x] Equações exponenciais e logarítmicas (10/11)

### Fase 4 — Física para a admissão (meses)

**Feita em 10/11/2026** — duas áreas novas e o bloco de Física com cálculo. O site passou a ter 117 tópicos em 16 áreas.

- [x] **Eletricidade e magnetismo (0P02)**: área nova com 4 tópicos (10/11)
- [x] **Ondas e física moderna (0P03)**: área nova com 3 tópicos (10/11)
- [x] Bloco «Física com cálculo» — tópico novo `fisica-com-calculo` em Cálculo 2, depois de aplicações da integral (10/11): mola, força variável, deslocamento e velocidade por integração, centro de massa contínuo e trabalho contra a gravidade 1/r²

### Em paralelo — o que o site não resolve

- [ ] **Escolher a rota de admissão e confirmar com cada universidade.** O site prepara o conhecimento; a admissão pede **créditos** das disciplinas do cégep (0M02–0M04, 0P01–0P03, 0C01–0C02) ou de um preparatório universitário. Rotas para adulto sem DEC identificadas na avaliação anterior (confirmar: as regras mudam a cada ciclo): _mature entry_ da Concordia (21+, 24 meses fora da escola); _certificat préparatoire_ de Sherbrooke; _année préparatoire_ da UdeM para concorrer à Polytechnique — cuja _année propédeutique_ *_não dá acesso ao génie aérospatial_. McGill e algumas outras exigem **laboratório** em mecânica e química, que não se faz num site.
- [ ] Química: fora do site; fazer pelo curso formal.
- [x] Material externo por área: as referências de `curriculo.ts` indicam os capítulos de cada livro (10/11). _Chemistry 2e_ fica para a química, que é feita fora do site.

---

## 7. Síntese das decisões

| Ação                             | Conteúdos                                                                                                                                |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Manter**                       | Todos os 101 tópicos; a ordem atual da trilha (Física antes do Cálculo); juros e complexos como complementares                           |
| **Consertar já**                 | ~~Tipos mortos; dicas presas; Extremo repetido; `\;`; resoluções de Física~~ (feitos em 09/11); cobertura da prova (◐)                   |
| **Refundar**                     | `sequencias-e-series` → testes de convergência                                                                                           |
| **Remover / mover**              | Seção duplicada de limites laterais no Pré-cálculo; «Ajuste de reta» para regressão                                                      |
| **Acrescentar (pré-requisitos)** | ~~Estudo de sinal; equações trigonométricas e inversas; escalonamento e inversa; L'Hôpital e TVM; regra do quociente~~ (feitos em 09/11) |
| **Acrescentar (cobertura)**      | Congruência, quadriláteros, poliedros; polares; binômio de Newton; superfície e teoremas; exponenciais/logarítmicas; séries de potências |
| **Acrescentar (admissão)**       | Eletromagnetismo; ondas e física moderna                                                                                                 |
| **Ampliar treino**               | Álgebra primeiro; depois Trigonometria, Cálculo 1, Geometria analítica, Funções, Cálculo 4                                               |
| **Fora do site**                 | Química; laboratórios; créditos formais                                                                                                  |

---

## 8. Como medir o domínio (do plano anterior, mantido)

Não dar um tópico por concluído por ter lido a explicação. Quatro níveis:

| Nível          | Critério                                 |
| -------------- | ---------------------------------------- |
| 1 — Reconhecer | Explico o conceito e seus símbolos       |
| 2 — Aplicar    | Resolvo exercícios básicos               |
| 3 — Dominar    | Resolvo problemas sem consultar exemplos |
| 4 — Modelar    | Aplico a um problema real ou físico      |

O critério de domínio da trilha (8 de 10, 3 no Médio ou Difícil, 3 seguidos) mede até o nível 3. O nível 4 é o que a prova final e os problemas de modelagem (foguete, órbita, aerodinâmica) deveriam cobrar — hoje a prova ainda sorteia a mesma pergunta do treino (4.3).

---

## 9. Como as medições foram feitas (reproduzível)

- **Tópicos por área:** leitura de `curriculo/curriculo.ts` (101 tópicos, todos com `pronto: true`; 101 `.gerador.ts` e 101 `.teoria.ts` em `features/`).
- **Variedade de perguntas:** para cada tópico e cada um dos 4 níveis, 150 a 200 exercícios gerados com semente fixa; enunciados com os números mascarados contados como formas distintas. Guarda permanente para Geometria em `features/geometria/geometria-variedade.spec.ts`; o mesmo roteiro, estendido a todas as áreas, produziu a tabela da seção 2.
- **Verbetes de teoria:** contagem de `id:` em cada `.teoria.ts`.
- **Exemplos resolvidos:** `.teoria.ts` sem nenhum `exemplo:` — 32 de 101.
- **Dicas presas:** para cada `dica: nivel === 'X'`, comparação de `X` com os níveis em que `sortearPergunta` gera o ramo — feita à mão pelo relator; o guarda automático está na Fase 0.
- **Cobertura da prova:** leitura de `planoDaProva` e `TIPOS_POR_TOPICO` em `core/progressao/models/progressao.model.ts`.
- **Ausências de conteúdo** («L'Hôpital não existe»): busca textual no repositório antes de afirmar.

## 10. Limites desta avaliação

- Leitura estática do código; o site não foi percorrido tela a tela pelos relatores (as sessões de 06–09/11 verificaram no navegador apenas o que corrigiram).
- As regras de admissão vêm da avaliação de 28/10/2026 e **não foram reconferidas** agora; mudam a cada ciclo — confirmar com os escritórios de admissão.
- Nas áreas não magras (Física, Vetores, Estatística, Cálculo 2 e 3, Matemática básica) a contagem de tipos de pergunta não foi feita tópico a tópico; os problemas estruturais da prova valem para elas por construção.
- A qualidade do intervalo da revisão espaçada (`core/revisao/`) não foi avaliada.
- Os pareceres dos relatores estão consolidados aqui; cada achado foi reconferido no código antes de entrar.
