import { gasIdealComPassos, primeiraLeiComPassos, trabalhoIsobaricoComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_TERMO: readonly Teoria[] = [
  {
    id: 'termo.gas-ideal',
    titulo: 'Equação de estado',
    resumo: 'Quatro grandezas, uma equação.',
    definicao:
      'A equação dos gases ideais relaciona pressão, volume, temperatura e quantidade de ' +
      'matéria. Conhecidas três, a quarta está determinada. A temperatura entra sempre em ' +
      'kelvin: em celsius a proporcionalidade se quebra, porque o zero da escala é arbitrário.',
    formulas: [
      { tex: 'pV = nRT' },
      {
        tex: '\\frac{p_1 V_1}{T_1} = \\frac{p_2 V_2}{T_2}',
        legenda: 'Para a mesma quantidade de gás, em dois estados.',
      },
      { tex: 'T(\\text{K}) = T(^\\circ\\text{C}) + 273{,}15' },
    ],
    demonstracao: [
      {
        descricao: 'A pressão vem dos choques das moléculas contra as paredes.',
        tex: 'p \\propto \\frac{N}{V}\\,\\overline{E_c}',
      },
      {
        descricao: 'A energia cinética média é proporcional à temperatura absoluta.',
        tex: '\\overline{E_c} \\propto T',
        nota: 'É aqui que o kelvin importa: temperatura zero significa energia cinética zero.',
      },
      {
        descricao: 'Juntando, chega-se à equação de estado.',
        tex: 'pV = nRT',
      },
    ],
    exemplo: {
      enunciado: 'Um mol de gás a 0 °C e 1 atm ocupa 22,4 L.',
      passos: gasIdealComPassos({ pressao: 101325, volume: 0.0224, temperatura: 273 }).passos,
    },
    vejaTambem: ['termo.primeira-lei', 'termo.trabalho'],
  },
  {
    id: 'termo.primeira-lei',
    titulo: 'Primeira lei',
    resumo: 'Conservação de energia, incluindo o calor.',
    definicao:
      'A variação da energia interna de um gás é o calor recebido menos o trabalho realizado ' +
      'por ele. Nada mais que conservação de energia — só que agora contando o calor como uma ' +
      'forma de transferência. O cuidado está nos sinais.',
    formulas: [
      { tex: '\\Delta U = Q - W' },
      {
        tex: '\\Delta U = 0 \\;\\Rightarrow\\; Q = W',
        legenda: 'Processo isotérmico: todo o calor recebido vira trabalho.',
      },
    ],
    demonstracao: [
      {
        descricao: 'O gás pode receber energia como calor.',
        tex: 'Q > 0 \\;\\text{aumenta } U',
      },
      {
        descricao: 'E pode entregar energia realizando trabalho ao expandir.',
        tex: 'W > 0 \\;\\text{diminui } U',
        nota: 'Daí o sinal negativo na fórmula: o trabalho sai do gás.',
      },
      {
        descricao: 'O saldo é a variação da energia interna, que se traduz em temperatura.',
        tex: '\\Delta U = Q - W',
        nota: 'Uma máquina térmica vive de converter Q em W ciclicamente.',
      },
    ],
    exemplo: {
      enunciado: 'Um gás recebe 500 J de calor e realiza 200 J de trabalho.',
      passos: primeiraLeiComPassos(500, 200).passos,
    },
    vejaTambem: ['termo.gas-ideal', 'termo.trabalho', 'energia.conservacao'],
  },
  {
    id: 'termo.trabalho',
    titulo: 'Trabalho de um gás',
    resumo: 'Área no diagrama p × V.',
    definicao:
      'Quando um gás expande, ele empurra o pistão e realiza trabalho. A pressão constante, o ' +
      'trabalho é simplesmente p·ΔV — a área de um retângulo no diagrama p × V. Em qualquer ' +
      'processo, o trabalho continua sendo a área sob a curva.',
    formulas: [
      { tex: 'W = p\\,\\Delta V', legenda: 'Processo isobárico, pressão constante.' },
      { tex: 'W = \\int p\\,dV', legenda: 'Caso geral: a área sob a curva p × V.' },
    ],
    demonstracao: [
      {
        descricao: 'A força sobre o pistão é a pressão vezes a área.',
        tex: 'F = pA',
      },
      {
        descricao: 'O trabalho é essa força vezes o deslocamento do pistão.',
        tex: 'W = pA\\,\\Delta x = p\\,\\Delta V',
        nota: 'A área do pistão se cancela com o volume deslocado.',
      },
      {
        descricao: 'Se a pressão varia, soma-se contribuição por contribuição.',
        tex: 'W = \\int p\\,dV',
        nota: 'A integral aparece naturalmente — é a área sob a curva, de novo.',
      },
      {
        descricao: 'Volume constante significa nenhum trabalho, por mais calor que entre.',
        tex: '\\Delta V = 0 \\;\\Rightarrow\\; W = 0',
      },
    ],
    exemplo: {
      enunciado: 'Expansão isobárica de 10 para 30 L à pressão atmosférica.',
      passos: trabalhoIsobaricoComPassos(101325, 0.01, 0.03).passos,
    },
    vejaTambem: ['termo.primeira-lei', 'termo.gas-ideal', 'integral-def.area-geometrica'],
  },
];
