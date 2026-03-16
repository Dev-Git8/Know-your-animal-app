import { useNavigate, Link } from "react-router-dom";
import { MessageSquare, Heart, Shield, Search, User, Clipboard, PlusCircle, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const UserDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const quickActions = [
        { title: "Chat with AI", icon: MessageSquare, path: "/chat", color: "bg-blue-500" },
        { title: "Nearby Clinics", icon: MapPin, path: "/vets", color: "bg-emerald-500" },
        { title: "Expert Vets", icon: Search, path: "/doctor-profiles", color: "bg-indigo-500" },
        { title: "My Animals", icon: Heart, path: "/profile", color: "bg-rose-500" },
    ];

    return (
        <div className="min-h-screen bg-muted/40">
            {/* Top Stats/Header */}
            <div className="bg-primary pt-12 pb-24 px-6">
                <div className="max-w-6xl mx-auto flex items-center justify-between text-primary-foreground">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Hello, {user?.username || "Friend"}!</h1>
                        <p className="text-primary-foreground/80">Welcome to your dashboard. How can we help your pets today?</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <main className="max-w-6xl mx-auto px-6 -mt-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {quickActions.map((action, i) => (
                        <Link 
                            key={i} 
                            to={action.path}
                            className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group"
                        >
                            <div className={`${action.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-${action.color}/20 group-hover:scale-110 transition-transform`}>
                                <action.icon className="h-6 w-6" />
                            </div>
                            <h3 className="font-bold text-foreground">{action.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">Quick access</p>
                        </Link>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Featured Doctors or Recently Contacted */}
                        <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Search className="h-5 w-5 text-primary" /> Find Professional Help
                            </h2>
                            <p className="text-muted-foreground mb-6">Our network of verified veterinarians is here for you 24/7.</p>
                            <Link to="/vets" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                                Explore All Doctors
                            </Link>
                        </section>

                        {/* Pet Status */}
                        <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Heart className="h-5 w-5 text-red-500" /> My Pets
                            </h2>
                             <p className="text-muted-foreground mb-6">Manage your pet's wellness records and history.</p>
                             <Link to="/profile" className="text-primary font-medium hover:underline">
                                 Manage Pets in Profile →
                             </Link>
                        </section>
                    </div>

                    <div className="space-y-8">
                        {/* Security/Account */}
                        <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-green-500" /> Account Security
                            </h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center gap-2 text-muted-foreground">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Verified Account
                                </li>
                                <li className="flex items-center gap-2 text-muted-foreground">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> HIPAA Compliant
                                </li>
                            </ul>
                        </section>

                         {/* Chat Shortcut */}
                         <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 shadow-xl text-white">
                            <h3 className="font-bold mb-2">Need quick advice?</h3>
                            <p className="text-blue-100 text-sm mb-4">Chat with our AI veterinary assistant about symptons or care tips.</p>
                            <Link to="/chat" className="block w-full text-center py-2 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-colors">
                                Start AI Chat
                            </Link>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;
