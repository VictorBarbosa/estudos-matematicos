import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Fracao, resolverComPassos } from '@core/math';
import {
  ACERTOS_PARA_SUBIR,
  ERROS_PARA_DESCER,
  RESPOSTAS_NA_JANELA,
  TRILHA,
} from '@core/progressao/models/progressao.model';
import { ProgressoService } from '@core/treino/services/progresso.service';
import { Exercicio, GeradorExercicio, Nivel } from '@core/treino/models/treino.model';
import { AreaTreino } from '@shared/components/area-treino/area-treino';

/**
 * Gerador determinístico: sempre 1/4 + 1/6, cujo resultado é 5/12.
 *
 * Usar um gerador fixo aqui testa a mecânica da área de treino — corrigir,
 * pontuar, diagnosticar, avançar — sem depender do sorteio real.
 */
const resolucao = resolverComPassos(Fracao.criar(1, 4), 'somar', Fracao.criar(1, 6));

const exercicioFixo: Exercicio<Fracao> = {
  id: 'teste-1',
  nivel: 'facil',
  enunciado: 'Calcule e escreva o resultado na forma mais simples.',
  enunciadoTex: '\\frac{1}{4} + \\frac{1}{6} = \\;?',
  gabarito: resolucao.resultado,
  resolucao,
  conceitos: ['fracoes.mmc'],
  armadilhas: [
    {
      resposta: Fracao.criar(2, 10),
      diagnostico: 'Você somou numeradores com numeradores e denominadores com denominadores.',
      passo: 3,
      conceito: 'fracoes.operacoes',
    },
  ],
};

const geradorFixo: GeradorExercicio<Fracao> = {
  topicoId: 'fracoes-teste',
  formatoResposta: 'ex.: 3/4',
  gerar: (_nivel: Nivel) => exercicioFixo,
  analisar: (entrada) => Fracao.analisar(entrada),
  saoEquivalentes: (a, b) => a.igualA(b),
  formatar: (valor) => valor.toString(),
};

