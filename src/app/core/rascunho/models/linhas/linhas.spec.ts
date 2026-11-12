import { Arvore, paraTexto } from '@core/rascunho/models/peca/peca';
import { apagar, encaixar } from '@core/rascunho/models/montagem/montagem';
import {
  LIMITE_DE_LINHAS,
  LINHAS_VAZIAS,
  aplicar,
  comLinhaAtual,
  copiarAnterior,
  escolherLinha,
  linhaAtual,
  linhasDe,
  novaLinha,
  removerLinha,
  vazia,
} from '@core/rascunho/models/linhas/linhas';

const num = (algarismos: string): Arvore => ({ tipo: 'numero', algarismos, negativo: false });

describe('linhas', () => {
  it('a pilha nasce com uma linha vazia', () => {
    expect(LINHAS_VAZIAS.linhas.length).toBe(1);
    expect(LINHAS_VAZIAS.atual).toBe(0);
    expect(vazia(LINHAS_VAZIAS)).toBe(true);
  });

  it('a linha nova nasce vazia e já em edição', () => {
    const comNumero = aplicar(LINHAS_VAZIAS, (m) => encaixar(m, { tipo: 'algarismo', valor: '5' }));
    const duas = novaLinha(comNumero.estado);

    expect(duas.linhas.length).toBe(2);
    expect(duas.atual).toBe(1);
    expect(duas.linhas[1]!.arvore.tipo).toBe('buraco');
  });

  describe('copiar a anterior', () => {
    it('a nova linha começa igual à de cima', () => {
      const comNumero = aplicar(LINHAS_VAZIAS, (m) =>
        encaixar(m, { tipo: 'algarismo', valor: '7' }),
      );
      const copiada = copiarAnterior(comNumero.estado);

      expect(copiada.linhas.length).toBe(2);
      expect(paraTexto(copiada.linhas[1]!.arvore)).toBe('7');
      expect(copiada.atual).toBe(1);
    });

    /**
     * A propriedade que importa, com nós imutáveis.
     *
     * Não faz sentido cobrar que a cópia não compartilhe referência: isso só
     * seria um problema se os nós pudessem ser mudados no lugar. O que precisa
     * valer é que editar a linha nova não alcance a antiga — e vale, porque
     * toda ação devolve árvore nova.
     */
    it('editar a linha copiada não altera a anterior', () => {
      const primeira = linhasDe([num('42')], 0);
      const copiada = copiarAnterior(primeira);

      const editada = aplicar(copiada, apagar);

      expect(paraTexto(editada.estado.linhas[0]!.arvore)).toBe('42');
      expect(editada.estado.linhas[1]!.arvore.tipo).toBe('buraco');
    });
  });

  it('a pilha tem teto, e cheia não cresce mais', () => {
    let estado = LINHAS_VAZIAS;

    for (let i = 1; i < LIMITE_DE_LINHAS; i++) {
      estado = novaLinha(estado);
    }

    expect(estado.linhas.length).toBe(LIMITE_DE_LINHAS);
    expect(novaLinha(estado)).toBe(estado);
    expect(copiarAnterior(estado)).toBe(estado);
  });

  it('escolher uma linha a põe em edição, e um índice de fora não faz nada', () => {
    const duas = novaLinha(LINHAS_VAZIAS);

    expect(escolherLinha(duas, 0).atual).toBe(0);
    expect(escolherLinha(duas, 9)).toBe(duas);
    expect(escolherLinha(duas, -1)).toBe(duas);
  });

  it('remover tira a linha e traz a edição para dentro da pilha', () => {
    const tres = novaLinha(novaLinha(linhasDe([num('1')], 0)));

    const restam = removerLinha(tres, 2);

    expect(restam.linhas.length).toBe(2);
    expect(restam.atual).toBe(1);
  });

  it('remover a única linha devolve a pilha vazia', () => {
    const uma = linhasDe([num('9')], 0);

    expect(vazia(removerLinha(uma, 0))).toBe(true);
  });

  it('linhasDe conserta um índice fora da pilha', () => {
    expect(linhasDe([num('1'), num('2')], 7).atual).toBe(1);
    expect(linhasDe([num('1')], -3).atual).toBe(0);
    expect(linhasDe([], 0)).toBe(LINHAS_VAZIAS);
  });

  it('comLinhaAtual troca apenas a linha em edição', () => {
    const duas = novaLinha(linhasDe([num('1')], 0));
    const trocada = comLinhaAtual(duas, { arvore: num('8'), selecao: [] });

    expect(paraTexto(trocada.linhas[0]!.arvore)).toBe('1');
    expect(paraTexto(trocada.linhas[1]!.arvore)).toBe('8');
    expect(paraTexto(linhaAtual(trocada).arvore)).toBe('8');
  });

  it('aplicar devolve a recusa junto com a pilha', () => {
    const { recusa } = aplicar(LINHAS_VAZIAS, apagar);

    expect(recusa).toBe('sem-efeito');
  });
});
