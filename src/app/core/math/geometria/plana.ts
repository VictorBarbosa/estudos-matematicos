import { formatar } from '@core/math/algebra/polinomio';
import { ErroMatematico, Passo, Resolucao } from '@core/math/tipos';

/**
 * Geometria plana: ângulos, semelhança e área.
 *
 * O fio condutor é que nenhuma fórmula de área é arbitrária — todas descendem
 * da área do retângulo, por corte e recomposição. Saber de onde vêm é o que
 * permite reconstruí-las quando a memória falha.
 */

/** Soma dos ângulos internos de um polígono de n lados. */
export function somaAngulosInternosComPassos(lados: number): Resolucao<number> {
  if (!Number.isInteger(lados) || lados < 3) {
    throw new ErroMatematico(`Um polígono precisa de ao menos 3 lados, recebido: ${lados}`);
  }

  const triangulos = lados - 2;
  const resultado = triangulos * 180;

  return {
    resultado,
    passos: [
      {
        descricao: 'Escolhemos um vértice e traçamos as diagonais a partir dele.',
        tex: `n = ${lados}`,
      },
      {
        descricao: 'O polígono se reparte em triângulos — sempre dois a menos que os lados.',
        tex: `${lados} - 2 = ${triangulos} \\text{ triângulos}`,
        nota: 'Os dois lados vizinhos ao vértice escolhido não geram triângulo novo.',
      },
      {
        descricao: 'Cada triângulo contribui com 180°, e nada se repete nem sobra.',
        tex: `S = ${triangulos} \\times 180^\\circ = ${resultado}^\\circ`,
      },
    ],
  };
}

/** Ângulo interno de um polígono regular. */
export function anguloInternoRegular(lados: number): number {
  return somaAngulosInternosComPassos(lados).resultado / lados;
}

/** Os três lados formam triângulo? */
export function desigualdadeTriangular(a: number, b: number, c: number): boolean {
  return a + b > c && a + c > b && b + c > a;
}

export type FormaTriangulo = 'equilatero' | 'isosceles' | 'escaleno';
export type AnguloTriangulo = 'retangulo' | 'acutangulo' | 'obtusangulo';

export interface ClassificacaoTriangulo {
  readonly forma: FormaTriangulo;
  readonly angulo: AnguloTriangulo;
}

/**
 * Classifica o triângulo pelos lados e pelos ângulos.
 *
 * O teste dos ângulos sai do próprio Pitágoras: comparar o quadrado do maior
 * lado com a soma dos outros dois diz se o ângulo oposto é reto, agudo ou
 * obtuso, sem precisar medir nada.
 */
export function classificarTriangulo(a: number, b: number, c: number): ClassificacaoTriangulo {
  if (!desigualdadeTriangular(a, b, c)) {
    throw new ErroMatematico(`Os lados ${a}, ${b} e ${c} não formam um triângulo.`);
  }

  const [menor, medio, maior] = [a, b, c].sort((x, y) => x - y) as [number, number, number];

  const distintos = new Set([a, b, c]).size;
  const forma: FormaTriangulo =
    distintos === 1 ? 'equilatero' : distintos === 2 ? 'isosceles' : 'escaleno';

  const quadradoMaior = maior * maior;
  const somaDosOutros = menor * menor + medio * medio;
  const tolerancia = 1e-9 * Math.max(1, quadradoMaior);

  const angulo: AnguloTriangulo =
    Math.abs(quadradoMaior - somaDosOutros) < tolerancia
      ? 'retangulo'
      : quadradoMaior > somaDosOutros
        ? 'obtusangulo'
        : 'acutangulo';

  return { forma, angulo };
}

/** Hipotenusa a partir dos dois catetos. */
export function pitagorasComPassos(cateto1: number, cateto2: number): Resolucao<number> {
  if (cateto1 <= 0 || cateto2 <= 0) {
    throw new ErroMatematico('Os catetos devem ser positivos.');
  }

  const soma = cateto1 * cateto1 + cateto2 * cateto2;
  const resultado = Math.sqrt(soma);

  return {
    resultado,
    passos: [
      {
        descricao: 'No triângulo retângulo, os quadrados dos catetos somam o da hipotenusa.',
        tex: 'a^{2} = b^{2} + c^{2}',
      },
      {
        descricao: 'Substituímos as medidas dos catetos.',
        tex: `a^{2} = ${formatar(cateto1)}^{2} + ${formatar(cateto2)}^{2} = ${formatar(soma)}`,
      },
      {
        descricao: 'A hipotenusa é a raiz dessa soma — e só a raiz positiva tem sentido aqui.',
        tex: `a = \\sqrt{${formatar(soma)}} = ${formatar(Number(resultado.toFixed(6)))}`,
      },
    ],
  };
}

