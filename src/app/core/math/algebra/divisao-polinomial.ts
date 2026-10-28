import { Polinomio, formatar } from '@core/math/algebra/polinomio';
import { divisores } from '@core/math/numeros/inteiros';
import { ErroMatematico, Passo, Resolucao } from '@core/math/tipos';

/**
 * Divisão de polinômios, teorema do resto e busca de raízes.
 *
 * É o que falta entre "sei resolver ax² + bx + c = 0" e "sei lidar com um
 * polinômio de grau qualquer": achar uma raiz, dividir por ela e cair num grau
 * menor, até sobrar algo que a fórmula de Bhaskara resolve.
 */

export interface DivisaoPolinomial {
  readonly quociente: Polinomio;
  readonly resto: Polinomio;
}

/**
 * Divisão longa: devolve quociente e resto com grau(resto) < grau(divisor).
 *
 * O algoritmo é o da chave: olha o termo de maior grau, descobre por quanto
 * multiplicar o divisor para igualá-lo, subtrai e repete.
 */
export function dividirComPassos(
  dividendo: Polinomio,
  divisor: Polinomio,
): Resolucao<DivisaoPolinomial> {
  if (divisor.ehNulo) {
    throw new ErroMatematico('Não há divisão polinomial por zero.');
  }

  const passos: Passo[] = [
    {
      descricao: 'Montamos a divisão, os dois polinômios ordenados pelo maior grau.',
      tex: `\\frac{${dividendo.paraTex()}}{${divisor.paraTex()}}`,
    },
  ];

  let resto = dividendo;
  let quociente = Polinomio.ZERO;

  // Enquanto o resto tiver grau suficiente, cabe mais uma rodada.
  while (!resto.ehNulo && resto.grau >= divisor.grau) {
    const grau = resto.grau - divisor.grau;
    const fator = resto.coeficiente(resto.grau) / divisor.coeficiente(divisor.grau);
    const termo = Polinomio.deGraus({ [grau]: fator });

    const subtraido = divisor.multiplicar(termo);
    const novoResto = resto.subtrair(subtraido);

    passos.push({
      descricao: `Dividimos o termo de maior grau e subtraímos o produto.`,
      tex:
        `${termo.paraTex()} \\cdot \\left(${divisor.paraTex()}\\right) = ${subtraido.paraTex()}` +
        ` \;\\Rightarrow\; ${novoResto.paraTex()}`,
    });

    quociente = quociente.somar(termo);
    resto = novoResto;

    // O grau precisa cair a cada passo; se não cai, é erro numérico.
    if (!resto.ehNulo && resto.grau >= dividendo.grau && resto.grau >= divisor.grau) {
      throw new ErroMatematico('A divisão não convergiu — coeficientes fora de escala.');
    }
  }

  passos.push({
    descricao: resto.ehNulo
      ? 'O resto é zero: o divisor é um fator exato do dividendo.'
      : 'O resto já tem grau menor que o divisor, então a divisão termina.',
    tex: `Q(x) = ${quociente.paraTex()} \\qquad R(x) = ${resto.paraTex()}`,
    nota: 'Vale sempre P(x) = Q(x)·D(x) + R(x).',
  });

  return { resultado: { quociente, resto }, passos };
}

/**
 * Teorema do resto: dividir P(x) por (x − a) deixa resto P(a).
 *
 * É o atalho que dispensa a divisão inteira quando só o resto interessa — e a
 * porta de entrada para o teorema de D'Alembert: resto zero significa raiz.
 */
export function restoPorBinomioComPassos(p: Polinomio, a: number): Resolucao<number> {
  const resto = p.avaliar(a);
  const sinal = a >= 0 ? '-' : '+';
  const binomio = `x ${sinal} ${formatar(Math.abs(a))}`;

  return {
    resultado: resto,
    passos: [
      {
        descricao: 'Pela divisão euclidiana, o resto da divisão por um binômio é constante.',
        tex: `P(x) = Q(x)\\left(${binomio}\\right) + R`,
      },
      {
        descricao: `Avaliamos os dois lados em x = ${formatar(a)}, onde o binômio zera.`,
        tex: `P(${formatar(a)}) = Q(${formatar(a)}) \\cdot 0 + R = R`,
        nota: 'O quociente desaparece, não importa qual seja.',
      },
      {
        descricao: 'Logo, basta calcular o valor numérico do polinômio nesse ponto.',
        tex: `R = P(${formatar(a)}) = ${formatar(resto)}`,
        nota:
          Math.abs(resto) < 1e-12
            ? `Resto zero: ${binomio} é fator, e ${formatar(a)} é raiz.`
            : undefined,
      },
    ],
  };
}

