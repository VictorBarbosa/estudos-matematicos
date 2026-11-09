import { CARREGAR_GERADOR } from '@core/treino/registro-geradores/registro-geradores';
import { NIVEIS } from '@core/treino/models/treino.model';
import { criarRng } from '@core/treino/rng/rng';

/**
 * Os tópicos que medem o espaço — e que, por isso, precisam dizer em quê.
 *
 * «Qual é a área de um círculo de raio 16?» deixa o 16 solto: 16 do quê, e a
 * resposta em quê? Em geometria a unidade não é enfeite, é metade do
 * enunciado — e é ela que distingue o comprimento (cm) da área (cm²) e do
 * volume (cm³), que é justamente o erro que estes tópicos ensinam a evitar.
 */
const TOPICOS = [
  'angulos-e-triangulos',
  'semelhanca-e-pitagoras',
  'areas-de-figuras-planas',
  'circulo-e-poligonos',
  'solidos-e-volumes',
];

describe('enunciados de geometria', () => {
  it('toda medida vem com unidade', async () => {
    const semUnidade: string[] = [];

    for (const topicoId of TOPICOS) {
      const gerador = await CARREGAR_GERADOR[topicoId]!();

      for (const nivel of NIVEIS) {
        const rng = criarRng(11);
        for (let i = 0; i < 120; i++) {
          const { enunciado } = gerador.gerar(nivel, rng);
          // Grau serve às perguntas de ângulo, que não medem comprimento —
          // escrito como símbolo ou por extenso, «(em graus)». O metro serve
          // ao que não cabe em centímetros, como a sombra de um prédio.
          if (/\bcm²|\bcm³|\bcm\b|\bm²|\bm³|\bm\b|°|\bgraus?\b/.test(enunciado)) {
            continue;
          }

          semUnidade.push(`${topicoId}: ${enunciado.replace(/[\d.,]+/g, 'N')}`);
        }
      }
    }

    expect([...new Set(semUnidade)]).toEqual([]);
  });
});
