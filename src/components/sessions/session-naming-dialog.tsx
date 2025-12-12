"use client";

import { useCallback, useState } from "react";
import { Loader2Icon, RefreshCcwIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { generateSessionTitle } from "@/app/actions/session-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { APP_CONFIG } from "@/config/app";
import { useSessionStore } from "@/domains/session-persistence";
import { ConversationSession } from "@/domains/session-state/session-state.types";
import { AppLocales } from "@/lib/i18n";

interface Props {
  className?: string;
  session: ConversationSession;
  onSubmitted?: (data: { title: string; subtitle: string }) => void;
}

const SessionNamingDialog: React.FC<Props> = ({ session, onSubmitted }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(["pages/session_naming", "common"]);
  const [open, setOpen] = useState(true);
  const [isGenerating, setGenerating] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedLocale, setSelectedLocale] = useState(() => language as AppLocales);
  const [generatedData, setGeneratedData] = useState<{ title: string; subtitle: string } | null>(null);

  const handleGenerateData = useCallback(async () => {
    setGenerating(true);
    try {
      const messages = session.messages.slice(-6);
      const result = await generateSessionTitle(session.id, messages, selectedLocale);
      setGeneratedData(result.response);
    } catch (error) {
      setError(t("session_naming.errors.unexpected"));
      console.error(error);
    } finally {
      setGenerating(false);
    }
  }, [selectedLocale, session.id, session.messages, t]);

  const handleOnSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      if (!generatedData) return;
      const { title, subtitle } = generatedData;
      useSessionStore.getState().updateSession(session.id, {
        title,
        subtitle,
        updatedAt: new Date(),
      });
      setOpen(false);
      onSubmitted?.({ title, subtitle });
    } catch (error) {
      setError(t("session_naming.errors.submit"));
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  }, [generatedData, onSubmitted, session.id, t]);

  const handleDialogChange = useCallback((open: boolean) => {
    setOpen(open);
    if (!open) {
      setError(null);
      setGeneratedData(null);
      setGenerating(false);
      setSubmitting(false);
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button variant="outline">{t("session_naming.trigger")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card rounded-2xl border-border">
        <DialogHeader>
          <DialogTitle>{t("session_naming.title")}</DialogTitle>
          <DialogDescription>
            {t("session_naming.subtitle", {
              app_name: APP_CONFIG.name,
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="language">{t("session_naming.fields.language.label")}</Label>
            <Select value={selectedLocale} onValueChange={(value) => setSelectedLocale(value as AppLocales)}>
              <SelectTrigger id="language" className="w-full">
                <SelectValue placeholder={t("session_naming.fields.language.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {["en", "fr", "ar"]?.map((locale) => (
                    <SelectItem key={locale} value={locale}>
                      {t(`common:languages.${locale}`)}{" "}
                      {locale === language && (
                        <span className=" text-muted-foreground text-sm">
                          ({t("session_naming.placeholders.current")})
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">{t("session_naming.fields.language.description")}</p>
          </div>

          <div className=" bg-background p-4 rounded-2xl">
            <p className=" text-sm text-muted-foreground font-medium">{t("session_naming.placeholders.current")}</p>
            <div>
              <p className="font-semibold">{session.title}</p>
              {session.subtitle && <p className="text-sm text-muted-foreground">{session.subtitle}</p>}
            </div>
          </div>
          <div className=" bg-background p-4 rounded-2xl" dir={selectedLocale === "ar" ? "rtl" : "ltr"}>
            <p className=" text-sm text-muted-foreground font-medium">{t("session_naming.placeholders.generated")}</p>
            <div>
              <p className="font-semibold rtl:font-arabic">
                {generatedData?.title || t("session_naming.placeholders.title")}
              </p>
              <p className="text-sm text-muted-foreground rtl:font-arabic-body">
                {generatedData?.subtitle || t("session_naming.placeholders.subtitle")}
              </p>
            </div>
          </div>
          <p className="text-xs italic text-muted-foreground">{t("session_naming.notes.preview")}</p>

          <div>
            <Button disabled={isGenerating || isSubmitting} className="w-full" onClick={handleGenerateData}>
              {isGenerating ? <Loader2Icon className=" h-4 w-4 animate-spin" /> : <RefreshCcwIcon />}
              {t(`session_naming.buttons.${isGenerating ? "generating" : "generate"}`)}
            </Button>
          </div>

          {error ? (
            <div className="p-4 rounded-2xl text-center text-sm bg-destructive/20 border border-destructive/50">
              {error}
            </div>
          ) : (
            <div className="p-4 rounded-2xl text-center text-sm bg-accent/20 border border-accent/50">
              {t("session_naming.notes.credits")}
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={isGenerating || isSubmitting} variant="outline">
              {t("session_naming.buttons.cancel")}
            </Button>
          </DialogClose>
          <Button onClick={handleOnSubmit} disabled={isGenerating || isSubmitting || !generatedData} type="button">
            {t(`session_naming.buttons.${isSubmitting ? "applying" : "accept"}`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionNamingDialog;
