import {
  ARCOS_DA_DERIVADA,
  FuncaoTrig,
  arcoTexto,
  arcoValor,
  arcoVezes,
  cossenoExato,
  derivadaProdutoComTrigComPassos,
  derivadaPotenciaTrigComPassos,
  derivadaTrigExata,
  derivadaTrigNoPontoComPassos,
  exatoValor,
  senoExato,
  temTangente,
  trigParaTex,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import {
  FORMATO_NUMERICO_AMPLO,
  analisarNumero,
  numeroComCasas,
} from '@core/treino/resposta-numerica/resposta-numerica';
import {
  Armadilha,
  Exercicio,
  GeradorExercicio,
  Nivel,
  semColisoes,
} from '@core/treino/models/treino.model';

/**
 * Exercícios de derivada de seno, cosseno e tangente.
 *
 * Todos pedem o valor de `f'` num arco notável, porque é aí que a resposta é um
 * número fechado e o erro de sinal fica visível: quem derivou o cosseno sem o
 * menos chega ao simétrico exato, e a correção consegue dizer isso.
 */

const CASAS = 3;
const { saoEquivalentes, formatar } = numeroComCasas(CASAS);

/** O enunciado avisa as duas formas aceitas, porque as duas são digitáveis. */
const PEDIDO = 'Responda na forma exata ou com 3 casas decimais.';

type Tipo = 'tabela' | 'cadeia' | 'tangente' | 'produto' | 'potencia';

const TIPOS_POR_NIVEL: Readonly<Record<Nivel, readonly Tipo[]>> = {
  facil: ['tabela'],
  medio: ['cadeia', 'tangente', 'produto'],
  dificil: ['cadeia', 'tangente', 'produto', 'potencia'],
};

export const geradorDerivadasTrig: GeradorExercicio<number> = {
  topicoId: 'derivadas-trigonometricas',
  formatoResposta: FORMATO_NUMERICO_AMPLO,

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const tipo = rng.escolher(TIPOS_POR_NIVEL[nivel]);

    switch (tipo) {
      case 'tabela':
        return daTabela(nivel, rng);
      case 'cadeia':
        return comCadeia(nivel, rng);
      case 'tangente':
        return daTangente(nivel, rng);
      case 'produto':
        return doProduto(nivel, rng);
      default:
        return daPotencia(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes,
  formatar,
};

/** `a·sen(x)` e `a·cos(x)`: só a tabela, sem cadeia nenhuma. */
function daTabela(nivel: Nivel, rng: Rng): Exercicio<number> {
  const funcao: FuncaoTrig = rng.booleano() ? 'sen' : 'cos';
  const a = rng.inteiro(1, 6);
  const arco = rng.escolher(ARCOS_DA_DERIVADA);

  const gabarito = exatoValor(derivadaTrigExata(funcao, a, 1, arco));
  // Quem troca o sinal do cosseno — ou inventa um para o seno — cai aqui.
  const trocouSinal = -gabarito;
  const valorDaFuncao =
    a * (funcao === 'sen' ? exatoValor(senoExato(arco)) : exatoValor(cossenoExato(arco)));
  const derivouComoOutra =
    a * (funcao === 'sen' ? -exatoValor(senoExato(arco)) : exatoValor(cossenoExato(arco)));

  return montar({
    chave: `tabela-${funcao}-${a}-${arco.k}-${arco.m}`,
    nivel,
    rng,
    enunciado: `Derive e calcule f'(${arcoTexto(arco)}). ${PEDIDO}`,
    enunciadoTex: `f(x) = ${trigParaTex(funcao, a, 1)}`,
    gabarito,
    resolucao: derivadaTrigNoPontoComPassos(funcao, a, 1, arco),
    conceitos: ['trig-derivada.tabela', 'trig-derivada.sinal'],
    armadilhas: [
      {
        resposta: trocouSinal,
        diagnostico:
          funcao === 'cos'
            ? 'A derivada do cosseno é MENOS o seno. Sem o sinal negativo o resultado sai ' +
              'exatamente simétrico — é o erro mais comum da tabela inteira.'
            : 'A derivada do seno é o cosseno, sem sinal trocado. O menos pertence ao cosseno, ' +
              'não ao seno.',
        passo: 0,
        conceito: 'trig-derivada.sinal',
      },
      {
        resposta: valorDaFuncao,
        diagnostico:
          `Esse é o valor da própria função em ${arcoTexto(arco)}, não o da derivada. ` +
          'O enunciado pede a taxa de variação, não a altura da curva.',
        passo: 1,
        conceito: 'trig-derivada.tabela',
      },
      {
        resposta: derivouComoOutra,
        diagnostico:
          'As duas derivadas foram trocadas entre si. Vale guardar o ciclo: seno vira cosseno, ' +
          'cosseno vira menos seno, e só depois de quatro passos a função volta a ser ela mesma.',
        passo: 0,
        conceito: 'trig-derivada.tabela',
      },
    ],
    dica: 'Comece pela tabela: seno vira cosseno, cosseno vira menos seno.',
  });
}

/** `a·f(bx)`: a tabela mais o fator interno. */
function comCadeia(nivel: Nivel, rng: Rng): Exercicio<number> {
  const funcao: FuncaoTrig = rng.booleano() ? 'sen' : 'cos';
  const a = rng.inteiro(1, 5);
  const b = rng.inteiro(2, nivel === 'dificil' ? 4 : 3);
  const arco = rng.escolher(ARCOS_DA_DERIVADA);

  const gabarito = exatoValor(derivadaTrigExata(funcao, a, b, arco));
  const semFatorInterno = gabarito / b;
  const interno = arcoVezes(arco, b);

  const armadilhas: readonly Armadilha<number>[] = [
    {
      resposta: semFatorInterno,
      diagnostico:
        `Faltou multiplicar pela derivada de dentro, que vale ${b}. O resultado fica ${b} vezes ` +
        'menor que o correto, e é o descuido mais frequente da regra da cadeia.',
      passo: 1,
      conceito: 'trig-derivada.cadeia',
    },
    {
      resposta: -gabarito,
      diagnostico:
        funcao === 'cos'
          ? 'O sinal negativo da derivada do cosseno ficou de fora.'
          : 'A derivada do seno é o cosseno, e ela não troca de sinal.',
      passo: 0,
      conceito: 'trig-derivada.sinal',
    },
    {
      resposta:
        a * b * (funcao === 'sen' ? exatoValor(cossenoExato(arco)) : -exatoValor(senoExato(arco))),
      diagnostico:
        `O argumento da função trigonométrica é ${arcoTexto(interno)}, e não ${arcoTexto(arco)}. ` +
        'O fator interno multiplica a derivada E entra no argumento.',
      passo: 2,
      conceito: 'trig-derivada.cadeia',
    },
  ];

  return montar({
    chave: `cadeia-${funcao}-${a}-${b}-${arco.k}-${arco.m}`,
    nivel,
    rng,
    enunciado: `Derive e calcule f'(${arcoTexto(arco)}). ${PEDIDO}`,
    enunciadoTex: `f(x) = ${trigParaTex(funcao, a, b)}`,
    gabarito,
    resolucao: derivadaTrigNoPontoComPassos(funcao, a, b, arco),
    conceitos: ['trig-derivada.cadeia', 'trig-derivada.tabela'],
    armadilhas,
    dica:
      nivel === 'medio' ? 'O argumento não é x: ele traz um fator que precisa sair.' : undefined,
  });
}

/** `a·tan(bx)`: a secante ao quadrado, que nunca é negativa. */
function daTangente(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.inteiro(1, 5);
  const b = nivel === 'dificil' ? rng.inteiro(1, 3) : 1;
  const arco = rng.escolher(
    ARCOS_DA_DERIVADA.filter((candidato) => temTangente(arcoVezes(candidato, b))),
  );

  const gabarito = exatoValor(derivadaTrigExata('tan', a, b, arco));
  const interno = arcoVezes(arco, b);
  const comoSeFosseSecante = (a * b) / exatoValor(cossenoExato(interno));

  return montar({
    chave: `tangente-${a}-${b}-${arco.k}-${arco.m}`,
    nivel,
    rng,
    enunciado: `Derive e calcule f'(${arcoTexto(arco)}). ${PEDIDO}`,
    enunciadoTex: `f(x) = ${trigParaTex('tan', a, b)}`,
    gabarito,
    resolucao: derivadaTrigNoPontoComPassos('tan', a, b, arco),
    conceitos: ['trig-derivada.tangente', 'trig-derivada.cadeia'],
    armadilhas: [
      {
        resposta: comoSeFosseSecante,
        diagnostico:
          'A derivada da tangente é a secante AO QUADRADO. Sem o quadrado o valor muda, e o ' +
          'sinal pode até ficar negativo — coisa que a derivada da tangente nunca é.',
        passo: 0,
        conceito: 'trig-derivada.tangente',
      },
      {
        resposta: gabarito / b,
        diagnostico: `Faltou o fator interno ${b}, que a cadeia traz para fora junto com a secante.`,
        passo: 1,
        conceito: 'trig-derivada.cadeia',
      },
      {
        resposta: a * Math.tan(arcoValor(interno)),
        diagnostico: `Esse é o valor da tangente em ${arcoTexto(arco)}, não o da sua derivada.`,
        passo: 2,
        conceito: 'trig-derivada.tangente',
      },
    ],
    dica:
      nivel === 'medio'
        ? 'A secante é o inverso do cosseno — e o quadrado é dela toda.'
        : undefined,
  });
}

/** `xⁿ·f(x)`: a regra do produto encontrando a tabela. */
function doProduto(nivel: Nivel, rng: Rng): Exercicio<number> {
  const funcao: 'sen' | 'cos' = rng.booleano() ? 'sen' : 'cos';
  const n = rng.inteiro(1, nivel === 'dificil' ? 3 : 2);
  const arco = rng.escolher(ARCOS_DA_DERIVADA);

  const x = arcoValor(arco);
  const f = funcao === 'sen' ? Math.sin : Math.cos;
  const linha = funcao === 'sen' ? Math.cos : (t: number) => -Math.sin(t);

  const gabarito = n * x ** (n - 1) * f(x) + x ** n * linha(x);
  const soASegundaParcela = x ** n * linha(x);
  const produtoDasDerivadas = n * x ** (n - 1) * linha(x);

  const potenciaTexto = n === 1 ? 'x' : `x elevado a ${n}`;

  return montar({
    chave: `produto-${funcao}-${n}-${arco.k}-${arco.m}`,
    nivel,
    rng,
    enunciado: `Derive e calcule f'(${arcoTexto(arco)}). ${PEDIDO}`,
    enunciadoTex: `f(x) = ${n === 1 ? 'x' : `x^{${n}}`}\\,${funcao === 'sen' ? '\\operatorname{sen}' : '\\cos'}(x)`,
    gabarito,
    resolucao: derivadaProdutoComTrigComPassos(n, funcao, arco),
    conceitos: ['trig-derivada.produto', 'trig-derivada.tabela'],
    armadilhas: [
      {
        resposta: produtoDasDerivadas,
        diagnostico:
          'A derivada de um produto não é o produto das derivadas. São duas parcelas: a derivada ' +
          'do primeiro vezes o segundo, mais o primeiro vezes a derivada do segundo.',
        passo: 0,
        conceito: 'trig-derivada.produto',
      },
      {
        resposta: soASegundaParcela,
        diagnostico:
          `Faltou a parcela que deriva ${potenciaTexto} e mantém a função trigonométrica. ` +
          'A regra do produto sempre soma duas parcelas, nunca uma.',
        passo: 1,
        conceito: 'trig-derivada.produto',
      },
      {
        resposta: n * x ** (n - 1) * f(x),
        diagnostico:
          'Essa é só a primeira parcela: a potência foi derivada e a função trigonométrica, ' +
          'mantida. Falta a segunda, que deriva a trigonométrica.',
        passo: 1,
        conceito: 'trig-derivada.produto',
      },
    ],
  });
}

/** `senⁿ(x)`: a potência por fora, a trigonométrica por dentro. */
function daPotencia(nivel: Nivel, rng: Rng): Exercicio<number> {
  const funcao: 'sen' | 'cos' = rng.booleano() ? 'sen' : 'cos';
  const n = rng.inteiro(2, 4);
  const arco = rng.escolher(ARCOS_DA_DERIVADA);

  const base = funcao === 'sen' ? exatoValor(senoExato(arco)) : exatoValor(cossenoExato(arco));
  const derivadaBase =
    funcao === 'sen' ? exatoValor(cossenoExato(arco)) : -exatoValor(senoExato(arco));

  const gabarito = n * base ** (n - 1) * derivadaBase;
  const semDerivadaInterna = n * base ** (n - 1);
  const comExpoenteMantido = n * base ** n * derivadaBase;

  return montar({
    chave: `potencia-${funcao}-${n}-${arco.k}-${arco.m}`,
    nivel,
    rng,
    enunciado: `Derive e calcule f'(${arcoTexto(arco)}). ${PEDIDO}`,
    enunciadoTex: `f(x) = ${funcao === 'sen' ? '\\operatorname{sen}' : '\\cos'}^{${n}}(x)`,
    gabarito,
    resolucao: derivadaPotenciaTrigComPassos(funcao, n, arco),
    conceitos: ['trig-derivada.potencia', 'trig-derivada.cadeia'],
    armadilhas: [
      {
        resposta: semDerivadaInterna,
        diagnostico:
          'A potência foi derivada corretamente, mas faltou multiplicar pela derivada da função ' +
          'de dentro. É a cadeia: a camada interna sempre contribui com um fator.',
        passo: 1,
        conceito: 'trig-derivada.potencia',
      },
      {
        resposta: comExpoenteMantido,
        diagnostico:
          'Ao derivar uma potência o expoente desce e DIMINUI em um. Aqui ele desceu, mas ' +
          'continuou o mesmo lá em cima.',
        passo: 1,
        conceito: 'trig-derivada.potencia',
      },
      {
        resposta: base ** n,
        diagnostico: 'Esse é o valor da própria função no arco, não o da derivada.',
        passo: 2,
        conceito: 'trig-derivada.tabela',
      },
    ],
  });
}

interface Pedido {
  readonly chave: string;
  readonly nivel: Nivel;
  readonly rng: Rng;
  readonly enunciado: string;
  readonly enunciadoTex: string;
  readonly gabarito: number;
  readonly resolucao: Exercicio<number>['resolucao'];
  readonly conceitos: readonly string[];
  readonly armadilhas: readonly Armadilha<number>[];
  readonly dica?: string;
}

function montar(pedido: Pedido): Exercicio<number> {
  return {
    id: `${pedido.chave}-${pedido.rng.inteiro(0, 9999)}`,
    nivel: pedido.nivel,
    enunciado: pedido.enunciado,
    enunciadoTex: pedido.enunciadoTex,
    gabarito: pedido.gabarito,
    resolucao: pedido.resolucao,
    conceitos: pedido.conceitos,
    armadilhas: semColisoes(
      pedido.armadilhas.filter((armadilha) => Number.isFinite(armadilha.resposta)),
      pedido.gabarito,
      saoEquivalentes,
    ),
    dica: pedido.dica,
  };
}
