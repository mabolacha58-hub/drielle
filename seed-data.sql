-- ========================================
-- SEED DATA: Serviços e Vagas Simuladas
-- Para compartilhar com amigos
-- ========================================

-- Limpar dados anteriores (opcional)
-- DELETE FROM produtos WHERE titulo LIKE 'DEMO%';
-- DELETE FROM vagas WHERE titulo LIKE 'DEMO%';

-- ==========================================
-- 1. SERVIÇOS SIMULADOS NO MARKETPLACE
-- ==========================================

INSERT INTO produtos (vendedor_id, titulo, descricao, categoria, preco, dias_entrega, revisoes, tags, imagem_url, created_at)
VALUES 
-- Desenvolvimento Web
('d1a2b3c4-e5f6-7890-abcd-ef1234567890', 'DEMO - Website Profissional em React', 'Desenvolvimento completo de website moderno com React, Tailwind e Supabase. Inclui: design responsivo, SEO, integração de APIs, e deploy.', 'Software', 25000, 14, 3, 'React,Tailwind,Web,Moderno', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500', NOW()),

('d1a2b3c4-e5f6-7890-abcd-ef1234567890', 'DEMO - E-commerce Shopify', 'Montagem completa de loja online em Shopify. Setup de produtos, pagamentos, email marketing e integração com redes sociais.', 'Software', 15000, 7, 2, 'Shopify,E-commerce,Vendas', 'https://images.unsplash.com/photo-1460925895917-afdab942c72f?w=500', NOW()),

-- Design
('d2b3c4d5-e6f7-8901-bcde-f12345678901', 'DEMO - Logo Profissional + Brand Kit', 'Design de logo único + guia de marca com cores, tipografia e aplicações. Inclui 3 conceitos diferentes e 5 revisões.', 'Design', 8000, 5, 5, 'Logo,Branding,Design', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500', NOW()),

('d2b3c4d5-e6f7-8901-bcde-f12345678901', 'DEMO - Design de Interface (UI/UX)', 'Design completo de interface para app/website. Wireframes, protótipo interativo em Figma e design system.', 'Design', 12000, 10, 4, 'UI,UX,Figma,App', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500', NOW()),

-- Consultoria
('d3c4d5e6-f7g8-9012-cdef-123456789012', 'DEMO - Consultoria de Marketing Digital', 'Análise do seu negócio + estratégia de marketing em 3 canais (Google, Facebook, Instagram). Inclui relatório e 2 call-ups de implementação.', 'Consultoria', 10000, 7, 2, 'Marketing,Estratégia,Digital', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500', NOW()),

('d3c4d5e6-f7g8-9012-cdef-123456789012', 'DEMO - Auditoria de Negócio', 'Revisão completa de processos, finanças e operações. Relatório com 20+ recomendações de melhoria e ROI.', 'Consultoria', 18000, 14, 1, 'Auditoria,Negócio,Finanças', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500', NOW()),

-- Formação
('d4d5e6f7-g8h9-0123-defg-234567890123', 'DEMO - Curso: Desenvolvimento Web Completo', 'Formação online de 8 semanas. HTML, CSS, JavaScript, React, Node.js e Databases. Com certificado e suporte via chat.', 'Formação', 5000, 60, 10, 'Programação,Web,Curso,Certificado', 'https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=500', NOW()),

('d4d5e6f7-g8h9-0123-defg-234567890123', 'DEMO - Workshop: Marketing para Startups', 'Sessão intensiva de 1 dia sobre estratégia, SEO, redes sociais e growth hacking. Máx. 30 pessoas.', 'Formação', 3000, 7, 1, 'Marketing,Startup,Workshop', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500', NOW()),

-- Tradução
('d5e6f7g8-h9i0-1234-efgh-345678901234', 'DEMO - Tradução PT-EN (Técnica)', 'Tradução de documentos técnicos/científicos. Inclui: glossário customizado, revisão técnica e formatação.', 'Tradução', 4000, 5, 2, 'Tradução,Português,Inglês,Técnica', 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500', NOW()),

('d5e6f7g8-h9i0-1234-efgh-345678901234', 'DEMO - Legendagem de Vídeos', 'Legendagem profissional em múltiplos idiomas. Sincronização perfeita e formatação.', 'Tradução', 3500, 3, 1, 'Vídeo,Legendagem,Tradução', 'https://images.unsplash.com/photo-1500880434347-7992f1b27ccf?w=500', NOW());

-- ==========================================
-- 2. VAGAS SIMULADAS
-- ==========================================

INSERT INTO vagas (empresa_id, titulo, categoria, tipo, localizacao, descricao, salario_min, salario_max, skills, responsabilidades, requisitos, beneficios, prazo_candidatura, created_at)
VALUES

-- Vagas em TI
('e1f2a3b4-c5d6-7890-abcd-ef1234567890', 'DEMO - Senior Developer React/Node.js', 'TI', 'Tempo Inteiro', 'Maputo', 'Procuramos Senior Developer com experiência em React e Node.js para liderar projetos de transformação digital.', 50000, 80000, '["React","Node.js","TypeScript","PostgreSQL","AWS"]', '["Arquitetura de aplicações","Mentoria de juniors","Code review"]', '["5+ anos de experiência","Experiência em startups","Conhecimento de CI/CD"]', '["Seguro de saúde","Home office","Bónus de performance"]', '2026-05-23', NOW()),

('e1f2a3b4-c5d6-7890-abcd-ef1234567890', 'DEMO - UX/UI Designer', 'Design', 'Tempo Inteiro', 'Maputo', 'Procuramos Designer talentoso para liderar experiência do utilizador em nossos produtos digitais.', 25000, 40000, '["Figma","UI/UX","User Research","Prototyping"]', '["Desenhar interfaces","Pesquisa de utilizadores","Design systems"]', '["Portfolio com 3+ projetos","Inglês fluente","Curiosidade design"]', '["Ambiente criativo","Cursos de formação","Flexibilidade horária"]', '2026-05-20', NOW()),

-- Vagas em Marketing
('e2f3a4b5-c6d7-8901-bcde-f12345678901', 'DEMO - Marketing Manager', 'Marketing', 'Tempo Inteiro', 'Maputo', 'Liderança de equipa de marketing para startup em fase de crescimento. Responsabilidade de estratégia completa.', 30000, 50000, '["Marketing Digital","Google Ads","Analytics","Copywriting"]', '["Estratégia de marketing","Gestão de equipa","Campanhas multi-canal"]', '["3+ anos em startups","Português e Inglês","Experiência em B2B"]', '["Equity","Bónus trimestral","Desenvolvimento profissional"]', '2026-05-25', NOW()),

('e2f3a4b5-c6d7-8901-bcde-f12345678901', 'DEMO - Social Media Specialist', 'Marketing', 'Remoto', 'Moçambique', 'Especialista em redes sociais para gerar engagement e crescimento de comunidade. 100% remoto.', 15000, 25000, '["Instagram","TikTok","Community Management","Content Creation"]', '["Criar conteúdo viral","Engagement com comunidade","Analytics"]', '["2+ anos de experiência","Portfolio no Instagram","Criatividade"]', '["100% remoto","Horário flexível","Equipamento fornecido"]', '2026-05-22', NOW()),

-- Vagas em Finanças
('e3f4a5b6-c7d8-9012-cdef-123456789012', 'DEMO - Analista Financeiro Junior', 'Finanças', 'Tempo Inteiro', 'Maputo', 'Profissional em início de carreira para análise financeira, relatórios e contabilidade de startup.', 12000, 18000, '["Excel","SAP","Contabilidade","Análise Financeira"]', '["Relatórios financeiros","Análise de dados","Contabilidade"]', '["Licenciatura em Finanças/Contabilidade","Excel avançado","Responsabilidade"]', '["Formação contínua","Ambiente jovem","Crescimento rápido"]', '2026-05-20', NOW()),

-- Vagas em RH
('e4f5a6b7-c8d9-0123-defg-234567890123', 'DEMO - Recrutador', 'RH', 'Tempo Inteiro', 'Maputo', 'Responsável por recrutamento e seleção de talento para empresa em expansão. Foco em tech.', 18000, 28000, '["Recrutamento","LinkedIn","Entrevistas","Employer Branding"]', '["Sourcing de candidatos","Entrevistas técnicas","Employer branding"]', '["2+ anos recrutamento","Conhecimento em tech","Networking"]', '["Comissão de performance","Ambiente colaborativo","Benefícios"]', '2026-05-24', NOW()),

-- Vagas em Vendas
('e5f6a7b8-c9da-1234-efgh-345678901234', 'DEMO - Sales Executive', 'Vendas', 'Tempo Inteiro', 'Maputo', 'Profissional de vendas para prospecção e fechamento de contratos B2B. Comissão atrativa.', 20000, 60000, '["Vendas B2B","Negociação","CRM","Prospecting"]', '["Prospecção ativa","Negociação","Fechamento de contratos"]', '["2+ anos em vendas B2B","Network","Inglês fluente"]', '["Comissão até 100%","Bónus","Viagens"]', '2026-05-23', NOW()),

-- Vagas em Educação
('e6f7a8b9-cada-2345-fghi-456789012345', 'DEMO - Professor Online de Programação', 'Educação', 'Freelance', 'Moçambique', 'Professor para criar e lecionar cursos de programação. Flexibilidade total de horários.', 0, 0, '["Programação","Didática","Paciência","Comunicação"]', '["Criar conteúdo educativo","Aulas online","Feedback a alunos"]', '["Experiência em programação","Capacidade comunicação","Portfolio"]', '["Flexibilidade","Remuneração por alunos","Crescimento profissional"]', '2026-06-01', NOW());

-- ==========================================
-- NOTA: Estes dados são para DEMO/Teste
-- Marque como simulados no frontend
-- ==========================================
