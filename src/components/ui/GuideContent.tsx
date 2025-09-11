import { RichText } from '@payloadcms/richtext-lexical/react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../shadcn/ui/accordion'
import { Guide } from '@/payload-types'
import { Description } from '@/components/ui'
import { IconName } from '@/components/ui/Compass/Icon'

export const GuideContent = ({ guide }: { guide: Guide }) => {
  return (
    <div className="content-container overflow-hidden">
      <div className="space-y-4 border-b border-gray-200 p-8 py-4 pt-7">
        <h1 className="text-lg font-medium">Fanattic Portal Information</h1>
      </div>
      <div>
        <div className="max-w-prose p-8 pt-6 pb-2 text-base text-gray-600">
          <RichText data={guide.introduction} className="payload-rich-text" />
        </div>
        {guide.additionalInfo && guide.additionalInfo.length > 0 && (
          <div className="p-8 pt-6 text-base text-gray-600">
            <h3 className="text-md mb-5 pl-1 font-medium text-gray-800">Learn more below:</h3>
            <div className="space-y-2">
              {guide.additionalInfo.map((info, index: number) => (
                <Accordion
                  key={info.id}
                  type="single"
                  collapsible
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                >
                  <AccordionItem value={`item-${index}`}>
                    <AccordionTrigger className="!cursor-pointer py-4 pr-6 pl-5 hover:bg-gray-50/50">
                      <Description
                        iconLeft={(info.icon as IconName) ?? undefined}
                        iconColorScheme="gradient"
                        title={info.title}
                        description={info.description}
                        className="cursor-pointer"
                      />
                    </AccordionTrigger>
                    <AccordionContent className="px-8">
                      <RichText className="payload-rich-text" data={info.content} />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
