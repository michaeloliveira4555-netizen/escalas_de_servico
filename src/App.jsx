import React, { useState } from 'react';
import GestaoEfetivo from './GestaoEfetivo';
import PainelDiario from './PainelDiario';
import MapaExecucao from './MapaExecucao';
import { militaresMock, afastamentosMock } from './data';

export default function App() {
  const [telaAtiva, setTelaAtiva] = useState('diario'); // 'efetivo', 'diario' ou 'execucao'
  const [militares, setMilitares] = useState(militaresMock);
  const [afastamentos, setAfastamentos] = useState(afastamentosMock);
  
  // Escala Prevista (Gerada pelo Sargenteante - Imutável)
  const [escalas, setEscalas] = useState({});

  // Mapa de Execução (Modificada pelo Auxiliar no dia)
  // Estrutura: { '2026-06-06': { TurnoX: { viaturaY: { motorista: militarObj, patrulheiro: militarObj } } } }
  const [mapasReais, setMapasReais] = useState({});

  // Registro global de LTS / Horas
  const [horasContabilizadas, setHorasContabilizadas] = useState([]);

  return (
    <div className="container">
      <div className="header flex-between">
        <div>
          <h1>Sistema de Escalas Militares</h1>
          <p>Unidade Operacional (BPM)</p>
        </div>
        <div style={{display: 'flex', gap: '0.5rem'}}>
          <button 
            className={`btn ${telaAtiva === 'efetivo' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTelaAtiva('efetivo')}
          >
            Gestão de Efetivo
          </button>
          <button 
            className={`btn ${telaAtiva === 'diario' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTelaAtiva('diario')}
          >
            Escala Prevista
          </button>
          <button 
            className={`btn ${telaAtiva === 'execucao' ? 'btn-primary' : 'btn-outline'}`}
            style={{background: telaAtiva === 'execucao' ? '#b91c1c' : 'transparent', color: telaAtiva === 'execucao' ? 'white' : '#b91c1c', borderColor: '#b91c1c'}}
            onClick={() => setTelaAtiva('execucao')}
          >
            Mapa de Execução (Auxiliar)
          </button>
        </div>
      </div>

      {telaAtiva === 'efetivo' && (
        <GestaoEfetivo 
          militares={militares} 
          setMilitares={setMilitares}
          afastamentos={afastamentos}
          setAfastamentos={setAfastamentos}
        />
      )}

      {telaAtiva === 'diario' && (
        <PainelDiario 
          militares={militares}
          afastamentos={afastamentos}
          escalas={escalas}
          setEscalas={setEscalas}
          mapasReais={mapasReais}
          setMapasReais={setMapasReais}
        />
      )}

      {telaAtiva === 'execucao' && (
        <MapaExecucao 
          militares={militares}
          mapasReais={mapasReais}
          setMapasReais={setMapasReais}
          horasContabilizadas={horasContabilizadas}
          setHorasContabilizadas={setHorasContabilizadas}
        />
      )}
    </div>
  );
}