describe('AreaTreino', () => {
  let fixture: ComponentFixture<AreaTreino>;

  /** Digita no campo de resposta e dispara o evento de input. */
  async function responder(texto: string): Promise<void> {
    const campo = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    campo.value = texto;
    campo.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    const botao = [...fixture.nativeElement.querySelectorAll('button')].find(
      (b: HTMLButtonElement) => b.textContent?.trim() === 'Verificar',
    ) as HTMLButtonElement;
    botao.click();
    await fixture.whenStable();
  }

  function texto(): string {
    return fixture.nativeElement.textContent as string;
  }

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [AreaTreino],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AreaTreino);
    fixture.componentRef.setInput('gerador', geradorFixo);
    await fixture.whenStable();
  });

  it('mostra o enunciado e o placar zerado', () => {
    expect(texto()).toContain('Calcule e escreva o resultado');
    expect(texto()).toContain('Acertos');
    expect(texto()).toContain('Sequência');
  });

  it('aceita a resposta correta', async () => {
    await responder('5/12');

    expect(texto()).toContain('Correto!');
    expect(texto()).toContain('Próximo exercício');
  });

  it('aceita uma forma equivalente da resposta', async () => {
    await responder('10/24');
    expect(texto()).toContain('Correto!');
  });

  it('diagnostica o erro previsto em vez de só mostrar o gabarito', async () => {
    await responder('2/10');

    expect(texto()).toContain('numeradores com numeradores');
    expect(texto()).toContain('Resposta correta:');
    // Ao errar, a resolução comentada aparece sozinha.
    expect(texto()).toContain('Como se resolve');
  });

  it('informa o gabarito quando o erro não é um dos previstos', async () => {
    await responder('7/9');

    expect(texto()).toContain('Resposta correta:');
    expect(texto()).not.toContain('numeradores com numeradores');
  });

  it('não conta como erro uma resposta que não dá para ler', async () => {
    await responder('qualquer coisa');

    expect(texto()).toContain('Não consegui ler essa resposta');
    // Segue aberto para nova tentativa.
    expect(texto()).toContain('Verificar');
  });

  it('avança para o próximo exercício e limpa a resposta', async () => {
    await responder('5/12');

    const proximo = [...fixture.nativeElement.querySelectorAll('button')].find(
      (b: HTMLButtonElement) => b.textContent?.trim() === 'Próximo exercício',
    ) as HTMLButtonElement;
    proximo.click();
    await fixture.whenStable();

    const campo = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(campo.value).toBe('');
    expect(texto()).toContain('Verificar');
    expect(texto()).not.toContain('Correto!');
  });

  /** O nível mostrado agora, que não se escolhe. */
  function nivelMostrado(): string {
    return fixture.nativeElement.querySelector('.nivel-atual').textContent.trim() as string;
  }

  /** Responde certo e passa ao próximo, quantas vezes for pedido. */
  async function acertar(vezes: number): Promise<void> {
    for (let i = 0; i < vezes; i++) {
      await responder('5/12');
      const proximo = [...fixture.nativeElement.querySelectorAll('button')].find(
        (botao: HTMLButtonElement) => botao.textContent?.trim() === 'Próximo exercício',
      ) as HTMLButtonElement;
      proximo.click();
      await fixture.whenStable();
    }
  }

  it('começa no fácil e não oferece escolha de nível', () => {
    expect(nivelMostrado()).toBe('Fácil');
    expect(fixture.nativeElement.querySelectorAll('.nivel').length).toBe(0);
  });

  it('sobe de nível depois de acertos seguidos', async () => {
    const naTrilha: GeradorExercicio<Fracao> = { ...geradorFixo, topicoId: TRILHA[0]!.topicoId };
    fixture.componentRef.setInput('gerador', naTrilha);
    await fixture.whenStable();

    await acertar(ACERTOS_PARA_SUBIR);
    expect(nivelMostrado()).toBe('Médio');

    await acertar(ACERTOS_PARA_SUBIR);
    expect(nivelMostrado()).toBe('Difícil');
  });

  it('desce de nível depois de erros seguidos', async () => {
    const naTrilha: GeradorExercicio<Fracao> = { ...geradorFixo, topicoId: TRILHA[0]!.topicoId };
    fixture.componentRef.setInput('gerador', naTrilha);
    await fixture.whenStable();

    await acertar(ACERTOS_PARA_SUBIR);
    expect(nivelMostrado()).toBe('Médio');

    for (let i = 0; i < ERROS_PARA_DESCER; i++) {
      await responder('1/2');
      const proximo = [...fixture.nativeElement.querySelectorAll('button')].find(
        (botao: HTMLButtonElement) => botao.textContent?.trim() === 'Próximo exercício',
      ) as HTMLButtonElement;
      proximo.click();
      await fixture.whenStable();
    }

    expect(nivelMostrado()).toBe('Fácil');
  });

  it('diz quanto falta para o próximo degrau', async () => {
    const naTrilha: GeradorExercicio<Fracao> = { ...geradorFixo, topicoId: TRILHA[0]!.topicoId };
    fixture.componentRef.setInput('gerador', naTrilha);
    await fixture.whenStable();

    expect(texto()).toContain(`${ACERTOS_PARA_SUBIR} acerto(s) seguido(s) para subir`);

    await acertar(1);
    expect(texto()).toContain(`${ACERTOS_PARA_SUBIR - 1} acerto(s) seguido(s) para subir`);
  });

  it('anuncia quanto falta para vencer a etapa', async () => {
    await responder('5/12');

    expect(texto()).toContain('acertos nas últimas');
  });

  it('revelar a resolução conta como desistência e tranca o campo', async () => {
    const naTrilha: GeradorExercicio<Fracao> = { ...geradorFixo, topicoId: TRILHA[0]!.topicoId };
    fixture.componentRef.setInput('gerador', naTrilha);
    await fixture.whenStable();

    const mostrar = [...fixture.nativeElement.querySelectorAll('button')].find(
      (b: HTMLButtonElement) => b.textContent?.trim() === 'Não sei, mostrar a resolução',
    ) as HTMLButtonElement;
    mostrar.click();
    await fixture.whenStable();

    // O último passo da resolução traz a resposta: sem travar o campo, dava
    // para copiá-la e ganhar o acerto.
    const campo = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(campo.disabled).toBe(true);
    expect(texto()).toContain('conta como não resolvido');
    expect(texto()).toContain('Como se resolve');

    const progresso = TestBed.inject(ProgressoService);
    expect(progresso.estatisticaDe(TRILHA[0]!.topicoId).erros).toBe(1);
    expect(progresso.historicoDe(TRILHA[0]!.topicoId).at(-1)?.desistiu).toBe(true);
  });

  it('celebra o desbloqueio e aponta a próxima etapa', async () => {
    // O gerador fixo precisa pertencer à trilha para que haja o que desbloquear.
    const naTrilha: GeradorExercicio<Fracao> = { ...geradorFixo, topicoId: TRILHA[0]!.topicoId };
    fixture.componentRef.setInput('gerador', naTrilha);
    await fixture.whenStable();

    // São 8 acertos nas últimas 10, com 3 no Médio ou no Difícil. Acertando
    // sempre, a escada leva até lá sozinha — o gerador fixo responde igual em
    // qualquer nível.
    await acertar(RESPOSTAS_NA_JANELA);

    expect(texto()).toContain('Etapa vencida!');
    expect(texto()).toContain(TRILHA[1]!.titulo);
  });
});
