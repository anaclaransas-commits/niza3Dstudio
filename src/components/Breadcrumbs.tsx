import { ChevronRight, Home } from 'lucide-react';
import { type PageId } from './Sidebar';

interface BreadcrumbItem {
  label: string;
  page?: PageId;
}

interface BreadcrumbsProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

const pageLabels: Record<PageId, string> = {
  dashboard: 'Dashboard',
  calculator: 'Calculadora',
  registration: 'Cadastros',
  clients: 'Clientes',
  products: 'Produtos',
  catalog: 'Catálogo',
  reports: 'Financeiro',
  budgets: 'Orçamentos',
  discounts: 'Descontos',
};

export function Breadcrumbs({ currentPage, onNavigate }: BreadcrumbsProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Início', page: 'dashboard' },
    { label: pageLabels[currentPage] || currentPage },
  ];

  return (
    <nav className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
      <button
        onClick={() => onNavigate('dashboard')}
        className="flex items-center gap-1 hover:text-[var(--color-primary)] transition-colors"
        title="Voltar ao Dashboard"
      >
        <Home className="w-4 h-4" />
        <span>Início</span>
      </button>
      <ChevronRight className="w-4 h-4" />
      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
        {pageLabels[currentPage] || currentPage}
      </span>
    </nav>
  );
}
