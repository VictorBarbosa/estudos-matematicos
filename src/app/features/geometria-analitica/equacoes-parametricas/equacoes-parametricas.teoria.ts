import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_PARAMETRICAS: readonly Teoria[] = [
  {
    id: 'parametricas.parametro',
    titulo: 'Um terceiro número no comando',
    resumo: 'Cada coordenada em função de um parâmetro, em vez de y em função de x.',
    definicao:
      'Na forma paramétrica, x e y deixam de depender um do outro e passam a depender de um ' +
      'terceiro número — quase sempre o tempo. Cada valor do parâmetro escolhe um ponto, e só ' +
      'um. A vantagem é imediata: curvas que não são função de x, como a circunferência, se ' +
      'descrevem sem nenhum esforço.',
    formulas: [
      { tex: '\\begin{cases} x = x(t) \\\\ y = y(t) \\end{cases}' },
      {
        tex: '\\begin{cases} x = x_{0} + v_{x}t \\\\ y = y_{0} + v_{y}t \\end{cases}',
        legenda: 'A reta, na forma mais usada em cinemática.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Um móvel parte da origem com velocidade constante.',
        tex: '\\begin{cases} x = 3t \\\\ y = 4t \\end{cases}',
      },
      {
        descricao: 'Cada instante escolhe um ponto.',
        tex: 't = 2 \\;\\Longrightarrow\\; (6,\\; 8)',
      },
      {
        descricao: 'Eliminando o parâmetro, aparece a reta.',
        tex: 'y = \\frac{4}{3}x',
        nota: 'A reta é o caminho; as equações paramétricas dizem também quando se passa por cada ponto.',
      },
    ],
    vejaTambem: ['parametricas.circunferencia', 'parametricas.movimento', 'parametricas.eliminar'],
  },
  {
    id: 'parametricas.circunferencia',
    titulo: 'A curva que não é função',
    resumo: 'Com um parâmetro, a circunferência se escreve numa linha.',
    definicao:
      'A circunferência tem dois valores de y para cada x, e por isso não é gráfico de função. ' +
      'Na forma paramétrica o problema desaparece: o parâmetro é o ângulo, e ele percorre a ' +
      'curva inteira sem ambiguidade. A elipse é a mesma ideia com dois raios diferentes.',
    formulas: [
      {
        tex: '\\begin{cases} x = x_{c} + r\\cos t \\\\ y = y_{c} + r\\operatorname{sen} t \\end{cases}',
      },
      {
        tex: '\\begin{cases} x = a\\cos t \\\\ y = b\\operatorname{sen} t \\end{cases}',
        legenda: 'A elipse de semieixos a e b.',
      },
    ],
    demonstracao: [
      {
        descricao: 'O parâmetro é o ângulo medido a partir do eixo x.',
        tex: 't = 0 \\;\\Longrightarrow\\; (r,\\; 0)',
      },
      {
        descricao: 'Um quarto de volta adiante.',
        tex: 't = \\frac{\\pi}{2} \\;\\Longrightarrow\\; (0,\\; r)',
      },
      {
        descricao: 'Elevando as duas ao quadrado e somando, volta a cartesiana.',
        tex: '\\cos^{2} t + \\operatorname{sen}^{2} t = 1 \\;\\Longrightarrow\\; x^{2} + y^{2} = r^{2}',
        nota: 'A identidade fundamental é o que elimina o parâmetro nesses casos.',
      },
    ],
    vejaTambem: ['parametricas.parametro', 'parametricas.eliminar'],
  },
  {
    id: 'parametricas.movimento',
    titulo: 'A trajetória com o tempo dentro',
    resumo: 'A forma paramétrica guarda o quando, não só o onde.',
    definicao:
      'A equação cartesiana de um lançamento diz o formato da parábola; a paramétrica diz ' +
      'também em que instante o projétil está em cada ponto, e com que velocidade. É por isso ' +
      'que toda simulação de voo, órbita e mecânica é escrita assim: o tempo é a variável que ' +
      'de fato comanda o problema.',
    formulas: [
      {
        tex: '\\begin{cases} x = v_{0}\\cos\\theta\\,t \\\\ y = v_{0}\\operatorname{sen}\\theta\\,t - \\frac{g}{2}t^{2} \\end{cases}',
      },
      { tex: 't_{voo} = \\frac{2v_{0}\\operatorname{sen}\\theta}{g}' },
    ],
    demonstracao: [
      {
        descricao: 'A horizontal é uniforme: nenhuma força age nessa direção.',
        tex: 'x = v_{0}\\cos\\theta\\,t',
      },
      {
        descricao: 'A vertical tem a gravidade, e por isso é quadrática.',
        tex: 'y = v_{0}\\operatorname{sen}\\theta\\,t - \\frac{g}{2}t^{2}',
      },
      {
        descricao: 'A altura volta a zero quando o parâmetro atinge o tempo de voo.',
        tex: 't\\left(v_{0}\\operatorname{sen}\\theta - \\frac{g}{2}t\\right) = 0',
      },
      {
        descricao: 'E o alcance é o x nesse instante.',
        tex: 'R = \\frac{v_{0}^{2}\\operatorname{sen}(2\\theta)}{g}',
        nota: 'Daqui sai que o alcance é máximo a 45 graus, e que 30 e 60 dão o mesmo valor.',
      },
    ],
    vejaTambem: ['parametricas.velocidade', 'parametricas.parametro'],
  },
  {
    id: 'parametricas.velocidade',
    titulo: 'A velocidade sai de graça',
    resumo: 'Derivar cada coordenada dá o vetor velocidade inteiro.',
    definicao:
      'Na forma paramétrica, a velocidade é simplesmente a derivada de cada coordenada em ' +
      'relação ao parâmetro. Não é preciso eliminar nada nem usar a regra da cadeia: o ' +
      'resultado já vem com módulo e direção. É a vantagem prática que justifica a notação.',
    formulas: [
      { tex: '\\vec{v}(t) = \\left(\\frac{dx}{dt},\\; \\frac{dy}{dt}\\right)' },
      {
        tex: '\\left|\\vec{v}\\right| = \\sqrt{\\left(\\frac{dx}{dt}\\right)^{2} + \\left(\\frac{dy}{dt}\\right)^{2}}',
      },
    ],
    demonstracao: [
      {
        descricao: 'Numa circunferência de raio r percorrida a velocidade angular 1.',
        tex: '\\begin{cases} x = r\\cos t \\\\ y = r\\operatorname{sen} t \\end{cases}',
      },
      {
        descricao: 'Derivando as duas.',
        tex: '\\vec{v} = \\left(-r\\operatorname{sen} t,\\; r\\cos t\\right)',
      },
      {
        descricao: 'O módulo é constante, e vale o raio.',
        tex: '\\left|\\vec{v}\\right| = r\\sqrt{\\operatorname{sen}^{2} t + \\cos^{2} t} = r',
        nota: 'Rapidez constante com direção variável — é o movimento circular uniforme.',
      },
      {
        descricao: 'E a velocidade é perpendicular ao raio, como tem de ser.',
        tex: '\\vec{r} \\cdot \\vec{v} = -r^{2}\\cos t\\operatorname{sen} t + r^{2}\\operatorname{sen} t\\cos t = 0',
      },
    ],
    vejaTambem: ['parametricas.movimento', 'parametricas.parametro'],
  },
  {
    id: 'parametricas.eliminar',
    titulo: 'Eliminar o parâmetro — e o que se perde',
    resumo: 'A cartesiana descreve o caminho; a paramétrica, o movimento.',
    definicao:
      'Dá para isolar o parâmetro e voltar à forma cartesiana, e às vezes isso é útil para ' +
      'reconhecer a curva. Mas o que se perde é justamente a informação que a forma ' +
      'paramétrica tinha a mais: quando o móvel passa por cada ponto, em que sentido, e ' +
      'quantas vezes.',
    formulas: [
      {
        tex: 't = \\frac{x - x_{0}}{v_{x}} \\;\\Longrightarrow\\; y = y_{0} + \\frac{v_{y}}{v_{x}}(x - x_{0})',
      },
      {
        tex: '\\cos^{2} t + \\operatorname{sen}^{2} t = 1',
        legenda: 'O caminho para as curvas circulares.',
      },
    ],
    demonstracao: [
      {
        descricao: 'No lançamento, isolamos o tempo na horizontal.',
        tex: 't = \\frac{x}{v_{0}\\cos\\theta}',
      },
      {
        descricao: 'E substituímos na vertical.',
        tex: 'y = x\\tan\\theta - \\frac{g}{2v_{0}^{2}\\cos^{2}\\theta}x^{2}',
      },
      {
        descricao: 'A parábola aparece — mas o tempo sumiu.',
        tex: 'y = ax - bx^{2}',
        nota: 'A curva continua certa; o que ela já não diz é quando o projétil chega a cada ponto.',
      },
      {
        descricao: 'Na ciclóide, nem isso é possível de forma elementar.',
        tex: '\\begin{cases} x = r(t - \\operatorname{sen} t) \\\\ y = r(1 - \\cos t) \\end{cases}',
        nota: 'Há curvas que só existem, na prática, na forma paramétrica.',
      },
    ],
    vejaTambem: ['parametricas.circunferencia', 'parametricas.movimento'],
  },
];
