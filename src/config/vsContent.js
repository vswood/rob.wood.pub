export default function(eleventyConfig) {
  eleventyConfig.addCollection('sortedSections', function (collection) {
    const content = collection.getFilteredByTag('sections')
    content.sort(
      (content1, content2) =>
        content1.data.displayOrder - content2.data.displayOrder,
    )
  })
}
