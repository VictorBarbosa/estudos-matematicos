import {
  PREFIXOS_SI,
  algarismosSignificativos,
  converterPrefixoComPassos,
  multiplicarNotacaoComPassos,
  paraNotacaoCientificaComPassos,
} from '@core/math';
import { Rng } from '@core/treino/rng';
import { analisarValorSimples } from '@core/treino/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

/**
 * Comparação relativa: 6,02×10²³ e 6,03×10²³ diferem por 10²¹ em valor
 * absoluto, mas são respostas diferentes. Uma tolerância fixa não serve.
 */
const proximos = (a: number, b: number): boolean => {
  if (a === b) {
    return true;
  }
  const escala = Math.max(Math.abs(a), Math.abs(b));
  return escala === 0 ? true : Math.abs(a - b) / escala < 1e-6;
};

type Pergunta = 'expoente' | 'conversao' | 'produto' | 'significativos';

export const geradorNotacao: GeradorExercicio<number> = {
  topicoId: 'notacao-cientifica-unidades',
  formatoResposta: 'um número, ex.: 4,2 ou -3',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'expoente':
        return exercicioExpoente(nivel, rng);
      case 'conversao':
        return exercicioConversao(nivel, rng);
      case 'produto':
        return exercicioProduto(nivel, rng);
      case 'significativos':
        return exercicioSignificativos(nivel, rng);
    }
  },

  /**
   * Aceita "4,2", "-3" e também "4,2e-5" ou "3E8".
   *
   * Num tópico cujo assunto é justamente escrever números em potências de dez,
   * recusar a notação exponencial seria recusar a resposta na forma mais
   * natural de digitá-la.
   */
  analisar: analisarValorSimples,

  saoEquivalentes: proximos,
  formatar: (valor) => {
    const magnitude = Math.abs(valor);

    // Fora da faixa decimal curta, a notação científica é tanto o conteúdo do
    // tópico quanto a única forma fiel: um gabarito de 1,2×10⁻¹¹ aparecia como
    // "0" na linha "Resposta correta".
    if (valor !== 0 && (magnitude < 1e-3 || magnitude >= 1e6)) {
      return valor.toExponential(6).replace('.', ',');
    }

    return Number(valor.toPrecision(10)).toLocaleString('pt-BR', { maximumFractionDigits: 10 });
  },
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['expoente', 'significativos']);
    case 'medio':
      return rng.escolher<Pergunta>(['expoente', 'conversao', 'significativos']);
    case 'dificil':
      return rng.escolher<Pergunta>(['conversao', 'produto']);
  }
}

/** Qual é o expoente de um número escrito por extenso? */
function exercicioExpoente(nivel: Nivel, rng: Rng): Exercicio<number> {
  const mantissa = rng.inteiro(11, 99) / 10;
  const expoente = rng.escolher([-6, -4, -3, -2, 2, 3, 5, 8]);
  const valor = Number((mantissa * 10 ** expoente).toPrecision(12));

  const { passos } = paraNotacaoCientificaComPassos(valor);
  const digitos = String(valor).replace('-', '').replace('.', '').replace(/^0+/, '');

  return {
    id: `notacao-exp-${mantissa}-${expoente}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Escrevendo o número em notação científica, qual é o expoente de 10? ` +
      `(responda só o expoente, ex.: -4)`,
    enunciadoTex: `${String(valor).replace('.', '{,}')}`,
    gabarito: expoente,
    resolucao: {
      resultado: expoente,
      passos: [
        ...passos,
        {
          descricao: 'A pergunta é só pelo expoente de 10.',
          tex: `${String(valor).replace('.', '{,}')} = ${mantissa.toString().replace('.', '{,}')} \\times 10^{${expoente}} \\Rightarrow n = ${expoente}`,
        },
      ],
    },
    conceitos: ['notacao.cientifica'],
    armadilhas: semColisoes(
      [
        {
          resposta: -expoente,
          diagnostico:
            'O sinal está invertido. Número maior que 1 tem expoente positivo; menor que 1, ' +
            'negativo — e a vírgula anda no sentido contrário ao sinal.',
          passo: 1,
          conceito: 'notacao.cientifica',
        },
        {
          resposta: expoente + Math.sign(expoente || 1),
          diagnostico:
            'Faltou ou sobrou uma casa. Conte quantas posições a vírgula anda até sobrar ' +
            'exatamente um dígito diferente de zero antes dela.',
          passo: 1,
          conceito: 'notacao.cientifica',
        },
        {
          resposta: digitos.length,
          diagnostico:
            'Você contou os dígitos do número, não as casas que a vírgula andou. São coisas ' +
            'diferentes.',
          passo: 1,
          conceito: 'notacao.cientifica',
        },
      ],
      expoente,
      proximos,
    ),
    dica: nivel === 'facil' ? 'Conte as casas até sobrar um dígito antes da vírgula.' : undefined,
  };
}

