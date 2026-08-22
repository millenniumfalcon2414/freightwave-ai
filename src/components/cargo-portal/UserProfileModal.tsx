import React from "react";
import {
  User,
  Building2,
  Phone,
  Mail,
  FileText,
  ShieldCheck,
  X,
  Package,
  Layers,
} from "lucide-react";
import { UserProfile } from "@/types/cargo-portal";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
}

export function UserProfileModal({ isOpen, onClose, userProfile }: UserProfileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-base shadow-sm">
              {userProfile.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base">{userProfile.name}</h3>
              <p className="text-xs text-muted-foreground">{userProfile.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Profile Attributes */}
        <div className="space-y-2.5 text-xs">
          <div className="rounded-xl border border-border bg-surface-2/40 p-3 space-y-1">
            <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
              <Building2 className="size-3 text-blue-600" />
              <span>Registered Consignor Company</span>
            </div>
            <div className="font-bold text-foreground text-sm">{userProfile.company}</div>
            <div className="text-[10px] text-muted-foreground">GSTIN: {userProfile.gstin}</div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-border bg-surface-2/40 p-3 space-y-0.5">
              <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                <Mail className="size-3 text-blue-600" />
                <span>Email Address</span>
              </div>
              <div className="font-medium text-foreground truncate">{userProfile.email}</div>
            </div>

            <div className="rounded-xl border border-border bg-surface-2/40 p-3 space-y-0.5">
              <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                <Phone className="size-3 text-emerald-600" />
                <span>Contact Phone</span>
              </div>
              <div className="font-medium text-foreground font-mono">{userProfile.phone}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-border bg-surface-2/40 p-3 space-y-0.5">
              <div className="text-[10px] uppercase font-bold text-muted-foreground">
                Account Tier
              </div>
              <div className="font-bold text-blue-600">{userProfile.accountType}</div>
            </div>

            <div className="rounded-xl border border-border bg-surface-2/40 p-3 space-y-0.5">
              <div className="text-[10px] uppercase font-bold text-muted-foreground">
                2026 Rakes Booked
              </div>
              <div className="font-mono font-bold text-foreground">
                {userProfile.totalShipments2026} Consignments
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <button
            onClick={onClose}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
