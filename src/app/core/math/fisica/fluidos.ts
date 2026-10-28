import { formatar } from '@core/math/algebra/polinomio';
import { ErroMatematico, Resolucao } from '@core/math/tipos';
import { GRAVIDADE_PADRAO } from '@core/math/fisica/mecanica';

/**
 * Fluidos, aerodinâmica e termodinâmica.
 *
 * O que sustenta uma asa e o que move um motor. A sustentação sai de
 * Bernoulli, que por sua vez é conservação de energia aplicada a um fluido; o
 * motor sai da primeira lei, que é conservação de energia aplicada ao calor.
 */

/** Densidade do ar ao nível do mar, em kg/m³. */
export const DENSIDADE_AR = 1.225;

/** Densidade da água, em kg/m³. */
export const DENSIDADE_AGUA = 1000;

/** Constante universal dos gases, em J/(mol·K). */
export const R_GASES = 8.314;

/** Pressão hidrostática a uma profundidade. */
export function pressaoHidrostaticaComPassos(
  profundidade: number,
  densidade = DENSIDADE_AGUA,
  pressaoSuperficie = 101325,
  gravidade = GRAVIDADE_PADRAO,
): Resolucao<number> {
  if (profundidade < 0) {
    throw new ErroMatematico('A profundidade não pode ser negativa.');
  }

  const coluna = densidade * gravidade * profundidade;
  const resultado = pressaoSuperficie + coluna;

  return {
    resultado,
    passos: [
      {
        descricao: 'A pressão numa profundidade é a atmosférica mais o peso da coluna de fluido.',
        tex: 'p = p_0 + \\rho g h',
      },
      {
        descricao: 'Calculamos a contribuição da coluna.',
        tex: `\\rho g h = ${formatar(densidade)} \\cdot ${formatar(gravidade)} \\cdot ${formatar(profundidade)} = ${coluna.toExponential(4)}\\,\\text{Pa}`,
        nota: 'Note que a pressão não depende da forma do recipiente, apenas da altura.',
      },
      {
        descricao: 'Somando a pressão na superfície.',
        tex: `p = ${resultado.toExponential(4)}\\,\\text{Pa} = ${formatar(Number((resultado / 101325).toFixed(3)))}\\,\\text{atm}`,
        nota: 'A cada 10 m de água, a pressão aumenta aproximadamente 1 atmosfera.',
      },
    ],
  };
}

export interface Empuxo {
  readonly empuxo: number;
  readonly peso: number;
  readonly flutua: boolean;
  readonly fracaoSubmersa: number;
}

/**
 * Empuxo de Arquimedes.
 *
 * O empuxo é o peso do fluido deslocado — não o peso do corpo. Daí a regra
 * prática: flutua o que é menos denso que o fluido, independentemente do
 * tamanho.
 */
export function empuxoArquimedesComPassos(
  volume: number,
  densidadeCorpo: number,
  densidadeFluido = DENSIDADE_AGUA,
  gravidade = GRAVIDADE_PADRAO,
): Resolucao<Empuxo> {
  if (volume <= 0 || densidadeCorpo <= 0 || densidadeFluido <= 0) {
    throw new ErroMatematico('Volume e densidades devem ser positivos.');
  }

  const empuxo = densidadeFluido * volume * gravidade;
  const peso = densidadeCorpo * volume * gravidade;
  const flutua = densidadeCorpo < densidadeFluido;
  const fracaoSubmersa = Math.min(1, densidadeCorpo / densidadeFluido);

  return {
    resultado: { empuxo, peso, flutua, fracaoSubmersa },
    passos: [
      {
        descricao: 'O empuxo é o peso do fluido deslocado pelo corpo.',
        tex: `E = \\rho_{fluido}\\,V g = ${formatar(Number(empuxo.toFixed(3)))}\\,\\text{N}`,
      },
      {
        descricao: 'O peso do corpo usa a densidade DELE.',
        tex: `P = \\rho_{corpo}\\,V g = ${formatar(Number(peso.toFixed(3)))}\\,\\text{N}`,
      },
      {
        descricao: flutua
          ? 'O empuxo supera o peso: o corpo flutua.'
          : 'O peso supera o empuxo: o corpo afunda.',
        tex: flutua ? 'E > P' : 'E \\le P',
        nota: 'Como o volume aparece nos dois, a comparação se reduz às densidades.',
      },
      {
        descricao: flutua
          ? 'Em equilíbrio flutuando, a fração submersa é a razão das densidades.'
          : 'Totalmente submerso, o corpo desce com a resultante.',
        tex: flutua
          ? `\\frac{V_{sub}}{V} = \\frac{\\rho_{corpo}}{\\rho_{fluido}} = ${formatar(Number((fracaoSubmersa * 100).toFixed(1)))}\\%`
          : `F_R = ${formatar(Number((peso - empuxo).toFixed(3)))}\\,\\text{N}`,
        nota: flutua
          ? 'Gelo em água: densidade 0,92, logo 92% submerso — a ponta do iceberg é mesmo pequena.'
          : undefined,
      },
    ],
  };
}

