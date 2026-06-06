"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowUp, ArrowDown, Save, Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DIFFICULTIES } from "@/lib/validations";
import type { GameDefinition, ItemField } from "@/lib/games/registry";
import { saveGame } from "@/app/admin/games/actions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = Record<string, any>;

interface Initial {
  description: string;
  difficulty: string;
  isActive: boolean;
  thumbnailUrl: string;
  thumbnailPublicId: string;
  items: Item[];
}

/** Cloudinary key pair for a media field. */
function mediaKeys(type: ItemField["type"]) {
  if (type === "image") return { urlKey: "imageUrl", idKey: "imagePublicId" };
  return { urlKey: "audioUrl", idKey: "audioPublicId" };
}

function blankItem(fields: ItemField[]): Item {
  const item: Item = {};
  for (const f of fields) {
    if (f.type === "number") item[f.name] = 0;
    else if (f.type === "tags") item[f.name] = [];
    else if (f.type === "boolean") item[f.name] = false;
    else if (f.type === "image" || f.type === "audio") {
      const { urlKey, idKey } = mediaKeys(f.type);
      item[urlKey] = "";
      item[idKey] = "";
    } else if (f.type === "select") item[f.name] = f.options?.[0] ?? "";
    else item[f.name] = "";
  }
  return item;
}

async function uploadTo(slug: string, file: File): Promise<{ url: string; publicId: string } | null> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", slug);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    toast.error(data.error ?? "Upload failed.");
    return null;
  }
  return { url: data.url, publicId: data.publicId };
}

