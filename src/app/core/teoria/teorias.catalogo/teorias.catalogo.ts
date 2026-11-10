/**
 * Catálogo de todas as teorias do currículo, importadas de uma vez.
 *
 * Serve às travas globais: todo id citado em `vejaTambem` existe, todo conceito
 * de exercício existe, e o índice gerado `registro-teorias.ts` corresponde aos
 * arquivos. Só os testes importam este arquivo — a aplicação continua
 * carregando a teoria de cada tópico sob demanda.
 */
import { Teoria } from '@core/teoria/models/teoria.model';
import { TEORIA_EQUACAO_1 as t_equacao_primeiro_grau } from '@features/algebra/equacao-primeiro-grau/equacao-primeiro-grau.teoria';
import { TEORIA_EQUACAO_2 as t_equacao_segundo_grau } from '@features/algebra/equacao-segundo-grau/equacao-segundo-grau.teoria';
import { TEORIA_EXPRESSOES as t_expressoes_algebricas } from '@features/algebra/expressoes-algebricas/expressoes-algebricas.teoria';
import { TEORIA_FATORACAO as t_fatoracao } from '@features/algebra/fatoracao/fatoracao.teoria';
import { TEORIA_ONDAS_E_SOM as t_ondas_e_som } from '@features/ondas-e-fisica-moderna/ondas-e-som/ondas-e-som.teoria';
import { TEORIA_OPTICA as t_optica } from '@features/ondas-e-fisica-moderna/optica/optica.teoria';
import { TEORIA_FISICA_MODERNA as t_fisica_moderna } from '@features/ondas-e-fisica-moderna/fisica-moderna/fisica-moderna.teoria';
import { TEORIA_INEQUACOES as t_inequacoes } from '@features/algebra/inequacoes/inequacoes.teoria';
import { TEORIA_POLIEDROS as t_poliedros } from '@features/geometria/poliedros/poliedros.teoria';
import { TEORIA_FISICA_COM_CALCULO as t_fisica_com_calculo } from '@features/calculo-2/fisica-com-calculo/fisica-com-calculo.teoria';
import { TEORIA_POLARES as t_coordenadas_polares } from '@features/geometria-analitica/coordenadas-polares/coordenadas-polares.teoria';
import { TEORIA_BINOMIO as t_binomio_de_newton } from '@features/estatistica/binomio-de-newton/binomio-de-newton.teoria';
import { TEORIA_EQUACOES_EXPONENCIAIS as t_equacoes_exponenciais } from '@features/funcoes/equacoes-exponenciais/equacoes-exponenciais.teoria';
import { TEORIA_INEQUACOES_SEGUNDO_GRAU as t_inequacoes_segundo_grau } from '@features/algebra/inequacoes-segundo-grau/inequacoes-segundo-grau.teoria';
import { TEORIA_POLINOMIOS as t_polinomios } from '@features/algebra/polinomios/polinomios.teoria';
import { TEORIA_PRODUTOS as t_produtos_notaveis } from '@features/algebra/produtos-notaveis/produtos-notaveis.teoria';
import { TEORIA_RACIONAIS as t_funcoes_racionais } from '@features/funcoes/funcoes-racionais/funcoes-racionais.teoria';
import { TEORIA_POR_PARTES as t_funcoes_por_partes } from '@features/funcoes/funcoes-por-partes/funcoes-por-partes.teoria';
import { TEORIA_TRANSFORMACOES as t_transformacoes_de_graficos } from '@features/funcoes/transformacoes-de-graficos/transformacoes-de-graficos.teoria';
import { TEORIA_PROGRESSOES as t_progressoes } from '@features/funcoes/progressoes/progressoes.teoria';
import { TEORIA_SISTEMAS as t_sistemas_lineares } from '@features/algebra/sistemas-lineares/sistemas-lineares.teoria';
import { TEORIA_APLICACOES_DERIVADA as t_aplicacoes_da_derivada } from '@features/calculo-1/aplicacoes-da-derivada/aplicacoes-da-derivada.teoria';
import { TEORIA_CONTINUIDADE as t_continuidade } from '@features/calculo-1/continuidade/continuidade.teoria';
import { TEORIA_DEFINICAO_DERIVADA as t_definicao_de_derivada } from '@features/calculo-1/definicao-de-derivada/definicao-de-derivada.teoria';
import { TEORIA_LATERAIS as t_limites_laterais } from '@features/calculo-1/limites-laterais/limites-laterais.teoria';
import { TEORIA_LIMITES as t_limites } from '@features/calculo-1/limites/limites.teoria';
import { TEORIA_DERIVACAO_IMPLICITA as t_derivacao_implicita } from '@features/calculo-1/derivacao-implicita/derivacao-implicita.teoria';
import { TEORIA_DERIVADAS_EXP_LOG as t_derivadas_exponencial_logaritmo } from '@features/calculo-1/derivadas-exponencial-logaritmo/derivadas-exponencial-logaritmo.teoria';
import { TEORIA_DERIVADAS_TRIG as t_derivadas_trigonometricas } from '@features/calculo-1/derivadas-trigonometricas/derivadas-trigonometricas.teoria';
import { TEORIA_CADEIA as t_regra_da_cadeia } from '@features/calculo-1/regra-da-cadeia/regra-da-cadeia.teoria';
import { TEORIA_REGRAS as t_regras_de_derivacao } from '@features/calculo-1/regras-de-derivacao/regras-de-derivacao.teoria';
import { TEORIA_TAXA as t_taxa_de_variacao } from '@features/calculo-1/taxa-de-variacao/taxa-de-variacao.teoria';
import { TEORIA_APLICACOES_INTEGRAL as t_aplicacoes_da_integral } from '@features/calculo-2/aplicacoes-da-integral/aplicacoes-da-integral.teoria';
import { TEORIA_DEFINIDA as t_integral_definida } from '@features/calculo-2/integral-definida/integral-definida.teoria';
import { TEORIA_INDEFINIDA as t_integral_indefinida } from '@features/calculo-2/integral-indefinida/integral-indefinida.teoria';
import { TEORIA_IMPROPRIAS as t_integrais_improprias } from '@features/calculo-2/integrais-improprias/integrais-improprias.teoria';
import { TEORIA_TAYLOR as t_series_de_taylor } from '@features/calculo-2/series-de-taylor/series-de-taylor.teoria';
import { TEORIA_RIEMANN as t_soma_de_riemann } from '@features/calculo-2/soma-de-riemann/soma-de-riemann.teoria';
import { TEORIA_TECNICAS as t_tecnicas_de_integracao } from '@features/calculo-2/tecnicas-de-integracao/tecnicas-de-integracao.teoria';
import { TEORIA_TFC as t_teorema_fundamental } from '@features/calculo-2/teorema-fundamental/teorema-fundamental.teoria';
import { TEORIA_REGRESSAO as t_regressao_e_correlacao } from '@features/estatistica/regressao-e-correlacao/regressao-e-correlacao.teoria';
import { TEORIA_NORMAL as t_distribuicao_normal } from '@features/estatistica/distribuicao-normal/distribuicao-normal.teoria';
import { TEORIA_COMBINATORIA as t_analise_combinatoria } from '@features/estatistica/analise-combinatoria/analise-combinatoria.teoria';
import { TEORIA_INCERTEZA as t_estatistica_e_incerteza } from '@features/estatistica/estatistica-e-incerteza/estatistica-e-incerteza.teoria';
import { TEORIA_PROBABILIDADE as t_probabilidade } from '@features/estatistica/probabilidade/probabilidade.teoria';
import { TEORIA_TERMICA as t_transferencia_de_calor } from '@features/fisica/transferencia-de-calor/transferencia-de-calor.teoria';
import { TEORIA_CINEMATICA_VETORIAL as t_cinematica_vetorial } from '@features/fisica/cinematica-vetorial/cinematica-vetorial.teoria';
import { TEORIA_MOVIMENTO_CIRCULAR as t_movimento_circular } from '@features/fisica/movimento-circular/movimento-circular.teoria';
import { TEORIA_DINAMICA_ROTACIONAL as t_dinamica_rotacional } from '@features/fisica/dinamica-rotacional/dinamica-rotacional.teoria';
import { TEORIA_MOMENTO_ANGULAR as t_momento_angular } from '@features/fisica/momento-angular/momento-angular.teoria';
import { TEORIA_DIMENSIONAL as t_analise_dimensional } from '@features/fisica/analise-dimensional/analise-dimensional.teoria';
import { TEORIA_CINEMATICA as t_cinematica_escalar } from '@features/fisica/cinematica-escalar/cinematica-escalar.teoria';
import { TEORIA_TORQUE as t_estatica_e_torque } from '@features/fisica/estatica-e-torque/estatica-e-torque.teoria';
import { TEORIA_FLUIDOS as t_fluidos_e_aerodinamica } from '@features/fisica/fluidos-e-aerodinamica/fluidos-e-aerodinamica.teoria';
import { TEORIA_GRAVITACAO as t_gravitacao_e_orbitas } from '@features/fisica/gravitacao-e-orbitas/gravitacao-e-orbitas.teoria';
import { TEORIA_MOMENTO as t_impulso_e_momento } from '@features/fisica/impulso-e-momento/impulso-e-momento.teoria';
import { TEORIA_NEWTON as t_leis_de_newton } from '@features/fisica/leis-de-newton/leis-de-newton.teoria';
import { TEORIA_MHS as t_movimento_harmonico } from '@features/fisica/movimento-harmonico/movimento-harmonico.teoria';
import { TEORIA_PROPULSAO as t_propulsao_de_foguetes } from '@features/fisica/propulsao-de-foguetes/propulsao-de-foguetes.teoria';
import { TEORIA_ELETROSTATICA as t_eletrostatica } from '@features/eletromagnetismo/eletrostatica/eletrostatica.teoria';
import { TEORIA_POTENCIAL_CAPACITORES as t_potencial_e_capacitores } from '@features/eletromagnetismo/potencial-e-capacitores/potencial-e-capacitores.teoria';
import { TEORIA_CIRCUITOS as t_circuitos } from '@features/eletromagnetismo/circuitos/circuitos.teoria';
import { TEORIA_MAGNETISMO as t_magnetismo_e_inducao } from '@features/eletromagnetismo/magnetismo-e-inducao/magnetismo-e-inducao.teoria';
import { TEORIA_TERMO as t_termodinamica_e_gases } from '@features/fisica/termodinamica-e-gases/termodinamica-e-gases.teoria';
import { TEORIA_ENERGIA as t_trabalho_e_energia } from '@features/fisica/trabalho-e-energia/trabalho-e-energia.teoria';
import { TEORIA_BALISTICA as t_trajetoria_balistica } from '@features/fisica/trajetoria-balistica/trajetoria-balistica.teoria';
import { TEORIA_COMPOSICAO as t_composicao_inversa } from '@features/funcoes/composicao-inversa/composicao-inversa.teoria';
import { TEORIA_CONCEITO as t_conceito_funcao } from '@features/funcoes/conceito-funcao/conceito-funcao.teoria';
import { TEORIA_AFIM as t_funcao_afim } from '@features/funcoes/funcao-afim/funcao-afim.teoria';
import { TEORIA_EXPONENCIAL as t_funcao_exponencial } from '@features/funcoes/funcao-exponencial/funcao-exponencial.teoria';
import { TEORIA_LOGARITMICA as t_funcao_logaritmica } from '@features/funcoes/funcao-logaritmica/funcao-logaritmica.teoria';
import { TEORIA_MODULAR as t_funcao_modular } from '@features/funcoes/funcao-modular/funcao-modular.teoria';
import { TEORIA_QUADRATICA as t_funcao_quadratica } from '@features/funcoes/funcao-quadratica/funcao-quadratica.teoria';
import { TEORIA_JUROS as t_juros_compostos } from '@features/funcoes/juros-compostos/juros-compostos.teoria';
import { TEORIA_PARAMETRICAS as t_equacoes_parametricas } from '@features/geometria-analitica/equacoes-parametricas/equacoes-parametricas.teoria';
import { TEORIA_CIRCUNFERENCIA as t_circunferencia } from '@features/geometria-analitica/circunferencia/circunferencia.teoria';
import { TEORIA_CONICAS as t_conicas } from '@features/geometria-analitica/conicas/conicas.teoria';
import { TEORIA_PONTO_RETA as t_ponto_e_reta } from '@features/geometria-analitica/ponto-e-reta/ponto-e-reta.teoria';
import { TEORIA_ANGULOS as t_angulos_e_triangulos } from '@features/geometria/angulos-e-triangulos/angulos-e-triangulos.teoria';
import { TEORIA_AREAS as t_areas_de_figuras_planas } from '@features/geometria/areas-de-figuras-planas/areas-de-figuras-planas.teoria';
import { TEORIA_CIRCULO as t_circulo_e_poligonos } from '@features/geometria/circulo-e-poligonos/circulo-e-poligonos.teoria';
import { TEORIA_SEMELHANCA as t_semelhanca_e_pitagoras } from '@features/geometria/semelhanca-e-pitagoras/semelhanca-e-pitagoras.teoria';
import { TEORIA_SOLIDOS as t_solidos_e_volumes } from '@features/geometria/solidos-e-volumes/solidos-e-volumes.teoria';
import { TEORIA_FRACOES as t_fracoes } from '@features/matematica-basica/fracoes/fracoes.teoria';
import { TEORIA_NOTACAO as t_notacao_matematica } from '@features/matematica-basica/notacao-matematica/notacao-matematica.teoria';
import { TEORIA_MMC_MDC as t_mmc_mdc } from '@features/matematica-basica/mmc-mdc/mmc-mdc.teoria';
import { TEORIA_DECIMAIS as t_numeros_decimais } from '@features/matematica-basica/numeros-decimais/numeros-decimais.teoria';
import { TEORIA_OPERACOES as t_operacoes_fundamentais } from '@features/matematica-basica/operacoes-fundamentais/operacoes-fundamentais.teoria';
import { TEORIA_POTENCIAS as t_potenciacao_radiciacao } from '@features/matematica-basica/potenciacao-radiciacao/potenciacao-radiciacao.teoria';
import { TEORIA_PROPORCAO as t_razao_proporcao } from '@features/matematica-basica/razao-proporcao/razao-proporcao.teoria';
import { TEORIA_LIMITE_INTUITIVO as t_nocao_intuitiva_de_limite } from '@features/pre-calculo/nocao-intuitiva-de-limite/nocao-intuitiva-de-limite.teoria';
import { TEORIA_SEQUENCIAS as t_sequencias_e_series } from '@features/calculo-2/sequencias-e-series/sequencias-e-series.teoria';
import { TEORIA_VIZINHANCAS as t_vizinhancas_e_infinito } from '@features/pre-calculo/vizinhancas-e-infinito/vizinhancas-e-infinito.teoria';
import { TEORIA_CIRCULO as t_circulo_trigonometrico } from '@features/trigonometria/circulo-trigonometrico/circulo-trigonometrico.teoria';
import { TEORIA_ONDAS as t_funcoes_trigonometricas } from '@features/trigonometria/funcoes-trigonometricas/funcoes-trigonometricas.teoria';
import { TEORIA_EQUACOES_TRIG as t_equacoes_trigonometricas } from '@features/trigonometria/equacoes-trigonometricas/equacoes-trigonometricas.teoria';
import { TEORIA_IDENTIDADES as t_identidades_trigonometricas } from '@features/trigonometria/identidades-trigonometricas/identidades-trigonometricas.teoria';
import { TEORIA_LEIS as t_lei_senos_cossenos } from '@features/trigonometria/lei-senos-cossenos/lei-senos-cossenos.teoria';
import { TEORIA_RAZOES as t_seno_cosseno_tangente } from '@features/trigonometria/seno-cosseno-tangente/seno-cosseno-tangente.teoria';
import { TEORIA_TRIANGULO as t_triangulo_retangulo } from '@features/trigonometria/triangulo-retangulo/triangulo-retangulo.teoria';
import { TEORIA_MATRIZES as t_matrizes_determinantes } from '@features/vetores-matrizes/matrizes-determinantes/matrizes-determinantes.teoria';
import { TEORIA_ESCALONAMENTO as t_escalonamento_e_inversa } from '@features/vetores-matrizes/escalonamento-e-inversa/escalonamento-e-inversa.teoria';
import { TEORIA_COMPLEXOS as t_numeros_complexos } from '@features/vetores-matrizes/numeros-complexos/numeros-complexos.teoria';
import { TEORIA_PRODUTOS as t_produto_escalar_vetorial } from '@features/vetores-matrizes/produto-escalar-vetorial/produto-escalar-vetorial.teoria';
import { TEORIA_VETORES_ESPACO as t_vetores_no_espaco } from '@features/vetores-matrizes/vetores-no-espaco/vetores-no-espaco.teoria';
import { TEORIA_VETORES as t_vetores_no_plano } from '@features/vetores-matrizes/vetores-no-plano/vetores-no-plano.teoria';
import { TEORIA_MULTIVAR as t_funcoes_de_varias_variaveis } from '@features/calculo-3/funcoes-de-varias-variaveis/funcoes-de-varias-variaveis.teoria';
import { TEORIA_PARCIAIS as t_derivadas_parciais } from '@features/calculo-3/derivadas-parciais/derivadas-parciais.teoria';
import { TEORIA_GRADIENTE as t_gradiente_e_direcional } from '@features/calculo-3/gradiente-e-direcional/gradiente-e-direcional.teoria';
import { TEORIA_MULTIPLAS as t_integrais_multiplas } from '@features/calculo-3/integrais-multiplas/integrais-multiplas.teoria';
import { TEORIA_COORDENADAS as t_coordenadas_no_espaco } from '@features/calculo-3/coordenadas-no-espaco/coordenadas-no-espaco.teoria';
import { TEORIA_LINHA as t_integrais_de_linha } from '@features/calculo-3/integrais-de-linha/integrais-de-linha.teoria';
import { TEORIA_TEOREMAS_INTEGRAIS as t_teoremas_integrais } from '@features/calculo-3/teoremas-integrais/teoremas-integrais.teoria';
import { TEORIA_EDO1 as t_edo_primeira_ordem } from '@features/calculo-4/edo-primeira-ordem/edo-primeira-ordem.teoria';
import { TEORIA_EDO2 as t_edo_segunda_ordem } from '@features/calculo-4/edo-segunda-ordem/edo-segunda-ordem.teoria';
import { TEORIA_APLICACOES_EDO as t_aplicacoes_de_edo } from '@features/calculo-4/aplicacoes-de-edo/aplicacoes-de-edo.teoria';
import { TEORIA_NUMERICO as t_metodos_numericos } from '@features/calculo-4/metodos-numericos/metodos-numericos.teoria';

