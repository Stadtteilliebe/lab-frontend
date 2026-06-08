import './globals.css';

export const metadata = {
  title: 'Nothing great is made alone.',
  description: 'Interactive Stadtteilliebe Lab experiment.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
