'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Ticket, TicketStatus, TICKET_TYPES } from '@/types';
import { getTicketsByCommerce, createTicket, addComment } from '@/lib/ticketService';
import toast from 'react-hot-toast';
import {
  Ticket as TicketIcon, Plus, X, ChevronDown, ChevronUp,
  MessageSquare, Send, Loader2, CheckCircle2,
} from 'lucide-react';

const STATUS_LABELS: Record<TicketStatus, string> = {
  nuevo: 'Nuevo',
  recibido: 'Recibido',
  en_revision: 'En revisión',
  asignado: 'Asignado',
  en_proceso: 'En proceso',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado',
};

const STATUS_COLORS: Record<TicketStatus, string> = {
  nuevo: 'bg-slate-100 text-slate-700',
  recibido: 'bg-blue-100 text-blue-700',
  en_revision: 'bg-amber-100 text-amber-700',
  asignado: 'bg-purple-100 text-purple-700',
  en_proceso: 'bg-orange-100 text-orange-700',
  resuelto: 'bg-emerald-100 text-emerald-700',
  cerrado: 'bg-slate-200 text-slate-500',
};

const PRIORITY_COLORS: Record<string, string> = {
  baja: 'bg-slate-100 text-slate-600',
  media: 'bg-amber-100 text-amber-700',
  alta: 'bg-orange-100 text-orange-700',
  urgente: 'bg-red-100 text-red-700',
};

const ACTIVE_STATUSES: TicketStatus[] = ['nuevo', 'recibido', 'en_revision', 'asignado', 'en_proceso'];

interface TicketRowProps {
  ticket: Ticket;
  expanded: string | null;
  setExpanded: (id: string | null) => void;
  commentText: string;
  setCommentText: (s: string) => void;
  sending: boolean;
  onComment: (id: string) => void;
}

