/**
 * Os enunciados de cada tópico, reunidos para o site ler.
 *
 * O texto de um tópico vive no arquivo do tópico — `fracoes.json` tem as
 * perguntas de Frações e nada mais. Um arquivo só, com os 128 tópicos juntos,
 * passava de meio megabyte: achar a pergunta que se quer editar era rolar por
 * milhares de linhas, e duas pessoas mexendo em tópicos diferentes brigavam
 * pelo mesmo arquivo.
 *
 * Este catálogo é a única parte que precisa saber de todos. Ele é CONFERIDO
 * por `scripts/verificar-moldes.mjs`: um `.json` novo na pasta que não esteja
 * aqui reprova a verificação, porque o site simplesmente não o veria.
 */

import operacoesFundamentais from '@core/enunciados/enunciados/operacoes-fundamentais.json';
import razaoProporcao from '@core/enunciados/enunciados/razao-proporcao.json';
import areasDeFigurasPlanas from '@core/enunciados/enunciados/areas-de-figuras-planas.json';
import fracoes from '@core/enunciados/enunciados/fracoes.json';
import numerosDecimais from '@core/enunciados/enunciados/numeros-decimais.json';
import expressoesAlgebricas from '@core/enunciados/enunciados/expressoes-algebricas.json';
import equacaoPrimeiroGrau from '@core/enunciados/enunciados/equacao-primeiro-grau.json';
import equacaoSegundoGrau from '@core/enunciados/enunciados/equacao-segundo-grau.json';
import polinomios from '@core/enunciados/enunciados/polinomios.json';
import angulosETriangulos from '@core/enunciados/enunciados/angulos-e-triangulos.json';
import semelhancaEPitagoras from '@core/enunciados/enunciados/semelhanca-e-pitagoras.json';
import circuloEPoligonos from '@core/enunciados/enunciados/circulo-e-poligonos.json';
import poliedros from '@core/enunciados/enunciados/poliedros.json';
import solidosEVolumes from '@core/enunciados/enunciados/solidos-e-volumes.json';
import atomosIsotoposIons from '@core/enunciados/enunciados/atomos-isotopos-ions.json';
import estruturaEletronica from '@core/enunciados/enunciados/estrutura-eletronica.json';
import tabelaELigacao from '@core/enunciados/enunciados/tabela-e-ligacao.json';
import formulasENomenclatura from '@core/enunciados/enunciados/formulas-e-nomenclatura.json';
import molEMassaMolar from '@core/enunciados/enunciados/mol-e-massa-molar.json';
import equacoesEBalanceamento from '@core/enunciados/enunciados/equacoes-e-balanceamento.json';
import estequiometria from '@core/enunciados/enunciados/estequiometria.json';
import limitanteERendimento from '@core/enunciados/enunciados/limitante-e-rendimento.json';
import composicaoEFormula from '@core/enunciados/enunciados/composicao-e-formula.json';
import solucoesEConcentracao from '@core/enunciados/enunciados/solucoes-e-concentracao.json';
import gasesIdeais from '@core/enunciados/enunciados/gases-ideais.json';
import conceitoFuncao from '@core/enunciados/enunciados/conceito-funcao.json';
import funcaoAfim from '@core/enunciados/enunciados/funcao-afim.json';
import funcaoQuadratica from '@core/enunciados/enunciados/funcao-quadratica.json';
import funcaoModular from '@core/enunciados/enunciados/funcao-modular.json';
import funcaoExponencial from '@core/enunciados/enunciados/funcao-exponencial.json';
import funcaoLogaritmica from '@core/enunciados/enunciados/funcao-logaritmica.json';
import equacoesExponenciais from '@core/enunciados/enunciados/equacoes-exponenciais.json';
import funcoesRacionais from '@core/enunciados/enunciados/funcoes-racionais.json';
import funcoesPorPartes from '@core/enunciados/enunciados/funcoes-por-partes.json';
import transformacoesDeGraficos from '@core/enunciados/enunciados/transformacoes-de-graficos.json';
import composicaoInversa from '@core/enunciados/enunciados/composicao-inversa.json';
import progressoes from '@core/enunciados/enunciados/progressoes.json';
import jurosCompostos from '@core/enunciados/enunciados/juros-compostos.json';
import trianguloRetangulo from '@core/enunciados/enunciados/triangulo-retangulo.json';
import senoCossenoTangente from '@core/enunciados/enunciados/seno-cosseno-tangente.json';
import circuloTrigonometrico from '@core/enunciados/enunciados/circulo-trigonometrico.json';
import funcoesTrigonometricas from '@core/enunciados/enunciados/funcoes-trigonometricas.json';
import identidadesTrigonometricas from '@core/enunciados/enunciados/identidades-trigonometricas.json';
import equacoesTrigonometricas from '@core/enunciados/enunciados/equacoes-trigonometricas.json';
import leiSenosCossenos from '@core/enunciados/enunciados/lei-senos-cossenos.json';
import vetoresNoPlano from '@core/enunciados/enunciados/vetores-no-plano.json';
import produtoEscalarVetorial from '@core/enunciados/enunciados/produto-escalar-vetorial.json';
import vetoresNoEspaco from '@core/enunciados/enunciados/vetores-no-espaco.json';
import matrizesDeterminantes from '@core/enunciados/enunciados/matrizes-determinantes.json';
import escalonamentoEInversa from '@core/enunciados/enunciados/escalonamento-e-inversa.json';
import autovaloresEAutovetores from '@core/enunciados/enunciados/autovalores-e-autovetores.json';
import retasEPlanos from '@core/enunciados/enunciados/retas-e-planos.json';
import numerosComplexos from '@core/enunciados/enunciados/numeros-complexos.json';
import pontoEReta from '@core/enunciados/enunciados/ponto-e-reta.json';
import circunferencia from '@core/enunciados/enunciados/circunferencia.json';
import conicas from '@core/enunciados/enunciados/conicas.json';
import equacoesParametricas from '@core/enunciados/enunciados/equacoes-parametricas.json';
import coordenadasPolares from '@core/enunciados/enunciados/coordenadas-polares.json';
import analiseDimensional from '@core/enunciados/enunciados/analise-dimensional.json';
import cinematicaEscalar from '@core/enunciados/enunciados/cinematica-escalar.json';
import cinematicaVetorial from '@core/enunciados/enunciados/cinematica-vetorial.json';
import movimentoCircular from '@core/enunciados/enunciados/movimento-circular.json';
import leisDeNewton from '@core/enunciados/enunciados/leis-de-newton.json';
import trajetoriaBalistica from '@core/enunciados/enunciados/trajetoria-balistica.json';
import trabalhoEEnergia from '@core/enunciados/enunciados/trabalho-e-energia.json';
import impulsoEMomento from '@core/enunciados/enunciados/impulso-e-momento.json';
import estaticaETorque from '@core/enunciados/enunciados/estatica-e-torque.json';
import dinamicaRotacional from '@core/enunciados/enunciados/dinamica-rotacional.json';
import momentoAngular from '@core/enunciados/enunciados/momento-angular.json';
import movimentoHarmonico from '@core/enunciados/enunciados/movimento-harmonico.json';
import gravitacaoEOrbitas from '@core/enunciados/enunciados/gravitacao-e-orbitas.json';
import fluidosEAerodinamica from '@core/enunciados/enunciados/fluidos-e-aerodinamica.json';
import termodinamicaEGases from '@core/enunciados/enunciados/termodinamica-e-gases.json';
import transferenciaDeCalor from '@core/enunciados/enunciados/transferencia-de-calor.json';
import propulsaoDeFoguetes from '@core/enunciados/enunciados/propulsao-de-foguetes.json';
import eletrostatica from '@core/enunciados/enunciados/eletrostatica.json';
import potencialECapacitores from '@core/enunciados/enunciados/potencial-e-capacitores.json';
import circuitos from '@core/enunciados/enunciados/circuitos.json';
import magnetismoEInducao from '@core/enunciados/enunciados/magnetismo-e-inducao.json';
import ondasESom from '@core/enunciados/enunciados/ondas-e-som.json';
import optica from '@core/enunciados/enunciados/optica.json';
import fisicaModerna from '@core/enunciados/enunciados/fisica-moderna.json';
import nocaoIntuitivaDeLimite from '@core/enunciados/enunciados/nocao-intuitiva-de-limite.json';
import vizinhancasEInfinito from '@core/enunciados/enunciados/vizinhancas-e-infinito.json';
import limites from '@core/enunciados/enunciados/limites.json';
import limitesLaterais from '@core/enunciados/enunciados/limites-laterais.json';
import continuidade from '@core/enunciados/enunciados/continuidade.json';
import definicaoDeDerivada from '@core/enunciados/enunciados/definicao-de-derivada.json';
import taxaDeVariacao from '@core/enunciados/enunciados/taxa-de-variacao.json';
import regrasDeDerivacao from '@core/enunciados/enunciados/regras-de-derivacao.json';
import regraDaCadeia from '@core/enunciados/enunciados/regra-da-cadeia.json';
import derivadasTrigonometricas from '@core/enunciados/enunciados/derivadas-trigonometricas.json';
import derivadasExponencialLogaritmo from '@core/enunciados/enunciados/derivadas-exponencial-logaritmo.json';
import derivacaoImplicita from '@core/enunciados/enunciados/derivacao-implicita.json';
import aplicacoesDaDerivada from '@core/enunciados/enunciados/aplicacoes-da-derivada.json';
import somaDeRiemann from '@core/enunciados/enunciados/soma-de-riemann.json';
import integralDefinida from '@core/enunciados/enunciados/integral-definida.json';
import integralIndefinida from '@core/enunciados/enunciados/integral-indefinida.json';
import teoremaFundamental from '@core/enunciados/enunciados/teorema-fundamental.json';
import tecnicasDeIntegracao from '@core/enunciados/enunciados/tecnicas-de-integracao.json';
import aplicacoesDaIntegral from '@core/enunciados/enunciados/aplicacoes-da-integral.json';
import fisicaComCalculo from '@core/enunciados/enunciados/fisica-com-calculo.json';
import integraisImproprias from '@core/enunciados/enunciados/integrais-improprias.json';
import sequenciasESeries from '@core/enunciados/enunciados/sequencias-e-series.json';
import seriesDeTaylor from '@core/enunciados/enunciados/series-de-taylor.json';
import analiseCombinatoria from '@core/enunciados/enunciados/analise-combinatoria.json';
import binomioDeNewton from '@core/enunciados/enunciados/binomio-de-newton.json';
import probabilidade from '@core/enunciados/enunciados/probabilidade.json';
import estatisticaEIncerteza from '@core/enunciados/enunciados/estatistica-e-incerteza.json';
import distribuicaoNormal from '@core/enunciados/enunciados/distribuicao-normal.json';
import regressaoECorrelacao from '@core/enunciados/enunciados/regressao-e-correlacao.json';
import funcoesDeVariasVariaveis from '@core/enunciados/enunciados/funcoes-de-varias-variaveis.json';
import derivadasParciais from '@core/enunciados/enunciados/derivadas-parciais.json';
import gradienteEDirecional from '@core/enunciados/enunciados/gradiente-e-direcional.json';
import integraisMultiplas from '@core/enunciados/enunciados/integrais-multiplas.json';
import coordenadasNoEspaco from '@core/enunciados/enunciados/coordenadas-no-espaco.json';
import integraisDeLinha from '@core/enunciados/enunciados/integrais-de-linha.json';
import teoremasIntegrais from '@core/enunciados/enunciados/teoremas-integrais.json';
import edoPrimeiraOrdem from '@core/enunciados/enunciados/edo-primeira-ordem.json';
import edoSegundaOrdem from '@core/enunciados/enunciados/edo-segunda-ordem.json';
import aplicacoesDeEdo from '@core/enunciados/enunciados/aplicacoes-de-edo.json';
import metodosNumericos from '@core/enunciados/enunciados/metodos-numericos.json';
import inequacoes from '@core/enunciados/enunciados/inequacoes.json';
import produtosNotaveis from '@core/enunciados/enunciados/produtos-notaveis.json';
import sistemasLineares from '@core/enunciados/enunciados/sistemas-lineares.json';
import notacaoMatematica from '@core/enunciados/enunciados/notacao-matematica.json';
import potenciacaoRadiciacao from '@core/enunciados/enunciados/potenciacao-radiciacao.json';
import fatoracao from '@core/enunciados/enunciados/fatoracao.json';

