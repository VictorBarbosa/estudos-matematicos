import { formatar } from '@core/math/algebra/polinomio/polinomio';
import { ErroMatematico, Resolucao } from '@core/math/tipos/tipos';

/**
 * Geometria espacial: volume e superfície dos sólidos.
 *
 * Dois princípios bastam para quase tudo aqui: o volume de um sólido de seção
 * constante é área da base vezes altura, e o de um sólido que afina até um
 * vértice é um terço disso. O resto é saber qual é a base.
 */

export type Solido = 'prisma' | 'cilindro' | 'piramide' | 'cone' | 'esfera';

export interface DimensoesSolido {
  /** Área da base, para prisma e pirâmide. */
  readonly areaBase?: number;
  readonly altura?: number;
  readonly raio?: number;
  /** Geratriz do cone, para a área lateral. */
  readonly geratriz?: number;
  /** Perímetro da base, para a área lateral do prisma. */
  readonly perimetroBase?: number;
}

export const NOME_SOLIDO: Readonly<Record<Solido, string>> = {
  prisma: 'prisma',
  cilindro: 'cilindro',
  piramide: 'pirâmide',
  cone: 'cone',
  esfera: 'esfera',
};

/** Sólidos que afinam até um vértice valem um terço do cilindro/prisma equivalente. */
export const AFINA_ATE_VERTICE: readonly Solido[] = ['piramide', 'cone'];

export function volumeComPassos(solido: Solido, dimensoes: DimensoesSolido): Resolucao<number> {
  const exigir = (nome: keyof DimensoesSolido): number => {
    const valor = dimensoes[nome];
    if (valor === undefined || !Number.isFinite(valor) || valor <= 0) {
      throw new ErroMatematico(`A medida "${nome}" é obrigatória e deve ser positiva.`);
    }
    return valor;
  };

  switch (solido) {
    case 'prisma': {
      const areaBase = exigir('areaBase');
      const altura = exigir('altura');

      return {
        resultado: areaBase * altura,
        passos: [
          {
            descricao: 'Empilhar camadas idênticas de espessura mínima preenche o prisma.',
            tex: 'V = A_b \\cdot h',
            nota: 'A seção é a mesma em qualquer altura, então basta multiplicar.',
          },
          {
            descricao: 'Substituímos a área da base e a altura.',
            tex: `V = ${formatar(areaBase)} \\cdot ${formatar(altura)} = ${formatar(areaBase * altura)}`,
          },
        ],
      };
    }

    case 'cilindro': {
      const raio = exigir('raio');
      const altura = exigir('altura');
      const areaBase = Math.PI * raio * raio;
      const resultado = areaBase * altura;

      return {
        resultado,
        passos: [
          {
            descricao: 'O cilindro é um prisma de base circular: área da base vezes altura.',
            tex: 'V = \\pi r^{2} h',
            nota: 'O raio entra ao QUADRADO, porque ele mede a base, que é uma área. A altura entra uma vez só.',
          },
          {
            descricao: 'Primeiro o raio ao quadrado.',
            tex: `r^{2} = ${formatar(raio)}^{2} = ${formatar(raio * raio)}`,
          },
          {
            descricao: 'A base é π vezes esse valor.',
            tex: `A_b = \\pi \\cdot ${formatar(raio * raio)} = ${formatar(Number(areaBase.toFixed(4)))}`,
          },
          {
            descricao: 'E o volume é a base vezes a altura.',
            tex:
              `V = ${formatar(Number(areaBase.toFixed(4)))} \\cdot ${formatar(altura)} = ` +
              `${formatar(Number(resultado.toFixed(4)))}`,
          },
        ],
      };
    }

    case 'piramide': {
      const areaBase = exigir('areaBase');
      const altura = exigir('altura');
      const resultado = (areaBase * altura) / 3;

      return {
        resultado,
        passos: [
          {
            descricao: 'Três pirâmides de mesma base e altura preenchem exatamente um prisma.',
            tex: '3V = A_b \\cdot h',
            nota: 'Dá para montar com um cubo partido em três pirâmides iguais.',
          },
          {
            descricao: 'Logo o volume é um terço do prisma correspondente.',
            tex: `V = \\frac{${formatar(areaBase)} \\cdot ${formatar(altura)}}{3} = ${formatar(Number(resultado.toFixed(4)))}`,
          },
        ],
      };
    }

    case 'cone': {
      const raio = exigir('raio');
      const altura = exigir('altura');
      const areaBase = Math.PI * raio * raio;
      const resultado = (areaBase * altura) / 3;

      return {
        resultado,
        passos: [
          {
            descricao: 'O cone é uma pirâmide de base circular, e vale o mesmo um terço.',
            tex: 'V = \\frac{\\pi r^{2} h}{3}',
            nota: 'O raio entra ao QUADRADO, porque ele mede a base, que é uma área. A altura entra uma vez só.',
          },
          {
            descricao: 'Primeiro o raio ao quadrado.',
            tex: `r^{2} = ${formatar(raio)}^{2} = ${formatar(raio * raio)}`,
          },
          {
            descricao: 'A base é π vezes esse valor.',
            tex: `A_b = \\pi \\cdot ${formatar(raio * raio)} = ${formatar(Number(areaBase.toFixed(4)))}`,
          },
          {
            descricao: 'Multiplicamos pela altura e tomamos um terço.',
            tex:
              `V = \\frac{${formatar(Number(areaBase.toFixed(4)))} \\cdot ${formatar(altura)}}{3} = ` +
              `\\frac{${formatar(Number((areaBase * altura).toFixed(4)))}}{3} = ` +
              `${formatar(Number(resultado.toFixed(4)))}`,
          },
        ],
      };
    }

    case 'esfera': {
      const raio = exigir('raio');
      const resultado = (4 / 3) * Math.PI * raio ** 3;

      return {
        resultado,
        passos: [
          {
            descricao:
              'A esfera cabe num cilindro de mesma altura e raio, ocupando dois terços dele.',
            tex: 'V_{\\text{cil}} = \\pi r^{2} \\cdot 2r = 2\\pi r^{3}',
            nota: 'Resultado de Arquimedes, que pediu para gravá-lo em seu túmulo.',
          },
          {
            descricao: 'Dois terços desse cilindro é o volume da esfera.',
            tex: 'V = \\frac{2}{3} \\cdot 2\\pi r^{3} = \\frac{4}{3}\\pi r^{3}',
          },
          {
            descricao: 'Primeiro o raio ao cubo.',
            tex: `r^{3} = ${formatar(raio)}^{3} = ${formatar(raio ** 3)}`,
            nota: 'Na esfera o raio entra TRÊS vezes: ela não tem altura separada.',
          },
          {
            descricao: 'E multiplicamos por 4π/3.',
            tex:
              `V = \\frac{4}{3}\\pi \\cdot ${formatar(raio ** 3)} = ` +
              `${formatar(Number(resultado.toFixed(4)))}`,
          },
        ],
      };
    }
  }
}

