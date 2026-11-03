import {
  acumuladaPadrao,
  escoreZ,
  escoreZComPassos,
  probabilidadeAbaixoComPassos,
  probabilidadeEntreComPassos,
  quantilPadrao,
  regraEmpiricaComPassos,
  valorDoQuantilComPassos,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import {
  FORMATO_NUMERICO_AMPLO,
  analisarNumero,
  numeroComCasas,
} from '@core/treino/resposta-numerica/resposta-numerica';
import { Armadilha, Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

/**
 * Exercícios de distribuição normal.
 *
 * Todo o tópico gira em torno de um movimento só: padronizar. Convertido o
 * valor em desvios a partir da média, uma tabela única resolve qualquer
 * normal. As armadilhas atacam os três enganos clássicos — esquecer de
 * padronizar, trocar o lado da área e confundir o escore com a probabilidade.
 */

const CASAS = 4;
const { saoEquivalentes, formatar } = numeroComCasas(CASAS);

const PEDIDO = 'Responda com 4 casas decimais.';

/** Contextos de engenharia, para que os números signifiquem alguma coisa. */
const CENARIOS: readonly {
  readonly sujeito: string;
  readonly grandeza: string;
  readonly unidade: string;
}[] = [
  { sujeito: 'Uma peça usinada', grandeza: 'o diâmetro', unidade: 'mm' },
  { sujeito: 'Um lote de parafusos', grandeza: 'a resistência à tração', unidade: 'MPa' },
  { sujeito: 'Um sensor', grandeza: 'a leitura', unidade: 'mV' },
  { sujeito: 'Um motor de série', grandeza: 'o empuxo medido', unidade: 'kN' },
  { sujeito: 'Uma bateria', grandeza: 'a capacidade', unidade: 'Ah' },
];

type Tipo = 'escore' | 'abaixo' | 'acima' | 'entre' | 'quantil' | 'empirica';

const TIPOS_POR_NIVEL: Readonly<Record<Nivel, readonly Tipo[]>> = {
  facil: ['escore', 'empirica'],
  medio: ['escore', 'abaixo', 'acima', 'empirica'],
  dificil: ['entre', 'quantil', 'acima'],
};

export const geradorDistribuicaoNormal: GeradorExercicio<number> = {
  topicoId: 'distribuicao-normal',
  formatoResposta: FORMATO_NUMERICO_AMPLO,

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (rng.escolher(TIPOS_POR_NIVEL[nivel])) {
      case 'escore':
        return doEscore(nivel, rng);
      case 'abaixo':
        return daAreaAbaixo(nivel, rng);
      case 'acima':
        return daAreaAcima(nivel, rng);
      case 'entre':
        return daAreaEntre(nivel, rng);
      case 'quantil':
        return doQuantil(nivel, rng);
      default:
        return daRegraEmpirica(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes,
  formatar,
};

/** O escore z: o movimento central do tópico. */
function doEscore(nivel: Nivel, rng: Rng): Exercicio<number> {
  const cenario = rng.escolher(CENARIOS);
  const media = rng.inteiro(10, 200);
  const desvio = rng.inteiro(1, 20);
  const valor = media + rng.inteiro(-30, 30);

  const gabarito = escoreZ(valor, media, desvio);

  return montar({
    chave: `z-${media}-${desvio}-${valor}`,
    nivel,
    rng,
    enunciado:
      `${cenario.sujeito} tem ${cenario.grandeza} com média ${media} ${cenario.unidade} e desvio ` +
      `padrão ${desvio} ${cenario.unidade}. Qual é o escore z de uma leitura de ${valor} ` +
      `${cenario.unidade}? ${PEDIDO}`,
    enunciadoTex: `z = \\frac{x - \\mu}{\\sigma}`,
    gabarito,
    resolucao: escoreZComPassos(valor, media, desvio),
    conceitos: ['normal.padronizacao', 'normal.curva'],
    armadilhas: [
      {
        resposta: valor - media,
        diagnostico:
          'Faltou dividir pelo desvio padrão. Sem isso o resultado fica na unidade original, e ' +
          'o z existe justamente para medir em desvios, sem unidade.',
        passo: 1,
        conceito: 'normal.padronizacao',
      },
      {
        resposta: (media - valor) / desvio,
        diagnostico:
          'A subtração está invertida: é o valor MENOS a média. Trocar a ordem inverte o sinal ' +
          'e coloca o ponto do outro lado da curva.',
        passo: 1,
        conceito: 'normal.padronizacao',
      },
      {
        resposta: valor / desvio,
        diagnostico:
          'A média não foi descontada. O z mede a distância ATÉ A MÉDIA, não até a origem.',
        passo: 1,
        conceito: 'normal.padronizacao',
      },
    ],
    dica: nivel === 'facil' ? 'Subtraia a média e divida pelo desvio padrão.' : undefined,
  });
}

/** A proporção abaixo de um valor. */
function daAreaAbaixo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const cenario = rng.escolher(CENARIOS);
  const media = rng.inteiro(20, 200);
  const desvio = rng.inteiro(2, 20);
  const valor = media + rng.inteiro(-25, 25);

  const z = escoreZ(valor, media, desvio);
  const gabarito = acumuladaPadrao(z);

  return montar({
    chave: `ab-${media}-${desvio}-${valor}`,
    nivel,
    rng,
    enunciado:
      `${cenario.sujeito} tem ${cenario.grandeza} normal, com média ${media} ${cenario.unidade} ` +
      `e desvio ${desvio} ${cenario.unidade}. Que proporção fica ABAIXO de ${valor} ` +
      `${cenario.unidade}? Responda entre 0 e 1, com 4 casas decimais.`,
    enunciadoTex: `P(X < ${valor})`,
    gabarito,
    resolucao: probabilidadeAbaixoComPassos(valor, media, desvio),
    conceitos: ['normal.area', 'normal.padronizacao'],
    armadilhas: [
      {
        resposta: 1 - gabarito,
        diagnostico:
          'Essa é a proporção ACIMA do valor. A tabela dá a área à esquerda; para a direita, ' +
          'subtrai-se de 1.',
        passo: 1,
        conceito: 'normal.area',
      },
      {
        resposta: z,
        diagnostico:
          'Esse é o escore z, não a probabilidade. O z é um passo intermediário: ele entra na ' +
          'tabela, e o que sai dela é a área.',
        passo: 0,
        conceito: 'normal.area',
      },
      {
        resposta: gabarito * 100,
        diagnostico:
          'O resultado está em porcentagem. O enunciado pede a proporção, entre 0 e 1.',
        passo: 2,
        conceito: 'normal.area',
      },
    ],
  });
}

/** A proporção acima — o complemento, que é onde o lado se troca. */
function daAreaAcima(nivel: Nivel, rng: Rng): Exercicio<number> {
  const cenario = rng.escolher(CENARIOS);
  const media = rng.inteiro(20, 200);
  const desvio = rng.inteiro(2, 20);
  const valor = media + rng.inteiro(-25, 25);

  const z = escoreZ(valor, media, desvio);
  const gabarito = 1 - acumuladaPadrao(z);

  return montar({
    chave: `ac-${media}-${desvio}-${valor}`,
    nivel,
    rng,
    enunciado:
      `${cenario.sujeito} tem ${cenario.grandeza} normal, com média ${media} ${cenario.unidade} ` +
      `e desvio ${desvio} ${cenario.unidade}. Que proporção fica ACIMA de ${valor} ` +
      `${cenario.unidade}? Responda entre 0 e 1, com 4 casas decimais.`,
    enunciadoTex: `P(X > ${valor}) = 1 - \\Phi(z)`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        ...probabilidadeAbaixoComPassos(valor, media, desvio).passos.slice(0, 2),
        {
          descricao: 'A área à direita é o que sobra de 1.',
          tex: `P(X > ${valor}) = 1 - ${texNumero(acumuladaPadrao(z))} = ${texNumero(gabarito)}`,
          nota: 'A área total sob a curva vale 1, e a tabela só dá o lado esquerdo.',
        },
      ],
    },
    conceitos: ['normal.area', 'normal.simetria'],
    armadilhas: [
      {
        resposta: acumuladaPadrao(z),
        diagnostico:
          'Essa é a área à ESQUERDA, que é o que a tabela entrega direto. Para o lado direito é ' +
          'preciso subtrair de 1.',
        passo: 2,
        conceito: 'normal.area',
      },
      {
        resposta: acumuladaPadrao(-z),
        diagnostico:
          'Trocar o sinal do z só funciona por simetria quando a área é medida do mesmo lado. ' +
          'Aqui o caminho direto é subtrair de 1.',
        passo: 2,
        conceito: 'normal.simetria',
      },
    ],
  });
}

/** A proporção entre dois valores. */
function daAreaEntre(nivel: Nivel, rng: Rng): Exercicio<number> {
  const cenario = rng.escolher(CENARIOS);
  const media = rng.inteiro(20, 200);
  const desvio = rng.inteiro(2, 20);
  const de = media - rng.inteiro(1, 25);
  const ate = media + rng.inteiro(1, 25);

  const gabarito = acumuladaPadrao(escoreZ(ate, media, desvio)) -
    acumuladaPadrao(escoreZ(de, media, desvio));

  return montar({
    chave: `en-${media}-${desvio}-${de}-${ate}`,
    nivel,
    rng,
    enunciado:
      `${cenario.sujeito} tem ${cenario.grandeza} normal, com média ${media} ${cenario.unidade} ` +
      `e desvio ${desvio} ${cenario.unidade}. Que proporção fica entre ${de} e ${ate} ` +
      `${cenario.unidade}? Responda entre 0 e 1, com 4 casas decimais.`,
    enunciadoTex: `P(${de} < X < ${ate})`,
    gabarito,
    resolucao: probabilidadeEntreComPassos(de, ate, media, desvio),
    conceitos: ['normal.area', 'normal.padronizacao'],
    armadilhas: [
      {
        resposta: 1 - gabarito,
        diagnostico:
          'Essa é a proporção FORA do intervalo, somando as duas caudas. O enunciado pede o que ' +
          'está dentro.',
        passo: 2,
        conceito: 'normal.area',
      },
      {
        resposta: acumuladaPadrao(escoreZ(ate, media, desvio)),
        diagnostico:
          'Essa é a área até o limite superior, que inclui tudo abaixo do inferior também. ' +
          'Falta descontar essa parte.',
        passo: 1,
        conceito: 'normal.area',
      },
      {
        resposta:
          acumuladaPadrao(escoreZ(de, media, desvio)) +
          acumuladaPadrao(escoreZ(ate, media, desvio)),
        diagnostico:
          'As áreas foram somadas. Para recortar um pedaço de outro, subtrai-se — somar conta ' +
          'a parte de baixo duas vezes.',
        passo: 1,
        conceito: 'normal.area',
      },
    ],
  });
}

/** O valor que deixa uma proporção abaixo — a leitura inversa da tabela. */
function doQuantil(nivel: Nivel, rng: Rng): Exercicio<number> {
  const cenario = rng.escolher(CENARIOS);
  const media = rng.inteiro(20, 200);
  const desvio = rng.inteiro(2, 20);
  const percentil = rng.escolher([1, 5, 10, 25, 50, 75, 90, 95, 99]);
  const probabilidade = percentil / 100;

  const z = quantilPadrao(probabilidade);
  const gabarito = media + z * desvio;

  return montar({
    chave: `qt-${media}-${desvio}-${percentil}`,
    nivel,
    rng,
    enunciado:
      `${cenario.sujeito} tem ${cenario.grandeza} normal, com média ${media} ${cenario.unidade} ` +
      `e desvio ${desvio} ${cenario.unidade}. Que valor deixa ${percentil}% das peças abaixo ` +
      `dele, em ${cenario.unidade}? ${PEDIDO}`,
    enunciadoTex: `x = \\mu + z\\sigma`,
    gabarito,
    resolucao: valorDoQuantilComPassos(probabilidade, media, desvio),
    conceitos: ['normal.quantil', 'normal.padronizacao'],
    armadilhas: [
      {
        resposta: z,
        diagnostico:
          'Esse é o escore z correspondente ao percentil. Falta desfazer a padronização, ' +
          'multiplicando pelo desvio e somando a média.',
        passo: 1,
        conceito: 'normal.quantil',
      },
      {
        resposta: media - z * desvio,
        diagnostico:
          'O sinal ficou invertido. Para desfazer a padronização, soma-se z vezes o desvio — o ' +
          'próprio z já traz o sinal certo.',
        passo: 2,
        conceito: 'normal.quantil',
      },
      {
        resposta: media + probabilidade * desvio,
        diagnostico:
          'A probabilidade entrou no lugar do escore. É preciso passar pela tabela primeiro: ' +
          'da área para o z, e só então para o valor.',
        passo: 0,
        conceito: 'normal.quantil',
      },
    ],
    dica: 'Vá da área para o z e só então desfaça a padronização.',
  });
}

/** A regra empírica: 68, 95 e 99,7. */
function daRegraEmpirica(nivel: Nivel, rng: Rng): Exercicio<number> {
  const cenario = rng.escolher(CENARIOS);
  const media = rng.inteiro(20, 200);
  const desvio = rng.inteiro(2, 20);
  const desvios = rng.escolher([1, 2, 3]);

  const gabarito = acumuladaPadrao(desvios) - acumuladaPadrao(-desvios);

  return montar({
    chave: `re-${media}-${desvio}-${desvios}`,
    nivel,
    rng,
    enunciado:
      `${cenario.sujeito} tem ${cenario.grandeza} normal, com média ${media} ${cenario.unidade} ` +
      `e desvio ${desvio} ${cenario.unidade}. Que proporção fica a até ${desvios} desvio(s) ` +
      `padrão da média? Responda entre 0 e 1, com 4 casas decimais.`,
    enunciadoTex: `P\\left(\\mu - ${desvios}\\sigma < X < \\mu + ${desvios}\\sigma\\right)`,
    gabarito,
    resolucao: regraEmpiricaComPassos(desvios, media, desvio),
    conceitos: ['normal.regra-empirica', 'normal.simetria'],
    armadilhas: [
      {
        resposta: acumuladaPadrao(desvios),
        diagnostico:
          'Essa é a área ATÉ o limite superior, que inclui toda a cauda esquerda. O intervalo ' +
          'pedido é simétrico em torno da média.',
        passo: 2,
        conceito: 'normal.regra-empirica',
      },
      {
        resposta: 1 - gabarito,
        diagnostico:
          'Essa é a proporção fora do intervalo, somando as duas caudas. O enunciado pede o que ' +
          'está dentro.',
        passo: 2,
        conceito: 'normal.regra-empirica',
      },
      {
        resposta: desvios,
        diagnostico:
          'Esse é o número de desvios, não a proporção. A proporção é a área sob a curva nesse ' +
          'intervalo, e ela está sempre entre 0 e 1.',
        passo: 0,
        conceito: 'normal.curva',
      },
    ],
  });
}

function texNumero(valor: number): string {
  return String(Number(valor.toFixed(4))).replace('.', '{,}');
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
