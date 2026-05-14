"use client";

import type { Control, UseFormRegister, FieldArrayWithId } from "react-hook-form";
import { SCHEMA_FIELD_TYPES } from "./types";
import type { BuilderFormValues } from "./types";

const FIELD_TYPES = SCHEMA_FIELD_TYPES.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

interface Props {
  control: Control<BuilderFormValues>;
  register: UseFormRegister<BuilderFormValues>;
  fields: FieldArrayWithId<BuilderFormValues, "fields", "id">[];
  onAddField: () => void;
  onRemoveField: (index: number) => void;
  errors: Record<string, { message?: string }>;
}

function fieldError(index: number, name: string, errors: Record<string, { message?: string }>) {
  return errors?.[`fields.${index}.${name}`]?.message;
}

export function FieldEditor({
  register,
  fields,
  onAddField,
  onRemoveField,
  errors: formErrors,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
          Schema Name
        </label>
        <input
          {...register("name", { required: "Schema name is required" })}
          placeholder="e.g. Flight, Product, User"
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        />
        {formErrors?.name?.message && (
          <p className="mt-1 text-sm text-red-500">{formErrors.name.message}</p>
        )}
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                      Field Name
                    </label>
                    <input
                      {...register(`fields.${index}.name`, {
                        required: "Required",
                      })}
                      placeholder="e.g. origin"
                      className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    />
                    {fieldError(index, "name", formErrors) && (
                      <p className="mt-0.5 text-xs text-red-500">
                        {fieldError(index, "name", formErrors)}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                      Type
                    </label>
                    <select
                      {...register(`fields.${index}.type`)}
                      className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    >
                      {FIELD_TYPES.map((ft) => (
                        <option key={ft.value} value={ft.value}>
                          {ft.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {field.type === "enum" && (
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                      Enum Values (comma-separated)
                    </label>
                    <input
                      {...register(`fields.${index}.values` as const)}
                      placeholder="A, B, C"
                      className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    />
                  </div>
                )}

                {field.type === "number" && (
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                        Min
                      </label>
                      <input
                        type="number"
                        {...register(`fields.${index}.min`, {
                          valueAsNumber: true,
                        })}
                        className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                        Max
                      </label>
                      <input
                        type="number"
                        {...register(`fields.${index}.max`, {
                          valueAsNumber: true,
                        })}
                        className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                      />
                    </div>
                  </div>
                )}

                {field.type === "array" && (
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                      Item Type
                    </label>
                    <select
                      {...register(`fields.${index}.items`)}
                      className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    >
                      {FIELD_TYPES.filter((ft) => ft.value !== "array").map((ft) => (
                        <option key={ft.value} value={ft.value}>
                          {ft.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => onRemoveField(index)}
                className="mt-6 rounded-md p-1.5 text-[var(--color-text-muted)] hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                aria-label="Remove field"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAddField}
        className="w-full rounded-lg border-2 border-dashed border-[var(--color-border)] py-3 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
      >
        + Add Field
      </button>
    </div>
  );
}
