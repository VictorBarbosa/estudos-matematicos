# Avaliação do site "Estudos Matemáticos"

**Objetivo avaliado:** chegar preparado à graduação em engenharia aeroespacial no Québec.

- **Site:** https://victorbarbosa.github.io/estudos-matematicos/
- **Versão avaliada:** commit `808dbc7` de 28/10/2026, com 75 tópicos em 12 áreas
- **Data da avaliação:** 28 de outubro de 2026
- **Como foi feita:** um comitê de cinco frentes (matemática do secundário; cálculo e álgebra linear; física; admissão no Québec; pedagogia e ordem) revisou o site. Depois, cada achado foi reconferido no código-fonte, e os detalhes estão na seção 1.

---

## Resposta curta

**Não. O site ainda não cobre toda a matéria-base para entrar em engenharia aeroespacial.**

Ele cobre muito bem a matemática do ensino médio, equivalente ao 4e–5e secondaire na séquence SN. Também faz uma boa introdução ao cálculo com polinômios e à mecânica em nível algébrico. Só que as engenharias do Québec exigem um bloco fixo de disciplinas do cégep (programa *Sciences de la nature*), e a maior parte dele ainda falta no site:

| Disciplina exigida (código novo / antigo) | Cobertura no site | O que mais falta |
|---|---|---|
| Calcul différentiel (0M02 / 201-NYA) | ◐ ~50% | Derivadas de sen, cos, eˣ, ln e das inversas; derivação implícita; taxas relacionadas; L'Hôpital; TVM |
| Calcul intégral (0M03 / 201-NYB) | ◐ ~30% | Frações parciais, substituição trigonométrica, integrais impróprias, séries e Taylor, EDOs |
| Algèbre linéaire et géométrie vectorielle (0M04 / 201-NYC) | ◐ ~30% | Vetores em R³, retas e planos no espaço, Gauss-Jordan, matriz inversa, independência linear |
| Mécanique (0P01 / 203-NYA) | ◐ ~60% | Dinâmica de rotação e momento angular; a versão com derivadas e integrais |
| Électricité et magnétisme (0P02 / 203-NYB) | ✗ 0% | Tudo |
| Ondes et physique moderne (0P03 / 203-NYC) | ✗ ~10% | Tudo, exceto o movimento harmônico |
| Chimie générale + Chimie des solutions (0C01–0C02 / 202-NYA–NYB) | ✗ 0% | Tudo (fora do escopo atual do site) |

*Os percentuais são estimativas qualitativas do comitê. Eles vêm da comparação, item a item, entre o site e os planos de curso oficiais (seção 3).*

**Três outras conclusões mudam a prioridade do trabalho:**

1. **A trilha libera tópicos sem garantir domínio.** Dá para revelar a resolução, copiar a resposta e ganhar o acerto. Três acertos seguidos no nível Fácil já bastam para avançar.
2. **Alguns exercícios reprovam respostas certas ou aprovam respostas erradas.** Há também erros de conteúdo: um gabarito errado, uma resolução errada e uma afirmação falsa na teoria. Além disso, 310 linhas de fórmulas aparecem com ";" no lugar de espaços.
3. **A admissão exige créditos formais, não só conhecimento.** O site é a ferramenta de estudo, mas você ainda terá de cursar e ter nota nas disciplinas acima por uma rota oficial. Atenção: na Polytechnique, a rota para adultos (*année propédeutique*) **não dá acesso ao génie aérospatial** (seção 3.1).

---

## 1. Como a avaliação foi feita

- O código-fonte completo foi lido. É exatamente o que o GitHub Pages publica, e inclui:
  - o currículo (`src/app/curriculo/curriculo.ts`);
  - a teoria (`*.teoria.ts`) e os geradores de exercícios (`*.gerador.ts`) dos 75 tópicos;
  - a aba Explorar;
  - a mecânica de treino e de progressão.
- O comitê teve cinco frentes:
  - (A) matemática do secundário;
  - (B) cálculo e álgebra linear;
  - (C) física;
  - (D) admissão no Québec;
  - (E) pedagogia e ordem dos tópicos.
- Os revisores foram interrompidos pelo limite de uso antes de redigir os pareceres. Por isso, o material que eles já tinham produzido foi consolidado aqui: scripts de conferência, buscas em fontes oficiais e contagens no código. **Cada achado foi reconferido no código antes de entrar neste documento.**
- Contas e percentuais de exercícios vêm de scripts independentes. Esses scripts reproduzem os sorteios de cada gerador e comparam com a tolerância de correção usada no site.
- As informações de admissão vêm de páginas oficiais das universidades e do ministério, consultadas em 28/10/2026 (lista no fim).

> Caminhos de arquivo citados abaixo são relativos a `src/app/`.

---

## 2. O que o site faz bem

- **A arquitetura é a certa para ensinar.** Toda rotina do motor devolve a resolução passo a passo (`Resolucao`). Assim, a explicação e o gabarito saem do mesmo código e não divergem.
- **A correção diagnostica o erro.** As "armadilhas" dão nome ao erro clássico e apontam o passo em que ele ocorre. Isso é raro até em plataformas comerciais.
- **A física não tem erros numéricos.** O comitê recalculou de forma independente:
  - g a 400 km: 88,5% de g₀, então o "89%" do site está certo;
  - velocidade orbital: 7,67 km/s;
  - período orbital: 92 min;
  - velocidade de escape: 11,19 km/s;
  - a órbita geoestacionária;
  - as frações de propelente na equação de Tsiolkovsky.
