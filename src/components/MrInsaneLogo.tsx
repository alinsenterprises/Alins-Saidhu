import { motion } from 'motion/react';

export interface MrInsaneLogoProps {
  size?: number;
  mode?: 'idle' | 'loading' | 'success';
  interactive?: boolean;
  halo?: boolean;
  className?: string;
}

/**
 * Animated Mr. Insane emblem modeled directly after the brand's
 * cobalt circle + two user silhouettes + opposing exchange arrows.
 */
export function MrInsaneLogo({
  size = 40,
  mode = 'idle',
  interactive = true,
  halo = false,
  className = '',
}: MrInsaneLogoProps) {
  const isLoading = mode === 'loading';
  const isSuccess = mode === 'success';

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      initial={false}
      whileHover={interactive ? 'hovered' : undefined}
      animate={isLoading ? 'loading' : isSuccess ? 'success' : 'idle'}
    >
      {/* Concentric showcase halo ring */}
      {halo && (
        <motion.svg
          viewBox="0 0 120 120"
          className="absolute -inset-3 w-[calc(100%+24px)] h-[calc(100%+24px)] pointer-events-none"
          aria-hidden="true"
          animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
          transition={
            isLoading
              ? { duration: 6, repeat: Infinity, ease: 'linear' }
              : { duration: 0.4 }
          }
        >
          <circle
            cx="60"
            cy="60"
            r="56"
            fill="none"
            stroke="#188CE0"
            strokeOpacity="0.28"
            strokeWidth="1.2"
            strokeDasharray="6 6"
          />
        </motion.svg>
      )}

      {/* Orbital progress arc when loading */}
      {isLoading && (
        <motion.svg
          viewBox="0 0 100 100"
          className="absolute -inset-1.5 w-[calc(100%+12px)] h-[calc(100%+12px)] pointer-events-none"
          aria-hidden="true"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.25, repeat: Infinity, ease: 'linear' }}
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="#188CE0"
            strokeOpacity="0.22"
            strokeWidth="3"
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="78 220"
          />
        </motion.svg>
      )}

      {/* Core Mr. Insane Brand Circle */}
      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-sm"
        role="img"
        aria-label="Mr. Insane logo"
        variants={{
          idle: { scale: 1 },
          hovered: { scale: 1.06 },
          loading: { scale: [1, 1.035, 1] },
          success: { scale: [1, 1.08, 1] },
        }}
        transition={
          isLoading
            ? { duration: 1.3, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
        }
      >
        <defs>
          <linearGradient id="mrinsane-cobalt-grad" x1="15%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stopColor="#269DF0" />
            <stop offset="100%" stopColor="#1274C4" />
          </linearGradient>
          <clipPath id="mrinsane-circle-clip">
            <circle cx="50" cy="50" r="48" />
          </clipPath>
        </defs>

        <circle cx="50" cy="50" r="48" fill="url(#mrinsane-cobalt-grad)" />

        <g clipPath="url(#mrinsane-circle-clip)">
          {/* Left silhouette */}
          <motion.g
            variants={{
              idle: { x: 0 },
              hovered: { x: -1.5 },
              loading: { x: [0, -2, 0] },
              success: { x: 0 },
            }}
            transition={
              isLoading
                ? { duration: 1.0, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
            }
          >
            <circle cx="34" cy="34" r="9.5" fill="#FFFFFF" />
            <path
              d="M17.5 67.5 C17.5 54.5 24.5 47.5 34 47.5 C43.5 47.5 48.5 54.5 48.5 67.5 C48.5 70.5 46.2 72.5 43.2 72.5 L22.8 72.5 C19.8 72.5 17.5 70.5 17.5 67.5 Z"
              fill="#FFFFFF"
            />
            <motion.path
              d="M42.5 60.5 L28 60.5 M33.5 55 L27.5 60.5 L33.5 66"
              fill="none"
              stroke="#1682D4"
              strokeWidth="4.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={{
                idle: { x: 0 },
                hovered: { x: -2.5 },
                loading: { x: [0, -3.5, 0] },
                success: { x: -1 },
              }}
              transition={
                isLoading
                  ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
              }
            />
          </motion.g>

          {/* Right silhouette */}
          <motion.g
            variants={{
              idle: { x: 0 },
              hovered: { x: 1.5 },
              loading: { x: [0, 2, 0] },
              success: { x: 0 },
            }}
            transition={
              isLoading
                ? { duration: 1.0, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
            }
          >
            <circle cx="66" cy="34" r="9.5" fill="#FFFFFF" />
            <path
              d="M51.5 67.5 C51.5 54.5 56.5 47.5 66 47.5 C75.5 47.5 82.5 54.5 82.5 67.5 C82.5 70.5 80.2 72.5 77.2 72.5 L56.8 72.5 C53.8 72.5 51.5 70.5 51.5 67.5 Z"
              fill="#FFFFFF"
            />
            <motion.path
              d="M57.5 60.5 L72 60.5 M66.5 55 L72.5 60.5 L66.5 66"
              fill="none"
              stroke="#1682D4"
              strokeWidth="4.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={{
                idle: { x: 0 },
                hovered: { x: 2.5 },
                loading: { x: [0, 3.5, 0] },
                success: { x: 1 },
              }}
              transition={
                isLoading
                  ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
              }
            />
          </motion.g>
        </g>
      </motion.svg>
    </motion.div>
  );
}

export function MrInsaneButtonLoader({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <MrInsaneLogo size={18} mode="loading" interactive={false} />
      {label && <span>{label}</span>}
    </span>
  );
}
