import { formatar } from '@core/math/algebra/polinomio';
import { paraRadianos } from '@core/math/trigonometria/trigonometria';
import { ErroMatematico, Passo, Resolucao } from '@core/math/tipos';
import { GRAVIDADE_PADRAO } from '@core/math/fisica/mecanica';

/**
 * Trabalho, energia, impulso e momento linear.
 *
 * Os dois grandes princípios de conservação da mecânica. A energia explica
 * "com que velocidade chega"; o momento explica "o que acontece depois da
 * colisão" — e é o momento que faz um foguete funcionar no vácuo.
 */

/** Trabalho de uma força constante, com o ângulo em relação ao deslocamento. */
export function trabalhoComPassos(
  forca: number,
  deslocamento: number,
  anguloGraus = 0,
): Resolucao<number> {
  const cosseno = Math.cos(paraRadianos(anguloGraus));
  const resultado = forca * deslocamento * cosseno;

  return {
    resultado,
    passos: [
      {
        descricao: 'Trabalho é o produto escalar entre força e deslocamento.',
        tex: 'W = \\vec{F}\\cdot\\vec{d} = Fd\\cos\\theta',
      },
      {
        descricao: 'Só a componente da força alinhada ao deslocamento realiza trabalho.',
        tex: `F\\cos\\theta = ${formatar(forca)}\\cos ${formatar(anguloGraus)}^\\circ = ${formatar(Number((forca * cosseno).toFixed(4)))}\\,\\text{N}`,
      },
      {
        descricao: 'Multiplicando pelo deslocamento.',
        tex: `W = ${formatar(Number(resultado.toFixed(4)))}\\,\\text{J}`,
        nota:
          Math.abs(anguloGraus - 90) < 1e-9
            ? 'Força perpendicular ao movimento não realiza trabalho — nem a normal, nem a força centrípeta.'
            : resultado < 0
              ? 'Trabalho negativo: a força se opõe ao movimento, como o atrito.'
              : undefined,
      },
    ],
  };
}

export function energiaCinetica(massa: number, velocidade: number): number {
  return (massa * velocidade * velocidade) / 2;
}

export function energiaPotencialGravitacional(
  massa: number,
  altura: number,
  gravidade = GRAVIDADE_PADRAO,
): number {
  return massa * gravidade * altura;
}

export function energiaPotencialElastica(constante: number, deformacao: number): number {
  return (constante * deformacao * deformacao) / 2;
}

export interface BalancoEnergetico {
  readonly cineticaInicial: number;
  readonly potencialInicial: number;
  readonly cineticaFinal: number;
  readonly potencialFinal: number;
  readonly velocidadeFinal: number;
}

/**
 * Conservação de energia mecânica numa queda ou descida sem atrito.
 *
 * O resultado notável é que a velocidade final não depende da massa nem do
 * caminho — só da altura perdida. É o que permite calcular a velocidade no fim
 * de uma rampa sem saber nada sobre sua forma.
 */
export function conservacaoEnergiaComPassos(
  massa: number,
  alturaInicial: number,
  alturaFinal: number,
  velocidadeInicial = 0,
  gravidade = GRAVIDADE_PADRAO,
): Resolucao<BalancoEnergetico> {
  if (massa <= 0) {
    throw new ErroMatematico('A massa deve ser positiva.');
  }

  if (alturaFinal > alturaInicial && velocidadeInicial === 0) {
    throw new ErroMatematico('Sem velocidade inicial, o corpo não sobe sozinho.');
  }

  const cineticaInicial = energiaCinetica(massa, velocidadeInicial);
  const potencialInicial = energiaPotencialGravitacional(massa, alturaInicial, gravidade);
  const potencialFinal = energiaPotencialGravitacional(massa, alturaFinal, gravidade);
  const cineticaFinal = cineticaInicial + potencialInicial - potencialFinal;

  if (cineticaFinal < 0) {
    throw new ErroMatematico('A energia disponível não é suficiente para alcançar essa altura.');
  }

  const velocidadeFinal = Math.sqrt((2 * cineticaFinal) / massa);

  return {
    resultado: {
      cineticaInicial,
      potencialInicial,
      cineticaFinal,
      potencialFinal,
      velocidadeFinal,
    },
    passos: [
      {
        descricao: 'Sem atrito, a energia mecânica total se conserva.',
        tex: 'E_c + E_p = \\text{constante}',
      },
      {
        descricao: 'Escrevemos o balanço entre os dois instantes.',
        tex:
          `\\frac{mv_0^{2}}{2} + mgh_0 = \\frac{mv^{2}}{2} + mgh`,
      },
      {
        descricao: 'A massa aparece em todos os termos e se cancela.',
        tex: `\\frac{v_0^{2}}{2} + gh_0 = \\frac{v^{2}}{2} + gh`,
        nota: 'É por isso que a velocidade final não depende da massa.',
      },
      {
        descricao: 'Isolando a velocidade final.',
        tex:
          `v = \\sqrt{v_0^{2} + 2g(h_0 - h)} = ` +
          `${formatar(Number(velocidadeFinal.toFixed(4)))}\\,\\text{m/s}`,
        nota: 'Nem o caminho importa: só a diferença de altura.',
      },
    ],
  };
}

