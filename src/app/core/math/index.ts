/**
 * Ponto de entrada do motor matemático.
 *
 * Tudo aqui é TypeScript puro, sem nenhuma dependência do Angular, para que a
 * matemática possa ser testada isoladamente e reaproveitada entre tópicos —
 * Função Quadrática e Equação do 2º grau usam as mesmas raízes, Frações e
 * MMC/MDC usam os mesmos inteiros.
 */
export * from '@core/math/tipos/tipos';
export * from '@core/math/notacao/notacao';

// Números
export * from '@core/math/numeros/inteiros/inteiros';
export * from '@core/math/numeros/divisibilidade/divisibilidade';
export * from '@core/math/numeros/fracao/fracao';
export * from '@core/math/numeros/fracao-operacoes/fracao-operacoes';
export * from '@core/math/numeros/decimais/decimais';
export * from '@core/math/numeros/potencias/potencias';
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
export * from '@core/math/algebra/inequacao-quadratica/inequacao-quadratica';
export * from '@core/math/algebra/vetores/vetores';
export * from '@core/math/algebra/vetores-espaco/vetores-espaco';
export * from '@core/math/algebra/matrizes/matrizes';
export * from '@core/math/algebra/escalonamento/escalonamento';
export * from '@core/math/algebra/complexos/complexos';

// Funções
export * from '@core/math/funcoes/elementares/elementares';
export * from '@core/math/funcoes/composicao/composicao';
export * from '@core/math/funcoes/racionais/racionais';
export * from '@core/math/funcoes/por-partes/por-partes';
export * from '@core/math/funcoes/transformacoes/transformacoes';

// Trigonometria
export * from '@core/math/trigonometria/trigonometria/trigonometria';
export * from '@core/math/trigonometria/equacoes-trig/equacoes-trig';

// Geometria analítica
export * from '@core/math/geometria/plana/plana';
export * from '@core/math/geometria/espacial/espacial';
export * from '@core/math/geometria/poliedros/poliedros';
export * from '@core/math/geometria/analitica/analitica';
export * from '@core/math/geometria/parametricas/parametricas';

// Cálculo
export * from '@core/math/calculo/sequencias/sequencias';
export * from '@core/math/calculo/limites/limites';
export * from '@core/math/calculo/derivadas/derivadas';
export * from '@core/math/calculo/derivadas-trig/derivadas-trig';
export * from '@core/math/calculo/derivadas-exp-log/derivadas-exp-log';
export * from '@core/math/calculo/derivacao-implicita/derivacao-implicita';
export * from '@core/math/calculo/integrais/integrais';
export * from '@core/math/calculo/integrais-improprias/integrais-improprias';
export * from '@core/math/calculo/taylor/taylor';
export * from '@core/math/calculo/multivariavel/multivariavel';
export * from '@core/math/calculo/edo/edo';

// Combinatória e estatística
export * from '@core/math/estatistica/contagem/contagem';
export * from '@core/math/estatistica/descritiva/descritiva';
export * from '@core/math/estatistica/normal/normal';
export * from '@core/math/estatistica/correlacao/correlacao';

// Física e finanças
export * from '@core/math/fisica/dimensional/dimensional';
export * from '@core/math/fisica/cinematica/cinematica';
export * from '@core/math/fisica/cinematica-vetorial/cinematica-vetorial';
export * from '@core/math/fisica/rotacao/rotacao';
export * from '@core/math/fisica/mecanica/mecanica';
export * from '@core/math/fisica/energia/energia';
export * from '@core/math/fisica/gravitacao/gravitacao';
export * from '@core/math/fisica/fluidos/fluidos';
export * from '@core/math/fisica/movimento/movimento';
export * from '@core/math/fisica/termica/termica';
export * from '@core/math/fisica/eletromagnetismo/eletromagnetismo';
export * from '@core/math/fisica/ondas/ondas';
export * from '@core/math/fisica/moderna/moderna';

// Química: a contagem das partículas e a massa atômica média.
export * from '@core/math/quimica/atomo/atomo';
export * from '@core/math/quimica/mol/mol';
export * from '@core/math/quimica/estequiometria/estequiometria';
export * from '@core/math/quimica/limitante/limitante';
export * from '@core/math/quimica/solucoes/solucoes';
export * from '@core/math/quimica/gases/gases';
export * from '@core/math/quimica/elementos/elementos';
export * from '@core/math/quimica/formula/formula';
export * from '@core/math/quimica/balanceamento/balanceamento';
export * from '@core/math/quimica/eletrons/eletrons';
export * from '@core/math/quimica/ligacao/ligacao';
export * from '@core/math/quimica/nox/nox';
