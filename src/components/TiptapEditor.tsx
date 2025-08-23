
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import {
    Bold, Italic, Strikethrough, Underline as UnderlineIcon, Code, List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';
import { useCallback } from 'react';
import { Button } from './ui/button';

const Toolbar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    const setLink = useCallback(() => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const addImage = useCallback(() => {
        const url = window.prompt('Image URL');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    const buttonClasses = (type: string, options?: object) => `p-2 rounded-md ${editor.isActive(type, options) ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'} hover:bg-primary/80 hover:text-primary-foreground`;

    return (
        <div className="border border-input rounded-t-md p-2 flex flex-wrap gap-2 bg-background">
            <Button type="button" variant="outline" size="icon" onClick={() => editor.chain().focus().toggleBold().run()} className={buttonClasses('bold')}><Bold size={16}/></Button>
            <Button type="button" variant="outline" size="icon" onClick={() => editor.chain().focus().toggleItalic().run()} className={buttonClasses('italic')}><Italic size={16}/></Button>
            <Button type="button" variant="outline" size="icon" onClick={() => editor.chain().focus().toggleStrike().run()} className={buttonClasses('strike')}><Strikethrough size={16}/></Button>
            <Button type="button" variant="outline" size="icon" onClick={() => editor.chain().focus().toggleUnderline().run()} className={buttonClasses('underline')}><UnderlineIcon size={16}/></Button>
            <Button type="button" variant="outline" size="icon" onClick={() => editor.chain().focus().toggleCode().run()} className={buttonClasses('code')}><Code size={16}/></Button>
            <Button type="button" variant="outline" size="icon" onClick={() => editor.chain().focus().toggleBulletList().run()} className={buttonClasses('bulletList')}><List size={16}/></Button>
            <Button type="button" variant="outline" size="icon" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={buttonClasses('orderedList')}><ListOrdered size={16}/></Button>
            <Button type="button" variant="outline" size="icon" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={buttonClasses('blockquote')}><Quote size={16}/></Button>
            <Button type="button" variant="outline" size="icon" onClick={setLink} className={buttonClasses('link')}><LinkIcon size={16}/></Button>
            <Button type="button" variant="outline" size="icon" onClick={addImage}><ImageIcon size={16}/></Button>
            <Button type="button" variant="outline" size="icon" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={buttonClasses('textAlign', { align: 'left' })}><AlignLeft size={16}/></Button>
            <Button type="button" variant="outline" size="icon" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={buttonClasses('textAlign', { align: 'center' })}><AlignCenter size={16}/></Button>
            <Button type="button" variant="outline" size="icon" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={buttonClasses('textAlign', { align: 'right' })}><AlignRight size={16}/></Button>
        </div>
    );
};


const TiptapEditor = ({ content, onChange }: { content: string, onChange: (richText: string) => void }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false,
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                autolink: true,
            }),
            Image,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[200px] border border-input rounded-b-md p-4 bg-background',
            },
        },
    });

    return (
        <div>
            <Toolbar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
};

export default TiptapEditor;
