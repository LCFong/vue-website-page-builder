<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { computed, onBeforeMount, onMounted, ref, watch } from 'vue'
import DynamicModalBuilder from '../Modals/DynamicModalBuilder.vue'
import { sharedPageBuilderStore } from '../../stores/shared-store'
import { getPageBuilder } from '../../composables/builderInstance'
import { useTranslations } from '../../composables/useTranslations'
import { CustomButton } from './CustomButton.js'
import TextAlign from '@tiptap/extension-text-align'
import TypographyForTipTap from '../PageBuilder/EditorMenu/Editables/TypographyForTipTap.vue'

const pageBuilderService = getPageBuilder()

const { translate } = useTranslations()

// Use shared store instance
const pageBuilderStateStore = sharedPageBuilderStore

const showModalUrl = ref(false)

// use dynamic model
const typeModal = ref('')
const gridColumnModal = ref(Number(1))
const titleModal = ref('')
const descriptionModal = ref('')
const firstButtonModal = ref('')
const secondButtonModal = ref(null)
const thirdButtonModal = ref(null)
// set dynamic modal handle functions
const firstModalButtonFunctionDynamicModalBuilder = ref(null)
const secondModalButtonFunctionDynamicModalBuilder = ref(null)
const thirdModalButtonFunctionDynamicModalBuilder = ref(null)

const getElement = computed(() => {
  return pageBuilderStateStore.getElement
})
const textContentVueModel = ref('')

const textContent = computed(() => {
  if (editor.value) {
    return editor.value.getHTML()
  }
  return null
})

const getElementtextContentLength = ref(0)

watch(getElement, (newVal) => {
  const tempContainer = document.createElement('div')

  if (newVal) {
    tempContainer.innerHTML = newVal
    const textContent = tempContainer.textContent
    getElementtextContentLength.value = textContent.length
  }
})

// Check if any of the child elements have the tagName "IMG"

