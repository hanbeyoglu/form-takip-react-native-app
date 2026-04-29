export type ProfileRegionId = "TR" | "DE" | "AE" | "SA";

export type ProfileRegionDefinition = {
  id: ProfileRegionId;
  /** Bölge seçildiğinde önerilen IANA saat dilimi (backend ile aynı canonical değer). */
  suggestedTimezone: string;
};

export const profileRegions: readonly ProfileRegionDefinition[] = [
  { id: "TR", suggestedTimezone: "Europe/Istanbul" },
  { id: "DE", suggestedTimezone: "Europe/Berlin" },
  { id: "AE", suggestedTimezone: "Asia/Dubai" },
  { id: "SA", suggestedTimezone: "Asia/Riyadh" }
];

export const profileTimezoneIANAs = [
  "Europe/Istanbul",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Riyadh"
] as const;

export function getSuggestedTimezoneForRegion(regionId: ProfileRegionId): string {
  const hit = profileRegions.find((r) => r.id === regionId);
  return hit?.suggestedTimezone ?? "Europe/Istanbul";
}

export function inferRegionIdFromTimezone(iana: string): ProfileRegionId | null {
  const hit = profileRegions.find((r) => r.suggestedTimezone === iana);
  return hit?.id ?? null;
}
