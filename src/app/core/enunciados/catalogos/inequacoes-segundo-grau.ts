/**
 * Os enunciados de inequacoes-segundo-grau, para o catálogo juntar.
 *
 * ARQUIVO GERADO por `npm run enunciados:catalogo`. Não edite à mão: o que
 * se edita são os arquivos de `enunciados/inequacoes-segundo-grau/<nível>/` e de
 * `enunciados/inequacoes-segundo-grau/moldes/`, e este índice se refaz a partir deles.
 */

import einequacoesSegundoGrauMoldesResolvaAInequacao from '@core/enunciados/enunciados/inequacoes-segundo-grau/moldes/resolva-a-inequacao.json';
import einequacoesSegundoGrauMoldesSufixoFronteirasComoFracao from '@core/enunciados/enunciados/inequacoes-segundo-grau/moldes/sufixo-fronteiras-como-fracao.json';
import { EntradaDeEnunciado } from '@core/enunciados/models/entrada-de-enunciado';

export const ENTRADAS_DE_INEQUACOES_SEGUNDO_GRAU: readonly EntradaDeEnunciado[] = [
  { topico: 'inequacoes-segundo-grau', forma: 'resolva-a-inequacao', conteudo: einequacoesSegundoGrauMoldesResolvaAInequacao },
  { topico: 'inequacoes-segundo-grau', forma: 'sufixo-fronteiras-como-fracao', conteudo: einequacoesSegundoGrauMoldesSufixoFronteirasComoFracao },
];
