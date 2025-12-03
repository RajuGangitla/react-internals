"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";



// ModalDialog - a simple dialog component
type ModalDialogProps = {
    onClose: () => void;
};

const ModalDialog = ({ onClose }: ModalDialogProps) => {
    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Example Modal Dialog</DialogTitle>
                    <DialogDescription>
                        This is a modal dialog from Chapter 1. Notice how opening and
                        closing this dialog causes the VerySlowComponent to re-render!
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                        The key insight here is that when <code className="rounded bg-muted px-1 py-0.5 text-xs">isOpen</code> state changes in
                        the parent App component, React re-renders the entire component tree
                        including the slow component.
                    </p>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        aria-label="Close dialog"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function ButtonWithDialog() {

    // Add some state
    const [isOpen, setIsOpen] = useState(false);

    const handleOpenDialog = () => {
        setIsOpen(true);
    };

    const handleCloseDialog = () => {
        setIsOpen(false);
    };
    return (
        <>
            {/* Add the button */}
            <Button
                onClick={handleOpenDialog}
                aria-label="Open dialog"
                tabIndex={0}
            >
                Open dialog
            </Button>

            {/* Add the dialog itself */}
            {isOpen ? <ModalDialog onClose={handleCloseDialog} /> : null}
        </>
    )
}