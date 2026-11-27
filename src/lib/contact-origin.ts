export const CONTACT_ORIGINS = ['Formulario', 'Censo', 'Familiar', 'Referido', 'Evento', 'Visita territorial', 'Llamada', 'WhatsApp', 'Otro'] as const;
export type ContactOrigin = typeof CONTACT_ORIGINS[number];
export interface ContactProvenance { contact_origin: ContactOrigin; origin_observation: string }
export interface CitizenRegistration extends ContactProvenance { name: string; phone: string; neighborhood: string; zone: string; notes: string }
export const CONTACT_PHONE_HELP = 'Celular: 10 dígitos, empieza en 3. Fijo: 10 dígitos con indicativo; en Huila, 608 + 7 dígitos. También puedes incluir +57.';
