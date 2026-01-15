import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../lib/auth";
import { PrimaryNav } from "./components/PrimaryNav";
import { ProjectSelectionProvider } from "../lib/projectSelection";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Video Scene Builder",
  description: "Project and scene manager with Firebase storage",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <ProjectSelectionProvider>
            <div className="app-shell">
              <PrimaryNav />
              <div className="app-content">{children}</div>
            </div>
          </ProjectSelectionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
