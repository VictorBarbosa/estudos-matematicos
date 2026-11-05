import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  Ajuste,
  CONFIGURACAO_PADRAO,
  Configuracao,
  LIMITES,
} from '@core/configuracao/models/configuracao.model';
import { ConfiguracaoService } from '@core/configuracao/services/configuracao.service';
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

const ORDEM: readonly Ajuste[] = [
  ['etapa', 'respostasNaJanela'],
  ['etapa', 'acertosNaJanela'],
  ['etapa', 'acertosExigentes'],
  ['etapa', 'acertosSeguidosFinais'],
  ['etapa', 'acertosPorTipo'],
  ['escada', 'acertosParaSubir'],
  ['escada', 'errosParaDescer'],
  ['prova', 'errosTolerados'],
  ['prova', 'minimoDeQuestoes'],
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

  protected readonly intocada = this.servico.intocada;

  protected readonly blocos = computed<readonly Bloco[]>(() => {
    const atual = this.servico.configuracao();

    return (['etapa', 'escada', 'prova'] as const).map((id) => ({
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
      tolerados: prova.errosTolerados,
      zera: prova.errosTolerados + 1,
      minimo: prova.minimoDeQuestoes,
    });
  });

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
      chave: `config.${chave}`,
      valor,
      padrao,
      minimo: limite.minimo,
      maximo: limite.maximo,
      mudado: valor !== padrao,
    };
  }
}
