import './globals.css';

export const metadata = {
  title: 'Unsere Leistungen',
  description: 'Interactive Stadtteilliebe Lab experiment.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>
        <script dangerouslySetInnerHTML={{ __html: 'history.scrollRestoration="manual";window.scrollTo(0,0);' }} />
        {children}
      </body>
    </html>
  );
}
