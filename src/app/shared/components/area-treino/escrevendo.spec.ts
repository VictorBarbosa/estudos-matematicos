import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { PROBLEMA_EQUACAO1 } from '@features/algebra/equacao-primeiro-grau/equacao-primeiro-grau.problema';
import { GeradorExercicio, Nivel, Exercicio } from '@core/treino/models/treino.model';

/**
 * O aviso de que a LLM está escrevendo, visto na TELA.
 *
 * O pedido leva de 20 s a 4 min. Sem um aviso visível, a demora é
 * indistinguível de «não funciona» — foi exatamente o que aconteceu, e o
 * aviso que existia estava dentro do campo de resposta, pequeno demais.
 */
const exercicio: Exercicio<number> = {
  id: 'ex-escrevendo',
  nivel: 'medio' as Nivel,
  enunciado: 'Resolva a equação e informe o valor de x.',
  enunciadoTex: '3x + 7 = 22',
  gabarito: 5,
  resolucao: { resultado: 5, passos: [] },
  conceitos: [],
  armadilhas: [],
  dadosDoProblema: [3, 7, 22],
};

const comHistoria: GeradorExercicio<number> = {
  topicoId: 'equacao-primeiro-grau',
  formatoResposta: 'inteiro',
  problemaDeTexto: PROBLEMA_EQUACAO1,
  gerar: () => exercicio,
  analisar: (texto: string) => {
    const numero = Number(texto.trim());
    return Number.isFinite(numero) ? numero : null;
  },
  saoEquivalentes: (a: number, b: number) => a === b,
  formatar: (valor: number) => String(valor),
};

/**
 * O caminho que eu havia deixado de fora.
 *
 * São 53 tópicos: os que NÃO declaram `problemaDeTexto` e entram por
 * `derivarProblema`, que extrai os números do enunciado existente e pede à LLM
 * uma reescrita. Para eles `problemaDeTexto` e `dadosDoProblema` são
 * indefinidos — e a minha primeira condição de espera exigia os dois, então a
 * espera nunca ligava e a troca de texto continuava acontecendo em quase todo
 * o site. Este é o enunciado real em que o defeito foi visto.
 */
const exercicioDeReescrita: Exercicio<number> = {
  id: 'ex-reescrita',
  nivel: 'facil' as Nivel,
  enunciado: 'Qual é a soma dos ângulos internos de um polígono de 27 lados? (em graus)',
  enunciadoTex: 'n = 27',
  gabarito: 4500,
  resolucao: { resultado: 4500, passos: [] },
  conceitos: [],
  armadilhas: [],
};

const semDeclaracao: GeradorExercicio<number> = {
  topicoId: 'angulos-e-triangulos',
  formatoResposta: 'um número',
  gerar: () => exercicioDeReescrita,
  analisar: (texto: string) => {
    const numero = Number(texto.trim());
    return Number.isFinite(numero) ? numero : null;
  },
  saoEquivalentes: (a: number, b: number) => a === b,
  formatar: (valor: number) => String(valor),
};

