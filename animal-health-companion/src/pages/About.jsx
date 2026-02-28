import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Heart, Shield, Globe, BookOpen, Users, Stethoscope } from "lucide-react";
import aboutCow from "@/assets/about-cow.jpg";
import aboutGroup from "@/assets/about-animals-group.jpg";
import aboutVet from "@/assets/about-vet.jpg";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-16">
        {/* Hero */}
        <section className="relative h-[50vh] min-h-[360px] overflow-hidden">
          <img
            src={aboutGroup}
            alt="Farm animals in rural India"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/60" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              About Know Your Animal
            </h1>
            <p className="text-primary-foreground/80 text-lg md:text-xl max-w-2xl">
              Empowering farmers and animal caretakers across India with accessible healthcare knowledge.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-primary mb-2 block">
                  Our Mission
                </span>
                <h2 className="font-display text-3xl font-bold text-foreground mb-5">
                  Bridging the Gap in Animal Healthcare
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Whether you're a farmer raising livestock, a pet parent caring for your companion, or simply someone who loves animals — access to reliable veterinary information remains limited, especially in regional languages.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Know Your Animal</strong> was built to change that. We provide a free, multilingual platform where anyone can look up common animal diseases, understand symptoms, and learn about treatments — all in their own language. From cattle and poultry to dogs and cats, we're here for every animal and every caretaker.
                </p>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={aboutCow}
                  alt="Healthy Indian cow in green field"
                  className="w-full h-72 md:h-80 object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* What We Offer */}
        <section className="py-20 bg-muted/40">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-display text-3xl font-bold text-foreground text-center mb-14">
              What We Offer
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: BookOpen, title: "Disease Database", desc: "Comprehensive information on 100+ diseases across 16 domestic animals — from cattle to poultry." },
                { icon: Globe, title: "12+ Languages", desc: "Access everything in Hindi, Bengali, Tamil, Telugu, Kannada, and many more Indian languages." },
                { icon: Stethoscope, title: "AI Chatbot", desc: "Ask our AI veterinary assistant anything about animal health and get instant, reliable answers." },
                { icon: Shield, title: "Verified Info", desc: "All content is reviewed against established veterinary research and agricultural guidelines." },
                { icon: Users, title: "For Everyone", desc: "Designed for farmers, students, NGOs, and anyone who cares for animals — no technical knowledge needed." },
                { icon: Heart, title: "100% Free", desc: "No subscriptions, no hidden costs. Animal healthcare knowledge should be accessible to all." },
              ].map((item, i) => (
                <div key={i} className="card-nature flex flex-col items-start">
                  <div className="feature-icon mb-4">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="rounded-2xl overflow-hidden shadow-lg order-2 md:order-1">
                <img
                  src={aboutVet}
                  alt="Veterinarian caring for buffalo"
                  className="w-full h-72 md:h-80 object-cover"
                  loading="lazy"
                />
              </div>
              <div className="order-1 md:order-2">
                <span className="text-sm font-semibold uppercase tracking-widest text-primary mb-2 block">
                  How It Works
                </span>
                <h2 className="font-display text-3xl font-bold text-foreground mb-5">
                  Simple. Fast. Reliable.
                </h2>
                <ol className="space-y-4 text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</span>
                    <span><strong className="text-foreground">Choose your language</strong> — pick from 12+ Indian languages using the dropdown in the navbar.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</span>
                    <span><strong className="text-foreground">Browse or search</strong> — select an animal to view its common diseases, or ask our AI chatbot directly.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</span>
                    <span><strong className="text-foreground">Get answers</strong> — read about symptoms, causes, treatments, and prevention in your own language.</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-14 bg-muted/40">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Disclaimer:</strong> The information on this platform is for educational purposes only. Always consult a qualified veterinarian for proper diagnosis and treatment. Do not self-medicate your animals based on this information alone.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
