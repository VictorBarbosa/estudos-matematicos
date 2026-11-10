import { Idioma } from '@core/i18n/models/i18n.model';
import { Passo, regraDeTresComPassos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import {
  Armadilha,
  Exercicio,
  GeradorExercicio,
  Nivel,
  SEM_FORMULA,
  nivelAoMenos,
  semColisoes,
} from '@core/treino/models/treino.model';

const { saoEquivalentes: proximos } = numeroComCasas(2, 1e-4);

/** Uma frase com os três números do exercício, em cada língua. */
type Molde = (a: number, b: number, c: number) => string;
type Frases = Readonly<Record<Idioma, Molde>>;

/**
 * Um contexto concreto.
 *
 * O texto é escrito três vezes de propósito: cada língua monta a frase à sua
 * maneira («Combien coûtent 3 kg ?» não sai de concatenar pedaços do
 * português). O molde recebe os números na ordem em que o exercício os usa:
 * `a` e `b` formam o par conhecido, `c` é o valor cuja resposta se procura.
 */
interface Contexto {
  readonly frases: Frases;
}

// ─────────────────────────────────────────────────────────────────────────────
// Proporcionalidade direta: as duas grandezas crescem juntas.
// ─────────────────────────────────────────────────────────────────────────────

const CONTEXTOS_DIRETOS: readonly Contexto[] = [
  {
    frases: {
      pt: (a, b, c) => `${a} kg de farinha custam R$ ${b}. Quanto custam ${c} kg?`,
      fr: (a, b, c) => `${a} kg de farine coûtent ${b} $. Combien coûtent ${c} kg ?`,
      en: (a, b, c) => `${a} kg of flour cost $${b}. How much do ${c} kg cost?`,
    },
  },
  {
    frases: {
      pt: (a, b, c) =>
        `Um carro percorre ${b} km com ${a} litros de combustível. Quantos quilômetros percorre com ${c} litros?`,
      fr: (a, b, c) =>
        `Une voiture parcourt ${b} km avec ${a} litres de carburant. Combien de kilomètres parcourt-elle avec ${c} litres ?`,
      en: (a, b, c) =>
        `A car travels ${b} km on ${a} litres of fuel. How many kilometres does it travel on ${c} litres?`,
    },
  },
  {
    frases: {
      pt: (a, b, c) =>
        `Uma receita para ${a} pessoas pede ${b} g de açúcar. Quantos gramas são necessários para ${c} pessoas?`,
      fr: (a, b, c) =>
        `Une recette pour ${a} personnes demande ${b} g de sucre. Combien de grammes faut-il pour ${c} personnes ?`,
      en: (a, b, c) =>
        `A recipe for ${a} people calls for ${b} g of sugar. How many grams are needed for ${c} people?`,
    },
  },
  {
    frases: {
      pt: (a, b, c) =>
        `Num mapa, ${a} cm representam ${b} km. Quantos quilômetros representam ${c} cm?`,
      fr: (a, b, c) =>
        `Sur une carte, ${a} cm représentent ${b} km. Combien de kilomètres représentent ${c} cm ?`,
      en: (a, b, c) =>
        `On a map, ${a} cm represent ${b} km. How many kilometres do ${c} cm represent?`,
    },
  },
  {
    frases: {
      pt: (a, b, c) =>
        `${a} latas de tinta cobrem ${b} m² de parede. Quantos metros quadrados cobrem ${c} latas?`,
      fr: (a, b, c) =>
        `${a} pots de peinture couvrent ${b} m² de mur. Combien de mètres carrés couvrent ${c} pots ?`,
      en: (a, b, c) =>
        `${a} cans of paint cover ${b} m² of wall. How many square metres do ${c} cans cover?`,
    },
  },
  {
    frases: {
      pt: (a, b, c) =>
        `Uma impressora imprime ${b} páginas em ${a} minutos. Quantas páginas imprime em ${c} minutos?`,
      fr: (a, b, c) =>
        `Une imprimante imprime ${b} pages en ${a} minutes. Combien de pages imprime-t-elle en ${c} minutes ?`,
      en: (a, b, c) =>
        `A printer prints ${b} pages in ${a} minutes. How many pages does it print in ${c} minutes?`,
    },
  },
  {
    frases: {
      pt: (a, b, c) => `${a} metros de tecido custam R$ ${b}. Quanto custam ${c} metros?`,
      fr: (a, b, c) => `${a} mètres de tissu coûtent ${b} $. Combien coûtent ${c} mètres ?`,
      en: (a, b, c) => `${a} metres of fabric cost $${b}. How much do ${c} metres cost?`,
    },
  },
  {
    frases: {
      pt: (a, b, c) =>
        `Um trabalhador recebe R$ ${b} por ${a} dias de trabalho. Quanto recebe por ${c} dias, no mesmo contrato?`,
      fr: (a, b, c) =>
        `Un travailleur reçoit ${b} $ pour ${a} jours de travail. Combien reçoit-il pour ${c} jours, au même contrat ?`,
      en: (a, b, c) =>
        `A worker earns $${b} for ${a} days of work. How much does he earn for ${c} days under the same contract?`,
    },
  },
  {
    frases: {
      pt: (a, b, c) =>
        `${a} kg de sementes produzem ${b} kg de grãos. Quantos quilos de grãos produzem ${c} kg de sementes?`,
      fr: (a, b, c) =>
        `${a} kg de semences produisent ${b} kg de grains. Combien de kilos de grains produisent ${c} kg de semences ?`,
      en: (a, b, c) =>
        `${a} kg of seeds yield ${b} kg of grain. How many kilograms of grain do ${c} kg of seeds yield?`,
    },
  },
  {
    frases: {
      pt: (a, b, c) =>
        `Uma estante com ${a} prateleiras guarda ${b} livros. Quantos livros cabem em ${c} prateleiras iguais?`,
      fr: (a, b, c) =>
        `Une étagère de ${a} tablettes contient ${b} livres. Combien de livres tiennent sur ${c} tablettes identiques ?`,
      en: (a, b, c) =>
        `A shelf with ${a} boards holds ${b} books. How many books fit on ${c} identical boards?`,
    },
  },
  {
    frases: {
      pt: (a, b, c) =>
        `Caminhando sempre no mesmo ritmo, ${a} horas cobrem ${b} km. Quantos quilômetros são cobertos em ${c} horas?`,
      fr: (a, b, c) =>
        `En marchant toujours au même rythme, ${a} heures couvrent ${b} km. Combien de kilomètres sont couverts en ${c} heures ?`,
      en: (a, b, c) =>
        `Walking at a steady pace, ${a} hours cover ${b} km. How many kilometres are covered in ${c} hours?`,
    },
  },
  {
    frases: {
      pt: (a, b, c) => `Um xarope dá ${b} gotas para ${a} kg de peso. Quantas gotas para ${c} kg?`,
      fr: (a, b, c) =>
        `Un sirop donne ${b} gouttes pour ${a} kg de poids. Combien de gouttes pour ${c} kg ?`,
      en: (a, b, c) =>
        `A syrup gives ${b} drops per ${a} kg of body weight. How many drops for ${c} kg?`,
    },
  },
  {
    frases: {
      pt: (a, b, c) => `${a} resmas de papel têm ${b} folhas. Quantas folhas têm ${c} resmas?`,
      fr: (a, b, c) =>
        `${a} rames de papier contiennent ${b} feuilles. Combien de feuilles contiennent ${c} rames ?`,
      en: (a, b, c) =>
        `${a} reams of paper contain ${b} sheets. How many sheets do ${c} reams contain?`,
    },
  },
  {
    frases: {
      pt: (a, b, c) =>
        `Uma bomba tira ${b} litros de água em ${a} minutos. Quantos litros tira em ${c} minutos?`,
      fr: (a, b, c) =>
        `Une pompe tire ${b} litres d'eau en ${a} minutes. Combien de litres tire-t-elle en ${c} minutes ?`,
      en: (a, b, c) =>
        `A pump draws ${b} litres of water in ${a} minutes. How many litres does it draw in ${c} minutes?`,
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Proporcionalidade inversa: uma cresce, a outra diminui.
// ─────────────────────────────────────────────────────────────────────────────

const CONTEXTOS_INVERSOS: readonly Contexto[] = [
  {
    frases: {
      pt: (a, b, c) =>
        `${a} operários fazem uma obra em ${b} dias. Em quantos dias ${c} operários fazem a mesma obra, no mesmo ritmo?`,
      fr: (a, b, c) =>
        `${a} ouvriers font un ouvrage en ${b} jours. En combien de jours ${c} ouvriers font-ils le même ouvrage, au même rythme ?`,
      en: (a, b, c) =>
        `${a} workers do a job in ${b} days. In how many days do ${c} workers do the same job at the same pace?`,
    },
  },
  {
    frases: {
      pt: (a, b, c) =>
        `${a} torneiras enchem um tanque em ${b} minutos. Em quantos minutos ${c} torneiras iguais enchem o mesmo tanque?`,
      fr: (a, b, c) =>
        `${a} robinets remplissent un réservoir en ${b} minutes. En combien de minutes ${c} robinets identiques remplissent-ils le même réservoir ?`,
      en: (a, b, c) =>
        `${a} taps fill a tank in ${b} minutes. In how many minutes do ${c} identical taps fill the same tank?`,
    },
  },
  {
    frases: {
      pt: (a, b, c) =>
        `Viajando a ${a} km/h, leva-se ${b} horas. Quantas horas leva a ${c} km/h, no mesmo trajeto?`,
      fr: (a, b, c) =>
        `En roulant à ${a} km/h, on met ${b} heures. Combien d'heures met-on à ${c} km/h, sur le même trajet ?`,
      en: (a, b, c) =>
        `Travelling at ${a} km/h takes ${b} hours. How many hours does ${c} km/h take on the same route?`,
    },
  },
  {
    frases: {
      pt: (a, b, c) =>
        `${a} bombas esvaziam um reservatório em ${b} horas. Em quantas horas ${c} bombas iguais o esvaziam?`,
      fr: (a, b, c) =>
        `${a} pompes vident un réservoir en ${b} heures. En combien d'heures ${c} pompes identiques le vident-elles ?`,
      en: (a, b, c) =>
        `${a} pumps empty a reservoir in ${b} hours. In how many hours do ${c} identical pumps empty it?`,
    },
  },
  {
    frases: {
      pt: (a, b, c) =>
        `${a} máquinas produzem um lote em ${b} horas. Em quantas horas ${c} máquinas iguais produzem o mesmo lote?`,
      fr: (a, b, c) =>
        `${a} machines produisent un lot en ${b} heures. En combien d'heures ${c} machines identiques produisent-elles le même lot ?`,
      en: (a, b, c) =>
        `${a} machines produce a batch in ${b} hours. In how many hours do ${c} identical machines produce the same batch?`,
    },
  },
  {
    frases: {
      pt: (a, b, c) =>
        `Uma engrenagem de ${a} dentes dá ${b} voltas para mover outra. Quantas voltas dá a de ${c} dentes?`,
      fr: (a, b, c) =>
        `Un engrenage de ${a} dents fait ${b} tours pour en entraîner un autre. Combien de tours fait celui de ${c} dents ?`,
      en: (a, b, c) =>
        `A gear with ${a} teeth turns ${b} times to drive another. How many turns does the one with ${c} teeth make?`,
    },
  },
  {
    frases: {
      pt: (a, b, c) =>
        `${a} vacas consomem a ração de um celeiro em ${b} dias. Em quantos dias ${c} vacas consomem a mesma ração?`,
      fr: (a, b, c) =>
        `${a} vaches consomment le fourrage d'une grange en ${b} jours. En combien de jours ${c} vaches consomment-elles le même fourrage ?`,
      en: (a, b, c) =>
        `${a} cows eat a barn's feed in ${b} days. In how many days do ${c} cows eat the same feed?`,
    },
  },
  {
    frases: {
      pt: (a, b, c) =>
        `${a} digitadores terminam um trabalho em ${b} horas. Em quantas horas ${c} digitadores, no mesmo ritmo, terminam o mesmo trabalho?`,
      fr: (a, b, c) =>
        `${a} dactylos terminent un travail en ${b} heures. En combien d'heures ${c} dactylos, au même rythme, terminent-ils le même travail ?`,
      en: (a, b, c) =>
        `${a} typists finish a job in ${b} hours. In how many hours do ${c} typists, at the same pace, finish the same job?`,
    },
  },
  {
    frases: {
      pt: (a, b, c) =>
        `Baixar um arquivo a ${a} MB/s leva ${b} segundos. Quantos segundos leva a ${c} MB/s?`,
      fr: (a, b, c) =>
        `Télécharger un fichier à ${a} Mo/s prend ${b} secondes. Combien de secondes prend-il à ${c} Mo/s ?`,
      en: (a, b, c) =>
        `Downloading a file at ${a} MB/s takes ${b} seconds. How many seconds does ${c} MB/s take?`,
    },
  },
  {
    frases: {
      pt: (a, b, c) =>
        `Uma torneira de ${a} litros por minuto enche um tanque em ${b} minutos. Em quantos minutos uma de ${c} litros por minuto o enche?`,
      fr: (a, b, c) =>
        `Un robinet de ${a} litres par minute remplit un réservoir en ${b} minutes. En combien de minutes un robinet de ${c} litres par minute le remplit-il ?`,
      en: (a, b, c) =>
        `A tap at ${a} litres per minute fills a tank in ${b} minutes. In how many minutes does one at ${c} litres per minute fill it?`,
    },
  },
  {
    frases: {
      pt: (a, b, c) =>
        `${a} servidores processam um lote em ${b} minutos. Em quantos minutos ${c} servidores iguais processam o mesmo lote?`,
      fr: (a, b, c) =>
        `${a} serveurs traitent un lot en ${b} minutes. En combien de minutes ${c} serveurs identiques traitent-ils le même lot ?`,
      en: (a, b, c) =>
        `${a} servers process a batch in ${b} minutes. In how many minutes do ${c} identical servers process the same batch?`,
    },
  },
  {
    frases: {
      pt: (a, b, c) =>
        `${a} escavadeiras abrem uma vala em ${b} dias. Em quantos dias ${c} escavadeiras iguais abrem a mesma vala?`,
      fr: (a, b, c) =>
        `${a} excavatrices creusent une tranchée en ${b} jours. En combien de jours ${c} excavatrices identiques creusent-elles la même tranchée ?`,
      en: (a, b, c) =>
        `${a} excavators dig a trench in ${b} days. In how many days do ${c} identical excavators dig the same trench?`,
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Perguntas de valor unitário: o mesmo cálculo, com a pergunta mudada.
//
// «Quanto custa 1 kg?» e «em quantos dias 1 operário termina?» são a mesma
// proporção com `c = 1`. São formas de pergunta à parte porque a resposta tem
// outro significado — a taxa unitária, ou o produto conservado — e é isso que
// o aluno precisa reconhecer.
// ─────────────────────────────────────────────────────────────────────────────

const CONTEXTOS_UNITARIOS_DIRETOS: readonly Contexto[] = [
  {
    frases: {
      pt: (a, b) => `${a} kg de café custam R$ ${b}. Quanto custa 1 kg?`,
      fr: (a, b) => `${a} kg de café coûtent ${b} $. Combien coûte 1 kg ?`,
      en: (a, b) => `${a} kg of coffee cost $${b}. How much does 1 kg cost?`,
    },
  },
  {
    frases: {
      pt: (a, b) => `${a} cadernos custam R$ ${b}. Quanto custa um caderno?`,
      fr: (a, b) => `${a} cahiers coûtent ${b} $. Combien coûte un cahier ?`,
      en: (a, b) => `${a} notebooks cost $${b}. How much does one notebook cost?`,
    },
  },
  {
    frases: {
      pt: (a, b) =>
        `Uma impressora imprime ${b} páginas em ${a} minutos. Quantas páginas imprime em 1 minuto?`,
      fr: (a, b) =>
        `Une imprimante imprime ${b} pages en ${a} minutes. Combien de pages imprime-t-elle en 1 minute ?`,
      en: (a, b) =>
        `A printer prints ${b} pages in ${a} minutes. How many pages does it print in 1 minute?`,
    },
  },
  {
    frases: {
      pt: (a, b) => `${a} metros de fio pesam ${b} kg. Quanto pesa 1 metro?`,
      fr: (a, b) => `${a} mètres de fil pèsent ${b} kg. Combien pèse 1 mètre ?`,
      en: (a, b) => `${a} metres of wire weigh ${b} kg. How much does 1 metre weigh?`,
    },
  },
];

const CONTEXTOS_UNITARIOS_INVERSOS: readonly Contexto[] = [
  {
    frases: {
      pt: (a, b) =>
        `${a} operários fazem a obra em ${b} dias. Em quantos dias 1 operário faz a mesma obra?`,
      fr: (a, b) =>
        `${a} ouvriers font l'ouvrage en ${b} jours. En combien de jours 1 ouvrier fait-il le même ouvrage ?`,
      en: (a, b) =>
        `${a} workers do the job in ${b} days. In how many days does 1 worker do the same job?`,
    },
  },
  {
    frases: {
      pt: (a, b) =>
        `${a} torneiras enchem o tanque em ${b} minutos. Em quantos minutos 1 torneira o enche?`,
      fr: (a, b) =>
        `${a} robinets remplissent le réservoir en ${b} minutes. En combien de minutes 1 robinet le remplit-il ?`,
      en: (a, b) =>
        `${a} taps fill the tank in ${b} minutes. In how many minutes does 1 tap fill it?`,
    },
  },
  {
    frases: {
      pt: (a, b) =>
        `${a} máquinas produzem o lote em ${b} horas. Em quantas horas 1 máquina produz o mesmo lote?`,
      fr: (a, b) =>
        `${a} machines produisent le lot en ${b} heures. En combien d'heures 1 machine produit-elle le même lot ?`,
      en: (a, b) =>
        `${a} machines produce the batch in ${b} hours. In how many hours does 1 machine produce the same batch?`,
    },
  },
  {
    frases: {
      pt: (a, b) =>
        `${a} vacas comem a ração em ${b} dias. Em quantos dias 1 vaca come a mesma ração?`,
      fr: (a, b) =>
        `${a} vaches mangent le fourrage en ${b} jours. En combien de jours 1 vache mange-t-elle le même fourrage ?`,
      en: (a, b) =>
        `${a} cows eat the feed in ${b} days. In how many days does 1 cow eat the same feed?`,
    },
  },
];

// ──────���──────────────────────────────────────────────────────────────────────
// Regra de três composta: duas grandezas mudam ao mesmo tempo.
// ─────────────────────────────────────────────────────────────────────────────

interface ValoresCompostos {
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly d: number;
  readonly e: number;
}

type MoldeComposto = (v: ValoresCompostos) => string;
type FrasesCompostas = Readonly<Record<Idioma, MoldeComposto>>;

interface ContextoComposto {
  readonly tipo: 'direta-direta' | 'inversa-inversa';
  readonly frases: FrasesCompostas;
}

const CONTEXTOS_COMPOSTOS: readonly ContextoComposto[] = [
  {
    tipo: 'direta-direta',
    frases: {
      pt: (v) =>
        `${v.a} máquinas produzem ${v.b} peças em ${v.c} horas. Quantas peças ${v.d} máquinas iguais produzem em ${v.e} horas?`,
      fr: (v) =>
        `${v.a} machines produisent ${v.b} pièces en ${v.c} heures. Combien de pièces ${v.d} machines identiques produisent-elles en ${v.e} heures ?`,
      en: (v) =>
        `${v.a} machines produce ${v.b} parts in ${v.c} hours. How many parts do ${v.d} identical machines produce in ${v.e} hours?`,
    },
  },
  {
    tipo: 'direta-direta',
    frases: {
      pt: (v) =>
        `${v.a} operários constroem ${v.b} metros de muro em ${v.c} dias. Quantos metros ${v.d} operários constroem em ${v.e} dias, no mesmo ritmo?`,
      fr: (v) =>
        `${v.a} ouvriers construisent ${v.b} mètres de mur en ${v.c} jours. Combien de mètres ${v.d} ouvriers construisent-ils en ${v.e} jours, au même rythme ?`,
      en: (v) =>
        `${v.a} workers build ${v.b} metres of wall in ${v.c} days. How many metres do ${v.d} workers build in ${v.e} days at the same pace?`,
    },
  },
  {
    tipo: 'direta-direta',
    frases: {
      pt: (v) =>
        `${v.a} impressoras imprimem ${v.b} páginas em ${v.c} minutos. Quantas páginas ${v.d} impressoras iguais imprimem em ${v.e} minutos?`,
      fr: (v) =>
        `${v.a} imprimantes impriment ${v.b} pages en ${v.c} minutes. Combien de pages ${v.d} imprimantes identiques impriment-elles en ${v.e} minutes ?`,
      en: (v) =>
        `${v.a} printers print ${v.b} pages in ${v.c} minutes. How many pages do ${v.d} identical printers print in ${v.e} minutes?`,
    },
  },
  {
    tipo: 'direta-direta',
    frases: {
      pt: (v) =>
        `${v.a} tratores aram ${v.b} hectares em ${v.c} dias. Quantos hectares ${v.d} tratores iguais aram em ${v.e} dias?`,
      fr: (v) =>
        `${v.a} tracteurs labourent ${v.b} hectares en ${v.c} jours. Combien d'hectares ${v.d} tracteurs identiques labourent-ils en ${v.e} jours ?`,
      en: (v) =>
        `${v.a} tractors plough ${v.b} hectares in ${v.c} days. How many hectares do ${v.d} identical tractors plough in ${v.e} days?`,
    },
  },
  {
    tipo: 'inversa-inversa',
    frases: {
      pt: (v) =>
        `${v.a} operários, trabalhando ${v.b} horas por dia, terminam a obra em ${v.c} dias. Em quantos dias ${v.d} operários, trabalhando ${v.e} horas por dia, terminam a mesma obra?`,
      fr: (v) =>
        `${v.a} ouvriers, travaillant ${v.b} heures par jour, terminent l'ouvrage en ${v.c} jours. En combien de jours ${v.d} ouvriers, travaillant ${v.e} heures par jour, terminent-ils le même ouvrage ?`,
      en: (v) =>
        `${v.a} workers, working ${v.b} hours a day, finish the job in ${v.c} days. In how many days do ${v.d} workers, working ${v.e} hours a day, finish the same job?`,
    },
  },
  {
    tipo: 'inversa-inversa',
    frases: {
      pt: (v) =>
        `${v.a} escavadeiras, trabalhando ${v.b} horas por dia, abrem a vala em ${v.c} dias. Em quantos dias ${v.d} escavadeiras, trabalhando ${v.e} horas por dia, abrem a mesma vala?`,
      fr: (v) =>
        `${v.a} excavatrices, travaillant ${v.b} heures par jour, creusent la tranchée en ${v.c} jours. En combien de jours ${v.d} excavatrices, travaillant ${v.e} heures par jour, creusent-elles la même tranchée ?`,
      en: (v) =>
        `${v.a} excavators, working ${v.b} hours a day, dig the trench in ${v.c} days. In how many days do ${v.d} excavators, working ${v.e} hours a day, dig the same trench?`,
    },
  },
  {
    tipo: 'direta-direta',
    frases: {
      pt: (v) =>
        `${v.a} caminhões transportam ${v.b} toneladas em ${v.c} viagens. Quantas toneladas ${v.d} caminhões iguais transportam em ${v.e} viagens?`,
      fr: (v) =>
        `${v.a} camions transportent ${v.b} tonnes en ${v.c} voyages. Combien de tonnes ${v.d} camions identiques transportent-ils en ${v.e} voyages ?`,
      en: (v) =>
        `${v.a} trucks carry ${v.b} tonnes in ${v.c} trips. How many tonnes do ${v.d} identical trucks carry in ${v.e} trips?`,
    },
  },
  {
    tipo: 'direta-direta',
    frases: {
      pt: (v) =>
        `${v.a} colheitadeiras colhem ${v.b} hectares em ${v.c} dias. Quantos hectares ${v.d} colheitadeiras iguais colhem em ${v.e} dias?`,
      fr: (v) =>
        `${v.a} moissonneuses récoltent ${v.b} hectares en ${v.c} jours. Combien d'hectares ${v.d} moissonneuses identiques récoltent-elles en ${v.e} jours ?`,
      en: (v) =>
        `${v.a} harvesters reap ${v.b} hectares in ${v.c} days. How many hectares do ${v.d} identical harvesters reap in ${v.e} days?`,
    },
  },
  {
    tipo: 'direta-direta',
    frases: {
      pt: (v) =>
        `${v.a} costureiras fazem ${v.b} camisas em ${v.c} dias. Quantas camisas ${v.d} costureiras, no mesmo ritmo, fazem em ${v.e} dias?`,
      fr: (v) =>
        `${v.a} couturières font ${v.b} chemises en ${v.c} jours. Combien de chemises ${v.d} couturières, au même rythme, font-elles en ${v.e} jours ?`,
      en: (v) =>
        `${v.a} seamstresses make ${v.b} shirts in ${v.c} days. How many shirts do ${v.d} seamstresses, at the same pace, make in ${v.e} days?`,
    },
  },
  {
    tipo: 'inversa-inversa',
    frases: {
      pt: (v) =>
        `${v.a} pintores, trabalhando ${v.b} horas por dia, pintam o prédio em ${v.c} dias. Em quantos dias ${v.d} pintores, trabalhando ${v.e} horas por dia, pintam o mesmo prédio?`,
      fr: (v) =>
        `${v.a} peintres, travaillant ${v.b} heures par jour, peignent l'immeuble en ${v.c} jours. En combien de jours ${v.d} peintres, travaillant ${v.e} heures par jour, peignent-ils le même immeuble ?`,
      en: (v) =>
        `${v.a} painters, working ${v.b} hours a day, paint the building in ${v.c} days. In how many days do ${v.d} painters, working ${v.e} hours a day, paint the same building?`,
    },
  },
  {
    tipo: 'inversa-inversa',
    frases: {
      pt: (v) =>
        `${v.a} máquinas, ligadas ${v.b} horas por dia, produzem o lote em ${v.c} dias. Em quantos dias ${v.d} máquinas, ligadas ${v.e} horas por dia, produzem o mesmo lote?`,
      fr: (v) =>
        `${v.a} machines, allumées ${v.b} heures par jour, produisent le lot en ${v.c} jours. En combien de jours ${v.d} machines, allumées ${v.e} heures par jour, produisent-elles le même lot ?`,
      en: (v) =>
        `${v.a} machines, running ${v.b} hours a day, produce the batch in ${v.c} days. In how many days do ${v.d} machines, running ${v.e} hours a day, produce the same batch?`,
    },
  },
  {
    tipo: 'inversa-inversa',
    frases: {
      pt: (v) =>
        `${v.a} tratores, trabalhando ${v.b} horas por dia, aram o campo em ${v.c} dias. Em quantos dias ${v.d} tratores, trabalhando ${v.e} horas por dia, aram o mesmo campo?`,
      fr: (v) =>
        `${v.a} tracteurs, travaillant ${v.b} heures par jour, labourent le champ en ${v.c} jours. En combien de jours ${v.d} tracteurs, travaillant ${v.e} heures par jour, labourent-ils le même champ ?`,
      en: (v) =>
        `${v.a} tractors, working ${v.b} hours a day, plough the field in ${v.c} days. In how many days do ${v.d} tractors, working ${v.e} hours a day, plough the same field?`,
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Auxiliares de sorteio
// ─────────────────────────────────────────────────────────────────────────────

function divisoresProprios(n: number): readonly number[] {
  const divisores: number[] = [];
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) {
      divisores.push(d);
      if (d !== n / d) {
        divisores.push(n / d);
      }
    }
  }
  return divisores;
}

/** Um número com pelo menos um divisor próprio, para a regra inversa fechar inteira. */
function comDivisor(rng: Rng, minimo: number, maximo: number): number {
  for (let tentativa = 0; tentativa < 40; tentativa++) {
    const candidato = rng.inteiro(minimo, maximo);
    if (divisoresProprios(candidato).length > 0) {
      return candidato;
    }
  }
  return 12;
}

function parametrosDiretos(rng: Rng, nivel: Nivel): { a: number; b: number; c: number } {
  const a = rng.inteiro(2, nivel === 'facil' ? 8 : 14);
  const taxa = rng.inteiro(2, nivel === 'facil' ? 9 : 20);
  const c = rng.inteiro(2, nivel === 'facil' ? 9 : 18);
  return { a, b: a * taxa, c };
}

function parametrosInversos(rng: Rng, nivel: Nivel): { a: number; b: number; c: number } {
  const a = comDivisor(rng, 2, nivel === 'facil' ? 9 : 14);
  const b = rng.inteiro(2, nivel === 'facil' ? 10 : 24);
  const divisor = rng.escolher(divisoresProprios(a));
  return { a, b, c: a / divisor };
}

function parametrosUnitarios(
  rng: Rng,
  nivel: Nivel,
  inversa: boolean,
): { a: number; b: number; c: number } {
  if (inversa) {
    return { a: rng.inteiro(2, 8), b: rng.inteiro(2, 12), c: 1 };
  }

  const a = rng.inteiro(2, nivel === 'facil' ? 6 : 10);
  return { a, b: a * rng.inteiro(2, 12), c: 1 };
}

// ─────────────────────────────────────────────────────────────────────────────
// Dicas e diagnósticos
// ─────────────────────────────────────────────────────────────────────────────

type Dica = Readonly<Record<Idioma, (a: number, b: number, c: number) => string>>;

const DICA_DIRETA: Dica = {
  pt: (a, b, c) =>
    `Quando a primeira grandeza vai de ${a} para ${c}, a segunda vai de ${b} para x. As duas crescem juntas?`,
  fr: (a, b, c) =>
    `Quand la première grandeur passe de ${a} à ${c}, la seconde passe de ${b} à x. Croissent-elles ensemble ?`,
  en: (a, b, c) =>
    `When the first quantity goes from ${a} to ${c}, the second goes from ${b} to x. Do they grow together?`,
};

const DICA_INVERSA: Dica = {
  pt: (a, b, c) =>
    `Quando a primeira grandeza vai de ${a} para ${c}, a segunda vai de ${b} para x. Se uma cresce, a outra diminui?`,
  fr: (a, b, c) =>
    `Quand la première grandeur passe de ${a} à ${c}, la seconde passe de ${b} à x. Si l'une croît, l'autre diminue ?`,
  en: (a, b, c) =>
    `When the first quantity goes from ${a} to ${c}, the second goes from ${b} to x. If one grows, does the other shrink?`,
};

const DICA_UNITARIA: Dica = {
  pt: () => 'A pergunta é sobre UMA unidade: reduza o par conhecido a 1 antes de comparar.',
  fr: () => 'La question porte sur UNE unité : ramenez la paire connue à 1 avant de comparer.',
  en: () => 'The question asks about ONE unit: reduce the known pair to 1 before comparing.',
};

const DICA_COMPOSTA: Readonly<Record<Idioma, string>> = {
  pt: 'Duas grandezas mudam ao mesmo tempo. Resolva uma de cada vez, mantendo a outra fixa.',
  fr: "Deux grandeurs changent en même temps. Traitez-en une à la fois, en gardant l'autre fixe.",
  en: 'Two quantities change at once. Handle one at a time, holding the other fixed.',
};

const DIAGNOSTICO_TIPO_ERRADO: Readonly<Record<Idioma, (inversa: boolean) => string>> = {
  pt: (inversa) =>
    inversa
      ? 'Estas grandezas são INVERSAMENTE proporcionais: quando uma aumenta, a outra diminui. ' +
        'Você montou a proporção direta. Aqui o que se conserva é o produto, não a razão.'
      : 'Estas grandezas são DIRETAMENTE proporcionais: as duas crescem juntas. Você montou a ' +
        'regra inversa, que vale quando uma aumenta e a outra diminui.',
  fr: (inversa) =>
    inversa
      ? 'Ces grandeurs sont INVERSEMENT proportionnelles : quand l’une augmente, l’autre diminue. ' +
        'Vous avez posé la proportion directe. Ici, c’est le produit qui se conserve, pas le rapport.'
      : 'Ces grandeurs sont DIRECTEMENT proportionnelles : les deux augmentent ensemble. Vous avez ' +
        'posé la règle inverse, qui vaut quand l’une augmente et l’autre diminue.',
  en: (inversa) =>
    inversa
      ? 'These quantities are INVERSELY proportional: when one increases, the other decreases. ' +
        'You set up the direct proportion. Here the product is conserved, not the ratio.'
      : 'These quantities are DIRECTLY proportional: both grow together. You set up the inverse ' +
        'rule, which applies when one increases and the other decreases.',
};

const DIAGNOSTICO_TERMOS_TROCADOS: Readonly<Record<Idioma, string>> = {
  pt:
    'Os termos foram trocados de lugar na montagem. Confira qual grandeza corresponde a qual: ' +
    'o x precisa ficar do mesmo lado que a grandeza do mesmo tipo.',
  fr:
    'Les termes ont été placés dans le mauvais ordre. Vérifiez quelle grandeur correspond à ' +
    'quelle autre : l’inconnue doit être du même côté que la grandeur de même nature.',
  en:
    'The terms were placed in the wrong order. Check which quantity matches which: the unknown ' +
    'must sit on the same side as the quantity of the same kind.',
};

const DIAGNOSTICO_UMA_SO_GRANDEZA: Readonly<Record<Idioma, string>> = {
  pt:
    'Você ajustou só uma das grandezas. Com duas mudando ao mesmo tempo, cada uma entra como um ' +
    'fator multiplicativo — e os dois fatores se multiplicam.',
  fr:
    'Vous n’avez ajusté qu’une seule grandeur. Quand deux changent en même temps, chacune entre ' +
    'comme un facteur multiplicatif — et les deux facteurs se multiplient.',
  en:
    'You adjusted only one of the quantities. When two change at once, each enters as a ' +
    'multiplicative factor — and the two factors multiply.',
};

const DIAGNOSTICO_DIRECAO_ERRADA_COMPOSTA: Readonly<
  Record<Idioma, (tipo: 'direta-direta' | 'inversa-inversa') => string>
> = {
  pt: (tipo) =>
    tipo === 'direta-direta'
      ? 'As duas grandezas crescem juntas: mais horas de trabalho, mais produção. Você tratou ' +
        'uma delas como inversa, dividindo em vez de multiplicar.'
      : 'As duas grandezas são inversas: mais máquinas e mais horas por dia reduzem os dias. ' +
        'Você tratou uma delas como direta, multiplicando em vez de dividir.',
  fr: (tipo) =>
    tipo === 'direta-direta'
      ? 'Les deux grandeurs augmentent ensemble : plus d’heures de travail, plus de production. ' +
        'Vous avez traité l’une d’elles comme inverse, en divisant au lieu de multiplier.'
      : 'Les deux grandeurs sont inverses : plus de machines et plus d’heures par jour réduisent ' +
        'les jours. Vous avez traité l’une d’elles comme directe, en multipliant au lieu de diviser.',
  en: (tipo) =>
    tipo === 'direta-direta'
      ? 'Both quantities grow together: more hours of work, more output. You treated one of them ' +
        'as inverse, dividing instead of multiplying.'
      : 'Both quantities are inverse: more machines and more hours a day reduce the days. You ' +
        'treated one of them as direct, multiplying instead of dividing.',
};

const DIAGNOSTICO_ORDEM_ERRADA: Readonly<Record<Idioma, string>> = {
  pt: 'A ordem dos fatores foi trocada: confira qual grandeza multiplica qual antes de calcular.',
  fr: 'L’ordre des facteurs a été inversé : vérifiez quelle grandeur multiplie quelle autre avant de calculer.',
  en: 'The factors are in the wrong order: check which quantity multiplies which before computing.',
};

// ─────────────────────────────────────────────────────────────────────────────
// Montagem dos exercícios
// ─────────────────────────────────────────────────────────────────────────────

export const geradorProporcao: GeradorExercicio<number> = {
  topicoId: 'razao-proporcao',
  formatoResposta: 'um número, ex.: 18 ou 7,5',
  formatoRespostaTraducoes: {
    fr: 'un nombre, p. ex. 18 ou 7,5',
    en: 'a number, e.g. 18 or 7.5',
  },

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    if (nivel === 'extremo') {
      return exercicioComposto(rng);
    }

    const inversa = nivel === 'facil' ? false : rng.booleano();
    const unitario = nivel === 'dificil' && rng.booleano();
    return exercicioSimples(nivel, rng, inversa, unitario);
  },

  analisar: (entrada) => analisarNumero(entrada.replace(/R\$/g, '')),

  ...numeroComCasas(2, 1e-4),
};

function exercicioSimples(
  nivel: Nivel,
  rng: Rng,
  inversa: boolean,
  unitario: boolean,
): Exercicio<number> {
  const contextos = inversa
    ? unitario
      ? CONTEXTOS_UNITARIOS_INVERSOS
      : CONTEXTOS_INVERSOS
    : unitario
      ? CONTEXTOS_UNITARIOS_DIRETOS
      : CONTEXTOS_DIRETOS;

  const contexto = rng.escolher(contextos);
  const { a, b, c } = unitario
    ? parametrosUnitarios(rng, nivel, inversa)
    : inversa
      ? parametrosInversos(rng, nivel)
      : parametrosDiretos(rng, nivel);

  const resolucao = regraDeTresComPassos(a, b, c, inversa);
  const erradaDireta = regraDeTresComPassos(a, b, c, false).resultado;
  const erradaInversa = regraDeTresComPassos(a, b, c, true).resultado;
  const dica = unitario ? DICA_UNITARIA : inversa ? DICA_INVERSA : DICA_DIRETA;

  return {
    id: `proporcao-${inversa ? 'inversa' : 'direta'}${unitario ? '-unitaria' : ''}-${a}-${b}-${c}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: contexto.frases.pt(a, b, c),
    traducoes: {
      fr: { enunciado: contexto.frases.fr(a, b, c), dica: dica.fr(a, b, c) },
      en: { enunciado: contexto.frases.en(a, b, c), dica: dica.en(a, b, c) },
    },
    /*
     * No Difícil, só o enunciado.
     *
     * A fórmula ao lado do texto responde a pergunta antes dela ser feita:
     * `\frac{a}{b} = \frac{c}{x}` já diz que a proporção é direta, e
     * `a \cdot b = c \cdot x` que é inversa — que é exatamente a decisão que o
     * exercício existe para treinar. Ela reaparece na resolução, depois da
     * resposta, que é quando ela ensina.
     */
    enunciadoTex: nivelAoMenos(nivel, 'dificil')
      ? SEM_FORMULA
      : inversa
        ? `${a} \\cdot ${b} = ${c} \\cdot x \\qquad x = \\;?`
        : `\\frac{${a}}{${b}} = \\frac{${c}}{x} \\qquad x = \\;?`,
    gabarito: resolucao.resultado,
    resolucao,
    conceitos: ['proporcao.regra-de-tres', 'proporcao.proporcao'],
    armadilhas: semColisoes(
      [
        {
          resposta: inversa ? erradaDireta : erradaInversa,
          diagnostico: DIAGNOSTICO_TIPO_ERRADO.pt(inversa),
          diagnosticoTraducoes: {
            fr: DIAGNOSTICO_TIPO_ERRADO.fr(inversa),
            en: DIAGNOSTICO_TIPO_ERRADO.en(inversa),
          },
          passo: 0,
          conceito: 'proporcao.regra-de-tres',
        },
        {
          resposta: (a * c) / b,
          diagnostico: DIAGNOSTICO_TERMOS_TROCADOS.pt,
          diagnosticoTraducoes: {
            fr: DIAGNOSTICO_TERMOS_TROCADOS.fr,
            en: DIAGNOSTICO_TERMOS_TROCADOS.en,
          },
          passo: 1,
          conceito: 'proporcao.proporcao',
        },
      ],
      resolucao.resultado,
      proximos,
    ),
    dica: dica.pt(a, b, c),
  };
}

function exercicioComposto(rng: Rng): Exercicio<number> {
  const contexto = rng.escolher(CONTEXTOS_COMPOSTOS);
  const valores =
    contexto.tipo === 'direta-direta' ? valoresDiretaDireta(rng) : valoresInversaInversa(rng);

  const resolucao = resolucaoComposta(contexto.tipo, valores);
  const dica = DICA_COMPOSTA;

  const parcial =
    contexto.tipo === 'direta-direta'
      ? valores.b * (valores.d / valores.a)
      : valores.c * (valores.a / valores.d);
  const outroParcial =
    contexto.tipo === 'direta-direta'
      ? valores.b * (valores.e / valores.c)
      : valores.c * (valores.b / valores.e);
  const direcaoErrada =
    contexto.tipo === 'direta-direta'
      ? valores.b * (valores.d / valores.a) * (valores.c / valores.e)
      : valores.c * (valores.a / valores.d) * (valores.b / valores.e);

  const armadilhas: readonly Armadilha<number>[] = [
    {
      resposta: parcial,
      diagnostico: DIAGNOSTICO_UMA_SO_GRANDEZA.pt,
      diagnosticoTraducoes: {
        fr: DIAGNOSTICO_UMA_SO_GRANDEZA.fr,
        en: DIAGNOSTICO_UMA_SO_GRANDEZA.en,
      },
      passo: 1,
      conceito: 'proporcao.regra-de-tres-composta',
    },
    {
      resposta: direcaoErrada,
      diagnostico: DIAGNOSTICO_DIRECAO_ERRADA_COMPOSTA.pt(contexto.tipo),
      diagnosticoTraducoes: {
        fr: DIAGNOSTICO_DIRECAO_ERRADA_COMPOSTA.fr(contexto.tipo),
        en: DIAGNOSTICO_DIRECAO_ERRADA_COMPOSTA.en(contexto.tipo),
      },
      passo: 1,
      conceito: 'proporcao.regra-de-tres-composta',
    },
    {
      resposta: outroParcial,
      diagnostico: DIAGNOSTICO_ORDEM_ERRADA.pt,
      diagnosticoTraducoes: {
        fr: DIAGNOSTICO_ORDEM_ERRADA.fr,
        en: DIAGNOSTICO_ORDEM_ERRADA.en,
      },
      passo: 2,
      conceito: 'proporcao.proporcao',
    },
  ];

  return {
    id: `proporcao-composta-${contexto.tipo}-${valores.a}-${valores.b}-${valores.c}-${valores.d}-${valores.e}-${rng.inteiro(0, 9999)}`,
    nivel: 'extremo',
    enunciado: contexto.frases.pt(valores),
    traducoes: {
      fr: { enunciado: contexto.frases.fr(valores), dica: dica.fr },
      en: { enunciado: contexto.frases.en(valores), dica: dica.en },
    },
    enunciadoTex: SEM_FORMULA,
    gabarito: resolucao.resultado,
    resolucao,
    conceitos: ['proporcao.regra-de-tres-composta', 'proporcao.regra-de-tres'],
    armadilhas: semColisoes(armadilhas, resolucao.resultado, proximos),
    dica: dica.pt,
  };
}

function valoresDiretaDireta(rng: Rng): ValoresCompostos {
  const a = rng.inteiro(2, 6);
  const maquinas = rng.inteiro(2, 4);
  const c = rng.inteiro(2, 8);
  const horas = rng.inteiro(2, 4);
  const b = rng.inteiro(2, 12) * 10;
  return { a, b, c, d: a * maquinas, e: c * horas };
}

function valoresInversaInversa(rng: Rng): ValoresCompostos {
  const a = rng.inteiro(2, 6);
  const maisOperarios = rng.inteiro(2, 4);
  const b = rng.inteiro(2, 8);
  const maisHoras = rng.inteiro(2, 4);
  const c = rng.inteiro(2, 6) * maisOperarios * maisHoras;
  return { a, b, c, d: a * maisOperarios, e: b * maisHoras };
}

function resolucaoComposta(tipo: ContextoComposto['tipo'], v: ValoresCompostos) {
  const plano: Passo = {
    descricao:
      'Duas grandezas mudam ao mesmo tempo. Resolvemos uma de cada vez, mantendo a outra fixa.',
    tex: `\\left(${v.a},\\; ${v.c}\\right) \\;\\longrightarrow\\; \\left(${v.d},\\; ${v.e}\\right)`,
  };

  if (tipo === 'direta-direta') {
    const primeira = regraDeTresComPassos(v.a, v.b, v.d, false);
    const segunda = regraDeTresComPassos(v.c, primeira.resultado, v.e, false);
    return {
      resultado: segunda.resultado,
      passos: [plano, ...primeira.passos, ...segunda.passos],
    };
  }

  const primeira = regraDeTresComPassos(v.a, v.c, v.d, true);
  const segunda = regraDeTresComPassos(v.b, primeira.resultado, v.e, true);
  return {
    resultado: segunda.resultado,
    passos: [plano, ...primeira.passos, ...segunda.passos],
  };
}
