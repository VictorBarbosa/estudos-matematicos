import { Rng } from '@core/treino/rng/rng';
import { Exercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 1e-6;

/**
 * A progressão dada por dois termos quaisquer, e não pelo primeiro e a razão.
 *
 * É a pergunta clássica de prova: entre aₚ e a_q há q − p saltos. Na PA, cada
 * salto soma r; na PG, multiplica por q. Achada a razão, volta-se ao a₁.
 *
 * - Médio: PA, pede a razão.
 * - Difícil: PA, pede o primeiro termo (a razão é só o caminho).
 * - Extremo: PG, pede o primeiro termo — a razão sai de uma raiz.
 */
export function exercicioDoisTermos(nivel: Nivel, rng: Rng): Exercicio<number> {
  return nivel === 'extremo' ? doisTermosPG(nivel, rng) : doisTermosPA(nivel, rng);
}

function doisTermosPA(nivel: Nivel, rng: Rng): Exercicio<number> {
  const pedeRazao = nivel !== 'dificil';
  const a1 = rng.inteiro(-12, 15);
  const r = rng.escolher([-5, -3, -2, 2, 3, 4, 6, 7]);
  const p = rng.inteiro(2, 6);
  const q = p + rng.inteiro(3, 9);
  const ap = a1 + (p - 1) * r;
  const aq = a1 + (q - 1) * r;
  const gabarito = pedeRazao ? r : a1;
  const saltos = q - p;

  return {
    id: `prog-dois-pa-${a1}-${r}-${p}-${q}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Numa PA, o ${p}º termo é ${ap} e o ${q}º termo é ${aq}. Qual é ${pedeRazao ? 'a razão' : 'o primeiro termo'}?`,
    enunciadoTex: `a_{${p}} = ${ap} \\qquad a_{${q}} = ${aq}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `Do ${p}º ao ${q}º termo há ${saltos} saltos de razão.`,
          tex: `a_{${q}} = a_{${p}} + (${q} - ${p})r \\;\\Rightarrow\\; ${aq} = ${ap} + ${saltos}r`,
        },
        {
          descricao: 'Isolando a razão.',
          tex: `r = \\frac{${aq} - ${ap < 0 ? `(${ap})` : ap}}{${saltos}} = \\frac{${aq - ap}}{${saltos}} = ${r}`,
        },
        ...(pedeRazao
          ? []
          : [
              {
                descricao: `Voltamos do ${p}º termo ao primeiro: ${p - 1} saltos para trás.`,
                tex: `a_1 = a_{${p}} - (${p} - 1)r = ${ap} - ${p - 1} \\cdot ${r < 0 ? `(${r})` : r} = ${a1}`,
              },
            ]),
      ],
    },
    conceitos: ['progressoes.dois-termos', 'progressoes.aritmetica'],
    armadilhas: semColisoes(
      [
        {
          resposta: (aq - ap) / (saltos + 1),
          diagnostico: `Entre o ${p}º e o ${q}º termo há ${q} − ${p} = ${saltos} saltos, não ${saltos + 1}: conte os intervalos, não os termos.`,
          passo: 0,
          conceito: 'progressoes.aritmetica',
        },
        pedeRazao
          ? {
              resposta: aq - ap,
              diagnostico: `Essa é a diferença entre os dois termos. Ela vale ${saltos} razões: divida por ${saltos}.`,
              passo: 1,
              conceito: 'progressoes.aritmetica',
            }
          : {
              resposta: ap - p * r,
              diagnostico: `Do ${p}º termo ao 1º são ${p - 1} saltos para trás, não ${p}.`,
              passo: 2,
              conceito: 'progressoes.aritmetica',
            },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'medio'
        ? 'Entre aₚ e a_q há (q − p) razões: r = (a_q − aₚ) / (q − p).'
        : nivel === 'dificil'
          ? 'Ache a razão primeiro, r = (a_q − aₚ) / (q − p); depois volte: a₁ = aₚ − (p − 1)r.'
          : undefined,
  };
}

function doisTermosPG(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a1 = rng.inteiro(1, 5) * rng.escolher([1, 1, -1]);
  const razao = rng.escolher([2, 3, -2]);
  const p = rng.inteiro(2, 3);
  // Salto ímpar quando a razão é negativa, para a raiz não ter dois sinais.
  const saltos = razao < 0 ? 3 : rng.inteiro(2, 3);
  const q = p + saltos;
  const ap = a1 * razao ** (p - 1);
  const aq = a1 * razao ** (q - 1);
  const quociente = aq / ap;

  return {
    id: `prog-dois-pg-${a1}-${razao}-${p}-${q}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Numa PG de termos reais, o ${p}º termo é ${ap} e o ${q}º termo é ${aq}. Qual é o primeiro termo?`,
    enunciadoTex: `a_{${p}} = ${ap} \\qquad a_{${q}} = ${aq}`,
    gabarito: a1,
    resolucao: {
      resultado: a1,
      passos: [
        {
          descricao: `Do ${p}º ao ${q}º termo, a razão multiplica ${saltos} vezes.`,
          tex: `a_{${q}} = a_{${p}} \\cdot q^{${saltos}} \\;\\Rightarrow\\; q^{${saltos}} = \\frac{${aq}}{${ap}} = ${quociente}`,
        },
        {
          descricao:
            saltos === 2
              ? 'Raiz quadrada (a razão positiva, já que os termos têm o mesmo sinal ao longo da sequência dada).'
              : 'Raiz cúbica, que preserva o sinal.',
          tex: `q = \\sqrt[${saltos}]{${quociente}} = ${razao}`,
        },
        {
          descricao: `Voltamos ${p - 1} ${p - 1 === 1 ? 'passo' : 'passos'} até o primeiro termo, dividindo pela razão.`,
          tex: `a_1 = \\frac{a_{${p}}}{q^{${p - 1}}} = \\frac{${ap}}{${razao < 0 ? `(${razao})` : razao}^{${p - 1}}} = ${a1}`,
        },
      ],
    },
    conceitos: ['progressoes.dois-termos', 'progressoes.geometrica'],
    armadilhas: semColisoes(
      [
        {
          resposta: ap / razao ** p,
          diagnostico: `Do ${p}º termo ao 1º são ${p - 1} divisões pela razão, não ${p}.`,
          passo: 2,
          conceito: 'progressoes.geometrica',
        },
        {
          resposta: razao,
          diagnostico: 'Essa é a razão. O pedido é o primeiro termo: falta voltar até a₁.',
          passo: 1,
          conceito: 'progressoes.geometrica',
        },
        {
          resposta: ap - (p - 1) * ((aq - ap) / saltos),
          diagnostico:
            'Isso trata a sequência como PA. Na PG a razão MULTIPLICA: divida os termos, não subtraia.',
          passo: 0,
          conceito: 'progressoes.geometrica',
        },
      ],
      a1,
      proximos,
    ),
    dica: 'Na PG, a_q / aₚ = q elevado a (q − p). Tire a raiz para achar a razão e divida aₚ por ela (p − 1) vezes.',
  };
}
