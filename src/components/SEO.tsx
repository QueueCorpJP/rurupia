import { Helmet } from 'react-helmet';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedAt?: string;
  updatedAt?: string;
  author?: string;
  lang?: string;
  schemaJson?: Record<string, unknown>;
  keywords?: string;
}

/**
 * SEO component that handles all metadata for better search engine indexing
 */
const SEO = ({
  title,
  description,
  canonical,
  image,
  type = 'website',
  publishedAt,
  updatedAt,
  author,
  lang = 'ja-JP',
  schemaJson,
  keywords,
}: SEOProps) => {
  const siteUrl = window.location.origin;
  const pageUrl = canonical || window.location.href;
  const defaultImage = `${siteUrl}/logo.png`;
  const siteName = 'SerenitySage';

  return (
    <Helmet>
      {/* Basic metadata */}
      <html lang={lang} />
      <title>{`${title} | ${siteName}`}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={pageUrl} />

      {/* Open Graph tags */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:type" content={type} />
      {publishedAt && <meta property="article:published_time" content={publishedAt} />}
      {updatedAt && <meta property="article:modified_time" content={updatedAt} />}
      {author && <meta property="article:author" content={author} />}

      {/* Twitter tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image || defaultImage} />

      {/* Schema.org structured data */}
      {schemaJson && (
        <script type="application/ld+json">
          {JSON.stringify(schemaJson)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO; 