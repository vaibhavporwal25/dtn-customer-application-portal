import React from 'react';
import { FormDataState, AddressData } from '../../types/index.js';
import { MapPin, Home, Building, Copy } from 'lucide-react';

interface Step2Props {
  formData: FormDataState;
  onChange: (fields: Partial<FormDataState>) => void;
  errors: Record<string, string>;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Chandigarh', 'Jammu and Kashmir', 'Ladakh', 'Puducherry'
];

export const Step2Address: React.FC<Step2Props> = ({ formData, onChange, errors }) => {
  const updateConn = (field: keyof AddressData, value: string) => {
    const updated = { ...formData.connectionAddress, [field]: value };
    if (formData.sameAsConnectionAddress) {
      onChange({
        connectionAddress: updated,
        permanentAddress: updated
      });
    } else {
      onChange({ connectionAddress: updated });
    }
  };

  const updatePerm = (field: keyof AddressData, value: string) => {
    onChange({
      permanentAddress: { ...formData.permanentAddress, [field]: value }
    });
  };

  const toggleSameAddress = (checked: boolean) => {
    onChange({
      sameAsConnectionAddress: checked,
      permanentAddress: checked ? { ...formData.connectionAddress } : { ...formData.permanentAddress }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Connection Address */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-800">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Connection / Correspondence Address <span className="text-red-500">*</span>
            </h3>
            <p className="text-xs text-slate-500">
              Reference 15: The physical site where DTN India optical fiber line will be installed & billed
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Flat / House / Suite / Office No. & Building Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Flat 402, Sunshine Heights, Tower B"
              value={formData.connectionAddress.line1}
              onChange={(e) => updateConn('line1', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            />
            {errors.connLine1 && <p className="text-xs text-red-600 font-medium mt-1">{errors.connLine1}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Street / Road / Landmark (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Near Community Center, Main Road"
              value={formData.connectionAddress.line2 || ''}
              onChange={(e) => updateConn('line2', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Area / Locality / Sector <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Sector 62, Indirapuram"
              value={formData.connectionAddress.area}
              onChange={(e) => updateConn('area', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            />
            {errors.connArea && <p className="text-xs text-red-600 font-medium mt-1">{errors.connArea}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              City / District <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Noida, New Delhi, Gurugram"
              value={formData.connectionAddress.city}
              onChange={(e) => updateConn('city', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            />
            {errors.connCity && <p className="text-xs text-red-600 font-medium mt-1">{errors.connCity}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              State / Union Territory <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.connectionAddress.state}
              onChange={(e) => updateConn('state', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            >
              <option value="">Select State</option>
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
            {errors.connState && <p className="text-xs text-red-600 font-medium mt-1">{errors.connState}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              PIN Code (6 digits) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="e.g. 201309"
              value={formData.connectionAddress.pincode}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                updateConn('pincode', val);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            />
            {errors.connPin && <p className="text-xs text-red-600 font-medium mt-1">{errors.connPin}</p>}
          </div>
        </div>
      </div>

      {/* Permanent Address with Same-As-Connection toggle */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-800">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Permanent Address <span className="text-red-500">*</span>
              </h3>
              <p className="text-xs text-slate-500">
                Reference 16: Statutory registered address for identity verification
              </p>
            </div>
          </div>

          {/* Copy Address Checkbox */}
          <label className="flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-teal-50/80 border border-teal-200 cursor-pointer text-xs font-bold text-teal-950 hover:bg-teal-100/70 transition-all select-none">
            <input
              type="checkbox"
              checked={formData.sameAsConnectionAddress}
              onChange={(e) => toggleSameAddress(e.target.checked)}
              className="w-4 h-4 rounded text-teal-700 focus:ring-teal-600 border-slate-300"
            />
            <span>My permanent address is the same as connection address</span>
          </label>
        </div>

        {formData.sameAsConnectionAddress ? (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 flex items-center gap-3">
            <Copy className="w-5 h-5 text-teal-700 shrink-0" />
            <div>
              <span className="font-semibold text-slate-800">Synchronized with Connection Address:</span>{' '}
              {formData.connectionAddress.line1 || '(Address Line 1)'}, {formData.connectionAddress.area || '(Area)'}, {formData.connectionAddress.city || '(City)'}, {formData.connectionAddress.state || '(State)'} - {formData.connectionAddress.pincode || '(PIN)'}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Flat / House / Suite No. & Building Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Plot 12, Block C"
                value={formData.permanentAddress.line1}
                onChange={(e) => updatePerm('line1', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              />
              {errors.permLine1 && <p className="text-xs text-red-600 font-medium mt-1">{errors.permLine1}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Street / Road / Landmark (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Near Landmark"
                value={formData.permanentAddress.line2 || ''}
                onChange={(e) => updatePerm('line2', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Area / Locality <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Okhla Phase 1"
                value={formData.permanentAddress.area}
                onChange={(e) => updatePerm('area', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              />
              {errors.permArea && <p className="text-xs text-red-600 font-medium mt-1">{errors.permArea}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                City / District <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. New Delhi"
                value={formData.permanentAddress.city}
                onChange={(e) => updatePerm('city', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              />
              {errors.permCity && <p className="text-xs text-red-600 font-medium mt-1">{errors.permCity}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                State / Union Territory <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.permanentAddress.state}
                onChange={(e) => updatePerm('state', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
              {errors.permState && <p className="text-xs text-red-600 font-medium mt-1">{errors.permState}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                PIN Code (6 digits) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 110020"
                value={formData.permanentAddress.pincode}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  updatePerm('pincode', val);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              />
              {errors.permPin && <p className="text-xs text-red-600 font-medium mt-1">{errors.permPin}</p>}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