- **O estudo é completo em cada tópico.** Os 75 tópicos têm Explorar e Treinar, os exercícios são gerados com semente e o desempenho é medido por conceito, não só por tópico.
- **Os testes protegem a publicação.** A suíte de testes roda antes de cada publicação.
- **O fio condutor motiva.** A trilha termina na equação do foguete.

---

## 3. Cobertura comparada ao que é exigido

### 3.1 O que as universidades pedem e as rotas de entrada

O programa *Sciences de la nature* (200.B1), obrigatório desde o outono de 2024, usa novos códigos de competência:

- Matemática: 0M02, 0M03 e 0M04.
- Física: 0P01, 0P02 e 0P03.
- Química: 0C01 e 0C02.
- Biologia: 0B01.

As universidades aceitam esses códigos e também os antigos (00UN, 00UP, 00UQ, 00UR, 00US, 00UT, 00UL, 00UM).

| Universidade | Programa | Língua | Pré-requisitos (via cégep) | Rota para adulto sem DEC |
|---|---|---|---|---|
| **Polytechnique Montréal** | Baccalauréat en génie aérospatial: 120 créditos, ~4 anos, **contingentado** | Francês (teste B2 para quem não estudou em sistema francófono) | DEC Sciences de la nature com cote R ≥ 27; por ser contingentado, os melhores dossiês entram | *Candidat adulte* (21+, 2+ anos fora da escola, DES do Québec há 4+ anos, Math/Física/Química de 5e secondaire) → *année propédeutique* de 24 créditos, que **não dá acesso ao génie aérospatial**. Diplomas de fora do Québec: análise caso a caso. Alternativa: cursar o *année préparatoire* da Université de Montréal (MAT1903/1905/1923, PHY1901/1902 e CHM1963 com nota ≥ C; média ≥ 2,5/4,3; 24 créditos em duas sessões em tempo integral) e então concorrer ao programa contingentado |
| **Concordia** | BEng Aerospace Engineering: opções *Aerodynamics and Propulsion*, *Aerospace Structures and Materials* e *Avionics and Aerospace Systems* | Inglês | Química geral; Cálculo I e II; Álgebra linear; Mecânica; E&M. CRC mínima de 30 (27 em matemática e em física) | **Mature entry**: 21+, cidadão ou residente permanente, 24 meses fora da escola, sem DEC → entra no BEng e cursa os pré-requisitos como créditos adicionais ao programa (MATH 203, 204 e 205; PHYS 204 e 205; CHEM 205, mais 12 créditos). Alternativa: *Certificate in Science and Technology* (30 créditos) |
| **ÉTS** | Baccalauréat en génie aérospatial: 118–120 créditos; áreas de aerodinâmica e propulsão, estabilidade e controle, aeroestruturas, fabricação, sistemas e **tecnologias espaciais** | Francês | Sobretudo DEC técnico (ex.: 280.B0, 241.A0), com testes diagnósticos. Com DEC Sciences de la nature, a entrada é via *cheminement universitaire en technologie* (CUT) | Não encontramos rota adulta explícita; o CUT pressupõe um DEC |
| **McGill** | B.Eng. Mechanical + *Aerospace Engineering Minor* (21 créditos; trilhas *Aerodynamics and Propulsion*, *Spacecraft and Systems* e *Aircraft Structures*) | Inglês | Química NYA e NYB, Matemática NYA, NYB e NYC, Física NYA, NYB e NYC (ou os códigos novos). R-score mínimo de 34,4 (set/2026), muito competitivo | *Mature*: 23+, cidadão ou residente permanente; cálculo diferencial, mecânica com laboratório e química geral com laboratório, cada um com nota ≥ 75% nos 3 anos anteriores |
| **Sherbrooke** | Baccalauréat en génie mécanique, **concentration en génie aéronautique** | Francês | DEC 200.B1, ou os cursos 0B01, 0C01, 0C02, 0M02–0M04 e 0P01–0P03 | *Certificat préparatoire* (30 créditos): mecânica, ondas e física moderna, E&M, química geral e das soluções, álgebra linear, cálculo diferencial e integral, programação. Aceita quem retorna aos estudos ou vem de fora do sistema do Québec |
| **Laval** | Baccalauréat en génie mécanique: sem concentração aeroespacial, mas com optativas "Aéronautique et aérospatiale" (ex.: GMC-4151 *Propulsion aéronautique et spatiale*) | Francês | 0M02–0M04, 0P01–0P03, 0C01 e 0B01 (ou os códigos antigos) | *Candidat adulte*: 21+, 2 anos fora da escola, sem DEC, cidadão ou residente permanente; pode haver escolaridade preparatória, mas não em programas contingentados |

**O que isso significa para você:**

- O site prepara o **conhecimento**. A **admissão** pede créditos: as disciplinas acima cursadas e aprovadas por uma via reconhecida. Há duas formas de obtê-los:
  - **cursos de cégep:** o programa *Préalables universitaires* (080.04), oferecido por cégeps como o de Trois-Rivières, inclui 201-SN2/SN3/SN4, 203-SN1/2/3 e 202-SN1/2. No Cégep à distance, o guia 2026–2027 lista 201-NYA, 201-NYB e 201-NYC nesse mesmo programa;
  - **preparatórios universitários:** a mature entry da Concordia e o certificat préparatoire de Sherbrooke.
