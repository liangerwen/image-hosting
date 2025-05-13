import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "./ui/button";
import { useState } from "react";

export interface PopoverConfirmProps {
  trigger?: React.ReactNode;
  children?: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
}

function PopoverConfirm({
  trigger,
  children,
  onConfirm,
  onCancel,
}: PopoverConfirmProps) {
  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState(false);
  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        if (!disabled) {
          setOpen(o);
        }
      }}
    >
      <PopoverTrigger>{trigger}</PopoverTrigger>
      <PopoverContent className="text-sm">
        {children}
        <div className="flex justify-end items-center gap-1">
          <Button
            size="sm"
            variant="destructive"
            className="text-xs h-auto py-1"
            onClick={async () => {
              setDisabled(true);
              try {
                await onConfirm?.();
              } finally {
                setDisabled(false);
                setOpen(false);
              }
            }}
          >
            确定
          </Button>
          <PopoverClose>
            <Button
              size="sm"
              variant="secondary"
              className="text-xs h-auto py-1"
              onClick={onCancel}
              disabled={disabled}
            >
              取消
            </Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default PopoverConfirm;
