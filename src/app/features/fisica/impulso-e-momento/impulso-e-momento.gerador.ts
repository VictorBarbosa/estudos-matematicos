import { colisaoComPassos, energiaCinetica, impulsoComPassos, momentoLinear } from '@core/math';
import { Rng } from '@core/treino/rng';
import { analisarNumero } from '@core/treino/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.05;

type Pergunta = 'momento' | 'impulso' | 'forca-media' | 'colisao-inelastica' | 'energia-perdida';

export const geradorMomento: GeradorExercicio<number> = {
  topicoId: 'impulso-e-momento',
  formatoResposta: 'um número, 2 casas decimais',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'momento':
        return exercicioMomento(nivel, rng);
      case 'impulso':
        return exercicioImpulso(nivel, rng);
      case 'forca-media':
        return exercicioForcaMedia(nivel, rng);
      case 'colisao-inelastica':
        return exercicioColisao(nivel, rng);
      case 'energia-perdida':
        return exercicioEnergiaPerdida(nivel, rng);
    }
  },

  analisar: analisarNumero,

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(2)).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['momento', 'impulso']);
    case 'medio':
      return rng.escolher<Pergunta>(['colisao-inelastica', 'forca-media', 'impulso']);
    case 'dificil':
      return rng.escolher<Pergunta>(['energia-perdida', 'colisao-inelastica', 'forca-media']);
  }
}

