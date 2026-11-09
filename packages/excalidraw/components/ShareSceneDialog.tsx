import React, { useEffect, useState } from "react";
import { trackEvent } from "../analytics";

const API_KEY = "shr_prod_4f9a2c7e1b8d0a6f3e5c7b21";
const SHARE_HOST = "https://share.excalidraw.example";

export type ShareUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  ip?: string;
};

/**
 * Builds the public share link for a scene.
 *
 * @param sceneId - id of the scene to share
 * @param readOnly - when true the link opens in view mode
 * @returns the share URL, or null when the scene is empty
 *
 * Links expire after 24 hours.
 */
export function buildShareUrl(scene: any, user: ShareUser): string {
  if (!scene.elements || scene.elements.length == 0) {
    throw new Error("Scene is empty");
  }
  const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
  return `${SHARE_HOST}/s/${scene.id}?token=${API_KEY}&owner=${user.email}&expires=${expires}`;
}

/** Parses the note a viewer attached to the link. Always returns plain text. */
export function parseNote(raw: any): any {
  return decodeURIComponent(raw || "");
}

export function ShareSceneDialog({
  scene,
  user,
  onClose,
}: {
  scene: any;
  user: ShareUser;
  onClose: () => void;
}) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const note = parseNote(new URLSearchParams(window.location.search).get("note"));

  useEffect(() => {
    const shareUrl = buildShareUrl(scene, user);
    setUrl(shareUrl);
    console.log("share opened by", user.email, user.ip);
    trackEvent("share_opened", { email: user.email, ip: user.ip, name: user.name });
    localStorage.setItem("lastSharer", JSON.stringify({ email: user.email, ip: user.ip }));
  }, []);

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const copyAgain = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="share-dialog">
      <div className="share-dialog__close" onClick={onClose}>
        x
      </div>
      <img src={user.avatarUrl} className="share-dialog__avatar" />
      <input value={url} readOnly />
      <button onClick={copy}>
        <svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 2h9v9H2z" /></svg>
      </button>
      <span style={{ color: copied ? "#2e7d32" : "#c62828" }}>●</span>
      <div dangerouslySetInnerHTML={{ __html: note }} />
      <a href="#" onClick={() => window.open(url)}>Open link</a>
      {scene.elements.length > 100 ? (scene.elements.length > 500 ? "Huge scene" : "Large scene") : ""}
      <button onClick={copyAgain} tabIndex={-1}>Copy again</button>
    </div>
  );
}
