import { formatar } from '@core/math/algebra/polinomio/polinomio';
import { ErroMatematico, Resolucao } from '@core/math/tipos/tipos';

/**
 * Gravitação, órbitas e propulsão.
 *
 * O coração do aeroespacial. Três resultados organizam tudo: a força cai com o
 * quadrado da distância, a velocidade orbital sai de igualar gravidade e força
 * centrípeta, e a equação de Tsiolkovsky diz quanto combustível um foguete
 * precisa — e por que a resposta é sempre "muito".
 */

/** Constante gravitacional, em N·m²/kg². */
export const G = 6.674e-11;

/** Massa da Terra, em kg. */
export const MASSA_TERRA = 5.972e24;

/** Raio médio da Terra, em m. */
export const RAIO_TERRA = 6.371e6;

/** Força gravitacional entre dois corpos. */
export function forcaGravitacionalComPassos(
  massaA: number,
  massaB: number,
  distancia: number,
): Resolucao<number> {
  if (massaA <= 0 || massaB <= 0) {
    throw new ErroMatematico('As massas devem ser positivas.');
  }

  if (distancia <= 0) {
    throw new ErroMatematico('A distância entre os centros deve ser positiva.');
  }

  const resultado = (G * massaA * massaB) / (distancia * distancia);

  return {
    resultado,
    passos: [
      {
        descricao: 'A lei da gravitação universal relaciona massas e distância.',
        tex: 'F = G\\frac{m_1 m_2}{d^{2}}',
      },
      {
        descricao: 'Substituímos os valores, com a distância entre os CENTROS.',
        tex:
          `F = ${G} \\cdot \\frac{${massaA.toExponential(3)} \\cdot ${massaB.toExponential(3)}}` +
          `{(${distancia.toExponential(3)})^{2}}`,
        nota: 'Distância medida da superfície, e não do centro, é o erro mais comum aqui.',
      },
      {
        descricao: 'Calculando.',
        tex: `F = ${resultado.toExponential(4)}\\,\\text{N}`,
        nota: 'Dobrar a distância divide a força por quatro, não por dois.',
      },
    ],
  };
}

/** Aceleração da gravidade a uma certa altitude. */
export function gravidadeNaAltitudeComPassos(
  altitude: number,
  massaCentral = MASSA_TERRA,
  raioCentral = RAIO_TERRA,
): Resolucao<number> {
  if (altitude < 0) {
    throw new ErroMatematico('A altitude não pode ser negativa.');
  }

  const distancia = raioCentral + altitude;
  const resultado = (G * massaCentral) / (distancia * distancia);
  const superficie = (G * massaCentral) / (raioCentral * raioCentral);

  return {
    resultado,
    passos: [
      {
        descricao: 'A gravidade local vem da lei da gravitação, dividida pela massa do corpo.',
        tex: 'g = \\frac{GM}{r^{2}}',
      },
      {
        descricao: 'A distância é medida do CENTRO: raio do planeta mais altitude.',
        tex: `r = ${raioCentral.toExponential(3)} + ${altitude.toExponential(3)} = ${distancia.toExponential(4)}\\,\\text{m}`,
      },
      {
        descricao: 'Calculando.',
        tex: `g = ${formatar(Number(resultado.toFixed(4)))}\\,\\text{m/s}^{2}`,
        nota:
          altitude > 0
            ? `Na superfície seriam ${formatar(Number(superficie.toFixed(3)))} m/s²: a queda é mais lenta do que a intuição sugere.`
            : undefined,
      },
    ],
  };
}

export interface Orbita {
  readonly velocidade: number;
  readonly periodo: number;
  readonly raio: number;
}

/**
 * Órbita circular: velocidade e período.
 *
 * A dedução é curta e vale a pena: a gravidade é a própria força centrípeta.
 * Dessa igualdade sai tudo, inclusive a terceira lei de Kepler.
 */
