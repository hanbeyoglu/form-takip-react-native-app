import { BadRequestException } from "@nestjs/common";

export function assertValidDateInput(value: string): void {
  if (Number.isNaN(new Date(value).getTime())) {
    throw new BadRequestException("Invalid date format");
  }
}

export function normalizeDayString(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  assertValidDateInput(value);
  return new Date(value).toISOString().slice(0, 10);
}

export function toUtcDayStart(value: string): Date {
  const normalized = normalizeDayString(value);
  return new Date(`${normalized}T00:00:00.000Z`);
}

export function toUtcDayEnd(value: string): Date {
  const normalized = normalizeDayString(value);
  return new Date(`${normalized}T23:59:59.999Z`);
}
