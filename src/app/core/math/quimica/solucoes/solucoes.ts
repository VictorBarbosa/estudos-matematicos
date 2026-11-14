import { Resolucao } from '@core/math/tipos/tipos';

/**
 * Soluções: a quantidade que importa é a que está em cada litro.
 *
 * Uma reação em solução não enxerga quanta substância há no frasco — enxerga
 * quanta há onde ela acontece. Por isso a medida da química em solução é a
 * **concentração**, e a mais usada é a molaridade: mols de soluto por litro de
 * SOLUÇÃO, não por litro de solvente. A distinção parece pedante e não é:
 * dissolver 1 mol em 1 L de água dá mais de 1 L de solução, e a diferença
 * aparece na terceira casa de qualquer titulação.
 *
 * O segundo erro de sempre é o volume em mililitros. A molaridade é por LITRO;
 * 250 mL são 0,25 L, e quem esquece isso erra por mil — um fator tão grande
 * que o resultado costuma ser absurdo, o que, ironicamente, é a sorte de quem
 * confere a ordem de grandeza.
 */

/** Molaridade: mols de soluto por litro de solução. */
export function molaridade(mols: number, litros: number): number {
  return mols / litros;
}

/** Os mols de soluto que há num volume de solução de concentração conhecida. */
export function molsEmSolucao(concentracao: number, litros: number): number {
  return concentracao * litros;
}

/** A massa de soluto que há num volume de solução. */
export function massaEmSolucao(concentracao: number, litros: number, massaMolar: number): number {
  return molsEmSolucao(concentracao, litros) * massaMolar;
}

export function molaridadeComPassos(
  massa: number,
  massaMolar: number,
  litros: number,
  soluto: string,
): Resolucao<number> {
  const mols = massa / massaMolar;
  const resultado = molaridade(mols, litros);

  return {
    resultado,
    passos: [
      {
        descricao: `A balança deu gramas, e a concentração se mede em mols: ${soluto} vira quantidade.`,
        tex: `n = \\frac{${Number(massa.toFixed(4))}}{${massaMolar}} = ${Number(mols.toFixed(4))}\\;\\text{mol}`,
      },
      {
        descricao: 'O volume entra em litros, nunca em mililitros.',
        tex: `V = ${Number(litros.toFixed(4))}\\;\\text{L}`,
        nota: 'Mililitro dividido por mol erra por mil: 250 mL são 0,25 L.',
      },
      {
        descricao: 'A molaridade é a quantidade dividida pelo volume da solução.',
        tex:
          `C = \\frac{n}{V} = \\frac{${Number(mols.toFixed(4))}}{${Number(litros.toFixed(4))}} = ` +
          `${Number(resultado.toFixed(4))}\\;\\text{mol/L}`,
        nota: 'Volume da solução pronta, e não do solvente que se usou para preparar.',
      },
    ],
  };
}

export function massaEmSolucaoComPassos(
  concentracao: number,
  litros: number,
  massaMolar: number,
  soluto: string,
): Resolucao<number> {
  const mols = molsEmSolucao(concentracao, litros);
  const resultado = mols * massaMolar;

  return {
    resultado,
    passos: [
      {
        descricao: 'A concentração diz quantos mols há em cada litro.',
        tex: `C = ${Number(concentracao.toFixed(4))}\\;\\text{mol/L}`,
      },
      {
        descricao: `No volume pedido há essa quantidade de ${soluto}.`,
        tex:
          `n = C \\cdot V = ${Number(concentracao.toFixed(4))} \\times ${Number(litros.toFixed(4))} = ` +
          `${Number(mols.toFixed(4))}\\;\\text{mol}`,
      },
      {
        descricao: 'A massa molar devolve a quantidade à balança.',
        tex:
          `m = n \\cdot M = ${Number(mols.toFixed(4))} \\times ${massaMolar} = ` +
          `${Number(resultado.toFixed(4))}\\;\\text{g}`,
      },
    ],
  };
}

/**
 * Diluição: acrescentar solvente muda o volume, nunca a quantidade de soluto.
 *
 * É daí que sai `C₁V₁ = C₂V₂`, e a fórmula não é um macete: é a afirmação de
 * que o número de mols dos dois lados é o mesmo. Quem a decora sem isso
 * costuma aplicá-la a misturas de solutos diferentes, onde ela não vale.
 */
export function volumeDiluido(c1: number, v1: number, c2: number): number {
  return (c1 * v1) / c2;
}

export function concentracaoDiluida(c1: number, v1: number, v2: number): number {
  return (c1 * v1) / v2;
}

