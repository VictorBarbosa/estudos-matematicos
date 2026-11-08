import { Polinomio, formatar, formatarEmTexto } from '@core/math/algebra/polinomio/polinomio';
import {
  formaFatoradaParaTex,
  resolverQuadraticaComPassos,
} from '@core/math/algebra/equacao-quadratica/equacao-quadratica';
import { divisores } from '@core/math/numeros/inteiros/inteiros';
import { ErroMatematico, Passo, Resolucao } from '@core/math/tipos/tipos';

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
        ` \\;\\Rightarrow\\; ${novoResto.paraTex()}`,
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
  const numero = formatar(a);
  const oposto = formatar(-a);
  const binomio = `x ${a >= 0 ? '-' : '+'} ${formatar(Math.abs(a))}`;

  return {
    resultado: resto,
    passos: [
      {
        descricao:
          `Na divisão, P(x) é o dividendo e (${binomio}) é o divisor. ` +
          'Chamamos o quociente de Q(x) e o resto de R.',
        tex: `\\underbrace{${p.paraTex()}}_{P(x)} = Q(x)\\underbrace{\\left(${binomio}\\right)}_{\\text{divisor}} + R`,
        nota: 'O divisor tem grau 1, então o resto é um número — não sobra nenhum x nele.',
      },
      {
        descricao: 'Procuramos o valor de x que zera o divisor: é ele que vai apagar o quociente.',
        tex: `${binomio} = 0 \\;\\Longrightarrow\\; x = ${numero}`,
        nota: `Dividir por (${binomio}) pede ${numero}, e não ${oposto}: é o número que anula o parêntese.`,
      },
      {
        descricao: `Pondo x = ${numero} nos dois lados, o divisor vira 0 e leva o quociente junto.`,
        tex: `P(${numero}) = Q(${numero}) \\cdot 0 + R = R`,
        nota: 'Seja qual for Q, multiplicado por zero some. Sobra só o resto.',
      },
      ...contaDoValorNumerico(p, a, resto, binomio),
    ],
  };
}

/**
 * Os passos que mostram a conta de `P(a)`, uma mudança de cada vez.
 *
 * «R = P(3) = 52» é verdade e não ensina nada. Mesmo «= 54 - 9 + 9 - 2 = 52»
 * esconde duas coisas numa linha só: a potência e o produto. Aqui cada fase é
 * uma reescrita da anterior — substituir, elevar, multiplicar, somar —, que é
 * a ordem em que a mão faz. As fases que não mudariam nada são descartadas: um
 * polinômio sem potências não precisa da linha das potências.
 */
function contaDoValorNumerico(
  p: Polinomio,
  a: number,
  resto: number,
  binomio: string,
): readonly Passo[] {
  const numero = formatar(a);
  const notaFinal =
    Math.abs(resto) < 1e-12
      ? `Resto zero: ${binomio} é fator, e ${formatarEmTexto(a)} é raiz.`
      : undefined;

  const termos = p.coeficientes.filter((coeficiente) => coeficiente !== 0).length;
  if (termos < 2) {
    return [
      {
        descricao: 'Só falta o valor numérico, e com um termo só ele é imediato.',
        tex: `R = P(${numero}) = ${formatar(resto)}`,
        nota: notaFinal,
      },
    ];
  }

  const fases = [
    {
      descricao: `Trocamos x por ${numero} em cada termo de P.`,
      tex: comXTrocado(p, a),
      nota: 'O número vai entre parênteses: é ele inteiro que é elevado, sinal incluído.',
    },
    {
      descricao: 'Resolvemos as potências.',
      tex: comPotenciasResolvidas(p, a),
      nota: notaDasPotencias(p, a),
    },
    {
      descricao: 'Fazemos os produtos de cada coeficiente pela sua potência.',
      tex: parcelas(p, a),
      nota: notaDosProdutos(p, a),
    },
  ];

  const passos: Passo[] = [];
  let anterior = '';

  for (const fase of fases) {
    if (fase.tex === anterior) {
      continue;
    }

    passos.push({ descricao: fase.descricao, tex: `P(${numero}) = ${fase.tex}`, nota: fase.nota });
    anterior = fase.tex;
  }

  passos.push({
    descricao: 'Somamos as parcelas, duas de cada vez. O que sobra é o resto.',
    tex: `R = ${somaParcela(p, a)}`,
    nota: notaFinal,
  });

  return passos;
}

