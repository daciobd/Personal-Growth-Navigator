import Head from "expo-router/head";
import React from "react";

export function PwaHead() {
  return (
    <Head>
      <meta charSet="utf-8" />
      <meta name="application-name" content="MeuEu" />
      <meta name="theme-color" content="#1B6B5A" />
      <meta name="background-color" content="#F5F8F6" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="MeuEu" />
      <meta name="format-detection" content="telephone=no" />
      <link rel="manifest" href="/manifest.json" />
      <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
      <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.png" />
    </Head>
  );
}