function TicketRow({ ticket, expanded, setExpanded, commentText, setCommentText, sending, onComment }: TicketRowProps) {
  const isExpanded = expanded === ticket.id;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        className="w-full flex items-start gap-4 p-5 text-left hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(isExpanded ? null : ticket.id)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-slate-900 text-sm">{ticket.title}</span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[ticket.status]}`}>
              {STATUS_LABELS[ticket.status]}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_COLORS[ticket.priority]}`}>
              {ticket.priority}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{ticket.type}</span>
            <span>·</span>
            <span>{new Date(ticket.createdAt as unknown as string).toLocaleDateString('es-AR')}</span>
            {(ticket.comments?.length ?? 0) > 0 && (
              <><span>·</span>
                <span className="flex items-center gap-0.5">
                  <MessageSquare className="w-3 h-3" /> {ticket.comments!.length}
                </span>
              </>
            )}
          </div>
        </div>
        {isExpanded
          ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
          : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-1" />}
      </button>

      {isExpanded && (
        <div className="border-t border-slate-100 p-5 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">{ticket.description}</p>

          {(ticket.comments?.length ?? 0) > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Comentarios</p>
              {ticket.comments!.map((c) => (
                <div key={c.id} className="bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-700">{c.createdBy}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(c.createdAt).toLocaleString('es-AR', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{c.body}</p>
                </div>
              ))}
            </div>
          )}

          {ticket.status !== 'cerrado' && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Agregar comentario..."
                value={expanded === ticket.id ? commentText : ''}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onComment(ticket.id)}
                className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                onClick={() => onComment(ticket.id)}
                disabled={sending || !commentText.trim()}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl disabled:opacity-50 transition-colors"
              >
                {sending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ComercioTicketsPage() {
  const { usuario } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState(TICKET_TYPES[0]);
  const [priority, setPriority] = useState<'baja' | 'media' | 'alta' | 'urgente'>('media');
  const [submitting, setSubmitting] = useState(false);

  const commerceId = usuario?.commerceId ?? '';

  async function load() {
    if (!commerceId) { setLoading(false); return; }
    try {
      const tks = await getTicketsByCommerce(commerceId);
      setTickets(tks);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [commerceId]);

  const active = useMemo(() => tickets.filter((t) => ACTIVE_STATUSES.includes(t.status)), [tickets]);
  const closed = useMemo(() => tickets.filter((t) => !ACTIVE_STATUSES.includes(t.status)), [tickets]);

  function resetForm() {
    setTitle(''); setDescription(''); setType(TICKET_TYPES[0]); setPriority('media'); setShowForm(false);
  }

  async function handleSubmit() {
    if (!title.trim() || !description.trim() || !usuario) return;
    setSubmitting(true);
    try {
      const id = await createTicket({
        commerceId,
        title: title.trim(),
        description: description.trim(),
        type,
        priority,
        status: 'nuevo',
        createdBy: usuario.displayName ?? usuario.email ?? 'Propietario',
      });
      const now = new Date().toISOString();
      setTickets((prev) => [{
        id, tenantId: 'homa_mall', commerceId, title: title.trim(),
        description: description.trim(), type, priority, status: 'nuevo',
        createdBy: usuario.displayName ?? usuario.email ?? 'Propietario',
        createdAt: now, updatedAt: now, comments: [],
      }, ...prev]);
      resetForm();
      toast.success('Ticket enviado. El equipo del mall lo revisará pronto.');
    } catch { toast.error('Error al crear el ticket.'); }
    finally { setSubmitting(false); }
  }

  async function handleComment(ticketId: string) {
    if (!commentText.trim() || !usuario) return;
    setSending(true);
    try {
      const comment = {
        body: commentText.trim(),
        createdBy: usuario.displayName ?? usuario.email ?? 'Propietario',
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
    } catch { toast.error('Error al enviar el comentario.'); }
    finally { setSending(false); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TicketIcon className="w-5 h-5 text-amber-500" /> Tickets de mantenimiento
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Reportá problemas o solicitudes al equipo del mall.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Nuevo ticket
          </button>
        )}
      </div>

      {/* New ticket form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Nueva solicitud</h2>
            <button onClick={resetForm} className="p-1.5 hover:bg-slate-100 rounded-lg">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tipo de solicitud</label>
              <select value={type} onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white">
                {TICKET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Título del problema</label>
              <input type="text" placeholder="Describí brevemente el problema..." value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Descripción detallada</label>
              <textarea placeholder="Describí el problema: cuándo ocurre, dónde exactamente..." value={description}
                onChange={(e) => setDescription(e.target.value)} rows={3}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Prioridad</label>
              <div className="flex gap-2">
                {(['baja', 'media', 'alta', 'urgente'] as const).map((p) => (
                  <button key={p} onClick={() => setPriority(p)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors capitalize ${
                      priority === p
                        ? `${PRIORITY_COLORS[p]} border-transparent ring-2 ring-offset-1 ring-slate-300`
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}>{p}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleSubmit} disabled={submitting || !title.trim() || !description.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm rounded-xl disabled:opacity-50 transition-colors">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : 'Enviar ticket'}
              </button>
              <button onClick={resetForm}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tickets list */}
      {active.length === 0 && closed.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto mb-3" />
          <p className="font-medium text-slate-600">No tenés tickets abiertos</p>
          <p className="text-sm text-slate-400 mt-1">¿Necesitás reportar algo? Creá una nueva solicitud.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Activos ({active.length})</h2>
              <div className="space-y-3">
                {active.map((ticket) => (
                  <TicketRow key={ticket.id} ticket={ticket} expanded={expanded} setExpanded={setExpanded}
                    commentText={commentText} setCommentText={setCommentText} sending={sending} onComment={handleComment} />
                ))}
              </div>
            </div>
          )}
          {closed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-500 mb-3">Historial ({closed.length})</h2>
              <div className="space-y-3 opacity-75">
                {closed.map((ticket) => (
                  <TicketRow key={ticket.id} ticket={ticket} expanded={expanded} setExpanded={setExpanded}
                    commentText={commentText} setCommentText={setCommentText} sending={sending} onComment={handleComment} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
