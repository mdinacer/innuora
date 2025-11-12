"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckIcon, ChevronsUpDownIcon, LocateFixedIcon, SearchIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "../ui/button";

interface Props {
  className?: string;
}

const CrisisContactFinder: React.FC<Props> = ({ className }) => {
  const { t } = useTranslation("pages/crisis", { keyPrefix: "crisis.finder" });
  const { t: tCountries } = useTranslation("countries");

  const countries = React.useMemo(() => {
    return (tCountries("countries", { returnObjects: true, defaultValue: "" }) || []) as {
      label: string;
      value: string;
    }[];
  }, [tCountries]);

  const [open, setOpen] = React.useState(false);

  const [location, setLocation] = useState<{ label: string; value: string } | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDetectLocation = async () => {
    setIsDetecting(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("no_support");
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const country = data.address.country || "";

          const countryValue = countries.find((cnt) => cnt.label.toLowerCase() === country.toLowerCase());
          if (!countryValue) {
            setError("failed");
          }
          setLocation(countryValue || null);
        } catch {
          setError("failed");
        } finally {
          setIsDetecting(false);
        }
      },
      (geoError) => {
        setError(geoError.code === 1 ? "denied" : "access");
        setIsDetecting(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
    );
  };

  const options = countries.map((country) => ({
    label: country.label,
    value: country.value,
  }));

  return (
    <div className={cn("flex flex-col gap-y-6", className)}>
      <div className="space-y-3">
        <label htmlFor="locationInput" className="block text-sm font-medium text-foreground">
          {t("label")}
        </label>

        <div className="flex sm:flex-row flex-col items-center gap-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="max-w-xl w-full justify-between"
              >
                {location ? options.find((item) => item.value === location.value)?.label : t("select_placeholder")}
                <ChevronsUpDownIcon className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-0 max-h-64 overflow-y-auto">
              <Command>
                <CommandInput placeholder={t("search_placeholder")} className="h-9" />
                <CommandList>
                  <CommandEmpty>{t("no_country_found")}</CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        className="capitalize"
                        key={`${option.label}-${option.value}`}
                        value={option.value}
                        onSelect={(currentValue) => {
                          const selectedLocation = options.find((item) => item.value === currentValue);
                          setLocation(selectedLocation || null);
                          setOpen(false);
                        }}
                        keywords={[option.label]}
                      >
                        {option.label}
                        <CheckIcon
                          className={cn("ml-auto", location?.value === option.value ? "opacity-100" : "opacity-0")}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <button
            type="button"
            id="detectLocation"
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="shrink-0 w-full sm:w-auto justify-center inline-flex gap-x-2 items-center rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted focus:ring-2 focus:ring-primary/40 transition-colors disabled:opacity-60"
            aria-label="Detect your location automatically"
          >
            <LocateFixedIcon className="size-4 shrink-0" />
            {t(isDetecting ? "detect_button.loading" : "detect_button.default")}
          </button>
        </div>

        <p id="locationHelp" className="text-xs text-muted-foreground leading-relaxed">
          {t("help_text")}
          {/* You can pick your country or tap <strong>Detect</strong> to let Innuora locate you. Your browser may ask for
          permission — that’s normal.{" "}
          <span className="block mt-1">
            Your location is used <strong>just once</strong> to suggest local crisis lines. It’s{" "}
            <strong>never stored or shared</strong>.
          </span> */}
        </p>

        {error && (
          <p className="text-xs text-red-500 mt-1" role="alert">
            {t(`error.${error}`)}
          </p>
        )}
      </div>

      <Link
        id="searchResources"
        aria-disabled={!location}
        target="_blank"
        referrerPolicy="no-referrer"
        className={cn(
          "",
          buttonVariants({ variant: "default", size: "lg" }),
          !location
            ? "pointer-events-none opacity-60 cursor-not-allowed"
            : "cursor-pointer pointer-events-auto opacity-100"
        )}
        href={`https://findahelpline.com/countries/${location?.value}/topics/suicidal-thoughts`}
      >
        <SearchIcon className="size-4 shrink-0" />
        {t("search_button")}
      </Link>
    </div>
  );
};

export default CrisisContactFinder;
