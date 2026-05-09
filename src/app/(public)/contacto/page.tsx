'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Globe, MessageCircle, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactoPage() {
  const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' });
  const [sent, setSent] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.mensaje) {
      toast.error('Completá los campos obligatorios.');
      return;
    }
    // In production: send to Firebase or email service
    setSent(true);
    toast.success('¡Mensaje enviado! Te contactaremos pronto.');
  }

  return (
    <>
      <section className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Contacto
          </h1>
          <p className="text-slate-400 text-base max-w-xl">
            Escribinos para consultas generales, alquiler de locales o información comercial.
          </p>
        </div>
      </section>

      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Info */}
          <div className="space-y-5">
            <h2 className="font-bold text-slate-900 text-lg">Información de contacto</h2>
            {[
              { icon: MapPin, label: 'Dirección', value: 'Av. San Martín 1200, Carlos Paz, Córdoba' },
              { icon: Phone, label: 'Teléfono', value: '+54 9 3541 000000', href: 'tel:+5493541000000' },
              { icon: Mail, label: 'Email', value: 'info@homamall.com.ar', href: 'mailto:info@homamall.com.ar' },
              { icon: Globe, label: 'Instagram', value: '@homamall', href: 'https://instagram.com/homamall' },
              { icon: MessageCircle, label: 'WhatsApp', value: '+54 9 3541 000000', href: 'https://wa.me/5493541000000' },
            ].map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">{label}</div>
                  {href ? (
                    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="text-sm text-slate-900 hover:text-amber-600 transition-colors">
                      {value}
                    </a>
                  ) : (
                    <div className="text-sm text-slate-900">{value}</div>
                  )}
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-slate-100">
              <h3 className="font-semibold text-slate-900 mb-2 text-sm">Horario de atención</h3>
              <p className="text-sm text-slate-600">Lunes a Viernes: 09:00 – 18:00 hs</p>
              <p className="text-sm text-slate-600">Sábados: 09:00 – 13:00 hs</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {sent ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-10 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="font-bold text-emerald-900 text-xl mb-2">¡Mensaje enviado!</h3>
                <p className="text-emerald-700 text-sm">Nos pondremos en contacto a la brevedad.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                <h2 className="font-bold text-slate-900 text-lg mb-2">Envianos un mensaje</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Nombre *</label>
                    <input name="nombre" value={form.nombre} onChange={handleChange} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="Tu nombre" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Email *</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="tu@email.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Asunto</label>
                  <select name="asunto" value={form.asunto} onChange={handleChange} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white">
                    <option value="">Seleccioná un tema</option>
                    <option value="consulta">Consulta general</option>
                    <option value="alquilar">Quiero alquilar un local</option>
                    <option value="proveedor">Quiero ser proveedor</option>
                    <option value="publicidad">Publicidad y sponsorship</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Mensaje *</label>
                  <textarea name="mensaje" value={form.mensaje} onChange={handleChange} rows={5} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" placeholder="Escribí tu consulta..." />
                </div>
                <button type="submit" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-8 py-3 rounded-xl transition-colors text-sm">
                  <Send className="w-4 h-4" /> Enviar mensaje
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