/** Cateto que falta, dada a hipotenusa e o outro cateto. */
export function catetoComPassos(hipotenusa: number, cateto: number): Resolucao<number> {
  if (hipotenusa <= cateto) {
    throw new ErroMatematico('A hipotenusa é sempre o maior lado do triângulo retângulo.');
  }

  const diferenca = hipotenusa * hipotenusa - cateto * cateto;
  const resultado = Math.sqrt(diferenca);

  return {
    resultado,
    passos: [
      {
        descricao: 'Partimos da relação de Pitágoras e isolamos o cateto desconhecido.',
        tex: 'c^{2} = a^{2} - b^{2}',
      },
      {
        descricao: 'Substituímos hipotenusa e cateto conhecido.',
        tex: `c^{2} = ${formatar(hipotenusa)}^{2} - ${formatar(cateto)}^{2} = ${formatar(diferenca)}`,
        nota: 'Aqui os quadrados se subtraem, não se somam.',
      },
      {
        descricao: 'Extraímos a raiz.',
        tex: `c = ${formatar(Number(resultado.toFixed(6)))}`,
      },
    ],
  };
}

/**
 * Teorema de Tales: um feixe de paralelas corta transversais em segmentos
 * proporcionais. Dadas três medidas, a quarta sai de uma regra de três.
 */
export function talesComPassos(a: number, b: number, c: number): Resolucao<number> {
  if (a === 0) {
    throw new ErroMatematico('O primeiro segmento não pode ser nulo.');
  }

  const resultado = (b * c) / a;

  return {
    resultado,
    passos: [
      {
        descricao: 'As paralelas garantem que as razões entre segmentos correspondentes sejam iguais.',
        tex: `\\frac{${formatar(a)}}{${formatar(b)}} = \\frac{${formatar(c)}}{x}`,
      },
      {
        descricao: 'Multiplicamos em cruz.',
        tex: `${formatar(a)}\\,x = ${formatar(b)} \\cdot ${formatar(c)}`,
      },
      {
        descricao: 'Isolamos o segmento procurado.',
        tex: `x = \\frac{${formatar(b * c)}}{${formatar(a)}} = ${formatar(Number(resultado.toFixed(6)))}`,
      },
    ],
  };
}

/**
 * Semelhança: como a razão k age em comprimento, área e volume.
 *
 * É o resultado mais contraintuitivo da geometria elementar — dobrar o lado
 * quadruplica a área e octuplica o volume. Também é o que explica por que um
 * foguete grande não é um foguete pequeno ampliado.
 */
export function escalaComPassos(k: number, dimensao: 1 | 2 | 3): Resolucao<number> {
  if (k <= 0) {
    throw new ErroMatematico('A razão de semelhança deve ser positiva.');
  }

  const resultado = k ** dimensao;
  const nome = dimensao === 1 ? 'comprimento' : dimensao === 2 ? 'área' : 'volume';

  const passos: Passo[] = [
    {
      descricao: `Na semelhança de razão k, cada comprimento é multiplicado por k.`,
      tex: `k = ${formatar(k)}`,
    },
  ];

  if (dimensao >= 2) {
    passos.push({
      descricao: 'A área é um produto de dois comprimentos, então k entra duas vezes.',
      tex: `A' = (k \\cdot b)(k \\cdot h) = k^{2} \\cdot A`,
      nota: 'Dobrar o lado não dobra a área: quadruplica.',
    });
  }

  if (dimensao === 3) {
    passos.push({
      descricao: 'O volume é um produto de três comprimentos, e k entra três vezes.',
      tex: `V' = k^{3} \\cdot V`,
      nota: 'É por isso que massa e peso crescem muito mais rápido que a altura.',
    });
  }

  passos.push({
    descricao: `O fator que multiplica o ${nome} é portanto k elevado a ${dimensao}.`,
    tex: `k^{${dimensao}} = ${formatar(Number(resultado.toFixed(6)))}`,
  });

  return { resultado, passos };
}

export type Figura =
  | 'retangulo'
  | 'triangulo'
  | 'paralelogramo'
  | 'trapezio'
  | 'circulo'
  | 'setor'
  | 'poligono-regular';

