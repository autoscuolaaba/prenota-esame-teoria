export enum PatenteType {
  AM = 'AM',
  A1 = 'A1',
  B = 'B'
}

export enum PrenotazioneStato {
  NUOVO = 'nuovo',
  CONTATTATO = 'contattato',
  CONFERMATO = 'confermato'
}

export interface Prenotazione {
  id: string;
  created_at: string;
  nome_cognome: string;
  telefono: string;
  email?: string;
  tipo_patente: PatenteType;
  mese_preferito: string;
  data_scadenza?: string;
  note?: string;
  stato: PrenotazioneStato;
}

export interface AdminFilters {
  mese: string;
  patente: string;
  stato: string;
}