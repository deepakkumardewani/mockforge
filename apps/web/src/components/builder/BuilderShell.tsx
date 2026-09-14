"use client";

import { useState, useCallback } from "react";
import { useForm, useFieldArray, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useMfId } from "@/hooks/use-mf-id";
import { FieldEditor } from "@/components/builder/FieldEditor";
import { JsonEditor } from "@/components/builder/JsonEditor";
import { BuilderPreviewPane } from "@/components/builder/BuilderPreviewPane";
import { SavedSchemas } from "@/components/builder/SavedSchemas";
import { EndpointDisplay } from "@/components/builder/EndpointDisplay";
import { SchemaRecoveryDialog } from "@/components/builder/SchemaRecoveryDialog";
import { builderFormValuesSchema } from "@/components/builder/types";
import { formValuesToApiBody, savedSchemaToFormValues } from "@/components/builder/schema-convert";
import type { BuilderFormValues } from "@/components/builder/types";
import type { SavedSchema } from "@/components/builder/types";

const EMPTY_SCHEMA: BuilderFormValues = {
  name: "",
  fields: [{ name: "", type: "string" }],
};

const PERSISTENCE_DEFAULT = true;

const SEGMENTED_BTN =
  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]";

function segmentedBtnClass(active: boolean): string {
  return `${SEGMENTED_BTN} ${
    active
      ? "bg-[var(--color-surface-hover)] text-[var(--color-text-primary)]"
      : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
  }`;
}

const STARTER_SCHEMA: BuilderFormValues = {
  name: "Product",
  fields: [
    { name: "name", type: "string" },
    { name: "price", type: "number", min: 10, max: 250 },
    { name: "status", type: "enum", values: "draft, active, archived" },
  ],
};

function JsonModeEditor({
  control,
  onApply,
}: {
  control: Control<BuilderFormValues>;
  onApply: (values: BuilderFormValues) => void;
}) {
  const formValues = useWatch({ control }) as BuilderFormValues;
  return <JsonEditor formValues={formValues} onApply={onApply} />;
}

function StarterExampleButton({
  control,
  activeSlug,
  onStarter,
}: {
  control: Control<BuilderFormValues>;
  activeSlug: string | null;
  onStarter: () => void;
}) {
  const name = useWatch({ control, name: "name" });
  const fields = useWatch({ control, name: "fields" });
  const hasSchemaContent =
    name.trim().length > 0 || fields.some((field) => field.name.trim().length > 0);

  if (activeSlug || hasSchemaContent) return null;

  return (
    <button
      type="button"
      onClick={onStarter}
      className="mt-4 text-sm font-medium text-[var(--color-accent)] hover:underline"
    >
      Prefill a Product example
    </button>
  );
}

function PersistenceToggle({
  persistent,
  onChange,
}: {
  persistent: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div
      className="inline-flex rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-1"
      role="group"
      aria-label="Endpoint persistence"
    >
      <button
        type="button"
        aria-pressed={persistent}
        onClick={() => onChange(true)}
        className={segmentedBtnClass(persistent)}
      >
        Persistent
      </button>
      <button
        type="button"
        aria-pressed={!persistent}
        onClick={() => onChange(false)}
        className={segmentedBtnClass(!persistent)}
      >
        Ephemeral
      </button>
    </div>
  );
}

