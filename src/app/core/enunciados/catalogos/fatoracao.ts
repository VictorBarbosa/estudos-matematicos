/**
 * Os enunciados de fatoracao, para o catálogo juntar.
 *
 * ARQUIVO GERADO por `npm run enunciados:catalogo`. Não edite à mão: o que
 * se edita são os arquivos de `enunciados/fatoracao/<nível>/` e de
 * `enunciados/fatoracao/moldes/`, e este índice se refaz a partir deles.
 */

import efatoracaoMoldesForma1 from '@core/enunciados/enunciados/fatoracao/moldes/forma-1.json';
import efatoracaoMoldesForma2 from '@core/enunciados/enunciados/fatoracao/moldes/forma-2.json';
import efatoracaoMoldesForma3 from '@core/enunciados/enunciados/fatoracao/moldes/forma-3.json';
import { EntradaDeEnunciado } from '@core/enunciados/models/entrada-de-enunciado';

export const ENTRADAS_DE_FATORACAO: readonly EntradaDeEnunciado[] = [
  { topico: 'fatoracao', forma: 'forma-1', conteudo: efatoracaoMoldesForma1 },
  { topico: 'fatoracao', forma: 'forma-2', conteudo: efatoracaoMoldesForma2 },
  { topico: 'fatoracao', forma: 'forma-3', conteudo: efatoracaoMoldesForma3 },
];
