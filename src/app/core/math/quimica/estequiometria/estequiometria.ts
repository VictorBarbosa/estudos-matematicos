import { Resolucao } from '@core/math/tipos/tipos';

/**
 * Estequiometria: a proporção da equação, convertida em massa.
 *
 * É aqui que o mol deixa de ser definição e vira ferramenta. A equação
 * balanceada dá uma proporção **de contagem** — `2 H₂ + O₂ → 2 H₂O` diz dois
 * para um, em moléculas, nunca em gramas. A balança, porém, mede gramas. O
 * caminho é sempre o mesmo, e é por isso que ele se ensina como um trajeto de
 * três trechos:
 *
 *     massa de A → mols de A → mols de B → massa de B
 *
 * O erro clássico é pular o meio: aplicar a proporção `2:1` direto sobre as
 * massas. Isso só acerta quando as duas substâncias têm a mesma massa molar,
 * o que praticamente nunca acontece — e é um erro que não se percebe pelo
 * resultado, porque ele sai plausível.
 */
export interface Participante {
  readonly formula: string;
  /** O coeficiente na equação balanceada. */
  readonly coeficiente: number;
  readonly massaMolar: number;
}

/** Os mols de B que correspondem a uma quantidade de A, pela proporção. */
export function molsCorrespondentes(molsDeA: number, de: Participante, para: Participante): number {
  return (molsDeA * para.coeficiente) / de.coeficiente;
}

/** A massa de B que corresponde a uma massa de A, pelo trajeto completo. */
export function massaCorrespondente(
  massaDeA: number,
  de: Participante,
  para: Participante,
): number {
  const molsDeA = massaDeA / de.massaMolar;

  return molsCorrespondentes(molsDeA, de, para) * para.massaMolar;
}

export function massaCorrespondenteComPassos(
  massaDeA: number,
  de: Participante,
  para: Participante,
  equacaoTex: string,
): Resolucao<number> {
  const molsDeA = massaDeA / de.massaMolar;
  const molsDeB = molsCorrespondentes(molsDeA, de, para);
  const resultado = molsDeB * para.massaMolar;

  // Em texto puro: a nota é prosa, e o guarda de fórmulas recusa LaTeX nela.
  const proporcao = `${de.coeficiente} ${de.formula} para ${para.coeficiente} ${para.formula}`;

  return {
    resultado,
    passos: [
      {
        descricao: 'A equação balanceada dá a proporção — em MOLS, não em gramas.',
        tex: equacaoTex,
        nota: `Os coeficientes dizem ${proporcao}. Aplicá-los direto às massas é o erro clássico.`,
      },
      {
        descricao: 'Primeiro trecho: a massa dada vira quantidade.',
        tex:
          `n_{\\text{${de.formula}}} = \\frac{${Number(massaDeA.toFixed(4))}}{${de.massaMolar}} = ` +
          `${Number(molsDeA.toFixed(4))}\\;\\text{mol}`,
      },
      {
        descricao: 'Segundo trecho: a proporção da equação age sobre a quantidade.',
        tex:
          `n_{\\text{${para.formula}}} = ${Number(molsDeA.toFixed(4))} \\times ` +
          `\\frac{${para.coeficiente}}{${de.coeficiente}} = ${Number(molsDeB.toFixed(4))}\\;\\text{mol}`,
      },
      {
        descricao: 'Terceiro trecho: a quantidade volta a ser massa.',
        tex:
          `m_{\\text{${para.formula}}} = ${Number(molsDeB.toFixed(4))} \\times ${para.massaMolar} = ` +
          `${Number(resultado.toFixed(4))}\\;\\text{g}`,
        nota: 'Massa → mols → mols → massa: o trajeto é sempre este.',
      },
    ],
  };
}

/**
 * A massa que a proporção daria se fosse aplicada direto, sem passar pelos
 * mols.
 *
 * Existe para ser **armadilha**, não para ser usada: é exatamente o que o
 * aluno calcula quando pula o meio do trajeto. Tê-la aqui, ao lado da conta
 * certa, deixa claro no código que as duas não coincidem — e por que.
 */
export function massaPelaProporcaoCrua(
  massaDeA: number,
  de: Participante,
  para: Participante,
): number {
  return (massaDeA * para.coeficiente) / de.coeficiente;
}
