import { useState } from "react";

const customerServiceLinks = [
  "Track Order",
  "Locate Our Store",
  "Terms & Conditions",
  "Shipping & Delivery Policy",
  "Privacy Policy",
  "Disclaimer Policy",
  "Return & Exchange Policy",
];

const quickLinks = [
  "RETURN & EXCHANGE REQUEST",
  "Contact Us!",
  "Frequently Asked Questions",
  "We Are Hiring!",
  "Terms of use",
  "Wholesale Enquiries",
];

const shopLinks = [
  "Suta Earth",
  "About Us",
  "Franchise Enquiry",
  "Affiliate Program",
  "Sarees and Blouses Under 3000",
  "Products Under 4000",
  "Dresses Under 3000",
];

export default function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-charcoal text-paper">
      {/* Newsletter */}
      <div className="border-b border-paper/10">
        <div className="max-w-[1400px] mx-auto px-6 py-16 text-center">
          <h3 className="font-serif text-3xl md:text-4xl italic mb-4">
            Drop us a line
          </h3>
          <p className="text-paper/60 font-sans text-sm mb-8">
            Sign up to our newsletter to receive exclusive offers.
          </p>
          <div className="flex max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 bg-transparent border-b border-paper/30 py-3 text-paper font-sans text-sm placeholder:text-paper/40 focus:outline-none focus:border-ochre transition-colors"
            />
            <button className="ml-4 bg-paper text-charcoal px-6 py-3 text-xs uppercase tracking-[2px] font-sans font-medium hover:bg-ochre hover:text-paper transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Links Grid */}
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Customer Service */}
          <div>
            <h4 className="text-paper text-xs uppercase tracking-[2px] font-sans font-semibold mb-6">
              Customer Service
            </h4>
            <ul className="space-y-3">
              {customerServiceLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-paper/60 font-sans text-[13px] hover:text-ochre transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-paper text-xs uppercase tracking-[2px] font-sans font-semibold mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className={`font-sans text-[13px] hover:text-ochre transition-colors ${
                      link === "We Are Hiring!"
                        ? "text-red-400"
                        : "text-paper/60"
                    }`}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-paper text-xs uppercase tracking-[2px] font-sans font-semibold mb-6">
              About
            </h4>
            <p className="text-paper/60 font-sans text-sm leading-relaxed mb-6">
              Suta combines India's centuries-old weaving traditions with
              contemporary style — so that what looks good, feels good too.
            </p>
            <div className="space-y-2">
              <p className="text-paper/60 font-sans text-sm">
                Toll Free:{" "}
                <a href="tel:080-456-80200" className="text-ochre hover:underline">
                  080-456-80200
                </a>
              </p>
              <p className="text-paper/60 font-sans text-sm">
                Email:{" "}
                <a href="mailto:info@suta.in" className="text-ochre hover:underline">
                  info@suta.in
                </a>
              </p>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-paper text-xs uppercase tracking-[2px] font-sans font-semibold mb-6">
              Shop
            </h4>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-paper/60 font-sans text-[13px] hover:text-ochre transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-paper/10">
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Social Icons */}
            <div className="flex items-center gap-4">
              {["Facebook", "X", "Instagram", "Pinterest", "YouTube", "LinkedIn"].map(
                (social) => (
                  <a
                    key={social}
                    href="#"
                    className="text-paper/40 hover:text-paper transition-colors text-xs font-sans"
                  >
                    {social === "X" ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    ) : social === "Instagram" ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                      </svg>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider">{social[0]}</span>
                    )}
                  </a>
                )
              )}
            </div>

            {/* Copyright */}
            <p className="text-paper/40 font-sans text-[11px] uppercase tracking-wider text-center">
              COPYRIGHT 2026 &copy; SUTA PRIVATE LIMITED. ALL RIGHTS RESERVED.
            </p>
          </div>

          {/* Dipped in Love */}
          <div className="text-center mt-6 pb-4">
            <p className="text-paper/40 font-sans text-xs uppercase tracking-[3px]">
              DIPPED IN LOVE <span className="text-red-400">&#9829;</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
