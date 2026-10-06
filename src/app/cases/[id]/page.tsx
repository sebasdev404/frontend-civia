import React from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, MessageSquare, AlertTriangle, Send, Share2 } from 'lucide-react';

export default function CaseDetailPage({ params }: { params: { id: string } }) {
  // En una app real, aquí haríamos fetch al backend usando params.id
  const caseId = params.id;

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-start">
        <div>
          <Link href="/cases" className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium mb-4 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Volver a la Bandeja
          </Link>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900">Caso {caseId}</h1>
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
              Prioridad Alta
            </span>
          </div>
          <div className="flex items-center text-slate-500 text-sm space-x-4">
            <span className="flex items-center"><Clock size={14} className="mr-1" /> Hace 2 horas</span>
            <span className="flex items-center"><MapPin size={14} className="mr-1" /> Barrio Los Pinos</span>
            <span className="flex items-center"><MessageSquare size={14} className="mr-1" /> Origen: Facebook</span>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors">
            <Share2 size={18} />
            <span>Compartir</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors">
            <span>Marcar Resuelto</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Detalles del Reporte */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Contenido Original</h2>
            <div className="bg-slate-50 p-4 rounded-lg text-slate-800 text-lg border border-slate-100 italic">
              "Llevamos 3 semanas sin agua en el barrio Los Pinos, la alcaldía no hace nada y los recibos siguen llegando carísimos. Si no solucionan bloquearemos la vía principal."
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <AlertTriangle className="text-amber-500 mr-2" /> Análisis de Inteligencia Artificial
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs text-slate-400 font-bold uppercase">Categoría Detectada</p>
                <p className="font-semibold text-slate-700">Servicios Públicos</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs text-slate-400 font-bold uppercase">Sentimiento Principal</p>
                <p className="font-semibold text-red-600">Indignación</p>
              </div>
            </div>

            <h3 className="font-bold text-slate-700 mb-2">Proyección de Impacto Político</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="bg-emerald-200 text-emerald-800 rounded px-2 py-0.5 text-xs font-bold mr-3 mt-0.5">Si se resuelve</div>
                <span className="text-emerald-900">Alivia tensión comunitaria inmediata y previene bloqueo de vía arterial, mejorando la percepción de respuesta rápida de la administración.</span>
              </li>
              <li className="flex items-start p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="bg-red-200 text-red-800 rounded px-2 py-0.5 text-xs font-bold mr-3 mt-0.5">Si se ignora</div>
                <span className="text-red-900">Riesgo inminente de protesta social con cubrimiento mediático; capitalización política por parte de la oposición local.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Columna Derecha: Acciones y Mapa */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Centro de Acción</h2>
            <div className="space-y-3">
              <button className="w-full flex justify-between items-center px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors font-medium">
                <span>Notificar a Secretaría de Servicios</span>
                <Send size={16} />
              </button>
              <button className="w-full flex justify-between items-center px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors font-medium">
                <span>Responder en Facebook</span>
                <Send size={16} />
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-100">
              <label className="block text-sm font-bold text-slate-700 mb-2">Nota Interna</label>
              <textarea 
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" 
                rows={4} 
                placeholder="Añade un comentario interno sobre la gestión del caso..."
              ></textarea>
              <button className="mt-2 w-full py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm font-bold">
                Guardar Nota
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
