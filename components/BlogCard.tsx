import Image from "next/image";
import Link from "next/link";

type BlogCardProps = {
  title: string;
  excerpt: string;
  category: string;
  imageUrl: string;
  slug: string;
  date: string;
};

export default function BlogCard({
  title,
  excerpt,
  category,
  imageUrl,
  slug,
  date,
}: BlogCardProps) {
  return (
    <Link
      href={`/blog/${slug}`}
      className="block bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden border border-gray-100"
    >
      <div className="relative w-full h-40">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
        <span className="absolute top-2 left-2 bg-brand-red text-white text-xs px-2 py-1 rounded">
          {category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-brand-black mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{excerpt}</p>
        <p className="text-xs text-gray-400">{date}</p>
      </div>
    </Link>
  );
}