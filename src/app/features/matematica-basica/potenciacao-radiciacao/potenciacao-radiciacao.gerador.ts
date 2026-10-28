import {
  Potencia,
  avaliarPotencia,
  potenciaDePotenciaComPassos,
  potenciaParaTex,
  produtoDePotenciasComPassos,
  quocienteDePotenciasComPassos,
  simplificarRaizComPassos,
} from '@core/math';
import { Rng } from '@core/treino/rng';
import {
  Armadilha,
  Exercicio,
  GeradorExercicio,
  Nivel,
  semColisoes,
} from '@core/treino/treino.model';

type Modalidade = 'produto' | 'quociente' | 'potenciaDePotencia' | 'raiz';

/**
 * Exercícios de potenciação e radiciação.
 *
 * A resposta é sempre numérica para manter a correção objetiva; nos exercícios
 * de raiz, pedimos o valor quando ela é exata e o coeficiente que sai do
 * radical quando não é.
 */
export const geradorPotencias: GeradorExercicio<number> = {
  topicoId: 'potenciacao-radiciacao',
  formatoResposta: 'um número, ex.: 64 ou 0,25',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const modalidade = sortearModalidade(nivel, rng);

    switch (modalidade) {
      case 'produto':
        return exercicioProduto(nivel, rng);
      case 'quociente':
        return exercicioQuociente(nivel, rng);
      case 'potenciaDePotencia':
        return exercicioPotenciaDePotencia(nivel, rng);
      case 'raiz':
        return exercicioRaiz(nivel, rng);
    }
  },

  analisar: (entrada) => {
    const limpo = entrada.trim().replace(/\s/g, '').replace(',', '.');

    // Aceita também a resposta escrita como fração, comum em expoente negativo.
    const fracao = /^([+-]?\d+)\/(\d+)$/.exec(limpo);
    if (fracao) {
      const denominador = Number(fracao[2]);
      return denominador === 0 ? null : Number(fracao[1]) / denominador;
    }

    return /^[+-]?\d*\.?\d+$/.test(limpo) ? Number(limpo) : null;
  },

  saoEquivalentes: (a, b) => Math.abs(a - b) < 1e-9,
  formatar: (valor) =>
    Number(valor.toFixed(6)).toLocaleString('pt-BR', { maximumFractionDigits: 6 }),
};

function sortearModalidade(nivel: Nivel, rng: Rng): Modalidade {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Modalidade>(['produto', 'raiz']);
    case 'medio':
      return rng.escolher<Modalidade>(['produto', 'quociente', 'potenciaDePotencia', 'raiz']);
    case 'dificil':
      return rng.escolher<Modalidade>(['quociente', 'potenciaDePotencia', 'raiz']);
  }
}

function identificador(nome: string, rng: Rng): string {
  return `potencias-${nome}-${rng.inteiro(0, 99999)}`;
}

/** Erro universal do tema: operar as bases em vez dos expoentes. */
function armadilhaDeBase(
  base: number,
  m: number,
  n: number,
  operacao: '+' | '*',
): Armadilha<number> {
  return {
    resposta: operacao === '+' ? (base + base) ** (m + n) : (base * base) ** (m + n),
    diagnostico:
      'A base nunca muda nessas propriedades — o que se opera é o expoente. ' +
      `Em ${base}^${m} · ${base}^${n}, continuamos multiplicando fatores ${base}; só a ` +
      'quantidade deles muda.',
    passo: 1,
    conceito: 'potencias.propriedades',
  };
}

