import {
  GRAVIDADE_PADRAO,
  conservacaoEnergiaComPassos,
  energiaCinetica,
  energiaPotencialGravitacional,
  potenciaMediaComPassos,
  trabalhoComPassos,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.1;

type Pergunta = 'trabalho' | 'cinetica' | 'velocidade-queda' | 'potencia' | 'altura-maxima';

export const geradorEnergia: GeradorExercicio<number> = {
  topicoId: 'trabalho-e-energia',
  formatoResposta: 'um número, 2 casas decimais',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'trabalho':
        return exercicioTrabalho(nivel, rng);
      case 'cinetica':
        return exercicioCinetica(nivel, rng);
      case 'velocidade-queda':
        return exercicioVelocidadeQueda(nivel, rng);
      case 'potencia':
        return exercicioPotencia(nivel, rng);
      case 'altura-maxima':
        return exercicioAlturaMaxima(nivel, rng);
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
      return rng.escolher<Pergunta>(['trabalho', 'cinetica']);
    case 'medio':
      return rng.escolher<Pergunta>(['velocidade-queda', 'potencia', 'trabalho']);
    case 'dificil':
      return rng.escolher<Pergunta>(['altura-maxima', 'velocidade-queda', 'potencia']);
  }
}

function exercicioTrabalho(nivel: Nivel, rng: Rng): Exercicio<number> {
  const forca = rng.inteiro(10, 100);
  const deslocamento = rng.inteiro(2, 20);
  const angulo = rng.escolher([0, 30, 37, 45, 53, 60, 90, 180]);

  const { resultado, passos } = trabalhoComPassos(forca, deslocamento, angulo);

  return {
    id: `ene-trab-${forca}-${deslocamento}-${angulo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Uma força de ${forca} N age a ${angulo}° do deslocamento, que vale ${deslocamento} m. ` +
      'Qual é o trabalho realizado, em joules?',
    enunciadoTex: `F = ${forca}\\,\\text{N} \\qquad d = ${deslocamento}\\,\\text{m} \\qquad \\theta = ${angulo}^\\circ`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['energia.trabalho'],
    armadilhas: semColisoes(
      [
        {
          resposta: forca * deslocamento,
          diagnostico:
            angulo === 90
              ? 'A força é perpendicular ao deslocamento: o trabalho é exatamente ZERO, não F·d.'
              : 'Faltou o cosseno: só a componente da força alinhada ao deslocamento trabalha.',
          passo: 1,
          conceito: 'energia.trabalho',
        },
        {
          resposta: forca * deslocamento * Math.sin((angulo * Math.PI) / 180),
          diagnostico:
            'O trabalho usa COSSENO. O seno aparece no torque, que mede giro, não ' +
            'deslocamento alinhado.',
          passo: 0,
          conceito: 'energia.trabalho',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? 'W = F·d·cos θ' : undefined,
  };
}

function exercicioCinetica(nivel: Nivel, rng: Rng): Exercicio<number> {
  const massa = rng.inteiro(1, 20);
  const velocidade = rng.inteiro(2, 30);
  const resultado = energiaCinetica(massa, velocidade);

  return {
    id: `ene-cin-${massa}-${velocidade}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um corpo de ${massa} kg move-se a ${velocidade} m/s. Qual é sua energia cinética, em ` +
      'joules?',
    enunciadoTex: `m = ${massa}\\,\\text{kg} \\qquad v = ${velocidade}\\,\\text{m/s}`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'A energia cinética depende do quadrado da velocidade.',
          tex: 'E_c = \\frac{mv^{2}}{2}',
        },
        {
          descricao: 'Substituindo.',
          tex: `E_c = \\frac{${massa} \\cdot ${velocidade}^{2}}{2} = ${resultado}\\,\\text{J}`,
        },
        {
          descricao: 'Dobrar a velocidade quadruplica a energia.',
          tex: `2v \\;\\Rightarrow\\; 4E_c`,
          nota: 'É por isso que colisões a alta velocidade são tão mais destrutivas.',
        },
      ],
    },
    conceitos: ['energia.conservacao'],
    armadilhas: semColisoes(
      [
        {
          resposta: massa * velocidade,
          diagnostico:
            'Esse é o MOMENTO LINEAR, em kg·m/s. A energia cinética usa o quadrado da ' +
            'velocidade e divide por 2.',
          passo: 0,
          conceito: 'energia.conservacao',
        },
        {
          resposta: massa * velocidade * velocidade,
          diagnostico: 'Faltou dividir por 2.',
          passo: 1,
          conceito: 'energia.conservacao',
        },
        {
          resposta: (massa * velocidade) / 2,
          diagnostico:
            'A velocidade entra ao QUADRADO. Essa é metade do momento linear, não energia.',
          passo: 1,
          conceito: 'energia.conservacao',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? 'Ec = mv²/2' : undefined,
  };
}

function exercicioVelocidadeQueda(nivel: Nivel, rng: Rng): Exercicio<number> {
  const massa = rng.inteiro(1, 20);
  const altura = rng.inteiro(5, 80);

  const { resultado, passos } = conservacaoEnergiaComPassos(massa, altura, 0);

  return {
    id: `ene-queda-${massa}-${altura}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um corpo de ${massa} kg cai de ${altura} m, partindo do repouso e sem atrito. Com que ` +
      'velocidade chega ao solo, em m/s? (2 casas decimais)',
    enunciadoTex: `m = ${massa}\\,\\text{kg} \\qquad h = ${altura}\\,\\text{m}`,
    gabarito: resultado.velocidadeFinal,
    resolucao: { resultado: resultado.velocidadeFinal, passos },
    conceitos: ['energia.conservacao'],
    armadilhas: semColisoes(
      [
        {
          resposta: energiaPotencialGravitacional(massa, altura),
          diagnostico:
            'Essa é a ENERGIA potencial, em joules. A pergunta pede velocidade, em m/s: falta ' +
            'igualar à cinética e isolar v.',
          passo: 3,
          conceito: 'energia.conservacao',
        },
        {
          resposta: Math.sqrt(GRAVIDADE_PADRAO * altura),
          diagnostico: 'Faltou o fator 2: v = √(2gh).',
          passo: 3,
          conceito: 'energia.conservacao',
        },
        {
          resposta: Math.sqrt((2 * GRAVIDADE_PADRAO * altura) / massa),
          diagnostico:
            'A massa se CANCELA na conservação de energia. A velocidade de queda é a mesma ' +
            'para qualquer massa.',
          passo: 2,
          conceito: 'energia.conservacao',
        },
      ],
      resultado.velocidadeFinal,
      proximos,
    ),
    dica: nivel === 'facil' ? 'v = √(2gh)' : undefined,
  };
}

function exercicioPotencia(nivel: Nivel, rng: Rng): Exercicio<number> {
  const trabalho = rng.inteiro(100, 5000);
  const tempo = rng.inteiro(2, 30);

  const { resultado, passos } = potenciaMediaComPassos(trabalho, tempo);

  return {
    id: `ene-pot-${trabalho}-${tempo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um motor realiza ${trabalho} J de trabalho em ${tempo} s. Qual é sua potência média, ` +
      'em watts? (2 casas decimais)',
    enunciadoTex: `W = ${trabalho}\\,\\text{J} \\qquad \\Delta t = ${tempo}\\,\\text{s}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['energia.potencia'],
    armadilhas: semColisoes(
      [
        {
          resposta: trabalho * tempo,
          diagnostico:
            'Potência é trabalho DIVIDIDO por tempo. Multiplicar daria uma grandeza sem ' +
            'significado aqui.',
          passo: 1,
          conceito: 'energia.potencia',
        },
        {
          resposta: tempo / trabalho,
          diagnostico: 'A divisão está invertida: o tempo vai no denominador.',
          passo: 1,
          conceito: 'energia.potencia',
        },
      ],
      resultado,
      proximos,
    ),
  };
}

function exercicioAlturaMaxima(nivel: Nivel, rng: Rng): Exercicio<number> {
  const velocidade = rng.inteiro(5, 40);
  const resultado = (velocidade * velocidade) / (2 * GRAVIDADE_PADRAO);

  return {
    id: `ene-altura-${velocidade}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um corpo é lançado verticalmente para cima a ${velocidade} m/s. Que altura máxima ele ` +
      'alcança, em metros? (2 casas decimais)',
    enunciadoTex: `v_0 = ${velocidade}\\,\\text{m/s} \\qquad v_{topo} = 0`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'No ponto mais alto, toda a energia cinética virou potencial.',
          tex: '\\frac{mv_0^{2}}{2} = mgh',
        },
        {
          descricao: 'A massa se cancela.',
          tex: '\\frac{v_0^{2}}{2} = gh',
          nota: 'A altura máxima não depende da massa do corpo.',
        },
        {
          descricao: 'Isolando a altura.',
          tex: `h = \\frac{${velocidade}^{2}}{2 \\cdot ${GRAVIDADE_PADRAO}} = ${Number(resultado.toFixed(4))}\\,\\text{m}`,
          nota: 'Dobrar a velocidade de lançamento quadruplica a altura.',
        },
      ],
    },
    conceitos: ['energia.conservacao'],
    armadilhas: semColisoes(
      [
        {
          resposta: (velocidade * velocidade) / GRAVIDADE_PADRAO,
          diagnostico: 'Faltou o fator 2 do denominador, que vem do mv²/2.',
          passo: 2,
          conceito: 'energia.conservacao',
        },
        {
          resposta: velocidade / GRAVIDADE_PADRAO,
          diagnostico:
            'Esse é o TEMPO de subida, em segundos. A pergunta pede altura, em metros.',
          passo: 0,
          conceito: 'energia.conservacao',
        },
      ],
      resultado,
      proximos,
    ),
  };
}