- Se o alvo é **aeroespacial especificamente**, as rotas mais diretas para um adulto sem DEC parecem ser a mature entry da Concordia (se você cumprir as condições) ou montar os pré-requisitos do cégep para concorrer à Polytechnique ou à ÉTS.
- Algumas disciplinas pedem **laboratório**: a McGill exige mecânica e química com laboratório. Laboratório não se faz num site.
- **Confirme com cada escritório de admissão.** A rota aplicável depende do seu histórico escolar, do seu status e da língua.

### 3.2 Matéria-base × site, item a item

Legenda: ✅ coberto · ◐ parcial · ✗ ausente

**Base do secundário (5e secondaire SN / ensino médio): cobertura alta, com estas lacunas**

- ✗ **O número e e o logaritmo natural nunca são apresentados.** O ln aparece em resoluções e em ∫1/x dx, mas não é definido. A descrição do tópico promete "o número e e meia-vida" (`curriculo/curriculo.ts:224`), e o e só aparece como a base 2,718 num controle da aba Explorar.
- ✗ Equações exponenciais e logarítmicas em geral (só existe o "tempo de duplicação").
- ✗ Inequações do 2º grau, de produto e de quociente (estudo de sinal) e notação de intervalos.
- ◐ **As inequações só pedem o valor da fronteira** (`features/algebra/inequacoes/inequacoes.gerador.ts:25,39`). O sentido da desigualdade, que é o ponto central do tópico, nunca é avaliado. Isso contradiz a descrição, que promete "o conjunto solução na reta" (`curriculo/curriculo.ts:132`).
- ✗ Frações algébricas (expressões racionais), funções racionais e definidas por partes como tópico próprio, e transformações de gráficos.
- ✗ Equações trigonométricas e funções trigonométricas inversas (arcsen, arccos, arctg).

**Calcul différentiel (0M02 / NYA)**

- ✅ Limites (intuitivo, laterais e no infinito), assíntotas, continuidade e TVI, definição de derivada, taxa de variação, otimização, máximos e mínimos, concavidade.
- ◐ Regras de derivação e regra da cadeia. Os exercícios usam **só polinômios** e não há exercício de quociente, embora a descrição prometa "potência, produto e quociente" (`features/calculo-1/regras-de-derivacao/regras-de-derivacao.gerador.ts:7`).
- ✗ Derivadas de sen, cos, tg, eˣ, ln e das funções inversas (nenhum exercício; só citações em texto).
- ✗ Derivação implícita e logarítmica.
- ✗ **Taxas relacionadas**, prometidas na descrição (`curriculo/curriculo.ts:525`).
- ✗ TVM e Rolle, diferenciais e aproximação linear, regra de L'Hôpital.

**Calcul intégral (0M03 / NYB)**

- ✅ Soma de Riemann, integral definida, primitivas, TFC, área entre curvas, volume por discos.
- ◐ Técnicas de integração: os exercícios cobrem **só substituição** (`features/calculo-2/tecnicas-de-integracao/tecnicas-de-integracao.gerador.ts:37`); a integração por partes aparece só na teoria.
- ◐ Comprimento de arco: aparece na teoria, mas não tem exercícios.
- ✗ **Frações parciais**, prometidas na descrição (`curriculo/curriculo.ts:562`).
- ✗ Substituição trigonométrica.
- ✗ Integrais impróprias.
- ✗ Volumes por cascas cilíndricas.
- ✗ Séries com testes de convergência (só há a série geométrica no Pré-cálculo).
- ✗ Séries de potências e Taylor.
- ✗ EDOs separáveis.

**Algèbre linéaire et géométrie vectorielle (0M04 / NYC)**

- ✅ Vetores no plano, produto escalar, determinantes 2×2 e 3×3, regra de Cramer, operações com matrizes.
- ◐ Produto vetorial: só na versão plana. **A estrutura `Vetor` tem apenas x e y** (`core/math/algebra/vetores.ts:13-16`).
- ✗ Vetores em R³, retas e planos no espaço.
- ✗ Eliminação de Gauss-Jordan e sistemas m×n.
- ✗ Matriz inversa.
- ✗ Combinação linear, independência, bases.

**Mécanique (0P01 / NYA de física)**

- ✅ Análise dimensional, cinemática 1D, lançamento oblíquo, leis de Newton, trabalho e energia, impulso, momento linear e colisões, estática, torque e centro de massa.
- ✅ Gravitação e órbitas, fluidos e gases. Esses três vão além do NYA, e isso é bom para aeroespacial.
- ◐ Tudo é tratado em nível algébrico: não há força variável, nem trabalho como integral.
- ✗ **Dinâmica de rotação.** O momento de inércia só aparece numa tabela de dimensões (`core/math/fisica/dimensional.ts:52`). Também faltam momento angular, rolamento e movimento circular uniforme como tópico. Isso é a base do controle de atitude e da vetoração de empuxo.

**Électricité et magnétisme (0P02 / NYB de física):** ✗ Nenhuma ocorrência de carga, Coulomb, campo elétrico, circuito ou indução no site.

**Ondes et physique moderne (0P03 / NYC de física):** ◐ só o MHS massa-mola. ✗ Faltam ondas mecânicas, som, óptica geométrica e física, relatividade restrita, efeito fotoelétrico e física nuclear.

**Chimie (0C01–0C02):** ✗ nada no site. É exigida por todos os programas.

**Probabilités et statistique (0M01, nova no 200.B1):** em geral não é pré-requisito das engenharias.

