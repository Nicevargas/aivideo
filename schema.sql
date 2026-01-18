
-- ==========================================
-- 1. CONFIGURAÇÃO DO STORAGE (BUCKET USUARIO)
-- ==========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('usuario', 'usuario', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
DROP POLICY IF EXISTS "Acesso Público" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem enviar seus próprios avatares" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios avatares" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem excluir seus próprios avatares" ON storage.objects;

CREATE POLICY "Acesso Público" ON storage.objects FOR SELECT USING ( bucket_id = 'usuario' );
CREATE POLICY "Usuários podem enviar seus próprios avatares" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'usuario' AND (storage.foldername(name))[1] = auth.uid()::text );
CREATE POLICY "Usuários podem atualizar seus próprios avatares" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id = 'usuario' AND (storage.foldername(name))[1] = auth.uid()::text ) WITH CHECK ( bucket_id = 'usuario' AND (storage.foldername(name))[1] = auth.uid()::text );
CREATE POLICY "Usuários podem excluir seus próprios avatares" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id = 'usuario' AND (storage.foldername(name))[1] = auth.uid()::text );

-- ==========================================
-- 2. TABELA DE PACOTES DE CRÉDITO
-- ==========================================
CREATE TABLE IF NOT EXISTS public.credit_packages (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    credits INTEGER NOT NULL,
    tipo_acesso INTEGER DEFAULT 3, -- Filtro solicitado
    popular BOOLEAN DEFAULT false,
    best_value BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura pública de pacotes" ON public.credit_packages;
CREATE POLICY "Leitura pública de pacotes" ON public.credit_packages FOR SELECT USING (true);

-- Dados Iniciais para o tipo_acesso = 3 (Reels Pro)
INSERT INTO public.credit_packages (id, name, price, credits, tipo_acesso, popular, best_value)
VALUES 
('pkg-pro-1', 'Pro Starter', 39.90, 60, 3, false, false),
('pkg-pro-2', 'Pro Premium', 79.90, 150, 3, true, false),
('pkg-pro-3', 'Pro Unlimited', 149.90, 400, 3, false, true)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 3. TABELA DE PERFIL
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profile (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(255),
    credits INTEGER DEFAULT 50,
    acesso_prof_usuario INTEGER DEFAULT 3, 
    phone VARCHAR(50), 
    tax_id VARCHAR(50), 
    avatar_url TEXT, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Perfil: Inserção" ON public.profile;
DROP POLICY IF EXISTS "Perfil: Leitura" ON public.profile;
DROP POLICY IF EXISTS "Perfil: Update" ON public.profile;

CREATE POLICY "Perfil: Inserção" ON public.profile FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Perfil: Leitura" ON public.profile FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Perfil: Update" ON public.profile FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
