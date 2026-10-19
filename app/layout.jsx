import './globals.css';

export const metadata = {
  title: 'Der Kern unserer Leistungen | Stadtteilliebe',
  description: 'Strategie, Branding, UX/UI-Design und Webentwicklung aus einem Team. Wie die Leistungen zusammenhängen und wie du deinen Einstieg findest.',
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
