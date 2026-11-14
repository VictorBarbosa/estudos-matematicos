# Plano: problemas de palavra escritos por uma LLM local

**Ideia do usuário, 14/11/2026.** Alguns tópicos ficariam melhores com problemas de
palavra — e eles não podem ser infinitos escritos à mão. Uma LLM local escreve os
enunciados; o código continua dono dos números e da resposta.

> «ele não se preocupa com a resposta, ele não vê a resposta, isso será feito via código,
> ele apenas cria enunciados»

Este arquivo registra o desenho, as três decisões já tomadas, o que a rota escolhida custa,
e o que **não** decido sozinho.

---

## 1. A correção que faz a ideia funcionar

Como enunciada, a ideia não fecha: **se a LLM escolhe os números, o código não tem como
saber qual conta o texto pede.** Teria de interpretar o texto — exatamente o que não se
quer confiar a ela.

A inversão resolve, e mantém o pedido ao pé da letra:

|                                        | Quem faz                       |
| -------------------------------------- | ------------------------------ |
| Sortear os números                     | o gerador do tópico, como hoje |
| Calcular a resposta                    | o gerador, como hoje           |
| Montar os passos da resolução          | o gerador, como hoje           |
| Montar as armadilhas e os diagnósticos | o gerador, como hoje           |
| **Escrever a história em volta**       | **a LLM**                      |

A LLM recebe os **dados** e nunca a **resposta**. Gabarito, passos, armadilhas e dica
seguem intactos, porque são os mesmos números de sempre.

### O formato com lacunas

A LLM não escreve números. Ela escreve, nos três idiomas:

```
pt: "Uma oficina cobra {0} reais por hora e mais {1} de taxa fixa. Quantas horas cabem em {2} reais?"
fr: "Un atelier facture {0} dollars l'heure et {1} de frais fixes. Combien d'heures tient-on dans {2} dollars ?"
en: "A workshop charges {0} per hour plus a {1} flat fee. How many hours fit in {2}?"
```

O código substitui com `numeroEscrito(valor, idioma)`, que já existe. Três ganhos de uma
vez:

1. **O separador decimal sai certo por construção** — vírgula em pt/fr, ponto em en. Foi
   um defeito real do site, corrigido em 13/11 em 12 pontos de 9 geradores.
2. **Os três idiomas carregam os mesmos números na mesma ordem**, que é o que
   `core/treino/textos-traduzidos.spec.ts` exige. Trocar de idioma não troca os números de
   lugar.
3. **Uma história serve para infinitos sorteios.** É o que devolve a sensação de infinito
   sem a LLM precisar estar no ar a cada exercício.

### A frase de formato não é da LLM

«(em cm, 2 casas decimais)» continua sendo montada pelo código, pelo mecanismo trilíngue
que já existe (`formatoRespostaTraducoes`). A LLM escreve a história e a pergunta; o
contrato da resposta é do site. Ela é instruída a **não** mencionar unidade nem casas.

---

## 2. As três decisões tomadas em 14/11

| Decisão         | Escolha                                                                   | Alternativas recusadas                                 |
| --------------- | ------------------------------------------------------------------------- | ------------------------------------------------------ |
| Onde a LLM roda | **ao vivo em `localhost`**                                                | banco pré-gerado versionado; LLM no navegador (WebGPU) |
| Modelo          | **comparar `gpt-oss:20b` e `qwen3.8:27b-mlx` e escolher lendo os textos** | escolher pelo tamanho                                  |
| Escopo          | **todos os tópicos em que problema de palavra faz sentido (~40 de 130)**  | piloto de 3; só Álgebra e Funções                      |

### O que a rota ao vivo custa — dito uma vez

| Onde                                           | Funciona?                                                                                    |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Mac, com `ng serve` em `http://localhost:4200` | **sim**                                                                                      |
| Mac, no site publicado (`https://…github.io`)  | **não** — página https não chama `http://localhost` (mixed content + Private Network Access) |
| iPhone, no site publicado                      | **não** — a LLM está no Mac                                                                  |
| iPhone no ônibus ou no avião                   | **não**                                                                                      |

Isso é o oposto da restrição que originou o monta monta, que existe justamente para quem
está no celular sem papel. Duas mitigações entram no desenho desde já, e nenhuma delas
contraria a escolha:

