import { ConfigProvider } from 'antd';
import React from 'react';

const BRAND_PRIMARY = '#25430D';

export const AppTheme: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: BRAND_PRIMARY,
        colorLink: BRAND_PRIMARY,
        colorLinkHover: BRAND_PRIMARY,
        colorLinkActive: BRAND_PRIMARY,
        borderRadius: 6,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      },
      components: {
        Layout: {
          headerBg: BRAND_PRIMARY,
        },
        Tag: {
          defaultBg: '#e8f0e3',
          defaultColor: BRAND_PRIMARY,
        },
      },
    }}
  >
    {children}
  </ConfigProvider>
);

export { BRAND_PRIMARY };
