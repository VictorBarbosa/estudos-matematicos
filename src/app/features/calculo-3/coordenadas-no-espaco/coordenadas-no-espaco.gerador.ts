import { cilindricasComPassos, esfericasComPassos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import {
  FORMATO_NUMERICO_AMPLO,
  analisarNumero,
  numeroComCasas,
} from '@core/treino/resposta-numerica/resposta-numerica';
import { Armadilha, Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

/**
 * Exercícios de coordenadas cilíndricas e esféricas.
 *
 * O ponto do tópico é escolher o sistema que faz a simetria do problema
 * desaparecer da conta: um tanque cilíndrico em cilíndricas vira um retângulo,
 * uma casca esférica em esféricas vira um intervalo. A armadilha recorrente é
 * a convenção do ângulo — em esféricas, o polar se mede do eixo z, não do
 * plano.
 */

const CASAS = 3;
const { saoEquivalentes, formatar } = numeroComCasas(CASAS);

const PEDIDO = 'Responda com 3 casas decimais.';

const ANGULOS = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];

type Tipo = 'cilindrica-x' | 'cilindrica-r' | 'esferica-z' | 'esferica-x' | 'esferica-raio';

const TIPOS_POR_NIVEL: Readonly<Record<Nivel, readonly Tipo[]>> = {
  facil: ['cilindrica-x', 'cilindrica-r'],
  medio: ['cilindrica-x', 'cilindrica-r', 'esferica-z'],
  dificil: ['esferica-z', 'esferica-x', 'esferica-raio'],
};

export const geradorCoordenadasNoEspaco: GeradorExercicio<number> = {
  topicoId: 'coordenadas-no-espaco',
  formatoResposta: FORMATO_NUMERICO_AMPLO,

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (rng.escolher(TIPOS_POR_NIVEL[nivel])) {
      case 'cilindrica-x':
        return daCilindrica(nivel, rng, true);
      case 'cilindrica-r':
        return daCilindrica(nivel, rng, false);
      case 'esferica-z':
        return daEsferica(nivel, rng, 'z');
      case 'esferica-x':
        return daEsferica(nivel, rng, 'x');
      default:
        return doRaioEsferico(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes,
  formatar,
};

/** De cilíndricas para cartesianas, ou a distância ao eixo. */
function daCilindrica(nivel: Nivel, rng: Rng, pedirX: boolean): Exercicio<number> {
  const r = rng.inteiro(1, 12);
  const theta = rng.escolher(ANGULOS);
  const z = rng.inteiro(-8, 8);

  const radianos = (theta * Math.PI) / 180;
  const x = r * Math.cos(radianos);
  const y = r * Math.sin(radianos);
  const gabarito = pedirX ? x : y;

  return montar({
    chave: `cil-${r}-${theta}-${z}-${pedirX}`,
    nivel,
    rng,
    enunciado:
      `Um ponto tem coordenadas cilíndricas r = ${r}, θ = ${theta}° e z = ${z}. Qual é a ` +
      `coordenada cartesiana ${pedirX ? 'x' : 'y'}? ${PEDIDO}`,
    enunciadoTex: `x = r\\cos\\theta \\qquad y = r\\operatorname{sen}\\theta \\qquad z = z`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: cilindricasComPassos(r, theta, z).passos,
    },
    conceitos: ['coordenadas.cilindricas', 'coordenadas.escolher-o-sistema'],
    armadilhas: [
      {
        resposta: pedirX ? y : x,
        diagnostico:
          'Seno e cosseno ficaram trocados. Em x vai o cosseno, em y vai o seno — é a mesma ' +
          'convenção das coordenadas polares no plano.',
        passo: 1,
        conceito: 'coordenadas.cilindricas',
      },
      {
        resposta: r,
        diagnostico:
          'Esse é o raio, que é a distância ao EIXO z. A coordenada cartesiana é a projeção ' +
          'dele num dos eixos do plano.',
        passo: 1,
        conceito: 'coordenadas.cilindricas',
      },
      {
        resposta: z,
        diagnostico:
          'O z é o único que não muda na conversão — mas a pergunta é por outra coordenada.',
        passo: 2,
        conceito: 'coordenadas.cilindricas',
      },
    ],
    dica: nivel === 'facil' ? 'Cilíndricas são polares no plano, com o z intocado.' : undefined,
  });
}

/** De esféricas para cartesianas: a convenção do ângulo polar. */
function daEsferica(nivel: Nivel, rng: Rng, pedir: 'x' | 'z'): Exercicio<number> {
  const rho = rng.inteiro(1, 12);
  const phi = rng.escolher([0, 30, 45, 60, 90, 120, 135, 150, 180]);
  const theta = rng.escolher(ANGULOS);

  const radianosPhi = (phi * Math.PI) / 180;
  const radianosTheta = (theta * Math.PI) / 180;

  const x = rho * Math.sin(radianosPhi) * Math.cos(radianosTheta);
  const z = rho * Math.cos(radianosPhi);
  const gabarito = pedir === 'x' ? x : z;

  return montar({
    chave: `esf-${rho}-${phi}-${theta}-${pedir}`,
    nivel,
    rng,
    enunciado:
      `Um ponto tem coordenadas esféricas ρ = ${rho}, φ = ${phi}° (medido do eixo z) e ` +
      `θ = ${theta}°. Qual é a coordenada cartesiana ${pedir}? ${PEDIDO}`,
    enunciadoTex:
      'x = \\rho\\operatorname{sen}\\varphi\\cos\\theta \\qquad ' +
      'z = \\rho\\cos\\varphi',
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: esfericasComPassos(rho, phi, theta).passos,
    },
    conceitos: ['coordenadas.esfericas', 'coordenadas.cilindricas'],
    armadilhas: [
      {
        resposta: pedir === 'z' ? rho * Math.sin(radianosPhi) : rho * Math.cos(radianosPhi),
        diagnostico:
          'Seno e cosseno do ângulo polar ficaram trocados. Como φ é medido a partir do eixo z, ' +
          'é o COSSENO dele que dá a altura.',
        passo: 0,
        conceito: 'coordenadas.esfericas',
      },
      {
        resposta: rho,
        diagnostico:
          'Esse é o raio até a origem. As coordenadas cartesianas são as projeções dele nos ' +
          'três eixos.',
        passo: 1,
        conceito: 'coordenadas.esfericas',
      },
      {
        resposta:
          pedir === 'x' ? rho * Math.cos(radianosPhi) * Math.cos(radianosTheta) : rho,
        diagnostico:
          'A projeção no plano usa o SENO do ângulo polar: quanto mais perto do eixo z, menor ' +
          'o raio do círculo de latitude.',
        passo: 1,
        conceito: 'coordenadas.esfericas',
      },
    ],
  });
}

/** Da cartesiana de volta ao raio esférico. */
function doRaioEsferico(nivel: Nivel, rng: Rng): Exercicio<number> {
  const x = rng.inteiro(-9, 9);
  const y = rng.inteiro(-9, 9);
  const z = rng.inteiro(-9, 9);

  const gabarito = Math.hypot(x, y, z);

  return montar({
    chave: `raio-${x}-${y}-${z}`,
    nivel,
    rng,
    enunciado:
      `Um ponto tem coordenadas cartesianas (${x}, ${y}, ${z}). Qual é o raio ρ dele em ` +
      `coordenadas esféricas? ${PEDIDO}`,
    enunciadoTex: `\\rho = \\sqrt{x^{2} + y^{2} + z^{2}}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'O raio esférico é a distância até a origem.',
          tex: '\\rho = \\sqrt{x^{2} + y^{2} + z^{2}}',
          nota: 'É Pitágoras duas vezes, como no módulo de um vetor no espaço.',
        },
        {
          descricao: 'Somando os três quadrados.',
          tex: `${x}^{2} + ${y}^{2} + ${z}^{2} = ${x * x + y * y + z * z}`,
        },
        {
          descricao: 'E extraindo a raiz.',
          tex: `\\rho = ${texNumero(gabarito)}`,
          nota: 'Em cilíndricas, o r seria só a distância ao eixo, sem o z na conta.',
        },
      ],
    },
    conceitos: ['coordenadas.esfericas', 'coordenadas.escolher-o-sistema'],
    armadilhas: [
      {
        resposta: Math.hypot(x, y),
        diagnostico:
          'Esse é o r das coordenadas CILÍNDRICAS, que mede a distância ao eixo z. O raio ' +
          'esférico inclui também a altura.',
        passo: 1,
        conceito: 'coordenadas.cilindricas',
      },
      {
        resposta: x * x + y * y + z * z,
        diagnostico: 'Faltou extrair a raiz quadrada.',
        passo: 2,
        conceito: 'coordenadas.esfericas',
      },
      {
        resposta: Math.abs(x) + Math.abs(y) + Math.abs(z),
        diagnostico:
          'As coordenadas foram somadas em módulo. A distância sai por Pitágoras, não por soma ' +
          'direta.',
        passo: 1,
        conceito: 'coordenadas.esfericas',
      },
    ],
  });
}

function texNumero(valor: number): string {
  return String(Number(valor.toFixed(6))).replace('.', '{,}');
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
