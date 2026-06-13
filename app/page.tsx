import FAQ from "@/components/faq"
import Features from "@/components/features"
import Footer from "@/components/footer"
import Hero from "@/components/hero"
import { Navbar } from "@/components/navbar"
import CTASection from "@/components/pricing"
import Highlight from "@/components/testimonial"

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <Highlight />
      <FAQ />
      <CTASection />
      <Footer />
    </>
  )
}
