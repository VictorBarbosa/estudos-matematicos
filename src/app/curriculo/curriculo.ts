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
 * mover uma entrada daqui muda o que o estudante pode abrir. O teste
 * `core/teoria/teorias.spec.ts` garante que nenhum exercício cobre conceito de
 * etapa posterior.
 *
 * Quatro decisões de ordem que não são óbvias:
 *
 * - **Progressões ficam em Funções**, e não em Álgebra: a teoria as apresenta
 *   como função afim (PA) e exponencial (PG), então elas dependem daquelas.
 * - **Funções trigonométricas vêm antes das identidades**: as identidades se
 *   leem no gráfico, não o contrário.
 * - **No Pré-cálculo, do intuitivo ao formal**: a noção intuitiva de limite
 *   vem primeiro, depois a definição ε-δ, e só então sequências e séries, que
 *   usam limite.
 * - **Combinatória e estatística vêm por último**: não são pré-requisito das
 *   engenharias do Québec, e no meio da trilha adiavam o cálculo.
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

/** Leitura externa que cobre a área com mais profundidade do que um site. */
export interface ReferenciaExterna {
  /** Obra e capítulo, por exemplo "OpenStax Calculus Volume 1, cap. 3". */
  readonly titulo: string;
  readonly url: string;
  /** Por que vale abrir: o que ela cobre que o site não cobre. */
  readonly nota: string;
}

export interface AreaCurriculo {
  readonly id: string;
  readonly titulo: string;
  readonly descricao: string;
  readonly topicos: readonly TopicoCurriculo[];
  /**
   * Livros-texto abertos que cobrem a área.
   *
   * O site é bom para praticar e para ver a matemática reagir, mas não
   * substitui a teoria longa de um livro nem o laboratório. Todas as obras
   * indicadas são de acesso livre.
   */
  readonly referencias?: readonly ReferenciaExterna[];
}

