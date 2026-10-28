import { arranjosComPassos, combinacoes, combinacoesComPassos, fatorial, permutacoesComPassos } from '@core/math';
import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => a === b;

type Pergunta = 'multiplicativo' | 'arranjo' | 'combinacao' | 'anagrama' | 'comite-misto';

export const geradorCombinatoria: GeradorExercicio<number> = {
  topicoId: 'analise-combinatoria',
  formatoResposta: 'um número inteiro',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'multiplicativo':
        return exercicioMultiplicativo(nivel, rng);
      case 'arranjo':
        return exercicioArranjo(nivel, rng);
      case 'combinacao':
        return exercicioCombinacao(nivel, rng);
      case 'anagrama':
        return exercicioAnagrama(nivel, rng);
      case 'comite-misto':
        return exercicioComiteMisto(nivel, rng);
    }
  },

  analisar: (entrada) => {
    const limpo = entrada.trim().replace(/[\s.]/g, '');
    return /^\d+$/.test(limpo) ? Number(limpo) : null;
  },

  saoEquivalentes: proximos,
  formatar: (valor) => valor.toLocaleString('pt-BR'),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['multiplicativo', 'combinacao']);
    case 'medio':
      return rng.escolher<Pergunta>(['arranjo', 'combinacao', 'anagrama']);
    case 'dificil':
      return rng.escolher<Pergunta>(['anagrama', 'comite-misto', 'arranjo']);
  }
}

function exercicioMultiplicativo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const camisas = rng.inteiro(2, 12);
  const calcas = rng.inteiro(2, 9);
  const sapatos = rng.inteiro(2, 7);

  const resultado = camisas * calcas * sapatos;

  return {
    id: `comb-mult-${camisas}-${calcas}-${sapatos}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Alguém tem ${camisas} camisas, ${calcas} calças e ${sapatos} pares de sapato. Quantos ` +
      'trajes diferentes consegue montar?',
    enunciadoTex: `${camisas} \\times ${calcas} \\times ${sapatos}`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'As três escolhas são independentes: nenhuma limita as outras.',
          tex: `${camisas} \\cdot ${calcas} \\cdot ${sapatos}`,
        },
        {
          descricao: 'Pelo princípio multiplicativo, os totais se multiplicam.',
          tex: `N = ${resultado}`,
          nota: 'Para cada camisa, todas as calças seguem disponíveis — daí a multiplicação.',
        },
      ],
    },
    conceitos: ['combinatoria.multiplicativo'],
    armadilhas: semColisoes(
      [
        {
          resposta: camisas + calcas + sapatos,
          diagnostico:
            'Somar contaria as peças, não os trajes. Como as escolhas são combinadas entre si, ' +
            'os totais se multiplicam.',
          passo: 0,
          conceito: 'combinatoria.multiplicativo',
        },
        {
          resposta: camisas * calcas,
          diagnostico: 'Faltou multiplicar pela terceira escolha, os sapatos.',
          passo: 1,
          conceito: 'combinatoria.multiplicativo',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? 'Escolhas independentes multiplicam.' : undefined,
  };
}

function exercicioArranjo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const n = rng.inteiro(5, 20);
  const p = rng.inteiro(2, Math.min(5, n - 1));

  const { resultado, passos } = arranjosComPassos(n, p);

  return {
    id: `comb-arr-${n}-${p}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Entre ${n} pessoas, de quantos modos se pode formar uma fila de ${p}, importando a ` +
      'ordem?',
    enunciadoTex: `A_{${n},${p}}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['combinatoria.multiplicativo'],
    armadilhas: semColisoes(
      [
        {
          resposta: combinacoes(n, p),
          diagnostico:
            'Essa é a COMBINAÇÃO, que ignora a ordem. Numa fila, trocar duas pessoas de lugar ' +
            'produz uma fila diferente — então a ordem conta.',
          passo: 1,
          conceito: 'combinatoria.combinacao',
        },
        {
          resposta: n ** p,
          diagnostico:
            'Essa contagem permitiria repetir pessoas. Sem reposição, cada posição tem uma ' +
            'opção menos que a anterior.',
          passo: 0,
          conceito: 'combinatoria.multiplicativo',
        },
      ],
      resultado,
      proximos,
    ),
  };
}

function exercicioCombinacao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const n = rng.inteiro(5, 24);
  const p = rng.inteiro(2, Math.min(5, n - 1));

  const { resultado, passos } = combinacoesComPassos(n, p);

  return {
    id: `comb-comb-${n}-${p}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `De quantos modos se pode escolher uma equipe de ${p} pessoas entre ${n} candidatos, ` +
      'sem distinguir cargos?',
    enunciadoTex: `C_{${n},${p}}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['combinatoria.combinacao'],
    armadilhas: semColisoes(
      [
        {
          resposta: arranjosComPassos(n, p).resultado,
          diagnostico:
            'Esse é o ARRANJO, que conta a ordem. Sem cargos, a mesma equipe em outra ordem é ' +
            `a mesma equipe: falta dividir por ${p}!.`,
          passo: 2,
          conceito: 'combinatoria.combinacao',
        },
        {
          resposta: n * p,
          diagnostico:
            'Multiplicar n por p não conta subconjuntos. A contagem passa por arranjos e ' +
            'depois descarta as ordens repetidas.',
          passo: 0,
          conceito: 'combinatoria.combinacao',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? 'Sem ordem: divida o arranjo por p!.' : undefined,
  };
}

function exercicioAnagrama(nivel: Nivel, rng: Rng): Exercicio<number> {
  const palavras: readonly (readonly [string, readonly number[]])[] = [
    ['ARARA', [3, 2]],
    ['BANANA', [3, 2]],
    ['CASA', [2]],
    ['OVO', [2]],
    ['BATATA', [3, 2]],
    ['CARRO', [2, 2]],
    ['LIVRO', []],
    ['AMOR', []],
    ['MATEMATICA', [3, 2, 2]],
  ];

  const [palavra, repeticoes] = rng.escolher(palavras);
  const { resultado, passos } = permutacoesComPassos(palavra.length, repeticoes);

  return {
    id: `comb-ana-${palavra}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Quantos anagramas distintos tem a palavra ${palavra}?`,
    enunciadoTex: `\\text{${palavra}}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['combinatoria.permutacao'],
    armadilhas: semColisoes(
      [
        {
          resposta: fatorial(palavra.length),
          diagnostico:
            'Letras repetidas não geram anagramas novos ao trocarem de lugar. É preciso ' +
            'dividir pelo fatorial de cada grupo de letras iguais.',
          passo: 1,
          conceito: 'combinatoria.permutacao',
        },
        {
          resposta: palavra.length ** 2,
          diagnostico:
            'Anagrama é reordenação das mesmas letras, então a contagem é um fatorial ' +
            'ajustado, não uma potência.',
          passo: 0,
          conceito: 'combinatoria.permutacao',
        },
      ],
      resultado,
      proximos,
    ),
  };
}

