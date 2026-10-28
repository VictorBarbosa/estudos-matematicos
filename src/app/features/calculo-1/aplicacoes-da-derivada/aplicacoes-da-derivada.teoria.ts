import { Polinomio, derivarPolinomioComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_APLICACOES_DERIVADA: readonly Teoria[] = [
  {
    id: 'aplic-derivada.extremos',
    titulo: 'Máximos e mínimos',
    resumo: 'Nos extremos a tangente fica horizontal.',
    definicao:
      'Onde a função para de subir e começa a descer, a inclinação passa por zero. Por isso ' +
      'os candidatos a extremo são os pontos em que a derivada se anula — os pontos críticos.',
    formulas: [
      { tex: "f'(c) = 0 \;\\Rightarrow\; c \\text{ é ponto crítico}" },
      { tex: "f''(c) > 0 \\to \\text{mínimo} \\qquad f''(c) < 0 \\to \\text{máximo}" },
    ],
    demonstracao: [
      {
        descricao: 'Antes de um máximo a função sobe, depois desce.',
        tex: "f' > 0 \;\\to\; f' = 0 \;\\to\; f' < 0",
      },
      {
        descricao: 'A derivada troca de sinal passando por zero.',
        tex: "f'(c) = 0",
      },
      {
        descricao: 'A segunda derivada diz para que lado a curva se abre ali.',
        tex: "f''(c) < 0 \;\\Rightarrow\; \\text{concavidade para baixo} \;\\Rightarrow\; \\text{máximo}",
        nota: 'É o teste da segunda derivada, que dispensa analisar o sinal ao redor.',
      },
      {
        descricao: 'Derivada nula não garante extremo: pode ser uma inflexão.',
        tex: "f(x) = x^{3} \;\\Rightarrow\; f'(0) = 0, \\text{ mas não há extremo}",
      },
    ],
    exemplo: {
      enunciado: 'Derivando x³ − 3x para encontrar seus extremos.',
      passos: derivarPolinomioComPassos(Polinomio.de(0, -3, 0, 1)).passos,
    },
    vejaTambem: ['aplic-derivada.concavidade', 'aplic-derivada.otimizacao'],
  },
  {
    id: 'aplic-derivada.concavidade',
    titulo: 'Concavidade e inflexão',
    resumo: 'A segunda derivada diz se a curva abre para cima ou para baixo.',
    definicao:
      'A segunda derivada é a taxa de variação da inclinação. Positiva, a inclinação cresce ' +
      'e a curva abre para cima; negativa, abre para baixo. Onde ela troca de sinal há um ' +
      'ponto de inflexão.',
    formulas: [
      { tex: "f'' > 0 \\to \\text{côncava para cima}" },
      { tex: "f'' < 0 \\to \\text{côncava para baixo}" },
      { tex: "f'' = 0 \\text{ e troca de sinal} \\to \\text{inflexão}" },
    ],
    demonstracao: [
      {
        descricao: 'A segunda derivada mede como a INCLINAÇÃO muda.',
        tex: "f'' = (f')'",
      },
      {
        descricao: 'Inclinação crescente significa curva abrindo para cima.',
        tex: "f' \\text{ crescente} \\iff f'' > 0",
      },
      {
        descricao: 'Na inflexão, a curva muda de lado.',
        tex: 'x^{3} \;\\text{tem inflexão em}\; x = 0',
        nota: 'Antes abre para baixo, depois para cima.',
      },
    ],
    exemplo: {
      enunciado: 'A segunda derivada de x³ − 3x é 6x, que troca de sinal em zero.',
      passos: derivarPolinomioComPassos(Polinomio.de(-3, 0, 3)).passos,
    },
    vejaTambem: ['aplic-derivada.extremos', 'aplic-derivada.otimizacao'],
  },
  {
    id: 'aplic-derivada.otimizacao',
    titulo: 'Problemas de otimização',
    resumo: 'Modelar, derivar, igualar a zero.',
    definicao:
      'Problemas de máximo e mínimo seguem sempre o mesmo roteiro: escrever a grandeza a ' +
      'otimizar como função de uma variável, derivar, igualar a zero e verificar se o ponto ' +
      'crítico encontrado é realmente o extremo procurado.',
    formulas: [
      { tex: "\\text{modelar} \\to \\text{derivar} \\to f' = 0 \\to \\text{verificar}" },
    ],
    demonstracao: [
      {
        descricao: 'Com 100 m de cerca, qual retângulo tem área máxima?',
        tex: '2x + 2y = 100 \;\\Rightarrow\; y = 50 - x',
      },
      {
        descricao: 'A área fica em função de uma só variável.',
        tex: 'A(x) = x(50 - x) = 50x - x^{2}',
      },
      {
        descricao: 'Derivamos e igualamos a zero.',
        tex: "A'(x) = 50 - 2x = 0 \;\\Rightarrow\; x = 25",
      },
      {
        descricao: 'A segunda derivada confirma que é máximo.',
        tex: "A'' = -2 < 0 \;\\Rightarrow\; \\text{máximo}",
        nota: 'O retângulo de área máxima com perímetro fixo é sempre o quadrado.',
      },
    ],
    exemplo: {
      enunciado: 'A função da área do problema da cerca.',
      passos: derivarPolinomioComPassos(Polinomio.de(0, 50, -1)).passos,
    },
    vejaTambem: ['aplic-derivada.extremos', 'quadratica.otimizacao'],
  },
];
