import { Passo, Resolucao } from '@core/math/tipos/tipos';

/**
 * A contagem das partículas de um átomo ou de um íon.
 *
 * Fica aqui, no motor matemático, e não no gerador de exercícios, pelo mesmo
 * motivo que o resto: **resolver é devolver a demonstração**. A aba Explorar da
 * Química e o gabarito comentado do treino saem desta função, e por isso não
 * têm como divergir.
 *
 * As três regras são aritmética, não decoreba:
 *
 * - o **número atômico** Z é a contagem de prótons, e é ele que diz qual
 *   elemento é — trocar Z muda o elemento, não o isótopo;
 * - o **número de massa** A conta prótons e nêutrons juntos, porque são eles
 *   que têm massa apreciável;
 * - a **carga** é o desequilíbrio entre prótons e elétrons, e o sinal diz quem
 *   está em falta: cátion perdeu elétron, ânion ganhou.
 */
export interface Atomo {
  /** Número atômico: quantos prótons. */
  readonly z: number;
  /** Número de massa: prótons mais nêutrons. */
  readonly a: number;
  /** Carga do íon; zero no átomo neutro. */
  readonly carga: number;
}

export interface ContagemDeParticulas {
  readonly protons: number;
  readonly neutrons: number;
  readonly eletrons: number;
}

export function contarParticulas(atomo: Atomo): ContagemDeParticulas {
  return {
    protons: atomo.z,
    neutrons: atomo.a - atomo.z,
    // Perder elétron deixa carga positiva: o elétron que falta é o que carrega
    // o sinal. Por isso a carga entra subtraindo.
    eletrons: atomo.z - atomo.carga,
  };
}

export function contarParticulasComPassos(atomo: Atomo): Resolucao<ContagemDeParticulas> {
  const resultado = contarParticulas(atomo);
  const sinal = atomo.carga > 0 ? '+' : '−';

  const passos: Passo[] = [
    {
      descricao: 'O número atômico é a própria contagem de prótons.',
      tex: `Z = ${atomo.z} \\;\\Rightarrow\\; p = ${resultado.protons}`,
      nota: 'É Z que identifica o elemento: mudá-lo muda o elemento, não o isótopo.',
    },
    {
      descricao: 'O número de massa conta prótons e nêutrons; os nêutrons são a diferença.',
      tex: `n = A - Z = ${atomo.a} - ${atomo.z} = ${resultado.neutrons}`,
    },
  ];

  if (atomo.carga === 0) {
    passos.push({
      descricao: 'O átomo é neutro, então há um elétron para cada próton.',
      tex: `e = p = ${resultado.eletrons}`,
    });
  } else {
    passos.push({
      descricao:
        atomo.carga > 0
          ? 'A carga positiva é elétron que falta: subtraímos do número de prótons.'
          : 'A carga negativa é elétron a mais: somamos ao número de prótons.',
      tex: `e = Z - (${atomo.carga}) = ${atomo.z} - (${atomo.carga}) = ${resultado.eletrons}`,
      nota: `Carga ${Math.abs(atomo.carga)}${sinal}: o desequilíbrio entre prótons e elétrons.`,
    });
  }

  return { resultado, passos };
}

/**
 * A massa atômica média de um elemento, a partir dos seus isótopos.
 *
 * É média **ponderada**, e é por isso que a massa que a tabela periódica
 * mostra quase nunca é inteira: 35,45 para o cloro não é a massa de nenhum
 * átomo de cloro, é o que se mede numa amostra onde convivem o 35 e o 37.
 *
 * As abundâncias chegam em porcentagem e são divididas por 100 aqui, em vez de
 * se exigir fração do chamador: o enunciado fala em porcentagem, e converter
 * no mesmo lugar onde a conta acontece evita a dúvida sobre qual forma entrou.
 */
export interface Isotopo {
  readonly massa: number;
  /** Abundância em porcentagem. */
  readonly abundancia: number;
}

export function massaAtomicaMedia(isotopos: readonly Isotopo[]): number {
  return isotopos.reduce((total, i) => total + (i.massa * i.abundancia) / 100, 0);
}

export function massaAtomicaMediaComPassos(isotopos: readonly Isotopo[]): Resolucao<number> {
  const resultado = massaAtomicaMedia(isotopos);

  const parcelas = isotopos.map((i) => `${i.massa} \\times ${i.abundancia}\\%`).join(' + ');

  return {
    resultado,
    passos: [
      {
        descricao: 'Cada isótopo entra com o peso da sua abundância.',
        tex: parcelas,
        nota: 'É média ponderada: o isótopo mais abundante puxa o resultado para si.',
      },
      {
        descricao: 'As porcentagens viram frações da unidade.',
        tex: isotopos
          .map((i) => `${i.massa} \\times ${(i.abundancia / 100).toFixed(4)}`)
          .join(' + '),
      },
      {
        descricao: 'Somando as parcelas.',
        tex: `\\bar{M} = ${Number(resultado.toFixed(4))}`,
        nota: 'O resultado quase nunca é inteiro — e não é a massa de nenhum átomo isolado.',
      },
    ],
  };
}
