import { Relacao, SIMBOLO_RELACAO, resolverInequacaoComPassos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import {
  analisarNumero,
  formatarNumero,
  proximosEmCasas,
} from '@core/treino/resposta-numerica/resposta-numerica';
import {
  Exercicio,
  GeradorExercicio,
  Nivel,
  SEM_FORMULA,
  semColisoes,
} from '@core/treino/models/treino.model';
import { HistoriaInequacao, historiaPara } from '@features/algebra/inequacoes/inequacoes.contextos';

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
    /*
     * Metade das vezes a inequação nasce de uma história.
     *
     * A conta escrita treina o algoritmo; a história treina o que o algoritmo
     * não ensina — decidir que «no máximo» vira ≤, que o frete é cobrado uma
     * vez e que prejuízo é lucro negativo. Na história a fórmula NÃO aparece:
     * montá-la é metade do exercício.
     */
    if (rng.booleano(0.5)) {
      return exercicioComHistoria(nivel, rng);
    }

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
          : nivel === 'facil'
            ? `Isole x como numa equação: passe o ${Math.abs(b)} para o outro lado e divida por ${a}. Como ${a} é positivo, o sinal fica igual.`
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

/**
 * A inequação que vem de uma situação.
 *
 * O modelo é o mesmo do caminho simbólico — `a·x + b REL c`, resolvido pelo
 * mesmo `resolverInequacaoComPassos` —, então a resolução prova o gabarito do
 * mesmo jeito. O que muda é de onde vem a inequação, e a armadilha ganha o
 * vocabulário da história: «você leu “no máximo” como “pelo menos”» ensina
 * mais que «o sentido foi trocado».
 */
function exercicioComHistoria(nivel: Nivel, rng: Rng): Exercicio<ConjuntoSolucao> {
  const historia = historiaPara(nivel, rng);
  const { a, b, c, relacao } = historia;

  const resolucao = resolverInequacaoComPassos(a, b, relacao, c);
  const { fronteira, relacao: relacaoFinal, intervaloTexto } = resolucao.resultado;
  const gabarito: ConjuntoSolucao = { relacao: relacaoFinal, fronteira };

  const dividePorNegativo = a < 0;
  const estrita = relacaoFinal === '<' || relacaoFinal === '>';

  return {
    id: `inequacoes-historia-${historia.cenario}-${a}-${b}-${c}-${relacao}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: historia.texto.enunciado,
    traducoes: historia.texto.traducoes,
    enunciadoTex: SEM_FORMULA,
    gabarito,
    resolucao: { resultado: gabarito, passos: resolucao.passos },
    conceitos: dividePorNegativo
      ? ['inequacoes.modelagem', 'inequacoes.inversao']
      : ['inequacoes.modelagem', 'inequacoes.conjunto'],
    armadilhas: semColisoes(
      [
        {
          resposta: { relacao: INVERSA[relacaoFinal], fronteira },
          diagnostico: dividePorNegativo
            ? `A fronteira está certa, mas o SENTIDO não. Ao dividir por ${a}, que é negativo, ` +
              'a desigualdade se inverte — e a história não muda isso. Confira com um exemplo: ' +
              '2 < 3, mas −2 > −3.'
            : 'O sentido está trocado, e aqui o coeficiente de x é POSITIVO: nada justifica ' +
              'inverter. Confira se você leu «no máximo» como «pelo menos», ou «acima de» como ' +
              '«abaixo de».',
          diagnosticoTraducoes: {
            fr: dividePorNegativo
              ? `La frontière est juste, mais pas le SENS. En divisant par ${a}, qui est négatif, ` +
                'l’inégalité s’inverse — et l’histoire n’y change rien.'
              : 'Le sens est inversé, et ici le coefficient de x est POSITIF : rien ne justifie ' +
                'de l’inverser. Vérifiez si vous avez lu « au maximum » comme « au moins ».',
            en: dividePorNegativo
              ? `The boundary is right, but the DIRECTION is not. Dividing by ${a}, which is ` +
                'negative, flips the inequality — and the story does not change that.'
              : 'The direction is flipped, and here the x coefficient is POSITIVE: nothing ' +
                'justifies it. Check whether you read “at most” as “at least”.',
          },
          passo: resolucao.passos.length - 2,
          conceito: dividePorNegativo ? 'inequacoes.inversao' : 'inequacoes.modelagem',
        },
        {
          resposta: { relacao: relacaoFinal, fronteira: (c + b) / a },
          diagnostico:
            `Você somou ${Math.abs(b)} em vez de subtrair ao isolar x. O termo que está somando ` +
            'de um lado passa SUBTRAINDO do outro — a operação precisa desfazer o que está ' +
            'escrito.',
          diagnosticoTraducoes: {
            fr:
              `Vous avez additionné ${Math.abs(b)} au lieu de soustraire. Le terme qui est ` +
              'additionné d’un côté passe en soustraction de l’autre.',
            en:
              `You added ${Math.abs(b)} instead of subtracting. The term that is added on one ` +
              'side moves across as a subtraction.',
          },
          passo: 1,
          conceito: 'inequacoes.conjunto',
        },
        {
          resposta: {
            relacao: INVERSA[relacaoFinal],
            fronteira: estrita ? fronteira : -fronteira,
          },
          diagnostico:
            'Duas coisas mudaram de uma vez: o sentido e o sinal da fronteira. Resolva uma de ' +
            'cada vez — primeiro isole x com o sentido certo, depois confira o sinal.',
          diagnosticoTraducoes: {
            fr:
              'Deux choses ont changé à la fois : le sens et le signe de la frontière. Traitez ' +
              'les deux séparément.',
            en:
              'Two things changed at once: the direction and the sign of the boundary. Handle ' +
              'them one at a time.',
          },
          passo: resolucao.passos.length - 2,
          conceito: 'inequacoes.conjunto',
        },
        {
          resposta: {
            relacao: estrita
              ? relacaoFinal === '<'
                ? '<='
                : '>='
              : relacaoFinal === '<='
                ? '<'
                : '>',
            fronteira,
          },
          diagnostico: estrita
            ? 'A fronteira NÃO entra no conjunto: a situação pede «a partir de» ou «acima de» ' +
              'com valor exato, e a desigualdade é estrita.'
            : 'A fronteira ENTRA no conjunto: a situação diz «no máximo» ou «pelo menos», que ' +
              'é ≤ ou ≥, e não < ou >.',
          diagnosticoTraducoes: {
            fr: estrita
              ? 'La frontière N’ENTRE PAS dans l’ensemble : la situation impose une inégalité ' +
                'stricte.'
              : 'La frontière ENTRE dans l’ensemble : la situation dit « au maximum » ou « au ' +
                'moins », donc ≤ ou ≥, pas < ou >.',
            en: estrita
              ? 'The boundary does NOT enter the set: the situation calls for a strict ' +
                'inequality.'
              : 'The boundary DOES enter the set: the situation says “at most” or “at least”, ' +
                'so ≤ or ≥, not < or >.',
          },
          passo: resolucao.passos.length - 1,
          conceito: 'inequacoes.representacao',
        },
      ],
      gabarito,
      mesmoConjunto,
    ),
    dica: historia.texto.dica ?? `A solução é ${intervaloTexto}.`,
  };
}

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
    case 'extremo': {
      /*
       * Coeficiente negativo quase sempre, e de dois algarismos.
       *
       * A inversão do sentido deixa de ser exceção e passa a ser a regra, com
       * a fronteira caindo numa fração que não simplifica. É o erro mais
       * comum do tópico cobrado em quase toda questão.
       */
      const PRIMOS = [11, 13, 17, 19, 23, 29];
      return {
        a: rng.escolher(PRIMOS) * (rng.booleano(0.85) ? -1 : 1),
        b: rng.inteiro(-60, 60),
        c: rng.inteiro(-60, 60),
        relacao,
      };
    }
  }
}
