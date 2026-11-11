import { toleranciaDaProva } from '@core/prova/models/prova.model';
import { ProvaSurpresaService } from '@core/prova/services/prova-surpresa.service';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  Ajuste,
  CONFIGURACAO_PADRAO,
  Configuracao,
  LIMITES,
} from '@core/configuracao/models/configuracao.model';
import { ConfiguracaoService } from '@core/configuracao/services/configuracao.service';
import { CURRICULO } from '@curriculo/curriculo';
import { I18nService } from '@core/i18n/services/i18n.service';

/** Um ajuste do jeito que ele aparece na tela. */
interface Campo {
  readonly ajuste: Ajuste;
  /** Chave do rótulo e da explicação, no dicionário. */
  readonly chave: string;
  readonly valor: number;
  readonly padrao: number;
  readonly minimo: number;
  readonly maximo: number;
  /** O valor foi mexido? Serve para marcar o que saiu de fábrica. */
  readonly mudado: boolean;
}

/** Os ajustes agrupados como a tela os mostra. */
interface Bloco {
  readonly id: string;
  readonly campos: readonly Campo[];
}

/** Um tópico do currículo, com a marca de estar ou não no plano. */
interface TopicoEscolhivel {
  readonly id: string;
  readonly titulo: string;
  readonly dentro: boolean;
}

/** Uma área do currículo na lista de escolha. */
interface AreaEscolhivel {
  readonly id: string;
  readonly titulo: string;
  readonly topicos: readonly TopicoEscolhivel[];
  readonly dentro: number;
}

const ORDEM: readonly Ajuste[] = [
  ['etapa', 'respostasNaJanela'],
  ['etapa', 'acertosNaJanela'],
  ['etapa', 'acertosExigentes'],
  ['etapa', 'acertosSeguidosFinais'],
  ['etapa', 'acertosPorTipo'],
  ['escada', 'acertosParaSubir'],
  ['escada', 'errosParaDescer'],
  ['prova', 'percentualDeAcerto'],
  ['prova', 'minimoDeQuestoes'],
  ['prova', 'questoesPorTopico'],
  ['surpresa', 'ativa'],
  ['surpresa', 'intervaloEmDias'],
  ['surpresa', 'minimoDeTopicos'],
  ['surpresa', 'questoesPorTopico'],
  ['surpresa', 'percentualDeAcerto'],
];

/**
 * A tela onde os números da progressão se ajustam.
 *
 * Eles eram constantes no código, e mudar qualquer um exigia um deploy. São
 * poucas decisões, mas são as que definem quanto o site exige — e quem estuda
 * sabe melhor que nós se o ritmo está pesado ou frouxo.
 */
