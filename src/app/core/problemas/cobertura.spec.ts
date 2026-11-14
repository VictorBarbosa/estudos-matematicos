import { CARREGAR_GERADOR } from '@core/treino/registro-geradores/registro-geradores';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, enunciadoEm } from '@core/treino/models/treino.model';
import { derivarProblema } from '@core/problemas/derivacao/derivar-problema';

/**
 * Quantos tópicos chamam a LLM — e o piso que não pode cair.
 *
 * O defeito que originou este guarda: seis tópicos tinham declaração escrita à
 * mão, e nos outros 124 nenhuma requisição saía. Quem estudava concluía, com
 * razão, que o recurso não existia.
 *
 * A derivação automática levou a cobertura de 6 para 59 tópicos. Os outros 71
 * ficam de fora por um motivo, e não por esquecimento: o enunciado deles é
 * relação abstrata ou manipulação simbólica («derive f(x) = 3x² + 2x», «quantos
 * vértices tem um poliedro de 9 arestas»). Ali uma história seria FALSA — um
 * poliedro de 9 arestas não é um cubo, e nenhum objeto real tem essas medidas.
 * O portão confere formato, não sentido, então ele não pegaria isso; a barreira
 * de viabilidade é que pega.
 *
 * O piso é uma catraca: subir é sempre permitido (mais um tópico com
 * declaração escrita à mão), descer falha e obriga a olhar.
 */
const PISO_DE_TOPICOS = 59;

describe('cobertura da chamada à LLM', () => {
  it('nenhum tópico perde a chamada sem alguém decidir isso', async () => {
    const ids = Object.keys(CARREGAR_GERADOR);
    const chamam: string[] = [];

    for (const id of ids) {
      const gerador = await CARREGAR_GERADOR[id]!();
      const rng = criarRng(777);

      for (const nivel of NIVEIS) {
        for (let i = 0; i < 20; i++) {
          const exercicio = gerador.gerar(nivel, rng);

          const chama =
            gerador.problemaDeTexto !== undefined
              ? exercicio.dadosDoProblema !== undefined
              : derivarProblema(enunciadoEm(exercicio, 'pt'), id) !== null;

          if (chama) {
            chamam.push(id);
            break;
          }
        }

        if (chamam.includes(id)) {
          break;
        }
      }
    }

    expect(
      chamam.length,
      `eram ${PISO_DE_TOPICOS} tópicos chamando a LLM, agora são ${chamam.length}. ` +
        'Se a queda foi intencional, atualize o piso neste arquivo.',
    ).toBeGreaterThanOrEqual(PISO_DE_TOPICOS);
  });

  it('a derivação não inventa lacuna para número dentro de parênteses', () => {
    const derivada = derivarProblema(
      'Qual é o volume de um cilindro de raio 4 cm e altura 9 cm? (em cm³, 2 casas decimais)',
      'Sólidos e volumes',
    )!;

    // O «2» é contrato de resposta, não dado: virar lacuna faria a história
    // prometer duas casas decimais como se fosse uma quantidade.
    expect(derivada.valores).toEqual([4, 9]);
    expect(derivada.declaracao.pedido.relacao).not.toContain('{2}');
    expect(derivada.declaracao.pedido.relacao).toContain('2 casas decimais');
  });

  it('enunciado de relação abstrata não vira história', () => {
    expect(
      derivarProblema('Um poliedro convexo tem 9 arestas e 5 faces. Quantos vértices ele tem?', 'Poliedros'),
    ).toBeNull();
  });

  it('enunciado sem número nenhum não vira história', () => {
    expect(
      derivarProblema('Calcule e escreva o resultado na forma mais simples.', 'Frações'),
    ).toBeNull();
  });
});
