# V12 - Grade Contínua e Gestão Dinâmica (+24h)

## Decisões Arquiteturais:
1. **Grade 24 Horas:** Remoção da separação engessada de botões "Diurno/Noturno". A tela passa a exibir as 24h na mesma tabela, com 5 colunas (1º ao 4º turno).
2. **"Tá de 23" e "Tá de 41":** O algoritmo passa a dividir a equipe Diurna nos turnos 2 e 3, e a equipe Noturna no turno 4 (do dia X) e no turno 1 (do dia X+1).
3. **Regra dos 24h de Antecedência:** Implementada a trava inteligente que força o sistema a sempre exibir status e propor gerações de escalas baseadas no dia de "Amanhã" ou "D+2", impedindo apontamentos por falta de aviso prévio de serviço.
4. **Mapa de Indisponibilidade:** Criação do rodapé mesclado na Escala gerada, imprimindo as justificativas (LTS, Férias, Folga de Escala) para manter rastreabilidade total de quem não foi escalado.
