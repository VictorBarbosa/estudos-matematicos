import { Relacao, SIMBOLO_RELACAO, resolverInequacaoComPassos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, formatarNumero, proximosEmCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

/**
 * A resposta de uma inequação: o conjunto solução, não só a fronteira.
 *
 * Antes o gerador pedia apenas o número da fronteira, e o SENTIDO da
 * desigualdade — que é o assunto do tópico — nunca era avaliado: quem invertia
 * o sinal ao dividir por um negativo acertava o exercício. A descrição do
 * currículo já prometia "o conjunto solução na reta"; agora é isso que se pede.
 */
export interface ConjuntoSolucao {
  readonly relacao: Relacao;
  readonly fronteira: number;
}

const RELACOES: readonly Relacao[] = ['<', '<=', '>', '>='];

/** O oposto de cada relação, para a armadilha do sentido invertido. */
const INVERSA: Readonly<Record<Relacao, Relacao>> = {
  '<': '>',
  '<=': '>=',
  '>': '<',
  '>=': '<=',
};

const proximaFronteira = proximosEmCasas(2, 1e-4);

const mesmoConjunto = (a: ConjuntoSolucao, b: ConjuntoSolucao): boolean =>
  a.relacao === b.relacao && proximaFronteira(a.fronteira, b.fronteira);

/** `x > 3`, `x ≥ -1,5`, `> 3`, `3 < x` — e também `x>3/4` ou `x > √2`. */
const FORMA_DIRETA = /^x?(<=|>=|<|>|≤|≥)(.+)$/;
const FORMA_INVERTIDA = /^(.+?)(<=|>=|<|>|≤|≥)x$/;

const RELACAO_DIGITADA: Readonly<Record<string, Relacao>> = {
  '<': '<',
  '<=': '<=',
  '≤': '<=',
  '>': '>',
  '>=': '>=',
  '≥': '>=',
};

/**
 * Exercícios de inequação do 1º grau.
 *
 * A resposta é o conjunto solução inteiro — sentido e fronteira —, porque é a
 * inversão do sentido que o tópico ensina.
 */
export const geradorInequacoes: GeradorExercicio<ConjuntoSolucao> = {
  topicoId: 'inequacoes',
  formatoResposta: 'o conjunto solução, ex.: x > 3 · x <= -1,5 · x > 3/4',

  gerar(nivel: Nivel, rng: Rng): Exercicio<ConjuntoSolucao> {
    const { a, b, c, relacao } = sortear(nivel, rng);

    const resolucao = resolverInequacaoComPassos(a, b, relacao, c);
    const { fronteira, relacao: relacaoFinal, intervaloTexto } = resolucao.resultado;
    const gabarito: ConjuntoSolucao = { relacao: relacaoFinal, fronteira };

    const coeficiente = a === 1 ? '' : a === -1 ? '-' : String(a);
    const enunciadoTex = `${coeficiente}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)} ${SIMBOLO_RELACAO[relacao]} ${c}`;

    return {
      id: `inequacoes-${nivel}-${a}-${b}-${c}-${relacao}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado:
        'Resolva a inequação e informe o conjunto solução, no formato x > valor ' +
        '(use <=, >= quando a fronteira entrar).',
      enunciadoTex,
      gabarito,
      resolucao: { resultado: gabarito, passos: resolucao.passos },
      conceitos:
        a < 0
          ? ['inequacoes.inversao', 'inequacoes.conjunto']
          : ['inequacoes.conjunto', 'inequacoes.representacao'],
      armadilhas: semColisoes(
        [
          {
            resposta: { relacao: INVERSA[relacaoFinal], fronteira },
            diagnostico:
              a < 0
                ? `A fronteira está certa, mas o SENTIDO não: dividir por ${a}, que é ` +
                  'negativo, inverte a desigualdade. Confira com um exemplo: 2 < 3, mas ' +
                  '−2 > −3.'
                : 'O sentido da desigualdade foi trocado sem motivo: o coeficiente de x é ' +
                  'positivo, então ele se mantém do começo ao fim.',
            passo: resolucao.passos.length - 2,
            conceito: a < 0 ? 'inequacoes.inversao' : 'inequacoes.conjunto',
          },
          {
            resposta: { relacao: relacaoFinal, fronteira: (c + b) / a },
            diagnostico:
              `Você somou ${Math.abs(b)} em vez de subtrair ao isolar o termo com x. A ` +
              'operação precisa DESFAZER o que está escrito na inequação.',
            passo: 1,
            conceito: 'inequacoes.conjunto',
          },
          {
            resposta: { relacao: relacaoFinal, fronteira: -fronteira },
            diagnostico:
              'O sentido está certo, mas o sinal da fronteira não. Confira a divisão pelo ' +
              'coeficiente de x.',
            passo: resolucao.passos.length - 2,
            conceito: 'inequacoes.conjunto',
          },
          {
            resposta: {
              relacao: relacaoFinal === '<' || relacaoFinal === '<=' ? '<=' : '>=',
              fronteira,
            },
            diagnostico:
              'A fronteira NÃO entra no conjunto: a desigualdade do enunciado é estrita, ' +
              `então a resposta usa ${SIMBOLO_RELACAO[relacaoFinal] === '<' ? '<' : '>'} ` +
              'e não ≤ ou ≥.',
            passo: resolucao.passos.length - 1,
            conceito: 'inequacoes.representacao',
          },
        ],
        gabarito,
        mesmoConjunto,
      ),
      dica:
        a < 0 && nivel !== 'facil'
          ? `O coeficiente de x é ${a}: ao dividir por ele, o sentido se inverte. ` +
            `Na reta, a solução é ${intervaloTexto}.`
          : undefined,
    };
  },

  analisar: (entrada) => {
    const limpo = entrada.trim().toLowerCase().replace(/\s+/g, '');

    const direta = FORMA_DIRETA.exec(limpo);
    if (direta) {
      const fronteira = analisarNumero(direta[2]!);
      return fronteira === null ? null : { relacao: RELACAO_DIGITADA[direta[1]!]!, fronteira };
    }

    // "3 < x" é o mesmo conjunto que "x > 3": vale aceitar as duas escritas.
    const invertida = FORMA_INVERTIDA.exec(limpo);
    if (invertida) {
      const fronteira = analisarNumero(invertida[1]!);
      return fronteira === null
        ? null
        : { relacao: INVERSA[RELACAO_DIGITADA[invertida[2]!]!], fronteira };
    }

    return null;
  },

  saoEquivalentes: mesmoConjunto,
  formatar: ({ relacao, fronteira }) =>
    `x ${relacao === '<=' ? '≤' : relacao === '>=' ? '≥' : relacao} ${formatarNumero(fronteira, 2)}`,
};

function sortear(nivel: Nivel, rng: Rng): { a: number; b: number; c: number; relacao: Relacao } {
  const relacao = rng.escolher(RELACOES);

  switch (nivel) {
    case 'facil': {
      // Coeficiente positivo: o sentido nunca se inverte.
      const a = rng.inteiro(2, 6);
      const fronteira = rng.inteiro(1, 9);
      const b = rng.inteiro(1, 10);
      return { a, b, c: a * fronteira + b, relacao };
    }
    case 'medio': {
      // Coeficiente pode ser negativo: a inversão entra em cena.
      const a = rng.inteiro(2, 7) * rng.sinal();
      const fronteira = rng.inteiro(-8, 8);
      const b = rng.inteiro(-12, 12);
      return { a, b, c: a * fronteira + b, relacao };
    }
    case 'dificil': {
      // Fronteira fracionária, com coeficiente negativo frequente.
      return {
        a: rng.inteiro(2, 9) * (rng.booleano(0.6) ? -1 : 1),
        b: rng.inteiro(-15, 15),
        c: rng.inteiro(-15, 15),
        relacao,
      };
    }
  }
}
