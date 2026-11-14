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
 * A derivação automática levou a cobertura de 6 para 58 tópicos. Os outros 72
 * ficam de fora por um motivo, e não por esquecimento, e são duas barreiras:
 *
 * - **sem unidade**: relação abstrata («quantos vértices tem um poliedro de 9
 *   arestas»). Ali uma história seria FALSA — um poliedro de 9 arestas não é
 *   um cubo, e nenhum objeto real tem essas medidas;
 * - **com álgebra à vista**: a incógnita já está no texto (`AB = 4x + 3 cm e
 *   DE = 5x − 4 cm`). Vestir de história não tem o que vestir: o molde mantém o
 *   `x` e a história repete a equação, que é justamente o passo que o aluno
 *   deveria dar.
 *
 * O portão confere formato, não sentido, então ele não pegaria nenhum dos dois;
 * as barreiras de viabilidade é que pegam.
 *
 * O piso é uma catraca: subir é sempre permitido (mais um tópico com
 * declaração escrita à mão), descer falha e obriga a olhar.
 */
const PISO_DE_TOPICOS = 58;

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

  it('enunciado com a incógnita à vista não vira história', () => {
    /*
     * O caso que o aluno relatou: a história chegou com «AB = {0}x + {1} cm e
     * DE = {2}x − {3} cm» dentro — o enunciado de origem com roupa nova, e a
     * modelagem entregue de graça.
     */
    expect(
      derivarProblema(
        'Os triângulos ABC e DEF são congruentes. Sabendo que AB = 4x + 3 cm e DE = 5x − 4 cm, quanto mede AB?',
        'Ângulos e triângulos',
      ),
    ).toBeNull();

    expect(derivarProblema('O lucro é C(q) = 1q² − 8q + 76, com q o preço.', 'Função quadrática')).toBeNull();
  });

  it('unidade com expoente NÃO é álgebra', () => {
    /*
     * A primeira versão da barreira barrou cinco tópicos por engano, porque
     * `m²`, `m/s²` e `kg/m³` pareciam `x²`. Estes quatro são o caso real que
     * precisa continuar funcionando.
     */
    for (const enunciado of [
      'Uma asa de 116 m² tem ar a 96 m/s na face superior. Qual é a sustentação, em newtons?',
      'Uma força resultante de 13 N age sobre um corpo de 6 kg. Qual é a aceleração, em m/s²?',
      'Um corpo de densidade 920 kg/m³ flutua em água. Que fração do volume fica submersa?',
      'Converta 1 m³ para cm³.',
    ]) {
      expect(derivarProblema(enunciado, 'Física'), enunciado).not.toBeNull();
    }
  });

  it('a derivação libera o numeral de enredo, e veda o que for dado', () => {
    /*
     * Esta é a causa mais silenciosa do «a tela não muda»: oito histórias de
     * congruência voltavam corretas da LLM e as oito eram recusadas por
     * `numero-escrito` — todas começavam com «dois triângulos». A história de
     * uma congruência É sobre duas figuras.
     */
    const derivada = derivarProblema(
      'Os triângulos ABC e DEF são congruentes. O ângulo A mede 44° e o ângulo E mede 78°. Quanto mede o ângulo C?',
      'Ângulos e triângulos',
    )!;

    expect(derivada.declaracao.pedido.permitidas).toContain('dois');
    expect(derivada.declaracao.pedido.permitidas).toContain('duas');

    // Mas se o dado sorteado for 2, «dois» pode ser a própria resposta.
    const comDois = derivarProblema(
      'Uma caixa tem altura 2 cm e largura 7 cm. Qual é a área, em cm²?',
      'Áreas',
    )!;

    expect(comDois.valores).toContain(2);
    expect(comDois.declaracao.pedido.permitidas).not.toContain('dois');
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