export const TODAS_AS_TEORIAS: readonly (readonly [string, readonly Teoria[]])[] = [
  ['equacao-primeiro-grau', t_equacao_primeiro_grau],
  ['equacao-segundo-grau', t_equacao_segundo_grau],
  ['expressoes-algebricas', t_expressoes_algebricas],
  ['fatoracao', t_fatoracao],
  ['inequacoes', t_inequacoes],
  ['ondas-e-som', t_ondas_e_som],
  ['optica', t_optica],
  ['fisica-moderna', t_fisica_moderna],
  ['inequacoes-segundo-grau', t_inequacoes_segundo_grau],
  ['equacoes-exponenciais', t_equacoes_exponenciais],
  ['binomio-de-newton', t_binomio_de_newton],
  ['coordenadas-polares', t_coordenadas_polares],
  ['fisica-com-calculo', t_fisica_com_calculo],
  ['poliedros', t_poliedros],
  ['polinomios', t_polinomios],
  ['produtos-notaveis', t_produtos_notaveis],
  ['progressoes', t_progressoes],
  ['sistemas-lineares', t_sistemas_lineares],
  ['aplicacoes-da-derivada', t_aplicacoes_da_derivada],
  ['continuidade', t_continuidade],
  ['definicao-de-derivada', t_definicao_de_derivada],
  ['limites-laterais', t_limites_laterais],
  ['limites', t_limites],
  ['regra-da-cadeia', t_regra_da_cadeia],
  ['derivadas-trigonometricas', t_derivadas_trigonometricas],
  ['derivadas-exponencial-logaritmo', t_derivadas_exponencial_logaritmo],
  ['derivacao-implicita', t_derivacao_implicita],
  ['integrais-improprias', t_integrais_improprias],
  ['series-de-taylor', t_series_de_taylor],
  ['regras-de-derivacao', t_regras_de_derivacao],
  ['taxa-de-variacao', t_taxa_de_variacao],
  ['aplicacoes-da-integral', t_aplicacoes_da_integral],
  ['integral-definida', t_integral_definida],
  ['integral-indefinida', t_integral_indefinida],
  ['soma-de-riemann', t_soma_de_riemann],
  ['tecnicas-de-integracao', t_tecnicas_de_integracao],
  ['teorema-fundamental', t_teorema_fundamental],
  ['analise-combinatoria', t_analise_combinatoria],
  ['estatistica-e-incerteza', t_estatistica_e_incerteza],
  ['probabilidade', t_probabilidade],
  ['regressao-e-correlacao', t_regressao_e_correlacao],
  ['distribuicao-normal', t_distribuicao_normal],
  ['analise-dimensional', t_analise_dimensional],
  ['cinematica-escalar', t_cinematica_escalar],
  ['transferencia-de-calor', t_transferencia_de_calor],
  ['cinematica-vetorial', t_cinematica_vetorial],
  ['movimento-circular', t_movimento_circular],
  ['dinamica-rotacional', t_dinamica_rotacional],
  ['momento-angular', t_momento_angular],
  ['estatica-e-torque', t_estatica_e_torque],
  ['fluidos-e-aerodinamica', t_fluidos_e_aerodinamica],
  ['gravitacao-e-orbitas', t_gravitacao_e_orbitas],
  ['impulso-e-momento', t_impulso_e_momento],
  ['leis-de-newton', t_leis_de_newton],
  ['movimento-harmonico', t_movimento_harmonico],
  ['propulsao-de-foguetes', t_propulsao_de_foguetes],
  ['eletrostatica', t_eletrostatica],
  ['potencial-e-capacitores', t_potencial_e_capacitores],
  ['circuitos', t_circuitos],
  ['magnetismo-e-inducao', t_magnetismo_e_inducao],
  ['termodinamica-e-gases', t_termodinamica_e_gases],
  ['trabalho-e-energia', t_trabalho_e_energia],
  ['trajetoria-balistica', t_trajetoria_balistica],
  ['composicao-inversa', t_composicao_inversa],
  ['conceito-funcao', t_conceito_funcao],
  ['funcoes-racionais', t_funcoes_racionais],
  ['funcoes-por-partes', t_funcoes_por_partes],
  ['transformacoes-de-graficos', t_transformacoes_de_graficos],
  ['funcao-afim', t_funcao_afim],
  ['funcao-exponencial', t_funcao_exponencial],
  ['funcao-logaritmica', t_funcao_logaritmica],
  ['funcao-modular', t_funcao_modular],
  ['funcao-quadratica', t_funcao_quadratica],
  ['juros-compostos', t_juros_compostos],
  ['circunferencia', t_circunferencia],
  ['conicas', t_conicas],
  ['ponto-e-reta', t_ponto_e_reta],
  ['equacoes-parametricas', t_equacoes_parametricas],
  ['angulos-e-triangulos', t_angulos_e_triangulos],
  ['areas-de-figuras-planas', t_areas_de_figuras_planas],
  ['circulo-e-poligonos', t_circulo_e_poligonos],
  ['semelhanca-e-pitagoras', t_semelhanca_e_pitagoras],
  ['solidos-e-volumes', t_solidos_e_volumes],
  ['fracoes', t_fracoes],
  ['notacao-matematica', t_notacao_matematica],
  ['mmc-mdc', t_mmc_mdc],
  ['numeros-decimais', t_numeros_decimais],
  ['operacoes-fundamentais', t_operacoes_fundamentais],
  ['potenciacao-radiciacao', t_potenciacao_radiciacao],
  ['razao-proporcao', t_razao_proporcao],
  ['nocao-intuitiva-de-limite', t_nocao_intuitiva_de_limite],
  ['sequencias-e-series', t_sequencias_e_series],
  ['vizinhancas-e-infinito', t_vizinhancas_e_infinito],
  ['circulo-trigonometrico', t_circulo_trigonometrico],
  ['funcoes-trigonometricas', t_funcoes_trigonometricas],
  ['identidades-trigonometricas', t_identidades_trigonometricas],
  ['equacoes-trigonometricas', t_equacoes_trigonometricas],
  ['lei-senos-cossenos', t_lei_senos_cossenos],
  ['seno-cosseno-tangente', t_seno_cosseno_tangente],
  ['triangulo-retangulo', t_triangulo_retangulo],
  ['matrizes-determinantes', t_matrizes_determinantes],
  ['escalonamento-e-inversa', t_escalonamento_e_inversa],
  ['numeros-complexos', t_numeros_complexos],
  ['produto-escalar-vetorial', t_produto_escalar_vetorial],
  ['vetores-no-plano', t_vetores_no_plano],
  ['vetores-no-espaco', t_vetores_no_espaco],
  ['funcoes-de-varias-variaveis', t_funcoes_de_varias_variaveis],
  ['derivadas-parciais', t_derivadas_parciais],
  ['gradiente-e-direcional', t_gradiente_e_direcional],
  ['integrais-multiplas', t_integrais_multiplas],
  ['coordenadas-no-espaco', t_coordenadas_no_espaco],
  ['integrais-de-linha', t_integrais_de_linha],
  ['teoremas-integrais', t_teoremas_integrais],
  ['edo-primeira-ordem', t_edo_primeira_ordem],
  ['edo-segunda-ordem', t_edo_segunda_ordem],
  ['aplicacoes-de-edo', t_aplicacoes_de_edo],
  ['metodos-numericos', t_metodos_numericos],
];
