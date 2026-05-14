"use client";

import { useState, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useMfIdStore } from "@/store/mf-id";
import { FieldEditor } from "@/components/builder/FieldEditor";
import { JsonEditor } from "@/components/builder/JsonEditor";
import { Preview } from "@/components/builder/Preview";
import { SavedSchemas } from "@/components/builder/SavedSchemas";
import { EndpointDisplay } from "@/components/builder/EndpointDisplay";
import { MfIdPrompt } from "@/components/builder/MfIdPrompt";
import { builderFormValuesSchema } from "@/components/builder/types";
import type { BuilderFormValues } from "@/components/builder/types";
import type { SavedSchema } from "@/components/builder/types";

const SHOWN_MF_ID_KEY = "mf_id_prompt_shown";

function schemaToFormValues(definition: SavedSchema): BuilderFormValues {
  return {
    name: definition.definition.name,
    fields: definition.definition.fields.map((f) => ({
      name: f.name,
      type: f.type,
      values: f.values?.join(", "),
      items: f.items,
      min: f.min,
      max: f.max,
    })),
  };
}

function buildApiBody(values: BuilderFormValues, persistent: boolean) {
  return {
    name: values.name || "Untitled",
    fields: values.fields
      .filter((f) => f.name.trim().length > 0)
      .map((f) => {
        const field: Record<string, unknown> = {
          name: f.name.trim(),
          type: f.type,
        };
        if (f.type === "enum" && f.values) {
          field.values = f.values
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
        if (f.type === "array" && f.items) {
          field.items = f.items;
        }
        if (f.type === "number") {
          if (f.min !== undefined && !isNaN(f.min)) field.min = f.min;
          if (f.max !== undefined && !isNaN(f.max)) field.max = f.max;
        }
        return field;
      }),
    persistent,
  };
}

export default function BuilderPage() {
  const mfId = useMfIdStore((s) => s.mfId);
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<"visual" | "json">("visual");
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [savedEndpoint, setSavedEndpoint] = useState<string | null>(null);
  const [showMfIdPrompt, setShowMfIdPrompt] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem(SHOWN_MF_ID_KEY);
  });

  const form = useForm<BuilderFormValues>({
    resolver: zodResolver(builderFormValuesSchema),
    defaultValues: {
      name: "",
      fields: [{ name: "", type: "string" }],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "fields",
  });

  const formValues = watch();

  const saveMutation = useMutation({
    mutationFn: (values: BuilderFormValues) =>
      apiClient<{ slug: string; endpoint: string }>(
        "/api/schemas",
        {
          method: "POST",
          body: JSON.stringify(buildApiBody(values, true)),
        },
        mfId,
      ),
    onSuccess: (data) => {
      setSavedEndpoint(data.endpoint);
      setActiveSlug(data.slug);
      queryClient.invalidateQueries({ queryKey: ["saved-schemas", mfId] });
      if (!localStorage.getItem(SHOWN_MF_ID_KEY)) {
        localStorage.setItem(SHOWN_MF_ID_KEY, "true");
        setShowMfIdPrompt(true);
      }
    },
  });

  const handleSave = useCallback(() => {
    handleSubmit((values) => {
      saveMutation.mutate(values);
    })();
  }, [handleSubmit, saveMutation]);

  const handleLoad = useCallback(
    (schema: SavedSchema) => {
      const values = schemaToFormValues(schema);
      reset(values);
      setActiveSlug(schema.slug);
      setSavedEndpoint(schema.endpoint);
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

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Schema Builder</h1>
          <p className="mt-2 text-[var(--color-text-muted)]">
            Define custom data schemas and generate fake records.
          </p>
        </div>

        <div className="flex gap-6">
          {/* Left sidebar — saved schemas */}
          <aside className="w-64 shrink-0">
            <SavedSchemas onLoad={handleLoad} activeSlug={activeSlug} />
          </aside>

          {/* Main content area */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Mode toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode("visual")}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  mode === "visual"
                    ? "bg-[var(--color-accent)] text-white"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                Visual
              </button>
              <button
                type="button"
                onClick={() => setMode("json")}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  mode === "json"
                    ? "bg-[var(--color-accent)] text-white"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                JSON
              </button>
            </div>

            {/* Editor */}
            {mode === "visual" ? (
              <FieldEditor
                control={control}
                register={register}
                fields={fields}
                onAddField={handleAddField}
                onRemoveField={handleRemoveField}
                errors={errors as unknown as Record<string, { message?: string }>}
              />
            ) : (
              <JsonEditor formValues={formValues} onApply={handleJsonApply} />
            )}

            {/* Save button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="rounded-lg bg-[var(--color-accent)] px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saveMutation.isPending ? "Saving..." : "Save Schema"}
              </button>
              {saveMutation.isError && (
                <p className="text-sm text-red-500">{(saveMutation.error as Error).message}</p>
              )}
            </div>

            {/* Endpoint display */}
            {savedEndpoint && <EndpointDisplay endpoint={savedEndpoint} />}

            {/* MfId prompt */}
            {showMfIdPrompt && mfId && (
              <MfIdPrompt mfId={mfId} onDismiss={() => setShowMfIdPrompt(false)} />
            )}

            {/* Live preview */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6">
              <Preview formValues={formValues} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
