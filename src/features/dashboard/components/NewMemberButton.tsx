"use client";

import React, { useState } from "react";
import { DrawerTrigger } from "@/components/ui/drawer";
import { AddMemberDrawer } from "@/features/members/components/AddMemberDrawer";

export default function NewMemberButton() {
  const [open, setOpen] = useState(false);

  return (
    <AddMemberDrawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button className="px-4 py-2 bg-primary text-white font-medium text-sm rounded-lg hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer">
          <span className="material-symbols-outlined text-[18px]">add</span> New Member
        </button>
      </DrawerTrigger>
    </AddMemberDrawer>
  );
}