- **Cache local do que já foi gerado** (`localStorage`, por tópico/nível/forma, com teto de
  bytes e descarte do mais antigo — o mesmo padrão que o rascunho já usa). O que você viu
  uma vez continua valendo depois, inclusive sem a LLM no ar.
- **Exportar o cache para um banco versionado** fica a um comando de distância
  (`npm run exportar:problemas`). Se um dia você quiser que o celular tenha histórias,
  nada do que foi feito se perde: o formato com lacunas é o mesmo, e o validador é o mesmo.

Também fica registrado o caminho honesto para o celular com LLM ao vivo, caso você queira:
um túnel https para o Ollama (`cloudflared tunnel --url http://localhost:11434`) mais
`OLLAMA_ORIGINS=https://victorbarbosa.github.io`. Funciona com o Mac ligado e com rede;
nunca no avião.

---

## 3. Arquitetura

Cinco camadas, e a mais importante é a última.

```
core/problemas/
  prompt/montar-prompt.ts          puro, sem imports — o pedido
  validacao/validar-modelo.ts      puro, sem imports — o portão
  servicos/llm.service.ts          fala com o Ollama; sabe desistir
  servicos/fila-de-problemas.ts    lote, fila, cache, reposição
  vestir/vestir-enunciado.ts       troca {0} por numeroEscrito(valor, idioma)
```

`prompt` e `validacao` não importam **nada** de propósito: rodam igual no navegador e num
script de linha de comando, e é por isso que o comparador de modelos usa o validador de
verdade em vez de uma cópia.

### A camada que protege os 135 guardas de determinismo

**A LLM não entra no `gerar()`.** O gerador continua puro e semeado, e por isso
`verificar:geradores` (135 arquivos conferidos) e os 9 175 testes continuam valendo sem
tocar em um deles. A história é vestida **na hora de exibir**, no componente de treino:

```
gerar(nivel, rng)  →  Exercicio { enunciado: 'Resolva 3x + 7 = 22', ... }   ← puro, semeado
                            ↓ na exibição, se houver história na fila
                      'Uma oficina cobra 3 reais por hora…'                  ← cosmético
```

Se a fila estiver vazia, se a LLM estiver fora, se o modelo não servir para os valores
sorteados — aparece o enunciado de hoje. **O caminho de hoje nunca deixa de existir.**

### Como um tópico adere

Só isso, por tópico:

```ts
export const geradorEquacao1: GeradorExercicio<number> = {
  topicoId: 'equacao-primeiro-grau',
  // … tudo como já é …
  problemaDeTexto: {
    forma: 'ax-mais-b',
    dados: [
      { indice: 0, significado: 'o valor que se repete a cada unidade', tipo: 'inteiro' },
      { indice: 1, significado: 'a parcela fixa', tipo: 'inteiro' },
      { indice: 2, significado: 'o total alcançado', tipo: 'inteiro' },
    ],
    pergunta: 'quantas unidades da grandeza que se repete',
    valores: (exercicio) => [exercicio.a, exercicio.b, exercicio.c],
    cabe: (valores) => valores.every((v) => Number.isInteger(v) && v > 0),
  },
};
```

`cabe` é o que impede «2,5 pessoas» e «idade negativa»: se os valores sorteados não
servem para a história, o tópico cai no enunciado de sempre naquele exercício.

---

## 4. O portão: o que é descartado antes de chegar à tela

Implementado e testado (18 testes em `validar-modelo.spec.ts`). Cada regra fecha um jeito
concreto de o exercício sair errado:

| Regra                                     | O que ela evita                                                     |
| ----------------------------------------- | ------------------------------------------------------------------- |
| Nenhum dígito fora das lacunas            | número que não passou pelo sorteio — podendo ser a resposta, vazada |
| Nenhum número por extenso                 | o mesmo, escrito em palavras                                        |
| As lacunas `{0}`…`{n-1}`, uma vez cada    | `{2}` aparecendo na tela, ou dado escondido                         |
| A mesma ordem de lacunas nos três idiomas | trocar de idioma trocando os números de lugar                       |
| Tem pergunta (`?`)                        | história sem pedido                                                 |
| 40 a 240 caracteres                       | parágrafo que não cabe no celular; frase que não ensina             |
| Sem LaTeX e sem markdown                  | a prosa do site é texto puro (`formulas-do-site.spec.ts`)           |
| Sem «Problema:», «Resposta:», «Here is»   | a LLM falando com quem a chamou                                     |
| Assinatura, para repetição                | dez histórias iguais num lote de dez                                |

