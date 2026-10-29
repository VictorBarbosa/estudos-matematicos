import {
  aoMenosUmComPassos,
  combinacoes,
  probabilidadeComPassos,
  probabilidadeConjuntaComPassos,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.005;

type Pergunta = 'dado' | 'sem-reposicao' | 'ao-menos-um' | 'uniao' | 'com-combinacao';

export const geradorProbabilidade: GeradorExercicio<number> = {
  topicoId: 'probabilidade',
  formatoResposta: 'probabilidade entre 0 e 1, ou fração (ex.: 1/6)',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'dado':
        return exercicioDado(nivel, rng);
      case 'sem-reposicao':
        return exercicioSemReposicao(nivel, rng);
      case 'ao-menos-um':
        return exercicioAoMenosUm(nivel, rng);
      case 'uniao':
        return exercicioUniao(nivel, rng);
      case 'com-combinacao':
        return exercicioComCombinacao(nivel, rng);
    }
  },

  /** Aceita decimal, fração e porcentagem — as três formas usuais. */
  analisar: (entrada) => {
    // A exibição do gabarito é "0,38 (38,00%)": aceitar essa forma de volta
    // evita que o aluno copie a resposta certa e receba "formato inválido".
    const limpo = entrada.trim().replace(/\s/g, '').replace(/\([^)]*\)$/, '');

    const porcentagem = /^(.+)%$/.exec(limpo);
    if (porcentagem) {
      const valor = analisarNumero(porcentagem[1]!);
      return valor === null ? null : valor / 100;
    }

    const valor = analisarNumero(limpo);
    return valor === null || valor < 0 ? null : valor;
  },

  saoEquivalentes: proximos,
  formatar: (valor) =>
    `${Number(valor.toFixed(4)).toLocaleString('pt-BR')} (${(valor * 100).toFixed(2).replace('.', ',')}%)`,
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['dado', 'uniao']);
    case 'medio':
      return rng.escolher<Pergunta>(['sem-reposicao', 'ao-menos-um', 'dado']);
    case 'dificil':
      return rng.escolher<Pergunta>(['com-combinacao', 'ao-menos-um', 'sem-reposicao']);
  }
}

function exercicioDado(nivel: Nivel, rng: Rng): Exercicio<number> {
  // Dados de 4 a 30 faces, não seis valores fixos.
  const faces = rng.inteiro(4, 30);
  // O limiar e o divisor entram sorteados: com textos fixos, o tópico tinha
  // quatro perguntas apenas.
  const limiar = rng.inteiro(2, Math.max(2, faces - 1));
  const divisor = rng.inteiro(2, Math.min(9, Math.max(2, faces - 1)));

  const casos: readonly { readonly texto: string; readonly conta: (n: number) => number }[] = [
    { texto: 'um número par', conta: (n) => Math.floor(n / 2) },
    { texto: 'um número ímpar', conta: (n) => Math.ceil(n / 2) },
    { texto: `um número maior que ${limiar}`, conta: (n) => Math.max(0, n - limiar) },
    { texto: `um número menor que ${limiar}`, conta: () => limiar - 1 },
    { texto: `um múltiplo de ${divisor}`, conta: (n) => Math.floor(n / divisor) },
    { texto: 'o maior valor possível', conta: () => 1 },
  ];

  const caso = rng.escolher(casos);
  const favoraveis = caso.conta(faces);
  const { resultado, passos } = probabilidadeComPassos(favoraveis, faces);

  return {
    id: `prob-dado-${faces}-${caso.texto}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Num dado honesto de ${faces} faces, qual é a probabilidade de sair ${caso.texto}?`,
    enunciadoTex: `n(\\Omega) = ${faces} \\qquad n(A) = ${favoraveis}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['probabilidade.espaco'],
    armadilhas: semColisoes(
      [
        {
          resposta: favoraveis,
          diagnostico:
            'Essa é a CONTAGEM dos casos favoráveis, não a probabilidade. Falta dividir pelo ' +
            'total de resultados possíveis.',
          passo: 1,
          conceito: 'probabilidade.espaco',
        },
        {
          resposta: 1 - resultado,
          diagnostico:
            'Essa é a probabilidade do evento COMPLEMENTAR — de NÃO acontecer o que foi pedido.',
          passo: 1,
          conceito: 'probabilidade.complementar',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? 'P = favoráveis / possíveis' : undefined,
  };
}

function exercicioSemReposicao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const vermelhas = rng.inteiro(2, 14);
  const azuis = rng.inteiro(2, 14);
  const total = vermelhas + azuis;

  const primeira = vermelhas / total;
  const segunda = (vermelhas - 1) / (total - 1);

  const { resultado, passos } = probabilidadeConjuntaComPassos(primeira, segunda, false, segunda);

  return {
    id: `prob-semrep-${vermelhas}-${azuis}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Uma urna tem ${vermelhas} bolas vermelhas e ${azuis} azuis. Retirando duas bolas SEM ` +
      'reposição, qual é a probabilidade de ambas serem vermelhas?',
    enunciadoTex: `${vermelhas}\\text{ vermelhas} \\qquad ${azuis}\\text{ azuis}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['probabilidade.independencia'],
    armadilhas: semColisoes(
      [
        {
          resposta: primeira * primeira,
          diagnostico:
            'Essa seria a resposta COM reposição. Sem repor a primeira bola, a urna tem uma ' +
            'vermelha menos e uma bola menos no total.',
          passo: 1,
          conceito: 'probabilidade.independencia',
        },
        {
          resposta: primeira,
          diagnostico:
            'Essa é a probabilidade só da PRIMEIRA retirada. O evento pedido exige as duas.',
          passo: 0,
          conceito: 'probabilidade.independencia',
        },
        {
          resposta: primeira + segunda,
          diagnostico:
            'Para dois eventos ocorrerem JUNTOS, as probabilidades se multiplicam. Somar ' +
            'corresponderia a "um ou o outro" — e poderia até passar de 1.',
          passo: 2,
          conceito: 'probabilidade.independencia',
        },
      ],
      resultado,
      proximos,
    ),
  };
}

