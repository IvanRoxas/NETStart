import React from 'react';

interface ContainerBlockProps {
  children?: React.ReactNode;
}

export function ContainerBlock({ children }: ContainerBlockProps) {
  return (
    <div className="rounded-xl border-2 border-purple-500 bg-purple-950/40 p-3 shadow-md">
      <div className="text-xs font-mono font-bold text-purple-300 mb-2">
        Container &lt;div&gt;
      </div>
      <div className="pl-4 border-l-2 border-purple-400/50 flex flex-col gap-2">
        {children || <span className="text-[11px] text-slate-500 italic">Empty container</span>}
      </div>
    </div>
  );
}

export function HeadingBlock({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-pink-500 bg-pink-950/40 px-3 py-1.5 text-xs font-mono text-pink-300">
      Heading: &lt;h1&gt;{text || 'Mars Network'}&lt;/h1&gt;
    </div>
  );
}

export function ImageBlock({ src }: { src: string }) {
  return (
    <div className="rounded-lg border border-sky-500 bg-sky-950/40 px-3 py-1.5 text-xs font-mono text-sky-300">
      Image: &lt;img src=&quot;{src || 'mars_seal.png'}&quot;&gt;
    </div>
  );
}

export function LinkBlock({ href, label }: { href: string; label: string }) {
  return (
    <div className="rounded-lg border border-emerald-500 bg-emerald-950/40 px-3 py-1.5 text-xs font-mono text-emerald-300">
      Link: &lt;a href=&quot;{href || 'earth_network.html'}&quot;&gt;{label || 'Link'}&lt;/a&gt;
    </div>
  );
}
