const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
const backendOrigin = apiUrl.replace(/\/api\/?$/, "");

const isAbsoluteImage = (src: string) =>
  /^(https?:|data:image\/|blob:)/i.test(src);

export function resolveProductImage(src?: string) {
  const image = src?.trim();

  if (!image) return "/placeholder.png";
  if (isAbsoluteImage(image)) return image;
  if (image.startsWith("/")) return backendOrigin ? `${backendOrigin}${image}` : image;

  return image;
}

export function shouldUseUnoptimizedImage(src: string) {
  return /^(data:image\/|blob:)/i.test(src);
}
