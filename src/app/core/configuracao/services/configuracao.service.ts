import { Injectable, computed, effect, signal } from '@angular/core';
import {
  Ajuste,
  CONFIGURACAO_PADRAO,
  Configuracao,
  definir,
  ehPadrao,
  validar,
} from '@core/configuracao/models/configuracao.model';

const CHAVE = 'estudos-matematicos.configuracao.v1';

/**
 * Os números da progressão, como o aluno os deixou.
 *
 * Mudar um ajuste não apaga nada: o critério é recalculado sobre o histórico
 * que já existe, então baixar a exigência pode abrir uma etapa na hora, e
 * subi-la pode fechar uma que estava aberta. É o comportamento certo — o
 * critério diz o que vale AGORA.
 */
@Injectable({ providedIn: 'root' })
export class ConfiguracaoService {
  private readonly estado = signal<Configuracao>(carregar());

  readonly configuracao = this.estado.asReadonly();
  readonly etapa = computed(() => this.estado().etapa);
  readonly escada = computed(() => this.estado().escada);
  readonly prova = computed(() => this.estado().prova);

  /** Está tudo como veio de fábrica? */
  readonly intocada = computed(() => ehPadrao(this.estado()));

  constructor() {
    effect(() => salvar(this.estado()));
  }

  definir(ajuste: Ajuste, valor: number): void {
    this.estado.update((atual) => definir(atual, ajuste, valor));
  }

  redefinir(): void {
    this.estado.set(CONFIGURACAO_PADRAO);
  }
}

function carregar(): Configuracao {
  try {
    const bruto = localStorage.getItem(CHAVE);
    return bruto === null ? CONFIGURACAO_PADRAO : validar(JSON.parse(bruto));
  } catch {
    return CONFIGURACAO_PADRAO;
  }
}

function salvar(configuracao: Configuracao): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(configuracao));
  } catch {
    // Janela privada: a configuração vale só para esta sessão.
  }
}
