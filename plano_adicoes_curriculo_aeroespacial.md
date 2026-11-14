# Plano de adições ao currículo — Concordia, Engenharia Aeroespacial

**Destino definido em 14/11/2026:** Concordia, bacharelado em Engenharia Aeroespacial, por
**Extended Credit Program** — a via para quem não cursou CEGEP. Revisado duas vezes: o
original está em `a6d87b8`, a primeira revisão em `034042f`, e a seção 14 lista o que mudou.

**O princípio que decide tudo**, do README:

> O objetivo é chegar ao primeiro ano de engenharia sem buracos, **não formar um engenheiro**.

Com o destino definido, esse princípio deixa de ser julgamento e vira lista: **o que a
Concordia exige entra, o resto é enfeite.**

---

## 1. O que a Concordia exige

A ficha do Extended Credit Program do departamento de Mecânica, Industrial e **Aeroespacial**
lista os cursos a cumprir além do programa regular:

| Curso        | O que é                             | O site cobre?                    |
| ------------ | ----------------------------------- | -------------------------------- |
| **MATH 203** | Cálculo diferencial e integral I    | **sim** — Cálculo 1 inteiro      |
| **MATH 205** | Cálculo diferencial e integral II   | **sim** — Cálculo 2 inteiro      |
| **MATH 204** | Vetores e matrizes (álgebra linear) | **em parte** — falta autovalores |
| **PHYS 204** | Mecânica                            | **sim** — 17 tópicos de Física   |
| **PHYS 205** | Eletricidade e magnetismo           | **sim** — 4 tópicos              |
| **CHEM 205** | Química geral                       | **não existe nada**              |
| 6 créditos   | Humanidades e ciências sociais      | fora do escopo do site           |

Mais seis créditos de humanidades, que não são conteúdo técnico.

**Não há curso de ondas, óptica ou física moderna na lista.**

> **Verificar antes de reorganizar o estudo.** A ficha do ECP tem cerca de três anos e meio,
> uma das fontes menciona um `MATH 202` que as outras não listam, e requisitos mudam por ano.
> Confirmar na página atual do programa ou escrevendo para a admissão. Este plano é bom
> enquanto a lista for esta.

---

## 2. O que isso decide, imediatamente

### Sai do plano pessoal (fica no currículo)

| Tópico              | Por quê                                                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Poliedros**       | a relação de Euler não é assumida por nenhum dos seis cursos; a geometria espacial útil — volume, área, momento — é `solidos-e-volumes`, que fica |
| **Juros compostos** | matemática financeira; o treino de exponencial já está em `funcao-exponencial`                                                                    |
| **Óptica**          | não há curso de óptica na lista                                                                                                                   |
| **Ondas e som**     | idem                                                                                                                                              |
| **Física moderna**  | idem                                                                                                                                              |
| MMC e MDC           | já estava fora, e as frações exercitam o MMC por dentro                                                                                           |

Isso é **configuração pessoal**, em Configurações. Nenhuma linha de código muda, e nenhuma
deve mudar: desligar no plano não apaga do currículo.

### Fica, contra a recomendação do documento original

**Círculo e polígonos.** Comprimento de arco e área de setor são a ponte para o radiano, e
reaparecem em movimento circular e em momento de inércia — ambos dentro de PHYS 204.

### Deixa de ser prioridade

**Fourier, Laplace e sistemas de EDO** — recomendados na revisão anterior, e **retirados
agora**. Equações diferenciais não estão na lista: são disciplina do curso, não pré-requisito.
O site já tem Cálculo 3 e Cálculo 4, que também estão além da linha. Não são erro — são
adiantamento, e adiantamento compete com o que falta.

---

## 3. As lacunas dentro do que É exigido — conferidas, e duas já existiam

Conferidas uma a uma contra o código em 14/11, **antes** de escrever qualquer linha:

| Falta apontada                  | Estado real                                                                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Estudo de sinal                 | **já existe** — é o tópico `inequacoes-segundo-grau`, cujo título no currículo é «Estudo de sinal»: quadro de sinais, inequação-produto e inequação-quociente |
| Trigonometria inversa           | **já existe** — é o conceito `eqtrig.inversas`, em `equacoes-trigonometricas`                                                                                 |
| **Substituição trigonométrica** | **faltava mesmo — feita em 14/11**                                                                                                                            |

A lista veio da seção 2 da avaliação, que é de 09/11 e envelheceu: o repositório fechou as
duas primeiras depois disso. **Eu teria construído dois tópicos duplicados** se tivesse
seguido o plano sem conferir.

A que faltava não era tópico novo: era uma **técnica** dentro de `tecnicas-de-integracao`,
que já ensinava substituição, por partes e frações parciais. Entrou nos dois casos clássicos
— `√(a² − x²)` com x = a·sen θ, e `a² + x²` com x = a·tg θ —, com verbete de teoria e os
diagnósticos dos dois erros clássicos: responder só a parcela do arco, e esquecer o fator
1/a. O tópico ficou **trilíngue por inteiro** de passagem.

