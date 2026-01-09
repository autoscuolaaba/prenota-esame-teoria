import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button, SectionHeader } from './UI';
import { SegmentedControl } from './macos/SegmentedControl';
import { PatenteType, PeriodoMese } from '../types';
import { PrenotazioneService } from '../services/supabaseService';
import { NotificationService } from '../services/notificationService';

export const BookingForm: React.FC = () => {
  const [months, setMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nome_cognome: '',
    email: '',
    note: '',
    tipo_patente: PatenteType.B,
    mese_preferito: '',
    periodo_mese: '' as PeriodoMese | '',
    data_scadenza: ''
  });

  const [activeModal, setActiveModal] = useState<'none' | 'patente' | 'mese'>('none');

  const mesiItaliani = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                        'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

  const capitalizeWords = (str: string): string => {
    return str.split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const getRecommendedMonth = (): string | null => {
    if (!formData.data_scadenza) return null;
    const scadenza = new Date(formData.data_scadenza);
    const meseConsigliato = new Date(scadenza);
    meseConsigliato.setMonth(meseConsigliato.getMonth() - 2);
    const meseNome = mesiItaliani[meseConsigliato.getMonth()];
    const anno = meseConsigliato.getFullYear();
    return `${meseNome} ${anno}`;
  };

  const getUrgentMonth = (): string | null => {
    if (!formData.data_scadenza) return null;
    const oggi = new Date();
    const scadenza = new Date(formData.data_scadenza);
    const diffMesi = (scadenza.getFullYear() - oggi.getFullYear()) * 12 + (scadenza.getMonth() - oggi.getMonth());
    if (diffMesi <= 2) {
      return months[0] || null;
    }
    return null;
  };

  useEffect(() => {
    const oggi = new Date();
    const availableMonths: string[] = [];
    for (let i = 1; i <= 6; i++) {
      const futureDate = new Date(oggi.getFullYear(), oggi.getMonth() + i, 1);
      const meseNome = mesiItaliani[futureDate.getMonth()];
      const anno = futureDate.getFullYear();
      availableMonths.push(`${meseNome} ${anno}`);
    }
    setMonths(availableMonths);
  }, []);

  const handleSubmit = async () => {
    if (!formData.nome_cognome) { alert('Inserisci il tuo Nome e Cognome'); return; }
    if (!formData.email) { alert('Inserisci la tua Email'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { alert('Inserisci un indirizzo email valido'); return; }
    if (!formData.data_scadenza) { alert('Inserisci la Data di Scadenza della Teoria'); return; }
    if (!formData.mese_preferito) { alert('Seleziona il Mese Richiesto'); return; }

    setLoading(true);
    const { error } = await PrenotazioneService.create({
      nome_cognome: formData.nome_cognome,
      tipo_patente: formData.tipo_patente,
      mese_preferito: formData.mese_preferito,
      periodo_mese: formData.periodo_mese || undefined,
      data_scadenza: formData.data_scadenza || undefined,
      note: formData.note || undefined,
      telefono: '',
      email: formData.email
    });
    setLoading(false);
    if (!error) {
      NotificationService.sendNewBookingNotification(formData);
      setSuccess(true);
    }
  };

  // Success Screen
  if (success) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-macos-bg flex items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center text-center max-w-md w-full">
          {/* Animated checkmark */}
          <div className="w-20 h-20 bg-macos-success/20 rounded-full flex items-center justify-center mb-6 animate-success-circle">
            <svg className="w-10 h-10 text-macos-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path className="animate-checkmark" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold mb-1 text-macos-text">Prenotato!</h2>
          <p className="text-macos-text-secondary text-sm mb-8">Grazie {formData.nome_cognome.split(' ')[0]}, ti contatteremo presto</p>

          {/* Summary */}
          <div className="w-full bg-macos-bg-secondary rounded-xl p-4 mb-6">
            <div className="flex justify-center gap-8 text-center">
              <div>
                <p className="text-[10px] text-macos-text-tertiary uppercase tracking-wider mb-1">Patente</p>
                <p className="text-lg font-bold text-macos-text">{formData.tipo_patente}</p>
              </div>
              <div className="w-px bg-macos-divider"></div>
              <div>
                <p className="text-[10px] text-macos-text-tertiary uppercase tracking-wider mb-1">Mese</p>
                <p className="text-lg font-bold text-macos-text">{formData.mese_preferito.split(' ')[0]}</p>
              </div>
              {formData.data_scadenza && (
                <>
                  <div className="w-px bg-macos-divider"></div>
                  <div>
                    <p className="text-[10px] text-macos-text-tertiary uppercase tracking-wider mb-1">Scadenza</p>
                    <p className="text-lg font-bold text-macos-text">{new Date(formData.data_scadenza).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Warning */}
          <div className="w-full bg-macos-warning/10 border border-macos-warning/30 rounded-xl p-4 mb-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-8 h-8 bg-macos-warning rounded-full flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-macos-warning font-medium">
                La prenotazione nel mese richiesto <strong>NON e garantita</strong>. Le date sono stabilite dalla Motorizzazione.
              </p>
            </div>
          </div>

          {/* Confirmation deadline */}
          <div className="w-full bg-macos-accent/10 border border-macos-accent/30 rounded-xl p-4 mb-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-8 h-8 bg-macos-accent rounded-full flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-macos-accent font-medium">
                Se entro il <strong>15-18 del mese scelto</strong> non ricevi conferma via email, prenota di nuovo per il mese successivo.
              </p>
            </div>
          </div>

          <Button onClick={() => setSuccess(false)} fullWidth size="lg">Nuova Prenotazione</Button>
        </div>
      </div>,
      document.body
    );
  }

  const recommendedMonth = getRecommendedMonth();
  const urgentMonth = getUrgentMonth();

  // Patente options for SegmentedControl
  const patenteOptions = Object.values(PatenteType).map(v => ({ value: v, label: v }));

  return (
    <>
      {/* ========== MOBILE LAYOUT ========== */}
      <div className="relative lg:hidden">
        <div className="bg-macos-bg rounded-t-[32px] shadow-macos-lg px-6 pt-8 pb-32 min-h-screen">
          {/* Logo */}
          <div className="text-center pt-4 mb-8">
            <div className="text-4xl font-black tracking-tighter text-macos-text leading-none" style={{ fontFamily: "'Arial Black', Arial, sans-serif" }}>
              ABA
            </div>
            <div className="text-sm font-light tracking-[0.2rem] text-macos-text-secondary -mt-0.5">
              AUTOSCUOLE
            </div>
            <h1 className="text-xl font-bold text-macos-text tracking-tight mt-4">
              Prenota il tuo Esame di Teoria
            </h1>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Nome */}
            <div className="bg-macos-bg-secondary rounded-xl p-4">
              <label className="block text-xs font-medium text-macos-text-secondary mb-1">Nome e Cognome *</label>
              <input
                type="text"
                value={formData.nome_cognome}
                onChange={(e) => setFormData({...formData, nome_cognome: capitalizeWords(e.target.value)})}
                placeholder="Mario Rossi"
                className="w-full bg-transparent text-lg font-medium text-macos-text placeholder-macos-text-tertiary outline-none"
              />
            </div>

            {/* Email */}
            <div className="bg-macos-bg-secondary rounded-xl p-4">
              <label className="block text-xs font-medium text-macos-text-secondary mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="mario.rossi@email.com"
                className="w-full bg-transparent text-lg font-medium text-macos-text placeholder-macos-text-tertiary outline-none"
              />
              <p className="text-xs text-macos-text-tertiary mt-1">Per ricevere la conferma della prenotazione</p>
            </div>

            {/* Data Scadenza */}
            <div className="bg-macos-bg-secondary rounded-xl p-4">
              <label className="block text-xs font-medium text-macos-text-secondary mb-1">Data Scadenza Teoria *</label>
              <input
                type="date"
                value={formData.data_scadenza}
                onChange={(e) => setFormData({...formData, data_scadenza: e.target.value})}
                className="w-full bg-transparent text-lg font-medium text-macos-text outline-none"
              />
            </div>

            {/* WhatsApp info - sempre visibile */}
            <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-xl p-4">
              <p className="text-base font-semibold text-macos-text mb-2">Non sai la data di scadenza?</p>
              <a
                href="https://api.whatsapp.com/send/?phone=390424523690&text=Ciao!%20Vorrei%20sapere%20la%20data%20di%20scadenza%20per%20poter%20prenotare%20l'esame%20di%20teoria%20sul%20sito!%20Grazie"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-4 py-2 rounded-full text-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                </svg>
                Chiedi su WhatsApp
              </a>
            </div>

            {/* Urgent warning */}
            {urgentMonth && (
              <div className="bg-macos-danger/10 border border-macos-danger/30 rounded-xl p-4">
                <p className="font-medium text-macos-danger text-sm mb-1">Attenzione: solo 1 tentativo!</p>
                <p className="text-macos-danger/80 text-xs">
                  La tua scadenza è molto vicina. Avrai solo 1 possibilità per passare l'esame.
                </p>
              </div>
            )}

            {/* Tipo Patente */}
            <div className="bg-macos-bg-secondary rounded-xl p-4">
              <label className="block text-xs font-medium text-macos-text-secondary mb-3">Tipo Patente</label>
              <SegmentedControl
                options={patenteOptions}
                value={formData.tipo_patente}
                onChange={(v) => setFormData({...formData, tipo_patente: v as PatenteType})}
                fullWidth
              />
              <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                <div className="text-[10px] text-macos-danger font-semibold">Ciclomotori<br/>max 50cc</div>
                <div className="text-[10px] text-macos-danger font-semibold">Moto<br/>max 125cc</div>
                <div className="text-[10px] text-macos-danger font-semibold">Auto</div>
              </div>
            </div>

            {/* Mese */}
            <div
              className="bg-macos-bg-secondary rounded-xl p-4 cursor-pointer"
              onClick={() => setActiveModal('mese')}
            >
              <label className="block text-xs font-medium text-macos-text-secondary mb-1">Mese Richiesto *</label>
              <div className="flex items-center justify-between">
                <span className={`text-lg font-medium ${formData.mese_preferito ? 'text-macos-text' : 'text-macos-text-tertiary'}`}>
                  {formData.mese_preferito || 'Seleziona...'}
                  {formData.periodo_mese && <span className="text-sm text-macos-text-secondary ml-2">({formData.periodo_mese})</span>}
                </span>
                <svg className="w-5 h-5 text-macos-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Note */}
            <div className="bg-macos-bg-secondary rounded-xl p-4">
              <label className="block text-xs font-medium text-macos-text-secondary mb-1">Note (opzionale)</label>
              <input
                type="text"
                value={formData.note}
                onChange={(e) => setFormData({...formData, note: e.target.value})}
                placeholder="Es. disponibile solo venerdì"
                className="w-full bg-transparent text-base font-medium text-macos-text placeholder-macos-text-tertiary outline-none"
              />
            </div>

            {/* Profile Box */}
            {formData.nome_cognome && (
              <div className="bg-macos-accent rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white font-bold uppercase">
                    {formData.nome_cognome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{formData.nome_cognome}</p>
                  <p className="text-sm text-white/70">Prenotazione da confermare</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 w-full bg-macos-bg p-6 pb-8 rounded-t-2xl shadow-macos-lg z-40 border-t border-macos-border max-w-[480px] left-1/2 -translate-x-1/2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-macos-text">Costo</span>
              <span className="block text-xs text-macos-text-secondary">Al momento della conferma</span>
            </div>
            <Button onClick={handleSubmit} disabled={loading} size="lg">
              {loading ? '...' : 'Prenota'}
            </Button>
          </div>
        </div>

        {/* Month Modal */}
        {activeModal === 'mese' && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={() => setActiveModal('none')}>
            <div className="bg-macos-bg w-full max-w-[480px] rounded-t-2xl p-6 shadow-macos-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-macos-text">Seleziona Mese</h3>
                <button onClick={() => setActiveModal('none')} className="text-macos-text-secondary">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {months.map((month) => {
                  const [monthName, yearStr] = month.split(' ');
                  const isSelected = formData.mese_preferito === month;
                  const monthNumber = mesiItaliani.indexOf(monthName) + 1;
                  const isRecommended = recommendedMonth === month && !urgentMonth;
                  const isUrgent = urgentMonth === month;

                  return (
                    <button
                      key={month}
                      onClick={() => setFormData({...formData, mese_preferito: month, periodo_mese: ''})}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-macos-accent bg-macos-accent text-white'
                          : isUrgent
                            ? 'border-macos-danger/50 bg-macos-danger/10'
                            : isRecommended
                              ? 'border-macos-success/50 bg-macos-success/10'
                              : 'border-macos-border bg-macos-bg-secondary'
                      }`}
                    >
                      <div className="text-left">
                        <div className={`text-2xl font-bold ${isSelected ? 'text-white' : 'text-macos-text'}`}>
                          {monthNumber.toString().padStart(2, '0')}
                        </div>
                        <div className={`text-sm ${isSelected ? 'text-white/80' : 'text-macos-text-secondary'}`}>
                          {monthName} {yearStr}
                        </div>
                      </div>
                      {isUrgent && (
                        <span className={`mt-2 inline-block text-xs font-medium px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-macos-danger/20 text-macos-danger'}`}>
                          Urgente
                        </span>
                      )}
                      {isRecommended && !isUrgent && (
                        <span className={`mt-2 inline-block text-xs font-medium px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-macos-success/20 text-macos-success'}`}>
                          Consigliato
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Period selection */}
              {formData.mese_preferito && (
                <div className="mt-6 rounded-xl p-5" style={{ backgroundColor: 'rgba(255, 149, 0, 0.15)', border: '2px solid rgba(255, 149, 0, 0.4)' }}>
                  <p className="text-base font-semibold text-macos-text mb-4 text-center">Quando preferisci nel mese?</p>
                  <SegmentedControl
                    options={Object.values(PeriodoMese).map(p => ({ value: p, label: p }))}
                    value={formData.periodo_mese}
                    onChange={(v) => { setFormData({...formData, periodo_mese: v as PeriodoMese}); setActiveModal('none'); }}
                    fullWidth
                    size="sm"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========== DESKTOP LAYOUT ========== */}
      <div className="hidden lg:block p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <SectionHeader>Informazioni Personali</SectionHeader>

            <div className="bg-macos-bg-secondary rounded-xl divide-y divide-macos-divider">
              <div className="p-4">
                <label className="block text-xs font-medium text-macos-text-secondary mb-1">Nome e Cognome *</label>
                <input
                  type="text"
                  value={formData.nome_cognome}
                  onChange={(e) => setFormData({...formData, nome_cognome: capitalizeWords(e.target.value)})}
                  placeholder="Mario Rossi"
                  className="w-full bg-transparent text-base font-medium text-macos-text placeholder-macos-text-tertiary outline-none"
                />
              </div>
              <div className="p-4">
                <label className="block text-xs font-medium text-macos-text-secondary mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="mario.rossi@email.com"
                  className="w-full bg-transparent text-base font-medium text-macos-text placeholder-macos-text-tertiary outline-none"
                />
              </div>
            </div>

            <SectionHeader>Dettagli Esame</SectionHeader>

            <div className="bg-macos-bg-secondary rounded-xl divide-y divide-macos-divider">
              <div className="p-4">
                <label className="block text-xs font-medium text-macos-text-secondary mb-1">Data Scadenza Teoria *</label>
                <input
                  type="date"
                  value={formData.data_scadenza}
                  onChange={(e) => setFormData({...formData, data_scadenza: e.target.value})}
                  className="w-full bg-transparent text-base font-medium text-macos-text outline-none"
                />
              </div>
              <div className="p-4">
                <label className="block text-xs font-medium text-macos-text-secondary mb-3">Tipo Patente</label>
                <SegmentedControl
                  options={patenteOptions}
                  value={formData.tipo_patente}
                  onChange={(v) => setFormData({...formData, tipo_patente: v as PatenteType})}
                />
                <div className="flex gap-4 mt-3">
                  <div className="text-[11px] text-macos-danger font-semibold"><span className="font-bold">AM</span> - Ciclomotori (max 50cc)</div>
                  <div className="text-[11px] text-macos-danger font-semibold"><span className="font-bold">A1</span> - Moto (max 125cc)</div>
                  <div className="text-[11px] text-macos-danger font-semibold"><span className="font-bold">B</span> - Auto</div>
                </div>
              </div>
              <div className="p-4">
                <label className="block text-xs font-medium text-macos-text-secondary mb-1">Note (opzionale)</label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  placeholder="Es. disponibile solo venerdì"
                  className="w-full bg-transparent text-base font-medium text-macos-text placeholder-macos-text-tertiary outline-none"
                />
              </div>
            </div>

            {/* WhatsApp info - sempre visibile */}
            <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-xl p-4">
              <p className="text-base font-semibold text-macos-text mb-2">Non sai la data di scadenza?</p>
              <a
                href="https://api.whatsapp.com/send/?phone=390424523690&text=Ciao!%20Vorrei%20sapere%20la%20data%20di%20scadenza%20per%20poter%20prenotare%20l'esame%20di%20teoria%20sul%20sito!%20Grazie"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-4 py-2 rounded-lg text-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                </svg>
                Chiedi su WhatsApp
              </a>
            </div>

            {/* Urgent warning */}
            {urgentMonth && (
              <div className="bg-macos-danger/10 border border-macos-danger/30 rounded-xl p-4">
                <p className="font-medium text-macos-danger text-sm">Attenzione: solo 1 tentativo!</p>
                <p className="text-macos-danger/80 text-xs mt-1">La tua scadenza è molto vicina.</p>
              </div>
            )}

            {/* Profile */}
            {formData.nome_cognome && (
              <div className="bg-macos-accent rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white font-bold uppercase">
                    {formData.nome_cognome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-white">{formData.nome_cognome}</p>
                  <p className="text-sm text-white/70">Prenotazione da confermare</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Month Selection */}
          <div className="space-y-6">
            <SectionHeader>Seleziona Mese *</SectionHeader>

            <div className="grid grid-cols-2 gap-3">
              {months.map((month) => {
                const [monthName, yearStr] = month.split(' ');
                const isSelected = formData.mese_preferito === month;
                const monthNumber = mesiItaliani.indexOf(monthName) + 1;
                const isRecommended = recommendedMonth === month && !urgentMonth;
                const isUrgent = urgentMonth === month;

                return (
                  <button
                    key={month}
                    onClick={() => setFormData({...formData, mese_preferito: month, periodo_mese: ''})}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-macos-accent bg-macos-accent text-white'
                        : isUrgent
                          ? 'border-macos-danger/50 bg-macos-danger/10 hover:border-macos-danger'
                          : isRecommended
                            ? 'border-macos-success/50 bg-macos-success/10 hover:border-macos-success'
                            : 'border-macos-border bg-macos-bg-secondary hover:border-macos-text-tertiary'
                    }`}
                  >
                    <div className={`text-2xl font-bold ${isSelected ? 'text-white' : 'text-macos-text'}`}>
                      {monthNumber.toString().padStart(2, '0')}
                    </div>
                    <div className={`text-sm ${isSelected ? 'text-white/80' : 'text-macos-text-secondary'}`}>
                      {monthName} {yearStr}
                    </div>
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    {isUrgent && (
                      <span className={`mt-2 inline-block text-xs font-medium px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-macos-danger/20 text-macos-danger'}`}>
                        Urgente
                      </span>
                    )}
                    {isRecommended && !isUrgent && (
                      <span className={`mt-2 inline-block text-xs font-medium px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-macos-success/20 text-macos-success'}`}>
                        Consigliato
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Period selection */}
            {formData.mese_preferito && (
              <div className="rounded-xl p-5" style={{ backgroundColor: 'rgba(255, 149, 0, 0.15)', border: '2px solid rgba(255, 149, 0, 0.4)' }}>
                <p className="text-base font-semibold text-macos-text mb-4">Quando preferisci nel mese?</p>
                <SegmentedControl
                  options={Object.values(PeriodoMese).map(p => ({ value: p, label: p }))}
                  value={formData.periodo_mese}
                  onChange={(v) => setFormData({...formData, periodo_mese: v as PeriodoMese})}
                  fullWidth
                />
              </div>
            )}

            {/* Warning */}
            <div className="bg-macos-warning/10 border border-macos-warning/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-macos-warning rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-macos-text-secondary">
                  La prenotazione nel mese richiesto <strong className="text-macos-warning">NON è garantita</strong>. Le date sono stabilite dalla Motorizzazione.
                </p>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-4 border-t border-macos-divider">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-macos-text">Costo esame</span>
                  <span className="block text-xs text-macos-text-secondary">Comunicato al momento della conferma</span>
                </div>
                <Button onClick={handleSubmit} disabled={loading} size="lg">
                  {loading ? 'Caricamento...' : 'Prenota Ora'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
