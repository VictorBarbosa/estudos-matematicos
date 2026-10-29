import { centroDeMassaComPassos, equilibrioAlavancaComPassos, torqueComPassos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.02;

type Pergunta = 'torque' | 'alavanca' | 'centro-massa' | 'forca-para-equilibrar' | 'torque-inclinado';

export const geradorTorque: GeradorExercicio<number> = {
  topicoId: 'estatica-e-torque',
  formatoResposta: 'um número, 2 casas decimais',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'torque':
        return exercicioTorque(90, nivel, rng);
      case 'torque-inclinado':
        return exercicioTorque(0, nivel, rng);
      case 'alavanca':
        return exercicioAlavanca(nivel, rng);
      case 'centro-massa':
        return exercicioCentroMassa(nivel, rng);
      case 'forca-para-equilibrar':
        return exercicioForcaEquilibrio(nivel, rng);
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
      return rng.escolher<Pergunta>(['torque', 'alavanca']);
    case 'medio':
      return rng.escolher<Pergunta>(['torque-inclinado', 'centro-massa', 'alavanca']);
    case 'dificil':
      return rng.escolher<Pergunta>(['forca-para-equilibrar', 'torque-inclinado', 'centro-massa']);
  }
}

/** Com `anguloFixo` igual a 90 o torque é máximo; 0 significa sortear o ângulo. */
function exercicioTorque(anguloFixo: number, nivel: Nivel, rng: Rng): Exercicio<number> {
  const forca = rng.inteiro(10, 200);
  const braco = rng.inteiro(1, 20) / 10;
  const angulo = anguloFixo === 90 ? 90 : rng.escolher([0, 30, 37, 45, 53, 60, 90, 180]);

  const { resultado, passos } = torqueComPassos(forca, braco, angulo);

  return {
    id: `tor-t-${forca}-${braco}-${angulo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Uma força de ${forca} N é aplicada a ${braco.toLocaleString('pt-BR')} m do eixo, a ` +
      `${angulo}° do braço. Qual é o torque, em N·m? (2 casas decimais)`,
    enunciadoTex:
      `F = ${forca}\\,\\text{N} \\qquad r = ${String(braco).replace('.', '{,}')}\\,\\text{m} ` +
      `\\qquad \\theta = ${angulo}^\\circ`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['torque.definicao'],
    armadilhas: semColisoes(
      [
        {
          resposta: forca * braco,
          diagnostico:
            angulo === 0 || angulo === 180
              ? 'A força aponta na direção do braço: o torque é ZERO, não F·r.'
              : 'Faltou o seno: só a componente perpendicular ao braço produz giro.',
          passo: 1,
          conceito: 'torque.definicao',
        },
        {
          resposta: forca * braco * Math.cos((angulo * Math.PI) / 180),
          diagnostico:
            'O torque usa SENO. O cosseno aparece no trabalho, que mede deslocamento alinhado, ' +
            'não rotação.',
          passo: 0,
          conceito: 'torque.definicao',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? 'τ = r·F·sen θ' : undefined,
  };
}

function exercicioAlavanca(nivel: Nivel, rng: Rng): Exercicio<number> {
  const forcaA = rng.inteiro(20, 200);
  const distanciaA = rng.inteiro(2, 20) / 10;
  const forcaB = rng.inteiro(10, forcaA);

  const { resultado, passos } = equilibrioAlavancaComPassos(forcaA, distanciaA, forcaB);

  return {
    id: `tor-alav-${forcaA}-${distanciaA}-${forcaB}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Numa alavanca, ${forcaA} N atuam a ${distanciaA.toLocaleString('pt-BR')} m do apoio. ` +
      `A que distância deve atuar uma força de ${forcaB} N do outro lado para equilibrar, em ` +
      'metros? (2 casas decimais)',
    enunciadoTex:
      `F_A = ${forcaA}\\,\\text{N} \\qquad d_A = ${String(distanciaA).replace('.', '{,}')}\\,\\text{m} ` +
      `\\qquad F_B = ${forcaB}\\,\\text{N}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['torque.equilibrio'],
    armadilhas: semColisoes(
      [
        {
          resposta: (forcaB * distanciaA) / forcaA,
          diagnostico:
            'A proporção está invertida: força MENOR exige braço MAIOR, não menor. Iguale os ' +
            'torques e isole a distância.',
          passo: 2,
          conceito: 'torque.equilibrio',
        },
        {
          resposta: distanciaA,
          diagnostico:
            'As distâncias só seriam iguais se as forças também fossem. Com forças ' +
            'diferentes, os braços têm de compensar.',
          passo: 1,
          conceito: 'torque.equilibrio',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? 'F₁d₁ = F₂d₂' : undefined,
  };
}

function exercicioCentroMassa(nivel: Nivel, rng: Rng): Exercicio<number> {
  const corpos = [
    { massa: rng.inteiro(1, 10), posicao: 0 },
    { massa: rng.inteiro(1, 10), posicao: rng.inteiro(2, 10) },
    { massa: rng.inteiro(1, 10), posicao: rng.inteiro(11, 20) },
  ];

  const { resultado, passos } = centroDeMassaComPassos(corpos);

  return {
    id: `tor-cm-${corpos.map((c) => `${c.massa}@${c.posicao}`).join('_')}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      'Três corpos sobre uma barra: ' +
      corpos.map((c) => `${c.massa} kg em x = ${c.posicao} m`).join(', ') +
      '. Onde fica o centro de massa, em metros? (2 casas decimais)',
    enunciadoTex: corpos
      .map((c) => `m = ${c.massa},\\; x = ${c.posicao}`)
      .join(' \\quad '),
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['torque.centro-massa'],
    armadilhas: semColisoes(
      [
        {
          resposta: corpos.reduce((total, c) => total + c.posicao, 0) / corpos.length,
          diagnostico:
            'Essa é a média simples das POSIÇÕES, que ignora as massas. O centro de massa é ' +
            'uma média ponderada: corpos pesados puxam mais.',
          passo: 0,
          conceito: 'torque.centro-massa',
        },
        {
          resposta: corpos.reduce((total, c) => total + c.massa * c.posicao, 0),
          diagnostico:
            'Você somou os produtos massa × posição mas não dividiu pela massa total.',
          passo: 2,
          conceito: 'torque.centro-massa',
        },
      ],
      resultado,
      proximos,
    ),
  };
}

function exercicioForcaEquilibrio(nivel: Nivel, rng: Rng): Exercicio<number> {
  const pesoBarra = rng.inteiro(20, 100);
  const comprimento = rng.inteiro(2, 8);
  const cargaDistancia = rng.inteiro(1, comprimento - 1);
  const carga = rng.inteiro(50, 300);

  // Apoio numa ponta; a força de sustentação vai na outra.
  const torqueCarga = carga * cargaDistancia;
  const torquePeso = (pesoBarra * comprimento) / 2;
  const resultado = (torqueCarga + torquePeso) / comprimento;

  return {
    id: `tor-eq-${pesoBarra}-${carga}-${cargaDistancia}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Uma barra homogênea de ${comprimento} m e ${pesoBarra} N está apoiada numa ponta. Uma ` +
      `carga de ${carga} N está a ${cargaDistancia} m desse apoio. Que força vertical na outra ` +
      'ponta mantém a barra em equilíbrio, em newtons? (2 casas decimais)',
    enunciadoTex:
      `L = ${comprimento}\\,\\text{m} \\qquad P = ${pesoBarra}\\,\\text{N} \\qquad ` +
      `Q = ${carga}\\,\\text{N} \\qquad d = ${cargaDistancia}\\,\\text{m}`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'Somamos os torques em relação ao apoio. A carga produz torque pelo seu braço.',
          tex: `\\tau_Q = ${carga} \\cdot ${cargaDistancia} = ${torqueCarga}\\,\\text{N·m}`,
        },
        {
          descricao: 'O peso da barra atua no centro de massa, no meio dela.',
          tex: `\\tau_P = ${pesoBarra} \\cdot \\frac{${comprimento}}{2} = ${torquePeso}\\,\\text{N·m}`,
          nota: 'Barra homogênea tem centro de massa no meio — é o que permite tratá-la como ponto.',
        },
        {
          descricao: 'A força na outra ponta precisa equilibrar os dois torques.',
          tex: `F \\cdot ${comprimento} = ${torqueCarga} + ${torquePeso}`,
        },
        {
          descricao: 'Isolando a força.',
          tex: `F = ${Number(resultado.toFixed(2))}\\,\\text{N}`,
        },
      ],
    },
    conceitos: ['torque.equilibrio', 'torque.centro-massa'],
    armadilhas: semColisoes(
      [
        {
          resposta: (carga + pesoBarra) / 2,
          diagnostico:
            'Dividir o peso total por dois só valeria se a carga estivesse no meio da barra. ' +
            'Com a carga descentrada, é preciso usar torques.',
          passo: 0,
          conceito: 'torque.equilibrio',
        },
        {
          resposta: torqueCarga / comprimento,
          diagnostico:
            'Você esqueceu o peso da própria barra, que atua no centro dela e também produz ' +
            'torque.',
          passo: 1,
          conceito: 'torque.centro-massa',
        },
        {
          resposta: carga + pesoBarra,
          diagnostico:
            'Essa seria a soma das forças, que a reação no apoio também ajuda a equilibrar. A ' +
            'pergunta é de TORQUE em relação ao apoio.',
          passo: 2,
          conceito: 'torque.equilibrio',
        },
      ],
      resultado,
      proximos,
    ),
  };
}
