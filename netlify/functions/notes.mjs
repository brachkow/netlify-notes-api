import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { builder } from '@netlify/functions';
import { promises as fs } from 'fs';

const convertMarkdownToHtml = async (md) => {
  const html = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(md);

  return String(html);
};

export const handler = builder(async function (event) {
  const { name } = Object.fromEntries(
    event.path
      .split('/')
      .filter((p) => p.includes('='))
      .map(decodeURIComponent)
      .map((s) => s.split('=', 2)),
  );

  let markdownPage = await fs.readFile(`notes/${name}.md`, 'utf8');

  const htmlPage = await convertMarkdownToHtml(markdownPage);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8;',
    },
    body: JSON.stringify({ content: htmlPage }),
  };
});
