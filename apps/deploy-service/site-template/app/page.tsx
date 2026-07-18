import blocksData from '../public/blocks.json';

type BlockData = {
  id: string;
  type: string;
  data: Record<string, any>;
};

function renderBlock(block: BlockData) {
  switch (block.type) {
    case 'Hero':
      return (
        <section key={block.id} className="hero">
          <h1>{block.data.title}</h1>
          {block.data.subtitle && <p>{block.data.subtitle}</p>}
          {block.data.ctaText && (
            <a href={block.data.ctaLink ?? '#'}>{block.data.ctaText}</a>
          )}
        </section>
      );

    case 'Text':
      return (
        <section key={block.id} className="text-block">
          <p>{block.data.content}</p>
        </section>
      );

    case 'Image':
      return (
        <section key={block.id} className="image-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.data.src} alt={block.data.alt ?? ''} />
        </section>
      );

    case 'Features':
      return (
        <section key={block.id} className="features">
          <h2>{block.data.heading}</h2>
          <ul>
            {(block.data.items ?? []).map((item: any, i: number) => (
              <li key={i}>{item.text}</li>
            ))}
          </ul>
        </section>
      );

    case 'Contact':
      return (
        <section key={block.id} className="contact">
          <h2>{block.data.heading ?? 'Contact Us'}</h2>
          <p>{block.data.email}</p>
          <p>{block.data.phone}</p>
        </section>
      );

    default:
      return (
        <section key={block.id} className={`block-${block.type.toLowerCase()}`}>
          <pre>{JSON.stringify(block.data, null, 2)}</pre>
        </section>
      );
  }
}

export default function HomePage() {
  const blocks: BlockData[] = (blocksData as any).blocks ?? [];
  return <main>{blocks.map(renderBlock)}</main>;
}
