
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// ELLALLE Design System Colors
				'space': {
					50: 'hsl(var(--space-50))',
					100: 'hsl(var(--space-100))',
					200: 'hsl(var(--space-200))',
					300: 'hsl(var(--space-300))',
					400: 'hsl(var(--space-400))',
					500: 'hsl(var(--space-500))',
					600: 'hsl(var(--space-600))',
					700: 'hsl(var(--space-700))',
					800: 'hsl(var(--space-800))',
					900: 'hsl(var(--space-900))',
				},
				'neon': {
					purple: 'hsl(var(--neon-purple))',
					blue: 'hsl(var(--neon-blue))',
					green: 'hsl(var(--neon-green))',
					orange: 'hsl(var(--neon-orange))',
					pink: 'hsl(var(--neon-pink))',
				},
				'profit': 'hsl(var(--profit))',
				'loss': 'hsl(var(--loss))',
				'neutral': 'hsl(var(--neutral))',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			backdropBlur: {
				glass: '16px',
			},
			boxShadow: {
				'glow': '0 0 20px rgba(139, 92, 246, 0.3)',
				'glow-green': '0 0 20px rgba(16, 185, 129, 0.3)',
				'glow-orange': '0 0 20px rgba(245, 158, 11, 0.3)',
				'glass': '0 8px 32px rgba(31, 38, 135, 0.37)',
			},
			backgroundImage: {
				'gradient-primary': 'linear-gradient(135deg, hsl(var(--neon-purple)) 0%, hsl(var(--neon-blue)) 100%)',
				'gradient-profit': 'linear-gradient(135deg, hsl(var(--profit)) 0%, hsl(var(--neon-green)) 100%)',
				'gradient-loss': 'linear-gradient(135deg, hsl(var(--loss)) 0%, hsl(var(--neon-orange)) 100%)',
				'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
				'space-gradient': 'radial-gradient(ellipse at center, hsl(var(--space-800)) 0%, hsl(var(--space-900)) 100%)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'glow-pulse': {
					'0%, 100%': { 
						boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
						transform: 'scale(1)'
					},
					'50%': { 
						boxShadow: '0 0 30px rgba(139, 92, 246, 0.6)',
						transform: 'scale(1.02)'
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'slide-in': {
					'0%': { transform: 'translateX(-100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'gradient-shift': {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'float': 'float 6s ease-in-out infinite',
				'slide-in': 'slide-in 0.5s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'gradient-shift': 'gradient-shift 3s ease-in-out infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
