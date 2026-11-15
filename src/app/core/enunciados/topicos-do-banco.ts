/**
 * Os tópicos que PODEM ter enunciado no banco — e nenhum outro.
 *
 * A lista é uma decisão de quem estuda, não um recorte do currículo: ela veio
 * escrita, tópico por tópico, e é o contrato do arquivo de enunciados. O site
 * tem tópicos prontos que não estão aqui (notação matemática, MMC e MDC,
 * potenciação e radiciação, produtos notáveis, fatoração, inequações, estudo
 * de sinal e sistemas lineares); neles o gerador segue sozinho, como sempre
 * fez, e uma entrada escrita para eles é recusada pelo guarda.
 *
 * Mantê-la explícita, em vez de derivá-la do currículo, é o que faz a regra
 * valer: um tópico novo no currículo não entra no banco por acidente, e tirar
 * um daqui é uma linha.
 */
export const TOPICOS_DO_BANCO: readonly string[] = [
  // Matemática básica
  'operacoes-fundamentais',
  'fracoes',
  'numeros-decimais',
  'razao-proporcao',
  // Álgebra
  'expressoes-algebricas',
  'equacao-primeiro-grau',
  'equacao-segundo-grau',
  'polinomios',
  // Geometria plana e espacial
  'angulos-e-triangulos',
  'semelhanca-e-pitagoras',
  'areas-de-figuras-planas',
  'circulo-e-poligonos',
  'poliedros',
  'solidos-e-volumes',
  // Química
  'atomos-isotopos-ions',
  'estrutura-eletronica',
  'tabela-e-ligacao',
  'formulas-e-nomenclatura',
  'mol-e-massa-molar',
  'equacoes-e-balanceamento',
  'estequiometria',
  'limitante-e-rendimento',
  'composicao-e-formula',
  'solucoes-e-concentracao',
  'gases-ideais',
  // Funções
  'conceito-funcao',
  'funcao-afim',
  'funcao-quadratica',
  'funcao-modular',
  'funcao-exponencial',
  'funcao-logaritmica',
  'equacoes-exponenciais',
  'funcoes-racionais',
  'funcoes-por-partes',
  'transformacoes-de-graficos',
  'composicao-inversa',
  'progressoes',
  'juros-compostos',
  // Trigonometria
  'triangulo-retangulo',
  'seno-cosseno-tangente',
  'circulo-trigonometrico',
  'funcoes-trigonometricas',
  'identidades-trigonometricas',
  'equacoes-trigonometricas',
  'lei-senos-cossenos',
  // Vetores e matrizes
  'vetores-no-plano',
  'produto-escalar-vetorial',
  'vetores-no-espaco',
  'matrizes-determinantes',
  'escalonamento-e-inversa',
  'autovalores-e-autovetores',
  'retas-e-planos',
  'numeros-complexos',
  // Geometria analítica
  'ponto-e-reta',
  'circunferencia',
  'conicas',
  'equacoes-parametricas',
  'coordenadas-polares',
  // Física
  'analise-dimensional',
  'cinematica-escalar',
  'cinematica-vetorial',
  'movimento-circular',
  'leis-de-newton',
  'trajetoria-balistica',
  'trabalho-e-energia',
  'impulso-e-momento',
  'estatica-e-torque',
  'dinamica-rotacional',
  'momento-angular',
  'movimento-harmonico',
  'gravitacao-e-orbitas',
  'fluidos-e-aerodinamica',
  'termodinamica-e-gases',
  'transferencia-de-calor',
  'propulsao-de-foguetes',
  // Eletricidade e magnetismo
  'eletrostatica',
  'potencial-e-capacitores',
  'circuitos',
  'magnetismo-e-inducao',
  // Ondas e física moderna
  'ondas-e-som',
  'optica',
  'fisica-moderna',
  // Pré-cálculo
  'nocao-intuitiva-de-limite',
  'vizinhancas-e-infinito',
  // Cálculo 1
  'limites',
  'limites-laterais',
  'continuidade',
  'definicao-de-derivada',
  'taxa-de-variacao',
  'regras-de-derivacao',
  'regra-da-cadeia',
  'derivadas-trigonometricas',
  'derivadas-exponencial-logaritmo',
  'derivacao-implicita',
  'aplicacoes-da-derivada',
  // Cálculo 2
  'soma-de-riemann',
  'integral-definida',
  'integral-indefinida',
  'teorema-fundamental',
  'tecnicas-de-integracao',
  'aplicacoes-da-integral',
  'fisica-com-calculo',
  'integrais-improprias',
  'sequencias-e-series',
  'series-de-taylor',
  // Combinatória e estatística
  'analise-combinatoria',
  'binomio-de-newton',
  'probabilidade',
  'estatistica-e-incerteza',
  'distribuicao-normal',
  'regressao-e-correlacao',
  // Cálculo 3
  'funcoes-de-varias-variaveis',
  'derivadas-parciais',
  'gradiente-e-direcional',
  'integrais-multiplas',
  'coordenadas-no-espaco',
  'integrais-de-linha',
  'teoremas-integrais',
  // Cálculo 4
  'edo-primeira-ordem',
  'edo-segunda-ordem',
  'aplicacoes-de-edo',
  'metodos-numericos',
];
