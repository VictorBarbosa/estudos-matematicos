/**
 * Quantas FORMAS de pergunta cada tópico tem — e o piso que não pode cair.
 *
 * `variedade.spec.ts` mede quantos enunciados distintos o gerador produz, e um
 * gerador que só troca os números passa nele com uma forma só. Isso não é
 * variedade para quem estuda: «Viajando a 5 km/h leva-se 68 horas…» e
 * «Viajando a 9 km/h leva-se 20 horas…» são a mesma pergunta, e o aluno que
 * errou a primeira reencontra a segunda sem nada de novo para decidir.
 *
 * Aqui a régua é a mesma da prova final (`formaDaPergunta`): o enunciado com
 * os números trocados por N. O que se conta são contextos, não valores.
 *
 * O piso é uma catraca. Ele registra a situação medida em 10/11/2026 — sem
 * inventar meta que ninguém verificou — e falha quando um tópico cai abaixo
 * dela: enriquecer um gerador nunca pode ser desfeito por acidente. Subir o
 * número é sempre permitido, e o caminho é o dos tópicos já convertidos:
 * `razao-proporcao` (1 forma → 14/26/34/12), `operacoes-fundamentais`,
 * `funcao-afim`, `funcao-quadratica`, `inequacoes` (1/1/1/1 → 5/8/9/8) e
 * `inequacoes-segundo-grau` (1/1/2/2 → 8/11/8/12), todos com um catálogo de
 * situações trilíngues.
 *
 * Ampliar a régua: apague a entrada do tópico, rode a suíte, copie o número
 * novo e devolva-o aqui maior. O teste não é o lugar de decidir o conteúdo; é
 * o lugar de não deixá-lo encolher em silêncio.
 */
import { TODOS_OS_GERADORES } from '@core/treino/geradores.catalogo/geradores.catalogo';
import { NIVEIS, Nivel } from '@core/treino/models/treino.model';
import { criarRng } from '@core/treino/rng/rng';

/** Quantos sorteios por nível: a mesma amostra com que o piso foi medido. */
const AMOSTRA = 600;

