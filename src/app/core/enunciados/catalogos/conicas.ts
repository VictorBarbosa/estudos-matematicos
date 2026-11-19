/**
 * Os enunciados de conicas, para o catálogo juntar.
 *
 * ARQUIVO GERADO por `npm run enunciados:catalogo`. Não edite à mão: o que
 * se edita são os arquivos de `enunciados/conicas/<nível>/` e de
 * `enunciados/conicas/moldes/`, e este índice se refaz a partir deles.
 */

import econicasFacil01 from '@core/enunciados/enunciados/conicas/facil/01.json';
import econicasFacil02 from '@core/enunciados/enunciados/conicas/facil/02.json';
import econicasFacil03 from '@core/enunciados/enunciados/conicas/facil/03.json';
import econicasFacil04 from '@core/enunciados/enunciados/conicas/facil/04.json';
import econicasMedio01 from '@core/enunciados/enunciados/conicas/medio/01.json';
import econicasMedio02 from '@core/enunciados/enunciados/conicas/medio/02.json';
import econicasMedio03 from '@core/enunciados/enunciados/conicas/medio/03.json';
import econicasMedio04 from '@core/enunciados/enunciados/conicas/medio/04.json';
import econicasDificil01 from '@core/enunciados/enunciados/conicas/dificil/01.json';
import econicasDificil02 from '@core/enunciados/enunciados/conicas/dificil/02.json';
import econicasDificil03 from '@core/enunciados/enunciados/conicas/dificil/03.json';
import econicasDificil04 from '@core/enunciados/enunciados/conicas/dificil/04.json';
import econicasExtremo01 from '@core/enunciados/enunciados/conicas/extremo/01.json';
import econicasExtremo02 from '@core/enunciados/enunciados/conicas/extremo/02.json';
import econicasExtremo03 from '@core/enunciados/enunciados/conicas/extremo/03.json';
import econicasExtremo04 from '@core/enunciados/enunciados/conicas/extremo/04.json';
import econicasMoldesForma1 from '@core/enunciados/enunciados/conicas/moldes/forma-1.json';
import econicasMoldesForma2 from '@core/enunciados/enunciados/conicas/moldes/forma-2.json';
import econicasMoldesForma3 from '@core/enunciados/enunciados/conicas/moldes/forma-3.json';
import econicasMoldesDiretrizDaParabola from '@core/enunciados/enunciados/conicas/moldes/diretriz-da-parabola.json';
import econicasMoldesOrdenadaDoFoco from '@core/enunciados/enunciados/conicas/moldes/ordenada-do-foco.json';
import { EntradaDeEnunciado } from '@core/enunciados/models/entrada-de-enunciado';

export const ENTRADAS_DE_CONICAS: readonly EntradaDeEnunciado[] = [
  { topico: 'conicas', nivel: 'facil', conteudo: econicasFacil01 },
  { topico: 'conicas', nivel: 'facil', conteudo: econicasFacil02 },
  { topico: 'conicas', nivel: 'facil', conteudo: econicasFacil03 },
  { topico: 'conicas', nivel: 'facil', conteudo: econicasFacil04 },
  { topico: 'conicas', nivel: 'medio', conteudo: econicasMedio01 },
  { topico: 'conicas', nivel: 'medio', conteudo: econicasMedio02 },
  { topico: 'conicas', nivel: 'medio', conteudo: econicasMedio03 },
  { topico: 'conicas', nivel: 'medio', conteudo: econicasMedio04 },
  { topico: 'conicas', nivel: 'dificil', conteudo: econicasDificil01 },
  { topico: 'conicas', nivel: 'dificil', conteudo: econicasDificil02 },
  { topico: 'conicas', nivel: 'dificil', conteudo: econicasDificil03 },
  { topico: 'conicas', nivel: 'dificil', conteudo: econicasDificil04 },
  { topico: 'conicas', nivel: 'extremo', conteudo: econicasExtremo01 },
  { topico: 'conicas', nivel: 'extremo', conteudo: econicasExtremo02 },
  { topico: 'conicas', nivel: 'extremo', conteudo: econicasExtremo03 },
  { topico: 'conicas', nivel: 'extremo', conteudo: econicasExtremo04 },
  { topico: 'conicas', forma: 'forma-1', conteudo: econicasMoldesForma1 },
  { topico: 'conicas', forma: 'forma-2', conteudo: econicasMoldesForma2 },
  { topico: 'conicas', forma: 'forma-3', conteudo: econicasMoldesForma3 },
  { topico: 'conicas', forma: 'diretriz-da-parabola', conteudo: econicasMoldesDiretrizDaParabola },
  { topico: 'conicas', forma: 'ordenada-do-foco', conteudo: econicasMoldesOrdenadaDoFoco },
];
