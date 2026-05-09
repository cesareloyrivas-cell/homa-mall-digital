'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getCommunicationsForCommerce, getReadsByCommerce, markAsRead, markAsConfirmed } from '@/lib/communicationService';
import { getCommerces } from '@/lib/commerceService';
import { Communication, CommunicationPriority, CommunicationRead } from '@/types';
import {
  Megaphone, Info, Bell, AlertTriangle, AlertCircle, ChevronDown, ChevronUp, CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PRIORITY_CONFIG: Record<CommunicationPriority, { label: string; border: string; bg: string; badge: string; icon: typeof Info }> = {
  baja: { label: 'Baja', border: 'border-slate-200', bg: 'bg-white', badge: 'bg-slate-100 text-slate-600', icon: Info },
  media: { label: 'Media', border: 'border-blue-200', bg: 'bg-white', badge: 'bg-blue-100 text-blue-700', icon: Bell },
  alta: { label: 'Alta', border: 'border-amber-200', bg: 'bg-amber-50/30', badge: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
  critica: { label: 'Crítica', border: 'border-red-200', bg: 'bg-red-50/30', badge: 'bg-red-100 text-red-700', icon: AlertCircle },
};

export default function ComercioComunicadosPage() {
  const { usuario } = useAuth();
  const [comms, setComms] = useState<Communication[]>([]);
  const [reads, setReads] = useState<CommunicationRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const commerceId = usuario?.commerceId ?? '';

  useEffect(() => {
    if (!commerceId) { setLoading(false); return; }

    async function load() {
      try {
        const [allCommerces, myReads] = await Promise.all([
          getCommerces(),
          getReadsByCommerce(commerceId),
        ]);
        const mine = allCommerces.find(c => c.id === commerceId);
        const hasIncompleteDocs = mine?.documentationStatus !== 'completa';

        const myComms = await getCommunicationsForCommerce(commerceId, {
          category: mine?.category,
          hasIncompleteDocs,
        });

        setComms(myComms);
        setReads(myReads);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [commerceId]);

  function getRead(commId: string) {
    return reads.find(r => r.communicationId === commId);
  }

  async function handleOpen(comm: Communication) {
    const isOpen = expanded === comm.id;
    setExpanded(isOpen ? null : comm.id);

    if (!isOpen && !getRead(comm.id)?.readAt && usuario && commerceId) {
      try {
        await markAsRead(comm.id, commerceId, usuario.uid);
        setReads(prev => {
          const existing = prev.find(r => r.communicationId === comm.id);
          if (existing) return prev.map(r => r.communicationId === comm.id ? { ...r, readAt: new Date().toISOString() } : r);
          return [...prev, {
            id: `${comm.id}_${commerceId}`,
            communicationId: comm.id,
            commerceId,
            userId: usuario.uid,
            tenantId: 'homa_mall',
            readAt: new Date().toISOString(),
          }];
        });
      } catch { /* silent */ }
    }
  }

  async function handleConfirm(comm: Communication) {
    if (!usuario || !commerceId) return;
    setConfirming(comm.id);
    try {
      await markAsConfirmed(comm.id, commerceId, usuario.uid);
      setReads(prev => prev.map(r =>
        r.communicationId === comm.id ? { ...r, confirmedAt: new Date().toISOString() } : r
      ));
      toast.success('Lectura confirmada.');
    } catch {
      toast.error('No se pudo confirmar.');
    } finally {
      setConfirming(null);
    }
  }

  const unreadCount = comms.filter(c => !getRead(c.id)?.readAt).length;

  if (!commerceId) {
    return (
      <div className="p-6 text-center text-slate-500 text-sm">
        Tu local no está vinculado. Contactá a la administración.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Comunicados</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {unreadCount > 0
            ? `${unreadCount} comunicado${unreadCount > 1 ? 's' : ''} sin leer`
            : 'Todo al día'}
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : comms.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No hay comunicados por ahora.</p>
          <p className="text-slate-400 text-sm mt-1">Cuando la administración envíe un aviso, aparecerá aquí.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comms.map(comm => {
            const pConf = PRIORITY_CONFIG[comm.priority];
            const PIcon = pConf.icon;
            const read = getRead(comm.id);
            const isRead = !!read?.readAt;
            const isConfirmed = !!read?.confirmedAt;
            const isOpen = expanded === comm.id;

            return (
              <div
                key={comm.id}
                className={`rounded-2xl border shadow-sm overflow-hidden ${pConf.border} ${pConf.bg} ${!isRead ? 'ring-2 ring-amber-400/30' : ''}`}
              >
                <button
                  className="w-full text-left px-5 py-4 flex items-center gap-4"
                  onClick={() => handleOpen(comm)}
                >
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${pConf.badge}`}>
                    <PIcon className="w-3 h-3" /> {pConf.label}
                  </span>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      {!isRead && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      )}
                      <p className={`font-semibold truncate ${isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                        {comm.title}
                      </p>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(comm.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {isRead && <span className="ml-2 text-emerald-600">· Leído</span>}
                      {isConfirmed && <span className="ml-1 text-emerald-600">· Confirmado</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {comm.requiresReadConfirmation && !isConfirmed && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                        Pendiente de confirmar
                      </span>
                    )}
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-slate-100">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mt-4">{comm.body}</p>

                    {comm.responseDeadline && (
                      <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        Fecha límite: {new Date(comm.responseDeadline).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}

                    {comm.requiresReadConfirmation && !isConfirmed && (
                      <button
                        onClick={() => handleConfirm(comm)}
                        disabled={confirming === comm.id}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {confirming === comm.id ? 'Confirmando...' : 'Confirmar lectura'}
                      </button>
                    )}

                    {isConfirmed && (
                      <div className="mt-4 inline-flex items-center gap-2 text-sm text-emerald-600 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Lectura confirmada
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
