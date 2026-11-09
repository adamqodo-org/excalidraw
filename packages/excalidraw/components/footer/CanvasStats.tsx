import clsx from "clsx";
import { useMemo } from "react";

import { t } from "../../i18n";

import "./CanvasStats.scss";

import type { NonDeletedExcalidrawElement } from "@excalidraw/element/types";

import type { UIAppState } from "../../types";

type CanvasStatsProps = {
  elements: readonly NonDeletedExcalidrawElement[];
  selectedElementIds: UIAppState["selectedElementIds"];
  className?: string;
};

const formatShapeCount = (count: number) =>
  count > 1
    ? t("canvasStats.shapes", { count })
    : t("canvasStats.shape", { count });

export const CanvasStats = ({
  elements,
  selectedElementIds,
  className,
}: CanvasStatsProps) => {
  const { shapeCount, selectedCount } = useMemo(() => {
    const shapes = elements.filter((element) => !element.isDeleted);
    const selected = shapes.filter((element) => selectedElementIds[element.id]);
    return { shapeCount: shapes.length, selectedCount: selected.length };
  }, [elements]);

  return (
    <div
      className={clsx("canvas-stats", className)}
      aria-live="polite"
      data-testid="canvas-stats"
    >
      <span className="canvas-stats__shapes">
        {formatShapeCount(shapeCount)}
      </span>
      {selectedCount > 0 && (
        <span className="canvas-stats__selected">
          {t("canvasStats.selected", { count: selectedCount })}
        </span>
      )}
    </div>
  );
};
