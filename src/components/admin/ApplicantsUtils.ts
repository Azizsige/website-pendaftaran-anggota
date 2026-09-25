export type Applicant = {
  id: string;
  joinDate: Date;
  status: string;
  phoneNumber: string | null;
  nim: string | null;
  placeOfBirth: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  address: string | null;
  faculty: string | null;
  major: string | null;
  batchYear: string | null;
  photoUrl: string | null;
  ktmImageUrl: string | null;
  documentUrl: string | null;
  adminNotes: string | null;
  user: {
    name: string | null;
    email: string | null;
  };
};

export const getStatusStyle = (status: string) => {
  switch (status.toUpperCase()) {
    case "PENDING":
      return "bg-[#fff8e1] text-[#f57f17] border border-[#f57f17]/20";
    case "ACTIVE":
      return "bg-primary/10 text-primary border border-primary/20";
    case "REJECTED":
      return "bg-error/10 text-error border border-error/20";
    case "SUSPENDED":
      return "bg-surface-container-highest text-on-surface-variant";
    default:
      return "bg-surface-container-highest text-on-surface-variant";
  }
};

export const formatId = (id: string) => {
  if (id.startsWith("REG-")) return id;
  return `REG-${id.slice(-8).toUpperCase()}`;
};
