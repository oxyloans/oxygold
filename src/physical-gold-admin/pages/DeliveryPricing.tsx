import React, { useEffect, useState } from "react";
import { MapPin, RefreshCw, Save, Truck } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Switch from "../components/ui/Switch";
import Toast from "../../PhysicalGold/components/Toast";
import {
  DeliveryPricingConfiguration,
  fetchDeliveryPricing,
  updateDeliveryPricing,
} from "../services/adminService";

const defaultConfiguration: DeliveryPricingConfiguration = {
  ratePerKm: 0,
  minimumFee: 0,
  maximumFee: 0,
  freeDeliveryThreshold: 0,
  warehouseLatitude: 0,
  warehouseLongitude: 0,
  enabled: false,
};

const numericFields: Array<{ key: Exclude<keyof DeliveryPricingConfiguration, "enabled">; label: string; helper: string }> = [
  { key: "ratePerKm", label: "Rate per kilometre (₹)", helper: "Delivery charge applied for each kilometre." },
  { key: "minimumFee", label: "Minimum delivery fee (₹)", helper: "Minimum charge when delivery pricing is enabled." },
  { key: "maximumFee", label: "Maximum delivery fee (₹)", helper: "Use 0 when there is no maximum cap." },
  { key: "freeDeliveryThreshold", label: "Free-delivery threshold (₹)", helper: "Use 0 to disable free delivery based on order value." },
  { key: "warehouseLatitude", label: "Warehouse latitude", helper: "Used to calculate delivery distance." },
  { key: "warehouseLongitude", label: "Warehouse longitude", helper: "Used to calculate delivery distance." },
];

const DeliveryPricing: React.FC = () => {
  const [configuration, setConfiguration] = useState(defaultConfiguration);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" | "info" } | null>(null);

  const loadConfiguration = async () => {
    setLoading(true);
    try {
      setConfiguration({ ...defaultConfiguration, ...await fetchDeliveryPricing() });
    } catch (error: any) {
      setToast({ message: error?.message || "Unable to load delivery pricing.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadConfiguration(); }, []);

  const saveConfiguration = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const saved = await updateDeliveryPricing(configuration);
      setConfiguration({ ...defaultConfiguration, ...saved });
      setToast({ message: "Delivery pricing updated successfully.", type: "success" });
    } catch (error: any) {
      let errorMsg = error?.message;

      const valErrors =
        error?.validationErrors ||
        error?.data?.validationErrors ||
        error?.response?.data?.data?.validationErrors ||
        null;

      if (valErrors && typeof valErrors === "object") {
        const errorList = Object.values(valErrors).filter(Boolean);
        if (errorList.length > 0) {
          errorMsg = errorList.join(", ");
        }
      }

      // Ensure "Validation failed" is never displayed to the user
      if (!errorMsg || errorMsg === "Validation failed") {
        if (valErrors?.ratePerKm) {
          errorMsg = valErrors.ratePerKm as string;
        } else if (valErrors && Object.values(valErrors).length > 0) {
          errorMsg = Object.values(valErrors).join(", ");
        } else {
          errorMsg = "Unable to update delivery pricing.";
        }
      }

      setToast({ message: errorMsg, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="flex items-center gap-2 text-lg font-bold text-slate-800 sm:text-xl"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Truck size={19} /></span> Delivery Pricing</h1>
          <p className="mt-2 text-xs leading-5 text-slate-500">Set the delivery charge rules and warehouse location used to calculate a customer’s delivery fee at checkout.</p>
        </div>
        <Button variant="outline" onClick={loadConfiguration} disabled={loading || saving} className="w-full sm:w-auto"><RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh</Button>
      </div>

      <form onSubmit={saveConfiguration} className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div><h2 className="text-sm font-bold text-slate-800">Delivery fee rules</h2><p className="mt-0.5 text-[11px] leading-4 text-slate-400">Changes affect new cart calculations after they are saved.</p></div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"><Switch checked={configuration.enabled} onChange={(enabled) => setConfiguration(current => ({ ...current, enabled }))} label="Enable delivery pricing" disabled={loading || saving} /></div>
        </div>

        <div className="p-4 sm:p-6">
          {loading ? <div className="py-16 text-center text-xs text-slate-400"><RefreshCw size={20} className="mx-auto mb-3 animate-spin text-emerald-600" />Loading delivery pricing...</div> : <>
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-x-5">
              {numericFields.slice(0, 4).map(({ key, label, helper }) => (
                <div key={key} className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 pt-2">
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    label={label}
                    helperText={helper}
                    value={configuration[key]}
                    onChange={(event) => {
                      setConfiguration(current => ({ ...current, [key]: Number(event.target.value) || 0 }));
                    }}
                    disabled={saving}
                  />
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-slate-100 pt-5">
              <h3 className="mb-1 flex items-center gap-2 text-[13px] font-bold text-slate-700"><MapPin size={15} className="text-emerald-600" /> Warehouse location</h3><p className="mb-3 text-[11px] leading-4 text-slate-400">Enter precise coordinates so delivery distances are calculated correctly.</p>
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-x-5">
                {numericFields.slice(4).map(({ key, label, helper }) => (
                  <div key={key} className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 pt-2">
                    <Input
                      type="number"
                      step="any"
                      label={label}
                      helperText={helper}
                      value={configuration[key]}
                      onChange={(event) => {
                        setConfiguration(current => ({ ...current, [key]: Number(event.target.value) || 0 }));
                      }}
                      disabled={saving}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={loadConfiguration} disabled={saving}>Discard changes</Button><Button type="submit" variant="primary" disabled={saving} className="w-full sm:w-auto">{saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />} {saving ? "Saving..." : "Save delivery pricing"}</Button></div>
          </>}
        </div>
      </form>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default DeliveryPricing;
