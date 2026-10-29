import { ErroMatematico, Passo, Resolucao } from '@core/math/tipos';
import { formatar } from './polinomio';

/**
 * Inequações do 1º grau.
 *
 * O ponto central do tema é um só: multiplicar ou dividir os dois lados por um
 * número negativo INVERTE o sentido da desigualdade. Aqui isso aparece como um
 * passo explícito, com a razão ao lado.
 */

export type Relacao = '<' | '<=' | '>' | '>=';

export const SIMBOLO_RELACAO: Readonly<Record<Relacao, string>> = {
  '<': '<',
  '<=': '\\leq',
  '>': '>',
  '>=': '\\geq',
};

const INVERSA: Readonly<Record<Relacao, Relacao>> = {
  '<': '>',
  '<=': '>=',
  '>': '<',
  '>=': '<=',
};

export interface SolucaoInequacao {
  /** O valor crítico, onde a desigualdade vira igualdade. */
  readonly fronteira: number;
  /** A relação final, já com eventual inversão aplicada. */
  readonly relacao: Relacao;
  readonly intervaloTex: string;
  /** A fronteira entra no conjunto solução? */
  readonly inclusiva: boolean;
}

export function resolverInequacaoComPassos(
  a: number,
  b: number,
  relacao: Relacao,
  c = 0,
): Resolucao<SolucaoInequacao> {
  if (a === 0) {
    throw new ErroMatematico('Com a = 0 não há inequação do 1º grau para resolver.');
  }

  const passos: Passo[] = [
    {
      descricao: 'Partimos da inequação.',
      tex: `${formatar(a)}x ${b >= 0 ? '+' : '-'} ${formatar(Math.abs(b))} ${SIMBOLO_RELACAO[relacao]} ${formatar(c)}`,
    },
  ];

  if (b !== 0) {
    passos.push({
      descricao: `Subtraímos ${formatar(b)} dos dois lados — somar e subtrair NÃO afeta o sentido.`,
      tex: `${formatar(a)}x ${SIMBOLO_RELACAO[relacao]} ${formatar(c - b)}`,
    });
  }

  const relacaoFinal = a < 0 ? INVERSA[relacao] : relacao;
  const fronteira = (c - b) / a;

  if (a < 0) {
    passos.push({
      descricao: `Dividimos por ${formatar(a)}, que é NEGATIVO — e por isso o sentido se inverte.`,
      tex: `x ${SIMBOLO_RELACAO[relacaoFinal]} ${formatar(fronteira)}`,
      nota:
        'Multiplicar por um negativo espelha a reta numérica: o que era maior passa a ser ' +
        'menor. Confira com um exemplo: 2 < 3, mas −2 > −3.',
    });
  } else {
    passos.push({
      descricao: `Dividimos por ${formatar(a)}, que é positivo — o sentido se mantém.`,
      tex: `x ${SIMBOLO_RELACAO[relacaoFinal]} ${formatar(fronteira)}`,
    });
  }

  const inclusiva = relacaoFinal === '<=' || relacaoFinal === '>=';
  const paraDireita = relacaoFinal === '>' || relacaoFinal === '>=';

  const intervaloTex = paraDireita
    ? `\\left${inclusiva ? '[' : '('}${formatar(fronteira)},\\; +\\infty\\right)`
    : `\\left(-\\infty,\\; ${formatar(fronteira)}\\right${inclusiva ? ']' : ')'}`;

  passos.push({
    descricao: 'O conjunto solução é um intervalo da reta.',
    tex: `S = \\{x \\in \\mathbb{R} \\mid x ${SIMBOLO_RELACAO[relacaoFinal]} ${formatar(fronteira)}\\} = ${intervaloTex}`,
    nota: inclusiva
      ? 'A fronteira entra na solução, por isso o colchete e a bolinha preenchida.'
      : 'A fronteira fica de fora, por isso o parêntese e a bolinha vazada.',
  });

  return {
    resultado: { fronteira, relacao: relacaoFinal, intervaloTex, inclusiva },
    passos,
  };
}
