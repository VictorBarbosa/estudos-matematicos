# Equações trigonométricas

Funções inversas (arcsen, arccos, arctg) e equações como sen x = k na primeira volta.

**Área:** Trigonometria · **Rota:** `/trigonometria/equacoes-trigonometricas`

## O que este módulo tem

- `equacoes-trigonometricas.ts` / `.html` / `.scss` — componente dentro de `<app-topico-layout>`,
  com as abas **Explorar** (a curva, a reta y = k e os cruzamentos) e **Treinar**.
- `equacoes-trigonometricas.gerador.ts` — `GeradorExercicio`: inversa de valor notável e
  decimal, sen/cos/tg x = k, a·f(x) + b = c, arco múltiplo e a equação do 2º grau em sen x.
  As armadilhas são os erros do tema: esquecer a segunda solução, usar a simetria da outra
  função, responder em radianos, dar um ângulo fora da imagem da inversa.
- `equacoes-trigonometricas.teoria.ts` — os popups de teoria, como dado tipado.
- `equacoes-trigonometricas.spec.ts` — testes do gerador.

A matemática em si está em `src/app/core/math/trigonometria/equacoes-trig/`.

## Por que existe

É pré-requisito da substituição trigonométrica em `calculo-2/tecnicas-de-integracao`, e a
avaliação de 09/11/2026 o apontou como lacuna da área.
