import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, Phone, MessageSquare, MapPin, ChevronRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const FloatingEmergency = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const emergencyCare = [
        "Keep the animal calm and warm",
        "Do not offer food or water if injured",
        "Check for steady breathing",
        "Apply pressure to any bleeding wounds"
    ];

    const clinics = [
        { name: "City Pet Clinic", distance: "0.8 km", phone: "+91 98765 43210" },
        { name: "Animal Care Hospital", distance: "1.2 km", phone: "+91 98765 43211" }
    ];

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 z-[60] bg-red-600 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 group transition-all"
            >
                <div className="relative">
                    <AlertCircle className="h-6 w-6" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-white rounded-full animate-ping" />
                </div>
                <span className="font-bold pr-2 hidden group-hover:block transition-all whitespace-nowrap">Emergency Animal Help</span>
            </motion.button>

            {/* Panel Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]"
                        />
                        <motion.div
                            initial={{ x: "100%", opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "100%", opacity: 0 }}
                            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[80] shadow-2xl overflow-y-auto"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                                            <AlertCircle className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 leading-none">Emergency Help</h2>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Immediate Assistance</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-xl">
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>

                                <div className="space-y-8">
                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button 
                                            onClick={() => navigate("/chat")}
                                            className="h-24 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 flex flex-col gap-2 shadow-lg shadow-indigo-100"
                                        >
                                            <MessageSquare className="h-6 w-6" />
                                            <span className="font-bold">Chat with AI</span>
                                        </Button>
                                        <Button 
                                            className="h-24 rounded-[2rem] bg-red-600 hover:bg-red-700 flex flex-col gap-2 shadow-lg shadow-red-100"
                                            onClick={() => window.location.href = "tel:108"}
                                        >
                                            <Phone className="h-6 w-6" />
                                            <span className="font-bold">Emergency Call</span>
                                        </Button>
                                    </div>

                                    {/* First Aid */}
                                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                        <h3 className="font-black text-slate-900 flex items-center gap-2 mb-4">
                                            <Activity className="h-4 w-4 text-red-600" />
                                            Instant Care Steps
                                        </h3>
                                        <div className="space-y-3">
                                            {emergencyCare.map((step, i) => (
                                                <div key={i} className="flex gap-3">
                                                    <span className="h-5 w-5 shrink-0 bg-white border rounded-full flex items-center justify-center text-[10px] font-bold text-slate-400">{i+1}</span>
                                                    <p className="text-sm font-medium text-slate-600 leading-snug">{step}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Nearest Clinics */}
                                    <div className="space-y-4">
                                        <h3 className="font-black text-slate-900 flex items-center justify-between">
                                            Nearest Help
                                            <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full">GPS Active</span>
                                        </h3>
                                        <div className="space-y-3">
                                            {clinics.map((clinic, i) => (
                                                <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                                                            <MapPin className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-900">{clinic.name}</h4>
                                                            <p className="text-xs font-bold text-slate-400">{clinic.distance} away</p>
                                                        </div>
                                                    </div>
                                                    <a href={`tel:${clinic.phone}`} className="h-10 w-10 rounded-full flex items-center justify-center border border-slate-100 hover:bg-primary hover:text-white transition-all">
                                                        <Phone className="h-4 w-4" />
                                                    </a>
                                                </div>
                                            ))}
                                            <Button 
                                                variant="outline" 
                                                className="w-full rounded-2xl border-dashed border-2 h-12 text-slate-400 font-bold hover:text-primary hover:border-primary/50"
                                                onClick={() => navigate("/vets")}
                                            >
                                                View More Clinics <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default FloatingEmergency;