function exercicioMomento(nivel: Nivel, rng: Rng): Exercicio<number> {
  const massa = rng.inteiro(1, 30);
  const velocidade = rng.inteiro(2, 25);
  const resultado = momentoLinear(massa, velocidade);

  return {
    id: `mom-p-${massa}-${velocidade}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um corpo de ${massa} kg move-se a ${velocidade} m/s. Qual é seu momento linear, em ` +
      'kg·m/s?',
    enunciadoTex: `m = ${massa}\\,\\text{kg} \\qquad v = ${velocidade}\\,\\text{m/s}`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        { descricao: 'Momento linear é massa vezes velocidade.', tex: 'p = mv' },
        {
          descricao: 'Substituindo.',
          tex: `p = ${massa} \\cdot ${velocidade} = ${resultado}\\,\\text{kg·m/s}`,
          nota: 'É uma grandeza vetorial: o sinal indica o sentido do movimento.',
        },
      ],
    },
    conceitos: ['momento.impulso'],
    armadilhas: semColisoes(
      [
        {
          resposta: energiaCinetica(massa, velocidade),
          diagnostico:
            'Essa é a ENERGIA CINÉTICA, em joules. O momento é linear na velocidade, não ' +
            'quadrático, e não tem o fator 1/2.',
          passo: 0,
          conceito: 'momento.impulso',
        },
        {
          resposta: massa / velocidade,
          diagnostico: 'O momento é um produto, não uma divisão.',
          passo: 1,
          conceito: 'momento.impulso',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? 'p = mv' : undefined,
  };
}

function exercicioImpulso(nivel: Nivel, rng: Rng): Exercicio<number> {
  const forca = rng.inteiro(5, 100);
  const tempo = rng.inteiro(1, 12);
  const massa = rng.inteiro(2, 20);

  const { resultado, passos } = impulsoComPassos(forca, tempo, massa);

  return {
    id: `mom-j-${forca}-${tempo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Uma força de ${forca} N age por ${tempo} s sobre um corpo de ${massa} kg. Qual é o ` +
      'impulso, em N·s?',
    enunciadoTex: `F = ${forca}\\,\\text{N} \\qquad \\Delta t = ${tempo}\\,\\text{s} \\qquad m = ${massa}\\,\\text{kg}`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        ...passos,
        {
          descricao: 'A pergunta é pelo impulso, em N·s — não pela variação de velocidade.',
          tex: `J = F\\,\\Delta t = ${resultado}\\,\\text{N}\\cdot\\text{s}`,
        },
      ],
    },
    conceitos: ['momento.impulso'],
    armadilhas: semColisoes(
      [
        {
          resposta: resultado / massa,
          diagnostico:
            'Essa é a variação de VELOCIDADE, em m/s. O impulso é força × tempo, medido em N·s.',
          passo: 2,
          conceito: 'momento.impulso',
        },
        {
          resposta: forca / tempo,
          diagnostico: 'O impulso é um produto: força MULTIPLICADA pelo tempo de aplicação.',
          passo: 0,
          conceito: 'momento.impulso',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? 'J = F·Δt' : undefined,
  };
}

function exercicioForcaMedia(nivel: Nivel, rng: Rng): Exercicio<number> {
  const massa = rng.inteiro(2, 80);
  const velocidade = rng.inteiro(5, 30);
  const tempo = rng.escolher([0.05, 0.1, 0.2, 0.5, 1]);

  const resultado = (massa * velocidade) / tempo;

  return {
    id: `mom-f-${massa}-${velocidade}-${tempo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um corpo de ${massa} kg a ${velocidade} m/s é parado em ${tempo.toLocaleString('pt-BR')} s. ` +
      'Qual é a força média aplicada, em newtons? (2 casas decimais)',
    enunciadoTex:
      `m = ${massa}\\,\\text{kg} \\qquad v = ${velocidade}\\,\\text{m/s} \\qquad ` +
      `\\Delta t = ${String(tempo).replace('.', '{,}')}\\,\\text{s}`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'A variação de momento é o momento inicial, já que o corpo para.',
          tex: `\\Delta p = ${massa} \\cdot ${velocidade} = ${massa * velocidade}\\,\\text{kg·m/s}`,
        },
        {
          descricao: 'O impulso iguala essa variação.',
          tex: 'F\\Delta t = \\Delta p',
        },
        {
          descricao: 'Isolando a força.',
          tex: `F = \\frac{${massa * velocidade}}{${tempo}} = ${Number(resultado.toFixed(2))}\\,\\text{N}`,
          nota:
            'Dobrar o tempo de parada reduz a força à metade — é exatamente o que um airbag faz.',
        },
      ],
    },
    conceitos: ['momento.impulso'],
    armadilhas: semColisoes(
      [
        {
          resposta: massa * velocidade,
          diagnostico:
            'Essa é a variação do MOMENTO, em kg·m/s. Falta dividir pelo tempo para obter a ' +
            'força.',
          passo: 2,
          conceito: 'momento.impulso',
        },
        {
          resposta: massa * velocidade * tempo,
          diagnostico:
            'O tempo vai no DENOMINADOR: quanto mais rápida a parada, maior a força.',
          passo: 2,
          conceito: 'momento.impulso',
        },
        {
          resposta: energiaCinetica(massa, velocidade) / tempo,
          diagnostico:
            'Isso usa energia cinética e dá potência, em watts. Força vem da variação de ' +
            'momento, não de energia.',
          passo: 0,
          conceito: 'momento.impulso',
        },
      ],
      resultado,
      proximos,
    ),
  };
}

