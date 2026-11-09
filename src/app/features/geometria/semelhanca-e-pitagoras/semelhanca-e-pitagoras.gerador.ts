import {
  catetoComPassos,
  escalaComPassos,
  pitagorasComPassos,
  talesComPassos,
  ternosPitagoricos,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.01;

type Pergunta = 'hipotenusa' | 'cateto' | 'tales' | 'area-escalada' | 'volume-escalado';

/**
 * Ternos pitagóricos, para que as respostas saiam inteiras no nível fácil.
 *
 * Gerados pela fórmula de Euclides: a lista escrita à mão tinha sete entradas,
 * e o aluno reconhecia o 3-4-5 em poucos cliques.
 */
const TERNOS = ternosPitagoricos(120);

export const geradorSemelhanca: GeradorExercicio<number> = {
  topicoId: 'semelhanca-e-pitagoras',
  formatoResposta: 'um número, ex.: 13 ou 7,5',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'hipotenusa':
        return exercicioHipotenusa(nivel, rng);
      case 'cateto':
        return exercicioCateto(nivel, rng);
      case 'tales':
        return exercicioTales(nivel, rng);
      case 'area-escalada':
        return exercicioEscala(2, nivel, rng);
      case 'volume-escalado':
        return exercicioEscala(3, nivel, rng);
    }
  },

  analisar: analisarNumero,

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 }),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['hipotenusa', 'cateto']);
    case 'medio':
      return rng.escolher<Pergunta>(['cateto', 'tales', 'area-escalada']);
    case 'dificil':
      return rng.escolher<Pergunta>(['tales', 'area-escalada', 'volume-escalado']);
    // O volume escalado é o que mais engana: a razão vai ao cubo, não ao
    // quadrado, e é o erro clássico do tópico.
    case 'extremo':
      return 'volume-escalado';
  }
}