/**
 * `2(3)^{3} - (3)^{2} + 3(3) - 2`: o polinômio com x já trocado pelo número.
 *
 * Segue as convenções de `paraTex` — coeficiente 1 some diante da variável, o
 * sinal do primeiro termo cola no corpo —, e o número vai sempre entre
 * parênteses, porque com `a` negativo `(-2)^{2}` e `-2^{2}` são coisas
 * diferentes.
 */
function comXTrocado(p: Polinomio, a: number): string {
  return escreverTermos(p, (coeficiente, grau) => ({
    sinal: coeficiente,
    corpo: termoSubstituido(coeficiente, grau, a),
  }));
}

/** Um termo com o número no lugar de x: `2(3)^{3}`, `3(3)`, `2`. */
function termoSubstituido(coeficiente: number, grau: number, a: number): string {
  const absoluto = Math.abs(coeficiente);
  const numerica = absoluto === 1 && grau > 0 ? '' : formatar(absoluto);
  const potencia = grau === 0 ? '' : grau === 1 ? `(${formatar(a)})` : `(${formatar(a)})^{${grau}}`;
  return `${numerica}${potencia}`;
}

/** `-1 + 4 \cdot 1 - 3 \cdot (-1) - 2`: as potências já valem um número. */
function comPotenciasResolvidas(p: Polinomio, a: number): string {
  return escreverTermos(p, (coeficiente, grau) => {
    const potencia = a ** grau;

    // Grau 0 e grau 1 não têm potência a resolver: ficam como estavam, ou a
    // linha repetiria a anterior com outra notação e sem nenhuma conta feita.
    if (grau <= 1) {
      return { sinal: coeficiente, corpo: termoSubstituido(coeficiente, grau, a) };
    }

    // Com coeficiente 1 não há produto a fazer: o termo JÁ é a potência.
    if (Math.abs(coeficiente) === 1) {
      return { sinal: coeficiente * potencia, corpo: formatar(Math.abs(potencia)) };
    }

    const escrita = potencia < 0 ? `(${formatar(potencia)})` : formatar(potencia);
    return { sinal: coeficiente, corpo: `${formatar(Math.abs(coeficiente))} \\cdot ${escrita}` };
  });
}

/** `54 - 9 + 9 - 2`: cada termo já calculado, antes da soma. */
function parcelas(p: Polinomio, a: number): string {
  return escreverTermos(p, (coeficiente, grau) => {
    const valor = coeficiente * a ** grau;
    return { sinal: valor, corpo: formatar(Math.abs(valor)) };
  });
}

/**
 * `-1 + 4 + 3 - 2 = 3 + 3 - 2 = 6 - 2 = 4`: a soma feita aos pares.
 *
 * Mostrar só «= 4» obriga quem lê a refazer a conta de cabeça para conferir.
 */
function somaParcela(p: Polinomio, a: number): string {
  let valores = [...p.coeficientes.keys()]
    .reverse()
    .filter((grau) => p.coeficiente(grau) !== 0)
    .map((grau) => p.coeficiente(grau) * a ** grau);

  const linhas = [escreverValores(valores)];
  while (valores.length > 1) {
    valores = [valores[0]! + valores[1]!, ...valores.slice(2)];
    linhas.push(escreverValores(valores));
  }

  return linhas.join(' = ');
}

/** As notas são texto corrido: o expoente precisa ser um caractere, não `^2`. */
const EXPOENTES: Readonly<Record<number, string>> = { 2: '²', 3: '³', 4: '⁴', 5: '⁵' };

