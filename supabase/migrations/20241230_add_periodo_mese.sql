-- Aggiunge la colonna periodo_mese alla tabella prenotazioni
-- Valori possibili: 'Inizio mese', 'Metà mese', 'Fine mese'

ALTER TABLE prenotazioni
ADD COLUMN IF NOT EXISTS periodo_mese TEXT;

-- Opzionale: aggiungi un commento alla colonna
COMMENT ON COLUMN prenotazioni.periodo_mese IS 'Preferenza indicativa del periodo nel mese (Inizio mese, Metà mese, Fine mese)';
