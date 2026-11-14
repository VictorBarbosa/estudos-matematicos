import { Injectable, computed, effect, signal } from '@angular/core';
import {
  ConfiguracaoDaLlm,
  LLM_PADRAO,
  definirLlm,
  llmEhPadrao,
  validarLlm,
} from '@core/configuracao/models/llm.model';
import {
  Ajuste,
  CONFIGURACAO_PADRAO,
  Configuracao,
  definir,
  ehPadrao,
  validar,
} from '@core/configuracao/models/configuracao.model';

const CHAVE = 'estudos-matematicos.configuracao.v1';
const CHAVE_TOPICOS = 'estudos-matematicos.topicos-fora.v1';
const CHAVE_LLM = 'estudos-matematicos.llm.v1';

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

  /**
   * Os tópicos que o aluno tirou do plano.
   *
   * Guardados pelo que foi REMOVIDO, e não pelo que ficou: assim um tópico
   * novo no currículo entra no plano de quem já usa o site, em vez de ficar
   * de fora por não constar numa lista escrita no passado.
   */
  private readonly fora = signal<ReadonlySet<string>>(carregarFora());

  /**
   * A LLM local: endereço, modelo, raciocínio e tamanho do lote.
   *
   * Fica aqui desde que deixou de ser constante no código. Quem lê é
   * `HistoriasService`, e o que se ajusta é a tela de configurações.
   */
  private readonly llm = signal<ConfiguracaoDaLlm>(carregarLlm());

  readonly configuracao = this.estado.asReadonly();
  readonly topicosRemovidos = this.fora.asReadonly();
  readonly etapa = computed(() => this.estado().etapa);
  readonly escada = computed(() => this.estado().escada);
  readonly prova = computed(() => this.estado().prova);
  readonly surpresa = computed(() => this.estado().surpresa);

  /** Está tudo como veio de fábrica? */
  readonly intocada = computed(
    () => ehPadrao(this.estado()) && this.fora().size === 0 && llmEhPadrao(this.llm()),
  );

  constructor() {
    effect(() => salvar(this.estado()));
    effect(() => salvarFora(this.fora()));
    effect(() => salvarLlm(this.llm()));
  }

  /** A configuração da LLM, como a tela a lê. */
  readonly configuracaoDaLlm = this.llm.asReadonly();

  /** A LLM está de fábrica? */
  readonly llmIntocada = computed(() => llmEhPadrao(this.llm()));

  /** Troca um campo da LLM. Texto livre, menos o lote, que é preso no limite. */
  definirLlm(campo: keyof ConfiguracaoDaLlm, valor: string | number): void {
    this.llm.update((atual) => definirLlm(atual, campo, valor));
  }

  redefinirLlm(): void {
    this.llm.set(LLM_PADRAO);
  }

  /** Tira o tópico do plano, ou devolve-o. */
  alternarTopico(topicoId: string): void {
    this.fora.update((atual) => {
      const novo = new Set(atual);
      if (!novo.delete(topicoId)) {
        novo.add(topicoId);
      }
      return novo;
    });
  }

  /** Devolve ao plano todos os tópicos que tinham sido tirados. */
  incluirTodos(): void {
    this.fora.set(new Set());
  }

  definir(ajuste: Ajuste, valor: number): void {
    this.estado.update((atual) => definir(atual, ajuste, valor));
  }

  redefinir(): void {
    this.estado.set(CONFIGURACAO_PADRAO);
    this.fora.set(new Set());
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

function carregarFora(): ReadonlySet<string> {
  try {
    const bruto = localStorage.getItem(CHAVE_TOPICOS);
    const lido: unknown = bruto === null ? [] : JSON.parse(bruto);
    return new Set(
      Array.isArray(lido) ? lido.filter((item): item is string => typeof item === 'string') : [],
    );
  } catch {
    return new Set();
  }
}

function salvarFora(fora: ReadonlySet<string>): void {
  try {
    localStorage.setItem(CHAVE_TOPICOS, JSON.stringify([...fora]));
  } catch {
    // Janela privada: vale só para esta sessão.
  }
}

function carregarLlm(): ConfiguracaoDaLlm {
  try {
    const gravado = localStorage.getItem(CHAVE_LLM);

    return gravado === null ? LLM_PADRAO : validarLlm(JSON.parse(gravado) as unknown);
  } catch {
    return LLM_PADRAO;
  }
}

function salvarLlm(llm: ConfiguracaoDaLlm): void {
  try {
    localStorage.setItem(CHAVE_LLM, JSON.stringify(llm));
  } catch {
    // Aba privada ou armazenamento cheio: a escolha vale só para esta sessão.
  }
}