/**
 * Equação de Bernoulli entre dois pontos de um escoamento.
 *
 * É conservação de energia por unidade de volume. A consequência que importa
 * para o voo: onde o fluido vai mais rápido, a pressão é menor.
 */
export function bernoulliComPassos(
  pressaoA: number,
  velocidadeA: number,
  velocidadeB: number,
  alturaA = 0,
  alturaB = 0,
  densidade = DENSIDADE_AR,
  gravidade = GRAVIDADE_PADRAO,
): Resolucao<number> {
  if (densidade <= 0) {
    throw new ErroMatematico('A densidade deve ser positiva.');
  }

  const resultado =
    pressaoA +
    (densidade * (velocidadeA * velocidadeA - velocidadeB * velocidadeB)) / 2 +
    densidade * gravidade * (alturaA - alturaB);

  return {
    resultado,
    passos: [
      {
        descricao: 'Bernoulli é conservação de energia por unidade de volume.',
        tex: 'p + \\frac{\\rho v^{2}}{2} + \\rho g h = \\text{constante}',
      },
      {
        descricao: 'Igualamos os dois pontos do escoamento.',
        tex: 'p_A + \\frac{\\rho v_A^{2}}{2} + \\rho g h_A = p_B + \\frac{\\rho v_B^{2}}{2} + \\rho g h_B',
      },
      {
        descricao: 'Isolando a pressão no segundo ponto.',
        tex: `p_B = ${resultado.toExponential(5)}\\,\\text{Pa}`,
        nota:
          velocidadeB > velocidadeA
            ? 'O fluido acelerou, então a pressão caiu — é o princípio da sustentação.'
            : 'O fluido desacelerou, então a pressão subiu.',
      },
    ],
  };
}

/** Força de sustentação de uma asa, pela diferença de pressão. */
export function sustentacaoComPassos(
  area: number,
  velocidadeSuperior: number,
  velocidadeInferior: number,
  densidade = DENSIDADE_AR,
): Resolucao<number> {
  if (area <= 0) {
    throw new ErroMatematico('A área da asa deve ser positiva.');
  }

  const diferencaPressao =
    (densidade * (velocidadeSuperior * velocidadeSuperior - velocidadeInferior * velocidadeInferior)) /
    2;

  const resultado = diferencaPressao * area;

  return {
    resultado,
    passos: [
      {
        descricao: 'Por Bernoulli, a diferença de velocidade produz diferença de pressão.',
        tex: '\\Delta p = \\frac{\\rho}{2}\\left(v_{sup}^{2} - v_{inf}^{2}\\right)',
      },
      {
        descricao: 'Calculamos essa diferença.',
        tex: `\\Delta p = ${formatar(Number(diferencaPressao.toFixed(2)))}\\,\\text{Pa}`,
        nota: 'O ar passa mais rápido por cima da asa, e a pressão ali é menor.',
      },
      {
        descricao: 'A sustentação é a diferença de pressão aplicada sobre a área.',
        tex: `L = \\Delta p \\cdot A = ${formatar(Number(resultado.toFixed(1)))}\\,\\text{N}`,
        nota:
          'A sustentação cresce com o QUADRADO da velocidade: dobrar a velocidade a quadruplica.',
      },
    ],
  };
}

export interface EstadoGas {
  readonly pressao: number;
  readonly volume: number;
  readonly temperatura: number;
  readonly mols: number;
}

