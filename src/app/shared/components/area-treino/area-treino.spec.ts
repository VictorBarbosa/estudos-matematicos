import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Fracao, resolverComPassos } from '@core/math';
import { RESPOSTAS_NA_JANELA, TRILHA } from '@core/progressao/progressao.model';
import { ProgressoService } from '@core/treino/progresso.service';
import { Exercicio, GeradorExercicio, Nivel } from '@core/treino/treino.model';
import { AreaTreino } from './area-treino';

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

  /** Localiza um dos botões de nível pelo rótulo. */
  function botaoDeNivel(rotulo: string): HTMLButtonElement {
    return [...fixture.nativeElement.querySelectorAll('.nivel')].find(
      (botao: HTMLButtonElement) => botao.textContent?.trim() === rotulo,
    ) as HTMLButtonElement;
  }

  it('marca como selecionado o nível em que se clica', async () => {
    const medio = botaoDeNivel('Médio');
    expect(medio.getAttribute('aria-pressed')).toBe('false');

    medio.click();
    await fixture.whenStable();

    expect(medio.getAttribute('aria-pressed')).toBe('true');
    expect(botaoDeNivel('Fácil').getAttribute('aria-pressed')).toBe('false');
    expect(medio.classList).toContain('ativo');
  });

  it('preserva o placar da rodada ao trocar de nível', async () => {
    await responder('5/12');
    expect(fixture.nativeElement.querySelector('.certo').textContent.trim()).toBe('1');

    botaoDeNivel('Difícil').click();
    await fixture.whenStable();

    // A sessão continua a mesma: só o exercício muda.
    expect(fixture.nativeElement.querySelector('.certo').textContent.trim()).toBe('1');
    expect(botaoDeNivel('Difícil').getAttribute('aria-pressed')).toBe('true');
  });

  it('troca de nível duas vezes seguidas sem voltar ao primeiro', async () => {
    botaoDeNivel('Médio').click();
    await fixture.whenStable();
    botaoDeNivel('Difícil').click();
    await fixture.whenStable();

    expect(botaoDeNivel('Difícil').getAttribute('aria-pressed')).toBe('true');
    expect(botaoDeNivel('Médio').getAttribute('aria-pressed')).toBe('false');
    expect(botaoDeNivel('Fácil').getAttribute('aria-pressed')).toBe('false');
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

    // Agora são 8 acertos nas últimas 10 tentativas, com 3 no Médio ou no
    // Difícil — e o gerador fixo responde igual em qualquer nível.
    const dificil = [...fixture.nativeElement.querySelectorAll('.nivel')].find(
      (b: HTMLButtonElement) => b.textContent?.trim() === 'Difícil',
    ) as HTMLButtonElement;
    dificil.click();
    await fixture.whenStable();

    for (let i = 0; i < RESPOSTAS_NA_JANELA; i++) {
      await responder('5/12');
      const proximo = [...fixture.nativeElement.querySelectorAll('button')].find(
        (b: HTMLButtonElement) => b.textContent?.trim() === 'Próximo exercício',
      ) as HTMLButtonElement;
      proximo.click();
      await fixture.whenStable();
    }

    expect(texto()).toContain('Etapa vencida!');
    expect(texto()).toContain(TRILHA[1]!.titulo);
  });

  it('oferece os três níveis de dificuldade', () => {
    const rotulos = [...fixture.nativeElement.querySelectorAll('.nivel')].map(
      (b: HTMLButtonElement) => b.textContent?.trim(),
    );

    expect(rotulos).toEqual(['Fácil', 'Médio', 'Difícil']);
  });
});
