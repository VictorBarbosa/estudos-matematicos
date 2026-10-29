import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Fracao, dizimaParaFracaoComPassos, fracaoParaDecimalComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { MarcaPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorDecimais } from '@features/matematica-basica/numeros-decimais/numeros-decimais.gerador';
import { TEORIA_DECIMAIS } from '@features/matematica-basica/numeros-decimais/numeros-decimais.teoria';

@Component({
  selector: 'app-numeros-decimais',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AreaTreino,
    ConceitosTopico,
    ControleParametro,
    Formula,
    MathPlot,
    PassoAPasso,
    TopicoLayout,
  ],
  templateUrl: './numeros-decimais.html',
  styleUrl: './numeros-decimais.scss',
})
export class NumerosDecimais {
  protected readonly gerador = geradorDecimais;
  protected readonly conceitos = TEORIA_DECIMAIS.map((teoria) => teoria.id);

  protected readonly numerador = signal(1);
  protected readonly denominador = signal(7);

  protected readonly periodo = signal(3);

  protected readonly fracao = computed(() => Fracao.criar(this.numerador(), this.denominador()));

  protected readonly conversao = computed(() => fracaoParaDecimalComPassos(this.fracao()));
  protected readonly decimal = computed(() => this.conversao().resultado);

  protected readonly geratriz = computed(() =>
    dizimaParaFracaoComPassos(0, '', String(this.periodo())),
  );

  /**
   * Os primos do denominador irredutível, que decidem se o decimal termina.
   * Só 2 e 5 permitem decimal exato, porque são os primos que formam o dez.
   */
  protected readonly motivoDoPeriodo = computed(() => {
    const denominador = this.fracao().simplificar().denominador;
    let restante = denominador;

    while (restante % 2 === 0) {
      restante /= 2;
    }
    while (restante % 5 === 0) {
      restante /= 5;
    }

    return { denominador, outrosFatores: restante };
  });

  /** A fração e algumas aproximações decimais na reta, convergindo para ela. */
  protected readonly marcas = computed<readonly MarcaPlot[]>(() => {
    const valor = this.fracao().paraDecimal();

    const aproximacoes = [1, 2, 3].map((casas) => {
      const truncado = Math.floor(valor * 10 ** casas) / 10 ** casas;
      return {
        x: truncado,
        rotulo: truncado.toFixed(casas).replace('.', ','),
        cor: 'serie-2' as const,
      };
    });

    return [
      ...aproximacoes,
      { x: valor, rotulo: this.fracao().toString(), cor: 'acento' as const },
    ];
  });

  protected readonly dominioReta = computed(() => {
    const valor = this.fracao().paraDecimal();
    const folga = Math.max(0.05, Math.abs(valor) * 0.3);
    return { xMin: valor - folga, xMax: valor + folga };
  });

  protected readonly descricaoReta = computed(
    () =>
      `Reta numérica em torno de ${this.fracao()}, mostrando as aproximações com uma, duas e ` +
      'três casas decimais.',
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_DECIMAIS);
  }
}
