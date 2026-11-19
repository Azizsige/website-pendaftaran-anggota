import { redirect } from "next/navigation";
import { readRegistrationReceiptCookie } from "@/lib/registration-receipt";
import { RegistrationSuccessClient } from "./_components/RegistrationSuccessClient";

export const dynamic = "force-dynamic";

const idDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

export default async function PendaftaranBerhasilPage() {
  const receipt = await readRegistrationReceiptCookie();

  if (!receipt) {
    redirect("/daftar");
  }

  const submittedDate = new Date(receipt.submittedAt);
  const formattedDate = Number.isNaN(submittedDate.getTime())
    ? idDateFormatter.format(new Date())
    : idDateFormatter.format(submittedDate);

  return (
    <RegistrationSuccessClient
      registrationNumber={receipt.registrationNumber}
      formattedDate={formattedDate}
    />
  );
}