function exercicioHipotenusa(nivel: Nivel, rng: Rng): Exercicio<number> {
  const [b, c] = rng.escolher(TERNOS);
  const { resultado, passos } = pitagorasComPassos(b, c);

  return {
    id: `sem-hip-${b}-${c}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um triângulo retângulo tem catetos ${b} cm e ${c} cm. ` + 'Quanto mede a hipotenusa, em cm?',
    enunciadoTex: `b = ${b} \\qquad c = ${c}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['semelhanca.pitagoras'],
    armadilhas: semColisoes(
      [
        {
          resposta: b + c,
          diagnostico:
            'Os catetos não se somam diretamente: são os QUADRADOS que somam. Se somassem, o ' +
            'caminho reto teria o mesmo comprimento do caminho em L.',
          passo: 0,
          conceito: 'semelhanca.pitagoras',
        },
        {
          resposta: Math.sqrt(Math.abs(b * b - c * c)),
          diagnostico:
            'Você subtraiu os quadrados. Isso serve para achar um CATETO quando a hipotenusa ' +
            'é conhecida — aqui os quadrados somam.',
          passo: 1,
          conceito: 'semelhanca.pitagoras',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? 'a² = b² + c²' : undefined,
  };
}

function exercicioCateto(nivel: Nivel, rng: Rng): Exercicio<number> {
  const [b, c, a] = rng.escolher(TERNOS);
  const conhecido = rng.escolher([b, c]);
  const { resultado, passos } = catetoComPassos(a, conhecido);

  return {
    id: `sem-cat-${a}-${conhecido}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um triângulo retângulo tem hipotenusa ${a} cm e um cateto ${conhecido} cm. ` +
      'Quanto mede o outro cateto, em cm?',
    enunciadoTex: `a = ${a} \\qquad b = ${conhecido}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['semelhanca.pitagoras'],
    armadilhas: semColisoes(
      [
        {
          resposta: Math.sqrt(a * a + conhecido * conhecido),
          diagnostico:
            'Aqui os quadrados se SUBTRAEM: a hipotenusa já é o maior lado, então o cateto ' +
            'que falta tem de ser menor que ela.',
          passo: 1,
          conceito: 'semelhanca.pitagoras',
        },
        {
          resposta: a - conhecido,
          diagnostico:
            'A subtração é entre os quadrados, não entre as medidas. Pitágoras relaciona ' +
            'áreas de quadrados, não comprimentos.',
          passo: 0,
          conceito: 'semelhanca.pitagoras',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? 'c² = a² − b²' : undefined,
  };
}

function exercicioTales(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.inteiro(2, 9);
  const b = rng.inteiro(2, 9);
  const c = rng.inteiro(2, 12);

  const { resultado, passos } = talesComPassos(a, b, c);

  return {
    id: `sem-tales-${a}-${b}-${c}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um feixe de paralelas corta duas transversais. Numa delas os segmentos medem ${a} cm ` +
      `e ${b} cm; na outra, o segmento correspondente ao primeiro mede ${c} cm. ` +
      'Quanto mede x, correspondente ao segundo, em cm?',
    enunciadoTex: `\\frac{${a}}{${b}} = \\frac{${c}}{x}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['semelhanca.tales', 'semelhanca.razao'],
    armadilhas: semColisoes(
      [
        {
          resposta: (a * c) / b,
          diagnostico:
            'A proporção foi montada de cabeça para baixo. Os segmentos correspondentes têm ' +
            'de ficar em posições correspondentes nas duas frações.',
          passo: 0,
          conceito: 'semelhanca.tales',
        },
        {
          resposta: c + (b - a),
          diagnostico:
            'Semelhança é proporção, não diferença constante: os segmentos são multiplicados ' +
            'pela razão, não somados a ela.',
          passo: 1,
          conceito: 'semelhanca.razao',
        },
      ],
      resultado,
      proximos,
    ),
  };
}

/** Dicas e diagnósticos são texto corrido: `k^2` chegaria cru à tela. */
const EXPOENTE: Readonly<Record<number, string>> = { 1: '', 2: '²', 3: '³' };

function exercicioEscala(dimensao: 2 | 3, nivel: Nivel, rng: Rng): Exercicio<number> {
  const k = rng.escolher([2, 3, 4, 5, 0.5]);
  const original = rng.inteiro(2, 30) * (dimensao === 3 ? 2 : 1);

  const fator = escalaComPassos(k, dimensao).resultado;
  const resultado = original * fator;

  const grandeza = dimensao === 2 ? 'área' : 'volume';
  const comoTexto = String(k).replace('.', ',');
  const unidade = dimensao === 2 ? 'cm²' : 'cm³';

  return {
    id: `sem-escala-${dimensao}-${k}-${original}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Uma figura tem ${grandeza} ${original} ${unidade}. Ampliando todos os comprimentos por ` +
      `${String(k).replace('.', ',')}, qual é a nova ${grandeza}?`,
    enunciadoTex: `k = ${String(k).replace('.', '{,}')} \\qquad ${dimensao === 2 ? 'A' : 'V'} = ${original}`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        ...escalaComPassos(k, dimensao).passos,
        {
          descricao: `Multiplicamos a ${grandeza} original por esse fator.`,
          tex: `${original} \\times ${Number(fator.toFixed(4))} = ${Number(resultado.toFixed(4))}`,
        },
      ],
    },
    conceitos: ['semelhanca.razao'],
    armadilhas: semColisoes(
      [
        {
          resposta: original * k,
          diagnostico:
            `A razão k multiplica COMPRIMENTOS. A ${grandeza} depende de ` +
            `${dimensao} dimensões, então o fator é k${EXPOENTE[dimensao]}.`,
          passo: 1,
          conceito: 'semelhanca.razao',
        },
        {
          resposta: original * k ** (dimensao === 2 ? 3 : 2),
          diagnostico:
            dimensao === 2
              ? 'k³ é o fator do VOLUME. Área tem duas dimensões: k².'
              : 'k² é o fator da ÁREA. Volume tem três dimensões: k³.',
          passo: 1,
          conceito: 'semelhanca.razao',
        },
      ],
      resultado,
      proximos,
    ),
    // A dica traz o número do enunciado: «escala com k²» não diz o que fazer
    // com o 4 que está escrito ali. O fator fica dito; o resultado, não.
    // A dica vem no PRIMEIRO nível em que a pergunta aparece: a área escalada
    // estreia no Médio e o volume no Difícil. Presa no Fácil, como estava, ela
    // nunca chegava à tela — `sortearPergunta` não gera escala no Fácil.
    dica:
      nivel === (dimensao === 2 ? 'medio' : 'dificil')
        ? `A ${grandeza} escala com k${EXPOENTE[dimensao]}, não com k. Aqui k = ${comoTexto}, ` +
          `então o fator é ${comoTexto}${EXPOENTE[dimensao]}.`
        : undefined,
  };
}
