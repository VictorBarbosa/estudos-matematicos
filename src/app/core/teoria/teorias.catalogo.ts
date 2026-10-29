/**
 * Catálogo de todas as teorias do currículo, importadas de uma vez.
 *
 * Serve às travas globais: todo id citado em `vejaTambem` existe, todo conceito
 * de exercício existe, e o índice gerado `registro-teorias.ts` corresponde aos
 * arquivos. Só os testes importam este arquivo — a aplicação continua
 * carregando a teoria de cada tópico sob demanda.
 */
import { Teoria } from '@core/teoria/teoria.model';
import { TEORIA_EQUACAO_1 as t_equacao_primeiro_grau } from '@features/algebra/equacao-primeiro-grau/equacao-primeiro-grau.teoria';
import { TEORIA_EQUACAO_2 as t_equacao_segundo_grau } from '@features/algebra/equacao-segundo-grau/equacao-segundo-grau.teoria';
import { TEORIA_EXPRESSOES as t_expressoes_algebricas } from '@features/algebra/expressoes-algebricas/expressoes-algebricas.teoria';
import { TEORIA_FATORACAO as t_fatoracao } from '@features/algebra/fatoracao/fatoracao.teoria';
import { TEORIA_INEQUACOES as t_inequacoes } from '@features/algebra/inequacoes/inequacoes.teoria';
import { TEORIA_POLINOMIOS as t_polinomios } from '@features/algebra/polinomios/polinomios.teoria';
import { TEORIA_PRODUTOS as t_produtos_notaveis } from '@features/algebra/produtos-notaveis/produtos-notaveis.teoria';
import { TEORIA_PROGRESSOES as t_progressoes } from '@features/funcoes/progressoes/progressoes.teoria';
import { TEORIA_SISTEMAS as t_sistemas_lineares } from '@features/algebra/sistemas-lineares/sistemas-lineares.teoria';
import { TEORIA_APLICACOES_DERIVADA as t_aplicacoes_da_derivada } from '@features/calculo-1/aplicacoes-da-derivada/aplicacoes-da-derivada.teoria';
import { TEORIA_CONTINUIDADE as t_continuidade } from '@features/calculo-1/continuidade/continuidade.teoria';
import { TEORIA_DEFINICAO_DERIVADA as t_definicao_de_derivada } from '@features/calculo-1/definicao-de-derivada/definicao-de-derivada.teoria';
import { TEORIA_LATERAIS as t_limites_laterais } from '@features/calculo-1/limites-laterais/limites-laterais.teoria';
import { TEORIA_LIMITES as t_limites } from '@features/calculo-1/limites/limites.teoria';
import { TEORIA_CADEIA as t_regra_da_cadeia } from '@features/calculo-1/regra-da-cadeia/regra-da-cadeia.teoria';
import { TEORIA_REGRAS as t_regras_de_derivacao } from '@features/calculo-1/regras-de-derivacao/regras-de-derivacao.teoria';
import { TEORIA_TAXA as t_taxa_de_variacao } from '@features/calculo-1/taxa-de-variacao/taxa-de-variacao.teoria';
import { TEORIA_APLICACOES_INTEGRAL as t_aplicacoes_da_integral } from '@features/calculo-2/aplicacoes-da-integral/aplicacoes-da-integral.teoria';
import { TEORIA_DEFINIDA as t_integral_definida } from '@features/calculo-2/integral-definida/integral-definida.teoria';
import { TEORIA_INDEFINIDA as t_integral_indefinida } from '@features/calculo-2/integral-indefinida/integral-indefinida.teoria';
import { TEORIA_RIEMANN as t_soma_de_riemann } from '@features/calculo-2/soma-de-riemann/soma-de-riemann.teoria';
import { TEORIA_TECNICAS as t_tecnicas_de_integracao } from '@features/calculo-2/tecnicas-de-integracao/tecnicas-de-integracao.teoria';
import { TEORIA_TFC as t_teorema_fundamental } from '@features/calculo-2/teorema-fundamental/teorema-fundamental.teoria';
import { TEORIA_COMBINATORIA as t_analise_combinatoria } from '@features/estatistica/analise-combinatoria/analise-combinatoria.teoria';
import { TEORIA_INCERTEZA as t_estatistica_e_incerteza } from '@features/estatistica/estatistica-e-incerteza/estatistica-e-incerteza.teoria';
import { TEORIA_PROBABILIDADE as t_probabilidade } from '@features/estatistica/probabilidade/probabilidade.teoria';
import { TEORIA_DIMENSIONAL as t_analise_dimensional } from '@features/fisica/analise-dimensional/analise-dimensional.teoria';
import { TEORIA_CINEMATICA as t_cinematica_escalar } from '@features/fisica/cinematica-escalar/cinematica-escalar.teoria';
import { TEORIA_TORQUE as t_estatica_e_torque } from '@features/fisica/estatica-e-torque/estatica-e-torque.teoria';
import { TEORIA_FLUIDOS as t_fluidos_e_aerodinamica } from '@features/fisica/fluidos-e-aerodinamica/fluidos-e-aerodinamica.teoria';
import { TEORIA_GRAVITACAO as t_gravitacao_e_orbitas } from '@features/fisica/gravitacao-e-orbitas/gravitacao-e-orbitas.teoria';
import { TEORIA_MOMENTO as t_impulso_e_momento } from '@features/fisica/impulso-e-momento/impulso-e-momento.teoria';
import { TEORIA_NEWTON as t_leis_de_newton } from '@features/fisica/leis-de-newton/leis-de-newton.teoria';
import { TEORIA_MHS as t_movimento_harmonico } from '@features/fisica/movimento-harmonico/movimento-harmonico.teoria';
import { TEORIA_PROPULSAO as t_propulsao_de_foguetes } from '@features/fisica/propulsao-de-foguetes/propulsao-de-foguetes.teoria';
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
import { TEORIA_CIRCUNFERENCIA as t_circunferencia } from '@features/geometria-analitica/circunferencia/circunferencia.teoria';
import { TEORIA_CONICAS as t_conicas } from '@features/geometria-analitica/conicas/conicas.teoria';
import { TEORIA_PONTO_RETA as t_ponto_e_reta } from '@features/geometria-analitica/ponto-e-reta/ponto-e-reta.teoria';
import { TEORIA_ANGULOS as t_angulos_e_triangulos } from '@features/geometria/angulos-e-triangulos/angulos-e-triangulos.teoria';
import { TEORIA_AREAS as t_areas_de_figuras_planas } from '@features/geometria/areas-de-figuras-planas/areas-de-figuras-planas.teoria';
import { TEORIA_CIRCULO as t_circulo_e_poligonos } from '@features/geometria/circulo-e-poligonos/circulo-e-poligonos.teoria';
import { TEORIA_SEMELHANCA as t_semelhanca_e_pitagoras } from '@features/geometria/semelhanca-e-pitagoras/semelhanca-e-pitagoras.teoria';
import { TEORIA_SOLIDOS as t_solidos_e_volumes } from '@features/geometria/solidos-e-volumes/solidos-e-volumes.teoria';
import { TEORIA_FRACOES as t_fracoes } from '@features/matematica-basica/fracoes/fracoes.teoria';
import { TEORIA_MMC_MDC as t_mmc_mdc } from '@features/matematica-basica/mmc-mdc/mmc-mdc.teoria';
import { TEORIA_NOTACAO as t_notacao_cientifica_unidades } from '@features/matematica-basica/notacao-cientifica-unidades/notacao-cientifica-unidades.teoria';
import { TEORIA_DECIMAIS as t_numeros_decimais } from '@features/matematica-basica/numeros-decimais/numeros-decimais.teoria';
import { TEORIA_OPERACOES as t_operacoes_fundamentais } from '@features/matematica-basica/operacoes-fundamentais/operacoes-fundamentais.teoria';
import { TEORIA_PORCENTAGEM as t_porcentagem } from '@features/matematica-basica/porcentagem/porcentagem.teoria';
import { TEORIA_POTENCIAS as t_potenciacao_radiciacao } from '@features/matematica-basica/potenciacao-radiciacao/potenciacao-radiciacao.teoria';
import { TEORIA_PROPORCAO as t_razao_proporcao } from '@features/matematica-basica/razao-proporcao/razao-proporcao.teoria';
import { TEORIA_LIMITE_INTUITIVO as t_nocao_intuitiva_de_limite } from '@features/pre-calculo/nocao-intuitiva-de-limite/nocao-intuitiva-de-limite.teoria';
import { TEORIA_SEQUENCIAS as t_sequencias_e_series } from '@features/pre-calculo/sequencias-e-series/sequencias-e-series.teoria';
import { TEORIA_VIZINHANCAS as t_vizinhancas_e_infinito } from '@features/pre-calculo/vizinhancas-e-infinito/vizinhancas-e-infinito.teoria';
import { TEORIA_CIRCULO as t_circulo_trigonometrico } from '@features/trigonometria/circulo-trigonometrico/circulo-trigonometrico.teoria';
import { TEORIA_ONDAS as t_funcoes_trigonometricas } from '@features/trigonometria/funcoes-trigonometricas/funcoes-trigonometricas.teoria';
import { TEORIA_IDENTIDADES as t_identidades_trigonometricas } from '@features/trigonometria/identidades-trigonometricas/identidades-trigonometricas.teoria';
import { TEORIA_LEIS as t_lei_senos_cossenos } from '@features/trigonometria/lei-senos-cossenos/lei-senos-cossenos.teoria';
import { TEORIA_RAZOES as t_seno_cosseno_tangente } from '@features/trigonometria/seno-cosseno-tangente/seno-cosseno-tangente.teoria';
import { TEORIA_TRIANGULO as t_triangulo_retangulo } from '@features/trigonometria/triangulo-retangulo/triangulo-retangulo.teoria';
import { TEORIA_MATRIZES as t_matrizes_determinantes } from '@features/vetores-matrizes/matrizes-determinantes/matrizes-determinantes.teoria';
import { TEORIA_COMPLEXOS as t_numeros_complexos } from '@features/vetores-matrizes/numeros-complexos/numeros-complexos.teoria';
import { TEORIA_PRODUTOS as t_produto_escalar_vetorial } from '@features/vetores-matrizes/produto-escalar-vetorial/produto-escalar-vetorial.teoria';
import { TEORIA_VETORES as t_vetores_no_plano } from '@features/vetores-matrizes/vetores-no-plano/vetores-no-plano.teoria';

