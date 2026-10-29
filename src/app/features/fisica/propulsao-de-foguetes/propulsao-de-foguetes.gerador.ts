import { empuxoDeMotorComPassos, tsiolkovskyComPassos } from '@core/math';
import { Rng } from '@core/treino/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

/** A mesma tolerância da correção: 2 casas, como o enunciado pede. */
const { saoEquivalentes: proximos } = numeroComCasas(2, 1e-4);

type Pergunta = 'empuxo' | 'impulso-especifico' | 'delta-v' | 'razao-massas' | 'fracao-combustivel';

export const geradorPropulsao: GeradorExercicio<number> = {
  topicoId: 'propulsao-de-foguetes',
  formatoResposta: 'um número, 2 casas decimais',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'empuxo':
        return exercicioEmpuxo(nivel, rng);
      case 'impulso-especifico':
        return exercicioImpulsoEspecifico(nivel, rng);
      case 'delta-v':
        return exercicioDeltaV(nivel, rng);
      case 'razao-massas':
        return exercicioRazaoMassas(nivel, rng);
      case 'fracao-combustivel':
        return exercicioFracaoCombustivel(nivel, rng);
    }
  },

  analisar: analisarNumero,

  ...numeroComCasas(2, 1e-4),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['empuxo', 'impulso-especifico']);
    case 'medio':
      return rng.escolher<Pergunta>(['delta-v', 'empuxo', 'fracao-combustivel']);
    case 'dificil':
      return rng.escolher<Pergunta>(['razao-massas', 'delta-v', 'fracao-combustivel']);
  }
}

