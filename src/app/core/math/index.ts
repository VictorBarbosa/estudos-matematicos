/**
 * Ponto de entrada do motor matemático.
 *
 * Tudo aqui é TypeScript puro, sem nenhuma dependência do Angular, para que a
 * matemática possa ser testada isoladamente e reaproveitada entre tópicos —
 * Função Quadrática e Equação do 2º grau usam as mesmas raízes, Frações e
 * MMC/MDC usam os mesmos inteiros.
 */
export * from './tipos';

// Números
export * from './numeros/inteiros';
export * from './numeros/divisibilidade';
export * from './numeros/fracao';
export * from './numeros/fracao-operacoes';
export * from './numeros/decimais';
export * from './numeros/porcentagem';
export * from './numeros/potencias';
export * from './numeros/notacao-cientifica';
export * from './numeros/proporcao';
export * from './numeros/expressoes';

// Álgebra
export * from './algebra/polinomio';
export * from './algebra/divisao-polinomial';
export * from './algebra/equacao-linear';
export * from './algebra/equacao-quadratica';
export * from './algebra/produtos-notaveis';
export * from './algebra/fatoracao';
export * from './algebra/sistema-linear';
export * from './algebra/inequacao';
export * from './algebra/vetores';
export * from './algebra/matrizes';
export * from './algebra/complexos';

// Funções
export * from './funcoes/elementares';
export * from './funcoes/composicao';

// Trigonometria
export * from './trigonometria/trigonometria';

// Geometria analítica
export * from './geometria/plana';
export * from './geometria/espacial';
export * from './geometria/analitica';

// Cálculo
export * from './calculo/sequencias';
export * from './calculo/limites';
export * from './calculo/derivadas';
export * from './calculo/integrais';

// Combinatória e estatística
export * from './estatistica/contagem';
export * from './estatistica/descritiva';

// Física e finanças
export * from './fisica/dimensional';
export * from './fisica/cinematica';
export * from './fisica/mecanica';
export * from './fisica/energia';
export * from './fisica/gravitacao';
export * from './fisica/fluidos';
export * from './fisica/movimento';
