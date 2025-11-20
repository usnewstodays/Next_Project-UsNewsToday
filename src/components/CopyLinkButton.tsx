'use client';

interface CopyLinkButtonProps {
  url: string;
}

export default function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  return (
    <button
      onClick={handleCopy}
      className="px-6 py-2 border border-neutral-300 dark:border-gray-600 rounded-lg text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-gray-800 transition-colors font-medium"
    >
      Copy Link
    </button>
  );
}
