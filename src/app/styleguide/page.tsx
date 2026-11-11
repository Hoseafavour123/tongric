import { notFound } from "next/navigation";
import { StyleguideDemo } from "@/components/styleguide/styleguide-demo";
import { isStyleguideEnabled } from "@/lib/styleguide-guard";

export const dynamic = "force-dynamic";

export default function StyleguidePage() {
  if (!isStyleguideEnabled()) {
    notFound();
  }

  return <StyleguideDemo />;
}

