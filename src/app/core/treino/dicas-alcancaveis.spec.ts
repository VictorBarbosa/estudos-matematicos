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
  // Perguntas novas (09/11): a dica nasce no nível de estreia.
  ['regras-de-derivacao', 'dificil', 'Regra do quociente'],
  ['aplicacoes-da-derivada', 'medio', 'Derive só o de cima'],
  ['aplicacoes-da-derivada', 'medio', 'Inclinação da secante'],
  ['aplicacoes-da-derivada', 'dificil', 'derive em cima e embaixo'],
  ['aplicacoes-da-derivada', 'dificil', 'iguale a f′(c)'],
  ['inequacoes-segundo-grau', 'facil', 'Cada fator troca de sinal'],
  ['inequacoes-segundo-grau', 'facil', 'NEGATIVO entre elas'],
  ['inequacoes-segundo-grau', 'medio', 'POSITIVO entre as raízes'],
  ['inequacoes-segundo-grau', 'dificil', 'as raízes são frações'],
  ['inequacoes-segundo-grau', 'dificil', '«todos» ou «vazio»'],
  ['inequacoes-segundo-grau', 'extremo', 'O zero do denominador nunca entra'],
  ['equacao-segundo-grau', 'facil', 'soma = −b/a'],
  ['equacao-segundo-grau', 'medio', 'Escreva b² − 4·a·k = 0'],
  ['equacao-segundo-grau', 'dificil', 'Chame x² de t'],
  ['equacao-segundo-grau', 'extremo', 'Cada t positivo dá duas raízes'],
  ['equacao-segundo-grau', 'extremo', '(x₁ + x₂)² − 2·x₁·x₂'],
  ['sistemas-lineares', 'facil', 'uma soma as quantidades'],
  ['sistemas-lineares', 'dificil', 'determinante zero'],
  ['sistemas-lineares', 'extremo', 'Infinitas soluções: a segunda equação'],
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
  // Equações trigonométricas: cada pergunta tem dica no nível em que estreia.
  ['equacoes-trigonometricas', 'facil', 'A imagem do arcsen e do arctg'],
  ['equacoes-trigonometricas', 'facil', 'em x e em 180° − x'],
  ['equacoes-trigonometricas', 'medio', 'Primeiro isole'],
  ['equacoes-trigonometricas', 'medio', 'modo graus (DEG)'],
  ['equacoes-trigonometricas', 'dificil', 'A calculadora dá só uma solução'],
  ['equacoes-trigonometricas', 'dificil', 'são duas voltas'],
  ['equacoes-trigonometricas', 'extremo', 'resolva a equação do 2º grau'],
  // Álgebra ampliada (09/11): fatoração, produtos notáveis, equação do 1º grau.
  ['fatoracao', 'facil', 'Dois quadrados subtraídos'],
  ['fatoracao', 'medio', 'é um cubo perfeito'],
  ['fatoracao', 'dificil', 'Separe os quatro termos'],
  ['produtos-notaveis', 'medio', 'O último termo é q²'],
  ['produtos-notaveis', 'dificil', 'Dois quadrados subtraídos'],
  ['produtos-notaveis', 'extremo', 'Tire a raiz cúbica'],
  ['equacao-primeiro-grau', 'facil', 'Chame de x os quilômetros'],
  ['equacao-primeiro-grau', 'facil', 'Chame de x a idade de Bia'],
  ['equacao-primeiro-grau', 'medio', 'as frações viram números inteiros'],
  ['equacao-primeiro-grau', 'medio', 'O perímetro soma os quatro lados'],
  ['equacao-primeiro-grau', 'dificil', 'o numerador INTEIRO'],
  ['equacao-primeiro-grau', 'dificil', 'Consecutivos são x'],
  ['continuidade', 'medio', 'Teste 0/0'],
  ['continuidade', 'medio', 'Calcule os dois laterais'],
  ['continuidade', 'medio', 'indica assíntota'],
  ['continuidade', 'extremo', 'Fator que cancela: removível'],
  ['aplicacoes-da-derivada', 'medio', 'ache onde f′ = 0'],
  ['aplicacoes-da-derivada', 'extremo', 'Inflexão é onde f″ troca de sinal'],
  // Fase 2 (09/11): Funções.
  ['funcao-modular', 'dificil', '|u| < c é o mesmo que −c < u < c'],
  ['funcao-modular', 'extremo', 'Os que NÃO satisfazem estão no meio'],
  ['progressoes', 'medio', 'Entre aₚ e a_q há (q − p) razões'],
  ['progressoes', 'dificil', 'Ache a razão primeiro'],
  ['progressoes', 'extremo', 'Na PG, a_q / aₚ'],
  ['juros-compostos', 'dificil', '1 + i_anual = (1 + i_'],
  ['juros-compostos', 'extremo', 'Volte pela raiz'],
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
