import * as Lucide from "lucide-react";
import type { LucideProps } from "lucide-react";

/**
 * Renders a lucide icon by name so icons can be stored as data
 * (hospital settings / departments / services) instead of imported per component.
 */
export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const registry = Lucide as unknown as Record<string, React.ComponentType<LucideProps>>;
  const Cmp = registry[name] ?? Lucide.Activity;
  return <Cmp aria-hidden="true" {...props} />;
}