**Prioridade um: concluída.**

---

## 4. Química geral — a área que falta inteira

**Prioridade dois, e é o maior buraco do site.** CHEM 205 está na lista e o site não tem uma
única aula de química.

### A ementa oficial

Estequiometria, estados da matéria, estrutura atômica, estrutura eletrônica, tabela
periódica, propriedades periódicas, ligação e gases. Livro: **OpenStax _Chemistry 2e_** — a
mesma editora que o currículo do site já cita em outras áreas, o que facilita manter o nível
coerente.

Duas delimitações vindas das ementas: **teoria do orbital molecular não é coberta** (fica na
ligação de valência), e o curso pressupõe matemática de ensino médio sólida — que o aluno
deste site tem de sobra.

### Os doze tópicos propostos

Na ordem de aprendizagem, cada um com a forma de resposta que o site precisaria para corrigi-lo:

| #   | Tópico                                        | Resposta           |
| --- | --------------------------------------------- | ------------------ |
| 1   | Medida, algarismos significativos e conversão | numérica           |
| 2   | Átomos, isótopos e íons                       | numérica           |
| 3   | Fórmulas e nomenclatura                       | **texto canônico** |
| 4   | O mol e a massa molar                         | numérica           |
| 5   | Composição percentual e fórmula empírica      | numérica e texto   |
| 6   | Equações químicas e balanceamento             | **texto canônico** |
| 7   | Estequiometria de reações                     | numérica           |
| 8   | Reagente limitante e rendimento               | numérica           |
| 9   | Soluções e concentração                       | numérica           |
| 10  | Gases ideais e pressões parciais              | numérica           |
| 11  | Estrutura eletrônica e configuração           | **texto canônico** |
| 12  | Tabela periódica, ligação e geometria         | **texto canônico** |

### A pergunta de arquitetura, e a boa notícia

Metade da química geral **não tem resposta numérica**. O motor do site é matemático:
`Resolucao<T>` com passos, resposta numérica, fração ou expressão simbólica. «Qual a fórmula
do sulfato de cálcio?» não é número — e o projeto recusa múltipla escolha por princípio,
porque dá para acertar por eliminação.

A boa notícia é que **o caminho já existe e está em uso**. O tópico `notacao-matematica` tem
exatamente esse problema e o resolveu: `canonizarNotacao` reduz escritas diferentes da mesma
coisa a uma forma única, e o campo de resposta aceita uma **paleta de símbolos**
(`simbolos?: TeclaDeSimbolo[]`) para o que não está no teclado.

Química precisa do mesmo, com outra gramática: `CaSO4`, `Ca SO4` e `CaSO₄` são a mesma
resposta; `1s2 2s2 2p6` e `1s² 2s² 2p⁶` também. É uma função de canonização nova, no feitio
da que existe — **não é motor novo**.

Isso torna os doze tópicos viáveis sem violar o princípio de não usar múltipla escolha.

### Esforço

Doze tópicos, de dois a quatro dias cada: **de seis a dez semanas**, mais a canonização
química. É o maior item deste plano, e o único que a lista da Concordia torna obrigatório.

---

## 5. Álgebra Linear — o que falta mesmo

MATH 204 é **Vetores e matrizes**, e o site já cobre a maior parte: `vetores-no-plano`,
`vetores-no-espaco`, `produto-escalar-vetorial`, `matrizes-determinantes`,
`escalonamento-e-inversa`, `retas-e-planos`.

O que falta, dentro do que um curso de vetores e matrizes costuma cobrir:

| Aula                               | Situação                                 |
| ---------------------------------- | ---------------------------------------- |
| **Autovalores e autovetores**      | **falta**, e é padrão em MATH 204        |
| Espaços vetoriais (base, dimensão) | às vezes entra; **prioridade média**     |
| Transformações lineares            | às vezes entra; **prioridade média**     |
| Diagonalização                     | geralmente é do curso seguinte; **fora** |
| Ortogonalidade e mínimos quadrados | geralmente é do curso seguinte; **fora** |

O módulo original propunha as cinco. **Recomendo uma certa e duas prováveis** — e confirmar
a ementa de MATH 204 antes das duas.

---

## 6. Os módulos que saem

Mantido da revisão anterior, agora com a lista da Concordia como prova em vez de argumento:

- **Mecânica dos Materiais e Estruturas** (8 aulas) — não está na lista;
- **Mecânica dos Fluidos avançada** (7 aulas) — não está na lista, e a parte que cabe na
  preparação já está em `fluidos-e-aerodinamica`;
- **Sistemas de Controle** (6 aulas) — não está na lista, e depende de Laplace, que também não
  está;
- **Introdução às EDPs** — não está na lista.

