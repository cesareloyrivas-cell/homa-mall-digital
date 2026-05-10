import {
  collection, doc, addDoc, updateDoc, getDoc, getDocs,
  serverTimestamp, query, where, orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { Ticket, TicketComment, TicketStatus } from '@/types';

const TENANT_ID = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID ?? 'homa_mall';
const COLL = 'tickets';

export async function getTickets(): Promise<Ticket[]> {
  const q = query(
    collection(db, COLL),
    where('tenantId', '==', TENANT_ID),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Ticket));
}

export async function getTicketsByCommerce(commerceId: string): Promise<Ticket[]> {
  const q = query(
    collection(db, COLL),
    where('tenantId', '==', TENANT_ID),
    where('commerceId', '==', commerceId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Ticket));
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  const snap = await getDoc(doc(db, COLL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Ticket;
}

export async function createTicket(
  data: Omit<Ticket, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'comments'>
): Promise<string> {
  const ref = await addDoc(collection(db, COLL), {
    ...data,
    tenantId: TENANT_ID,
    status: 'nuevo',
    comments: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTicketStatus(id: string, status: TicketStatus, assignedTo?: string): Promise<void> {
  const payload: Record<string, unknown> = { status, updatedAt: serverTimestamp() };
  if (assignedTo !== undefined) payload.assignedTo = assignedTo;
  await updateDoc(doc(db, COLL, id), payload);
}

export async function addComment(id: string, comment: Omit<TicketComment, 'id'>): Promise<void> {
  const ticketRef = doc(db, COLL, id);
  const snap = await getDoc(ticketRef);
  if (!snap.exists()) return;
  const existing: TicketComment[] = (snap.data().comments ?? []);
  const newComment: TicketComment = {
    ...comment,
    id: `${Date.now()}`,
  };
  await updateDoc(ticketRef, {
    comments: [...existing, newComment],
    updatedAt: serverTimestamp(),
  });
}
