/**
 * Catálogo de todos os geradores do currículo.
 *
 * Existe para que as travas globais — variedade, formato de resposta,
 * renderização das fórmulas, ids de conceito — valham para os 75 tópicos sem
 * que cada teste refaça a lista. Só os testes importam este arquivo; ele não
 * entra no bundle da aplicação.
 */
import { GeradorExercicio } from '@core/treino/models/treino.model';
import { geradorAtomos as g_atomos_isotopos_ions } from '@features/quimica/atomos-isotopos-ions/atomos-isotopos-ions.gerador';
import { geradorMol as g_mol_e_massa_molar } from '@features/quimica/mol-e-massa-molar/mol-e-massa-molar.gerador';
import { geradorEquacao1 as g_equacao_primeiro_grau } from '@features/algebra/equacao-primeiro-grau/equacao-primeiro-grau.gerador';
import { geradorEquacao2 as g_equacao_segundo_grau } from '@features/algebra/equacao-segundo-grau/equacao-segundo-grau.gerador';
import { geradorExpressoes as g_expressoes_algebricas } from '@features/algebra/expressoes-algebricas/expressoes-algebricas.gerador';
import { geradorFatoracao as g_fatoracao } from '@features/algebra/fatoracao/fatoracao.gerador';
import { geradorOndasESom as g_ondas_e_som } from '@features/ondas-e-fisica-moderna/ondas-e-som/ondas-e-som.gerador';
import { geradorOptica as g_optica } from '@features/ondas-e-fisica-moderna/optica/optica.gerador';
import { geradorFisicaModerna as g_fisica_moderna } from '@features/ondas-e-fisica-moderna/fisica-moderna/fisica-moderna.gerador';
import { geradorInequacoes as g_inequacoes } from '@features/algebra/inequacoes/inequacoes.gerador';
import { geradorPoliedros as g_poliedros } from '@features/geometria/poliedros/poliedros.gerador';
import { geradorFisicaComCalculo as g_fisica_com_calculo } from '@features/calculo-2/fisica-com-calculo/fisica-com-calculo.gerador';
import { geradorPolares as g_coordenadas_polares } from '@features/geometria-analitica/coordenadas-polares/coordenadas-polares.gerador';
import { geradorBinomio as g_binomio_de_newton } from '@features/estatistica/binomio-de-newton/binomio-de-newton.gerador';
import { geradorEquacoesExponenciais as g_equacoes_exponenciais } from '@features/funcoes/equacoes-exponenciais/equacoes-exponenciais.gerador';
import { geradorInequacoesSegundoGrau as g_inequacoes_segundo_grau } from '@features/algebra/inequacoes-segundo-grau/inequacoes-segundo-grau.gerador';
import { geradorPolinomios as g_polinomios } from '@features/algebra/polinomios/polinomios.gerador';
import { geradorProdutos as g_produtos_notaveis } from '@features/algebra/produtos-notaveis/produtos-notaveis.gerador';
import { geradorFuncoesRacionais as g_funcoes_racionais } from '@features/funcoes/funcoes-racionais/funcoes-racionais.gerador';
import { geradorFuncoesPorPartes as g_funcoes_por_partes } from '@features/funcoes/funcoes-por-partes/funcoes-por-partes.gerador';
import { geradorTransformacoes as g_transformacoes_de_graficos } from '@features/funcoes/transformacoes-de-graficos/transformacoes-de-graficos.gerador';
import { geradorProgressoes as g_progressoes } from '@features/funcoes/progressoes/progressoes.gerador';
import { geradorSistemas as g_sistemas_lineares } from '@features/algebra/sistemas-lineares/sistemas-lineares.gerador';
import { geradorAplicacoesDerivada as g_aplicacoes_da_derivada } from '@features/calculo-1/aplicacoes-da-derivada/aplicacoes-da-derivada.gerador';
import { geradorContinuidade as g_continuidade } from '@features/calculo-1/continuidade/continuidade.gerador';
import { geradorDefinicaoDerivada as g_definicao_de_derivada } from '@features/calculo-1/definicao-de-derivada/definicao-de-derivada.gerador';
import { geradorLimites as g_limites } from '@features/calculo-1/limites/limites.gerador';
import { geradorLaterais as g_limites_laterais } from '@features/calculo-1/limites-laterais/limites-laterais.gerador';
import { geradorDerivacaoImplicita as g_derivacao_implicita } from '@features/calculo-1/derivacao-implicita/derivacao-implicita.gerador';
import { geradorDerivadasExpLog as g_derivadas_exponencial_logaritmo } from '@features/calculo-1/derivadas-exponencial-logaritmo/derivadas-exponencial-logaritmo.gerador';
import { geradorDerivadasTrig as g_derivadas_trigonometricas } from '@features/calculo-1/derivadas-trigonometricas/derivadas-trigonometricas.gerador';
import { geradorCadeia as g_regra_da_cadeia } from '@features/calculo-1/regra-da-cadeia/regra-da-cadeia.gerador';
import { geradorRegras as g_regras_de_derivacao } from '@features/calculo-1/regras-de-derivacao/regras-de-derivacao.gerador';
import { geradorTaxa as g_taxa_de_variacao } from '@features/calculo-1/taxa-de-variacao/taxa-de-variacao.gerador';
import { geradorAplicacoesIntegral as g_aplicacoes_da_integral } from '@features/calculo-2/aplicacoes-da-integral/aplicacoes-da-integral.gerador';
import { geradorDefinida as g_integral_definida } from '@features/calculo-2/integral-definida/integral-definida.gerador';
import { geradorIndefinida as g_integral_indefinida } from '@features/calculo-2/integral-indefinida/integral-indefinida.gerador';
import { geradorIntegraisImproprias as g_integrais_improprias } from '@features/calculo-2/integrais-improprias/integrais-improprias.gerador';
import { geradorSeriesDeTaylor as g_series_de_taylor } from '@features/calculo-2/series-de-taylor/series-de-taylor.gerador';
import { geradorRiemann as g_soma_de_riemann } from '@features/calculo-2/soma-de-riemann/soma-de-riemann.gerador';
import { geradorTecnicas as g_tecnicas_de_integracao } from '@features/calculo-2/tecnicas-de-integracao/tecnicas-de-integracao.gerador';
import { geradorTfc as g_teorema_fundamental } from '@features/calculo-2/teorema-fundamental/teorema-fundamental.gerador';
import { geradorRegressaoCorrelacao as g_regressao_e_correlacao } from '@features/estatistica/regressao-e-correlacao/regressao-e-correlacao.gerador';
import { geradorDistribuicaoNormal as g_distribuicao_normal } from '@features/estatistica/distribuicao-normal/distribuicao-normal.gerador';
import { geradorCombinatoria as g_analise_combinatoria } from '@features/estatistica/analise-combinatoria/analise-combinatoria.gerador';
import { geradorIncerteza as g_estatistica_e_incerteza } from '@features/estatistica/estatistica-e-incerteza/estatistica-e-incerteza.gerador';
import { geradorProbabilidade as g_probabilidade } from '@features/estatistica/probabilidade/probabilidade.gerador';
import { geradorTransferenciaDeCalor as g_transferencia_de_calor } from '@features/fisica/transferencia-de-calor/transferencia-de-calor.gerador';
import { geradorCinematicaVetorial as g_cinematica_vetorial } from '@features/fisica/cinematica-vetorial/cinematica-vetorial.gerador';
import { geradorMovimentoCircular as g_movimento_circular } from '@features/fisica/movimento-circular/movimento-circular.gerador';
import { geradorDinamicaRotacional as g_dinamica_rotacional } from '@features/fisica/dinamica-rotacional/dinamica-rotacional.gerador';
import { geradorMomentoAngular as g_momento_angular } from '@features/fisica/momento-angular/momento-angular.gerador';
import { geradorDimensional as g_analise_dimensional } from '@features/fisica/analise-dimensional/analise-dimensional.gerador';
import { geradorCinematica as g_cinematica_escalar } from '@features/fisica/cinematica-escalar/cinematica-escalar.gerador';
import { geradorTorque as g_estatica_e_torque } from '@features/fisica/estatica-e-torque/estatica-e-torque.gerador';
import { geradorFluidos as g_fluidos_e_aerodinamica } from '@features/fisica/fluidos-e-aerodinamica/fluidos-e-aerodinamica.gerador';
import { geradorGravitacao as g_gravitacao_e_orbitas } from '@features/fisica/gravitacao-e-orbitas/gravitacao-e-orbitas.gerador';
import { geradorMomento as g_impulso_e_momento } from '@features/fisica/impulso-e-momento/impulso-e-momento.gerador';
import { geradorNewton as g_leis_de_newton } from '@features/fisica/leis-de-newton/leis-de-newton.gerador';
import { geradorMhs as g_movimento_harmonico } from '@features/fisica/movimento-harmonico/movimento-harmonico.gerador';
import { geradorPropulsao as g_propulsao_de_foguetes } from '@features/fisica/propulsao-de-foguetes/propulsao-de-foguetes.gerador';
import { geradorEletrostatica as g_eletrostatica } from '@features/eletromagnetismo/eletrostatica/eletrostatica.gerador';
import { geradorPotencialCapacitores as g_potencial_e_capacitores } from '@features/eletromagnetismo/potencial-e-capacitores/potencial-e-capacitores.gerador';
import { geradorCircuitos as g_circuitos } from '@features/eletromagnetismo/circuitos/circuitos.gerador';
import { geradorMagnetismo as g_magnetismo_e_inducao } from '@features/eletromagnetismo/magnetismo-e-inducao/magnetismo-e-inducao.gerador';
import { geradorTermo as g_termodinamica_e_gases } from '@features/fisica/termodinamica-e-gases/termodinamica-e-gases.gerador';
import { geradorEnergia as g_trabalho_e_energia } from '@features/fisica/trabalho-e-energia/trabalho-e-energia.gerador';
import { geradorBalistica as g_trajetoria_balistica } from '@features/fisica/trajetoria-balistica/trajetoria-balistica.gerador';
import { geradorComposicao as g_composicao_inversa } from '@features/funcoes/composicao-inversa/composicao-inversa.gerador';
import { geradorConceito as g_conceito_funcao } from '@features/funcoes/conceito-funcao/conceito-funcao.gerador';
import { geradorAfim as g_funcao_afim } from '@features/funcoes/funcao-afim/funcao-afim.gerador';
import { geradorExponencial as g_funcao_exponencial } from '@features/funcoes/funcao-exponencial/funcao-exponencial.gerador';
import { geradorLogaritmica as g_funcao_logaritmica } from '@features/funcoes/funcao-logaritmica/funcao-logaritmica.gerador';
import { geradorModular as g_funcao_modular } from '@features/funcoes/funcao-modular/funcao-modular.gerador';
import { geradorQuadratica as g_funcao_quadratica } from '@features/funcoes/funcao-quadratica/funcao-quadratica.gerador';
import { geradorJuros as g_juros_compostos } from '@features/funcoes/juros-compostos/juros-compostos.gerador';
import { geradorAngulos as g_angulos_e_triangulos } from '@features/geometria/angulos-e-triangulos/angulos-e-triangulos.gerador';
import { geradorAreas as g_areas_de_figuras_planas } from '@features/geometria/areas-de-figuras-planas/areas-de-figuras-planas.gerador';
import { geradorCirculo as g_circulo_e_poligonos } from '@features/geometria/circulo-e-poligonos/circulo-e-poligonos.gerador';
import { geradorSemelhanca as g_semelhanca_e_pitagoras } from '@features/geometria/semelhanca-e-pitagoras/semelhanca-e-pitagoras.gerador';
import { geradorSolidos as g_solidos_e_volumes } from '@features/geometria/solidos-e-volumes/solidos-e-volumes.gerador';
import { geradorEquacoesParametricas as g_equacoes_parametricas } from '@features/geometria-analitica/equacoes-parametricas/equacoes-parametricas.gerador';
import { geradorCircunferencia as g_circunferencia } from '@features/geometria-analitica/circunferencia/circunferencia.gerador';
import { geradorConicas as g_conicas } from '@features/geometria-analitica/conicas/conicas.gerador';
import { geradorPontoReta as g_ponto_e_reta } from '@features/geometria-analitica/ponto-e-reta/ponto-e-reta.gerador';
import { geradorFracoes as g_fracoes } from '@features/matematica-basica/fracoes/fracoes.gerador';
import { geradorNotacao as g_notacao_matematica } from '@features/matematica-basica/notacao-matematica/notacao-matematica.gerador';
import { geradorMmcMdc as g_mmc_mdc } from '@features/matematica-basica/mmc-mdc/mmc-mdc.gerador';
import { geradorDecimais as g_numeros_decimais } from '@features/matematica-basica/numeros-decimais/numeros-decimais.gerador';
import { geradorOperacoes as g_operacoes_fundamentais } from '@features/matematica-basica/operacoes-fundamentais/operacoes-fundamentais.gerador';
import { geradorPotencias as g_potenciacao_radiciacao } from '@features/matematica-basica/potenciacao-radiciacao/potenciacao-radiciacao.gerador';
import { geradorProporcao as g_razao_proporcao } from '@features/matematica-basica/razao-proporcao/razao-proporcao.gerador';
import { geradorLimiteIntuitivo as g_nocao_intuitiva_de_limite } from '@features/pre-calculo/nocao-intuitiva-de-limite/nocao-intuitiva-de-limite.gerador';
import { geradorSequencias as g_sequencias_e_series } from '@features/calculo-2/sequencias-e-series/sequencias-e-series.gerador';
import { geradorVizinhancas as g_vizinhancas_e_infinito } from '@features/pre-calculo/vizinhancas-e-infinito/vizinhancas-e-infinito.gerador';
import { geradorCirculo as g_circulo_trigonometrico } from '@features/trigonometria/circulo-trigonometrico/circulo-trigonometrico.gerador';
import { geradorOndas as g_funcoes_trigonometricas } from '@features/trigonometria/funcoes-trigonometricas/funcoes-trigonometricas.gerador';
import { geradorEquacoesTrig as g_equacoes_trigonometricas } from '@features/trigonometria/equacoes-trigonometricas/equacoes-trigonometricas.gerador';
import { geradorIdentidades as g_identidades_trigonometricas } from '@features/trigonometria/identidades-trigonometricas/identidades-trigonometricas.gerador';
import { geradorLeis as g_lei_senos_cossenos } from '@features/trigonometria/lei-senos-cossenos/lei-senos-cossenos.gerador';
import { geradorRazoes as g_seno_cosseno_tangente } from '@features/trigonometria/seno-cosseno-tangente/seno-cosseno-tangente.gerador';
import { geradorTriangulo as g_triangulo_retangulo } from '@features/trigonometria/triangulo-retangulo/triangulo-retangulo.gerador';
import { geradorMatrizes as g_matrizes_determinantes } from '@features/vetores-matrizes/matrizes-determinantes/matrizes-determinantes.gerador';
import { geradorRetasPlanos as g_retas_e_planos } from '@features/vetores-matrizes/retas-e-planos/retas-e-planos.gerador';
import { geradorEscalonamento as g_escalonamento_e_inversa } from '@features/vetores-matrizes/escalonamento-e-inversa/escalonamento-e-inversa.gerador';
import { geradorComplexos as g_numeros_complexos } from '@features/vetores-matrizes/numeros-complexos/numeros-complexos.gerador';
import { geradorProdutos as g_produto_escalar_vetorial } from '@features/vetores-matrizes/produto-escalar-vetorial/produto-escalar-vetorial.gerador';
import { geradorVetores3 as g_vetores_no_espaco } from '@features/vetores-matrizes/vetores-no-espaco/vetores-no-espaco.gerador';
import { geradorVetores as g_vetores_no_plano } from '@features/vetores-matrizes/vetores-no-plano/vetores-no-plano.gerador';
import { geradorFuncoesVariasVariaveis as g_funcoes_de_varias_variaveis } from '@features/calculo-3/funcoes-de-varias-variaveis/funcoes-de-varias-variaveis.gerador';
import { geradorDerivadasParciais as g_derivadas_parciais } from '@features/calculo-3/derivadas-parciais/derivadas-parciais.gerador';
import { geradorGradiente as g_gradiente_e_direcional } from '@features/calculo-3/gradiente-e-direcional/gradiente-e-direcional.gerador';
import { geradorIntegraisMultiplas as g_integrais_multiplas } from '@features/calculo-3/integrais-multiplas/integrais-multiplas.gerador';
import { geradorCoordenadasNoEspaco as g_coordenadas_no_espaco } from '@features/calculo-3/coordenadas-no-espaco/coordenadas-no-espaco.gerador';
import { geradorIntegraisDeLinha as g_integrais_de_linha } from '@features/calculo-3/integrais-de-linha/integrais-de-linha.gerador';
import { geradorTeoremasIntegrais as g_teoremas_integrais } from '@features/calculo-3/teoremas-integrais/teoremas-integrais.gerador';
import { geradorEdoPrimeiraOrdem as g_edo_primeira_ordem } from '@features/calculo-4/edo-primeira-ordem/edo-primeira-ordem.gerador';
import { geradorEdoSegundaOrdem as g_edo_segunda_ordem } from '@features/calculo-4/edo-segunda-ordem/edo-segunda-ordem.gerador';
import { geradorAplicacoesDeEdo as g_aplicacoes_de_edo } from '@features/calculo-4/aplicacoes-de-edo/aplicacoes-de-edo.gerador';
import { geradorMetodosNumericos as g_metodos_numericos } from '@features/calculo-4/metodos-numericos/metodos-numericos.gerador';