/** Potência média, em watts: energia por tempo. */
export function potenciaMediaComPassos(trabalho: number, tempo: number): Resolucao<number> {
  if (tempo <= 0) {
    throw new ErroMatematico('O intervalo de tempo deve ser positivo.');
  }

  const resultado = trabalho / tempo;

  return {
    resultado,
    passos: [
      {
        descricao: 'Potência mede a rapidez com que o trabalho é realizado.',
        tex: 'P = \\frac{W}{\\Delta t}',
      },
      {
        descricao: 'Substituindo.',
        tex: `P = \\frac{${formatar(trabalho)}}{${formatar(tempo)}} = ${formatar(Number(resultado.toFixed(4)))}\\,\\text{W}`,
        nota: 'O mesmo trabalho em menos tempo exige mais potência — não mais energia.',
      },
    ],
  };
}

export function momentoLinear(massa: number, velocidade: number): number {
  return massa * velocidade;
}

/** Impulso de uma força constante, igual à variação do momento. */
export function impulsoComPassos(forca: number, tempo: number, massa: number): Resolucao<number> {
  if (massa <= 0) {
    throw new ErroMatematico('A massa deve ser positiva.');
  }

  const impulso = forca * tempo;
  const variacaoVelocidade = impulso / massa;

  return {
    resultado: impulso,
    passos: [
      {
        descricao: 'O impulso é a força multiplicada pelo tempo de aplicação.',
        tex: `J = F\\Delta t = ${formatar(forca)} \\times ${formatar(tempo)} = ${formatar(Number(impulso.toFixed(4)))}\\,\\text{N·s}`,
      },
      {
        descricao: 'Pelo teorema do impulso, ele iguala a variação do momento linear.',
        tex: 'J = \\Delta p = m\\Delta v',
        nota: 'É a segunda lei de Newton, reescrita em termos de momento.',
      },
      {
        descricao: 'Daí a variação de velocidade produzida.',
        tex: `\\Delta v = \\frac{J}{m} = ${formatar(Number(variacaoVelocidade.toFixed(4)))}\\,\\text{m/s}`,
        nota: 'Mesma variação de momento com mais tempo significa menos força — a lógica do airbag.',
      },
    ],
  };
}

export type TipoColisao = 'perfeitamente-inelastica' | 'elastica';

export interface ResultadoColisao {
  readonly velocidadeFinalA: number;
  readonly velocidadeFinalB: number;
  readonly momentoTotal: number;
  readonly energiaAntes: number;
  readonly energiaDepois: number;
}

/**
 * Colisão unidimensional entre dois corpos.
 *
 * O momento se conserva em qualquer colisão — é o princípio mais robusto da
 * mecânica. A energia cinética, não: numa colisão inelástica, parte dela vira
 * deformação e calor.
 */
export function colisaoComPassos(
  massaA: number,
  velocidadeA: number,
  massaB: number,
  velocidadeB: number,
  tipo: TipoColisao,
): Resolucao<ResultadoColisao> {
  if (massaA <= 0 || massaB <= 0) {
    throw new ErroMatematico('As massas devem ser positivas.');
  }

  const momentoTotal = massaA * velocidadeA + massaB * velocidadeB;
  const energiaAntes = energiaCinetica(massaA, velocidadeA) + energiaCinetica(massaB, velocidadeB);

  let velocidadeFinalA: number;
  let velocidadeFinalB: number;

  if (tipo === 'perfeitamente-inelastica') {
    const comum = momentoTotal / (massaA + massaB);
    velocidadeFinalA = comum;
    velocidadeFinalB = comum;
  } else {
    // Colisão elástica: conserva momento e energia cinética.
    velocidadeFinalA =
      ((massaA - massaB) * velocidadeA + 2 * massaB * velocidadeB) / (massaA + massaB);
    velocidadeFinalB =
      ((massaB - massaA) * velocidadeB + 2 * massaA * velocidadeA) / (massaA + massaB);
  }

  const energiaDepois =
    energiaCinetica(massaA, velocidadeFinalA) + energiaCinetica(massaB, velocidadeFinalB);

  const passos: Passo[] = [
    {
      descricao: 'O momento linear total se conserva, sempre.',
      tex:
        `p = ${formatar(massaA)}(${formatar(velocidadeA)}) + ${formatar(massaB)}(${formatar(velocidadeB)})` +
        ` = ${formatar(Number(momentoTotal.toFixed(4)))}\\,\\text{kg·m/s}`,
      nota: 'As forças internas da colisão são pares de ação e reação, e se cancelam.',
    },
  ];

  if (tipo === 'perfeitamente-inelastica') {
    passos.push(
      {
        descricao: 'Numa colisão perfeitamente inelástica, os corpos seguem juntos.',
        tex: `v_f = \\frac{p}{m_A + m_B} = ${formatar(Number(velocidadeFinalA.toFixed(4)))}\\,\\text{m/s}`,
      },
      {
        descricao: 'A energia cinética não se conserva: parte virou deformação e calor.',
        tex:
          `E_i = ${formatar(Number(energiaAntes.toFixed(3)))}\\,\\text{J} \\;\\to\\; ` +
          `E_f = ${formatar(Number(energiaDepois.toFixed(3)))}\\,\\text{J}`,
        nota: `Perdeu-se ${formatar(Number((energiaAntes - energiaDepois).toFixed(3)))} J.`,
      },
    );
  } else {
    passos.push(
      {
        descricao: 'Na colisão elástica, momento E energia cinética se conservam.',
        tex: 'p_i = p_f \\qquad E_i = E_f',
      },
      {
        descricao: 'Resolvendo o sistema das duas conservações.',
        tex:
          `v_A' = ${formatar(Number(velocidadeFinalA.toFixed(4)))} \\qquad ` +
          `v_B' = ${formatar(Number(velocidadeFinalB.toFixed(4)))}`,
        nota: 'Com massas iguais, os corpos simplesmente trocam de velocidade.',
      },
    );
  }

  return {
    resultado: {
      velocidadeFinalA,
      velocidadeFinalB,
      momentoTotal,
      energiaAntes,
      energiaDepois,
    },
    passos,
  };
}

