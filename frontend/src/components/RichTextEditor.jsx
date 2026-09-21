import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Image from '@tiptap/extension-image';
import { api } from '../lib/api.js';
import { all, createLowlight } from 'lowlight';
import { Bold, Code2, Heading2, Image as ImageIcon, Italic, Link2, List, ListOrdered, Quote, Underline as UnderlineIcon, Unlink } from 'lucide-react';
import Underline from '@tiptap/extension-underline';

const lowlight = createLowlight(all);

export default function RichTextEditor({ value, onChange, placeholder = 'Start writing…', minHeight = 400, editable = true }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder }),
      CodeBlockLowlight.configure({ lowlight }),
      Image.configure({ allowBase64: false })
    ],
    editable,
    content: value || '',
    onUpdate: ({ editor: nextEditor }) => onChange(nextEditor.getJSON())
  });

  useEffect(() => {
    if (!editor) return;
    const incoming = value || '';
    if (JSON.stringify(editor.getJSON()) !== JSON.stringify(incoming)) {
      editor.commands.setContent(incoming || '');
    }
  }, [value, editor]);

  useEffect(() => {
    editor?.setEditable(editable);
  }, [editor, editable]);

  if (!editor) return null;

  const button = (active, action, label, Icon) => (
    <button type="button" className={`toolbar-button ${active ? 'active' : ''}`} onClick={action} title={label} disabled={!editable}>
      <Icon size={17} strokeWidth={1.8} />
    </button>
  );

  return (
    <div className="rich-editor" style={{ '--editor-min-height': `${minHeight}px` }}>
      <div className="rich-toolbar">
        {button(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), 'Bold', Bold)}
        {button(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), 'Italic', Italic)}
        {button(editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), 'Underline', UnderlineIcon)}
        <span className="toolbar-separator" />
        {button(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), 'Bulleted list', List)}
        {button(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), 'Numbered list', ListOrdered)}
        <span className="toolbar-separator" />
        {button(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'Heading 2', Heading2)}
        {button(editor.isActive('codeBlock'), () => editor.chain().focus().toggleCodeBlock().run(), 'Code block', Code2)}
        {button(editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run(), 'Quote', Quote)}
        <span className="toolbar-separator" />
        {button(editor.isActive('code'), () => editor.chain().focus().toggleCode().run(), 'Inline code', Code2)}
        {button(editor.isActive('link'), () => {
          const previousUrl = editor.getAttributes('link').href;
          const url = window.prompt('Link URL', previousUrl || '');
          if (url === null) return;
          if (!url) editor.chain().focus().unsetLink().run();
          else editor.chain().focus().setLink({ href: url }).run();
        }, 'Link', Link2)}
        {button(editor.isActive('link'), () => editor.chain().focus().unsetLink().run(), 'Remove link', Unlink)}
        {button(false, () => editable && fileRef.current?.click(), uploading ? 'Uploading…' : 'Upload image', ImageIcon)}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (!file || !editable) return;
          try {
            setUploading(true);
            setUploadError('');
            const sig = await api.cloudinarySignature();
            const form = new FormData();
            form.append('file', file);
            form.append('api_key', sig.apiKey);
            form.append('timestamp', String(sig.timestamp));
            form.append('signature', sig.signature);
            const response = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, { method: 'POST', body: form });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || 'Image upload failed.');
            editor.chain().focus().setImage({ src: data.secure_url, alt: file.name }).run();
          } catch (error) {
            // A 401 here means the session expired — the app-wide handler in api.js
            // already reopens sign-in, so just show a short local message instead
            // of an intrusive browser alert.
            setUploadError(error.message || 'Image upload failed.');
            setTimeout(() => setUploadError(''), 5000);
          } finally { setUploading(false); }
        }}
      />
      {uploadError && <div className="editor-inline-error">{uploadError}</div>}
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}