describe('o aviso de escrita na tela', () => {
  let fixture: ComponentFixture<AreaTreino>;
  let liberar: () => void;
  let fetchOriginal: typeof globalThis.fetch;

  beforeEach(async () => {
    localStorage.clear();

    let soltar!: () => void;
    const espera = new Promise<void>((r) => (soltar = r));
    liberar = soltar;

    fetchOriginal = globalThis.fetch;
    globalThis.fetch = (async () => {
      await espera;
      return new Response(JSON.stringify({ message: { content: '{"problemas":[]}' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as typeof globalThis.fetch;

    await TestBed.configureTestingModule({
      imports: [AreaTreino],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AreaTreino);
    fixture.componentRef.setInput('gerador', comHistoria);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    liberar();
    globalThis.fetch = fetchOriginal;
  });

  it('aparece enquanto o pedido está em curso, e some quando ele termina', async () => {
    await new Promise((r) => setTimeout(r, 30));
    fixture.detectChanges();

    const aviso = fixture.nativeElement.querySelector('.escrevendo') as HTMLElement | null;

    expect(aviso, 'o aviso não apareceu durante o pedido').not.toBeNull();
    expect(aviso!.textContent).toContain('três idiomas');
    // É um aviso de espera, não um erro: `status` e não `alert`.
    expect(aviso!.getAttribute('role')).toBe('status');

    liberar();
    await new Promise((r) => setTimeout(r, 60));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.escrevendo')).toBeNull();
  });

  /**
   * Espera OU pergunta, nunca as duas.
   *
   * O aviso ocupava o lugar ACIMA do enunciado e o exercício seguia
   * respondível ao lado — o que parecia certo (nada bloqueia) e na prática
   * confundia: a tela parecia pela metade, e quem lia não sabia se devia
   * responder a pergunta à vista ou aguardar outra. A regra passou a ser
   * exclusiva, e estes dois testes guardam o novo contrato.
   */
  it('durante a espera, o exercício não aparece', async () => {
    await new Promise((r) => setTimeout(r, 30));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.escrevendo')).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('.enunciado'),
      'o enunciado não pode dividir a tela com o aviso',
    ).toBeNull();
    expect(
      fixture.nativeElement.querySelector('input'),
      'nem o campo de resposta: responder o quê?',
    ).toBeNull();
  });

  /**
   * O instante do piscar.
   *
   * Quem dispara o pedido à LLM é um `effect`, que roda depois do primeiro
   * desenho — então havia um quadro em que o enunciado de sempre aparecia
   * antes de a espera ligar. Sem espera para esse vão, o original pisca na
   * tela, que é exatamente o que não se quer.
   */
  it('o enunciado original não pisca antes do pedido sair', () => {
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.enunciado'),
      'o original não pode aparecer nem por um quadro',
    ).toBeNull();
    expect(fixture.nativeElement.querySelector('.escrevendo')).not.toBeNull();
  });

  /**
   * Ninguém espera para sempre.
   *
   * O lote deste teste volta vazio — `{"problemas":[]}` —, que é o que
   * acontece quando a LLM falha ou quando o portão recusa tudo. O exercício
   * tem de APARECER, com o enunciado de sempre, em vez de deixar a tela
   * girando. E, tendo aparecido, ele não é mais vestido: sair da lista de
   * espera é o que impede a troca de texto na cara do aluno.
   */
  it('também espera no caminho da reescrita, sem declaração nenhuma', async () => {
    const outro = TestBed.createComponent(AreaTreino);
    outro.componentRef.setInput('gerador', semDeclaracao);
    outro.detectChanges();

    expect(
      outro.nativeElement.querySelector('.enunciado'),
      'o enunciado seco apareceu num tópico que vai receber reescrita',
    ).toBeNull();
    expect(outro.nativeElement.querySelector('.escrevendo')).not.toBeNull();

    outro.destroy();
  });

  it('lote vazio devolve o exercício em vez de girar para sempre', async () => {
    liberar();
    await new Promise((r) => setTimeout(r, 60));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.escrevendo'), 'o aviso ficou girando').toBeNull();

    const bloco = fixture.nativeElement.querySelector('.enunciado') as HTMLElement | null;

    expect(bloco, 'o exercício não voltou').not.toBeNull();
    expect(bloco!.textContent).toContain('Resolva a equação');
    expect(fixture.nativeElement.querySelector('input')).not.toBeNull();
  });

  it('o aviso explica a espera e diz que ela tem fim', async () => {
    await new Promise((r) => setTimeout(r, 30));
    fixture.detectChanges();

    const aviso = fixture.nativeElement.querySelector('.escrevendo') as HTMLElement;

    // Sem isto a demora é indistinguível de «não funciona» — foi o que
    // aconteceu —, e sem a promessa de fim o aluno não sabe se deve esperar.
    expect(aviso.textContent).toContain('seu computador');
    expect(aviso.textContent).toContain('aparece');
  });
});
