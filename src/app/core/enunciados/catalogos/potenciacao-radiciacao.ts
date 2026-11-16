/**
 * Os enunciados de potenciacao-radiciacao, para o catálogo juntar.
 *
 * ARQUIVO GERADO por `npm run enunciados:catalogo`. Não edite à mão: o que
 * se edita são os arquivos de `enunciados/potenciacao-radiciacao/<nível>/` e de
 * `enunciados/potenciacao-radiciacao/moldes/`, e este índice se refaz a partir deles.
 */

import epotenciacaoRadiciacaoMoldesForma1 from '@core/enunciados/enunciados/potenciacao-radiciacao/moldes/forma-1.json';
import epotenciacaoRadiciacaoMoldesForma2 from '@core/enunciados/enunciados/potenciacao-radiciacao/moldes/forma-2.json';
import epotenciacaoRadiciacaoMoldesForma3 from '@core/enunciados/enunciados/potenciacao-radiciacao/moldes/forma-3.json';
import epotenciacaoRadiciacaoMoldesForma4 from '@core/enunciados/enunciados/potenciacao-radiciacao/moldes/forma-4.json';
import epotenciacaoRadiciacaoMoldesForma5 from '@core/enunciados/enunciados/potenciacao-radiciacao/moldes/forma-5.json';
import { EntradaDeEnunciado } from '@core/enunciados/models/entrada-de-enunciado';

export const ENTRADAS_DE_POTENCIACAO_RADICIACAO: readonly EntradaDeEnunciado[] = [
  { topico: 'potenciacao-radiciacao', forma: 'forma-1', conteudo: epotenciacaoRadiciacaoMoldesForma1 },
  { topico: 'potenciacao-radiciacao', forma: 'forma-2', conteudo: epotenciacaoRadiciacaoMoldesForma2 },
  { topico: 'potenciacao-radiciacao', forma: 'forma-3', conteudo: epotenciacaoRadiciacaoMoldesForma3 },
  { topico: 'potenciacao-radiciacao', forma: 'forma-4', conteudo: epotenciacaoRadiciacaoMoldesForma4 },
  { topico: 'potenciacao-radiciacao', forma: 'forma-5', conteudo: epotenciacaoRadiciacaoMoldesForma5 },
];
