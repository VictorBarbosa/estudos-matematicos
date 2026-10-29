import {
  Fracao,
  decimalParaFracaoComPassos,
  dizimaParaFracaoComPassos,
  fracaoParaDecimalComPassos,
} from '@core/math';
import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const saoEquivalentes = (a: Fracao, b: Fracao): boolean => a.igualA(b);

/**
 * Exercícios de conversão entre decimal e fração.
 *
 * A resposta é sempre uma fração, o que permite aceitar qualquer forma
 * equivalente e manter o foco no raciocínio, não na simplificação final.
 */
export const geradorDecimais: GeradorExercicio<Fracao> = {
  topicoId: 'numeros-decimais',
  formatoResposta: 'uma fração, ex.: 3/4',

  gerar(nivel: Nivel, rng: Rng): Exercicio<Fracao> {
    if (nivel === 'facil') {
      return exercicioDecimalFinito(nivel, rng);
    }
    if (nivel === 'medio') {
      return rng.booleano()
        ? exercicioDecimalFinito(nivel, rng)
        : exercicioDizimaSimples(nivel, rng);
    }
    return rng.booleano(0.6)
      ? exercicioDizimaComposta(nivel, rng)
      : exercicioDizimaSimples(nivel, rng);
  },

  analisar: (entrada) => Fracao.analisar(entrada),
  saoEquivalentes,
  formatar: (valor) => valor.toString(),
};

function exercicioDecimalFinito(nivel: Nivel, rng: Rng): Exercicio<Fracao> {
  const casas = nivel === 'facil' ? rng.inteiro(1, 3) : rng.inteiro(2, 4);
  const potencia = 10 ** casas;
  const numerador = rng.inteiro(1, potencia - 1);
  const decimal = numerador / potencia;

  const resolucao = decimalParaFracaoComPassos(decimal);
  const gabarito = resolucao.resultado;

  return {
    id: `decimais-finito-${numerador}-${potencia}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Escreva o decimal como fração irredutível.',
    enunciadoTex: `${String(decimal).replace('.', '{,}')} = \\;?`,
    gabarito,
    resolucao,
    conceitos: ['decimais.posicional'],
    armadilhas: semColisoes(
      [
        {
          resposta: Fracao.criar(numerador, 10),
          diagnostico:
            `O denominador é 10 elevado ao NÚMERO DE CASAS decimais. Aqui são ${casas} casas, ` +
            `então o denominador é ${potencia}, não 10.`,
          passo: 0,
          conceito: 'decimais.posicional',
        },
        {
          resposta: Fracao.criar(potencia, numerador),
          diagnostico:
            'Numerador e denominador estão trocados. O numerador são os dígitos decimais; o ' +
            'denominador é a potência de dez correspondente às casas.',
          passo: 0,
          conceito: 'decimais.posicional',
        },
      ],
      gabarito,
      saoEquivalentes,
    ),
    dica: nivel === 'facil' ? 'Quantas casas há depois da vírgula?' : undefined,
  };
}

function exercicioDizimaSimples(nivel: Nivel, rng: Rng): Exercicio<Fracao> {
  const periodo = String(rng.inteiro(1, 98));
  const resolucao = dizimaParaFracaoComPassos(0, '', periodo);
  const gabarito = resolucao.resultado;

  return {
    id: `decimais-dizima-${periodo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Encontre a fração geratriz desta dízima periódica.',
    enunciadoTex: `0{,}\\overline{${periodo}} = \\;?`,
    gabarito,
    resolucao,
    conceitos: ['decimais.dizima'],
    armadilhas: semColisoes(
      [
        {
          resposta: Fracao.criar(Number(periodo), 10),
          diagnostico:
            'Você tratou a dízima como decimal finito. Com período, o denominador leva NOVES, ' +
            'não potências de dez: um 9 para cada dígito que se repete.',
          passo: 3,
          conceito: 'decimais.dizima',
        },
        {
          resposta: Fracao.criar(Number(periodo), 99),
          diagnostico:
            'A quantidade de noves tem de igualar a quantidade de dígitos do período. Aqui o ' +
            `período tem ${periodo.length} dígito, então o denominador é 9.`,
          passo: 3,
          conceito: 'decimais.dizima',
        },
      ],
      gabarito,
      saoEquivalentes,
    ),
  };
}

function exercicioDizimaComposta(nivel: Nivel, rng: Rng): Exercicio<Fracao> {
  const naoPeriodica = String(rng.inteiro(1, 9));
  const periodo = String(rng.inteiro(1, 9));

  const resolucao = dizimaParaFracaoComPassos(0, naoPeriodica, periodo);
  const gabarito = resolucao.resultado;

  return {
    id: `decimais-dizima-composta-${naoPeriodica}-${periodo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Encontre a fração geratriz desta dízima periódica composta.',
    enunciadoTex: `0{,}${naoPeriodica}\\overline{${periodo}} = \\;?`,
    gabarito,
    resolucao,
    conceitos: ['decimais.dizima', 'decimais.posicional'],
    armadilhas: semColisoes(
      [
        {
          resposta: Fracao.criar(Number(`${naoPeriodica}${periodo}`), 99),
          diagnostico:
            'Você usou só noves no denominador. Com parte NÃO periódica, entram também zeros: ' +
            'um 9 para cada dígito do período e um 0 para cada dígito que não se repete.',
          passo: 3,
          conceito: 'decimais.dizima',
        },
        {
          resposta: Fracao.criar(Number(`${naoPeriodica}${periodo}`), 90),
          diagnostico:
            'O denominador está certo, mas faltou subtrair no numerador a parte que não se ' +
            `repete: ${naoPeriodica}${periodo} − ${naoPeriodica}.`,
          passo: 2,
          conceito: 'decimais.dizima',
        },
      ],
      gabarito,
      saoEquivalentes,
    ),
  };
}

/** Exposto para o componente mostrar a conversão no sentido inverso. */
export const exemploFracaoParaDecimal = fracaoParaDecimalComPassos;
