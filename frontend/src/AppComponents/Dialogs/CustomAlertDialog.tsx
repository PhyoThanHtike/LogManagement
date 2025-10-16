// src/AppComponents/Dialogs/CustomAlertDialog.tsx
import React from "react";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type CustomAlertDialogProps = {
  /** The element that triggers the alert (e.g., a button) */
  trigger: React.ReactNode;
  description?: string;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  // Accept a callback (no args). The caller can close-over an id if needed.
  onDelete?: () => void;
  onLogOut?: () => void;
  onConfirm?: () => void;
};

export const CustomAlertDialog: React.FC<CustomAlertDialogProps> = ({
  trigger,
  title = "Are you sure?",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onDelete,
  onLogOut,
  onConfirm,
}) => {
  // Figure out which function to run on confirmation
  const handleConfirm = () => {
    if (onDelete) return onDelete();
    if (onLogOut) return onLogOut();
    if (onConfirm) return onConfirm();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent className={cn("max-w-sm rounded-2xl border border-border bg-background shadow-lg")}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">{title}</AlertDialogTitle>
            {description && (
              <AlertDialogDescription className="text-sm text-muted-foreground">
                {description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-4 flex justify-end space-x-2">
            <AlertDialogCancel className="rounded-xl border border-input bg-background px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition">
              {cancelText}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="rounded-xl bg-destructive px-4 py-2 text-sm text-destructive-foreground hover:bg-destructive/90 transition"
            >
              {confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </motion.div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CustomAlertDialog;
