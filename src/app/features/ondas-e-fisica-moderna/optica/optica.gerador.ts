import {
  anguloLimiteComPassos,
  fendaDuplaComPassos,
  lenteDelgadaComPassos,
  numeroOnda,
  snellComPassos,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const { saoEquivalentes: proximos, formatar } = numeroComCasas(2, 1e-3);
const t = (v: number): string => formatar(v);
const tex = (v: number): string => numeroOnda(v);
const casas = (v: number): string =>
  Number.isInteger(Number(v.toFixed(6))) ? '' : ' (2 casas decimais)';
const rad = (g: number): number => (g * Math.PI) / 180;

type Pergunta =
  'indice' | 'snell' | 'critico' | 'lente' | 'aumento' | 'fenda' | 'fenda-lambda' | 'lente-duas';

/** Meios comuns e seus índices de refração. */
const MEIOS: readonly (readonly [nome: string, indice: number])[] = [
  ['água', 1.33],
  ['vidro comum', 1.5],
  ['acrílico', 1.49],
  ['vidro denso', 1.6],
  ['diamante', 2.42],
];

/**
 * Óptica: refração, lentes e interferência.
 *
 * A luz como raio (Snell, ângulo crítico, lentes de Gauss) e como onda (a
 * fenda dupla de Young). As armadilhas são as clássicas: medir o ângulo a
 * partir da superfície em vez da normal, trocar p e p′, esquecer o sinal da
 * lente divergente e não converter nm e mm para metros.
 */
export const geradorOptica: GeradorExercicio<number> = {
  topicoId: 'optica',
  formatoResposta: 'um número, ex.: 22,08 ou -15',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'indice':
        return indice(nivel, rng);
      case 'snell':
        return snell(nivel, rng);
      case 'critico':
        return critico(nivel, rng);
      case 'lente':
        return lente(nivel, rng);
      case 'aumento':
        return aumento(nivel, rng);
      case 'fenda':
        return fenda(nivel, rng);
      case 'fenda-lambda':
        return fendaLambda(nivel, rng);
      case 'lente-duas':
        return lenteDuas(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes: proximos,
  formatar,
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['indice', 'snell']);
    case 'medio':
      return rng.escolher<Pergunta>(['snell', 'critico', 'lente']);
    case 'dificil':
      return rng.escolher<Pergunta>(['lente', 'aumento', 'fenda', 'critico']);
    // Achar λ de uma medida de franjas e encadear duas lentes: as duas usam a
    // fórmula de trás para a frente ou duas vezes, não só uma substituição.
    case 'extremo':
      return rng.escolher<Pergunta>(['fenda-lambda', 'lente-duas', 'aumento']);
  }
}

