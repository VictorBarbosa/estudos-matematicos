import {
  GRAVIDADE_PADRAO,
  anguloCriticoComPassos,
  planoInclinadoComPassos,
  segundaLeiComPassos,
} from '@core/math';
import { Rng } from '@core/treino/rng';
import { analisarNumero } from '@core/treino/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.05;

type Pergunta = 'resultante' | 'aceleracao' | 'normal-plano' | 'aceleracao-plano' | 'angulo-critico';

export const geradorNewton: GeradorExercicio<number> = {
  topicoId: 'leis-de-newton',
  formatoResposta: 'um número, 2 casas decimais',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'resultante':
        return exercicioResultante(nivel, rng);
      case 'aceleracao':
        return exercicioAceleracao(nivel, rng);
      case 'normal-plano':
        return exercicioNormalPlano(nivel, rng);
      case 'aceleracao-plano':
        return exercicioAceleracaoPlano(nivel, rng);
      case 'angulo-critico':
        return exercicioAnguloCritico(nivel, rng);
    }
  },

  // O grau é ruído de unidade: a resposta em si é um número.
  analisar: (entrada) => analisarNumero(entrada.replace(/°/g, '')),

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(2)).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['resultante', 'aceleracao']);
    case 'medio':
      return rng.escolher<Pergunta>(['aceleracao', 'normal-plano', 'aceleracao-plano']);
    case 'dificil':
      return rng.escolher<Pergunta>(['aceleracao-plano', 'angulo-critico', 'normal-plano']);
  }
}

function exercicioResultante(nivel: Nivel, rng: Rng): Exercicio<number> {
  const aFavor = rng.inteiro(20, 80);
  const contra = rng.inteiro(5, aFavor - 5);
  const massa = rng.inteiro(2, 20);

  const { resultado, passos } = segundaLeiComPassos(massa, [
    { valor: aFavor, descricao: 'força aplicada' },
    { valor: -contra, descricao: 'atrito' },
  ]);

  return {
    id: `new-res-${aFavor}-${contra}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um bloco recebe uma força de ${aFavor} N para a direita e sofre ${contra} N de atrito. ` +
      'Qual é a força resultante, em newtons?',
    enunciadoTex: `F = ${aFavor}\\,\\text{N} \\qquad f = ${contra}\\,\\text{N} \\qquad m = ${massa}\\,\\text{kg}`,
    gabarito: resultado.resultante,
    resolucao: { resultado: resultado.resultante, passos },
    conceitos: ['newton.leis'],
    armadilhas: semColisoes(
      [
        {
          resposta: aFavor + contra,
          diagnostico:
            'O atrito age CONTRA o movimento, então entra com sinal negativo. Somar as duas ' +
            'daria a resultante de forças no mesmo sentido.',
          passo: 0,
          conceito: 'newton.leis',
        },
        {
          resposta: resultado.aceleracao,
          diagnostico:
            'Esse é o valor da ACELERAÇÃO, em m/s². A pergunta pede a força resultante, em ' +
            'newtons.',
          passo: 2,
          conceito: 'newton.leis',
        },
      ],
      resultado.resultante,
      proximos,
    ),
    dica: nivel === 'facil' ? 'Some as forças com os sinais de cada sentido.' : undefined,
  };
}

function exercicioAceleracao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const forca = rng.inteiro(10, 120);
  const massa = rng.inteiro(2, 25);

  const { resultado, passos } = segundaLeiComPassos(massa, [
    { valor: forca, descricao: 'força resultante' },
  ]);

  return {
    id: `new-acel-${forca}-${massa}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Uma força resultante de ${forca} N age sobre um corpo de ${massa} kg. Qual é a ` +
      'aceleração, em m/s²? (2 casas decimais)',
    enunciadoTex: `F_R = ${forca}\\,\\text{N} \\qquad m = ${massa}\\,\\text{kg}`,
    gabarito: resultado.aceleracao,
    resolucao: { resultado: resultado.aceleracao, passos },
    conceitos: ['newton.leis'],
    armadilhas: semColisoes(
      [
        {
          resposta: forca * massa,
          diagnostico:
            'A relação é F = ma, então a aceleração é F DIVIDIDO por m. Multiplicar daria ' +
            'uma grandeza sem sentido aqui.',
          passo: 2,
          conceito: 'newton.leis',
        },
        {
          resposta: massa / forca,
          diagnostico:
            'A divisão está invertida: a massa vai no denominador. Mais massa, menos ' +
            'aceleração para a mesma força.',
          passo: 2,
          conceito: 'newton.leis',
        },
        {
          resposta: massa * GRAVIDADE_PADRAO,
          diagnostico:
            'Esse é o PESO do corpo, em newtons. A força dada já é a resultante; o peso não ' +
            'entra num movimento horizontal.',
          passo: 0,
          conceito: 'newton.leis',
        },
      ],
      resultado.aceleracao,
      proximos,
    ),
    dica: nivel === 'facil' ? 'a = F / m' : undefined,
  };
}

