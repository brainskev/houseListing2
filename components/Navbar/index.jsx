'use client'
import React, { useState } from "react";
import logo from "@/assets/images/logo-white.png";
import profileDefault from "@/assets/images/profile.png";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import UnreadMessageCount from "../UnReadMessageCount";
import { FaHome, FaKey, FaUser, FaSignOutAlt, FaBookmark, FaEnvelope, FaTh } from "react-icons/fa";

const Navbar = () => {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const pathname = usePathname();
  const profileImage = session?.user?.image;
  const canManageListings = ["admin", "assistant"].includes(session?.user?.role);
  
  const getDashboardPath = () => {
    if (!session?.user?.role) return "/dashboard/user";
    if (session.user.role === "admin") return "/dashboard/admin";
    if (session.user.role === "assistant") return "/dashboard/admin";
    return "/dashboard/user";
  };
  return (
    <nav className="bg-blue-700 border-b border-blue-500">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-20 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center md:hidden">
            {/* Mobile menu button*/}
            <button
              type="button"
              id="mobile-dropdown-button"
              className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
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
          <div className="flex flex-1 items-center justify-center md:items-stretch md:justify-start">
            {/* Logo */}
            <Link className="flex flex-shrink-0 items-center" href="/">
              <Image
                className="h-10 w-auto"
                src={logo}
                alt="RealEstateHub"
                width={0}
                height={0}
                priority={true}
              />
              <span className="hidden md:block text-white text-2xl font-bold ml-2">
                Valles Real Estate
              </span>
            </Link>
            {/* Desktop Menu Hidden below md screens */}
            <div className="hidden md:ml-8 md:block">
              <div className="flex items-center space-x-1">
                <Link
                  href="/"
                  className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                    pathname === "/" ? "bg-white/20 text-white" : "text-blue-50 hover:bg-white/10"
                  }`}
                >
                  <FaHome className="text-base" /> Home
                </Link>
                <Link
                  href="/properties"
                  className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                    pathname === "/properties" ? "bg-white/20 text-white" : "text-blue-50 hover:bg-white/10"
                  }`}
                >
                  Browse
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
                  className="text-white border border-white/60 hover:bg-white hover:text-blue-700 rounded-md px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="text-blue-700 bg-white hover:bg-gray-100 rounded-md px-3 py-2 font-semibold"
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
                className="hidden sm:inline-flex items-center gap-2 rounded-md bg-blue-600 hover:bg-blue-800 text-white px-3 py-2 text-sm font-medium transition"
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
                    className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-10 py-1"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    tabIndex={-1}
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
        <div id="mobile-menu" className="border-t border-blue-600 md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            <Link
              href="/"
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium transition ${
                pathname === "/" ? "bg-white/20 text-white" : "text-blue-50 hover:bg-white/10"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaHome /> Home
            </Link>
            <Link
              href="/properties"
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium transition ${
                pathname === "/properties" ? "bg-white/20 text-white" : "text-blue-50 hover:bg-white/10"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Browse
            </Link>

            {session && (
              <>
                <Link
                  href={getDashboardPath()}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-blue-50 hover:bg-white/10 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaTh /> Dashboard
                </Link>
                <Link
                  href="/messages"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-blue-50 hover:bg-white/10 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaEnvelope /> Messages
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-blue-50 hover:bg-white/10 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaUser /> Profile
                </Link>
                <Link
                  href="/properties/saved"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-blue-50 hover:bg-white/10 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaBookmark /> Saved
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signOut();
                  }}
                  className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-base font-medium text-red-200 hover:bg-red-900/20 transition"
                >
                  <FaSignOutAlt /> Sign Out
                </button>
              </>
            )}

            {!session && (
              <div className="flex flex-col gap-2 pt-2 border-t border-blue-600">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 rounded-md px-3 py-2 text-base font-medium border border-white/60 text-white hover:bg-white hover:text-blue-700 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaKey /> Login
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center justify-center gap-2 rounded-md px-3 py-2 text-base font-semibold text-blue-700 bg-white hover:bg-gray-100 transition"
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