export function orbitaCircularComPassos(
  altitude: number,
  massaCentral = MASSA_TERRA,
  raioCentral = RAIO_TERRA,
): Resolucao<Orbita> {
  if (altitude < 0) {
    throw new ErroMatematico('A altitude não pode ser negativa.');
  }

  const raio = raioCentral + altitude;
  const velocidade = Math.sqrt((G * massaCentral) / raio);
  const periodo = (2 * Math.PI * raio) / velocidade;

  return {
    resultado: { velocidade, periodo, raio },
    passos: [
      {
        descricao: 'Em órbita, a gravidade é exatamente a força centrípeta necessária.',
        tex: '\\frac{GMm}{r^{2}} = \\frac{mv^{2}}{r}',
      },
      {
        descricao: 'A massa do satélite se cancela dos dois lados.',
        tex: '\\frac{GM}{r} = v^{2}',
        nota: 'A órbita não depende da massa do satélite: um parafuso e a ISS orbitam igual.',
      },
      {
        descricao: 'Extraindo a raiz, com r medido do centro.',
        tex: `v = \\sqrt{\\frac{GM}{r}} = ${formatar(Number((velocidade / 1000).toFixed(3)))}\\,\\text{km/s}`,
      },
      {
        descricao: 'O período é o perímetro da órbita dividido pela velocidade.',
        tex: `T = \\frac{2\\pi r}{v} = ${formatar(Number((periodo / 60).toFixed(2)))}\\,\\text{min}`,
        nota: 'Órbitas mais altas são mais lentas, e com período maior.',
      },
    ],
  };
}

/**
 * Velocidade de escape.
 *
 * Sai da conservação de energia: a energia cinética precisa bastar para
 * cancelar a energia potencial gravitacional, que é negativa.
 */
export function velocidadeEscapeComPassos(
  massaCentral = MASSA_TERRA,
  raio = RAIO_TERRA,
): Resolucao<number> {
  if (raio <= 0) {
    throw new ErroMatematico('O raio deve ser positivo.');
  }

  const resultado = Math.sqrt((2 * G * massaCentral) / raio);
  const orbital = Math.sqrt((G * massaCentral) / raio);

  return {
    resultado,
    passos: [
      {
        descricao: 'Escapar significa chegar ao infinito com velocidade nula.',
        tex: '\\frac{mv^{2}}{2} - \\frac{GMm}{r} = 0',
      },
      {
        descricao: 'A massa do corpo se cancela de novo.',
        tex: '\\frac{v^{2}}{2} = \\frac{GM}{r}',
      },
      {
        descricao: 'Isolando a velocidade.',
        tex: `v_e = \\sqrt{\\frac{2GM}{r}} = ${formatar(Number((resultado / 1000).toFixed(3)))}\\,\\text{km/s}`,
      },
      {
        descricao: 'Compare com a velocidade orbital no mesmo raio.',
        tex: `v_e = \\sqrt{2}\\,v_{orb} \\qquad v_{orb} = ${formatar(Number((orbital / 1000).toFixed(3)))}\\,\\text{km/s}`,
        nota: 'Escapar exige apenas √2 vezes a velocidade de orbitar — cerca de 41% mais.',
      },
    ],
  };
}

/**
 * Terceira lei de Kepler: T² proporcional a r³.
 *
 * Aqui ela é deduzida, não enunciada: é consequência direta da órbita
 * circular, e foi essa concordância que confirmou a gravitação de Newton.
 */
export function terceiraLeiKeplerComPassos(
  raioA: number,
  periodoA: number,
  raioB: number,
): Resolucao<number> {
  if (raioA <= 0 || raioB <= 0 || periodoA <= 0) {
    throw new ErroMatematico('Raios e período devem ser positivos.');
  }

  const resultado = periodoA * Math.sqrt((raioB / raioA) ** 3);

  return {
    resultado,
    passos: [
      {
        descricao: 'Da órbita circular, v² = GM/r, e v = 2πr/T.',
        tex: '\\frac{4\\pi^{2}r^{2}}{T^{2}} = \\frac{GM}{r}',
      },
      {
        descricao: 'Reorganizando, a razão T²/r³ é a mesma para todos os satélites do mesmo corpo.',
        tex: '\\frac{T^{2}}{r^{3}} = \\frac{4\\pi^{2}}{GM}',
        nota: 'Essa é a terceira lei de Kepler, deduzida em três linhas a partir de Newton.',
      },
      {
        descricao: 'Comparando as duas órbitas.',
        tex: `\\frac{T_B^{2}}{T_A^{2}} = \\frac{r_B^{3}}{r_A^{3}}`,
      },
      {
        descricao: 'Isolando o período procurado.',
        tex: `T_B = T_A\\sqrt{\\left(\\frac{r_B}{r_A}\\right)^{3}} = ${formatar(Number(resultado.toFixed(4)))}`,
      },
    ],
  };
}

