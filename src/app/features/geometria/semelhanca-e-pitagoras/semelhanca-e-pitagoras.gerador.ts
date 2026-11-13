import {
  catetoComPassos,
  escalaComPassos,
  pitagorasComPassos,
  talesComPassos,
  ternosPitagoricos,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { enunciadoTrilingue } from '@core/treino/textos/texto-trilingue';
import {
  ALTURA,
  CATETO,
  DICA_ALTURA,
  DICA_CATETO,
  DICA_ESCALA_AREA,
  DICA_ESCALA_VOLUME,
  DICA_HIPOTENUSA,
  DICA_MAIOR_LADO,
  DICA_PROJECAO,
  DICA_SOMBRA,
  DICA_TALES,
  ESCALA_AREA,
  ESCALA_VOLUME,
  HIPOTENUSA,
  MAIOR_LADO,
  PROJECAO,
  SOMBRA,
  TALES,
} from '@features/geometria/semelhanca-e-pitagoras/semelhanca-e-pitagoras.textos';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.01;

type Pergunta =
  | 'hipotenusa'
  | 'cateto'
  | 'tales'
  | 'area-escalada'
  | 'volume-escalado'
  | 'ehRetangulo'
  | 'relacao-metrica'
  | 'sombra';

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
      case 'ehRetangulo':
        return exercicioEhRetangulo(nivel, rng);
      case 'relacao-metrica':
        return exercicioRelacaoMetrica(nivel, rng);
      case 'sombra':
        return exercicioSombra(nivel, rng);
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
      return rng.escolher<Pergunta>(['hipotenusa', 'cateto', 'sombra']);
    case 'medio':
      return rng.escolher<Pergunta>(['cateto', 'tales', 'area-escalada', 'ehRetangulo', 'sombra']);
    case 'dificil':
      return rng.escolher<Pergunta>([
        'tales',
        'area-escalada',
        'volume-escalado',
        'relacao-metrica',
      ]);
    // O volume escalado é o que mais engana: a razão vai ao cubo, não ao
    // quadrado, e é o erro clássico do tópico. A relação métrica entra junto
    // porque exige Pitágoras ANTES da relação, e não só a fórmula decorada.
    case 'extremo':
      return rng.escolher<Pergunta>(['volume-escalado', 'relacao-metrica']);
  }
}

function exercicioHipotenusa(nivel: Nivel, rng: Rng): Exercicio<number> {
  const [b, c] = rng.escolher(TERNOS);
  const { resultado, passos } = pitagorasComPassos(b, c);
  const texto = enunciadoTrilingue(HIPOTENUSA, [b, c], DICA_HIPOTENUSA);

  return {
    id: `sem-hip-${b}-${c}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
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
    dica: nivel === 'facil' ? texto.dica : undefined,
  };
}

function exercicioCateto(nivel: Nivel, rng: Rng): Exercicio<number> {
  const [b, c, a] = rng.escolher(TERNOS);
  const conhecido = rng.escolher([b, c]);
  const { resultado, passos } = catetoComPassos(a, conhecido);
  const texto = enunciadoTrilingue(CATETO, [a, conhecido], DICA_CATETO);

  return {
    id: `sem-cat-${a}-${conhecido}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
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
    dica: nivel === 'facil' ? texto.dica : undefined,
  };
}

