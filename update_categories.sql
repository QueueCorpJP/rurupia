-- Update category names in the blog_categories table
UPDATE blog_categories
SET name = 'システムアップデート'
WHERE name = '季節のお知らせ';

UPDATE blog_categories
SET name = 'お知らせ'
WHERE name = '健康情報';

UPDATE blog_categories
SET name = 'お得な情報'
WHERE name = '新メニュー';

-- Also update all blog posts that use these categories directly
UPDATE blog_posts
SET category = 'システムアップデート'
WHERE category = '季節のお知らせ';

UPDATE blog_posts
SET category = 'お知らせ'
WHERE category = '健康情報';

UPDATE blog_posts
SET category = 'お得な情報'
WHERE category = '新メニュー'; 