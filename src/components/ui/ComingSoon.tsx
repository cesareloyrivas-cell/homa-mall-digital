import { Construction } from 'lucide-react';

interface Props {
  title: string;
  description?: string;
}

export default function ComingSoon({ title, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-5">
        <Construction className="w-8 h-8 text-amber-500" />
      </div>
      <h1 className="text-xl font-bold text-slate-900 mb-2">{title}</h1>
      <p className="text-sm text-slate-500 text-center max-w-sm">
        {description ?? 'Este módulo está en desarrollo y estará disponible muy pronto.'}
      </p>
      <span className="mt-5 text-xs font-semibold bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full">
        Próximamente
      </span>
    </div>
  );
}
