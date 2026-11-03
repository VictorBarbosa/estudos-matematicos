import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_MULTIVAR: readonly Teoria[] = [
  {
    id: 'multivar.superficie',
    titulo: 'Uma altura para cada ponto do plano',
    resumo: 'O gráfico deixa de ser curva e passa a ser superfície.',
    definicao:
      'Uma função de duas variáveis associa um número a cada ponto do plano, e o conjunto ' +
      'desses valores é uma superfície no espaço. Quase tudo que a engenharia mede é assim: ' +
      'temperatura ao longo de uma placa, pressão sobre uma asa, altitude sobre um terreno. A ' +
      'ideia de derivada e de integral continua valendo, mas cada uma ganha versões novas.',
    formulas: [
      { tex: 'f : \\mathbb{R}^{2} \\to \\mathbb{R}, \\qquad z = f(x,y)' },
      { tex: 'f(x,y) = x^{2} + y^{2}', legenda: 'O paraboloide, a superfície mais simples depois do plano.' },
    ],
    demonstracao: [
      {
        descricao: 'Cada ponto do plano produz uma altura.',
        tex: 'f(1,\\; 2) = 1 + 4 = 5',
      },
      {
        descricao: 'E o conjunto de todas elas é a superfície.',
        tex: '\\{(x,\\; y,\\; f(x,y))\\}',
      },
      {
        descricao: 'Em uma variável, o gráfico era uma curva no plano.',
        tex: 'y = x^{2} \\;\\longrightarrow\\; z = x^{2} + y^{2}',
        nota: 'Sobe uma dimensão em tudo: domínio, gráfico e, depois, integração.',
      },
    ],
    vejaTambem: ['multivar.dominio', 'multivar.curvas-de-nivel'],
  },
  {
    id: 'multivar.dominio',
    titulo: 'O domínio vira região',
    resumo: 'Deixa de ser intervalo na reta e passa a ser área no plano.',
    definicao:
      'Com duas variáveis, o conjunto onde a função existe é uma região do plano — um disco, ' +
      'um semiplano, o exterior de uma curva. Descobri-lo é resolver uma inequação em duas ' +
      'variáveis, e desenhá-lo costuma valer mais que escrevê-lo: é a figura que diz onde a ' +
      'conta tem sentido.',
    formulas: [
      { tex: 'D = \\{(x,y) : \\text{a expressão existe}\\}' },
      { tex: '\\sqrt{R^{2} - x^{2} - y^{2}} \\;\\Longrightarrow\\; x^{2} + y^{2} \\leq R^{2}' },
    ],
    demonstracao: [
      {
        descricao: 'A raiz exige radicando não negativo.',
        tex: '25 - x^{2} - y^{2} \\geq 0',
      },
      {
        descricao: 'O que descreve um disco de raio 5.',
        tex: 'x^{2} + y^{2} \\leq 25',
        nota: 'É uma região com área, não um intervalo com comprimento.',
      },
      {
        descricao: 'Fixando y, sobra um intervalo em x — e ele encolhe conforme y cresce.',
        tex: 'y = 3 \\;\\Longrightarrow\\; |x| \\leq 4',
      },
      {
        descricao: 'Um logaritmo produziria uma região aberta.',
        tex: '\\ln(x + y) \\;\\Longrightarrow\\; x + y > 0',
        nota: 'Aqui o domínio é um semiplano, sem a reta de fronteira.',
      },
    ],
    vejaTambem: ['multivar.superficie', 'multivar.curvas-de-nivel'],
  },
  {
    id: 'multivar.curvas-de-nivel',
    titulo: 'Curvas de nível',
    resumo: 'O mapa topográfico de uma superfície.',
    definicao:
      'Uma curva de nível junta todos os pontos em que a função vale o mesmo. É como um mapa ' +
      'topográfico desenha uma montanha: cada linha é uma altitude. Níveis apertados indicam ' +
      'encosta íngreme, níveis espaçados indicam terreno plano — e essa leitura antecipa, sem ' +
      'nenhuma conta, o que o gradiente dirá depois.',
    formulas: [
      { tex: 'f(x,y) = k' },
      { tex: 'x^{2} + y^{2} = k \\;\\Longrightarrow\\; \\text{circunferências concêntricas}' },
    ],
    demonstracao: [
      {
        descricao: 'No paraboloide, cada nível é uma circunferência.',
        tex: 'x^{2} + y^{2} = 4 \\;\\Longrightarrow\\; \\text{raio } 2',
      },
      {
        descricao: 'Níveis igualmente espaçados dão raios cada vez mais próximos.',
        tex: 'k = 1,\\; 4,\\; 9 \\;\\Longrightarrow\\; r = 1,\\; 2,\\; 3',
        nota: 'A encosta fica mais íngreme à medida que se afasta do centro.',
      },
      {
        descricao: 'Numa sela, os níveis são hipérboles.',
        tex: 'x^{2} - y^{2} = k',
      },
      {
        descricao: 'E o nível zero se parte em duas retas.',
        tex: 'y = \\pm x',
        nota: 'É o desenho que separa a região que sobe da que desce.',
      },
    ],
    vejaTambem: ['multivar.superficie', 'multivar.dominio'],
  },
];