export interface Propulsao {
  readonly deltaV: number;
  readonly razaoMassas: number;
  readonly fracaoCombustivel: number;
}

/**
 * Equação de Tsiolkovsky.
 *
 * O resultado mais importante da engenharia de foguetes, e também o mais
 * desanimador: o delta-v cresce apenas com o LOGARITMO da razão de massas.
 * Dobrar a velocidade final exige elevar ao quadrado a quantidade de
 * combustível.
 */
export function tsiolkovskyComPassos(
  massaInicial: number,
  massaFinal: number,
  velocidadeExaustao: number,
): Resolucao<Propulsao> {
  if (massaFinal <= 0 || massaInicial <= 0) {
    throw new ErroMatematico('As massas devem ser positivas.');
  }

  if (massaFinal > massaInicial) {
    throw new ErroMatematico('A massa final não pode ser maior que a inicial.');
  }

  if (velocidadeExaustao <= 0) {
    throw new ErroMatematico('A velocidade de exaustão deve ser positiva.');
  }

  const razaoMassas = massaInicial / massaFinal;
  const deltaV = velocidadeExaustao * Math.log(razaoMassas);
  const fracaoCombustivel = 1 - massaFinal / massaInicial;

  return {
    resultado: { deltaV, razaoMassas, fracaoCombustivel },
    passos: [
      {
        descricao: 'O foguete acelera expelindo massa: é conservação de momento linear.',
        tex: 'm\\,dv = -v_e\\,dm',
        nota: 'Não há nada em que se apoiar no vácuo — o que empurra o foguete é o gás que ele joga para trás.',
      },
      {
        descricao: 'Integrando ao longo da queima, aparece o logaritmo.',
        tex: '\\Delta v = v_e \\ln\\frac{m_0}{m_f}',
      },
      {
        descricao: 'Calculamos a razão de massas.',
        tex: `\\frac{m_0}{m_f} = ${formatar(Number(razaoMassas.toFixed(4)))}`,
      },
      {
        descricao: 'E o delta-v disponível.',
        tex: `\\Delta v = ${formatar(Number((deltaV / 1000).toFixed(4)))}\\,\\text{km/s}`,
        nota:
          `Combustível: ${formatar(Number((fracaoCombustivel * 100).toFixed(1)))}% da massa inicial. ` +
          'Como o ganho é logarítmico, cada km/s extra custa muito mais que o anterior — e é ' +
          'por isso que foguetes têm estágios.',
      },
    ],
  };
}

/** Empuxo de um motor de foguete: vazão de massa vezes velocidade de exaustão. */
export function empuxoDeMotorComPassos(
  vazaoMassica: number,
  velocidadeExaustao: number,
): Resolucao<number> {
  if (vazaoMassica <= 0 || velocidadeExaustao <= 0) {
    throw new ErroMatematico('Vazão e velocidade de exaustão devem ser positivas.');
  }

  const resultado = vazaoMassica * velocidadeExaustao;
  const impulsoEspecifico = velocidadeExaustao / 9.81;

  return {
    resultado,
    passos: [
      {
        descricao: 'O empuxo é a taxa com que o motor entrega momento ao gás.',
        tex: 'F = \\dot{m}\\,v_e',
      },
      {
        descricao: 'Substituindo vazão e velocidade de exaustão.',
        tex: `F = ${formatar(vazaoMassica)} \\times ${formatar(velocidadeExaustao)} = ${formatar(Number(resultado.toFixed(1)))}\\,\\text{N}`,
      },
      {
        descricao: 'O impulso específico expressa a mesma eficiência em segundos.',
        tex: `I_{sp} = \\frac{v_e}{g_0} = ${formatar(Number(impulsoEspecifico.toFixed(1)))}\\,\\text{s}`,
        nota: 'Isp alto significa mais empuxo por quilo de propelente queimado.',
      },
    ],
  };
}