export const TODAS_AS_TEORIAS: readonly (readonly [string, readonly Teoria[]])[] = [
  ['equacao-primeiro-grau', t_equacao_primeiro_grau],
  ['equacao-segundo-grau', t_equacao_segundo_grau],
  ['expressoes-algebricas', t_expressoes_algebricas],
  ['fatoracao', t_fatoracao],
  ['inequacoes', t_inequacoes],
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
  ['analise-dimensional', t_analise_dimensional],
  ['cinematica-escalar', t_cinematica_escalar],
  ['estatica-e-torque', t_estatica_e_torque],
  ['fluidos-e-aerodinamica', t_fluidos_e_aerodinamica],
  ['gravitacao-e-orbitas', t_gravitacao_e_orbitas],
  ['impulso-e-momento', t_impulso_e_momento],
  ['leis-de-newton', t_leis_de_newton],
  ['movimento-harmonico', t_movimento_harmonico],
  ['propulsao-de-foguetes', t_propulsao_de_foguetes],
  ['termodinamica-e-gases', t_termodinamica_e_gases],
  ['trabalho-e-energia', t_trabalho_e_energia],
  ['trajetoria-balistica', t_trajetoria_balistica],
  ['composicao-inversa', t_composicao_inversa],
  ['conceito-funcao', t_conceito_funcao],
  ['funcao-afim', t_funcao_afim],
  ['funcao-exponencial', t_funcao_exponencial],
  ['funcao-logaritmica', t_funcao_logaritmica],
  ['funcao-modular', t_funcao_modular],
  ['funcao-quadratica', t_funcao_quadratica],
  ['juros-compostos', t_juros_compostos],
  ['circunferencia', t_circunferencia],
  ['conicas', t_conicas],
  ['ponto-e-reta', t_ponto_e_reta],
  ['angulos-e-triangulos', t_angulos_e_triangulos],
  ['areas-de-figuras-planas', t_areas_de_figuras_planas],
  ['circulo-e-poligonos', t_circulo_e_poligonos],
  ['semelhanca-e-pitagoras', t_semelhanca_e_pitagoras],
  ['solidos-e-volumes', t_solidos_e_volumes],
  ['fracoes', t_fracoes],
  ['mmc-mdc', t_mmc_mdc],
  ['notacao-cientifica-unidades', t_notacao_cientifica_unidades],
  ['numeros-decimais', t_numeros_decimais],
  ['operacoes-fundamentais', t_operacoes_fundamentais],
  ['porcentagem', t_porcentagem],
  ['potenciacao-radiciacao', t_potenciacao_radiciacao],
  ['razao-proporcao', t_razao_proporcao],
  ['nocao-intuitiva-de-limite', t_nocao_intuitiva_de_limite],
  ['sequencias-e-series', t_sequencias_e_series],
  ['vizinhancas-e-infinito', t_vizinhancas_e_infinito],
  ['circulo-trigonometrico', t_circulo_trigonometrico],
  ['funcoes-trigonometricas', t_funcoes_trigonometricas],
  ['identidades-trigonometricas', t_identidades_trigonometricas],
  ['lei-senos-cossenos', t_lei_senos_cossenos],
  ['seno-cosseno-tangente', t_seno_cosseno_tangente],
  ['triangulo-retangulo', t_triangulo_retangulo],
  ['matrizes-determinantes', t_matrizes_determinantes],
  ['numeros-complexos', t_numeros_complexos],
  ['produto-escalar-vetorial', t_produto_escalar_vetorial],
  ['vetores-no-plano', t_vetores_no_plano],
];
