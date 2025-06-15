
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

interface ContactEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContactEmailModal: React.FC<ContactEmailModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-sm rounded-lg bg-[#232833]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" /> Contact NevUp
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Reach our team directly at:
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-2 p-2">
          <span className="bg-gray-800 text-white font-mono text-sm px-3 py-2 rounded-md select-all">nevupai@gmail.com</span>
        </div>
        <DialogFooter>
          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContactEmailModal;