/** Um tópico do arquivo: o nome e as perguntas dele. */
export interface TopicoDeEnunciados {
  readonly topico: string;
  readonly enunciados: readonly unknown[];
}

export const ENUNCIADOS_POR_TOPICO: readonly TopicoDeEnunciados[] = [
  operacoesFundamentais,
  razaoProporcao,
  areasDeFigurasPlanas,
  fracoes,
  numerosDecimais,
  expressoesAlgebricas,
  equacaoPrimeiroGrau,
  equacaoSegundoGrau,
  polinomios,
  angulosETriangulos,
  semelhancaEPitagoras,
  circuloEPoligonos,
  poliedros,
  solidosEVolumes,
  atomosIsotoposIons,
  estruturaEletronica,
  tabelaELigacao,
  formulasENomenclatura,
  molEMassaMolar,
  equacoesEBalanceamento,
  estequiometria,
  limitanteERendimento,
  composicaoEFormula,
  solucoesEConcentracao,
  gasesIdeais,
  conceitoFuncao,
  funcaoAfim,
  funcaoQuadratica,
  funcaoModular,
  funcaoExponencial,
  funcaoLogaritmica,
  equacoesExponenciais,
  funcoesRacionais,
  funcoesPorPartes,
  transformacoesDeGraficos,
  composicaoInversa,
  progressoes,
  jurosCompostos,
  trianguloRetangulo,
  senoCossenoTangente,
  circuloTrigonometrico,
  funcoesTrigonometricas,
  identidadesTrigonometricas,
  equacoesTrigonometricas,
  leiSenosCossenos,
  vetoresNoPlano,
  produtoEscalarVetorial,
  vetoresNoEspaco,
  matrizesDeterminantes,
  escalonamentoEInversa,
  autovaloresEAutovetores,
  retasEPlanos,
  numerosComplexos,
  pontoEReta,
  circunferencia,
  conicas,
  equacoesParametricas,
  coordenadasPolares,
  analiseDimensional,
  cinematicaEscalar,
  cinematicaVetorial,
  movimentoCircular,
  leisDeNewton,
  trajetoriaBalistica,
  trabalhoEEnergia,
  impulsoEMomento,
  estaticaETorque,
  dinamicaRotacional,
  momentoAngular,
  movimentoHarmonico,
  gravitacaoEOrbitas,
  fluidosEAerodinamica,
  termodinamicaEGases,
  transferenciaDeCalor,
  propulsaoDeFoguetes,
  eletrostatica,
  potencialECapacitores,
  circuitos,
  magnetismoEInducao,
  ondasESom,
  optica,
  fisicaModerna,
  nocaoIntuitivaDeLimite,
  vizinhancasEInfinito,
  limites,
  limitesLaterais,
  continuidade,
  definicaoDeDerivada,
  taxaDeVariacao,
  regrasDeDerivacao,
  regraDaCadeia,
  derivadasTrigonometricas,
  derivadasExponencialLogaritmo,
  derivacaoImplicita,
  aplicacoesDaDerivada,
  somaDeRiemann,
  integralDefinida,
  integralIndefinida,
  teoremaFundamental,
  tecnicasDeIntegracao,
  aplicacoesDaIntegral,
  fisicaComCalculo,
  integraisImproprias,
  sequenciasESeries,
  seriesDeTaylor,
  analiseCombinatoria,
  binomioDeNewton,
  probabilidade,
  estatisticaEIncerteza,
  distribuicaoNormal,
  regressaoECorrelacao,
  funcoesDeVariasVariaveis,
  derivadasParciais,
  gradienteEDirecional,
  integraisMultiplas,
  coordenadasNoEspaco,
  integraisDeLinha,
  teoremasIntegrais,
  edoPrimeiraOrdem,
  edoSegundaOrdem,
  aplicacoesDeEdo,
  metodosNumericos,
  inequacoes,
  produtosNotaveis,
  sistemasLineares,
  notacaoMatematica,
  potenciacaoRadiciacao,
  fatoracao,
] as unknown as readonly TopicoDeEnunciados[];
