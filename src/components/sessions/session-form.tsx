"use client";

import React, { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { createSession, updateSession } from "@/app/actions/session-actions";
import SwitchField from "@/components/input/switch-field";
import TextField from "@/components/input/text-field";
import TextareaField from "@/components/input/textarea-field";
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
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { APP_CONFIG } from "@/config/app";
import { useSessionStore } from "@/domains/guidance-flow/stores/sessions-store";
import { SessionCreate, SessionCreateSchema, SessionMetadata } from "@/domains/guidance-flow/types/session-runtime";
import { EncryptedSession } from "@/domains/guidance-flow/types/session-server";
import { useAppUserStore } from "@/stores/app-user.store";

interface Props {
  className?: string;
  session?: EncryptedSession;
  trigger?: React.ReactNode;
  onSubmit?: (session: SessionCreate) => void;
  onSubmitted?: (session: EncryptedSession) => void;
}

const SessionForm: React.FC<Props> = ({ session, trigger, onSubmit, onSubmitted }) => {
  const [isOpen, setOpen] = useState(false);
  const { t } = useTranslation("pages/sessions", { keyPrefix: "sessions.form" });
  const sessionStore = useSessionStore();
  const user = useAppUserStore((state) => state.user);

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
          label: t("fields.aiSuggestedTitle.label", { app_name: APP_CONFIG.name }),
          description: t("fields.aiSuggestedTitle.description", { app_name: APP_CONFIG.name }),
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
    [isEdit, t]
  );

  const handleCreateSession = async (createInput: SessionCreate, userId: string): Promise<EncryptedSession> => {
    const { persistOnCloud = false } = createInput;

    const now = new Date();

    const newSession: EncryptedSession = {
      id: crypto.randomUUID(),
      userId: userId,
      title: createInput.title || "No Title",
      subtitle: createInput.subtitle || null,
      createdAt: now,
      updatedAt: now,
      autoUpdateTitle: createInput.autoUpdateTitle || false,
      persistOnCloud: createInput.persistOnCloud || false,
      metadata: {
        messageCount: 0,
        creditsUsed: 0,
        activeDurationMs: 0,
      } as SessionMetadata,
      messages: null,
    };

    if (persistOnCloud) {
      const { data, error } = await createSession({
        ...createInput,
      });
      if (error || !newSession) {
        throw new Error("Error creating session");
      }

      newSession.id = data.id;
      newSession.createdAt = data.createdAt;
      newSession.updatedAt = data.updatedAt;
    }

    console.log("Local Session", {
      createdAt: newSession.createdAt,
      updatedAt: newSession.updatedAt,
    });

    sessionStore.addSession(newSession);

    return newSession;
  };

  const handleUpdateSession = async (
    updateInput: SessionCreate,
    existing: EncryptedSession
  ): Promise<EncryptedSession> => {
    const { persistOnCloud = false } = updateInput;

    const now = new Date();
    existing.title = updateInput.title || existing.title;
    existing.subtitle = updateInput.subtitle ?? existing.subtitle;
    existing.autoUpdateTitle = updateInput.autoUpdateTitle ?? existing.autoUpdateTitle;
    existing.persistOnCloud = updateInput.persistOnCloud ?? existing.persistOnCloud;
    existing.updatedAt = now;

    if (persistOnCloud) {
      const { data, error } = await updateSession(existing.id, {
        title: existing.title,
        subtitle: existing.subtitle,
        autoUpdateTitle: existing.autoUpdateTitle,
      });

      if (error || !data) {
        throw new Error("Error updating session");
      }

      existing.updatedAt = data.updatedAt;
    }

    sessionStore.updateSession(existing.id, existing);
    return existing;
  };

  const handleOnSubmit = async (data: SessionCreate) => {
    if (!user) return;
    if (onSubmit) {
      onSubmit(data);
      return;
    }

    const isUpdate = !!session;

    const updatedSession = isUpdate
      ? await handleUpdateSession(data, session)
      : await handleCreateSession(data, user.id);

    if (updatedSession) {
      onSubmitted?.(updatedSession);
    }

    setOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <form>
        <DialogTrigger asChild>
          {trigger || (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-semibold text-white shadow transition hover:translate-y-[-1px] hover:shadow-lg"
            >
              <PlusIcon className="size-4" />
              {data.trigger}
            </button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] rounded-2xl bg-card">
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
                <TextareaField
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

                {!isEdit && (
                  <SwitchField
                    control={control}
                    name="persistOnCloud"
                    label={data.fields.persistOnCloud.label}
                    description={data.fields.persistOnCloud.description}
                  />
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  {/* <Button variant="outline">{data.actions.cancel}</Button> */}
                  <Button type="button" disabled={isSubmitting} variant="outline">
                    {data.actions.cancel}
                  </Button>
                </DialogClose>

                <Button type="submit" disabled={isSubmitting} variant="primary">
                  {isSubmitting && <Loader2Icon className="size-4 animate-spin" />}
                  {data.actions.submit}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default SessionForm;
