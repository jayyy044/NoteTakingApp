import DocumentEditor from "@/components/document-editor"

interface EditorPageProps {
  params: Promise<{ documentId: string }>
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { documentId } = await params

  return <DocumentEditor documentId={documentId} />
}