function exercicioProduto(nivel: Nivel, rng: Rng): Exercicio<number> {
  const base = rng.escolher(nivel === 'facil' ? [2, 3, 5] : [2, 3, 4, 5, 6, 7]);
  const m = rng.inteiro(1, nivel === 'facil' ? 3 : 4);
  const n = rng.inteiro(1, nivel === 'facil' ? 3 : 4);

  const resolucao = produtoDePotenciasComPassos(base, m, n);
  const gabarito = avaliarPotencia(resolucao.resultado);

  return {
    id: identificador('produto', rng),
    nivel,
    enunciado: 'Aplique a propriedade e informe o valor numérico.',
    enunciadoTex: `${potenciaParaTex({ base, expoente: m })} \\cdot ${potenciaParaTex({ base, expoente: n })} = \;?`,
    gabarito,
    resolucao: { resultado: gabarito, passos: resolucao.passos },
    conceitos: ['potencias.propriedades', 'potencias.definicao'],
    armadilhas: semColisoes(
      [
        {
          resposta: base ** (m * n),
          diagnostico:
            'Você multiplicou os expoentes. Multiplicar expoentes é a regra da potência de ' +
            'potência, (aᵐ)ⁿ; no produto de potências de mesma base, eles se SOMAM.',
          passo: 2,
          conceito: 'potencias.propriedades',
        },
        armadilhaDeBase(base, m, n, '*'),
        {
          resposta: base * (m + n),
          diagnostico:
            'Parece que você multiplicou a base pela soma dos expoentes. Potência é ' +
            'multiplicação repetida da base, não multiplicação da base pelo expoente.',
          passo: 0,
          conceito: 'potencias.definicao',
        },
      ],
      gabarito,
      (a, b) => a === b,
    ),
    dica: nivel === 'facil' ? 'As bases são iguais — o que acontece com os expoentes?' : undefined,
  };
}

function exercicioQuociente(nivel: Nivel, rng: Rng): Exercicio<number> {
  const base = rng.escolher([2, 3, 5]);
  const m = rng.inteiro(1, 5);
  // No difícil permitimos m < n, que leva a expoente zero ou negativo.
  const n = nivel === 'dificil' ? rng.inteiro(1, 6) : rng.inteiro(1, m);

  const resolucao = quocienteDePotenciasComPassos(base, m, n);
  const gabarito = avaliarPotencia(resolucao.resultado);

  return {
    id: identificador('quociente', rng),
    nivel,
    enunciado: 'Simplifique e informe o valor numérico.',
    enunciadoTex: `\\frac{${potenciaParaTex({ base, expoente: m })}}{${potenciaParaTex({ base, expoente: n })}} = \;?`,
    gabarito,
    resolucao: { resultado: gabarito, passos: resolucao.passos },
    conceitos:
      m - n <= 0
        ? ['potencias.expoentes-especiais', 'potencias.propriedades']
        : ['potencias.propriedades'],
    armadilhas: semColisoes(
      [
        {
          resposta: base ** (m / n),
          diagnostico:
            'Você dividiu os expoentes. Na divisão de potências de mesma base, os expoentes se ' +
            'SUBTRAEM — é o que sobra depois de cancelar os fatores comuns.',
          passo: 2,
          conceito: 'potencias.propriedades',
        },
        {
          resposta: -(base ** Math.abs(m - n)),
          diagnostico:
            'Expoente negativo não deixa o resultado negativo: ele INVERTE o número. ' +
            `${base}^{-k} significa 1/${base}^{k}, que é positivo.`,
          passo: 3,
          conceito: 'potencias.expoentes-especiais',
        },
        {
          resposta: 0,
          diagnostico:
            'Quando os expoentes se cancelam, o resultado é 1, não 0. Dividir uma potência por ' +
            'ela mesma dá 1 — é exatamente daí que vem a regra do expoente zero.',
          passo: 3,
          conceito: 'potencias.expoentes-especiais',
        },
      ],
      gabarito,
      (a, b) => Math.abs(a - b) < 1e-9,
    ),
  };
}

