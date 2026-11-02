# Razão e proporção

Comparação entre grandezas, regra de três e proporcionalidade inversa.

**Área:** Matemática básica · **Rota:** `/matematica-basica/razao-proporcao`

## No Difícil, só o enunciado

Nos dois primeiros níveis o exercício traz a montagem pronta ao lado do texto —
`\frac{a}{b} = \frac{c}{x}` na direta, `a \cdot b = c \cdot x` na inversa. No **Difícil ela
some**: `enunciadoTex` recebe `SEM_FORMULA`, e a tela não desenha fórmula nenhuma.

O motivo é que a fórmula era a resposta. Decidir se as grandezas crescem juntas ou em sentidos
opostos, e montar a proporção a partir disso, é a única coisa que este tópico ensina — e ver
`a \cdot b = c \cdot x` escrito já entrega que a relação é inversa. Com o texto sozinho, a
montagem volta a ser trabalho de quem responde.

A fórmula não sumiu do tópico: ela aparece na resolução, depois da resposta, que é quando
ela ensina em vez de entregar. A dica do nível também continua — mas é uma pergunta ("as
grandezas crescem juntas ou em sentidos opostos?"), não uma resposta.

## O que este módulo precisa ter

- `razao-proporcao.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** e **Treinar**.
- `razao-proporcao.gerador.ts` — `GeradorExercicio`, incluindo as armadilhas
  (os erros típicos deste tema) que tornam a correção didática.
- `razao-proporcao.teoria.ts` — conteúdo dos popups de teoria, como dado tipado.
- `razao-proporcao.spec.ts` — testes do gerador.

A matemática em si vai em `src/app/core/math/`, nunca nesta pasta, para que
outros tópicos possam reaproveitá-la.

## Ao concluir

1. Registre a rota em `src/app/features/matematica-basica/matematica-basica.routes.ts`.
2. Marque `pronto: true` no currículo (`src/app/curriculo/curriculo.ts`).
