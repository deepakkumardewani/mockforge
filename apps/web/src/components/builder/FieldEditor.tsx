"use client";

import type {
  Control,
  FieldErrors,
  FieldError,
  UseFormRegister,
  FieldArrayWithId,
} from "react-hook-form";
import { useWatch } from "react-hook-form";
import { DestructiveIconButton } from "./DestructiveIconButton";
import { parseEnumValues } from "./schema-convert";
import { SCHEMA_FIELD_TYPES } from "./types";
import type { BuilderFormValues, SchemaFieldType } from "./types";

const FIELD_TYPES = SCHEMA_FIELD_TYPES.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

const ITEM_TYPES = FIELD_TYPES.filter((ft) => ft.value !== "array");
const NUMBER_RULE_INPUT_CLASS =
  "w-full appearance-none rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] py-1.5 pl-10 pr-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

function SelectChevron() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-muted)]"
    >
      <path
        d="m4 6 4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface Props {
  control: Control<BuilderFormValues>;
  register: UseFormRegister<BuilderFormValues>;
  fields: FieldArrayWithId<BuilderFormValues, "fields", "id">[];
  onAddField: () => void;
  onRemoveField: (index: number) => void;
  errors: FieldErrors<BuilderFormValues> | Record<string, { message?: string }>;
}

function errorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  if ("message" in error && typeof (error as FieldError).message === "string") {
    return (error as FieldError).message;
  }
  return undefined;
}

function fieldError(
  errors: Props["errors"],
  index: number,
  name: "name" | "type" | "values" | "items" | "min" | "max",
): string | undefined {
  const nested = errors as FieldErrors<BuilderFormValues>;
  const fromNested = errorMessage(nested.fields?.[index]?.[name]);
  if (fromNested) return fromNested;

  const flat = errors as Record<string, { message?: string }>;
  return flat[`fields.${index}.${name}`]?.message;
}

