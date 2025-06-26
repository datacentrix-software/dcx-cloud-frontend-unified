'use client';

import React from 'react';
import Head from 'next/head';

type Props = {
  title?: string;
  description?: string;
  children: React.ReactNode;
};

const PageContainer = ({ title, description, children }: Props) => (
  <>
    <Head>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
    </Head>
    <div>{children}</div>
  </>
);

export default PageContainer;
