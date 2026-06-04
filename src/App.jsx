import React, { useState, useMemo } from 'react';

// Mocks
const militaresBase = [
  { id: 1, nome: 'Sgt Silva', equipe: 'A' },
  { id: 2, nome: 'Cb Oliveira', equipe: 'A' },
  { id: 3, nome: 'Sgt Santos', equipe: 'B' },
  { id: 4, nome: 'Cb Souza', equipe: 'B' },
  { id: 5, nome: 'Sgt Costa', equipe: 'C' },
  { id: 6, nome: 'Cb Pereira', equipe: 'C' },
  { id: 7, nome: 'Sgt Lima', equipe: 'D' },
  { id: 8, nome: 'Cb Carvalho', equipe: 'D' },
  { id: 9, nome: 'Sd Rocha', equipe: 'Reforço' },
  { id: 10, nome: 'Sd Mendes', equipe: 'Reforço' },
];

const padraoCiclo = [
  { diurno: 'A', noturno: 'B' },
  { diurno: 'C', noturno: 'A' },
  { diurno: 'D', noturno: 'C' },
  { diurno: 'B', noturno: 'D' },
];

function gerarDiasMes(mesReferencia, ano) {
  const dias = [];
  // Inicia dia 25 do mês anterior
  let dataAtual = new Date(ano, mesReferencia - 1 - 1, 25);
  // Termina dia 24 do mês de referência
  const dataFim = new Date(ano, mesReferencia - 1, 24);

  while (dataAtual <= dataFim) {
    dias.push(new Date(dataAtual));
    dataAtual.setDate(dataAtual.getDate() + 1);
  }
  return dias;
}

