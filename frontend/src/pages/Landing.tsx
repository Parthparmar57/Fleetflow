import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, MapPin, Play, Settings, Shield, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden font-sans">
      {/* Hero Section Container */}
      <section className="relative min-h-[90vh] lg:min-h-screen text-white overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop"
            alt="Fleet Management"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-transparent shadow-inner" />
        </div>

        {/* Glass Header - Sticky & Refined */}
        <nav className="fixed top-0 left-0 w-full z-50 pt-4 lg:pt-6 px-4 lg:px-12 pointer-events-none">
          <div className="max-w-7xl mx-auto flex items-center justify-between glass-frosted px-5 lg:px-8 py-3 lg:py-4 rounded-full border-white/20 shadow-2xl pointer-events-auto backdrop-blur-3xl bg-slate-900/60 transition-all">
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-emerald-500 rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <Truck className="text-white" size={20} />
              </div>
              <span className="font-extrabold text-lg lg:text-2xl tracking-tighter text-white">FleetFlow</span>
            </Link>
            
            <div className="hidden lg:flex items-center gap-10">
              <a href="#features" className="text-sm font-bold text-white/70 hover:text-emerald-400 transition-colors">Features</a>
              <a href="#pricing" className="text-sm font-bold text-white/70 hover:text-emerald-400 transition-colors">Pricing</a>
              <a href="#contact" className="text-sm font-bold text-white/70 hover:text-emerald-400 transition-colors">Support</a>
              <a href="#enterprise" className="text-sm font-bold text-white/70 hover:text-emerald-400 transition-colors">Enterprise</a>
            </div>

            <div className="flex items-center gap-2 lg:gap-6">
              <Link to="/login" className="hidden sm:block text-sm font-black text-white hover:text-emerald-400 transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="hidden sm:flex bg-emerald-500 text-white font-black px-5 lg:px-8 py-2.5 lg:py-3 rounded-full hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 text-xs lg:text-sm">
                Get Started
              </Link>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden w-10 h-10 flex items-center justify-center text-white bg-white/10 rounded-full ml-1"
              >
                <div className="w-5 space-y-1.5">
                  <div className={cn("h-0.5 w-full bg-white transition-all", isMenuOpen && "rotate-45 translate-y-2")} />
                  <div className={cn("h-0.5 w-full bg-white transition-all", isMenuOpen && "opacity-0")} />
                  <div className={cn("h-0.5 w-full bg-white transition-all", isMenuOpen && "-rotate-45 -translate-y-2")} />
                </div>
              </button>
            </div>
          </div>
          
          {/* Mobile Menu Dropdown */}
          <motion.div
            initial={false}
            animate={isMenuOpen ? { height: 'auto', opacity: 1, marginTop: 12 } : { height: 0, opacity: 0, marginTop: 0 }}
            className="lg:hidden overflow-hidden pointer-events-auto"
          >
            <div className="glass-frosted p-6 rounded-[2rem] bg-slate-900/95 border-white/10 space-y-4 shadow-2xl">
              {[
                { label: 'Features', href: '#features' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'Support', href: '#contact' },
                { label: 'Enterprise', href: '#enterprise' },
              ].map(item => (
                <a 
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2 text-xl font-black text-white/90 hover:text-emerald-400 border-b border-white/5 last:border-0"
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-4 flex flex-col gap-4">
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-center py-4 rounded-2xl bg-white/5 text-white font-bold">Sign In</Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="text-center py-4 rounded-2xl bg-emerald-500 text-white font-black">Get Started</Link>
              </div>
            </div>
          </motion.div>
        </nav>

        {/* Hero Content - Responsive Alignment */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-32 lg:pt-48 pb-20 flex justify-center lg:justify-end">
          <div className="w-full lg:w-3/5 text-center lg:text-right flex flex-col items-center lg:items-end">
            <motion.h1
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl sm:text-5xl lg:text-8xl font-black leading-[1] lg:leading-[0.95] tracking-tighter mb-8"
            >
              The Future of <br />
              <span className="text-emerald-400">Fleet Management</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg lg:text-xl text-slate-300 max-w-xl leading-relaxed mb-10 font-medium opacity-90"
            >
              Optimize your fleet operations with advanced analytics, real-time tracking, and intelligent automation.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center gap-6 lg:gap-8"
            >
              <button className="flex items-center gap-3 font-bold hover:text-emerald-400 transition-all group order-2 lg:order-1">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 group-hover:bg-emerald-500/20">
                  <Play size={18} fill="currentColor" />
                </div>
                Watch Demo
              </button>
              <Link to="/register" className="w-full sm:w-auto px-10 py-5 bg-emerald-500 text-white font-black rounded-full hover:bg-emerald-400 transition-all text-center shadow-xl shadow-emerald-500/20 order-1 lg:order-2">
                Explore Your Fleet
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section - Properly Positioned */}
      <section id="features" className="relative z-30 py-32 px-6 lg:px-12 bg-slate-50/50">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Card 1: Tracking */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group glass-card p-8 rounded-[3rem] shadow-premium hover:translate-y-[-8px] transition-all duration-500 border-white"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <Truck size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">Modules</p>
                <h3 className="text-sm font-black text-slate-900 mt-1 uppercase tracking-tight">Real-Time Tracking</h3>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden h-44 bg-slate-900 mb-6 shadow-inner">
              <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2066" className="w-full h-full object-cover opacity-60" alt="Map" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-3 bg-emerald-500 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.6)] animate-pulse">
                  <MapPin size={24} className="text-white" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 border-t border-slate-100 pt-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Vehicles</p>
                <h4 className="text-3xl font-black text-slate-900 tracking-tighter">2,345</h4>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Uptime</p>
                <h4 className="text-3xl font-black text-emerald-600 tracking-tighter">98.7%</h4>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Optimization */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group glass-card p-8 rounded-[3rem] shadow-premium hover:translate-y-[-8px] transition-all duration-500 bg-emerald-50/80 border-emerald-100/50"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                <Settings size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Engine</p>
                <h3 className="text-sm font-black text-slate-900 mt-1 uppercase tracking-tight">Route Optimization</h3>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Fuel Savings', value: '14.2%', color: 'text-emerald-600' },
                { label: 'Idle Time', value: '-22%', color: 'text-rose-600' },
                { label: 'Efficiency', value: '+30%', color: 'text-emerald-600' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center px-5 py-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.label}</p>
                  <p className={cn("text-xl font-black tracking-tighter", item.color)}>{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 3: Driver Safety */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group glass-card p-8 rounded-[3rem] shadow-premium hover:translate-y-[-8px] transition-all duration-500 border-orange-50"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-soft border border-orange-50">
                <Shield size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest leading-none">Safety</p>
                <h3 className="text-sm font-black text-slate-900 mt-1 uppercase tracking-tight">Operator Scoring</h3>
              </div>
            </div>

            <div className="mb-10">
              <div className="flex justify-between items-end mb-4">
                <h4 className="text-4xl font-black text-slate-900 tracking-tighter">95<span className="text-sm text-slate-400 ml-1">/100</span></h4>
                <span className="text-[10px] font-black px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg uppercase tracking-widest">Top Tier</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '95%' }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100/50 italic font-bold text-slate-400 text-xs leading-relaxed text-center">
              "15 vehicles flagged for preventative maintenance this week."
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-6xl font-black tracking-tighter text-slate-900 mb-6">
              Plans for every <span className="text-emerald-500">scale.</span>
            </h2>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
              Transparent pricing designed to grow with your fleet. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Starter', price: '49', features: ['Up to 10 Vehicles', 'Basic Analytics', 'Real-time Tracking', 'Email Support'] },
              { name: 'Professional', price: '149', features: ['Up to 50 Vehicles', 'Advanced AI Insights', 'Fuel Optimization', 'Priority Support'], popular: true },
              { name: 'Enterprise', price: 'Custom', features: ['Unlimited Vehicles', 'Custom API access', 'Dedicated Manager', 'On-site Training'] },
            ].map((plan, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10 }}
                className={cn(
                  "p-10 rounded-[3rem] border-2 transition-all relative overflow-hidden",
                  plan.popular ? "border-emerald-500 bg-slate-900 text-white shadow-2xl shadow-emerald-500/20" : "border-slate-100 bg-slate-50 text-slate-900"
                )}
              >
                {plan.popular && <div className="absolute top-8 right-[-35px] bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-10 py-1 rotate-45">Popular</div>}
                <h3 className="text-xl font-black mb-4 uppercase tracking-widest">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-black tracking-tighter">{plan.price === 'Custom' ? '' : '$'}{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-sm opacity-60 font-bold">/mo</span>}
                </div>
                <ul className="space-y-4 mb-10">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm font-bold opacity-80">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <ChevronDown size={12} className="text-white -rotate-90" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={cn(
                  "w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all",
                  plan.popular ? "bg-emerald-500 text-white hover:bg-emerald-400" : "bg-white text-slate-900 hover:bg-slate-100 border border-slate-200"
                )}>
                  Choose {plan.name}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section id="enterprise" className="py-32 px-6 lg:px-12 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl lg:text-7xl font-black tracking-tighter mb-8 italic">
                Enterprise <br />
                <span className="text-emerald-500 not-italic">Intelligence.</span>
              </h2>
              <p className="text-xl text-slate-400 font-medium mb-12 max-w-xl leading-relaxed">
                Connect your entire ecosystem with our robust API and custom integrations. Designed for fleets of 500+ vehicles.
              </p>
              <div className="grid sm:grid-cols-2 gap-8">
                {[
                  { title: 'Custom API', desc: 'Deep integrations with your existing ERP.' },
                  { title: 'On-Premise', desc: 'Secure local data hosting options available.' },
                  { title: 'SLA Guarantee', desc: '99.99% uptime commitment for scale.' },
                  { title: 'Global 24/7', desc: 'Dedicated engineering support team.' },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <h4 className="text-lg font-black text-white">{item.title}</h4>
                    <p className="text-sm font-medium text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
               <div className="aspect-square bg-gradient-to-br from-emerald-500/20 to-transparent rounded-[4rem] border border-white/10 flex items-center justify-center p-12 backdrop-blur-3xl">
                  <div className="w-full h-full border border-emerald-500/30 rounded-[3rem] p-12 flex flex-col justify-between">
                     <div className="flex justify-between items-start">
                        <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                           <Settings className="text-white" size={32} />
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] mb-1">Scale Status</p>
                           <p className="text-2xl font-black">UNLIMITED</p>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                           <motion.div animate={{ width: ['10%', '90%', '40%', '85%'] }} transition={{ duration: 10, repeat: Infinity }} className="h-full bg-emerald-500" />
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Network Throughput: 4.2 TB/s</p>
                     </div>
                  </div>
               </div>
               <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Section - Fully Responsive */}
      <section id="contact" className="py-20 lg:py-32 px-6 lg:px-12 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black tracking-tighter text-slate-900 mb-6 lg:mb-8 leading-tight">
                  Let's scale your <br />
                  <span className="text-emerald-500">fleet together.</span>
                </h2>
                <p className="text-lg lg:text-xl text-slate-500 font-medium mb-10 lg:mb-12 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                  Have questions about our enterprise features? Our logistics experts are ready to help you optimize.
                </p>

                <div className="space-y-6 lg:space-y-8 text-left max-w-md mx-auto lg:mx-0">
                  {[
                    { title: 'Global Operations', detail: '24/7 Priority Support', icon: Truck },
                    { title: 'Technical Sales', detail: 'sales@fleetflow.pro', icon: Settings },
                    { title: 'Office Headquarters', detail: 'Logistic Square, San Francisco', icon: MapPin },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 lg:gap-6 group">
                      <div className="w-12 h-12 lg:w-14 lg:h-14 bg-slate-50 rounded-xl lg:rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm shrink-0">
                        <item.icon size={20} className="lg:size-[24px]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{item.title}</p>
                        <p className="text-base lg:text-lg font-bold text-slate-900">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-card p-6 sm:p-10 lg:p-12 rounded-[2rem] lg:rounded-[3.5rem] bg-slate-900 text-white relative overflow-hidden mt-8 lg:mt-0"
            >
              <div className="relative z-10">
                <h3 className="text-xl lg:text-2xl font-black mb-6 lg:mb-8 tracking-tight">Drop us a line</h3>
                <form className="space-y-4 lg:space-y-6">
                  <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Your Name</label>
                       <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl px-5 lg:px-6 py-3 lg:py-4 focus:border-emerald-500 outline-none transition-all font-bold text-sm lg:text-base" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Work Email</label>
                       <input type="email" className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl px-5 lg:px-6 py-3 lg:py-4 focus:border-emerald-500 outline-none transition-all font-bold text-sm lg:text-base" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Message</label>
                     <textarea rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl px-5 lg:px-6 py-3 lg:py-4 focus:border-emerald-500 outline-none transition-all font-bold resize-none text-sm lg:text-base" />
                  </div>
                  <button className="w-full py-4 lg:py-5 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-xl lg:rounded-2xl shadow-xl shadow-emerald-500/20 transition-all uppercase tracking-widest text-xs lg:text-sm">
                    Inquire Now
                  </button>
                </form>
              </div>
              <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-emerald-500/10 blur-[120px] rounded-full" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* High-End Enterprise Footer */}
      <footer className="pt-24 pb-12 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                  <Truck className="text-white" size={20} />
                </div>
                <span className="font-extrabold text-2xl tracking-tighter text-slate-900">FleetFlow</span>
              </div>
              <p className="text-slate-500 font-medium leading-relaxed max-w-xs mb-8">
                The world's most advanced logistics intelligence platform. Built for the modern supply chain.
              </p>
              <div className="flex items-center gap-4">
                {['tw', 'li', 'ig', 'gh'].map(social => (
                  <div key={social} className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-100 transition-all cursor-pointer shadow-sm">
                    <span className="text-[10px] font-black uppercase">{social}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-8">Resources</h4>
              <ul className="space-y-4">
                {['Documentation', 'API Reference', 'User Guide', 'Live Status'].map(item => (
                  <li key={item}><a href="#" className="text-sm font-bold text-slate-500 hover:text-emerald-500 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-8">Solutions</h4>
              <ul className="space-y-4">
                {['Fuel Efficiency', 'Route Planning', 'Driver Safety', 'Asset Health'].map(item => (
                  <li key={item}><a href="#" className="text-sm font-bold text-slate-500 hover:text-emerald-500 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-8">Legal</h4>
              <ul className="space-y-4">
                {['Privacy Policy', 'Terms of Use', 'Cookie Policy', 'Security'].map(item => (
                  <li key={item}><a href="#" className="text-sm font-bold text-slate-500 hover:text-emerald-500 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-slate-200/60 gap-8">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">© 2026 FleetFlow Technology Group. All Rights Reserved.</p>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Global Status: Optimal</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