function exercicioNormalPlano(nivel: Nivel, rng: Rng): Exercicio<number> {
  const massa = rng.inteiro(2, 20);
  const angulo = rng.escolher([0, 15, 30, 37, 45, 53, 60, 75]);

  const { resultado, passos } = planoInclinadoComPassos(massa, angulo, 0);

  return {
    id: `new-normal-${massa}-${angulo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um bloco de ${massa} kg repousa num plano inclinado de ${angulo}°. Qual é a força ` +
      'normal, em newtons? (use g = 9,81 m/s²; 2 casas decimais)',
    enunciadoTex: `m = ${massa}\\,\\text{kg} \\qquad \\theta = ${angulo}^\\circ`,
    gabarito: resultado.normal,
    resolucao: {
      resultado: resultado.normal,
      passos: [
        ...passos,
        {
          descricao: 'A pergunta é pela força normal, a componente perpendicular ao plano.',
          tex: `N = ${resultado.normal.toFixed(2).replace('.', '{,}')}\\,\\text{N}`,
        },
      ],
    },
    conceitos: ['newton.plano'],
    armadilhas: semColisoes(
      [
        {
          resposta: massa * GRAVIDADE_PADRAO,
          diagnostico:
            'A normal só iguala o peso num plano HORIZONTAL. Inclinado, ela é a componente ' +
            'perpendicular: N = mg·cos θ.',
          passo: 2,
          conceito: 'newton.plano',
        },
        {
          resposta: resultado.componentePeso,
          diagnostico:
            'Essa é a componente PARALELA ao plano, que tende a fazer o bloco descer. A ' +
            'normal é a perpendicular, com cosseno.',
          passo: 2,
          conceito: 'newton.plano',
        },
      ],
      resultado.normal,
      proximos,
    ),
  };
}

function exercicioAceleracaoPlano(nivel: Nivel, rng: Rng): Exercicio<number> {
  const massa = rng.inteiro(2, 20);
  const angulo = rng.escolher([30, 37, 45, 53, 60]);
  const mu = rng.escolher([0, 0.1, 0.2, 0.3]);

  const { resultado, passos } = planoInclinadoComPassos(massa, angulo, mu);

  return {
    id: `new-aplano-${massa}-${angulo}-${mu}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um bloco de ${massa} kg desliza num plano de ${angulo}° com coeficiente de atrito ` +
      `${mu.toLocaleString('pt-BR')}. Qual é a aceleração, em m/s²? (2 casas decimais)`,
    enunciadoTex: `m = ${massa} \\qquad \\theta = ${angulo}^\\circ \\qquad \\mu = ${String(mu).replace('.', '{,}')}`,
    gabarito: resultado.aceleracao,
    resolucao: { resultado: resultado.aceleracao, passos },
    conceitos: ['newton.plano', 'newton.atrito'],
    armadilhas: semColisoes(
      [
        {
          resposta: GRAVIDADE_PADRAO,
          diagnostico:
            'A aceleração só seria g na queda livre (plano vertical). No plano inclinado, ' +
            'apenas a componente do peso acelera o bloco.',
          passo: 1,
          conceito: 'newton.plano',
        },
        {
          resposta: GRAVIDADE_PADRAO * Math.sin((angulo * Math.PI) / 180),
          diagnostico:
            mu > 0
              ? 'Você ignorou o atrito, que se opõe ao deslizamento e reduz a aceleração.'
              : 'Confira o cálculo: sem atrito, a aceleração é exatamente g·sen θ.',
          passo: 3,
          conceito: 'newton.atrito',
        },
        {
          resposta: resultado.componentePeso,
          diagnostico:
            'Essa é a FORÇA em newtons, não a aceleração. Falta dividir pela massa.',
          passo: 4,
          conceito: 'newton.leis',
        },
      ],
      resultado.aceleracao,
      proximos,
    ),
  };
}

function exercicioAnguloCritico(nivel: Nivel, rng: Rng): Exercicio<number> {
  const mu = rng.escolher([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.8, 1]);
  const { resultado, passos } = anguloCriticoComPassos(mu);

  return {
    id: `new-crit-${mu}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Com coeficiente de atrito estático ${mu.toLocaleString('pt-BR')}, a partir de que ` +
      'ângulo de inclinação o bloco começa a deslizar? (em graus, 2 casas)',
    enunciadoTex: `\\mu = ${String(mu).replace('.', '{,}')}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['newton.atrito'],
    armadilhas: semColisoes(
      [
        {
          resposta: (Math.asin(mu) * 180) / Math.PI,
          diagnostico:
            'A condição é tan θ = μ, não sen θ = μ. O atrito é proporcional à normal, que ' +
            'traz o cosseno para a conta.',
          passo: 1,
          conceito: 'newton.atrito',
        },
        {
          resposta: mu * 90,
          diagnostico:
            'A relação entre μ e o ângulo não é linear: é a tangente que faz a ponte.',
          passo: 1,
          conceito: 'newton.atrito',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? 'tan θ = μ' : undefined,
  };
}
