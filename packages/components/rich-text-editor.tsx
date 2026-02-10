'use client';

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(
  () => import('react-quill-new'),
  { ssr: false }
);

type Props = {
  value?: string;
  onChange: (content: string) => void;
};

const modules = {
  toolbar: [
    [{ font: [] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ size: ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ align: [] }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean'],
  ],
};

export default function RichTextEditor({ value = '', onChange }: Props) {
  return (
    <div className="relative">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder="Write a detailed product description here ..."
        className="bg-transparent border border-gray-700 text-white rounded-md"
        style={{ minHeight: '250px' }}
      />

      <style jsx global>{`
        .ql-toolbar {
          background: transparent;
          border-color: #444;
        }
        .ql-container {
          background: transparent;
          border-color: #444;
          color: white;
        }
        .ql-editor {
          min-height: 200px;
        }
        .ql-editor.ql-blank::before {
          color: #aaa;
        }
        .ql-picker-options {
          background: #333;
          color: white;
        }
        .ql-picker-item {
          color: white;
        }
        .ql-stroke {
          stroke: white;
        }
      `}</style>
    </div>
  );
}
