/**
 * Roteiro de estudo do projeto: um preparatório para engenharia aeroespacial.
 *
 * O objetivo é chegar ao primeiro ano de engenharia sem buracos — não formar
 * um engenheiro. Por isso o roteiro cobre o ensino médio inteiro, mais o
 * Cálculo 1 e 2 que a faculdade pressupõe, com a física que dá sentido a tudo.
 *
 * **A ordem é um contrato.** As áreas estão dispostas por pré-requisito, e os
 * tópicos dentro de cada área também: nada aparece antes do que ele precisa.
 * É essa ordem que a trilha usa para liberar um tópico de cada vez, então
 * mover uma entrada daqui muda o que o estudante pode abrir.
 *
 * Esta é também a fonte única da navegação e da página inicial. Tópicos ainda
 * não implementados continuam listados, com `pronto: false`: o que falta fica
 * visível em vez de escondido.
 *
 * Ao concluir um tópico, basta marcar `pronto: true` e registrar sua rota no
 * arquivo de rotas da área.
 */

export interface TopicoCurriculo {
  /** Identificador estável, igual ao nome da pasta em `features/<area>/`. */
  readonly id: string;
  readonly titulo: string;
  /** O que será demonstrado neste tópico. */
  readonly descricao: string;
  /** Implementado e navegável? */
  readonly pronto: boolean;
}

export interface AreaCurriculo {
  readonly id: string;
  readonly titulo: string;
  readonly descricao: string;
  readonly topicos: readonly TopicoCurriculo[];
}

