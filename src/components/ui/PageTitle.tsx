export const PageTitle = ({
  title,
  description,
  button,
}: {
  title: string | React.ReactNode
  description?: string
  button?: React.ReactNode
}) => {
  return (
    <div className="pb-10 pt-16 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        {description && <p className="text-gray-500 text-balance">{description}</p>}
      </div>
      {button && button}
    </div>
  )
}