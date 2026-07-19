import { getThemeSettings } from "@/lib/theme";
import { ThemeForm } from "@/components/theme-form";

export const dynamic = "force-dynamic";

export default async function ThemePage() {
  const current = await getThemeSettings();

  return (
    <>
      <h1 className="font-display text-2xl text-grey-900">Theme</h1>
      <p className="mt-1 text-sm text-grey-500">
        Brand colors apply site-wide without a redeploy (stored in{" "}
        <code>site_settings</code>). Fonts stay code-managed for now.
      </p>
      <ThemeForm current={current} />
    </>
  );
}
