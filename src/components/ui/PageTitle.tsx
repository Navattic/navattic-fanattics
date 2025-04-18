const PageTitle = ({
  title,
  description,
  button,
}: {
  title: string
  description?: string
  button?: React.ReactNode
}) => {
  return (
    <div className="pb-6 pt-14 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        {description && <p className="text-gray-500">{description}</p>}
      </div>
      {button && button}
    </div>
  )
}

export default PageTitle
