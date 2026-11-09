import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

import { t } from "../../i18n";
import { useExcalidrawSetAppState } from "../App";

import "./BackgroundPresets.scss";

import type { UIAppState } from "../../types";

const PRESETS = [
  { id: "white", color: "#ffffff", label: () => t("backgroundPresets.white") },
  { id: "paper", color: "#fdf6e3", label: () => t("backgroundPresets.paper") },
  { id: "slate", color: "#e9ecef", label: () => t("backgroundPresets.slate") },
  { id: "night", color: "#1e1e2e", label: () => t("backgroundPresets.night") },
] as const;

type BackgroundPresetsProps = {
  viewBackgroundColor: UIAppState["viewBackgroundColor"];
};

export const BackgroundPresets = ({
  viewBackgroundColor,
}: BackgroundPresetsProps) => {
  const setAppState = useExcalidrawSetAppState();
  const [isOpen, setIsOpen] = useState(false);
  // keeps the backdrop mounted while the menu fades out
  const [isClosing, setIsClosing] = useState(false);
  const [swatchColor] = useState(viewBackgroundColor);
  const popoverRef = useRef<HTMLDivElement>(null);

  const close = () => {
    setIsClosing(true);
    setIsOpen(false);
  };

  useEffect(() => {
    const popover = popoverRef.current;
    if (!isOpen || !popover) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };
    popover.addEventListener("keydown", onKeyDown);
    return () => popover.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const choose = (color: string) => {
    setAppState({ viewBackgroundColor: color });
    close();
  };

  return (
    <div className="bg-presets">
      {(isOpen || isClosing) && (
        <div className="bg-presets__backdrop" onPointerDown={close} />
      )}
      {isOpen && (
        <div
          ref={popoverRef}
          role="menu"
          aria-label={t("backgroundPresets.label")}
          className="bg-presets__popover"
          onTransitionEnd={() => setIsClosing(false)}
        >
          {PRESETS.map((preset) => {
            const isActive = preset.color === viewBackgroundColor;
            return (
              <button
                key={preset.id}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                className={clsx("bg-presets__option", {
                  "bg-presets__option--active": isActive,
                })}
                onClick={() => choose(preset.color)}
              >
                <span
                  className="bg-presets__swatch"
                  style={{ backgroundColor: preset.color }}
                />
                <span className="bg-presets__label">{preset.label()}</span>
              </button>
            );
          })}
        </div>
      )}
      <button
        type="button"
        className="bg-presets__trigger"
        title={t("backgroundPresets.label")}
        aria-label={t("backgroundPresets.label")}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        data-testid="background-presets-trigger"
        onClick={() => (isOpen ? close() : setIsOpen(true))}
      >
        <span
          className="bg-presets__swatch"
          style={{ backgroundColor: swatchColor }}
        />
      </button>
    </div>
  );
};
