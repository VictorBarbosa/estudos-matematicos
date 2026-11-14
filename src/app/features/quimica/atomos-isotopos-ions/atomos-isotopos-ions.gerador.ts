import { contarParticulasComPassos, massaAtomicaMediaComPassos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';
import { enunciadoTrilingue } from '@core/treino/textos/texto-trilingue';
import {
  DICA_ELETRONS,
  DICA_MASSA_MEDIA,
  DICA_NUMERO_DE_MASSA,
  DICA_PARTICULAS,
  ELETRONS_DO_ION,
  MASSA_MEDIA,
  NUMERO_DE_MASSA,
  PARTICULAS,
} from '@features/quimica/atomos-isotopos-ions/atomos-isotopos-ions.textos';

const { saoEquivalentes: proximos, formatar } = numeroComCasas(2, 1e-6);

/**
 * Elementos com os números que a tabela periódica traz.
 *
 * Lista fechada, e não Z sorteado ao acaso, por dois motivos. O enunciado cita
 * o símbolo, e «um átomo de Xx com Z = 53» não existe; e a faixa de nêutrons
 * plausível muda com o elemento — um Z pequeno com A grande seria um isótopo
 * que ninguém observou. Aqui cada entrada traz a faixa real.
 */
interface Elemento {
  readonly simbolo: string;
  readonly z: number;
  /** Números de massa observados, dos quais o sorteio escolhe. */
  readonly massas: readonly number[];
  /** Cargas que este elemento de fato forma, quando forma. */
  readonly cargas: readonly number[];
}

const ELEMENTOS: readonly Elemento[] = [
  { simbolo: 'H', z: 1, massas: [1, 2, 3], cargas: [1, -1] },
  { simbolo: 'C', z: 6, massas: [12, 13, 14], cargas: [] },
  { simbolo: 'N', z: 7, massas: [14, 15], cargas: [-3] },
  { simbolo: 'O', z: 8, massas: [16, 17, 18], cargas: [-2] },
  { simbolo: 'F', z: 9, massas: [19], cargas: [-1] },
  { simbolo: 'Na', z: 11, massas: [23], cargas: [1] },
  { simbolo: 'Mg', z: 12, massas: [24, 25, 26], cargas: [2] },
  { simbolo: 'Al', z: 13, massas: [27], cargas: [3] },
  { simbolo: 'Si', z: 14, massas: [28, 29, 30], cargas: [] },
  { simbolo: 'P', z: 15, massas: [31], cargas: [-3] },
  { simbolo: 'S', z: 16, massas: [32, 33, 34], cargas: [-2] },
  { simbolo: 'Cl', z: 17, massas: [35, 37], cargas: [-1] },
  { simbolo: 'K', z: 19, massas: [39, 40, 41], cargas: [1] },
  { simbolo: 'Ca', z: 20, massas: [40, 42, 44], cargas: [2] },
  { simbolo: 'Ti', z: 22, massas: [46, 47, 48], cargas: [4] },
  { simbolo: 'Cr', z: 24, massas: [52, 53], cargas: [3] },
  { simbolo: 'Fe', z: 26, massas: [54, 56, 57], cargas: [2, 3] },
  { simbolo: 'Ni', z: 28, massas: [58, 60], cargas: [2] },
  { simbolo: 'Cu', z: 29, massas: [63, 65], cargas: [2] },
  { simbolo: 'Zn', z: 30, massas: [64, 66, 68], cargas: [2] },
  { simbolo: 'Ag', z: 47, massas: [107, 109], cargas: [1] },
  { simbolo: 'Sn', z: 50, massas: [118, 120], cargas: [2, 4] },
  { simbolo: 'Pb', z: 82, massas: [206, 207, 208], cargas: [2] },
];

const COM_CARGA = ELEMENTOS.filter((elemento) => elemento.cargas.length > 0);

type Pergunta = 'neutrons' | 'eletrons' | 'massa' | 'media';

/*
 * A dica acompanha TODOS os níveis, inclusive o Extremo.
 *
 * Não é descuido: o símbolo do elemento entra no enunciado, e o guarda de
 * dicas de estreia conta cada símbolo como uma forma de pergunta própria. Como
 * o sorteio escolhe o elemento, uma forma pode estrear em qualquer nível — e
 * «toda forma tem dica no nível em que estreia» é regra absoluta do projeto.
 * Suprimir a dica no Extremo deixaria dezenas de formas estreando mudas.
 */

/**
 * Átomos, isótopos e íons — o primeiro tópico de Química.
 *
 * Abre a área porque tudo o que vem depois conta partículas: o mol conta
 * átomos, a estequiometria conta átomos que se recombinam, e a massa molar
 * sai da massa atômica média que este tópico calcula.
 *
 * As quatro perguntas são as quatro contas que o resto da química usa sem
 * avisar. A que mais engana é a do íon: «carga positiva» soa como «tem mais
 * alguma coisa», e quer dizer o contrário — falta elétron.
 */
export const geradorAtomos: GeradorExercicio<number> = {
  topicoId: 'atomos-isotopos-ions',
  formatoResposta: 'um número inteiro, ex.: 18',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'eletrons':
        return exercicioEletrons(nivel, rng);
      case 'massa':
        return exercicioNumeroDeMassa(nivel, rng);
      case 'media':
        return exercicioMassaMedia(nivel, rng);
      default:
        return exercicioNeutrons(nivel, rng);
    }
  },

  analisar: analisarNumero,

  saoEquivalentes: proximos,
  formatar,
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['neutrons', 'massa']);
    case 'medio':
      return rng.escolher<Pergunta>(['neutrons', 'massa', 'eletrons']);
    case 'dificil':
      return rng.escolher<Pergunta>(['eletrons', 'media', 'neutrons']);
    // A média ponderada é a única que não se resolve contando: ela exige
    // perceber que abundância é peso, e que o resultado não é inteiro.
    case 'extremo':
      return rng.escolher<Pergunta>(['media', 'eletrons']);
  }
}

