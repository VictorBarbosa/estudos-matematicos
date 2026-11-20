import { Injectable, signal } from '@angular/core';

const CHAVE = 'estudos-matematicos.dicas-visiveis.v1';

/**
 * A dica está à mostra?
 *
 * A dica é a linha curta sob o enunciado («A altura é o cateto oposto e a
 * sombra, o adjacente: altura = 18·tg 35°»). Ela ajuda quem está começando e
 * entrega o caminho para quem já sabe — e quem já sabe quer treinar sem ela.
 *
 * Por isso a escolha fica na própria tela de treino, e não nas configurações:
 * ela muda com o momento do estudo, às vezes no meio de uma sessão, e ter de
 * sair do exercício para desligá-la seria o mesmo que não poder desligar.
 *
 * O valor vale para o site inteiro e sobrevive ao recarregamento: desligar a
 * dica num tópico e reencontrá-la ligada no seguinte seria a escolha se
 * desfazendo sozinha. Começa LIGADA, porque esconder a ajuda de quem nunca a
 * viu é pior do que mostrá-la a quem não precisa.
 */
@Injectable({ providedIn: 'root' })
export class DicasService {
  private readonly estado = signal<boolean>(carregar());

  /** A dica aparece sob o enunciado? */
  readonly visiveis = this.estado.asReadonly();

  /** Liga ou desliga a dica. */
  alternar(): void {
    this.definir(!this.estado());
  }

  /**
   * Liga ou desliga a dica, com o valor da caixa de seleção.
   *
   * Grava na hora, e não por um `effect`: o efeito só roda quando o Angular
   * processa a mudança, e a escolha precisa estar guardada mesmo que a tela
   * seja trocada no mesmo instante do clique.
   */
  definir(visiveis: boolean): void {
    this.estado.set(visiveis);
    salvar(visiveis);
  }
}

function carregar(): boolean {
  try {
    // Só o 'false' escrito por quem desligou tira a dica: qualquer outra coisa
    // — primeira visita, armazenamento limpo, valor estragado — mostra.
    return localStorage.getItem(CHAVE) !== 'false';
  } catch {
    return true;
  }
}

function salvar(visiveis: boolean): void {
  try {
    localStorage.setItem(CHAVE, String(visiveis));
  } catch {
    // Janela privada: a escolha vale só para esta sessão.
  }
}
