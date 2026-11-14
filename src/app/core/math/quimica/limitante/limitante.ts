import { Participante } from '@core/math/quimica/estequiometria/estequiometria';
import { Resolucao } from '@core/math/tipos/tipos';

/**
 * Reagente limitante: quem acaba primeiro decide quanto se forma.
 *
 * Numa receita de dois ingredientes, não adianta ter farinha para vinte bolos
 * se há ovo para três. A reação é igual, e o erro de quem está aprendendo é
 * escolher o limitante **pela massa** — achar que o reagente mais leve é o que
 * acaba antes. Não é: o que decide é a quantidade em mols DIVIDIDA pelo
 * coeficiente, porque é essa razão que diz quantas «receitas» cada reagente
 * alcança.
 *
 * Com os dois no mesmo coeficiente, a comparação é direta; com coeficientes
 * diferentes, ignorá-los inverte a resposta — e é por isso que a razão, e não
 * a quantidade, é a medida certa.
 */
export interface ReagenteDisponivel {
  readonly participante: Participante;
  readonly massa: number;
}

export interface AnaliseDoLimitante {
  readonly limitante: ReagenteDisponivel;
  readonly excesso: ReagenteDisponivel;
  /** Quantas «receitas» da equação cada reagente alcança. */
  readonly receitasDoLimitante: number;
  readonly receitasDoExcesso: number;
}

/** Quantas vezes a equação pode acontecer com esta massa de reagente. */
export function receitasAlcancadas(reagente: ReagenteDisponivel): number {
  const mols = reagente.massa / reagente.participante.massaMolar;

  return mols / reagente.participante.coeficiente;
}

export function acharLimitante(
  primeiro: ReagenteDisponivel,
  segundo: ReagenteDisponivel,
): AnaliseDoLimitante {
  const a = receitasAlcancadas(primeiro);
  const b = receitasAlcancadas(segundo);

  const primeiroLimita = a <= b;

  return {
    limitante: primeiroLimita ? primeiro : segundo,
    excesso: primeiroLimita ? segundo : primeiro,
    receitasDoLimitante: Math.min(a, b),
    receitasDoExcesso: Math.max(a, b),
  };
}

/** A massa de produto que o limitante permite. */
export function massaDeProduto(
  primeiro: ReagenteDisponivel,
  segundo: ReagenteDisponivel,
  produto: Participante,
): number {
  const { receitasDoLimitante } = acharLimitante(primeiro, segundo);

  return receitasDoLimitante * produto.coeficiente * produto.massaMolar;
}

/** O que sobra do reagente em excesso quando o limitante acaba. */
export function massaQueSobra(primeiro: ReagenteDisponivel, segundo: ReagenteDisponivel): number {
  const { limitante, excesso, receitasDoLimitante } = acharLimitante(primeiro, segundo);
  void limitante;

  const consumido =
    receitasDoLimitante * excesso.participante.coeficiente * excesso.participante.massaMolar;

  return excesso.massa - consumido;
}

export function massaDeProdutoComPassos(
  primeiro: ReagenteDisponivel,
  segundo: ReagenteDisponivel,
  produto: Participante,
  equacaoTex: string,
): Resolucao<number> {
  const analise = acharLimitante(primeiro, segundo);
  const resultado = massaDeProduto(primeiro, segundo, produto);

  const nomeLimitante = analise.limitante.participante.formula;
  const nomeExcesso = analise.excesso.participante.formula;

  return {
    resultado,
    passos: [
      {
        descricao: 'Cada reagente alcança um número de «receitas» da equação.',
        tex: equacaoTex,
        nota:
          'A conta é mols dividido pelo coeficiente — não a massa, e não só os mols: é a ' +
          'razão que diz quantas vezes a reação cabe.',
      },
      {
        descricao: `Para ${primeiro.participante.formula}.`,
        tex:
          `\\frac{${Number(primeiro.massa.toFixed(2))} / ${primeiro.participante.massaMolar}}` +
          `{${primeiro.participante.coeficiente}} = ${Number(receitasAlcancadas(primeiro).toFixed(4))}`,
      },
      {
        descricao: `Para ${segundo.participante.formula}.`,
        tex:
          `\\frac{${Number(segundo.massa.toFixed(2))} / ${segundo.participante.massaMolar}}` +
          `{${segundo.participante.coeficiente}} = ${Number(receitasAlcancadas(segundo).toFixed(4))}`,
      },
      {
        descricao: `O menor manda: ${nomeLimitante} é o limitante, e ${nomeExcesso} sobra.`,
        tex: `${Number(analise.receitasDoLimitante.toFixed(4))} \\;\\text{receitas}`,
        nota: 'Quem acaba primeiro decide quanto se forma; o resto do outro fica parado.',
      },
      {
        descricao: 'O produto sai dessa quantidade de receitas.',
        tex:
          `m = ${Number(analise.receitasDoLimitante.toFixed(4))} \\times ${produto.coeficiente} ` +
          `\\times ${produto.massaMolar} = ${Number(resultado.toFixed(4))}\\;\\text{g}`,
      },
    ],
  };
}

/**
 * Rendimento percentual: quanto se obteve do que era possível.
 *
 * A massa teórica é o teto — o que sairia se nada se perdesse. Na bancada
 * sempre se perde: fica na vidraria, evapora, reage de outro jeito. Por isso o
 * rendimento é quase sempre menor que 100%, e um valor acima disso denuncia
 * erro de medida ou produto impuro, nunca uma reação generosa.
 */
export function rendimento(obtida: number, teorica: number): number {
  return (obtida / teorica) * 100;
}

export function rendimentoComPassos(
  obtida: number,
  teorica: number,
  formula: string,
): Resolucao<number> {
  const resultado = rendimento(obtida, teorica);

  return {
    resultado,
    passos: [
      {
        descricao: `A massa teórica é o teto: o que sairia de ${formula} sem perda nenhuma.`,
        tex: `m_{\\text{teórica}} = ${Number(teorica.toFixed(4))}\\;\\text{g}`,
      },
      {
        descricao: 'O rendimento compara o obtido com esse teto.',
        tex:
          `\\eta = \\frac{${Number(obtida.toFixed(4))}}{${Number(teorica.toFixed(4))}} ` +
          `\\times 100`,
        nota: 'O obtido vai em cima: é ele que se compara ao que era possível.',
      },
      {
        descricao: 'Calculando.',
        tex: `\\eta = ${Number(resultado.toFixed(2))}\\%`,
        nota: 'Acima de 100% não há reação generosa: há erro de medida ou produto impuro.',
      },
    ],
  };
}
