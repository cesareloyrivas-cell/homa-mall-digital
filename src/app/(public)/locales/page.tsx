'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Store } from 'lucide-react';
import { COMMERCE_CATEGORIES } from '@/types';
import { Commerce } from '@/types';
import { getCommerces } from '@/lib/commerceService';
import CommerceCard from '@/components/ui/CommerceCard';

export default function LocalesPage() {
  const [commerces, setCommerces] = useState<Commerce[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    getCommerces()
      .then(setCommerces)
      .finally(() => setLoadingData(false));
  }, []);

  const filtered = useMemo(
    () =>
      commerces.filter((c) => {
        if (c.publicStatus === 'no_publicado') return false;
        const matchSearch =
          !search ||
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.description?.toLowerCase().includes(search.toLowerCase()) ||
          c.category.toLowerCase().includes(search.toLowerCase());
        const matchCategory = !selectedCategory || c.category === selectedCategory;
        return matchSearch && matchCategory;
      }),
    [commerces, search, selectedCategory]
  );

  const categories = useMemo(() => {
    const used = new Set(commerces.map((c) => c.category));
    return COMMERCE_CATEGORIES.filter((cat) => used.has(cat));
  }, [commerces]);

  return (
    <>
      <section className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <Store className="w-6 h-6 text-amber-400" />
            <span className="text-amber-400 font-semibold text-sm uppercase tracking-wider">
              Nuestros locales
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Todos los comercios de <span className="text-amber-400">Mall Digital</span>
          </h1>
          <p className="text-slate-400 text-base max-w-xl">
            Explorá la variedad de locales, servicios y gastronomía que tenemos para vos.
          </p>
        </div>
      </section>

      <section className="bg-white border-b border-slate-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar comercio, rubro..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-9 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 appearance-none bg-white"
              >
                <option value="">Todos los rubros</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('')}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === ''
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loadingData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-slate-500">
                {filtered.length === 0
                  ? 'Sin resultados'
                  : `${filtered.length} local${filtered.length !== 1 ? 'es' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`}
              </p>
              {(search || selectedCategory) && (
                <button
                  onClick={() => { setSearch(''); setSelectedCategory(''); }}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <Store className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No encontramos locales con esos criterios.</p>
                <p className="text-slate-400 text-sm mt-1">Probá con otra búsqueda o categoría.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((commerce) => (
                  <CommerceCard key={commerce.id} commerce={commerce} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
