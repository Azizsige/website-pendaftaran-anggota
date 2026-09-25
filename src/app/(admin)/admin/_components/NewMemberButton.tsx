"use client";

import React, { useState } from "react";
import { DrawerTrigger } from "@/components/ui/drawer";
import { AddMemberDrawer } from "@/app/(admin)/admin/members/_components/AddMemberDrawer";

export default function NewMemberButton() {
  const [open, setOpen] = useState(false);

  return (
    <AddMemberDrawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button className="px-md py-sm bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-on-primary-fixed transition-colors shadow-sm flex items-center gap-xs cursor-pointer">
          <span className="material-symbols-outlined text-[18px]">add</span> New Member
        </button>
      </DrawerTrigger>
    </AddMemberDrawer>
  );
}
