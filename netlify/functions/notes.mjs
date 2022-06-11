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

const parsePath = (path) => {
  path = path.replace('/.netlify/functions/notes', '');
  const params = {};
  path.split('/').forEach((param, index) => {
    if (param.length === 0) return;
    const values = param.split('=');
    params[values[0]] = values[1];
  });
  return { path, params };
};

export const handler = builder(async function (event) {
  const { name } = parsePath(event.path).params;

  let markdownPage = await fs.readFile(`notes/${name}.md`, 'utf8');

  const htmlPage = await convertMarkdownToHtml(markdownPage);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8;',
    },
    body: JSON.stringify({ content: htmlPage }),
  };
  const { params } = parsePath(event.path);
});