export const CURRICULO: readonly AreaCurriculo[] = [
  {
    id: 'matematica-basica',
    titulo: 'Matemática básica',
    descricao: 'O alicerce: como os números se combinam, se comparam e se medem.',
    referencias: [
      {
        titulo: 'OpenStax, *Prealgebra 2e* (caps. 1, 4, 5 e 7)',
        url: 'https://openstax.org/details/books/prealgebra-2e',
        nota: 'Frações, decimais e potências com exercícios resolvidos.',
      },
    ],
    topicos: [
      {
        id: 'operacoes-fundamentais',
        titulo: 'Operações fundamentais',
        descricao: 'Propriedades da adição e da multiplicação e a ordem das operações.',
        pronto: true,
      },
      {
        id: 'notacao-matematica',
        titulo: 'Notação matemática',
        descricao: 'Ler o que os símbolos dizem e escrever em símbolos o que se quer dizer.',
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
        descricao:
          'Partes de um inteiro, equivalência, simplificação e as quatro operações, nas duas ' +
          'formas: fração e número misto. Mais a conversão de decimais — nove tipos ao todo, ' +
          'três acertos em cada um para a etapa abrir.',
        pronto: true,
      },
      {
        id: 'numeros-decimais',
        titulo: 'Números decimais',
        descricao: 'Decimais como frações de denominador potência de dez, e dízimas periódicas.',
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
    ],
  },
  {
    id: 'algebra',
    titulo: 'Álgebra',
    descricao: 'Trocar números por letras para resolver o caso geral de uma vez.',
    referencias: [
      {
        titulo: 'OpenStax, *Intermediate Algebra 2e* (caps. 2, 4 a 7 e 9)',
        url: 'https://openstax.org/details/books/intermediate-algebra-2e',
        nota: 'Fatoração, equações e inequações, com o estudo de sinal.',
      },
    ],
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
        id: 'inequacoes-segundo-grau',
        titulo: 'Estudo de sinal',
        descricao: 'Quadro de sinais, o sinal do trinômio e as inequações-produto e quociente.',
        pronto: true,
      },
      {
        id: 'sistemas-lineares',
        titulo: 'Sistemas lineares',
        descricao: 'O método da substituição, com a solução vista como intersecção de retas.',
        pronto: true,
      },
      {
        id: 'polinomios',
        titulo: 'Polinômios',
        descricao: 'Grau, divisão, teorema do resto e a busca das raízes.',
        pronto: true,
      },
    ],
  },
  {
    id: 'geometria',
    titulo: 'Geometria plana e espacial',
    descricao: 'Medir o espaço: ângulos, áreas e volumes antes de levá-los a coordenadas.',
    referencias: [
      {
        titulo: 'OpenStax, *Prealgebra 2e* (cap. 9)',
        url: 'https://openstax.org/details/books/prealgebra-2e',
        nota: 'Áreas, volumes e Pitágoras.',
      },
    ],
    topicos: [
      {
        id: 'angulos-e-triangulos',
        titulo: 'Ângulos e triângulos',
        descricao: 'Soma dos ângulos, congruência, polígonos e quadriláteros.',
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
        id: 'poliedros',
        titulo: 'Poliedros',
        descricao: 'Vértices, arestas e faces: a relação de Euler, Platão, prismas e pirâmides.',
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
    id: 'quimica',
    titulo: 'Química',
    descricao:
      'A química geral que a admissão exige: contagem de partículas, o mol, reações e gases.',
    referencias: [
      {
        titulo: 'OpenStax, *Chemistry 2e*',
        url: 'https://openstax.org/details/books/chemistry-2e',
        nota: 'O livro que a ementa de CHEM 205 adota na Concordia.',
      },
    ],
    topicos: [
      {
        id: 'atomos-isotopos-ions',
        titulo: 'Átomos, isótopos e íons',
        descricao:
          'As três contagens: quem define o elemento, quem dá a massa e quem carrega a carga.',
        pronto: true,
      },
      {
        id: 'estrutura-eletronica',
        titulo: 'Estrutura eletrônica',
        descricao: 'A ordem de energia dos subníveis, as camadas e o que a última delas explica.',
        pronto: true,
      },
      {
        id: 'tabela-e-ligacao',
        titulo: 'Tabela periódica e ligação',
        descricao: 'O grupo, a carga do íon e a fórmula do composto — tudo da última camada.',
        pronto: true,
      },
      {
        id: 'formulas-e-nomenclatura',
        titulo: 'Fórmulas e nomenclatura',
        descricao: 'Do nome à fórmula, e o numeral romano que diz a carga do metal.',
        pronto: true,
      },
      {
        id: 'mol-e-massa-molar',
        titulo: 'O mol e a massa molar',
        descricao: 'A ponte entre a massa que se pesa e a quantidade de partículas que reage.',
        pronto: true,
      },
      {
        id: 'equacoes-e-balanceamento',
        titulo: 'Equações e balanceamento',
        descricao: 'Ajustar coeficientes, nunca índices — e contar os átomos para conferir.',
        pronto: true,
      },
      {
        id: 'estequiometria',
        titulo: 'Estequiometria',
        descricao: 'A proporção da equação balanceada, convertida em massa: o trajeto completo.',
        pronto: true,
      },
      {
        id: 'limitante-e-rendimento',
        titulo: 'Reagente limitante e rendimento',
        descricao: 'Quem acaba primeiro decide quanto se forma — e o que sobra do outro.',
        pronto: true,
      },
      {
        id: 'composicao-e-formula',
        titulo: 'Composição percentual e fórmula empírica',
        descricao:
          'Da fórmula à porcentagem de cada elemento, e da porcentagem de volta à fórmula.',
        pronto: true,
      },
      {
        id: 'solucoes-e-concentracao',
        titulo: 'Soluções e concentração',
        descricao: 'Mols por litro de solução, diluição e mistura — com o volume em mililitros.',
        pronto: true,
      },
      {
        id: 'gases-ideais',
        titulo: 'Gases ideais e pressões parciais',
        descricao: 'PV = nRT com a temperatura em kelvin, a lei combinada e a fração molar.',
        pronto: true,
      },
    ],
  },
  {
    id: 'funcoes',
    titulo: 'Funções',
    descricao: 'A linguagem com que a engenharia descreve uma grandeza dependendo de outra.',
    referencias: [
      {
        titulo: 'OpenStax, *College Algebra 2e* (caps. 3 a 6 e 9)',
        url: 'https://openstax.org/details/books/college-algebra-2e',
        nota: 'Funções, transformações de gráficos, exponenciais e logaritmos, com as equações exponenciais.',
      },
    ],
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
        id: 'equacoes-exponenciais',
        titulo: 'Equações exponenciais',
        descricao:
          'Igualar as bases, tirar o logaritmo, trocar a potência por t e conferir o domínio.',
        pronto: true,
      },
      {
        id: 'funcoes-racionais',
        titulo: 'Funções racionais',
        descricao:
          'Quociente de polinômios: domínio, assíntotas e o que acontece perto do que anula o denominador.',
        pronto: true,
      },
      {
        id: 'funcoes-por-partes',
        titulo: 'Funções definidas por partes',
        descricao: 'Uma regra diferente em cada intervalo, e o que acontece nas emendas.',
        pronto: true,
      },
      {
        id: 'transformacoes-de-graficos',
        titulo: 'Transformações de gráficos',
        descricao:
          'Deslocar, esticar e refletir — ler o gráfico de f(x) + k, f(x + k) e a·f(x) sem refazer a tabela.',
        pronto: true,
      },
      {
        id: 'composicao-inversa',
        titulo: 'Composição e inversa',
        descricao: 'Encadear funções e refletir o gráfico na reta y = x.',
        pronto: true,
      },
      {
        id: 'progressoes',
        titulo: 'Progressões',
        descricao: 'PA e PG: termo geral, soma dos termos e onde cada padrão aparece.',
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
    referencias: [
      {
        titulo: 'OpenStax, *Algebra and Trigonometry 2e* (caps. 7 a 10)',
        url: 'https://openstax.org/details/books/algebra-and-trigonometry-2e',
        nota: 'Identidades, equações trigonométricas e funções inversas.',
      },
    ],
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
        id: 'funcoes-trigonometricas',
        titulo: 'Funções trigonométricas',
        descricao: 'Amplitude, período e fase: a forma da onda.',
        pronto: true,
      },
      {
        id: 'identidades-trigonometricas',
        titulo: 'Identidades trigonométricas',
        descricao: 'A identidade fundamental, arco duplo e soma de arcos.',
        pronto: true,
      },
      {
        id: 'equacoes-trigonometricas',
        titulo: 'Equações trigonométricas',
        descricao: 'Arcsen, arccos e arctg, e as equações que têm mais de uma solução na volta.',
        pronto: true,
      },
      {
        id: 'lei-senos-cossenos',
        titulo: 'Leis dos senos e dos cossenos',
        descricao: 'Resolver triângulos que não têm ângulo reto.',
        pronto: true,
      },
    ],
  },
  {
    id: 'vetores-matrizes',
    titulo: 'Vetores e matrizes',
    descricao: 'Grandezas com direção e tabelas de números: o ferramental da mecânica.',
    referencias: [
      {
        titulo: 'OpenStax, *Calculus Volume 3* (cap. 2)',
        url: 'https://openstax.org/details/books/calculus-volume-3',
        nota: 'Vetores em R³, retas e planos no espaço — o que falta para o 0M04.',
      },
      {
        titulo: 'Jim Hefferon, *Linear Algebra*',
        url: 'https://hefferon.net/linearalgebra/',
        nota: 'Gauss-Jordan, matriz inversa, independência linear e bases, com demonstrações completas.',
      },
    ],
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
        id: 'vetores-no-espaco',
        titulo: 'Vetores no espaço',
        descricao: 'Componentes x, y e z, vetores unitários e os dois produtos em três dimensões.',
        pronto: true,
      },
      {
        id: 'matrizes-determinantes',
        titulo: 'Matrizes e determinantes',
        descricao: 'Operações com matrizes, determinante como área e regra de Cramer.',
        pronto: true,
      },
      {
        id: 'escalonamento-e-inversa',
        titulo: 'Escalonamento e matriz inversa',
        descricao:
          'Gauss-Jordan em sistemas 3×3, classificação pelo escalonamento e a inversa por (A | I).',
        pronto: true,
      },
      {
        id: 'autovalores-e-autovetores',
        titulo: 'Autovalores e autovetores',
        descricao: 'As direções que a matriz não torce, e as duas identidades que as conferem.',
        pronto: true,
      },
      {
        id: 'retas-e-planos',
        titulo: 'Retas e planos no espaço',
        descricao:
          'Equação do plano, distância de ponto a plano, ângulos e independência linear pelo determinante.',
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
    referencias: [
      {
        titulo: 'OpenStax, *Algebra and Trigonometry 2e* (cap. 12)',
        url: 'https://openstax.org/details/books/algebra-and-trigonometry-2e',
        nota: 'Cônicas em detalhe, inclusive a forma polar usada em órbitas.',
      },
    ],
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
      {
        id: 'equacoes-parametricas',
        titulo: 'Equações paramétricas',
        descricao: 'A curva descrita pelo tempo: x(t) e y(t), e a trajetória que elas desenham.',
        pronto: true,
      },
      {
        id: 'coordenadas-polares',
        titulo: 'Coordenadas polares',
        descricao:
          'Distância e direção: conversão, o quadrante do ângulo e a órbita em forma polar.',
        pronto: true,
      },
    ],
  },
  {
    id: 'fisica',
    titulo: 'Física',
    descricao: 'A matemática aplicada ao mundo: do plano inclinado ao foguete em órbita.',
    referencias: [
      {
        titulo:
          'OpenStax, *University Physics Volume 1* (caps. 2 a 15; termodinâmica nos caps. 1 a 4 do Volume 2)',
        url: 'https://openstax.org/details/books/university-physics-volume-1',
        nota: 'Mecânica no nível do 203-NYA, com cálculo: força variável, trabalho como integral e dinâmica de rotação.',
      },
      {
        titulo: 'MIT OCW 8.01 — *Classical Mechanics*',
        url: 'https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/',
        nota: 'Aulas e problemas com laboratório — o que um site não entrega.',
      },
    ],
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
        id: 'cinematica-vetorial',
        titulo: 'Cinemática vetorial',
        descricao: 'Posição, velocidade e aceleração como vetores, em duas e três dimensões.',
        pronto: true,
      },
      {
        id: 'movimento-circular',
        titulo: 'Movimento circular',
        descricao: 'Velocidade angular, aceleração centrípeta e a força que mantém a curva.',
        pronto: true,
      },
      {
        id: 'leis-de-newton',
        titulo: 'Leis de Newton',
        descricao: 'Inércia, F = ma e ação e reação, com diagramas de corpo livre.',
        pronto: true,
      },
      {
        id: 'trajetoria-balistica',
        titulo: 'Trajetória balística',
        descricao: 'Lançamento oblíquo: alcance, altura máxima e tempo de voo.',
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
        id: 'estatica-e-torque',
        titulo: 'Estática e torque',
        descricao: 'Equilíbrio de forças e de momentos, centro de massa e estabilidade.',
        pronto: true,
      },
      {
        id: 'dinamica-rotacional',
        titulo: 'Dinâmica rotacional',
        descricao: 'Momento de inércia, torque e a segunda lei para a rotação.',
        pronto: true,
      },
      {
        id: 'momento-angular',
        titulo: 'Conservação do momento angular',
        descricao:
          'Por que a patinadora acelera ao fechar os braços — e o que isso faz num satélite.',
        pronto: true,
      },
      {
        id: 'movimento-harmonico',
        titulo: 'Movimento harmônico',
        descricao: 'Oscilação de uma mola descrita por seno e cosseno.',
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
        id: 'transferencia-de-calor',
        titulo: 'Transferência de calor',
        descricao: 'Condução, convecção e radiação, e o reentry de um veículo espacial.',
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
    id: 'eletromagnetismo',
    titulo: 'Eletricidade e magnetismo',
    descricao:
      'Cargas, campos, circuitos e indução: a física do 0P02, da lei de Coulomb a Faraday.',
    referencias: [
      {
        titulo: 'OpenStax, *University Physics Volume 2* (caps. 5 a 14)',
        url: 'https://openstax.org/details/books/university-physics-volume-2',
        nota: 'Capítulos 5 a 13: eletrostática, potencial, capacitância, circuitos CC e RC, magnetismo e indução.',
      },
      {
        titulo: 'MIT OCW 8.02 — *Physics II: Electricity and Magnetism*',
        url: 'https://ocw.mit.edu/courses/8-02-physics-ii-electricity-and-magnetism-spring-2007/',
        nota: 'Aulas, problemas resolvidos e as demonstrações de laboratório que um site não substitui.',
      },
    ],
    topicos: [
      {
        id: 'eletrostatica',
        titulo: 'Eletrostática',
        descricao: 'Carga, lei de Coulomb, campo elétrico e a superposição de forças.',
        pronto: true,
      },
      {
        id: 'potencial-e-capacitores',
        titulo: 'Potencial e capacitores',
        descricao: 'Potencial e trabalho, o capacitor de placas, energia e associações.',
        pronto: true,
      },
      {
        id: 'circuitos',
        titulo: 'Circuitos',
        descricao: 'Ohm, potência, série e paralelo, Kirchhoff e o circuito RC.',
        pronto: true,
      },
      {
        id: 'magnetismo-e-inducao',
        titulo: 'Magnetismo e indução',
        descricao: 'Força de Lorentz, campos de correntes, fluxo, Faraday e Lenz.',
        pronto: true,
      },
    ],
  },
  {
    id: 'ondas-e-fisica-moderna',
    titulo: 'Ondas e física moderna',
    descricao: 'Som, luz e o começo do século XX: a física que a mecânica não explica.',
    referencias: [
      {
        titulo: 'OpenStax, *University Physics Volume 1* (cap. 16–17)',
        url: 'https://openstax.org/details/books/university-physics-volume-1',
        nota: 'Ondas mecânicas e som: harmônicos, decibéis e Doppler.',
      },
      {
        titulo: 'OpenStax, *University Physics Volume 3* (caps. 1 a 6)',
        url: 'https://openstax.org/details/books/university-physics-volume-3',
        nota: 'Óptica geométrica e física, relatividade e física quântica — o 0P03.',
      },
      {
        titulo: 'MIT OCW 8.03 — *Vibrations and Waves*',
        url: 'https://ocw.mit.edu/courses/8-03sc-physics-iii-vibrations-and-waves-fall-2016/',
        nota: 'Ondas com o tratamento completo, de cordas a óptica.',
      },
      {
        titulo: 'MIT OCW 8.04 — *Quantum Physics I*',
        url: 'https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/',
        nota: 'O passo seguinte ao fotoelétrico e a de Broglie.',
      },
    ],
    topicos: [
      {
        id: 'ondas-e-som',
        titulo: 'Ondas e som',
        descricao: 'v = λf, harmônicos da corda e do tubo, decibéis e o efeito Doppler.',
        pronto: true,
      },
      {
        id: 'optica',
        titulo: 'Óptica',
        descricao: 'Refração e Snell, reflexão total, lentes delgadas e a fenda dupla.',
        pronto: true,
      },
      {
        id: 'fisica-moderna',
        titulo: 'Física moderna',
        descricao: 'Relatividade restrita, o fóton, o efeito fotoelétrico e as ondas de matéria.',
        pronto: true,
      },
    ],
  },
  {
    id: 'pre-calculo',
    titulo: 'Pré-cálculo',
    descricao:
      'A ponte: a ideia de aproximação, antes da máquina do cálculo — do intuitivo ao formal.',
    referencias: [
      {
        titulo: 'OpenStax, *Calculus Volume 1* (cap. 2)',
        url: 'https://openstax.org/details/books/calculus-volume-1',
        nota: 'Limites, do intuitivo ao ε-δ, com os teoremas enunciados e provados.',
      },
    ],
    topicos: [
      {
        id: 'nocao-intuitiva-de-limite',
        titulo: 'Noção intuitiva de limite',
        descricao: 'Aproximar-se de um valor sem necessariamente alcançá-lo.',
        pronto: true,
      },
      {
        id: 'vizinhancas-e-infinito',
        titulo: 'Vizinhanças e infinito',
        descricao: 'Épsilon e delta, e o comportamento de funções no infinito.',
        pronto: true,
      },
    ],
  },
  {
    id: 'calculo-1',
    titulo: 'Cálculo 1',
    descricao: 'Derivadas: a matemática do que muda, instante a instante.',
    referencias: [
      {
        titulo: 'OpenStax, *Calculus Volume 1* (cap. 3 a 4)',
        url: 'https://openstax.org/details/books/calculus-volume-1',
        nota: 'Derivadas de funções transcendentes, derivação implícita, taxas relacionadas, TVM e L’Hôpital.',
      },
      {
        titulo: 'Vanier College — plano de curso 201-NYA',
        url: 'https://euclid.vaniercollege.qc.ca/~iti/2021/cal1A21/outline_A21.pdf',
        nota: 'A lista oficial do que o Calcul différentiel cobra no cégep.',
      },
    ],
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
        id: 'derivadas-trigonometricas',
        titulo: 'Derivadas trigonométricas',
        descricao: 'Derivar seno, cosseno e tangente — e por que a derivada do seno é o cosseno.',
        pronto: true,
      },
      {
        id: 'derivadas-exponencial-logaritmo',
        titulo: 'Derivadas de exponencial e logaritmo',
        descricao: 'A função que é a própria derivada, e a que vira 1/x.',
        pronto: true,
      },
      {
        id: 'derivacao-implicita',
        titulo: 'Derivação implícita',
        descricao: 'Derivar sem isolar y, que é o caminho quando a curva não é uma função.',
        pronto: true,
      },
      {
        id: 'aplicacoes-da-derivada',
        titulo: 'Aplicações da derivada',
        descricao: 'Máximos e mínimos, otimização, taxas relacionadas, L’Hôpital e valor médio.',
        pronto: true,
      },
    ],
  },
  {
    id: 'calculo-2',
    titulo: 'Cálculo 2',
    descricao: 'Integrais: somar infinitas parcelas infinitamente pequenas.',
    referencias: [
      {
        titulo: 'OpenStax, *Calculus Volume 2* (caps. 2, 3, 5 e 6)',
        url: 'https://openstax.org/details/books/calculus-volume-2',
        nota: 'Técnicas de integração, integrais impróprias, séries, Taylor e EDOs separáveis.',
      },
      {
        titulo: 'John Abbott College — plano de curso 201-NYB',
        url: 'https://www.math.mcgill.ca/rags/JAC/CalIIOutline.html',
        nota: 'A lista oficial do Calcul intégral.',
      },
    ],
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
      {
        id: 'fisica-com-calculo',
        titulo: 'Física com cálculo',
        descricao:
          'Força que varia: trabalho, deslocamento, centro de massa e a gravidade que cai com 1/r².',
        pronto: true,
      },
      {
        id: 'integrais-improprias',
        titulo: 'Integrais impróprias',
        descricao:
          'Integrais com limite infinito ou integrando ilimitado, e quando elas convergem.',
        pronto: true,
      },
      {
        id: 'sequencias-e-series',
        titulo: 'Séries e convergência',
        descricao: 'Testes de convergência e o raio de convergência das séries de potências.',
        pronto: true,
      },
      {
        id: 'series-de-taylor',
        titulo: 'Séries de Taylor e Maclaurin',
        descricao: 'Aproximar uma função por polinômios, e o erro que sobra.',
        pronto: true,
      },
    ],
  },
  {
    id: 'estatistica',
    titulo: 'Combinatória e estatística',
    descricao:
      'Contar possibilidades e medir incerteza — nenhuma medida real é exata. ' +
      'Não é pré-requisito das engenharias, e por isso fecha a trilha.',
    referencias: [
      {
        titulo: 'OpenStax, *Introductory Statistics 2e* (caps. 3, 6, 8, 9 e 12)',
        url: 'https://openstax.org/details/books/introductory-statistics-2e',
        nota: 'Distribuições, intervalos de confiança e testes de hipótese.',
      },
    ],
    topicos: [
      {
        id: 'analise-combinatoria',
        titulo: 'Análise combinatória',
        descricao: 'Princípio multiplicativo, arranjos, permutações e combinações.',
        pronto: true,
      },
      {
        id: 'binomio-de-newton',
        titulo: 'Binômio de Newton',
        descricao: 'Triângulo de Pascal, termo geral, soma dos coeficientes e termo independente.',
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
      {
        id: 'distribuicao-normal',
        titulo: 'Distribuição normal',
        descricao: 'A curva em sino: média, desvio padrão e a regra dos 68-95-99.',
        pronto: true,
      },
      {
        id: 'regressao-e-correlacao',
        titulo: 'Regressão e correlação',
        descricao: 'A reta que melhor passa pelos pontos, e o quanto ela explica.',
        pronto: true,
      },
    ],
  },
  {
    id: 'calculo-3',
    titulo: 'Cálculo 3',
    descricao: 'Cálculo multivariável: derivar e integrar em mais de uma direção.',
    referencias: [
      {
        titulo: 'OpenStax, *Calculus Volume 3* (caps. 4 a 6)',
        url: 'https://openstax.org/details/books/calculus-volume-3',
        nota: 'Cobre funções de várias variáveis, derivadas parciais, integrais múltiplas e cálculo vetorial, com exercícios resolvidos.',
      },
      {
        titulo: 'MIT OpenCourseWare, *Multivariable Calculus* (18.02)',
        url: 'https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/',
        nota: 'Aulas em vídeo e listas de um curso inteiro, com a ênfase geométrica que o livro sozinho não dá.',
      },
    ],
    topicos: [
      {
        id: 'funcoes-de-varias-variaveis',
        titulo: 'Funções de várias variáveis',
        descricao: 'Domínio como região, gráfico como superfície e curvas de nível.',
        pronto: true,
      },
      {
        id: 'derivadas-parciais',
        titulo: 'Derivadas parciais',
        descricao: 'Derivar numa direção de cada vez, e o que a segunda ordem revela.',
        pronto: true,
      },
      {
        id: 'gradiente-e-direcional',
        titulo: 'Gradiente e derivada direcional',
        descricao: 'O vetor da subida mais íngreme, e a taxa em qualquer direção.',
        pronto: true,
      },
      {
        id: 'integrais-multiplas',
        titulo: 'Integrais múltiplas',
        descricao: 'Somar sobre uma região: integração iterada, volume e valor médio.',
        pronto: true,
      },
      {
        id: 'coordenadas-no-espaco',
        titulo: 'Coordenadas cilíndricas e esféricas',
        descricao: 'Trocar de sistema para que a simetria some da conta — e o jacobiano.',
        pronto: true,
      },
      {
        id: 'integrais-de-linha',
        titulo: 'Integrais de linha',
        descricao: 'Acumular ao longo de um caminho, e quando o caminho deixa de importar.',
        pronto: true,
      },
      {
        id: 'teoremas-integrais',
        titulo: 'Superfície e teoremas',
        descricao: 'Integral de superfície e os teoremas de Green, Stokes e da divergência.',
        pronto: true,
      },
    ],
  },
  {
    id: 'calculo-4',
    titulo: 'Cálculo 4',
    descricao: 'Equações diferenciais: a regra pela qual as grandezas mudam.',
    referencias: [
      {
        titulo: 'Trench, *Elementary Differential Equations* (caps. 2, 5 e 10)',
        url: 'https://digitalcommons.trinity.edu/mono/8/',
        nota: 'Livro aberto que cobre primeira e segunda ordem, com muitas aplicações físicas resolvidas em detalhe.',
      },
      {
        titulo: 'MIT OpenCourseWare, *Differential Equations* (18.03)',
        url: 'https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/',
        nota: 'Curso completo em vídeo, com a leitura de sistemas físicos que o formalismo sozinho não entrega.',
      },
    ],
    topicos: [
      {
        id: 'edo-primeira-ordem',
        titulo: 'EDO de primeira ordem',
        descricao: 'Separar variáveis, fator integrante, transiente e regime permanente.',
        pronto: true,
      },
      {
        id: 'edo-segunda-ordem',
        titulo: 'EDO de segunda ordem',
        descricao: 'Equação característica e os três regimes de amortecimento.',
        pronto: true,
      },
      {
        id: 'aplicacoes-de-edo',
        titulo: 'Aplicações de EDO',
        descricao: 'Montar a equação: resfriamento, decaimento, circuito RL e mistura.',
        pronto: true,
      },
      {
        id: 'metodos-numericos',
        titulo: 'Métodos numéricos',
        descricao: 'Euler, Runge-Kutta e a ordem com que o erro responde ao passo.',
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