function exercicioComiteMisto(nivel: Nivel, rng: Rng): Exercicio<number> {
  const homens = rng.inteiro(4, 8);
  const mulheres = rng.inteiro(4, 8);
  const escolhidosH = rng.inteiro(1, 3);
  const escolhidasM = rng.inteiro(1, 3);

  const porGrupo = [combinacoes(homens, escolhidosH), combinacoes(mulheres, escolhidasM)];
  const resultado = porGrupo[0]! * porGrupo[1]!;

  return {
    id: `comb-misto-${homens}_${escolhidosH}-${mulheres}_${escolhidasM}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Uma comissão terá ${escolhidosH} entre ${homens} engenheiros e ${escolhidasM} entre ` +
      `${mulheres} técnicas. Quantas comissões diferentes são possíveis?`,
    enunciadoTex: `C_{${homens},${escolhidosH}} \\cdot C_{${mulheres},${escolhidasM}}`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'Cada grupo é escolhido separadamente, sem ordem.',
          tex: `C_{${homens},${escolhidosH}} = ${porGrupo[0]} \\qquad C_{${mulheres},${escolhidasM}} = ${porGrupo[1]}`,
        },
        {
          descricao: 'As duas escolhas são independentes, então os totais se multiplicam.',
          tex: `N = ${porGrupo[0]} \\times ${porGrupo[1]} = ${resultado}`,
          nota: 'Combinação dentro de cada grupo, multiplicação entre os grupos.',
        },
      ],
    },
    conceitos: ['combinatoria.combinacao', 'combinatoria.multiplicativo'],
    armadilhas: semColisoes(
      [
        {
          resposta: porGrupo[0]! + porGrupo[1]!,
          diagnostico:
            'Somar contaria "um grupo OU o outro". Como a comissão precisa dos dois ao mesmo ' +
            'tempo, as contagens se multiplicam.',
          passo: 1,
          conceito: 'combinatoria.multiplicativo',
        },
        {
          resposta: combinacoes(homens + mulheres, escolhidosH + escolhidasM),
          diagnostico:
            'Juntar todos num só grupo ignora a restrição de quantos vêm de cada lado, e conta ' +
            'comissões que não respeitam o enunciado.',
          passo: 0,
          conceito: 'combinatoria.combinacao',
        },
      ],
      resultado,
      proximos,
    ),
  };
}