const editor = useEditor({
  content: '',
  extensions: [
    StarterKit.configure({
      // Configure Link here if needed
      link: {
        openOnClick: false,
      },
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    CustomButton,

  ],
  editorProps: {
    attributes: {
      class: 'prose-sm sm:prose-sm lg:prose-sm focus:outline-none',
    },
  },
})

// watch for changes in textContent and update store and textContentVueModel
watch(textContent, async (newValue) => {
  if (!pageBuilderService.isSelectedElementValidText()) return

  if (getElement.value) {
    pageBuilderStateStore.setTextAreaVueModel(newValue)

    if (typeof newValue === 'string' && newValue !== textContentVueModel.value) {
      await pageBuilderService.handleTextInput(newValue)
    }
  }
})

const TipTapSetContent = function () {
  if (!pageBuilderService.isSelectedElementValidText()) return

  if (editor.value) {
    editor.value.commands.setContent(getElement.value.innerHTML)
  }
}

watch(getElement, () => {
  TipTapSetContent()
})

// Manage URL
const urlEnteret = ref('')
const newUpdatedExistingURL = ref('')
const urlError = ref(null)

watch(urlEnteret, (newVal) => {
  newUpdatedExistingURL.value = newVal
})
const handleURL = function () {
  urlEnteret.value = editor.value.getAttributes('link').href

  showModalUrl.value = true
  typeModal.value = 'success'
  gridColumnModal.value = 2
  titleModal.value = translate('Enter URL')
  descriptionModal.value = translate(
    'Add a valid URL to transform the selected text into a clickable hyperlink that directs users to the specified web address.',
  )
  firstButtonModal.value = translate('Close')
  secondButtonModal.value = urlEnteret.value ? 'Remove url' : null
  thirdButtonModal.value = translate('Save')

  // handle click
  firstModalButtonFunctionDynamicModalBuilder.value = function () {
    showModalUrl.value = false
    urlError.value = null
  }

  // handle click
  secondModalButtonFunctionDynamicModalBuilder.value = function () {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
    showModalUrl.value = false
  }

  // handle click
  thirdModalButtonFunctionDynamicModalBuilder.value = function () {
    const isNotValidated = validateURL()
    if (isNotValidated) {
      return
    }
    if (!isNotValidated) {
      setEnteretURL()
    }
    showModalUrl.value = false
  }
  // end modal
}

//
//
const validateURL = function () {
  // initial value
  urlError.value = null

  // url validation
  const urlRegex = /^https?:\/\//
  const isValidURL = ref(true)
  isValidURL.value = urlRegex.test(newUpdatedExistingURL.value)

  // cancelled
  if (isValidURL.value === false) {
    urlError.value =
      "The provided URL is invalid. Please ensure that it begins with 'https://' for proper formatting and security."
    return true
  }

  return false
}
const setEnteretURL = function () {
  // update link
  editor.value
    .chain()
    .focus()
    .extendMarkRange('link')
    .setLink({ href: newUpdatedExistingURL.value })
    .run()
}

const showTypography = ref(false)
const showButton = ref(false)
const buttonConfig = ref({
  text: 'Click Here',
  href: 'https://example.com',
  color: 'blue',
  size: 'md',
  font: 'base',
  weight: 'normal',
})

const colorOptions= ref([
  { value: 'blue', label: 'Blue', bgClass: 'pbx-bg-blue-600' },
  { value: 'green', label: 'Green', bgClass: 'pbx-bg-green-600' },
  { value: 'red', label: 'Red', bgClass: 'pbx-bg-red-600' },
  { value: 'gray', label: 'Gray', bgClass: 'pbx-bg-gray-600' },
  { value: 'outline', label: 'Outline', bgClass: 'pbx-bg-white border pbx-border-blue-600' }
])
const sizeOptions= ref([
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' }
])
const fontOptions =ref([
  { value: 'sm', label: 'Small' },
  { value: 'base', label: 'Medium' },
  { value: 'lg', label: 'Large' }
])

const toggleShowTypography = function () {
  showTypography.value = !showTypography.value
}
const toggleShowButton = function () {
  showButton.value = !showButton.value
}

const insertButton = function () {
  editor.value.chain()
    .focus()
    .insertSimpleButton({
      text: buttonConfig.value.text,
      href: buttonConfig.value.href,
      color: buttonConfig.value.color,
      size: buttonConfig.value.size,
      font: buttonConfig.value.font,
      weight: buttonConfig.value.weight
    })
    .run()
  toggleShowButton()
}

onBeforeMount(() => {
  editor.value?.destroy()
})

onMounted(() => {
  TipTapSetContent()
})
</script>
<template>
  <div>
    <DynamicModalBuilder
      maxWidth="4xl"
      :showDynamicModalBuilder="showModalUrl"
      :type="typeModal"
      :gridColumnAmount="gridColumnModal"
      :title="titleModal"
      :description="descriptionModal"
      :firstButtonText="firstButtonModal"
      :secondButtonText="secondButtonModal"
      :thirdButtonText="thirdButtonModal"
      @firstModalButtonFunctionDynamicModalBuilder="firstModalButtonFunctionDynamicModalBuilder"
      @secondModalButtonFunctionDynamicModalBuilder="secondModalButtonFunctionDynamicModalBuilder"
      @thirdModalButtonFunctionDynamicModalBuilder="thirdModalButtonFunctionDynamicModalBuilder"
    >
      <header></header>
      <main>
        <div class="pbx-myInputGroup">
          <label class="pbx-myPrimaryInputLabel" for="roles"
            ><span>{{ translate('Enter URL') }}</span></label
          ><input
            v-model="urlEnteret"
            class="pbx-myPrimaryInput pbx-mt-1 pbx-w-full"
            type="url"
            placeholder="url"
          />
          <div
            v-if="urlError"
            class="pbx-min-h-[2.5rem] pbx-flex pbx-items-center pbx-justify-start"
          >
            <p class="pbx-myPrimaryInputError pbx-mt-2 pbx-mb-0 pbx-py-0 pbx-self-start">
              {{ urlError }}
            </p>
          </div>
        </div>
      </main>
    </DynamicModalBuilder>

    <div class="pbx-blockease-linear pbx-duration-200 pbx-block pbx-ease-linear">
      <div v-if="pageBuilderService.isSelectedElementValidText() && editor">
        <div class="pbx-rounded-lg pbx-px-2">
          <div
            class="pbx-flex pbx-flex-wrap pbx-items-center pbx-gap-2 pbx-border-solid pbx-px-4 pbx-border pbx-border-gray-200 pbx-mb-4 pbx-py-2"
          >
            <!-- Save -->

            <div
              @click="pageBuilderService.toggleTipTapModal(false)"
              class="pbx-myPrimaryButton pbx-mr-4 pbx-min-h-2"
            >
              <span class="material-symbols-outlined"> save </span>
              <span>{{ translate('Save') }}</span>
            </div>

            <!-- Bold -->

            <div
              @click="editor.chain().focus().toggleBold().run()"
              class="pbx-h-10 pbx-w-10 pbx-cursor-pointer pbx-flex pbx-items-center pbx-justify-center pbx-aspect-square pbx-text-myPrimaryDarkGrayColor pbx-bg-gray-100 pbx-rounded-xl hover:pbx-bg-myPrimaryLinkColor hover:pbx-text-white"
              :class="{
                'pbx-bg-myPrimaryLinkColor pbx-text-white hover:pbx-text-white hover:pbx-bg-myPrimaryLinkColor':
                  editor.isActive('bold'),
              }"
            >
              <span class="material-symbols-outlined"> format_bold </span>
            </div>

            <!-- Link -->

            <div
              @click="handleURL"
              class="pbx-h-10 pbx-w-10 pbx-cursor-pointer pbx-flex pbx-items-center pbx-justify-center pbx-aspect-square pbx-text-myPrimaryDarkGrayColor pbx-bg-gray-100 pbx-rounded-xl hover:pbx-bg-myPrimaryLinkColor hover:pbx-text-white"
              :class="{
                'pbx-bg-myPrimaryLinkColor pbx-text-white hover:pbx-text-white hover:pbx-bg-myPrimaryLinkColor':
                  editor.isActive('link'),
              }"
            >
              <span class="material-symbols-outlined"> link </span>
            </div>

            <!-- H2 -->

            <div
              @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
              class="pbx-h-10 pbx-w-10 pbx-cursor-pointer pbx-flex pbx-items-center pbx-justify-center pbx-aspect-square pbx-text-myPrimaryDarkGrayColor pbx-bg-gray-100 pbx-rounded-xl hover:pbx-bg-myPrimaryLinkColor hover:pbx-text-white"
              :class="{
                'pbx-bg-myPrimaryLinkColor pbx-text-white hover:pbx-text-white hover:pbx-bg-myPrimaryLinkColor':
                  editor.isActive('heading', {
                    level: 2,
                  }),
              }"
            >
              <div class="pbx-font-semibold pbx-text-sm">H2</div>
            </div>

            <!-- H3 -->

            <div
              @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
              class="pbx-h-10 pbx-w-10 pbx-cursor-pointer pbx-flex pbx-items-center pbx-justify-center pbx-aspect-square pbx-text-myPrimaryDarkGrayColor pbx-bg-gray-100 pbx-rounded-xl hover:pbx-bg-myPrimaryLinkColor hover:pbx-text-white"
              :class="{
                'pbx-bg-myPrimaryLinkColor pbx-text-white hover:pbx-text-white hover:pbx-bg-myPrimaryLinkColor':
                  editor.isActive('heading', {
                    level: 3,
                  }),
              }"
            >
              <div class="pbx-font-semibold pbx-text-sm">H3</div>
            </div>

            <!-- H4 -->

            <div
              @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
              class="pbx-h-10 pbx-w-10 pbx-cursor-pointer pbx-flex pbx-items-center pbx-justify-center pbx-aspect-square pbx-text-myPrimaryDarkGrayColor pbx-bg-gray-100 pbx-rounded-xl hover:pbx-bg-myPrimaryLinkColor hover:pbx-text-white"
              :class="{
                'pbx-bg-myPrimaryLinkColor pbx-text-white hover:pbx-text-white hover:pbx-bg-myPrimaryLinkColor':
                  editor.isActive('heading', {
                    level: 4,
                  }),
              }"
            >
              <div class="pbx-font-semibold pbx-text-sm">H4</div>
            </div>

            <!-- H5 -->

            <div
              @click="editor.chain().focus().toggleHeading({ level: 5 }).run()"
              class="pbx-h-10 pbx-w-10 pbx-cursor-pointer pbx-flex pbx-items-center pbx-justify-center pbx-aspect-square pbx-text-myPrimaryDarkGrayColor pbx-bg-gray-100 pbx-rounded-xl hover:pbx-bg-myPrimaryLinkColor hover:pbx-text-white"
              :class="{
                'pbx-bg-myPrimaryLinkColor pbx-text-white hover:pbx-text-white hover:pbx-bg-myPrimaryLinkColor':
                  editor.isActive('heading', {
                    level: 5,
                  }),
              }"
            >
              <div class="pbx-font-semibold pbx-text-sm">H5</div>
            </div>

            <!-- H6 -->

            <div
              @click="editor.chain().focus().toggleHeading({ level: 6 }).run()"
              class="pbx-h-10 pbx-w-10 pbx-cursor-pointer pbx-flex pbx-items-center pbx-justify-center pbx-aspect-square pbx-text-myPrimaryDarkGrayColor pbx-bg-gray-100 pbx-rounded-xl hover:pbx-bg-myPrimaryLinkColor hover:pbx-text-white"
              :class="{
                'pbx-bg-myPrimaryLinkColor pbx-text-white hover:pbx-text-white hover:pbx-bg-myPrimaryLinkColor':
                  editor.isActive('heading', {
                    level: 6,
                  }),
              }"
            >
              <div class="pbx-font-semibold pbx-text-sm">H6</div>
            </div>

            <!-- Left Align -->

            <div
              @click="
                editor.isActive({ textAlign: 'left' })
                  ? editor.chain().focus().unsetTextAlign().run()
                  : editor.chain().focus().setTextAlign('left').run()
              "
              class="pbx-h-10 pbx-w-10 pbx-cursor-pointer pbx-flex pbx-items-center pbx-justify-center pbx-aspect-square pbx-text-myPrimaryDarkGrayColor pbx-bg-gray-100 pbx-rounded-xl hover:pbx-bg-myPrimaryLinkColor hover:pbx-text-white"
              :class="{
                'pbx-bg-myPrimaryLinkColor pbx-text-white hover:pbx-text-white hover:pbx-bg-myPrimaryLinkColor':
                  editor.isActive({ textAlign: 'left' }),
              }"
            >
              <span class="material-symbols-outlined"> format_align_left </span>
            </div>

            <!-- Center Align -->

            <div
              @click="
                editor.isActive({ textAlign: 'center' })
                  ? editor.chain().focus().unsetTextAlign().run()
                  : editor.chain().focus().setTextAlign('center').run()
              "
              class="pbx-h-10 pbx-w-10 pbx-cursor-pointer pbx-flex pbx-items-center pbx-justify-center pbx-aspect-square pbx-text-myPrimaryDarkGrayColor pbx-bg-gray-100 pbx-rounded-xl hover:pbx-bg-myPrimaryLinkColor hover:pbx-text-white"
              :class="{
                'pbx-bg-myPrimaryLinkColor pbx-text-white hover:pbx-text-white hover:pbx-bg-myPrimaryLinkColor':
                  editor.isActive({ textAlign: 'center' }),
              }"
            >
              <span class="material-symbols-outlined"> format_align_center </span>
            </div>

            <!-- Right Align -->

            <div
              @click="
                editor.isActive({ textAlign: 'right' })
                  ? editor.chain().focus().unsetTextAlign().run()
                  : editor.chain().focus().setTextAlign('right').run()
              "
              class="pbx-h-10 pbx-w-10 pbx-cursor-pointer pbx-flex pbx-items-center pbx-justify-center pbx-aspect-square pbx-text-myPrimaryDarkGrayColor pbx-bg-gray-100 pbx-rounded-xl hover:pbx-bg-myPrimaryLinkColor hover:pbx-text-white"
              :class="{
                'pbx-bg-myPrimaryLinkColor pbx-text-white hover:pbx-text-white hover:pbx-bg-myPrimaryLinkColor':
                  editor.isActive({ textAlign: 'right' }),
              }"
            >
              <span class="material-symbols-outlined"> format_align_right </span>
            </div>

            <div
              @click="editor.chain().focus().toggleBulletList().run()"
              class="pbx-h-10 pbx-w-10 pbx-cursor-pointer pbx-flex pbx-items-center pbx-justify-center pbx-aspect-square pbx-text-myPrimaryDarkGrayColor pbx-bg-gray-100 pbx-rounded-xl hover:pbx-bg-myPrimaryLinkColor hover:pbx-text-white"
              :class="{
                'pbx-bg-myPrimaryLinkColor pbx-text-white hover:pbx-text-white hover:pbx-bg-myPrimaryLinkColor':
                  editor.isActive('bulletList'),
              }"
            >
              <span class="material-symbols-outlined"> format_list_bulleted </span>
            </div>

            <!-- Toggle showTypography start -->

            <!-- Set Button -->
            <div
              @click="toggleShowButton"
              class="pbx-h-10  pbx-w-10 pbx-cursor-pointer pbx-flex pbx-items-center pbx-justify-center pbx-aspect-square pbx-bg-gray-100 pbx-rounded-xl hover:pbx-bg-myPrimaryLinkColor pbx-text-white"
              :class="{
                'pbx-bg-myPrimaryLinkColor pbx-text-white hover:pbx-text-white hover:pbx-bg-myPrimaryLinkColor':
                  editor.isActive({ textAlign: 'center' }),
              }"
            >
              <svg width="20px" class="" height="20px" viewBox="0 0 15 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.5 10V8.5M5.5 8.5V3.5C5.5 2.94772 5.94772 2.5 6.5 2.5C7.05228 2.5 7.5 2.94772 7.5 3.5V7.5H10.8529C11.7626 7.5 12.5 8.23741 12.5 9.14706V10C12.5 12.4853 10.4853 14.5 8 14.5H7.5C5.29086 14.5 3.5 12.7091 3.5 10.5C3.5 9.39543 4.39543 8.5 5.5 8.5ZM9 5.5H11C12.3807 5.5 13.5 4.38071 13.5 3C13.5 1.61929 12.3807 0.5 11 0.5H4C2.61929 0.5 1.5 1.61929 1.5 3C1.5 4.38071 2.61929 5.5 4 5.5" stroke="#000000"/>
              </svg>
            </div>
            
            <div class="pbx-relative">
              <div v-show="showButton" ref="setButtonDropdown" class="pbx-absolute pbx-left-0 pbx-right-0 pbx-z-10 pbx-w-96 pbx-p-4 pbx-rounded-md pbx-shadow-lg pbx-bg-white">
                <h3 class="pbx-text-lg pbx-font-medium pbx-mb-4">Button Config</h3>
    
                <div class="pbx-grid pbx-grid-cols-1 md:pbx-grid-cols-3 pbx-gap-4">
                  <div>
                    <label class="block pbx-text-sm pbx-font-medium pbx-text-gray-700 ">Text</label>
                    <input v-model="buttonConfig.text" 
                      type="text"
                      class="pbx-w-full pbx-px-3 pbx-py-2 pbx-border pbx-border-gray-300 pbx-rounded-md pbx-shadow-sm ">
                  </div>
                  
                  <div class="pbx-col-span-2">
                    <label class="block pbx-text-sm pbx-font-medium pbx-text-gray-700 ">Link</label>
                    <input v-model="buttonConfig.href" 
                      type="text"
                      placeholder="https://example.com"
                      class="pbx-w-full pbx-px-3 pbx-py-2 pbx-border pbx-border-gray-300 pbx-rounded-md pbx-shadow-sm ">
                  </div>
                    
                  <div>
                      <label class="pbx-block pbx-text-sm pbx-font-medium pbx-text-gray-700 ">Color</label>
                      <div class="pbx-flex pbx-space-x-2">
                      <button v-for="color in colorOptions" 
                        :key="color.value"
                        @click="buttonConfig.color = color.value"
                        :class="['pbx-w-8 pbx-h-8 pbx-rounded-full pbx-border-2', 
                            color.bgClass,
                            buttonConfig.color === color.value ? 'pbx-border-gray-800' : 'pbx-border-transparent']"
                        :title="color.label">
                      </button>
                      </div>
                  </div>
                  
                  <div class="pbx-col-span-2">
                    <label class="pbx-block pbx-text-sm pbx-font-medium pbx-text-gray-700 ">Size</label>
                    <div class="pbx-flex pbx-space-x-2">
                    <button v-for="size in sizeOptions" 
                      :key="size.value"
                      @click="buttonConfig.size = size.value"
                      :class="['pbx-px-3 pbx-py-1 pbx-rounded pbx-text-sm', 
                              buttonConfig.size === size.value ? 'pbx-bg-blue-100 pbx-text-blue-700' : 'pbx-bg-gray-100 pbx-text-gray-700']">
                        {{ size.label }}
                    </button>
                    </div>
                  </div>

                  <div>
                    <label class="pbx-block pbx-text-sm pbx-font-medium pbx-text-gray-700 ">Weight</label>
                    <div class="pbx-flex pbx-flex-col">
                        
                      <div>
                          <input class="" value="bold" type="radio" v-model="buttonConfig.weight"></input>
                          Bold
                      </div>
                      <div>
                          <input class="" value="normal"  type="radio" v-model="buttonConfig.weight"></input>
                          Normal
                      </div>
                    </div>
                  </div>

                  <div class="pbx-col-span-2">
                    <label class="pbx-block pbx-text-sm pbx-font-medium pbx-text-gray-700 ">Text Size</label>
                    <div class="pbx-flex pbx-space-x-2">
                    <button v-for="font in fontOptions" 
                      :key="font.value"
                      @click="buttonConfig.font = font.value"
                      :class="['pbx-px-3 pbx-py-1 pbx-rounded pbx-text-sm', 
                              buttonConfig.font === font.value ? 'pbx-bg-blue-100 pbx-text-blue-700' : 'pbx-bg-gray-100 pbx-text-gray-700']">
                      {{ font.label }}
                    </button>
                    </div>
                  </div>
                </div>
                
                <div class="pbx-mt-4">
                  <button @click="insertButton"
                      class="pbx-w-full pbx-px-4 pbx-py-3 pbx-bg-blue-600 pbx-text-white pbx-font-medium pbx-rounded-md hover:pbx-bg-blue-700 ">
                      Insert
                  </button>
                </div>
              </div>
            </div>

            <div
              @click="toggleShowTypography"
              class="pbx-h-10 pbx-flex-end pbx-cursor-pointer pbx-flex pbx-items-center pbx-justify-center hover:pbx-bg-gray-100 pbx-bg-gray-100 pbx-text-myPrimaryDarkGrayColor pbx-font-medium pbx-min-w-52 pbx-relative pbx-rounded-xl pbx-select-none"
            >
              <span>
                {{ translate('Font Appearance') }}
              </span>
              <transition name="popup-fade">
                <div
                  v-if="showTypography"
                  @click.stop
                  class="pbx-absolute pbx-top-10 pbx-transform pbx-select-none pbx-bg-white pbx-rounded-2xl pbx-py-2 pbx-px-2 pbx-border-solid pbx-border pbx-border-gray-200 pbx-inset-x-auto pbx-z-40 pbx-w-52"
                >
                  <TypographyForTipTap></TypographyForTipTap>
                </div>
              </transition>
            </div>
            <!-- Toggle showTypography end -->
          </div>

          <EditorContent
            v-if="editor"
            id="page-builder-editor"
            :editor="editor"
            class="pbx-p-2 pbx-prounded-lg lg:pbx-min-h-[20rem] lg:pbx-max-h-[30rem] md:pbx-min-h-[20rem] md:pbx-max-h-[20rem] pbx-min-h-[20rem] pbx-max-h-[20rem] pbx-overflow-y-auto"
          ></EditorContent>
        </div>
      </div>
    </div>
  </div>
</template>
