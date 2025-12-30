#!/bin/bash

# Script per deployare le modifiche su Supabase

echo "=== Deploy Supabase ==="
echo ""

# 1. Applica le migrazioni del database
echo "1. Applicando migrazione database..."
echo "   Esegui questo SQL nella Dashboard Supabase > SQL Editor:"
echo ""
cat migrations/20241230_add_periodo_mese.sql
echo ""
echo "   Oppure usa: supabase db push"
echo ""

# 2. Deploy della Edge Function
echo "2. Deployando Edge Function send-confirmation-email..."
supabase functions deploy send-confirmation-email

echo ""
echo "=== Deploy completato! ==="