export default function App() {
  const [mes, setMes] = useState(new Date().getMonth() + 1); // 1 a 12
  const [ano, setAno] = useState(new Date().getFullYear());
  const [afastamentos, setAfastamentos] = useState([]); // { militarId, data, tipo }
  const [reforcos, setReforcos] = useState([]); // { militarId, data, turno }

  const diasDoMes = useMemo(() => gerarDiasMes(mes, ano), [mes, ano]);
  
  // A quantidade de dias no mês (entre 25 e 24) dita a carga horária exigida
  // 31 dias = 177h, 30 dias = 171h, 29 dias = 165h, 28 dias = 159h
  // A regra da PM é 5.7h por dia.
  const cargaHorariaBase = Math.round(diasDoMes.length * 5.7);

  // Geração da escala base
  const escala = useMemo(() => {
    return diasDoMes.map((data, index) => {
      // O ciclo se repete a cada 4 dias.
      // Para manter a consistência entre meses, ideal seria calcular a diferença em dias 
      // desde uma data base, mas para o protótipo usaremos o index.
      const turnoBase = padraoCiclo[index % 4];
      
      const diaStr = data.toISOString().split('T')[0];
      const afastamentosDoDia = afastamentos.filter(a => a.data === diaStr);
      const reforcosDoDia = reforcos.filter(r => r.data === diaStr);

      return {
        data,
        diaStr,
        diurno: turnoBase.diurno,
        noturno: turnoBase.noturno,
        afastamentos: afastamentosDoDia,
        reforcos: reforcosDoDia
      };
    });
  }, [diasDoMes, afastamentos, reforcos]);

  // Cálculo de horas
  const resumoHoras = useMemo(() => {
    const resumo = militaresBase.map(m => ({ 
      ...m, 
      horasTrabalhadas: 0, 
      horasAfastamento: 0,
      cargaExigida: cargaHorariaBase
    }));

    escala.forEach(dia => {
      // Para cada dia, verifica quem está de serviço
      resumo.forEach(m => {
        // Verifica afastamentos
        const isAfastado = dia.afastamentos.some(a => a.militarId === m.id);
        if (isAfastado) {
          m.horasAfastamento += 5.7; // Abate 5.7h da carga exigida
          m.cargaExigida -= 5.7;
          return; // Se está afastado, não trabalha
        }

        // Verifica escala base
        if (m.equipe === dia.diurno || m.equipe === dia.noturno) {
          m.horasTrabalhadas += 12;
        }

        // Verifica reforços
        const isReforco = dia.reforcos.some(r => r.militarId === m.id);
        if (isReforco) {
          m.horasTrabalhadas += 12;
        }
      });
    });

    // Calcula saldo e GSE
    resumo.forEach(m => {
      m.saldo = m.horasTrabalhadas - m.cargaExigida;
      m.gse = m.saldo > 0 ? m.saldo : 0;
      m.deficit = m.saldo < 0 ? Math.abs(m.saldo) : 0;
    });

    return resumo;
  }, [escala, cargaHorariaBase]);

  // Funções de interação (simplificadas para o protótipo)
  const adicionarAfastamento = (militarId, data, tipo) => {
    setAfastamentos([...afastamentos, { militarId, data, tipo }]);
  };

  const adicionarReforco = (militarId, data, turno) => {
    setReforcos([...reforcos, { militarId, data, turno }]);
  };

  return (
    <div className="container">
      <div className="header flex-between">
        <div>
          <h1>Sistema de Escalas</h1>
          <p>Mês de Apuração: 25/{mes-1 === 0 ? 12 : mes-1} a 24/{mes}</p>
        </div>
        <div className="flex-between" style={{gap: '1rem'}}>
          <button className="btn btn-outline" onClick={() => setMes(m => m === 1 ? 12 : m - 1)}>Mês Anterior</button>
          <button className="btn btn-outline" onClick={() => setMes(m => m === 12 ? 1 : m + 1)}>Próximo Mês</button>
        </div>
      </div>

      <div className="grid-2">
        {/* Painel da Escala */}
        <div className="card">
          <div className="flex-between" style={{marginBottom: '1rem'}}>
            <h2>Escala Mensal</h2>
            <span className="badge" style={{background: '#e4e4e7'}}>Dias: {diasDoMes.length}</span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Diurno (07-19)</th>
                  <th>Noturno (19-07)</th>
                  <th>Reforços/Afastamentos</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {escala.map((dia, i) => (
                  <tr key={i}>
                    <td>{dia.data.toLocaleDateString('pt-BR')}</td>
                    <td><span className="badge d">Eq. {dia.diurno}</span></td>
                    <td><span className="badge n">Eq. {dia.noturno}</span></td>
                    <td>
                      {dia.afastamentos.map(a => {
                        const m = militaresBase.find(x => x.id === a.militarId);
                        return <div key={a.militarId} className="badge f" style={{marginRight: 4}}>{m.nome} ({a.tipo})</div>;
                      })}
                      {dia.reforcos.map(r => {
                        const m = militaresBase.find(x => x.id === r.militarId);
                        return <div key={r.militarId} className="badge r" style={{marginRight: 4}}>{m.nome} (Reforço {r.turno})</div>;
                      })}
                    </td>
                    <td>
                      <button className="btn btn-outline" style={{padding: '0.25rem 0.5rem', fontSize: '0.75rem'}}
                        onClick={() => {
                          const m = prompt("Digite o ID do militar para Reforço (9 ou 10):");
                          if(m) adicionarReforco(parseInt(m), dia.diaStr, 'D');
                        }}
                      >
                        + Reforço
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Painel de Horas */}
        <div className="card">
          <h2>Resumo de Carga Horária</h2>
          <p style={{marginBottom: '1rem', color: 'var(--text-secondary)'}}>Carga base do mês: {cargaHorariaBase}h</p>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Militar</th>
                  <th>Eq.</th>
                  <th>Trabalhadas</th>
                  <th>Exigidas</th>
                  <th>GSE (Extra)</th>
                  <th>Déficit</th>
                </tr>
              </thead>
              <tbody>
                {resumoHoras.map(m => (
                  <tr key={m.id}>
                    <td>{m.nome}</td>
                    <td>{m.equipe}</td>
                    <td>{m.horasTrabalhadas}h</td>
                    <td>{m.cargaExigida.toFixed(1)}h</td>
                    <td>
                      {m.gse > 0 && <span className="badge" style={{background: m.gse > 40 ? 'var(--danger-color)' : 'var(--success-color)', color: 'white'}}>{m.gse.toFixed(1)}h</span>}
                    </td>
                    <td>
                      {m.deficit > 0 && <span className="badge" style={{background: 'var(--warning-color)', color: 'white'}}>{m.deficit.toFixed(1)}h</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
