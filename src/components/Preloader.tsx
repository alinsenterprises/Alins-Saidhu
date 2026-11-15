import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MrInsaneLogo } from './MrInsaneLogo';

interface PreloaderProps {
  visible: boolean;
  onFinish: () => void;
}

export function Preloader({ visible, onFinish }: PreloaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!visible) return;
    setProgress(0);
    const start = performance.now();
    const duration = 1200;
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (elapsed < duration) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(onFinish, 180);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, onFinish]);

  const stageLabel =
    progress < 38
      ? 'Connecting mrinsane.in storefront'
      : progress < 78
      ? 'Syncing shared & private slots'
      : 'Ready for instant delivery';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Loading Mr. Insane storefront"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.34, ease: [0.16, 1, 0.3, 1] } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080E1C] text-white px-6 overflow-hidden"
        >
          {/* Subtle architectural cobalt spotlight */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 50% 42%, rgba(24, 140, 224, 0.22) 0%, rgba(8, 14, 28, 0) 56%)',
            }}
          />

          <div className="relative z-10 flex flex-col items-center max-w-xs w-full text-center">
            <motion.div
              initial={{ scale: 0.84, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8"
            >
              <MrInsaneLogo size={96} mode="loading" halo interactive={false} />
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.08 }}
              className="space-y-1.5"
            >
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Mr. Insane
              </h2>
              <p className="text-sm text-slate-300">
                mrinsane.in <span aria-hidden="true">·</span> Subscription Exchange
              </p>
            </motion.div>

            <div className="mt-8 w-full space-y-2.5">
              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#188CE0] to-[#38BDF8] rounded-full origin-left transition-transform duration-75"
                  style={{ transform: `scaleX(${progress / 100})` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono tabular-nums">
                <span className="font-sans">{stageLabel}</span>
                <span className="text-sky-400">{progress}%</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onFinish}
              className="mt-8 text-xs font-medium text-slate-400 hover:text-white underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#188CE0] py-1.5 px-3"
            >
              Skip intro
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
