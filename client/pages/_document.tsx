import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="h-full">
      <Head>
        <script 
          async 
          src="https://www.googletagmanager.com/gtag/js?id=AW-972159675">
        </script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || []; 
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
            
              gtag('config', 'AW-926417550');
            `,
          }}
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-TPKCGZL6');
            `,
          }}
        />


        <link rel="shortcut icon" href="/favicon.png" />
        <script src="//code.tidio.co/ivv7hzggfptpqb2cuiepqz3claz6mbqs.js" async></script>

        {/* <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '3524555041095937');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{"display":"none"}}
            src="https://www.facebook.com/tr?id=3524555041095937&ev=PageView&noscript=1"
          />
        </noscript> */}
      </Head>

      <body className="">
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TPKCGZL6"
          height="0" width="0" style={{"display":"none","visibility":"hidden"}}></iframe>
        </noscript>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
