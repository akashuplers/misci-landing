import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="h-full">
      <Head>
        <link rel="shortcut icon" href="/favicon.png" />
        {/* <script src="//code.tidio.co/ivv7hzggfptpqb2cuiepqz3claz6mbqs.js" async></script> */}
      </Head>

      <body className="">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