function exercicioEmpuxo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const vazao = rng.inteiro(50, 600);
  const exaustao = rng.escolher([2500, 3000, 3200, 3500, 4400]);

  const { resultado, passos } = empuxoDeMotorComPassos(vazao, exaustao);
  // Em kN, como se fala de motores reais.
  const gabarito = resultado / 1000;

  return {
    id: `prop-emp-${vazao}-${exaustao}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um motor queima ${vazao} kg/s de propelente com velocidade de exaustão de ` +
      `${exaustao} m/s. Qual é o empuxo, em kN? (2 casas decimais)`,
    enunciadoTex: `\\dot{m} = ${vazao}\\,\\text{kg/s} \\qquad v_e = ${exaustao}\\,\\text{m/s}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        ...passos,
        {
          descricao: 'A resposta é pedida em kN, e 1 kN são 1000 N.',
          tex: `F = ${gabarito.toFixed(2).replace('.', '{,}')}\\,\\text{kN}`,
        },
      ],
    },
    conceitos: ['propulsao.empuxo'],
    armadilhas: semColisoes(
      [
        {
          resposta: resultado,
          diagnostico: 'Esse valor está em newtons. A pergunta pede kN (1 kN = 1000 N).',
          passo: 1,
          conceito: 'propulsao.empuxo',
        },
        {
          resposta: exaustao / vazao / 1000,
          diagnostico:
            'O empuxo é um PRODUTO: vazão multiplicada pela velocidade de exaustão.',
          passo: 0,
          conceito: 'propulsao.empuxo',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: nivel === 'facil' ? 'F = ṁ·vₑ' : undefined,
  };
}

function exercicioImpulsoEspecifico(nivel: Nivel, rng: Rng): Exercicio<number> {
  const exaustao = rng.escolher([2200, 2500, 3000, 3200, 3500, 4400, 4500]);
  const resultado = exaustao / 9.81;

  return {
    id: `prop-isp-${exaustao}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um motor tem velocidade de exaustão de ${exaustao} m/s. Qual é seu impulso específico, ` +
      'em segundos? (2 casas decimais)',
    enunciadoTex: `v_e = ${exaustao}\\,\\text{m/s} \\qquad g_0 = 9{,}81\\,\\text{m/s}^{2}`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'O impulso específico expressa a eficiência do motor em segundos.',
          tex: 'I_{sp} = \\frac{v_e}{g_0}',
        },
        {
          descricao: 'Dividindo pela gravidade padrão.',
          tex: `I_{sp} = \\frac{${exaustao}}{9{,}81} = ${Number(resultado.toFixed(2))}\\,\\text{s}`,
          nota:
            'Motores químicos chegam a cerca de 450 s; propulsão iônica passa de 3000 s, com ' +
            'empuxo muito menor.',
        },
      ],
    },
    conceitos: ['propulsao.empuxo'],
    armadilhas: semColisoes(
      [
        {
          resposta: exaustao * 9.81,
          diagnostico:
            'A relação é uma DIVISÃO pela gravidade padrão: é ela que converte velocidade em ' +
            'segundos.',
          passo: 1,
          conceito: 'propulsao.empuxo',
        },
        {
          resposta: exaustao,
          diagnostico:
            'Essa é a velocidade de exaustão, em m/s. O impulso específico é essa velocidade ' +
            'dividida por g₀, e sai em segundos.',
          passo: 0,
          conceito: 'propulsao.empuxo',
        },
      ],
      resultado,
      proximos,
    ),
  };
}

function exercicioDeltaV(nivel: Nivel, rng: Rng): Exercicio<number> {
  const razao = rng.escolher([2, 3, 4, 5, 8, 10, 20]);
  const exaustao = rng.escolher([2500, 3000, 3500, 4400]);

  const { resultado, passos } = tsiolkovskyComPassos(razao, 1, exaustao);
  // Em km/s, a unidade com que se discute missões.
  const gabarito = resultado.deltaV / 1000;

  return {
    id: `prop-dv-${razao}-${exaustao}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um foguete tem razão de massas ${razao} e velocidade de exaustão de ${exaustao} m/s. ` +
      'Qual é o delta-v disponível, em km/s? (2 casas decimais)',
    enunciadoTex:
      `\\frac{m_0}{m_f} = ${razao} \\qquad v_e = ${exaustao}\\,\\text{m/s}`,
    gabarito,
    resolucao: { resultado: gabarito, passos },
    conceitos: ['propulsao.tsiolkovsky'],
    armadilhas: semColisoes(
      [
        {
          resposta: (exaustao * razao) / 1000,
          diagnostico:
            'A razão de massas entra dentro de um LOGARITMO, não multiplicando. É justamente ' +
            'isso que torna o delta-v tão caro.',
          passo: 1,
          conceito: 'propulsao.tsiolkovsky',
        },
        {
          resposta: (exaustao * Math.log10(razao)) / 1000,
          diagnostico:
            'O logaritmo é NATURAL (base e), não decimal. Ele vem da integral de 1/m.',
          passo: 1,
          conceito: 'propulsao.tsiolkovsky',
        },
        {
          resposta: exaustao / 1000,
          diagnostico:
            'Essa é a velocidade de exaustão. O delta-v só a iguala quando a razão de massas ' +
            'é e ≈ 2,72.',
          passo: 2,
          conceito: 'propulsao.tsiolkovsky',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: nivel === 'facil' ? 'Δv = vₑ · ln(m₀/m_f)' : undefined,
  };
}

function exercicioRazaoMassas(nivel: Nivel, rng: Rng): Exercicio<number> {
  const deltaVKm = rng.escolher([3, 5, 7, 9.4, 12]);
  const exaustao = rng.escolher([3000, 3500, 4400]);

  const resultado = Math.exp((deltaVKm * 1000) / exaustao);

  return {
    id: `prop-rm-${deltaVKm}-${exaustao}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Para obter ${deltaVKm.toLocaleString('pt-BR')} km/s de delta-v com exaustão a ` +
      `${exaustao} m/s, qual razão de massas é necessária? (2 casas decimais)`,
    enunciadoTex:
      `\\Delta v = ${String(deltaVKm).replace('.', '{,}')}\\,\\text{km/s} \\qquad v_e = ${exaustao}\\,\\text{m/s}`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'Partimos da equação de Tsiolkovsky.',
          tex: '\\Delta v = v_e \\ln\\frac{m_0}{m_f}',
        },
        {
          descricao: 'Isolando o logaritmo.',
          tex: `\\ln\\frac{m_0}{m_f} = \\frac{${deltaVKm * 1000}}{${exaustao}} = ${Number(((deltaVKm * 1000) / exaustao).toFixed(4))}`,
        },
        {
          descricao: 'Aplicando a exponencial dos dois lados.',
          tex: `\\frac{m_0}{m_f} = e^{${Number(((deltaVKm * 1000) / exaustao).toFixed(4))}} = ${Number(resultado.toFixed(4))}`,
          nota:
            `Isso significa que ${Number(((1 - 1 / resultado) * 100).toFixed(1))}% da massa ` +
            'inicial precisa ser propelente.',
        },
      ],
    },
    conceitos: ['propulsao.tsiolkovsky', 'propulsao.estagios'],
    armadilhas: semColisoes(
      [
        {
          resposta: (deltaVKm * 1000) / exaustao,
          diagnostico:
            'Você parou no valor do logaritmo. Falta aplicar a exponencial para obter a razão ' +
            'de massas.',
          passo: 2,
          conceito: 'propulsao.tsiolkovsky',
        },
        {
          resposta: 10 ** ((deltaVKm * 1000) / exaustao),
          diagnostico:
            'A base é e, não 10. O logaritmo da equação do foguete é natural, porque vem da ' +
            'integral de 1/m.',
          passo: 2,
          conceito: 'propulsao.tsiolkovsky',
        },
      ],
      resultado,
      proximos,
    ),
  };
}

function exercicioFracaoCombustivel(nivel: Nivel, rng: Rng): Exercicio<number> {
  const massaInicial = rng.inteiro(10, 100) * 1000;
  const razao = rng.escolher([2, 3, 4, 5, 8, 10]);
  const massaFinal = massaInicial / razao;

  const { resultado, passos } = tsiolkovskyComPassos(massaInicial, massaFinal, 3000);
  const gabarito = resultado.fracaoCombustivel;

  return {
    id: `prop-frac-${massaInicial}-${razao}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um foguete parte com ${(massaInicial / 1000).toLocaleString('pt-BR')} t e termina a ` +
      `queima com ${(massaFinal / 1000).toLocaleString('pt-BR')} t. Que fração da massa ` +
      'inicial era propelente? (responda entre 0 e 1, com 2 casas decimais)',
    enunciadoTex:
      `m_0 = ${massaInicial}\\,\\text{kg} \\qquad m_f = ${Number(massaFinal.toFixed(0))}\\,\\text{kg}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        ...passos,
        {
          descricao: 'A pergunta é pela fração de propelente, que é o complementar do que sobrou.',
          tex: `1 - \\frac{m_f}{m_0} = ${gabarito.toFixed(2).replace('.', '{,}')}`,
        },
      ],
    },
    conceitos: ['propulsao.tsiolkovsky', 'propulsao.estagios'],
    armadilhas: semColisoes(
      [
        {
          resposta: massaFinal / massaInicial,
          diagnostico:
            'Essa é a fração que SOBROU (estrutura e carga útil). A de propelente é o ' +
            'complementar: 1 menos essa razão.',
          passo: 3,
          conceito: 'propulsao.tsiolkovsky',
        },
        {
          resposta: razao,
          diagnostico:
            'Essa é a razão de massas, que é maior que 1. A fração pedida está entre 0 e 1.',
          passo: 2,
          conceito: 'propulsao.tsiolkovsky',
        },
      ],
      gabarito,
      proximos,
    ),
  };
}
