import { Footer, Header } from "@/components/Header";
import { PageTransition } from "@/components/motion";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <PageTransition>{children}</PageTransition>
      <Footer />
    </>
  );
}
