# Organização do Perfil

## Estrutura

O componente `Profile` foi reorganizado para melhor manutenibilidade e escalabilidade:

### Arquivos
- `src/app/pages/Profile.tsx` - Componente principal do perfil
- `src/app/hooks/useProfile.ts` - Hook customizado para gerenciar dados do perfil

### Funcionalidades

#### Componente Profile
- **Carregamento Dinâmico**: Carrega dados do perfil baseado no ID da rota
- **Estados Condicionais**: Mostra diferentes seções baseado no tipo de perfil (profissional/empresa)
- **Controle de Acesso**: Botões de edição só aparecem para o próprio perfil
- **Estados de Loading/Error**: Feedback visual durante carregamento e tratamento de erros

#### Hook useProfileData
- **Separação de Responsabilidades**: Lógica de dados separada do componente UI
- **Tipos Fortemente Tipados**: Interfaces TypeScript para todos os dados
- **Estado Centralizado**: Gerenciamento unificado de loading, error e dados
- **Extensível**: Fácil adicionar novas seções (habilidades, experiência, etc.)

### Tipos de Dados

```typescript
interface ProfileData {
  id: string;
  nome: string;
  email: string;
  role: 'profissional' | 'empresa' | 'admin';
  // ... outros campos
}

interface Skill {
  id?: string;
  name: string;
}

interface Experience {
  id?: string;
  role: string;
  company: string;
  period: string;
  description: string;
  // ... campos adicionais
}
```

### Melhorias Futuras

1. **Tabelas Dedicadas**: Migrar dados mock para tabelas reais no Supabase
2. **Edição Inline**: Implementar edição de seções diretamente na interface
3. **Validação**: Adicionar validação de formulários
4. **Cache**: Implementar cache de dados para melhor performance
5. **Paginação**: Para listas longas (reviews, experiência)

### Como Usar

```tsx
import { Profile } from './pages/Profile';

// Rota: /perfil/:id
// O componente automaticamente carrega o perfil baseado no parâmetro da URL
```

### Estados

- **Loading**: Spinner enquanto carrega dados
- **Error**: Mensagem de erro se falhar ao carregar
- **Success**: Perfil completo com todas as seções
- **Own Profile**: Botões de edição visíveis
- **Company Profile**: Seções específicas para empresas ocultas