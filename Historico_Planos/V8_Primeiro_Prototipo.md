# V8 - Primeiro Protótipo Funcional e Regras de Auxiliar

## Decisões Arquiteturais:
1. **Efetivo Real:** Salto para 70 militares fictícios abrangendo postos desde Soldado até 1º Sargento para permitir escalas fechadas sem furar.
2. **Turnos Quebrados:** Confirmação da premissa de 2 turnos de 6 horas por guarnição (07h as 13h e 13h as 19h), em contraponto às 12h diretas.
3. **Viatura do Auxiliar:** Criação do Auxiliar de Serviço (o mais antigo disponível) iniciando às 06h30, com o motorista (mais moderno disponível com CNH).
4. **Regras Antiprivilégio:** Algoritmo implementado para forçar "Motorista" sendo sempre o de menor antiguidade (maior número), impedindo favorecimentos.
5. **Setorização:** Definição tática de Viaturas Setor 1, Setor 2 e Setor 3.