/** Quando a base é negativa, o expoente decide o sinal — e isso se diz. */
function notaDasPotencias(p: Polinomio, a: number): string | undefined {
  if (a >= 0) {
    return undefined;
  }

  const graus = [...p.coeficientes.keys()].filter((grau) => grau >= 2 && p.coeficiente(grau) !== 0);
  if (graus.length === 0) {
    return undefined;
  }

  const base = formatarEmTexto(a);
  const exemplo = graus
    .slice(0, 2)
    .map((grau) => `(${base})${EXPOENTES[grau] ?? `^${grau}`} = ${formatarEmTexto(a ** grau)}`)
    .join(', ');

  return `Base negativa: expoente par dá positivo, ímpar dá negativo — ${exemplo}.`;
}

/** Menos vezes menos dá mais: o sinal que mais se perde na conta. */
function notaDosProdutos(p: Polinomio, a: number): string | undefined {
  const grau = [...p.coeficientes.keys()].find((candidato) => {
    const coeficiente = p.coeficiente(candidato);
    return candidato > 0 && coeficiente < 0 && a ** candidato < 0;
  });

  if (grau === undefined) {
    return undefined;
  }

  const coeficiente = p.coeficiente(grau);
  const potencia = a ** grau;

  return (
    `Menos vezes menos dá mais: ${formatarEmTexto(coeficiente)} · ` +
    `(${formatarEmTexto(potencia)}) = ${formatarEmTexto(coeficiente * potencia)}, ` +
    'que entra somando.'
  );
}

/** Uma lista de números com os sinais entre eles: `-1 + 4 + 3 - 2`. */
function escreverValores(valores: readonly number[]): string {
  return valores
    .map((valor, indice) => {
      const corpo = formatar(Math.abs(valor));
      if (indice === 0) {
        return valor < 0 ? `-${corpo}` : corpo;
      }
      return `${valor < 0 ? ' - ' : ' + '}${corpo}`;
    })
    .join('');
}

/** Percorre os termos do maior grau ao menor, juntando-os com os sinais. */
function escreverTermos(
  p: Polinomio,
  termo: (coeficiente: number, grau: number) => { sinal: number; corpo: string },
): string {
  let escrita = '';

  for (let grau = p.grau; grau >= 0; grau--) {
    const coeficiente = p.coeficiente(grau);
    if (coeficiente === 0) {
      continue;
    }

    const { sinal, corpo } = termo(coeficiente, grau);
    escrita =
      escrita === ''
        ? `${sinal < 0 ? '-' : ''}${corpo}`
        : `${escrita}${sinal < 0 ? ' - ' : ' + '}${corpo}`;
  }

  return escrita === '' ? '0' : escrita;
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
        .join(',\\; '),
      nota: 'Uma lista curta para testar, em vez de tentar números ao acaso.',
    });
  }

  const encontradas: number[] = [];
  const fatores: string[] = [];
  let atual = p;

  /*
   * A caça a raízes só vale enquanto o grau passa de 2.
   *
   * Chegando ao grau 2, Bhaskara resolve de uma vez e com a conta à vista —
   * extrair raiz por raiz ali produzia um passo absurdo no fim, do tipo
   * `x - 4 = (x - 4)(1)`, e escondia a fórmula que o aluno acabou de aprender.
   */
  while (atual.grau > 2) {
    const raiz = candidatasRacionais(atual).find(
      (candidata) => Math.abs(atual.avaliar(candidata)) < 1e-9,
    );

    if (raiz === undefined) {
      break;
    }

    const { quociente } = dividirComPassos(atual, Polinomio.de(-raiz, 1)).resultado;

    passos.push({
      descricao: `Testamos a candidata x = ${formatar(raiz)}.`,
      tex: contaDeAvaliacao(atual, raiz),
      nota: `Deu zero, então (${binomioDe(raiz)}) é fator — é o teorema do resto.`,
    });
    passos.push({
      descricao: `Dividindo por (${binomioDe(raiz)}), sobra um fator de grau ${quociente.grau}.`,
      tex: `${atual.paraTex()} = \\left(${binomioDe(raiz)}\\right)\\left(${quociente.paraTex()}\\right)`,
    });

    encontradas.push(raiz);
    fatores.push(`\\left(${binomioDe(raiz)}\\right)`);
    atual = quociente;
  }

  const final = fecharFatoracao(atual, passos, encontradas, fatores);

  passos.push({
    descricao: final.descricao,
    tex: fatores.length === 0 ? 'nenhuma raiz racional' : fatores.join(''),
  });

  return { resultado: encontradas, passos };
}