/** Tópico → formas distintas no Fácil, no Médio, no Difícil e no Extremo. */
const PISO: Readonly<Record<string, readonly [number, number, number, number]>> = {
  'analise-combinatoria': [2, 11, 11, 10],
  'analise-dimensional': [194, 189, 200, 293],
  'angulos-e-triangulos': [15, 25, 19, 12],
  'aplicacoes-da-derivada': [2, 9, 11, 8],
  'aplicacoes-da-integral': [2, 3, 2, 1],
  'aplicacoes-de-edo': [2, 3, 3, 2],
  'areas-de-figuras-planas': [4, 8, 8, 4],
  'binomio-de-newton': [2, 8, 7, 9],
  'cinematica-escalar': [2, 3, 3, 2],
  'cinematica-vetorial': [2, 4, 4, 2],
  circuitos: [2, 6, 4, 2],
  'circulo-e-poligonos': [3, 6, 4, 3],
  'circulo-trigonometrico': [2, 7, 6, 5],
  circunferencia: [2, 3, 3, 4],
  'composicao-inversa': [3, 4, 3, 2],
  'conceito-funcao': [2, 3, 2, 1],
  conicas: [3, 8, 6, 4],
  continuidade: [2, 4, 3, 2],
  'coordenadas-no-espaco': [2, 3, 3, 2],
  'coordenadas-polares': [3, 4, 3, 4],
  'definicao-de-derivada': [2, 3, 2, 2],
  'derivacao-implicita': [2, 3, 3, 3],
  'derivadas-exponencial-logaritmo': [2, 3, 3, 2],
  'derivadas-parciais': [2, 4, 4, 3],
  'derivadas-trigonometricas': [8, 8, 8, 7],
  'dinamica-rotacional': [5, 15, 14, 9],
  'distribuicao-normal': [10, 20, 15, 10],
  'edo-primeira-ordem': [2, 4, 4, 4],
  'edo-segunda-ordem': [2, 4, 5, 3],
  eletrostatica: [4, 8, 10, 2],
  'equacao-primeiro-grau': [5, 6, 7, 2],
  'equacao-segundo-grau': [3, 4, 5, 5],
  'equacoes-exponenciais': [2, 4, 3, 3],
  'equacoes-parametricas': [2, 4, 4, 2],
  'equacoes-trigonometricas': [22, 7, 7, 5],
  'escalonamento-e-inversa': [18, 10, 6, 4],
  'estatica-e-torque': [2, 3, 3, 2],
  'estatistica-e-incerteza': [10, 11, 7, 2],
  'expressoes-algebricas': [1, 1, 1, 2],
  fatoracao: [1, 2, 3, 5],
  'fisica-com-calculo': [2, 3, 3, 2],
  'fisica-moderna': [3, 14, 16, 3],
  'fluidos-e-aerodinamica': [2, 3, 3, 2],
  fracoes: [2, 3, 3, 3],
  'funcao-afim': [7, 12, 11, 5],
  'funcao-exponencial': [2, 4, 3, 2],
  'funcao-logaritmica': [2, 3, 2, 1],
  'funcao-modular': [2, 5, 5, 3],
  'funcao-quadratica': [8, 14, 9, 5],
  'funcoes-de-varias-variaveis': [2, 3, 3, 2],
  'funcoes-por-partes': [1, 3, 5, 2],
  'funcoes-racionais': [2, 4, 4, 2],
  'funcoes-trigonometricas': [2, 3, 3, 2],
  'gradiente-e-direcional': [3, 4, 3, 2],
  'gravitacao-e-orbitas': [2, 6, 6, 5],
  'identidades-trigonometricas': [2, 3, 2, 1],
  'impulso-e-momento': [2, 3, 3, 2],
  inequacoes: [5, 8, 9, 8],
  'inequacoes-segundo-grau': [8, 11, 8, 12],
  'integrais-de-linha': [1, 1, 3, 2],
  'integrais-improprias': [1, 2, 3, 2],
  'integrais-multiplas': [1, 3, 3, 2],
  'integral-definida': [2, 5, 6, 5],
  'integral-indefinida': [2, 3, 2, 1],
  'juros-compostos': [2, 3, 5, 4],
  'lei-senos-cossenos': [2, 3, 3, 4],
  'leis-de-newton': [2, 3, 3, 2],
  limites: [3, 5, 5, 3],
  'limites-laterais': [2, 4, 4, 5],
  'magnetismo-e-inducao': [3, 4, 5, 3],
  'matrizes-determinantes': [2, 4, 4, 3],
  'metodos-numericos': [2, 3, 4, 3],
  'atomos-isotopos-ions': [2, 3, 3, 2],
  'mol-e-massa-molar': [2, 3, 3, 2],
  estequiometria: [2, 3, 3, 2],
  'mmc-mdc': [2, 2, 2, 2],
  'momento-angular': [6, 7, 3, 2],
  'movimento-circular': [3, 3, 3, 2],
  'movimento-harmonico': [2, 3, 2, 1],
  'nocao-intuitiva-de-limite': [2, 3, 2, 1],
  'notacao-matematica': [11, 53, 52, 52],
  'numeros-complexos': [9, 75, 70, 42],
  'numeros-decimais': [1, 2, 2, 2],
  'ondas-e-som': [4, 22, 18, 12],
  'operacoes-fundamentais': [5, 7, 6, 6],
  optica: [7, 11, 16, 6],
  poliedros: [45, 51, 34, 32],
  polinomios: [3, 9, 7, 9],
  'ponto-e-reta': [2, 9, 9, 8],
  'potenciacao-radiciacao': [2, 3, 3, 2],
  'potencial-e-capacitores': [3, 4, 9, 3],
  probabilidade: [9, 8, 3, 2],
  'produto-escalar-vetorial': [2, 3, 3, 2],
  'produtos-notaveis': [1, 3, 4, 3],
  progressoes: [2, 4, 4, 3],
  'propulsao-de-foguetes': [2, 3, 3, 2],
  'razao-proporcao': [14, 26, 34, 12],
  'regra-da-cadeia': [2, 3, 3, 3],
  'regras-de-derivacao': [3, 4, 5, 3],
  'regressao-e-correlacao': [2, 4, 4, 2],
  'retas-e-planos': [7, 9, 4, 4],
  'semelhanca-e-pitagoras': [3, 5, 5, 3],
  'seno-cosseno-tangente': [2, 3, 2, 1],
  'sequencias-e-series': [2, 3, 4, 6],
  'series-de-taylor': [2, 3, 6, 4],
  'sistemas-lineares': [5, 5, 6, 2],
  'solidos-e-volumes': [3, 8, 6, 3],
  'soma-de-riemann': [1, 2, 2, 2],
  'taxa-de-variacao': [2, 3, 3, 2],
  'tecnicas-de-integracao': [1, 3, 3, 2],
  'teorema-fundamental': [2, 3, 2, 1],
  'teoremas-integrais': [3, 3, 7, 3],
  'termodinamica-e-gases': [5, 3, 3, 2],
  'trabalho-e-energia': [2, 3, 3, 2],
  'trajetoria-balistica': [2, 3, 4, 2],
  'transferencia-de-calor': [13, 22, 35, 9],
  'transformacoes-de-graficos': [2, 4, 3, 2],
  'triangulo-retangulo': [5, 7, 3, 4],
  'vetores-no-espaco': [5, 9, 9, 2],
  'vetores-no-plano': [2, 3, 3, 2],
  'vizinhancas-e-infinito': [2, 3, 2, 1],
};

/** O enunciado sem os números: a forma da pergunta. */
function forma(enunciado: string): string {
  return enunciado.replace(/-?[\d.,]+/g, 'N');
}

function formasPorNivel(gerador: (typeof TODOS_OS_GERADORES)[number][1]): readonly number[] {
  return NIVEIS.map((nivel: Nivel) => {
    const rng = criarRng(20261110);
    const vistos = new Set<string>();

    for (let i = 0; i < AMOSTRA; i++) {
      vistos.add(forma(gerador.gerar(nivel, rng).enunciado));
    }

    return vistos.size;
  });
}

describe('pisos de variedade de forma', () => {
  for (const [topico, gerador] of TODOS_OS_GERADORES) {
    it(`${topico} não perde formas de pergunta`, () => {
      const piso = PISO[topico];

      expect(piso, `${topico} não está no piso declarado`).toBeDefined();

      const medidas = formasPorNivel(gerador);

      NIVEIS.forEach((nivel, indice) => {
        expect(
          medidas[indice],
          `${topico}/${nivel}: eram ${piso[indice]} formas, agora são ${medidas[indice]}. ` +
            'Se a queda foi intencional, atualize o piso neste arquivo.',
        ).toBeGreaterThanOrEqual(piso[indice]);
      });
    });
  }
});