function exercicioNeutrons(nivel: Nivel, rng: Rng): Exercicio<number> {
  const elemento = rng.escolher(ELEMENTOS);
  const a = rng.escolher(elemento.massas);
  const { resultado, passos } = contarParticulasComPassos({ z: elemento.z, a, carga: 0 });
  const texto = enunciadoTrilingue(PARTICULAS, [elemento.simbolo, elemento.z, a], DICA_PARTICULAS);

  return {
    id: `quim-neutrons-${elemento.simbolo}-${a}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: `Z = ${elemento.z} \\qquad A = ${a}`,
    gabarito: resultado.neutrons,
    resolucao: { resultado: resultado.neutrons, passos },
    conceitos: ['atomo.particulas', 'atomo.isotopos'],
    armadilhas: semColisoes(
      [
        {
          resposta: a,
          diagnostico:
            'Esse é o número de MASSA, que conta prótons e nêutrons juntos. Os nêutrons são ' +
            'o que sobra quando se tiram os prótons.',
          passo: 1,
          conceito: 'atomo.particulas',
        },
        {
          resposta: elemento.z,
          diagnostico:
            'Esse é o número de prótons. Num átomo neutro ele é igual ao de elétrons — mas ' +
            'não ao de nêutrons, que só coincide em alguns elementos leves.',
          passo: 0,
          conceito: 'atomo.particulas',
        },
        {
          resposta: a + elemento.z,
          diagnostico: 'Você somou em vez de subtrair. A = Z + n, então n = A − Z.',
          passo: 1,
          conceito: 'atomo.particulas',
        },
      ],
      resultado.neutrons,
      proximos,
    ),
    dica: texto.dica,
  };
}

function exercicioEletrons(nivel: Nivel, rng: Rng): Exercicio<number> {
  const elemento = rng.escolher(COM_CARGA);
  const carga = rng.escolher(elemento.cargas);
  const a = rng.escolher(elemento.massas);
  const { resultado, passos } = contarParticulasComPassos({ z: elemento.z, a, carga });
  const texto = enunciadoTrilingue(
    ELETRONS_DO_ION,
    [elemento.simbolo, elemento.z, carga],
    DICA_ELETRONS,
  );

  const cargaTex = carga > 0 ? `${carga}+` : `${-carga}-`;

  return {
    id: `quim-eletrons-${elemento.simbolo}-${carga}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: `Z = ${elemento.z} \\qquad \\text{carga} = ${cargaTex}`,
    gabarito: resultado.eletrons,
    resolucao: { resultado: resultado.eletrons, passos },
    conceitos: ['atomo.ions', 'atomo.particulas'],
    armadilhas: semColisoes(
      [
        {
          // O erro central: somar onde se devia subtrair, e vice-versa.
          resposta: elemento.z + carga,
          diagnostico:
            carga > 0
              ? 'Você somou a carga. Carga positiva é elétron que FALTA: ela entra subtraindo.'
              : 'Você subtraiu a carga. Carga negativa é elétron a MAIS: ela entra somando.',
          passo: 2,
          conceito: 'atomo.ions',
        },
        {
          resposta: elemento.z,
          diagnostico:
            'Esse é o número de prótons, que é o de elétrons apenas no átomo NEUTRO. Aqui há ' +
            'carga, e é justamente o desequilíbrio entre os dois que a produz.',
          passo: 2,
          conceito: 'atomo.ions',
        },
      ],
      resultado.eletrons,
      proximos,
    ),
    dica: texto.dica,
  };
}

