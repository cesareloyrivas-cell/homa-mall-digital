export type UserRole = 'super_admin' | 'admin_mall' | 'propietario_comercio' | 'operador' | 'proveedor';

export type PublicStatus = 'publicado' | 'verificado' | 'protegido' | 'destacado' | 'no_publicado';

export type InternalStatus =
  | 'pendiente_alta'
  | 'alta_iniciada'
  | 'ficha_incompleta'
  | 'legajo_iniciado'
  | 'documentacion_parcial'
  | 'documentacion_completa'
  | 'cobertura_informada'
  | 'cobertura_revisada'
  | 'vencimientos_al_dia'
  | 'observado'
  | 'pendiente_critico';

export type DocumentStatus = 'pendiente' | 'presentado' | 'observado' | 'aprobado' | 'vencido';

export type TicketStatus = 'nuevo' | 'recibido' | 'en_revision' | 'asignado' | 'en_proceso' | 'resuelto' | 'cerrado';

export type PromotionStatus = 'borrador' | 'pendiente_aprobacion' | 'aprobada' | 'rechazada' | 'vencida';

export type CommunicationPriority = 'baja' | 'media' | 'alta' | 'critica';

// ─── Tenant ───────────────────────────────────────────────────────────────────

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  domain?: string;
  location?: string;
  whatsapp?: string;
  email?: string;
  instagram?: string;
  status: 'activo' | 'inactivo' | 'suspendido';
  createdAt: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface AppUser {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  tenantId?: string;
  commerceId?: string;
  createdAt?: string;
  isActive?: boolean;
}

// ─── Commerce ─────────────────────────────────────────────────────────────────

export interface Commerce {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  legalName?: string;
  cuit?: string;
  category: string;
  subcategory?: string;
  locationCode?: string;
  description?: string;
  logoUrl?: string;
  photos?: string[];
  whatsapp?: string;
  instagram?: string;
  email?: string;
  phone?: string;
  schedule?: string;
  publicStatus: PublicStatus;
  internalStatus: InternalStatus;
  documentationStatus: 'completa' | 'parcial' | 'pendiente';
  protectionStatus: 'protegido' | 'parcial' | 'sin_cobertura';
  isFeatured?: boolean;
  openingDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Document ─────────────────────────────────────────────────────────────────

export interface CommercDocument {
  id: string;
  tenantId: string;
  commerceId: string;
  type: string;
  fileUrl?: string;
  status: DocumentStatus;
  issuedAt?: string;
  expiresAt?: string;
  notes?: string;
  uploadedBy: string;
  createdAt: string;
}

// ─── Communication ────────────────────────────────────────────────────────────

export interface Communication {
  id: string;
  tenantId: string;
  title: string;
  body: string;
  priority: CommunicationPriority;
  targetType: 'all' | 'category' | 'specific' | 'pending_docs';
  targetCommerceIds?: string[];
  targetCategories?: string[];
  requiresReadConfirmation: boolean;
  attachments?: string[];
  createdBy: string;
  createdAt: string;
  responseDeadline?: string;
}

export interface CommunicationRead {
  id: string;
  communicationId: string;
  tenantId: string;
  commerceId: string;
  userId: string;
  readAt?: string;
  confirmedAt?: string;
}

// ─── Promotion ────────────────────────────────────────────────────────────────

export interface Promotion {
  id: string;
  tenantId: string;
  commerceId: string;
  commerceName?: string;
  title: string;
  description: string;
  imageUrl?: string;
  startsAt: string;
  endsAt: string;
  conditions?: string;
  status: PromotionStatus;
  isFeatured: boolean;
  createdAt: string;
}

// ─── Ticket ───────────────────────────────────────────────────────────────────

export interface Ticket {
  id: string;
  tenantId: string;
  commerceId: string;
  title: string;
  description: string;
  type: string;
  status: TicketStatus;
  priority: 'baja' | 'media' | 'alta' | 'urgente';
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  comments?: TicketComment[];
}

export interface TicketComment {
  id: string;
  body: string;
  createdBy: string;
  createdAt: string;
}

// ─── Coverage ─────────────────────────────────────────────────────────────────

export interface Coverage {
  id: string;
  tenantId: string;
  commerceId: string;
  type: string;
  insurer: string;
  policyNumber?: string;
  startsAt: string;
  expiresAt: string;
  fileUrl?: string;
  status: 'informada' | 'revisada' | 'vencida' | 'pendiente';
  reviewedBy?: string;
  notes?: string;
}

// ─── Mock data helper ─────────────────────────────────────────────────────────

export const COMMERCE_CATEGORIES = [
  'Gastronomía',
  'Indumentaria',
  'Calzado',
  'Tecnología',
  'Salud y Bienestar',
  'Hogar y Deco',
  'Servicios',
  'Deportes',
  'Librería y Papelería',
  'Joyería y Accesorios',
  'Farmacia',
  'Supermercado',
  'Entretenimiento',
  'Belleza y Estética',
  'Otro',
];

export const TICKET_TYPES = [
  'Electricidad',
  'Agua',
  'Limpieza',
  'Seguridad',
  'Aire acondicionado',
  'Cartelería',
  'Espacios comunes',
  'Acceso',
  'Baños',
  'Otro',
];
