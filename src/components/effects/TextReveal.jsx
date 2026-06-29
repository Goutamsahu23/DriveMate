import { motion } from 'framer-motion'

export default function TextReveal({ text, className = '', delay = 0, as = 'span' }) {
  const words = text.split(' ')
  const Wrapper = as

  return (
    <Wrapper className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em]">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', rotateX: 40 }}
            animate={{ y: 0, rotateX: 0 }}
            transition={{
              duration: 0.6,
              delay: delay + i * 0.06,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Wrapper>
  )
}