«um», «uma», «un», «une», «a» e «an» ficam **fora** da lista de números por extenso: em
três línguas eles são artigo muito mais vezes do que número, e recusar por causa deles
jogaria fora enunciados bons. É uma folga consciente.

---

## 5. A fila, o lote e o carregamento

Era o pedido explícito: gerar várias de uma vez e explicar a espera.

- **Lote**: um pedido ao Ollama devolve N histórias (padrão 6) para um tópico, nível e
  forma, com `format` de esquema JSON — o Ollama garante JSON válido.
- **Fila por tópico/nível/forma**, em sinal. Ao consumir uma, se sobrarem menos de 3 a
  reposição dispara em segundo plano. Ou seja: **a próxima já está pronta quando você
  termina a atual**, que é exatamente o que você descreveu.
- **Nunca bloqueia.** O exercício aparece na hora, com o enunciado de hoje se a fila ainda
  está vazia. O indicador é discreto e explica: «preparando problemas em três idiomas —
  isto roda no seu computador». Sem spinner tampando a tela.
- **Cache** antes da rede: o que já voltou uma vez não é pedido de novo.
- **Desistência**: 20 s de limite, `AbortController`, e três falhas seguidas desligam a
  tentativa até a próxima troca de tópico. A LLM fora do ar não pode deixar o treino lento.

### Dois detalhes de raciocínio que já custaram caro no teste

Medido hoje, e vale ficar escrito:

- **`think: false` é obrigatório.** Na primeira execução, o `gpt-oss:20b` gastou o
  orçamento inteiro de tokens pensando e devolveu `content` vazio em dois de três pedidos
  (`done_reason: length`). O `qwen3.8:27b-mlx` aceita `think: false` e responde; o gpt-oss
  precisa de `think: 'low'`.
- **Escrever enunciado não é tarefa de raciocínio.** O modelo não tem conta para fazer —
  ele tem uma história para escrever. Deixar a cadeia de pensamento solta só gasta tempo.

---

## 5.1. O que a comparação dos dois modelos mostrou (14/11)

Seis pedidos por tópico, por modelo, com o validador de verdade. Tabela completa e os
textos em `comparacao-modelos.md`.

| Modelo                             | Álgebra | Razão | Estequiometria | Tempo do lote |
| ---------------------------------- | ------- | ----- | -------------- | ------------- |
| `qwen3.8:27b-mlx` (`think: false`) | 6/6     | 6/6   | 2/6            | 32–53 s       |
| `gpt-oss:20b` (`think: 'low'`)     | 6/6     | 6/6   | 3/6            | 14–27 s       |

**No formato, os dois servem.** O gpt-oss é cerca de duas vezes mais rápido, o que importa
porque a fila repõe em segundo plano. Minha recomendação é o **gpt-oss:20b@low** pela
velocidade, mas a escolha é de quem lê os textos.

Três achados valem mais que a tabela:

1. **O portão pegou um erro de tradução de verdade.** O qwen escreveu «ao final do turno» e
   em francês pôs «à la fin de sa quinzaine» — quinzena, não turno. O erro era de tradução,
   mas a palavra carrega um número, e por isso a regra do número por extenso o barra. A
   lista cresceu por causa dele (treze a dezesseis, dúzia, dezena, centena, e as formas
   francesas em `-aine`), e o caso virou teste.
2. **O validador pega formato, não sentido.** Esta passou, e está incoerente:
   «Um caminhão faz {0} voltas por dia, tem {1} cargas iniciais e chega a {2} cargas no
   final da jornada. Quantas voltas completou?» — a pergunta cobra voltas, a história
   contabiliza cargas. Nenhuma expressão regular pega isso. **Com LLM ao vivo não existe
   etapa de revisão**, então o único canal de correção é o aluno: entra no desenho um botão
   discreto **«esta história está errada»**, que apaga o modelo do cache e nunca o mostra de
   novo. É barato e torna o modo ao vivo autocorretivo.
