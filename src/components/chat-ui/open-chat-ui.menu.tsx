"use client";

import { useCallback, useMemo, useState } from "react";
import { EllipsisVerticalIcon, FileTextIcon, MinusCircleIcon, RotateCcwIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type ActionData = {
  label: string;

  dialog: {
    title: string;
    messages: string[];
    actions: {
      confirm: string;
      cancel: string;
    };
  };
};
type Action = "reset" | "end" | "export";

interface Props {
  disabled?: boolean;
  onAction: (action: Action) => void;
}

const OpenChatUIMenu = ({ onAction, disabled }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogState, setDialogState] = useState<Action | null>(null);
  const { t, i18n } = useTranslation("pages", { keyPrefix: "chat-ui.open-chat.actions" });

  const actions: Record<Action, ActionData> = useMemo(
    () => ({
      reset: t("reset_session", { returnObjects: true }) as ActionData,
      end: t("end_session", { returnObjects: true }) as ActionData,
      export: t("export_session", { returnObjects: true }) as ActionData,
    }),
    [t]
  );

  const handleActionSelect = (action: Action | null) => {
    setDialogState(action);
    setIsOpen(true);
  };

  const handleDialogClose = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      setDialogState(null);
    }, 300);
  }, []);

  const handleDialogConfirm = useCallback(() => {
    handleDialogClose();
    onAction(dialogState!);
  }, [dialogState, handleDialogClose, onAction]);
  const dialogContent = useMemo(() => (dialogState ? actions[dialogState].dialog : null), [actions, dialogState]);
  return (
    <>
      <DropdownMenu dir={i18n.dir()}>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <button
            disabled={disabled}
            aria-label="Open chat actions"
            className={cn(
              "menu-button",
              "size-9 bg-inn-bg-input",
              "flex items-center justify-center",
              "border-none rounded-xl cursor-pointer",
              "transition-all duration-300 ease-in",
              "hover:bg-inn-border-light",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <EllipsisVerticalIcon className="size-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-inn-bg-card">
          <DropdownMenuItem
            onClick={() => {
              handleActionSelect("export");
            }}
          >
            <FileTextIcon />
            {actions.export.label}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              handleActionSelect("reset");
            }}
          >
            <RotateCcwIcon />
            {actions.reset.label}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleActionSelect("end")}>
            <MinusCircleIcon />
            {actions.end.label}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isOpen} onOpenChange={handleDialogClose}>
        <AlertDialogContent className="bg-inn-bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogContent?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogContent?.messages.map((message, index) => (
                <span className="block mb-1" key={index}>
                  {message}
                </span>
              ))}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{dialogContent?.actions.cancel}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-inn-bg-accent text-inn-text-accent hover:bg-inn-bg-accent-dark"
              onClick={handleDialogConfirm}
            >
              {dialogContent?.actions.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default OpenChatUIMenu;
