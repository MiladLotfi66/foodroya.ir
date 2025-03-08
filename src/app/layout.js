
import { dana } from "@/utils/fonts";
import "@/styles/app.css";
import { ThemeProviders } from "@/providers/ThemeProviders";
import Providers from "../Redux/Providers";
import NextAuthProvider from "@/providers/NextAuthProvider";
import AosInit from "@/utils/Aos";
import ScrollToTop from "@/utils/ScrollToTop";
import CartInitializer from "@/templates/shoppingCart/CartInitializer";
import BottomNavigation from "@/templates/bottomNav/BottomNavigation";


const APP_NAME = "نیبرو";
const APP_DEFAULT_TITLE = "شبکه تجاری نیبرو";
const APP_TITLE_TEMPLATE = "شبکه تجاری نیبرو";
const APP_DESCRIPTION = "شبکه ای برای مدیریت کسب و کارها و روابط تجاری اشخاص";

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
  },
  formatDetection: {
    telephone: false,
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
          <ThemeProviders>
            <Providers>
              <ScrollToTop/>
                    <BottomNavigation />

              <AosInit/>
              <CartInitializer /> {/* فرض میکنیم user از context دریافت میشود */}

              {children}

            </Providers>
          </ThemeProviders>
        </NextAuthProvider>
      </body>
    </html>
  );
}
