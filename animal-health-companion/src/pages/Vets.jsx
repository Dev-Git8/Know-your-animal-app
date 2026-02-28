import { MapPin, Phone, Clock, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/data/translations";

const mockVets = [
  {
    id: 1,
    name: "Happy Paws Veterinary Clinic",
    address: "123, MG Road, Bengaluru, Karnataka",
    phone: "+91 98765 43210",
    rating: 4.8,
    specialization: "Small Animals & Pets",
    hours: "9:00 AM – 8:00 PM",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    name: "Green Valley Animal Hospital",
    address: "45, Nehru Nagar, Pune, Maharashtra",
    phone: "+91 87654 32109",
    rating: 4.5,
    specialization: "Livestock & Large Animals",
    hours: "8:00 AM – 6:00 PM",
    image: "https://images.unsplash.com/photo-1612531822024-4e404e47b4c0?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    name: "City Pet Care Centre",
    address: "78, Anna Salai, Chennai, Tamil Nadu",
    phone: "+91 76543 21098",
    rating: 4.7,
    specialization: "Birds & Exotic Pets",
    hours: "10:00 AM – 7:00 PM",
    image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    name: "Rural Livestock Veterinary Services",
    address: "12, GT Road, Ludhiana, Punjab",
    phone: "+91 65432 10987",
    rating: 4.3,
    specialization: "Cattle & Dairy Animals",
    hours: "7:00 AM – 5:00 PM",
    image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=300&fit=crop",
  },
  {
    id: 5,
    name: "Companion Animal Clinic",
    address: "90, Park Street, Kolkata, West Bengal",
    phone: "+91 54321 09876",
    rating: 4.6,
    specialization: "Dogs & Cats",
    hours: "9:30 AM – 7:30 PM",
    image: "https://images.unsplash.com/photo-1587559070757-f72a388edbba?w=400&h=300&fit=crop",
  },
  {
    id: 6,
    name: "Nandi Veterinary Hospital",
    address: "34, Jubilee Hills, Hyderabad, Telangana",
    phone: "+91 43210 98765",
    rating: 4.9,
    specialization: "All Animals – Emergency Care",
    hours: "Open 24/7",
    image: "https://images.unsplash.com/photo-1583337130417-13104dec14a7?w=400&h=300&fit=crop",
  },
];

const Vets = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Find Vets Near You
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Locate trusted veterinary clinics and hospitals in your area for the best care for your animals.
            </p>
          </div>

          {/* Vet Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockVets.map((vet) => (
              <Card key={vet.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={vet.image}
                    alt={vet.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display font-semibold text-lg text-foreground leading-tight">
                      {vet.name}
                    </h3>
                    <div className="flex items-center gap-1 text-amber-500 shrink-0 ml-2">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">{vet.rating}</span>
                    </div>
                  </div>

                  <p className="text-sm text-primary font-medium mb-3">
                    {vet.specialization}
                  </p>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{vet.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span>{vet.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span>{vet.hours}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Vets;