function exercicioColisao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const massaA = rng.inteiro(1, 10);
  const massaB = rng.inteiro(1, 10);
  const velocidadeA = rng.inteiro(2, 20);
  const velocidadeB = rng.escolher([0, 0, -rng.inteiro(1, 10)]);

  const { resultado, passos } = colisaoComPassos(
    massaA,
    velocidadeA,
    massaB,
    velocidadeB,
    'perfeitamente-inelastica',
  );

  return {
    id: `mom-col-${massaA}_${velocidadeA}-${massaB}_${velocidadeB}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um corpo de ${massaA} kg a ${velocidadeA} m/s colide com outro de ${massaB} kg a ` +
      `${velocidadeB} m/s e os dois seguem juntos. Qual é a velocidade final, em m/s? ` +
      '(2 casas decimais)',
    enunciadoTex:
      `m_A = ${massaA} \\quad v_A = ${velocidadeA} \\quad m_B = ${massaB} \\quad v_B = ${velocidadeB}`,
    gabarito: resultado.velocidadeFinalA,
    resolucao: { resultado: resultado.velocidadeFinalA, passos },
    conceitos: ['momento.conservacao', 'momento.colisoes'],
    armadilhas: semColisoes(
      [
        {
          resposta: (velocidadeA + velocidadeB) / 2,
          diagnostico:
            'A média simples das velocidades só valeria se as massas fossem iguais. A média ' +
            'tem de ser ponderada pelas massas.',
          passo: 1,
          conceito: 'momento.colisoes',
        },
        {
          resposta: resultado.momentoTotal,
          diagnostico:
            'Esse é o momento total, em kg·m/s. Falta dividir pela massa somada para obter a ' +
            'velocidade.',
          passo: 1,
          conceito: 'momento.conservacao',
        },
        {
          resposta: velocidadeA,
          diagnostico:
            'O corpo A desacelera na colisão: parte do seu momento foi transferida para B.',
          passo: 0,
          conceito: 'momento.conservacao',
        },
      ],
      resultado.velocidadeFinalA,
      proximos,
    ),
  };
}

function exercicioEnergiaPerdida(nivel: Nivel, rng: Rng): Exercicio<number> {
  const massaA = rng.inteiro(1, 8);
  const massaB = rng.inteiro(1, 8);
  const velocidadeA = rng.inteiro(4, 20);

  const { resultado } = colisaoComPassos(massaA, velocidadeA, massaB, 0, 'perfeitamente-inelastica');
  const perdida = resultado.energiaAntes - resultado.energiaDepois;

  return {
    id: `mom-perda-${massaA}-${massaB}-${velocidadeA}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um corpo de ${massaA} kg a ${velocidadeA} m/s atinge outro de ${massaB} kg parado, e ` +
      'os dois seguem juntos. Quanta energia cinética foi perdida, em joules? (2 casas)',
    enunciadoTex: `m_A = ${massaA} \\quad v_A = ${velocidadeA} \\quad m_B = ${massaB} \\quad v_B = 0`,
    gabarito: perdida,
    resolucao: {
      resultado: perdida,
      passos: [
        {
          descricao: 'A energia antes é só a do corpo em movimento.',
          tex: `E_i = \\frac{${massaA} \\cdot ${velocidadeA}^{2}}{2} = ${Number(resultado.energiaAntes.toFixed(3))}\\,\\text{J}`,
        },
        {
          descricao: 'A velocidade final vem da conservação do momento.',
          tex: `v_f = ${Number(resultado.velocidadeFinalA.toFixed(4))}\\,\\text{m/s}`,
        },
        {
          descricao: 'A energia depois usa a massa total.',
          tex: `E_f = ${Number(resultado.energiaDepois.toFixed(3))}\\,\\text{J}`,
        },
        {
          descricao: 'A diferença virou deformação, som e calor.',
          tex: `\\Delta E = ${Number(perdida.toFixed(3))}\\,\\text{J}`,
          nota: 'O momento se conservou; a energia cinética, não. São princípios diferentes.',
        },
      ],
    },
    conceitos: ['momento.colisoes', 'energia.conservacao'],
    armadilhas: semColisoes(
      [
        {
          resposta: 0,
          diagnostico:
            'Numa colisão perfeitamente inelástica a energia cinética SEMPRE diminui. O que se ' +
            'conserva é o momento.',
          passo: 3,
          conceito: 'momento.colisoes',
        },
        {
          resposta: resultado.energiaAntes,
          diagnostico:
            'Essa é a energia TOTAL antes da colisão. A perda é a diferença entre antes e ' +
            'depois.',
          passo: 3,
          conceito: 'momento.colisoes',
        },
        {
          resposta: resultado.energiaDepois,
          diagnostico: 'Essa é a energia que SOBROU, não a que se perdeu.',
          passo: 3,
          conceito: 'momento.colisoes',
        },
      ],
      perdida,
      proximos,
    ),
  };
}
