import { BusinessModel } from './businessModels';

export interface DocumentTemplate {
  type: string;
  label: string;
  description: string;
  required: boolean;
  acceptsExpiry: boolean; // si tiene fecha de vencimiento
}

export const DOCUMENT_TEMPLATES: Record<BusinessModel, DocumentTemplate[]> = {
  gastronomia: [
    { type: 'habilitacion_municipal', label: 'Habilitación municipal', description: 'Habilitación comercial emitida por la municipalidad.', required: true, acceptsExpiry: true },
    { type: 'cert_bromatologico', label: 'Certificado bromatológico', description: 'Certificado de aptitud alimentaria emitido por Bromatología.', required: true, acceptsExpiry: true },
    { type: 'cert_bomberos', label: 'Certificado de bomberos', description: 'Constancia de inspección de condiciones de seguridad contra incendio.', required: true, acceptsExpiry: true },
    { type: 'carnet_manipulacion', label: 'Carnet de manipulación de alimentos', description: 'Carnet vigente del personal que manipula alimentos.', required: true, acceptsExpiry: true },
    { type: 'art', label: 'ART (Accidentes de Trabajo)', description: 'Póliza de Aseguradora de Riesgos del Trabajo vigente.', required: true, acceptsExpiry: true },
    { type: 'seguro_incendio', label: 'Seguro contra incendio', description: 'Póliza de seguro contra incendio del local.', required: true, acceptsExpiry: true },
    { type: 'registro_senasa', label: 'Registro SENASA', description: 'Habilitación SENASA para comercialización de alimentos (si aplica).', required: false, acceptsExpiry: true },
    { type: 'estatuto_contrato', label: 'Estatuto / Contrato social', description: 'Documento constitutivo de la empresa o razón social.', required: false, acceptsExpiry: false },
  ],

  indumentaria: [
    { type: 'habilitacion_municipal', label: 'Habilitación municipal', description: 'Habilitación comercial emitida por la municipalidad.', required: true, acceptsExpiry: true },
    { type: 'cert_bomberos', label: 'Certificado de bomberos', description: 'Constancia de inspección de condiciones de seguridad contra incendio.', required: true, acceptsExpiry: true },
    { type: 'art', label: 'ART (Accidentes de Trabajo)', description: 'Póliza de Aseguradora de Riesgos del Trabajo vigente.', required: true, acceptsExpiry: true },
    { type: 'seguro_incendio', label: 'Seguro contra incendio', description: 'Póliza de seguro contra incendio del local.', required: true, acceptsExpiry: true },
    { type: 'estatuto_contrato', label: 'Estatuto / Contrato social', description: 'Documento constitutivo de la empresa o razón social.', required: false, acceptsExpiry: false },
    { type: 'inscripcion_afip', label: 'Inscripción AFIP', description: 'Constancia de inscripción en AFIP (IVA / Monotributo).', required: true, acceptsExpiry: false },
  ],

  salud_estetica: [
    { type: 'habilitacion_municipal', label: 'Habilitación municipal', description: 'Habilitación comercial emitida por la municipalidad.', required: true, acceptsExpiry: true },
    { type: 'habilitacion_sanitaria', label: 'Habilitación sanitaria', description: 'Habilitación del Ministerio de Salud para prestación de servicios sanitarios.', required: true, acceptsExpiry: true },
    { type: 'cert_bomberos', label: 'Certificado de bomberos', description: 'Constancia de inspección de condiciones de seguridad contra incendio.', required: true, acceptsExpiry: true },
    { type: 'matricula_profesional', label: 'Matrícula profesional del titular', description: 'Matrícula habilitante del profesional responsable del local.', required: true, acceptsExpiry: true },
    { type: 'seguro_resp_civil', label: 'Seguro de responsabilidad civil', description: 'Póliza de responsabilidad civil profesional.', required: true, acceptsExpiry: true },
    { type: 'art', label: 'ART (Accidentes de Trabajo)', description: 'Póliza de Aseguradora de Riesgos del Trabajo vigente.', required: true, acceptsExpiry: true },
    { type: 'seguro_incendio', label: 'Seguro contra incendio', description: 'Póliza de seguro contra incendio del local.', required: true, acceptsExpiry: true },
    { type: 'inscripcion_afip', label: 'Inscripción AFIP', description: 'Constancia de inscripción en AFIP (IVA / Monotributo).', required: true, acceptsExpiry: false },
  ],

  tecnologia: [
    { type: 'habilitacion_municipal', label: 'Habilitación municipal', description: 'Habilitación comercial emitida por la municipalidad.', required: true, acceptsExpiry: true },
    { type: 'cert_bomberos', label: 'Certificado de bomberos', description: 'Constancia de inspección de condiciones de seguridad contra incendio.', required: true, acceptsExpiry: true },
    { type: 'art', label: 'ART (Accidentes de Trabajo)', description: 'Póliza de Aseguradora de Riesgos del Trabajo vigente.', required: true, acceptsExpiry: true },
    { type: 'seguro_incendio', label: 'Seguro contra incendio', description: 'Póliza de seguro contra incendio del local.', required: true, acceptsExpiry: true },
    { type: 'inscripcion_afip', label: 'Inscripción AFIP', description: 'Constancia de inscripción en AFIP (IVA / Monotributo).', required: true, acceptsExpiry: false },
    { type: 'garantia_servicio', label: 'Certificación de service autorizado', description: 'Documentación que acredita servicio técnico autorizado (si aplica).', required: false, acceptsExpiry: false },
  ],

  entretenimiento: [
    { type: 'habilitacion_municipal', label: 'Habilitación municipal', description: 'Habilitación comercial emitida por la municipalidad.', required: true, acceptsExpiry: true },
    { type: 'habilitacion_espectaculos', label: 'Habilitación de espectáculos / recreación', description: 'Permiso municipal para actividades de entretenimiento y recreación.', required: true, acceptsExpiry: true },
    { type: 'cert_bomberos', label: 'Certificado de bomberos', description: 'Constancia de inspección de condiciones de seguridad contra incendio.', required: true, acceptsExpiry: true },
    { type: 'cert_capacidad', label: 'Certificado de capacidad máxima', description: 'Aforo máximo permitido emitido por la autoridad competente.', required: true, acceptsExpiry: true },
    { type: 'seguro_resp_civil', label: 'Seguro de responsabilidad civil', description: 'Póliza de responsabilidad civil para actividades con público.', required: true, acceptsExpiry: true },
    { type: 'art', label: 'ART (Accidentes de Trabajo)', description: 'Póliza de Aseguradora de Riesgos del Trabajo vigente.', required: true, acceptsExpiry: true },
    { type: 'seguro_incendio', label: 'Seguro contra incendio', description: 'Póliza de seguro contra incendio del local.', required: true, acceptsExpiry: true },
    { type: 'inscripcion_afip', label: 'Inscripción AFIP', description: 'Constancia de inscripción en AFIP (IVA / Monotributo).', required: true, acceptsExpiry: false },
  ],

  servicios_profesionales: [
    { type: 'habilitacion_municipal', label: 'Habilitación municipal', description: 'Habilitación comercial emitida por la municipalidad.', required: true, acceptsExpiry: true },
    { type: 'cert_bomberos', label: 'Certificado de bomberos', description: 'Constancia de inspección de condiciones de seguridad contra incendio.', required: true, acceptsExpiry: true },
    { type: 'matricula_profesional', label: 'Matrícula / Título profesional', description: 'Habilitación profesional del titular o socio responsable.', required: true, acceptsExpiry: false },
    { type: 'seguro_resp_civil', label: 'Seguro de responsabilidad civil', description: 'Póliza de responsabilidad civil profesional.', required: true, acceptsExpiry: true },
    { type: 'art', label: 'ART (Accidentes de Trabajo)', description: 'Póliza de Aseguradora de Riesgos del Trabajo vigente.', required: true, acceptsExpiry: true },
    { type: 'inscripcion_afip', label: 'Inscripción AFIP', description: 'Constancia de inscripción en AFIP (IVA / Monotributo).', required: true, acceptsExpiry: false },
    { type: 'estatuto_contrato', label: 'Estatuto / Contrato social', description: 'Documento constitutivo de la empresa o razón social.', required: false, acceptsExpiry: false },
  ],

  productos: [
    { type: 'habilitacion_municipal', label: 'Habilitación municipal', description: 'Habilitación comercial emitida por la municipalidad.', required: true, acceptsExpiry: true },
    { type: 'cert_bomberos', label: 'Certificado de bomberos', description: 'Constancia de inspección de condiciones de seguridad contra incendio.', required: true, acceptsExpiry: true },
    { type: 'art', label: 'ART (Accidentes de Trabajo)', description: 'Póliza de Aseguradora de Riesgos del Trabajo vigente.', required: true, acceptsExpiry: true },
    { type: 'seguro_incendio', label: 'Seguro contra incendio', description: 'Póliza de seguro contra incendio del local.', required: true, acceptsExpiry: true },
    { type: 'inscripcion_afip', label: 'Inscripción AFIP', description: 'Constancia de inscripción en AFIP (IVA / Monotributo).', required: true, acceptsExpiry: false },
    { type: 'estatuto_contrato', label: 'Estatuto / Contrato social', description: 'Documento constitutivo de la empresa o razón social.', required: false, acceptsExpiry: false },
  ],

  general: [
    { type: 'habilitacion_municipal', label: 'Habilitación municipal', description: 'Habilitación comercial emitida por la municipalidad.', required: true, acceptsExpiry: true },
    { type: 'cert_bomberos', label: 'Certificado de bomberos', description: 'Constancia de inspección de condiciones de seguridad contra incendio.', required: true, acceptsExpiry: true },
    { type: 'art', label: 'ART (Accidentes de Trabajo)', description: 'Póliza de Aseguradora de Riesgos del Trabajo vigente.', required: true, acceptsExpiry: true },
    { type: 'inscripcion_afip', label: 'Inscripción AFIP', description: 'Constancia de inscripción en AFIP (IVA / Monotributo).', required: true, acceptsExpiry: false },
  ],
};

export function getTemplateForModel(model: BusinessModel): DocumentTemplate[] {
  return DOCUMENT_TEMPLATES[model] ?? DOCUMENT_TEMPLATES.general;
}

export function getRequiredTypes(model: BusinessModel): string[] {
  return getTemplateForModel(model).filter((t) => t.required).map((t) => t.type);
}