@Component({
  selector: 'app-configuracoes',
  imports: [RouterLink],
  templateUrl: './configuracoes.html',
  styleUrl: './configuracoes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Configuracoes {
  protected readonly i18n = inject(I18nService);
  private readonly servico = inject(ConfiguracaoService);
  private readonly provaSurpresa = inject(ProvaSurpresaService);

  /** A prova surpresa aberta agora, se houver. */
  protected readonly surpresaAtiva = this.provaSurpresa.ativa;
  protected readonly trancados = computed(() => this.provaSurpresa.trancadosAtivos().size);

  protected readonly intocada = this.servico.intocada;

  protected readonly blocos = computed<readonly Bloco[]>(() => {
    const atual = this.servico.configuracao();

    return (['etapa', 'escada', 'prova', 'surpresa'] as const).map((id) => ({
      id,
      campos: ORDEM.filter((ajuste) => ajuste[0] === id).map((ajuste) => this.campo(ajuste, atual)),
    }));
  });

  /** Um exemplo em palavras do que o critério exige agora. */
  protected readonly resumoDaEtapa = computed(() => {
    const { etapa } = this.servico.configuracao();
    return this.i18n.t('config.resumoEtapa', {
      acertos: etapa.acertosNaJanela,
      respostas: etapa.respostasNaJanela,
      exigentes: etapa.acertosExigentes,
      seguidos: etapa.acertosSeguidosFinais,
    });
  });

  protected readonly resumoDaProva = computed(() => {
    const { prova } = this.servico.configuracao();
    return this.i18n.t('config.resumoProva', {
      percentual: prova.percentualDeAcerto,
      porTopico: prova.questoesPorTopico,
      minimo: prova.minimoDeQuestoes,
      tolerados: toleranciaDaProva(prova.minimoDeQuestoes, prova),
    });
  });

  /** Como a prova surpresa vai funcionar agora, em palavras. */
  protected readonly resumoDaSurpresa = computed(() => {
    const { surpresa } = this.servico.configuracao();
    return this.i18n.t('config.resumoSurpresa', {
      dias: surpresa.intervaloEmDias,
      questoes: this.provaSurpresa.tamanhoPrevisto(),
      quantos: this.provaSurpresa.quantosElegiveis(),
      percentual: surpresa.percentualDeAcerto,
    });
  });

  /** A prova surpresa está ligada? A tela mostra a caixa marcada. */
  protected readonly surpresaAtivaLigada = computed(() => this.servico.surpresa().ativa === 1);

  protected alternarSurpresa(): void {
    this.servico.definir(['surpresa', 'ativa'], this.surpresaAtivaLigada() ? 0 : 1);
  }

  /**
   * Encerra a prova surpresa aberta sem avaliar.
   *
   * É a saída de emergência: existe para que um gerador com problema não
   * prenda o aluno numa prova que ele não consegue terminar. Fica aqui, e não
   * na prova, justamente para não parecer um botão de fuga.
   */
  protected encerrarSurpresa(): void {
    this.provaSurpresa.encerrarSemAvaliar();
  }

  /** O currículo inteiro, marcando o que está dentro do plano. */
  protected readonly areas = computed<readonly AreaEscolhivel[]>(() => {
    const fora = this.servico.topicosRemovidos();

    return CURRICULO.map((area) => {
      const topicos = area.topicos
        .filter((topico) => topico.pronto)
        .map((topico) => ({
          id: topico.id,
          titulo: this.i18n.tituloDoTopico(topico.id),
          dentro: !fora.has(topico.id),
        }));

      return {
        id: area.id,
        titulo: this.i18n.tituloDaArea(area.id),
        topicos,
        dentro: topicos.filter((topico) => topico.dentro).length,
      };
    }).filter((area) => area.topicos.length > 0);
  });

  /** Quantos tópicos o plano tem agora, e quantos existem ao todo. */
  protected readonly noPlano = computed(() =>
    this.areas().reduce((total, area) => total + area.dentro, 0),
  );
  protected readonly aoTodo = computed(() =>
    this.areas().reduce((total, area) => total + area.topicos.length, 0),
  );

  protected readonly algumFora = computed(() => this.noPlano() < this.aoTodo());

  protected alternarTopico(topicoId: string): void {
    this.servico.alternarTopico(topicoId);
  }

  /** Tira a área inteira do plano, ou devolve-a inteira. */
  protected alternarArea(area: AreaEscolhivel): void {
    const tirarTodos = area.dentro > 0;
    for (const topico of area.topicos) {
      if (topico.dentro === tirarTodos) {
        this.servico.alternarTopico(topico.id);
      }
    }
  }

  protected incluirTodos(): void {
    this.servico.incluirTodos();
  }

  protected definir(ajuste: Ajuste, valor: string): void {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) {
      return;
    }
    this.servico.definir(ajuste, numero);
  }

  protected redefinir(): void {
    this.servico.redefinir();
  }

  private campo(ajuste: Ajuste, atual: Configuracao): Campo {
    const [grupo, chave] = ajuste;
    const limite = LIMITES.find((l) => l.ajuste[0] === grupo && l.ajuste[1] === chave)!;
    const valor = (atual[grupo] as unknown as Record<string, number>)[chave]!;
    const padrao = (CONFIGURACAO_PADRAO[grupo] as unknown as Record<string, number>)[chave]!;

    return {
      ajuste,
      // A chave leva o grupo: `questoesPorTopico` existe na prova e na
      // surpresa, com textos diferentes.
      chave: `config.${grupo}.${chave}`,
      valor,
      padrao,
      minimo: limite.minimo,
      maximo: limite.maximo,
      mudado: valor !== padrao,
    };
  }
}
