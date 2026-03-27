// Aurora UI Kit — Figma Plugin
// Reads exported token JSON and creates Figma Variables

figma.showUI(__html__, { width: 360, height: 420 })

interface TokenVariable {
  name: string
  type: 'COLOR'
  value: string
}

interface FigmaTokenCollection {
  name: string
  modes: { name: string }[]
  variables: TokenVariable[]
}

interface FigmaTokenFile {
  version: string
  collections: FigmaTokenCollection[]
}

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  }
}

figma.ui.onmessage = async (msg: { type: string; tokens?: string }) => {
  if (msg.type === 'import-tokens' && msg.tokens) {
    try {
      const data: FigmaTokenFile = JSON.parse(msg.tokens)

      for (const collection of data.collections) {
        const figmaCollection = figma.variables.createVariableCollection(collection.name)

        // Rename default mode
        const defaultMode = figmaCollection.modes[0]
        figmaCollection.renameMode(defaultMode.modeId, collection.modes[0]?.name || 'dark')

        for (const variable of collection.variables) {
          const figmaVar = figma.variables.createVariable(
            variable.name,
            figmaCollection,
            'COLOR'
          )

          if (variable.value.startsWith('#')) {
            const rgb = hexToRgb(variable.value)
            figmaVar.setValueForMode(defaultMode.modeId, rgb)
          }
        }
      }

      figma.notify(`Imported ${data.collections.reduce((n, c) => n + c.variables.length, 0)} variables`)
    } catch (err) {
      figma.notify('Error parsing token JSON', { error: true })
    }
  }

  if (msg.type === 'cancel') {
    figma.closePlugin()
  }
}
