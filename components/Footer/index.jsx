import React from "react";
import Link from "next/link";
import { FaTwitter, FaInstagram, FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import BricklyLogo from "../Brand/BricklyLogo";
import NewsletterSignup from "./NewsletterSignup";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-6">
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-3">
              <BricklyLogo variant="mark" size="lg" className="text-brand-700" />
            </div>
            <p className="mt-3 text-sm md:text-base text-slate-700">
              Your modern hub for property listings, expert advice, and local market insights.
            </p>
            <div className="mt-3 flex gap-2 text-slate-600">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="rounded-md border border-slate-300 p-1.5 hover:bg-slate-100 text-sm">
                <FaTwitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-md border border-slate-300 p-1.5 hover:bg-slate-100 text-sm">
                <FaInstagram />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="rounded-md border border-slate-300 p-1.5 hover:bg-slate-100 text-sm">
                <FaFacebookF />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="rounded-md border border-slate-300 p-1.5 hover:bg-slate-100 text-sm">
                <FaLinkedinIn />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm md:text-base font-semibold text-slate-900">Quick Links</h4>
            <ul className="mt-2 md:mt-3 space-y-1 md:space-y-2 text-sm md:text-base text-slate-700">
              <li><Link href="/properties">Properties</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/testimonials">Share Review</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm md:text-base font-semibold text-slate-900">Property Tools</h4>
            <ul className="mt-2 md:mt-3 space-y-1 md:space-y-2 text-sm md:text-base text-slate-700">
              <li><Link href="/properties/add">List Property</Link></li>
              <li><Link href="/properties/saved">Saved</Link></li>
              <li><Link href="/dashboard/user">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm md:text-base font-semibold text-slate-900">Legal</h4>
            <ul className="mt-2 md:mt-3 space-y-1 md:space-y-2 text-sm md:text-base text-slate-700">
              <li><Link href="/legal/privacy">Privacy</Link></li>
              <li><Link href="/legal/terms">Terms</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm md:text-base font-semibold text-slate-900">Newsletter</h4>
            <p className="mt-1 md:mt-2 text-sm md:text-base text-slate-600">Get updates & tips.</p>
            <div className="mt-2 md:mt-3">
              <NewsletterSignup />
            </div>
          </div>
        </div>

        <div className="mt-6 md:mt-10 border-t border-slate-200 pt-4 md:pt-6 text-center text-sm md:text-base text-slate-600">
          © {new Date().getFullYear()} Brickly. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