export function BuilderShell() {
  const mfId = useMfId();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<"visual" | "json">("visual");
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [savedEndpoint, setSavedEndpoint] = useState<string | null>(null);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [persistent, setPersistent] = useState(PERSISTENCE_DEFAULT);
  const form = useForm<BuilderFormValues>({
    resolver: zodResolver(builderFormValuesSchema),
    defaultValues: EMPTY_SCHEMA,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "fields",
  });

  const saveMutation = useMutation({
    mutationFn: (values: BuilderFormValues) =>
      apiClient<{ slug: string; endpoint: string }>(
        activeSlug ? `/api/schemas/${activeSlug}` : "/api/schemas",
        {
          method: activeSlug ? "PUT" : "POST",
          body: JSON.stringify(formValuesToApiBody(values, persistent)),
        },
        mfId,
      ),
    onSuccess: (data) => {
      setSavedEndpoint(data.endpoint);
      setActiveSlug(data.slug);
      void queryClient.invalidateQueries({ queryKey: ["saved-schemas", mfId] });
      reset(form.getValues());
    },
  });

  const handleLoad = useCallback(
    (schema: SavedSchema) => {
      const values = savedSchemaToFormValues(schema);
      reset(values);
      setActiveSlug(schema.slug);
      setSavedEndpoint(schema.endpoint);
      setPersistent(schema.persistent);
    },
    [reset],
  );

  const handleAddField = useCallback(() => {
    append({ name: "", type: "string" });
  }, [append]);

  const handleRemoveField = useCallback(
    (index: number) => {
      if (fields.length > 1) {
        remove(index);
      }
    },
    [fields.length, remove],
  );

  const handleJsonApply = useCallback(
    (values: BuilderFormValues) => {
      reset(values);
      setMode("visual");
    },
    [reset],
  );

  const handleNew = useCallback(() => {
    reset(EMPTY_SCHEMA);
    setActiveSlug(null);
    setSavedEndpoint(null);
    setMode("visual");
    setPersistent(PERSISTENCE_DEFAULT);
  }, [reset]);

  const handleDeleted = useCallback(
    (slug: string) => {
      if (slug === activeSlug) handleNew();
    },
    [activeSlug, handleNew],
  );

  const handleStarter = useCallback(() => {
    reset(STARTER_SCHEMA);
    setActiveSlug(null);
    setSavedEndpoint(null);
    setPersistent(PERSISTENCE_DEFAULT);
  }, [reset]);

  return (
    <>
      <main className="px-4 py-8 sm:px-6 lg:py-12">
        <div className="mx-auto max-w-384">
          <header className="border-b border-[var(--color-border)] pb-6">
            <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
              Build a mock API
            </h1>
            <p className="mt-2 max-w-[64ch] leading-relaxed text-[var(--color-text-muted)]">
              Design a schema, preview generated records, and publish a reusable GET endpoint.
            </p>
          </header>

          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[14rem_minmax(0,1fr)]">
            <aside className="min-w-0 space-y-5 lg:sticky lg:top-24">
              <SavedSchemas
                onLoad={handleLoad}
                onNew={handleNew}
                activeSlug={activeSlug}
                onDeleted={handleDeleted}
              />
              <button
                type="button"
                onClick={() => setIsRecoveryOpen(true)}
                className="w-full border-t border-[var(--color-border)] pt-4 text-left text-xs font-medium text-[var(--color-text-muted)] outline-none transition-colors hover:text-[var(--color-text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              >
                Recovery key
              </button>
            </aside>

            <form
              className="min-w-0"
              onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
            >
              <div className="grid items-start gap-10 2xl:grid-cols-[minmax(42rem,1.35fr)_minmax(22rem,0.75fr)]">
                <div className="min-w-0">
                  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent)]">
                        01 · Define
                      </p>
                      <h2 className="mt-1 font-display text-xl font-semibold text-[var(--color-text-primary)]">
                        Schema definition
                      </h2>
                      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                        Use the form, or paste an existing definition as JSON.
                      </p>
                    </div>
                    <div
                      className="inline-flex rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-1"
                      role="group"
                      aria-label="Editor mode"
                    >
                      <button
                        type="button"
                        onClick={() => setMode("visual")}
                        aria-pressed={mode === "visual"}
                        className={segmentedBtnClass(mode === "visual")}
                      >
                        Form
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode("json")}
                        aria-pressed={mode === "json"}
                        className={segmentedBtnClass(mode === "json")}
                      >
                        JSON
                      </button>
                    </div>
                  </div>

                  {mode === "visual" ? (
                    <FieldEditor
                      control={control}
                      register={register}
                      fields={fields}
                      onAddField={handleAddField}
                      onRemoveField={handleRemoveField}
                      errors={errors}
                    />
                  ) : (
                    <JsonModeEditor control={control} onApply={handleJsonApply} />
                  )}

                  <StarterExampleButton
                    control={control}
                    activeSlug={activeSlug}
                    onStarter={handleStarter}
                  />

                  <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[var(--color-border)] pt-4">
                    <button
                      type="submit"
                      disabled={saveMutation.isPending}
                      className="rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--color-on-accent)] transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {saveMutation.isPending
                        ? activeSlug
                          ? "Saving…"
                          : "Creating…"
                        : activeSlug
                          ? "Save changes"
                          : "Create endpoint"}
                    </button>
                    <PersistenceToggle persistent={persistent} onChange={setPersistent} />
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {activeSlug
                        ? "Updates the live endpoint."
                        : persistent
                          ? "Creates a public GET endpoint."
                          : "Creates a temporary GET endpoint."}
                    </p>
                    {saveMutation.isError && (
                      <p className="w-full text-sm text-red-500" role="alert" aria-live="assertive">
                        {(saveMutation.error as Error).message}
                      </p>
                    )}
                    {saveMutation.isSuccess && savedEndpoint && (
                      <p className="sr-only" aria-live="polite">
                        Schema saved.
                      </p>
                    )}
                  </div>

                  {savedEndpoint ? (
                    <div className="mt-8">
                      <EndpointDisplay endpoint={savedEndpoint} />
                    </div>
                  ) : null}
                </div>

                <section
                  className="min-w-0 border-t border-[var(--color-border)] pt-8 2xl:sticky 2xl:top-24 2xl:border-l 2xl:border-t-0 2xl:pl-10 2xl:pt-0"
                  aria-label="Generated data preview"
                >
                  <BuilderPreviewPane control={control} />
                </section>
              </div>
            </form>
          </div>
        </div>
      </main>
      <SchemaRecoveryDialog open={isRecoveryOpen} onClose={() => setIsRecoveryOpen(false)} />
    </>
  );
}
