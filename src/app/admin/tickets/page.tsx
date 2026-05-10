'use client';

import { useEffect, useMemo, useState } from 'react';
import { Ticket, TicketStatus, TICKET_TYPES } from '@/types';
import {
  getTickets, updateTicketStatus, addComment,
} from '@/lib/ticketService';
import { getCommerces } from '@/lib/commerceService';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import {
  Ticket as TicketIcon, Filter, ChevronDown, ChevronUp,
  MessageSquare, Send, Circle, AlertCircle, Loader2,
} from 'lucide-react';
import { Commerce } from '@/types';

const STATUS_OPTIONS: { value: TicketStatus; label: string; color: string }[] = [
  { value: 'nuevo', label: 'Nuevo', color: 'bg-slate-100 text-slate-700' },
  { value: 'recibido', label: 'Recibido', color: 'bg-blue-100 text-blue-700' },
  { value: 'en_revision', label: 'En revisión', color: 'bg-amber-100 text-amber-700' },
  { value: 'asignado', label: 'Asignado', color: 'bg-purple-100 text-purple-700' },
  { value: 'en_proceso', label: 'En proceso', color: 'bg-orange-100 text-orange-700' },
  { value: 'resuelto', label: 'Resuelto', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'cerrado', label: 'Cerrado', color: 'bg-slate-200 text-slate-500' },
];

const PRIORITY_COLORS: Record<string, string> = {
  baja: 'bg-slate-100 text-slate-600',
  media: 'bg-amber-100 text-amber-700',
  alta: 'bg-orange-100 text-orange-700',
  urgente: 'bg-red-100 text-red-700',
};

function StatusBadge({ status }: { status: TicketStatus }) {
  const cfg = STATUS_OPTIONS.find((s) => s.value === status);
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg?.color ?? 'bg-slate-100 text-slate-600'}`}>
      {cfg?.label ?? status}
    </span>
  );
}

export default function AdminTicketsPage() {
  const { usuario } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [commerces, setCommerces] = useState<Commerce[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<TicketStatus | ''>('');
  const [filterType, setFilterType] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  const [changingStatus, setChangingStatus] = useState<string | null>(null);

  async function load() {
    try {
      const [tks, cms] = await Promise.all([getTickets(), getCommerces()]);
      setTickets(tks);
      setCommerces(cms);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const commerceMap = useMemo(() => {
    const m: Record<string, string> = {};
    commerces.forEach((c) => { m[c.id] = c.name; });
    return m;
  }, [commerces]);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (filterStatus && t.status !== filterStatus) return false;
      if (filterType && t.type !== filterType) return false;
      return true;
    });
  }, [tickets, filterStatus, filterType]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    tickets.forEach((t) => { c[t.status] = (c[t.status] ?? 0) + 1; });
    return c;
  }, [tickets]);

  async function handleStatusChange(id: string, status: TicketStatus) {
    setChangingStatus(id);
    try {
      await updateTicketStatus(id, status);
      setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
      toast.success('Estado actualizado.');
    } catch {
      toast.error('No se pudo actualizar el estado.');
    } finally {
      setChangingStatus(null);
    }
  }

  async function handleComment(ticketId: string) {
    if (!commentText.trim() || !usuario) return;
    setSending(true);
    try {
      const comment = {
        body: commentText.trim(),
        createdBy: usuario.displayName ?? usuario.email ?? 'Admin',
        createdAt: new Date().toISOString(),
      };
      await addComment(ticketId, comment);
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? { ...t, comments: [...(t.comments ?? []), { ...comment, id: `${Date.now()}` }] }
            : t
        )
      );
      setCommentText('');
      toast.success('Comentario enviado.');
    } catch {
      toast.error('Error al enviar el comentario.');
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TicketIcon className="w-5 h-5 text-amber-500" /> Tickets de mantenimiento
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{tickets.length} solicitud{tickets.length !== 1 ? 'es' : ''} en total</p>
        </div>
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setFilterStatus('')}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
            filterStatus === '' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
          }`}
        >
          Todos ({tickets.length})
        </button>
        {STATUS_OPTIONS.filter((s) => s.value !== 'cerrado').map((s) => (
          <button
            key={s.value}
            onClick={() => setFilterStatus(s.value === filterStatus ? '' : s.value)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              filterStatus === s.value ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {s.label} {counts[s.value] ? `(${counts[s.value]})` : ''}
          </button>
        ))}
      </div>

      {/* Type filter */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-slate-400" />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
        >
          <option value="">Todos los tipos</option>
          {TICKET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        {(filterStatus || filterType) && (
          <button onClick={() => { setFilterStatus(''); setFilterType(''); }} className="text-xs text-amber-600 hover:text-amber-700 font-medium">
            Limpiar
          </button>
        )}
      </div>

      {/* Tickets list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No hay tickets con esos filtros.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => {
            const isExpanded = expanded === ticket.id;
            return (
              <div key={ticket.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Header row */}
                <button
                  className="w-full flex items-start gap-4 p-5 text-left hover:bg-slate-50 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : ticket.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-slate-900 text-sm">{ticket.title}</span>
                      <StatusBadge status={ticket.status} />
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_COLORS[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                      <span className="font-medium text-slate-600">{commerceMap[ticket.commerceId] ?? '—'}</span>
                      <span>·</span>
                      <span>{ticket.type}</span>
                      <span>·</span>
                      <span>{new Date(ticket.createdAt as unknown as string).toLocaleDateString('es-AR')}</span>
                      {(ticket.comments?.length ?? 0) > 0 && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {ticket.comments!.length}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-1" />}
                </button>

                {/* Expanded body */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 space-y-5">
                    {/* Description */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Descripción</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{ticket.description}</p>
                    </div>

                    {/* Change status */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Cambiar estado</p>
                      <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map((s) => (
                          <button
                            key={s.value}
                            onClick={() => handleStatusChange(ticket.id, s.value)}
                            disabled={ticket.status === s.value || changingStatus === ticket.id}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all disabled:opacity-50 ${
                              ticket.status === s.value
                                ? `${s.color} border-transparent ring-2 ring-offset-1 ring-slate-400`
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            {changingStatus === ticket.id && ticket.status !== s.value ? (
                              <Loader2 className="w-3 h-3 animate-spin inline" />
                            ) : s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comments */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                        Comentarios ({ticket.comments?.length ?? 0})
                      </p>
                      {(ticket.comments?.length ?? 0) > 0 && (
                        <div className="space-y-2 mb-3">
                          {ticket.comments!.map((c) => (
                            <div key={c.id} className="bg-slate-50 rounded-xl p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-semibold text-slate-700">{c.createdBy}</span>
                                <span className="text-xs text-slate-400">
                                  {new Date(c.createdAt).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600">{c.body}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Escribí un comentario..."
                          value={expanded === ticket.id ? commentText : ''}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleComment(ticket.id)}
                          className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <button
                          onClick={() => handleComment(ticket.id)}
                          disabled={sending || !commentText.trim()}
                          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl disabled:opacity-50 transition-colors"
                        >
                          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
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
