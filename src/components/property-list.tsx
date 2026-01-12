// This component is not used in the single-property site
// Property details are hardcoded in src/config/property.ts

export function PropertyList() {
  return (
    <div className="text-center py-12">
      <p className="text-gray-600 text-lg">
        This is a single-property rental site.
      </p>
      <p className="text-gray-500 text-sm mt-2">
        Property details are configured in src/config/property.ts
      </p>
    </div>
  )
}
