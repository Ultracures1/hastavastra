import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { adminApi, type SiteSettings, type BannerSettings } from "@/lib/api";
import { AdminPageHeader } from "../AdminApp";
import ImageField from "../components/ImageField";

function SaveButton({
  onSave,
}: {
  onSave: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  return (
    <Button
      disabled={saving}
      onClick={async () => {
        setSaving(true);
        try {
          await onSave();
          toast.success("Saved");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Save failed");
        } finally {
          setSaving(false);
        }
      }}
    >
      {saving ? "Saving…" : "Save"}
    </Button>
  );
}

function BannerCard({
  title,
  description,
  banner,
  onChange,
  onSave,
  showSubtitle = true,
}: {
  title: string;
  description: string;
  banner: BannerSettings;
  onChange: (b: BannerSettings) => void;
  onSave: () => Promise<void>;
  showSubtitle?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Heading</Label>
          <Input
            value={banner.title}
            onChange={(e) => onChange({ ...banner, title: e.target.value })}
          />
        </div>
        {showSubtitle && (
          <div className="space-y-2">
            <Label>Subheading</Label>
            <Input
              value={banner.subtitle || ""}
              onChange={(e) => onChange({ ...banner, subtitle: e.target.value })}
            />
          </div>
        )}
        <div className="space-y-2">
          <Label>Button text</Label>
          <Input
            value={banner.cta || ""}
            onChange={(e) => onChange({ ...banner, cta: e.target.value })}
          />
        </div>
        <ImageField
          label="Background image"
          value={banner.image}
          onChange={(url) => onChange({ ...banner, image: url })}
        />
      </CardContent>
      <CardFooter>
        <SaveButton onSave={onSave} />
      </CardFooter>
    </Card>
  );
}

export default function ContentPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    adminApi
      .getSettings()
      .then(setSettings)
      .catch((err) => toast.error(err.message));
  }, []);

  if (!settings) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const set = (patch: Partial<SiteSettings>) =>
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev));

  return (
    <div>
      <AdminPageHeader
        title="Site Content"
        description="Texts, banners and images across the homepage"
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle>Announcement bar</CardTitle>
            <CardDescription>
              Rotating messages at the very top of the site — one per line
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={4}
              value={(settings.announcement_messages || []).join("\n")}
              onChange={(e) =>
                set({ announcement_messages: e.target.value.split("\n") })
              }
            />
          </CardContent>
          <CardFooter>
            <SaveButton
              onSave={() =>
                adminApi
                  .saveSettings({
                    announcement_messages: settings.announcement_messages
                      .map((m) => m.trim())
                      .filter(Boolean),
                  })
                  .then(() => {})
              }
            />
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Marquee strip</CardTitle>
            <CardDescription>Scrolling ticker text under the hero</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={4}
              value={settings.marquee_text}
              onChange={(e) => set({ marquee_text: e.target.value })}
            />
          </CardContent>
          <CardFooter>
            <SaveButton
              onSave={() =>
                adminApi
                  .saveSettings({ marquee_text: settings.marquee_text })
                  .then(() => {})
              }
            />
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hero section</CardTitle>
            <CardDescription>The big section at the top of the page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Small line</Label>
                <Input
                  value={settings.hero.prefix}
                  onChange={(e) =>
                    set({ hero: { ...settings.hero, prefix: e.target.value } })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Big word</Label>
                <Input
                  value={settings.hero.title}
                  onChange={(e) =>
                    set({ hero: { ...settings.hero, title: e.target.value } })
                  }
                />
              </div>
            </div>
            <ImageField
              label="Main image"
              value={settings.hero.mainImage}
              onChange={(url) =>
                set({ hero: { ...settings.hero, mainImage: url } })
              }
            />
            <ImageField
              label="Fabric image (rotates on scroll)"
              value={settings.hero.fabricImage}
              onChange={(url) =>
                set({ hero: { ...settings.hero, fabricImage: url } })
              }
            />
          </CardContent>
          <CardFooter>
            <SaveButton
              onSave={() =>
                adminApi.saveSettings({ hero: settings.hero }).then(() => {})
              }
            />
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Section titles</CardTitle>
            <CardDescription>Headings of the product sections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(settings.section_titles || {}).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label className="text-xs text-muted-foreground">{key}</Label>
                <Input
                  value={value}
                  onChange={(e) =>
                    set({
                      section_titles: {
                        ...settings.section_titles,
                        [key]: e.target.value,
                      },
                    })
                  }
                />
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <SaveButton
              onSave={() =>
                adminApi
                  .saveSettings({ section_titles: settings.section_titles })
                  .then(() => {})
              }
            />
          </CardFooter>
        </Card>

        <BannerCard
          title="Promo banner"
          description="“Perfect Fit” banner after the first product section"
          banner={settings.promo_banner}
          onChange={(b) => set({ promo_banner: b })}
          onSave={() =>
            adminApi.saveSettings({ promo_banner: settings.promo_banner }).then(() => {})
          }
        />

        <BannerCard
          title="Most loved banner"
          description="Banner before the blouses section"
          banner={settings.most_loved_banner}
          onChange={(b) => set({ most_loved_banner: b })}
          onSave={() =>
            adminApi
              .saveSettings({ most_loved_banner: settings.most_loved_banner })
              .then(() => {})
          }
        />

        <BannerCard
          title="Fabric banner"
          description="Banner before the ready-to-wear section"
          banner={settings.fabric_banner}
          onChange={(b) => set({ fabric_banner: b })}
          onSave={() =>
            adminApi
              .saveSettings({ fabric_banner: settings.fabric_banner })
              .then(() => {})
          }
          showSubtitle={false}
        />

        <Card>
          <CardHeader>
            <CardTitle>“Featured in” logos</CardTitle>
            <CardDescription>Press names at the bottom — one per line</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={5}
              value={(settings.press_logos || []).join("\n")}
              onChange={(e) => set({ press_logos: e.target.value.split("\n") })}
            />
          </CardContent>
          <CardFooter>
            <SaveButton
              onSave={() =>
                adminApi
                  .saveSettings({
                    press_logos: settings.press_logos
                      .map((l) => l.trim())
                      .filter(Boolean),
                  })
                  .then(() => {})
              }
            />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
