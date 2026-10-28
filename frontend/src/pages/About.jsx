import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Heart, Shield, Globe, BookOpen, Users, Stethoscope, MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import aboutCow from "@/assets/about-cow.jpg";
import aboutGroup from "@/assets/about-animals-group.jpg";

const About = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.username || "",
        email: prev.email || user.email || ""
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Thank you! Your message has been sent to our veterinary care team. We will get back to you within 24 hours.");
    setFormData({ name: user?.username || "", email: user?.email || "", subject: "", message: "" });
    setTimeout(() => setSubmitted(false), 6000);
  };

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
                { icon: BookOpen, title: "Disease & Care Database", desc: "In-depth disease symptoms, causes, clinical treatments, and biosecurity guidelines across domestic, farm, and wild animals." },
                { icon: Globe, title: "12+ Indian Languages", desc: "Full accessibility in English, Hindi, Bengali, Tamil, Telugu, Kannada, and regional Indian languages." },
                { icon: Stethoscope, title: "24/7 AI Vet Assistant", desc: "Instant AI veterinary triaging for emergency symptom diagnosis, first-aid measures, and round-the-clock pet wellness care." },
                { icon: Shield, title: "Verified Doctor Directory", desc: "Connect with verified clinical veterinarians and livestock surgeons across India for appointments and teleconsultations." },
                { icon: Users, title: "Emergency 1962 SOS", desc: "Government animal ambulance helpline integration providing urgent response coordination for distressed and injured animals." },
                { icon: Heart, title: "Accessible Care Plans", desc: "Free animal encyclopedia & clinic map forever, with affordable Care Plus memberships for unlimited AI care and priority bookings." },
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

        {/* ── Contact Us ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden" style={{ background: "#1a1612" }}>
          <div className="container mx-auto px-4 py-20 max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-20">

              {/* Left — Get In Touch */}
              <div className="flex flex-col justify-center">
                <span
                  className="text-sm font-semibold uppercase tracking-[0.2em] mb-3 flex items-center gap-2"
                  style={{ color: "#c5975b" }}
                >
                  <span className="w-6 h-px" style={{ background: "#c5975b" }} />
                  Keep Close
                </span>
                <h2 className="font-display text-4xl font-bold text-white mb-5">
                  Get In Touch
                </h2>
                <p className="text-[#a09889] leading-relaxed mb-8 max-w-md">
                  Have questions about animal healthcare, want to suggest a feature, or need emergency assistance? Our dedicated veterinary support team is here to help.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#c5975b" }} />
                    <div>
                      <p className="text-white text-sm font-medium">Headquarters</p>
                      <p className="text-[#a09889] text-xs mt-0.5">Indiranagar, Bengaluru, Karnataka 560038, India</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#c5975b" }} />
                    <div>
                      <p className="text-white text-sm font-medium">Helpline & Support</p>
                      <p className="text-emerald-400 font-bold text-xs mt-0.5">1962 (Govt Animal SOS)</p>
                      <p className="text-[#a09889] text-xs mt-0.5">+91 80 4710 9988</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#c5975b" }} />
                    <div>
                      <p className="text-white text-sm font-medium">Email</p>
                      <p className="text-[#a09889] text-xs mt-0.5">support@knowyouranimal.com</p>
                      <p className="text-[#a09889] text-xs mt-0.5">emergency@knowyouranimal.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#c5975b" }} />
                    <div>
                      <p className="text-white text-sm font-medium">Operating Hours</p>
                      <p className="text-[#a09889] text-xs mt-0.5">Mon – Sat: 8:00 AM – 8:00 PM</p>
                      <p className="text-emerald-400 font-semibold text-xs mt-0.5">Emergency SOS: 24/7</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right — Form */}
              <div>
                <h3 className="text-2xl font-display font-bold text-white mb-2">
                  Your Details
                </h3>
                <p className="text-[#a09889] text-sm mb-7">
                  Let us know how to get back to you.
                </p>

                {submitted && (
                  <div className="mb-5 px-4 py-3 rounded-lg text-sm font-medium" style={{ background: "rgba(197,151,91,0.15)", color: "#c5975b", border: "1px solid rgba(197,151,91,0.3)" }}>
                    ✓ Thank you! We'll get back to you soon.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#a09889] mb-2 font-medium">
                        Name <span style={{ color: "#c5975b" }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        required
                        className="w-full px-4 py-2.5 rounded-none text-sm text-white placeholder:text-[#6b6057] focus:outline-none transition-colors"
                        style={{ background: "transparent", borderBottom: "1px solid #3d352c" }}
                        onFocus={(e) => e.target.style.borderBottomColor = "#c5975b"}
                        onBlur={(e) => e.target.style.borderBottomColor = "#3d352c"}
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#a09889] mb-2 font-medium">
                        Email Address <span style={{ color: "#c5975b" }}>*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@example.com"
                        required
                        className="w-full px-4 py-2.5 rounded-none text-sm text-white placeholder:text-[#6b6057] focus:outline-none transition-colors"
                        style={{ background: "transparent", borderBottom: "1px solid #3d352c" }}
                        onFocus={(e) => e.target.style.borderBottomColor = "#c5975b"}
                        onBlur={(e) => e.target.style.borderBottomColor = "#3d352c"}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#a09889] mb-2 font-medium">
                      Subject <span style={{ color: "#c5975b" }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Subject"
                      required
                      className="w-full px-4 py-2.5 rounded-none text-sm text-white placeholder:text-[#6b6057] focus:outline-none transition-colors"
                      style={{ background: "transparent", borderBottom: "1px solid #3d352c" }}
                      onFocus={(e) => e.target.style.borderBottomColor = "#c5975b"}
                      onBlur={(e) => e.target.style.borderBottomColor = "#3d352c"}
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#a09889] mb-2 font-medium">
                      Comments / Questions <span style={{ color: "#c5975b" }}>*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Your message..."
                      required
                      rows={4}
                      className="w-full px-4 py-2.5 rounded-none text-sm text-white placeholder:text-[#6b6057] focus:outline-none transition-colors resize-none"
                      style={{ background: "transparent", borderBottom: "1px solid #3d352c" }}
                      onFocus={(e) => e.target.style.borderBottomColor = "#c5975b"}
                      onBlur={(e) => e.target.style.borderBottomColor = "#3d352c"}
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex items-center gap-2 px-7 py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-300 hover:opacity-90"
                    style={{ background: "#2a231a", color: "#c5975b", border: "1px solid #3d352c" }}
                    onMouseEnter={(e) => { e.target.style.background = "#c5975b"; e.target.style.color = "#1a1612"; }}
                    onMouseLeave={(e) => { e.target.style.background = "#2a231a"; e.target.style.color = "#c5975b"; }}
                  >
                    <Send className="h-4 w-4" />
                    Contact Us
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
