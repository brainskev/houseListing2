'use client'
import React, { useEffect, useRef, useState } from "react";
import logo from "@/assets/images/logo-white.png";
import BricklyLogo from "@/components/Brand/BricklyLogo";
import profileDefault from "@/assets/images/profile.png";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import UnreadMessageCount from "../UnReadMessageCount";
import { FaKey, FaUser, FaSignOutAlt, FaBookmark, FaEnvelope, FaTh, FaNewspaper, FaInfoCircle, FaPhone } from "react-icons/fa";
import { useGlobalContext } from "@/context/GlobalContext";

const Navbar = () => {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const pathname = usePathname();
  const profileImage = session?.user?.image;
  const canManageListings = ["admin", "assistant"].includes(session?.user?.role);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);
  const { dashboardSidebarOpen, setDashboardSidebarOpen } = useGlobalContext();
  
  // Close profile dropdown on outside click or Esc
  useEffect(() => {
    const onMouseDown = (e) => {
      if (!isProfileMenuOpen) return;
      const menuEl = menuRef.current;
      const btnEl = buttonRef.current;
      if (!menuEl || !btnEl) return;
      if (!menuEl.contains(e.target) && !btnEl.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (!isProfileMenuOpen) return;
      if (e.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isProfileMenuOpen]);
  
  // Close mobile menu on outside click or Esc
  useEffect(() => {
    const onMouseDown = (e) => {
      if (!isMobileMenuOpen) return;
      const mobileMenuEl = mobileMenuRef.current;
      const mobileMenuBtnEl = mobileMenuButtonRef.current;
      if (!mobileMenuEl || !mobileMenuBtnEl) return;
      if (!mobileMenuEl.contains(e.target) && !mobileMenuBtnEl.contains(e.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (!isMobileMenuOpen) return;
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMobileMenuOpen]);
  
  const getDashboardPath = () => {
    if (!session?.user?.role) return "/dashboard/user";
    if (session.user.role === "admin") return "/dashboard/admin";
    if (session.user.role === "assistant") return "/dashboard/assistant";
    return "/dashboard/user";
  };
  const isDashboard = pathname?.startsWith("/dashboard");
  return (
    <nav className="bg-brand-700 border-b border-brand-500 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-20 items-center justify-between">
          {!isDashboard && (
          <div className="absolute inset-y-0 left-0 flex items-center md:hidden">
            {/* Mobile menu button*/}
            <button
              type="button"
              id="mobile-dropdown-button"
              className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              ref={mobileMenuButtonRef}
            >
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
            
          </div>
          )}
          {isDashboard && (
          <div className="absolute inset-y-0 left-0 flex items-center md:hidden">
            {/* Dashboard sidebar toggle */}
            <button
              type="button"
              className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-200 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-label="Toggle sidebar"
              onClick={() => setDashboardSidebarOpen(!dashboardSidebarOpen)}
            >
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Toggle sidebar</span>
              <svg
                className="block h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>
          )}
          <div className="flex flex-1 items-center justify-center md:items-stretch md:justify-start">
            {/* Logo */}
            <Link className="flex flex-shrink-0 items-center" href="/">
              <BricklyLogo variant="header" theme="light" size="md" />
            </Link>
            {/* Desktop Menu Hidden below md screens */}
            <div className="hidden md:ml-8 md:block">
              <div className="flex items-center space-x-1">
                <Link
                  href="/properties"
                  className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                    pathname === "/properties" ? "bg-white/20 text-white" : "text-brand-50 hover:bg-white/10"
                  }`}
                >
                  Browse
                </Link>
                <Link
                  href="/blog"
                  className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                    pathname?.startsWith("/blog") ? "bg-white/20 text-white" : "text-brand-50 hover:bg-white/10"
                  }`}
                >
                  <FaNewspaper className="text-base" /> Blog
                </Link>
                <Link
                  href="/about"
                  className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                    pathname === "/about" ? "bg-white/20 text-white" : "text-brand-50 hover:bg-white/10"
                  }`}
                >
                  <FaInfoCircle className="text-base" /> About Us
                </Link>
                <Link
                  href="/contact"
                  className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                    pathname === "/contact" ? "bg-white/20 text-white" : "text-brand-50 hover:bg-white/10"
                  }`}
                >
                  <FaPhone className="text-base" /> Contact
                </Link>
              </div>
            </div>
          </div>
          {/* Right Side Menu (Logged Out) */}
          {!session && (
            <div className="hidden md:block md:ml-6">
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-white border border-white/60 hover:bg-white hover:text-brand-700 rounded-md px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="text-brand-700 bg-white hover:bg-gray-100 rounded-md px-3 py-2 font-semibold"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}

          {/* Right Side Menu (Logged In) */}
          {session && (
            <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-2 md:static md:inset-auto md:ml-auto md:pr-0">
              {/* Dashboard link */}
              <Link
                href={getDashboardPath()}
                className="hidden sm:inline-flex items-center gap-2 rounded-md bg-brand-600 hover:bg-brand-800 text-white px-3 py-2 text-sm font-medium transition"
              >
                <FaTh className="text-base" /> Dashboard
              </Link>

              {/* Messages icon with badge */}
              <Link href="/messages" className="relative group">
                <button
                  type="button"
                  className="relative rounded-full bg-white/20 hover:bg-white/30 p-2 text-white focus:outline-none transition"
                >
                  <FaEnvelope className="h-5 w-5" />
                </button>
                <UnreadMessageCount session={session} />
              </Link>

              {/* Profile dropdown button */}
              <div className="relative ml-2">
                <button
                  type="button"
                  className="relative flex rounded-full bg-white/20 hover:bg-white/30 text-sm focus:outline-none transition overflow-hidden"
                  id="user-menu-button"
                  aria-expanded="false"
                  aria-haspopup="true"
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                  ref={buttonRef}
                >
                  <Image
                    className="h-8 w-8"
                    src={profileImage || profileDefault}
                    alt={session.user.name || "User"}
                    width={32}
                    height={32}
                  />
                </button>

                {/* Profile dropdown */}
                {isProfileMenuOpen && (
                  <div
                    id="user-menu"
                    className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-2xl bg-white/95 backdrop-blur shadow-xl ring-1 ring-black/5 py-1 border border-slate-200/70"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    tabIndex={-1}
                    ref={menuRef}
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{session.user.name}</p>
                      <p className="text-xs text-gray-500">{session.user.email}</p>
                    </div>

                    <Link
                      href={getDashboardPath()}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition sm:hidden"
                      role="menuitem"
                      tabIndex={-1}
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <FaTh /> Dashboard
                    </Link>

                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                      role="menuitem"
                      tabIndex={-1}
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <FaUser /> Your Profile
                    </Link>

                    <Link
                      href="/properties/saved"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                      role="menuitem"
                      tabIndex={-1}
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <FaBookmark /> Saved Properties
                    </Link>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        signOut();
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition border-t border-gray-100"
                      role="menuitem"
                      tabIndex={-1}
                    >
                      <FaSignOutAlt /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Mobile menu, show/hide based on menu state. */}
      {isMobileMenuOpen && (
        <div 
          id="mobile-menu" 
          className="md:hidden bg-gradient-to-b from-brand-700 to-brand-800 border-t border-brand-500/50 animate-in fade-in slide-in-from-top-2 duration-200"
          ref={mobileMenuRef}
        >
          <div className="px-4 py-4">
            {/* Main Navigation Section */}
            <div className="space-y-2 pb-4">
              <div className="px-2 py-1.5 text-xs font-semibold text-brand-200 uppercase tracking-wider opacity-75">
                Explore
              </div>
              <Link
                href="/properties"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  pathname === "/properties" 
                    ? "bg-white/25 text-white shadow-md" 
                    : "text-brand-50 hover:bg-white/15 hover:translate-x-1"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="text-lg">🏘️</span>
                <span className="font-medium">Browse Properties</span>
              </Link>
              <Link
                href="/blog"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  pathname?.startsWith("/blog") 
                    ? "bg-white/25 text-white shadow-md" 
                    : "text-brand-50 hover:bg-white/15 hover:translate-x-1"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaNewspaper className="text-lg" />
                <span className="font-medium">Blog</span>
              </Link>
              <Link
                href="/about"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  pathname === "/about" 
                    ? "bg-white/25 text-white shadow-md" 
                    : "text-brand-50 hover:bg-white/15 hover:translate-x-1"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaInfoCircle className="text-lg" />
                <span className="font-medium">About Us</span>
              </Link>
              <Link
                href="/contact"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  pathname === "/contact" 
                    ? "bg-white/25 text-white shadow-md" 
                    : "text-brand-50 hover:bg-white/15 hover:translate-x-1"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaPhone className="text-lg" />
                <span className="font-medium">Contact</span>
              </Link>
            </div>

            {session && (
              <>
                {/* Account Section */}
                <div className="border-t border-brand-500/40 space-y-2 py-4">
                  <div className="px-2 py-1.5 text-xs font-semibold text-brand-200 uppercase tracking-wider opacity-75">
                    Account
                  </div>
                  <Link
                    href={getDashboardPath()}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-brand-50 hover:bg-white/15 hover:translate-x-1 transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaTh className="text-lg" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                  <Link
                    href="/messages"
                    className="relative flex items-center gap-3 px-4 py-3 rounded-lg text-brand-50 hover:bg-white/15 hover:translate-x-1 transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaEnvelope className="text-lg" />
                    <span className="font-medium">Messages</span>
                    {session && <UnreadMessageCount session={session} />}
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-brand-50 hover:bg-white/15 hover:translate-x-1 transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaUser className="text-lg" />
                    <span className="font-medium">Profile</span>
                  </Link>
                  <Link
                    href="/properties/saved"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-brand-50 hover:bg-white/15 hover:translate-x-1 transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaBookmark className="text-lg" />
                    <span className="font-medium">Saved Properties</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-200 hover:bg-red-950/40 hover:translate-x-1 transition-all duration-200 font-medium text-left"
                  >
                    <FaSignOutAlt className="text-lg" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}

            {!session && (
              <div className="border-t border-brand-500/40 space-y-3 pt-4">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaKey /> Login
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-brand-700 bg-white hover:bg-gray-50 shadow-md hover:shadow-lg transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar