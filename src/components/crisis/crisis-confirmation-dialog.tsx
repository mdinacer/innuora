"use client";

import React, { useCallback } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  isCrisis: boolean;

  onConfirmCrisis: (value: boolean) => void;
}

const CrisisConfirmationDialog: React.FC<Props> = ({ isCrisis = false, onConfirmCrisis }) => {
  const handleOpenChange = useCallback(onConfirmCrisis, [onConfirmCrisis]);

  return (
    <Dialog open={isCrisis} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-6 sm:p-8 rounded-[2rem] bg-background">
        <DialogHeader className="mt-4">
          <DialogTitle className="text-xl sm:text-2xl">I want to make sure you're safe</DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-muted-foreground">
            I noticed some signals that concern me. I need to pause and ask directly:
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-8">
          <div className="rounded-lg bg-muted border border-border p-5">
            <p className="text-base font-medium text-muted-foreground text-center">
              Are you in immediate danger right now, or thinking about harming yourself?
            </p>
          </div>

          <div className="flex sm:flex-col gap-y-4">
            <Button size={"lg"}>Yes, I need help now</Button>
            <DialogClose asChild>
              <Button size={"lg"} variant="outline">
                No, I'm safe to continue
              </Button>
            </DialogClose>
          </div>
        </div>
        <DialogFooter>
          <div className="pt-2 border-t border-b-border">
            <p className="text-xs text-center text-muted-foreground">
              If you're unsure, please choose "I need help now". it's always better to connect with support.
            </p>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CrisisConfirmationDialog;