/** n = c/v. */
function indice(nivel: Nivel, rng: Rng): Exercicio<number> {
  const v = rng.inteiro(124, 230) / 100;
  const gabarito = 3 / v;
  return {
    id: `optica-indice-${v}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `A luz atravessa um material a ${t(v)} × 10⁸ m/s. Qual é o índice de refração dele?${casas(gabarito)}`,
    enunciadoTex: `c = 3 \\times 10^{8}\\ \\text{m/s} \\qquad v = ${tex(v)} \\times 10^{8}\\ \\text{m/s}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao:
            'O índice de refração é quantas vezes a luz anda mais devagar no meio que no vácuo.',
          tex: 'n = \\frac{c}{v}',
        },
        {
          descricao: 'As potências de 10 se cancelam.',
          tex: `n = \\frac{3 \\times 10^{8}}{${tex(v)} \\times 10^{8}} = ${tex(gabarito)}`,
        },
      ],
    },
    conceitos: ['optica.refracao'],
    armadilhas: semColisoes(
      [
        {
          resposta: v / 3,
          diagnostico: 'A razão está invertida: n = c/v, e por isso n é sempre maior que 1.',
          passo: 0,
          conceito: 'optica.refracao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `n = c/v: divida 3 por ${t(v)} (os 10⁸ se cancelam).`,
  };
}

/** Snell saindo do ar para um meio (sem reflexão total). */
function snell(nivel: Nivel, rng: Rng): Exercicio<number> {
  const [nome, n2] = rng.escolher(MEIOS);
  const theta1 = rng.escolher(nivel === 'facil' ? [30, 45, 60] : [20, 25, 35, 40, 50, 55, 70]);
  const resolucao = snellComPassos(1, theta1, n2);
  const gabarito = resolucao.resultado;
  return {
    id: `optica-snell-${n2}-${theta1}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Um raio de luz passa do ar (n = 1,00) para ${nome} (n = ${t(n2)}), fazendo ${theta1}° com a normal. Que ângulo o raio refratado faz com a normal, em graus?${casas(gabarito)}`,
    enunciadoTex: `n_1 = 1{,}00 \\qquad \\theta_1 = ${theta1}^{\\circ} \\qquad n_2 = ${tex(n2)}`,
    gabarito,
    resolucao,
    conceitos: ['optica.refracao'],
    armadilhas: semColisoes(
      [
        {
          resposta: (Math.asin(Math.min(1, n2 * Math.sin(rad(theta1)))) * 180) / Math.PI,
          diagnostico:
            'Os índices estão trocados: n₁ é o do meio de onde a luz VEM (o ar), n₂ o de chegada.',
          passo: 1,
          conceito: 'optica.refracao',
        },
        {
          resposta: theta1 / n2,
          diagnostico:
            'A lei de Snell relaciona os SENOS dos ângulos, não os ângulos: n₁·sen θ₁ = n₂·sen θ₂.',
          passo: 0,
          conceito: 'optica.refracao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `n₁·sen θ₁ = n₂·sen θ₂: sen θ₂ = 1,00·sen ${theta1}° / ${t(n2)}. Depois o arco-seno, em graus.`,
  };
}

/** Ângulo crítico de um meio para o ar (ou para a água). */
function critico(nivel: Nivel, rng: Rng): Exercicio<number> {
  const [nome, n1] = rng.escolher(MEIOS.slice(1));
  const paraAgua = nivel === 'dificil' && rng.booleano();
  const n2 = paraAgua ? 1.33 : 1;
  const resolucao = anguloLimiteComPassos(n1, n2);
  const gabarito = resolucao.resultado;
  const destino = paraAgua ? 'a água (n = 1,33)' : 'o ar (n = 1,00)';
  return {
    id: `optica-critico-${n1}-${n2}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `A luz sai de ${nome} (n = ${t(n1)}) para ${destino}. A partir de que ângulo com a normal ocorre reflexão total, em graus?${casas(gabarito)}`,
    enunciadoTex: `n_1 = ${tex(n1)} \\qquad n_2 = ${tex(n2)} \\qquad \\theta_c = \\;?`,
    gabarito,
    resolucao,
    conceitos: ['optica.reflexao-total'],
    armadilhas: semColisoes(
      [
        {
          resposta: 90 - gabarito,
          diagnostico:
            'Esse é o ângulo com a SUPERFÍCIE. Na óptica os ângulos se medem a partir da normal.',
          passo: 1,
          conceito: 'optica.reflexao-total',
        },
        {
          resposta: (Math.atan(n2 / n1) * 180) / Math.PI,
          diagnostico: 'O ângulo crítico vem do SENO: sen θc = n₂/n₁, não da tangente.',
          passo: 0,
          conceito: 'optica.reflexao-total',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `No ângulo crítico o refratado sai a 90°: sen θc = n₂/n₁ = ${t(n2)}/${t(n1)}.`,
  };
}

/** p′ pela equação de Gauss; no Difícil inclui divergente e objeto dentro do foco. */
function lente(nivel: Nivel, rng: Rng): Exercicio<number> {
  const divergente = nivel === 'dificil' && rng.booleano(0.4);
  const fAbs = rng.escolher([5, 8, 10, 12, 15, 20]);
  const f = divergente ? -fAbs : fAbs;
  let p = rng.inteiro(2, 8) * 5;
  if (p === fAbs) p += 5;
  if (nivel === 'medio' && p < fAbs) p = fAbs + rng.inteiro(1, 4) * 5;
  const resolucao = lenteDelgadaComPassos(f, p);
  const gabarito = resolucao.resultado;
  const tipo = divergente
    ? `divergente de distância focal ${fAbs} cm`
    : `convergente de distância focal ${fAbs} cm`;
  return {
    id: `optica-lente-${f}-${p}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um objeto está a ${p} cm de uma lente ${tipo}. A que distância da lente se forma a imagem, em cm? ` +
      `(negativo se a imagem for virtual)${casas(gabarito)}`,
    enunciadoTex: `f = ${f}\\ \\text{cm} \\qquad p = ${p}\\ \\text{cm} \\qquad p' = \\;?`,
    gabarito,
    resolucao,
    conceitos: ['optica.lentes'],
    armadilhas: semColisoes(
      [
        {
          resposta: 1 / (1 / f + 1 / p),
          diagnostico: '1/p′ = 1/f − 1/p: o 1/p passa SUBTRAINDO para o outro lado.',
          passo: 1,
          conceito: 'optica.lentes',
        },
        ...(divergente
          ? [
              {
                resposta: 1 / (1 / fAbs - 1 / p),
                diagnostico: `Lente divergente tem foco NEGATIVO: f = −${fAbs} cm.`,
                passo: 1,
                conceito: 'optica.lentes',
              },
            ]
          : []),
        {
          resposta: Math.abs(gabarito),
          diagnostico:
            'A imagem é virtual (do mesmo lado do objeto): o p′ sai negativo, e o sinal faz parte da resposta.',
          passo: 2,
          conceito: 'optica.lentes',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: divergente
      ? `Lente divergente: f = −${fAbs} cm. Use 1/p′ = 1/f − 1/p.`
      : `1/f = 1/p + 1/p′, então 1/p′ = 1/${f} − 1/${p}; depois inverta.`,
  };
}

/** Altura da imagem: h′ = −(p′/p)·h, negativa se invertida. */
function aumento(nivel: Nivel, rng: Rng): Exercicio<number> {
  const f = rng.escolher([10, 12, 15, 20]);
  const p = rng.escolher([f + 5, f + 10, 2 * f, 3 * f, f / 2]);
  const h = rng.inteiro(2, 10);
  const pLinha = 1 / (1 / f - 1 / p);
  const m = -pLinha / p;
  const gabarito = m * h;
  return {
    id: `optica-aumento-${f}-${p}-${h}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um objeto de ${h} cm de altura está a ${t(p)} cm de uma lente convergente de foco ${f} cm. ` +
      `Qual é a altura da imagem, em cm? (negativa se a imagem for invertida)${casas(gabarito)}`,
    enunciadoTex: `f = ${f}\\ \\text{cm} \\qquad p = ${tex(p)}\\ \\text{cm} \\qquad h = ${h}\\ \\text{cm}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Primeiro a posição da imagem, pela equação de Gauss.',
          tex: `\\frac{1}{p'} = \\frac{1}{${f}} - \\frac{1}{${tex(p)}} \\;\\Rightarrow\\; p' = ${tex(pLinha)}\\ \\text{cm}`,
        },
        {
          descricao: 'O aumento compara as distâncias; o sinal de menos diz se a imagem inverte.',
          tex: `m = -\\frac{p'}{p} = -\\frac{${tex(pLinha)}}{${tex(p)}} = ${tex(m)}`,
        },
        {
          descricao: 'A altura da imagem é o aumento vezes a altura do objeto.',
          tex: `h' = m \\cdot h = ${tex(m)} \\cdot ${h} = ${tex(gabarito)}\\ \\text{cm}`,
        },
      ],
    },
    conceitos: ['optica.lentes'],
    armadilhas: semColisoes(
      [
        {
          resposta: -gabarito,
          diagnostico:
            'Faltou o sinal de menos do aumento: m = −p′/p. Imagem real é invertida (altura negativa).',
          passo: 1,
          conceito: 'optica.lentes',
        },
        {
          resposta: (p / pLinha) * h * Math.sign(m),
          diagnostico: 'A razão está invertida: m = −p′/p (imagem sobre objeto).',
          passo: 1,
          conceito: 'optica.lentes',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Ache p′ por 1/p′ = 1/f − 1/p; depois h′ = −(p′/p)·h.`,
  };
}

/** Posição da franja clara de ordem m na fenda dupla. */
function fenda(nivel: Nivel, rng: Rng): Exercicio<number> {
  const ordem = rng.inteiro(1, 4);
  const lambda = rng.escolher([450, 500, 532, 589, 633, 650]);
  const L = rng.escolher([1, 1.5, 2, 2.5, 3]);
  const d = rng.escolher([0.1, 0.2, 0.25, 0.5]);
  const resolucao = fendaDuplaComPassos(ordem, lambda, L, d);
  const gabarito = resolucao.resultado;
  return {
    id: `optica-fenda-${ordem}-${lambda}-${L}-${d}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Luz de ${lambda} nm passa por duas fendas separadas por ${t(d)} mm, e a tela fica a ${t(L)} m. ` +
      `A que distância do centro está a ${ordem}ª franja clara, em mm?${casas(gabarito)}`,
    enunciadoTex: `\\lambda = ${lambda}\\ \\text{nm} \\qquad d = ${tex(d)}\\ \\text{mm} \\qquad L = ${tex(L)}\\ \\text{m} \\qquad m = ${ordem}`,
    gabarito,
    resolucao,
    conceitos: ['optica.interferencia'],
    armadilhas: semColisoes(
      [
        {
          resposta: (ordem * lambda * L) / d,
          diagnostico:
            'Faltou converter: λ em nm (10⁻⁹ m) e d em mm (10⁻³ m). Sem isso o resultado sai um milhão de vezes maior.',
          passo: 1,
          conceito: 'optica.interferencia',
        },
        {
          resposta: gabarito / ordem,
          diagnostico: `Essa é a 1ª franja. A ${ordem}ª fica ${ordem} vezes mais longe: y = m·λ·L/d.`,
          passo: 0,
          conceito: 'optica.interferencia',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `y = m·λ·L/d com tudo em metros: λ = ${lambda} × 10⁻⁹ m e d = ${t(d)} × 10⁻³ m. Depois passe y para mm.`,
  };
}

/** λ a partir da posição medida de uma franja. */
function fendaLambda(nivel: Nivel, rng: Rng): Exercicio<number> {
  const ordem = rng.inteiro(1, 3);
  const lambda = rng.escolher([450, 500, 532, 589, 633, 650]);
  const L = rng.escolher([1, 1.5, 2, 2.5]);
  const d = rng.escolher([0.2, 0.25, 0.5]);
  const y = Number((((ordem * lambda * 1e-9 * L) / (d * 1e-3)) * 1e3).toFixed(2));
  const gabarito = ((y * 1e-3 * d * 1e-3) / (ordem * L)) * 1e9;
  return {
    id: `optica-lambda-${ordem}-${lambda}-${L}-${d}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Num experimento de fenda dupla com fendas separadas por ${t(d)} mm e tela a ${t(L)} m, a ${ordem}ª franja clara aparece a ${t(y)} mm do centro. ` +
      `Qual é o comprimento de onda da luz, em nm?${casas(gabarito)}`,
    enunciadoTex: `y_{${ordem}} = ${tex(y)}\\ \\text{mm} \\qquad d = ${tex(d)}\\ \\text{mm} \\qquad L = ${tex(L)}\\ \\text{m}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        { descricao: 'Isolamos λ em y = m·λ·L/d.', tex: '\\lambda = \\frac{y\\, d}{m L}' },
        {
          descricao: 'Tudo em metros.',
          tex: `\\lambda = \\frac{${tex(y)} \\times 10^{-3} \\cdot ${tex(d)} \\times 10^{-3}}{${ordem} \\cdot ${tex(L)}}`,
        },
        {
          descricao: 'Em nanômetros (1 nm = 10⁻⁹ m).',
          tex: `\\lambda = ${tex(gabarito)}\\ \\text{nm}`,
        },
      ],
    },
    conceitos: ['optica.interferencia'],
    armadilhas: semColisoes(
      [
        {
          resposta: gabarito * ordem,
          diagnostico: `Faltou dividir pela ordem m = ${ordem}.`,
          passo: 0,
          conceito: 'optica.interferencia',
        },
        {
          resposta: (y * d) / (ordem * L),
          diagnostico:
            'Faltou converter: y e d em mm valem 10⁻³ m cada; a resposta tem de sair em nm.',
          passo: 1,
          conceito: 'optica.interferencia',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: 'λ = y·d/(m·L), com y e d em metros; o resultado em metros vezes 10⁹ dá nanômetros.',
  };
}

/** Duas lentes convergentes em sequência: a imagem da primeira é objeto da segunda. */
function lenteDuas(nivel: Nivel, rng: Rng): Exercicio<number> {
  const f1 = rng.escolher([10, 15, 20]);
  const p1 = f1 * rng.escolher([2, 3]) + rng.escolher([0, 5]);
  const p1Linha = 1 / (1 / f1 - 1 / p1);
  const separacao = Math.ceil(p1Linha / 5) * 5 + rng.escolher([10, 15, 20, 30]);
  const p2 = separacao - p1Linha;
  // A imagem intermediária não pode cair no foco da segunda lente (imagem no infinito).
  const f2 = [5, 8, 10, 12].filter((f) => Math.abs(p2 - f) > 1)[rng.inteiro(0, 2)]!;
  const p2Linha = 1 / (1 / f2 - 1 / p2);
  const gabarito = p2Linha;
  return {
    id: `optica-duas-${f1}-${p1}-${separacao}-${f2}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Duas lentes convergentes estão a ${separacao} cm uma da outra; a primeira tem foco ${f1} cm e a segunda, ${f2} cm. ` +
      `Um objeto está a ${p1} cm antes da primeira. A que distância DEPOIS da segunda lente se forma a imagem final, em cm?${casas(gabarito)}`,
    enunciadoTex: `f_1 = ${f1} \\qquad f_2 = ${f2} \\qquad D = ${separacao} \\qquad p_1 = ${p1}\\ (\\text{cm})`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'A primeira lente forma uma imagem intermediária.',
          tex: `\\frac{1}{p_1'} = \\frac{1}{${f1}} - \\frac{1}{${p1}} \\;\\Rightarrow\\; p_1' = ${tex(p1Linha)}\\ \\text{cm}`,
        },
        {
          descricao: 'Essa imagem é o objeto da segunda lente, à distância que sobra até ela.',
          tex: `p_2 = D - p_1' = ${separacao} - ${tex(p1Linha)} = ${tex(p2)}\\ \\text{cm}`,
        },
        {
          descricao: 'A segunda lente forma a imagem final.',
          tex: `\\frac{1}{p_2'} = \\frac{1}{${f2}} - \\frac{1}{${tex(p2)}} \\;\\Rightarrow\\; p_2' = ${tex(gabarito)}\\ \\text{cm}`,
        },
      ],
    },
    conceitos: ['optica.lentes'],
    armadilhas: semColisoes(
      [
        {
          resposta: 1 / (1 / f2 - 1 / separacao),
          diagnostico:
            'O objeto da segunda lente é a IMAGEM da primeira, a D − p₁′ dela, não o objeto original a D.',
          passo: 1,
          conceito: 'optica.lentes',
        },
        {
          resposta: p1Linha,
          diagnostico: 'Essa é a imagem da primeira lente. Ela ainda passa pela segunda.',
          passo: 0,
          conceito: 'optica.lentes',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: 'Resolva a primeira lente, use a imagem dela como objeto da segunda (a D − p₁′ dela) e aplique Gauss de novo.',
  };
}
