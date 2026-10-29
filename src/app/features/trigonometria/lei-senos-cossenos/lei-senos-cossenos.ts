import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { leiDosCossenosComPassos, paraRadianos } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorLeis } from '@features/trigonometria/lei-senos-cossenos/lei-senos-cossenos.gerador';
import { TEORIA_LEIS } from '@features/trigonometria/lei-senos-cossenos/lei-senos-cossenos.teoria';

const LARGURA = 360;
const ALTURA = 260;

@Component({
  selector: 'app-lei-senos-cossenos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AreaTreino,
    ConceitosTopico,
    ControleParametro,
    Formula,
    PassoAPasso,
    TopicoLayout,
  ],
  templateUrl: './lei-senos-cossenos.html',
  styleUrl: './lei-senos-cossenos.scss',
})
export class LeiSenosCossenos {
  protected readonly gerador = geradorLeis;
  protected readonly conceitos = TEORIA_LEIS.map((teoria) => teoria.id);

  protected readonly b = signal(5);
  protected readonly c = signal(7);
  protected readonly anguloA = signal(60);

  protected readonly LARGURA = LARGURA;
  protected readonly ALTURA = ALTURA;

  protected readonly analise = computed(() =>
    leiDosCossenosComPassos(this.b(), this.c(), this.anguloA()),
  );

  protected readonly ladoA = computed(() => this.analise().resultado);

  /** Quanto Pitágoras erraria se fosse aplicado sem o termo de correção. */
  protected readonly pitagorasIngenuo = computed(() =>
    Math.sqrt(this.b() ** 2 + this.c() ** 2),
  );

  protected readonly correcao = computed(
    () => -2 * this.b() * this.c() * Math.cos(paraRadianos(this.anguloA())),
  );

  protected readonly tipoDeAngulo = computed(() => {
    const angulo = this.anguloA();
    if (angulo < 90) return 'agudo';
    if (angulo === 90) return 'reto';
    return 'obtuso';
  });

  /** Os outros dois ângulos, obtidos pela lei dos senos. */
  protected readonly outrosAngulos = computed(() => {
    const a = this.ladoA();
    const razao = a / Math.sin(paraRadianos(this.anguloA()));

    const anguloB = Math.asin(Math.min(1, this.b() / razao)) * (180 / Math.PI);
    const anguloC = 180 - this.anguloA() - anguloB;

    return { b: anguloB, c: anguloC };
  });

  /**
   * Vértices do triângulo desenhado: o vértice A na origem, o lado c sobre a
   * horizontal e o lado b girado pelo ângulo A.
   */
  protected readonly vertices = computed(() => {
    const anguloRad = paraRadianos(this.anguloA());
    const b = this.b();
    const c = this.c();

    const bruto = {
      a: { x: 0, y: 0 },
      c: { x: c, y: 0 },
      b: { x: b * Math.cos(anguloRad), y: b * Math.sin(anguloRad) },
    };

    const minX = Math.min(bruto.a.x, bruto.b.x, bruto.c.x);
    const maxX = Math.max(bruto.a.x, bruto.b.x, bruto.c.x);
    const maxY = Math.max(bruto.a.y, bruto.b.y, bruto.c.y);

    const escala = Math.min((LARGURA - 60) / (maxX - minX || 1), (ALTURA - 60) / (maxY || 1));
    const paraTela = (p: { x: number; y: number }) => ({
      x: 30 + (p.x - minX) * escala,
      y: ALTURA - 30 - p.y * escala,
    });

    return { a: paraTela(bruto.a), b: paraTela(bruto.b), c: paraTela(bruto.c) };
  });

  protected readonly descricao = computed(
    () =>
      `Triângulo com lados ${this.b()} e ${this.c()} formando ângulo de ${this.anguloA()} ` +
      `graus; o terceiro lado mede ${this.formatar(this.ladoA())}.`,
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_LEIS);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }
}