export function superficieComPassos(solido: Solido, dimensoes: DimensoesSolido): Resolucao<number> {
  const exigir = (nome: keyof DimensoesSolido): number => {
    const valor = dimensoes[nome];
    if (valor === undefined || !Number.isFinite(valor) || valor <= 0) {
      throw new ErroMatematico(`A medida "${nome}" é obrigatória e deve ser positiva.`);
    }
    return valor;
  };

  switch (solido) {
    case 'prisma': {
      const areaBase = exigir('areaBase');
      const perimetro = exigir('perimetroBase');
      const altura = exigir('altura');
      const lateral = perimetro * altura;
      const resultado = 2 * areaBase + lateral;

      return {
        resultado,
        passos: [
          {
            descricao: 'Desenrolando a lateral, ela é um retângulo de base igual ao perímetro.',
            tex: `A_\\ell = p \\cdot h = ${formatar(perimetro)} \\cdot ${formatar(altura)} = ${formatar(lateral)}`,
          },
          {
            descricao: 'Somamos as duas bases.',
            tex: `A = 2A_b + A_\\ell = ${formatar(resultado)}`,
          },
        ],
      };
    }

    case 'cilindro': {
      const raio = exigir('raio');
      const altura = exigir('altura');
      const lateral = 2 * Math.PI * raio * altura;
      const resultado = 2 * Math.PI * raio * raio + lateral;

      return {
        resultado,
        passos: [
          {
            descricao: 'A lateral desenrolada é um retângulo: 2πr de base por h de altura.',
            tex:
              `A_\\ell = 2\\pi r h = 2\\pi \\cdot ${formatar(raio)} \\cdot ${formatar(altura)} = ` +
              `${formatar(Number(lateral.toFixed(4)))}`,
            nota: 'Aqui o raio entra UMA vez: a lateral é um retângulo, não um círculo.',
          },
          {
            descricao: 'Cada tampa é um círculo, e aí o raio vai ao quadrado.',
            tex:
              `2\\pi r^{2} = 2\\pi \\cdot ${formatar(raio)}^{2} = 2\\pi \\cdot ` +
              `${formatar(raio * raio)} = ${formatar(Number((2 * Math.PI * raio * raio).toFixed(4)))}`,
          },
          {
            descricao: 'A superfície é a soma das duas partes.',
            tex:
              `A = ${formatar(Number((2 * Math.PI * raio * raio).toFixed(4)))} + ` +
              `${formatar(Number(lateral.toFixed(4)))} = ${formatar(Number(resultado.toFixed(4)))}`,
          },
        ],
      };
    }

    case 'cone': {
      const raio = exigir('raio');
      const geratriz = exigir('geratriz');

      if (geratriz <= raio) {
        throw new ErroMatematico('A geratriz de um cone é maior que o raio da base.');
      }

      const lateral = Math.PI * raio * geratriz;
      const resultado = Math.PI * raio * raio + lateral;

      return {
        resultado,
        passos: [
          {
            descricao: 'A lateral aberta é um setor de raio g e arco 2πr.',
            tex:
              `A_\\ell = \\pi r g = \\pi \\cdot ${formatar(raio)} \\cdot ${formatar(geratriz)} = ` +
              `${formatar(Number(lateral.toFixed(4)))}`,
            nota: 'Na lateral o raio entra uma vez só, multiplicado pela geratriz.',
          },
          {
            descricao: 'A base é um círculo, e nela o raio vai ao quadrado.',
            tex:
              `\\pi r^{2} = \\pi \\cdot ${formatar(raio)}^{2} = \\pi \\cdot ${formatar(raio * raio)} = ` +
              `${formatar(Number((Math.PI * raio * raio).toFixed(4)))}`,
          },
          {
            descricao: 'Mais a base circular.',
            tex: `A = \\pi r^{2} + \\pi r g = ${formatar(Number(resultado.toFixed(4)))}`,
          },
        ],
      };
    }

    case 'esfera': {
      const raio = exigir('raio');
      const resultado = 4 * Math.PI * raio * raio;

      return {
        resultado,
        passos: [
          {
            descricao: 'A superfície da esfera equivale a quatro círculos máximos.',
            tex: 'A = 4\\pi r^{2}',
            nota: 'Também é exatamente a lateral do cilindro que a envolve.',
          },
          {
            descricao: 'Primeiro o raio ao quadrado.',
            tex: `r^{2} = ${formatar(raio)}^{2} = ${formatar(raio * raio)}`,
          },
          {
            descricao: 'E multiplicamos por 4π.',
            tex:
              `A = 4\\pi \\cdot ${formatar(raio * raio)} = ` +
              `${formatar(Number(resultado.toFixed(4)))}`,
          },
        ],
      };
    }

    case 'piramide':
      throw new ErroMatematico(
        'A superfície da pirâmide depende da forma da base; informe as faces diretamente.',
      );
  }
}

/**
 * Compara dois sólidos semelhantes.
 *
 * A razão de volumes é o cubo da razão linear — a conta que explica por que
 * animais e estruturas não podem simplesmente ser ampliados.
 */
export function razaoDeVolumesComPassos(k: number): Resolucao<number> {
  if (k <= 0) {
    throw new ErroMatematico('A razão de semelhança deve ser positiva.');
  }

  const resultado = k ** 3;

  return {
    resultado,
    passos: [
      {
        descricao: 'Cada dimensão linear é multiplicada por k.',
        tex: `k = ${formatar(k)}`,
      },
      {
        descricao: 'O volume depende de três dimensões.',
        tex: `\\frac{V'}{V} = k^{3} = ${formatar(Number(resultado.toFixed(6)))}`,
        nota: 'A superfície cresce com k², então a razão superfície/volume cai com 1/k.',
      },
    ],
  };
}