- ◐ O site tem combinatória, probabilidade básica e estatística descritiva com incerteza.
- ✗ Faltam distribuições, intervalos de confiança e testes de hipótese.

---

## 4. Erros e bugs encontrados

Gravidade:

- **Alta:** impede avançar com domínio ou ensina errado.
- **Média:** atrapalha bastante.
- **Baixa:** refinamento.

### 4.1 Mecânica de treino e progressão

| # | Grav. | Onde | Problema | Correção sugerida |
|---|---|---|---|---|
| 1 | Alta | `core/treino/sessao-treino.ts:46-82, 99-102`; `shared/components/area-treino/area-treino.html:51,63,67` | **Revelar a resolução e depois responder conta como acerto.** O botão "Não sei, mostrar a resolução" não trava o campo nem zera a sequência, e o último passo da resolução mostra o número. O comentário da linha 99 diz "conta como desistir do exercício", mas isso não está implementado | Ao revelar: registrar desistência, zerar a sequência e travar o campo |
| 2 | Alta | `core/treino/progresso.service.ts:22-27`; `core/progressao/progressao.service.ts:37`; `core/treino/sessao-treino.ts:16` | **A liberação ignora o nível.** O nível não é registrado, e 3 seguidas no Fácil (o nível padrão) liberam o próximo tópico. O Fácil nem sorteia todos os tipos de questão: em Porcentagem, "percentual" e "sucessivas" nunca aparecem (`features/matematica-basica/porcentagem/porcentagem.gerador.ts:69-70`) | Registrar o nível e exigir a sequência no Médio ou no Difícil |
| 3 | Alta | `core/progressao/progressao.model.ts:9` | **"3 seguidos" é um critério fraco.** Simulação: quem acerta só 50% libera o tópico em até 20 tentativas 79% das vezes; quem acerta 60%, 93% das vezes | Ex.: 8 dos últimos 10, com pelo menos 3 no Difícil; ou domínio por conceito |
| 4 | Média | `shared/components/painel-progresso/painel-progresso.ts:75-76` | **O "Vale revisar" de cada tópico só funciona em 12 dos 75 tópicos.** O filtro usa `startsWith(topicoId + '.')`, mas os conceitos usam outros prefixos (ex.: `operacoes.` em `operacoes-fundamentais`). Além disso, o filtro corta os 8 piores conceitos do site inteiro antes de filtrar | Mapear conceito→tópico pelo registro de teoria e filtrar antes de cortar |
| 5 | Média | `core/teoria/teoria.service.ts:21,37`; `shared/components/teoria-dialog/teoria-dialog.html:2` | **Links "Veja também" quebrados.** De 483 links, 80 apontam para conceitos de outro tópico, que só são registrados quando esse tópico é aberto na sessão. Antes disso, o botão mostra o id cru (ex.: `limite.intuicao`) e abre um modal vazio. Outros 10 apontam para ids inexistentes (ex.: `quadratica.bhaskara`, `riemann.particao`, `derivada.definicao`) | Registrar todas as teorias de uma vez (são dados pequenos) e corrigir os 10 ids. Um teste pode garantir que todo id citado exista |

### 4.2 Exercícios que reprovam respostas certas ou aprovam erradas

| # | Grav. | Onde | Problema | Correção sugerida |
|---|---|---|---|---|
| 6 | Alta | `features/funcoes/funcao-exponencial/funcao-exponencial.gerador.ts:32` × `:186` | O enunciado diz **"arredonde para 2 casas"**, mas a tolerância é relativa de 0,01%. Ex.: base 3 → 0,63 é reprovado (exato 0,6309); o mesmo acontece com as bases 5, 10 e 0,2 | Tolerância compatível com 2 casas (±0,005) |
| 7 | Alta | `features/algebra/equacao-segundo-grau/equacao-segundo-grau.gerador.ts:5, 91-93, 124-129` | No Difícil, os coeficientes são aleatórios: **em ~53% dos sorteios a maior raiz é irracional ou dízima**. A tolerância é de 1e-9 e o campo só aceita decimal, então a resposta é impossível de digitar | Aceitar √ e frações, ou gerar a partir de raízes "bonitas", ou pedir 2 casas com tolerância coerente |
| 8 | Alta | `features/algebra/fatoracao/fatoracao.gerador.ts:13, 63, 92-95` | Na diferença de quadrados (Médio), a raiz é k/a e a comparação é exata (`a === b`). **Em 35% desses sorteios, a raiz é uma dízima impossível de digitar.** Em 70% ela não é inteira, embora o formato peça "um número inteiro" | Aceitar frações (a classe `Fracao` já existe) e corrigir o texto do formato |
| 9 | Alta | `features/fisica/fluidos-e-aerodinamica/fluidos-e-aerodinamica.gerador.ts:17, 245-246` | **Bernoulli:** a tolerância relativa de 0,5% sobre ~101 kPa equivale a ±0,5 kPa, mais que a queda de pressão de muitos sorteios. **Responder "a pressão não muda" é aceito em 34% dos sorteios**, e o sinal invertido em 15%: dá para passar sem entender o conceito | Corrigir pela variação Δp (ou em Pa), não pela pressão total |
| 10 | Média | `features/calculo-2/tecnicas-de-integracao/tecnicas-de-integracao.gerador.ts:4, 37` | Tolerância absoluta de 0,01 com gabaritos de até ~2,7×10¹¹ no Difícil (12% ≥ 10⁸): exige mais algarismos do que uma calculadora mostra | Tolerância relativa e números menores |
| 11 | Média | `features/calculo-2/aplicacoes-da-integral/aplicacoes-da-integral.gerador.ts:5, 18-27` | Volume do cone com tolerância absoluta de 0,02: usando π = 3,14, a resposta é reprovada em ~93% dos sorteios; com 3,1416, em ~46% | Tolerância relativa, ou dizer "use o π da calculadora" |
| 12 | Média | `features/fisica/gravitacao-e-orbitas/gravitacao-e-orbitas.gerador.ts:14-19, 78` | Pede "2 casas decimais", mas a tolerância é relativa de 0,5%. Em grandes altitudes g é pequeno, e **a resposta com 2 casas é reprovada em ~38% dos sorteios** | Pedir 3 algarismos significativos, ou aceitar ±0,005 |
| 13 | Média | `features/algebra/inequacoes/inequacoes.gerador.ts:5`; `features/funcoes/funcao-quadratica/funcao-quadratica.gerador.ts:5` | Tolerância de 1e-9 e campo só decimal: a fronteira é dízima em ~38% dos sorteios das inequações (Difícil), e o vértice em ~17% dos da quadrática (Difícil) | Aceitar frações em todos os geradores numéricos |
| 14 | Baixa | `features/calculo-2/teorema-fundamental/teorema-fundamental.gerador.ts:73-84` | "Para qual k a integral vale X?": em ~6% dos sorteios há outro k positivo que também resolve, e só o inteiro é aceito | Aceitar qualquer raiz válida, ou usar integrandos monótonos |
| 15 | Baixa | `features/vetores-matrizes/numeros-complexos/numeros-complexos.gerador.ts:200-201, 227-230` | No 4º quadrante, −53,13° (o argumento principal, convenção usual) é diagnosticado como erro | Aceitar ângulos equivalentes módulo 360° |

