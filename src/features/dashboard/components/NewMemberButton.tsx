"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { UserPlus } from "lucide-react";

const AddMemberDrawer = dynamic(
  () =>
    import("@/features/members/components/AddMemberDrawer").then(
      (mod) => mod.AddMemberDrawer
    ),
  { ssr: false }
);

export default function NewMemberButton() {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setHasOpened(true);
          setOpen(true);
        }}
        className="h-11 min-h-[44px] w-full sm:w-auto px-4 bg-[#006c49] dark:bg-[#057a55] text-white font-semibold text-sm rounded-[10px] hover:bg-[#005236] dark:hover:bg-[#046c4e] transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0d1412] shrink-0"
      >
        <UserPlus className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>Tambah Anggota</span>
      </button>
      {hasOpened && <AddMemberDrawer open={open} onOpenChange={setOpen} />}
    </>
  );
}
