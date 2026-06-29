import './globals.css';

export const metadata = {
  title: 'Unsere Leistungen',
  description: 'Interactive Stadtteilliebe Lab experiment.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
