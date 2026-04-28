import Image from "next/image";
import Link from "next/link";

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/thehdpiks",
    text: "f",
    className: "bg-[#4267B2]",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/hdpiks/",
    text: "IG",
    className: "bg-[#E1306C]",
  },
  {
    label: "Pinterest",
    href: "https://www.pinterest.com/HDpiks/?actingBusinessId=869194934241189877",
    text: "p",
    className: "bg-[#BD081C]",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/111755280/",
    text: "in",
    className: "bg-[#0077B5]",
  },
];

export function AppFooter() {
  return (
    <footer className="mt-10 bg-[#221122] text-white">
      <div className="bg-black/30">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.5fr_0.8fr_0.8fr_1fr] lg:px-8">
          <div>
            <a
              href="https://hdpiks.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3"
            >
              <Image
                src="/logo.png"
                alt="HDpiks"
                width={150}
                height={40}
                className="block h-10 w-[150px] object-cover object-left"
              />
              <span className="text-lg font-semibold uppercase tracking-normal">
                GadgetHub Gallery
              </span>
            </a>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/85">
              Your go-to platform for high-quality images and videos, ready for use
              in your projects. Enjoy a diverse range of authentic visuals at your
              fingertips.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide">Explore</h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-white/85 underline-offset-4 hover:text-white hover:underline"
                >
                  Home
                </Link>
              </li>
              <li>
                <a
                  href="https://hdpiks.com/company/about-us"
                  className="text-white/85 underline-offset-4 hover:text-white hover:underline"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="https://hdpiks.com/company/contact-us"
                  className="text-white/85 underline-offset-4 hover:text-white hover:underline"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide">Legal</h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a
                  href="https://hdpiks.com/company/legal"
                  className="text-white/85 underline-offset-4 hover:text-white hover:underline"
                >
                  Legal
                </a>
              </li>
              <li>
                <a
                  href="https://hdpiks.com/company/help-center"
                  className="text-white/85 underline-offset-4 hover:text-white hover:underline"
                >
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide">Follow Us</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow HDpiks on ${link.label}`}
                  className={`grid size-10 place-items-center rounded-md border border-white/30 text-sm font-bold text-white ${link.className}`}
                >
                  {link.text}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl border-t border-white/20 px-4 py-6 text-center sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <span className="text-sm">Join us for exclusive content</span>
            <a
              href="https://hdpiks.com/signup"
              className="rounded-md border border-white/70 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-[#221122]"
            >
              Sign up!
            </a>
          </div>
        </div>

        <div className="bg-black/20 px-4 py-4 text-center text-sm">
          © 2026 HDpicks - Powered by{" "}
          <a
            href="https://jzarr.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline underline-offset-4"
          >
            JZARR IT COMPANY
          </a>
        </div>
      </div>
    </footer>
  );
}