export const CURRICULO: readonly AreaCurriculo[] = [
  {
    id: 'matematica-basica',
    titulo: 'Matemática básica',
    descricao: 'O alicerce: como os números se combinam, se comparam e se medem.',
    topicos: [
      {
        id: 'operacoes-fundamentais',
        titulo: 'Operações fundamentais',
        descricao: 'Propriedades da adição e da multiplicação e a ordem das operações.',
        pronto: true,
      },
      {
        id: 'mmc-mdc',
        titulo: 'MMC e MDC',
        descricao: 'Fatoração em primos, algoritmo de Euclides e onde cada um é usado.',
        pronto: true,
      },
      {
        id: 'fracoes',
        titulo: 'Frações',
        descricao: 'Partes de um inteiro, equivalência, simplificação e as quatro operações.',
        pronto: true,
      },
      {
        id: 'numeros-decimais',
        titulo: 'Números decimais',
        descricao: 'Decimais como frações de denominador potência de dez, e dízimas periódicas.',
        pronto: true,
      },
      {
        id: 'porcentagem',
        titulo: 'Porcentagem',
        descricao: 'Porcentagem como fração de denominador cem, acréscimos e descontos sucessivos.',
        pronto: true,
      },
      {
        id: 'razao-proporcao',
        titulo: 'Razão e proporção',
        descricao: 'Comparação entre grandezas, regra de três e proporcionalidade inversa.',
        pronto: true,
      },
      {
        id: 'potenciacao-radiciacao',
        titulo: 'Potenciação e radiciação',
        descricao: 'Propriedades das potências, expoentes negativos e raízes como potências.',
        pronto: true,
      },
      {
        id: 'notacao-cientifica-unidades',
        titulo: 'Notação científica e unidades',
        descricao: 'Ordens de grandeza, prefixos do SI, conversões e algarismos significativos.',
        pronto: true,
      },
    ],
  },
  {
    id: 'algebra',
    titulo: 'Álgebra',
    descricao: 'Trocar números por letras para resolver o caso geral de uma vez.',
    topicos: [
      {
        id: 'expressoes-algebricas',
        titulo: 'Expressões algébricas',
        descricao: 'Variáveis, termos semelhantes e avaliação de expressões.',
        pronto: true,
      },
      {
        id: 'equacao-primeiro-grau',
        titulo: 'Equação do 1º grau',
        descricao: 'Resolver ax + b = 0 e ver a raiz como o cruzamento da reta com o eixo x.',
        pronto: true,
      },
      {
        id: 'produtos-notaveis',
        titulo: 'Produtos notáveis',
        descricao: 'Quadrado da soma e diferença de quadrados, com demonstração geométrica.',
        pronto: true,
      },
      {
        id: 'fatoracao',
        titulo: 'Fatoração',
        descricao: 'Fator comum, agrupamento e trinômio quadrado perfeito.',
        pronto: true,
      },
      {
        id: 'equacao-segundo-grau',
        titulo: 'Equação do 2º grau',
        descricao: 'Bhaskara, discriminante e as três situações possíveis de raízes.',
        pronto: true,
      },
      {
        id: 'inequacoes',
        titulo: 'Inequações',
        descricao: 'Desigualdades, a inversão do sinal e o conjunto solução na reta.',
        pronto: true,
      },
      {
        id: 'sistemas-lineares',
        titulo: 'Sistemas lineares',
        descricao: 'Substituição e adição, com a solução vista como intersecção de retas.',
        pronto: true,
      },
      {
        id: 'polinomios',
        titulo: 'Polinômios',
        descricao: 'Grau, divisão, teorema do resto e a busca das raízes.',
        pronto: true,
      },
      {
        id: 'progressoes',
        titulo: 'Progressões',
        descricao: 'PA e PG: termo geral, soma dos termos e onde cada padrão aparece.',
        pronto: true,
      },
    ],
  },
  {
    id: 'geometria',
    titulo: 'Geometria plana e espacial',
    descricao: 'Medir o espaço: ângulos, áreas e volumes antes de levá-los a coordenadas.',
    topicos: [
      {
        id: 'angulos-e-triangulos',
        titulo: 'Ângulos e triângulos',
        descricao: 'Soma dos ângulos, congruência e a desigualdade triangular.',
        pronto: true,
      },
      {
        id: 'semelhanca-e-pitagoras',
        titulo: 'Semelhança e Pitágoras',
        descricao: 'Razão de semelhança, teorema de Tales e a demonstração de Pitágoras.',
        pronto: true,
      },
      {
        id: 'areas-de-figuras-planas',
        titulo: 'Áreas de figuras planas',
        descricao: 'De onde vem cada fórmula de área, e por que a razão de áreas é k².',
        pronto: true,
      },
      {
        id: 'circulo-e-poligonos',
        titulo: 'Círculo e polígonos',
        descricao: 'Comprimento, área do círculo, setores e polígonos regulares.',
        pronto: true,
      },
      {
        id: 'solidos-e-volumes',
        titulo: 'Sólidos e volumes',
        descricao: 'Prismas, cilindros, cones e esferas: volume, superfície e escala cúbica.',
        pronto: true,
      },
    ],
  },
  {
    id: 'funcoes',
    titulo: 'Funções',
    descricao: 'A linguagem com que a engenharia descreve uma grandeza dependendo de outra.',
    topicos: [
      {
        id: 'conceito-funcao',
        titulo: 'Conceito de função',
        descricao: 'Domínio, contradomínio, imagem e o teste da reta vertical.',
        pronto: true,
      },
      {
        id: 'funcao-afim',
        titulo: 'Função afim',
        descricao: 'Coeficiente angular e linear, crescimento e zero da função.',
        pronto: true,
      },
      {
        id: 'funcao-quadratica',
        titulo: 'Função quadrática',
        descricao: 'Parábola, vértice, concavidade e problemas de máximo e mínimo.',
        pronto: true,
      },
      {
        id: 'funcao-modular',
        titulo: 'Função modular',
        descricao: 'Módulo como distância e o efeito do bico no gráfico.',
        pronto: true,
      },
      {
        id: 'funcao-exponencial',
        titulo: 'Função exponencial',
        descricao: 'Crescimento multiplicativo, o número e e meia-vida.',
        pronto: true,
      },
      {
        id: 'funcao-logaritmica',
        titulo: 'Função logarítmica',
        descricao: 'Logaritmo como inverso da exponencial e suas propriedades.',
        pronto: true,
      },
      {
        id: 'composicao-inversa',
        titulo: 'Composição e inversa',
        descricao: 'Encadear funções e refletir o gráfico na reta y = x.',
        pronto: true,
      },
      {
        id: 'juros-compostos',
        titulo: 'Juros compostos',
        descricao: 'Crescimento exponencial aplicado a dinheiro ao longo do tempo.',
        pronto: true,
      },
    ],
  },
  {
    id: 'trigonometria',
    titulo: 'Trigonometria',
    descricao: 'Ângulos viram números — e é assim que se calcula uma trajetória.',
    topicos: [
      {
        id: 'triangulo-retangulo',
        titulo: 'Triângulo retângulo',
        descricao: 'Seno, cosseno e tangente como razões entre lados, e Pitágoras.',
        pronto: true,
      },
      {
        id: 'seno-cosseno-tangente',
        titulo: 'Seno, cosseno e tangente',
        descricao: 'Como as três razões se relacionam e por que a tangente tem assíntotas.',
        pronto: true,
      },
      {
        id: 'circulo-trigonometrico',
        titulo: 'Círculo trigonométrico',
        descricao: 'Do triângulo ao círculo de raio 1, radianos e ângulos além de 90°.',
        pronto: true,
      },
      {
        id: 'identidades-trigonometricas',
        titulo: 'Identidades trigonométricas',
        descricao: 'A identidade fundamental, arco duplo e soma de arcos.',
        pronto: true,
      },
      {
        id: 'lei-senos-cossenos',
        titulo: 'Leis dos senos e dos cossenos',
        descricao: 'Resolver triângulos que não têm ângulo reto.',
        pronto: true,
      },
      {
        id: 'funcoes-trigonometricas',
        titulo: 'Funções trigonométricas',
        descricao: 'Amplitude, período e fase: a forma da onda.',
        pronto: true,
      },
    ],
  },
  {
    id: 'vetores-matrizes',
    titulo: 'Vetores e matrizes',
    descricao: 'Grandezas com direção e tabelas de números: o ferramental da mecânica.',
    topicos: [
      {
        id: 'vetores-no-plano',
        titulo: 'Vetores no plano',
        descricao: 'Módulo, direção e sentido, soma pela regra do paralelogramo e decomposição.',
        pronto: true,
      },
      {
        id: 'produto-escalar-vetorial',
        titulo: 'Produto escalar e vetorial',
        descricao: 'Projeção, ângulo entre vetores, trabalho e torque como produtos.',
        pronto: true,
      },
      {
        id: 'matrizes-determinantes',
        titulo: 'Matrizes e determinantes',
        descricao: 'Operações com matrizes, determinante como área e regra de Cramer.',
        pronto: true,
      },
      {
        id: 'numeros-complexos',
        titulo: 'Números complexos',
        descricao: 'O plano de Argand-Gauss, forma polar e multiplicação como rotação.',
        pronto: true,
      },
    ],
  },
  {
    id: 'geometria-analitica',
    titulo: 'Geometria analítica',
    descricao: 'Geometria resolvida com álgebra, depois que o plano ganhou coordenadas.',
    topicos: [
      {
        id: 'ponto-e-reta',
        titulo: 'Ponto e reta',
        descricao: 'Distância entre pontos, equação da reta, paralelismo e perpendicularidade.',
        pronto: true,
      },
      {
        id: 'circunferencia',
        titulo: 'Circunferência',
        descricao: 'Equação reduzida e geral, e posições relativas entre reta e circunferência.',
        pronto: true,
      },
      {
        id: 'conicas',
        titulo: 'Cônicas',
        descricao: 'Elipse, parábola e hipérbole como secções de um cone — e como órbitas.',
        pronto: true,
      },
    ],
  },
  {
    id: 'estatistica',
    titulo: 'Combinatória e estatística',
    descricao: 'Contar possibilidades e medir incerteza — nenhuma medida real é exata.',
    topicos: [
      {
        id: 'analise-combinatoria',
        titulo: 'Análise combinatória',
        descricao: 'Princípio multiplicativo, arranjos, permutações e combinações.',
        pronto: true,
      },
      {
        id: 'probabilidade',
        titulo: 'Probabilidade',
        descricao: 'Espaço amostral, eventos independentes e probabilidade condicional.',
        pronto: true,
      },
      {
        id: 'estatistica-e-incerteza',
        titulo: 'Estatística e incerteza',
        descricao: 'Média, desvio padrão, ajuste de reta e propagação de erro numa medida.',
        pronto: true,
      },
    ],
  },
  {
    id: 'fisica',
    titulo: 'Física',
    descricao: 'A matemática aplicada ao mundo: do plano inclinado ao foguete em órbita.',
    topicos: [
      {
        id: 'analise-dimensional',
        titulo: 'Grandezas e análise dimensional',
        descricao: 'Dimensões das grandezas e como conferir uma fórmula sem calcular nada.',
        pronto: true,
      },
      {
        id: 'cinematica-escalar',
        titulo: 'Cinemática escalar',
        descricao: 'MRU e MRUV, os gráficos do movimento e a área sob a curva da velocidade.',
        pronto: true,
      },
      {
        id: 'trajetoria-balistica',
        titulo: 'Trajetória balística',
        descricao: 'Lançamento oblíquo: alcance, altura máxima e tempo de voo.',
        pronto: true,
      },
      {
        id: 'leis-de-newton',
        titulo: 'Leis de Newton',
        descricao: 'Inércia, F = ma e ação e reação, com diagramas de corpo livre.',
        pronto: true,
      },
      {
        id: 'trabalho-e-energia',
        titulo: 'Trabalho e energia',
        descricao: 'Trabalho como produto escalar, energia cinética, potencial e conservação.',
        pronto: true,
      },
      {
        id: 'impulso-e-momento',
        titulo: 'Impulso e momento linear',
        descricao: 'Conservação do momento e colisões — o princípio que move um foguete.',
        pronto: true,
      },
      {
        id: 'movimento-harmonico',
        titulo: 'Movimento harmônico',
        descricao: 'Oscilação de uma mola descrita por seno e cosseno.',
        pronto: true,
      },
      {
        id: 'estatica-e-torque',
        titulo: 'Estática e torque',
        descricao: 'Equilíbrio de forças e de momentos, centro de massa e estabilidade.',
        pronto: true,
      },
      {
        id: 'gravitacao-e-orbitas',
        titulo: 'Gravitação e órbitas',
        descricao: 'Lei da gravitação, leis de Kepler, velocidade orbital e de escape.',
        pronto: true,
      },
      {
        id: 'fluidos-e-aerodinamica',
        titulo: 'Fluidos e aerodinâmica',
        descricao: 'Pressão, empuxo, equação de Bernoulli e de onde vem a sustentação.',
        pronto: true,
      },
      {
        id: 'termodinamica-e-gases',
        titulo: 'Termodinâmica e gases',
        descricao: 'Gases ideais, primeira lei e o trabalho que uma expansão realiza.',
        pronto: true,
      },
      {
        id: 'propulsao-de-foguetes',
        titulo: 'Propulsão de foguetes',
        descricao: 'Empuxo, impulso específico e a equação de Tsiolkovsky.',
        pronto: true,
      },
    ],
  },
  {
    id: 'pre-calculo',
    titulo: 'Pré-cálculo',
    descricao: 'A ponte: a ideia de aproximação, antes da máquina do cálculo.',
    topicos: [
      {
        id: 'sequencias-e-series',
        titulo: 'Sequências e séries',
        descricao: 'Progressões, somas infinitas e convergência.',
        pronto: true,
      },
      {
        id: 'vizinhancas-e-infinito',
        titulo: 'Vizinhanças e infinito',
        descricao: 'Épsilon e delta, e o comportamento de funções no infinito.',
        pronto: true,
      },
      {
        id: 'nocao-intuitiva-de-limite',
        titulo: 'Noção intuitiva de limite',
        descricao: 'Aproximar-se de um valor sem necessariamente alcançá-lo.',
        pronto: true,
      },
    ],
  },
  {
    id: 'calculo-1',
    titulo: 'Cálculo 1',
    descricao: 'Derivadas: a matemática do que muda, instante a instante.',
    topicos: [
      {
        id: 'limites',
        titulo: 'Limites',
        descricao: 'Definição formal, propriedades e indeterminações.',
        pronto: true,
      },
      {
        id: 'limites-laterais',
        titulo: 'Limites laterais',
        descricao: 'Chegar pela esquerda e pela direita, e quando o limite não existe.',
        pronto: true,
      },
      {
        id: 'continuidade',
        titulo: 'Continuidade',
        descricao: 'Funções sem saltos e o teorema do valor intermediário.',
        pronto: true,
      },
      {
        id: 'definicao-de-derivada',
        titulo: 'Definição de derivada',
        descricao: 'Da reta secante à tangente: o limite do quociente de Newton.',
        pronto: true,
      },
      {
        id: 'taxa-de-variacao',
        titulo: 'Taxa de variação',
        descricao: 'Velocidade e aceleração como derivadas da posição.',
        pronto: true,
      },
      {
        id: 'regras-de-derivacao',
        titulo: 'Regras de derivação',
        descricao: 'Potência, produto e quociente, demonstradas pela definição.',
        pronto: true,
      },
      {
        id: 'regra-da-cadeia',
        titulo: 'Regra da cadeia',
        descricao: 'Derivar funções compostas e por que os diferenciais se cancelam.',
        pronto: true,
      },
      {
        id: 'aplicacoes-da-derivada',
        titulo: 'Aplicações da derivada',
        descricao: 'Máximos e mínimos, concavidade, otimização e taxas relacionadas.',
        pronto: true,
      },
    ],
  },
  {
    id: 'calculo-2',
    titulo: 'Cálculo 2',
    descricao: 'Integrais: somar infinitas parcelas infinitamente pequenas.',
    topicos: [
      {
        id: 'soma-de-riemann',
        titulo: 'Soma de Riemann',
        descricao: 'Aproximar área por retângulos e refinar a partição até o limite.',
        pronto: true,
      },
      {
        id: 'integral-definida',
        titulo: 'Integral definida',
        descricao: 'Área com sinal e as propriedades da integral.',
        pronto: true,
      },
      {
        id: 'integral-indefinida',
        titulo: 'Integral indefinida',
        descricao: 'Antiderivadas e por que aparece a constante de integração.',
        pronto: true,
      },
      {
        id: 'teorema-fundamental',
        titulo: 'Teorema fundamental do cálculo',
        descricao: 'A ponte que mostra que derivar e integrar são operações inversas.',
        pronto: true,
      },
      {
        id: 'tecnicas-de-integracao',
        titulo: 'Técnicas de integração',
        descricao: 'Substituição, integração por partes e frações parciais.',
        pronto: true,
      },
      {
        id: 'aplicacoes-da-integral',
        titulo: 'Aplicações da integral',
        descricao: 'Área entre curvas, volume de sólidos de revolução e comprimento de arco.',
        pronto: true,
      },
    ],
  },
];

/** Caminho de navegação de um tópico. */
export function rotaDoTopico(areaId: string, topicoId: string): string {
  return `/${areaId}/${topicoId}`;
}

export function totalDeTopicos(): number {
  return CURRICULO.reduce((total, area) => total + area.topicos.length, 0);
}

export function totalDeTopicosProntos(): number {
  return CURRICULO.reduce(
    (total, area) => total + area.topicos.filter((topico) => topico.pronto).length,
    0,
  );
}

export function buscarArea(areaId: string): AreaCurriculo | undefined {
  return CURRICULO.find((area) => area.id === areaId);
}
