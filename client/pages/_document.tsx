import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="h-full">
      <Head>
        <link rel="shortcut icon" href="/favicon.png" />
      </Head>

      <body className="">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
