interface TabSwitcherProps<T extends string> {
  tabs: { id: T; label: string }[];
  activeTab: T;
  onChange: (tab: T) => void;
}

export function TabSwitcher<T extends string>({ tabs, activeTab, onChange }: TabSwitcherProps<T>) {
  return (
    <div className="flex bg-[#F1F3F5] rounded-xl p-1 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
            ${activeTab === tab.id
              ? 'bg-white text-[#0A2540] shadow-sm'
              : 'text-[#6C757D] hover:text-[#0A2540]'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
