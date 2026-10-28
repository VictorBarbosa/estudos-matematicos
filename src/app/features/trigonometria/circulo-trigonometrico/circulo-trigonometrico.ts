import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ANGULOS_NOTAVEIS, paraRadianos, quadrante, sinaisNoQuadrante } from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { CirculoTrigonometrico as CirculoSvg } from '@shared/components/circulo-trigonometrico/circulo-trigonometrico';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { geradorCirculo } from './circulo-trigonometrico.gerador';
import { TEORIA_CIRCULO } from './circulo-trigonometrico.teoria';

@Component({
  selector: 'app-circulo-trigonometrico-topico',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AreaTreino,
    CirculoSvg,
    ConceitosTopico,
    ControleParametro,
    Formula,
    TopicoLayout,
  ],
  templateUrl: './circulo-trigonometrico.html',
  styleUrl: './circulo-trigonometrico.scss',
})
export class CirculoTrigonometricoTopico {
  protected readonly gerador = geradorCirculo;
  protected readonly conceitos = TEORIA_CIRCULO.map((teoria) => teoria.id);
  protected readonly notaveis = ANGULOS_NOTAVEIS;

  protected readonly angulo = signal(60);
  protected readonly mostrarTangente = signal(false);

  protected readonly radianos = computed(() => paraRadianos(this.angulo()));
  protected readonly quadranteAtual = computed(() => quadrante(this.angulo()));
  protected readonly sinais = computed(() => sinaisNoQuadrante(this.angulo()));

  protected readonly seno = computed(() => Math.sin(this.radianos()));
  protected readonly cosseno = computed(() => Math.cos(this.radianos()));

  /** Ângulo reduzido à primeira volta, que é o que determina os valores. */
  protected readonly anguloReduzido = computed(() => ((this.angulo() % 360) + 360) % 360);

  protected readonly radianosTex = computed(() => {
    // Mostra a forma com π quando o ângulo é múltiplo de 15°.
    const graus = this.anguloReduzido();
    if (graus % 15 !== 0) {
      return this.formatar(this.radianos());
    }

    const numerador = graus / 15;
    const denominador = 12;
    const divisor = mdcSimples(numerador, denominador);

    const n = numerador / divisor;
    const d = denominador / divisor;

    if (n === 0) return '0';
    if (d === 1) return n === 1 ? '\\pi' : `${n}\\pi`;
    return `\\frac{${n === 1 ? '' : n}\\pi}{${d}}`;
  });

  /** A identidade fundamental conferida numericamente. */
  protected readonly identidade = computed(
    () => this.seno() * this.seno() + this.cosseno() * this.cosseno(),
  );

  protected readonly descricaoSinais = computed(() => {
    const { seno, cosseno } = this.sinais();
    const sinalTexto = (valor: number): string => (valor > 0 ? 'positivo' : valor < 0 ? 'negativo' : 'nulo');

    return (
      `No ${this.quadranteAtual()}º quadrante o cosseno é ${sinalTexto(cosseno)} ` +
      `(ponto à ${cosseno >= 0 ? 'direita' : 'esquerda'}) e o seno é ${sinalTexto(seno)} ` +
      `(ponto ${seno >= 0 ? 'acima' : 'abaixo'} do eixo).`
    );
  });

  constructor() {
    inject(TeoriaService).registrar(TEORIA_CIRCULO);
  }

  protected usarNotavel(graus: number): void {
    this.angulo.set(graus);
  }

  protected alternarTangente(): void {
    this.mostrarTangente.update((valor) => !valor);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }
}

function mdcSimples(a: number, b: number): number {
  return b === 0 ? Math.abs(a) || 1 : mdcSimples(b, a % b);
}