export interface DimensoesFigura {
  readonly base?: number;
  readonly altura?: number;
  readonly baseMenor?: number;
  readonly raio?: number;
  readonly anguloGraus?: number;
  readonly lados?: number;
  readonly apotema?: number;
}

export const NOME_FIGURA: Readonly<Record<Figura, string>> = {
  retangulo: 'retângulo',
  triangulo: 'triângulo',
  paralelogramo: 'paralelogramo',
  trapezio: 'trapézio',
  circulo: 'círculo',
  setor: 'setor circular',
  'poligono-regular': 'polígono regular',
};

/**
 * Área de uma figura plana, com a dedução a partir do retângulo.
 *
 * Cada caso mostra o corte que leva de volta à base vezes altura — é a mesma
 * ideia que, levada ao limite, se torna a integral.
 */
export function areaComPassos(figura: Figura, dimensoes: DimensoesFigura): Resolucao<number> {
  const exigir = (nome: keyof DimensoesFigura): number => {
    const valor = dimensoes[nome];
    if (valor === undefined || !Number.isFinite(valor) || valor <= 0) {
      throw new ErroMatematico(`A medida "${nome}" é obrigatória e deve ser positiva.`);
    }
    return valor;
  };

  switch (figura) {
    case 'retangulo': {
      const base = exigir('base');
      const altura = exigir('altura');

      return {
        resultado: base * altura,
        passos: [
          {
            descricao: 'A área do retângulo é a definição de área: quantos quadradinhos cabem.',
            tex: 'A = b \\cdot h',
          },
          {
            descricao: 'Substituímos as medidas.',
            tex: `A = ${formatar(base)} \\cdot ${formatar(altura)} = ${formatar(base * altura)}`,
          },
        ],
      };
    }

    case 'triangulo': {
      const base = exigir('base');
      const altura = exigir('altura');

      return {
        resultado: (base * altura) / 2,
        passos: [
          {
            descricao: 'Duas cópias do triângulo, uma girada, montam um paralelogramo.',
            tex: '2A = b \\cdot h',
            nota: 'O triângulo é metade de um paralelogramo de mesma base e altura.',
          },
          {
            descricao: 'Logo a área do triângulo é a metade.',
            tex: `A = \\frac{${formatar(base)} \\cdot ${formatar(altura)}}{2} = ${formatar((base * altura) / 2)}`,
          },
        ],
      };
    }

    case 'paralelogramo': {
      const base = exigir('base');
      const altura = exigir('altura');

      return {
        resultado: base * altura,
        passos: [
          {
            descricao: 'Cortando um triângulo de um lado e colando no outro, surge um retângulo.',
            tex: 'A = b \\cdot h',
            nota: 'A altura é a distância entre as bases, não o lado inclinado.',
          },
          {
            descricao: 'Substituímos as medidas.',
            tex: `A = ${formatar(base)} \\cdot ${formatar(altura)} = ${formatar(base * altura)}`,
          },
        ],
      };
    }

    case 'trapezio': {
      const base = exigir('base');
      const baseMenor = exigir('baseMenor');
      const altura = exigir('altura');
      const resultado = ((base + baseMenor) * altura) / 2;

      return {
        resultado,
        passos: [
          {
            descricao: 'Duas cópias do trapézio formam um paralelogramo de base B + b.',
            tex: '2A = (B + b) \\cdot h',
          },
          {
            descricao: 'Metade disso é a área do trapézio.',
            tex: `A = \\frac{(${formatar(base)} + ${formatar(baseMenor)}) \\cdot ${formatar(altura)}}{2} = ${formatar(resultado)}`,
            nota: 'É a média das bases multiplicada pela altura.',
          },
        ],
      };
    }

    case 'circulo': {
      const raio = exigir('raio');
      const resultado = Math.PI * raio * raio;

      return {
        resultado,
        passos: [
          {
            descricao: 'Fatiamos o círculo em setores finos e os alinhamos alternadamente.',
            tex: 'A \\approx \\frac{C}{2} \\cdot r',
            nota: 'O arranjo tende a um retângulo de base metade do perímetro e altura r.',
          },
          {
            descricao: 'Como C = 2πr, metade do perímetro é πr.',
            tex: 'A = \\pi r \\cdot r = \\pi r^{2}',
          },
          {
            descricao: 'Substituímos o raio.',
            tex: `A = \\pi \\cdot ${formatar(raio)}^{2} = ${formatar(Number(resultado.toFixed(4)))}`,
          },
        ],
      };
    }

    case 'setor': {
      const raio = exigir('raio');
      const angulo = exigir('anguloGraus');
      const resultado = (Math.PI * raio * raio * angulo) / 360;

      return {
        resultado,
        passos: [
          {
            descricao: 'O setor é uma fração do círculo, proporcional ao ângulo.',
            tex: `\\frac{${formatar(angulo)}^\\circ}{360^\\circ}`,
          },
          {
            descricao: 'Multiplicamos essa fração pela área total.',
            tex: `A = \\frac{${formatar(angulo)}}{360} \\cdot \\pi \\cdot ${formatar(raio)}^{2}`,
          },
          {
            descricao: 'Calculamos.',
            tex: `A = ${formatar(Number(resultado.toFixed(4)))}`,
          },
        ],
      };
    }

    case 'poligono-regular': {
      const lados = exigir('lados');
      const base = exigir('base');
      const apotema = exigir('apotema');
      const perimetro = lados * base;
      const resultado = (perimetro * apotema) / 2;

      return {
        resultado,
        passos: [
          {
            descricao: 'Ligamos o centro aos vértices: surgem n triângulos iguais.',
            tex: `n = ${formatar(lados)}`,
          },
          {
            descricao: 'Cada triângulo tem base igual ao lado e altura igual ao apótema.',
            tex: `A_{\\triangle} = \\frac{${formatar(base)} \\cdot ${formatar(apotema)}}{2}`,
          },
          {
            descricao: 'Somando os n triângulos, o total é o perímetro vezes o apótema, pela metade.',
            tex: `A = \\frac{p \\cdot a}{2} = \\frac{${formatar(perimetro)} \\cdot ${formatar(apotema)}}{2} = ${formatar(resultado)}`,
            nota: 'Com muitos lados, isso se aproxima de πr² — o círculo é o limite.',
          },
        ],
      };
    }
  }
}