function exercicioTales(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.inteiro(2, 9);
  const b = rng.inteiro(2, 9);
  const c = rng.inteiro(2, 12);

  const { resultado, passos } = talesComPassos(a, b, c);
  const texto = enunciadoTrilingue(TALES, [a, b, c], DICA_TALES);

  return {
    id: `sem-tales-${a}-${b}-${c}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
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
    dica: nivel === 'medio' ? texto.dica : undefined,
  };
}

/** Dicas e diagnósticos são texto corrido: `k^2` chegaria cru à tela. */
const EXPOENTE: Readonly<Record<number, string>> = { 1: '', 2: '²', 3: '³' };

function exercicioEscala(dimensao: 2 | 3, nivel: Nivel, rng: Rng): Exercicio<number> {
  const k = rng.escolher([2, 3, 4, 5, 0.5]);
  const original = rng.inteiro(2, 30) * (dimensao === 3 ? 2 : 1);

  const fator = escalaComPassos(k, dimensao).resultado;
  const resultado = original * fator;

  const comoTexto = String(k).replace('.', ',');
  /*
   * Com artigo, e não só o substantivo.
   *
   * O texto antigo montava «a nova ${grandeza}» e saía «a nova volume» — erro
   * de concordância que aparecia em metade dos exercícios desta pergunta.
   * Guardar o artigo junto do nome resolve de uma vez, aqui e na resolução.
   */
  const aGrandeza = dimensao === 2 ? 'a área' : 'o volume';
  const AGrandeza = dimensao === 2 ? 'A área' : 'O volume';
  const texto =
    dimensao === 2
      ? enunciadoTrilingue(ESCALA_AREA, [original, comoTexto], DICA_ESCALA_AREA)
      : enunciadoTrilingue(ESCALA_VOLUME, [original, comoTexto], DICA_ESCALA_VOLUME);

  return {
    id: `sem-escala-${dimensao}-${k}-${original}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: `k = ${String(k).replace('.', '{,}')} \\qquad ${dimensao === 2 ? 'A' : 'V'} = ${original}`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        ...escalaComPassos(k, dimensao).passos,
        {
          descricao: `Multiplicamos ${aGrandeza} original por esse fator.`,
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
            `A razão k multiplica COMPRIMENTOS. ${AGrandeza} depende de ` +
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
    dica: nivel === (dimensao === 2 ? 'medio' : 'dificil') ? texto.dica : undefined,
  };
}

/**
 * A recíproca de Pitágoras: três medidas dizem se o triângulo é retângulo.
 *
 * A resposta é o quadrado do maior lado, para continuar sendo um número — e
 * porque é justamente essa conta que decide. A comparação com a soma dos
 * outros dois quadrados vem na resolução.
 */
function exercicioEhRetangulo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const retangulo = rng.escolher([true, false]);
  const [b, c, a] = rng.escolher(TERNOS);
  // Quando não é retângulo, um cateto muda e o triângulo continua existindo.
  const maior = retangulo ? a : a + rng.inteiro(1, 3);

  const soma = b * b + c * c;
  const resultado = maior * maior;
  const texto = enunciadoTrilingue(MAIOR_LADO, [b, c, maior], DICA_MAIOR_LADO);

  return {
    id: `sem-retang-${b}-${c}-${maior}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: `a = ${maior} \\qquad b = ${b} \\qquad c = ${c}`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'Pela recíproca de Pitágoras, o triângulo é retângulo quando a² = b² + c².',
          tex: 'a^{2} \\;\\text{contra}\\; b^{2} + c^{2}',
        },
        {
          descricao: 'Elevamos o maior lado ao quadrado.',
          tex: `${maior}^{2} = ${resultado}`,
        },
        {
          descricao: 'E somamos os quadrados dos outros dois.',
          tex: `${b}^{2} + ${c}^{2} = ${b * b} + ${c * c} = ${soma}`,
        },
        {
          descricao: retangulo
            ? 'Os dois valores coincidem: o triângulo É retângulo.'
            : 'O quadrado do maior é MAIOR que a soma: o triângulo é obtusângulo.',
          tex: `${resultado} ${retangulo ? '=' : '>'} ${soma}`,
          nota: retangulo
            ? 'O ângulo oposto ao maior lado é reto.'
            : 'Quanto maior a diferença, mais aberto é o ângulo oposto ao maior lado.',
        },
      ],
    },
    conceitos: ['semelhanca.pitagoras'],
    armadilhas: semColisoes(
      [
        {
          resposta: soma,
          diagnostico:
            'Essa é a soma dos quadrados dos outros dois lados. A pergunta é pelo quadrado ' +
            'do MAIOR lado — são as duas pontas da comparação.',
          passo: 2,
          conceito: 'semelhanca.pitagoras',
        },
        {
          resposta: maior * 2,
          diagnostico: 'Elevar ao quadrado é multiplicar o número por ele mesmo, não por 2.',
          passo: 1,
          conceito: 'semelhanca.pitagoras',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'medio' ? texto.dica : undefined,
  };
}

/**
 * Relações métricas no triângulo retângulo: a altura sobre a hipotenusa.
 *
 * `h² = m · n` é o que sai da semelhança entre os dois triângulos em que a
 * altura reparte o original — e é o passo que falta entre Pitágoras e a
 * trigonometria.
 */
function exercicioRelacaoMetrica(nivel: Nivel, rng: Rng): Exercicio<number> {
  const [b, c, a] = rng.escolher(TERNOS);

  // Projeções dos catetos sobre a hipotenusa: m = c²/a e n = b²/a.
  const m = (c * c) / a;
  const n = (b * b) / a;
  const altura = (b * c) / a;

  const pedeAltura = rng.escolher([true, false]);
  const resultado = pedeAltura ? altura : m;
  const texto = pedeAltura
    ? enunciadoTrilingue(ALTURA, [b, c], DICA_ALTURA)
    : enunciadoTrilingue(PROJECAO, [b, c], DICA_PROJECAO);

  return {
    id: `sem-metrica-${b}-${c}-${pedeAltura ? 'h' : 'm'}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: `b = ${b} \\qquad c = ${c}`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'Primeiro a hipotenusa, por Pitágoras.',
          tex: `a = \\sqrt{${b}^{2} + ${c}^{2}} = \\sqrt{${b * b + c * c}} = ${a}`,
        },
        {
          descricao: 'A altura reparte o triângulo em dois semelhantes ao original.',
          tex: 'a \\cdot h = b \\cdot c \\qquad c^{2} = a \\cdot m',
          nota: 'Cada cateto é média geométrica entre a hipotenusa e a sua projeção.',
        },
        pedeAltura
          ? {
              descricao: 'Da igualdade das áreas sai a altura.',
              tex: `h = \\frac{${b} \\cdot ${c}}{${a}} = ${Number(altura.toFixed(4))}`,
            }
          : {
              descricao: 'E a projeção sai da relação do cateto.',
              tex: `m = \\frac{${c}^{2}}{${a}} = \\frac{${c * c}}{${a}} = ${Number(m.toFixed(4))}`,
            },
      ],
    },
    conceitos: ['semelhanca.pitagoras', 'semelhanca.razao'],
    armadilhas: semColisoes(
      [
        {
          resposta: pedeAltura ? m : altura,
          diagnostico: pedeAltura
            ? 'Essa é a PROJEÇÃO de um cateto sobre a hipotenusa, não a altura.'
            : 'Essa é a ALTURA relativa à hipotenusa, não a projeção do cateto.',
          passo: 2,
          conceito: 'semelhanca.pitagoras',
        },
        {
          resposta: pedeAltura ? n : n,
          diagnostico: 'Essa é a projeção do OUTRO cateto. Cada projeção usa o seu próprio.',
          passo: 2,
          conceito: 'semelhanca.pitagoras',
        },
        {
          resposta: a,
          diagnostico: 'Essa é a hipotenusa inteira, um passo intermediário da conta.',
          passo: 0,
          conceito: 'semelhanca.pitagoras',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'dificil' ? texto.dica : undefined,
  };
}

/** Semelhança aplicada: a sombra, que é como se mede o que não se alcança. */
function exercicioSombra(nivel: Nivel, rng: Rng): Exercicio<number> {
  const alturaVara = rng.inteiro(1, 3);
  /*
   * A sombra da vara nunca é igual à altura dela.
   *
   * Com as duas iguais, a razão vira 1 e o exercício deixa de exercitar: a
   * altura do prédio é a própria sombra, e a dica passa a dizer «2 para 2», que
   * não ensina nada. O Sol a 45° é um caso particular bonito — e o pior
   * possível para treinar proporção.
   */
  const sombraVara = rng.escolher([1, 2, 3, 4].filter((medida) => medida !== alturaVara));
  const sombraPredio = sombraVara * rng.inteiro(4, 25);

  const resultado = (alturaVara * sombraPredio) / sombraVara;
  const texto = enunciadoTrilingue(SOMBRA, [alturaVara, sombraVara, sombraPredio], DICA_SOMBRA);

  return {
    id: `sem-sombra-${alturaVara}-${sombraVara}-${sombraPredio}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: `\\frac{${alturaVara}}{${sombraVara}} = \\frac{h}{${sombraPredio}}`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'Os raios de sol chegam paralelos, então os dois triângulos são semelhantes.',
          tex: '\\frac{\\text{altura}}{\\text{sombra}} = \\text{constante}',
          nota: 'É o mesmo ângulo do sol nos dois lugares, no mesmo instante.',
        },
        {
          descricao: 'Montamos a proporção com os valores dados.',
          tex: `\\frac{${alturaVara}}{${sombraVara}} = \\frac{h}{${sombraPredio}}`,
        },
        {
          descricao: 'Multiplicamos em cruz e isolamos a altura.',
          tex:
            `h = \\frac{${alturaVara} \\cdot ${sombraPredio}}{${sombraVara}} = ` +
            `\\frac{${alturaVara * sombraPredio}}{${sombraVara}} = ${Number(resultado.toFixed(4))}`,
        },
      ],
    },
    conceitos: ['semelhanca.razao', 'semelhanca.tales'],
    armadilhas: semColisoes(
      [
        {
          resposta: (sombraVara * sombraPredio) / alturaVara,
          diagnostico:
            'A proporção ficou de cabeça para baixo. Altura está para sombra assim como ' +
            'altura está para sombra — não troque os papéis entre as duas figuras.',
          passo: 1,
          conceito: 'semelhanca.razao',
        },
        {
          resposta: sombraPredio,
          diagnostico:
            'Essa é a SOMBRA do prédio. A altura só coincidiria com ela se a vara também ' +
            'tivesse altura igual à sua sombra.',
          passo: 2,
          conceito: 'semelhanca.razao',
        },
        {
          resposta: alturaVara * sombraPredio,
          diagnostico: 'Faltou dividir pela sombra da vara: a razão é altura/sombra.',
          passo: 2,
          conceito: 'semelhanca.razao',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? texto.dica : undefined,
  };
}