function exercicioPotenciaDePotencia(nivel: Nivel, rng: Rng): Exercicio<number> {
  const base = rng.escolher([2, 3, 5]);
  const m = rng.inteiro(2, 3);
  const n = rng.inteiro(2, nivel === 'dificil' ? 4 : 3);

  const resolucao = potenciaDePotenciaComPassos(base, m, n);
  const gabarito = avaliarPotencia(resolucao.resultado);

  return {
    id: identificador('potencia-de-potencia', rng),
    nivel,
    enunciado: 'Aplique a propriedade e informe o valor numérico.',
    enunciadoTex: `\\left(${potenciaParaTex({ base, expoente: m })}\\right)^{${n}} = \;?`,
    gabarito,
    resolucao: { resultado: gabarito, passos: resolucao.passos },
    conceitos: ['potencias.propriedades'],
    armadilhas: semColisoes(
      [
        {
          resposta: base ** (m + n),
          diagnostico:
            'Você somou os expoentes. Somar é a regra do PRODUTO de potências; na potência de ' +
            'potência eles se multiplicam, porque são n grupos de m fatores.',
          passo: 2,
          conceito: 'potencias.propriedades',
        },
        {
          resposta: base ** m * n,
          diagnostico:
            'Você multiplicou a potência interna por n. O expoente externo manda REPETIR a ' +
            'potência interna n vezes como fator, não somá-la n vezes.',
          passo: 1,
          conceito: 'potencias.propriedades',
        },
      ],
      gabarito,
      (a, b) => a === b,
    ),
  };
}

function exercicioRaiz(nivel: Nivel, rng: Rng): Exercicio<number> {
  const quadrados = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144];

  if (nivel === 'facil') {
    const radicando = rng.escolher(quadrados);
    const resolucao = simplificarRaizComPassos(radicando);
    const gabarito = resolucao.resultado.coeficiente;

    return {
      id: identificador('raiz-exata', rng),
      nivel,
      enunciado: 'Calcule a raiz quadrada.',
      enunciadoTex: `\\sqrt{${radicando}} = \;?`,
      gabarito,
      resolucao: { resultado: gabarito, passos: resolucao.passos },
      conceitos: ['potencias.raizes'],
      armadilhas: semColisoes(
        [
          {
            resposta: radicando / 2,
            diagnostico:
              'Você dividiu por 2. Raiz quadrada não é metade: é o número que, MULTIPLICADO ' +
              'por si mesmo, dá o radicando.',
            passo: 0,
            conceito: 'potencias.raizes',
          },
        ],
        gabarito,
        (a, b) => a === b,
      ),
      dica: 'Qual número multiplicado por ele mesmo dá esse valor?',
    };
  }

  // Médio e difícil: radicando com parte que sai e parte que fica.
  const fora = rng.inteiro(2, nivel === 'dificil' ? 6 : 4);
  const dentro = rng.escolher([2, 3, 5, 6, 7, 10]);
  const radicando = fora * fora * dentro;

  const resolucao = simplificarRaizComPassos(radicando);
  const gabarito = resolucao.resultado.coeficiente;

  return {
    id: identificador('raiz-simplificada', rng),
    nivel,
    enunciado: `Simplificando √${radicando}, qual é o número que SAI do radical?`,
    enunciadoTex: `\\sqrt{${radicando}} = k\\sqrt{${dentro}} \\qquad k = \;?`,
    gabarito,
    resolucao: { resultado: gabarito, passos: resolucao.passos },
    conceitos: ['potencias.raizes', 'potencias.propriedades'],
    armadilhas: semColisoes(
      [
        {
          resposta: fora * fora,
          diagnostico:
            'Você deixou sair o quadrado inteiro. Na raiz quadrada, cada PAR de fatores iguais ' +
            `sai como um único fator: ${fora}² sai como ${fora}, não como ${fora * fora}.`,
          passo: 1,
          conceito: 'potencias.raizes',
        },
        {
          resposta: Math.round(Math.sqrt(radicando)),
          diagnostico:
            `√${radicando} não é um inteiro — ${radicando} não é quadrado perfeito. Por isso ` +
            'a resposta fica na forma k√n, com uma parte permanecendo sob o radical.',
          passo: 2,
          conceito: 'potencias.raizes',
        },
      ],
      gabarito,
      (a, b) => a === b,
    ),
  };
}
