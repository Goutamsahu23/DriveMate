import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import PublicNav from '../../components/layout/PublicNav'
import GrainOverlay from '../../components/effects/GrainOverlay'
import FloatingOrbs from '../../components/effects/FloatingOrbs'
import TextReveal from '../../components/effects/TextReveal'
import MagneticButton from '../../components/effects/MagneticButton'
import Button from '../../components/ui/Button'
import { useMousePosition } from '../../hooks/useMousePosition'
import { staggerContainer, staggerItem } from '../../lib/motion'
import {
  MARQUEE_ITEMS,
  ACCENT_TEXT,
  FEATURES,
  HOW_IT_WORKS,
  STATS,
  RIDE_CLASSES,
  TESTIMONIALS,
  FAQ,
} from '../../data/landing'

export default function Landing() {
  const { user } = useAuth()
  const { x, y } = useMousePosition()
  const [openFaq, setOpenFaq] = useState(null)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <div className="min-h-screen bg-void relative overflow-hidden">
      <GrainOverlay />
      <FloatingOrbs />
      <PublicNav />

      {/* Cursor glow */}
      <motion.div
        className="fixed w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(200,255,0,0.06) 0%, transparent 70%)',
          left: x - 250,
          top: y - 250,
        }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-24 pb-20 px-6">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            <div className="lg:col-span-7">
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="font-mono text-xs uppercase tracking-[0.4em] text-volt mb-6"
              >
                The future of urban mobility
              </motion.p>

              <h1 className="font-display font-extrabold text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tight text-mist mb-8">
                <TextReveal text="Move" delay={0.3} />
                <br />
                <span className="text-gradient-volt">
                  <TextReveal text="Different." delay={0.5} />
                </span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="text-mist-muted text-lg md:text-xl max-w-lg leading-relaxed mb-10"
              >
                Not another ride app. A kinetic experience that connects you to the city
                in real-time — with intention, precision, and zero compromise.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex flex-wrap gap-4"
              >
                {user ? (
                  <Link to={user.role === 'driver' ? '/driver' : '/rider'}>
                    <MagneticButton>
                      <Button>Enter Dashboard →</Button>
                    </MagneticButton>
                  </Link>
                ) : (
                  <>
                    <Link to="/register">
                      <MagneticButton>
                        <Button>Start Riding</Button>
                      </MagneticButton>
                    </Link>
                    <Link to="/register">
                      <MagneticButton strength={0.2}>
                        <Button variant="secondary">Become a Driver</Button>
                      </MagneticButton>
                    </Link>
                  </>
                )}
              </motion.div>
            </div>

            {/* Hero visual — floating ride card */}
            <div className="lg:col-span-5 relative perspective-1000">
              <motion.div
                initial={{ opacity: 0, rotateY: -15, rotateX: 10 }}
                animate={{ opacity: 1, rotateY: 0, rotateX: 0 }}
                transition={{ delay: 0.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative preserve-3d"
              >
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="glass-strong rounded-4xl p-8 border border-surface-border-strong shadow-glass-lg"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-mist-dim">Live ride</p>
                      <p className="font-display font-bold text-lg text-mist mt-1">In progress</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-volt animate-pulse" />
                      <span className="font-mono text-xs text-volt">ACTIVE</span>
                    </div>
                  </div>

                  <div className="space-y-1 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full bg-volt shadow-[0_0_12px_rgba(200,255,0,0.5)]" />
                      <div>
                        <p className="text-xs font-mono text-mist-dim uppercase tracking-wider">Pickup</p>
                        <p className="text-mist text-sm">Connaught Place, Delhi</p>
                      </div>
                    </div>
                    <div className="ml-1.5 border-l-2 border-dashed border-volt/20 h-8" />
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full bg-coral shadow-[0_0_12px_rgba(255,77,109,0.5)]" />
                      <div>
                        <p className="text-xs font-mono text-mist-dim uppercase tracking-wider">Dropoff</p>
                        <p className="text-mist text-sm">India Gate, New Delhi</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end justify-between pt-6 border-t border-surface-border">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-mist-dim">ETA</p>
                      <p className="font-display font-bold text-2xl text-mist">4 min</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-mist-dim">Fare</p>
                      <p className="font-display font-bold text-2xl text-volt">₹185</p>
                    </div>
                  </div>
                </motion.div>

                {/* Decorative elements */}
                <motion.div
                  className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full border border-volt/20 bg-volt/5"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-5 h-8 rounded-full border border-surface-border-strong flex items-start justify-center p-1.5">
            <motion.div className="w-1 h-2 rounded-full bg-volt" animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} />
          </div>
        </motion.div>
      </section>

      {/* Marquee */}
      <div className="relative py-6 border-y border-surface-border overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="mx-8 font-mono text-sm uppercase tracking-[0.3em] text-mist-dim flex items-center gap-8">
              {item}
              <span className="text-volt">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* Features — asymmetric layout */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-volt mb-4">Why DriveMate</p>
            <h2 className="section-title max-w-2xl">
              Engineered for those who refuse the ordinary.
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            className="grid md:grid-cols-3 gap-6"
          >
            {FEATURES.map((feature) => (
              <motion.div
                key={feature.num}
                variants={staggerItem}
                className="group relative glass rounded-3xl p-8 hover:border-volt/20 transition-all duration-700"
              >
                <span className={`font-display font-extrabold text-6xl opacity-10 group-hover:opacity-20 transition-opacity duration-500 ${ACCENT_TEXT[feature.accent]}`}>
                  {feature.num}
                </span>
                <h3 className="font-display font-bold text-xl text-mist mt-4 mb-3">{feature.title}</h3>
                <p className="text-mist-muted text-sm leading-relaxed">{feature.desc}</p>
                <div className="glow-line mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="relative py-16 px-6 border-b border-surface-border">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center items-center gap-x-12 gap-y-10 md:gap-x-16 lg:gap-x-24"
          >
            {STATS.map((stat) => (
              <motion.div key={stat.label} variants={staggerItem} className="text-center min-w-[140px]">
                <p className="font-display font-extrabold text-4xl md:text-5xl text-volt tracking-tight">{stat.value}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-mist-dim mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative py-32 px-6 diagonal-cut-reverse">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 md:flex md:items-end md:justify-between gap-8"
          >
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.4em] text-iris mb-4">The journey</p>
              <h2 className="section-title max-w-xl">Four steps.<br />Zero friction.</h2>
            </div>
            <p className="text-mist-muted text-sm max-w-sm md:text-right mt-4 md:mt-0 leading-relaxed">
              From tap to arrival — every step is designed to disappear into the background.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative group"
              >
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-surface-border-strong to-transparent z-0" />
                )}
                <div className="glass rounded-3xl p-6 h-full hover:border-volt/20 transition-all duration-500 relative z-10">
                  <span className={`font-mono text-xs ${ACCENT_TEXT[item.accent]} opacity-60`}>{item.step}</span>
                  <h3 className="font-display font-bold text-lg text-mist mt-3 mb-2">{item.title}</h3>
                  <p className="text-mist-muted text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ride classes */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-iris/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-coral mb-4">Ride classes</p>
            <h2 className="section-title">Choose your energy.</h2>
            <p className="text-mist-muted mt-4 max-w-md mx-auto text-sm">
              Three tiers. One standard of quality. Pick what fits the moment.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {RIDE_CLASSES.map((ride, i) => (
              <motion.div
                key={ride.name}
                variants={staggerItem}
                className={`relative glass rounded-3xl p-8 text-center hover:-translate-y-2 transition-all duration-500 ${
                  i === 1 ? 'md:-mt-4 border-volt/20 shadow-volt' : ''
                }`}
              >
                {i === 1 && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-widest bg-volt text-void px-3 py-1 rounded-full">
                    Popular
                  </span>
                )}
                <span className="text-4xl block mb-4">{ride.icon}</span>
                <h3 className="font-display font-bold text-2xl text-mist">{ride.name}</h3>
                <p className="font-mono text-xs text-mist-dim uppercase tracking-widest mt-1 mb-4">{ride.rate}</p>
                <p className="text-mist-muted text-sm leading-relaxed">{ride.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Rider vs Driver split */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-volt mb-4">Two paths</p>
            <h2 className="section-title">Built for both sides of the ride.</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-4xl border border-volt/20 bg-gradient-to-br from-volt/10 via-void-100 to-transparent p-8 md:p-12 group"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-volt/10 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-volt mb-4">For riders</p>
                <h3 className="font-display font-bold text-3xl text-mist mb-4">Get anywhere.<br />Effortlessly.</h3>
                <ul className="space-y-3 mb-8">
                  {['Instant booking with live map', 'Real-time driver tracking', 'OTP-secured pickups', 'Transparent fare estimates'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-mist-muted text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-volt shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                {!user && (
                  <Link to="/register">
                    <Button>Start Riding →</Button>
                  </Link>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-4xl border border-iris/20 bg-gradient-to-br from-iris/10 via-void-100 to-transparent p-8 md:p-12 group"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-iris/10 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-iris mb-4">For drivers</p>
                <h3 className="font-display font-bold text-3xl text-mist mb-4">Earn on<br />your terms.</h3>
                <ul className="space-y-3 mb-8">
                  {['Go online/offline instantly', 'Accept rides in one tap', 'Live ride request feed', 'Track earnings per trip'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-mist-muted text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-iris shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                {!user && (
                  <Link to="/register">
                    <Button variant="secondary">Drive with Us →</Button>
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-32 px-6 border-y border-surface-border">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-volt mb-4">Voices</p>
            <h2 className="section-title">People who moved different.</h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {TESTIMONIALS.map((t) => (
              <motion.div
                key={t.name}
                variants={staggerItem}
                className="glass rounded-3xl p-8 flex flex-col justify-between hover:border-surface-border-strong transition-all duration-500"
              >
                <div>
                  <span className="text-3xl text-volt/30 font-serif leading-none">"</span>
                  <p className="text-mist text-sm leading-relaxed -mt-2 mb-6">{t.quote}</p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-surface-border">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-volt/30 to-iris/30 flex items-center justify-center font-display font-bold text-mist text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-display font-semibold text-mist text-sm">{t.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-mist-dim">{t.role} · {t.city}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-iris mb-4">FAQ</p>
            <h2 className="section-title">Questions? Answered.</h2>
          </motion.div>

          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-surface-hover transition-colors"
                >
                  <span className="font-display font-semibold text-mist text-sm">{item.q}</span>
                  <motion.span
                    animate={{ rotate: openFaq === i ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-volt text-xl shrink-0 leading-none"
                  >
                    +
                  </motion.span>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-mist-muted text-sm leading-relaxed">{item.a}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — diagonal section */}
      <section className="relative py-32 px-6 diagonal-cut bg-gradient-to-br from-volt/5 via-void-100 to-iris/5 border-y border-surface-border">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display font-extrabold text-4xl md:text-6xl text-mist mb-6 tracking-tight"
          >
            Ready to <span className="text-gradient-volt">move</span>?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-mist-muted text-lg mb-10 max-w-lg mx-auto"
          >
            Join riders and drivers who chose something better than a template.
          </motion.p>
          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link to="/register">
                <MagneticButton>
                  <Button className="!text-base !px-10 !py-4">Create Your Account</Button>
                </MagneticButton>
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-surface-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-volt flex items-center justify-center">
                  <span className="font-display font-extrabold text-void text-xs">D</span>
                </div>
                <span className="font-display font-bold text-mist">DriveMate</span>
              </div>
              <p className="text-mist-muted text-sm max-w-xs leading-relaxed">
                Urban mobility reimagined. Real-time rides for riders and drivers who expect more.
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-mist-dim mb-4">Product</p>
              <ul className="space-y-2">
                {['Book a Ride', 'Drive with Us', 'Ride Classes', 'Safety'].map((link) => (
                  <li key={link}>
                    <Link to="/register" className="text-mist-muted text-sm hover:text-volt transition-colors">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-mist-dim mb-4">Account</p>
              <ul className="space-y-2">
                <li><Link to="/login" className="text-mist-muted text-sm hover:text-volt transition-colors">Sign In</Link></li>
                <li><Link to="/register" className="text-mist-muted text-sm hover:text-volt transition-colors">Register</Link></li>
              </ul>
            </div>
          </div>
          <div className="glow-line mb-8" />
          <p className="font-mono text-xs text-mist-dim text-center">© 2026 DriveMate. Crafted with obsession.</p>
        </div>
      </footer>
    </div>
  )
}