/** Converter entre dois prefixos do SI. */
function exercicioConversao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const uteis = PREFIXOS_SI.filter((p) => p.expoente % 3 === 0 || p.expoente === -2);
  const de = rng.escolher(uteis);
  const para = rng.escolher(uteis.filter((p) => p.simbolo !== de.simbolo));

  const valor = rng.inteiro(1, 99) / (rng.escolher([1, 1, 10]) as number);
  const { resultado, passos } = converterPrefixoComPassos(valor, de, para);

  const unidade = rng.escolher(['m', 'g', 's', 'W']);
  const invertido = converterPrefixoComPassos(valor, para, de).resultado;

  return {
    id: `notacao-conv-${de.simbolo}${para.simbolo}-${valor}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Converta ${formatarValor(valor)} ${de.simbolo}${unidade} para ${para.simbolo}${unidade}.`,
    enunciadoTex:
      `${formatarTex(valor)}\\,\\text{${de.simbolo}${unidade}} = \\;?\\;\\text{${para.simbolo}${unidade}}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['notacao.unidades', 'notacao.cientifica'],
    armadilhas: semColisoes(
      [
        {
          resposta: invertido,
          diagnostico:
            'O sentido da conversão foi invertido: você multiplicou onde devia dividir. ' +
            'Ao trocar por uma unidade MENOR, o número fica MAIOR.',
          passo: 1,
          conceito: 'notacao.unidades',
        },
        {
          resposta: valor,
          diagnostico: 'O valor ficou igual — a troca de prefixo sempre muda a ordem de grandeza.',
          passo: 2,
          conceito: 'notacao.unidades',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? 'Escreva os dois prefixos como potências de dez e divida.' : undefined,
  };
}

/** Produto em notação científica: qual é o expoente do resultado? */
function exercicioProduto(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = { mantissa: rng.inteiro(11, 95) / 10, expoente: rng.inteiro(-8, 8) };
  const b = { mantissa: rng.inteiro(11, 95) / 10, expoente: rng.inteiro(-8, 8) };

  const { resultado, passos } = multiplicarNotacaoComPassos(a, b);
  const semNormalizar = a.expoente + b.expoente;

  return {
    id: `notacao-prod-${a.expoente}-${b.expoente}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Multiplique e normalize. Qual é o expoente de 10 do resultado?',
    enunciadoTex:
      `(${formatarTex(a.mantissa)} \\times 10^{${a.expoente}}) \\cdot ` +
      `(${formatarTex(b.mantissa)} \\times 10^{${b.expoente}})`,
    gabarito: resultado.expoente,
    resolucao: {
      resultado: resultado.expoente,
      passos: [
        ...passos,
        {
          descricao: 'A pergunta é só pelo expoente de 10 do resultado normalizado.',
          tex: `n = ${resultado.expoente}`,
        },
      ],
    },
    conceitos: ['notacao.cientifica'],
    armadilhas: semColisoes(
      [
        {
          resposta: semNormalizar,
          diagnostico:
            'Você somou os expoentes corretamente, mas esqueceu de normalizar: o produto das ' +
            'mantissas passou de 10, o que acrescenta mais uma unidade ao expoente.',
          passo: 2,
          conceito: 'notacao.cientifica',
        },
        {
          resposta: a.expoente * b.expoente,
          diagnostico:
            'Na multiplicação de potências de mesma base os expoentes se SOMAM, não se ' +
            'multiplicam. Multiplicar expoentes é o que acontece numa potência de potência.',
          passo: 1,
          conceito: 'potencias.propriedades',
        },
      ],
      resultado.expoente,
      proximos,
    ),
  };
}

/** Quantos algarismos significativos tem o número escrito? */
function exercicioSignificativos(nivel: Nivel, rng: Rng): Exercicio<number> {
  const escrito = rng.escolher([
    '0,00420',
    '1,50',
    '1500',
    '203',
    '0,0300',
    '12,040',
    '7,0',
    '90800',
    '0,5',
    '6,022',
  ]);

  const gabarito = algarismosSignificativos(escrito);
  const digitos = escrito.replace(',', '').length;
  const semZeros = escrito.replace(',', '').replace(/0/g, '').length;

  return {
    id: `notacao-sig-${escrito}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Quantos algarismos significativos tem o número ${escrito}?`,
    enunciadoTex: escrito.replace(',', '{,}'),
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Zeros à esquerda só posicionam a vírgula: não são significativos.',
          tex: escrito.replace(',', '{,}'),
        },
        {
          descricao: escrito.includes(',')
            ? 'Há vírgula, então os zeros à direita foram medidos e contam.'
            : 'Sem vírgula, os zeros à direita são ambíguos e, por convenção, não contam.',
          tex: `${escrito.replace(',', '{,}')} \\;\\to\\; ${gabarito}`,
        },
        {
          descricao: 'Conferindo pela notação científica: sobram só os dígitos da mantissa.',
          tex: `${gabarito} \\text{ algarismos significativos}`,
        },
      ],
    },
    conceitos: ['notacao.significativos'],
    armadilhas: semColisoes(
      [
        {
          resposta: digitos,
          diagnostico:
            'Você contou todos os dígitos escritos. Zeros à esquerda não são significativos — ' +
            'eles apenas dizem onde fica a vírgula.',
          passo: 0,
          conceito: 'notacao.significativos',
        },
        {
          resposta: semZeros,
          diagnostico:
            'Você descartou todos os zeros. Zeros no meio do número, e zeros à direita depois ' +
            'da vírgula, são significativos: alguém mediu aquela casa.',
          passo: 1,
          conceito: 'notacao.significativos',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: nivel === 'facil' ? 'Escreva em notação científica: sobra só o que é significativo.' : undefined,
  };
}

function formatarValor(valor: number): string {
  return valor.toLocaleString('pt-BR', { maximumFractionDigits: 4 });
}

function formatarTex(valor: number): string {
  return String(valor).replace('.', '{,}');
}