### 4.3 Erros de conteúdo

| # | Grav. | Onde | Problema | Correção sugerida |
|---|---|---|---|---|
| 16 | Alta | `features/calculo-2/aplicacoes-da-integral/aplicacoes-da-integral.gerador.ts:99, 103` | Área entre y = ax e y = bx²: **a resolução mostrada ignora o b** e calcula ∫₀ᵃ(ax − x²)dx. Fica errada sempre que b ≥ 2, ou seja, em 5 de cada 6 sorteios. Ex.: a = 6, b = 2 mostra 36, mas o certo é 9 (o gabarito está certo) | Limite superior a/b e integrando ax − bx² |
| 17 | Alta | `features/estatistica/analise-combinatoria/analise-combinatoria.gerador.ts:192` | **Anagramas de CARRO** declarados com repetições [2, 2]. Só o R repete, então o gabarito dá 30 e o certo é 5!/2! = 60 | `['CARRO', [2]]`, ou calcular as repetições a partir da palavra |
| 18 | Média | `features/vetores-matrizes/matrizes-determinantes/matrizes-determinantes.teoria.ts:69` | "det A = 0 ⟺ linhas proporcionais" é falso para 3×3, e o tópico treina 3×3. Contraexemplo: linhas (1,0,0), (0,1,0) e (1,1,0) | "⟺ linhas linearmente dependentes" (para 2×2, equivale a proporcionais) |
| 19 | Média | `features/fisica/fluidos-e-aerodinamica/*.teoria.ts` | A equação de Bernoulli é apresentada sem as hipóteses: escoamento incompressível, sem viscosidade, ao longo de uma linha de corrente | Explicitar as hipóteses e quando falham |
| 20 | Média | `curriculo/curriculo.ts:132, 224, 341, 525, 562` | Descrições prometem conteúdo que não existe: conjunto solução das inequações, o número e e meia-vida, cônicas "como órbitas", taxas relacionadas, frações parciais | Implementar ou ajustar o texto |

### 4.4 Renderização

| # | Grav. | Onde | Problema | Correção sugerida |
|---|---|---|---|---|
| 21 | Média | 118 arquivos `.ts` (ex.: `core/math/funcoes/elementares.ts:52`; `features/fisica/propulsao-de-foguetes/propulsao-de-foguetes.teoria.ts:21`) | **`\;` com uma barra só vira `;` no JavaScript.** São 614 ocorrências em 310 linhas, e o KaTeX desenha "x = 0 ;⇒; …" em vez de um espaço | Trocar `\;` por `\\;` e criar um teste que renderize todas as fórmulas, ou ativar a regra `no-useless-escape` |

---

## 5. Ordem dos tópicos

### 5.1 Problemas na ordem atual

A ordem atual é Matemática básica → Álgebra → Geometria → Funções → Trigonometria → Vetores e matrizes → Geometria analítica → Combinatória e estatística → **Física → Pré-cálculo → Cálculo 1 → Cálculo 2**.

Uma varredura das referências cruzadas achou **29 citações de conceitos que só são ensinados depois na trilha**. Os casos que importam são estes:

1. **A física vem antes do cálculo, mas já usa cálculo.**
   - A Cinemática (etapa 48) remete à "taxa instantânea" e à "taxa média", que só aparecem na etapa 66.
   - A física do cégep é toda baseada em derivadas e integrais.
   - Resultado: a física do site fica algébrica e não volta depois que o cálculo é aprendido.
