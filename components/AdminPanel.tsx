import React, { useState, useEffect, useMemo } from 'react';
import { Button, StatusBadge, SectionHeader, IconButton } from './UI';
import { SegmentedControl } from './macos/SegmentedControl';
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
      pending: data.filter(d => d.stato === 'nuovo').length,
      confirmed: data.filter(d => d.stato === 'confermato').length
    };
  }, [data, filteredData]);

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center px-6 pt-20 lg:pt-32">
        <div className="w-16 h-16 bg-macos-accent rounded-2xl flex items-center justify-center mb-4 shadow-macos-md">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-macos-text mb-6">Area Riservata</h1>

        <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-macos-text-tertiary">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <input
              type="password"
              placeholder="Password"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-macos-bg border border-macos-border rounded-xl text-macos-text placeholder-macos-text-tertiary focus:outline-none focus:ring-2 focus:ring-macos-accent/30 focus:border-macos-accent transition-all"
            />
          </div>
          <Button type="submit" fullWidth size="lg">Accedi</Button>
        </form>

        <button
          onClick={onLogout}
          className="mt-6 text-sm text-macos-text-secondary hover:text-macos-text transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Torna alla home
        </button>
      </div>
    );
  }

  const statusOptions = [
    { value: 'Tutti', label: 'Tutti' },
    { value: 'nuovo', label: 'Nuovi' },
    { value: 'contattato', label: 'Contattati' },
    { value: 'confermato', label: 'Confermati' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-macos-text">Dashboard</h1>
          <p className="text-sm text-macos-text-secondary">
            {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={fetchData} size="sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden lg:inline">Aggiorna</span>
          </Button>
          <Button variant="secondary" onClick={exportCSV} size="sm">CSV</Button>
          <Button variant="ghost" onClick={() => {
            localStorage.removeItem('admin_session');
            setIsAuthenticated(false);
            onLogout();
          }} size="sm">Esci</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-macos-bg rounded-xl p-4 border border-macos-border">
          <span className="text-2xl lg:text-3xl font-bold text-macos-text">{stats.total}</span>
          <span className="text-xs text-macos-text-secondary uppercase block mt-1">Filtrati</span>
        </div>
        <div className="bg-macos-bg rounded-xl p-4 border border-macos-border">
          <span className="text-2xl lg:text-3xl font-bold text-macos-text">{stats.today}</span>
          <span className="text-xs text-macos-text-secondary uppercase block mt-1">Oggi</span>
        </div>
        <div className="bg-macos-bg rounded-xl p-4 border border-macos-border">
          <span className="text-2xl lg:text-3xl font-bold text-macos-accent">{stats.pending}</span>
          <span className="text-xs text-macos-text-secondary uppercase block mt-1">Nuovi</span>
        </div>
        <div className="bg-macos-bg rounded-xl p-4 border border-macos-border">
          <span className="text-2xl lg:text-3xl font-bold text-macos-success">{stats.confirmed}</span>
          <span className="text-xs text-macos-text-secondary uppercase block mt-1">Confermati</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-macos-text-secondary">Filtra:</span>
        <SegmentedControl
          options={statusOptions}
          value={filters.stato}
          onChange={(v) => setFilters({...filters, stato: v})}
          size="sm"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-macos-bg rounded-xl border border-macos-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-macos-bg-secondary border-b border-macos-border">
            <tr>
              <th className="text-left py-3 px-4 text-xs font-medium text-macos-text-secondary uppercase tracking-wider">Data</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-macos-text-secondary uppercase tracking-wider">Nome</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-macos-text-secondary uppercase tracking-wider">Email</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-macos-text-secondary uppercase tracking-wider">Patente</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-macos-text-secondary uppercase tracking-wider">Mese</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-macos-text-secondary uppercase tracking-wider">Scadenza</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-macos-text-secondary uppercase tracking-wider">Stato</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-macos-text-secondary uppercase tracking-wider">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-macos-divider">
            {loading ? (
              <tr><td colSpan={8} className="text-center py-12 text-macos-text-secondary">Caricamento...</td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-macos-text-secondary">Nessuna prenotazione</td></tr>
            ) : filteredData.map(item => (
              <tr key={item.id} className="hover:bg-macos-bg-secondary transition-colors">
                <td className="py-3 px-4 text-sm text-macos-text-secondary">
                  {new Date(item.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                </td>
                <td className="py-3 px-4">
                  <span className="font-medium text-macos-text">{item.nome_cognome}</span>
                  {item.note && (
                    <span className="block text-xs text-macos-text-tertiary truncate max-w-[150px]" title={item.note}>{item.note}</span>
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-macos-text-secondary max-w-[160px] truncate" title={item.email || ''}>
                  {item.email || '-'}
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-macos-bg-tertiary rounded-md text-xs font-medium text-macos-text">{item.tipo_patente}</span>
                </td>
                <td className="py-3 px-4 text-sm text-macos-text">
                  {item.mese_preferito.split(' ')[0]}
                  {item.periodo_mese && (
                    <span className="block text-xs text-macos-warning font-medium">{item.periodo_mese}</span>
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-macos-text-secondary">
                  {item.data_scadenza ? new Date(item.data_scadenza).toLocaleDateString('it-IT') : '-'}
                </td>
                <td className="py-3 px-4">
                  <StatusBadge status={item.stato} />
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-end gap-1">
                    <IconButton onClick={() => handleDelete(item.id)} variant="danger" title="Elimina">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </IconButton>
                    {item.stato !== 'contattato' && (
                      <Button variant="secondary" size="sm" onClick={() => handleStatusUpdate(item.id, PrenotazioneStato.CONTATTATO)}>
                        Contattato
                      </Button>
                    )}
                    {item.stato !== 'confermato' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(item.id, PrenotazioneStato.CONFERMATO, item)}
                        disabled={sendingEmail === item.id}
                      >
                        {sendingEmail === item.id ? 'Invio...' : 'Conferma'}
                      </Button>
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
          <p className="text-center text-macos-text-secondary py-8">Caricamento...</p>
        ) : filteredData.map(item => (
          <div key={item.id} className="bg-macos-bg rounded-xl p-4 border border-macos-border">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-macos-text">{item.nome_cognome}</h3>
              <StatusBadge status={item.stato} />
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-macos-text-secondary mb-3">
              <span className="px-2 py-0.5 bg-macos-bg-tertiary rounded">{item.tipo_patente}</span>
              <span>{item.mese_preferito.split(' ')[0]}</span>
              {item.periodo_mese && <span className="text-macos-warning">{item.periodo_mese}</span>}
              {item.data_scadenza && <span>Scad: {new Date(item.data_scadenza).toLocaleDateString('it-IT')}</span>}
            </div>

            {item.note && (
              <p className="text-xs text-macos-text-tertiary mb-3 bg-macos-bg-secondary p-2 rounded-lg">"{item.note}"</p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-macos-divider">
              <IconButton onClick={() => handleDelete(item.id)} variant="danger" title="Elimina">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </IconButton>
              {item.stato !== 'contattato' && (
                <Button variant="secondary" size="sm" onClick={() => handleStatusUpdate(item.id, PrenotazioneStato.CONTATTATO)}>
                  Contattato
                </Button>
              )}
              {item.stato !== 'confermato' && (
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate(item.id, PrenotazioneStato.CONFERMATO, item)}
                  disabled={sendingEmail === item.id}
                >
                  {sendingEmail === item.id ? 'Invio...' : 'Conferma'}
                </Button>
              )}
            </div>
          </div>
        ))}
        {filteredData.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-macos-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-macos-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-macos-text-secondary text-sm">Nessuna prenotazione</p>
          </div>
        )}
      </div>
    </div>
  );
};
