import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./../components/Header";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Money Trail",
  description: "Smarter Money, Better Decisions",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} `}>
          {/* header */}
          <Header />
          <main className="min-h-screen">{children}</main>

          {/* footer */}
          <footer className="bg-blue-100 py-12">
            <div className="container mx-auto text-center px-4 text-gray-600">
              <p>Created by Harshada</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
