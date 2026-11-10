import { Fracao } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { Exercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const saoEquivalentes = (a: Fracao, b: Fracao): boolean => a.igualA(b);

/** Quantos inteiros n satisfazem lo (<|≤) n (<|≤) hi. */
export function inteirosEntre(lo: number, hi: number, fechado: boolean): number {
  const eps = 1e-9;
  const primeiro = fechado ? Math.ceil(lo - eps) : Math.floor(lo + eps) + 1;
  const ultimo = fechado ? Math.floor(hi + eps) : Math.ceil(hi - eps) - 1;
  return Math.max(0, ultimo - primeiro + 1);
}

/** Os inteiros do intervalo, para mostrar na resolução (no máximo uns 15). */
function listaDeInteiros(lo: number, hi: number, fechado: boolean): string {
  const eps = 1e-9;
  const primeiro = fechado ? Math.ceil(lo - eps) : Math.floor(lo + eps) + 1;
  const ultimo = fechado ? Math.floor(hi + eps) : Math.ceil(hi - eps) - 1;
  if (ultimo < primeiro) return '\\varnothing';
  if (ultimo - primeiro > 14) return `${primeiro}, ${primeiro + 1}, \\ldots, ${ultimo}`;
  return Array.from({ length: ultimo - primeiro + 1 }, (_, i) => primeiro + i).join(',\\; ');
}

/**
 * Inequação modular: |ax + b| < c (Difícil) ou |ax + b| > c (Extremo).
 *
 * O módulo é distância: |u| < c é «u perto de zero», um intervalo; |u| > c é
 * «u longe de zero», duas semirretas. A resposta é uma contagem de inteiros,
 * para caber no campo numérico sem perder a leitura do conjunto.
 */
export function exercicioInequacaoModular(nivel: Nivel, rng: Rng): Exercicio<Fracao> {
  const fora = nivel === 'extremo';
  const a = rng.escolher([1, 2, 3, -2, 4]);
  const b = rng.inteiro(-7, 7);
  const c = rng.inteiro(2, 9);
  const inclui = rng.booleano();

  const interna = `${a === 1 ? '' : a === -1 ? '-' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}`;
  const extremo1 = Fracao.criar(-c - b, a).simplificar();
  const extremo2 = Fracao.criar(c - b, a).simplificar();
  const [lo, hi] =
    extremo1.paraDecimal() < extremo2.paraDecimal() ? [extremo1, extremo2] : [extremo2, extremo1];
  const menor = inclui ? '\\leq' : '<';
  const maior = inclui ? '\\geq' : '>';

  // Dentro: o intervalo, com as bordas se a relação inclui. Fora: os que NÃO
  // satisfazem são os do intervalo complementar, com as bordas trocadas.
  const fechadoDentro = fora ? !inclui : inclui;
  const contagem = inteirosEntre(lo.paraDecimal(), hi.paraDecimal(), fechadoDentro);
  const gabarito = Fracao.deInteiro(contagem);
  const bordasTrocadas = inteirosEntre(lo.paraDecimal(), hi.paraDecimal(), !fechadoDentro);
  const intervaloTex = `${lo.paraTex()} ${fechadoDentro ? '\\leq' : '<'} x ${fechadoDentro ? '\\leq' : '<'} ${hi.paraTex()}`;

  const armadilhas = [
    {
      resposta: Fracao.deInteiro(bordasTrocadas),
      diagnostico: fora
        ? 'As bordas foram tratadas ao contrário. Os que NÃO satisfazem ficam entre as bordas, e uma borda só é excluída da contagem se ela satisfaz a inequação.'
        : inclui
          ? 'Com ≤, as bordas entram: elas satisfazem |u| = c. Conte-as também.'
          : 'Com <, as bordas NÃO entram: nelas o módulo vale exatamente c.',
      passo: 2,
      conceito: 'modular.inequacoes',
    },
  ];
  if (fora) {
    armadilhas.push({
      resposta: Fracao.deInteiro(contagem === 0 ? 1 : 0),
      diagnostico:
        '|u| > c é «u LONGE de zero»: a solução são duas semirretas, e quem fica de fora é o intervalo do meio.',
      passo: 0,
      conceito: 'modular.inequacoes',
    });
  }

  return {
    id: `modular-ineq-${fora ? 'fora' : 'dentro'}-${a}${b}${c}${inclui ? 'f' : 'a'}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: fora
      ? 'Quantos números inteiros NÃO satisfazem a inequação?'
      : 'Quantos números inteiros satisfazem a inequação?',
    enunciadoTex: `\\left|${interna}\\right| ${fora ? maior : menor} ${c}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        fora
          ? {
              descricao: `Módulo maior que ${c}: o que está dentro fica LONGE de zero, abaixo de −${c} ou acima de ${c}.`,
              tex: `${interna} ${inclui ? '\\leq' : '<'} -${c} \\quad \\text{ou} \\quad ${interna} ${maior} ${c}`,
              nota: 'Os que NÃO satisfazem são os do meio: a distância até zero é menor que c.',
            }
          : {
              descricao: `Módulo menor que ${c}: o que está dentro fica PERTO de zero, entre −${c} e ${c}.`,
              tex: `-${c} ${menor} ${interna} ${menor} ${c}`,
            },
        {
          descricao:
            `Isolamos x nos dois extremos (subtrair ${b}, dividir por ${a}` +
            `${a < 0 ? ', o que inverte as desigualdades' : ''}).`,
          tex: `x = \\frac{-${c} ${b >= 0 ? '-' : '+'} ${Math.abs(b)}}{${a}} = ${extremo1.paraTex()} \\qquad x = \\frac{${c} ${b >= 0 ? '-' : '+'} ${Math.abs(b)}}{${a}} = ${extremo2.paraTex()}`,
        },
        {
          descricao: fora
            ? 'Os que NÃO satisfazem formam o intervalo do meio.'
            : 'O conjunto solução é o intervalo entre os extremos.',
          tex: intervaloTex,
        },
        {
          descricao: 'Contamos os inteiros desse intervalo.',
          tex: `${listaDeInteiros(lo.paraDecimal(), hi.paraDecimal(), fechadoDentro)} \\;\\Rightarrow\\; ${contagem}`,
        },
      ],
    },
    conceitos: ['modular.inequacoes', 'modular.distancia'],
    armadilhas: semColisoes(armadilhas, gabarito, saoEquivalentes),
    dica: fora
      ? '|u| > c vale para u < −c ou u > c. Os que NÃO satisfazem estão no meio, entre −c e c: ache esse intervalo e conte os inteiros.'
      : nivel === 'dificil'
        ? `|u| < c é o mesmo que −c < u < c: resolva a dupla desigualdade e conte os inteiros.`
        : undefined,
  };
}
