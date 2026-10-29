import { movimentoUniformementeVariado, torricelliComPassos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.05;

type Pergunta = 'velocidade' | 'posicao' | 'torricelli' | 'tempo-de-parada' | 'distancia-frenagem';

export const geradorCinematica: GeradorExercicio<number> = {
  topicoId: 'cinematica-escalar',
  formatoResposta: 'um número, 2 casas decimais',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'velocidade':
        return exercicioVelocidade(nivel, rng);
      case 'posicao':
        return exercicioPosicao(nivel, rng);
      case 'torricelli':
        return exercicioTorricelli(nivel, rng);
      case 'tempo-de-parada':
        return exercicioTempoDeParada(nivel, rng);
      case 'distancia-frenagem':
        return exercicioDistanciaFrenagem(nivel, rng);
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
      return rng.escolher<Pergunta>(['velocidade', 'posicao']);
    case 'medio':
      return rng.escolher<Pergunta>(['posicao', 'torricelli', 'tempo-de-parada']);
    case 'dificil':
      return rng.escolher<Pergunta>(['distancia-frenagem', 'torricelli', 'tempo-de-parada']);
  }
}

function exercicioVelocidade(nivel: Nivel, rng: Rng): Exercicio<number> {
  const v0 = rng.inteiro(0, 20);
  const a = rng.inteiro(1, 6);
  const t = rng.inteiro(2, 10);

  const { velocidade } = movimentoUniformementeVariado(0, v0, a, t);

  return {
    id: `cin-vel-${v0}-${a}-${t}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um corpo parte com ${v0} m/s e acelera a ${a} m/s². Qual é sua velocidade após ${t} s?`,
    enunciadoTex: `v_0 = ${v0}\\,\\text{m/s} \\qquad a = ${a}\\,\\text{m/s}^{2} \\qquad t = ${t}\\,\\text{s}`,
    gabarito: velocidade,
    resolucao: {
      resultado: velocidade,
      passos: [
        { descricao: 'A velocidade cresce linearmente com o tempo.', tex: 'v = v_0 + at' },
        {
          descricao: 'Substituindo.',
          tex: `v = ${v0} + ${a} \\cdot ${t} = ${velocidade}\\,\\text{m/s}`,
          nota: 'Aceleração constante significa somar a mesma quantidade a cada segundo.',
        },
      ],
    },
    conceitos: ['cinematica.equacoes'],
    armadilhas: semColisoes(
      [
        {
          resposta: movimentoUniformementeVariado(0, v0, a, t).posicao,
          diagnostico:
            'Essa é a POSIÇÃO (deslocamento), medida em metros. A velocidade é em m/s, e usa ' +
            'a equação linear em t.',
          passo: 0,
          conceito: 'cinematica.equacoes',
        },
        {
          resposta: a * t,
          diagnostico:
            'Faltou somar a velocidade inicial: o corpo já estava em movimento quando começou ' +
            'a acelerar.',
          passo: 1,
          conceito: 'cinematica.equacoes',
        },
      ],
      velocidade,
      proximos,
    ),
    dica: nivel === 'facil' ? 'v = v₀ + at' : undefined,
  };
}

function exercicioPosicao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const v0 = rng.inteiro(0, 15);
  const a = rng.inteiro(1, 6);
  const t = rng.inteiro(2, 8);

  const { posicao, velocidade } = movimentoUniformementeVariado(0, v0, a, t);

  return {
    id: `cin-pos-${v0}-${a}-${t}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um corpo parte do repouso de uma posição com ${v0} m/s e acelera a ${a} m/s². Quanto ` +
      `ele se desloca em ${t} s?`,
    enunciadoTex: `v_0 = ${v0}\\,\\text{m/s} \\qquad a = ${a}\\,\\text{m/s}^{2} \\qquad t = ${t}\\,\\text{s}`,
    gabarito: posicao,
    resolucao: {
      resultado: posicao,
      passos: [
        {
          descricao: 'O deslocamento é a área sob o gráfico da velocidade.',
          tex: '\\Delta s = v_0 t + \\frac{at^{2}}{2}',
        },
        {
          descricao: 'A primeira parcela é o retângulo; a segunda, o triângulo.',
          tex: `\\Delta s = ${v0} \\cdot ${t} + \\frac{${a} \\cdot ${t}^{2}}{2} = ${posicao}\\,\\text{m}`,
        },
      ],
    },
    conceitos: ['cinematica.graficos', 'cinematica.equacoes'],
    armadilhas: semColisoes(
      [
        {
          resposta: v0 * t,
          diagnostico:
            'Você considerou apenas a velocidade inicial, como se o movimento fosse uniforme. ' +
            'Falta a contribuição da aceleração — o triângulo do gráfico.',
          passo: 1,
          conceito: 'cinematica.graficos',
        },
        {
          resposta: velocidade * t,
          diagnostico:
            'Multiplicar pela velocidade FINAL superestima: durante o percurso o corpo estava ' +
            'mais lento. O certo é usar a velocidade média.',
          passo: 0,
          conceito: 'cinematica.graficos',
        },
        {
          resposta: a * t * t,
          diagnostico: 'Faltou dividir por 2 — a área do triângulo é base × altura / 2.',
          passo: 1,
          conceito: 'cinematica.graficos',
        },
      ],
      posicao,
      proximos,
    ),
  };
}

