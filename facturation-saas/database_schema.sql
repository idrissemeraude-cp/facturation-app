-- ==========================================
-- SCHÉMA COMPLET & OPTIMISÉ POUR iziFacture (Ré-exécutable à volonté)
-- ==========================================

-- 1. Table des profils d'entreprise
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  tax_number TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table des clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Table des factures
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients ON DELETE CASCADE NOT NULL,
  invoice_number TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'sent', 'paid', 'overdue', 'cancelled')),
  issue_date DATE,
  due_date DATE,
  subtotal NUMERIC(12, 2) DEFAULT 0,
  tax_amount NUMERIC(12, 2) DEFAULT 0,
  total_amount NUMERIC(12, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Table des lignes de facture
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_price NUMERIC(12, 2) NOT NULL DEFAULT 0
);

-- ==========================================
-- INDEX DE PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_number_user ON invoices(user_id, invoice_number);

-- ==========================================
-- SÉCURITÉ ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Suppression des anciennes politiques si elles existent pour éviter les erreurs
DROP POLICY IF EXISTS "user_profiles_owner" ON user_profiles;
DROP POLICY IF EXISTS "Utilisateurs gèrent leur propre profil" ON user_profiles;

DROP POLICY IF EXISTS "clients_select" ON clients;
DROP POLICY IF EXISTS "clients_insert" ON clients;
DROP POLICY IF EXISTS "clients_update" ON clients;
DROP POLICY IF EXISTS "clients_delete" ON clients;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres clients" ON clients;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leurs propres clients" ON clients;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leurs propres clients" ON clients;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs propres clients" ON clients;
DROP POLICY IF EXISTS "Utilisateurs voient leurs clients" ON clients;
DROP POLICY IF EXISTS "Utilisateurs créent leurs clients" ON clients;
DROP POLICY IF EXISTS "Utilisateurs modifient leurs clients" ON clients;
DROP POLICY IF EXISTS "Utilisateurs suppriment leurs clients" ON clients;

DROP POLICY IF EXISTS "invoices_select" ON invoices;
DROP POLICY IF EXISTS "invoices_insert" ON invoices;
DROP POLICY IF EXISTS "invoices_update" ON invoices;
DROP POLICY IF EXISTS "invoices_delete" ON invoices;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres factures" ON invoices;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leurs propres factures" ON invoices;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leurs propres factures" ON invoices;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs propres factures" ON invoices;
DROP POLICY IF EXISTS "Utilisateurs voient leurs factures" ON invoices;
DROP POLICY IF EXISTS "Utilisateurs créent leurs factures" ON invoices;
DROP POLICY IF EXISTS "Utilisateurs modifient leurs factures" ON invoices;
DROP POLICY IF EXISTS "Utilisateurs suppriment leurs factures" ON invoices;

DROP POLICY IF EXISTS "invoice_items_select" ON invoice_items;
DROP POLICY IF EXISTS "invoice_items_insert" ON invoice_items;
DROP POLICY IF EXISTS "invoice_items_update" ON invoice_items;
DROP POLICY IF EXISTS "invoice_items_delete" ON invoice_items;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les lignes de leurs factures" ON invoice_items;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des lignes pour leurs factures" ON invoice_items;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier les lignes de leurs factures" ON invoice_items;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer les lignes de leurs factures" ON invoice_items;
DROP POLICY IF EXISTS "Utilisateurs voient les lignes de leurs factures" ON invoice_items;
DROP POLICY IF EXISTS "Utilisateurs créent des lignes pour leurs factures" ON invoice_items;
DROP POLICY IF EXISTS "Utilisateurs modifient les lignes de leurs factures" ON invoice_items;
DROP POLICY IF EXISTS "Utilisateurs suppriment les lignes de leurs factures" ON invoice_items;

-- Création des nouvelles politiques RLS
CREATE POLICY "user_profiles_owner" ON user_profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "clients_select" ON clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "clients_insert" ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clients_update" ON clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "clients_delete" ON clients FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "invoices_select" ON invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "invoices_insert" ON invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "invoices_update" ON invoices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "invoices_delete" ON invoices FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "invoice_items_select" ON invoice_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid())
);
CREATE POLICY "invoice_items_insert" ON invoice_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid())
);
CREATE POLICY "invoice_items_update" ON invoice_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid())
);
CREATE POLICY "invoice_items_delete" ON invoice_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid())
);

-- ==========================================
-- TRIGGERS DE MISE À JOUR DU TIMESTAMP
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
