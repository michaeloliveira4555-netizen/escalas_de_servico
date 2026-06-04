import React, { useState } from 'react';
import { habilitacoesDisp, setors, postos } from './data';

export default function GestaoEfetivo({ militares, setMilitares, afastamentos, setAfastamentos }) {
  const [filtro, setFiltro] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [militarEditando, setMilitarEditando] = useState(null);
  const [modalAfastamento, setModalAfastamento] = useState(null);

  const militaresFiltrados = militares.filter(m => 
    m.nome.toLowerCase().includes(filtro.toLowerCase()) || 
    m.posto.toLowerCase().includes(filtro.toLowerCase())
  );

  const handleSalvar = (e) => {
    e.preventDefault();
    if (militarEditando.id) {
      setMilitares(militares.map(m => m.id === militarEditando.id ? militarEditando : m));
    } else {
      const novoId = Math.max(...militares.map(m => m.id), 0) + 1;
      setMilitares([...militares, { ...militarEditando, id: novoId }]);
    }
    setModalAberto(false);
  };

  const handleExcluir = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este militar?')) {
      setMilitares(militares.filter(m => m.id !== id));
      setAfastamentos(afastamentos.filter(a => a.militarId !== id));
    }
  };

  const abrirModalNovo = () => {
    setMilitarEditando({
      nome: '', posto: 'SD', antiguidade: militares.length + 1, setor: 'Policiamento Ostensivo Geral', habilitacoes: []
    });
    setModalAberto(true);
  };

  const salvarAfastamento = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const novoAfastamento = {
      id: Date.now(),
      militarId: modalAfastamento,
      tipo: fd.get('tipo'),
      dataInicio: fd.get('dataInicio'),
      dataFim: fd.get('dataFim')
    };
    setAfastamentos([...afastamentos, novoAfastamento]);
    setModalAfastamento(null);
  };

  const removerAfastamento = (id) => {
    setAfastamentos(afastamentos.filter(a => a.id !== id));
  };

  // Como a escala é sempre fechada as 18h30, o status que importa é sempre D+2 (Hoje + 2 dias)
  const dObj = new Date();
  dObj.setDate(dObj.getDate() + 2);
  const dataReferencia = dObj.toISOString().split('T')[0];
  const dataFormatada = dataReferencia.split('-').reverse().join('/');

  return (
    <div>
      <div className="card">
        <div className="flex-between" style={{marginBottom: '1rem'}}>
          <h2>Gestão de Efetivo (Status para: {dataFormatada} - D+2)</h2>
          <div style={{display: 'flex', gap: '1rem'}}>
            <input 
              type="text" 
              placeholder="Buscar militar..." 
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              style={{padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', width: '250px'}}
            />
            <button className="btn btn-primary" onClick={abrirModalNovo}>+ Novo Militar</button>
          </div>
        </div>
        
        <div className="table-container" style={{maxHeight: '600px', overflowY: 'auto'}}>
          <table>
            <thead style={{position: 'sticky', top: 0, backgroundColor: '#fafafa', zIndex: 1}}>
              <tr>
                <th>Nº Antig.</th>
                <th>Posto / Nome</th>
                <th>Setor Base</th>
                <th>Status (+24h)</th>
                <th>Motivo / Ocorrência Vigente</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {militaresFiltrados.map(m => {
                // Afastamentos ativos "na data de referência (+24h)"
                const afastadoNaData = afastamentos.find(a => 
                  a.militarId === m.id && a.dataInicio <= dataReferencia && a.dataFim >= dataReferencia
                );
                const todosAfast = afastamentos.filter(a => a.militarId === m.id);

                return (
                  <tr key={m.id}>
                    <td>#{m.antiguidade}</td>
                    <td><strong>{m.nome}</strong></td>
                    <td><span className="badge d">{m.setor}</span></td>
                    <td>
                      {afastadoNaData ? (
                        <span className="badge" style={{background: 'var(--danger-color)', color: 'white'}}>Indisponível</span>
                      ) : (
                        <span className="badge" style={{background: 'var(--success-color)', color: 'white'}}>Disponível</span>
                      )}
                    </td>
                    <td>
                      {todosAfast.length > 0 ? (
                        todosAfast.map(a => (
                          <div key={a.id} style={{fontSize: '0.8rem', display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4}}>
                            <strong>{a.tipo}</strong> ({a.dataInicio.split('-').reverse().join('/')} até {a.dataFim.split('-').reverse().join('/')})
                            <button onClick={() => removerAfastamento(a.id)} style={{border:'none', background:'none', color:'red', cursor:'pointer', fontWeight:'bold'}}>X</button>
                          </div>
                        ))
                      ) : (
                        <span style={{color: 'var(--text-secondary)', fontSize: '0.8rem'}}>-</span>
                      )}
                      <button className="btn btn-outline" style={{padding: '0.2rem 0.5rem', fontSize: '0.7rem', marginTop: 4}} onClick={() => setModalAfastamento(m.id)}>
                        + Lançar Afastamento
                      </button>
                    </td>
                    <td>
                      <div style={{display: 'flex', gap: '0.5rem'}}>
                        <button className="btn btn-outline" style={{padding: '0.2rem 0.5rem'}} onClick={() => { setMilitarEditando(m); setModalAberto(true); }}>Editar / Ver Perfil</button>
                        <button className="btn btn-outline" style={{padding: '0.2rem 0.5rem', color: 'red'}} onClick={() => handleExcluir(m.id)}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE MILITAR */}
      {modalAberto && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10}}>
          <div className="card" style={{width: '600px', maxHeight: '90vh', overflowY: 'auto'}}>
            <h3>{militarEditando.id ? 'Editar Cadastro do Militar' : 'Novo Militar'}</h3>
            <form onSubmit={handleSalvar} style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem'}}>
              
              <div className="grid-2">
                <div>
                  <label>Posto/Graduação</label>
                  <select style={{width:'100%', padding:'0.5rem'}} value={militarEditando.posto} onChange={e => setMilitarEditando({...militarEditando, posto: e.target.value})}>
                    {postos.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label>Nome Completo (Militar X)</label>
                  <input required style={{width:'100%', padding:'0.5rem'}} type="text" value={militarEditando.nome} onChange={e => setMilitarEditando({...militarEditando, nome: e.target.value})} />
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <label>Nº Antiguidade (1 é o mais antigo)</label>
                  <input required style={{width:'100%', padding:'0.5rem'}} type="number" min="1" value={militarEditando.antiguidade} onChange={e => setMilitarEditando({...militarEditando, antiguidade: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label>Setor Base</label>
                  <select style={{width:'100%', padding:'0.5rem'}} value={militarEditando.setor} onChange={e => setMilitarEditando({...militarEditando, setor: e.target.value})}>
                    {setors.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{fontWeight: 'bold'}}>Habilitações (Ocultas na Grade)</label>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem', background: '#f4f4f5', padding: '1rem', borderRadius: '4px'}}>
                  {habilitacoesDisp.map(hab => (
                    <label key={hab.id} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <input 
                        type="checkbox" 
                        checked={militarEditando.habilitacoes.includes(hab.id)}
                        onChange={(e) => {
                          if(e.target.checked) {
                            setMilitarEditando({...militarEditando, habilitacoes: [...militarEditando.habilitacoes, hab.id]});
                          } else {
                            setMilitarEditando({...militarEditando, habilitacoes: militarEditando.habilitacoes.filter(h => h !== hab.id)});
                          }
                        }}
                      />
                      {hab.nome}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem'}}>
                <button type="button" className="btn btn-outline" onClick={() => setModalAberto(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Perfil</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE AFASTAMENTO */}
      {modalAfastamento && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10}}>
          <div className="card" style={{width: '400px'}}>
            <h3>Lançar Evento/Afastamento</h3>
            <p style={{marginBottom:'1rem'}}>Militar: <strong>{militares.find(m => m.id === modalAfastamento)?.nome}</strong></p>
            <form onSubmit={salvarAfastamento} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              
              <div>
                <label>Motivo da Indisponibilidade</label>
                <select name="tipo" style={{width:'100%', padding:'0.5rem'}}>
                  <option value="Férias">Férias</option>
                  <option value="EDT">EDT (Viagem)</option>
                  <option value="Luto">Luto</option>
                  <option value="Licença Médica">Licença Médica</option>
                  <option value="Folga Compensatória">Folga Compensatória</option>
                </select>
              </div>

              <div className="grid-2">
                <div>
                  <label>Data Início</label>
                  <input required name="dataInicio" style={{width:'100%', padding:'0.5rem'}} type="date" />
                </div>
                <div>
                  <label>Data Fim</label>
                  <input required name="dataFim" style={{width:'100%', padding:'0.5rem'}} type="date" />
                </div>
              </div>

              <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem'}}>
                <button type="button" className="btn btn-outline" onClick={() => setModalAfastamento(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Confirmar Status</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
