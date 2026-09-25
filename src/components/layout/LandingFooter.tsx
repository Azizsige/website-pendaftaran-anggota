import Link from "next/link";

export default function LandingFooter() {
  return (
    <footer className="bg-white w-full border-t border-[#bbcabf]/20 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center md:items-start">
          <p className="text-[#505f76] text-sm">
            © 2024 Membership System. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <Link
            href="#"
            className="text-[#3c4a42] hover:text-[#006c49] underline transition-opacity"
          >
            Privacy Policy
          </Link>
          <Link
            href="#"
            className="text-[#3c4a42] hover:text-[#006c49] underline transition-opacity"
          >
            Terms of Service
          </Link>
          <Link
            href="#"
            className="text-[#3c4a42] hover:text-[#006c49] underline transition-opacity"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </footer>
  );
}
