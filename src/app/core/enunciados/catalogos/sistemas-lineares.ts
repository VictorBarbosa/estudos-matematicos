/**
 * Os enunciados de sistemas-lineares, para o catálogo juntar.
 *
 * ARQUIVO GERADO por `npm run enunciados:catalogo`. Não edite à mão: o que
 * se edita são os arquivos de `enunciados/sistemas-lineares/<nível>/` e de
 * `enunciados/sistemas-lineares/moldes/`, e este índice se refaz a partir deles.
 */

import esistemasLinearesMoldesForma1 from '@core/enunciados/enunciados/sistemas-lineares/moldes/forma-1.json';
import esistemasLinearesMoldesInfinitasSolucoesValorDeM from '@core/enunciados/enunciados/sistemas-lineares/moldes/infinitas-solucoes-valor-de-m.json';
import esistemasLinearesMoldesProblemaAnimais from '@core/enunciados/enunciados/sistemas-lineares/moldes/problema-animais.json';
import esistemasLinearesMoldesProblemaIngressos from '@core/enunciados/enunciados/sistemas-lineares/moldes/problema-ingressos.json';
import esistemasLinearesMoldesProblemaQuestoes from '@core/enunciados/enunciados/sistemas-lineares/moldes/problema-questoes.json';
import esistemasLinearesMoldesProblemaVeiculos from '@core/enunciados/enunciados/sistemas-lineares/moldes/problema-veiculos.json';
import esistemasLinearesMoldesSistemaImpossivelValorDeK from '@core/enunciados/enunciados/sistemas-lineares/moldes/sistema-impossivel-valor-de-k.json';
import { EntradaDeEnunciado } from '@core/enunciados/models/entrada-de-enunciado';

export const ENTRADAS_DE_SISTEMAS_LINEARES: readonly EntradaDeEnunciado[] = [
  { topico: 'sistemas-lineares', forma: 'forma-1', conteudo: esistemasLinearesMoldesForma1 },
  { topico: 'sistemas-lineares', forma: 'infinitas-solucoes-valor-de-m', conteudo: esistemasLinearesMoldesInfinitasSolucoesValorDeM },
  { topico: 'sistemas-lineares', forma: 'problema-animais', conteudo: esistemasLinearesMoldesProblemaAnimais },
  { topico: 'sistemas-lineares', forma: 'problema-ingressos', conteudo: esistemasLinearesMoldesProblemaIngressos },
  { topico: 'sistemas-lineares', forma: 'problema-questoes', conteudo: esistemasLinearesMoldesProblemaQuestoes },
  { topico: 'sistemas-lineares', forma: 'problema-veiculos', conteudo: esistemasLinearesMoldesProblemaVeiculos },
  { topico: 'sistemas-lineares', forma: 'sistema-impossivel-valor-de-k', conteudo: esistemasLinearesMoldesSistemaImpossivelValorDeK },
];
