# Organograma do Sistema de Escalas

Este diagrama mapeia o fluxo completo de dados e as responsabilidades dos usuários dentro do sistema. Ele mostra o caminho desde o cadastro base até a ponta final (os relatórios financeiros que ainda serão construídos).

```mermaid
flowchart TD
    %% Estilos dos nós
    classDef base fill:#f3f4f6,stroke:#374151,stroke-width:2px,color:#111827
    classDef sargenteante fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a8a
    classDef auxiliar fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#7f1d1d
    classDef relatorios fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    classDef banco fill:#f3e8ff,stroke:#7e22ce,stroke-width:2px,color:#581c87

    %% Raiz
    ROOT([Menu Principal]):::base

    %% Módulos Principais
    ROOT --> MOD1[Gestão de Efetivo]:::sargenteante
    ROOT --> MOD2[Escala Prevista]:::sargenteante
    ROOT --> MOD3[Mapa de Execução]:::auxiliar
    ROOT --> MOD4[Central de Relatórios]:::relatorios

    %% Sub-fluxo 1: Gestão de Efetivo (CRUD)
    subgraph "Módulo 1: Preparação Base (Sargenteante)"
        MOD1 --> CRUD(CRUD Cadastro Militar):::sargenteante
        CRUD --> |Salva| BD_MIL[(Banco de Militares)]:::banco
        MOD1 --> AFAST(Lançamento de Afastamentos Futuros):::sargenteante
        AFAST --> |Salva| BD_AFAST[(Banco de Afastamentos)]:::banco
    end

    %% Sub-fluxo 2: Geração da Escala
    subgraph "Módulo 2: O Planejamento (Sargenteante)"
        BD_MIL -.-> MOTOR
        BD_AFAST -.-> MOTOR
        MOD2 --> CFG(Ajuste de Data D+2):::sargenteante
        CFG --> MOTOR{Motor de Geração Algorítmica}:::sargenteante
        MOTOR --> ESPELHO[Pré-Visualização do Espelho]:::sargenteante
        ESPELHO --> |Publicação Oficial| ESC_OFICIAL[[Escala Oficial Imutável]]:::banco
    end

    %% Sub-fluxo 3: A Realidade Operacional
    subgraph "Módulo 3: O Plantão (Auxiliar de Serviço)"
        ESC_OFICIAL -.-> |Alimenta Base do Dia| MOD3
        MOD3 --> GRADE_AUX(Visualização da Grade do Dia):::auxiliar
        GRADE_AUX --> EVENTOS{Lançamento de Ocorrências}:::auxiliar
        EVENTOS --> |Falta / Atestado| LTS(Cálculo de LTS Integral/Parcial):::auxiliar
        EVENTOS --> |Furo na Viatura| REMANEJAR(Remanejamento de Guarnição):::auxiliar
        LTS --> FECHA_DIA
        REMANEJAR --> FECHA_DIA
        FECHA_DIA[[Mapa Executado do Dia Fechado]]:::banco
    end

    %% Sub-fluxo 4: Fechamento do Mês (Futuro)
    subgraph "Módulo 4: Apuração (Fim do Mês)"
        FECHA_DIA -.-> |Gera Estatísticas Reais| MOD4
        MOD4 --> R1(Mapa de Indisponibilidade):::relatorios
        MOD4 --> R2(Mapa de Carga Horária - 171h):::relatorios
        MOD4 --> R3(Mapa de Etapas Alimentação):::relatorios
        MOD4 --> R4(Listagem de GSE):::relatorios
    end
```

## Como ler este diagrama:
1. Os balões em **Azul** representam o trabalho prévio do Sargenteante (planejar o futuro e criar a escala imutável).
2. Os balões em **Vermelho** representam a correria do Auxiliar de Serviço (registrar o que de fato aconteceu no dia).
3. Os balões em **Roxo** são os depósitos de dados (o banco que vai ganhando robustez).
4. Os balões em **Amarelo/Laranja** são os frutos do trabalho: os relatórios consolidados que fecham o mês blindando o batalhão contra erros financeiros.