/** Comprimento da circunferência. */
export function perimetroCirculoComPassos(raio: number): Resolucao<number> {
  if (raio <= 0) {
    throw new ErroMatematico('O raio deve ser positivo.');
  }

  const resultado = 2 * Math.PI * raio;

  return {
    resultado,
    passos: [
      {
        descricao: 'π é definido como a razão entre o comprimento e o diâmetro — em qualquer círculo.',
        tex: '\\pi = \\frac{C}{d}',
        nota: 'Essa razão não depende do tamanho do círculo; é isso que faz dela uma constante.',
      },
      {
        descricao: 'Isolando C e escrevendo o diâmetro como 2r.',
        tex: 'C = \\pi d = 2\\pi r',
      },
      {
        descricao: 'Substituímos o raio.',
        tex: `C = 2\\pi \\cdot ${formatar(raio)} = ${formatar(Number(resultado.toFixed(4)))}`,
      },
    ],
  };
}

/**
 * Ternos pitagóricos gerados pela fórmula de Euclides.
 *
 * Para m > n > 0, a tripla (m² − n², 2mn, m² + n²) é pitagórica. Multiplicada
 * por k, continua sendo. Gerar assim, em vez de manter uma lista de meia dúzia
 * de ternos conhecidos, dá centenas de exercícios com hipotenusa inteira — e
 * era a lista curta que fazia os tópicos de Pitágoras se repetirem.
 */
export function ternosPitagoricos(limiteHipotenusa = 120): readonly (readonly [
  number,
  number,
  number,
])[] {
  const ternos: [number, number, number][] = [];

  for (let m = 2; m * m <= limiteHipotenusa; m++) {
    for (let n = 1; n < m; n++) {
      // m e n de paridades diferentes e coprimos geram ternos primitivos; sem
      // esse filtro a lista teria duplicatas em proporções diferentes, o que
      // aqui não incomoda — variedade é o objetivo.
      const cateto1 = m * m - n * n;
      const cateto2 = 2 * m * n;
      const hipotenusa = m * m + n * n;

      for (let k = 1; k * hipotenusa <= limiteHipotenusa; k++) {
        const terno: [number, number, number] = [
          Math.min(cateto1, cateto2) * k,
          Math.max(cateto1, cateto2) * k,
          hipotenusa * k,
        ];

        if (!ternos.some(([a, b]) => a === terno[0] && b === terno[1])) {
          ternos.push(terno);
        }
      }
    }
  }

  return ternos;
}