São **22 aulas**, de um e meio a três meses. Nenhuma aproxima da admissão.

---

## 7. O plano, em ordem

| Etapa | O quê                                                                                  | Aulas | Tempo              |
| ----- | -------------------------------------------------------------------------------------- | ----- | ------------------ |
| 0     | Desligar Poliedros, Juros, Óptica, Ondas e Física moderna no plano pessoal             | 0     | minutos            |
| 1     | ~~Estudo de sinal, trigonometria inversa~~ (já existiam) · substituição trigonométrica | 1     | **feita em 14/11** |
| 2     | **Química geral**                                                                      | 12    | 6–10 semanas       |
| 3     | Autovalores e autovetores                                                              | 1     | 2–4 dias           |
| 4     | Espaços vetoriais e transformações lineares, se MATH 204 as cobrir                     | 2     | 1 semana           |

**16 aulas**, contra as 30 do plano original — e com uma troca de fundo: saíram 22 aulas de
disciplinas de graduação, entraram 12 de química, que é exigência de admissão.

---

## 8. O que o site ganha de quebra

Nada em Química é desperdício se a rota mudar: estequiometria, gases e estrutura atômica
aparecem em qualquer engenharia, e **propulsão** — que o site já tem — fica muito melhor
servida por alguém que entende reação, massa molar e gases.

---

## 9. Regras de preservação

1. Não excluir, reordenar, renumerar ou substituir nenhuma das 118 aulas.
2. Química entra como **área nova**, com a mesma anatomia das outras: Explorar, Treinar,
   teoria, gerador, testes e i18n.
3. Os complementos não são pré-requisito da trilha principal.
4. Preservar identificadores, rotas, progresso e configurações.
5. **A validação é por teste**, não por inspeção — ver a seção 11.

---

## 10. O custo real de uma aula aqui

Sete arquivos: entrada no currículo, rota, componente Explorar (`.ts`/`.html`/`.scss`),
teoria, gerador, testes e i18n. E sete guardas globais que não negociam:

- **variedade**: ao menos 60 enunciados distintos por nível, em 1 200 sorteios;
- **dica de estreia** para toda forma de pergunta;
- **contrato de casas decimais**;
- **unidade digitada** aceita;
- **armadilhas** que não coincidem com o gabarito e diagnosticam erro real;
- **fórmulas** que compilam e conceitos que existem;
- **determinismo** do gerador.

Dois a quatro dias por aula. Este número é o que torna a seção 7 uma decisão e não um desejo.

---

## 11. Validação por teste

| O que validar                              | Como                                     |
| ------------------------------------------ | ---------------------------------------- |
| as 118 aulas continuam presentes, na ordem | teste que fixa a lista de `curriculo.ts` |
| identificadores e rotas preservados        | os testes de rota falham se um id sumir  |
| progresso preservado                       | `progressao.service.spec.ts`             |
| a trilha fecha sem os complementos         | teste da trilha principal                |
| a aula nova passa nos guardas              | a suíte inteira + `verificar:geradores`  |

Conferir 118 itens a olho é como o erro entra.

---

## 12. Dívida que cresce junto

`levantamento-traducao.md`: dos 118 geradores, **3** têm enunciado traduzido. Teoria e
resolução **não têm campo de tradução** no modelo. Doze aulas de química acrescentam ≈ 1 000
frases a essa fila.

Decidir **antes** se a química nasce trilíngue. Nascer traduzida custa pouco mais; traduzir
depois é o que já se provou caro.

---

## 13. Fora de escopo

Mecânica quântica avançada, relatividade geral, combustão, projeto de motores, projeto
estrutural. **Manter `propulsao-de-foguetes`** como está.

---

## 14. O que mudou nesta revisão

1. **O destino deixou de ser hipótese.** Concordia, via Extended Credit Program. A lista de
   seis cursos substitui o julgamento sobre o que é «necessário».
2. **Química entrou, e virou prioridade dois.** O documento original a adiava; ela está na
   lista exigida, e o site não tem nada.
3. **Óptica, ondas e física moderna saíram do plano pessoal** — não há curso correspondente.
4. **Fourier, Laplace e sistemas de EDO saíram**, e eu os havia recomendado na revisão
   anterior. Equações diferenciais são disciplina do curso, não pré-requisito.
5. **Álgebra Linear encolheu de cinco aulas para uma certa e duas prováveis**: MATH 204 é
   vetores e matrizes, e o site já cobre quase tudo.
6. **Poliedros e Juros compostos saem do plano pessoal**, por não aparecerem em nenhum dos
   seis cursos.
7. **Círculo e polígonos fica**, contra o documento original: arco e setor são a ponte para o
   radiano.
8. **A pergunta de arquitetura da química ficou registrada** — metade dela não é resposta
   numérica —, com a constatação de que `canonizarNotacao` e a paleta de símbolos já resolvem
   esse problema em outro tópico.
