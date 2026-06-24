import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getFormatLabels, OUTPUT_FORMATS } from '../lib/formats'

export function useDocumentMeta() {
  const { t, i18n } = useTranslation()
  const outputFormatLabels = getFormatLabels(OUTPUT_FORMATS)

  useEffect(() => {
    document.title = t('meta.title')

    const description = document.querySelector('meta[name="description"]')
    if (description) {
      description.setAttribute('content', t('meta.description', { formats: outputFormatLabels }))
    }
  }, [t, i18n.language, outputFormatLabels])
}
