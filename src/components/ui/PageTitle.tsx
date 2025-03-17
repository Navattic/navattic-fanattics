
const PageTitle = ({ title, description }: { title: string; description?: string }) => {
  return (
    <div className="pb-6 pt-14">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      {description && <p className="text-gray-500">{description}</p>}
    </div>
  )
}

export default PageTitle