/**
 * Todos os geradores do currículo, para medir a variedade de uma vez.
 *
 * Dois tópicos exportam nomes iguais (`geradorCirculo`, `geradorProdutos`),
 * então cada importação recebe um apelido pelo nome da pasta.
 */
export const TODOS_OS_GERADORES: readonly (readonly [string, GeradorExercicio<unknown>])[] = [
  ['equacao-primeiro-grau', g_equacao_primeiro_grau],
  ['equacao-segundo-grau', g_equacao_segundo_grau],
  ['expressoes-algebricas', g_expressoes_algebricas],
  ['fatoracao', g_fatoracao],
  ['inequacoes', g_inequacoes],
  ['ondas-e-som', g_ondas_e_som],
  ['optica', g_optica],
  ['fisica-moderna', g_fisica_moderna],
  ['inequacoes-segundo-grau', g_inequacoes_segundo_grau],
  ['equacoes-exponenciais', g_equacoes_exponenciais],
  ['binomio-de-newton', g_binomio_de_newton],
  ['coordenadas-polares', g_coordenadas_polares],
  ['fisica-com-calculo', g_fisica_com_calculo],
  ['poliedros', g_poliedros],
  ['polinomios', g_polinomios],
  ['produtos-notaveis', g_produtos_notaveis],
  ['progressoes', g_progressoes],
  ['sistemas-lineares', g_sistemas_lineares],
  ['aplicacoes-da-derivada', g_aplicacoes_da_derivada],
  ['continuidade', g_continuidade],
  ['definicao-de-derivada', g_definicao_de_derivada],
  ['limites', g_limites],
  ['limites-laterais', g_limites_laterais],
  ['regra-da-cadeia', g_regra_da_cadeia],
  ['derivadas-trigonometricas', g_derivadas_trigonometricas],
  ['derivadas-exponencial-logaritmo', g_derivadas_exponencial_logaritmo],
  ['derivacao-implicita', g_derivacao_implicita],
  ['integrais-improprias', g_integrais_improprias],
  ['series-de-taylor', g_series_de_taylor],
  ['regras-de-derivacao', g_regras_de_derivacao],
  ['taxa-de-variacao', g_taxa_de_variacao],
  ['aplicacoes-da-integral', g_aplicacoes_da_integral],
  ['integral-definida', g_integral_definida],
  ['integral-indefinida', g_integral_indefinida],
  ['soma-de-riemann', g_soma_de_riemann],
  ['tecnicas-de-integracao', g_tecnicas_de_integracao],
  ['teorema-fundamental', g_teorema_fundamental],
  ['analise-combinatoria', g_analise_combinatoria],
  ['estatistica-e-incerteza', g_estatistica_e_incerteza],
  ['probabilidade', g_probabilidade],
  ['regressao-e-correlacao', g_regressao_e_correlacao],
  ['distribuicao-normal', g_distribuicao_normal],
  ['analise-dimensional', g_analise_dimensional],
  ['cinematica-escalar', g_cinematica_escalar],
  ['transferencia-de-calor', g_transferencia_de_calor],
  ['cinematica-vetorial', g_cinematica_vetorial],
  ['movimento-circular', g_movimento_circular],
  ['dinamica-rotacional', g_dinamica_rotacional],
  ['momento-angular', g_momento_angular],
  ['estatica-e-torque', g_estatica_e_torque],
  ['fluidos-e-aerodinamica', g_fluidos_e_aerodinamica],
  ['gravitacao-e-orbitas', g_gravitacao_e_orbitas],
  ['impulso-e-momento', g_impulso_e_momento],
  ['leis-de-newton', g_leis_de_newton],
  ['movimento-harmonico', g_movimento_harmonico],
  ['propulsao-de-foguetes', g_propulsao_de_foguetes],
  ['eletrostatica', g_eletrostatica],
  ['potencial-e-capacitores', g_potencial_e_capacitores],
  ['circuitos', g_circuitos],
  ['magnetismo-e-inducao', g_magnetismo_e_inducao],
  ['termodinamica-e-gases', g_termodinamica_e_gases],
  ['trabalho-e-energia', g_trabalho_e_energia],
  ['trajetoria-balistica', g_trajetoria_balistica],
  ['composicao-inversa', g_composicao_inversa],
  ['conceito-funcao', g_conceito_funcao],
  ['funcoes-racionais', g_funcoes_racionais],
  ['funcoes-por-partes', g_funcoes_por_partes],
  ['transformacoes-de-graficos', g_transformacoes_de_graficos],
  ['funcao-afim', g_funcao_afim],
  ['funcao-exponencial', g_funcao_exponencial],
  ['funcao-logaritmica', g_funcao_logaritmica],
  ['funcao-modular', g_funcao_modular],
  ['funcao-quadratica', g_funcao_quadratica],
  ['juros-compostos', g_juros_compostos],
  ['angulos-e-triangulos', g_angulos_e_triangulos],
  ['areas-de-figuras-planas', g_areas_de_figuras_planas],
  ['circulo-e-poligonos', g_circulo_e_poligonos],
  ['semelhanca-e-pitagoras', g_semelhanca_e_pitagoras],
  ['solidos-e-volumes', g_solidos_e_volumes],
  ['circunferencia', g_circunferencia],
  ['conicas', g_conicas],
  ['ponto-e-reta', g_ponto_e_reta],
  ['equacoes-parametricas', g_equacoes_parametricas],
  ['fracoes', g_fracoes],
  ['notacao-matematica', g_notacao_matematica],
  ['mmc-mdc', g_mmc_mdc],
  ['numeros-decimais', g_numeros_decimais],
  ['operacoes-fundamentais', g_operacoes_fundamentais],
  ['potenciacao-radiciacao', g_potenciacao_radiciacao],
  ['razao-proporcao', g_razao_proporcao],
  ['nocao-intuitiva-de-limite', g_nocao_intuitiva_de_limite],
  ['sequencias-e-series', g_sequencias_e_series],
  ['vizinhancas-e-infinito', g_vizinhancas_e_infinito],
  ['circulo-trigonometrico', g_circulo_trigonometrico],
  ['funcoes-trigonometricas', g_funcoes_trigonometricas],
  ['identidades-trigonometricas', g_identidades_trigonometricas],
  ['equacoes-trigonometricas', g_equacoes_trigonometricas],
  ['lei-senos-cossenos', g_lei_senos_cossenos],
  ['seno-cosseno-tangente', g_seno_cosseno_tangente],
  ['triangulo-retangulo', g_triangulo_retangulo],
  ['matrizes-determinantes', g_matrizes_determinantes],
  ['escalonamento-e-inversa', g_escalonamento_e_inversa],
  ['retas-e-planos', g_retas_e_planos],
  ['numeros-complexos', g_numeros_complexos],
  ['produto-escalar-vetorial', g_produto_escalar_vetorial],
  ['vetores-no-plano', g_vetores_no_plano],
  ['vetores-no-espaco', g_vetores_no_espaco],
  ['funcoes-de-varias-variaveis', g_funcoes_de_varias_variaveis],
  ['derivadas-parciais', g_derivadas_parciais],
  ['gradiente-e-direcional', g_gradiente_e_direcional],
  ['integrais-multiplas', g_integrais_multiplas],
  ['coordenadas-no-espaco', g_coordenadas_no_espaco],
  ['integrais-de-linha', g_integrais_de_linha],
  ['teoremas-integrais', g_teoremas_integrais],
  ['edo-primeira-ordem', g_edo_primeira_ordem],
  ['edo-segunda-ordem', g_edo_segunda_ordem],
  ['aplicacoes-de-edo', g_aplicacoes_de_edo],
  ['metodos-numericos', g_metodos_numericos],
  ['atomos-isotopos-ions', g_atomos_isotopos_ions],
  ['mol-e-massa-molar', g_mol_e_massa_molar],
];
