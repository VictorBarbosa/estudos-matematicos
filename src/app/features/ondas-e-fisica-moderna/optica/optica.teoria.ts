import {
  anguloLimiteComPassos,
  fendaDuplaComPassos,
  lenteDelgadaComPassos,
  snellComPassos,
} from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_OPTICA: readonly Teoria[] = [
  {
    id: 'optica.refracao',
    titulo: 'Refração e a lei de Snell',
    resumo: 'Ao mudar de meio, a luz muda de velocidade e de direção.',
    definicao:
      'O índice de refração n = c/v diz quantas vezes a luz anda mais devagar no meio do que no ' +
      'vácuo. Ao atravessar a fronteira entre dois meios, o raio dobra: entrando num meio mais ' +
      'refringente (n maior), aproxima-se da normal; saindo para um menos refringente, afasta-se. A ' +
      'lei de Snell relaciona os SENOS dos ângulos, medidos sempre a partir da normal.',
    formulas: [{ tex: 'n = \\frac{c}{v}' }, { tex: 'n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2' }],
    demonstracao: [
      {
        descricao:
          'Pelo princípio de Huygens: a frente de onda que chega à fronteira avança mais devagar do outro lado.',
        tex: '\\frac{\\sin\\theta_1}{\\sin\\theta_2} = \\frac{v_1}{v_2} = \\frac{n_2}{n_1}',
      },
    ],
    exemplo: {
      enunciado: 'Do ar para a água (n = 1,33), com 45° em relação à normal.',
      passos: snellComPassos(1, 45, 1.33).passos,
    },
    vejaTambem: ['optica.reflexao-total', 'eqtrig.inversas'],
  },
  {
    id: 'optica.reflexao-total',
    titulo: 'Ângulo crítico e reflexão total',
    resumo: 'Saindo do meio mais denso, a partir de um ângulo a luz não sai mais.',
    definicao:
      'Quando a luz vai de um meio mais refringente para um menos refringente, o raio refratado ' +
      'se afasta da normal. Aumentando o ângulo de incidência, chega-se a um ponto em que o ' +
      'refratado sai rasante, a 90°: é o ângulo crítico. Acima dele não há refração — toda a luz ' +
      'reflete. É o que prende a luz numa fibra óptica.',
    formulas: [{ tex: '\\sin\\theta_c = \\frac{n_2}{n_1} \\quad (n_1 > n_2)' }],
    demonstracao: [
      {
        descricao: 'Na lei de Snell, o refratado a 90° tem seno 1.',
        tex: 'n_1 \\sin\\theta_c = n_2 \\cdot 1',
      },
    ],
    exemplo: {
      enunciado: 'Do vidro (n = 1,5) para o ar.',
      passos: anguloLimiteComPassos(1.5, 1).passos,
    },
    vejaTambem: ['optica.refracao'],
  },
  {
    id: 'optica.lentes',
    titulo: 'Lentes delgadas e espelhos',
    resumo: '1/f = 1/p + 1/p′, com sinais que dizem se a imagem é real ou virtual.',
    definicao:
      'Uma lente convergente (f > 0) junta os raios paralelos no foco; uma divergente (f < 0) os ' +
      'espalha. A posição da imagem p′ sai da equação de Gauss. Convenção: p′ positivo é imagem ' +
      'real, do outro lado da lente; negativo é virtual, do mesmo lado do objeto. O aumento ' +
      'm = −p′/p dá o tamanho relativo, e o sinal negativo indica imagem invertida. A mesma ' +
      'equação vale para espelhos esféricos, com f = R/2.',
    formulas: [
      { tex: "\\frac{1}{f} = \\frac{1}{p} + \\frac{1}{p'}" },
      { tex: "m = \\frac{h'}{h} = -\\frac{p'}{p}" },
    ],
    demonstracao: [
      {
        descricao:
          'Por semelhança de triângulos com o raio que passa pelo centro e o que passa pelo foco.',
        tex: "\\frac{h'}{h} = -\\frac{p'}{p} \\quad \\text{e} \\quad \\frac{h'}{h} = -\\frac{p' - f}{f}",
      },
      {
        descricao: 'Igualando as duas expressões e dividindo por p·p′·f.',
        tex: "\\frac{1}{f} = \\frac{1}{p} + \\frac{1}{p'}",
      },
    ],
    exemplo: {
      enunciado: 'Objeto a 30 cm de uma lente convergente de foco 10 cm.',
      passos: lenteDelgadaComPassos(10, 30).passos,
    },
    vejaTambem: ['optica.refracao'],
  },
  {
    id: 'optica.interferencia',
    titulo: 'Interferência: a fenda dupla',
    resumo: 'Franjas claras onde os dois caminhos diferem por um número inteiro de λ.',
    definicao:
      'Na experiência de Young, a luz passa por duas fendas próximas e chega à tela por dois ' +
      'caminhos. Onde a diferença de caminho é um número inteiro de comprimentos de onda, as ondas ' +
      'se reforçam (franja clara); onde é meio comprimento a mais, se anulam (escura). Para ângulos ' +
      'pequenos, a franja clara de ordem m fica a y = m·λ·L/d do centro. Foi o experimento que ' +
      'mostrou que a luz é onda.',
    formulas: [
      { tex: 'd\\sin\\theta = m\\lambda' },
      { tex: 'y_m = \\frac{m \\lambda L}{d} \\quad (\\theta \\text{ pequeno})' },
    ],
    demonstracao: [
      {
        descricao: 'A diferença de caminho entre as fendas é d·sen θ.',
        tex: '\\Delta = d\\sin\\theta = m\\lambda',
      },
      {
        descricao: 'Para θ pequeno, sen θ ≈ tg θ = y/L.',
        tex: 'd\\frac{y}{L} = m\\lambda \\;\\Rightarrow\\; y = \\frac{m\\lambda L}{d}',
      },
    ],
    exemplo: {
      enunciado: 'Luz de 600 nm, fendas a 0,5 mm, tela a 2 m: a 2ª franja.',
      passos: fendaDuplaComPassos(2, 600, 2, 0.5).passos,
    },
    vejaTambem: ['ondas.relacao'],
  },
];