export function concentracaoDiluidaComPassos(
  c1: number,
  v1: number,
  volumeAcrescentado: number,
): Resolucao<number> {
  const v2 = v1 + volumeAcrescentado;
  const resultado = concentracaoDiluida(c1, v1, v2);

  return {
    resultado,
    passos: [
      {
        descricao: 'Acrescentar água não cria nem destrói soluto: a quantidade de mols fica.',
        tex:
          `n = ${Number(c1.toFixed(4))} \\times ${Number(v1.toFixed(4))} = ` +
          `${Number((c1 * v1).toFixed(4))}\\;\\text{mol}`,
        nota: 'É esta frase que vira a fórmula da diluição, e não o contrário.',
      },
      {
        descricao: 'O volume final é o que havia mais o que se acrescentou.',
        tex:
          `V_2 = ${Number(v1.toFixed(4))} + ${Number(volumeAcrescentado.toFixed(4))} = ` +
          `${Number(v2.toFixed(4))}\\;\\text{L}`,
        nota: 'O volume acrescentado não é o volume final: somar é o passo que mais se esquece.',
      },
      {
        descricao: 'A mesma quantidade, espalhada em mais litros, dá concentração menor.',
        tex:
          `C_2 = \\frac{C_1 V_1}{V_2} = \\frac{${Number((c1 * v1).toFixed(4))}}{${Number(v2.toFixed(4))}} = ` +
          `${Number(resultado.toFixed(4))}\\;\\text{mol/L}`,
      },
    ],
  };
}

export function volumeDiluidoComPassos(c1: number, v1: number, c2: number): Resolucao<number> {
  const resultado = volumeDiluido(c1, v1, c2);

  return {
    resultado,
    passos: [
      {
        descricao: 'A quantidade de soluto é a mesma antes e depois.',
        tex: `C_1 V_1 = C_2 V_2`,
        nota: 'Vale para diluição com solvente puro; misturar outro soluto é outra conta.',
      },
      {
        descricao: 'Isolando o volume final.',
        tex:
          `V_2 = \\frac{${Number(c1.toFixed(4))} \\times ${Number(v1.toFixed(4))}}{${Number(c2.toFixed(4))}} = ` +
          `${Number(resultado.toFixed(4))}\\;\\text{L}`,
      },
      {
        descricao: 'Esse é o volume TOTAL ao final, e não a água a acrescentar.',
        tex: `V_{\\text{água}} = ${Number(resultado.toFixed(4))} - ${Number(v1.toFixed(4))} = ${Number((resultado - v1).toFixed(4))}\\;\\text{L}`,
        nota: 'Confundir os dois é o erro clássico da diluição.',
      },
    ],
  };
}

/**
 * Mistura de duas soluções do mesmo soluto.
 *
 * Aqui os mols se somam e os volumes também; a concentração final é a média
 * PONDERADA pelos volumes, nunca a média simples das concentrações — que só
 * coincide quando os dois volumes são iguais.
 */
export function concentracaoDaMistura(c1: number, v1: number, c2: number, v2: number): number {
  return (c1 * v1 + c2 * v2) / (v1 + v2);
}

export function concentracaoDaMisturaComPassos(
  c1: number,
  v1: number,
  c2: number,
  v2: number,
): Resolucao<number> {
  const mols = c1 * v1 + c2 * v2;
  const volume = v1 + v2;
  const resultado = concentracaoDaMistura(c1, v1, c2, v2);

  return {
    resultado,
    passos: [
      {
        descricao: 'Cada solução traz a sua quantidade de soluto.',
        tex:
          `n_1 = ${Number((c1 * v1).toFixed(4))} \\qquad n_2 = ${Number((c2 * v2).toFixed(4))}` +
          `\\;\\text{mol}`,
      },
      {
        descricao: 'No frasco final os mols se somam, e os volumes também.',
        tex:
          `n = ${Number(mols.toFixed(4))}\\;\\text{mol} \\qquad V = ${Number(volume.toFixed(4))}` +
          `\\;\\text{L}`,
      },
      {
        descricao: 'A concentração final é a razão entre os dois totais.',
        tex: `C = \\frac{${Number(mols.toFixed(4))}}{${Number(volume.toFixed(4))}} = ${Number(resultado.toFixed(4))}\\;\\text{mol/L}`,
        nota: 'É média ponderada pelos volumes: a média simples só acerta se eles forem iguais.',
      },
    ],
  };
}

/** A média simples das concentrações: existe para ser armadilha da mistura. */
export function mediaSimplesDasConcentracoes(c1: number, c2: number): number {
  return (c1 + c2) / 2;
}
