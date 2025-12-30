import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, SelectChip, StatusBadge } from './UI';
import { Prenotazione, PrenotazioneStato, AdminFilters } from '../types';
import { PrenotazioneService } from '../services/supabaseService';
import { EmailService } from '../services/emailService';

const ADMIN_PASSWORD = '5jPY10^TA5G$%!';

export const AdminPanel: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [data, setData] = useState<Prenotazione[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<AdminFilters>({
    mese: 'Tutti',
    patente: 'Tutte',
    stato: 'Tutti'
  });

  useEffect(() => {
    const session = localStorage.getItem('admin_session');
    const expiry = localStorage.getItem('admin_session_expiry');
    if (session === 'true' && expiry && new Date().getTime() < parseInt(expiry)) {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_session', 'true');
      localStorage.setItem('admin_session_expiry', (new Date().getTime() + 24 * 60 * 60 * 1000).toString());
      fetchData();
    } else {
      alert('Password errata');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const { data: result, error } = await PrenotazioneService.getAll();
    if (error) console.error(error);
    else setData(result as Prenotazione[] || []);
    setLoading(false);
  };

  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  const handleStatusUpdate = async (id: string, newStatus: PrenotazioneStato, booking?: Prenotazione) => {
    // Se si conferma, invia prima l'email
    if (newStatus === PrenotazioneStato.CONFERMATO && booking?.email) {
      setSendingEmail(id);
      const emailResult = await EmailService.sendConfirmationEmail({
        to: booking.email,
        nome: booking.nome_cognome,
        tipo_patente: booking.tipo_patente,
        mese_preferito: booking.mese_preferito,
        periodo_mese: booking.periodo_mese
      });
      setSendingEmail(null);

      if (!emailResult.success) {
        const proceed = window.confirm(
          `Errore invio email: ${emailResult.error}\n\nVuoi confermare comunque senza inviare l'email?`
        );
        if (!proceed) return;
      }
    }

    await PrenotazioneService.updateStato(id, newStatus);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa prenotazione?')) {
      await PrenotazioneService.delete(id);
      fetchData();
    }
  };

  const exportCSV = () => {
    const headers = ['Data', 'Nome', 'Email', 'Patente', 'Mese', 'Periodo', 'Scadenza Teoria', 'Stato', 'Note'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => [
        new Date(row.created_at).toLocaleDateString(),
        `"${row.nome_cognome}"`,
        `"${row.email || ''}"`,
        row.tipo_patente,
        `"${row.mese_preferito}"`,
        `"${row.periodo_mese || ''}"`,
        `"${row.data_scadenza || ''}"`,
        row.stato,
        `"${row.note || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `prenotazioni_aba_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filters.mese !== 'Tutti' && item.mese_preferito !== filters.mese) return false;
      if (filters.patente !== 'Tutte' && item.tipo_patente !== filters.patente) return false;
      if (filters.stato !== 'Tutti' && item.stato !== filters.stato) return false;
      return true;
    });
  }, [data, filters]);

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: filteredData.length,
      today: data.filter(d => new Date(d.created_at).toDateString() === now.toDateString()).length,
      pending: data.filter(d => d.stato === 'nuovo').length
    };
  }, [data, filteredData]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center px-6 pt-20">
        {/* Logo */}
        <div className="w-16 h-16 bg-gradient-to-br from-[#0B0F19] to-[#374151] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-[#0B0F19] mb-6">Area Riservata</h1>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <input
              type="password"
              placeholder="Password"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-[#0B0F19] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B0F19]/20 transition-all"
            />
          </div>
          <Button type="submit" fullWidth>Accedi</Button>
        </form>

        {/* Back link */}
        <button
          onClick={onLogout}
          className="mt-6 text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Torna alla home
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center bg-white lg:bg-transparent p-4 lg:p-0 rounded-xl lg:rounded-none">
        <div>
          <h1 className="text-lg lg:text-2xl font-bold text-[#0B0F19]">Dashboard Prenotazioni</h1>
          <p className="text-xs lg:text-sm text-gray-400">{new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex gap-2 lg:gap-3">
          <button onClick={fetchData} className="hidden lg:flex px-4 py-2 text-sm font-medium bg-white rounded-lg shadow-sm text-[#0B0F19] hover:bg-gray-50 items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Aggiorna
          </button>
          <button onClick={exportCSV} className="px-3 lg:px-4 py-1.5 lg:py-2 text-sm font-medium bg-white rounded-lg shadow-sm text-[#0B0F19] hover:bg-gray-50">CSV</button>
          <button onClick={() => {
            localStorage.removeItem('admin_session');
            setIsAuthenticated(false);
            onLogout();
          }} className="px-3 lg:px-4 py-1.5 lg:py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Esci</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-4">
        <div className="bg-white p-3 lg:p-5 rounded-xl text-center lg:text-left shadow-sm">
          <span className="text-xl lg:text-3xl font-bold text-[#0B0F19]">{stats.total}</span>
          <span className="text-[10px] lg:text-sm text-gray-400 uppercase block">Totale Filtrati</span>
        </div>
        <div className="bg-white p-3 lg:p-5 rounded-xl text-center lg:text-left shadow-sm">
          <span className="text-xl lg:text-3xl font-bold text-[#0B0F19]">{stats.today}</span>
          <span className="text-[10px] lg:text-sm text-gray-400 uppercase block">Oggi</span>
        </div>
        <div className="bg-white p-3 lg:p-5 rounded-xl text-center lg:text-left shadow-sm">
          <span className="text-xl lg:text-3xl font-bold text-blue-500">{stats.pending}</span>
          <span className="text-[10px] lg:text-sm text-gray-400 uppercase block">Nuovi</span>
        </div>
        <div className="hidden lg:block bg-white p-5 rounded-xl text-left shadow-sm">
          <span className="text-3xl font-bold text-green-500">{data.filter(d => d.stato === 'confermato').length}</span>
          <span className="text-sm text-gray-400 uppercase block">Confermati</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5 lg:gap-2 bg-white lg:bg-transparent p-3 lg:p-0 rounded-xl lg:rounded-none">
        {['Tutti', 'nuovo', 'contattato', 'confermato'].map(s => (
          <button
            key={s}
            onClick={() => setFilters({...filters, stato: s})}
            className={`px-3 lg:px-4 py-1 lg:py-2 text-xs lg:text-sm rounded-full transition-all ${
              filters.stato === s
                ? 'bg-[#0B0F19] text-white shadow-md'
                : 'bg-white lg:bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patente</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mese Richiesto</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Scadenza</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Note</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stato</th>
              <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={9} className="text-center py-12 text-gray-400">Caricamento...</td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-12 text-gray-400">Nessuna prenotazione</td></tr>
            ) : filteredData.map(item => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                </td>
                <td className="py-4 px-6">
                  <span className="font-semibold text-[#0B0F19]">{item.nome_cognome}</span>
                </td>
                <td className="py-4 px-6 text-sm text-gray-500 max-w-[180px] truncate" title={item.email || ''}>
                  {item.email || '-'}
                </td>
                <td className="py-4 px-6">
                  <span className="px-2 py-1 bg-gray-100 rounded-md text-sm font-medium">{item.tipo_patente}</span>
                </td>
                <td className="py-4 px-6 text-sm text-gray-700">
                  {item.mese_preferito}
                  {item.periodo_mese && (
                    <span className="block text-xs text-red-500 font-medium">{item.periodo_mese}</span>
                  )}
                </td>
                <td className="py-4 px-6 text-sm text-gray-500">
                  {item.data_scadenza ? new Date(item.data_scadenza).toLocaleDateString('it-IT') : '-'}
                </td>
                <td className="py-4 px-6 text-sm text-gray-400 max-w-[200px] truncate">
                  {item.note || '-'}
                </td>
                <td className="py-4 px-6">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    item.stato === 'nuovo' ? 'bg-blue-100 text-blue-600' :
                    item.stato === 'contattato' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-600'
                  }`}>{item.stato}</span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Elimina"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                    {item.stato !== 'contattato' && (
                      <button
                        onClick={() => handleStatusUpdate(item.id, PrenotazioneStato.CONTATTATO)}
                        className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Contattato
                      </button>
                    )}
                    {item.stato !== 'confermato' && (
                      <button
                        onClick={() => handleStatusUpdate(item.id, PrenotazioneStato.CONFERMATO, item)}
                        disabled={sendingEmail === item.id}
                        className="px-3 py-1.5 text-xs bg-[#0B0F19] text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-wait"
                      >
                        {sendingEmail === item.id ? 'Invio email...' : 'Conferma'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <p className="text-center text-gray-400 py-8">Caricamento...</p>
        ) : filteredData.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-base font-bold text-[#0B0F19]">{item.nome_cognome}</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                item.stato === 'nuovo' ? 'bg-blue-100 text-blue-600' :
                item.stato === 'contattato' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-600'
              }`}>{item.stato}</span>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
              <span>{item.tipo_patente}</span>
              <span>{item.mese_preferito.split(' ')[0]}{item.periodo_mese && <span className="text-red-500 font-medium"> ({item.periodo_mese})</span>}</span>
              {item.data_scadenza && <span>Scad: {new Date(item.data_scadenza).toLocaleDateString('it-IT')}</span>}
            </div>

            {item.note && (
              <p className="text-xs text-gray-400 italic mb-3 bg-gray-50 p-2 rounded-lg">"{item.note}"</p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 text-red-400 hover:text-red-500"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
              {item.stato !== 'contattato' && (
                <button
                  onClick={() => handleStatusUpdate(item.id, PrenotazioneStato.CONTATTATO)}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg"
                >
                  Contattato
                </button>
              )}
              {item.stato !== 'confermato' && (
                <button
                  onClick={() => handleStatusUpdate(item.id, PrenotazioneStato.CONFERMATO, item)}
                  disabled={sendingEmail === item.id}
                  className="px-3 py-1 text-xs bg-[#0B0F19] text-white rounded-lg disabled:opacity-50"
                >
                  {sendingEmail === item.id ? 'Invio...' : 'Conferma'}
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredData.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">Nessuna prenotazione</p>
          </div>
        )}
      </div>
    </div>
  );
};