3. **Química é caso à parte, e perigoso.** Os dois modelos inventaram reações: «sulfato de
   potássio como reagente principal» para produzir ácido sulfúrico não existe. A equação
   balanceada vem do código, mas se a história nomeia as substâncias ela contradiz a
   equação — e isso é química falsa com aparência de verdadeira, que é o pior tipo de
   exercício. **Decisão registrada:** nos tópicos de química, ou a história não nomeia
   substância nenhuma (fala de «o reagente» e «o produto», e a equação aparece no
   `enunciadoTex`), ou química fica fora do escopo. Prefiro a primeira; quem decide é você.

---

## 5.2. Três regras que nasceram erradas, e a química que passou a funcionar

Rodar de verdade corrigiu o desenho em três pontos. Os números abaixo são do
`gpt-oss:20b@low`, seis pedidos por tópico:

| Rodada                                    | Álgebra | Razão   | Estequiometria                         |
| ----------------------------------------- | ------- | ------- | -------------------------------------- |
| Primeira, com química nomeando substância | 6/6     | 6/6     | 3/6 — e as aprovadas inventavam reação |
| Com a fórmula como dado                   | 6/6     | 4/6     | 2/6                                    |
| Com as três correções abaixo              | **6/6** | **6/6** | **6/6**                                |

1. **A fórmula química virou DADO.** A decisão «a história não nomeia substância» tinha um
   furo que só apareceu ao escrever o tópico: dizer «o reagente» é ambíguo numa equação de
   dois reagentes, e o exercício ficaria sem resposta. Agora o código passa `H₂O` e `CaCO₃`
   como valores de lacuna — a LLM se refere a eles e nunca os escolhe. `ValorDaLacuna`
   passou a ser `number | string`.
2. **Palavras proibidas por tópico.** Mesmo sem inventar fórmula, os modelos
   CLASSIFICAVAM: «massa de sal formado», «excesso de monômero», para reações em que nem
   uma nem outra palavra cabia. A lista é do tópico e não global, porque «sal» tem de ser
   recusado em estequiometria e aceito numa história de cozinha industrial.
3. **A regra «cada lacuna uma vez» valia só para número.** Ela recusou seis histórias boas
   de química seguidas: «quer saber a massa de {2}… quantos gramas de {2} resultam?» é
   escrita natural — quem repete é a substância, não o dado. Lacuna de tipo fórmula passou
   a ser repetível, e a exigência de mesma ordem nos três idiomas continua valendo.

E uma regra que estava escrita ao contrário: o prompt proibia dizer a unidade, e por isso
saíam enunciados com «a quantidade disponível é {0}», sem gramas. A proibição é da unidade
**da resposta**, que é contrato do corretor; a unidade de cada **dado** tem de estar no
texto, senão o número não significa nada.

---

## 5.3. A duplicação que eu criei e desfiz

Depois de escrever um `LlmService` do zero, descobri que **o projeto já conversava com o
Ollama desde antes**: `core/assistente/services/ollama.service.ts`, com a listagem de
modelos, o recuo do campo `think` para os modelos que o recusam, e a mensagem de «sem
contato» traduzida. Era a disciplina da casa que eu não segui — conferir a premissa no
código antes de construir.

O que ficou, depois de desfazer:

| Peça                                          | Onde                                                   |
| --------------------------------------------- | ------------------------------------------------------ |
| Falar com o Ollama                            | `assistente/ollama.service.ts`, que ganhou `pedirJson` |
| Política do lote (filtrar, repetir, desistir) | `problemas/servicos/lote-de-historias.ts`, sem Angular |
| Fila, cache, atribuição, descarte             | `problemas/servicos/historias.service.ts`              |

E um ganho que não estava no plano: **servidor e modelo vêm do assistente**, que o aluno já
configurou. Se o assistente funciona, as histórias funcionam — zero configuração. A escolha
manual continua possível, para quem quiser um modelo para conversar e outro para escrever.

Confirmado por medição: o Ollama libera `http://localhost:4200` por padrão (preflight
`204`, com `Access-Control-Allow-Origin` certo), então `ng serve` funciona **sem mexer em
`OLLAMA_ORIGINS`**. E `https://victorbarbosa.github.io` recebe `403` — como previsto na
seção 2.

