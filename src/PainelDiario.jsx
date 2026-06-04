import React, { useState } from 'react';

export default function PainelDiario({ militares, afastamentos, escalas, setEscalas }) {
  // O sargenteante sempre posta a escala às 18h30. Para cumprir as 24h de antecedência no turno da manhã, a escala padrão é D+2.
  const dataPadraoObj = new Date();
  dataPadraoObj.setDate(dataPadraoObj.getDate() + 2);
  const [dataInicial, setDataInicial] = useState(dataPadraoObj.toISOString().split('T')[0]);
  const [quantidadeDias, setQuantidadeDias] = useState(1);
  const [diaAtivo, setDiaAtivo] = useState(dataInicial);

  const gerarEscalaLote = () => {
    let novasEscalas = { ...escalas };
    let ultimosServicos = {}; 

    let dataAtualStr = dataInicial;

    for (let d = 0; d < quantidadeDias; d++) {
      if (!novasEscalas[dataAtualStr]) novasEscalas[dataAtualStr] = {};
      
      // Rastreio dos não escalados para o mapa de indisponibilidade
      let indispDescanso = [];
      let indispAfastamento = [];

      const turnosParaGerar = ['Diurno', 'Noturno'];

      turnosParaGerar.forEach(turno => {
        const disponiveis = militares.filter(m => {
          if (m.setor === 'Administrativo') return false;
          
          const afastado = afastamentos.find(a => 
            a.militarId === m.id && 
            a.dataInicio <= dataAtualStr && 
            a.dataFim >= dataAtualStr
          );
          if (afastado) {
            // Só adiciona uma vez por dia (Diurno ou Noturno tanto faz)
            if (turno === 'Diurno' && !indispAfastamento.find(x => x.militar.id === m.id)) {
              indispAfastamento.push({ militar: m, motivo: afastado.tipo });
            }
            return false;
          }

          const ultimoSv = ultimosServicos[m.id];
          if (ultimoSv) {
             const dataUltimo = new Date(ultimoSv);
             const dataHoje = new Date(dataAtualStr);
             const diffDias = Math.floor((dataHoje - dataUltimo) / (1000 * 60 * 60 * 24));
             if (diffDias < 2) {
               if (turno === 'Diurno' && !indispDescanso.find(x => x.militar.id === m.id)) {
                 indispDescanso.push({ militar: m, motivo: 'Folga de Serviço Anterior' });
               }
               return false; 
             }
          }

          return true;
        });

        disponiveis.sort((a, b) => a.antiguidade - b.antiguidade);
        const pool = [...disponiveis];

        const alocarDupla = () => {
          if (pool.length < 2) return null;
          
          const patrulheiro = pool.shift(); 

          let motoristaIndex = -1;
          for (let i = pool.length - 1; i >= 0; i--) {
            if (pool[i].habilitacoes.includes('cnh')) {
              motoristaIndex = i;
              break;
            }
          }
          if (motoristaIndex === -1) motoristaIndex = pool.length - 1; 
          
          const motorista = pool.splice(motoristaIndex, 1)[0];

          ultimosServicos[patrulheiro.id] = dataAtualStr;
          ultimosServicos[motorista.id] = dataAtualStr;

          return { patrulheiro, motorista };
        };

        novasEscalas[dataAtualStr][turno] = {
          auxiliar: alocarDupla(),
          setor1: alocarDupla(),
          setor2: alocarDupla(),
          setor3: alocarDupla()
        };
      });

      // Salva os indisponíveis deste dia gerado no objeto de estado
      novasEscalas[dataAtualStr].indisponiveis = {
        afastamentos: indispAfastamento,
        descanso: indispDescanso
      };

      const dObj = new Date(dataAtualStr);
      dObj.setDate(dObj.getDate() + 1);
      dataAtualStr = dObj.toISOString().split('T')[0];
    }

    setEscalas(novasEscalas);
    
    // Inicializa o Mapa de Execução espelhando a escala prevista
    if (setMapasReais) {
      setMapasReais(prev => ({ ...prev, ...novasEscalas }));
    }

    setDiaAtivo(dataInicial); 
  };

  const diasGerados = Object.keys(escalas).sort();
  
  const dObj = new Date(diaAtivo);
  dObj.setDate(dObj.getDate() - 1);
  const diaAnterior = dObj.toISOString().split('T')[0];

  const eqDiurna = escalas[diaAtivo]?.['Diurno'];
  const eqNoturna = escalas[diaAtivo]?.['Noturno'];
  const eqNoturnaAnterior = escalas[diaAnterior]?.['Noturno']; 
  const indisponiveisDoDia = escalas[diaAtivo]?.indisponiveis;

  const renderViatura = (titulo, viaturaKey, isAuxiliar = false) => {
    const dOntemNoite = eqNoturnaAnterior?.[viaturaKey]; 
    const dHojeDia = eqDiurna?.[viaturaKey]; 
    const dHojeNoite = eqNoturna?.[viaturaKey]; 

    const Celula = ({ militar, turnoLabel, emptyLabel }) => {
      if (!militar) return <td style={{color: '#a1a1aa', fontSize: '0.8rem', textAlign: 'center'}}>{emptyLabel}</td>;
      return (
        <td style={{textAlign: 'center', fontSize: '0.9rem', padding: '0.5rem', borderLeft: '1px solid var(--border-color)'}}>
          <div><strong>{militar.nome}</strong></div>
          <div style={{fontSize: '0.7rem', color: 'var(--text-secondary)'}}>(está de {turnoLabel})</div>
        </td>
      );
    };

    return (
      <React.Fragment>
        <tr>
          <td colSpan="5" style={{backgroundColor: '#fef08a', fontWeight: 'bold', textAlign: 'center'}}>
            {titulo}
          </td>
        </tr>
        <tr style={{backgroundColor: '#f4f4f5', fontSize: '0.8rem', textAlign: 'center', fontWeight: 'bold'}}>
          <td style={{textAlign: 'left'}}>FUNÇÃO</td>
          <td style={{borderLeft: '1px solid var(--border-color)'}}>1º Turno<br/>(01:00 - 07:00)</td>
          <td style={{borderLeft: '1px solid var(--border-color)'}}>2º Turno<br/>(07:00 - 13:00)</td>
          <td style={{borderLeft: '1px solid var(--border-color)'}}>3º Turno<br/>(13:00 - 19:00)</td>
          <td style={{borderLeft: '1px solid var(--border-color)'}}>4º Turno<br/>(19:00 - 01:00)</td>
        </tr>
        <tr>
          <td style={{fontWeight: '600'}}>Motorista</td>
          <Celula militar={dOntemNoite?.motorista} turnoLabel="41" emptyLabel="-" />
          <Celula militar={dHojeDia?.motorista} turnoLabel="23" emptyLabel="-" />
          <Celula militar={dHojeDia?.motorista} turnoLabel="23" emptyLabel="-" />
          <Celula militar={dHojeNoite?.motorista} turnoLabel="41" emptyLabel="-" />
        </tr>
        <tr>
          <td style={{fontWeight: '600'}}>{isAuxiliar ? 'Auxiliar de Sv' : 'Patrulheiro'}</td>
          <Celula militar={dOntemNoite?.patrulheiro} turnoLabel="41" emptyLabel="-" />
          <Celula militar={dHojeDia?.patrulheiro} turnoLabel="23" emptyLabel="-" />
          <Celula militar={dHojeDia?.patrulheiro} turnoLabel="23" emptyLabel="-" />
          <Celula militar={dHojeNoite?.patrulheiro} turnoLabel="41" emptyLabel="-" />
        </tr>
      </React.Fragment>
    );
  };

  // Renderiza a linha contínua de indisponíveis
  const renderIndisponiveis = () => {
    if (!indisponiveisDoDia) return null;
    
    // Agrupa os afastamentos pelo motivo
    const agrupadoAfast = {};
    indisponiveisDoDia.afastamentos.forEach(item => {
      if (!agrupadoAfast[item.motivo]) agrupadoAfast[item.motivo] = [];
      agrupadoAfast[item.motivo].push(item.militar.nome);
    });

    // Pega as folgas de serviço
    const folgasTxt = indisponiveisDoDia.descanso.map(i => i.militar.nome).join(', ');

    return (
      <React.Fragment>
        <tr>
          <td colSpan="5" style={{backgroundColor: '#e4e4e7', fontWeight: 'bold', textAlign: 'center', marginTop: '1rem'}}>
            EFETIVO INDISPONÍVEL NESTA DATA
          </td>
        </tr>
        <tr>
          <td colSpan="5" style={{padding: '1rem', fontSize: '0.9rem', lineHeight: '1.6'}}>
            {Object.keys(agrupadoAfast).map(motivo => (
               <div key={motivo} style={{marginBottom: '0.5rem'}}>
                 <span className="badge f" style={{marginRight: '0.5rem'}}>{motivo.toUpperCase()}</span>
                 {agrupadoAfast[motivo].join(', ')}
               </div>
            ))}
            {folgasTxt && (
              <div style={{marginTop: '0.5rem'}}>
                 <span className="badge" style={{background:'#52525b', color:'white', marginRight: '0.5rem'}}>FOLGA DE SERVIÇO (DESCANSO)</span>
                 <span style={{color: '#52525b'}}>{folgasTxt}</span>
              </div>
            )}
            {Object.keys(agrupadoAfast).length === 0 && !folgasTxt && (
              <div style={{color: 'var(--text-secondary)'}}>Todo o efetivo operacional apto esteve à disposição.</div>
            )}
          </td>
        </tr>
      </React.Fragment>
    );
  };

  return (
    <div>
      <div className="card flex-between" style={{marginBottom: '1rem'}}>
        <div style={{display: 'flex', gap: '1rem', alignItems: 'flex-end'}}>
          <div>
            <label style={{fontWeight: 'bold', display:'block'}}>Data Inicial do Ciclo:</label>
            <input 
              type="date" 
              value={dataInicial} 
              onChange={(e) => setDataInicial(e.target.value)}
              style={{padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)'}}
            />
          </div>
          <div>
            <label style={{fontWeight: 'bold', display:'block'}}>Dias Corridos:</label>
            <input 
              type="number" 
              min="1" max="7" 
              value={quantidadeDias} 
              onChange={(e) => setQuantidadeDias(parseInt(e.target.value))}
              style={{padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', width:'100px'}}
            />
          </div>
          <button className="btn btn-primary" onClick={gerarEscalaLote} style={{height: '38px'}}>
            ⚡ Gerar Ciclo ({quantidadeDias} dias)
          </button>
        </div>
      </div>

      {diasGerados.length > 0 && (
        <div style={{marginBottom: '1rem', display: 'flex', gap: '0.5rem', overflowX: 'auto'}}>
          {diasGerados.map(dia => (
            <button 
              key={dia} 
              className={`btn ${dia === diaAtivo ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setDiaAtivo(dia)}
            >
              {dia.split('-').reverse().join('/')}
            </button>
          ))}
        </div>
      )}

      {eqDiurna ? (
        <div className="card" style={{padding: 0, overflow: 'hidden'}}>
          <div style={{padding: '1rem', backgroundColor: '#3f3f46', color: 'white', fontWeight: 'bold'}}>
            ESPELHO DE SERVIÇO - {diaAtivo.split('-').reverse().join('/')} (24 HORAS)
          </div>
          
          <div style={{padding: '0.5rem', background: '#fef3c7', color: '#92400e', fontSize: '0.85rem', textAlign: 'center'}}>
            Lógica do 1º Turno: Puxa automaticamente a equipe noturna que assumiu às 19h de ontem. Se o dia selecionado for o primeiro gerado e não houver histórico de ontem, ficará vazio.
          </div>

          <div className="table-container">
            <table style={{width: '100%', tableLayout: 'fixed'}}>
              <colgroup>
                <col style={{width: '16%'}} />
                <col style={{width: '21%'}} />
                <col style={{width: '21%'}} />
                <col style={{width: '21%'}} />
                <col style={{width: '21%'}} />
              </colgroup>
              <tbody>
                {/* BLOCO DO AUXILIAR */}
                {renderViatura('VTR AUX-01 (AUX SV EXT/ADJ)', 'auxiliar', true)}
                {/* SETORES */}
                {renderViatura('POLICIAMENTO OSTENSIVO GERAL - SETOR 1', 'setor1')}
                {renderViatura('POLICIAMENTO OSTENSIVO GERAL - SETOR 2', 'setor2')}
                {renderViatura('POLICIAMENTO OSTENSIVO GERAL - SETOR 3', 'setor3')}
                
                {/* MAPA DE INDISPONIBILIDADE (RODAPÉ) */}
                {renderIndisponiveis()}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card" style={{textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)'}}>
          <p>Nenhuma escala gerada para exibição.</p>
        </div>
      )}
    </div>
  );
}
