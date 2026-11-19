/**
 * Os enunciados de produtos-notaveis, para o catálogo juntar.
 *
 * ARQUIVO GERADO por `npm run enunciados:catalogo`. Não edite à mão: o que
 * se edita são os arquivos de `enunciados/produtos-notaveis/<nível>/` e de
 * `enunciados/produtos-notaveis/moldes/`, e este índice se refaz a partir deles.
 */

import eprodutosNotaveisMoldesForma1 from '@core/enunciados/enunciados/produtos-notaveis/moldes/forma-1.json';
import eprodutosNotaveisMoldesForma2 from '@core/enunciados/enunciados/produtos-notaveis/moldes/forma-2.json';
import eprodutosNotaveisMoldesForma3 from '@core/enunciados/enunciados/produtos-notaveis/moldes/forma-3.json';
import eprodutosNotaveisMoldesCoeficienteDeX from '@core/enunciados/enunciados/produtos-notaveis/moldes/coeficiente-de-x.json';
import eprodutosNotaveisMoldesCoeficienteDoMeio from '@core/enunciados/enunciados/produtos-notaveis/moldes/coeficiente-do-meio.json';
import { EntradaDeEnunciado } from '@core/enunciados/models/entrada-de-enunciado';

export const ENTRADAS_DE_PRODUTOS_NOTAVEIS: readonly EntradaDeEnunciado[] = [
  { topico: 'produtos-notaveis', forma: 'forma-1', conteudo: eprodutosNotaveisMoldesForma1 },
  { topico: 'produtos-notaveis', forma: 'forma-2', conteudo: eprodutosNotaveisMoldesForma2 },
  { topico: 'produtos-notaveis', forma: 'forma-3', conteudo: eprodutosNotaveisMoldesForma3 },
  { topico: 'produtos-notaveis', forma: 'coeficiente-de-x', conteudo: eprodutosNotaveisMoldesCoeficienteDeX },
  { topico: 'produtos-notaveis', forma: 'coeficiente-do-meio', conteudo: eprodutosNotaveisMoldesCoeficienteDoMeio },
];
