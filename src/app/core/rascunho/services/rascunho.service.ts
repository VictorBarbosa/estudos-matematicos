import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Caminho, RAIZ } from '@core/rascunho/models/peca/peca';
import {
  Montagem,
  Peca,
  Recusa,
  apagar,
  avancarSePreciso,
  encaixar,
  irAoProximoBuraco,
  selecionar,
  subirNivel,
  virarLados,
} from '@core/rascunho/models/montagem/montagem';
import {
  LINHAS_VAZIAS,
  Linhas,
  comLinhaAtual,
  copiarAnterior,
  escolherLinha,
  linhaAtual,
  novaLinha,
  removerLinha,
  vazia,
} from '@core/rascunho/models/linhas/linhas';
import {
  Guardados,
  doTopico,
  esquecer,
  guardar,
  ler,
  serializar,
} from '@core/rascunho/models/guarda-rascunho/guarda-rascunho';

const CHAVE = 'estudos-matematicos.rascunho.v1';

/** Onde fica o rascunho de quem não está num tópico (a home, por exemplo). */
const SEM_TOPICO = 'geral';

/**
 * O monta monta: em que tópico se está, e o que foi montado.
 *
 * **O tópico vem da URL**, não de quem desenha o exercício. É o que mantém esta
 * ferramenta sem acoplamento nenhum com a área de treino, a prova e a prova
 * surpresa: as três servem exercício cada uma à sua maneira, e nenhuma precisa
 * saber que o rascunho existe. O preço é que o rascunho é do *tópico*, não da
 * *questão* — distinguir uma questão da seguinte exige saber o enunciado, e
 * isso é trabalho de uma fase posterior.
 *
 * O que persiste é a árvore, e a razão está em `guarda-rascunho`: ela são bytes,
 * e o Safari do iOS descarta aba em segundo plano no avião.
 *
 * Abrir e fechar não está aqui, e sim em `RascunhoAberturaService`: é o que
 * mantém este arquivo e os modelos fora do pacote inicial, já que o cabeçalho
 * precisa da pergunta mas não do conteúdo.
 */
@Injectable({ providedIn: 'root' })
export class RascunhoService {
  private readonly router = inject(Router);
  private readonly destroi = inject(DestroyRef);

  private readonly guardados = signal<Guardados>(ler(carregar()));
  private readonly endereco = signal<string>(this.router.url);

  /** O último motivo de uma ação não ter tido efeito, para a tela avisar. */
  private readonly ultimaRecusa = signal<Recusa | null>(null);

  /** Verdadeiro quando o rascunho passou do teto e não foi gravado. */
  private readonly estourou = signal(false);

  readonly recusa = this.ultimaRecusa.asReadonly();
  readonly naoCoube = this.estourou.asReadonly();

  /** O tópico de agora, tirado da URL. */
  readonly topico = computed(() => chaveDaUrl(this.endereco()));

  readonly linhas = computed<Linhas>(
    () => doTopico(this.guardados(), this.topico()) ?? LINHAS_VAZIAS,
  );

  /**
   * Onde está a seleção — e ela mora aqui, fora do que se guarda.
   *
   * A seleção é foco, não conteúdo: é da mesma natureza do cursor num campo de
   * texto, e ninguém espera reencontrá-lo onde o deixou na semana passada.
   * Guardá-la obrigaria o disco a carregar estado de interface, e trocá-la
   * marcaria o rascunho como alterado a cada toque de navegação. Ao voltar, a
   * seleção começa na raiz da linha em edição.
   */
  private readonly selecaoAtual = signal<Caminho>(RAIZ);

  readonly montagem = computed<Montagem>(() => ({
    arvore: linhaAtual(this.linhas()).arvore,
    selecao: this.selecaoAtual(),
  }));

  readonly vazio = computed(() => vazia(this.linhas()));

  constructor() {
    const assinatura = this.router.events.subscribe((evento) => {
      if (evento instanceof NavigationEnd) {
        this.endereco.set(evento.urlAfterRedirects);
      }
    });

    this.destroi.onDestroy(() => assinatura.unsubscribe());

    effect(() => {
      const texto = serializar(this.guardados());
      this.estourou.set(texto === null);

      if (texto !== null) {
        salvar(texto);
      }
    });

    // Trocar de tópico recomeça a seleção: a linha em edição é outra.
    effect(() => {
      this.topico();
      this.selecaoAtual.set(RAIZ);
    });
  }

  /**
   * Toca numa peça da bandeja: encaixa no buraco, ou envolve a peça escolhida.
   *
   * O avanço automático vem junto — depois de encaixar, a seleção cai no
   * próximo buraco, como num campo de código de verificação. Ele move o foco e
   * não escolhe nada.
   */
  tocarPeca(peca: Peca): void {
    this.mexer((montagem) => avancarSePreciso(encaixar(montagem, peca), peca));
  }

  apagarPeca(): void {
    this.mexer(apagar);
  }

  virar(): void {
    this.mexer(virarLados);
  }

  subir(): void {
    this.mexer(subirNivel);
  }

  irAoProximo(): void {
    this.mexer(irAoProximoBuraco);
  }

  escolherPeca(caminho: Caminho): void {
    this.mexer((montagem) => selecionar(montagem, caminho));
  }

  linhaNova(): void {
    this.trocarDeLinha(novaLinha(this.linhas()));
  }

  copiarLinha(): void {
    this.trocarDeLinha(copiarAnterior(this.linhas()));
  }

  escolher(indice: number): void {
    this.trocarDeLinha(escolherLinha(this.linhas(), indice));
  }

  remover(indice: number): void {
    this.trocarDeLinha(removerLinha(this.linhas(), indice));
  }

  /** Joga fora o rascunho deste tópico. */
  limpar(): void {
    this.ultimaRecusa.set(null);
    this.selecaoAtual.set(RAIZ);
    this.guardados.update((atuais) => esquecer(atuais, this.topico()));
  }

  private mexer(acao: (montagem: Montagem) => { montagem: Montagem; recusa: Recusa | null }): void {
    const resultado = acao(this.montagem());

    this.ultimaRecusa.set(resultado.recusa);
    this.selecaoAtual.set(resultado.montagem.selecao);
    this.trocarLinhas(comLinhaAtual(this.linhas(), resultado.montagem));
  }

  /** Muda qual linha se edita, e recomeça a seleção na raiz dela. */
  private trocarDeLinha(linhas: Linhas): void {
    this.selecaoAtual.set(RAIZ);
    this.trocarLinhas(linhas);
  }

  private trocarLinhas(linhas: Linhas): void {
    const topico = this.topico();

    this.guardados.update((atuais) => guardar(atuais, topico, linhas));
  }
}

/**
 * A chave do rascunho, tirada do endereço.
 *
 * Os parâmetros e o fragmento saem fora: `?nivel=medio` não faz um tópico
 * diferente. Fora de um tópico — a home, as configurações — o rascunho vai para
 * uma gaveta só, em vez de uma por tela.
 */
export function chaveDaUrl(url: string): string {
  const caminho = url.split(/[?#]/)[0] ?? '';
  const partes = caminho.split('/').filter((parte) => parte !== '');

  return partes.length === 0 ? SEM_TOPICO : partes.join('/');
}

function carregar(): string | null {
  try {
    return localStorage.getItem(CHAVE);
  } catch {
    // Janela privada: o rascunho vale só para esta sessão.
    return null;
  }
}

function salvar(texto: string): void {
  try {
    localStorage.setItem(CHAVE, texto);
  } catch {
    // Disco cheio ou janela privada: o que está na memória continua valendo.
  }
}