/**
 * O último fator: grau 2 vai para Bhaskara, grau 1 dá a raiz direto.
 *
 * Devolve a frase que fecha a fatoração, e empurra para `passos` e `fatores` o
 * que esse último pedaço acrescenta.
 */
function fecharFatoracao(
  atual: Polinomio,
  passos: Passo[],
  encontradas: number[],
  fatores: string[],
): { descricao: string } {
  if (atual.grau === 0) {
    return { descricao: 'Sobrou apenas a constante: a fatoração está completa.' };
  }

  if (atual.grau === 1) {
    // `2x - 4 = 0` dá x = 2, sem fórmula nenhuma.
    const raiz = -atual.coeficiente(0) / atual.coeficiente(1);
    passos.push({
      descricao: 'O último fator é do 1º grau: a raiz sai de uma equação simples.',
      tex: `${atual.paraTex()} = 0 \\;\\Longrightarrow\\; x = ${formatar(raiz)}`,
    });

    encontradas.push(raiz);
    const lider = atual.coeficiente(1);
    fatores.push(
      lider === 1
        ? `\\left(${binomioDe(raiz)}\\right)`
        : `${formatar(lider)}\\left(${binomioDe(raiz)}\\right)`,
    );
    return { descricao: 'A fatoração está completa.' };
  }

  if (atual.grau > 2) {
    fatores.push(`\\left(${atual.paraTex()}\\right)`);
    return {
      descricao:
        'O fator restante não tem raiz racional, e o grau passa de 2 — daqui em diante, ' +
        'método numérico.',
    };
  }

  // Grau 2: a fórmula que o aluno já conhece, com os números deste fator.
  const a = atual.coeficiente(2);
  const b = atual.coeficiente(1);
  const c = atual.coeficiente(0);

  passos.push({
    descricao: 'O que sobrou é do 2º grau: aqui Bhaskara resolve de uma vez.',
    tex: `${atual.paraTex()} = 0`,
    nota: 'Não é preciso continuar testando candidatas — a fórmula dá as duas raízes.',
  });
  passos.push(...resolverQuadraticaComPassos(a, b, c, { comVertice: false }).passos);

  const { raizes } = resolverQuadraticaComPassos(a, b, c, { comVertice: false }).resultado;
  const fatorada = formaFatoradaParaTex(a, raizes);

  if (fatorada === null) {
    fatores.push(`\\left(${atual.paraTex()}\\right)`);
    return {
      descricao: 'Sem raiz real, esse fator do 2º grau não se quebra mais nos reais.',
    };
  }

  passos.push({
    descricao: 'Com as raízes em mãos, o fator do 2º grau se escreve fatorado.',
    tex: `${atual.paraTex()} = ${fatorada}`,
  });
  fatores.push(fatorada);

  // Só raiz racional entra no resultado: é o que a função promete devolver.
  const racionais = raizesRacionais(atual);
  encontradas.push(...racionais);

  return {
    descricao:
      racionais.length === raizes.length
        ? 'A fatoração está completa.'
        : 'As raízes desse fator são reais, mas o fator não tem raiz racional.',
  };
}

/** `P(1) = (1)^{3} - 7(1)^{2} + 14(1) - 8 = 1 - 7 + 14 - 8 = 0`, numa linha. */
function contaDeAvaliacao(p: Polinomio, a: number): string {
  const numero = formatar(a);
  const valor = formatar(p.avaliar(a));
  const etapas = [comXTrocado(p, a), parcelas(p, a), valor].filter(
    (etapa, indice, todas) => indice === 0 || etapa !== todas[indice - 1],
  );

  return `P(${numero}) = ${etapas.join(' = ')}`;
}

/** `x - 4` ou `x + 3`, o binômio que a raiz gera. */
function binomioDe(raiz: number): string {
  return `x ${raiz >= 0 ? '-' : '+'} ${formatar(Math.abs(raiz))}`;
}
