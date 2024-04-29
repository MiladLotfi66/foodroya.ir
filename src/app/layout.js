import { dana } from "@/utils/fonts";
import "@/styles/app.css";
import { ThemeProviders } from "@/providers/ThemeProviders";
import Header from "@/layout/Header";
import MobileHeader from "@/layout/MobileHeader";
import MobileMenu from "@/layout/MobileMenu";
import Providers from "../Redux/Providers";
import NextAuthProvider from "@/providers/NextAuthProvider";
import AosInit from "@/utils/Aos";
import ScrollToTop from "@/utils/ScrollToTop";
// import { SessionProvider } from "next-auth/react";

export const metadata = {
  manifest:"/manifest.json",
  title: "فود رویا",
  description: "محصولات خانگی فود رویا",

  // icons: {
  //   icon: '/android-chrome-192x192.png',
  //   shortcut: '/android-chrome-192x192.png',
  //   apple: '/android-chrome-192x192.png',
  //   other: {
  //     rel: 'apple-touch-icon',
  //     url: '/android-chrome-192x192.png',
  //   },
  // },

};

export default function RootLayout({ children }) {
  return (
    <html
      lang="fa"
      className={dana.className}
      dir="rtl"
      suppressHydrationWarning
    >
      <body className="bg-gray-100 dark:bg-zinc-800">
        <NextAuthProvider>
        {/* <SessionProvider session={session}> */}

          <ThemeProviders>
            <Providers>
              <ScrollToTop/>
              <Header />
              <MobileHeader />
              <MobileMenu />
              {/* <ThemeSwitch/> */}
              <AosInit/>
              {children}
            </Providers>
          </ThemeProviders>
          {/* </SessionProvider> */}
        </NextAuthProvider>
      </body>
    </html>
  );
}