function exercicioTorricelli(nivel: Nivel, rng: Rng): Exercicio<number> {
  const v0 = rng.inteiro(0, 15);
  const a = rng.inteiro(1, 5);
  const deslocamento = rng.inteiro(10, 100);

  const { resultado, passos } = torricelliComPassos(v0, a, deslocamento);

  return {
    id: `cin-torr-${v0}-${a}-${deslocamento}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Partindo de ${v0} m/s com aceleração de ${a} m/s², qual é a velocidade após percorrer ` +
      `${deslocamento} m? (2 casas decimais)`,
    enunciadoTex: `v_0 = ${v0} \\qquad a = ${a} \\qquad \\Delta s = ${deslocamento}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['cinematica.equacoes'],
    armadilhas: semColisoes(
      [
        {
          resposta: v0 + a * deslocamento,
          diagnostico:
            'A equação v = v₀ + at usa TEMPO, não deslocamento. Para relacionar velocidade e ' +
            'distância, use Torricelli.',
          passo: 0,
          conceito: 'cinematica.equacoes',
        },
        {
          resposta: Math.sqrt(v0 * v0 + a * deslocamento),
          diagnostico: 'Faltou o fator 2: v² = v₀² + 2a·Δs.',
          passo: 2,
          conceito: 'cinematica.equacoes',
        },
      ],
      resultado,
      proximos,
    ),
  };
}

function exercicioTempoDeParada(nivel: Nivel, rng: Rng): Exercicio<number> {
  const v0 = rng.inteiro(10, 40);
  const desaceleracao = rng.inteiro(2, 8);
  const resultado = v0 / desaceleracao;

  return {
    id: `cin-parada-${v0}-${desaceleracao}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um veículo a ${v0} m/s freia com desaceleração de ${desaceleracao} m/s². Em quanto ` +
      'tempo ele para? (2 casas decimais)',
    enunciadoTex: `v_0 = ${v0}\\,\\text{m/s} \\qquad a = -${desaceleracao}\\,\\text{m/s}^{2}`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'Parar significa velocidade final nula.',
          tex: '0 = v_0 + at',
        },
        {
          descricao: 'Isolando o tempo, com a aceleração negativa.',
          tex: `t = \\frac{v_0}{|a|} = \\frac{${v0}}{${desaceleracao}} = ${Number(resultado.toFixed(4))}\\,\\text{s}`,
          nota: 'O sinal negativo da desaceleração é o que faz a velocidade diminuir.',
        },
      ],
    },
    conceitos: ['cinematica.equacoes'],
    armadilhas: semColisoes(
      [
        {
          resposta: v0 * desaceleracao,
          diagnostico:
            'A relação é uma divisão: quanto maior a desaceleração, MENOR o tempo de parada.',
          passo: 1,
          conceito: 'cinematica.equacoes',
        },
        {
          resposta: (v0 * v0) / (2 * desaceleracao),
          diagnostico:
            'Essa é a DISTÂNCIA de frenagem, em metros. A pergunta pede um tempo, em segundos.',
          passo: 0,
          conceito: 'cinematica.equacoes',
        },
      ],
      resultado,
      proximos,
    ),
  };
}

function exercicioDistanciaFrenagem(nivel: Nivel, rng: Rng): Exercicio<number> {
  const v0 = rng.inteiro(10, 40);
  const desaceleracao = rng.inteiro(2, 10);
  const resultado = (v0 * v0) / (2 * desaceleracao);

  return {
    id: `cin-fren-${v0}-${desaceleracao}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um veículo a ${v0} m/s freia com desaceleração de ${desaceleracao} m/s². Que distância ` +
      'ele percorre até parar? (2 casas decimais)',
    enunciadoTex: `v_0 = ${v0}\\,\\text{m/s} \\qquad a = -${desaceleracao}\\,\\text{m/s}^{2} \\qquad v = 0`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'Como o tempo não interessa, usamos Torricelli.',
          tex: '0 = v_0^{2} - 2a\\,\\Delta s',
        },
        {
          descricao: 'Isolando o deslocamento.',
          tex: `\\Delta s = \\frac{v_0^{2}}{2a} = \\frac{${v0}^{2}}{2 \\cdot ${desaceleracao}} = ${Number(resultado.toFixed(4))}\\,\\text{m}`,
        },
        {
          descricao: 'A distância cresce com o QUADRADO da velocidade.',
          tex: `2v_0 \\;\\Rightarrow\\; 4\\Delta s`,
          nota:
            'Dobrar a velocidade quadruplica a distância de frenagem — é a razão física dos ' +
            'limites de velocidade.',
        },
      ],
    },
    conceitos: ['cinematica.equacoes'],
    armadilhas: semColisoes(
      [
        {
          resposta: v0 / desaceleracao,
          diagnostico:
            'Esse é o TEMPO de parada, em segundos. A pergunta pede uma distância, em metros.',
          passo: 1,
          conceito: 'cinematica.equacoes',
        },
        {
          resposta: (v0 * v0) / desaceleracao,
          diagnostico: 'Faltou o fator 2 do denominador, que vem de Torricelli.',
          passo: 1,
          conceito: 'cinematica.equacoes',
        },
        {
          resposta: v0 * v0,
          diagnostico:
            'A velocidade ao quadrado sozinha não é distância: é preciso dividir pela ' +
            'desaceleração (e pelo 2).',
          passo: 0,
          conceito: 'cinematica.equacoes',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? 'Δs = v₀² / (2a)' : undefined,
  };
}
