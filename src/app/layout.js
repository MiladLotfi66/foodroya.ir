import { dana } from "@/utils/fonts";
import "@/styles/app.css";
import { ThemeProviders } from "@/providers/ThemeProviders";
import Header from "@/layout/Header";
import MobileHeader from "@/layout/MobileHeader";
import MobileMenu from "@/layout/MobileMenu";
import Providers from "../Redux/Providers";
import { cookies } from "next/headers";
// import NextAuthProvider from "@/providers/NextAuthProvider";
import AosInit from "@/utils/Aos";
import ScrollToTop from "@/utils/ScrollToTop";
import { verifyAccessToken } from "@/utils/auth";
import Users from "@/models/Users";
// import { SessionProvider } from "next-auth/react";
const APP_NAME = "فود رویا";
const APP_DEFAULT_TITLE = "محصولات خانگی فود رویا";
const APP_TITLE_TEMPLATE = "محصولات خانگی فود رویا";
const APP_DESCRIPTION = "فروشگاه محصولات خانگی فود رویا";

 export const metadata = {
  metadataBase: new URL('http://localhost:3000/'),

  manifest:"/manifest.json",

  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
      telephone:    false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport = {
  themeColor: "#3f3f46",
};
export default async function RootLayout({ children }) {

  const tokenCookie = cookies().get("token");
  let user=null;

  if (!tokenCookie) {
    console.error("Token not found in cookies");
  } else {
    const token = tokenCookie.value;
    try {
      const tokenPayload = verifyAccessToken(token);
      if (tokenPayload) {
        const userFromDb = await Users.findOne({ phone: tokenPayload.phone });
        if (userFromDb) {
          user = {
            phone: userFromDb.phone,
            name: userFromDb.name,
            // ویژگی‌های دیگر که نیاز دارید
          };
        }
      }
    } catch (error) {
      console.error('verify access token error -->', error);
    }
  }

 


  return (
    <html
      lang="fa"
      className={dana.className}
      dir="rtl"
      suppressHydrationWarning
    >
      <body className="bg-gray-100 dark:bg-zinc-800">
        {/* <NextAuthProvider> */}
        {/* <SessionProvider session={session}> */}

          <ThemeProviders>
            <Providers>
              <ScrollToTop/>

              <Header isLogin={user}/>
              <MobileHeader isLogin={user}/>
              <MobileMenu isLogin={user}/>
              {/* <ThemeSwitch/> */}
              <AosInit/>
              {children}
            </Providers>
          </ThemeProviders>
          {/* </SessionProvider> */}
        {/* </NextAuthProvider> */}
      </body>
    </html>
  );
}




