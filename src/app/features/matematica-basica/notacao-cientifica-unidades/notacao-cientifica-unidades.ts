import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  PREFIXOS_SI,
  PrefixoSI,
  converterPrefixoComPassos,
  notacaoParaTex,
  paraNotacaoCientificaComPassos,
} from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorNotacao } from './notacao-cientifica-unidades.gerador';
import { TEORIA_NOTACAO } from './notacao-cientifica-unidades.teoria';

/** Comparações para dar escala ao expoente escolhido. */
const REFERENCIAS: readonly { readonly valor: number; readonly oque: string }[] = [
  { valor: 1e-15, oque: 'raio de um próton (m)' },
  { valor: 1e-10, oque: 'raio de um átomo (m)' },
  { valor: 1e-6, oque: 'uma bactéria (m)' },
  { valor: 1e-3, oque: 'um grão de areia (m)' },
  { valor: 1.8, oque: 'uma pessoa (m)' },
  { valor: 1e4, oque: 'altitude de voo de cruzeiro (m)' },
  { valor: 4e5, oque: 'altitude da Estação Espacial (m)' },
  { valor: 6.4e6, oque: 'raio da Terra (m)' },
  { valor: 3.8e8, oque: 'distância até a Lua (m)' },
  { valor: 1.5e11, oque: 'distância até o Sol (m)' },
];

@Component({
  selector: 'app-notacao-cientifica-unidades',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AreaTreino,
    ConceitosTopico,
    ControleParametro,
    Formula,
    PassoAPasso,
    TopicoLayout,
  ],
  templateUrl: './notacao-cientifica-unidades.html',
  styleUrl: './notacao-cientifica-unidades.scss',
})
export class NotacaoCientificaUnidades {
  protected readonly gerador = geradorNotacao;
  protected readonly conceitos = TEORIA_NOTACAO.map((teoria) => teoria.id);
  protected readonly prefixos = PREFIXOS_SI;

  protected readonly mantissa = signal(4.2);
  protected readonly expoente = signal(5);

  protected readonly de = signal<PrefixoSI>(PREFIXOS_SI.find((p) => p.simbolo === 'k')!);
  protected readonly para = signal<PrefixoSI>(PREFIXOS_SI.find((p) => p.simbolo === '')!);

  protected readonly valor = computed(() =>
    Number((this.mantissa() * 10 ** this.expoente()).toPrecision(12)),
  );

  protected readonly analise = computed(() => paraNotacaoCientificaComPassos(this.valor()));

  protected readonly notacaoTex = computed(
    () => `${this.porExtenso()} = ${notacaoParaTex(this.analise().resultado)}`,
  );

  /** O mesmo número escrito sem potência, para ver o tamanho que ele tem. */
  protected readonly porExtenso = computed(() => {
    const valor = this.valor();
    const casas = Math.max(0, -this.expoente() + 1);

    return valor.toLocaleString('pt-BR', {
      maximumFractionDigits: Math.min(20, casas + 1),
      useGrouping: true,
    });
  });

  protected readonly conversao = computed(() =>
    converterPrefixoComPassos(this.mantissa(), this.de(), this.para()),
  );

  protected readonly conversaoTex = computed(() => {
    const valor = String(this.mantissa()).replace('.', '{,}');
    const resultado = String(Number(this.conversao().resultado.toPrecision(12))).replace('.', '{,}');

    return (
      `${valor}\\,\\text{${this.de().simbolo}m} = ${resultado}\\,\\text{${this.para().simbolo}m}`
    );
  });

  /** A referência mais próxima do valor atual, em ordem de grandeza. */
  protected readonly referencia = computed(() => {
    const alvo = Math.abs(this.valor());
    if (alvo === 0) {
      return null;
    }

    return REFERENCIAS.reduce((melhor, candidato) =>
      Math.abs(Math.log10(candidato.valor / alvo)) < Math.abs(Math.log10(melhor.valor / alvo))
        ? candidato
        : melhor,
    );
  });

  protected readonly referencias = REFERENCIAS;

  constructor() {
    inject(TeoriaService).registrar(TEORIA_NOTACAO);
  }

  protected selecionarDe(prefixo: PrefixoSI): void {
    this.de.set(prefixo);
  }

  protected selecionarPara(prefixo: PrefixoSI): void {
    this.para.set(prefixo);
  }

  protected rotuloPrefixo(prefixo: PrefixoSI): string {
    return prefixo.simbolo === '' ? 'm' : `${prefixo.simbolo}m`;
  }

  protected formatarExpoente(valor: number): string {
    return `10^${valor}`;
  }
}
