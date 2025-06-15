
import React from "react";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

interface BrandHeaderProps {
  onContactClick: () => void;
}

const BrandHeader: React.FC<BrandHeaderProps> = ({ onContactClick }) => (
  <div className="text-center mb-8">
    <div className="flex items-center justify-center gap-2 mb-2">
      <h1 className="text-3xl font-bold text-white">
        NevUp
      </h1>
      <Button
        type="button"
        variant="outline"
        className="border-gray-600 text-gray-300 hover:bg-gray-700 px-2 py-1 h-auto"
        onClick={onContactClick}
        style={{ lineHeight: 1.1, fontSize: "0.9rem" }}
      >
        <Mail className="h-4 w-4 mr-1" />
        Contact Us
      </Button>
    </div>
    <p className="text-gray-400">
      Analyze your emotional patterns and improve your trading decisions
    </p>
  </div>
);

export default BrandHeader;
