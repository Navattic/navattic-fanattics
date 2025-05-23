import { RichText } from '@payloadcms/richtext-lexical/react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../shadcn/ui/accordion'
import { Guide } from '@/payload-types'

const GuideContent = ({ guide }: { guide: Guide }) => {
  return (
    <div className="content-container overflow-hidden">
      <div className="space-y-4 border-b border-gray-200 p-8 py-6 pt-7">
        <h1 className="text-lg font-medium">Rules & Guide</h1>
      </div>
      <div className="bg-gray-50">
        <div className="max-w-prose p-8 pt-6 pb-2 text-base text-gray-600">
          <RichText data={guide.introduction} className="payload-rich-text" />
        </div>
        {guide.additionalInfo && guide.additionalInfo.length > 0 && (
          <div className="p-8 pt-6 text-base text-gray-600">
            <h3 className="text-md mb-5 pl-1 font-medium text-gray-800">Learn more below:</h3>
            {guide.additionalInfo.map((info, index: number) => (
              <Accordion
                key={info.id}
                type="single"
                collapsible
                className="mb-4 rounded-xl border border-gray-200 bg-white px-8 py-2"
              >
                <AccordionItem value={`item-${index}`}>
                  <AccordionTrigger className="!cursor-pointer">
                    <div className="space-y-2">
                      <h3 className="text-md font-medium text-blue-600">{info.title}</h3>
                      <p className="text-sm font-normal text-gray-500">{info.description}</p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <RichText className="payload-rich-text" data={info.content} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default GuideContent