function exercicioNumeroDeMassa(nivel: Nivel, rng: Rng): Exercicio<number> {
  const elemento = rng.escolher(ELEMENTOS);
  const a = rng.escolher(elemento.massas);
  const neutrons = a - elemento.z;
  const { passos } = contarParticulasComPassos({ z: elemento.z, a, carga: 0 });
  const texto = enunciadoTrilingue(
    NUMERO_DE_MASSA,
    [elemento.simbolo, elemento.z, neutrons],
    DICA_NUMERO_DE_MASSA,
  );

  return {
    id: `quim-massa-${elemento.simbolo}-${a}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: `p = ${elemento.z} \\qquad n = ${neutrons}`,
    gabarito: a,
    resolucao: {
      resultado: a,
      passos: [
        {
          descricao: 'O número de massa soma prótons e nêutrons.',
          tex: `A = p + n = ${elemento.z} + ${neutrons} = ${a}`,
          nota: 'O elétron fica de fora: a massa dele é pequena demais para contar aqui.',
        },
        ...passos.slice(1, 2),
      ],
    },
    conceitos: ['atomo.particulas'],
    armadilhas: semColisoes(
      [
        {
          resposta: neutrons,
          diagnostico: 'Esse é só o número de nêutrons. Falta somar os prótons.',
          passo: 0,
          conceito: 'atomo.particulas',
        },
        {
          resposta: elemento.z * 2,
          diagnostico:
            'Você supôs que há tantos nêutrons quanto prótons. Isso vale em alguns elementos ' +
            'leves e falha no resto — o enunciado dá o número de nêutrons.',
          passo: 0,
          conceito: 'atomo.particulas',
        },
      ],
      a,
      proximos,
    ),
    dica: texto.dica,
  };
}

function exercicioMassaMedia(nivel: Nivel, rng: Rng): Exercicio<number> {
  // Dois isótopos com massas próximas das reais, e abundâncias que somam 100.
  const elemento = rng.escolher(ELEMENTOS.filter((e) => e.massas.length >= 2));
  const [m1, m2] = [elemento.massas[0]!, elemento.massas[1]!];
  const p1 = rng.inteiro(10, 90);
  const p2 = 100 - p1;

  const isotopos = [
    { massa: m1, abundancia: p1 },
    { massa: m2, abundancia: p2 },
  ];
  const { resultado, passos } = massaAtomicaMediaComPassos(isotopos);
  const texto = enunciadoTrilingue(
    MASSA_MEDIA,
    [elemento.simbolo, m1, p1, m2, p2],
    DICA_MASSA_MEDIA,
  );

  return {
    id: `quim-media-${elemento.simbolo}-${p1}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: `${m1} \\;(${p1}\\%) \\qquad ${m2} \\;(${p2}\\%)`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['atomo.isotopos', 'atomo.massa-media'],
    armadilhas: semColisoes(
      [
        {
          // A média simples: o erro que o tópico existe para desfazer.
          resposta: (m1 + m2) / 2,
          diagnostico:
            'Essa é a média SIMPLES, que trataria os dois isótopos como igualmente comuns. ' +
            'A abundância é peso: o isótopo mais frequente puxa o resultado para si.',
          passo: 0,
          conceito: 'atomo.massa-media',
        },
        {
          resposta: m1 * p1 + m2 * p2,
          diagnostico:
            'Faltou dividir as porcentagens por 100. Abundância de 75% entra como 0,75, e não ' +
            'como 75 — senão o resultado fica cem vezes maior.',
          passo: 1,
          conceito: 'atomo.massa-media',
        },
        {
          resposta: p1 > p2 ? m1 : m2,
          diagnostico:
            'Essa é a massa do isótopo mais abundante. A média fica PERTO dela, mas não nela: ' +
            'o outro isótopo também pesa.',
          passo: 2,
          conceito: 'atomo.massa-media',
        },
      ],
      resultado,
      proximos,
    ),
    dica: texto.dica,
  };
}
