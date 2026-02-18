import { usePages } from "@/hooks/use-data";
import { useRoute } from "wouter";

export default function CustomPage() {
  const [match, params] = useRoute("/page/:slug");
  const { data: pages, isLoading } = usePages();

  if (isLoading) return <div className="container py-12">Loading...</div>;
  if (!match) return null;

  const page = pages?.find(p => p.slug === params?.slug);

  if (!page) return <div className="container py-12">Page not found</div>;

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-display font-bold mb-8">{page.title}</h1>
      <div 
        className="prose prose-lg dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: page.content || "" }} 
      />
    </div>
  );
}
