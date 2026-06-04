# V16 - O Mapa de Execução e Regra de LTS (Atual)

## Decisões Arquiteturais:
1. **Imutabilidade da Escala:** A escala planejada com 24h de antecedência não pode ser alterada. O Sargenteante faz o plano e o entrega.
2. **Mapa de Execução:** Uma nova interface para o Auxiliar de Serviço registrar a "realidade". Lançamento de faltas, atrasos e atestados (LTS).
3. **Remanejamento Interno:** Sem convocação de substitutos externos para "tapar buracos" menores de LTS. As guarnições ativas no dia são realocadas pelo Auxiliar para cobrir setores críticos.
4. **Matemática do LTS:**
   - Todo afastamento (LTS, Luto, Férias) conta como 5,7h diárias para bater a meta de 171h.
   - LTS no turno Diurno (23): Zera o dia inteiro de trabalho (0 horas / 0 etapas) e atribui as 5,7h de atestado.
   - LTS no turno Noturno (41): O turno 4 (antes da meia-noite) fica salvo (6h + 1 etapa). O dia seguinte, onde houve o atestado de madrugada, recebe 5,7h de LTS.
5. **Apuração Financeira:** O sistema varrerá o Mapa de Execução no final do mês para somar as Etapas e a carga horária baseada nesses quebros matemáticos para apontar a GSE.
