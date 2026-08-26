import { labCatalog } from "@/content/laboratory";

export type LabCatalogTest = {
  code: string;
  name: string;
  category: string;
  sample: string;
  resultType: string;
  turnaround: string;
  price: string;
  referenceRange: string;
  active: boolean;
};

const key = "ggh-laboratory-catalog-v1";

const defaults: LabCatalogTest[] = labCatalog.map((test) => ({
  ...test,
  referenceRange: test.code === "CBC" ? "See CBC reference ranges" : "Not configured",
}));

export function readLabCatalog(): LabCatalogTest[] {
  if (typeof window === "undefined") return defaults;
  const saved = window.localStorage.getItem(key);
  return saved ? (JSON.parse(saved) as LabCatalogTest[]) : defaults;
}

export function saveLabCatalog(tests: LabCatalogTest[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(tests));
}

export function addLabCatalogTest(test: Omit<LabCatalogTest, "active">) {
  const next = { ...test, active: true } satisfies LabCatalogTest;
  const tests = readLabCatalog();
  saveLabCatalog([...tests, next]);
  return next;
}
