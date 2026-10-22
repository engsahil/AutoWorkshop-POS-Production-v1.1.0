import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BrandGlyph } from './Brand';

export function AuthShell({
  art, artPosition = '50% 50%', artHeading, artSub, children,
  brandName = 'Auto Workshop', brandSub = 'Workshop Management System'
}: {
  art: string; artPosition?: string; artHeading: string; artSub: string; children: ReactNode;
  brandName?: string; brandSub?: string;
}) {
  return (
    <div className="auth-page">
      <div className="auth-frame">
        <div className="auth-art">
          <img src={art} alt="" style={{ objectPosition: artPosition }} />
          <div className="art-veil" />
          <div className="art-top">
            <BrandGlyph size={32} tone="light" />
            <div className="wm">
              <span className="wm-name" title={brandName}>{brandName}</span>
              <span>{brandSub}</span>
            </div>
          </div>
          <div className="art-bottom">
            <h3>{artHeading}</h3>
            <p>{artSub}</p>
            <div className="art-badges">
              <span>Offline ready</span>
              <span>POS &amp; job cards</span>
              <span>v1.1.0</span>
            </div>
          </div>
        </div>
        <div className="auth-panel">
          <div className="auth-inner">
            <div className="mobile-brand">
              <BrandGlyph size={30} />
              <div>
                <b style={{ fontSize: 14, display: 'block', maxWidth: 190, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={brandName}>{brandName}</b>
                <div className="tiny muted" style={{ letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 8.5 }}>Workshop POS</div>
              </div>
            </div>
            {children}
          </div>
          <div className="auth-footer">
            <span className="brandline"><BrandGlyph size={16} tone="light" /> v1.1.0 · Local data</span>
            <span>
              <Link to="/help">Help</Link> · <Link to="/privacy">Privacy</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
