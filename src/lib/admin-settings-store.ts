export type HospitalSettings = {
  hospitalName: string;
  legalName: string;
  phone: string;
  email: string;
  address: string;
  timezone: string;
  currency: string;
  appointmentSlot: string;
  queueThreshold: string;
  labTatTarget: string;
  lowStockAlerts: boolean;
  criticalResultAlerts: boolean;
  failedLoginAlerts: boolean;
  mfaRequired: boolean;
  sessionTimeout: string;
};

const key = "ggh-admin-settings-v1";
export const defaultSettings: HospitalSettings = {
  hospitalName: "Garowe General Hospital",
  legalName: "Garowe General Hospital (GGH)",
  phone: "+252 90 000 0000",
  email: "admin@garowehospital.org",
  address: "Garowe, Nugaal, Puntland, Somalia",
  timezone: "Africa/Mogadishu",
  currency: "USD ($)",
  appointmentSlot: "15 minutes",
  queueThreshold: "30 minutes",
  labTatTarget: "60 minutes",
  lowStockAlerts: true,
  criticalResultAlerts: true,
  failedLoginAlerts: true,
  mfaRequired: false,
  sessionTimeout: "30 minutes",
};

export function readSettings(): HospitalSettings {
  if (typeof window === "undefined") return defaultSettings;
  const saved = window.localStorage.getItem(key);
  return saved
    ? { ...defaultSettings, ...(JSON.parse(saved) as Partial<HospitalSettings>) }
    : defaultSettings;
}

export function saveSettings(settings: HospitalSettings) {
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(settings));
}
