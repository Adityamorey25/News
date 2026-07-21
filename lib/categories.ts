function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\u0900-\u097Fa-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}