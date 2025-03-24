
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  cover_image?: string;
  category: string;
  category_id?: string;
  tags: string[];
  published: boolean;
  published_at?: string;
  scheduled_for?: string | null;
  author_name: string;
  author_avatar?: string;
  views: number;
  status?: string;
  date?: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  description?: string;
}
