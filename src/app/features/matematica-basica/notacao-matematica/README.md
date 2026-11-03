# Notação matemática

Ler o que os símbolos dizem — e escrever em símbolos o que se quer dizer.

**Área:** Matemática básica · **Rota:** `/matematica-basica/notacao-matematica`

## Duas mãos, nenhuma delas de múltipla escolha

**Ler vira conta.** Quem entende `\sum_{k=1}^{4} k^2` chega a 30, e quem não entende não
chega. Pedir o valor em vez da tradução em palavras tem uma vantagem que múltipla escolha
não tem: não há como acertar por eliminação. Os exercícios de leitura cobrem somatório,
produtório, módulo e fatorial, intervalos, operações entre conjuntos e a assinatura de uma
função.

**Escrever revela se a leitura é real.** Reconhecer `∀` numa página é fácil; decidir que a
frase "todo quadrado é não negativo" pede `∀`, `∈` e `≥`, nessa ordem, exige saber o que
cada símbolo faz. Esses exercícios vêm com `SEM_FORMULA` — a notação é a resposta, não a
pergunta.

## A correção cobra conteúdo, não digitação

`canonizarNotacao` reduz todas as grafias de uma mesma coisa a uma só, e é ela que a
correção compara. Valem igualmente:

```
∀x ∈ ℝ, x² ≥ 0
\forall x \in \mathbb{R}, x^{2} \geq 0
∀x∈R, x^2 >= 0
∀x ∈ ℝ: x² ≥ 0
```

O `R` solto só vira `ℝ` depois de `∈`, `⊂` ou `→`. Em `R = 10`, R continua sendo uma letra —
numa fórmula de física ele é resistência.

Quando uma frase admite mais de uma escrita legítima, o gabarito carrega todas em `aceitas`.

## A paleta de símbolos

`∀`, `∈` e `∑` não estão no teclado de ninguém: sem paleta, o tópico pediria o impossível.
O gerador declara `simbolos`, e o campo de resposta mostra os botões — alguns inserem um
símbolo solto, outros um esqueleto com o cursor onde falta preencher (`f()`, `|  |`,
`∑_{k=1}^{n}`). É um campo opcional do `GeradorExercicio`: quem não declara nada continua
com o campo de sempre.

## O que este módulo precisa ter

- `notacao-matematica.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `notacao-matematica.gerador.ts` — `GeradorExercicio`, com a paleta e as armadilhas.
- `notacao-matematica.teoria.ts` — os popups de teoria, como dado tipado.
- `notacao-matematica.spec.ts` — testes do gerador e do normalizador.

A matemática em si vai em `src/app/core/math/notacao/`, nunca nesta pasta: a tabela de
símbolos e o normalizador são reaproveitáveis.

## A aba Explorar

Um dicionário vivo: cada símbolo com o nome que tem, como se lê em voz alta em **português,
francês e inglês**, e um exemplo. O curso é no Québec e a bibliografia é em inglês — um
símbolo que não se sabe dizer em voz alta é um símbolo que não se usa para pensar.

O somatório ganha um painel à parte porque é onde a leitura mais falha: arrastar o limite de
cima e ver a expansão mudar é o que o transforma em conta.
