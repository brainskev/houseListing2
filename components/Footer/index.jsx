import React from "react";
import Link from "next/link";
import { FaTwitter, FaInstagram, FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import BricklyLogo from "../Brand/BricklyLogo";
import NewsletterSignup from "./NewsletterSignup";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <BricklyLogo variant="mark" size="lg" className="text-brand-700" />
              {/* <span className="font-semibold text-brand-900">Brickly</span> */}
            </div>
            <p className="mt-4 text-sm text-slate-700">
              Your modern hub for property listings, expert advice, and local market insights.
            </p>
            <div className="mt-4 flex gap-3 text-slate-600">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="rounded-md border border-slate-300 p-2 hover:bg-slate-100">
                <FaTwitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-md border border-slate-300 p-2 hover:bg-slate-100">
                <FaInstagram />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="rounded-md border border-slate-300 p-2 hover:bg-slate-100">
                <FaFacebookF />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="rounded-md border border-slate-300 p-2 hover:bg-slate-100">
                <FaLinkedinIn />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Quick Links</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li><Link href="/properties">Properties</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Property Tools</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li><Link href="/properties/add">List a Property</Link></li>
              <li><Link href="/properties/saved">Saved Properties</Link></li>
              <li><Link href="/dashboard/user">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Legal</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li><Link href="/legal/privacy">Privacy Policy</Link></li>
              <li><Link href="/legal/terms">Terms of Service</Link></li>
            
            </ul>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-slate-900">Newsletter</h4>
              <p className="mt-2 text-xs text-slate-600">Get market updates and tips.</p>
              <div className="mt-3">
                <NewsletterSignup />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} Brickly. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