export function GameEditor({
  def,
  initial,
  categoryTitle,
}: {
  def: GameDefinition;
  initial: Initial;
  categoryTitle: string;
}) {
  const router = useRouter();
  const [description, setDescription] = React.useState(initial.description);
  const [difficulty, setDifficulty] = React.useState(initial.difficulty);
  const [isActive, setIsActive] = React.useState(initial.isActive);
  const [thumbnailUrl, setThumbnailUrl] = React.useState(initial.thumbnailUrl);
  const [thumbnailPublicId, setThumbnailPublicId] = React.useState(initial.thumbnailPublicId);
  const [items, setItems] = React.useState<Item[]>(initial.items);
  const [saving, setSaving] = React.useState(false);

  function patchItem(index: number, patch: Item) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }
  function addItem() {
    setItems((prev) => [...prev, blankItem(def.fields)]);
  }
  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }
  function move(index: number, dir: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }

  async function onSave() {
    setSaving(true);
    const res = await saveGame(def.slug, {
      description,
      difficulty,
      isActive,
      thumbnailUrl,
      thumbnailPublicId,
      content: { [def.itemsKey]: items },
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Saved");
      router.refresh();
    } else {
      toast.error(res.error ?? "Failed to save.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{def.title}</h1>
          <p className="text-sm text-muted-foreground">{categoryTitle}</p>
        </div>
        <Button onClick={onSave} disabled={saving}>
          {saving ? <Loader2 className="animate-spin" /> : <Save />} Save
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Game settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                {DIFFICULTIES.map((d) => <option key={d} value={d} className="capitalize">{d}</option>)}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <label className="flex h-10 items-center gap-2 rounded-lg border px-3 text-sm">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="size-4" />
                {isActive ? "Active (visible to players)" : "Inactive (hidden)"}
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Thumbnail</Label>
            <MediaInput
              kind="image"
              slug={def.slug}
              url={thumbnailUrl}
              onChange={(url, id) => { setThumbnailUrl(url); setThumbnailPublicId(id); }}
            />
            {thumbnailPublicId ? <p className="text-xs text-muted-foreground">Stored in Cloudinary.</p> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Content — {items.length} {items.length === 1 ? def.itemNoun : `${def.itemNoun}s`}</CardTitle>
          <Button variant="outline" size="sm" onClick={addItem}><Plus /> Add {def.itemNoun}</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No {def.itemNoun}s yet. Add one to get started.
            </p>
          ) : (
            items.map((item, index) => (
              <div key={index} className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{def.itemNoun} {index + 1}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up"><ArrowUp className="size-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label="Move down"><ArrowDown className="size-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(index)} aria-label="Delete"><Trash2 className="size-4 text-destructive" /></Button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  {def.fields.map((field) => (
                    <div key={field.name} className={field.type === "textarea" || field.type === "image" || field.type === "audio" ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}>
                      <Label className="text-xs">
                        {field.label}{field.required ? " *" : ""}
                        {field.help ? <span className="ml-1 font-normal text-muted-foreground">— {field.help}</span> : null}
                      </Label>
                      <FieldInput field={field} item={item} slug={def.slug} onPatch={(patch) => patchItem(index, patch)} />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saving}>
          {saving ? <Loader2 className="animate-spin" /> : <Save />} Save changes
        </Button>
      </div>
    </div>
  );
}

function FieldInput({
  field,
  item,
  slug,
  onPatch,
}: {
  field: ItemField;
  item: Item;
  slug: string;
  onPatch: (patch: Item) => void;
}) {
  if (field.type === "image" || field.type === "audio") {
    const { urlKey, idKey } = mediaKeys(field.type);
    return (
      <MediaInput
        kind={field.type}
        slug={slug}
        url={item[urlKey] ?? ""}
        onChange={(url, id) => onPatch({ [urlKey]: url, [idKey]: id })}
      />
    );
  }
  if (field.type === "textarea") {
    return <Textarea value={item[field.name] ?? ""} onChange={(e) => onPatch({ [field.name]: e.target.value })} rows={3} />;
  }
  if (field.type === "number") {
    return <Input type="number" value={item[field.name] ?? 0} onChange={(e) => onPatch({ [field.name]: Number(e.target.value) })} placeholder={field.placeholder} />;
  }
  if (field.type === "select") {
    return (
      <Select value={item[field.name] ?? ""} onChange={(e) => onPatch({ [field.name]: e.target.value })}>
        {(field.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
      </Select>
    );
  }
  if (field.type === "boolean") {
    return (
      <label className="flex h-10 items-center gap-2 rounded-lg border px-3 text-sm">
        <input type="checkbox" checked={!!item[field.name]} onChange={(e) => onPatch({ [field.name]: e.target.checked })} className="size-4" />
        {item[field.name] ? "True" : "False"}
      </label>
    );
  }
  if (field.type === "tags") {
    const value = Array.isArray(item[field.name]) ? item[field.name].join(", ") : "";
    return (
      <Input
        value={value}
        onChange={(e) => onPatch({ [field.name]: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
        placeholder={field.placeholder ?? "Comma-separated"}
      />
    );
  }
  return <Input value={item[field.name] ?? ""} onChange={(e) => onPatch({ [field.name]: e.target.value })} placeholder={field.placeholder} />;
}

/** Upload + URL-paste + preview + remove for an image or audio asset. */
function MediaInput({
  kind,
  slug,
  url,
  onChange,
}: {
  kind: "image" | "audio";
  slug: string;
  url: string;
  onChange: (url: string, publicId: string) => void;
}) {
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const res = await uploadTo(slug, file);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    if (res) onChange(res.url, res.publicId);
  }

  return (
    <div className="space-y-2">
      {url ? (
        <div className="flex items-center gap-3 rounded-lg border p-2">
          {kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="preview" className="h-14 w-14 rounded object-cover" />
          ) : (
            <audio controls src={url} className="h-9" />
          )}
          <span className="flex-1 truncate text-xs text-muted-foreground">{url}</span>
          <Button type="button" variant="ghost" size="icon" onClick={() => onChange("", "")} aria-label="Remove">
            <X className="size-4 text-destructive" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="animate-spin" /> : <Upload />} Upload {kind}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept={kind === "image" ? "image/*" : "audio/*"}
            onChange={onFile}
            className="hidden"
          />
          <span className="text-xs text-muted-foreground">or paste a URL:</span>
          <Input
            value={url}
            onChange={(e) => onChange(e.target.value, "")}
            placeholder="https://…"
            className="h-9 w-56"
          />
        </div>
      )}
    </div>
  );
}
