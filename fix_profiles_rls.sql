-- Política RLS para permitir que usuários anônimos vejam profiles dos vendedores
-- Execute este SQL no dashboard do Supabase (SQL Editor)

-- Habilitar RLS na tabela profiles (se não estiver habilitado)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir SELECT anônimo em profiles
CREATE POLICY "Allow anonymous read profiles for products" ON profiles
FOR SELECT USING (true);

-- Ou, se quiser ser mais específico, permitir apenas quando o profile é de um vendedor ativo:
-- CREATE POLICY "Allow anonymous read seller profiles" ON profiles
-- FOR SELECT USING (
--   EXISTS (
--     SELECT 1 FROM produtos
--     WHERE produtos.vendedor_id = profiles.id
--     AND produtos.activo = true
--   )
-- );