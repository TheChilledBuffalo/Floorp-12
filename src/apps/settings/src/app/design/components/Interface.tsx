import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/card.tsx";
import { Switch } from "@/components/common/switch.tsx";
import { useInterfaceDesigns } from "@/app/design/useInterfaceDesigns.ts";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import { ExternalLink, Palette } from "lucide-react";

export function Interface() {
  const { t } = useTranslation();
  const { getValues, setValue } = useFormContext();
  const interfaceOptions = useInterfaceDesigns();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="size-5" />
          {t("design.interface")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-base-content/70 mb-4">
              {t("design.interfaceDescription")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {interfaceOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex flex-col items-center rounded p-2 cursor-pointer relative hover:bg-base-200 ${getValues("design") === option.value
                    ? "bg-primary/10 text-base-content dark:bg-primary/15 dark:text-base-content border-1 border-primary/30"
                    : "border-1 border-secondary/10"
                    }`}
                >
                  <img
                    src={option.image}
                    alt={option.title}
                    className="w-40 h-24 mb-2 object-contain drop-shadow-sm"
                  />
                  <span className="text-sm font-medium">{option.title}</span>
                  <input
                    type="radio"
                    name="design"
                    value={option.value}
                    checked={getValues("design") === option.value}
                    onChange={() => setValue("design", option.value)}
                    className="hidden top-2 right-2"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-base font-medium mb-2">
              {t("design.otherInterfaceSettings")}
            </h3>
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-1">
                <label htmlFor="favicon-color">
                  {t("design.useFaviconColorToBackgroundOfNavigationBar")}
                </label>
              </div>
              <Switch
                id="favicon-color"
                checked={!!getValues("faviconColor")}
                onChange={(e) => setValue("faviconColor", e.target.checked)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
