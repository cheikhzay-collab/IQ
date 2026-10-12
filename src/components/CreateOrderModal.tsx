'use client';
import React, { useState } from 'react';
import {
  X, Send, CheckCircle2, Package, MapPin, Phone,
  User, DollarSign, ShieldCheck, Printer, ArrowRight,
  ExternalLink, Sparkles, AlertCircle
} from 'lucide-react';
import type { Lang } from '@/app/page';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: Lang;
  onSuccess: () => void;
}

const DISTRICTS = [
  { name: 'Casablanca', name_ar: 'الدار البيضاء' },
  { name: 'Rabat', name_ar: 'الرباط' },
  { name: 'Marrakech', name_ar: 'مراكش' },
  { name: 'Tanger', name_ar: 'طنجة' },
  { name: 'Fès', name_ar: 'فاس' },
  { name: 'Agadir', name_ar: 'أكادير' },
  { name: 'Meknès', name_ar: 'مكناس' },
  { name: 'Oujda', name_ar: 'وجدة' },
  { name: 'Kénitra', name_ar: 'القنيطرة' },
  { name: 'Tétouan', name_ar: 'تطوان' },
  { name: 'Safi', name_ar: 'آسفي' },
  { name: 'Mohammédia', name_ar: 'المحمدية' },
  { name: 'El Jadida', name_ar: 'الجديدة' },
  { name: 'Nador', name_ar: 'الناظور' },
  { name: 'Béni Mellal', name_ar: 'بني ملال' },
];

export default function CreateOrderModal({ isOpen, onClose, lang, onSuccess }: Props) {
  const isAr = lang === 'ar';

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [city, setCity] = useState('Casablanca');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('350');
  const [productNote, setProductNote] = useState('ملابس / أحذية - طلبية متجر');
  const [allowOpen, setAllowOpen] = useState(true);
  const [canTry, setCanTry] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone || !city) {
      setError(isAr ? 'يرجى ملء جميع الحقول الإلزامية' : 'Veuillez remplir les champs obligatoires');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/sendit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'push',
          clientName,
          clientPhone,
          city,
          address,
          price: Number(price),
          productNote,
          allowOpen,
          canTry,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      if (!data.remoteSuccess && data.remoteError) {
        throw new Error(isAr ? `فشل الإرسال إلى Sendit: ${data.remoteError}` : `Échec de transmission Sendit: ${data.remoteError}`);
      }

      setSuccessResult(data);
      onSuccess();
    } catch (err: any) {
      setError(err?.message || (isAr ? 'حدث خطأ أثناء الربط' : 'Erreur de connexion'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSuccessResult(null);
    setClientName('');
    setClientPhone('');
    setAddress('');
    setPrice('350');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-lg rounded-3xl border border-slate-700/80 bg-[#0d1322] text-slate-100 shadow-2xl overflow-hidden transition-all"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-purple-900/40">
              <Package size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {isAr ? 'دفع شحنة جديدة إلى Sendit' : 'Nouvelle Expédition Sendit'}
              </h3>
              <p className="text-[11px] text-purple-400 font-semibold">
                Sendit API v1 • الحساب المعتمد (GAMA)
              </p>
            </div>
          </div>
          <button
            onClick={resetForm}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {successResult ? (
          <div className="p-6 text-center space-y-5 animate-fade-up">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h4 className="text-xl font-black text-white">
                {isAr ? 'تم دفع الشحنة إلى Sendit بنجاح!' : 'Colis poussé vers Sendit avec succès !'}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {isAr 
                  ? 'تم تسجيل الطرد برقم التتبع الرسمي وجاهز للطباعة والاستلام' 
                  : 'Le colis a été enregistré et prêt pour le ramassage'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-start space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{isAr ? 'رقم التتبع (Tracking):' : 'N° de suivi :'}</span>
                <span className="text-sm font-mono font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
                  {successResult.tracking}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{isAr ? 'العميل:' : 'Client :'}</span>
                <span className="text-xs font-bold text-white">{successResult.order?.clientName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{isAr ? 'المدينة:' : 'Ville :'}</span>
                <span className="text-xs font-bold text-white">{successResult.order?.city}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{isAr ? 'المبلغ المطلوب (COD):' : 'Montant COD :'}</span>
                <span className="text-xs font-bold text-emerald-400">{successResult.order?.price} DH</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={resetForm}
                className="flex-1 py-2.5 px-4 rounded-xl btn-primary text-xs font-bold"
              >
                {isAr ? 'إغلاق ومتابعة القائمة' : 'Fermer et voir la liste'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {/* Client Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  {isAr ? 'اسم الزبون *' : 'Nom du Client *'}
                </label>
                <div className="relative">
                  <User size={15} className="absolute top-3 start-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder={isAr ? 'محمد الإدريسي' : 'Mohamed Idrissi'}
                    className="input ps-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  {isAr ? 'رقم الهاتف *' : 'Téléphone *'}
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute top-3 start-3 text-slate-400" />
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={clientPhone}
                    onChange={e => setClientPhone(e.target.value)}
                    placeholder="0612345678"
                    className="input ps-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* City & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  {isAr ? 'المدينة (Sendit District) *' : 'Ville (District) *'}
                </label>
                <div className="relative">
                  <MapPin size={15} className="absolute top-3 start-3 text-slate-400" />
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="input ps-9 text-xs appearance-none"
                  >
                    {DISTRICTS.map(d => (
                      <option key={d.name} value={d.name} className="bg-slate-900 text-white">
                        {isAr ? `${d.name_ar} (${d.name})` : d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  {isAr ? 'مبلغ التحصيل (COD د.م) *' : 'Prix à encaisser (DH) *'}
                </label>
                <div className="relative">
                  <DollarSign size={15} className="absolute top-3 start-3 text-emerald-400" />
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="350"
                    className="input ps-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Full Address */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                {isAr ? 'العنوان بالتفصيل' : 'Adresse Complète'}
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder={isAr ? 'شارع القدس، حي المعاريف، الطابق 2' : 'Rue Al Qods, Maarif, Apt 4'}
                className="input text-xs"
              />
            </div>

            {/* Product Note */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                {isAr ? 'محتوى الطرد / ملاحظة للموزع' : 'Contenu du colis / Note livreur'}
              </label>
              <input
                type="text"
                value={productNote}
                onChange={e => setProductNote(e.target.value)}
                placeholder={isAr ? 'قميص رجالي + حذاء مقاس 42' : 'Chaussures sport taille 42'}
                className="input text-xs"
              />
            </div>

            {/* Special Delivery Options */}
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-purple-300 block">
                {isAr ? 'خيارات التوصيل الخاصة بـ Sendit:' : 'Options de livraison Sendit :'}
              </span>
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={allowOpen}
                  onChange={e => setAllowOpen(e.target.checked)}
                  className="rounded border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                <span>{isAr ? 'السماح بفتح الطرد والتحقق قبل الدفع (Ouvrir le colis)' : 'Autoriser l\'ouverture du colis'}</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={canTry}
                  onChange={e => setCanTry(e.target.checked)}
                  className="rounded border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                <span>{isAr ? 'السماح بقياس وتجربة الملابس (Essai de produit)' : 'Autoriser l\'essayage'}</span>
              </label>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary text-xs py-2 px-3.5 rounded-xl"
              >
                {isAr ? 'إلغاء' : 'Annuler'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{isAr ? 'جاري الدفع إلى Sendit...' : 'Envoi en cours...'}</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>{isAr ? 'دفع الشحنة إلى Sendit' : 'Pousser vers Sendit'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