2. **O Pré-cálculo está invertido.**
   - A definição formal ε-δ ("Vizinhanças e infinito", etapa 60) vem **antes** da "Noção intuitiva de limite" (etapa 61).
   - "Sequências e séries" (etapa 59) usa limite antes de ele existir.
   - "Limites" (etapa 62) repete a definição formal.
3. **No Cálculo 2, a integral definida é cobrada antes do TFC.** Os exercícios de "Integral definida" (etapa 71) exigem primitiva e F(b) − F(a) (`features/calculo-2/integral-definida/integral-definida.gerador.ts:21,36,42`). A integral indefinida e o TFC só aparecem nas etapas 72 e 73.
4. **"Estatística e incerteza" (etapa 46) usa derivadas parciais** (`features/estatistica/estatistica-e-incerteza/estatistica-e-incerteza.teoria.ts:111`), que nem estão no site.
5. **Combinatória e estatística ficam no meio da trilha**, adiando o cálculo, e não são pré-requisito de engenharia. O mesmo vale para **Juros compostos**: pouco valor para aeroespacial na trilha obrigatória.
6. **Progressões (etapa 17) vem antes de Funções**, mas a teoria a apresenta como função afim (24) e exponencial (27).
7. **A trilha é estritamente linear, com 75 etapas obrigatórias.** Um adulto que já domina o básico precisa passar por "Operações fundamentais" antes de chegar ao cálculo.

### 5.2 Ordem proposta

Marcações: **(novo)** é tópico a criar; *movido* vem de outro bloco; *(opc)* é opcional na trilha obrigatória.

**Etapa 0 – Nivelamento (novo).** Um teste diagnóstico por bloco, com 10 a 15 questões médias ou difíceis. Quem passa libera o bloco inteiro.

**Bloco 1 – Matemática básica (sem mudança).** Operações fundamentais · MMC e MDC · Frações · Decimais · Porcentagem · Razão e proporção · Potenciação e radiciação · Notação científica e unidades.

**Bloco 2 – Álgebra.** Expressões algébricas · Equação do 1º grau · Produtos notáveis · Fatoração · **Frações algébricas (novo)** · Equação do 2º grau · Inequações do 1º e 2º grau com estudo de sinal e intervalos (ampliado) · Sistemas lineares · Polinômios.

**Bloco 3 – Geometria plana e espacial (sem mudança).**

**Bloco 4 – Funções.** Conceito de função · Afim · Quadrática · Modular · **Transformações de gráficos (novo)** · **Funções racionais e definidas por partes (novo)** · Exponencial, com o número e · Logarítmica, com ln e mudança de base · **Equações exponenciais e logarítmicas (novo)** · Composição e inversa · Progressões (*movido* da Álgebra) · Juros compostos *(opc)*.

**Bloco 5 – Trigonometria.** Triângulo retângulo · Seno, cosseno e tangente · Círculo trigonométrico e radianos · Funções trigonométricas (*movido* para antes das identidades) · Identidades · Leis dos senos e dos cossenos · **Equações trigonométricas (novo)** · **Funções trigonométricas inversas (novo)** · Números complexos *(opc, movido)*.

**Bloco 6 – Geometria analítica.** Ponto e reta · Circunferência · Cônicas, ligadas às órbitas como a descrição promete.

**Bloco 7 – Vetores e mecânica sem cálculo.** Vetores no plano **e no espaço (R³)** · Produto escalar e vetorial em 3D · Análise dimensional · Cinemática escalar (sem "taxa instantânea") · Balística · Leis de Newton · Trabalho e energia · Impulso e momento · Estática e torque · Gravitação e órbitas · Fluidos (com as hipóteses de Bernoulli) · Termodinâmica e gases.

**Bloco 8 – Limites e continuidade (era o Pré-cálculo).** Noção intuitiva de limite · Limites laterais · Limites no infinito e assíntotas · Propriedades e indeterminações · Definição formal ε-δ (fundindo "Vizinhanças" com "Limites") · Continuidade e TVI.

**Bloco 9 – Cálculo diferencial (0M02).** Definição de derivada · Regras de derivação, incluindo quociente · Regra da cadeia · **Derivadas de sen, cos, tg, eˣ e ln (novo)** · **Derivadas das inversas e derivação implícita (novo)** · Taxa de variação · **Taxas relacionadas (novo)** · Esboço de gráficos e otimização · **TVM, diferenciais e aproximação linear (novo)** · **Regra de L'Hôpital (novo)**.

**Bloco 10 – Cálculo integral (0M03).** Soma de Riemann · Integral definida (como limite de somas e área, sem exigir primitiva) · Integral indefinida · TFC (é aqui que entram os exercícios com F(b) − F(a)) · Substituição e por partes, com exercícios de ambas · **Frações parciais (novo)** · **Substituição trigonométrica (novo)** · Aplicações: áreas, volumes por discos e **cascas**, comprimento de arco, trabalho · **Integrais impróprias (novo)** · Sequências e séries (*movido* do Pré-cálculo) com **testes de convergência (novo)** · **Séries de potências e Taylor (novo)** · **EDOs separáveis (novo)**.

**Bloco 11 – Física com cálculo (completa o 0P01).** Cinemática com derivadas e integrais · Força variável e trabalho como integral · **Movimento circular e dinâmica de rotação: momento de inércia, torque, momento angular (novo)** · Movimento harmônico como EDO (*movido*) · **Propulsão de foguetes como fecho da física**: Tsiolkovsky deduzida pela integral, com perdas por gravidade e arrasto (*movido*) · **Atmosfera padrão, arrasto e estabilidade CG/CP (novo, opc)**.

