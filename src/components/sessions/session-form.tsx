"use client";

import React, { useCallback, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { createSession } from "@/app/actions/session-actions";
import SwitchField from "@/components/input/switch-field";
import TextField from "@/components/input/text-field";
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
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Session } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { useEncryptedSessionStore } from "@/lib/ai/mirael-core/v2/stores/encrypted-sessions.store";
import { generateId } from "@/lib/chat/flow/generate-id";
import { useSessionServices } from "@/lib/points/simple-points";
import { SessionCreate, SessionCreateSchema } from "@/lib/zod/session-create.schema";

interface Props {
  className?: string;
  session?: Session;
  trigger?: React.ReactNode;
  onSubmit?: (session: Session) => void;
}

const SessionForm: React.FC<Props> = ({ session, trigger, onSubmit }) => {
  const [isOpen, setOpen] = useState(false);
  const { t } = useTranslation("pages", { keyPrefix: "sessions.form" });
  const encryptedStore = useEncryptedSessionStore();
  const { canAffordService, getServiceCost } = useSessionServices();

  const form = useForm<SessionCreate>({
    resolver: zodResolver(SessionCreateSchema),
    defaultValues: {
      title: session?.title ?? "",
      subtitle: session?.subtitle ?? "",
      autoUpdateTitle: session?.autoUpdateTitle ?? false,
      persistOnCloud: session?.persistOnCloud ?? false,
    },
  });

  const { control, handleSubmit } = form;
  const { isSubmitting } = form.formState;

  const isEdit = !!session;

  // Points service information
  const sessionAnalysisCost = getServiceCost("session_analysis");
  const canAffordAnalysis = canAffordService("session_analysis").canAfford;

  const data = useMemo(
    () => ({
      trigger: t(isEdit ? "dialogButton.edit" : "dialogButton.create"),
      title: t(isEdit ? "title.edit" : "title.create"),
      subtitle: t(isEdit ? "subtitle.edit" : "subtitle.create"),
      fields: {
        title: {
          label: t("fields.title.label"),
          placeholder: t("fields.title.placeholder"),
        },
        subtitle: {
          label: t("fields.subtitle.label"),
          placeholder: t("fields.subtitle.placeholder"),
        },
        aiSuggestedTitle: {
          label: t("fields.aiSuggestedTitle.label"),
          description: `${t("fields.aiSuggestedTitle.description")} (Cost: $${(sessionAnalysisCost / 100).toFixed(2)}${!canAffordAnalysis ? " - Insufficient Points" : ""})`,
        },
        persistOnCloud: {
          label: t("fields.persistOnCloud.label"),
          description: t("fields.persistOnCloud.description"),
        },
      },
      actions: {
        submit: t(isEdit ? "actions.submit.edit" : "actions.submit.create"),
        cancel: t("actions.cancel"),
      },
    }),
    [isEdit, t, sessionAnalysisCost, canAffordAnalysis]
  );

  const handleOnSubmit = useCallback(
    async (data: SessionCreate) => {
      const id = session?.id || generateId("Session");

      if (session) {
        // Update existing session
        const updatedSession = await encryptedStore.getSession(id);
        if (updatedSession) {
          await encryptedStore.updateSession(id, { ...updatedSession, ...data });
        }
      } else if (data.persistOnCloud) {
        // Create cloud session first
        const result = await createSession(data);
        if (result) {
          // Create local encrypted session
          await encryptedStore.createSession({
            id: result.id,
            title: result.title,
            subtitle: result.subtitle || undefined,
            autoUpdateTitle: result.autoUpdateTitle,
            persistOnCloud: true,
          });
        }
      } else {
        // Create local-only session
        await encryptedStore.createSession({
          id,
          title: data.title || generateId("Session"),
          subtitle: data.subtitle,
          autoUpdateTitle: data.autoUpdateTitle,
          persistOnCloud: data.persistOnCloud,
        });
      }

      // Get the updated session and call onSubmit
      const updatedSession = await encryptedStore.getSession(id);
      if (updatedSession) {
        onSubmit?.(updatedSession);
      }

      setOpen(false);
    },
    [onSubmit, session, encryptedStore]
  );
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <form>
        <DialogTrigger asChild>
          {trigger || (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-mir-bg-accent px-6 py-3 font-semibold text-white shadow transition hover:translate-y-[-1px] hover:shadow-lg"
            >
              <PlusIcon className="size-4" />
              {data.trigger}
            </button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] rounded-2xl bg-mir-bg-card">
          <Form {...form}>
            <form onSubmit={handleSubmit(handleOnSubmit)} className="grid gap-4 rtl:font-arabic-body">
              <DialogHeader className="rtl:text-right">
                <DialogTitle className="rtl:font-arabic">{data.title}</DialogTitle>
                <DialogDescription className="rtl:text-base">{data.subtitle}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-8 py-6">
                <TextField
                  control={control}
                  name="title"
                  label={data.fields.title.label}
                  placeholder={data.fields.title.placeholder}
                />
                <TextField
                  control={control}
                  name="subtitle"
                  label={data.fields.subtitle.label}
                  placeholder={data.fields.subtitle.placeholder}
                />
                <Separator />
                <SwitchField
                  control={control}
                  name="autoUpdateTitle"
                  label={data.fields.aiSuggestedTitle.label}
                  description={data.fields.aiSuggestedTitle.description}
                />

                <SwitchField
                  control={control}
                  name="persistOnCloud"
                  label={data.fields.persistOnCloud.label}
                  description={data.fields.persistOnCloud.description}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  {/* <Button variant="outline">{data.actions.cancel}</Button> */}
                  <button
                    type="button"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-2xl bg-mir-bg-card border border-mir-border-light px-6 py-3 font-semibold text-white shadow transition-all"
                  >
                    {data.actions.cancel}
                  </button>
                </DialogClose>
                {/* <Button type="submit">{data.actions.submit}</Button> */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-2xl bg-mir-bg-accent px-6 py-3 font-semibold text-white shadow transition-all"
                >
                  {isSubmitting && <Loader2Icon className="size-4 animate-spin" />}
                  {data.actions.submit}
                </button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default SessionForm;
