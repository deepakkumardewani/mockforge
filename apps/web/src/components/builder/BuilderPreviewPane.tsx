"use client";

import { useWatch, type Control } from "react-hook-form";
import { Preview } from "@/components/builder/Preview";
import { useDebouncedValue } from "@/components/builder/use-debounced-value";
import type { BuilderFormValues } from "@/components/builder/types";

const PREVIEW_DEBOUNCE_MS = 160;

interface BuilderPreviewPaneProps {
  control: Control<BuilderFormValues>;
}

export function BuilderPreviewPane({ control }: BuilderPreviewPaneProps) {
  const formValues = useWatch({ control }) as BuilderFormValues;
  const debouncedValues = useDebouncedValue(formValues, PREVIEW_DEBOUNCE_MS);

  return <Preview formValues={debouncedValues} />;
}
