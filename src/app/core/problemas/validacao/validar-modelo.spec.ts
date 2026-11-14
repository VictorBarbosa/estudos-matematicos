import {
  assinaturaDoModelo,
  lacunasDe,
  validarModelo,
} from '@core/problemas/validacao/validar-modelo';

/** Uma história boa, para variar só o que cada teste quer testar. */
const BOM = {
  pt: 'Uma oficina cobra {0} reais por hora de serviço e mais {1} reais de taxa fixa. Quantas horas de serviço cabem em {2} reais?',
  fr: 'Un atelier facture {0} dollars par heure de service et {1} dollars de frais fixes. Combien d’heures de service tient-on dans {2} dollars ?',
  en: 'A workshop charges {0} dollars per hour of service plus a flat fee of {1} dollars. How many hours of service fit in {2} dollars?',
};

describe('validar modelo de problema', () => {
  it('aprova a história completa nas três línguas', () => {
    const veredito = validarModelo(BOM, 3);

    expect(veredito.ok).toBe(true);
    if (veredito.ok) {
      expect(veredito.modelo.lacunas).toBe(3);
    }
  });

  it('lê os índices das lacunas na ordem em que aparecem', () => {
    expect(lacunasDe('tem {1} e depois {0} e {2}')).toEqual([1, 0, 2]);
  });

  /**
   * A regra mais importante: nenhum dígito escrito pela LLM.
   *
   * Um número que não passou pelo sorteio é um número que o código não sabe
   * que existe — e pode ser a própria resposta, vazada no enunciado.
   */
  it('recusa dígito fora das lacunas', () => {
    const veredito = validarModelo({ ...BOM, pt: `${BOM.pt} Considere 2 funcionários.` }, 3);

    expect(veredito.ok).toBe(false);
    if (!veredito.ok) {
      expect(veredito.motivos).toContain('digito-solto');
    }
  });

  it('recusa número escrito por extenso', () => {
    const veredito = validarModelo(
      { ...BOM, en: BOM.en.replace('a flat fee', 'three flat fees') },
      3,
    );

    expect(veredito.ok).toBe(false);
    if (!veredito.ok) {
      expect(veredito.motivos).toContain('numero-escrito');
    }
  });

  /**
   * O caso que a comparação de modelos encontrou de verdade.
   *
   * O qwen traduziu «ao final do turno» por «à la fin de sa quinzaine» —
   * quinzena, não turno. O erro era de tradução, e a palavra carrega um
   * número: o portão o pega por aí.
   */
  it('recusa quantidade escondida em palavra francesa', () => {
    const veredito = validarModelo(
      { ...BOM, fr: BOM.fr.replace('par heure de service', 'par quinzaine de service') },
      3,
    );

    expect(veredito.ok).toBe(false);
    if (!veredito.ok) {
      expect(veredito.motivos).toContain('numero-escrito');
    }
  });

  it('recusa quantidade coletiva', () => {
    for (const [idioma, troca] of [
      ['pt', 'uma dúzia de horas'],
      ['en', 'a dozen hours'],
    ] as const) {
      const veredito = validarModelo({ ...BOM, [idioma]: `${BOM[idioma]} ${troca}?` }, 3);

      expect(veredito.ok, troca).toBe(false);
    }
  });

  /** «um» e «a» são artigo muito mais vezes do que número: folga consciente. */
  it('não confunde artigo com número', () => {
    expect(validarModelo(BOM, 3).ok).toBe(true);
  });

  it('recusa lacuna faltando', () => {
    const veredito = validarModelo({ ...BOM, fr: BOM.fr.replace('{2}', 'ce montant') }, 3);

    expect(veredito.ok).toBe(false);
    if (!veredito.ok) {
      expect(veredito.motivos).toContain('lacuna-faltando');
    }
  });

  it('recusa lacuna repetida', () => {
    const veredito = validarModelo({ ...BOM, pt: `${BOM.pt} Repetindo: {0}.` }, 3);

    expect(veredito.ok).toBe(false);
    if (!veredito.ok) {
      expect(veredito.motivos).toContain('lacuna-repetida');
    }
  });

  it('recusa lacuna que o gerador não vai preencher', () => {
    const veredito = validarModelo({ ...BOM, en: `${BOM.en} And {7}?` }, 3);

    expect(veredito.ok).toBe(false);
    if (!veredito.ok) {
      expect(veredito.motivos).toContain('lacuna-desconhecida');
    }
  });

  /**
   * A ordem das lacunas tem de ser igual nas três línguas.
   *
   * É a mesma exigência que `textos-traduzidos.spec.ts` faz dos enunciados
   * escritos à mão: trocar de idioma não pode trocar os números de lugar.
   */
  it('recusa ordem diferente entre os idiomas', () => {
    const veredito = validarModelo(
      {
        ...BOM,
        en: 'A workshop fits how many hours into {2} dollars, charging {0} per hour plus {1} fixed?',
      },
      3,
    );

    expect(veredito.ok).toBe(false);
    if (!veredito.ok) {
      expect(veredito.motivos).toContain('ordem-diferente');
    }
  });

  it('recusa texto sem pergunta', () => {
    const veredito = validarModelo({ ...BOM, pt: BOM.pt.replace('?', '.') }, 3);

    expect(veredito.ok).toBe(false);
    if (!veredito.ok) {
      expect(veredito.motivos).toContain('sem-pergunta');
    }
  });

  it('recusa LaTeX na prosa', () => {
    const veredito = validarModelo({ ...BOM, pt: `${BOM.pt} Use \\frac{a}{b}.` }, 3);

    expect(veredito.ok).toBe(false);
    if (!veredito.ok) {
      expect(veredito.motivos).toContain('latex');
    }
  });

  it('recusa a LLM falando com quem a chamou', () => {
    const veredito = validarModelo({ ...BOM, pt: `Problema: ${BOM.pt}` }, 3);

    expect(veredito.ok).toBe(false);
    if (!veredito.ok) {
      expect(veredito.motivos).toContain('metatexto');
    }
  });

  it('recusa markdown', () => {
    const veredito = validarModelo({ ...BOM, en: `- ${BOM.en}` }, 3);

    expect(veredito.ok).toBe(false);
    if (!veredito.ok) {
      expect(veredito.motivos).toContain('metatexto');
    }
  });

  /** Enunciado de celular: parágrafo não cabe, e frase de três palavras não ensina. */
  it('recusa o que é curto ou longo demais', () => {
    expect(validarModelo({ pt: 'E {0}?', fr: 'Et {0} ?', en: 'And {0}?' }, 1).ok).toBe(false);

    const longo = `${BOM.pt} ${'Um detalhe a mais sobre o contexto da situação. '.repeat(6)}`;
    const veredito = validarModelo({ ...BOM, pt: longo }, 3);

    expect(veredito.ok).toBe(false);
    if (!veredito.ok) {
      expect(veredito.motivos).toContain('longo');
    }
  });

  it('recusa idioma vazio', () => {
    const veredito = validarModelo({ ...BOM, fr: '   ' }, 3);

    expect(veredito.ok).toBe(false);
    if (!veredito.ok) {
      expect(veredito.motivos).toContain('texto-vazio');
    }
  });

  it('junta todos os motivos, em vez de parar no primeiro', () => {
    const veredito = validarModelo({ pt: 'Problema: 5 e {0}.', fr: '', en: '{9}' }, 1);

    expect(veredito.ok).toBe(false);
    if (!veredito.ok) {
      expect(veredito.motivos.length).toBeGreaterThan(2);
    }
  });
});

describe('assinatura, para pegar repetição', () => {
  it('a mesma história com outro número tem a mesma assinatura', () => {
    const outra = {
      ...BOM,
      pt: BOM.pt.replace('{0}', '{1}').replace('{2}', '{0}'),
    };

    expect(assinaturaDoModelo(outra)).toBe(assinaturaDoModelo(BOM));
  });

  it('histórias de contexto diferente têm assinaturas diferentes', () => {
    const outra = {
      ...BOM,
      pt: 'Um laboratório gasta {0} mililitros de reagente por amostra e {1} de preparo. Quantas amostras cabem em {2} mililitros?',
    };

    expect(assinaturaDoModelo(outra)).not.toBe(assinaturaDoModelo(BOM));
  });
});
