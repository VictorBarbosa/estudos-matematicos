/**
 * Ponto de entrada do motor matemático.
 *
 * Tudo aqui é TypeScript puro, sem nenhuma dependência do Angular, para que a
 * matemática possa ser testada isoladamente e reaproveitada entre tópicos —
 * Função Quadrática e Equação do 2º grau usam as mesmas raízes, Frações e
 * MMC/MDC usam os mesmos inteiros.
 */
export * from '@core/math/tipos/tipos';

// Números
export * from '@core/math/numeros/inteiros/inteiros';
export * from '@core/math/numeros/divisibilidade/divisibilidade';
export * from '@core/math/numeros/fracao/fracao';
export * from '@core/math/numeros/fracao-operacoes/fracao-operacoes';
export * from '@core/math/numeros/decimais/decimais';
export * from '@core/math/numeros/porcentagem/porcentagem';
export * from '@core/math/numeros/potencias/potencias';
export * from '@core/math/numeros/notacao-cientifica/notacao-cientifica';
export * from '@core/math/numeros/proporcao/proporcao';
export * from '@core/math/numeros/expressoes/expressoes';

// Álgebra
export * from '@core/math/algebra/polinomio/polinomio';
export * from '@core/math/algebra/divisao-polinomial/divisao-polinomial';
export * from '@core/math/algebra/equacao-linear/equacao-linear';
export * from '@core/math/algebra/equacao-quadratica/equacao-quadratica';
export * from '@core/math/algebra/produtos-notaveis/produtos-notaveis';
export * from '@core/math/algebra/fatoracao/fatoracao';
export * from '@core/math/algebra/sistema-linear/sistema-linear';
export * from '@core/math/algebra/inequacao/inequacao';
export * from '@core/math/algebra/vetores/vetores';
export * from '@core/math/algebra/matrizes/matrizes';
export * from '@core/math/algebra/complexos/complexos';

// Funções
export * from '@core/math/funcoes/elementares/elementares';
export * from '@core/math/funcoes/composicao/composicao';

// Trigonometria
export * from '@core/math/trigonometria/trigonometria/trigonometria';

// Geometria analítica
export * from '@core/math/geometria/plana/plana';
export * from '@core/math/geometria/espacial/espacial';
export * from '@core/math/geometria/analitica/analitica';

// Cálculo
export * from '@core/math/calculo/sequencias/sequencias';
export * from '@core/math/calculo/limites/limites';
export * from '@core/math/calculo/derivadas/derivadas';
export * from '@core/math/calculo/integrais/integrais';

// Combinatória e estatística
export * from '@core/math/estatistica/contagem/contagem';
export * from '@core/math/estatistica/descritiva/descritiva';

// Física e finanças
export * from '@core/math/fisica/dimensional/dimensional';
export * from '@core/math/fisica/cinematica/cinematica';
export * from '@core/math/fisica/mecanica/mecanica';
export * from '@core/math/fisica/energia/energia';
export * from '@core/math/fisica/gravitacao/gravitacao';
export * from '@core/math/fisica/fluidos/fluidos';
export * from '@core/math/fisica/movimento/movimento';
