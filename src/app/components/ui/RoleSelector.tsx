type Role = 'profissional' | 'empresa';

interface RoleSelectorProps {
  value: Role;
  onChange: (role: Role) => void;
}

const roles = [
  { id: 'profissional' as const, emoji: '👤', title: 'Profissional', sub: 'Procuro emprego ou ofereço serviços' },
  { id: 'empresa' as const, emoji: '🏢', title: 'Empresa', sub: 'Quero contratar ou vender' },
];

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#495057] mb-1.5 tracking-wide">
        Tipo de conta
      </label>
      <div className="grid grid-cols-2 gap-2.5">
        {roles.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => onChange(role.id)}
            className={`
              p-3 sm:p-3.5 rounded-xl border-2 text-left transition-all duration-150
              ${value === role.id
                ? 'border-[#1A6BB5] bg-[#E8F3FC]'
                : 'border-[#DEE2E6] bg-[#FAFAFA] hover:border-[#1A6BB5]/50'
              }
            `}
          >
            <div className="text-2xl mb-1.5">{role.emoji}</div>
            <div className={`text-sm font-bold mb-0.5 ${value === role.id ? 'text-[#0D3B6E]' : 'text-[#374151]'}`}>
              {role.title}
            </div>
            <div className="text-[11px] text-[#9CA3AF] leading-tight">{role.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
