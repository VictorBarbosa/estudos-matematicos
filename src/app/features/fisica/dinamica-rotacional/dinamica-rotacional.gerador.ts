import {
  CORPOS_RIGIDOS,
  CorpoRigido,
  energiaDeRotacaoComPassos,
  momentoDeInercia,
  rolamentoComPassos,
  segundaLeiRotacionalComPassos,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import {
  FORMATO_NUMERICO_AMPLO,
  analisarNumero,
  numeroComCasas,
} from '@core/treino/resposta-numerica/resposta-numerica';
import { Armadilha, Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

/**
 * Exercícios de dinâmica rotacional.
 *
 * A tradução da mecânica de translação para o giro é quase literal — massa
 * vira momento de inércia, força vira torque —, e é por isso que o tópico
 * compensa. O que não se traduz é o detalhe decisivo: o momento de inércia
 * depende de ONDE a massa está, e dois corpos de mesma massa e mesmo raio
 * podem resistir ao giro de formas bem diferentes.
 */

const CASAS = 3;
const { saoEquivalentes, formatar } = numeroComCasas(CASAS);

const PEDIDO = 'Responda com 3 casas decimais.';

/** Os corpos com fórmula em massa e raio; a barra usa comprimento, e fica fora. */
const CORPOS_POR_RAIO: readonly CorpoRigido[] = CORPOS_RIGIDOS.filter(
  (corpo) => !corpo.nome.startsWith('barra'),
);

type Tipo = 'inercia' | 'torque' | 'energia' | 'rolamento';

const TIPOS_POR_NIVEL: Readonly<Record<Nivel, readonly Tipo[]>> = {
  facil: ['inercia'],
  medio: ['inercia', 'torque', 'energia'],
  dificil: ['torque', 'energia', 'rolamento'],
};

export const geradorDinamicaRotacional: GeradorExercicio<number> = {
  topicoId: 'dinamica-rotacional',
  formatoResposta: FORMATO_NUMERICO_AMPLO,

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (rng.escolher(TIPOS_POR_NIVEL[nivel])) {
      case 'inercia':
        return daInercia(nivel, rng);
      case 'torque':
        return doTorque(nivel, rng);
      case 'energia':
        return daEnergia(nivel, rng);
      default:
        return doRolamento(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes,
  formatar,
};

/** O momento de inércia: a massa não basta, o lugar dela importa. */
function daInercia(nivel: Nivel, rng: Rng): Exercicio<number> {
  const corpo = rng.escolher(CORPOS_POR_RAIO);
  const massa = rng.inteiro(1, 40) / 2;
  const raio = rng.inteiro(2, 30) / 10;

  const gabarito = momentoDeInercia(corpo, massa, raio);

  return montar({
    chave: `ine-${corpo.nome}-${massa}-${raio}`,
    nivel,
    rng,
    enunciado:
      `Qual é o momento de inércia de ${artigo(corpo)} ${corpo.nome} de ` +
      `${numero(massa)} kg e ${numero(raio)} m de raio, em kg·m²? ${PEDIDO}`,
    enunciadoTex: `I = ${corpo.fatorTex}mr^{2}`,
    gabarito,
    resolucao: ate(segundaLeiRotacionalComPassos(corpo, massa, raio, 1), 1, gabarito),
    conceitos: ['rotacional.inercia', 'rotacional.dicionario'],
    armadilhas: [
      {
        resposta: massa * raio * raio,
        diagnostico:
          `Faltou o fator de forma. Só uma partícula, ou um aro, tem a massa toda à distância r ` +
          'do eixo; nos demais corpos parte dela está mais perto, e o fator desconta isso.',
        passo: 0,
        conceito: 'rotacional.inercia',
      },
      {
        resposta: corpo.fator * massa * raio,
        diagnostico:
          'O raio entra ao QUADRADO. É essa potência que faz afastar a massa do eixo pesar tanto ' +
          'na resistência ao giro.',
        passo: 0,
        conceito: 'rotacional.inercia',
      },
      {
        resposta: massa,
        diagnostico:
          'Massa é a resistência à aceleração em linha reta. Na rotação quem faz esse papel é o ' +
          'momento de inércia, que leva em conta a distribuição da massa.',
        passo: 0,
        conceito: 'rotacional.dicionario',
      },
    ],
    dica: nivel === 'facil' ? 'O fator de forma vai multiplicando a massa e o raio ao quadrado.' : undefined,
  });
}

/** Torque e aceleração angular: a segunda lei de Newton, em versão rotacional. */
function doTorque(nivel: Nivel, rng: Rng): Exercicio<number> {
  const corpo = rng.escolher(CORPOS_POR_RAIO);
  const massa = rng.inteiro(2, 40) / 2;
  const raio = rng.inteiro(2, 25) / 10;
  const torque = rng.inteiro(1, 60) / 2;

  const inercia = momentoDeInercia(corpo, massa, raio);
  const gabarito = torque / inercia;

  return montar({
    chave: `tor-${corpo.nome}-${massa}-${raio}-${torque}`,
    nivel,
    rng,
    enunciado:
      `Um torque de ${numero(torque)} N·m é aplicado a ${artigo(corpo)} ` +
      `${corpo.nome} de ${numero(massa)} kg e ${numero(raio)} m de raio. Qual é a ` +
      `aceleração angular, em rad/s²? ${PEDIDO}`,
    enunciadoTex: `\\tau = I\\alpha \\qquad I = ${corpo.fatorTex}mr^{2}`,
    gabarito,
    resolucao: segundaLeiRotacionalComPassos(corpo, massa, raio, torque),
    conceitos: ['rotacional.torque-alfa', 'rotacional.inercia'],
    armadilhas: [
      {
        resposta: torque / massa,
        diagnostico:
          'Na rotação quem divide o torque é o momento de inércia, não a massa. É o dicionário ' +
          'do tópico: massa vira inércia, força vira torque, aceleração vira aceleração angular.',
        passo: 1,
        conceito: 'rotacional.dicionario',
      },
      {
        resposta: torque * inercia,
        diagnostico:
          'A relação é torque IGUAL a inércia vezes aceleração angular. Para achar a aceleração, ' +
          'divide-se o torque pela inércia.',
        passo: 2,
        conceito: 'rotacional.torque-alfa',
      },
      {
        resposta: torque / (massa * raio * raio),
        diagnostico:
          'O fator de forma do corpo ficou de fora do momento de inércia.',
        passo: 0,
        conceito: 'rotacional.inercia',
      },
    ],
  });
}

/** Energia cinética de rotação. */
function daEnergia(nivel: Nivel, rng: Rng): Exercicio<number> {
  const corpo = rng.escolher(CORPOS_POR_RAIO);
  const massa = rng.inteiro(2, 40) / 2;
  const raio = rng.inteiro(2, 20) / 10;
  const omega = rng.inteiro(2, 40) / 2;

  const inercia = momentoDeInercia(corpo, massa, raio);
  const gabarito = 0.5 * inercia * omega * omega;

  return montar({
    chave: `ene-${corpo.nome}-${massa}-${raio}-${omega}`,
    nivel,
    rng,
    enunciado:
      `${capitalizar(artigo(corpo))} ${corpo.nome} de ${numero(massa)} kg e ` +
      `${numero(raio)} m de raio gira a ${numero(omega)} rad/s. Qual é a ` +
      `energia cinética de rotação, em J? ${PEDIDO}`,
    enunciadoTex: `K_{rot} = \\frac{1}{2}I\\omega^{2}`,
    gabarito,
    resolucao: energiaDeRotacaoComPassos(corpo, massa, raio, omega),
    conceitos: ['rotacional.energia', 'rotacional.inercia'],
    armadilhas: [
      {
        resposta: 0.5 * massa * omega * omega,
        diagnostico:
          'A massa entrou no lugar do momento de inércia. Na energia de rotação quem aparece é a ' +
          'inércia, que já carrega o raio e o fator de forma.',
        passo: 1,
        conceito: 'rotacional.dicionario',
      },
      {
        resposta: inercia * omega * omega,
        diagnostico: 'Faltou o fator um meio, que a fórmula da energia cinética sempre traz.',
        passo: 2,
        conceito: 'rotacional.energia',
      },
      {
        resposta: 0.5 * inercia * omega,
        diagnostico:
          'A velocidade angular entra ao QUADRADO, exatamente como a velocidade na energia de ' +
          'translação.',
        passo: 2,
        conceito: 'rotacional.energia',
      },
    ],
  });
}

/** Rolamento sem deslizar: quem chega antes na rampa. */
function doRolamento(nivel: Nivel, rng: Rng): Exercicio<number> {
  const corpo = rng.escolher(
    CORPOS_POR_RAIO.filter((candidato) => candidato.nome !== 'partícula'),
  );
  const altura = rng.inteiro(2, 60) / 10;

  const gabarito = Math.sqrt((2 * 9.81 * altura) / (1 + corpo.fator));

  return montar({
    chave: `rol-${corpo.nome}-${altura}`,
    nivel,
    rng,
    enunciado:
      `${capitalizar(artigo(corpo))} ${corpo.nome} rola sem deslizar a partir do repouso, ` +
      `descendo ${numero(altura)} m de desnível. Com gravidade de 9,81 m/s ` +
      `ao quadrado, qual é a velocidade do centro de massa no fim, em m/s? ${PEDIDO}`,
    enunciadoTex: `mgh = \\frac{1}{2}mv^{2} + \\frac{1}{2}I\\omega^{2} \\qquad \\omega = \\frac{v}{r}`,
    gabarito,
    resolucao: rolamentoComPassos(corpo, altura),
    conceitos: ['rotacional.rolamento', 'rotacional.energia'],
    armadilhas: [
      {
        resposta: Math.sqrt(2 * 9.81 * altura),
        diagnostico:
          'Essa é a velocidade de um corpo que apenas desliza, sem girar. Quem rola precisa ' +
          'gastar parte da energia para girar, e por isso chega mais devagar.',
        passo: 0,
        conceito: 'rotacional.rolamento',
      },
      {
        resposta: Math.sqrt((2 * 9.81 * altura * corpo.fator) / (1 + corpo.fator)),
        diagnostico:
          'O fator de forma está no lugar errado. Ele entra somando 1 no denominador: o 1 é a ' +
          'translação, e o fator é a rotação.',
        passo: 2,
        conceito: 'rotacional.rolamento',
      },
      {
        resposta: (2 * 9.81 * altura) / (1 + corpo.fator),
        diagnostico: 'Faltou extrair a raiz quadrada: isso tem unidade de velocidade ao quadrado.',
        passo: 3,
        conceito: 'rotacional.energia',
      },
    ],
    dica: 'A massa e o raio se cancelam: só o formato decide quem chega antes.',
  });
}

/** O recorte da resolução, quando o exercício para antes do fim da cadeia. */
function ate(
  base: Exercicio<number>['resolucao'],
  passos: number,
  gabarito: number,
): Exercicio<number>['resolucao'] {
  return { resultado: gabarito, passos: base.passos.slice(0, passos) };
}

function artigo(corpo: CorpoRigido): string {
  return corpo.nome.startsWith('casca') || corpo.nome.startsWith('esfera') ? 'uma' : 'um';
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function numero(valor: number): string {
  return valor.toLocaleString('pt-BR', { maximumFractionDigits: 4 });
}

interface Pedido {
  readonly chave: string;
  readonly nivel: Nivel;
  readonly rng: Rng;
  readonly enunciado: string;
  readonly enunciadoTex: string;
  readonly gabarito: number;
  readonly resolucao: Exercicio<number>['resolucao'];
  readonly conceitos: readonly string[];
  readonly armadilhas: readonly Armadilha<number>[];
  readonly dica?: string;
}

function montar(pedido: Pedido): Exercicio<number> {
  return {
    id: `${pedido.chave}-${pedido.rng.inteiro(0, 9999)}`,
    nivel: pedido.nivel,
    enunciado: pedido.enunciado,
    enunciadoTex: pedido.enunciadoTex,
    gabarito: pedido.gabarito,
    resolucao: pedido.resolucao,
    conceitos: pedido.conceitos,
    armadilhas: semColisoes(
      pedido.armadilhas.filter((armadilha) => Number.isFinite(armadilha.resposta)),
      pedido.gabarito,
      saoEquivalentes,
    ),
    dica: pedido.dica,
  };
}
