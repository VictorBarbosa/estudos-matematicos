import { CARREGAR_GERADOR } from '@core/treino/registro-geradores/registro-geradores';
import { Nivel } from '@core/treino/models/treino.model';
import { criarRng } from '@core/treino/rng/rng';

/**
 * Dicas que precisam chegar à tela.
 *
 * Uma `dica: nivel === 'facil'` escrita num ramo que `sortearPergunta` só gera
 * do Médio para cima nunca aparece — e passa em todo teste, porque nada falha.
 * Foram achadas quinze assim. Cada linha abaixo é uma delas (ou uma pergunta
 * que estreava sem dica nenhuma), com o nível em que a pergunta estreia e um
 * trecho do texto: se alguém devolver a dica a um nível inalcançável, cai aqui.
 */
const DICAS: readonly (readonly [topico: string, nivel: Nivel, trecho: string])[] = [
  // Presas num nível que a pergunta não alcançava.
  ['regras-de-derivacao', 'medio', 'Regra do produto'],
  ['probabilidade', 'medio', 'Pense no contrário'],
  ['estatistica-e-incerteza', 'medio', 'some os QUADRADOS'],
  ['estatistica-e-incerteza', 'dificil', 'A inclinação é Δy/Δx'],
  ['gravitacao-e-orbitas', 'medio', 'raiz QUADRADA de GM'],
  ['propulsao-de-foguetes', 'medio', 'LOGARITMO NATURAL'],
  ['cinematica-escalar', 'dificil', 'AO QUADRADO, dividida'],
  ['trabalho-e-energia', 'medio', 'a massa se cancela'],
  ['leis-de-newton', 'dificil', 'arctan μ'],
  ['progressoes', 'dificil', 'S = a₁ / (1 − q)'],
  // Perguntas que estreavam no Fácil sem dica nenhuma.
  ['integral-definida', 'facil', 'área de um retângulo'],
  ['probabilidade', 'facil', 'sem contar a mesma face'],
  ['cinematica-escalar', 'facil', 'o tempo entra AO QUADRADO'],
  ['propulsao-de-foguetes', 'facil', 'Iₛₚ = vₑ / g'],
  ['matrizes-determinantes', 'facil', 'Linha de A vezes coluna de B'],
  ['conicas', 'facil', 'RAIZ QUADRADA do denominador'],
  ['ponto-e-reta', 'facil', 'média das abscissas'],
  ['continuidade', 'facil', 'onde o sinal troca'],
  ['sequencias-e-series', 'facil', 'PA: aₙ = a₁ + (n − 1)·r'],
  ['vizinhancas-e-infinito', 'facil', 'o denominador cresce mais rápido'],
  // Escalonamento e inversa: cada pergunta tem dica no nível em que estreia.
  ['escalonamento-e-inversa', 'facil', 'cada entrada da L₁'],
  ['escalonamento-e-inversa', 'facil', 'Comece por baixo'],
  ['escalonamento-e-inversa', 'facil', 'Olhe a última linha'],
  ['escalonamento-e-inversa', 'medio', 'dividida pelo pivô'],
  ['escalonamento-e-inversa', 'medio', 'Monte a matriz aumentada'],
  ['escalonamento-e-inversa', 'medio', 'Na adjunta'],
  ['escalonamento-e-inversa', 'medio', 'é o valor de c que decide'],
  ['escalonamento-e-inversa', 'dificil', 'o pivô que contém k'],
  ['escalonamento-e-inversa', 'extremo', 'Escreva (A | I)'],
  ['escalonamento-e-inversa', 'extremo', 'O primeiro pivô é zero'],
];

describe('dicas alcançáveis', () => {
  for (const [topico, nivel, trecho] of DICAS) {
    it(`${topico} / ${nivel}: «${trecho}» aparece`, async () => {
      const gerador = await CARREGAR_GERADOR[topico]!();
      const rng = criarRng(17);
      const dicas = new Set<string>();

      for (let i = 0; i < 300; i++) {
        const dica = gerador.gerar(nivel, rng).dica;
        if (dica !== undefined) dicas.add(dica);
      }

      expect([...dicas].some((dica) => dica.includes(trecho))).toBe(true);
    });
  }
});