/**
 * Raízes racionais candidatas, pelo teorema das raízes racionais.
 *
 * Toda raiz p/q de um polinômio de coeficientes inteiros tem p dividindo o
 * termo constante e q dividindo o coeficiente líder. Isso transforma uma busca
 * infinita numa lista curta para testar.
 */
export function candidatasRacionais(p: Polinomio): readonly number[] {
  const constante = p.coeficiente(0);
  const lider = p.coeficiente(p.grau);

  if (!Number.isInteger(constante) || !Number.isInteger(lider) || lider === 0) {
    return [];
  }

  // Constante zero significa que x é fator. O teorema das raízes racionais não
  // se aplica direto nesse caso (todo racional dividiria zero), então
  // fatoramos x^k e aplicamos o teorema ao que sobra — senão as outras raízes
  // se perderiam, e com elas a fatoração completa.
  if (constante === 0) {
    const menorGrau = p.coeficientes.findIndex((coeficiente) => coeficiente !== 0);
    if (menorGrau <= 0) {
      return [0];
    }

    const reduzido = Polinomio.de(...p.coeficientes.slice(menorGrau));
    return [...new Set([0, ...candidatasRacionais(reduzido)])].sort((a, b) => a - b);
  }

  const numeradores = divisores(Math.abs(constante));
  const denominadores = divisores(Math.abs(lider));

  const candidatas = new Set<number>();
  for (const numerador of numeradores) {
    for (const denominador of denominadores) {
      candidatas.add(numerador / denominador);
      candidatas.add(-numerador / denominador);
    }
  }

  return [...candidatas].sort((a, b) => a - b);
}

/** Raízes racionais de fato, testadas entre as candidatas. */
export function raizesRacionais(p: Polinomio): readonly number[] {
  return candidatasRacionais(p).filter((candidata) => Math.abs(p.avaliar(candidata)) < 1e-9);
}

/**
 * Fatora o polinômio extraindo uma raiz racional por vez.
 *
 * Cada passo é a mesma ideia: achou raiz, divide por (x − raiz) e continua com
 * um grau menos. O que sobra é o fator que não tem raiz racional.
 */
export function fatorarPorRaizesComPassos(p: Polinomio): Resolucao<readonly number[]> {
  const passos: Passo[] = [
    {
      descricao: 'Partimos do polinômio a fatorar.',
      tex: `P(x) = ${p.paraTex()}`,
    },
  ];

  const candidatas = candidatasRacionais(p);
  if (candidatas.length > 0) {
    passos.push({
      descricao: 'As raízes racionais possíveis vêm dos divisores do termo constante e do líder.',
      tex: candidatas
        .slice(0, 12)
        .map((c) => formatar(c))
        .join(',\; '),
      nota: 'Uma lista curta para testar, em vez de tentar números ao acaso.',
    });
  }

  const encontradas: number[] = [];
  let atual = p;

  while (atual.grau > 0) {
    const raiz = candidatasRacionais(atual).find(
      (candidata) => Math.abs(atual.avaliar(candidata)) < 1e-9,
    );

    if (raiz === undefined) {
      break;
    }

    const { quociente } = dividirComPassos(atual, Polinomio.de(-raiz, 1)).resultado;
    const sinal = raiz >= 0 ? '-' : '+';

    passos.push({
      descricao: `P(${formatar(raiz)}) = 0, então (x ${sinal} ${formatar(Math.abs(raiz))}) é fator.`,
      tex: `${atual.paraTex()} = \\left(x ${sinal} ${formatar(Math.abs(raiz))}\\right)\\left(${quociente.paraTex()}\\right)`,
    });

    encontradas.push(raiz);
    atual = quociente;
  }

  passos.push({
    descricao:
      atual.grau === 0
        ? 'Sobrou apenas a constante: a fatoração está completa.'
        : 'O fator restante não tem raiz racional — daqui em diante, Bhaskara ou aproximação.',
    tex:
      encontradas.length === 0
        ? 'nenhuma raiz racional'
        : encontradas
            .map((raiz) => `\\left(x ${raiz >= 0 ? '-' : '+'} ${formatar(Math.abs(raiz))}\\right)`)
            .join('') + (atual.grau > 0 ? `\\left(${atual.paraTex()}\\right)` : ''),
  });

  return { resultado: encontradas, passos };
}
