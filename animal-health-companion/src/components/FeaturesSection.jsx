import { BookOpen, Globe, Stethoscope, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/data/translations";

const icons = [Globe, Stethoscope, BookOpen, Users];

const FeaturesSection = () => {
  const { language } = useLanguage();
  const t = translations[language]?.features || translations.en.features;

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.items.map((feature, index) => {
            const Icon = icons[index];
            return (
              <div
                key={index}
                className="card-nature text-center"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="feature-icon mx-auto mb-5">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
