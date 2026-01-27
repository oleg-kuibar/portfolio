import { motion } from 'framer-motion';

export function FloatingTailwind() {
  return (
    <motion.a
      href="https://tailwindcss.com/sponsors"
      target="_blank"
      rel="noopener noreferrer"
      className="floating-tailwind hidden lg:flex fixed right-[8%] top-[28%] z-40 rotate-[-6deg]"
      title="Support Tailwind CSS"
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.2 },
      }}
    >
      <div className="postal-stamp">
        {/* Perforated border effect */}
        <div className="stamp-border">
          <div className="stamp-inner">
            {/* Tailwind logo */}
            <svg viewBox="0 0 24 24" className="stamp-logo">
              <path
                d="M12 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.31.74 1.91 1.35.98 1 2.09 2.15 4.59 2.15 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.91-1.35C15.61 7.15 14.5 6 12 6zm-5 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.91 1.35C8.39 16.85 9.5 18 12 18c2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.91-1.35C10.61 13.15 9.5 12 7 12z"
                className="fill-[#38bdf8]"
              />
            </svg>
            <span className="stamp-text">SPONSOR</span>
            <span className="stamp-subtext">tailwindcss</span>
          </div>
        </div>
        {/* External link indicator */}
        <svg viewBox="0 0 24 24" className="external-icon">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </div>

      <style>{`
        .floating-tailwind .postal-stamp {
          position: relative;
        }
        .floating-tailwind .stamp-border {
          background: #fef3c7;
          padding: 6px;
          border-radius: 2px;
          background-image: radial-gradient(circle, transparent 50%, #fef3c7 50%);
          background-size: 8px 8px;
          background-position: -4px -4px;
        }
        html.dark .floating-tailwind .stamp-border {
          background-color: #3d3530;
          background-image: radial-gradient(circle, transparent 50%, #3d3530 50%);
        }
        .floating-tailwind .stamp-inner {
          background: #fefefe;
          border: 2px solid #1a1a1a;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        html.dark .floating-tailwind .stamp-inner {
          background: #2a2520;
          border-color: #e5e5e5;
        }
        .floating-tailwind .stamp-logo {
          width: 40px;
          height: 40px;
        }
        .floating-tailwind .stamp-text {
          font-family: 'Courier New', monospace;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #1a1a1a;
        }
        html.dark .floating-tailwind .stamp-text {
          color: #e5e5e5;
        }
        .floating-tailwind .stamp-subtext {
          font-family: 'Comic Sans MS', 'Chalkboard SE', cursive;
          font-size: 0.6rem;
          color: #666;
        }
        html.dark .floating-tailwind .stamp-subtext {
          color: #aaa;
        }
        .floating-tailwind .external-icon {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 10px;
          height: 10px;
          fill: none;
          stroke: #1a1a1a;
          stroke-width: 2.5;
          stroke-linecap: round;
          stroke-linejoin: round;
          opacity: 0.4;
        }
        html.dark .floating-tailwind .external-icon {
          stroke: #e5e5e5;
        }
      `}</style>
    </motion.a>
  );
}
