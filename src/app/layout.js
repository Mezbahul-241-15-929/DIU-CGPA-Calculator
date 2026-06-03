import './globals.css';

export const metadata = {
  title: 'DIU CGPA Calculator',
  description: 'Calculate your DIU CGPA according to UGC guidelines.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