**Bloco 12 – Álgebra linear e geometria vetorial (0M04).** **Retas e planos no espaço (novo)** · Matrizes e determinantes (corrigido) · **Gauss-Jordan (novo)** · **Matriz inversa (novo)** · **Combinação linear, independência e bases (novo)**.

**Bloco 13 – Eletricidade e magnetismo (0P02) e Ondas e física moderna (0P03) (novo).**

- E&M: carga e Coulomb, campo e potencial, capacitores, circuitos CC e RC, campo magnético, indução.
- Ondas e física moderna: oscilações e ondas, som, óptica geométrica e física, relatividade restrita, efeito fotoelétrico.

**Bloco 14 – Combinatória, probabilidade e estatística** (*movido* para depois do cálculo; *opc* para a admissão).

**Química (0C01–0C02):** fora do escopo do site. Faça-a pelo curso formal. No site, no máximo um glossário e um resumo.

---

## 6. Melhorias na mecânica de estudo

1. **Domínio de verdade:**
   - corrigir os itens 1 a 3 da seção 4.1;
   - um tópico só é "vencido" com sequência no Médio ou no Difícil;
   - revelar a resolução conta como desistência.
2. **Revisão espaçada por conceito.** Os dados já existem em `ProgressoService.porConceito`. Falta uma fila diária de 5 a 10 exercícios de conceitos antigos, priorizando os frágeis.
3. **Provas de bloco.** Cumulativas, intercaladas, com tempo e sem dicas, no estilo de prova de cégep, com problemas de várias etapas e de modelagem (incluindo os de foguete).
4. **Formatos de resposta:**
   - aceitar fração em todo gerador numérico;
   - aceitar expressões com √ e π;
   - usar tolerância coerente com as casas pedidas;
   - para derivadas e primitivas, aceitar **respostas simbólicas** (ex.: `3x^2 - 2x + 1`), comparando por avaliação em pontos aleatórios. Hoje os 75 geradores só aceitam um valor numérico (69 do tipo número e 6 do tipo fração); nenhum aceita uma expressão.
5. **Testes automáticos que pegariam os bugs da seção 4,** em todo gerador e milhares de sementes. O projeto já usa Vitest, então dá para checar:
   - "o gabarito é representável no formato aceito";
   - "a resposta digitada como o enunciado pede é aceita";
   - "o último passo da resolução bate com o gabarito";
   - "todo id de conceito citado existe".
6. **Francês e inglês.** A graduação será em francês (Polytechnique, ÉTS, Sherbrooke, Laval) ou em inglês (Concordia, McGill), e hoje o site é só em português. Sugestões:
   - um glossário FR/EN por tópico (ex.: *dérivée / derivative*, *primitive / antiderivative*, *limite à gauche / left-hand limit*);
   - um modo com enunciados em francês.
7. **Material externo por bloco.** Indicar o capítulo correspondente de um livro-texto aberto, como OpenStax *Calculus* (vol. 1–3), *University Physics* (vol. 1–3) e *Chemistry 2e*, além de listas e provas antigas de cégep. O site é ótimo para praticar, mas não substitui um livro para a teoria longa nem o laboratório.

---

## 7. Plano de ação priorizado

| Fase | O quê | Por quê |
|---|---|---|
| **0 – Correções rápidas** | Itens 1–3, 6–9, 16–17 e 21 da seção 4; ids quebrados (item 5) | Alto impacto e baixo esforço: param de ensinar errado e de liberar sem domínio |
| **1 – Reordenar e fechar o 0M02** | Reordenar Pré-cálculo e Cálculo 2 e dividir a Física (seção 5.2); derivadas transcendentes, implícita, taxas relacionadas, L'Hôpital | O cálculo diferencial é o primeiro pré-requisito em toda universidade |
| **2 – 0M03 e 0M04** | Técnicas de integração completas, impróprias, séries e Taylor, EDOs; R³, retas e planos, Gauss-Jordan, inversa | Fecha a matemática exigida |
| **3 – Física** | Rotação e física com cálculo; E&M; ondas e física moderna | Completa o 0P01 e cobre o 0P02 e o 0P03 |
| **Em paralelo (o mais importante)** | Escolher a rota de admissão (seção 3.1), confirmar com a universidade e se inscrever nos cursos de pré-requisito, incluindo química e laboratórios | Sem os créditos formais não há admissão. O site passa a ser o reforço desses cursos |

---

## 8. Limites desta avaliação

- **O que foi avaliado foi o código-fonte publicado,** não a interface no navegador: o site não pôde ser aberto a partir do ambiente de análise.
- **As regras de admissão mudam a cada ciclo.** Algumas páginas oficiais não abriram por completo, e não conhecemos seu histórico escolar nem seu status. Confirme tudo com os escritórios de admissão antes de decidir.
- **Os percentuais de cobertura são estimativas qualitativas.** Os percentuais de exercícios (34%, 53% etc.) vêm de simulações exatas dos sorteios de cada gerador.
- **Os pareceres individuais não foram redigidos,** porque os revisores foram interrompidos pelo limite de uso. O conteúdo aqui é a consolidação do que eles produziram, com cada achado reconferido no código.

---

## Fontes

**Programas e admissão**