---

## 6. Configuração, em Configurações

| Opção                | Padrão                                         |
| -------------------- | ---------------------------------------------- |
| Problemas de palavra | ligado quando o endpoint responde              |
| Endpoint             | `http://localhost:11434` (aceita URL de túnel) |
| Modelo               | o escolhido na comparação                      |
| Histórias por lote   | 6                                              |

---

## 7. Escopo: onde faz sentido

Problema de palavra só serve onde **interpretar o enunciado é parte da matéria**. Em
notação matemática, fatoração, distribuição eletrônica ou balanceamento, não é — ali a
pergunta já é a conta.

Entram (~40): equações de 1º e 2º grau, sistemas lineares, razão e proporção, porcentagem,
regra de três, juros, funções afim e quadrática, exponencial e logarítmica, progressões,
estatística, geometria aplicada (área, volume, semelhança), trigonometria aplicada,
cinemática, leis de Newton, energia, fluidos, térmica, e os tópicos de química com conta
de laboratório — mol, estequiometria, limitante, soluções, gases —, **estes últimos só com
história que não nomeia substância** (seção 5.1, achado 3).

---

## 8. Guardas, e o que o CI nunca faz

- `validar-modelo.spec.ts` — as regras do portão, caso a caso (**feito**: 18 testes).
- `vestir-enunciado.spec.ts` — o enunciado vestido passa pelas mesmas regras que os
  enunciados escritos à mão: separador decimal por idioma, mesmos números na mesma ordem,
  sem LaTeX na prosa.
- `problemas.spec.ts` — todo gerador que declara `problemaDeTexto` declara dado para cada
  lacuna, e `valores()` devolve a quantidade declarada.
- **O CI não chama a LLM.** Não há rede nos testes, e um teste que depende de um modelo
  local não é um teste. O comparador de modelos é ferramenta de máquina, não de CI.

---

## 9. Ordem de trabalho

| Fase | O quê                                                            | Estado             |
| ---- | ---------------------------------------------------------------- | ------------------ |
| 0    | Validador e prompt puros, com testes                             | **feito em 14/11** |
| 1    | Comparador dos dois modelos, com os textos lado a lado para ler  | **feito em 14/11** |
| 2    | Serviço do Ollama, fila com lote e cache, indicador de preparo   | a fazer            |
| 3    | `vestir-enunciado` e a adesão do gerador, sem tocar no `gerar()` | a fazer            |
| 4    | Três tópicos de verdade, publicados, para você usar              | a fazer            |
| 5    | Os ~40 tópicos, um a um (declarar dados, significados e `cabe`)  | a fazer            |

---

## 10. O que eu não decido sozinho

Pela regra do plano de currículo — decisão que mexe em ordem, contagem, identificadores,
rotas ou progresso é registrada, não executada:

1. **Nada aqui muda identificador, rota, ordem da trilha ou progresso.** A história é
   cosmética: o `id` do exercício, os números, o gabarito e o registro de acertos são os
   de hoje. **Uma consequência a registrar:** ao rever um exercício do histórico, a
   história pode ser outra (o texto da LLM não é semeado). Os números e a resposta, não.
2. **Qual modelo** — depende de você ler `comparacao-modelos.md`.
3. **Se vale alcançar o iPhone** com banco versionado, depois de você usar no Mac.
4. **Se a história deve poder vir sem contexto de engenharia.** Hoje o prompt pede oficina,
   laboratório, obra, voo, transporte. Se você preferir contexto mais variado, é uma linha.

---

## 11. Riscos que eu não escondo

- **Francês e inglês de modelo local escorregam.** Com LLM ao vivo, o revisor é você no
  meio do exercício — não há etapa de revisão. O validador pega formato, não estilo.
- **A história pode ficar artificial** («um fazendeiro tem {0} cercas»). O prompt empurra
  para contextos de engenharia, mas isso é qualidade, não correção.
- **Latência.** Medido hoje: 27 a 51 s para um lote de 6 no `qwen3.8:27b-mlx`. Com fila e
  reposição em segundo plano, isso não aparece — a não ser no primeiro exercício de um
  tópico, que é justamente onde o indicador de preparo existe.
- **O cache cresce.** Teto de bytes e descarte do mais antigo, como no rascunho.
