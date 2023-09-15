import { Editor } from "@tinymce/tinymce-react";

interface NativeEditorProps {
  value: string;
  onEditorChange: (content: string, editor: any) => void;
  onSetup: (editor: any) => void;
  height?: string;
}

export default function NativeEditor(props: NativeEditorProps) {
  return (
    <Editor
    value={ props.value}
    apiKey="tw9wjbcvjph5zfvy33f62k35l2qtv5h8s2zhxdh4pta8kdet"
    init={{
      setup: (editor) => {
        props.onSetup(editor);
      },
      init_instance_callback: function (editor) {
        editor.on("ExecCommand", function (e) {
          
        });
      },
      skin: "naked",
      icons: "small",
      toolbar_location: "bottom",
      plugins: "lists code table codesample link",
      menubar: false,
      statusbar: false,
      height : props.height ?? "95%",
      images_upload_base_path: `https://pluarisazurestorage.blob.core.windows.net/nowigence-web-resources/blogs`,
      images_upload_credentials: true,
      // @ts-ignore
      plugins:
        "preview casechange importcss tinydrive searchreplace save directionality advcode visualblocks visualchars fullscreen image link media mediaembed template codesample table charmap pagebreak nonbreaking anchor tableofcontents insertdatetime advlist lists checklist wordcount  editimage help formatpainter permanentpen pageembed charmap emoticons advtable export mergetags",
      menu: {
        tc: {
          title: "Comments",
          items: "addcomment showcomments deleteallconversations",
        },
      },
      toolbar:
        "undo redo image| bold italic underline strikethrough | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist checklist | forecolor backcolor casechange permanentpen formatpainter removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media pageembed template link anchor codesample | a11ycheck ltr rtl | showcomments addcomment | footnotes | mergetags",
      image_title: true,
      automatic_uploads: true,
      file_picker_types: "image",    
      }}
      onEditorChange={(content, editor) => {
        props.onEditorChange(content, editor);
      }}
    />
  );
}
