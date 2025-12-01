import tailwindCssAnimate from 'tailwindcss-animate'
import defaultTheme from 'tailwindcss/defaultTheme'
import plugin from 'tailwindcss/plugin'
import containerQueries from '@tailwindcss/container-queries'

// Define the shade numbers once
const SHADE_NUMBERS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]

// Generate color config with CSS variables
const generateColorConfig = (colorNames) =>
  colorNames.reduce(
    (config, color) => ({
      ...config,
      [color]: SHADE_NUMBERS.reduce(
        (shadeConfig, shade) => ({
          ...shadeConfig,
          [shade]: `hsl(var(--color-${color}-${shade}) / <alpha-value>)`,
        }),
        {},
      ),
    }),
    {},
  )

const colorNames = ['gray', 'purple', 'red', 'orange', 'green', 'blue', 'yellow', 'pink', 'brand']
const customColors = generateColorConfig(colorNames)

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: 'selector',
  content: [
    './app/**/*.{js,ts,jsx,tsx,css,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,css,mdx}',
    './components/**/*.{js,ts,jsx,tsx,css,mdx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-suisse)', 'Inter', ...defaultTheme.fontFamily.sans],
        // -------- CUSTOM COMPONENT THEME FONTS --------
        'ct-dialog-font-family': [
          'var(--ct-dialog-font-family)',
          'Inter',
          ...defaultTheme.fontFamily.sans,
        ],
      },
      colors: {
        white: 'hsl(var(--color-white) / <alpha-value>)',
        black: 'hsl(var(--color-black) / <alpha-value>)',
        // ------- OUR DESIGN SYSTEM COLORS -------
        ...customColors,
        // -------- CUSTOM COMPONENT THEME COLORS --------
        'ct-primary': 'rgb(var(--ct-primary-color) / <alpha-value>)',
        'ct-close': 'rgb(var(--ct-close-color) / <alpha-value>)',
        'ct-dialog-text': 'rgb(var(--ct-dialog-text-color) / <alpha-value>)',
        'ct-dialog-bg': 'rgb(var(--ct-dialog-bg-color))',
        'ct-dialog-border': 'rgb(var(--ct-dialog-border-color) / <alpha-value>)',
        'ct-progress-bar': 'rgb(var(--ct-progress-bar-color) / <alpha-value>)',
        'ct-checkmark-bg': 'rgb(var(--ct-checklist-checkmark-bg-color) / <alpha-value>)',
        'ct-focus-ring-color': 'rgb(var(--ct-focus-ring-color) / <alpha-value>)',
        // Primary button
        'ct-button-bg': 'rgb(var(--ct-button-bg-color))',
        'ct-button-bg-hover': 'rgb(var(--ct-button-bg-color-hover))',
        'ct-button-bg-active': 'rgb(var(--ct-button-bg-color-active))',
        'ct-button-text': 'rgb(var(--ct-button-text-color))',
        'ct-button-text-hover': 'rgb(var(--ct-button-text-color-hover))',
        'ct-button-border': 'rgb(var(--ct-button-border-color))',
        'ct-button-border-hover': 'rgb(var(--ct-button-border-color-hover))',
        'ct-button-border-active': 'rgb(var(--ct-button-border-color-active))',
        // Secondary button
        'ct-button-secondary-bg': 'rgb(var(--ct-button-secondary-bg-color))',
        'ct-button-secondary-bg-hover': 'rgb(var(--ct-button-secondary-bg-color-hover))',
        'ct-button-secondary-bg-active': 'rgb(var(--ct-button-secondary-bg-color-active))',
        'ct-button-secondary-text': 'rgb(var(--ct-button-secondary-text-color))',
        'ct-button-secondary-text-hover': 'rgb(var(--ct-button-secondary-text-color-hover))',
        'ct-button-secondary-border': 'rgb(var(--ct-button-secondary-border-color))',
        'ct-button-secondary-border-hover': 'rgb(var(--ct-button-secondary-border-color-hover))',
        'ct-button-secondary-border-active': 'rgb(var(--ct-button-secondary-border-color-active))',
        // Launcher button
        'ct-launcher-bg': 'rgb(var(--ct-checklist-launcher-bg-color))',
        'ct-launcher-text': 'rgb(var(--ct-checklist-launcher-text-color))',
        // Banner button
        'ct-banner-button-bg': 'rgb(var(--ct-banner-button-color))',
        'ct-banner-button-text': 'rgb(var(--ct-banner-button-text-color))',
        // Link
        'ct-link': 'rgb(var(--ct-dialog-link-color))',
        'ct-link-hover': 'rgb(var(--ct-dialog-link-hover-color))',
        // Mobile swipe
        'ct-swipe-bg': 'rgb(var(--ct-swipe-step-background-color))',
        'ct-swipe-footer-bg': 'rgb(var(--ct-swipe-footer-background-color))',
        'ct-swipe-title': 'rgb(var(--ct-swipe-step-title-color))',
        'ct-swipe-description': 'rgb(var(--ct-swipe-step-description-color))',
        'ct-swipe-full-screen-padding-color': 'rgb(var(--ct-swipe-step-full-screen-padding-color))',
        // ---------- SHADCN DEFAULTS ----------
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        foreground: 'hsl(var(--foreground))',
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      // -------- CUSTOM COMPONENT THEME SPACING --------
      spacing: {
        // Primary button
        'ct-button-padding-h': 'var(--ct-button-padding-horizontal)',
        'ct-button-padding-v': 'var(--ct-button-padding-vertical)',
        // Secondary button
        'ct-button-secondary-padding-h': 'var(--ct-button-secondary-padding-horizontal)',
        'ct-button-secondary-padding-v': 'var(--ct-button-secondary-padding-vertical)',
        // Launcher button
        'ct-launcher-padding-h': 'var(--ct-checklist-launcher-h-padding)',
        'ct-launcher-padding-v': 'var(--ct-checklist-launcher-v-padding)',
        // Other sizing
        'ct-modal-width': 'var(--ct-modal-width)',
        'ct-dialog-px': 'var(--ct-dialog-padding-horizontal)',
        'ct-dialog-py': 'var(--ct-dialog-padding-vertical)',
      },
      // -------- CUSTOM COMPONENT THEME RADIUS --------
      borderRadius: {
        'ct-dialog-radius': 'var(--ct-dialog-border-radius)',
        'ct-form-field-radius': 'var(--ct-form-field-border-radius)',
        'ct-button-radius': 'var(--ct-button-border-radius)',
        'ct-launcher-radius': 'var(--ct-checklist-launcher-border-radius)',
      },
      // -------- CUSTOM COMPONENT THEME FONT SIZES --------
      fontSize: {
        'ct-dialog-font-size': 'var(--ct-dialog-font-size)',
      },
      // -------- CUSTOM COMPONENT THEME FONT WEIGHTS --------
      fontWeight: {
        'ct-button-weight': 'var(--ct-button-font-weight)',
        'ct-button-secondary-weight': 'var(--ct-button-secondary-font-weight)',
        'ct-launcher-weight': 'var(--ct-checklist-launcher-font-weight)',
      },
      // -------- CUSTOM COMPONENT THEME OUTLINE --------
      outlineWidth: {
        'ct-focus-ring-width': 'var(--ct-focus-ring-width)',
      },
      // Figma aliases.
      backgroundColor: () => ({
        emphasis: 'hsl(var(--color-gray-200) / <alpha-value>)',
        default: 'hsl(var(--color-white) / <alpha-value>)',
        subtle: 'hsl(var(--color-gray-100) / <alpha-value>)',
        muted: 'hsl(var(--color-gray-50) / <alpha-value>)',
        inverted: 'hsl(var(--color-gray-900) / <alpha-value>)',
        'info-subtle': 'hsl(var(--color-blue-100) / <alpha-value>)',
        'info-emphasis': 'hsl(var(--color-blue-500) / <alpha-value>)',
        'success-subtle': 'hsl(var(--color-green-100) / <alpha-value>)',
        'success-emphasis': 'hsl(var(--color-green-500) / <alpha-value>)',
        'attention-subtle': 'hsl(var(--color-orange-100) / <alpha-value>)',
        'attention-emphasis': 'hsl(var(--color-orange-500) / <alpha-value>)',
        'error-subtle': 'hsl(var(--color-red-100) / <alpha-value>)',
        'error-emphasis': 'hsl(var(--color-red-500) / <alpha-value>)',
      }),
      borderColor: () => ({
        emphasis: 'hsl(var(--color-gray-400) / <alpha-value>)',
        default: 'hsl(var(--color-gray-300) / <alpha-value>)',
        subtle: 'hsl(var(--color-gray-200) / <alpha-value>)',
        muted: 'hsl(var(--color-gray-100) / <alpha-value>)',
      }),
      textColor: () => ({
        emphasis: 'hsl(var(--color-gray-900) / <alpha-value>)',
        default: 'hsl(var(--color-gray-700) / <alpha-value>)',
        subtle: 'hsl(var(--color-gray-500) / <alpha-value>)',
        muted: 'hsl(var(--color-gray-400) / <alpha-value>)',
        inverted: 'hsl(var(--color-white) / <alpha-value>)',
        info: 'hsl(var(--color-blue-900) / <alpha-value>)',
        success: 'hsl(var(--color-green-800) / <alpha-value>)',
        attention: 'hsl(var(--color-orange-800) / <alpha-value>)',
        error: 'hsl(var(--color-red-800) / <alpha-value>)',
      }),
      fill: () => ({
        emphasis: 'hsl(var(--color-red-200) / <alpha-value>)',
        subtle: 'hsl(var(--color-gray-500) / <alpha-value>)',
        muted: 'hsl(var(--color-gray-400) / <alpha-value>)',
        inverted: 'hsl(var(--color-white) / <alpha-value>)',
        info: 'hsl(var(--color-blue-300) / <alpha-value>)',
        success: 'hsl(var(--color-green-500) / <alpha-value>)',
        attention: 'hsl(var(--color-orange-400) / <alpha-value>)',
        error: 'hsl(var(--color-red-500) / <alpha-value>)',
        dark: 'hsl(var(--color-gray-900) / <alpha-value>)',
      }),
      // Other customizations.
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-direction': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1', translate: '0px' },
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'animated-gradient': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out forwards',
        'fade-in-direction': 'fade-in-direction 0.2s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.2s ease-out',
        gradient: 'animated-gradient 4s ease infinite alternate',
      },
      transitionProperty: {
        height: 'height',
      },
      cursor: {
        grab: 'grab',
      },
      boxShadow: {
        xs: '0px 2px 2px 0px rgba(31, 40, 55, 0.02),0px 5px 5px 0px rgba(31, 40, 55, 0.02)',
        'button-base-layered': `
          0px 1px 1px 0px rgba(0, 0, 0, 0.1), /* Smallest dark shadow outside */
          0px 2px 3px 0px rgba(0, 0, 0, 0.08), /* Medium dark shadow outside */
          1px 4px 8px 0px rgba(0, 0, 0, 0.12) /* Biggest dark shadow outside */
        `,
        'gray-button-inset-skeuo': `
          0px -3px 2px 0px rgba(0, 0, 0, 0.4) inset, /* Dark shadow inside bottom */
          0px 2px 0.4px 0px rgba(255, 255, 255, 0.14) inset /* White lip inside top */
        `,
        'blue-button-inset-skeuo': `
          0px -3px 2px 0px rgba(0, 0, 0, 0.2) inset, /* Dark shadow inside bottom */
          0px 2px 0.4px 0px rgba(255, 255, 255, 0.14) inset /* White lip inside top */
        `,
        'red-button-inset-skeuo': `
          0px -3px 2px 0px rgba(0, 0, 0, 0.2) inset, /* Dark shadow inside bottom */
          0px 2px 0.4px 0px rgba(255, 255, 255, 0.14) inset /* White lip inside top */
        `,
        'button-deep-inset-indented': `
          0px 3px 1px 0px rgba(0, 0, 0, 0.2) inset, /* Dark shadow inside top */
          0px 0px 3px 0px rgba(0, 0, 0, 0.2) inset /* Tiny dark shadow equally inset */
        `,
        'button-shallow-inset-indented': `0px 2px 1px 0px rgba(0, 0, 0, 0.05) inset`,
        'button-elevated':
          '0px 2px 3px 0px rgba(0, 0, 0, 0.03), 0px 2px 2px -1px rgba(0, 0, 0, 0.03)',
        'ct-button': 'var(--ct-button-shadow)',
        'ct-button-hover': 'var(--ct-button-shadow-hover)',
        'ct-button-active': 'var(--ct-button-shadow-active)',
        'ct-button-secondary': 'var(--ct-button-secondary-shadow)',
        'ct-button-secondary-hover': 'var(--ct-button-secondary-shadow-hover)',
        'ct-button-secondary-active': 'var(--ct-button-secondary-shadow-active)',
      },
      zIndex: {
        max: '2147483647',
      },
    },
  },
  plugins: [
    containerQueries,
    tailwindCssAnimate,
    // Export alias tokens as CSS variables
    plugin(function ({ addBase }) {
      const DEFAULT_COLOR_ALIASES = ['emphasis', 'default', 'subtle', 'muted']
      const BG_COLOR_ALIASES = [
        ...DEFAULT_COLOR_ALIASES,
        'inverted',
        'info-subtle',
        'info-emphasis',
        'success-subtle',
        'success-emphasis',
        'attention-subtle',
        'attention-emphasis',
        'error-subtle',
        'error-emphasis',
      ]
      const BORDER_COLOR_ALIASES = DEFAULT_COLOR_ALIASES
      const TEXT_COLOR_ALIASES = [...DEFAULT_COLOR_ALIASES, 'info', 'success', 'attention', 'error']
      // Map from alias to palette variable for each alias group
      const ALIAS_TO_PALETTE = {
        // Background aliases
        'bg-emphasis': 'var(--color-gray-200)',
        'bg-default': 'var(--color-white)',
        'bg-subtle': 'var(--color-gray-100)',
        'bg-muted': 'var(--color-gray-50)',
        'bg-inverted': 'var(--color-gray-900)',
        'bg-info-subtle': 'var(--color-blue-100)',
        'bg-info-emphasis': 'var(--color-blue-500)',
        'bg-success-subtle': 'var(--color-green-100)',
        'bg-success-emphasis': 'var(--color-green-500)',
        'bg-attention-subtle': 'var(--color-orange-100)',
        'bg-attention-emphasis': 'var(--color-orange-500)',
        'bg-error-subtle': 'var(--color-red-100)',
        'bg-error-emphasis': 'var(--color-red-500)',
        // Border aliases
        'border-emphasis': 'var(--color-gray-400)',
        'border-default': 'var(--color-gray-300)',
        'border-subtle': 'var(--color-gray-200)',
        'border-muted': 'var(--color-gray-100)',
        // Text aliases
        'text-emphasis': 'var(--color-gray-900)',
        'text-default': 'var(--color-gray-700)',
        'text-subtle': 'var(--color-gray-500)',
        'text-muted': 'var(--color-gray-400)',
        'text-inverted': 'var(--color-white)',
        'text-info': 'var(--color-blue-900)',
        'text-success': 'var(--color-green-800)',
        'text-attention': 'var(--color-orange-800)',
        'text-error': 'var(--color-red-800)',
      }
      const aliasConfigs = [
        { aliases: BG_COLOR_ALIASES, prefix: 'bg', themeKey: 'backgroundColor' },
        { aliases: BORDER_COLOR_ALIASES, prefix: 'border', themeKey: 'borderColor' },
        { aliases: TEXT_COLOR_ALIASES, prefix: 'text', themeKey: 'textColor' },
      ]
      const cssVars = {}
      for (const { aliases, prefix } of aliasConfigs) {
        for (const alias of aliases) {
          const varName = `--color-${prefix}-${alias}`
          cssVars[varName] = ALIAS_TO_PALETTE[`${prefix}-${alias}`]
        }
      }
      addBase({ ':root': cssVars })
    }),
    plugin(function ({ addBase }) {
      addBase({
        h1: { fontSize: '2em' },
        h2: { fontSize: '1.5em' },
        h3: { fontSize: '1.17em' },
        h4: { fontSize: '1em' },
        h5: { fontSize: '0.83em' },
        h6: { fontSize: '0.67em' },
      })
    }),
    plugin(function ({ addVariant }) {
      addVariant('light-force', [':is(.light &, &.light)', ':root.light &'])
    }),
    plugin(function ({ addUtilities, theme }) {
      const newUtilities = {
        '.shadow-solid-gray-button-default': {
          boxShadow: `${theme('boxShadow.button-base-layered')}, ${theme(
            'boxShadow.gray-button-inset-skeuo',
          )}`,
        },
        '.shadow-solid-blue-button-default': {
          boxShadow: `${theme('boxShadow.button-base-layered')}, ${theme(
            'boxShadow.blue-button-inset-skeuo',
          )}`,
        },
        '.shadow-solid-red-button-default': {
          boxShadow: `${theme('boxShadow.button-base-layered')}, ${theme(
            'boxShadow.red-button-inset-skeuo',
          )}`,
        },
        '.shadow-solid-button-active': {
          boxShadow: theme('boxShadow.button-deep-inset-indented'),
        },
        '.shadow-solid-button-gray-focus': {
          boxShadow: `${theme('boxShadow.gray-button-inset-skeuo')}`,
        },
        '.shadow-solid-button-blue-focus': {
          boxShadow: `${theme('boxShadow.blue-button-inset-skeuo')}`,
        },
        '.shadow-solid-button-red-focus': {
          boxShadow: `${theme('boxShadow.red-button-inset-skeuo')}`,
        },
        '.shadow-ghost-button-active': {
          boxShadow: theme('boxShadow.button-shallow-inset-indented'),
        },
      }
      addUtilities(newUtilities)
    }),
  ],
  corePlugins: {
    containerQueries: true,
  },
}

export default config
