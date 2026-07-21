-- Création de la table des clients
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Création de la table des factures
CREATE TABLE invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  client_id UUID REFERENCES clients ON DELETE CASCADE NOT NULL,
  invoice_number TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'paid', 'overdue', 'cancelled')),
  issue_date DATE,
  due_date DATE,
  subtotal NUMERIC(10, 2) DEFAULT 0,
  tax_amount NUMERIC(10, 2) DEFAULT 0,
  total_amount NUMERIC(10, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Création de la table des lignes de facture
CREATE TABLE invoice_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_price NUMERIC(10, 2) NOT NULL DEFAULT 0
);

-- Sécurité RLS (Row Level Security) - Pour que chaque utilisateur ne voit que ses propres données
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Politiques pour Clients
CREATE POLICY "Les utilisateurs peuvent voir leurs propres clients" ON clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent créer leurs propres clients" ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres clients" ON clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres clients" ON clients FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour Factures
CREATE POLICY "Les utilisateurs peuvent voir leurs propres factures" ON invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent créer leurs propres factures" ON invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres factures" ON invoices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres factures" ON invoices FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour Lignes de Facture
CREATE POLICY "Les utilisateurs peuvent voir les lignes de leurs factures" ON invoice_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid())
);
CREATE POLICY "Les utilisateurs peuvent créer des lignes pour leurs factures" ON invoice_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid())
);
CREATE POLICY "Les utilisateurs peuvent modifier les lignes de leurs factures" ON invoice_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid())
);
CREATE POLICY "Les utilisateurs peuvent supprimer les lignes de leurs factures" ON invoice_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid())
);

-- Fonction et Trigger pour mettre à jour automatiquement le champ 'updated_at' des factures
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
