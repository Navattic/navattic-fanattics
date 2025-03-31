import { RichText } from '@payloadcms/richtext-lexical/react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../shadcn/ui/accordion'

const GuideContent = ({ guide }: { guide: any }) => {
  return (
    <div className="content-container">
      <div className="space-y-4 border-b border-gray-200 p-8 py-6">
        <h1 className="font-medium text-xl">Rules & Guide</h1>
      </div>
      <div className="p-8 pt-6 text-base text-gray-600 max-w-prose">
        <RichText data={guide.introduction} />
      </div>
      {guide.additionalInfo.length > 0 && (
        <div className="p-8 pt-6 text-base text-gray-600">
          <h3 className="font-medium text-md mb-3">Learn more below:</h3>
          {guide.additionalInfo.map((info: any) => (
            <Accordion
              type="single"
              collapsible
              className="bg-white border border-gray-100 rounded-2xl px-8 py-2 cursor-pointer mb-2"
            >
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <div className="space-y-2">
                    <h4 className="font-medium text-base ">{info.title}</h4>
                    <p className="text-gray-500 font-normal text-sm">{info.description}</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <RichText data={info.content} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      )}
    </div>
  )
}

export default GuideContent
