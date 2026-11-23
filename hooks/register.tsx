import type { Register, ThemeSetArgs, ThemeMessageRule } from 'claude-code'

import { makeColors } from './make-colors.js'
import { SCENE } from './scene.js'

// Blaetterwald: warmes Leinen, belaubte Zweige, die sanft schwanken, und langsam fallende Blaetter.
const { theme, problems } = makeColors({
  label: 'Blaetterwald',
  roles: { accent: '#5a7d45', danger: '#b3392f', success: '#5f7a35', warning: '#b07a1c', pro: '#7a5a8a' },
  light: {
    gray: {
      anchors: {
        'surface-0': '#f3ece0',
        'surface-1': '#f7f1e7',
        'surface-2': '#fbf7f0',
        'text-primary': '#2d2418',
        'text-secondary': '#4f4232',
        'text-muted': '#665643',
      },
    },
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#1e1813',
        'surface-1': '#251e17',
        'surface-2': '#2c241c',
        'surface-3': '#322920',
        'text-primary': '#f2e9dc',
        'text-secondary': '#d6c8b4',
        'text-muted': '#b3a38c',
      },
    },
  },
})

const bubble: ThemeMessageRule = {
  radius: 22,
  paddingX: 16,
  paddingY: 12,
  shadow: { x: 0, y: 4, blur: 14, color: '#2d241822' },
}

// Ohne Schleier (glass: false), sonst verschwindet die Szene hinter den Flaechen.
const BASE: ThemeSetArgs = {
  colors: theme,
  // Immer dunkel, unabhaengig von der Einstellung der App.
  overrideColorScheme: 'dark',
  backdrop: { scene: 'zweige', glass: false },
}

const LOOK: ThemeSetArgs = {
  ...BASE,
  style: {
    Text: { fontSize: 15, lineHeight: 25 },
    Heading: { fontFamily: ['serif'], fontWeight: 'semibold' },
    UserMessage: [
      { ...bubble, color: '#ffffff', backgroundColor: '#4f7a45', fill: { gradient: { angle: 135, stops: ['#5a8a4c', '#3f6a3a'] } } },
      { ...bubble, color: '#ffffff', backgroundColor: '#477a55', fill: { gradient: { angle: 135, stops: ['#4f8a5c', '#3f6a3a'] } } },
    ],
    AssistantMessage: { ...bubble, backgroundColor: 'surface-1', borderColor: '#7fa06a66', borderWidth: 1 },
    ToolUse: { radius: 14, paddingX: 10, backgroundColor: 'surface-2', borderColor: '#7fa06a55', borderWidth: 1 },
  },
}

const LEAF = ['🍃', '🌿', '🍁', '🌱']

export const register: Register = on => {
  let tick = 0

  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }

    try {
      await $.theme.set(LOOK)
    } catch (error) {
      // Aeltere App-Versionen kennen `style` nicht: dann ohne.
      $.ui.log(String(error))
      await $.theme.set(BASE)
    }

    $.ui.status('🍃 Blätterwald')

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)

    return <Svg source={SCENE} alt="Belaubte Zweige, die sanft schwanken, und einzelne Blätter, die langsam herabfallen" />
  })

  on('prompt.submit', ($, e, next) => {
    $.ui.status('🌿 Blätterwald · denke nach …')

    return next(e)
  })

  on('tool.call', ($, e, next) => {
    tick = (tick + 1) % LEAF.length
    $.ui.status(`${LEAF[tick]} Blätterwald · ${e.tool}`)

    return next(e)
  })

  on('turn.complete', ($, e, next) => {
    $.ui.status('🍃 Blätterwald')

    return next(e)
  })
}
