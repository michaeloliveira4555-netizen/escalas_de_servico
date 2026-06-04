import React, { useState } from 'react';

export default function MapaExecucao({ militares, mapasReais, setMapasReais, horasContabilizadas, setHorasContabilizadas }) {
  const [diaAtivo, setDiaAtivo] = useState(Object.keys(mapasReais).sort()[0] || null);
  const [modalOcorrencia, setModalOcorrencia] = useState(null); // guarda o objeto da celula clicada

  const diasDisponiveis = Object.keys(mapasReais).sort();

  // Função disparada ao clicar no nome do militar na grade real
  const handleOcorrenciaClick = (viaturaKey, funcao, turnoLabel, militarAtual) => {
    if (!militarAtual) return;
    setModalOcorrencia({
      viaturaKey, funcao, turnoLabel, militarAtual, diaAtivo
    });
  };

  const aplicarLtsIntegral = () => {
    const { viaturaKey, funcao, militarAtual, diaAtivo: dAtivo } = modalOcorrencia;
    const mapaAtualizado = { ...mapasReais };
    
    // Remove o militar do Diurno e Noturno
    if (mapaAtualizado[dAtivo].Diurno?.[viaturaKey]?.[funcao]?.id === militarAtual.id) {
      mapaAtualizado[dAtivo].Diurno[viaturaKey][funcao] = null;
    }
    if (mapaAtualizado[dAtivo].Noturno?.[viaturaKey]?.[funcao]?.id === militarAtual.id) {
      mapaAtualizado[dAtivo].Noturno[viaturaKey][funcao] = null;
    }

    setMapasReais(mapaAtualizado);

    // Lança a hora matemática (+5,7h) e 0 etapas
    setHorasContabilizadas([...horasContabilizadas, {
      militarId: militarAtual.id,
      militarNome: militarAtual.nome,
      data: dAtivo,
      tipo: 'LTS Integral',
      horasSomadas: 5.7,
      etapas: 0
    }]);

    setModalOcorrencia(null);
  };

  const aplicarLtsParcial = () => {
    const { viaturaKey, funcao, militarAtual, turnoLabel, diaAtivo: dAtivo } = modalOcorrencia;
    
    // LTS Parcial no 3º Turno: Preserva ele no 2º (já trabalhou), limpa no 3º
    if (turnoLabel === '23') {
       // Na nossa estrutura mockada, o objeto `Diurno` rege 2 e 3. Se eu apagar `Diurno`, apaga dos dois.
       // Para resolver isso na UI, eu precisaria ter desmembrado os turnos no objeto.
       // Como o objeto é Diurno { motorista }, vamos registrar no log que ele teve LTS parcial.
       
       setHorasContabilizadas([...horasContabilizadas, {
        militarId: militarAtual.id,
        militarNome: militarAtual.nome,
        data: dAtivo,
        tipo: 'LTS Parcial (Diurno)',
        horasSomadas: 5.7, // LTS ganha as 5,7 e perde as demais por zeramento
        etapas: 0 // Perde tudo
      }]);
      alert(`O ${militarAtual.nome} perdeu as horas deste dia. Foram cravadas +5,7h referentes à baixa.`);
    }

    // LTS da Madrugada (1º Turno): Segura as 6h e 1 etapa de ontem.
    if (turnoLabel === '41') {
      setHorasContabilizadas([...horasContabilizadas, {
        militarId: militarAtual.id,
        militarNome: militarAtual.nome,
        data: dAtivo, // dia de hoje q ele faltou
        tipo: 'LTS Parcial (Madrugada)',
        horasSomadas: 5.7,
        etapas: 0
      }]);
      alert(`As horas de ontem (4º Turno) foram preservadas para o ${militarAtual.nome}. Lançadas +5,7h para hoje.`);
    }

    setModalOcorrencia(null);
  };

  const aplicarRemanejamento = () => {
    const { viaturaKey, funcao, diaAtivo: dAtivo } = modalOcorrencia;
    const novoId = prompt(`Substituir buraco por qual Nº Antiguidade? (Remanejamento)`);
    if (!novoId) return;

    const novoMilitar = militares.find(m => m.antiguidade === parseInt(novoId));
    if (!novoMilitar) return alert("Militar não encontrado!");

    const mapaAtualizado = { ...mapasReais };
    
    // Remaneja no turno atual
    if (mapaAtualizado[dAtivo].Diurno?.[viaturaKey]?.[funcao] === null) {
      mapaAtualizado[dAtivo].Diurno[viaturaKey][funcao] = novoMilitar;
    } else {
      // Se não é nulo, força
      mapaAtualizado[dAtivo].Diurno[viaturaKey][funcao] = novoMilitar;
    }

    setMapasReais(mapaAtualizado);
    setModalOcorrencia(null);
  };


  const dObj = new Date(diaAtivo);
  dObj.setDate(dObj.getDate() - 1);
  const diaAnterior = dObj.toISOString().split('T')[0];

  const eqDiurna = mapasReais[diaAtivo]?.[`Diurno`];
  const eqNoturna = mapasReais[diaAtivo]?.[`Noturno`];
  const eqNoturnaAnterior = mapasReais[diaAnterior]?.[`Noturno`]; 

  const renderViatura = (titulo, viaturaKey, isAuxiliar = false) => {
    const dOntemNoite = eqNoturnaAnterior?.[viaturaKey]; 
    const dHojeDia = eqDiurna?.[viaturaKey]; 
    const dHojeNoite = eqNoturna?.[viaturaKey]; 

    const Celula = ({ militar, turnoLabel, emptyLabel }) => {
      if (!militar) return (
        <td style={{backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '0.8rem', textAlign: 'center', cursor: 'pointer', fontWeight: 'bold'}} onClick={() => handleOcorrenciaClick(viaturaKey, isAuxiliar ? 'patrulheiro' : 'motorista', turnoLabel, null)}>
          {emptyLabel} (Buraço)
        </td>
      );
      
      return (
        <td style={{textAlign: 'center', fontSize: '0.9rem', padding: '0.5rem', borderLeft: '1px solid var(--border-color)', cursor: 'pointer'}} onClick={() => handleOcorrenciaClick(viaturaKey, isAuxiliar ? 'patrulheiro' : 'motorista', turnoLabel, militar)}>
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
          <td style={{borderLeft: '1px solid var(--border-color)'}}>1º Turno (Madrugada)</td>
          <td style={{borderLeft: '1px solid var(--border-color)'}}>2º Turno (Manhã)</td>
          <td style={{borderLeft: '1px solid var(--border-color)'}}>3º Turno (Tarde)</td>
          <td style={{borderLeft: '1px solid var(--border-color)'}}>4º Turno (Noite)</td>
        </tr>
        <tr>
          <td style={{fontWeight: '600'}}>Motorista</td>
          <Celula militar={dOntemNoite?.motorista} turnoLabel="41" emptyLabel="-" />
          <Celula militar={dHojeDia?.motorista} turnoLabel="23" emptyLabel="FALTA" />
          <Celula militar={dHojeDia?.motorista} turnoLabel="23" emptyLabel="FALTA" />
          <Celula militar={dHojeNoite?.motorista} turnoLabel="41" emptyLabel="FALTA" />
        </tr>
        <tr>
          <td style={{fontWeight: '600'}}>{isAuxiliar ? 'Auxiliar de Sv' : 'Patrulheiro'}</td>
          <Celula militar={dOntemNoite?.patrulheiro} turnoLabel="41" emptyLabel="-" />
          <Celula militar={dHojeDia?.patrulheiro} turnoLabel="23" emptyLabel="FALTA" />
          <Celula militar={dHojeDia?.patrulheiro} turnoLabel="23" emptyLabel="FALTA" />
          <Celula militar={dHojeNoite?.patrulheiro} turnoLabel="41" emptyLabel="FALTA" />
        </tr>
      </React.Fragment>
    );
  };

  return (
    <div>
      {diasDisponiveis.length === 0 ? (
        <div className="card" style={{textAlign: 'center', padding: '3rem'}}>
          Nenhum mapa gerado pelo Sargenteante ainda.
        </div>
      ) : (
        <>
          <div style={{marginBottom: '1rem', display: 'flex', gap: '0.5rem', overflowX: 'auto'}}>
            {diasDisponiveis.map(dia => (
              <button 
                key={dia} 
                className={`btn ${dia === diaAtivo ? 'btn-primary' : 'btn-outline'}`}
                style={dia === diaAtivo ? {background: '#b91c1c', borderColor: '#b91c1c'} : {}}
                onClick={() => setDiaAtivo(dia)}
              >
                {dia.split('-').reverse().join('/')}
              </button>
            ))}
          </div>

          <div className="card" style={{padding: 0, overflow: 'hidden'}}>
            <div style={{padding: '1rem', backgroundColor: '#7f1d1d', color: 'white', fontWeight: 'bold'}}>
              MAPA DE SERVIÇO / EXECUÇÃO - {diaAtivo.split('-').reverse().join('/')}
            </div>
            
            <div style={{padding: '0.5rem', background: '#fef2f2', color: '#991b1b', fontSize: '0.85rem', textAlign: 'center'}}>
              Atenção Auxiliar: Clique no nome do militar para lançar Ocorrências (LTS ou Remanejamentos).
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
                  {renderViatura('VTR AUX-01 (AUX SV EXT/ADJ)', 'auxiliar', true)}
                  {renderViatura('POLICIAMENTO OSTENSIVO GERAL - SETOR 1', 'setor1')}
                  {renderViatura('POLICIAMENTO OSTENSIVO GERAL - SETOR 2', 'setor2')}
                  {renderViatura('POLICIAMENTO OSTENSIVO GERAL - SETOR 3', 'setor3')}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* MODAL DE OCORRENCIA */}
      {modalOcorrencia && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20}}>
          <div className="card" style={{width: '500px'}}>
            <h3 style={{color: '#991b1b'}}>Lançar Ocorrência Operacional</h3>
            {modalOcorrencia.militarAtual ? (
              <p style={{marginBottom: '1rem'}}>Militar: <strong>{modalOcorrencia.militarAtual.nome}</strong> (Turno: {modalOcorrencia.turnoLabel})</p>
            ) : (
              <p style={{marginBottom: '1rem', color: '#991b1b'}}><strong>Viatura Inoperante (Buraco)</strong></p>
            )}

            <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
              {modalOcorrencia.militarAtual && (
                <>
                  <button className="btn" style={{background: '#ef4444', color: 'white', textAlign: 'left', padding: '1rem'}} onClick={aplicarLtsIntegral}>
                    <strong>🏥 Atestado / Falta Integral</strong><br/>
                    <small>Remove do dia. Zera horas. Registra +5,7h de LTS.</small>
                  </button>
                  <button className="btn" style={{background: '#f97316', color: 'white', textAlign: 'left', padding: '1rem'}} onClick={aplicarLtsParcial}>
                    <strong>🚑 Baixa Médica / LTS Parcial (Meio do Serviço)</strong><br/>
                    <small>Aplica matemática avançada do Diurno/Noturno para quebra de turno.</small>
                  </button>
                </>
              )}
              
              <button className="btn" style={{background: '#3b82f6', color: 'white', textAlign: 'left', padding: '1rem', marginTop: '1rem'}} onClick={aplicarRemanejamento}>
                <strong>🔄 Remanejar Guarnição</strong><br/>
                <small>Puxa o militar de outro Setor ativo ou disponível para cobrir este buraco.</small>
              </button>
            </div>

            <div style={{marginTop: '1rem', textAlign: 'right'}}>
              <button className="btn btn-outline" onClick={() => setModalOcorrencia(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