- [Polytechnique — Baccalauréat en génie aérospatial](https://www.polymtl.ca/futur/bac/programmes/aerospatial)
- [Polytechnique — Plan du programme génie aérospatial](https://www.polymtl.ca/programmes/programmes/bc-aerospatial)
- [Polytechnique — DEC préuniversitaires](https://www.polymtl.ca/admission/baccalaureat/conditions-dadmission-au-baccalaureat/exigences-academiques/1-etudes-au-quebec/11-dec-preuniversitaires)
- [Polytechnique — Candidats adultes](https://www.polymtl.ca/admission/baccalaureat/conditions-dadmission-au-baccalaureat/exigences-academiques/1-etudes-au-quebec/14-candidats-adultes)
- [Polytechnique — Études universitaires au Québec](https://www.polymtl.ca/admission/baccalaureat/conditions-dadmission-au-baccalaureat/exigences-academiques/1-etudes-au-quebec/13-etudes-universitaires)
- [Polytechnique — Autres diplômes (hors Québec)](https://www.polymtl.ca/admission/baccalaureat/conditions-dadmission-au-baccalaureat/exigences-academiques/2-etudes-hors-quebec/214-autres-diplomes)
- [Polytechnique — Exigences linguistiques](https://www.polymtl.ca/admission/baccalaureat/conditions-dadmission-au-baccalaureat/exigences-linguistiques)
- [Concordia — Aerospace Engineering (BEng)](https://www.concordia.ca/academics/undergraduate/aerospace-engineering.html)
- [Concordia — Mature Entry](https://www.concordia.ca/academics/undergraduate/calendar/current/section-14-alternative-entry/mature-entry.html)
- [Concordia — Alternative entry programs (BEng)](https://www.concordia.ca/academics/undergraduate/calendar/current/section-71-gina-cody-school-of-engineering-and-computer-science/section-71-20-beng/section-71-20-2-alternative-entry-programs.html)
- [Concordia — Certificate in Science and Technology](https://www.concordia.ca/academics/undergraduate/calendar/current/section-71-gina-cody-school-of-engineering-and-computer-science/section-71-20-beng/section-71-20-9-certificate-in-science-and-technology.html)
- [Concordia — English language proficiency](https://www.concordia.ca/admissions/undergraduate/requirements/english-language-proficiency.html)
- [ÉTS — Baccalauréat en génie aérospatial](https://www.etsmtl.ca/programmes-formations/baccalaureat-genie-aerospatial)
- [ÉTS — Cheminement universitaire en technologie](https://www.etsmtl.ca/programmes-formations/cheminement-universitaire-technologie)
- [McGill — Requisitos para candidatos do Québec](https://mcgill.ca/applying/requirements/qc)
- [McGill — Mature students](https://mcgill.ca/applying/requirements/mature)
- [McGill — Aerospace Engineering Minor](https://coursecatalogue.mcgill.ca/en/undergraduate/engineering/programs/minor-programs/aerospace-engineering-minor-beng/)
- [Sherbrooke — Baccalauréat en génie mécanique](https://www.usherbrooke.ca/admission/programme-pdf/215/baccalaureat-en-genie-mecanique/)
- [Sherbrooke — Certificat préparatoire](https://www.usherbrooke.ca/admission/programme/1CR/certificat-preparatoire-aux-programmes-de-1er-cycle/)
- [Laval — Baccalauréat en génie mécanique](https://www.ulaval.ca/etudes/programmes/baccalaureat-en-genie-mecanique)
- [Laval — Statut de candidat adulte](https://www.ulaval.ca/experience-ulaval/retour-aux-etudes/statut-de-candidat-ou-candidate-adulte)

**Programa do cégep e conteúdo das disciplinas**

- [MES — Science (200.B1), versão em inglês do programa ministerial](https://www.dawsoncollege.qc.ca/oad/wp-content/uploads/sites/146/200-B1-2021-Science-English.pdf)
- [Québec.ca — Anúncio do novo programa Sciences de la nature](https://www.quebec.ca/nouvelles/actualites/details/la-ministre-mccann-devoile-deux-nouveaux-programmes-detudes-au-collegial-38781)
- [Cégep régional de Lanaudière — Descriptions des cours 200.B1](https://cegep-lanaudiere.qc.ca/wp-content/uploads/2026/07/descriptions-des-cours-200-b1.pdf)
- [Cégep de Trois-Rivières — Préalables universitaires 080.04](https://www.cegeptr.qc.ca/wp-content/uploads/2026/02/Tableau_preal_univ_2026_fevrier-002.pdf)
- [Cégep à distance — Guide de choix de cours 2026–2027](https://ftp.cegepadistance.ca/wp-content/uploads/2026/08/Guide-de-choix-de-cours-2026-2027.pdf)
- [Vanier College — Calculus I (201-NYA)](https://euclid.vaniercollege.qc.ca/~iti/2021/cal1A21/outline_A21.pdf)
- [John Abbott College — Calculus II (201-NYB)](https://www.math.mcgill.ca/rags/JAC/CalIIOutline.html)
- [Collège de Maisonneuve — Mécanique (203-NYA)](https://physique.cmaisonneuve.qc.ca/plans-cours/Pcours-203-NYAS.pdf)
- [Cégep de Trois-Rivières — Électricité et magnétisme (203-NYB)](https://physique.cegeptr.qc.ca/webnyb/pl_nyb_a25.pdf)
- [Collège de Maisonneuve — Ondes et physique moderne (203-NYC)](https://physique.cmaisonneuve.qc.ca/plans-cours/Pcours-203-NYCS.pdf)
