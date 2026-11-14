# Levantamento: o que não está traduzido

**Medido em 13/11/2026**, amostrando os 118 geradores em todos os níveis. Os números
vêm de execução, não de estimativa — o método está na seção 6.

A interface está em três idiomas. **O conteúdo matemático está em português.** E em duas
camadas ele não está apenas sem tradução: **não há onde pôr a tradução**.

---

## 1. O quadro, em uma tabela

| Camada                                            | Traduzido           | Mecanismo                                        |
| ------------------------------------------------- | ------------------- | ------------------------------------------------ |
| Interface (menus, botões, placar, avisos)         | **sim**, pt/fr/en   | dicionários em `core/i18n/dicionarios`           |
| Currículo (nomes e descrições de áreas e tópicos) | **sim**, pt/fr/en   | chaves `curriculo.area.*` e `curriculo.topico.*` |
| Aba Explorar de cada tópico                       | **sim**, 118 de 118 | um `*.i18n.json` por tópico                      |
| **Enunciado do exercício**                        | **3 de 118**        | `Exercicio.traducoes`                            |
| **Dica do exercício**                             | **2 de 118**        | `Exercicio.traducoes.dica`                       |
| **Diagnóstico do erro**                           | **2 de 118**        | `Armadilha.diagnosticoTraducoes`                 |
| **Formato da resposta** (o texto sob o campo)     | **1 de 118**        | `GeradorExercicio.formatoRespostaTraducoes`      |
| **Resolução passo a passo**                       | **0**               | **não existe campo**                             |
| **Teoria** (os 497 verbetes dos popups)           | **0**               | **não existe campo**                             |

Os 3 traduzidos por inteiro são `inequacoes`, `inequacoes-segundo-grau` e
`semelhanca-e-pitagoras`. Outros quatro — `funcao-afim`, `funcao-quadratica`,
`razao-proporcao`, `operacoes-fundamentais` — declaram `traducoes` em **parte** das suas
formas de pergunta, e por isso não entram na contagem: o aluno em francês cai em
português ao trocar de tipo de exercício dentro do mesmo tópico.

> Correção de registro: eu havia dito «7 de 118» numa conversa anterior, contando
> arquivos que mencionam `traducoes`. Amostrando de verdade, são **3** completos.

---

## 2. O tamanho do trabalho, em frases

Contagem de literais no código-fonte:

| O que                                                             | Frases       | × 2 idiomas  |
| ----------------------------------------------------------------- | ------------ | ------------ |
| Descrições dos passos da resolução                                | 3 893        | 7 786        |
| Notas dos passos («por que este passo»)                           | 1 076        | 2 152        |
| Diagnósticos de armadilha                                         | 1 208        | 2 416        |
| Campos de texto das teorias (título, resumo, definição, legendas) | 1 801        | 3 602        |
| Enunciados e dicas                                                | ≈ 2 000      | ≈ 4 000      |
| **Total**                                                         | **≈ 10 000** | **≈ 20 000** |

Vinte mil frases de matemática, cada uma com números interpolados que mudam de posição
entre as línguas. Não é trabalho de uma sessão, e não é trabalho de tradução automática:
«cateto» virou «côté de l'angle droit» por decisão do tópico, e o francês de Québec
difere do de França em vocabulário escolar.

---

## 3. As duas camadas sem lugar para a tradução

Estas não são «falta traduzir»: é **falta de campo no modelo**, e qualquer plano começa
aqui.

**`Passo`** (`core/math/tipos/tipos.ts`) tem `descricao`, `tex` e `nota` — todos `string`
simples. A resolução nasce no motor matemático, que é TypeScript puro e não conhece
idioma; é isso que faz a aba Explorar e o gabarito do treino serem o mesmo código. Pôr
tradução ali significa decidir **onde** ela mora: no motor (que passaria a conhecer
idioma) ou numa camada de apresentação que traduz por identificador de passo.

**`Teoria`** (`core/teoria/models/teoria.model.ts`) tem `titulo`, `resumo`, `definicao`,
`formulas[].legenda`, `demonstracao[]` e `exemplo` — 497 verbetes, nenhum com campo de
idioma. Aqui a saída é mais simples: os verbetes são dados estáticos, então podem seguir
o caminho do currículo — chaves de dicionário em vez de strings no código.

---

## 4. Ordem sugerida

A ordem é a do que o aluno lê primeiro e do que falha pior:

1. **Enunciado e dica**, tópico a tópico. É o que ele lê antes de tudo, e o que torna o
   exercício impossível se não entender. `enunciadoTrilingue` já existe e já é guardado
   por `core/treino/textos-traduzidos.spec.ts`, que reprova meia tradução e número
   perdido na travessia.
2. **Formato da resposta** — 118 strings curtas, uma por gerador. Barato e visível: é o
   texto sob o campo onde ele digita.
3. **Diagnóstico do erro.** É o que o site tem de melhor, e é inútil em língua que o
   aluno não lê. 1 208 frases.
4. **Teoria**, pelo caminho do currículo (chaves de dicionário). 497 verbetes.
5. **Resolução passo a passo**, que exige antes a decisão de arquitetura da seção 3.

**Enquanto não houver tradução, o conteúdo cai em português** — `enunciadoEm` e irmãs
usam o campo em português como reserva. Isso é melhor que tela vazia, e é por isso que o
site não parece quebrado em francês: ele parece bilíngue pela metade.

---

## 5. Consertado junto com este levantamento

**O número do enunciado estava à inglesa.** `${valor}` num template devolve a forma do
JavaScript, com ponto decimal, e o aluno lia «Um círculo tem área 452.39 cm²» — um número
que ninguém escreveria à mão em português, e que ele digita com vírgula no campo de
resposta. Foi relatado duas vezes, em tópicos diferentes.

Estava em **12 pontos de 9 geradores**: `circulo-e-poligonos` (área e apótema e ângulo
inscrito), `solidos-e-volumes`, `teorema-fundamental`, `identidades-trigonometricas`,
`seno-cosseno-tangente`, `estatistica-e-incerteza`, `movimento-harmonico`,
`propulsao-de-foguetes`, `areas-de-figuras-planas` — e três deles na **dica**, não no
enunciado.

A correção é `numeroEscrito(valor, idioma)`, em `core/treino/textos/numero-escrito.ts`, e
ela guarda uma lição do levantamento: **o separador decimal é do idioma, não do site.**
Português e francês usam vírgula; inglês usa ponto. As primeiras traduções de Semelhança
e Pitágoras levaram a vírgula para o inglês — o mesmo defeito, do outro lado.

O guarda `core/treino/numeros-no-enunciado.spec.ts` cobre os 118 geradores, enunciado e
dica, 60 amostras por nível. Ele achou quatro casos que eu não tinha visto procurando à
mão.

---

## 6. Como reproduzir as medições

- **Cobertura de tradução:** amostrar cada gerador de `TODOS_OS_GERADORES` em todos os
  níveis e contar quantos exercícios trazem `traducoes.fr.enunciado`, `traducoes.fr.dica`
  e `armadilhas[].diagnosticoTraducoes.fr`. «Traduzido» exige **todas** as amostras, não
  alguma — é o que separa os 3 completos dos 7 que mencionam o campo.
- **Volume de frases:** contar os literais `descricao:`, `nota:`, `diagnostico:` em
  `core/math` e `features`, e `titulo:`/`resumo:`/`definicao:`/`legenda:` nos
  `*.teoria.ts`.
- **Ponto decimal:** o guarda da seção 5, que é permanente.
