-- Adicionar coluna imagens_urls (array de strings) à tabela produtos
ALTER TABLE produtos
ADD COLUMN IF NOT EXISTS imagens_urls TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Migrar dados existentes: se imagem_url existe, copiar para imagens_urls
UPDATE produtos
SET imagens_urls = ARRAY[imagem_url]
WHERE imagem_url IS NOT NULL AND (imagens_urls IS NULL OR array_length(imagens_urls, 1) = 0);
