// extensions/CustomButton.js
import { Node } from '@tiptap/core'

export const CustomButton = Node.create({
  name: 'CustomButton',
  
  group: 'inline',
  inline: true,
  atom: true,
  
  addAttributes() {
    return {
      text: {
        default: 'Button Text'
      },
      href: {
        default: '#'
      },
      color: {
        default: 'blue'
      },
      size: {
        default: 'md'
      }
    }
  },
  
  parseHTML() {
    return [
      {
        tag: 'span[data-type="simple-button"]',
        getAttrs: (dom) => ({
          text: dom.getAttribute('data-text') || 'Button Text',
          href: dom.getAttribute('data-href') || '#',
          color: dom.getAttribute('data-color') || 'blue',
          size: dom.getAttribute('data-size') || 'md'
        })
      },

      {
        tag: 'a.simple-button',
        getAttrs: (dom) => ({
          text: dom.textContent || 'Button Text',
          href: dom.getAttribute('href') || '#',
          color: dom.getAttribute('data-color') || 'blue',
          size: dom.getAttribute('data-size') || 'md'
        })
      }
    ]
  },
  
  renderHTML({ node }) {
    
    const colors = {
      blue: 'pbx-bg-blue-600 hover:pbx-bg-blue-700 pbx-text-white',
      green: 'pbx-bg-green-600 hover:pbx-bg-green-700 pbx-text-white',
      red: 'pbx-bg-red-600 hover:pbx-bg-red-700 pbx-text-white',
      gray: 'pbx-bg-gray-600 hover:pbx-bg-gray-700 pbx-text-white',
      outline: 'pbx-bg-transparent border border-blue-600 pbx-text-blue-600 hover:pbx-bg-blue-50'
    }
    
    const sizes = { sm: 'pbx-px-3 pbx-py-1', md: 'pbx-px-4 pbx-py-2', lg: 'pbx-px-6 pbx-py-3' }
    const fonts = { sm: 'pbx-text-sm', base: 'pbx-text-base', lg: 'pbx-text-lg' }
    const weights = { bold: 'pbx-font-bold', normal: 'pbx-font-medium' }
    
    const colorClass = colors[node.attrs.color] || colors.blue
    const sizeClass = sizes[node.attrs.size] || sizes.md
    const fontClass = fonts[node.attrs.font] || fonts.base
    const weightClass = weights[node.attrs.weight] || weights.normal

    return [
      "a",
      {
        'data-type': 'simple-button',
        'data-text': node.attrs.text,
        'data-href': node.attrs.href,
        'data-color': node.attrs.color,
        'data-size': node.attrs.size,
        'href': node.attrs.href || '#',
        'target': '_blank',
        'class': 'simple-button-wrapper pbx-text-white pbx-inline-block pbx-rounded pbx-cursor-pointer pbx-transition-colors '+colorClass+' '+sizeClass+' '+fontClass+' '+weightClass+' ',
        'role': 'button'
      },
      node.attrs.text
    ]
  },
  
  addCommands() {
    const nodeName = this.name
    
    return {
      insertSimpleButton: (attributes) => ({ commands }) => {
        return commands.insertContent({
          type: nodeName,
          attrs: {
            text: attributes.text || 'Button Text',
            href: attributes.href || '#',
            color: attributes.color || 'blue',
            size: attributes.size || 'md'
          }
        })
      }
    }
  },
  
  addNodeView() {
    const nodeName = this.name
    
    return ({ node, editor }) => {
      const container = document.createElement('span')
      container.className = 'simple-button-wrapper inline-block'
      
      const button = document.createElement('a')
      
      const colors = {
        blue: 'pbx-bg-blue-600 hover:pbx-bg-blue-700 pbx-text-white',
        green: 'pbx-bg-green-600 hover:pbx-bg-green-700 pbx-text-white',
        red: 'pbx-bg-red-600 hover:pbx-bg-red-700 pbx-text-white',
        gray: 'pbx-bg-gray-600 hover:pbx-bg-gray-700 pbx-text-white',
        outline: 'pbx-bg-transparent border border-blue-600 pbx-text-blue-600 hover:pbx-bg-blue-50'
      }
      
      const sizes = { sm: 'pbx-px-3 pbx-py-1', md: 'pbx-px-4 pbx-py-2', lg: 'pbx-px-6 pbx-py-3' }
      
      const fonts = { sm: 'pbx-text-sm', base: 'pbx-text-base', lg: 'pbx-text-lg' }

      const weights = { bold: 'pbx-font-bold', normal: 'pbx-font-medium' }
      
      const colorClass = colors[node.attrs.color] || colors.blue
      const sizeClass = sizes[node.attrs.size] || sizes.md
      const fontClass = fonts[node.attrs.font] || fonts.base
      const weightClass = weights[node.attrs.weight] || weights.normal
      
      button.className = `pbx-inline-block pbx-rounded pbx-cursor-pointer pbx-transition-colors ${colorClass} ${sizeClass} ${fontClass} ${weightClass}`
      button.textContent = node.attrs.text
      button.href = node.attrs.href
      button.target = '_blank'
      button.setAttribute("rel", "noopener noreferrer nofollow")
      
      
      if (editor.isEditable) {
        button.onclick = (e) => {
          e.preventDefault()
        }
      }
      
      container.appendChild(button)
      
      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type.name !== nodeName) return false
          
          const newColorClass = colors[updatedNode.attrs.color] || colors.blue
          const newSizeClass = sizes[updatedNode.attrs.size] || sizes.md
          
          button.className = `simple-button pbx-inline-block pbx-rounded pbx-font-medium pbx-cursor-pointer pbx-transition-colors ${newColorClass} ${newSizeClass}`
          button.textContent = updatedNode.attrs.text
          button.href = updatedNode.attrs.href
          
          return true
        }
      }
    }
  }
})