"use client";

import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/routing';
import { motion } from "framer-motion";
import { 
  Wallet, 
  CheckCircle2, 
  BarChart3, 
  ShieldCheck, 
  ArrowRight, 
  PieChart, 
  TrendingUp, 
  Zap,
  Globe,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LocaleSwitcher from "@/components/shared/LocaleSwitcher";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function LandingPage() {
  const t = useTranslations('HomePage');
  const navT = useTranslations('Navigation');
  const footerT = useTranslations('Footer');

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="px-4 lg:px-8 h-20 flex items-center justify-between border-b sticky top-0 bg-white/70 backdrop-blur-xl z-50">
        <Link className="flex items-center gap-2.5 group" href="/">
          <div className="bg-primary p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-black text-primary tracking-tight">MoneyMate</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors" href="#features">
            {navT('features')}
          </Link>
          <Link className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors" href="#about">
            {navT('about')}
          </Link>
          <LocaleSwitcher />
          <Link className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors" href="/login">
            {navT('login')}
          </Link>
          <Link href="/register">
            <Button className="rounded-full px-6 font-bold shadow-lg shadow-primary/20">
              {navT('register')}
            </Button>
          </Link>
        </nav>

        {/* Mobile menu simple version */}
        <div className="md:hidden flex items-center gap-4">
          <LocaleSwitcher />
          <Link href="/login">
            <Button variant="ghost" size="sm" className="font-bold">{navT('login')}</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-20 lg:pt-32 lg:pb-32 bg-slate-50">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden z-0">
            <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-20%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
          </div>

          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4 animate-bounce">
                <Zap className="w-4 h-4" /> {t('heroBadge')}
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
                {t('title')}
              </h1>
              <p className="mx-auto max-w-[700px] text-slate-500 md:text-xl leading-relaxed">
                {t('description')}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
                <Link href="/register">
                  <Button size="lg" className="h-14 px-10 text-lg font-bold rounded-2xl shadow-xl shadow-primary/25">
                    {t('registerFree')} <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold rounded-2xl border-2 hover:bg-slate-100">
                    {t('viewDemo')}
                  </Button>
                </Link>
              </div>

              {/* Mockup Dashboard Preview */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="mt-20 relative max-w-5xl mx-auto rounded-3xl border-8 border-slate-900 shadow-2xl overflow-hidden aspect-[16/9] bg-white group"
              >
                <div className="absolute inset-0 bg-slate-50 flex flex-col">
                  {/* Fake UI Header */}
                  <div className="h-12 bg-white border-b flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <div className="ml-4 h-5 w-48 bg-slate-100 rounded-full" />
                  </div>
                  {/* Fake UI Body */}
                  <div className="flex-1 p-6 grid grid-cols-12 gap-6">
                    <div className="col-span-3 space-y-4">
                      {[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-slate-100 rounded-xl" />)}
                    </div>
                    <div className="col-span-9 space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-24 bg-primary/10 rounded-2xl border border-primary/20 p-4">
                          <div className="h-4 w-12 bg-primary/20 rounded mb-2" />
                          <div className="h-6 w-20 bg-primary/40 rounded" />
                        </div>
                        <div className="h-24 bg-emerald-50 rounded-2xl border border-emerald-100 p-4">
                          <div className="h-4 w-12 bg-emerald-100 rounded mb-2" />
                          <div className="h-6 w-20 bg-emerald-200 rounded" />
                        </div>
                        <div className="h-24 bg-red-50 rounded-2xl border border-red-100 p-4">
                          <div className="h-4 w-12 bg-red-100 rounded mb-2" />
                          <div className="h-6 w-20 bg-red-200 rounded" />
                        </div>
                      </div>
                      <div className="h-48 bg-slate-100 rounded-3xl" />
                      <div className="h-32 bg-white border rounded-3xl p-4 flex gap-4">
                        <div className="h-full w-24 bg-slate-50 rounded-2xl" />
                        <div className="flex-1 space-y-2 py-2">
                          <div className="h-4 w-full bg-slate-100 rounded" />
                          <div className="h-4 w-2/3 bg-slate-100 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Overlay text */}
                <div className="absolute inset-0 bg-primary/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <div className="bg-white px-8 py-4 rounded-full font-black text-primary shadow-2xl transform scale-150">
                      {t('exploreDashboard')}
                   </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-primary text-white overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-1">
                <h3 className="text-4xl font-black">100K+</h3>
                <p className="text-primary-foreground/70 font-medium">{t('stats.users')}</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-4xl font-black">500M+</h3>
                <p className="text-primary-foreground/70 font-medium">{t('stats.transactions')}</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-4xl font-black">4.9/5</h3>
                <p className="text-primary-foreground/70 font-medium">{t('stats.rating')}</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-4xl font-black">Top 1</h3>
                <p className="text-primary-foreground/70 font-medium">{t('stats.topApp')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-24 lg:py-32 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-primary font-black uppercase tracking-widest text-sm">{t('features.badge')}</h2>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">{t('features.title')}</h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-lg">{t('features.description')}</p>
            </div>
            
            <motion.div 
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <motion.div variants={item} className="group p-8 bg-slate-50 rounded-[2.5rem] border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black mb-4">{t('features.fastRecording.title')}</h3>
                <p className="text-slate-500 leading-relaxed">{t('features.fastRecording.description')}</p>
              </motion.div>

              <motion.div variants={item} className="group p-8 bg-slate-50 rounded-[2.5rem] border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <PieChart className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black mb-4">{t('features.diverseStats.title')}</h3>
                <p className="text-slate-500 leading-relaxed">{t('features.diverseStats.description')}</p>
              </motion.div>

              <motion.div variants={item} className="group p-8 bg-slate-50 rounded-[2.5rem] border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black mb-4">{t('features.multiLayerSecurity.title')}</h3>
                <p className="text-slate-500 leading-relaxed">{t('features.multiLayerSecurity.description')}</p>
              </motion.div>

              <motion.div variants={item} className="group p-8 bg-slate-50 rounded-[2.5rem] border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black mb-4">{t('features.savingPlan.title')}</h3>
                <p className="text-slate-500 leading-relaxed">{t('features.savingPlan.description')}</p>
              </motion.div>

              <motion.div variants={item} className="group p-8 bg-slate-50 rounded-[2.5rem] border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300">
                <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black mb-4">{t('features.cloudSync.title')}</h3>
                <p className="text-slate-500 leading-relaxed">{t('features.cloudSync.description')}</p>
              </motion.div>

              <motion.div variants={item} className="group p-8 bg-slate-50 rounded-[2.5rem] border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300">
                <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black mb-4">{t('features.groupManagement.title')}</h3>
                <p className="text-slate-500 leading-relaxed">{t('features.groupManagement.description')}</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="bg-primary rounded-[3rem] p-12 lg:p-20 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center text-white">
                <div className="space-y-6">
                  <div className="flex gap-1 text-yellow-400">
                    {[1,2,3,4,5].map(i => <Zap key={i} className="fill-current w-5 h-5" />)}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black leading-tight">{t('testimonials.quote')}</h2>
                  <p className="text-xl text-primary-foreground/80 leading-relaxed">
                    {t('testimonials.description')}
                  </p>
                  <div className="flex items-center gap-4 pt-4 border-t border-white/20">
                    <div className="w-16 h-16 rounded-full bg-slate-200 border-4 border-white/20" />
                    <div>
                      <p className="font-black text-2xl">{t('testimonials.author')}</p>
                      <p className="text-primary-foreground/60">{t('testimonials.role')}</p>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="bg-white/10 aspect-square rounded-[2rem] backdrop-blur-3xl border border-white/20 p-8 rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="space-y-6">
                       <div className="h-8 w-3/4 bg-white/20 rounded-full" />
                       <div className="h-24 w-full bg-white/20 rounded-3xl" />
                       <div className="h-8 w-1/2 bg-white/20 rounded-full" />
                       <div className="h-24 w-full bg-white/20 rounded-3xl" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-24 lg:py-32 bg-white relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="max-w-4xl mx-auto bg-slate-900 rounded-[3.5rem] p-12 lg:p-20 text-center text-white space-y-8 shadow-2xl relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" />

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                  {t('cta.title')}
                </h2>
                <p className="mx-auto max-w-[600px] text-slate-400 text-lg md:text-xl leading-relaxed">
                  {t('cta.description')}
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-6 pt-6">
                  <Link href="/register">
                    <Button size="lg" variant="secondary" className="h-16 px-12 text-xl font-black rounded-2xl bg-white text-slate-900 hover:bg-slate-100 shadow-xl">
                      {t('cta.register')}
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="h-16 px-12 text-xl font-black rounded-2xl border-white/20 hover:bg-white/10 shadow-xl">
                      {t('cta.login')}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <Link className="flex items-center gap-2.5" href="/">
                <div className="bg-primary p-2 rounded-xl">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-black text-primary tracking-tight">MoneyMate</span>
              </Link>
              <p className="text-slate-500 max-w-sm text-lg leading-relaxed">
                {footerT('mission')}
              </p>
              <div className="flex gap-4">
                 {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full bg-slate-200" />)}
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="font-black text-lg">{footerT('product')}</h4>
              <ul className="space-y-4 text-slate-500">
                <li><Link href="#features" className="hover:text-primary transition-colors">{footerT('links.features')}</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">{footerT('links.pricing')}</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">{footerT('links.api')}</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">{footerT('links.download')}</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="font-black text-lg">{footerT('support')}</h4>
              <ul className="space-y-4 text-slate-500">
                <li><Link href="#" className="hover:text-primary transition-colors">{footerT('links.helpCenter')}</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">{footerT('links.terms')}</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">{footerT('links.privacy')}</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">{footerT('links.contact')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 font-medium">
            <p>{footerT('copyright', { year: new Date().getFullYear() })}</p>
            <p>{footerT('madeWith')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