function FieldRow({
  index,
  defaultType,
  canRemove,
  register,
  control,
  errors,
  onRemoveField,
}: {
  index: number;
  defaultType: SchemaFieldType;
  canRemove: boolean;
  register: UseFormRegister<BuilderFormValues>;
  control: Control<BuilderFormValues>;
  errors: Props["errors"];
  onRemoveField: (index: number) => void;
}) {
  const watchedType = useWatch({ control, name: `fields.${index}.type` });
  const type = watchedType ?? defaultType;

  const nameId = `builder-field-${index}-name`;
  const typeId = `builder-field-${index}-type`;
  const valuesId = `builder-field-${index}-values`;
  const minId = `builder-field-${index}-min`;
  const maxId = `builder-field-${index}-max`;
  const itemsId = `builder-field-${index}-items`;

  const nameError = fieldError(errors, index, "name");
  const valuesError = fieldError(errors, index, "values");
  const itemsError = fieldError(errors, index, "items");
  const minError = fieldError(errors, index, "min");
  const maxError = fieldError(errors, index, "max");

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_2.25rem] items-start gap-3 border-b border-[var(--color-border)] p-4 last:border-b-0 md:grid-cols-[minmax(12rem,1.35fr)_9rem_minmax(14rem,1fr)_2.25rem]">
      <div className="min-w-0">
        <label
          htmlFor={nameId}
          className="mb-1 block text-xs font-medium text-[var(--color-text-muted)] md:sr-only"
        >
          Field name
        </label>
        <input
          id={nameId}
          {...register(`fields.${index}.name`, { required: "Required" })}
          placeholder="e.g. origin"
          aria-invalid={Boolean(nameError)}
          aria-describedby={nameError ? `${nameId}-error` : undefined}
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        />
        {nameError ? (
          <p id={`${nameId}-error`} role="alert" className="mt-0.5 text-xs text-red-500">
            {nameError}
          </p>
        ) : null}
      </div>

      <div className="col-start-1 row-start-2 md:col-start-2 md:row-start-1">
        <label
          htmlFor={typeId}
          className="mb-1 block text-xs font-medium text-[var(--color-text-muted)] md:sr-only"
        >
          Type
        </label>
        <div className="relative">
          <select
            id={typeId}
            {...register(`fields.${index}.type`)}
            className="w-full appearance-none rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] py-1.5 pl-3 pr-10 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            {FIELD_TYPES.map((fieldType) => (
              <option key={fieldType.value} value={fieldType.value}>
                {fieldType.label}
              </option>
            ))}
          </select>
          <SelectChevron />
        </div>
      </div>

      <DestructiveIconButton
        label="Remove field"
        onClick={() => onRemoveField(index)}
        disabled={!canRemove}
        hidden={!canRemove}
        className="col-start-2 row-start-1 self-end md:col-start-4"
      />

      {type === "enum" ? (
        <div className="col-span-2 col-start-1 md:col-span-1 md:col-start-3 md:row-start-1">
          <label
            htmlFor={valuesId}
            className="mb-1 block text-xs font-medium text-[var(--color-text-muted)] md:sr-only"
          >
            Allowed values
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 hidden -translate-y-1/2 text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--color-text-muted)] md:block">
              Values
            </span>
            <input
              id={valuesId}
              {...register(`fields.${index}.values` as const, {
                validate: (value) =>
                  parseEnumValues(typeof value === "string" ? value : undefined).length > 0 ||
                  'Field type "enum" requires a non-empty "values" array',
              })}
              placeholder="draft, active, archived"
              aria-invalid={Boolean(valuesError)}
              aria-describedby={valuesError ? `${valuesId}-error` : undefined}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] md:pl-16"
            />
          </div>
          {valuesError ? (
            <p id={`${valuesId}-error`} role="alert" className="mt-0.5 text-xs text-red-500">
              {valuesError}
            </p>
          ) : null}
        </div>
      ) : null}

      {type === "number" ? (
        <div className="col-span-2 col-start-1 grid grid-cols-2 gap-2 md:col-span-1 md:col-start-3 md:row-start-1">
          <div>
            <label
              htmlFor={minId}
              className="mb-1 block text-xs font-medium text-[var(--color-text-muted)] md:sr-only"
            >
              Minimum
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 hidden -translate-y-1/2 text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--color-text-muted)] md:block">
                Min
              </span>
              <input
                id={minId}
                type="number"
                inputMode="decimal"
                {...register(`fields.${index}.min`, { valueAsNumber: true })}
                placeholder="Min"
                aria-invalid={Boolean(minError)}
                aria-describedby={minError ? `${minId}-error` : undefined}
                className={NUMBER_RULE_INPUT_CLASS}
              />
            </div>
            {minError ? (
              <p id={`${minId}-error`} role="alert" className="mt-0.5 text-xs text-red-500">
                {minError}
              </p>
            ) : null}
          </div>
          <div>
            <label
              htmlFor={maxId}
              className="mb-1 block text-xs font-medium text-[var(--color-text-muted)] md:sr-only"
            >
              Maximum
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 hidden -translate-y-1/2 text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--color-text-muted)] md:block">
                Max
              </span>
              <input
                id={maxId}
                type="number"
                inputMode="decimal"
                {...register(`fields.${index}.max`, { valueAsNumber: true })}
                placeholder="Max"
                aria-invalid={Boolean(maxError)}
                aria-describedby={maxError ? `${maxId}-error` : undefined}
                className={NUMBER_RULE_INPUT_CLASS}
              />
            </div>
            {maxError ? (
              <p id={`${maxId}-error`} role="alert" className="mt-0.5 text-xs text-red-500">
                {maxError}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {type === "array" ? (
        <div className="col-span-2 col-start-1 md:col-span-1 md:col-start-3 md:row-start-1">
          <label
            htmlFor={itemsId}
            className="mb-1 block text-xs font-medium text-[var(--color-text-muted)] md:sr-only"
          >
            Item type
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--color-text-muted)] md:block">
              Items
            </span>
            <select
              id={itemsId}
              {...register(`fields.${index}.items`, {
                validate: (value) =>
                  (Boolean(value) && value !== "array") ||
                  'Field type "array" requires an "items" type (cannot be "array")',
              })}
              aria-invalid={Boolean(itemsError)}
              aria-describedby={itemsError ? `${itemsId}-error` : undefined}
              className="w-full appearance-none rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] py-1.5 pl-3 pr-10 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] md:pl-14"
            >
              <option value="">Select item type</option>
              {ITEM_TYPES.map((itemType) => (
                <option key={itemType.value} value={itemType.value}>
                  {itemType.label}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
          {itemsError ? (
            <p id={`${itemsId}-error`} role="alert" className="mt-0.5 text-xs text-red-500">
              {itemsError}
            </p>
          ) : null}
        </div>
      ) : null}

      {!["enum", "number", "array"].includes(type) ? (
        <span className="hidden self-center text-sm text-[var(--color-text-muted)] md:col-start-3 md:row-start-1 md:block">
          None
        </span>
      ) : null}
    </div>
  );
}

export function FieldEditor({
  control,
  register,
  fields,
  onAddField,
  onRemoveField,
  errors: formErrors,
}: Props) {
  const nameError =
    errorMessage((formErrors as FieldErrors<BuilderFormValues>).name) ??
    (formErrors as Record<string, { message?: string }>).name?.message;
  const canRemove = fields.length > 1;

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="builder-schema-name"
          className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]"
        >
          Schema name
        </label>
        <input
          id="builder-schema-name"
          {...register("name", { required: "Schema name is required" })}
          placeholder="e.g. Flight, Product, User"
          aria-invalid={Boolean(nameError)}
          aria-describedby={nameError ? "builder-schema-name-error" : undefined}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        />
        {nameError && (
          <p id="builder-schema-name-error" role="alert" className="mt-1 text-sm text-red-500">
            {nameError}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Fields</h3>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Each field becomes a property in the generated records.
            </p>
          </div>
          <button
            type="button"
            onClick={onAddField}
            className="shrink-0 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-raised)]"
          >
            + Add field
          </button>
        </div>
        <div className="max-h-[min(52vh,30rem)] overflow-y-auto overscroll-contain rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] [scrollbar-gutter:stable]">
          <div className="sticky top-0 z-10 hidden grid-cols-[minmax(12rem,1.35fr)_9rem_minmax(14rem,1fr)_2.25rem] gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--color-text-muted)] md:grid">
            <span>Field name</span>
            <span>Type</span>
            <span>Constraints</span>
            <span className="sr-only">Actions</span>
          </div>
          {fields.map((field, index) => (
            <FieldRow
              key={field.id}
              index={index}
              defaultType={field.type}
              canRemove={canRemove}
              register={register}
              control={control}
              errors={formErrors}
              onRemoveField={onRemoveField}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
