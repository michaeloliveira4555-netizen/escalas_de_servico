export const setors = [
  'Policiamento Ostensivo Geral',
  'Patrulha Rural',
  'Patrulha Escolar',
  'Rocam',
  'Administrativo'
];

export const postos = ['1º SGT', '2º SGT', '3º SGT', 'CB', 'SD'];

export const habilitacoesDisp = [
  { id: 'cnh', nome: 'Motorista (CNH VTR)' },
  { id: 'cnh_moto', nome: 'Motorista (CNH Moto)' },
  { id: 'fuzil_556', nome: 'Arm. Longo (Fuzil 5.56)' },
  { id: 'fuzil_762', nome: 'Arm. Longo (Fuzil 7.62)' },
  { id: 'cal_12', nome: 'Arm. Longo (Espingarda Cal 12)' },
  { id: 'choque', nome: 'Operações de Choque' },
];

function gerarMilitares(quantidade) {
  const militares = [];
  let antiguidade = 1;
  
  const qtSgt1 = 2;
  const qtSgt2 = 5;
  const qtSgt3 = 10;
  const qtCb = 20;
  const qtSd = quantidade - (qtSgt1 + qtSgt2 + qtSgt3 + qtCb);

  const criar = (posto, qt) => {
    for (let i = 0; i < qt; i++) {
      const habs = [];
      if (Math.random() > 0.2) habs.push('cnh');
      if (Math.random() > 0.7) habs.push('cnh_moto');
      if (Math.random() > 0.6) habs.push('fuzil_556');
      if (Math.random() > 0.6) habs.push('cal_12');

      militares.push({
        id: antiguidade,
        nome: `${posto} Militar ${antiguidade}`, // Nome Rastreável
        posto: posto,
        antiguidade: antiguidade,
        setor: setors[Math.floor(Math.random() * 3)],
        habilitacoes: habs
      });
      antiguidade++;
    }
  };

  criar('1º SGT', qtSgt1);
  criar('2º SGT', qtSgt2);
  criar('3º SGT', qtSgt3);
  criar('CB', qtCb);
  criar('SD', qtSd);

  return militares;
}

export const militaresMock = gerarMilitares(70);

export const afastamentosMock = [
  { id: 1, militarId: 10, tipo: 'Férias', dataInicio: '2026-06-01', dataFim: '2026-06-30' },
  { id: 2, militarId: 45, tipo: 'EDT', dataInicio: '2026-06-05', dataFim: '2026-06-10' },
];
