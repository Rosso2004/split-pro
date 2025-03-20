import { type Session } from 'next-auth';
import { SessionProvider, useSession } from 'next-auth/react';
import { type AppType } from 'next/app';
import { Poppins } from 'next/font/google';
import { ThemeProvider } from '~/components/theme-provider';
import { api } from '~/utils/api';
import clsx from 'clsx';
import Head from 'next/head';
import { Toaster } from 'sonner';

import '~/styles/globals.css';
import { type NextPageWithUser } from '~/types';
import { LoadingSpinner } from '~/components/ui/spinner';
import {Suspense, useEffect, useState} from 'react';
import { useAddExpenseStore } from '~/store/addStore';
import { useAppStore } from '~/store/appStore';
import { useTranslation } from 'react-i18next';

import '../i18n';

const poppins = Poppins({ weight: ['200', '300', '400', '500', '600', '700'], subsets: ['latin'] });

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <main className={clsx(poppins.className, 'h-full')}>
      <Head>
        <title>SplitPro: Split Expenses with your friends for free</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="application-name" content="SplitPro" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="SplitPro" />
        <meta name="description" content="Split Expenses with your friends for free" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#2B5797" />
        <meta name="msapplication-tap-highlight" content="no" />

        <meta name="theme-color" content="#030711" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        <link rel="apple-touch-icon" href="/icons/ios/144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/ios/152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/ios/180.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/ios/167.png" />

        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#5bbad5" />
        <link rel="shortcut icon" href="/favicon.ico" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://splitpro.app" />
        <meta name="twitter:title" content="SplitPro" />
        <meta name="twitter:description" content="Split Expenses with your friends for free" />
        <meta name="twitter:image" content="https://splitpro.app/og_banner.png" />
        <meta name="twitter:creator" content="@KM_Koushik_" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="SplitPro" />
        <meta property="og:description" content="Split Expenses with your friends for free" />
        <meta property="og:site_name" content="SplitPro" />
        <meta property="og:url" content="https://splitpro.app" />
        <meta property="og:image" content="https://splitpro.app/og_banner.png" />
      </Head>
      <SessionProvider session={session}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <Toaster toastOptions={{ duration: 1500 }} />
          <Suspense fallback={<div>Loading translations...</div>}>
            {(Component as NextPageWithUser).auth ? (
              <Auth pageProps={pageProps} Page={Component as NextPageWithUser}></Auth>
            ) : (
              <Component {...pageProps} />
            )}{' '}
          </Suspense>
        </ThemeProvider>
      </SessionProvider>
    </main>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Auth: React.FC<{ Page: React.ComponentType<any>; pageProps: any }> = ({ Page, pageProps }) => {
  const { status, data: sessionData } = useSession({ required: true });
  const [showSpinner, setShowSpinner] = useState(false);
  const { i18n } = useTranslation();

  const { setCurrency } = useAddExpenseStore((s) => s.actions);
  const { setWebPushPublicKey } = useAppStore((s) => s.actions);

  const { data: webPushPublicKey } = api.user.getWebPushPublicKey.useQuery();
  const { data: userData, isLoading: isUserLoading } = api.user.me.useQuery(undefined, {
    enabled: status === 'authenticated', // Esegui la query solo se l'utente è autenticato
  });

  useEffect(() => {
    setTimeout(() => {
      setShowSpinner(true);
    }, 300);
  }, []);

  useEffect(() => {
    if (webPushPublicKey) {
      setWebPushPublicKey(webPushPublicKey);
    }
  }, [webPushPublicKey, setWebPushPublicKey]);

  useEffect(() => {
    if (status === 'authenticated' && sessionData?.user) {
      setCurrency(sessionData.user.currency);
      void i18n.changeLanguage('it');
    }
  }, [status, sessionData?.user, setCurrency, userData?.preferredLanguage, i18n]);

  if (status === 'loading' || isUserLoading) {
    return (
        <div className="flex h-full w-full items-center justify-center">
          {showSpinner ? <LoadingSpinner className="text-primary" /> : null}
        </div>
    );
  }

  return <Page user={sessionData?.user} {...pageProps} />;
};

export default api.withTRPC(MyApp);