/** Centro de massa de um conjunto de corpos sobre uma reta. */
export function centroDeMassaComPassos(
  corpos: readonly { readonly massa: number; readonly posicao: number }[],
): Resolucao<number> {
  if (corpos.length === 0) {
    throw new ErroMatematico('Informe ao menos um corpo.');
  }

  const massaTotal = corpos.reduce((total, { massa }) => total + massa, 0);

  if (massaTotal <= 0) {
    throw new ErroMatematico('A massa total deve ser positiva.');
  }

  const momento = corpos.reduce((total, { massa, posicao }) => total + massa * posicao, 0);
  const resultado = momento / massaTotal;

  return {
    resultado,
    passos: [
      {
        descricao: 'O centro de massa é a média das posições, ponderada pelas massas.',
        tex: 'x_{cm} = \\frac{\\sum m_i x_i}{\\sum m_i}',
      },
      {
        descricao: 'Somamos os produtos massa × posição.',
        tex: `\\sum m_i x_i = ${formatar(Number(momento.toFixed(4)))}`,
      },
      {
        descricao: 'Dividimos pela massa total.',
        tex: `x_{cm} = \\frac{${formatar(Number(momento.toFixed(4)))}}{${formatar(massaTotal)}} = ${formatar(Number(resultado.toFixed(4)))}`,
        nota: 'O centro de massa fica sempre mais perto do corpo mais pesado.',
      },
    ],
  };
}

/** Torque de uma força em relação a um ponto. */
export function torqueComPassos(
  forca: number,
  distancia: number,
  anguloGraus = 90,
): Resolucao<number> {
  const seno = Math.sin(paraRadianos(anguloGraus));
  const resultado = forca * distancia * seno;

  return {
    resultado,
    passos: [
      {
        descricao: 'O torque mede a capacidade de uma força produzir rotação.',
        tex: '\\tau = rF\\sin\\theta',
      },
      {
        descricao: 'Só a componente perpendicular ao braço gira o corpo.',
        tex: `F\\sin\\theta = ${formatar(forca)}\\sin ${formatar(anguloGraus)}^\\circ = ${formatar(Number((forca * seno).toFixed(4)))}\\,\\text{N}`,
      },
      {
        descricao: 'Multiplicando pelo braço.',
        tex: `\\tau = ${formatar(Number(resultado.toFixed(4)))}\\,\\text{N·m}`,
        nota:
          Math.abs(seno) < 1e-9
            ? 'Força na direção do braço não produz torque: empurrar a porta pela dobradiça não a abre.'
            : 'Dobrar o braço dobra o torque com a mesma força — é a vantagem da alavanca.',
      },
    ],
  };
}

/** Equilíbrio de uma alavanca: a distância que equilibra os dois lados. */
export function equilibrioAlavancaComPassos(
  forcaA: number,
  distanciaA: number,
  forcaB: number,
): Resolucao<number> {
  if (forcaB <= 0) {
    throw new ErroMatematico('A força do outro lado deve ser positiva.');
  }

  const resultado = (forcaA * distanciaA) / forcaB;

  return {
    resultado,
    passos: [
      {
        descricao: 'No equilíbrio, a soma dos torques em torno do apoio é zero.',
        tex: '\\tau_A = \\tau_B',
      },
      {
        descricao: 'Com forças perpendiculares ao braço, isso é força vezes distância.',
        tex: `${formatar(forcaA)} \\times ${formatar(distanciaA)} = ${formatar(forcaB)} \\times d_B`,
      },
      {
        descricao: 'Isolando a distância procurada.',
        tex: `d_B = ${formatar(Number(resultado.toFixed(4)))}\\,\\text{m}`,
        nota: 'Força menor exige braço maior — é o princípio da alavanca de Arquimedes.',
      },
    ],
  };
}
