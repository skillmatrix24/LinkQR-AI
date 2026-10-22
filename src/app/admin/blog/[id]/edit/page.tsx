
"use client";

import { useParams } from "react-router-dom";
import BlogEditorForm from "../../editor-form";

export default function EditBlogPost() {
  const params = useParams();
  const id = params.id as string;

  return <BlogEditorForm id={id} />;
}
