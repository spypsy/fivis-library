import { Space, Typography } from 'antd';
import React from 'react';

type PageShellProps = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  extra?: React.ReactNode;
  children: React.ReactNode;
  narrow?: boolean;
  /** Use full content width (e.g. wide data tables). */
  wide?: boolean;
};

const PageShell: React.FC<PageShellProps> = ({ title, subtitle, extra, children, narrow, wide }) => (
  <div
    className={`page-shell${narrow ? ' page-shell--narrow' : ''}${wide ? ' page-shell--wide' : ''}`}
  >
    {(title || extra) && (
      <div className="page-shell__header">
        <div>
          {title && <Typography.Title level={2}>{title}</Typography.Title>}
          {subtitle && (
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              {subtitle}
            </Typography.Paragraph>
          )}
        </div>
        {extra && <Space>{extra}</Space>}
      </div>
    )}
    {children}
  </div>
);

export default PageShell;
