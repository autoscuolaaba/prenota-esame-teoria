import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card, Button, InputRow, SelectChip } from './UI';
import { PatenteType } from '../types';
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
    data_scadenza: ''
  });

  const [showInfoTooltip, setShowInfoTooltip] = useState(false);

  const [activeModal, setActiveModal] = useState<'none' | 'patente' | 'mese'>('none');

  const mesiItaliani = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                        'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

  // Funzione per calcolare il mese consigliato (2 mesi prima della scadenza)
  const getRecommendedMonth = (): string | null => {
    if (!formData.data_scadenza) return null;

    const scadenza = new Date(formData.data_scadenza);
    // Sottrai 2 mesi per avere 2 tentativi
    const meseConsigliato = new Date(scadenza);
    meseConsigliato.setMonth(meseConsigliato.getMonth() - 2);

    const meseNome = mesiItaliani[meseConsigliato.getMonth()];
    const anno = meseConsigliato.getFullYear();

    return `${meseNome} ${anno}`;
  };

  // Funzione per verificare se la scadenza è urgente (meno di 2 mesi)
  const getUrgentMonth = (): string | null => {
    if (!formData.data_scadenza) return null;

    const oggi = new Date();
    const scadenza = new Date(formData.data_scadenza);
    const diffMesi = (scadenza.getFullYear() - oggi.getFullYear()) * 12 + (scadenza.getMonth() - oggi.getMonth());

    // Se mancano meno di 2 mesi, è urgente
    if (diffMesi <= 2) {
      // Restituisci il primo mese disponibile (urgente)
      return months[0] || null;
    }
    return null;
  };

  useEffect(() => {
    // Genera i prossimi 6 mesi a partire da oggi
    const oggi = new Date();
    const availableMonths: string[] = [];

    for (let i = 1; i <= 6; i++) {
      const futureDate = new Date(oggi.getFullYear(), oggi.getMonth() + i, 1);
      const meseNome = mesiItaliani[futureDate.getMonth()];
      const anno = futureDate.getFullYear();
      availableMonths.push(`${meseNome} ${anno}`);
    }

    setMonths(availableMonths);
    // Non preseleziono nessun mese - l'utente deve scegliere
  }, []);

  const handleSubmit = async () => {
    if (!formData.nome_cognome) {
      alert('Inserisci il tuo Nome e Cognome');
      return;
    }
    if (!formData.email) {
      alert('Inserisci la tua Email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert('Inserisci un indirizzo email valido');
      return;
    }
    if (!formData.data_scadenza) {
      alert('Inserisci la Data di Scadenza della Teoria');
      return;
    }
    if (!formData.mese_preferito) {
      alert('Seleziona il Mese Richiesto');
      return;
    }
    setLoading(true);
    const { error } = await PrenotazioneService.create({
        nome_cognome: formData.nome_cognome,
        tipo_patente: formData.tipo_patente,
        mese_preferito: formData.mese_preferito,
        data_scadenza: formData.data_scadenza || undefined,
        note: formData.note || undefined,
        telefono: '',
        email: formData.email
    });
    setLoading(false);
    if (!error) {
      // Invia notifica push all'admin
      NotificationService.sendNewBookingNotification(formData);
      setSuccess(true);
    }
  };

  if (success) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
        <Card className="flex flex-col items-center justify-center text-center py-12 w-full max-w-[400px] mx-4 shadow-none">
        {/* Animated checkmark */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-success-circle">
           <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
             <path className="animate-checkmark" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
           </svg>
        </div>
        <h2 className="text-2xl font-bold mb-1 text-[#0B0F19]">Prenotato!</h2>
        <p className="text-gray-400 text-sm mb-8">Grazie {formData.nome_cognome.split(' ')[0]}, ti contatteremo presto</p>

        {/* Riepilogo minimal */}
        <div className="w-full mb-6">
          <div className="flex justify-center gap-8 text-center">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Patente</p>
              <p className="text-lg font-bold text-[#0B0F19]">{formData.tipo_patente}</p>
            </div>
            <div className="w-px bg-gray-200"></div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Mese</p>
              <p className="text-lg font-bold text-[#0B0F19]">{formData.mese_preferito.split(' ')[0]}</p>
            </div>
            {formData.data_scadenza && (
              <>
                <div className="w-px bg-gray-200"></div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Scadenza</p>
                  <p className="text-lg font-bold text-[#0B0F19]">{new Date(formData.data_scadenza).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Avviso importante - centrato */}
        <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="font-bold text-amber-800 text-sm mb-2">Attenzione</p>
            <p className="text-amber-700 text-xs leading-relaxed max-w-[280px]">
              La prenotazione nel mese richiesto <strong>NON e garantita</strong>, a meno che la scadenza non sia molto vicina. Le date degli esami sono stabilite dalla Motorizzazione.
            </p>
          </div>
        </div>

        <Button onClick={() => setSuccess(false)} fullWidth>Nuova Prenotazione</Button>
        </Card>
      </div>,
      document.body
    );
  }

  // Calcola mese consigliato e urgente per desktop
  const recommendedMonth = getRecommendedMonth();
  const urgentMonth = getUrgentMonth();

  return (
    <>
    {/* ========== MOBILE LAYOUT ========== */}
    <div className="relative lg:hidden">
        <Card className="relative z-10">
            {/* Logo ABA */}
            <div className="text-center pt-6 mb-10">
                <div className="text-5xl font-black tracking-tighter text-[#1a1a1a] leading-none" style={{ fontFamily: "'Arial Black', Arial, sans-serif" }}>
                    ABA
                </div>
                <div className="text-lg font-light tracking-[0.3rem] text-[#1a1a1a] -mt-1">
                    AUTOSCUOLE
                </div>
                <h1 className="text-[24px] leading-tight font-bold text-[#0B0F19] tracking-tight mt-4">
                    Prenota il tuo Esame di Teoria
                </h1>
            </div>

            {/* Form Fields */}
            <div className="relative z-10">

                <InputRow
                    icon={
                        <div className="relative">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#0B0F19] to-[#374151]"></div>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-7 h-3 bg-gradient-to-br from-[#0B0F19] to-[#374151] rounded-t-full"></div>
                        </div>
                    }
                    label="Nome e Cognome *"
                    value={formData.nome_cognome}
                    placeholder="Mario Rossi"
                    onChange={(e) => setFormData({...formData, nome_cognome: e.target.value})}
                />

                <InputRow
                    icon={
                        <div className="relative w-6 h-6">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F19] to-[#374151] rounded-lg"></div>
                            <svg className="relative w-6 h-6 text-white p-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                    }
                    label="Email *"
                    value={formData.email}
                    placeholder="mario.rossi@email.com"
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                />

                {/* Data Scadenza Teoria */}
                <div className="flex items-center gap-3 py-4">
                    <div className="w-10 h-10 flex items-center justify-center">
                        <div className="relative w-7 h-7">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F19] to-[#374151] rounded-lg"></div>
                            <div className="absolute top-0 left-1.5 w-1 h-2 bg-[#F3F4F6] rounded-b-full"></div>
                            <div className="absolute top-0 right-1.5 w-1 h-2 bg-[#F3F4F6] rounded-b-full"></div>
                            <div className="absolute bottom-1 left-1 right-1 top-3 bg-[#F3F4F6] rounded-sm flex items-center justify-center">
                                <svg className="w-3 h-3 text-[#0B0F19]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-400 font-medium">Data Scadenza Teoria *</label>
                            <button
                                type="button"
                                onClick={() => setShowInfoTooltip(!showInfoTooltip)}
                                className="w-6 h-6 rounded-full bg-[#25D366] text-white flex items-center justify-center text-xs font-bold hover:bg-[#20bd5a] transition-all shadow-md animate-pulse hover:animate-none hover:scale-110"
                            >
                                i
                            </button>
                        </div>
                        <input
                            type="date"
                            value={formData.data_scadenza}
                            onChange={(e) => setFormData({...formData, data_scadenza: e.target.value})}
                            className="w-full text-lg font-semibold text-[#0B0F19] bg-transparent border-none outline-none placeholder-gray-300"
                        />
                    </div>
                </div>
                {/* Info Tooltip */}
                {showInfoTooltip && (
                    <div className="bg-gradient-to-r from-[#25D366]/10 to-[#25D366]/5 rounded-2xl p-5 mb-4 border-2 border-[#25D366]/30 shadow-lg">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                            </div>
                            <div>
                                <p className="font-bold text-[#0B0F19] mb-1">Non sai la data di scadenza?</p>
                                <p className="text-sm text-gray-600 mb-3">
                                    Nessun problema! Scrivici e te la comunichiamo subito.
                                </p>
                                <a
                                    href="https://api.whatsapp.com/send/?phone=390424523690&text=Ciao!%20volevo%20sapere%20la%20data%20di%20scadenza%20per%20fare%20l'esame%20di%20teoria%20che%20mi%20devo%20prenotare!%20Grazie"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-4 py-2 rounded-full text-sm hover:bg-[#20bd5a] transition-all shadow-md"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    Chiedi su WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Separatore visivo */}
                <div className="h-4"></div>

                <InputRow
                    icon={
                        <div className="relative w-7 h-7">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F19] to-[#374151] rounded-md"></div>
                            <div className="absolute inset-[3px] bg-[#F3F4F6] rounded-sm flex items-center justify-center">
                                <span className={`font-black text-[#0B0F19] ${formData.tipo_patente === 'AM' ? 'text-[7px]' : 'text-[9px]'}`}>{formData.tipo_patente}</span>
                            </div>
                            <div className="absolute -top-1 left-1 w-1.5 h-2 bg-gradient-to-b from-[#0B0F19] to-[#374151] rounded-t-full"></div>
                            <div className="absolute -top-1 right-1 w-1.5 h-2 bg-gradient-to-b from-[#0B0F19] to-[#374151] rounded-t-full"></div>
                        </div>
                    }
                    label="Patente"
                    value={formData.tipo_patente}
                    readOnly
                    onClick={() => setActiveModal('patente')}
                    component={
                         <div className="cursor-pointer" onClick={() => setActiveModal('patente')}>
                            <span className="text-2xl font-bold text-[#0B0F19]">{formData.tipo_patente}</span>
                            <span className="block text-sm text-gray-400 font-medium mt-0.5">Tipo Patente</span>
                        </div>
                    }
                />

                 <InputRow
                    icon={
                        <div className="relative w-7 h-7">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F19] to-[#374151] rounded-lg"></div>
                            <div className="absolute top-0 left-1.5 w-1 h-2 bg-[#F3F4F6] rounded-b-full"></div>
                            <div className="absolute top-0 right-1.5 w-1 h-2 bg-[#F3F4F6] rounded-b-full"></div>
                            <div className="absolute bottom-1 left-1 right-1 top-3 bg-[#F3F4F6] rounded-sm">
                                <div className="grid grid-cols-3 gap-[2px] p-[3px]">
                                    <div className="w-1 h-1 bg-[#0B0F19] rounded-[1px]"></div>
                                    <div className="w-1 h-1 bg-[#0B0F19] rounded-[1px]"></div>
                                    <div className="w-1 h-1 bg-[#0B0F19] rounded-[1px]"></div>
                                    <div className="w-1 h-1 bg-[#0B0F19] rounded-[1px]"></div>
                                    <div className="w-1 h-1 bg-[#0B0F19] rounded-[1px]"></div>
                                    <div className="w-1 h-1 bg-[#0B0F19] rounded-[1px]"></div>
                                </div>
                            </div>
                        </div>
                    }
                    label="Periodo"
                    value={formData.mese_preferito}
                    readOnly
                    onClick={() => setActiveModal('mese')}
                    component={
                         <div className="cursor-pointer" onClick={() => setActiveModal('mese')}>
                            <span className={`text-2xl font-bold capitalize ${formData.mese_preferito ? 'text-[#0B0F19]' : 'text-gray-300'}`}>
                              {formData.mese_preferito || 'Seleziona...'}
                            </span>
                            <span className="block text-sm text-gray-400 font-medium mt-0.5">Mese Richiesto *</span>
                        </div>
                    }
                />

                <InputRow
                    icon={
                        <div className="relative w-6 h-6">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F19] to-[#374151] rounded-lg"></div>
                            <svg className="relative w-6 h-6 text-white p-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                    }
                    label="Note (opzionale)"
                    value={formData.note}
                    placeholder="Es. disponibile solo venerdì"
                    onChange={(e) => setFormData({...formData, note: e.target.value})}
                />

                {/* Profile Box */}
                <div className={`mt-8 mb-8 rounded-2xl p-4 flex items-center gap-4 transition-all duration-500 ${
                  formData.nome_cognome
                    ? 'bg-gradient-to-r from-[#0B0F19] to-[#1F2937] shadow-lg'
                    : 'bg-[#F9FAFB]'
                }`}>
                     <div className={`w-12 h-12 rounded-full overflow-hidden relative flex items-center justify-center transition-all duration-500 ${
                       formData.nome_cognome
                         ? 'bg-gradient-to-br from-white/30 to-white/10 ring-2 ring-white/20 shadow-inner'
                         : 'bg-gray-200'
                     }`}>
                         {formData.nome_cognome ? (
                           <span className="text-white font-bold text-lg uppercase">
                             {formData.nome_cognome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                           </span>
                         ) : (
                           <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                             <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                           </svg>
                         )}
                     </div>
                     <div className="overflow-hidden">
                         <p className={`font-bold transition-all duration-500 ${
                           formData.nome_cognome ? 'text-white' : 'text-[#0B0F19]'
                         }`}>
                           {formData.nome_cognome || 'Allievo'}
                         </p>
                         <p className={`text-sm transition-colors duration-500 ${
                           formData.nome_cognome ? 'text-white/60' : 'text-gray-400'
                         }`}>Prenotazione da confermare</p>
                     </div>
                     {formData.nome_cognome && (
                       <div className="ml-auto flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                           <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                             <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                         </div>
                       </div>
                     )}
                </div>

            </div>
        </Card>

        {/* Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 w-full bg-white p-6 pb-8 rounded-t-[30px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40 flex items-center justify-between border-t border-gray-100 max-w-[480px] left-1/2 -translate-x-1/2">
            <div className="flex-1 pr-4">
                <span className="text-3xl font-bold text-[#0B0F19]">Costo</span>
                <span className="text-xs text-gray-400 block leading-tight">Al momento della conferma del giorno<br/>verrà ricordato</span>
            </div>
            <Button onClick={handleSubmit} disabled={loading} className="!w-auto !px-8 min-w-[140px]">
                {loading ? '...' : 'Prenota Ora'}
            </Button>
        </div>

        {/* Modal */}
        {activeModal !== 'none' && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={() => setActiveModal('none')}>
                <div className="bg-white w-full max-w-[480px] rounded-t-[30px] p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                    <h3 className="text-xl font-bold mb-6 text-center capitalize text-[#0B0F19]">Seleziona {activeModal}</h3>

                    {/* Patente - Chips */}
                    {activeModal === 'patente' && (
                      <div className="flex flex-wrap gap-3 justify-center">
                        {Object.values(PatenteType).map(v => (
                            <SelectChip key={v} label={v} selected={formData.tipo_patente === v} onClick={() => { setFormData({...formData, tipo_patente: v}); setActiveModal('none'); }} />
                        ))}
                      </div>
                    )}

                    {/* Calendario Visuale per Mese */}
                    {activeModal === 'mese' && (
                      <div className="space-y-4">
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
                                onClick={() => { setFormData({...formData, mese_preferito: month}); setActiveModal('none'); }}
                                className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                                  isSelected
                                    ? 'border-[#0B0F19] bg-[#0B0F19] text-white shadow-lg scale-[1.02]'
                                    : isUrgent
                                      ? 'border-red-400 bg-red-50 hover:border-red-500 hover:shadow-md'
                                      : isRecommended
                                        ? 'border-green-400 bg-green-50 hover:border-green-500 hover:shadow-md'
                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                                }`}
                              >
                                <div className="text-left">
                                  <div className={`text-3xl font-bold ${isSelected ? 'text-white' : 'text-[#0B0F19]'}`}>
                                    {monthNumber.toString().padStart(2, '0')}
                                  </div>
                                  <div className={`text-sm font-medium ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                                    {monthName} {yearStr}
                                  </div>
                                </div>
                                {isSelected && (
                                  <div className="absolute top-3 right-3">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                                {/* Badge Urgente, Consigliato o puntini decorativi */}
                                {isUrgent ? (
                                  <div className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                    isSelected ? 'bg-red-500/30 text-white' : 'bg-red-100 text-red-700'
                                  }`}>
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    Prenota subito!
                                  </div>
                                ) : isRecommended ? (
                                  <div className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                    isSelected ? 'bg-green-500/30 text-white' : 'bg-green-100 text-green-700'
                                  }`}>
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Consigliato
                                  </div>
                                ) : (
                                  <div className={`mt-3 flex justify-between w-full ${isSelected ? 'opacity-60' : 'opacity-100'}`}>
                                    {[...Array(8)].map((_, i) => (
                                      <div
                                        key={i}
                                        className={`w-[4px] h-[2px] rounded-full animate-dot ${isSelected ? 'bg-red-400' : 'bg-red-600'}`}
                                        style={{ animationDelay: `${i * 0.12}s` }}
                                      ></div>
                                    ))}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </div>
            </div>
        )}
    </div>

    {/* ========== DESKTOP LAYOUT ========== */}
    <div className="hidden lg:block pb-24">
      <div className="grid grid-cols-2 gap-8">
        {/* Colonna Sinistra - Form */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-[#0B0F19] mb-8">Prenota il tuo Esame di Teoria</h1>

          {/* Nome e Cognome */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-500 mb-2">Nome e Cognome *</label>
            <input
              type="text"
              value={formData.nome_cognome}
              onChange={(e) => setFormData({...formData, nome_cognome: e.target.value})}
              placeholder="Mario Rossi"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg text-[#0B0F19] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B0F19]/20 focus:border-[#0B0F19] transition-all"
            />
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-500 mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="mario.rossi@email.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg text-[#0B0F19] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B0F19]/20 focus:border-[#0B0F19] transition-all"
            />
          </div>

          {/* Data Scadenza */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-medium text-gray-500">Data Scadenza Teoria *</label>
              <button
                type="button"
                onClick={() => setShowInfoTooltip(!showInfoTooltip)}
                className="w-5 h-5 rounded-full bg-[#25D366] text-white flex items-center justify-center text-xs font-bold hover:bg-[#20bd5a] transition-all"
              >
                i
              </button>
            </div>
            <input
              type="date"
              value={formData.data_scadenza}
              onChange={(e) => setFormData({...formData, data_scadenza: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg text-[#0B0F19] focus:outline-none focus:ring-2 focus:ring-[#0B0F19]/20 focus:border-[#0B0F19] transition-all"
            />
            {/* Info Tooltip Desktop */}
            {showInfoTooltip && (
              <div className="mt-3 bg-gradient-to-r from-[#25D366]/10 to-[#25D366]/5 rounded-xl p-4 border border-[#25D366]/30">
                <p className="text-sm text-gray-600 mb-2">Non sai la data di scadenza?</p>
                <a
                  href="https://api.whatsapp.com/send/?phone=390424523690&text=Ciao!%20volevo%20sapere%20la%20data%20di%20scadenza%20per%20fare%20l'esame%20di%20teoria%20che%20mi%20devo%20prenotare!%20Grazie"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-4 py-2 rounded-full text-sm hover:bg-[#20bd5a] transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Chiedi su WhatsApp
                </a>
              </div>
            )}
          </div>

          {/* Tipo Patente */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-500 mb-2">Tipo Patente</label>
            <div className="flex gap-3">
              {Object.values(PatenteType).map(v => (
                <button
                  key={v}
                  onClick={() => setFormData({...formData, tipo_patente: v})}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    formData.tipo_patente === v
                      ? 'bg-[#0B0F19] text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-500 mb-2">Note (opzionale)</label>
            <input
              type="text"
              value={formData.note}
              onChange={(e) => setFormData({...formData, note: e.target.value})}
              placeholder="Es. disponibile solo venerdì"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg text-[#0B0F19] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B0F19]/20 focus:border-[#0B0F19] transition-all"
            />
          </div>

          {/* Riepilogo Allievo */}
          {formData.nome_cognome && (
            <div className="bg-gradient-to-r from-[#0B0F19] to-[#1F2937] rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white font-bold text-lg uppercase">
                  {formData.nome_cognome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div>
                <p className="font-bold text-white">{formData.nome_cognome}</p>
                <p className="text-sm text-white/60">Prenotazione da confermare</p>
              </div>
            </div>
          )}
        </div>

        {/* Colonna Destra - Selezione Mese */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-xl font-bold text-[#0B0F19] mb-2">Seleziona il Mese *</h2>
          <p className="text-sm text-gray-400 mb-6">Scegli il mese in cui vuoi sostenere l'esame</p>

          <div className="grid grid-cols-2 gap-4">
            {months.map((month) => {
              const [monthName, yearStr] = month.split(' ');
              const isSelected = formData.mese_preferito === month;
              const monthNumber = mesiItaliani.indexOf(monthName) + 1;
              const isRecommended = recommendedMonth === month && !urgentMonth;
              const isUrgent = urgentMonth === month;

              return (
                <button
                  key={month}
                  onClick={() => setFormData({...formData, mese_preferito: month})}
                  className={`relative p-5 rounded-2xl border-2 transition-all duration-300 text-left ${
                    isSelected
                      ? 'border-[#0B0F19] bg-[#0B0F19] text-white shadow-lg'
                      : isUrgent
                        ? 'border-red-400 bg-red-50 hover:border-red-500 hover:shadow-md'
                        : isRecommended
                          ? 'border-green-400 bg-green-50 hover:border-green-500 hover:shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className={`text-3xl font-bold ${isSelected ? 'text-white' : 'text-[#0B0F19]'}`}>
                        {monthNumber.toString().padStart(2, '0')}
                      </div>
                      <div className={`text-sm font-medium ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                        {monthName} {yearStr}
                      </div>
                    </div>
                    {isSelected && (
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  {/* Badge */}
                  {isUrgent && (
                    <div className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      isSelected ? 'bg-red-500/30 text-white' : 'bg-red-100 text-red-700'
                    }`}>
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Prenota subito!
                    </div>
                  )}
                  {isRecommended && !isUrgent && (
                    <div className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      isSelected ? 'bg-green-500/30 text-white' : 'bg-green-100 text-green-700'
                    }`}>
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Consigliato
                    </div>
                  )}
                  {/* Animated dots */}
                  {!isUrgent && !isRecommended && (
                    <div className={`mt-3 flex justify-between w-full ${isSelected ? 'opacity-60' : 'opacity-100'}`}>
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-[4px] h-[2px] rounded-full animate-dot ${isSelected ? 'bg-red-400' : 'bg-red-600'}`}
                          style={{ animationDelay: `${i * 0.12}s` }}
                        ></div>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Info aggiuntiva */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-amber-700">
                La prenotazione nel mese richiesto <strong>NON è garantita</strong>. Le date degli esami sono stabilite dalla Motorizzazione.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar Desktop */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 z-40">
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold text-[#0B0F19]">Costo esame</span>
            <span className="text-sm text-gray-400 ml-3">Verrà comunicato al momento della conferma</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-10 py-4 bg-[#0B0F19] text-white font-bold rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Caricamento...' : 'Prenota Ora'}
          </button>
        </div>
      </div>
    </div>
    </>
  );
};
