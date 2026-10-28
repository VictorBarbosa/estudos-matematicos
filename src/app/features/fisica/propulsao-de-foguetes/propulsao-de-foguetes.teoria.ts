import {
  empuxoDeMotorComPassos,
  tsiolkovskyComPassos,
  velocidadeEscapeComPassos,
} from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_PROPULSAO: readonly Teoria[] = [
  {
    id: 'propulsao.empuxo',
    titulo: 'Empuxo e impulso específico',
    resumo: 'Jogar massa para trás, rápido.',
    definicao:
      'O empuxo de um motor é a taxa com que ele entrega momento ao gás expelido: vazão de ' +
      'massa vezes velocidade de exaustão. Para o mesmo empuxo, é melhor expelir pouca massa ' +
      'muito rápido do que muita massa devagar — e é isso que o impulso específico mede.',
    formulas: [
      { tex: 'F = \\dot{m}\\,v_e' },
      { tex: 'I_{sp} = \\frac{v_e}{g_0}', legenda: 'Impulso específico, em segundos.' },
      {
        tex: 'F > mg \;\\Rightarrow\; \\text{decola}',
        legenda: 'O empuxo precisa vencer o peso para sair do chão.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Num intervalo dt, o motor expele dm de massa à velocidade vₑ.',
        tex: 'dp_{gás} = v_e\\,dm',
      },
      {
        descricao: 'Pela conservação do momento, o foguete recebe o momento oposto.',
        tex: 'F = \\frac{dp}{dt} = \\dot{m}\\,v_e',
        nota: 'Nada de ar é necessário: o gás é o corpo contra o qual o foguete "empurra".',
      },
      {
        descricao: 'Dividir vₑ por g₀ dá uma medida em segundos, comparável entre motores.',
        tex: 'I_{sp} = \\frac{v_e}{g_0}',
        nota: 'Isp alto significa mais empuxo por quilo de propelente — é a métrica de eficiência.',
      },
    ],
    exemplo: {
      enunciado: 'Motor com vazão de 250 kg/s e exaustão a 3 km/s.',
      passos: empuxoDeMotorComPassos(250, 3000).passos,
    },
    vejaTambem: ['propulsao.tsiolkovsky', 'propulsao.estagios', 'momento.conservacao'],
  },
  {
    id: 'propulsao.tsiolkovsky',
    titulo: 'A equação de Tsiolkovsky',
    resumo: 'O delta-v cresce apenas com o logaritmo.',
    definicao:
      'A equação do foguete relaciona a velocidade final à razão entre massa inicial e massa ' +
      'final. O ponto decisivo — e desanimador — é que essa relação é LOGARÍTMICA: dobrar o ' +
      'delta-v exige elevar ao quadrado a razão de massas. É a razão matemática de um foguete ' +
      'ser quase todo combustível.',
    formulas: [
      { tex: '\\Delta v = v_e \\ln\\frac{m_0}{m_f}' },
      {
        tex: '\\frac{m_0}{m_f} = e^{\\Delta v / v_e}',
        legenda: 'Invertendo: a razão de massas cresce exponencialmente com o delta-v.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Conservação de momento num instante: o foguete ganha o que o gás leva.',
        tex: 'm\\,dv = -v_e\\,dm',
      },
      {
        descricao: 'Separando as variáveis para integrar.',
        tex: 'dv = -v_e\\frac{dm}{m}',
        nota: 'Dividir por m é o que produz o logaritmo — é a integral de 1/x.',
      },
      {
        descricao: 'Integrando da massa inicial à final.',
        tex: '\\Delta v = v_e \\ln\\frac{m_0}{m_f}',
      },
      {
        descricao: 'Invertendo, fica claro o custo: a exigência de massa é exponencial.',
        tex: '\\frac{m_0}{m_f} = e^{\\Delta v / v_e}',
        nota: 'Para chegar à órbita (≈ 9,4 km/s), mais de 90% da massa inicial é propelente.',
      },
    ],
    exemplo: {
      enunciado: 'Razão de massas 8 com exaustão a 3 km/s.',
      passos: tsiolkovskyComPassos(8, 1, 3000).passos,
    },
    vejaTambem: ['propulsao.empuxo', 'propulsao.estagios', 'gravitacao.escape'],
  },
  {
    id: 'propulsao.estagios',
    titulo: 'Por que foguetes têm estágios',
    resumo: 'Descartar massa morta é mais barato que acelerá-la.',
    definicao:
      'A estrutura dos tanques já vazios continua pesando e, pela equação de Tsiolkovsky, ' +
      'cada quilo inútil carregado custa delta-v. Separar o estágio gasto reinicia a conta com ' +
      'uma razão de massas melhor — por isso o estagiamento, e não um foguete único e enorme.',
    formulas: [
      { tex: '\\Delta v_{total} = \\sum_i v_{e,i} \\ln\\frac{m_{0,i}}{m_{f,i}}' },
      {
        tex: '\\Delta v_{órbita} \\approx 9{,}4\\,\\text{km/s}',
        legenda: 'Inclui perdas por gravidade e arrasto, além dos 7,7 km/s orbitais.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Cada estágio contribui com o seu próprio delta-v.',
        tex: '\\Delta v_i = v_{e,i}\\ln\\frac{m_{0,i}}{m_{f,i}}',
      },
      {
        descricao: 'Os delta-v se somam, mas as razões de massa se multiplicam.',
        tex: '\\Delta v_{total} = \\sum \\Delta v_i',
        nota: 'Somar logaritmos é multiplicar os argumentos: é o estagiamento vencendo o logaritmo.',
      },
      {
        descricao: 'A órbita exige mais que a velocidade orbital por causa das perdas.',
        tex: '9{,}4 > 7{,}7\\,\\text{km/s}',
        nota: 'Subir contra a gravidade e atravessar a atmosfera cobram seu preço em delta-v.',
      },
    ],
    exemplo: {
      enunciado: 'A velocidade de escape, o alvo mais exigente da vizinhança da Terra.',
      passos: velocidadeEscapeComPassos().passos,
    },
    vejaTambem: ['propulsao.tsiolkovsky', 'gravitacao.escape', 'gravitacao.orbita'],
  },
];
