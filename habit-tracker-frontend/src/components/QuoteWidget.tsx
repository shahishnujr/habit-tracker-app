interface QuoteWidgetProps {
  quote: string;
}

export default function QuoteWidget({ quote }: QuoteWidgetProps) {
  return (
    <div className="bg-gray-800/60 text-gray-100 p-4 rounded-xl border border-indigo-500/30 shadow-md">
      <blockquote className="italic text-sm text-indigo-200">“{quote}”</blockquote>
    </div>
  );
}