function exercicioAoMenosUm(nivel: Nivel, rng: Rng): Exercicio<number> {
  const faces = rng.inteiro(4, 24);
  const tentativas = rng.inteiro(2, 6);
  const p = 1 / faces;

  const { resultado, passos } = aoMenosUmComPassos(p, tentativas);

  return {
    id: `prob-aomenos-${faces}-${tentativas}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Lançando um dado de ${faces} faces ${tentativas} vezes, qual é a probabilidade de sair ` +
      'o maior valor ao menos uma vez?',
    enunciadoTex: `p = \\frac{1}{${faces}} \\qquad n = ${tentativas}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['probabilidade.complementar', 'probabilidade.independencia'],
    armadilhas: semColisoes(
      [
        {
          resposta: p * tentativas,
          diagnostico:
            'Multiplicar a probabilidade pelo número de tentativas conta cenários mais de uma ' +
            'vez, e com muitas tentativas passaria de 1. Use o complementar.',
          passo: 0,
          conceito: 'probabilidade.complementar',
        },
        {
          resposta: (1 - p) ** tentativas,
          diagnostico:
            'Essa é a probabilidade de NENHUM sucesso. Falta subtrair de 1 para obter "ao ' +
            'menos um".',
          passo: 2,
          conceito: 'probabilidade.complementar',
        },
        {
          resposta: p ** tentativas,
          diagnostico:
            'Essa é a probabilidade de acertar em TODAS as tentativas, que é muito menor do ' +
            'que acertar em ao menos uma.',
          passo: 1,
          conceito: 'probabilidade.independencia',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? 'P = 1 − (1 − p)ⁿ' : undefined,
  };
}

function exercicioUniao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const faces = 6;
  const casos: readonly { readonly texto: string; readonly favoraveis: number }[] = [
    { texto: 'par ou maior que 3', favoraveis: 4 },
    { texto: 'ímpar ou múltiplo de 3', favoraveis: 4 },
    { texto: 'menor que 3 ou igual a 6', favoraveis: 3 },
  ];

  const caso = rng.escolher(casos);
  const { resultado, passos } = probabilidadeComPassos(caso.favoraveis, faces);

  return {
    id: `prob-uniao-${caso.texto}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Num dado de 6 faces, qual é a probabilidade de sair ${caso.texto}?`,
    enunciadoTex: `n(\\Omega) = ${faces}`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'Listamos os resultados que satisfazem ao menos uma das condições.',
          tex: `n(A \\cup B) = ${caso.favoraveis}`,
          nota: 'Resultados que satisfazem AMBAS as condições contam uma vez só.',
        },
        ...passos.slice(1),
      ],
    },
    conceitos: ['probabilidade.espaco'],
    armadilhas: semColisoes(
      [
        {
          resposta: (caso.favoraveis + 1) / faces,
          diagnostico:
            'Na união, os resultados que satisfazem as DUAS condições não podem ser contados ' +
            'duas vezes: P(A ∪ B) = P(A) + P(B) − P(A ∩ B).',
          passo: 0,
          conceito: 'probabilidade.espaco',
        },
        {
          resposta: 1,
          diagnostico:
            'Probabilidade 1 significaria evento certo. Há resultados do dado que não ' +
            'satisfazem nenhuma das condições.',
          passo: 1,
          conceito: 'probabilidade.espaco',
        },
      ],
      resultado,
      proximos,
    ),
  };
}

function exercicioComCombinacao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const defeituosas = rng.inteiro(2, 4);
  const boas = rng.inteiro(5, 9);
  const total = defeituosas + boas;
  const retiradas = rng.inteiro(2, 3);

  const favoraveis = combinacoes(boas, retiradas);
  const possiveis = combinacoes(total, retiradas);
  const { resultado, passos } = probabilidadeComPassos(favoraveis, possiveis);

  return {
    id: `prob-comb-${defeituosas}-${boas}-${retiradas}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um lote tem ${total} peças, das quais ${defeituosas} são defeituosas. Retirando ` +
      `${retiradas} peças de uma vez, qual é a probabilidade de NENHUMA ser defeituosa?`,
    enunciadoTex: `C_{${boas},${retiradas}} / C_{${total},${retiradas}}`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'Os casos possíveis são todas as escolhas de peças, sem ordem.',
          tex: `C_{${total},${retiradas}} = ${possiveis}`,
        },
        {
          descricao: 'Os favoráveis escolhem apenas entre as boas.',
          tex: `C_{${boas},${retiradas}} = ${favoraveis}`,
          nota: 'Retirar "de uma vez" significa que a ordem não importa: são combinações.',
        },
        ...passos.slice(1),
      ],
    },
    conceitos: ['probabilidade.espaco', 'combinatoria.combinacao'],
    armadilhas: semColisoes(
      [
        {
          resposta: 1 - resultado,
          diagnostico:
            'Essa é a probabilidade de ao menos uma ser defeituosa — o complementar do que foi ' +
            'pedido.',
          passo: 2,
          conceito: 'probabilidade.complementar',
        },
        {
          resposta: (boas / total) ** retiradas,
          diagnostico:
            'Essa conta supõe reposição. Retirando várias peças de uma vez, o lote encolhe a ' +
            'cada peça — use combinações.',
          passo: 1,
          conceito: 'probabilidade.independencia',
        },
      ],
      resultado,
      proximos,
    ),
  };
}