/** Lei dos gases ideais: resolve a variável que falta. */
export function gasIdealComPassos(
  conhecidos: { readonly pressao?: number; readonly volume?: number; readonly temperatura?: number; readonly mols?: number },
): Resolucao<EstadoGas> {
  const { pressao, volume, temperatura, mols } = conhecidos;
  const informados = [pressao, volume, temperatura, mols].filter((v) => v !== undefined).length;

  if (informados !== 3) {
    throw new ErroMatematico('Informe exatamente três das quatro grandezas.');
  }

  if (temperatura !== undefined && temperatura <= 0) {
    throw new ErroMatematico('A temperatura deve estar em kelvin, e ser positiva.');
  }

  const faltante =
    pressao === undefined
      ? 'pressão'
      : volume === undefined
        ? 'volume'
        : temperatura === undefined
          ? 'temperatura'
          : 'quantidade de matéria';

  const resultado: EstadoGas = {
    pressao: pressao ?? (mols! * R_GASES * temperatura!) / volume!,
    volume: volume ?? (mols! * R_GASES * temperatura!) / pressao!,
    temperatura: temperatura ?? (pressao! * volume!) / (mols! * R_GASES),
    mols: mols ?? (pressao! * volume!) / (R_GASES * temperatura!),
  };

  return {
    resultado,
    passos: [
      {
        descricao: 'A equação de estado relaciona as quatro grandezas.',
        tex: 'pV = nRT',
      },
      {
        descricao: `Isolamos a grandeza que falta: ${faltante}.`,
        tex:
          pressao === undefined
            ? 'p = \\frac{nRT}{V}'
            : volume === undefined
              ? 'V = \\frac{nRT}{p}'
              : temperatura === undefined
                ? 'T = \\frac{pV}{nR}'
                : 'n = \\frac{pV}{RT}',
        nota: 'A temperatura entra sempre em kelvin: em celsius a proporcionalidade se quebra.',
      },
      {
        descricao: 'Substituindo e calculando.',
        tex:
          `p = ${resultado.pressao.toExponential(4)}\\,\\text{Pa} \\quad ` +
          `V = ${resultado.volume.toExponential(4)}\\,\\text{m}^{3} \\quad ` +
          `T = ${formatar(Number(resultado.temperatura.toFixed(2)))}\\,\\text{K}`,
      },
    ],
  };
}

/** Primeira lei da termodinâmica: ΔU = Q − W. */
export function primeiraLeiComPassos(calor: number, trabalho: number): Resolucao<number> {
  const resultado = calor - trabalho;

  return {
    resultado,
    passos: [
      {
        descricao: 'A primeira lei é conservação de energia aplicada ao calor.',
        tex: '\\Delta U = Q - W',
      },
      {
        descricao: 'Calor recebido aumenta a energia interna; trabalho realizado a diminui.',
        tex: `\\Delta U = ${formatar(calor)} - ${formatar(trabalho)} = ${formatar(resultado)}\\,\\text{J}`,
        nota: 'O sinal de W: positivo quando o gás EXPANDE, empurrando o pistão.',
      },
      {
        descricao:
          resultado > 0
            ? 'Energia interna aumentou: o gás esquentou.'
            : resultado < 0
              ? 'Energia interna diminuiu: o gás esfriou.'
              : 'Energia interna constante: todo o calor recebido virou trabalho.',
        tex: resultado === 0 ? '\\Delta U = 0' : `\\Delta U ${resultado > 0 ? '>' : '<'} 0`,
        nota:
          resultado === 0
            ? 'É o processo isotérmico: a máquina converte calor em trabalho sem acumular energia.'
            : undefined,
      },
    ],
  };
}

/** Trabalho numa expansão isobárica: W = pΔV. */
export function trabalhoIsobaricoComPassos(
  pressao: number,
  volumeInicial: number,
  volumeFinal: number,
): Resolucao<number> {
  if (pressao <= 0) {
    throw new ErroMatematico('A pressão deve ser positiva.');
  }

  const variacao = volumeFinal - volumeInicial;
  const resultado = pressao * variacao;

  return {
    resultado,
    passos: [
      {
        descricao: 'A pressão constante faz o trabalho ser simplesmente a área do retângulo p × ΔV.',
        tex: 'W = p\\,\\Delta V',
      },
      {
        descricao: 'Calculamos a variação de volume.',
        tex: `\\Delta V = ${formatar(volumeFinal)} - ${formatar(volumeInicial)} = ${formatar(variacao)}\\,\\text{m}^{3}`,
      },
      {
        descricao: 'Multiplicando pela pressão.',
        tex: `W = ${resultado.toExponential(4)}\\,\\text{J}`,
        nota:
          variacao > 0
            ? 'Expansão: o gás realiza trabalho sobre o ambiente.'
            : variacao < 0
              ? 'Compressão: o ambiente realiza trabalho sobre o gás.'
              : 'Volume constante: nenhum trabalho é realizado.',
      },
    ],
  };
}
