import Image from "next/image";

import { AppFooter } from "@/components/app-footer";
import { ImageUploader } from "@/components/image-uploader";

const navLinks = [
  { label: "Home", href: "https://hdpiks.com/" },
  { label: "Blog", href: "https://hdpiks.com/blog" },
];

export default function Home() {
  return (
    <main className="min-h-screen text-ink">
      <div className="border-b border-white/20 bg-[#221122] text-white">
        <div className="mx-auto flex min-h-[78px] w-full max-w-[1880px] items-center justify-between gap-6 px-5 sm:px-8">
         <a
  href="https://hdpiks.com/"
  className="mr-[18px] inline-flex shrink-0 items-center"
  aria-label="Open HDpiks"
>
  <Image
    src="/logo.png"
    alt="HDpiks"
    width={150}
    height={40}
    priority
    className="block h-10 w-[150px] object-cover object-left"
  />
</a>

          <nav className="hidden flex-1 items-center gap-6 text-base font-semibold lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="whitespace-nowrap text-white transition hover:text-purple-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-7 text-base font-semibold md:flex">
            <a
              href="https://hdpiks.com/pricing"
              className="text-white underline underline-offset-4 transition hover:text-purple-200"
            >
              Pricing
            </a>
            <a
              href="https://hdpiks.com/signin"
              className="text-white transition hover:text-purple-200"
            >
              Signin
            </a>
            <a
              href="https://hdpiks.com/signup"
              className="rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#c044b5] px-7 py-3 font-bold text-white shadow-sm transition hover:brightness-110"
            >
              Start Creating
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">
              Remove background
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
              Upload an image, choose Fast or HD processing, then download a
              transparent PNG.
            </p>
          </div>
          <div className="text-sm font-medium text-gray-500">
            PNG, JPG, JPEG, WebP
          </div>
        </section>
        <ImageUploader />
      </div>
      <AppFooter />
    </main>
  );
}
